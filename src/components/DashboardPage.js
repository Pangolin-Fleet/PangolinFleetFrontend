import React, { useState, useEffect } from "react";
import { 
  FaCar, FaRoad, FaTools, FaChartLine, FaMoneyBillWave, 
  FaBell, FaExclamationTriangle, FaCheckCircle, FaRocket,
  FaHistory, FaUser, FaSync, FaGasPump, FaTachometerAlt, 
  FaCalendarCheck, FaShieldAlt, FaFileExport, FaUsers, 
  FaMapMarkerAlt, FaPhone, FaWhatsapp, FaFilePdf,
  FaArrowUp, FaArrowDown
} from "react-icons/fa";
import "./DashboardPage.css";

// Summary Card Component
function SummaryCard({ label, value, icon, color, trend, onClick }) {
  return (
    <div className="summary-card interactive" onClick={onClick} style={{ borderLeftColor: color }}>
      <div className="summary-card-content">
        <div className="summary-icon" style={{ color }}>
          {icon}
        </div>
        <div className="summary-text">
          <div className="summary-value" style={{ color }}>
            {value}
            {trend && (
              <span style={{ 
                fontSize: '0.7rem', 
                marginLeft: '8px',
                color: trend === 'up' ? '#10b981' : '#ef4444'
              }}>
                {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              </span>
            )}
          </div>
          <div className="summary-label">{label}</div>
        </div>
      </div>
      <div className="card-hover-effect">Click to view</div>
    </div>
  );
}

export default function DashboardPage({ 
  vehicles = [], 
  user = {}, 
  activityLog = [], 
  // Navigation and action handlers
  onNavigateToVehicles = () => console.log('Navigate to vehicles'),
  onNavigateToMaintenance = () => console.log('Navigate to maintenance'),
  onNavigateToInUse = () => console.log('Navigate to in use'),
  onNavigateToReports = () => console.log('Navigate to reports'),
  onNavigateToUsers = () => console.log('Navigate to users'),
  onShowVehicleRequestModal = () => console.log('Show vehicle request modal'),
  onContactFleetManager = () => console.log('Contact fleet manager'),
  onExportData = () => console.log('Export data'),
  onRefreshData = () => console.log('Refresh data'),
  canPerformAction = () => true
}) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const statusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const totalMileage = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    
    const availableCount = statusCounts.Available || 0;
    const inUseCount = statusCounts["In Use"] || 0;
    const maintenanceCount = statusCounts["In Maintenance"] || 0;

    const utilizationRate = vehicles.length ? Math.round((inUseCount / vehicles.length) * 100) : 0;
    const availabilityRate = vehicles.length ? Math.round((availableCount / vehicles.length) * 100) : 0;

    return {
      totalVehicles: vehicles.length,
      availableCount,
      inUseCount,
      maintenanceCount,
      totalMileage,
      utilizationRate,
      availabilityRate,
      utilizationTrend: utilizationRate > 65 ? 'up' : 'down',
      availabilityTrend: availabilityRate > 75 ? 'up' : 'down',
    };
  }, [vehicles]);

  // Handle refresh
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced quick actions with REAL navigation
  const quickActions = [
    {
      label: "View All Vehicles",
      icon: <FaCar />,
      action: () => onNavigateToVehicles('all'),
      type: 'primary',
      description: 'Browse complete vehicle inventory'
    },
    {
      label: "Active Missions",
      icon: <FaRocket />,
      action: () => onNavigateToInUse(),
      type: 'success',
      description: 'View and manage active trips'
    },
    {
      label: "Schedule Maintenance",
      icon: <FaTools />,
      action: () => onNavigateToMaintenance(),
      type: 'warning',
      description: 'Create maintenance work orders'
    },
    {
      label: "Generate Reports",
      icon: <FaFilePdf />,
      action: () => onNavigateToReports(),
      type: 'info',
      description: 'Create detailed reports'
    },
    {
      label: "Contact Fleet Manager",
      icon: <FaPhone />,
      action: () => onContactFleetManager(),
      type: 'secondary',
      description: 'Get immediate assistance'
    },
    {
      label: "Send WhatsApp Alert",
      icon: <FaWhatsapp />,
      action: () => {
        const phoneNumber = "+27123456789";
        const message = encodeURIComponent(
          `Fleet Management Alert\n\n` +
          `Total Vehicles: ${analytics.totalVehicles}\n` +
          `Available: ${analytics.availableCount}\n` +
          `In Use: ${analytics.inUseCount}\n` +
          `Maintenance: ${analytics.maintenanceCount}\n` +
          `Utilization: ${analytics.utilizationRate}%`
        );
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      },
      type: 'secondary',
      description: 'Quick alert via WhatsApp'
    },
    {
      label: "User Management",
      icon: <FaUsers />,
      action: () => onNavigateToUsers(),
      type: 'secondary',
      description: 'Manage users and drivers',
      show: canPerformAction("users:manage")
    },
    {
      label: "Export Data",
      icon: <FaFileExport />,
      action: () => onExportData(),
      type: 'secondary',
      description: 'Export fleet data to CSV/PDF'
    }
  ].filter(action => action.show !== false);

  // Enhanced summary cards with navigation
  const summaryCards = [
    { 
      label: "Total Vehicles", 
      value: analytics.totalVehicles, 
      icon: <FaCar />, 
      color: "#6366f1",
      onClick: () => onNavigateToVehicles('all'),
      description: 'View complete fleet inventory'
    },
    { 
      label: "Available", 
      value: analytics.availableCount, 
      icon: <FaCheckCircle />, 
      color: "#10b981",
      onClick: () => onNavigateToVehicles('Available'),
      trend: analytics.availabilityTrend,
      description: 'View available vehicles'
    },
    { 
      label: "In Use", 
      value: analytics.inUseCount, 
      icon: <FaRocket />, 
      color: "#f59e0b",
      onClick: () => onNavigateToVehicles('In Use'),
      trend: analytics.utilizationTrend,
      description: 'View active assignments'
    },
    { 
      label: "Maintenance", 
      value: analytics.maintenanceCount, 
      icon: <FaTools />, 
      color: "#ef4444",
      onClick: () => onNavigateToMaintenance(),
      description: 'Manage maintenance schedule'
    }
  ];

  // Enhanced performance metrics with navigation
  const performanceMetrics = [
    {
      label: "Fleet Utilization",
      value: `${analytics.utilizationRate}%`,
      description: `${analytics.inUseCount} of ${analytics.totalVehicles} vehicles in use`,
      color: "#3b82f6",
      icon: <FaRocket />,
      onClick: () => onNavigateToVehicles('In Use')
    },
    {
      label: "Availability Rate",
      value: `${analytics.availabilityRate}%`,
      description: `${analytics.availableCount} vehicles ready for use`,
      color: "#10b981",
      icon: <FaCheckCircle />,
      onClick: () => onNavigateToVehicles('Available')
    },
    {
      label: "Maintenance Health",
      value: `${Math.max(0, 100 - (analytics.maintenanceCount / analytics.totalVehicles * 100)).toFixed(0)}%`,
      description: `${analytics.maintenanceCount} vehicles in maintenance`,
      color: analytics.maintenanceCount > 2 ? "#f59e0b" : "#10b981",
      icon: <FaShieldAlt />,
      onClick: () => onNavigateToMaintenance()
    },
    {
      label: "Total Distance",
      value: `${(analytics.totalMileage / 1000).toFixed(0)}K km`,
      description: "Accumulated fleet distance",
      color: "#8b5cf6",
      icon: <FaRoad />,
      onClick: () => onNavigateToReports()
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Fleet Dashboard</h1>
            <p>{getGreeting()}, {user?.name || user?.username}! Here's your fleet overview.</p>
          </div>
          <div className="header-actions">
            <div className="dashboard-controls">
              <button 
                className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefreshData}
                disabled={isRefreshing}
              >
                <FaSync />
                {isRefreshing && <div className="refresh-spinner"></div>}
              </button>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content">
        {/* Summary Cards */}
        <div className="summary-section">
          <div className="section-header">
            <h2>Fleet Overview</h2>
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="summary-cards">
            {summaryCards.map((card, index) => (
              <SummaryCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Performance Metrics */}
          <div className="dashboard-card performance-card">
            <div className="card-header">
              <h3><FaChartLine className="icon" /> Performance Metrics</h3>
              <div className="card-badge">Live</div>
            </div>
            <div className="performance-grid">
              {performanceMetrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="performance-item interactive" 
                  onClick={metric.onClick}
                  style={{ borderLeftColor: metric.color }}
                >
                  <div className="performance-icon" style={{ color: metric.color }}>
                    {metric.icon}
                  </div>
                  <div className="performance-content">
                    <div className="performance-value" style={{ color: metric.color }}>
                      {metric.value}
                    </div>
                    <div className="performance-label">{metric.label}</div>
                    <div className="performance-description">{metric.description}</div>
                  </div>
                  <div className="performance-trend up">
                    <FaArrowUp />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="dashboard-card status-card">
            <div className="card-header">
              <h3><FaCar className="icon" /> Fleet Status</h3>
              <div className="legend">
                <span className="legend-item available">Available</span>
                <span className="legend-item in-use">In Use</span>
                <span className="legend-item maintenance">Maintenance</span>
              </div>
            </div>
            <div className="status-distribution">
              <div className="status-indicator">
                <div className="status-header">
                  <span className="status-name">Available</span>
                  <span className="status-count">{analytics.availableCount}</span>
                </div>
                <div className="status-bar-container">
                  <div 
                    className="status-bar available" 
                    style={{ 
                      width: `${analytics.totalVehicles ? (analytics.availableCount / analytics.totalVehicles) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="status-percentage">
                  {analytics.totalVehicles ? Math.round((analytics.availableCount / analytics.totalVehicles) * 100) : 0}%
                </span>
              </div>
              <div className="status-indicator">
                <div className="status-header">
                  <span className="status-name">In Use</span>
                  <span className="status-count">{analytics.inUseCount}</span>
                </div>
                <div className="status-bar-container">
                  <div 
                    className="status-bar in-use" 
                    style={{ 
                      width: `${analytics.totalVehicles ? (analytics.inUseCount / analytics.totalVehicles) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="status-percentage">
                  {analytics.totalVehicles ? Math.round((analytics.inUseCount / analytics.totalVehicles) * 100) : 0}%
                </span>
              </div>
              <div className="status-indicator">
                <div className="status-header">
                  <span className="status-name">Maintenance</span>
                  <span className="status-count">{analytics.maintenanceCount}</span>
                </div>
                <div className="status-bar-container">
                  <div 
                    className="status-bar maintenance" 
                    style={{ 
                      width: `${analytics.totalVehicles ? (analytics.maintenanceCount / analytics.totalVehicles) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="status-percentage">
                  {analytics.totalVehicles ? Math.round((analytics.maintenanceCount / analytics.totalVehicles) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="status-summary">
              <div className="summary-item" onClick={() => onNavigateToVehicles('all')}>
                <span className="summary-label">Total Fleet</span>
                <span className="summary-value">{analytics.totalVehicles}</span>
              </div>
              <div className="summary-item" onClick={() => onNavigateToMaintenance()}>
                <span className="summary-label">Requires Attention</span>
                <span className="summary-value">{analytics.maintenanceCount}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3><FaHistory className="icon" /> Recent Activity</h3>
              <button className="btn-view-all" onClick={() => onNavigateToVehicles('all')}>
                View All
              </button>
            </div>
            <div className="activity-feed">
              {activityLog.slice(0, 5).map((activity, index) => (
                <div 
                  key={index} 
                  className={`activity-item clickable ${activity.priority || 'normal'}`}
                  onClick={() => {
                    // Navigate based on activity type
                    if (activity.type === 'maintenance') {
                      onNavigateToMaintenance();
                    } else if (activity.type === 'vehicle') {
                      onNavigateToVehicles('all');
                    }
                  }}
                >
                  <div className="activity-icon">
                    {activity.type === 'maintenance' ? <FaTools /> : <FaCar />}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.action}</div>
                    <div className="activity-details">{activity.details}</div>
                    <div className="activity-meta">
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      <span className="activity-user">{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <div className="empty-state">
                  <FaHistory className="empty-icon" />
                  <p>No recent activity</p>
                  <button 
                    className="btn-view-all" 
                    onClick={() => onNavigateToVehicles('all')}
                    style={{ marginTop: '1rem' }}
                  >
                    Explore Vehicles
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h3><FaRocket className="icon" /> Quick Actions</h3>
              <span className="card-badge">Quick Access</span>
            </div>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`action-btn ${action.type}`}
                  onClick={action.action}
                  title={action.description}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item" onClick={() => onNavigateToReports()}>
            <span className="stat-label">Total Distance</span>
            <span className="stat-value">{(analytics.totalMileage / 1000).toFixed(0)}K km</span>
            <div className="sparkline">
              {[65, 59, 80, 81, 56, 55, 70].map((height, i) => (
                <div 
                  key={i}
                  className="sparkline-bar" 
                  style={{ 
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #00d4ff, #4facfe)'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="stat-item" onClick={() => onNavigateToReports()}>
            <span className="stat-label">Utilization Rate</span>
            <span className="stat-value">{analytics.utilizationRate}%</span>
            <div className="sparkline">
              {[45, 60, 75, 80, 65, 70, 68].map((height, i) => (
                <div 
                  key={i}
                  className="sparkline-bar" 
                  style={{ 
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #10b981, #34d399)'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="stat-item" onClick={() => onNavigateToReports()}>
            <span className="stat-label">Availability Rate</span>
            <span className="stat-value">{analytics.availabilityRate}%</span>
            <div className="sparkline">
              {[80, 75, 82, 78, 85, 80, 83].map((height, i) => (
                <div 
                  key={i}
                  className="sparkline-bar" 
                  style={{ 
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #f59e0b, #fbbf24)'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="stat-item" onClick={() => onNavigateToMaintenance()}>
            <span className="stat-label">In Maintenance</span>
            <span className="stat-value">{analytics.maintenanceCount}</span>
            <div className="sparkline">
              {[20, 25, 18, 22, 15, 12, 10].map((height, i) => (
                <div 
                  key={i}
                  className="sparkline-bar" 
                  style={{ 
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #ef4444, #f87171)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}