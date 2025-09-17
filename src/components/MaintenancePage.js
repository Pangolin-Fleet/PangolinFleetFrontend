import React, { useState } from "react";
import { FaCheck, FaUndo, FaPlus } from "react-icons/fa";

export default function MaintenancePage({ vehicles, updateStatus, updateVehicle, theme }) {
  const darkMode = theme === "dark";

  const severityColors = {
    Low: "#27ae60",
    Medium: "#f39c12",
    High: "#c0392b",
  };

  // Store newIssue and newSeverity per vehicle
  const [issueInputs, setIssueInputs] = useState({});

  const handleAddIssue = (vehicle) => {
    const input = issueInputs[vehicle.vin] || { note: "", severity: "Low" };
    if (!input.note) return;

    const updatedIssues = vehicle.issues ? [...vehicle.issues] : [];
    updatedIssues.push({ note: input.note, severity: input.severity });
    updateVehicle(vehicle.vin, { ...vehicle, issues: updatedIssues });

    setIssueInputs(prev => ({ ...prev, [vehicle.vin]: { note: "", severity: "Low" } }));
  };

  const handleInputChange = (vin, field, value) => {
    setIssueInputs(prev => ({
      ...prev,
      [vin]: {
        ...prev[vin],
        [field]: value
      }
    }));
  };

  const handleSaveNotes = (vehicle, index, note) => {
    const updatedIssues = [...vehicle.issues];
    updatedIssues[index].note = note;
    updateVehicle(vehicle.vin, { ...vehicle, issues: updatedIssues });
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "24px",
      padding: "24px",
      minHeight: "100vh",
      background: darkMode ? "#121212" : "#f5f5f5",
    }}>
      {vehicles.map(vehicle => {
        const input = issueInputs[vehicle.vin] || { note: "", severity: "Low" };

        return (
          <div key={vehicle.vin} style={{
            borderRadius: "16px",
            overflow: "hidden",
            background: darkMode ? "#1e1e1e" : "#fff",
            boxShadow: darkMode 
              ? "0 10px 20px rgba(0,0,0,0.8)"
              : "0 8px 16px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "grab",
          }} draggable>
            
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #2980b9, #6dd5fa)",
              padding: "18px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "17px",
              textAlign: "center"
            }}>
              {vehicle.make} {vehicle.model}
            </div>

            {/* Body */}
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><strong>Mileage:</strong> {vehicle.mileage}</div>
              <div><strong>Insurance:</strong> {vehicle.insurance || "N/A"}</div>
              <div><strong>Disc:</strong> {vehicle.disc || "N/A"}</div>

              {/* Issues */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong>Issues:</strong>
                {vehicle.issues && vehicle.issues.length > 0 ? vehicle.issues.map((issue, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="text"
                      value={issue.note}
                      onChange={e => handleSaveNotes(vehicle, index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background: darkMode ? "#2c2c2c" : "#fff",
                        color: darkMode ? "#fff" : "#000"
                      }}
                    />
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: severityColors[issue.severity] || "#999",
                      color: "#fff",
                      fontWeight: "700"
                    }}>{issue.severity}</span>
                  </div>
                )) : <span style={{ fontStyle: "italic", color: darkMode ? "#aaa" : "#555" }}>No issues reported</span>}
              </div>

              {/* Add New Issue */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="New issue..."
                  value={input.note}
                  onChange={e => handleInputChange(vehicle.vin, "note", e.target.value)}
                  style={{
                    flex: 2,
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: darkMode ? "#2c2c2c" : "#fff",
                    color: darkMode ? "#fff" : "#000"
                  }}
                />
                <select
                  value={input.severity}
                  onChange={e => handleInputChange(vehicle.vin, "severity", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: darkMode ? "#2c2c2c" : "#fff",
                    color: darkMode ? "#fff" : "#000"
                  }}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button
                  onClick={() => handleAddIssue(vehicle)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2980b9",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FaPlus /> Add
                </button>
              </div>

              {/* Status Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  onClick={() => updateStatus(vehicle.vin, "Available")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#27ae60",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FaCheck /> Available
                </button>
                <button
                  onClick={() => updateStatus(vehicle.vin, "In Use")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#f39c12",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FaUndo /> In Use
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
