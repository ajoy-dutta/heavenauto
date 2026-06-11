import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Connects to http://127.0.0.1:8000/api/token/ via Axios
      const response = await axiosInstance.post('token/', {
        username,
        password
      });

      // Save JWT tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError("Invalid credentials or server is down.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Staff Login</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Username</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
          Enter Dashboard
        </button>
      </form>
    </div>
  );
}