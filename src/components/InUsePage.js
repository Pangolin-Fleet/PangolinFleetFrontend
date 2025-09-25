import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt, FaSave, FaTimes, FaUndo, FaRoad, 
  FaTachometerAlt, FaUser, FaEdit, FaStickyNote, 
  FaCalendarAlt, FaSpinner, FaCalendarPlus, FaHistory,
  FaExclamationCircle, FaCar
} from "react-icons/fa";
import InUseService from "../service/InUseService";
import "./InUsePage.css";

export default function InUsePage({
  vehicles = [],
  updateStatus,
  editVehicleId,
  setEditVehicleId,
  darkMode,
}) {
  const [inputs, setInputs] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [existingInUseRecords, setExistingInUseRecords] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadExistingInUseRecords();
  }, [refreshTrigger]);

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
      if (!data.driver?.trim()) errors.driver = "Driver name is required";
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
    setEditVehicleId(vin);
    setValidationErrors(prev => ({ ...prev, [vin]: {} }));
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
      });
      await loadExistingInUseRecords();
      setEditVehicleId(null);
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
          <h1>Pangolin Fleet</h1>
          <p>Active Missions</p>
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
        <h1>Pangolin Fleet</h1>
        <p>Active Missions & Vehicle Tracking</p>
      </div>

      <div className="page-content">
        {inUseVehicles.length === 0 ? (
          <div className="no-vehicles-message">
            <FaCar className="icon-large" />
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

              return (
                <div key={vin} className={`inuse-card ${editing ? "editing" : ""}`}>
                  <div className="card-header">
                    <span className="vehicle-title">{vehicle.make} {vehicle.model}</span>
                    <span className="status-pill">{vehicle.status}</span>
                  </div>

                  <div className="card-body">
                    {!editing ? (
                      <>
                        <div className="card-info">
                          <p><FaMapMarkerAlt className="icon" /> <span className="label">Location:</span> {existingRecord?.currentLocation || "Not set"}</p>
                          <p><FaMapMarkerAlt className="icon" /> <span className="label">Destination:</span> {existingRecord?.destination || "Not set"}</p>
                          <p><FaRoad className="icon" /> <span className="label">Distance:</span> {existingRecord?.kmOut != null ? `${existingRecord.kmOut} km` : "N/A"}</p>
                          <p><FaTachometerAlt className="icon" /> <span className="label">Vehicle Mileage:</span> {vehicle.mileage} km</p>
                          {existingRecord?.driver && <p><FaUser className="icon" /> <span className="label">Driver:</span> {existingRecord.driver}</p>}
                          {existingRecord?.notes && <p><FaStickyNote className="icon" /> <span className="label">Notes:</span> {existingRecord.notes}</p>}
                        </div>

                        {existingRecord && (
                          <div className="timestamps">
                            <div className="ts-row">
                              <span><FaCalendarPlus className="icon" /> Started:</span>
                              <span>{formatDateTime(existingRecord.createdAt)}</span>
                            </div>
                            {existingRecord.updatedAt && (
                              <div className="ts-row">
                                <span><FaHistory className="icon" /> Updated:</span>
                                <span>{formatDateTime(existingRecord.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="card-actions">
                          <button onClick={() => openEditor(vehicle)} disabled={loading} className="btn-yellow">
                            {loading ? <FaSpinner className="spin" /> : <FaEdit />} 
                            {existingRecord ? "Edit Trip" : "Start Trip"}
                          </button>
                          {existingRecord && (
                            <button onClick={() => endTrip(vehicle)} disabled={loading} className="btn-red">
                              {loading ? <FaSpinner className="spin" /> : <FaUndo />} 
                              End Trip
                            </button>
                          )}
                        </div>

                        {status && (
                          <div className={`status-msg ${status.success ? "success" : "error"}`}>
                            {status.msg}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {!existingRecord && (
                          <div className="status-msg error">
                            <FaExclamationCircle /> Please fill in all required fields to start the trip
                          </div>
                        )}

                        <div className="form-group">
                          <label className="label"><FaMapMarkerAlt className="icon" /> Current Location *</label>
                          <input type="text" value={data.currentLocation || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], currentLocation: e.target.value } }))} className={`input ${errors.currentLocation ? 'error' : ''}`} placeholder="Enter current location" />
                          {errors.currentLocation && <div className="error-message"><FaExclamationCircle /> {errors.currentLocation}</div>}
                        </div>

                        <div className="form-group">
                          <label className="label"><FaMapMarkerAlt className="icon" /> Destination *</label>
                          <input type="text" value={data.destination || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], destination: e.target.value } }))} className={`input ${errors.destination ? 'error' : ''}`} placeholder="Enter destination" />
                          {errors.destination && <div className="error-message"><FaExclamationCircle /> {errors.destination}</div>}
                        </div>

                        <div className="form-group">
                          <label className="label"><FaRoad className="icon" /> Distance (km) *</label>
                          <input type="number" min="0" value={data.kmOut || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], kmOut: e.target.value } }))} className={`input ${errors.kmOut ? 'error' : ''}`} placeholder="Enter distance" />
                          {errors.kmOut && <div className="error-message"><FaExclamationCircle /> {errors.kmOut}</div>}
                        </div>

                        <div className="form-group">
                          <label className="label"><FaUser className="icon" /> Driver *</label>
                          <input type="text" value={data.driver || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], driver: e.target.value } }))} className={`input ${errors.driver ? 'error' : ''}`} placeholder="Enter driver name" />
                          {errors.driver && <div className="error-message"><FaExclamationCircle /> {errors.driver}</div>}
                        </div>

                        <div className="form-group">
                          <label className="label"><FaStickyNote className="icon" /> Notes</label>
                          <textarea value={data.notes || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], notes: e.target.value } }))} className="textarea" rows="3" placeholder="Optional notes" />
                        </div>

                        <div className="form-group">
                          <label className="label"><FaCalendarAlt className="icon" /> Start Time</label>
                          <input type="datetime-local" value={data.startTime || ""} onChange={(e) => setInputs(prev => ({ ...prev, [vin]: { ...prev[vin], startTime: e.target.value } }))} className="input" />
                        </div>

                        <div className="card-actions">
                          <button onClick={() => handleSave(vehicle)} disabled={loading} className="btn-green">
                            {loading ? <FaSpinner className="spin" /> : <FaSave />} 
                            {existingRecord ? "Update Trip" : "Start Trip"}
                          </button>
                          <button onClick={() => handleCancel(vin)} disabled={loading} className="btn-red">
                            <FaTimes /> Cancel
                          </button>
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