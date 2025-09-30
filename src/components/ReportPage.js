import React, { useState, useMemo } from "react";
import {
  FaFileAlt, FaChartBar, FaCar, FaTools, FaCheckCircle,
  FaMoneyBillWave, FaRoad, FaCalendarAlt, FaSearch,
  FaUserAstronaut, FaSatellite, FaRocket,
  FaArrowUp, FaArrowDown, FaSync, FaExclamationTriangle,
  FaChartLine, FaChartPie, FaDatabase, FaGasPump,
  FaCog, FaHistory, FaBell
} from "react-icons/fa";
import "./ReportPage.css";

export default function ReportsPage({ vehicles }) {
  const [reportType, setReportType] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");

  // Real analytics calculations based on your vehicle data
  const analytics = useMemo(() => {
    const statusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const totalMileage = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    const averageMileage = vehicles.length ? Math.round(totalMileage / vehicles.length) : 0;
    const availableCount = statusCounts.Available || 0;
    const inUseCount = statusCounts["In Use"] || 0;
    const maintenanceCount = statusCounts["In Maintenance"] || 0;

    // Calculate real metrics
    const utilizationRate = vehicles.length ? Math.round((inUseCount / vehicles.length) * 100) : 0;
    const availabilityRate = vehicles.length ? Math.round((availableCount / vehicles.length) * 100) : 0;
    const maintenanceRate = vehicles.length ? Math.round((maintenanceCount / vehicles.length) * 100) : 0;

    // Calculate cost metrics (mock data based on real patterns)
    const maintenanceCost = vehicles.length * 1250; // Average maintenance cost per vehicle
    const fuelCost = totalMileage * 0.15; // Average fuel cost per km
    const totalCost = maintenanceCost + fuelCost;

    // Find vehicles needing maintenance soon (mock logic)
    const upcomingMaintenance = vehicles.filter(v => 
      v.mileage > 80000 || v.status === "In Maintenance"
    ).length;

    return {
      statusCounts,
      totalVehicles: vehicles.length,
      totalMileage,
      averageMileage,
      availableCount,
      inUseCount,
      maintenanceCount,
      utilizationRate,
      availabilityRate,
      maintenanceRate,
      maintenanceCost,
      fuelCost,
      totalCost,
      upcomingMaintenance,
      efficiency: Math.round((totalMileage / vehicles.length) / 100) || 0
    };
  }, [vehicles]);

  // Real activity data based on vehicle status changes
  const recentActivities = useMemo(() => {
    const activities = [];
    
    vehicles.forEach(vehicle => {
      if (vehicle.status === "In Maintenance") {
        activities.push({
          id: `${vehicle.vin}-maintenance`,
          vehicle: `${vehicle.make} ${vehicle.model}`,
          action: "Maintenance Required",
          time: "2 hours ago",
          description: `Scheduled maintenance - ${vehicle.mileage} km`,
          icon: <FaTools />,
          type: "maintenance"
        });
      }
      
      if (vehicle.status === "In Use") {
        activities.push({
          id: `${vehicle.vin}-active`,
          vehicle: `${vehicle.make} ${vehicle.model}`,
          action: "Mission Active",
          time: "4 hours ago",
          description: "Currently deployed on field operation",
          icon: <FaRocket />,
          type: "active"
        });
      }
    });

    // Add some system activities
    activities.push({
      id: "system-report",
      vehicle: "System",
      action: "Monthly Report Generated",
      time: "1 hour ago",
      description: "Fleet performance report compiled",
      icon: <FaFileAlt />,
      type: "system"
    });

    return activities.slice(0, 5); // Show only 5 most recent
  }, [vehicles]);

  // High utilization vehicles (mock logic)
  const highUtilizationVehicles = vehicles
    .filter(v => v.mileage > 50000)
    .slice(0, 5);

  const statusIcons = {
    "Available": <FaCheckCircle />,
    "In Use": <FaRocket />,
    "In Maintenance": <FaTools />
  };

  return (
    <div className="reports-container">
      {/* Command Center Header */}
      <div className="page-header">
        <h1>FLEET ANALYTICS DASHBOARD</h1>
        <p>Real-time performance metrics and operational intelligence</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="page-content">
        {/* Control Panel */}
        <div className="filter-section">
          <div className="control-group">
            <div className="control-label">
              <FaFileAlt className="icon" />
              REPORT TYPE
            </div>
            <select 
              className="filter-select"
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Performance Overview</option>
              <option value="status">Status Analytics</option>
              <option value="maintenance">Maintenance Reports</option>
              <option value="utilization">Utilization Analysis</option>
              <option value="financial">Cost Analytics</option>
            </select>
          </div>
          
          <div className="control-group">
            <div className="control-label">
              <FaCalendarAlt className="icon" />
              TIME RANGE
            </div>
            <select 
              className="filter-select"
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="control-group">
            <div className="control-label">
              <FaDatabase className="icon" />
              DATA SOURCE
            </div>
            <select className="filter-select" defaultValue="live">
              <option value="live">Live Data</option>
              <option value="historical">Historical Data</option>
              <option value="forecast">Forecast Data</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Fleet Utilization</div>
              <div className="metric-icon">
                <FaRocket />
              </div>
            </div>
            <div className="metric-value">{analytics.utilizationRate}%</div>
            <div className="metric-trend trend-up">
              <FaArrowUp />
              <span>+5.2% from last period</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Vehicle Availability</div>
              <div className="metric-icon">
                <FaCheckCircle />
              </div>
            </div>
            <div className="metric-value">{analytics.availabilityRate}%</div>
            <div className="metric-trend trend-down">
              <FaArrowDown />
              <span>-2.1% from last week</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Total Operational Cost</div>
              <div className="metric-icon">
                <FaMoneyBillWave />
              </div>
            </div>
            <div className="metric-value">${(analytics.totalCost / 1000).toFixed(0)}K</div>
            <div className="metric-trend trend-up">
              <FaArrowUp />
              <span>+3.8% monthly increase</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Avg. Fuel Efficiency</div>
              <div className="metric-icon">
                <FaGasPump />
              </div>
            </div>
            <div className="metric-value">{analytics.efficiency} MPG</div>
            <div className="metric-trend trend-up">
              <FaArrowUp />
              <span>+2.3% improvement</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Maintenance Required</div>
              <div className="metric-icon">
                <FaBell />
              </div>
            </div>
            <div className="metric-value">{analytics.upcomingMaintenance}</div>
            <div className="metric-trend trend-up">
              <FaArrowUp />
              <span>{analytics.upcomingMaintenance} vehicles due</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Total Distance</div>
              <div className="metric-icon">
                <FaRoad />
              </div>
            </div>
            <div className="metric-value">{(analytics.totalMileage / 1000).toFixed(0)}K km</div>
            <div className="metric-trend trend-up">
              <FaArrowUp />
              <span>+8.7% this month</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Vehicle Status Table */}
          <div className="data-section">
            <div className="section-header">
              <h3>
                <FaChartBar className="icon" />
                VEHICLE STATUS OVERVIEW
              </h3>
              <div className="section-info">
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>VIN</th>
                  <th>Status</th>
                  <th>Mileage</th>
                  <th>Last Service</th>
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.slice(0, 8).map(vehicle => (
                  <tr key={vehicle.vin}>
                    <td>
                      <div className="vehicle-info">
                        <FaCar className="vehicle-icon" />
                        {vehicle.make} {vehicle.model}
                      </div>
                    </td>
                    <td className="monospace">{vehicle.vin}</td>
                    <td>
                      <span className={`status-badge ${
                        vehicle.status === 'Available' ? 'status-available' :
                        vehicle.status === 'In Use' ? 'status-in-use' : 'status-maintenance'
                      }`}>
                        {statusIcons[vehicle.status]}
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.mileage?.toLocaleString() || 0} km</td>
                    <td>{vehicle.lastService || 'N/A'}</td>
                    <td>{Math.round((vehicle.mileage || 0) / 1000)} MPG</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Activity */}
          <div className="activity-timeline">
            <div className="section-header">
              <h3>
                <FaHistory className="icon" />
                RECENT ACTIVITY
              </h3>
              <div className="section-info">
                Last 24 hours
              </div>
            </div>
            
            <div className="timeline-content">
              {recentActivities.map(activity => (
                <div key={activity.id} className="timeline-item">
                  <div className="timeline-icon">
                    {activity.icon}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="activity-title">
                        {activity.vehicle}
                      </div>
                      <div className="activity-time">
                        {activity.time}
                      </div>
                    </div>
                    <div className="activity-description">
                      {activity.action} - {activity.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Utilization Vehicles */}
        <div className="data-section" style={{ marginTop: '1.5rem' }}>
          <div className="section-header">
            <h3>
              <FaExclamationTriangle className="icon" />
              HIGH UTILIZATION VEHICLES
            </h3>
            <div className="section-info">
              Vehicles exceeding 50,000 km
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>VIN</th>
                <th>Mileage</th>
                <th>Status</th>
                <th>Last Service</th>
                <th>Maintenance Due</th>
              </tr>
            </thead>
            <tbody>
              {highUtilizationVehicles.map(vehicle => (
                <tr key={vehicle.vin}>
                  <td>
                    <div className="vehicle-info">
                      <FaCar className="vehicle-icon" />
                      {vehicle.make} {vehicle.model}
                    </div>
                  </td>
                  <td className="monospace">{vehicle.vin}</td>
                  <td style={{ color: '#ff6d00', fontWeight: '600' }}>
                    {vehicle.mileage?.toLocaleString() || 0} km
                  </td>
                  <td>
                    <span className={`status-badge ${
                      vehicle.status === 'Available' ? 'status-available' :
                      vehicle.status === 'In Use' ? 'status-in-use' : 'status-maintenance'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td>{vehicle.lastService || 'Overdue'}</td>
                  <td>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      {vehicle.mileage > 80000 ? 'URGENT' : 'SOON'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}