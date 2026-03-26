"""
AlphaMind AI Chatbot Pipeline
LangGraph workflow: analyze_query → retrieve_context → generate_response

Falls back to smart rule-based responses if GEMINI_API_KEY is not configured.
"""

import os
import re
from typing import TypedDict, Optional
from pathlib import Path

# ── ChromaDB + Embeddings ────────────────────────────────────────────────────
import chromadb
from chromadb.config import Settings as ChromaSettings

try:
    from sentence_transformers import SentenceTransformer
    _EMBED_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    _EMBED_AVAILABLE = True
except Exception:
    _EMBED_AVAILABLE = False

_CHROMA_DIR = str(Path(__file__).parent.parent / "data" / "chroma_db")
os.makedirs(_CHROMA_DIR, exist_ok=True)

_chroma_client = chromadb.PersistentClient(path=_CHROMA_DIR)

def _get_collection():
    return _chroma_client.get_or_create_collection(
        name="stocks",
        metadata={"hnsw:space": "cosine"}
    )

# ── Stock Knowledge Base ─────────────────────────────────────────────────────
STOCK_FACTS = [
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT", "summary": "TCS is India's largest IT services company with consistent revenue growth and strong global delivery model. It pays regular dividends and has low debt."},
    {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Conglomerate", "summary": "Reliance operates across petrochemicals, retail (JioMart), and telecom (Jio). It is India's largest company by market cap with aggressive expansion in digital services."},
    {"symbol": "HDFCBANK", "name": "HDFC Bank", "sector": "Banking", "summary": "HDFC Bank is India's largest private sector bank with strong asset quality, low NPAs, and consistent loan book growth. Known for retail banking strength."},
    {"symbol": "INFY", "name": "Infosys", "sector": "IT", "summary": "Infosys is a global IT consulting and services company. It focuses on digital transformation, cloud, and AI services. Strong cash generation and dividend payer."},
    {"symbol": "WIPRO", "name": "Wipro Limited", "sector": "IT", "summary": "Wipro provides IT services and business process outsourcing. It has been investing in acquisitions and expanding its AI and cloud capabilities."},
    {"symbol": "ICICIBANK", "name": "ICICI Bank", "sector": "Banking", "summary": "ICICI Bank is a leading private bank with strong retail and corporate banking segments. It has improved asset quality significantly and shows strong ROE."},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking", "summary": "SBI is India's largest PSU bank with wide geographical coverage. Improving NPA figures and capitalised well for growth. Benefits from government business."},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever", "sector": "FMCG", "summary": "HUL is India's largest FMCG company with brands like Dove, Lux, and Surf Excel. Defensive stock with steady cash flows and strong distribution network."},
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "sector": "Automobile", "summary": "Maruti dominates India's passenger vehicle market with over 40% market share. Benefits from rising vehicle electrification trends and a strong dealer network."},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "sector": "NBFC", "summary": "Bajaj Finance is India's leading NBFC known for aggressive retail lending. High growth but also higher risk during economic downturns."},
    {"symbol": "AXISBANK", "name": "Axis Bank", "sector": "Banking", "summary": "Axis Bank is the third largest private bank. It has been growing loans aggressively and improving fee income. NPA trajectory has improved in recent years."},
    {"symbol": "LT", "name": "Larsen & Toubro", "sector": "Infrastructure", "summary": "L&T is a major engineering and construction conglomerate. Strong order book driven by government infrastructure spending."},
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical", "sector": "Pharma", "summary": "Sun Pharma is India's largest pharma company with a diversified speciality portfolio in US and India markets. Strong branded generics business."},
    {"symbol": "NIFTY50", "name": "Nifty 50 Index", "sector": "Index", "summary": "Nifty 50 tracks the 50 largest companies on NSE. It is a broad market indicator and benchmark for Indian equity mutual funds."},
]


def build_stock_knowledge_base():
    """Seed ChromaDB with stock facts (idempotent)."""
    if not _EMBED_AVAILABLE:
        return
    col = _get_collection()
    existing = col.count()
    if existing >= len(STOCK_FACTS):
        return  # Already seeded

    docs, embeddings, ids, metas = [], [], [], []
    for fact in STOCK_FACTS:
        text = f"{fact['name']} ({fact['symbol']}) — {fact['sector']}: {fact['summary']}"
        emb = _EMBED_MODEL.encode(text).tolist()
        docs.append(text)
        embeddings.append(emb)
        ids.append(fact["symbol"])
        metas.append({"symbol": fact["symbol"], "sector": fact["sector"]})

    col.upsert(documents=docs, embeddings=embeddings, ids=ids, metadatas=metas)


# Seed on import
try:
    build_stock_knowledge_base()
except Exception:
    pass


