import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaTools,
  FaCar,
  FaExclamationTriangle,
  FaUserCog,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTachometerAlt,
  FaSave,
  FaTimes,
  FaSpinner
} from "react-icons/fa";
import maintenanceService from "../service/MaintenanceService";
import vehicleService from "../service/VehicleService";
import "./MaintenancePage.css";

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [form, setForm] = useState({
    vin: "",
    vehicleName: "",
    severity: "Low",
    problem: "",
    mileage: "",
    technician: "",
    cost: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const severityColors = {
    Low: "#27ae60",
    Medium: "#f1c40f",
    High: "#e67e22",
    Critical: "#e74c3c",
  };

  // --- Fetch vehicles and maintenance records ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [vehiclesData, maintenancesData] = await Promise.all([
          vehicleService.getAllVehicles(),
          maintenanceService.getAllMaintenance()
        ]);
        
        setVehicles(vehiclesData);
        setMaintenances(maintenancesData);
        setFilteredMaintenances(maintenancesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-update vehicleName when VIN changes
  useEffect(() => {
    const selectedVehicle = vehicles.find((v) => v.vin === form.vin);
    setForm((prev) => ({
      ...prev,
      vehicleName: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "",
      mileage: selectedVehicle ? selectedVehicle.mileage || "" : ""
    }));
  }, [form.vin, vehicles]);

  // Filter & search
  useEffect(() => {
    let data = [...maintenances];

    if (searchTerm) {
      data = data.filter((m) =>
        (m.vehicle?.vin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}`.toLowerCase() : "").includes(searchTerm.toLowerCase()) ||
        (m.mechanic || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.problem || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeverity) {
      data = data.filter((m) => m.severity === filterSeverity);
    }

    setFilteredMaintenances(data);
  }, [searchTerm, filterSeverity, maintenances]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicle = vehicles.find((v) => v.vin === form.vin);
      if (!vehicle) return alert("Select a vehicle first!");

      const maintenanceData = {
        vehicle,
        severity: form.severity,
        problem: form.problem,
        mileage: parseInt(form.mileage) || 0,
        mechanic: form.technician,
        cost: parseFloat(form.cost) || 0,
        serviceDate: form.date,
      };

      if (editingId) {
        await maintenanceService.updateMaintenance(editingId, maintenanceData);
        setEditingId(null);
      } else {
        await maintenanceService.addMaintenance(maintenanceData);
      }

      const updatedList = await maintenanceService.getAllMaintenance();
      setMaintenances(updatedList);

      // Reset form
      setForm({
        vin: "",
        vehicleName: "",
        severity: "Low",
        problem: "",
        mileage: "",
        technician: "",
        cost: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record); // Debug log
    
    setForm({
      vin: record.vehicle?.vin || "",
      vehicleName: record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : "",
      severity: record.severity || "Low",
      problem: record.problem || "",
      mileage: record.mileage || "",
      technician: record.mechanic || "",
      cost: record.cost || "",
      date: record.serviceDate || new Date().toISOString().split('T')[0],
    });
    setEditingId(record.id);
    
    // Scroll to the form
    setTimeout(() => {
      document.querySelector('.maintenance-form-card')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances(maintenances.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      vin: "",
      vehicleName: "",
      severity: "Low",
      problem: "",
      mileage: "",
      technician: "",
      cost: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spin large" />
        <p>Loading maintenance data...</p>
      </div>
    );
  }

  return (
    <div className="inuse-container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Pangolin Fleet Maintenance</h1>
        <p>Vehicle Service & Maintenance Records</p>
      </div>

      {/* Search and Filter */}
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
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
      </div>

      {/* Maintenance Form Card */}
      <div className="inuse-card maintenance-form-card" style={{ marginBottom: '30px' }}>
        <div className="card-header" style={{ 
          background: editingId 
            ? `linear-gradient(135deg, ${severityColors[form.severity]} 0%, #1a237e 100%)`
            : `linear-gradient(135deg, ${severityColors[form.severity]} 0%, #1a237e 100%)`
        }}>
          <span className="vehicle-title">
            <FaTools style={{ marginRight: '10px' }} />
            {editingId ? `Editing Maintenance Record #${editingId}` : "Log New Maintenance"}
          </span>
          <span className="status-pill" style={{ backgroundColor: severityColors[form.severity] }}>
            {form.severity} {editingId ? "(Editing)" : ""}
          </span>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="label">
                  <FaCar className="icon" /> Vehicle
                </label>
                <select 
                  name="vin" 
                  value={form.vin} 
                  onChange={handleChange} 
                  className="input"
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.vin} value={v.vin}>
                      {v.vin} - {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">
                  <FaTachometerAlt className="icon" /> Mileage (km)
                </label>
                <input 
                  type="number" 
                  name="mileage" 
                  value={form.mileage} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Current mileage"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <FaExclamationTriangle className="icon" /> Severity
                </label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                  className="input"
                  style={{ 
                    backgroundColor: severityColors[form.severity] + '20',
                    borderLeft: `4px solid ${severityColors[form.severity]}`
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">
                  <FaUserCog className="icon" /> Technician
                </label>
                <input 
                  type="text" 
                  name="technician" 
                  value={form.technician} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="Technician name"
                />
              </div>

              <div className="form-group span-full">
                <label className="label">
                  <FaTools className="icon" /> Problem Description
                </label>
                <textarea 
                  name="problem" 
                  value={form.problem} 
                  onChange={handleChange} 
                  className="textarea"
                  placeholder="Describe the maintenance issue or service performed..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <FaMoneyBillWave className="icon" /> Cost (R)
                </label>
                <input 
                  type="number" 
                  name="cost" 
                  value={form.cost} 
                  onChange={handleChange} 
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <FaCalendarAlt className="icon" /> Service Date
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  className="input"
                />
              </div>

              <div className="card-actions">
                <button type="submit" className="btn-green">
                  <FaSave className="btn-icon" />
                  {editingId ? "Update Maintenance" : "Save Maintenance"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="btn-red">
                    <FaTimes className="btn-icon" />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Maintenance Records Grid */}
      <div className="maintenance-records">
        <h2 className="page-header" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
          <FaTools style={{ marginRight: '10px' }} />
          Maintenance History ({filteredMaintenances.length} records)
        </h2>
        
        {filteredMaintenances.length === 0 ? (
          <div className="no-vehicles-message">
            <FaTools className="icon-large" />
            <h3>No Maintenance Records Found</h3>
            <p>{searchTerm || filterSeverity ? "Try adjusting your search or filter criteria" : "No maintenance records have been logged yet"}</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {filteredMaintenances.map((record) => (
              <div key={record.id} className="inuse-card">
                <div 
                  className="card-header" 
                  style={{ background: severityColors[record.severity] }}
                >
                  <span className="vehicle-title">
                    {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'Unknown Vehicle'}
                  </span>
                  <span className="status-pill">
                    {record.severity}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-info">
                    <p><FaCar className="icon" /> <span className="label">VIN:</span> <strong>{record.vehicle?.vin || 'N/A'}</strong></p>
                    <p><FaExclamationTriangle className="icon" /> <span className="label">Problem:</span> <strong>{record.problem || 'No description'}</strong></p>
                    <p><FaTachometerAlt className="icon" /> <span className="label">Mileage:</span> <strong>{record.mileage?.toLocaleString() || 'N/A'} km</strong></p>
                    <p><FaUserCog className="icon" /> <span className="label">Technician:</span> <strong>{record.mechanic || 'N/A'}</strong></p>
                    <p><FaMoneyBillWave className="icon" /> <span className="label">Cost:</span> <strong>R {record.cost?.toLocaleString() || '0'}</strong></p>
                    <p><FaCalendarAlt className="icon" /> <span className="label">Date:</span> <strong>
                      {record.serviceDate ? new Date(record.serviceDate).toLocaleDateString() : 'N/A'}
                    </strong></p>
                  </div>

                  <div className="card-actions">
                    <button 
                      onClick={() => handleEdit(record)} 
                      className="btn-yellow"
                    >
                      <FaEdit /> Edit Record
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)} 
                      className="btn-red"
                    >
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
  );
}