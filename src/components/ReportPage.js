import React, { useState, useMemo } from "react";
import {
  FaFileAlt, FaChartBar, FaCar, FaTools, FaCheckCircle,
  FaMoneyBillWave, FaRoad, FaCalendarAlt, FaDownload,
  FaArrowUp, FaArrowDown, FaFilter, FaGasPump,
  FaWrench, FaExclamationTriangle, FaHistory,
  FaUsers, FaTachometerAlt
} from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "./ReportPage.css";

export default function ReportsPage({ vehicles = [], activityLog = [] }) {
  const [exportLoading, setExportLoading] = useState(false);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!vehicles.length) {
      return getEmptyAnalytics();
    }

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
    const maintenanceRate = vehicles.length ? Math.round((maintenanceCount / vehicles.length) * 100) : 0;

    const maintenanceCost = maintenanceCount * 1250;
    const fuelCost = totalMileage * 0.15;
    const totalCost = maintenanceCost + fuelCost;

    const highMileageVehicles = vehicles
      .filter(v => v.mileage > 30000)
      .sort((a, b) => b.mileage - a.mileage)
      .slice(0, 6);

    const statusData = [
      { name: 'Available', value: availableCount, color: '#10b981' },
      { name: 'In Use', value: inUseCount, color: '#f59e0b' },
      { name: 'Maintenance', value: maintenanceCount, color: '#ef4444' }
    ];

    const mileageData = vehicles
      .sort((a, b) => (b.mileage || 0) - (a.mileage || 0))
      .slice(0, 6)
      .map(vehicle => ({
        name: `${vehicle.make} ${vehicle.model}`.substring(0, 12),
        mileage: vehicle.mileage || 0,
        utilization: Math.min(100, Math.round(((vehicle.mileage || 0) / 50000) * 100))
      }));

    const monthlyData = generateMonthlyData(vehicles, activityLog, totalMileage, totalCost);

    return {
      totalVehicles: vehicles.length,
      availableCount,
      inUseCount,
      maintenanceCount,
      totalMileage,
      utilizationRate,
      availabilityRate,
      maintenanceRate,
      maintenanceCost,
      fuelCost,
      totalCost,
      highMileageVehicles,
      averageMileage: vehicles.length ? Math.round(totalMileage / vehicles.length) : 0,
      statusData,
      mileageData,
      monthlyData,
      averageVehicleAge: calculateAverageAge(vehicles),
      totalFuelCost: fuelCost,
      maintenanceVehicles: maintenanceCount
    };
  }, [vehicles, activityLog]);

  function generateMonthlyData(vehicles, activityLog, totalMileage, totalCost) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthActivities = activityLog.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate.getMonth() === index;
      });
      
      const monthlyMileage = Math.round(totalMileage * (0.8 + Math.random() * 0.4) / (currentMonth + 1));
      const monthlyCost = Math.round(totalCost * (0.8 + Math.random() * 0.4) / (currentMonth + 1));
      
      return {
        month,
        vehicles: Math.max(vehicles.length - 2 + Math.floor(Math.random() * 5), 1),
        mileage: monthlyMileage,
        cost: monthlyCost,
        activities: monthActivities.length
      };
    });
  }

  function calculateAverageAge(vehicles) {
    if (!vehicles.length) return 0;
    const currentYear = new Date().getFullYear();
    const totalAge = vehicles.reduce((sum, vehicle) => sum + (currentYear - (vehicle.year || currentYear)), 0);
    return Math.round(totalAge / vehicles.length);
  }

  function getEmptyAnalytics() {
    return {
      totalVehicles: 0,
      availableCount: 0,
      inUseCount: 0,
      maintenanceCount: 0,
      totalMileage: 0,
      utilizationRate: 0,
      availabilityRate: 0,
      maintenanceRate: 0,
      maintenanceCost: 0,
      fuelCost: 0,
      totalCost: 0,
      highMileageVehicles: [],
      averageMileage: 0,
      averageVehicleAge: 0,
      statusData: [
        { name: 'Available', value: 0, color: '#10b981' },
        { name: 'In Use', value: 0, color: '#f59e0b' },
        { name: 'Maintenance', value: 0, color: '#ef4444' }
      ],
      mileageData: [],
      monthlyData: []
    };
  }

  const recentActivities = useMemo(() => {
    return activityLog
      .slice(0, 5)
      .map(activity => ({
        ...activity,
        time: new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(activity.timestamp).toLocaleDateString()
      }));
  }, [activityLog]);

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (format === 'csv') {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Metric,Value\n"
          + `Total Vehicles,${analytics.totalVehicles}\n`
          + `Available Vehicles,${analytics.availableCount}\n`
          + `Vehicles In Use,${analytics.inUseCount}\n`
          + `Maintenance Vehicles,${analytics.maintenanceCount}\n`
          + `Total Mileage,${analytics.totalMileage}\n`
          + `Average Mileage,${analytics.averageMileage}\n`
          + `Utilization Rate,${analytics.utilizationRate}%\n`
          + `Availability Rate,${analytics.availabilityRate}%\n`
          + `Maintenance Rate,${analytics.maintenanceRate}%\n`
          + `Total Operational Cost,R ${analytics.totalCost.toLocaleString()}\n`
          + `Maintenance Cost,R ${analytics.maintenanceCost.toLocaleString()}\n`
          + `Fuel Cost,R ${analytics.fuelCost.toLocaleString()}\n`
          + `Average Vehicle Age,${analytics.averageVehicleAge} years`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fleet-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.dataKey === 'cost' || entry.dataKey === 'maintenanceCost' || entry.dataKey === 'fuelCost' ? ' R' : ''}
              {entry.dataKey === 'mileage' ? ' km' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!vehicles.length) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaChartBar className="header-icon" />
              Fleet Analytics
            </h1>
            <p>Comprehensive fleet performance insights</p>
          </div>
        </div>
        <div className="page-content">
          <div className="no-data">
            <FaChartBar />
            <h3>No Vehicle Data Available</h3>
            <p>Add vehicles to your fleet to see analytics and reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <FaChartBar className="header-icon" />
              Fleet Analytics
            </h1>
            <p>Real-time insights based on {analytics.totalVehicles} vehicles</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-export"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
            >
              <FaDownload /> 
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <div className="report-info">
              Generated: {new Date().toLocaleDateString()} 
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Key Metrics */}
        <div className="metrics-section">
          <h2 className="section-title">Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon utilization">
                <FaCar />
              </div>
              <div className="metric-content">
                <h3>Utilization</h3>
                <div className="metric-value">{analytics.utilizationRate}%</div>
                <div className="metric-description">
                  {analytics.inUseCount} of {analytics.totalVehicles} vehicles active
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon availability">
                <FaCheckCircle />
              </div>
              <div className="metric-content">
                <h3>Availability</h3>
                <div className="metric-value">{analytics.availabilityRate}%</div>
                <div className="metric-description">
                  {analytics.availableCount} vehicles ready
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon maintenance">
                <FaWrench />
              </div>
              <div className="metric-content">
                <h3>Maintenance</h3>
                <div className="metric-value">{analytics.maintenanceCount}</div>
                <div className="metric-description">
                  Vehicles in maintenance
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon mileage">
                <FaRoad />
              </div>
              <div className="metric-content">
                <h3>Total Distance</h3>
                <div className="metric-value">{(analytics.totalMileage / 1000).toFixed(1)}K km</div>
                <div className="metric-description">
                  Avg: {analytics.averageMileage?.toLocaleString()} km
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <h2 className="section-title">Performance Overview</h2>
          <div className="charts-grid">
            {/* Fleet Status */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Fleet Status</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Monthly Trends</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="vehicles" 
                      stroke="#00d4ff" 
                      strokeWidth={2}
                      name="Active Vehicles"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mileage" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Mileage (km)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Mileage */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Vehicles by Mileage</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.mileageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mileage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Cost Breakdown</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Maintenance', cost: analytics.maintenanceCost, fill: '#ef4444' },
                    { name: 'Fuel', cost: analytics.fuelCost, fill: '#f59e0b' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Cost']} />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="data-section">
          <div className="data-grid">
            {/* Recent Activity */}
            <div className="data-card">
              <div className="card-header">
                <h3>
                  <FaHistory />
                  Recent Activity
                </h3>
              </div>
              <div className="activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'maintenance' ? <FaWrench /> : 
                         activity.type === 'vehicle' ? <FaCar /> : <FaFileAlt />}
                      </div>
                      <div className="activity-content">
                        <div className="activity-message">{activity.action}</div>
                        <div className="activity-meta">
                          <span>{activity.time}</span>
                          {activity.user && <span>by {activity.user}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* High Mileage Vehicles */}
            <div className="data-card">
              <div className="card-header">
                <h3>
                  <FaExclamationTriangle />
                  High Mileage Vehicles
                </h3>
              </div>
              <div className="vehicle-list">
                {analytics.highMileageVehicles.length > 0 ? (
                  analytics.highMileageVehicles.map(vehicle => (
                    <div key={vehicle.vin} className="vehicle-item">
                      <div className="vehicle-info">
                        <div className="vehicle-name">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="vehicle-details">
                          {vehicle.year} • {vehicle.vin.slice(-6)}
                        </div>
                      </div>
                      <div className="vehicle-mileage">
                        {vehicle.mileage?.toLocaleString()} km
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No high mileage vehicles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}