def get_relevant_context(query: str, n_results: int = 3) -> str:
    """Return top-N relevant stock summaries from ChromaDB."""
    if not _EMBED_AVAILABLE:
        return _fallback_context(query)

    try:
        col = _get_collection()
        q_emb = _EMBED_MODEL.encode(query).tolist()
        results = col.query(query_embeddings=[q_emb], n_results=n_results)
        docs = results.get("documents", [[]])[0]
        return "\n".join(docs) if docs else _fallback_context(query)
    except Exception:
        return _fallback_context(query)


def _fallback_context(query: str) -> str:
    """Text-match fallback when embeddings are unavailable."""
    q = query.upper()
    matches = []
    for fact in STOCK_FACTS:
        if fact["symbol"] in q or fact["name"].upper() in q:
            matches.append(f"{fact['name']} ({fact['symbol']}) — {fact['sector']}: {fact['summary']}")
    if matches:
        return "\n".join(matches[:3])
    return "No specific stock data found. Please ask about specific NSE-listed stocks."


# ── LLM (Gemini via google-generativeai) ─────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini at module load if key is available
_gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        print("[chatbot] Gemini LLM initialized successfully.")
    except Exception as e:
        print(f"[chatbot] Gemini init failed: {e}")


def _call_llm(user_input: str, context: str, history: list) -> str:
    """Call Gemini LLM if available, else fall back to rule-based advisor."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    print(f"[chatbot] API KEY present: {bool(api_key)}")
    print(f"[chatbot] Gemini model ready: {_gemini_model is not None}")

    if _gemini_model and api_key:
        print("[chatbot] 👉 TRYING GEMINI")
        try:
            # Build conversation history string
            history_text = ""
            if history:
                recent = history[-8:]
                history_text = "\n".join(
                    f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
                    for m in recent
                )

            prompt = f"""You are AlphaMind AI, an intelligent financial advisory assistant for Indian stock markets.

Stock Context (from knowledge base):
{context if context else 'No specific stock data retrieved.'}

{f'Recent Conversation:{chr(10)}{history_text}{chr(10)}' if history_text else ''}User Query: {user_input}

