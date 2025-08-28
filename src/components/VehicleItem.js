import React from "react";

export function VehicleItem({
  vehicle,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  editVehicleId,
  setEditVehicleId,
  animatedId,
  theme
}) {
  const isAnimating = animatedId === vehicle.id;

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

  const buttonStyle = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    flexGrow: 1,
    transition: "all 0.2s",
  };

  const incrementButtonStyle = {
    ...buttonStyle,
    background: "#3498db",
    color: "#fff",
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: "#e74c3c",
    color: "#fff",
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: "#f1c40f",
    color: "#000",
  };

  return (
    <div
      className={`vehicle-card ${isAnimating ? "animating" : ""} ${theme === "dark" ? "dark-card" : ""}`}
      style={{
        border: `4px solid ${statusColor[vehicle.status]}`,
        padding: "25px 35px",
        borderRadius: "16px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        transition: "transform 0.2s",
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
      {/* Vehicle Basic Info */}
      <div style={innerCardStyle}>
        <h3 style={{ margin: "0 0 8px 0" }}>{vehicle.name}</h3>
        <p><strong>VIN:</strong> {vehicle.vin}</p>
        <p><strong>Driver:</strong> {vehicle.driver}</p>
      </div>

      {/* Vehicle Details */}
      <div style={innerCardStyle}>
        <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
        <p><strong>Description:</strong> {vehicle.description}</p>
        {vehicle.destination && <p><strong>Destination:</strong> {vehicle.destination}</p>}
      </div>

      {/* Status Section */}
      <div style={innerCardStyle}>
        <label>Status:</label>
        <select
          value={vehicle.status}
          onChange={(e) => updateStatus(vehicle.id, e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "100%" }}
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>
      </div>

      {/* Buttons */}
      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginTop: "12px"
      }}>
        <button style={incrementButtonStyle} onClick={() => incrementMileage(vehicle.id, 10)}>+10 km</button>
        <button style={deleteButtonStyle} onClick={() => deleteVehicle(vehicle.id)}>Delete</button>
        <button style={editButtonStyle} onClick={() => setEditVehicleId(vehicle.id)}>
          {editVehicleId === vehicle.id ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
}
