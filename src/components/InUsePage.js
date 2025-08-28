import React, { useState } from "react";
import { VehicleItem } from "./VehicleItem";

export default function InUsePage({ vehicles, saveDestination, darkMode }) {
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

  return (
    <div className="vehicle-list">
      {vehicles.map(vehicle => (
        <div key={vehicle.id} style={{
          marginBottom: "16px",
          padding: "10px",
          border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
          borderRadius: "8px",
          background: darkMode ? "#333" : "#fff"
        }}>
          <VehicleItem
            vehicle={vehicle}
            incrementMileage={() => {}}
            deleteVehicle={() => {}}
            theme={darkMode ? "dark" : "light"}
          />
          <input
            type="text"
            placeholder="Enter Destination"
            value={destinationInputs[vehicle.id] || ""}
            onChange={(e) => handleDestinationChange(vehicle.id, e.target.value)}
            style={{
              marginTop: "8px",
              padding: "6px",
              width: "100%",
              borderRadius: "6px",
              border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
              background: darkMode ? '#555' : '#fff',
              color: darkMode ? '#fff' : '#000'
            }}
          />
          <button
            onClick={() => handleSave(vehicle.id)}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Save Destination
          </button>
        </div>
      ))}
    </div>
  );
}
