import React from "react";

export default function AddVehicleModal({ newVehicle, setNewVehicle, setShowModal, addVehicle, darkMode }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    addVehicle(newVehicle);
    setShowModal(false);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        background: darkMode ? "#222" : "#fff",
        padding: "24px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.7)" : "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginBottom: "12px", color: darkMode ? "#fff" : "#000" }}>Add Vehicle</h2>

        {["vin", "make", "model", "year", "mileage", "description"].map(field => (
          <input
            key={field}
            name={field}
            type={field === "year" || field === "mileage" ? "number" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={newVehicle[field] || ""}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
              background: darkMode ? "#333" : "#f9f9f9",
              color: darkMode ? "#fff" : "#000"
            }}
            required={["vin","make","model","year","mileage"].includes(field)}
          />
        ))}

        <select
          name="status"
          value={newVehicle.status || "Available"}
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`, background: darkMode ? "#333" : "#f9f9f9", color: darkMode ? "#fff" : "#000" }}
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>

        {["insuranceExpiryDate", "discExpiryDate"].map(field => (
          <input
            key={field}
            name={field}
            type="date"
            value={newVehicle[field] || ""}
            onChange={handleChange}
            style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`, background: darkMode ? "#333" : "#f9f9f9", color: darkMode ? "#fff" : "#000" }}
          />
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: "700" }}>Add</button>
          <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
