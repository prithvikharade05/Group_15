import axios from "axios";

// Detect environment
const isDevelopment = process.env.NODE_ENV === "development";

// Base URL logic
const API = axios.create({
    baseURL: isDevelopment
        ? "http://127.0.0.1:8000/api"   // 🔥 LOCAL DJANGO SERVER
        : "/api",                       // ⚔️ PRODUCTION (NGINX PROXY)
});

// Attach JWT token automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

// Handle global errors (optional but powerful)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized - redirecting to login");
            localStorage.removeItem("token");

            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/"
            ) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default API;