Instructions:
- Use ONLY the provided stock context. Do NOT hallucinate prices or data.
- If asked to buy/sell, give a reasoned suggestion ONLY — never execute trades.
- Keep responses concise, clear, and professional.
- If no relevant context, say so honestly and guide the user on what to ask.
"""
            response = _gemini_model.generate_content(prompt)

            # Safe text extraction — handle blocked/empty responses
            text = None
            if hasattr(response, "text") and response.text:
                text = response.text
            elif hasattr(response, "parts") and response.parts:
                text = "".join(part.text for part in response.parts if hasattr(part, "text"))

            if text:
                print("[chatbot] ✅ Gemini responded successfully.")
                return text
            else:
                print(f"[chatbot] ⚠️ Empty Gemini response: {response}")

        except Exception as e:
            print(f"[chatbot] ❌ GEMINI ERROR: {e}")

    else:
        print("[chatbot] ⚠️ Gemini not available — using rule-based fallback.")

    return _rule_based_response(user_input, context)


def _rule_based_response(user_input: str, context: str) -> str:
    """Smart rule-based financial advisor fallback. No API key required."""
    q = user_input.lower()
    ctx_lower = context.lower()

    # Extract stock name from context for personalised response
    stock_name = ""
    for fact in STOCK_FACTS:
        if fact["symbol"].lower() in q or fact["name"].lower() in q:
            stock_name = fact["name"]
            break

    if any(w in q for w in ["hello", "hi", "hey", "greet"]):
        return ("👋 Hello! I'm AlphaMind AI — your financial advisory assistant. "
                "I can help you analyse Indian stocks, understand market trends, "
                "and discuss investment strategies. What would you like to know?")

    if any(w in q for w in ["buy", "should i buy", "purchase", "invest in"]):
        nm = stock_name or "this stock"
        return (f"💡 Regarding {nm}: Based on available data, here is my advisory view:\n\n"
                f"{context[:400] if context else 'No specific data found.'}\n\n"
                "⚠️ This is a suggestion only. Please conduct your own due diligence, "
                "check the latest financials, and consult a SEBI-registered advisor before investing.")

    if any(w in q for w in ["sell", "exit", "get out"]):
        nm = stock_name or "this position"
        return (f"📊 For {nm}, consider the following factors before selling:\n\n"
                f"{context[:400] if context else 'No specific data.'}\n\n"
                "Always evaluate your entry price, tax implications, and portfolio allocation. "
                "This is advisory — not a sell order.")

    if any(w in q for w in ["how is", "performance", "status", "analysis", "analyse", "analyze"]):
        if context and len(context) > 50:
            return f"📈 Here's the analysis:\n\n{context[:600]}\n\nWould you like deeper insight on any specific aspect?"
        return "Please specify a stock symbol (e.g. 'How is TCS?' or 'Analyse RELIANCE')."

    if any(w in q for w in ["risk", "safe", "volatile", "volatility"]):
        return ("⚖️ Risk assessment depends on your investment horizon and portfolio composition. "
                "Generally:\n• Large-cap IT/banking stocks carry moderate risk\n"
                "• NBFCs and small-caps carry higher risk\n"
                "• FMCG/Pharma are defensive sectors\n\n"
                "Would you like me to analyse the risk profile of a specific stock?")

    if any(w in q for w in ["market", "nifty", "sensex", "index"]):
        return ("📊 The Indian market is driven by FII flows, RBI policy, and global cues. "
                "Nifty 50 tracks India's 50 largest companies. "
                "For sector-specific trends, ask me about IT, Banking, FMCG, or Pharma.")

    if any(w in q for w in ["predict", "forecast", "future", "target"]):
        nm = stock_name or "the stock"
        return (f"🔮 For {nm}: I can provide context from our knowledge base, but precise price forecasting "
                f"requires quantitative models.\n\n{context[:400] if context else ''}\n\n"
                "Use AlphaMind's LSTM/ARIMA models on the Models page for data-driven forecasts.")

    if any(w in q for w in ["portfolio", "diversify", "allocation"]):
        return ("🗂️ A well-diversified Indian equity portfolio typically includes:\n"
                "• 30–40% Large-cap (TCS, HDFC, Reliance)\n"
                "• 20–30% Mid-cap growth\n"
                "• 10–20% Defensive FMCG/Pharma\n"
                "• 10% Sector-specific (Banking, IT)\n\n"
                "Would you like guidance on a specific allocation?")

    # Generic fallback with context
    if context and len(context) > 80:
        return f"📋 Here's what I found:\n\n{context[:500]}\n\nFeel free to ask follow-up questions!"

    return ("I'm here to help with Indian stock market insights. Try asking:\n"
            "• 'How is TCS performing?'\n"
            "• 'Should I invest in HDFC Bank?'\n"
            "• 'What is Reliance's business?'\n"
            "• 'Analyse INFY'\n"
            "• 'How to diversify my portfolio?'")


# ── LangGraph State & Pipeline ───────────────────────────────────────────────
class ChatState(TypedDict):
    user_input: str
    context: str
    response: str
    history: list


def analyze_query(state: ChatState) -> ChatState:
    """Node 1: Clean and process user input."""
    cleaned = state["user_input"].strip()
    # Remove excessive whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return {**state, "user_input": cleaned}


def retrieve_context(state: ChatState) -> ChatState:
    """Node 2: Fetch relevant context from ChromaDB."""
    context = get_relevant_context(state["user_input"])
    return {**state, "context": context}


def generate_response(state: ChatState) -> ChatState:
    """Node 3: Generate AI response using LLM or smart fallback."""
    print("🔥 LANGGRAPH NODE EXECUTED: generate_response")
    response = _call_llm(
        user_input=state["user_input"],
        context=state["context"],
        history=state.get("history", [])
    )
    return {**state, "response": response}


def build_pipeline():
    """Build and return the compiled LangGraph pipeline."""
    from langgraph.graph import StateGraph, END

    graph = StateGraph(ChatState)
    graph.add_node("analyze_query", analyze_query)
    graph.add_node("retrieve_context", retrieve_context)
    graph.add_node("generate_response", generate_response)

    graph.set_entry_point("analyze_query")
    graph.add_edge("analyze_query", "retrieve_context")
    graph.add_edge("retrieve_context", "generate_response")
    graph.add_edge("generate_response", END)

    return graph.compile()


# Compile pipeline once at module load
try:
    _PIPELINE = build_pipeline()
    _PIPELINE_AVAILABLE = True
except Exception as e:
    _PIPELINE_AVAILABLE = False
    print(f"[chatbot] LangGraph pipeline failed to compile: {e}")


def run_pipeline(user_input: str, history: list) -> str:
    """Run the full LangGraph pipeline and return the AI response string."""
    print(f"[chatbot] run_pipeline called. Pipeline available: {_PIPELINE_AVAILABLE}")
    initial_state: ChatState = {
        "user_input": user_input,
        "context": "",
        "response": "",
        "history": history
    }

    if _PIPELINE_AVAILABLE:
        try:
            result = _PIPELINE.invoke(initial_state)
            response = result.get("response", "")
            print(f"[chatbot] Pipeline completed. Response length: {len(response)}")
            return response or "I encountered an issue generating a response. Please try again."
        except Exception as e:
            import traceback
            print(f"[chatbot] ❌ PIPELINE ERROR: {e}")
            traceback.print_exc()
    else:
        print("[chatbot] ⚠️ Pipeline not available — using direct fallback.")

    # Ultimate fallback
    context = get_relevant_context(user_input)
    return _rule_based_response(user_input, context)
