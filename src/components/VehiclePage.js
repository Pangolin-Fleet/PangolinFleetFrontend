import React, { useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes, FaRoad } from "react-icons/fa";
import "./VehiclePage.css";

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div className="summary-value" style={{ color }}>
        {value}
      </div>
      <div className="summary-label">
        {icon} {label}
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
  userRole
}) {
  const statusClass = vehicle.status.toLowerCase().replace(' ', '-');

  const isFormValid = () => {
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    return requiredFields.every(field => editableVehicle[field]?.toString().trim());
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== vehicle.status) {
      onUpdateStatus(vehicle.vin, newStatus);
    }
  };

  if (isEditing) {
    return (
      <div className={`vehicle-card ${statusClass}`}>
        <div className="vehicle-card-header">
          <div className="vehicle-title">Edit Vehicle</div>
          <span className={`status-pill ${statusClass}`}>{vehicle.status}</span>
        </div>
        <div className="vehicle-card-body">
          <div className="edit-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Make *</label>
                <input
                  value={editableVehicle.make || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'make', e.target.value)}
                  placeholder="Vehicle make"
                />
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input
                  value={editableVehicle.model || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'model', e.target.value)}
                  placeholder="Vehicle model"
                />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={editableVehicle.year || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'year', e.target.value)}
                  placeholder="Manufacture year"
                />
              </div>
              <div className="form-group">
                <label>Mileage *</label>
                <input
                  type="number"
                  value={editableVehicle.mileage || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'mileage', e.target.value)}
                  placeholder="Current mileage"
                />
              </div>
              <div className="form-group full-width">
                <label>Status *</label>
                <select
                  value={editableVehicle.status || "Available"}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'status', e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={editableVehicle.description || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'description', e.target.value)}
                  placeholder="Vehicle description"
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Disc Expiry</label>
                <input
                  type="date"
                  value={editableVehicle.discExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'discExpiryDate', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>License Expiry</label>
                <input
                  type="date"
                  value={editableVehicle.licenseExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'licenseExpiryDate', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Insurance Expiry</label>
                <input
                  type="date"
                  value={editableVehicle.insuranceExpiryDate || ""}
                  onChange={(e) => onFieldEdit(vehicle.vin, 'insuranceExpiryDate', e.target.value)}
                />
              </div>

              {!isFormValid() && (
                <div className="validation-msg">Please fill in all required fields</div>
              )}

              <div className="form-group full-width">
                <div className="form-actions">
                  <button
                    className="btn-save"
                    onClick={() => onSave(vehicle.vin)}
                    disabled={!isFormValid()}
                  >
                    <FaSave /> Save Changes
                  </button>
                  <button className="btn-cancel" onClick={() => onCancel(vehicle.vin)}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`vehicle-card ${statusClass}`}>
      <div className="vehicle-card-header">
        <div className="vehicle-title">{vehicle.make} {vehicle.model}</div>
        <span className={`status-pill ${statusClass}`}>{vehicle.status}</span>
      </div>
      <div className="vehicle-card-body">
        <div className="vehicle-info">
          <div className="info-item">
            <span className="info-label">VIN:</span>
            <span className="info-value">{vehicle.vin}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Year:</span>
            <span className="info-value">{vehicle.year}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mileage:</span>
            <span className="info-value">
              <div className="mileage-section">
                <span>{vehicle.mileage?.toLocaleString()} km</span>
                <button
                  onClick={() => onIncrementMileage(vehicle.vin, 100)}
                  className="mileage-btn"
                  title="Add 100 km"
                >
                  <FaRoad /> +100
                </button>
              </div>
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value">
              <select
                value={vehicle.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
                disabled={userRole !== "ADMIN"} // only Admin can change
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="In Maintenance">Maintenance</option>
              </select>
            </span>
          </div>

          {/* Visible to both Admin and Driver */}
          <div className="info-item">
            <span className="info-label">Description:</span>
            <span className="info-value">{vehicle.description || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Disc Expiry:</span>
            <span className="info-value">{vehicle.discExpiryDate || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">License Expiry:</span>
            <span className="info-value">{vehicle.licenseExpiryDate || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Insurance Expiry:</span>
            <span className="info-value">{vehicle.insuranceExpiryDate || "N/A"}</span>
          </div>
        </div>

        {/* Admin-only actions */}
        {userRole === "ADMIN" && (
          <div className="card-actions">
            <button className="btn-edit" onClick={() => onEdit(vehicle)}>
              <FaEdit /> Edit
            </button>
            <button className="btn-delete" onClick={() => onDelete(vehicle.vin)}>
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
  user
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

  const summaryCards = [
    { label: "Total Vehicles", value: vehicles.length, icon: "🚗", color: "#00d4ff" },
    { label: "Available", value: vehicles.filter(v => v.status === "Available").length, icon: "✅", color: "#10b981" },
    { label: "In Use", value: vehicles.filter(v => v.status === "In Use").length, icon: "🛣️", color: "#f59e0b" },
    { label: "Maintenance", value: vehicles.filter(v => v.status === "In Maintenance").length, icon: "🔧", color: "#ef4444" }
  ];

  return (
    <div className="vehicle-page">
      <div className="page-header">
        <h1>Vehicle Fleet</h1>
        <p>Manage your vehicle inventory</p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} {...card} />
        ))}
      </div>

      {/* Only Admin sees Add Vehicle button */}
      {user.role === "ADMIN" && (
        <div className="toolbar">
          <button className="btn-add" onClick={() => setShowModal(true)}>Add Vehicle</button>
        </div>
      )}

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
            onUpdateStatus={updateStatus}
            userRole={user.role}
          />
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="empty-state">
          <h3>No vehicles found</h3>
        </div>
      )}
    </div>
  );
}
