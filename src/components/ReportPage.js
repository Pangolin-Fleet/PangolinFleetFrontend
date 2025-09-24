import React, { useState } from "react";
import {
  FaFileAlt,
  FaCalendar,
  FaFilter,
  FaDownload,
  FaCar,
  FaTools,
  FaUser,
  FaMapMarkerAlt,
  FaRoad,
  FaClock
} from "react-icons/fa";
import "./ReportPage.css";

export default function ReportsPage({ vehicles = [], maintenances = [] }) {
  const [dateRange, setDateRange] = useState("all");
  const [reportType, setReportType] = useState("fleet");

  // Generate report data
  const generateFleetReport = () => {
    return {
      title: "Fleet Status Report",
      generated: new Date().toLocaleString(),
      summary: {
        totalVehicles: vehicles.length,
        available: vehicles.filter(v => v.status === "Available").length,
        inUse: vehicles.filter(v => v.status === "In Use").length,
        maintenance: vehicles.filter(v => v.status === "In Maintenance").length,
        totalMileage: vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0),
        avgMileage: vehicles.length ? Math.round(vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0) / vehicles.length) : 0
      },
      vehicles: vehicles.map(vehicle => ({
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage || 0,
        status: vehicle.status,
        driver: vehicle.driver || "Unassigned",
        lastUpdated: vehicle.updatedAt || "Unknown"
      }))
    };
  };

  const generateMaintenanceReport = () => {
    return {
      title: "Maintenance Log Report",
      generated: new Date().toLocaleString(),
      summary: {
        totalRecords: maintenances.length,
        totalCost: maintenances.reduce((sum, m) => sum + (m.cost || 0), 0),
        avgCost: maintenances.length ? Math.round(maintenances.reduce((sum, m) => sum + (m.cost || 0), 0) / maintenances.length) : 0,
        critical: maintenances.filter(m => m.severity === "Critical").length,
        highPriority: maintenances.filter(m => m.severity === "High").length
      },
      records: maintenances.map(maintenance => ({
        id: maintenance.id,
        vehicle: maintenance.vehicle ? `${maintenance.vehicle.make} ${maintenance.vehicle.model}` : "Unknown Vehicle",
        problem: maintenance.problem || "No description",
        severity: maintenance.severity || "Not specified",
        cost: maintenance.cost || 0,
        technician: maintenance.mechanic || "Not assigned",
        date: maintenance.serviceDate || "Unknown date",
        mileage: maintenance.mileage || "Not recorded"
      }))
    };
  };

  const generateActivityReport = () => {
    // Combine vehicle status changes and maintenance activities
    const activities = [];
    
    vehicles.forEach(vehicle => {
      if (vehicle.updatedAt) {
        activities.push({
          type: "STATUS_UPDATE",
          vehicle: `${vehicle.make} ${vehicle.model}`,
          description: `Status changed to ${vehicle.status}`,
          timestamp: vehicle.updatedAt,
          icon: <FaCar />
        });
      }
    });

    maintenances.forEach(maintenance => {
      activities.push({
        type: "MAINTENANCE",
        vehicle: maintenance.vehicle ? `${maintenance.vehicle.make} ${maintenance.vehicle.model}` : "Unknown Vehicle",
        description: `Maintenance: ${maintenance.problem || "No description"}`,
        timestamp: maintenance.serviceDate,
        severity: maintenance.severity,
        icon: <FaTools />
      });
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      title: "Activity Log Report",
      generated: new Date().toLocaleString(),
      summary: {
        totalActivities: activities.length,
        statusChanges: activities.filter(a => a.type === "STATUS_UPDATE").length,
        maintenanceActivities: activities.filter(a => a.type === "MAINTENANCE").length,
        lastActivity: activities.length ? activities[0].timestamp : "No activities"
      },
      activities: activities.slice(0, 50) // Last 50 activities
    };
  };

  const reports = {
    fleet: generateFleetReport(),
    maintenance: generateMaintenanceReport(),
    activity: generateActivityReport()
  };

  const currentReport = reports[reportType];

  const exportToCSV = () => {
    // Simple CSV export functionality
    let csvContent = "";
    
    if (reportType === "fleet") {
      csvContent = "VIN,Make,Model,Year,Mileage,Status,Driver,Last Updated\n";
      currentReport.vehicles.forEach(vehicle => {
        csvContent += `"${vehicle.vin}","${vehicle.make}","${vehicle.model}",${vehicle.year},${vehicle.mileage},"${vehicle.status}","${vehicle.driver}","${vehicle.lastUpdated}"\n`;
      });
    } else if (reportType === "maintenance") {
      csvContent = "Vehicle,Problem,Severity,Cost,Technician,Date,Mileage\n";
      currentReport.records.forEach(record => {
        csvContent += `"${record.vehicle}","${record.problem}","${record.severity}",${record.cost},"${record.technician}","${record.date}",${record.mileage}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pangolin-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <FaFileAlt className="header-icon" />
          <div>
            <h1>Pangolin Fleet Reports</h1>
            <p>System generated reports and activity logs</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={exportToCSV}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="report-controls">
        <div className="control-group">
          <label><FaFilter /> Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="fleet">Fleet Status Report</option>
            <option value="maintenance">Maintenance Log</option>
            <option value="activity">Activity Timeline</option>
          </select>
        </div>

        <div className="control-group">
          <label><FaCalendar /> Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="month">Last 30 Days</option>
            <option value="week">Last 7 Days</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {/* Report Summary */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>{currentReport.title}</h3>
          <p>Generated: {currentReport.generated}</p>
          <div className="summary-stats">
            {Object.entries(currentReport.summary).map(([key, value]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {reportType === "fleet" && (
          <div className="data-table">
            <div className="table-header">
              <h4>Fleet Inventory</h4>
              <span>{currentReport.vehicles.length} vehicles</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>VIN</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>Status</th>
                  <th>Driver</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.vehicles.map((vehicle, index) => (
                  <tr key={vehicle.vin || index}>
                    <td>
                      <div className="vehicle-info">
                        <FaCar className="vehicle-icon" />
                        <span>{vehicle.make} {vehicle.model}</span>
                      </div>
                    </td>
                    <td className="monospace">{vehicle.vin}</td>
                    <td>{vehicle.year}</td>
                    <td>{vehicle.mileage.toLocaleString()} km</td>
                    <td>
                      <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.driver}</td>
                    <td>{vehicle.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "maintenance" && (
          <div className="data-table">
            <div className="table-header">
              <h4>Maintenance Records</h4>
              <span>{currentReport.records.length} records</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Problem Description</th>
                  <th>Severity</th>
                  <th>Cost (R)</th>
                  <th>Technician</th>
                  <th>Date</th>
                  <th>Mileage</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.records.map((record, index) => (
                  <tr key={record.id || index}>
                    <td>
                      <div className="vehicle-info">
                        <FaCar className="vehicle-icon" />
                        <span>{record.vehicle}</span>
                      </div>
                    </td>
                    <td className="problem-cell">{record.problem}</td>
                    <td>
                      <span className={`severity-badge severity-${record.severity.toLowerCase()}`}>
                        {record.severity}
                      </span>
                    </td>
                    <td className="cost-cell">R {record.cost.toLocaleString()}</td>
                    <td>{record.technician}</td>
                    <td>{record.date}</td>
                    <td>{record.mileage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "activity" && (
          <div className="activity-timeline">
            <div className="table-header">
              <h4>System Activity Timeline</h4>
              <span>{currentReport.activities.length} activities</span>
            </div>
            <div className="timeline">
              {currentReport.activities.map((activity, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-icon">
                    {activity.icon}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="activity-vehicle">{activity.vehicle}</span>
                      <span className="activity-time">{activity.timestamp}</span>
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    {activity.severity && (
                      <span className={`severity-tag severity-${activity.severity.toLowerCase()}`}>
                        {activity.severity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Footer */}
      <div className="report-footer">
        <p>Report generated by Pangolin Fleet Management System</p>
        <p>Confidential - For internal use only</p>
      </div>
    </div>
  );
}