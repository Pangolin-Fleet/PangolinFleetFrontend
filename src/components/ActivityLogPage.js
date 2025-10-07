import React, { useState } from "react";
import { FaHistory, FaFilter, FaSearch, FaUser, FaCar, FaTools, FaTrash } from "react-icons/fa";
import "./ActivityLogPage.css";

export default function ActivityLogPage({ activityLog, user }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = activityLog.filter(activity => {
    const matchesFilter = filter === "all" || activity.type === filter;
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (action) => {
    if (action.includes('Login') || action.includes('Logout')) return <FaUser />;
    if (action.includes('Vehicle')) return <FaCar />;
    if (action.includes('User')) return <FaUser />;
    if (action.includes('Status')) return <FaTools />;
    if (action.includes('Delete')) return <FaTrash />;
    return <FaHistory />;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#00d4ff';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearActivityLog = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      // This would typically call a service to clear logs
      // For now, we'll just show an alert
      alert("Activity log cleared (this would call your backend service)");
    }
  };

  return (
    <div className="activity-log-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Activity Log</h1>
            <p>Track all system activities and user actions</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">{user?.name || user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Controls */}
        <div className="controls-section">
          <div className="search-filter-group">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Activities</option>
                <option value="info">Information</option>
                <option value="success">Success</option>
                <option value="warning">Warnings</option>
                <option value="error">Errors</option>
              </select>
            </div>

            <button 
              className="clear-btn"
              onClick={clearActivityLog}
              disabled={activityLog.length === 0}
            >
              <FaTrash /> Clear Log
            </button>
          </div>

          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-value">{activityLog.length}</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {activityLog.filter(a => a.type === 'success').length}
              </span>
              <span className="stat-label">Success</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {activityLog.filter(a => a.type === 'warning').length}
              </span>
              <span className="stat-label">Warnings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {activityLog.filter(a => a.type === 'error').length}
              </span>
              <span className="stat-label">Errors</span>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="activity-log-section">
          <div className="section-header">
            <h3>
              <FaHistory className="icon" />
              Recent Activities
              <span className="activity-count">({filteredActivities.length})</span>
            </h3>
          </div>

          <div className="activity-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div key={activity.id || index} className={`activity-item ${activity.type}`}>
                  <div 
                    className="activity-icon" 
                    style={{ color: getActivityColor(activity.type) }}
                  >
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-time">{formatDate(activity.timestamp)}</span>
                    </div>
                    
                    {activity.details && (
                      <div className="activity-details">{activity.details}</div>
                    )}
                    
                    <div className="activity-meta">
                      <span className="activity-user">
                        <FaUser /> {activity.user}
                      </span>
                      <span className={`activity-type ${activity.type}`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaHistory className="empty-icon" />
                <h3>No Activities Found</h3>
                <p>
                  {searchTerm || filter !== "all" 
                    ? "No activities match your current filters." 
                    : "No activities have been recorded yet."
                  }
                </p>
                {(searchTerm || filter !== "all") && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}