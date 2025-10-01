import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt, FaSave, FaTimes, FaUndo, FaRoad, 
  FaTachometerAlt, FaUser, FaEdit, FaStickyNote, 
  FaCalendarAlt, FaSpinner, FaCalendarPlus, FaHistory,
  FaExclamationCircle, FaCar, FaPlus, FaTrash
} from "react-icons/fa";
import InUseService from "../service/InUseService";
import "./InUsePage.css";

export default function InUsePage({
  vehicles = [],
  updateStatus,
  editVehicleId,
  setEditVehicleId,
  darkMode,
  user,
  users = [] // Add users prop for driver dropdown
}) {
  const [inputs, setInputs] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [existingInUseRecords, setExistingInUseRecords] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [pitstops, setPitstops] = useState({}); // Track pitstops by vehicle VIN

  useEffect(() => {
    loadExistingInUseRecords();
  }, [refreshTrigger]);

  // Filter users to only show drivers
  const drivers = users ? users.filter(u => u.role === "DRIVER") : [];

  // Debug useEffect to see what's happening with users
  useEffect(() => {
    console.log("🔍 InUsePage - Users prop:", users);
    console.log("🔍 InUsePage - Drivers filtered:", drivers);
    if (drivers.length > 0) {
      console.log("🔍 InUsePage - Driver details:", drivers.map(d => ({
        username: d.username,
        name: d.name,
        role: d.role,
        email: d.email
      })));
    }
  }, [users]);

  const loadExistingInUseRecords = async () => {
    try {
      setIsLoading(true);
      const records = await InUseService.getAllInUse();
      const recordsMap = {};
      records.forEach((record) => {
        if (record.vehicle?.vin) {
          recordsMap[record.vehicle.vin] = record;
        }
      });
      setExistingInUseRecords(recordsMap);
    } catch (error) {
      console.error("Error loading in-use records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRefresh = () => setRefreshTrigger((p) => p + 1);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not set";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const validateForm = (vin) => {
    const data = inputs[vin] || {};
    const errors = {};
    
    if (!existingInUseRecords[vin]) {
      if (!data.currentLocation?.trim()) errors.currentLocation = "Current location is required";
      if (!data.destination?.trim()) errors.destination = "Destination is required";
      if (!data.driver?.trim()) errors.driver = "Driver is required";
      if (!data.kmOut || data.kmOut === "" || parseInt(data.kmOut) <= 0) errors.kmOut = "Valid distance is required";
    }
    
    setValidationErrors(prev => ({ ...prev, [vin]: errors }));
    return Object.keys(errors).length === 0;
  };

  const openEditor = (vehicle) => {
    const vin = vehicle.vin;
    const existingRecord = existingInUseRecords[vin];

    setInputs((prev) => ({
      ...prev,
      [vin]: {
        currentLocation: existingRecord?.currentLocation || "",
        destination: existingRecord?.destination || "",
        kmOut: existingRecord?.kmOut ?? "",
        driver: existingRecord?.driver || "",
        notes: existingRecord?.notes || "",
        startTime: existingRecord?.startTime ? new Date(existingRecord.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      },
    }));

    // Initialize pitstops for this vehicle
    if (existingRecord?.pitstops) {
      setPitstops(prev => ({ ...prev, [vin]: existingRecord.pitstops }));
    } else {
      setPitstops(prev => ({ ...prev, [vin]: [] }));
    }

    setEditVehicleId(vin);
    setValidationErrors(prev => ({ ...prev, [vin]: {} }));
  };

  // Pitstop functions
  const addPitstop = (vin) => {
    setPitstops(prev => ({
      ...prev,
      [vin]: [...(prev[vin] || []), { location: "", notes: "" }]
    }));
  };

  const updatePitstop = (vin, index, field, value) => {
    setPitstops(prev => ({
      ...prev,
      [vin]: prev[vin].map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const removePitstop = (vin, index) => {
    setPitstops(prev => ({
      ...prev,
      [vin]: prev[vin].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (vehicle) => {
    const vin = vehicle.vin;
    
    if (!validateForm(vin)) {
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: "Please fill in all required fields", success: false },
      }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [vin]: null })), 3500);
      return;
    }

    const data = inputs[vin] || {};
    const existingRecord = existingInUseRecords[vin];
    const vehiclePitstops = pitstops[vin] || [];

    setLoadingStates((prev) => ({ ...prev, [vin]: true }));

    try {
      const payload = {
        vehicle: vehicle,
        currentLocation: data.currentLocation?.trim() || "",
        destination: data.destination?.trim() || "",
        kmOut: data.kmOut ? parseInt(data.kmOut) : 0,
        driver: data.driver?.trim() || "",
        notes: data.notes?.trim() || "",
        startTime: data.startTime ? new Date(data.startTime).toISOString() : new Date().toISOString(),
        pitstops: vehiclePitstops.filter(stop => stop.location.trim() !== "") // Only save pitstops with locations
      };

      if (existingRecord) {
        await InUseService.updateInUse(existingRecord.id, payload);
      } else {
        await InUseService.addInUse(payload);
        updateStatus(vin, "In Use", payload);
      }

      await loadExistingInUseRecords();
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: existingRecord ? "Trip updated!" : "Trip started!", success: true },
      }));
      setEditVehicleId(null);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: "Save failed!", success: false },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [vin]: false }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [vin]: null })), 3500);
    }
  };

  const handleCancel = (vin) => {
    setEditVehicleId(null);
    setInputs((prev) => ({ ...prev, [vin]: {} }));
    setPitstops(prev => ({ ...prev, [vin]: [] }));
    setValidationErrors(prev => ({ ...prev, [vin]: {} }));
  };

  const endTrip = async (vehicle) => {
    const vin = vehicle.vin;
    if (!window.confirm("Are you sure you want to end this trip?")) return;

    setLoadingStates((prev) => ({ ...prev, [vin]: true }));
    try {
      updateStatus(vin, "Available", {
        currentLocation: "",
        destination: "",
        kmOut: null,
        driver: "",
        notes: "",
        pitstops: []
      });
      await loadExistingInUseRecords();
      setEditVehicleId(null);
      setPitstops(prev => ({ ...prev, [vin]: [] }));
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: "Trip ended successfully!", success: true },
      }));
    } catch (error) {
      console.error("Error ending trip:", error);
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: `Failed to end trip`, success: false },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [vin]: false }));
    }
  };

  const inUseVehicles = vehicles.filter(vehicle => 
    vehicle.status === "In Use" || editVehicleId === vehicle.vin
  );

  if (isLoading) {
    return (
      <div className="inuse-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-main">
              <h1>Active Missions</h1>
              <p>Track and manage vehicle trips</p>
            </div>
            <div className="header-actions">
              <div className="user-info">
                <span className="user-name">Welcome, {user?.username || 'User'}</span>
                <span className="user-role">({user?.role || 'User'})</span>
              </div>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <FaSpinner className="spin large" />
          <p>Loading active missions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inuse-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Active Missions</h1>
            <p>Track and manage vehicle trips</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.username || 'User'}</span>
              <span className="user-role">({user?.role || 'User'})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {inUseVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No Active Missions</h3>
            <p>All vehicles are currently available or in maintenance.</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {inUseVehicles.map((vehicle) => {
              const vin = vehicle.vin;
              const editing = editVehicleId === vin;
              const data = inputs[vin] || {};
              const status = saveStatus[vin];
              const loading = loadingStates[vin];
              const existingRecord = existingInUseRecords[vin];
              const errors = validationErrors[vin] || {};
              const vehiclePitstops = pitstops[vin] || [];

              return (
                <div key={vin} className={`inuse-card ${editing ? "editing" : ""}`}>
                  <div className="card-header">
                    <div className="vehicle-title">
                      <h3>{vehicle.make} {vehicle.model}</h3>
                      <span className="vehicle-year">{vehicle.year}</span>
                    </div>
                    <span className="status-pill in-use">
                      <FaCar className="status-icon" />
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="card-body">
                    {!editing ? (
                      <>
                        <div className="vehicle-info">
                          <div className="info-section">
                            <div className="info-row">
                              <span className="info-label">VIN:</span>
                              <span className="info-value">{vehicle.vin}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Mileage:</span>
                              <span className="info-value">{vehicle.mileage?.toLocaleString()} km</span>
                            </div>
                          </div>

                          <div className="info-section">
                            <div className="info-row">
                              <span className="info-label">Location:</span>
                              <span className="info-value">{existingRecord?.currentLocation || "Not set"}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Destination:</span>
                              <span className="info-value">{existingRecord?.destination || "Not set"}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Distance:</span>
                              <span className="info-value">{existingRecord?.kmOut != null ? `${existingRecord.kmOut} km` : "N/A"}</span>
                            </div>
                            {existingRecord?.driver && (
                              <div className="info-row">
                                <span className="info-label">Driver:</span>
                                <span className="info-value">{existingRecord.driver}</span>
                              </div>
                            )}
                          </div>

                          {existingRecord?.pitstops && existingRecord.pitstops.length > 0 && (
                            <div className="pitstops-section">
                              <h4 className="pitstops-title">Pitstops</h4>
                              <div className="pitstops-list">
                                {existingRecord.pitstops.map((stop, index) => (
                                  <div key={index} className="pitstop-item">
                                    <span className="pitstop-location">{stop.location}</span>
                                    {stop.notes && <span className="pitstop-notes"> - {stop.notes}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {existingRecord && (
                            <div className="timestamps-section">
                              <h4 className="timestamps-title">Trip Timeline</h4>
                              <div className="timestamps-grid">
                                <div className="timestamp-item">
                                  <span className="timestamp-label">Started:</span>
                                  <span className="timestamp-value">{formatDateTime(existingRecord.createdAt)}</span>
                                </div>
                                {existingRecord.updatedAt && (
                                  <div className="timestamp-item">
                                    <span className="timestamp-label">Updated:</span>
                                    <span className="timestamp-value">{formatDateTime(existingRecord.updatedAt)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="card-actions">
                          <button onClick={() => openEditor(vehicle)} disabled={loading} className="btn btn-edit">
                            {loading ? <FaSpinner className="spin" /> : <FaEdit />} 
                            {existingRecord ? "Edit Trip" : "Start Trip"}
                          </button>
                          {existingRecord && (
                            <button onClick={() => endTrip(vehicle)} disabled={loading} className="btn btn-delete">
                              {loading ? <FaSpinner className="spin" /> : <FaUndo />} 
                              End Trip
                            </button>
                          )}
                        </div>

                        {status && (
                          <div className={`status-message ${status.success ? 'success' : 'error'}`}>
                            {status.msg}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {!existingRecord && (
                          <div className="validation-message error">
                            <FaExclamationCircle /> Please fill in all required fields to start the trip
                          </div>
                        )}

                        <div className="edit-form">
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="form-label">Current Location *</label>
                              <input 
                                type="text" 
                                value={data.currentLocation || ""} 
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], currentLocation: e.target.value } }))} 
                                className={`form-input ${errors.currentLocation ? 'error' : ''}`} 
                                placeholder="Enter current location" 
                              />
                              {errors.currentLocation && <div className="error-message">{errors.currentLocation}</div>}
                            </div>

                            <div className="form-group">
                              <label className="form-label">Destination *</label>
                              <input 
                                type="text" 
                                value={data.destination || ""} 
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], destination: e.target.value } }))} 
                                className={`form-input ${errors.destination ? 'error' : ''}`} 
                                placeholder="Enter destination" 
                              />
                              {errors.destination && <div className="error-message">{errors.destination}</div>}
                            </div>

                            <div className="form-group">
                              <label className="form-label">Distance (km) *</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={data.kmOut || ""} 
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], kmOut: e.target.value } }))} 
                                className={`form-input ${errors.kmOut ? 'error' : ''}`} 
                                placeholder="Enter distance" 
                              />
                              {errors.kmOut && <div className="error-message">{errors.kmOut}</div>}
                            </div>

                            <div className="form-group">
                              <label className="form-label">Driver *</label>
                              <select
                                value={data.driver || ""}
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], driver: e.target.value } }))}
                                className={`form-select ${errors.driver ? 'error' : ''}`}
                              >
                                <option value="">-- Select Driver --</option>
                                {drivers.length > 0 ? (
                                  drivers.map(driver => (
                                    <option key={driver.username} value={driver.username}>
                                      {driver.name || driver.username} {driver.email ? `(${driver.email})` : ''}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>No drivers available</option>
                                )}
                              </select>
                              {errors.driver && <div className="error-message">{errors.driver}</div>}
                              {drivers.length === 0 && (
                                <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '5px' }}>
                                  No drivers found. Please add drivers in the User Management page.
                                </div>
                              )}
                            </div>

                            <div className="form-group full-width">
                              <label className="form-label">Notes</label>
                              <textarea 
                                value={data.notes || ""} 
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], notes: e.target.value } }))} 
                                className="form-textarea" 
                                rows="2" 
                                placeholder="Optional notes" 
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">Start Time</label>
                              <input 
                                type="datetime-local" 
                                value={data.startTime || ""} 
                                onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], startTime: e.target.value } }))} 
                                className="form-input" 
                              />
                            </div>

                            {/* Pitstops Section */}
                            <div className="form-group full-width">
                              <div className="pitstops-header">
                                <label className="form-label">Pitstops</label>
                                <button 
                                  type="button" 
                                  onClick={() => addPitstop(vin)} 
                                  className="btn btn-mileage"
                                >
                                  <FaPlus /> Add Pitstop
                                </button>
                              </div>
                              
                              {vehiclePitstops.map((stop, index) => (
                                <div key={index} className="pitstop-form">
                                  <div className="pitstop-inputs">
                                    <input
                                      type="text"
                                      value={stop.location}
                                      onChange={(e) => updatePitstop(vin, index, 'location', e.target.value)}
                                      className="form-input"
                                      placeholder="Pitstop location"
                                    />
                                    <input
                                      type="text"
                                      value={stop.notes}
                                      onChange={(e) => updatePitstop(vin, index, 'notes', e.target.value)}
                                      className="form-input"
                                      placeholder="Notes (optional)"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removePitstop(vin, index)}
                                      className="btn btn-delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="form-actions full-width">
                              <button onClick={() => handleSave(vehicle)} disabled={loading} className="btn btn-save">
                                {loading ? <FaSpinner className="spin" /> : <FaSave />} 
                                {existingRecord ? "Update Trip" : "Start Trip"}
                              </button>
                              <button onClick={() => handleCancel(vin)} disabled={loading} className="btn btn-cancel">
                                <FaTimes /> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}