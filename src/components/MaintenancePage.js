import React from "react";
import { FaCheck, FaUndo } from "react-icons/fa";

export default function MaintenancePage({ vehicles, updateStatus, theme }) {
  const darkMode = theme === "dark";

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
            borderRadius: "20px",
            overflow: "hidden",
            background: darkMode ? "#1f1f1f" : "#fff",
            boxShadow: darkMode 
              ? "0 10px 25px rgba(0,0,0,0.7)" 
              : "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.3s, box-shadow 0.3s",
            cursor: "pointer"
          }}
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
          {/* Gradient Header */}
          <div style={{
            background: "linear-gradient(135deg, #f39c12, #e67e22)",
            padding: "20px",
            color: "#fff",
            fontWeight: "700",
            fontSize: "16px"
          }}>
            {vehicle.name} - In Maintenance
          </div>

          {/* Vehicle Details */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><strong>Mileage:</strong> {vehicle.mileage}</div>
            <div><strong>Insurance:</strong> {vehicle.insurance || "N/A"}</div>
            <div><strong>Disc:</strong> {vehicle.disc || "N/A"}</div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => updateStatus(vehicle.id, "Available")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#27ae60",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <FaCheck /> Mark Available
              </button>
              <button
                onClick={() => updateStatus(vehicle.id, "In Use")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#2980b9",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <FaUndo /> Mark In Use
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
