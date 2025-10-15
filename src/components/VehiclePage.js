import React, { useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes, FaRoad, FaPlus, FaCar, FaCheck, FaWrench, FaClock, FaFilter, FaTimesCircle, FaCheckSquare, FaSquare, FaUser } from "react-icons/fa";
import "./VehiclePage.css";

function SummaryCard({ label, value, icon, color, onClick }) {
  return (
    <div className="summary-card interactive" onClick={onClick} style={{ borderLeftColor: color }}>
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
      <div className="card-hover-effect">Click to view</div>
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
  onStatusChange,
  isSelected,
  onSelectVehicle,
  users = []
}) {
  const statusClass = vehicle.status.toLowerCase().replace(' ', '-');

  const isFormValid = () => {
    const requiredFields = ['make', 'model', 'year', 'mileage', 'status'];
    return requiredFields.every(field => editableVehicle[field]?.toString().trim());
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus !== vehicle.status) {
      await onStatusChange(vehicle.vin, newStatus);
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
    <div className={`vehicle-card ${statusClass} ${isSelected ? 'selected' : ''}`}>
      {/* Selection Checkbox */}
      {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
        <div className="vehicle-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectVehicle(vehicle.vin)}
            className="selection-checkbox"
          />
        </div>
      )}

      <div className="card-header">
        <div className="vehicle-title">
          <h3>{vehicle.make} {vehicle.model}</h3>
          <span className="vehicle-year">{vehicle.year}</span>
        </div>
        <span className={`status-pill ${statusClass}`}>
          {getStatusIcon(vehicle.status)}
          {vehicle.status}
          {vehicle.status === "In Use" && vehicle.assignedDriver && (
            <span className="assigned-driver-badge">
              <FaUser /> {vehicle.assignedDriver}
            </span>
          )}
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
                  disabled={!(userRole === "ADMIN" || userRole === "SUPERADMIN")}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">Maintenance</option>
                </select>
              </span>
            </div>
            
            {vehicle.status === "In Use" && vehicle.assignedDriver && (
              <div className="info-row">
                <span className="info-label">Assigned Driver:</span>
                <span className="info-value driver-assigned">
                  <FaUser /> {vehicle.assignedDriver}
                </span>
              </div>
            )}
            
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

        {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
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
  allVehicles,
  deleteVehicle,
  editVehicle,
  setShowModal,
  incrementMileage,
  updateStatus,
  user,
  onMaintenanceStatusChange,
  selectedVehicles,
  setSelectedVehicles,
  handleBulkStatusChange,
  handleBulkDelete,
  advancedFilters,
  setAdvancedFilters,
  clearAllFilters,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  statusCounts,
  users = [],
  // Add navigation props
  onNavigateToMaintenance = () => console.log('Navigate to maintenance'),
  onNavigateToReports = () => console.log('Navigate to reports')
}) {
  const [editingVin, setEditingVin] = useState(null);
  const [editableVehicles, setEditableVehicles] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  const handleStatusChange = async (vin, newStatus) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    await updateStatus(vin, newStatus);
    
    if (newStatus === "In Maintenance" && vehicle.status !== "In Maintenance") {
      if (onMaintenanceStatusChange) {
        await onMaintenanceStatusChange(vehicle, "add");
      }
    } else if (vehicle.status === "In Maintenance" && newStatus !== "In Maintenance") {
      if (onMaintenanceStatusChange) {
        await onMaintenanceStatusChange(vehicle, "remove");
      }
    }
  };

  const handleSelectVehicle = (vin) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vin)) {
        newSet.delete(vin);
      } else {
        newSet.add(vin);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === vehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(vehicles.map(v => v.vin)));
    }
  };

  const handleClearSelection = () => {
    setSelectedVehicles(new Set());
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      make: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      mileageFrom: '',
      mileageTo: ''
    });
  };

  const hasActiveFilters = searchQuery || filterStatus || 
    Object.values(advancedFilters).some(value => value !== '');

  const summaryCards = [
    { 
      label: "Total Vehicles", 
      value: allVehicles.length, 
      icon: <FaCar />, 
      color: "#6366f1",
      onClick: () => {
        setFilterStatus("");
        setSearchQuery("");
      }
    },
    { 
      label: "Available", 
      value: allVehicles.filter(v => v.status === "Available").length, 
      icon: <FaCheck />, 
      color: "#10b981",
      onClick: () => setFilterStatus("Available")
    },
    { 
      label: "In Use", 
      value: allVehicles.filter(v => v.status === "In Use").length, 
      icon: <FaCar />, 
      color: "#f59e0b",
      onClick: () => setFilterStatus("In Use")
    },
    { 
      label: "Maintenance", 
      value: allVehicles.filter(v => v.status === "In Maintenance").length, 
      icon: <FaWrench />, 
      color: "#ef4444",
      onClick: () => onNavigateToMaintenance()
    }
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

        {/* Bulk Actions */}
        {(user.role === "ADMIN" || user.role === "SUPERADMIN") && selectedVehicles.size > 0 && (
          <div className="bulk-actions">
            <div className="bulk-info">
              <span className="selected-count">{selectedVehicles.size}</span> vehicles selected
            </div>
            <div className="bulk-buttons">
              <select 
                onChange={(e) => handleBulkStatusChange(e.target.value)}
                className="bulk-select"
                defaultValue=""
              >
                <option value="" disabled>Change Status...</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="In Maintenance">Maintenance</option>
              </select>
              <button 
                onClick={handleBulkDelete}
                className="btn-compact btn-cancel-compact"
              >
                <FaTrash /> Delete Selected
              </button>
              <button 
                onClick={handleClearSelection}
                className="btn-compact btn-mileage-compact"
              >
                <FaTimesCircle /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Toolbar with Search and Filters */}
        <div className="page-toolbar">
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="In Maintenance">Maintenance</option>
            </select>

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`btn-compact ${showAdvancedFilters ? 'btn-primary-compact' : 'btn-mileage-compact'}`}
            >
              <FaFilter /> {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>

            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="btn-compact btn-cancel-compact"
              >
                <FaTimesCircle /> Clear
              </button>
            )}

            {(user.role === "ADMIN" || user.role === "SUPERADMIN") && vehicles.length > 0 && (
              <button 
                onClick={handleSelectAll}
                className="btn-compact btn-mileage-compact"
              >
                {selectedVehicles.size === vehicles.length ? <FaCheckSquare /> : <FaSquare />}
                {selectedVehicles.size === vehicles.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div className="action-buttons">
            {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
              <button className="btn-compact btn-primary-compact" onClick={() => setShowModal(true)}>
                <FaPlus /> Add Vehicle
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-header">
              <h4>Advanced Filters</h4>
              <button onClick={clearAdvancedFilters} className="btn-compact btn-mileage-compact">
                <FaTimesCircle /> Clear Filters
              </button>
            </div>
            <div className="filter-grid">
              <div className="form-group">
                <label className="form-label">Make</label>
                <input
                  type="text"
                  value={advancedFilters.make}
                  onChange={(e) => handleAdvancedFilterChange('make', e.target.value)}
                  className="form-input"
                  placeholder="Filter by make"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  value={advancedFilters.model}
                  onChange={(e) => handleAdvancedFilterChange('model', e.target.value)}
                  className="form-input"
                  placeholder="Filter by model"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year From</label>
                <input
                  type="number"
                  value={advancedFilters.yearFrom}
                  onChange={(e) => handleAdvancedFilterChange('yearFrom', e.target.value)}
                  className="form-input"
                  placeholder="From year"
                  min="1900"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year To</label>
                <input
                  type="number"
                  value={advancedFilters.yearTo}
                  onChange={(e) => handleAdvancedFilterChange('yearTo', e.target.value)}
                  className="form-input"
                  placeholder="To year"
                  min="1900"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mileage From</label>
                <input
                  type="number"
                  value={advancedFilters.mileageFrom}
                  onChange={(e) => handleAdvancedFilterChange('mileageFrom', e.target.value)}
                  className="form-input"
                  placeholder="Min mileage"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mileage To</label>
                <input
                  type="number"
                  value={advancedFilters.mileageTo}
                  onChange={(e) => handleAdvancedFilterChange('mileageTo', e.target.value)}
                  className="form-input"
                  placeholder="Max mileage"
                  min="0"
                />
              </div>
            </div>
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
                  isSelected={selectedVehicles.has(vehicle.vin)}
                  onSelectVehicle={handleSelectVehicle}
                  users={users}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <h3>No vehicles found</h3>
              <p>
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clear filters" 
                  : "Get started by adding your first vehicle to the fleet"
                }
              </p>
              {(user.role === "ADMIN" || user.role === "SUPERADMIN") && !hasActiveFilters && (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <FaPlus /> Add First Vehicle
                </button>
              )}
              {hasActiveFilters && (
                <button className="btn btn-primary" onClick={clearAllFilters}>
                  <FaTimesCircle /> Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}