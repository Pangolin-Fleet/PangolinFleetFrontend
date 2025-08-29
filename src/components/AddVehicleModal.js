import React from "react";
import { FaTimes } from "react-icons/fa";

export default function AddVehicleModal({ newVehicle, setNewVehicle, setShowModal, addVehicle, darkMode }) {

  const handleChange = (field, value) => {
    setNewVehicle({ ...newVehicle, [field]: value });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: darkMode ? "#2c2c2c" : "#fff",
        padding: "24px",
        borderRadius: "16px",
        width: "400px",
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)"
      }}>
        <button onClick={() => setShowModal(false)} style={{
          position: "absolute", top: "12px", right: "12px",
          background: "transparent", border: "none", color: darkMode ? "#fff" : "#000", fontSize: "20px", cursor: "pointer"
        }}><FaTimes /></button>

        <h2 style={{ marginBottom: "12px", color: darkMode ? "#fff" : "#000" }}>Add Vehicle</h2>

        {[
          { label: "Name", field: "name", type: "text" },
          { label: "VIN", field: "vin", type: "text" },
          { label: "License", field: "license", type: "text" },
          { label: "Driver", field: "driver", type: "text" },
          { label: "Mileage", field: "mileage", type: "number" },
          { label: "Status", field: "status", type: "text" },
          { label: "DISC Expiration", field: "disc", type: "date" },
          { label: "Insurance Expiration", field: "insurance", type: "date" },
          { label: "Description", field: "description", type: "text" }
        ].map(input => (
          <div key={input.field} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ color: darkMode ? "#fff" : "#000", fontSize: "14px" }}>{input.label}</label>
            <input
              type={input.type}
              value={newVehicle[input.field]}
              onChange={e => handleChange(input.field, e.target.value)}
              style={{
                padding: "8px", borderRadius: "8px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
                background: darkMode ? "#333" : "#f9f9f9",
                color: darkMode ? "#fff" : "#000"
              }}
            />
          </div>
        ))}

        <button onClick={addVehicle} style={{
          padding: "10px 0", marginTop: "12px",
          borderRadius: "12px", border: "none",
          background: "#3498db", color: "#fff",
          fontWeight: "700", cursor: "pointer"
        }}>Add Vehicle</button>
      </div>
    </div>
  );
}
