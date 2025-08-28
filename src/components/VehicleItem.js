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

  return (
    <div
      className={`vehicle-card ${isAnimating ? "animating" : ""} ${theme === "dark" ? "dark-card" : ""}`}
      style={{
        border: `2px solid ${statusColor[vehicle.status]}`,
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
        background: theme === "dark" ? "#1e1e1e" : "#fff",
        color: theme === "dark" ? "#eee" : "#000"
      }}
    >
      <h3>{vehicle.name}</h3>
      <p><strong>VIN:</strong> {vehicle.vin}</p>
      <p><strong>Driver:</strong> {vehicle.driver}</p>
      <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
      <p><strong>Description:</strong> {vehicle.description}</p>
      {vehicle.destination && <p><strong>Destination:</strong> {vehicle.destination}</p>}

      <div className="status-section">
        <label>Status:</label>
        <select
          value={vehicle.status}
          onChange={(e) => updateStatus(vehicle.id, e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", width: "100%" }}
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>
      </div>

      <div className="card-buttons">
        <button onClick={() => incrementMileage(vehicle.id, 10)}>+10 km</button>
        <button className="delete-btn" onClick={() => deleteVehicle(vehicle.id)}>Delete</button>
      </div>
    </div>
  );
}
