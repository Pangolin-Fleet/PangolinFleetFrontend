import React, { useState } from "react";
import { FaCar, FaCheckCircle, FaTools, FaPlus, FaSearch, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import AddVehicleModal from "./AddVehicleModal";
import "./VehiclePage.css";

// SummaryCard Component
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header" style={{ backgroundColor: color }}>
        <div className="summary-icon">{icon}</div>
        <div className="summary-value">{value}</div>
      </div>
      <div className="summary-label">{label}</div>
    </div>
  );
}

// VehicleCard Component
function VehicleCard({ vehicle, isEditing, editableVehicle, onEdit, onDelete, onSave, onCancel, onFieldEdit }) {
  const statusColors = {
    "Available": "var(--status-available)",
    "In Use": "var(--status-in-use)",
    "In Maintenance": "var(--status-maintenance)"
  };

  const isFormValid = () => {
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    return requiredFields.every(field => editableVehicle[field] && editableVehicle[field].toString().trim() !== '');
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header" style={{ backgroundColor: statusColors[vehicle.status] || "#666" }}>
        <span>{vehicle.make} {vehicle.model}</span>
        <span className="status-pill">{vehicle.status}</span>
      </div>

      <div className="vehicle-card-body">
        {!isEditing ? (
          <>
            <p><strong>VIN:</strong> {vehicle.vin}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Description:</strong> {vehicle.description || "N/A"}</p>
            {vehicle.insuranceExpiryDate && <p><strong>Insurance:</strong> {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}</p>}
            {vehicle.discExpiryDate && <p><strong>Disc Expiry:</strong> {new Date(vehicle.discExpiryDate).toLocaleDateString()}</p>}

            <div className="card-actions">
              <button className="btn-edit" onClick={() => onEdit(vehicle)}><FaEdit /> Edit</button>
              <button className="btn-delete" onClick={() => onDelete(vehicle.vin)}><FaTrash /> Delete</button>
            </div>
          </>
        ) : (
          <>
            {/* Editable Fields */}
            <input type="text" placeholder="Make" value={editableVehicle.make} onChange={(e) => onFieldEdit(vehicle.vin, 'make', e.target.value)} />
            <input type="text" placeholder="Model" value={editableVehicle.model} onChange={(e) => onFieldEdit(vehicle.vin, 'model', e.target.value)} />
            <input type="number" placeholder="Year" value={editableVehicle.year} onChange={(e) => onFieldEdit(vehicle.vin, 'year', e.target.value)} />
            <input type="number" placeholder="Mileage" value={editableVehicle.mileage} onChange={(e) => onFieldEdit(vehicle.vin, 'mileage', e.target.value)} />
            <select value={editableVehicle.status} onChange={(e) => onFieldEdit(vehicle.vin, 'status', e.target.value)}>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="In Maintenance">Maintenance</option>
            </select>
            <textarea placeholder="Description" value={editableVehicle.description} onChange={(e) => onFieldEdit(vehicle.vin, 'description', e.target.value)} />

            <div className="card-actions">
              <button className="btn-save" onClick={() => onSave(vehicle.vin)} disabled={!isFormValid()}><FaSave /> Save</button>
              <button className="btn-cancel" onClick={() => onCancel(vehicle.vin)}><FaTimes /> Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main VehiclePage
export default function VehiclePage({ vehicles, deleteVehicle, editVehicle, setShowModal }) {
  const [editingVin, setEditingVin] = useState(null);
  const [editableVehicles, setEditableVehicles] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleEditClick = (vehicle) => {
    setEditingVin(vehicle.vin);
    setEditableVehicles(prev => ({
      ...prev,
      [vehicle.vin]: { ...vehicle }
    }));
  };

  const handleFieldEdit = (vin, field, value) => {
    setEditableVehicles(prev => ({ ...prev, [vin]: { ...prev[vin], [field]: value } }));
  };

  const handleSave = async (vin) => {
    const vehicleData = editableVehicles[vin];
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    if (requiredFields.some(f => !vehicleData[f])) {
      alert("Please fill all required fields");
      return;
    }
    await editVehicle(vin, vehicleData);
    setEditingVin(null);
  };

  const handleCancel = (vin) => {
    setEditingVin(null);
    setEditableVehicles(prev => {
      const newState = { ...prev };
      delete newState[vin];
      return newState;
    });
  };

  const filteredVehicles = vehicles.filter(v => 
    (v.make?.toLowerCase().includes(searchQuery.toLowerCase()) || v.model?.toLowerCase().includes(searchQuery.toLowerCase()) || v.vin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus ? v.status === filterStatus : true)
  );

  const summaryCards = [
    { label: "Total Vehicles", value: vehicles.length, icon: <FaCar />, color: "var(--space-blue)" },
    { label: "Available", value: vehicles.filter(v => v.status === "Available").length, icon: <FaCheckCircle />, color: "var(--status-available)" },
    { label: "In Use", value: vehicles.filter(v => v.status === "In Use").length, icon: <FaCar />, color: "var(--status-in-use)" },
    { label: "Maintenance", value: vehicles.filter(v => v.status === "In Maintenance").length, icon: <FaTools />, color: "var(--status-maintenance)" }
  ];

  return (
    <div className="vehicle-page">
      <div className="page-header">
        <h1>Pangolin Fleet</h1>
        <p>Vehicle Management</p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, idx) => <SummaryCard key={idx} {...card} />)}
      </div>

      <div className="toolbar">
        <input type="text" placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">Maintenance</option>
        </select>
        <button className="btn-add" onClick={() => setShowModal(true)}><FaPlus /> Add Vehicle</button>
      </div>

      <div className="vehicles-grid">
        {filteredVehicles.map(vehicle => (
          <VehicleCard 
            key={vehicle.vin}
            vehicle={vehicle}
            isEditing={editingVin === vehicle.vin}
            editableVehicle={editableVehicles[vehicle.vin] || {}}
            onEdit={handleEditClick}
            onDelete={deleteVehicle}
            onSave={handleSave}
            onCancel={handleCancel}
            onFieldEdit={handleFieldEdit}
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && <div className="empty-state">No vehicles found</div>}
    </div>
  );
}
