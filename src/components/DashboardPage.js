import React, { useState, useEffect } from "react";
import { 
  FaCar, FaRoad, FaTools, FaChartLine, FaMoneyBillWave, 
  FaBell, FaExclamationTriangle, FaCheckCircle, FaRocket,
  FaHistory, FaCalendarAlt, FaUser
} from "react-icons/fa";
import "./DashboardPage.css";

export default function DashboardPage({ vehicles, user, maintenances = [] }) {
  const [recentActivity, setRecentActivity] = useState([]);

  // Calculate analytics
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
    
    // Vehicles needing maintenance (mock logic)
    const upcomingMaintenance = vehicles.filter(v => 
      (v.mileage || 0) > 80000 || v.status === "In Maintenance"
    ).length;

    // High mileage vehicles
    const highMileageVehicles = vehicles.filter(v => (v.mileage || 0) > 100000).length;

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
      highMileageVehicles
    };
  }, [vehicles]);

  // Generate recent activity
  useEffect(() => {
    const activities = [];
    
    // Add vehicle status changes
    vehicles.slice(0, 5).forEach(vehicle => {
      if (vehicle.status === "In Maintenance") {
        activities.push({
          id: `${vehicle.vin}-maintenance`,
          type: 'maintenance',
          message: `${vehicle.make} ${vehicle.model} requires maintenance`,
          time: '2 hours ago',
          icon: <FaTools />,
          color: '#ef4444'
        });
      }
      
      if (vehicle.status === "In Use") {
        activities.push({
          id: `${vehicle.vin}-inuse`,
          type: 'active',
          message: `${vehicle.make} ${vehicle.model} is on active mission`,
          time: '4 hours ago',
          icon: <FaRocket />,
          color: '#f59e0b'
        });
      }
    });

    // Add system activities
    activities.push(
      {
        id: 'system-1',
        type: 'system',
        message: 'Monthly fleet report generated',
        time: '1 hour ago',
        icon: <FaChartLine />,
        color: '#00d4ff'
      },
      {
        id: 'system-2',
        type: 'system',
        message: 'System backup completed',
        time: '3 hours ago',
        icon: <FaCheckCircle />,
        color: '#10b981'
      }
    );

    setRecentActivity(activities.slice(0, 6));
  }, [vehicles]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Dashboard</h1>
            <p>{getGreeting()}, {user?.name || user?.username}! Here's your fleet overview.</p>
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
        {/* Key Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FaCar />
            </div>
            <div className="metric-value">{analytics.totalVehicles}</div>
            <div className="metric-label">Total Vehicles</div>
            <div className="metric-trend">All fleet vehicles</div>
          </div>

          <div className="metric-card available">
            <div className="metric-icon">
              <FaCheckCircle />
            </div>
            <div className="metric-value">{analytics.availableCount}</div>
            <div className="metric-label">Available</div>
            <div className="metric-trend">{analytics.availabilityRate}% of fleet</div>
          </div>

          <div className="metric-card in-use">
            <div className="metric-icon">
              <FaRocket />
            </div>
            <div className="metric-value">{analytics.inUseCount}</div>
            <div className="metric-label">In Use</div>
            <div className="metric-trend">{analytics.utilizationRate}% utilization</div>
          </div>

          <div className="metric-card maintenance">
            <div className="metric-icon">
              <FaTools />
            </div>
            <div className="metric-value">{analytics.maintenanceCount}</div>
            <div className="metric-label">Maintenance</div>
            <div className="metric-trend">{analytics.upcomingMaintenance} due soon</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaRoad />
            </div>
            <div className="metric-value">{(analytics.totalMileage / 1000).toFixed(0)}K</div>
            <div className="metric-label">Total KM</div>
            <div className="metric-trend">{analytics.averageMileage} avg per vehicle</div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">
              <FaExclamationTriangle />
            </div>
            <div className="metric-value">{analytics.highMileageVehicles}</div>
            <div className="metric-label">High Mileage</div>
            <div className="metric-trend">Vehicles over 100K km</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>
                <FaHistory className="icon" />
                Recent Activity
              </h3>
              <span className="section-badge">{recentActivity.length} activities</span>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>
                <FaChartLine className="icon" />
                Quick Stats
              </h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{analytics.utilizationRate}%</div>
                <div className="stat-label">Fleet Utilization</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{analytics.availabilityRate}%</div>
                <div className="stat-label">Availability Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{analytics.averageMileage}</div>
                <div className="stat-label">Avg Mileage</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{analytics.upcomingMaintenance}</div>
                <div className="stat-label">Maintenance Alerts</div>
              </div>
            </div>
          </div>

          {/* Vehicle Status Distribution */}
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h3>
                <FaCar className="icon" />
                Vehicle Status Distribution
              </h3>
            </div>
            <div className="status-distribution">
              <div className="status-item available">
                <div className="status-bar" style={{width: `${(analytics.availableCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">Available</span>
                  <span className="status-count">{analytics.availableCount}</span>
                </div>
              </div>
              <div className="status-item in-use">
                <div className="status-bar" style={{width: `${(analytics.inUseCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">In Use</span>
                  <span className="status-count">{analytics.inUseCount}</span>
                </div>
              </div>
              <div className="status-item maintenance">
                <div className="status-bar" style={{width: `${(analytics.maintenanceCount / analytics.totalVehicles) * 100}%`}}></div>
                <div className="status-info">
                  <span className="status-label">Maintenance</span>
                  <span className="status-count">{analytics.maintenanceCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}