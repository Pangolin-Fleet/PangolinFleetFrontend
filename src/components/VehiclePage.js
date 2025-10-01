import React, { useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes, FaRoad, FaPlus, FaCar, FaCheck, FaWrench, FaClock } from "react-icons/fa";
import "./VehiclePage.css";

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div className="summary-card-content">
        <div className="summary-icon" style={{ color }}>
          {icon}
        </div>
        <div className="summary-text">
          <div className="summary-value" style={{ color }}>
            {value}
          </div>
          <div className="summary-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  isEditing,
  editableVehicle,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onFieldEdit,
  onIncrementMileage,
  onUpdateStatus,
  userRole,
  onStatusChange
}) {
  const statusClass = vehicle.status.toLowerCase().replace(' ', '-');

  const isFormValid = () => {
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    return requiredFields.every(field => editableVehicle[field]?.toString().trim());
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== vehicle.status) {
      onStatusChange(vehicle.vin, newStatus);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return <FaCheck className="status-icon" />;
      case 'In Use': return <FaCar className="status-icon" />;
      case 'In Maintenance': return <FaWrench className="status-icon" />;
      default: return <FaClock className="status-icon" />;
    }
  };

  if (isEditing) {
    return (
      <div className={`vehicle-card editing ${statusClass}`}>
        <div className="card-header">
          <div className="card-title">Edit Vehicle</div>
          <span className={`status-pill ${statusClass}`}>
            {getStatusIcon(vehicle.status)}
            {vehicle.status}
          </span>
        </div>
        <div className="card-body">
          <div className="edit-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Make *</label>
                <input
                  className="form-input"
                  value={editableVehicle.make || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'make', e.target.value)}
                  placeholder="Vehicle make"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  className="form-input"
                  value={editableVehicle.model || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'model', e.target.value)}
                  placeholder="Vehicle model"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <input
                  className="form-input"
                  type="number"
                  value={editableVehicle.year || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'year', e.target.value)}
                  placeholder="Manufacture year"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mileage *</label>
                <input
                  className="form-input"
                  type="number"
                  value={editableVehicle.mileage || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'mileage', e.target.value)}
                  placeholder="Current mileage"
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={editableVehicle.status || "Available"}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'status', e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editableVehicle.description || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'description', e.target.value)}
                  placeholder="Vehicle description"
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Disc Expiry</label>
                <input
                  className="form-input"
                  type="date"
                  value={editableVehicle.discExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'discExpiryDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input
                  className="form-input"
                  type="date"
                  value={editableVehicle.licenseExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'licenseExpiryDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Insurance Expiry</label>
                <input
                  className="form-input"
                  type="date"
                  value={editableVehicle.insuranceExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'insuranceExpiryDate', e.target.value)}
                />
              </div>

              {!isFormValid() && (
                <div className="validation-message error">
                  Please fill in all required fields
                </div>
              )}

              <div className="form-actions full-width">
                <button
                  className="btn btn-save"
                  onClick={() => onSave(vehicle.vin)}
                  disabled={!isFormValid()}
                >
                  <FaSave /> Save
                </button>
                <button className="btn btn-cancel" onClick={() => onCancel(vehicle.vin)}>
                  <FaTimes /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`vehicle-card ${statusClass}`}>
      <div className="card-header">
        <div className="vehicle-title">
          <h3>{vehicle.make} {vehicle.model}</h3>
          <span className="vehicle-year">{vehicle.year}</span>
        </div>
        <span className={`status-pill ${statusClass}`}>
          {getStatusIcon(vehicle.status)}
          {vehicle.status}
        </span>
      </div>
      <div className="card-body">
        <div className="vehicle-info">
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">VIN:</span>
              <span className="info-value">{vehicle.vin}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mileage:</span>
              <span className="info-value">
                <div className="mileage-content">
                  <span>{vehicle.mileage?.toLocaleString()} km</span>
                  <button
                    onClick={() => onIncrementMileage(vehicle.vin, 100)}
                    className="btn-mileage"
                    title="Add 100 km"
                  >
                    <FaRoad /> +100
                  </button>
                </div>
              </span>
            </div>
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                  disabled={userRole !== "ADMIN"}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">Maintenance</option>
                </select>
              </span>
            </div>
            {vehicle.description && (
              <div className="info-row">
                <span className="info-label">Description:</span>
                <span className="info-value description-text">{vehicle.description}</span>
              </div>
            )}
          </div>

          <div className="expiry-section">
            <h4 className="expiry-title">Expiry Dates</h4>
            <div className="expiry-grid">
              <div className="expiry-item">
                <span className="expiry-label">Disc:</span>
                <span className={`expiry-value ${!vehicle.discExpiryDate || new Date(vehicle.discExpiryDate) < new Date() ? 'expired' : ''}`}>
                  {vehicle.discExpiryDate || "Not set"}
                </span>
              </div>
              <div className="expiry-item">
                <span className="expiry-label">License:</span>
                <span className={`expiry-value ${!vehicle.licenseExpiryDate || new Date(vehicle.licenseExpiryDate) < new Date() ? 'expired' : ''}`}>
                  {vehicle.licenseExpiryDate || "Not set"}
                </span>
              </div>
              <div className="expiry-item">
                <span className="expiry-label">Insurance:</span>
                <span className={`expiry-value ${!vehicle.insuranceExpiryDate || new Date(vehicle.insuranceExpiryDate) < new Date() ? 'expired' : ''}`}>
                  {vehicle.insuranceExpiryDate || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {userRole === "ADMIN" && (
          <div className="card-actions">
            <button className="btn btn-edit" onClick={() => onEdit(vehicle)}>
              <FaEdit /> Edit
            </button>
            <button className="btn btn-delete" onClick={() => onDelete(vehicle.vin)}>
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VehiclePage({
  vehicles,
  deleteVehicle,
  editVehicle,
  setShowModal,
  incrementMileage,
  updateStatus,
  user,
  onMaintenanceStatusChange
}) {
  const [editingVin, setEditingVin] = useState(null);
  const [editableVehicles, setEditableVehicles] = useState({});

  const handleEditClick = (vehicle) => {
    setEditingVin(vehicle.vin);
    setEditableVehicles(prev => ({ ...prev, [vehicle.vin]: { ...vehicle } }));
  };

  const handleFieldEdit = (vin, field, value) => {
    setEditableVehicles(prev => ({ ...prev, [vin]: { ...prev[vin], [field]: value } }));
  };

  const handleSave = async (vin) => {
    const vehicleData = editableVehicles[vin];
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    if (requiredFields.some(f => !vehicleData[f]?.toString().trim())) {
      alert("Please fill all required fields");
      return;
    }
    await editVehicle(vin, vehicleData);
    setEditingVin(null);
  };

  const handleCancel = (vin) => {
    setEditingVin(null);
    setEditableVehicles(prev => { const newState = { ...prev }; delete newState[vin]; return newState; });
  };

  // Enhanced status change handler
  const handleStatusChange = async (vin, newStatus) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    
    if (newStatus === "In Maintenance" && vehicle.status !== "In Maintenance") {
      // Vehicle is being moved to maintenance
      if (onMaintenanceStatusChange) {
        await onMaintenanceStatusChange(vehicle, "add");
      }
    } else if (vehicle.status === "In Maintenance" && newStatus !== "In Maintenance") {
      // Vehicle is being removed from maintenance
      if (onMaintenanceStatusChange) {
        await onMaintenanceStatusChange(vehicle, "remove");
      }
    }
    
    // Update the vehicle status
    await updateStatus(vin, newStatus);
  };

  const summaryCards = [
    { label: "Total Vehicles", value: vehicles.length, icon: <FaCar />, color: "#6366f1" },
    { label: "Available", value: vehicles.filter(v => v.status === "Available").length, icon: <FaCheck />, color: "#10b981" },
    { label: "In Use", value: vehicles.filter(v => v.status === "In Use").length, icon: <FaCar />, color: "#f59e0b" },
    { label: "Maintenance", value: vehicles.filter(v => v.status === "In Maintenance").length, icon: <FaWrench />, color: "#ef4444" }
  ];

  return (
    <div className="vehicle-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Vehicle Fleet</h1>
            <p>Manage your vehicle inventory efficiently</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.name || user?.username || 'User'}</span>
              <span className="user-role">({user?.role || 'User'})</span>
            </div>
            {/* Logout button removed from here */}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="summary-section">
          <div className="summary-cards">
            {summaryCards.map((card, idx) => (
              <SummaryCard key={idx} {...card} />
            ))}
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="page-toolbar">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Vehicle
            </button>
          </div>
        )}

        <div className="content-section">
          {vehicles.length > 0 ? (
            <div className="vehicles-grid">
              {vehicles.map(vehicle => (
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
                  onIncrementMileage={incrementMileage}
                  onStatusChange={handleStatusChange}
                  userRole={user.role}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <h3>No vehicles found</h3>
              <p>Get started by adding your first vehicle to the fleet</p>
              {user.role === "ADMIN" && (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <FaPlus /> Add First Vehicle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}