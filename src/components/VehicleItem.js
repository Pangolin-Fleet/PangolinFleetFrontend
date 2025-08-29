import React from "react";

export function VehicleItem({ vehicle, theme }) {
  const statusColor = {
    "Available": "#27ae60",
    "In Use": "#7f8c8d",
    "In Maintenance": "#e67e22"
  };

  const innerCardStyle = {
    padding: "14px 18px",
    borderRadius: "8px",
    background: theme === "dark" ? "#2b2b2b" : "#fefefe",
    border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
    boxShadow: theme === "dark" ? "0 1px 6px rgba(0,0,0,0.6)" : "0 1px 6px rgba(0,0,0,0.15)",
    marginBottom: "12px",
    width: "100%",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        border: `4px solid ${statusColor[vehicle.status]}`,
        padding: "25px 35px",
        borderRadius: "16px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        background: theme === "dark" ? "#1e1e1e" : "#fff",
        color: theme === "dark" ? "#eee" : "#000",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        minWidth: "350px",
        flexGrow: 1
      }}
    >
      <div style={innerCardStyle}>
        <h3 style={{ margin: "0 0 8px 0" }}>{vehicle.name}</h3>
        <p><strong>VIN:</strong> {vehicle.vin}</p>
        <p><strong>Driver:</strong> {vehicle.driver}</p>
      </div>

      <div style={innerCardStyle}>
        <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
        <p><strong>Description:</strong> {vehicle.description}</p>
        {vehicle.destination && <p><strong>Destination:</strong> {vehicle.destination}</p>}
      </div>

      <div style={innerCardStyle}>
        <label>Status:</label>
        <p>{vehicle.status}</p>
      </div>
    </div>
  );
}
