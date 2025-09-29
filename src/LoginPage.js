import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import UserService from "./service/UserService"; // Make sure path is correct
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Enter both username and password");

    try {
      const user = await UserService.login(username, password);
      onLogin(user); // Pass role and username to App.js
    } catch (error) {
      alert("Invalid username or password");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Pangolin Fleet</h1>
        <p className="login-subtitle">Access your fleet</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
