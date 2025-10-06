import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./Notifications.css";

export default function Notifications({ notifications }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'error': return <FaExclamationTriangle />;
      case 'warning': return <FaExclamationTriangle />;
      default: return <FaInfoCircle />;
    }
  };

  const getClassName = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${getClassName(notification.type)}`}
        >
          <div className="notification-icon">
            {getIcon(notification.type)}
          </div>
          <div className="notification-content">
            <div className="notification-message">
              {notification.message}
            </div>
            <div className="notification-time">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}