import React, { useState, useEffect } from "react";
import {
  FaEdit, FaTrash, FaSearch, FaTools, FaCar, FaExclamationTriangle,
  FaUserCog, FaMoneyBillWave, FaCalendarAlt, FaTachometerAlt, 
  FaSave, FaTimes, FaSpinner, FaPlus, FaWrench, FaFilter, FaTimesCircle
} from "react-icons/fa";
import maintenanceService from "../service/MaintenanceService";
import vehicleService from "../service/VehicleService";
import "./MaintenancePage.css";

export default function MaintenancePage({ vehicles, updateStatus, updateVehicle, incrementMileage, theme, user }) {
  const [maintenances, setMaintenances] = useState([]);
  const [form, setForm] = useState({
    vin: "", 
    vehicleName: "", 
    severity: "Low", 
    problem: "", 
    mileage: "", 
    technician: "", 
    cost: "", 
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const severityColors = { 
    Low: "#10b981", 
    Medium: "#f59e0b", 
    High: "#ef4444", 
    Critical: "#dc2626" 
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  // Filter vehicles to only show those in maintenance status
  const maintenanceVehicles = vehicles.filter(v => v.status === "In Maintenance");

  useEffect(() => {
    const selectedVehicle = maintenanceVehicles.find(v => v.vin === form.vin);
    setForm(prev => ({
      ...prev,
      vehicleName: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "",
      mileage: selectedVehicle ? selectedVehicle.mileage || "" : ""
    }));
  }, [form.vin, maintenanceVehicles]);

  const fetchMaintenanceData = async () => {
    try {
      setIsLoading(true);
      const maintenancesData = await maintenanceService.getAllMaintenance();
      setMaintenances(maintenancesData);
    } catch (err) {
      console.error("Error fetching maintenance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaintenances = maintenances.filter(m => 
    (!searchTerm || 
      (m.vehicle?.vin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}`.toLowerCase() : "").includes(searchTerm.toLowerCase()) ||
      (m.mechanic || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.problem || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) && (!filterSeverity || m.severity === filterSeverity)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicle = maintenanceVehicles.find(v => v.vin === form.vin);
      if (!vehicle) return alert("Select a vehicle first!");

      const maintenanceData = {
        vehicle, 
        severity: form.severity, 
        problem: form.problem,
        mileage: parseInt(form.mileage) || 0, 
        mechanic: form.technician,
        cost: parseFloat(form.cost) || 0, 
        serviceDate: form.date
      };

      if (editingId) {
        await maintenanceService.updateMaintenance(editingId, maintenanceData);
      } else {
        await maintenanceService.addMaintenance(maintenanceData);
      }

      await fetchMaintenanceData();
      resetForm();
    } catch (err) {
      console.error("Error saving maintenance record:", err);
      alert("Failed to save maintenance record");
    }
  };

  const handleEdit = (record) => {
    setForm({
      vin: record.vehicle?.vin || "",
      vehicleName: record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : "",
      severity: record.severity || "Low",
      problem: record.problem || "",
      mileage: record.mileage?.toString() || "",
      technician: record.mechanic || "",
      cost: record.cost?.toString() || "",
      date: record.serviceDate || new Date().toISOString().split('T')[0],
    });
    setEditingId(record.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances(maintenances.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete maintenance record");
    }
  };

  const resetForm = () => {
    setForm({ 
      vin: "", 
      vehicleName: "", 
      severity: "Low", 
      problem: "", 
      mileage: "", 
      technician: "", 
      cost: "", 
      date: new Date().toISOString().split('T')[0] 
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterSeverity("");
  };

  // Summary statistics
  const summaryCards = [
    { 
      label: "Total Records", 
      value: maintenances.length, 
      icon: <FaTools />, 
      color: "#6366f1" 
    },
    { 
      label: "Low Severity", 
      value: maintenances.filter(m => m.severity === "Low").length, 
      icon: <FaExclamationTriangle />, 
      color: "#11b37dff" 
    },
    { 
      label: "Medium Severity", 
      value: maintenances.filter(m => m.severity === "Medium").length, 
      icon: <FaExclamationTriangle />, 
      color: "#f59e0b" 
    },
    { 
      label: "High Severity", 
      value: maintenances.filter(m => m.severity === "High" || m.severity === "Critical").length, 
      icon: <FaExclamationTriangle />, 
      color: "#ef4444" 
    }
  ];

  if (isLoading) {
    return (
      <div className="maintenance-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-main">
              <h1>Pangolin Fleet</h1>
              <p>Maintenance Management</p>
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || "Admin"}</div>
              <div className="user-role">{user?.role || "Administrator"}</div>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <FaSpinner className="spin large" />
          <p>Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Pangolin Fleet</h1>
            <p>Vehicle Maintenance & Service Records</p>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || "Admin"}</div>
            <div className="user-role">{user?.role || "Administrator"}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-cards">
            {summaryCards.map((card, idx) => (
              <div key={idx} className="summary-card">
                <div className="summary-card-content">
                  <div className="summary-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="summary-text">
                    <div className="summary-value" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="summary-label">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar with Search and Filters */}
        <div className="page-toolbar">
          <div className="search-filters">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search VIN, vehicle, technician, or problem..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="search-input" 
              />
            </div>
            
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)} 
              className="filter-select"
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {(searchTerm || filterSeverity) && (
              <button 
                onClick={clearFilters}
                className="btn-compact btn-cancel-compact"
              >
                <FaTimesCircle /> Clear
              </button>
            )}
          </div>

          <div className="action-buttons">
            <button 
              onClick={resetForm}
              className="btn-compact btn-mileage-compact"
            >
              <FaTimes /> Reset Form
            </button>
          </div>
        </div>

        {/* Maintenance Form Card */}
        <div className="maintenance-form-card vehicle-card">
          <div className="card-header">
            <div className="vehicle-title">
              <h3>
                <FaTools style={{ marginRight: '10px' }} />
                {editingId ? `Editing Maintenance Record` : "Create New Maintenance Record"}
              </h3>
            </div>
            <span className={`status-pill ${form.severity.toLowerCase().replace(' ', '-')}`}>
              {form.severity} {editingId ? "(Editing)" : ""}
            </span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaCar style={{ marginRight: '8px' }} /> 
                    Vehicle *
                  </label>
                  <select 
                    name="vin" 
                    value={form.vin} 
                    onChange={handleChange} 
                    className="form-select" 
                    required
                  >
                    <option value="">-- Select Vehicle --</option>
                    {maintenanceVehicles.length > 0 ? (
                      maintenanceVehicles.map(v => (
                        <option key={v.vin} value={v.vin}>
                          {v.vin} - {v.make} {v.model} ({v.mileage?.toLocaleString()} km)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No vehicles in maintenance</option>
                    )}
                  </select>
                  {maintenanceVehicles.length === 0 && (
                    <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '5px' }}>
                      No vehicles currently in maintenance status. Change vehicle status to "Maintenance" in the Vehicles page first.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaTachometerAlt style={{ marginRight: '8px' }} /> 
                    Mileage (km)
                  </label>
                  <input 
                    type="number" 
                    name="mileage" 
                    value={form.mileage} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="Current mileage" 
                    min="0" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaExclamationTriangle style={{ marginRight: '8px' }} /> 
                    Severity
                  </label>
                  <select 
                    name="severity" 
                    value={form.severity} 
                    onChange={handleChange} 
                    className="form-select" 
                    style={{ borderLeft: `4px solid ${severityColors[form.severity]}` }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaUserCog style={{ marginRight: '8px' }} /> 
                    Technician
                  </label>
                  <input 
                    type="text" 
                    name="technician" 
                    value={form.technician} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="Technician name" 
                  />
                </div>

                <div className="form-group span-full">
                  <label className="form-label">
                    <FaTools style={{ marginRight: '8px' }} /> 
                    Problem Description
                  </label>
                  <textarea 
                    name="problem" 
                    value={form.problem} 
                    onChange={handleChange} 
                    className="form-textarea" 
                    placeholder="Describe the maintenance issue..." 
                    rows="4" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaMoneyBillWave style={{ marginRight: '8px' }} /> 
                    Cost (R)
                  </label>
                  <input 
                    type="number" 
                    name="cost" 
                    value={form.cost} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt style={{ marginRight: '8px' }} /> 
                    Service Date
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-save" 
                  disabled={maintenanceVehicles.length === 0}
                >
                  <FaSave /> {editingId ? "Update Record" : "Save Record"}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={cancelEdit} 
                    className="btn btn-cancel"
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Maintenance History Section */}
        <div className="maintenance-records">
          <h2>
            <FaTools /> Maintenance History 
            <span className="records-count">{filteredMaintenances.length} records</span>
          </h2>
          
          {filteredMaintenances.length === 0 ? (
            <div className="empty-state">
              <FaTools className="empty-icon" />
              <h3>No Maintenance Records</h3>
              <p>
                {searchTerm || filterSeverity 
                  ? "Try adjusting your search criteria" 
                  : "No maintenance records found. Create your first maintenance record above."}
              </p>
              {(searchTerm || filterSeverity) && (
                <button className="btn btn-primary" onClick={clearFilters}>
                  <FaTimesCircle /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="vehicles-grid">
              {filteredMaintenances.map(record => (
                <div key={record.id} className={`vehicle-card ${record.severity?.toLowerCase().replace(' ', '-')}`}>
                  <div className="card-header">
                    <div className="vehicle-title">
                      <h3>
                        {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'Unknown Vehicle'}
                      </h3>
                      <span className="vehicle-year">
                        {record.vehicle?.vin || 'N/A'}
                      </span>
                    </div>
                    <span className={`status-pill ${record.severity?.toLowerCase().replace(' ', '-')}`}>
                      {record.severity}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="vehicle-info">
                      <div className="info-section">
                        <div className="info-row problem">
                          <span className="info-label">Problem</span>
                          <span className="info-value">{record.problem || 'No description'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Mileage</span>
                          <span className="info-value">{record.mileage?.toLocaleString() || 'N/A'} km</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Technician</span>
                          <span className="info-value">{record.mechanic || 'N/A'}</span>
                        </div>
                        <div className="info-row cost">
                          <span className="info-label">Cost</span>
                          <span className="info-value">R {record.cost ? parseFloat(record.cost).toLocaleString() : '0'}</span>
                        </div>
                        <div className="info-row date">
                          <span className="info-label">Date</span>
                          <span className="info-value">
                            {record.serviceDate ? new Date(record.serviceDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button onClick={() => handleEdit(record)} className="btn btn-edit">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="btn btn-delete">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}