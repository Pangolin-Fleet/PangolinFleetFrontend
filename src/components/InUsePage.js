import React, { useState } from "react";
import { FaMapMarkerAlt, FaArrowRight, FaCheck, FaUndo } from "react-icons/fa";

export default function InUsePage({
  vehicles,
  saveDestination,
  updateStatus,
  incrementMileage,
  editVehicleId,
  setEditVehicleId,
  darkMode
}) {
  const [destinationInputs, setDestinationInputs] = useState({});

  const handleDestinationChange = (id, value) => {
    setDestinationInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = (vehicle) => {
    const destination = destinationInputs[vehicle.id];
    if (destination) {
      saveDestination(vehicle.id, destination);
    }
    setEditVehicleId(null); // exit edit mode
  };

  const toggleStatus = (vehicle) => {
    const newStatus = vehicle.status === "In Use" ? "Available" : "In Use";
    updateStatus(vehicle.id, newStatus, newStatus === "Available" ? { destination: "" } : {});
  };

  const cardStyle = (vehicle) => ({
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
    background: darkMode ? "#1f1f1f" : "#fff",
    boxShadow: darkMode
      ? "0 10px 25px rgba(0,0,0,0.7)"
      : "0 10px 25px rgba(0,0,0,0.2)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer"
  });

  const headerStyle = (status) => ({
    background: status === "In Use"
      ? "linear-gradient(135deg, #2980b9, #6dd5fa)"
      : "linear-gradient(135deg, #27ae60, #2ecc71)",
    padding: "20px",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  });

  const buttonStyle = (bg, color = "#fff") => ({
    padding: "10px",
    borderRadius: "8px",
    background: bg,
    color,
    fontWeight: "600",
    cursor: "pointer",
    flex: 1,
    border: "none"
  });

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "24px",
      padding: "24px"
    }}>
      {vehicles.map(vehicle => (
        <div
          key={vehicle.id}
          style={cardStyle(vehicle)}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 15px 35px rgba(0,0,0,0.8)"
              : "0 15px 35px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 10px 25px rgba(0,0,0,0.7)"
              : "0 10px 25px rgba(0,0,0,0.2)";
          }}
        >
          {/* Header */}
          <div style={headerStyle(vehicle.status)}>
            <span>{vehicle.name}</span>
            <span>{vehicle.status}</span>
          </div>

          {/* Vehicle Info */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p><strong>VIN:</strong> {vehicle.vin}</p>
            <p><strong>Driver:</strong> {vehicle.driver}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
            <p><strong>Description:</strong> {vehicle.description}</p>

            {/* Destination */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt style={{ color: "#3498db" }} />
                {editVehicleId === vehicle.id ? (
                  <input
                    type="text"
                    placeholder="Enter Destination..."
                    value={destinationInputs[vehicle.id] || vehicle.destination || ""}
                    onChange={e => handleDestinationChange(vehicle.id, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      background: darkMode ? "#2c2c2c" : "#f2f2f2",
                      color: darkMode ? "#fff" : "#000",
                      outline: "none"
                    }}
                  />
                ) : (
                  <span>{vehicle.destination || "No destination"}</span>
                )}
              </div>

              {editVehicleId === vehicle.id ? (
                <button
                  onClick={() => handleSave(vehicle)}
                  style={buttonStyle("#3498db")}
                >
                  <FaArrowRight /> Save
                </button>
              ) : (
                <button
                  onClick={() => setEditVehicleId(vehicle.id)}
                  style={buttonStyle("#f1c40f", "#000")}
                >
                  Edit
                </button>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => toggleStatus(vehicle)}
                style={buttonStyle(vehicle.status === "In Use" ? "#e74c3c" : "#27ae60")}
              >
                {vehicle.status === "In Use" ? <><FaUndo /> Mark Available</> : <><FaCheck /> Mark In Use</>}
              </button>
              <button
                onClick={() => incrementMileage(vehicle.id, 10)}
                style={buttonStyle("#3498db")}
              >
                +10 km
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
