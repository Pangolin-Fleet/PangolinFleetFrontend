import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCar, FaShieldAlt } from 'react-icons/fa';
import './UserAccessModal.css';

export default function UserAccessModal({ onLogin, darkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const result = await onLogin(username, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaCar className="logo-icon" />
          <h1 className="login-title">Pangolin Fleet</h1>
          <p className="login-subtitle">Vehicle Management System</p>
        </div>

        {error && (
          <div className="login-error">
            <FaShieldAlt style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-primary login-btn" 
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>Contact administrator for account access</p>
        </div>
      </div>
    </div>
  );
}