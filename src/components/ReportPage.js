import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import vehicleService from "../service/VehicleService";
import maintenanceService from "../service/MaintenanceService";
import "../AppStyles.css";

export default function ReportPage({ darkMode }) {
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [pieFilter, setPieFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "serviceDate", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const severityColors = {
    Low: "#2ecc71",
    Medium: "#f1c40f",
    High: "#e67e22",
    Critical: "#e74c3c"
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const v = await vehicleService.getAllVehicles() || [];
        const m = await maintenanceService.getAllMaintenance() || [];
        setVehicles(v);
        setFilteredVehicles(v);
        setMaintenances(m);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Filter vehicles based on pie chart selection
  useEffect(() => {
    setFilteredVehicles(
      pieFilter
        ? vehicles.filter(v => v.status?.toLowerCase() === pieFilter.toLowerCase())
        : vehicles
    );
  }, [vehicles, pieFilter]);

  const handlePieClick = (data) => setPieFilter(data.name === pieFilter ? null : data.name);

  const statusCounts = {
    Available: vehicles.filter(v => v.status?.toLowerCase() === "available").length,
    "In Use": vehicles.filter(v => v.status?.toLowerCase() === "in use").length,
    Maintenance: vehicles.filter(v => v.status?.toLowerCase() === "in maintenance").length
  };

  const totalVehicles = vehicles.length;

  const summaryCards = [
    { label: "Total Vehicles", value: totalVehicles, color: "#34495e", trend: vehicles.map(v => v.mileage || 0) },
    { label: "Available", value: statusCounts.Available, color: "#27ae60", trend: vehicles.filter(v => v.status?.toLowerCase() === "available").map(v => v.mileage || 0) },
    { label: "In Use", value: statusCounts["In Use"], color: "#2980b9", trend: vehicles.filter(v => v.status?.toLowerCase() === "in use").map(v => v.mileage || 0) },
    { label: "Maintenance", value: statusCounts.Maintenance, color: "#f39c12", trend: vehicles.filter(v => v.status?.toLowerCase() === "in maintenance").map(v => v.mileage || 0) }
  ];

  const pieData = [
    { name: "Available", value: statusCounts.Available },
    { name: "In Use", value: statusCounts["In Use"] },
    { name: "Maintenance", value: statusCounts.Maintenance }
  ];

  const pieColors = ["#27ae60", "#2980b9", "#f39c12"];
  const barData = vehicles.map(v => ({ name: v.name, mileage: v.mileage || 0 }));

  const formatElapsed = (dateStr) => {
    if (!dateStr) return "-";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}h ${minutes}m ${seconds}s ago`;
  };

  const sortedMaintenances = [...maintenances]
    .filter(m => 
      m.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.problem?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = sortedMaintenances.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedMaintenances.length / rowsPerPage);

  const requestSort = key => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortArrow = key => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? " ↑" : " ↓";
    return "";
  };

  return (
    <div className={`report-page ${darkMode ? "dark" : ""}`}>
      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="summary-card" style={{ background: card.color }}>
            <div className="summary-value">{card.value}</div>
            <div className="summary-label">{card.label}</div>
            {card.trend.length > 0 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={card.trend.map((m, i) => ({ idx: i, value: m }))}>
                  <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-box">
          <h3>Vehicle Status</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                onClick={handlePieClick}
                cursor="pointer"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} opacity={pieFilter && pieFilter !== entry.name ? 0.4 : 1} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Mileage per Vehicle</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mileage" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Cards */}
      <div className="vehicle-cards">
        {filteredVehicles.map(vehicle => {
          const mileagePercent = vehicle.maxMileage ? (vehicle.mileage / vehicle.maxMileage) * 100 : 0;
          const bgColor = mileagePercent > 90 ? "#e74c3c" : mileagePercent > 70 ? "#f39c12" : "#27ae60";

          return (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-card-header">
                <span>{vehicle.name}</span>
                <span className={`vehicle-status ${vehicle.status?.toLowerCase().replace(/\s/g,'')}`}>{vehicle.status}</span>
              </div>
              <div className="vehicle-card-info">
                <div><strong>ID:</strong> {vehicle.id}</div>
                <div><strong>Mileage:</strong> {vehicle.mileage}</div>
                <div><strong>Destination / Issue:</strong> {vehicle.destination || vehicle.issue || "-"}</div>
                <div className="small-text"><strong>Created:</strong> {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : "-"}</div>
                <div className="small-text"><strong>Updated:</strong> {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleString() : "-"} ({formatElapsed(vehicle.updatedAt)})</div>
              </div>
              {vehicle.maxMileage && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, mileagePercent)}%`, background: bgColor }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Maintenance Table */}
      <div className="maintenance-section">
        <h3>📜 Maintenance History</h3>
        <input 
          type="text"
          placeholder="Search by vehicle or problem..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {["vehicle", "severity", "problem", "mileage", "mechanic", "cost", "serviceDate"].map(key => (
                  <th key={key} onClick={() => requestSort(key)}>
                    {key}{getSortArrow(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map(m => (
                <tr key={m.id}>
                  <td>{m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}` : "N/A"}</td>
                  <td><span className={`severity ${m.severity}`}>{m.severity || "-"}</span></td>
                  <td>{m.problem || "-"}</td>
                  <td>{m.mileage ?? "-"}</td>
                  <td>{m.mechanic || "-"}</td>
                  <td>{m.cost ?? "-"}</td>
                  <td>{m.serviceDate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} rows</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
