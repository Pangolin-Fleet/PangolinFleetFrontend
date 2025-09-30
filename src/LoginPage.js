import React, { useState } from "react";
import { FaUser, FaLock, FaUserShield, FaUserTie, FaCar } from "react-icons/fa";
import "./LoginPage.css";
import userService from "./service/UserService";

export default function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "DRIVER" // Default to DRIVER as per your backend
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.username || !formData.password) {
      setError("Enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const userData = await userService.login(formData.username, formData.password);
      onLogin(userData);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Server error. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    try {
      await userService.register({
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      
      setSuccess("Registration successful! You can now login.");
      setFormData({
        username: formData.username,
        password: "",
        role: "DRIVER"
      });
      setIsLogin(true);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.status === 409) {
        setError("Username already exists");
      } else {
        setError("Registration failed. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "DRIVER"
    });
    setError("");
    setSuccess("");
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "ADMIN": return <FaUserShield />;
      case "DRIVER": return <FaCar />;
      default: return <FaUserTie />;
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case "ADMIN": return "Full system access - manage vehicles, users, and reports";
      case "DRIVER": return "Vehicle access - view and use assigned vehicles";
      default: return "";
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Pangolin Fleet</h1>
        <p className="login-subtitle">
          {isLogin ? "Access your fleet" : "Create new account"}
        </p>

        <div className="toggle-form">
          <button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); resetForm(); }}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); resetForm(); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="login-form">
          {/* Username */}
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Role Selection - Only for registration */}
          {!isLogin && (
            <div>
              <div className="input-group">
                {getRoleIcon(formData.role)}
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="DRIVER">Driver</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="role-description">
                {getRoleDescription(formData.role)}
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
          </button>

          {/* Switch Form Hint */}
          <div className="form-divider">
            <span>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            disabled={loading}
          >
            {isLogin ? "Register New Account" : "Back to Login"}
          </button>
        </form>
      </div>
    </div>
  );
}