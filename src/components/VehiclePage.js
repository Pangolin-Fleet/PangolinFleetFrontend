import React, { useState, useMemo } from "react";
import { FaCar, FaCheckCircle, FaTools, FaExclamationTriangle, FaFileInvoice, FaShieldAlt, FaPlus, FaSearch } from "react-icons/fa";

// --- SummaryCard Component ---
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
        alignItems: "flex-start",
        minWidth: "200px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)",
        cursor: "default",
        transition: "transform 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0px)"}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "32px", marginRight: "12px" }}>{icon}</div>
        <div style={{ fontSize: "28px", fontWeight: "700" }}>{value}</div>
      </div>
      <div style={{ fontSize: "16px", opacity: 0.9 }}>{label}</div>
    </div>
  );
}

// --- VehicleCard Component ---
function VehicleCard({
  vehicle,
  darkMode,
  editingId,
  editableVehicle,
  setEditableVehicle,
  handleEditClick,
  handleSaveClick,
  incrementMileage,
  updateStatus,
  deleteVehicle
}) {
  const isExpired = (date) => date && new Date(date) < new Date();

  const statusGradient = {
    "In Use": "linear-gradient(135deg, #2980b9, #6dd5fa)",
    "Available": "linear-gradient(135deg, #27ae60, #2ecc71)",
    "In Maintenance": "linear-gradient(135deg, #f39c12, #f1c40f)"
  };

  // Add driverName and driverLicense to editable fields
  const fields = ["name", "mileage", "disc", "insurance", "status", "driverName", "driverLicense"];

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        background: darkMode ? "#1f1f1f" : "#fff",
        boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.7)" : "0 10px 25px rgba(0,0,0,0.2)",
        transition: "transform 0.3s, box-shadow 0.3s",
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
      <div
        style={{
          background: statusGradient[vehicle.status] || "#777",
          padding: "20px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "700",
          fontSize: "16px"
        }}
      >
        <span>{vehicle.name}</span>
        <span>{vehicle.status}</span>
      </div>

      {/* Vehicle Details */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {editingId === vehicle.id ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {fields.map(field => {
              if (field === "status") {
                return (
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
                    <option value="In Maintenance">Maintenance</option>
                  </select>
                );
              } else {
                return (
                  <input
                    key={field}
                    type={field === "mileage" ? "number" : field.includes("disc") || field.includes("insurance") ? "date" : "text"}
                    value={editableVehicle[field] ?? vehicle[field] ?? ""}
                    onChange={e => setEditableVehicle({ ...editableVehicle, [field]: e.target.value })}
                    placeholder={field === "driverLicense" ? "Driver License" : field === "driverName" ? "Driver Name" : ""}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
                      background: darkMode ? "#333" : "#f9f9f9",
                      color:
                        (field === "disc" || field === "insurance") && isExpired(editableVehicle[field] ?? vehicle[field])
                          ? "#e74c3c"
                          : darkMode
                          ? "#fff"
                          : "#000"
                    }}
                  />
                );
              }
            })}
            <button
              onClick={() => handleSaveClick(vehicle.id)}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "#2ecc71",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div><strong>{vehicle.name}</strong> (Mileage: {vehicle.mileage})</div>
              <div style={{ fontSize: "12px", marginTop: "4px", color: isExpired(vehicle.insurance) ? "#e74c3c" : darkMode ? "#fff" : "#000" }}>Insurance: {vehicle.insurance || "N/A"}</div>
              <div style={{ fontSize: "12px", marginTop: "2px", color: isExpired(vehicle.disc) ? "#e74c3c" : darkMode ? "#fff" : "#000" }}>Disc: {vehicle.disc || "N/A"}</div>
              <div style={{ fontSize: "12px", marginTop: "2px", color: darkMode ? "#fff" : "#000" }}>Driver: {vehicle.driverName || "N/A"} ({vehicle.driverLicense || "N/A"})</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => incrementMileage(vehicle.id, 100)} style={{ padding: "12px", borderRadius: "10px", background: "#f39c12", color: "#fff", border: "none", cursor: "pointer", width: "100%" }}>+100 km</button>
              <select value={vehicle.status} onChange={e => updateStatus(vehicle.id, e.target.value)} style={{ padding: "12px", borderRadius: "10px", border: `1px solid ${darkMode ? "#555" : "#ccc"}`, background: darkMode ? "#333" : "#f9f9f9", color: darkMode ? "#fff" : "#000", width: "100%" }}>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="In Maintenance">Maintenance</option>
              </select>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEditClick(vehicle)} style={{ padding: "12px", borderRadius: "10px", background: "#3498db", color: "#fff", border: "none", cursor: "pointer", flex: 1 }}>Edit</button>
                <button onClick={() => deleteVehicle(vehicle.id)} style={{ padding: "12px", borderRadius: "10px", background: "#e74c3c", color: "#fff", border: "none", cursor: "pointer", flex: 1 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main VehiclePage Component ---
export default function VehiclePage({
  vehicles,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  statusCounts,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  darkMode,
  showModal,
  setShowModal,
  newVehicle,
  setNewVehicle,
  addVehicle
}) {
  const [editingId, setEditingId] = useState(null);
  const [editableVehicle, setEditableVehicle] = useState({});

  const totalVehicles = vehicles.length;
  const available = statusCounts["Available"] || 0;
  const inUse = statusCounts["In Use"] || 0;
  const maintenance = statusCounts["In Maintenance"] || 0;

  const serviceDue = useMemo(() => vehicles.filter(v => v.mileage >= 10000).length, [vehicles]);
  const insuranceExp = useMemo(() => vehicles.filter(v => v.insurance && new Date(v.insurance) < new Date()).length, [vehicles]);
  const discExp = useMemo(() => vehicles.filter(v => v.disc && new Date(v.disc) < new Date()).length, [vehicles]);

  const summaryCards = [
    { label: "Total Vehicles", value: totalVehicles, icon: <FaCar />, color: "#34495e" },
    { label: "Available", value: available, icon: <FaCheckCircle />, color: "#27ae60" },
    { label: "In Use", value: inUse, icon: <FaCar />, color: "#2980b9" },
    { label: "Maintenance", value: maintenance, icon: <FaTools />, color: "#f39c12" },
    { label: "Service Due", value: serviceDue, icon: <FaExclamationTriangle />, color: "#e67e22" },
    { label: "Insurance Exp.", value: insuranceExp, icon: <FaFileInvoice />, color: "#c0392b" },
    { label: "Disc Exp.", value: discExp, icon: <FaShieldAlt />, color: "#8e44ad" }
  ];

  const handleEditClick = (vehicle) => {
    setEditingId(vehicle.id);
    setEditableVehicle({
      name: vehicle.name ?? "",
      mileage: vehicle.mileage ?? 0,
      disc: vehicle.disc ?? "",
      insurance: vehicle.insurance ?? "",
      status: vehicle.status ?? "Available",
      driverName: vehicle.driverName ?? "",
      driverLicense: vehicle.driverLicense ?? ""
    });
  };

  const handleSaveClick = (id) => {
    ["name", "mileage", "disc", "insurance", "status", "driverName", "driverLicense"].forEach(field => {
      editVehicle(id, field, editableVehicle[field]);
    });
    setEditingId(null);
    setEditableVehicle({});
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <h2 style={{ color: darkMode ? "#fff" : "#000" }}>Fleet Summary</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${darkMode ? '#555' : '#ccc'}`, borderRadius: "8px", padding: "4px 8px", background: darkMode ? "#555" : "#fff" }}>
            <FaSearch style={{ marginRight: "6px", color: darkMode ? "#fff" : "#555" }} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", color: darkMode ? "#fff" : "#000" }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${darkMode ? '#555' : '#ccc'}`, background: darkMode ? "#555" : "#fff", color: darkMode ? "#fff" : "#000" }}
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
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        {summaryCards.map((card, idx) => <SummaryCard key={idx} {...card} />)}
      </div>

      {/* Vehicle Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "24px"
      }}>
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            darkMode={darkMode}
            editingId={editingId}
            editableVehicle={editableVehicle}
            setEditableVehicle={setEditableVehicle}
            handleEditClick={handleEditClick}
            handleSaveClick={handleSaveClick}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            deleteVehicle={deleteVehicle}
          />
        ))}
      </div>
    </div>
  );
}
