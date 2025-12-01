import React, { useState, useMemo } from "react";
import { FaHistory, FaFilter, FaSearch, FaUser, FaCar, FaTools, FaTrash, FaSync, FaCalendar } from "react-icons/fa";
import "./ActivityLogPage.css";

export default function ActivityLogPage({ activityLog = [], user, canPerformAction }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Memoized filtered activities for better performance
  const filteredActivities = useMemo(() => {
    return activityLog.filter(activity => {
      const matchesFilter = filter === "all" || activity.type === filter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        activity.action?.toLowerCase().includes(searchLower) ||
        activity.details?.toLowerCase().includes(searchLower) ||
        activity.user?.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [activityLog, filter, searchTerm]);

  const getActivityIcon = (action) => {
    if (!action) return <FaHistory />;
    if (action.includes('Login') || action.includes('Logout')) return <FaUser />;
    if (action.includes('Vehicle')) return <FaCar />;
    if (action.includes('User')) return <FaUser />;
    if (action.includes('Status') || action.includes('Maintenance')) return <FaTools />;
    if (action.includes('Delete') || action.includes('Remove')) return <FaTrash />;
    if (action.includes('Update') || action.includes('Edit')) return <FaSync />;
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
    if (!timestamp) return 'Unknown date';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const clearActivityLog = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      // This would typically call a service to clear logs
      // For now, we'll just show an alert
      alert("Activity log cleared (this would call your backend service)");
    }
  };

  // Calculate statistics
  const stats = useMemo(() => ({
    total: activityLog.length,
    success: activityLog.filter(a => a.type === 'success').length,
    warning: activityLog.filter(a => a.type === 'warning').length,
    error: activityLog.filter(a => a.type === 'error').length,
    info: activityLog.filter(a => a.type === 'info' || !a.type).length,
  }), [activityLog]);

  const canClearLog = canPerformAction ? canPerformAction("clear-logs") : false;

  return (
    <div className="activity-log-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1><FaHistory /> Activity Log</h1>
            <p>Track all system activities and user actions in real-time</p>
          </div>
          <div className="user-info">
            <span className="user-name">
              <FaUser /> {user?.name || user?.username || 'Guest'}
            </span>
            <span className="user-role">{user?.role || 'User'}</span>
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
                placeholder="Search activities by action, details, or user..."
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
                <option value="all">All Activities ({activityLog.length})</option>
                <option value="info">Information ({stats.info})</option>
                <option value="success">Success ({stats.success})</option>
                <option value="warning">Warnings ({stats.warning})</option>
                <option value="error">Errors ({stats.error})</option>
              </select>
            </div>

            {canClearLog && (
              <button 
                className="clear-btn"
                onClick={clearActivityLog}
                disabled={activityLog.length === 0}
                title={activityLog.length === 0 ? "No activities to clear" : "Clear all activity logs"}
              >
                <FaTrash /> Clear All Logs
              </button>
            )}
          </div>

          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.success}</span>
              <span className="stat-label">Successful</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.warning}</span>
              <span className="stat-label">Warnings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.error}</span>
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
              <span className="activity-count">{filteredActivities.length} found</span>
            </h3>
          </div>

          <div className="activity-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div 
                  key={activity.id || `activity-${index}`} 
                  className={`activity-item ${activity.type || 'info'}`}
                  title={`Click to view details - ${formatDate(activity.timestamp)}`}
                >
                  <div 
                    className="activity-icon" 
                    style={{ color: getActivityColor(activity.type) }}
                  >
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-action">{activity.action || 'Unknown Action'}</span>
                      <span className="activity-time">
                        <FaCalendar /> {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    
                    {activity.details && (
                      <div className="activity-details">{activity.details}</div>
                    )}
                    
                    <div className="activity-meta">
                      <span className="activity-user">
                        <FaUser /> {activity.user || 'System'}
                      </span>
                      <span className={`activity-type ${activity.type || 'info'}`}>
                        {activity.type || 'info'}
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
                    ? "No activities match your current search or filter criteria." 
                    : "The activity log is currently empty. Activities will appear here as they occur."
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
                    <FaFilter /> Clear Filters
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