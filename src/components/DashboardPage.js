import React, { useState, useEffect } from "react";
import { 
  FaCar, FaRoad, FaTools, FaChartLine, FaMoneyBillWave, 
  FaBell, FaExclamationTriangle, FaCheckCircle, FaRocket,
  FaHistory, FaCalendarAlt, FaUser, FaClock, FaEye,
  FaCog, FaSync, FaFilter, FaSearch, FaArrowUp, FaArrowDown,
  FaGasPump, FaTachometerAlt, FaCalendarCheck, FaShieldAlt,
  FaFileExport, FaCogs, FaUsers, FaIdCard, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaWhatsapp, FaFilePdf
} from "react-icons/fa";
import "./DashboardPage.css";

// Summary Card Component
function SummaryCard({ label, value, icon, color, trend, onClick, isInteractive = true }) {
  return (
    <div 
      className={`summary-card ${isInteractive ? 'interactive' : ''}`} 
      onClick={isInteractive ? onClick : undefined}
    >
      <div className="summary-card-content">
        <div className="summary-icon" style={{ color }}>
          {icon}
        </div>
        <div className="summary-text">
          <div className="summary-value" style={{ color }}>
            {value}
            {trend && (
              <span className={`trend-indicator ${trend}`}>
                {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              </span>
            )}
          </div>
          <div className="summary-label">{label}</div>
        </div>
      </div>
      {isInteractive && <div className="card-hover-effect">Click to view details</div>}
    </div>
  );
}

export default function DashboardPage({ 
  vehicles, 
  user, 
  activityLog = [], 
  onNavigateToVehicles,
  onShowMaintenanceModal,
  onShowReportsModal,
  onShowDriverManagement,
  onShowDocumentManager,
  onExportData,
  onRefreshData,
  onBulkStatusChange,
  onContactFleetManager,
  onRequestVehicle,
  onScheduleService,
  onGenerateTripReport
}) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [timeFilter, setTimeFilter] = useState("today");
  const [alerts, setAlerts] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced analytics with South African context
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
    
    // Maintenance alerts for SA context
    const upcomingMaintenance = vehicles.filter(v => 
      (v.mileage || 0) > 150000 || // Higher thresholds for SA conditions
      v.status === "In Maintenance" ||
      (v.lastService && (new Date() - new Date(v.lastService)) > 180 * 24 * 60 * 60 * 1000) // 6 months
    ).length;

    // High mileage vehicles
    const highMileageVehicles = vehicles.filter(v => (v.mileage || 0) > 200000).length;
    const criticalMileageVehicles = vehicles.filter(v => (v.mileage || 0) > 300000).length;

    // Document expiry tracking
    const expiringDocuments = vehicles.filter(v => {
      const today = new Date();
      const discExpiry = v.discExpiryDate ? new Date(v.discExpiryDate) : null;
      const insuranceExpiry = v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate) : null;
      const licenseExpiry = v.licenseExpiryDate ? new Date(v.licenseExpiryDate) : null;
      
      const daysUntilDisc = discExpiry ? (discExpiry - today) / (1000 * 60 * 60 * 24) : Infinity;
      const daysUntilInsurance = insuranceExpiry ? (insuranceExpiry - today) / (1000 * 60 * 60 * 24) : Infinity;
      const daysUntilLicense = licenseExpiry ? (licenseExpiry - today) / (1000 * 60 * 60 * 24) : Infinity;
      
      return daysUntilDisc <= 30 || daysUntilInsurance <= 30 || daysUntilLicense <= 30;
    }).length;

    // Fuel efficiency for SA (L/100km)
    const averageFuelEfficiency = 12.5; // L/100km
    const fuelCostThisMonth = 87500; // Rands

    // Calculate trends
    const utilizationTrend = utilizationRate > 65 ? 'up' : 'down';
    const availabilityTrend = availabilityRate > 75 ? 'up' : 'down';

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
      criticalMileageVehicles,
      expiringDocuments,
      averageFuelEfficiency,
      fuelCostThisMonth,
      utilizationTrend,
      availabilityTrend,
    };
  }, [vehicles]);

  // Handle data refresh
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate meaningful alerts
  useEffect(() => {
    const generatedAlerts = [];
    
    if (analytics.upcomingMaintenance > 0) {
      generatedAlerts.push({
        id: 'maintenance-alert',
        type: 'warning',
        icon: <FaTools />,
        title: 'Maintenance Required',
        message: `${analytics.upcomingMaintenance} vehicles need maintenance`,
        action: 'Schedule Maintenance',
        priority: analytics.upcomingMaintenance > 3 ? 'high' : 'medium',
        onAction: () => onScheduleService && onScheduleService()
      });
    }

    if (analytics.expiringDocuments > 0) {
      generatedAlerts.push({
        id: 'documents-alert',
        type: 'danger',
        icon: <FaCalendarCheck />,
        title: 'Documents Expiring',
        message: `${analytics.expiringDocuments} documents expiring soon`,
        action: 'Review Documents',
        priority: 'high',
        onAction: () => onShowDocumentManager && onShowDocumentManager()
      });
    }

    if (analytics.criticalMileageVehicles > 0) {
      generatedAlerts.push({
        id: 'mileage-alert',
        type: 'danger',
        icon: <FaTachometerAlt />,
        title: 'High Mileage Vehicles',
        message: `${analytics.criticalMileageVehicles} vehicles over 300,000 km`,
        action: 'Inspect Vehicles',
        priority: 'medium',
        onAction: () => onNavigateToVehicles && onNavigateToVehicles('high-mileage')
      });
    }

    if (analytics.availabilityRate < 30) {
      generatedAlerts.push({
        id: 'availability-alert',
        type: 'warning',
        icon: <FaCar />,
        title: 'Low Availability',
        message: `Only ${analytics.availabilityRate}% of fleet available`,
        action: 'Check Utilization',
        priority: 'medium',
        onAction: () => onNavigateToVehicles && onNavigateToVehicles('Available')
      });
    }

    setAlerts(generatedAlerts);
  }, [analytics, onScheduleService, onShowDocumentManager, onNavigateToVehicles]);

  // Quick stats with trends
  useEffect(() => {
    const stats = [
      {
        label: "Fleet Utilization",
        value: `${analytics.utilizationRate}%`,
        description: `${analytics.inUseCount} of ${analytics.totalVehicles} vehicles in use`,
        trend: analytics.utilizationTrend,
        icon: <FaRocket />,
        color: analytics.utilizationRate > 70 ? "#10b981" : "#ef4444",
        onAction: () => onNavigateToVehicles && onNavigateToVehicles('In Use')
      },
      {
        label: "Availability Rate",
        value: `${analytics.availabilityRate}%`,
        description: `${analytics.availableCount} vehicles ready for use`,
        trend: analytics.availabilityTrend,
        icon: <FaCheckCircle />,
        color: analytics.availabilityRate > 80 ? "#10b981" : "#f59e0b",
        onAction: () => onNavigateToVehicles && onNavigateToVehicles('Available')
      },
      {
        label: "Fuel Efficiency",
        value: `${analytics.averageFuelEfficiency} L/100km`,
        description: `R ${analytics.fuelCostThisMonth.toLocaleString()} spent this month`,
        trend: "stable",
        icon: <FaGasPump />,
        color: "#3b82f6",
        onAction: () => onShowReportsModal && onShowReportsModal('fuel')
      },
      {
        label: "Maintenance Health",
        value: `${Math.max(0, 100 - (analytics.upcomingMaintenance / analytics.totalVehicles * 100)).toFixed(0)}%`,
        description: `${analytics.upcomingMaintenance} vehicles need service`,
        trend: analytics.upcomingMaintenance > 2 ? "down" : "up",
        icon: <FaShieldAlt />,
        color: analytics.upcomingMaintenance > 2 ? "#f59e0b" : "#10b981",
        onAction: () => onShowMaintenanceModal && onShowMaintenanceModal()
      }
    ];
    setQuickStats(stats);
  }, [analytics, onNavigateToVehicles, onShowReportsModal, onShowMaintenanceModal]);

  // Activity generation
  useEffect(() => {
    const activities = [];
    
    const recentLogs = activityLog.slice(0, 6).map(log => ({
      id: `log-${log.id}`,
      type: 'system',
      message: log.action,
      details: log.details,
      time: formatTimeAgo(log.timestamp),
      icon: getActivityIcon(log.action),
      color: getActivityColor(log.type),
      user: log.user,
      priority: log.priority || 'normal',
      onAction: log.onAction || null
    }));

    activities.push(...recentLogs);

    vehicles.slice(0, 2).forEach(vehicle => {
      if (vehicle.status === "In Maintenance") {
        activities.push({
          id: `${vehicle.vin}-maintenance`,
          type: 'alert',
          message: `${vehicle.make} ${vehicle.model} entered maintenance`,
          time: '2 hours ago',
          icon: <FaTools />,
          color: '#ef4444',
          priority: 'high',
          onAction: () => onNavigateToVehicles && onNavigateToVehicles('In Maintenance')
        });
      } else if (vehicle.status === "In Use" && vehicle.lastStatusChange) {
        activities.push({
          id: `${vehicle.vin}-inuse`,
          type: 'info',
          message: `${vehicle.make} ${vehicle.model} checked out`,
          time: formatTimeAgo(vehicle.lastStatusChange),
          icon: <FaCar />,
          color: '#f59e0b',
          priority: 'normal',
          onAction: () => onNavigateToVehicles && onNavigateToVehicles('In Use')
        });
      }
    });

    setRecentActivity(activities.slice(0, 6));
  }, [vehicles, activityLog, onNavigateToVehicles]);

  // Helper functions
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
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
    if (action.includes('Maintenance')) return <FaTools />;
    if (action.includes('Status')) return <FaSync />;
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

  // Handle time filter changes
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  // Handle alert actions
  const handleAlertAction = (alert) => {
    if (alert.onAction) {
      alert.onAction();
    }
  };

  // 🎯 QUICK ACTIONS - REAL FUNCTIONALITY:
  const handleQuickAction = (action) => {
    switch (action) {
      case 'view-all':
        onNavigateToVehicles && onNavigateToVehicles('all');
        break;
      case 'request-vehicle':
        onRequestVehicle && onRequestVehicle();
        break;
      case 'maintenance':
        onScheduleService && onScheduleService();
        break;
      case 'reports':
        onShowReportsModal && onShowReportsModal();
        break;
      case 'trip-report':
        onGenerateTripReport && onGenerateTripReport();
        break;
      case 'drivers':
        onShowDriverManagement && onShowDriverManagement();
        break;
      case 'documents':
        onShowDocumentManager && onShowDocumentManager();
        break;
      case 'export':
        onExportData && onExportData();
        break;
      case 'contact-manager':
        onContactFleetManager && onContactFleetManager();
        break;
      case 'whatsapp-alert':
        // Send WhatsApp alert to maintenance team
        const phoneNumber = "+27123456789";
        const message = encodeURIComponent(`Fleet Management Alert\n\nAvailability: ${analytics.availabilityRate}%\nMaintenance: ${analytics.maintenanceCount} vehicles\nTime: ${new Date().toLocaleString()}`);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        break;
      default:
        break;
    }
  };

  // Handle activity item clicks
  const handleActivityAction = (activity) => {
    if (activity.onAction) {
      activity.onAction();
    }
  };

  // Summary cards data with real actions
  const summaryCards = [
    { 
      label: "Total Vehicles", 
      value: analytics.totalVehicles, 
      icon: <FaCar />, 
      color: "#6366f1",
      onClick: () => onNavigateToVehicles && onNavigateToVehicles('all'),
    },
    { 
      label: "Available", 
      value: analytics.availableCount, 
      icon: <FaCheckCircle />, 
      color: "#10b981",
      onClick: () => onNavigateToVehicles && onNavigateToVehicles('Available'),
      trend: analytics.availabilityTrend
    },
    { 
      label: "In Use", 
      value: analytics.inUseCount, 
      icon: <FaRocket />, 
      color: "#f59e0b",
      onClick: () => onNavigateToVehicles && onNavigateToVehicles('In Use'),
      trend: analytics.utilizationTrend
    },
    { 
      label: "Maintenance", 
      value: analytics.maintenanceCount, 
      icon: <FaTools />, 
      color: "#ef4444",
      onClick: () => onNavigateToVehicles && onNavigateToVehicles('In Maintenance')
    },
    { 
      label: "Total KM", 
      value: `${(analytics.totalMileage / 1000).toFixed(0)}K`, 
      icon: <FaRoad />, 
      color: "#00d4ff",
      onClick: () => onShowReportsModal && onShowReportsModal('mileage'),
    },
    { 
      label: "Active Alerts", 
      value: alerts.length, 
      icon: <FaExclamationTriangle />, 
      color: alerts.length > 0 ? "#ef4444" : "#10b981",
      onClick: () => {
        const alertsSection = document.querySelector('.alerts-banner');
        alertsSection?.scrollIntoView({ behavior: 'smooth' });
      },
      isInteractive: alerts.length > 0
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Fleet Command Center</h1>
            <p>{getGreeting()}, {user?.name || user?.username}! Real-time overview of your vehicle fleet.</p>
          </div>
          <div className="header-actions">
            <div className="dashboard-controls">
              <select 
                value={timeFilter} 
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button 
                className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`} 
                onClick={handleRefreshData}
                title="Refresh Data"
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

      <div className="page-content">
        {/* Alert Banner */}
        {alerts.length > 0 && (
          <div className="alerts-banner">
            <div className="alerts-header">
              <FaBell className="alerts-icon" />
              <span className="alerts-title">Active Alerts: {alerts.length}</span>
              <button 
                className="btn-dismiss-all"
                onClick={() => setAlerts([])}
                title="Dismiss all alerts"
              >
                Dismiss All
              </button>
            </div>
            <div className="alerts-list">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`alert-item ${alert.priority}`} onClick={() => handleAlertAction(alert)}>
                  <div className="alert-icon">{alert.icon}</div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                  <div className="alert-action">{alert.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="summary-section">
          <div className="section-header">
            <h2>Fleet Overview</h2>
            <span className="last-updated">Updated just now</span>
          </div>
          <div className="summary-cards">
            {summaryCards.map((card, idx) => (
              <SummaryCard key={idx} {...card} />
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Performance Metrics */}
          <div className="dashboard-card performance-card">
            <div className="card-header">
              <h3>
                <FaChartLine className="icon" />
                Performance Metrics
              </h3>
              <span className="card-badge">Live</span>
            </div>
            <div className="performance-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className="performance-item" onClick={stat.onAction}>
                  <div className="performance-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="performance-content">
                    <div className="performance-value">{stat.value}</div>
                    <div className="performance-label">{stat.label}</div>
                    <div className="performance-description">{stat.description}</div>
                  </div>
                  <div className={`performance-trend ${stat.trend}`}>
                    {stat.trend === 'up' ? <FaArrowUp /> : stat.trend === 'down' ? <FaArrowDown /> : '→'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="dashboard-card status-card">
            <div className="card-header">
              <h3>
                <FaCar className="icon" />
                Fleet Status
              </h3>
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
                      width: `${(analytics.availableCount / analytics.totalVehicles) * 100}%`
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
                      width: `${(analytics.inUseCount / analytics.totalVehicles) * 100}%`
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
                      width: `${(analytics.maintenanceCount / analytics.totalVehicles) * 100}%`
                    }}
                  />
                </div>
                <span className="status-percentage">
                  {analytics.totalVehicles ? Math.round((analytics.maintenanceCount / analytics.totalVehicles) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="status-summary">
              <div className="summary-item" onClick={() => onNavigateToVehicles && onNavigateToVehicles('In Use')}>
                <span className="summary-label">Utilization Rate</span>
                <span className="summary-value">{analytics.utilizationRate}%</span>
              </div>
              <div className="summary-item" onClick={() => onNavigateToVehicles && onNavigateToVehicles('Available')}>
                <span className="summary-label">Availability Rate</span>
                <span className="summary-value">{analytics.availabilityRate}%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3>
                <FaHistory className="icon" />
                Recent Activity
              </h3>
              <button 
                className="btn-view-all"
                onClick={() => onNavigateToVehicles && onNavigateToVehicles('all')}
              >
                View All Vehicles
              </button>
            </div>
            <div className="activity-feed">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div 
                    key={activity.id} 
                    className={`activity-item ${activity.priority} ${activity.onAction ? 'clickable' : ''}`}
                    onClick={() => activity.onAction && handleActivityAction(activity)}
                  >
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

          {/* 🎯 QUICK ACTIONS - REAL FUNCTIONALITY */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h3>
                <FaRocket className="icon" />
                Quick Actions
              </h3>
              <span className="card-badge">Ready</span>
            </div>
            <div className="actions-grid">
              <button className="action-btn primary" onClick={() => handleQuickAction('view-all')}>
                <FaCar />
                <span>View All Vehicles</span>
              </button>
              
              <button className="action-btn success" onClick={() => handleQuickAction('request-vehicle')}>
                <FaMapMarkerAlt />
                <span>Request Vehicle</span>
              </button>

              <button className="action-btn warning" onClick={() => handleQuickAction('maintenance')}>
                <FaTools />
                <span>Schedule Maintenance</span>
              </button>

              <button className="action-btn info" onClick={() => handleQuickAction('trip-report')}>
                <FaFilePdf />
                <span>Generate Trip Report</span>
              </button>

              <button className="action-btn secondary" onClick={() => handleQuickAction('contact-manager')}>
                <FaPhone />
                <span>Contact Fleet Manager</span>
              </button>

              <button className="action-btn secondary" onClick={() => handleQuickAction('whatsapp-alert')}>
                <FaWhatsapp />
                <span>Send WhatsApp Alert</span>
              </button>

              <button className="action-btn secondary" onClick={() => handleQuickAction('drivers')}>
                <FaUsers />
                <span>Driver Management</span>
              </button>

              <button className="action-btn secondary" onClick={() => handleQuickAction('export')}>
                <FaFileExport />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item" onClick={() => onShowReportsModal && onShowReportsModal('mileage')}>
            <span className="stat-label">Total Distance This Month</span>
            <span className="stat-value">12,458 km</span>
          </div>
          <div className="stat-item" onClick={() => onShowReportsModal && onShowReportsModal('fuel')}>
            <span className="stat-label">Fuel Cost</span>
            <span className="stat-value">R {analytics.fuelCostThisMonth.toLocaleString()}</span>
          </div>
          <div className="stat-item" onClick={() => onShowReportsModal && onShowReportsModal('efficiency')}>
            <span className="stat-label">Avg Fuel Efficiency</span>
            <span className="stat-value">{analytics.averageFuelEfficiency} L/100km</span>
          </div>
          <div className="stat-item" onClick={() => onScheduleService && onScheduleService()}>
            <span className="stat-label">Service Due</span>
            <span className="stat-value">{analytics.upcomingMaintenance} vehicles</span>
          </div>
        </div>
      </div>
    </div>
  );
}