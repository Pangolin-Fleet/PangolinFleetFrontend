import React, { useState } from "react";
import { VehicleItem } from "./VehicleItem";

export default function InUsePage({ vehicles, saveDestination, updateStatus, darkMode }) {
  const [destinationInputs, setDestinationInputs] = useState({});

  const handleDestinationChange = (id, value) => {
    setDestinationInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = (id) => {
    const destination = destinationInputs[id];
    if (!destination) return;
    saveDestination(id, destination);
    setDestinationInputs(prev => ({ ...prev, [id]: "" }));
  };

  const toggleStatus = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    const newStatus = vehicle.status === "In Use" ? "Available" : "In Use";
    updateStatus(id, newStatus, newStatus === "Available" ? { destination: "" } : {});
  };

  return (
    <div className="vehicle-list">
      {vehicles.map(vehicle => (
        <div
          key={vehicle.id}
          style={{
            marginBottom: "16px",
            padding: "12px",                 // slightly bigger outer card
            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
            borderRadius: "10px",
            background: darkMode ? "#2c2c2c" : "#fefefe",
            boxShadow: darkMode 
              ? "0 2px 8px rgba(0,0,0,0.5)" 
              : "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          <div
            style={{
              width: "100%",                  // inner card takes full width
              padding: "16px",                // inner spacing
              borderRadius: "8px",
              background: darkMode ? "#3b3b3b" : "#fff",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              boxShadow: darkMode
                ? "0 1px 6px rgba(0,0,0,0.6)"
                : "0 1px 6px rgba(0,0,0,0.1)"
            }}
          >
            <VehicleItem
              vehicle={vehicle}
              incrementMileage={() => {}}
              deleteVehicle={() => {}}
              updateStatus={(id, status) => updateStatus(id, status)}
              theme={darkMode ? "dark" : "light"}
            />

            <input
              type="text"
              placeholder="Enter Destination"
              value={destinationInputs[vehicle.id] || ""}
              onChange={(e) => handleDestinationChange(vehicle.id, e.target.value)}
              style={{
                marginTop: "12px",
                padding: "8px",
                width: "100%",
                borderRadius: "6px",
                border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
                background: darkMode ? '#555' : '#fff',
                color: darkMode ? '#fff' : '#000'
              }}
            />

            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleSave(vehicle.id)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#3498db",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Save Destination
              </button>

              <button
                onClick={() => toggleStatus(vehicle.id)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: vehicle.status === "In Use" ? "#e74c3c" : "#2ecc71",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {vehicle.status === "In Use" ? "Mark Available" : "Mark In Use"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
