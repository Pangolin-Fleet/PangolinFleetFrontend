import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function ReportPage({ vehicles, darkMode }) {

  // Status summary
  const statusCounts = {
    "Available": vehicles.filter(v => v.status === "Available").length,
    "In Use": vehicles.filter(v => v.status === "In Use").length,
    "In Maintenance": vehicles.filter(v => v.status === "In Maintenance").length
  };

  const totalVehicles = vehicles.length;

  const summaryCards = [
    { label: "Total Vehicles", value: totalVehicles, color: "#34495e" },
    { label: "Available", value: statusCounts["Available"], color: "#27ae60" },
    { label: "In Use", value: statusCounts["In Use"], color: "#2980b9" },
    { label: "Maintenance", value: statusCounts["In Maintenance"], color: "#f39c12" }
  ];

  // Pie chart data
  const pieData = [
    { name: "Available", value: statusCounts["Available"] },
    { name: "In Use", value: statusCounts["In Use"] },
    { name: "Maintenance", value: statusCounts["In Maintenance"] }
  ];

  const pieColors = ["#27ae60", "#2980b9", "#f39c12"];

  // Bar chart data
  const barData = vehicles.map(v => ({ name: v.name, mileage: v.mileage }));

  return (
    <div style={{ padding: "20px" }}>
      {/* Summary Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        {summaryCards.map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 calc(25% - 16px)",
            padding: "20px",
            borderRadius: "16px",
            background: card.color,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            minWidth: "150px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)",
            cursor: "default",
            transition: "transform 0.2s"
          }}>
            <div style={{ fontSize: "28px", fontWeight: "700" }}>{card.value}</div>
            <div style={{ fontSize: "16px", opacity: 0.9 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        {/* Pie Chart */}
        <div style={{ flex: "1 1 300px", height: "300px", background: darkMode ? "#1f1f1f" : "#fff", borderRadius: "16px", padding: "16px", boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "12px", color: darkMode ? "#fff" : "#000" }}>Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{ flex: "1 1 400px", height: "300px", background: darkMode ? "#1f1f1f" : "#fff", borderRadius: "16px", padding: "16px", boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "12px", color: darkMode ? "#fff" : "#000" }}>Mileage per Vehicle</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
              <YAxis stroke={darkMode ? "#fff" : "#000"} />
              <Tooltip />
              <Bar dataKey="mileage" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle List as cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {vehicles.map(vehicle => (
          <div key={vehicle.id} style={{
            borderRadius: "20px",
            overflow: "hidden",
            background: darkMode ? "#1f1f1f" : "#fff",
            boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.7)" : "0 10px 25px rgba(0,0,0,0.2)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{
              background: vehicle.status === "In Use"
                ? "linear-gradient(135deg, #2980b9, #6dd5fa)"
                : vehicle.status === "Available"
                ? "linear-gradient(135deg, #27ae60, #2ecc71)"
                : "linear-gradient(135deg, #f39c12, #f1c40f)",
              padding: "12px 16px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "16px",
              borderRadius: "12px"
            }}>
              {vehicle.name} - {vehicle.status}
            </div>
            <div><strong>ID:</strong> {vehicle.id}</div>
            <div><strong>Mileage:</strong> {vehicle.mileage}</div>
            <div><strong>Destination / Issue:</strong> {vehicle.destination || vehicle.issue || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
