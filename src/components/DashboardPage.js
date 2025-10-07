import React, { useState, useEffect } from "react";
import { 
  FaCar, FaRoad, FaTools, FaChartLine, FaMoneyBillWave, 
  FaBell, FaExclamationTriangle, FaCheckCircle, FaRocket,
  FaHistory, FaCalendarAlt, FaUser, FaClock, FaEye
} from "react-icons/fa";
import "./DashboardPage.css";

export default function DashboardPage({ vehicles, user, activityLog = [] }) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [timeFilter, setTimeFilter] = useState("today"); // today, week, month

  // Calculate analytics with time-based filtering
  const analytics = React.useMemo(() => {
    const statusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const totalMileage = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    const averageMileage = vehicles.length ? Math.round(totalMileage / vehicles.length) : 0;
    
    const availableCount = statusCounts.Available || 0;
    const inUseCount = statusCounts["In Use"] || 0;
    const maintenanceCount = statusCounts["In Maintenance"] || 0;

    const utilizationRate = vehicles.length ? Math.round((inUseCount / vehicles.length) * 100) : 0;
    const availabilityRate = vehicles.length ? Math.round((availableCount / vehicles.length) * 100) : 0;
    
    // Maintenance alerts
    const upcomingMaintenance = vehicles.filter(v => 
      (v.mileage || 0) > 80000 || v.status === "In Maintenance"
    ).length;

    // High mileage vehicles
    const highMileageVehicles = vehicles.filter(v => (v.mileage || 0) > 100000).length;

    // Expiring documents
    const expiringDocuments = vehicles.filter(v => {
      const today = new Date();
      const discExpiry = v.discExpiryDate ? new Date(v.discExpiryDate) : null;
      const insuranceExpiry = v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate) : null;
      
      const daysUntilDisc = discExpiry ? (discExpiry - today) / (1000 * 60 * 60 * 24) : Infinity;
      const daysUntilInsurance = insuranceExpiry ? (insuranceExpiry - today) / (1000 * 60 * 60 * 24) : Infinity;
      
      return daysUntilDisc <= 30 || daysUntilInsurance <= 30;
    }).length;

    return {
      totalVehicles: vehicles.length,
      availableCount,
      inUseCount,
      maintenanceCount,
      totalMileage,
      averageMileage,
      utilizationRate,
      availabilityRate,
      upcomingMaintenance,
      highMileageVehicles,
      expiringDocuments
    };
  }, [vehicles]);

  // Generate recent activity from both vehicles and activity log
  useEffect(() => {
    const activities = [];
    
    // Add recent activity log entries
    const recentLogs = activityLog.slice(0, 8).map(log => ({
      id: `log-${log.id}`,
      type: 'system',
      message: log.action,
      details: log.details,
      time: formatTimeAgo(log.timestamp),
      icon: getActivityIcon(log.action),
      color: getActivityColor(log.type),
      user: log.user
    }));

    activities.push(...recentLogs);

    // Add vehicle alerts if no recent activity
    if (activities.length < 5) {
      vehicles.slice(0, 3).forEach(vehicle => {
        if (vehicle.status === "In Maintenance") {
          activities.push({
            id: `${vehicle.vin}-maintenance`,
            type: 'alert',
            message: `${vehicle.make} ${vehicle.model} requires maintenance`,
            time: 'Recently',
            icon: <FaTools />,
            color: '#ef4444'
          });
        }
      });
    }

    setRecentActivity(activities.slice(0, 8));
  }, [vehicles, activityLog]);

  // Helper functions
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (action) => {
    if (action.includes('Login')) return <FaUser />;
    if (action.includes('Vehicle')) return <FaCar />;
    if (action.includes('User')) return <FaUser />;
    if (action.includes('Status')) return <FaRocket />;
    return <FaBell />;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#00d4ff';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick stats for the dashboard
  const quickStats = [
    {
      label: "Fleet Utilization",
      value: `${analytics.utilizationRate}%`,
      description: `${analytics.inUseCount} of ${analytics.totalVehicles} vehicles in use`,
      trend: analytics.utilizationRate > 70 ? "high" : "normal"
    },
    {
      label: "Availability Rate",
      value: `${analytics.availabilityRate}%`,
      description: `${analytics.availableCount} vehicles ready for use`,
      trend: analytics.availabilityRate > 80 ? "excellent" : "good"
    },
    {
      label: "Avg Vehicle Age",
      value: "3.2 yrs",
      description: "Based on model years",
      trend: "stable"
    },
    {
      label: "Maintenance Alerts",
      value: analytics.upcomingMaintenance,
      description: "Vehicles needing attention",
      trend: analytics.upcomingMaintenance > 2 ? "high" : "low"
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Dashboard</h1>
            <p>{getGreeting()}, {user?.name || user?.username}! Here's your fleet overview.</p>
          </div>
          <div className="header-actions">
            <div className="time-filter">
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Key Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <FaCar />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics.totalVehicles}</div>
              <div className="metric-label">Total Vehicles</div>
              <div className="metric-trend">All fleet vehicles</div>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">
              <FaCheckCircle />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics.availableCount}</div>
              <div className="metric-label">Available</div>
              <div className="metric-trend">{analytics.availabilityRate}% of fleet</div>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">
              <FaRocket />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics.inUseCount}</div>
              <div className="metric-label">In Use</div>
              <div className="metric-trend">{analytics.utilizationRate}% utilization</div>
            </div>
          </div>

          <div className="metric-card danger">
            <div className="metric-icon">
              <FaTools />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics.maintenanceCount}</div>
              <div className="metric-label">Maintenance</div>
              <div className="metric-trend">{analytics.upcomingMaintenance} due soon</div>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon">
              <FaRoad />
            </div>
            <div className="metric-content">
              <div className="metric-value">{(analytics.totalMileage / 1000).toFixed(0)}K</div>
              <div className="metric-label">Total KM</div>
              <div className="metric-trend">{analytics.averageMileage} avg per vehicle</div>
            </div>
          </div>

          <div className="metric-card alert">
            <div className="metric-icon">
              <FaExclamationTriangle />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics.expiringDocuments}</div>
              <div className="metric-label">Expiring Docs</div>
              <div className="metric-trend">Documents expiring soon</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Recent Activity */}
          <div className="dashboard-section activity-section">
            <div className="section-header">
              <h3>
                <FaHistory className="icon" />
                Recent Activity
              </h3>
              <span className="section-badge">{recentActivity.length} activities</span>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ color: activity.color }}>
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      {activity.details && (
                        <div className="activity-details">{activity.details}</div>
                      )}
                      <div className="activity-meta">
                        <span className="activity-time">{activity.time}</span>
                        {activity.user && (
                          <span className="activity-user">by {activity.user}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaEye className="empty-icon" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-section stats-section">
            <div className="section-header">
              <h3>
                <FaChartLine className="icon" />
                Performance Overview
              </h3>
            </div>
            <div className="stats-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className={`stat-item ${stat.trend}`}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Status Distribution */}
          <div className="dashboard-section full-width distribution-section">
            <div className="section-header">
              <h3>
                <FaCar className="icon" />
                Vehicle Status Distribution
              </h3>
              <div className="distribution-legend">
                <span className="legend-item available">Available</span>
                <span className="legend-item in-use">In Use</span>
                <span className="legend-item maintenance">Maintenance</span>
              </div>
            </div>
            <div className="status-distribution">
              <div className="status-item available">
                <div className="status-bar" style={{width: `${(analytics.availableCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">Available</span>
                  <span className="status-count">{analytics.availableCount} vehicles</span>
                  <span className="status-percentage">
                    {analytics.totalVehicles ? Math.round((analytics.availableCount / analytics.totalVehicles) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="status-item in-use">
                <div className="status-bar" style={{width: `${(analytics.inUseCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">In Use</span>
                  <span className="status-count">{analytics.inUseCount} vehicles</span>
                  <span className="status-percentage">
                    {analytics.totalVehicles ? Math.round((analytics.inUseCount / analytics.totalVehicles) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="status-item maintenance">
                <div className="status-bar" style={{width: `${(analytics.maintenanceCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">Maintenance</span>
                  <span className="status-count">{analytics.maintenanceCount} vehicles</span>
                  <span className="status-percentage">
                    {analytics.totalVehicles ? Math.round((analytics.maintenanceCount / analytics.totalVehicles) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="action-btn primary">
              <FaCar />
              <span>View All Vehicles</span>
            </button>
            <button className="action-btn success">
              <FaCheckCircle />
              <span>Check Availability</span>
            </button>
            <button className="action-btn warning">
              <FaTools />
              <span>Maintenance Schedule</span>
            </button>
            <button className="action-btn info">
              <FaChartLine />
              <span>Generate Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}