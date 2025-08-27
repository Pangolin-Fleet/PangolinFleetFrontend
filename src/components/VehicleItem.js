import React from "react";

export default function VehicleItem({
  vehicle,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  editVehicleId,
  setEditVehicleId,
  animatedId
}) {
  const isAnimating = animatedId === vehicle.id;

  return (
    <div
      className={`vehicle-card ${isAnimating ? "animating" : ""}`}
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
        background: "#fff"
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>{vehicle.name}</h3>
      <p style={{ margin: "4px 0" }}><strong>VIN:</strong> {vehicle.vin}</p>
      <p style={{ margin: "4px 0" }}><strong>Driver:</strong> {vehicle.driver}</p>
      <p style={{ margin: "4px 0" }}><strong>Mileage:</strong> {vehicle.mileage}</p>
      <p style={{ margin: "4px 0" }}><strong>Description:</strong> {vehicle.description}</p>

      {/* Status Dropdown */}
      <div style={{ marginTop: "10px" }}>
        <label htmlFor={`status-${vehicle.id}`} style={{ marginRight: "8px" }}>Status:</label>
        <select
          id={`status-${vehicle.id}`}
          value={vehicle.status}
          onChange={(e) => updateStatus(vehicle.id, e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => incrementMileage(vehicle.id, 10)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#3498db", color: "#fff", cursor: "pointer" }}
        >
          +10 Mileage
        </button>
        <button
          onClick={() => deleteVehicle(vehicle.id)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
