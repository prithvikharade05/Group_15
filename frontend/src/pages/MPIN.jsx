import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function MPIN() {
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const navigate = useNavigate();

  const handleChange = (value, index) => {
    const newPin = [...mpin];
    newPin[index] = value;
    setMpin(newPin);
  };

  const submitMPIN = async () => {
    const finalPin = mpin.join("");

    await API.post("/auth/set-mpin/", { mpin: finalPin });

    navigate("/dashboard");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white">

      <div className="bg-white/10 p-10 rounded-2xl text-center backdrop-blur-xl">

        <h2 className="text-xl mb-4">Enter MPIN 🔐</h2>

        <div className="flex gap-3 justify-center mb-6">
          {mpin.map((digit, i) => (
            <input
              key={i}
              maxLength="1"
              className="w-12 h-12 text-center text-xl bg-gray-800 rounded"
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        <button
          onClick={submitMPIN}
          className="bg-blue-600 px-6 py-2 rounded-lg"
        >
          Continue
        </button>

      </div>
    </div>
  );
}

export default MPIN;