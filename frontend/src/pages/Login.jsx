import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);
      navigate("/mpin");

    } catch (err) {
      console.log(err.response);
      alert("Login Failed ❌");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">

      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-xl w-[350px] text-white">

        <h1 className="text-2xl font-bold mb-6 text-center">
          ⚡ AI Finance
        </h1>

        <input
          className="w-full p-3 mb-4 rounded bg-white/10 outline-none"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded bg-white/10 outline-none"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm text-gray-300 cursor-pointer"
           onClick={() => navigate("/register")}>
          Create New Account
        </p>

      </div>
    </div>
  );
}

export default Login;