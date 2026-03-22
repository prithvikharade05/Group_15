import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post("/auth/register/", {
        username,
        password,
      });

      alert("Account Created ✅");
      navigate("/");

    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">

      <div className="bg-white/10 p-10 rounded-xl w-[350px]">

        <h2 className="text-xl mb-5 text-center">Create Account</h2>

        <input
          className="w-full p-3 mb-4 bg-gray-800 rounded"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 mb-4 bg-gray-800 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 p-3 rounded"
        >
          Register
        </button>

      </div>
    </div>
  );
}

export default Register;