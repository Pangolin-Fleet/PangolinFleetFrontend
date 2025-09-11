import React, { useState } from "react";
import { FaCar, FaCheckCircle, FaTools, FaPlus, FaSearch } from "react-icons/fa";
import AddVehicleModal from "./AddVehicleModal";

// --- SummaryCard ---
function SummaryCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        flex: "1 1 calc(33% - 16px)",
        padding: "20px",
        borderRadius: "16px",
        background: color,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minWidth: "200px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "32px", marginRight: "12px" }}>{icon}</div>
        <div style={{ fontSize: "28px", fontWeight: "700" }}>{value}</div>
      </div>
      <div style={{ fontSize: "16px", opacity: 0.9 }}>{label}</div>
    </div>
  );
}

// --- VehicleCard ---
function VehicleCard({
  vehicle,
  darkMode,
  editingVin,
  editableVehicle,
  setEditableVehicle,
  handleEditClick,
  handleSaveClick,
  deleteVehicle
}) {
  const statusGradient = {
    "In Use": "linear-gradient(135deg, #2980b9, #6dd5fa)",
    "Available": "linear-gradient(135deg, #27ae60, #2ecc71)",
    "In Maintenance": "linear-gradient(135deg, #f39c12, #f1c40f)"
  };

  const isExpired = (date) => date && new Date(date) < new Date();
  const fields = ["make", "model", "year", "mileage", "status", "description", "discExpiryDate", "insuranceExpiryDate"];

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: darkMode ? "#1f1f1f" : "#fff",
        boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.7)" : "0 10px 25px rgba(0,0,0,0.2)",
        transition: "transform 0.3s, box-shadow 0.3s"
      }}
    >
      {/* Header */}
      <div
        style={{
          background: statusGradient[vehicle.status] || "#777",
          padding: "14px",
          color: "#fff",
          fontWeight: "700",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "16px"
        }}
      >
        <span>{vehicle.make} {vehicle.model}</span>
        <span>{vehicle.status}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {editingVin === vehicle.vin ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {fields.map(field => (
              field === "status" ? (
                <select
                  key={field}
                  value={editableVehicle.status ?? vehicle.status}
                  onChange={e => setEditableVehicle({ ...editableVehicle, status: e.target.value })}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
                    background: darkMode ? "#333" : "#f9f9f9",
                    color: darkMode ? "#fff" : "#000"
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">In Maintenance</option>
                </select>
              ) : (
                <input
                  key={field}
                  type={field === "mileage" || field === "year" ? "number" : field.includes("disc") || field.includes("insurance") ? "date" : "text"}
                  value={editableVehicle[field] ?? vehicle[field] ?? ""}
                  onChange={e => setEditableVehicle({ ...editableVehicle, [field]: e.target.value })}
                  placeholder={field}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
                    background: darkMode ? "#333" : "#f9f9f9",
                    color: (field.includes("disc") || field.includes("insurance")) && isExpired(editableVehicle[field] ?? vehicle[field]) ? "#e74c3c" : darkMode ? "#fff" : "#000"
                  }}
                />
              )
            ))}
            <button
              onClick={() => handleSaveClick(vehicle.vin)}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "#2ecc71",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <div><strong>Mileage:</strong> {vehicle.mileage}</div>
            <div><strong>Description:</strong> {vehicle.description || "N/A"}</div>
            <div><strong>Disc Exp:</strong> {vehicle.discExpiryDate || "N/A"}</div>
            <div><strong>Insurance Exp:</strong> {vehicle.insuranceExpiryDate || "N/A"}</div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={() => handleEditClick(vehicle)} style={{ flex: 1, padding: "10px", background: "#3498db", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>Edit</button>
              <button onClick={() => deleteVehicle(vehicle.vin)} style={{ flex: 1, padding: "10px", background: "#e74c3c", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function VehiclePage({
  vehicles,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  showModal,
  setShowModal,
  newVehicle,
  setNewVehicle,
  addVehicle,
  statusCounts,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  darkMode
}) {
  const [editVehicleVin, setEditVehicleVin] = useState(null);
  const [editableVehicle, setEditableVehicle] = useState({});

  const totalVehicles = vehicles.length;
  const available = statusCounts["Available"] || 0;
  const inUse = statusCounts["In Use"] || 0;
  const maintenance = statusCounts["In Maintenance"] || 0;

  const summaryCards = [
    { label: "Total Vehicles", value: totalVehicles, icon: <FaCar />, color: "#34495e" },
    { label: "Available", value: available, icon: <FaCheckCircle />, color: "#27ae60" },
    { label: "In Use", value: inUse, icon: <FaCar />, color: "#2980b9" },
    { label: "Maintenance", value: maintenance, icon: <FaTools />, color: "#f39c12" }
  ];

  const handleEditClick = (vehicle) => {
    setEditVehicleVin(vehicle.vin);
    setEditableVehicle({ ...vehicle });
  };

  const handleSaveClick = async (vin) => {
    const requiredFields = ["make", "model", "year", "mileage", "status"];
    for (let field of requiredFields) {
      if (!editableVehicle[field] || editableVehicle[field].toString().trim() === "") {
        alert(`Please fill in the ${field} field before saving.`);
        return;
      }
    }
    try {
      await editVehicle(vin, editableVehicle);
      setEditVehicleVin(null);
      setEditableVehicle({});
      alert("Vehicle updated successfully!");
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      alert("Failed to update vehicle.");
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    (v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus ? v.status === filterStatus : true)
  );

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`, borderRadius: "8px", padding: "6px 12px", background: darkMode ? "#555" : "#fff" }}>
          <FaSearch style={{ color: darkMode ? "#fff" : "#555" }} />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", color: darkMode ? "#fff" : "#000", flex: 1 }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`, background: darkMode ? "#555" : "#fff", color: darkMode ? "#fff" : "#000" }}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">Maintenance</option>
        </select>

        <button
          onClick={() => setShowModal(true)}
          style={{ padding: "8px 16px", background: "#3498db", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <FaPlus /> Add Vehicle
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        {summaryCards.map((card, idx) => <SummaryCard key={idx} {...card} />)}
      </div>

      {/* Vehicle Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredVehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.vin}
            vehicle={vehicle}
            darkMode={darkMode}
            editingVin={editVehicleVin}
            editableVehicle={editableVehicle}
            setEditableVehicle={setEditableVehicle}
            handleEditClick={handleEditClick}
            handleSaveClick={handleSaveClick}
            deleteVehicle={deleteVehicle}
          />
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <AddVehicleModal
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setShowModal={setShowModal}
          addVehicle={addVehicle}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
