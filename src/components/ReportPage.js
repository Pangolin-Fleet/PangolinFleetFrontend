import React, { useState, useMemo } from "react";
import {
  FaFileAlt, FaChartPie, FaCar, FaTools, FaCheckCircle,
  FaMoneyBillWave, FaRoad, FaCalendarAlt, FaSearch
} from "react-icons/fa";
import "./ReportPage.css";

export default function ReportPage({ vehicles, darkMode }) {
  const [reportType, setReportType] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");

  const reports = useMemo(() => {
    const statusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const totalMileage = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    const averageMileage = vehicles.length ? Math.round(totalMileage / vehicles.length) : 0;

    return {
      statusCounts,
      totalVehicles: vehicles.length,
      totalMileage,
      averageMileage,
      availableCount: statusCounts.Available || 0,
      inUseCount: statusCounts["In Use"] || 0,
      maintenanceCount: statusCounts["In Maintenance"] || 0
    };
  }, [vehicles]);

  const statusColors = {
    "Available": "#27ae60",
    "In Use": "#3498db", 
    "In Maintenance": "#e74c3c"
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Pangolin Fleet</h1>
        <p>Reports & Analytics</p>
      </div>

      <div className="page-content">
        <div className="report-controls">
          <div className="control-group">
            <label><FaFileAlt /> Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="overview">Overview</option>
              <option value="status">Status Report</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilization">Utilization</option>
            </select>
          </div>
          <div className="control-group">
            <label><FaCalendarAlt /> Time Range</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="report-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-header" style={{ backgroundColor: '#3498db' }}>
                <FaCar className="summary-icon" />
                <div className="summary-value">{reports.totalVehicles}</div>
              </div>
              <div className="summary-label">Total Vehicles</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-header" style={{ backgroundColor: '#27ae60' }}>
                <FaCheckCircle className="summary-icon" />
                <div className="summary-value">{reports.availableCount}</div>
              </div>
              <div className="summary-label">Available</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-header" style={{ backgroundColor: '#f39c12' }}>
                <FaCar className="summary-icon" />
                <div className="summary-value">{reports.inUseCount}</div>
              </div>
              <div className="summary-label">In Use</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-header" style={{ backgroundColor: '#e74c3c' }}>
                <FaTools className="summary-icon" />
                <div className="summary-value">{reports.maintenanceCount}</div>
              </div>
              <div className="summary-label">Maintenance</div>
            </div>
          </div>
        </div>

        <div className="report-content">
          <div className="data-table">
            <div className="table-header">
              <h4><FaCar /> Vehicle Status Overview</h4>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>VIN</th>
                  <th>Status</th>
                  <th>Mileage</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.vin}>
                    <td>
                      <div className="vehicle-info">
                        <FaCar className="vehicle-icon" />
                        {vehicle.make} {vehicle.model}
                      </div>
                    </td>
                    <td className="monospace">{vehicle.vin}</td>
                    <td>
                      <span className="status-badge" style={{ 
                        backgroundColor: statusColors[vehicle.status] || '#666' 
                      }}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.mileage?.toLocaleString() || 0} km</td>
                    <td>{vehicle.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-stats" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="stat-item">
              <span className="stat-label">Total Mileage</span>
              <span className="stat-value">{reports.totalMileage.toLocaleString()} km</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Mileage</span>
              <span className="stat-value">{reports.averageMileage.toLocaleString()} km</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Utilization Rate</span>
              <span className="stat-value">{vehicles.length ? Math.round((reports.inUseCount / vehicles.length) * 100) : 0}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Availability Rate</span>
              <span className="stat-value">{vehicles.length ? Math.round((reports.availableCount / vehicles.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}