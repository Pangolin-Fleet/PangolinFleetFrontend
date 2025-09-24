import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaUndo,
  FaRoad,
  FaTachometerAlt,
  FaUser,
  FaEdit,
  FaStickyNote,
  FaCalendarAlt,
  FaSpinner,
  FaCalendarPlus,
  FaHistory,
  FaExclamationCircle,
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

  const statusColors = {
    "In Use": "#ff6d00",
    Available: "#00c853",
    Maintenance: "#d50000",
  };

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
          recordsMap[record.vehicle.vin] = {
            ...record,
            createdAt: record.createdAt ?? record.created_at ?? null,
            updatedAt: record.updatedAt ?? record.updated_at ?? null,
            startTime: record.startTime ?? record.start_time ?? null,
          };
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
    
    // Required fields for new trips
    if (!existingInUseRecords[vin]) {
      if (!data.currentLocation?.trim()) {
        errors.currentLocation = "Current location is required";
      }
      if (!data.destination?.trim()) {
        errors.destination = "Destination is required";
      }
      if (!data.driver?.trim()) {
        errors.driver = "Driver name is required";
      }
      if (!data.kmOut || data.kmOut === "" || parseInt(data.kmOut) <= 0) {
        errors.kmOut = "Valid distance is required";
      }
    }
    
    // For updates, only validate if fields are being changed and are required
    if (existingInUseRecords[vin]) {
      if (data.currentLocation?.trim() === "") {
        errors.currentLocation = "Current location cannot be empty";
      }
      if (data.destination?.trim() === "") {
        errors.destination = "Destination cannot be empty";
      }
      if (data.driver?.trim() === "") {
        errors.driver = "Driver name cannot be empty";
      }
      if (data.kmOut !== undefined && data.kmOut !== null && (data.kmOut === "" || parseInt(data.kmOut) < 0)) {
        errors.kmOut = "Distance must be a positive number";
      }
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
        kmOut:
          existingRecord?.kmOut !== undefined && existingRecord?.kmOut !== null
            ? existingRecord.kmOut
            : "",
        driver: existingRecord?.driver || "",
        notes: existingRecord?.notes || "",
        startTime: existingRecord?.startTime
          ? new Date(existingRecord.startTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      },
    }));
    setEditVehicleId(vin);
    setValidationErrors(prev => ({ ...prev, [vin]: {} }));
  };

  const handleSave = async (vehicle) => {
    const vin = vehicle.vin;
    
    // Validate form before saving
    if (!validateForm(vin)) {
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: "Please fill in all required fields", success: false },
      }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [vin]: null }));
      }, 3500);
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
        kmOut:
          data.kmOut !== "" && data.kmOut !== undefined && data.kmOut !== null
            ? parseInt(data.kmOut)
            : 0,
        driver: data.driver?.trim() || "",
        notes: data.notes?.trim() || "",
        startTime: data.startTime
          ? new Date(data.startTime).toISOString()
          : new Date().toISOString(),
      };

      let result;
      if (existingRecord) {
        result = await InUseService.updateInUse(existingRecord.id, payload);
      } else {
        result = await InUseService.addInUse(payload);
        updateStatus(vin, "In Use", {
          currentLocation: payload.currentLocation,
          destination: payload.destination,
          kmOut: payload.kmOut,
          driver: payload.driver,
          notes: payload.notes,
        });
      }

      await loadExistingInUseRecords();
      setTimeout(forceRefresh, 400);

      setSaveStatus((prev) => ({
        ...prev,
        [vin]: {
          msg: existingRecord ? "Trip updated!" : "Trip started!",
          success: true,
        },
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
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [vin]: null }));
      }, 3500);
    }
  };

  const handleCancel = (vin) => {
    setEditVehicleId(null);
    setInputs((prev) => ({ ...prev, [vin]: {} }));
    setValidationErrors(prev => ({ ...prev, [vin]: {} }));
  };

  const endTrip = async (vehicle) => {
    const vin = vehicle.vin;
    const existingRecord = existingInUseRecords[vin];

    if (!window.confirm("Are you sure you want to end this trip?")) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [vin]: true }));
    try {
      if (existingRecord) {
        // Since there's no delete function, we'll update the record to mark it as completed
        // by adding an end time and setting the status
        const endTime = new Date().toISOString();
        
        const completedTripData = {
          ...existingRecord,
          vehicle: vehicle,
          endTime: endTime,
          status: "Completed", // Mark as completed instead of deleting
          // Keep all the existing data but add end time
          currentLocation: existingRecord.currentLocation,
          destination: existingRecord.destination,
          kmOut: existingRecord.kmOut,
          driver: existingRecord.driver,
          notes: existingRecord.notes,
          startTime: existingRecord.startTime,
        };

        // Update the record to mark it as completed
        await InUseService.updateInUse(existingRecord.id, completedTripData);
        
        console.log("Trip marked as completed with end time:", endTime);
      }

      // Update the vehicle status to "Available"
      updateStatus(vin, "Available", {
        currentLocation: "",
        destination: "",
        kmOut: null,
        driver: "",
        notes: "",
      });

      // Refresh the in-use records to remove this vehicle from the list
      await loadExistingInUseRecords();
      
      // Clear any edit state
      setEditVehicleId(null);

      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { msg: "Trip ended successfully! Vehicle is now available.", success: true },
      }));

      // Force a refresh to update the display
      setTimeout(forceRefresh, 100);

    } catch (error) {
      console.error("Error ending trip:", error);
      setSaveStatus((prev) => ({
        ...prev,
        [vin]: { 
          msg: `Failed to end trip: ${error.message}`, 
          success: false 
        },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [vin]: false }));
    }
  };

  // Filter vehicles that are "In Use" or being edited or available for starting trips
  const displayVehicles = vehicles.filter(vehicle => 
    vehicle.status === "In Use" || 
    editVehicleId === vehicle.vin ||
    !existingInUseRecords[vehicle.vin]
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spin large" />
        <p>Loading vehicle data...</p>
      </div>
    );
  }

  return (
    <div className="inuse-container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Pangolin Fleet</h1>
        <p>Active Missions & Available Vehicles</p>
      </div>

      {displayVehicles.length === 0 ? (
        <div className="no-vehicles-message">
          <FaTachometerAlt className="icon-large" />
          <h3>No Active Missions</h3>
          <p>All vehicles are currently available.</p>
        </div>
      ) : (
        <div className="vehicles-grid">
          {displayVehicles.map((vehicle) => {
            const vin = vehicle.vin;
            const editing = editVehicleId === vin;
            const data = inputs[vin] || {};
            const status = saveStatus[vin];
            const loading = loadingStates[vin];
            const existingRecord = existingInUseRecords[vin];
            const canStartTrip = !existingRecord && vehicle.status !== "In Use";
            const errors = validationErrors[vin] || {};
            const isFormValid = Object.keys(errors).length === 0;

            return (
              <div
                key={vin}
                className={`inuse-card ${editing ? "editing" : ""}`}
                style={{ borderLeft: `4px solid ${statusColors[vehicle.status] || "#666"}` }}
              >
                <div className="card-header" style={{ background: statusColors[vehicle.status] ?? "#666" }}>
                  <span className="vehicle-title">{vehicle.make} {vehicle.model}</span>
                  <span className="status-pill">
                    {canStartTrip ? "Available" : vehicle.status}
                  </span>
                </div>

                <div className="card-body">
                  {!editing ? (
                    <>
                      <div className="card-info">
                        <p><FaMapMarkerAlt className="icon" /> <span className="label">Location:</span> <strong>{existingRecord?.currentLocation || "Not set"}</strong></p>
                        <p><FaMapMarkerAlt className="icon" /> <span className="label">Destination:</span> <strong>{existingRecord?.destination || "Not set"}</strong></p>
                        <p><FaRoad className="icon" /> <span className="label">Distance:</span> <strong>{existingRecord?.kmOut != null ? `${existingRecord.kmOut} km` : "N/A"}</strong></p>
                        <p><FaTachometerAlt className="icon" /> <span className="label">Mileage:</span> <strong>{vehicle.mileage} km</strong></p>
                        {existingRecord?.driver && <p><FaUser className="icon" /> <span className="label">Driver:</span> <strong>{existingRecord.driver}</strong></p>}
                        {existingRecord?.notes && <p><FaStickyNote className="icon" /> <span className="label">Notes:</span> <strong>{existingRecord.notes}</strong></p>}
                      </div>

                      {existingRecord && (
                        <div className="timestamps">
                          <div className="ts-row">
                            <span><FaCalendarPlus className="icon" /> Started:</span>
                            <strong>{formatDateTime(existingRecord?.createdAt)}</strong>
                          </div>
                          <div className="ts-row">
                            <span><FaHistory className="icon" /> Updated:</span>
                            <strong>{existingRecord?.updatedAt ? formatDateTime(existingRecord.updatedAt) : "Not updated"}</strong>
                          </div>
                          {existingRecord.endTime && (
                            <div className="ts-row">
                              <span><FaCalendarAlt className="icon" /> Ended:</span>
                              <strong>{formatDateTime(existingRecord.endTime)}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="card-actions">
                        <button onClick={() => openEditor(vehicle)} disabled={loading} className="btn-yellow">
                          {loading ? <FaSpinner className="spin" /> : <FaEdit />} 
                          {existingRecord ? "Edit Trip" : "Start Trip"}
                        </button>
                        {existingRecord && vehicle.status === "In Use" && (
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
                    /* EDIT MODE */
                    <>
                      {!existingRecord && (
                        <div className="status-msg error" style={{ marginBottom: '15px' }}>
                          <FaExclamationCircle /> Please fill in all required fields to start the trip
                        </div>
                      )}

                      <div className="form-group">
                        <label className="label">
                          <FaMapMarkerAlt className="icon" /> 
                          Current Location {!existingRecord && <span style={{color: '#ff5252'}}>*</span>}
                        </label>
                        <input
                          type="text"
                          value={data.currentLocation || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], currentLocation: e.target.value } }))}
                          className={`input ${errors.currentLocation ? 'error' : ''}`}
                          placeholder="Enter current location"
                        />
                        {errors.currentLocation && (
                          <div className="error-message">
                            <FaExclamationCircle /> {errors.currentLocation}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="label">
                          <FaMapMarkerAlt className="icon" /> 
                          Destination {!existingRecord && <span style={{color: '#ff5252'}}>*</span>}
                        </label>
                        <input
                          type="text"
                          value={data.destination || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], destination: e.target.value } }))}
                          className={`input ${errors.destination ? 'error' : ''}`}
                          placeholder="Enter destination"
                        />
                        {errors.destination && (
                          <div className="error-message">
                            <FaExclamationCircle /> {errors.destination}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="label">
                          <FaRoad className="icon" /> 
                          Distance (km) {!existingRecord && <span style={{color: '#ff5252'}}>*</span>}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={data.kmOut || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], kmOut: e.target.value } }))}
                          className={`input ${errors.kmOut ? 'error' : ''}`}
                          placeholder="Enter distance"
                        />
                        {errors.kmOut && (
                          <div className="error-message">
                            <FaExclamationCircle /> {errors.kmOut}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="label">
                          <FaUser className="icon" /> 
                          Driver {!existingRecord && <span style={{color: '#ff5252'}}>*</span>}
                        </label>
                        <input
                          type="text"
                          value={data.driver || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], driver: e.target.value } }))}
                          className={`input ${errors.driver ? 'error' : ''}`}
                          placeholder="Enter driver name"
                        />
                        {errors.driver && (
                          <div className="error-message">
                            <FaExclamationCircle /> {errors.driver}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="label"><FaStickyNote className="icon" /> Notes</label>
                        <textarea
                          value={data.notes || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], notes: e.target.value } }))}
                          className="textarea"
                          rows="3"
                          placeholder="Optional notes"
                        />
                      </div>

                      <div className="form-group">
                        <label className="label"><FaCalendarAlt className="icon" /> Start Time</label>
                        <input
                          type="datetime-local"
                          value={data.startTime || ""}
                          onChange={(e) => setInputs((prev) => ({ ...prev, [vin]: { ...prev[vin], startTime: e.target.value } }))}
                          className="input"
                        />
                      </div>

                      <div className="card-actions">
                        <button 
                          onClick={() => handleSave(vehicle)} 
                          disabled={loading || (!existingRecord && !isFormValid)}
                          className="btn-green"
                        >
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
  );
}