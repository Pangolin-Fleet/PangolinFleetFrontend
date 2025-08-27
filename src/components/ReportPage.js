import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ReportsPage({ vehicles }) {
  // Count vehicles by status
  const statusCounts = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: "Available", value: statusCounts["Available"] || 0 },
    { name: "In Use", value: statusCounts["In Use"] || 0 },
    { name: "In Maintenance", value: statusCounts["In Maintenance"] || 0 }
  ];

  const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"]; // green, yellow, red

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "30px" }}>
      <h2>Fleet Report</h2>

      {/* Pie Chart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Vehicle Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>VIN</th>
              <th style={thStyle}>Driver</th>
              <th style={thStyle}>Mileage</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{v.name}</td>
                <td style={tdStyle}>{v.vin}</td>
                <td style={tdStyle}>{v.driver}</td>
                <td style={tdStyle}>{v.mileage}</td>
                <td style={{ ...tdStyle, color: statusColor(v.status), fontWeight: "bold" }}>{v.status}</td>
                <td style={tdStyle}>{v.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper styles
const thStyle = { textAlign: "left", padding: "10px", background: "#f7f7f7" };
const tdStyle = { padding: "10px" };

function statusColor(status) {
  switch (status) {
    case "Available":
      return "#2ecc71"; // green
    case "In Use":
      return "#f1c40f"; // yellow
    case "In Maintenance":
      return "#e74c3c"; // red
    default:
      return "#333";
  }
}
