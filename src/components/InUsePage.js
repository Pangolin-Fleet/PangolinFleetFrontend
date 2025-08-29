import React, { useState } from "react";
import { VehicleItem } from "./VehicleItem";
import { FaMapMarkerAlt, FaArrowRight, FaCheck, FaUndo } from "react-icons/fa";

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

  const statusColors = {
    "Available": "#27ae60",
    "In Use": "#2980b9",
    "In Maintenance": "#f39c12"
  };

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
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            background: darkMode ? "#2c2c2c" : "#fff",
            boxShadow: darkMode 
              ? "0 6px 20px rgba(0,0,0,0.5)" 
              : "0 6px 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 12px 30px rgba(0,0,0,0.6)"
              : "0 12px 30px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 6px 20px rgba(0,0,0,0.5)"
              : "0 6px 20px rgba(0,0,0,0.15)";
          }}
        >
          {/* Gradient Header */}
          <div style={{
            background: vehicle.status === "In Use" 
              ? "linear-gradient(135deg, #2980b9, #6dd5fa)"
              : "linear-gradient(135deg, #27ae60, #2ecc71)",
            padding: "18px 20px",
            color: "#fff",
            fontWeight: "700",
            fontSize: "16px"
          }}>
            {vehicle.name} - {vehicle.status}
          </div>

          {/* Vehicle Details */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <VehicleItem
              vehicle={vehicle}
              incrementMileage={() => {}}
              deleteVehicle={() => {}}
              updateStatus={(id, status) => updateStatus(id, status)}
              theme={darkMode ? "dark" : "light"}
            />

            {/* Destination Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt style={{ color: "#3498db", fontSize: "18px" }} />
                <input
                  type="text"
                  placeholder="Enter Destination..."
                  value={destinationInputs[vehicle.id] || ""}
                  onChange={e => handleDestinationChange(vehicle.id, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: darkMode ? "#333" : "#f4f4f4",
                    color: darkMode ? "#fff" : "#333",
                    fontSize: "14px",
                    outline: "none",
                    boxShadow: darkMode 
                      ? "inset 0 0 5px rgba(255,255,255,0.1)" 
                      : "inset 0 0 5px rgba(0,0,0,0.05)"
                  }}
                />
              </div>

              <button
                onClick={() => handleSave(vehicle.id)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #3498db, #6dd5fa)",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <FaArrowRight /> Save
              </button>
            </div>

            {/* Status Toggle */}
            <button
              onClick={() => toggleStatus(vehicle.id)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: vehicle.status === "In Use"
                  ? "linear-gradient(135deg, #e74c3c, #ff6b6b)"
                  : "linear-gradient(135deg, #27ae60, #2ecc71)",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "14px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {vehicle.status === "In Use" ? <><FaUndo /> Mark Available</> : <><FaCheck /> Mark In Use</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
