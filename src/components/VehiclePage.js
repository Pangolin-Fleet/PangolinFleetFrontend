import React, { useState } from "react";
import { 
  FaCar, FaCheckCircle, FaTools, FaExclamationTriangle, 
  FaFileInvoice, FaShieldAlt, FaClipboardList, FaPlus, FaSearch, FaEdit, FaSave 
} from "react-icons/fa";
import { VehicleItem } from "./VehicleItem";

export default function VehiclePage({
  vehicles,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  animatedId,
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
  const serviceDue = vehicles.filter(v => v.mileage >= 10000).length;
  const insuranceExp = vehicles.filter(v => v.insurance && new Date(v.insurance) < new Date()).length;
  const discExp = vehicles.filter(v => v.disc && new Date(v.disc) < new Date()).length;

  const isExpired = (date) => date && new Date(date) < new Date();

  const cardStyle = (bg) => ({
    flex: "1",
    padding: "20px",
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${bg}CC, ${bg}FF)`,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    minWidth: "180px",
    maxWidth: "220px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)",
    marginRight: "16px",
    marginBottom: "16px",
    transition: "transform 0.2s",
    cursor: "default"
  });

  const cards = [
    { label: "Total Vehicles", value: totalVehicles, icon: <FaCar />, bg: "#2c3e50" },
    { label: "Available", value: available, icon: <FaCheckCircle />, bg: "#27ae60" },
    { label: "In Use", value: inUse, icon: <FaCar />, bg: "#2980b9" },
    { label: "Maintenance", value: maintenance, icon: <FaTools />, bg: "#f39c12" },
    { label: "Service Due", value: serviceDue, icon: <FaExclamationTriangle />, bg: "#e67e22" },
    { label: "Insurance Exp.", value: insuranceExp, icon: <FaFileInvoice />, bg: "#c0392b" },
    { label: "Disc Exp.", value: discExp, icon: <FaShieldAlt />, bg: "#8e44ad" },
    { label: "Other Info", value: "-", icon: <FaClipboardList />, bg: "#34495e" }
  ];

  const handleEditClick = (vehicle) => {
    setEditingId(vehicle.id);
    setEditableVehicle({ ...vehicle });
  };

  const handleSaveClick = (id) => {
    editVehicle(id, "name", editableVehicle.name);
    editVehicle(id, "mileage", Number(editableVehicle.mileage));
    editVehicle(id, "disc", editableVehicle.disc);
    editVehicle(id, "insurance", editableVehicle.insurance);
    setEditingId(null);
    setEditableVehicle({});
  };

  return (
    <div>
      {/* Top Bar: Title + Search + Filter + Add Vehicle */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "24px", flexWrap: "wrap", gap: "12px"
      }}>
        <h2 style={{ color: darkMode ? "#fff" : "#000", marginRight: "12px" }}>Fleet Summary</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Search Bar */}
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

          {/* Filter Dropdown */}
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

          {/* Add Vehicle Button */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "8px 16px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <FaPlus /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "32px", gap: "16px" }}>
        {cards.map((card, idx) => (
          <div key={idx} style={cardStyle(card.bg)} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0px)"}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "32px", marginRight: "12px" }}>{card.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>{card.value}</div>
            </div>
            <div style={{ fontSize: "16px", opacity: 0.9 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Vehicle List */}
      <div className="vehicle-list">
        {vehicles.map(vehicle => (
          <div
            key={vehicle.id}
            style={{
              marginBottom: "16px",
              padding: "14px",
              borderRadius: "12px",
              border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
              background: darkMode ? "#2c2c2c" : "#fff",
              boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.1)",
              color: darkMode ? "#fff" : "#000",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            {editingId === vehicle.id ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["name", "mileage", "disc", "insurance"].map((field) => (
                  <input
                    key={field}
                    type={field === "mileage" ? "number" : "date"}
                    value={editableVehicle[field] || ""}
                    onChange={e => setEditableVehicle({ ...editableVehicle, [field]: e.target.value })}
                    placeholder={field}
                    style={{
                      flex: "1",
                      minWidth: "120px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
                      background: darkMode ? "#333" : "#f9f9f9",
                      color: (field === "disc" || field === "insurance") && isExpired(editableVehicle[field])
                        ? "#e74c3c"
                        : darkMode ? "#fff" : "#000",
                      fontSize: "14px"
                    }}
                  />
                ))}
                <button
                  onClick={() => handleSaveClick(vehicle.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "#2ecc71",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    alignSelf: "center",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <FaSave /> Save
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <VehicleItem
                  vehicle={vehicle}
                  incrementMileage={() => incrementMileage(vehicle.id, 100)}
                  updateStatus={updateStatus}
                  deleteVehicle={deleteVehicle}
                  theme={darkMode ? "dark" : "light"}
                />
                <button
                  onClick={() => handleEditClick(vehicle)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "#3498db",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <FaEdit /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
