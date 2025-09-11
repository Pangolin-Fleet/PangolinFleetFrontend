import React, { useEffect, useState } from "react";
import axios from "axios";

export default function VehicleList({ darkMode }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vehicles from backend
  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:8080/service/vehicle");
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle inline edits
  const handleEdit = async (vin, field, value) => {
    try {
      const vehicleToUpdate = vehicles.find(v => v.vin === vin);
      if (!vehicleToUpdate) return;

      const updatedVehicle = { ...vehicleToUpdate, [field]: value };
      setVehicles(prev => prev.map(v => (v.vin === vin ? updatedVehicle : v)));

      await axios.put(`http://localhost:8080/service/vehicle/${vin}`, updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Check backend.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading vehicles...</p>;
  if (vehicles.length === 0) return <p style={{ textAlign: "center" }}>No vehicles found.</p>;

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      color: darkMode ? "#fff" : "#222"
    }}>
      <h2 style={{ marginBottom: "20px" }}>Vehicle List</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {vehicles.map(vehicle => (
          <div
            key={vehicle.vin}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              gap: "8px",
              padding: "12px",
              background: darkMode ? "#2a2a2a" : "#f9f9f9",
              borderRadius: "12px",
              boxShadow: darkMode
                ? "0 4px 12px rgba(0,0,0,0.7)"
                : "0 4px 12px rgba(0,0,0,0.1)",
              alignItems: "center"
            }}
          >
            <div style={{ fontWeight: "700" }}>{vehicle.vin}</div>
            <input
              type="text"
              value={vehicle.make}
              onChange={e => handleEdit(vehicle.vin, "make", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="text"
              value={vehicle.model}
              onChange={e => handleEdit(vehicle.vin, "model", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="number"
              value={vehicle.year || ""}
              onChange={e => handleEdit(vehicle.vin, "year", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="number"
              value={vehicle.mileage || 0}
              onChange={e => handleEdit(vehicle.vin, "mileage", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="text"
              value={vehicle.status || ""}
              onChange={e => handleEdit(vehicle.vin, "status", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="text"
              value={vehicle.description || ""}
              onChange={e => handleEdit(vehicle.vin, "description", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="date"
              value={vehicle.insuranceExpiryDate || ""}
              onChange={e => handleEdit(vehicle.vin, "insuranceExpiryDate", e.target.value)}
              style={inputStyle(darkMode)}
            />
            <input
              type="date"
              value={vehicle.discExpiryDate || ""}
              onChange={e => handleEdit(vehicle.vin, "discExpiryDate", e.target.value)}
              style={inputStyle(darkMode)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable input style function
function inputStyle(darkMode) {
  return {
    padding: "6px 10px",
    borderRadius: "6px",
    border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
    background: darkMode ? "#333" : "#fff",
    color: darkMode ? "#fff" : "#000",
    outline: "none"
  };
}
