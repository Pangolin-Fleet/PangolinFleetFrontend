import React, { useState, useEffect } from "react";
import {
  FaCar,
  FaTools,
  FaMoneyBillWave,
  FaGasPump,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaTachometerAlt,
  FaUser,
  FaClock
} from "react-icons/fa";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage({ vehicles, maintenances }) {
  const [timeRange, setTimeRange] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({});

  // Calculate analytics data
  useEffect(() => {
    const calculateAnalytics = () => {
      setIsLoading(true);
      
      // Mock data for demonstration - replace with real calculations
      const data = {
        // Summary KPIs
        totalFleetValue: vehicles.reduce((sum, v) => sum + (v.value || 50000), 0),
        averageVehicleAge: new Date().getFullYear() - (vehicles.reduce((sum, v) => sum + (v.year || 2020), 0) / vehicles.length),
        totalMaintenanceCost: maintenances.reduce((sum, m) => sum + (m.cost || 0), 0),
        totalFuelCost: vehicles.reduce((sum, v) => sum + (v.fuelCost || 500), 0),
        
        // Vehicle status distribution
        statusDistribution: {
          Available: vehicles.filter(v => v.status === "Available").length,
          "In Use": vehicles.filter(v => v.status === "In Use").length,
          Maintenance: vehicles.filter(v => v.status === "In Maintenance").length
        },
        
        // Maintenance trends
        maintenanceTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [1200, 1900, 1500, 2200, 1800, 2500]
        },
        
        // Fuel efficiency
        fuelEfficiency: vehicles.map(v => ({
          label: `${v.make} ${v.model}`,
          efficiency: (v.mileage / (v.fuelUsed || 1000)) || 8.5
        })),
        
        // Utilization rates
        utilization: {
          labels: vehicles.map(v => `${v.make} ${v.model}`.substring(0, 10)),
          data: vehicles.map(v => Math.random() * 100)
        }
      };
      
      setAnalyticsData(data);
      setIsLoading(false);
    };

    calculateAnalytics();
  }, [vehicles, maintenances, timeRange]);

  // Chart configurations
  const maintenanceTrendsConfig = {
    labels: analyticsData.maintenanceTrends?.labels || [],
    datasets: [
      {
        label: 'Maintenance Cost (R)',
        data: analyticsData.maintenanceTrends?.data || [],
        borderColor: 'rgb(0, 188, 212)',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const statusDistributionConfig = {
    labels: Object.keys(analyticsData.statusDistribution || {}),
    datasets: [
      {
        data: Object.values(analyticsData.statusDistribution || {}),
        backgroundColor: [
          'rgba(39, 174, 96, 0.8)',
          'rgba(255, 109, 0, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          'rgb(39, 174, 96)',
          'rgb(255, 109, 0)',
          'rgb(231, 76, 60)'
        ],
        borderWidth: 2
      }
    ]
  };

  const fuelEfficiencyConfig = {
    labels: analyticsData.fuelEfficiency?.map(v => v.label) || [],
    datasets: [
      {
        label: 'Fuel Efficiency (km/L)',
        data: analyticsData.fuelEfficiency?.map(v => v.efficiency) || [],
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgb(52, 152, 219)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Crunching numbers...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="page-header">
        <h1>Pangolin Fleet Analytics</h1>
        <p>Real-time insights and performance metrics</p>
      </div>

      {/* Time Range Filter */}
      <div className="filter-bar">
        <div className="time-filter">
          <FaCalendarAlt className="filter-icon" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <button className="btn-primary">
          <FaDownload /> Export Report
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}>
            <FaCar />
          </div>
          <div className="kpi-content">
            <h3>R {analyticsData.totalFleetValue?.toLocaleString()}</h3>
            <p>Total Fleet Value</p>
            <span className="kpi-trend positive">+12%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
            <FaTachometerAlt />
          </div>
          <div className="kpi-content">
            <h3>{analyticsData.averageVehicleAge?.toFixed(1)} years</h3>
            <p>Average Vehicle Age</p>
            <span className="kpi-trend neutral">±0%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
            <FaTools />
          </div>
          <div className="kpi-content">
            <h3>R {analyticsData.totalMaintenanceCost?.toLocaleString()}</h3>
            <p>Maintenance Costs</p>
            <span className="kpi-trend negative">-5%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
            <FaGasPump />
          </div>
          <div className="kpi-content">
            <h3>R {analyticsData.totalFuelCost?.toLocaleString()}</h3>
            <p>Fuel Costs</p>
            <span className="kpi-trend positive">+8%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Maintenance Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Maintenance Cost Trends</h3>
          </div>
          <div className="chart-container">
            <Line data={maintenanceTrendsConfig} options={chartOptions} />
          </div>
        </div>

        {/* Vehicle Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>Vehicle Status Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={statusDistributionConfig} options={chartOptions} />
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="chart-card">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>Fuel Efficiency by Vehicle</h3>
          </div>
          <div className="chart-container">
            <Bar data={fuelEfficiencyConfig} options={chartOptions} />
          </div>
        </div>

        {/* Utilization Rates */}
        <div className="chart-card">
          <div className="chart-header">
            <FaUser className="chart-icon" />
            <h3>Vehicle Utilization Rates</h3>
          </div>
          <div className="chart-container">
            <Bar data={{
              labels: analyticsData.utilization?.labels || [],
              datasets: [{
                label: 'Utilization %',
                data: analyticsData.utilization?.data || [],
                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                borderColor: 'rgb(46, 204, 113)',
                borderWidth: 2
              }]
            }} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h2>📈 Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-card positive">
            <h4>🚀 Excellent Fuel Efficiency</h4>
            <p>Your fleet is performing 15% better than industry average on fuel consumption.</p>
          </div>
          <div className="insight-card warning">
            <h4>⚠️ Maintenance Alert</h4>
            <p>3 vehicles are due for service in the next 7 days.</p>
          </div>
          <div className="insight-card info">
            <h4>💡 Optimization Opportunity</h4>
            <p>Consider replacing 2 older vehicles to reduce maintenance costs by 25%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}