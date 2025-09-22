import React, { useState } from "react";
import "./InUsePage.css";
import {
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaUndo,
  FaRoad,
  FaTachometerAlt,
  FaClock,
  FaUser,
  FaEdit,
  FaStickyNote,
  FaCalendarAlt,
} from "react-icons/fa";
import { ResponsiveContainer, LineChart, Line } from "recharts";

export default function InUsePage({
  vehicles,
  saveDestination,
  updateStatus,
  editVehicleId,
  setEditVehicleId,
  darkMode,
}) {
  const [inputs, setInputs] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  const statusColors = {
    "In Use": "#f39c12",
    Available: "#27ae60",
    Maintenance: "#e74c3c",
  };

  const openEditor = (record, index) => {
    const key = record.vehicle?.vin || record.id || index;
    setInputs((prev) => ({
      ...prev,
      [key]: {
        currentLocation: record.currentLocation || "",
        destination: record.destination || "",
        kmOut: record.kmOut || "",
        driver: record.driver || "",
        notes: record.notes || "",
        startTime: record.startTime
          ? new Date(record.startTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      },
    }));
    setEditVehicleId(key);
  };

  const handleSave = async (record, index) => {
    const key = record.vehicle?.vin || record.id || index;
    const data = inputs[key];

    try {
      await saveDestination(record.vehicle?.vin || record.id, data.destination);
      await updateStatus(record.vehicle?.vin || record.id, record.status || "In Use", {
        currentLocation: data.currentLocation,
        destination: data.destination,
        kmOut: Number(data.kmOut),
        driver: data.driver,
        notes: data.notes,
        startTime: data.startTime,
      });

      setSaveStatus((p) => ({ ...p, [key]: { msg: "Saved ✅", success: true } }));
    } catch (err) {
      console.error(err);
      setSaveStatus((p) => ({ ...p, [key]: { msg: "Failed ❌", success: false } }));
    }

    setEditVehicleId(null);
    setTimeout(() => setSaveStatus((p) => ({ ...p, [key]: null })), 3000);
  };

  const handleCancel = (key) => {
    setEditVehicleId(null);
    setInputs((p) => ({ ...p, [key]: {} }));
  };

  return (
    <div className={`inuse-container ${darkMode ? "dark" : ""}`}>
      {vehicles.map((record, index) => {
        const key = record.vehicle?.vin || record.id || index;
        const editing = editVehicleId === key;
        const data = inputs[key] || {};
        const status = saveStatus[key];

        const vehicleName = record.vehicle
          ? `${record.vehicle.make || record.make || "Unknown"} ${record.vehicle.model || record.model || ""}`.trim()
          : record.make && record.model
          ? `${record.make} ${record.model}`
          : "Unknown Vehicle";

        const mileagePercent = record.maxMileage ? (record.mileage / record.maxMileage) * 100 : 0;
        const lineColor = mileagePercent > 90 ? "#e74c3c" : "#27ae60";

        return (
          <div key={key} className="inuse-card">
            <div className="inuse-card-header" style={{ background: statusColors[record.status] || "#34495e" }}>
              <span>{vehicleName}</span>
              <span>{record.status}</span>
            </div>

            <div className="inuse-card-body">
              {!editing ? (
                <>
                  <p><FaMapMarkerAlt /> Current Location: <strong>{record.currentLocation || "N/A"}</strong></p>
                  <p><FaMapMarkerAlt /> Destination: <strong>{record.destination || "N/A"}</strong></p>
                  <p><FaRoad /> Distance: <strong>{record.kmOut ?? "N/A"} km</strong></p>
                  <p><FaUser /> Driver: <strong>{record.driver || "N/A"}</strong></p>
                  <p><FaStickyNote /> Notes: <strong>{record.notes || "N/A"}</strong></p>
                  <p><FaClock /> Start Time: <strong>{record.startTime ? new Date(record.startTime).toLocaleString() : "N/A"}</strong></p>
                  <p><FaCalendarAlt /> Created At: <strong>{record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}</strong></p>
                  <p><FaCalendarAlt /> Updated At: <strong>{record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "N/A"}</strong></p>

                  {/* Mileage Mini Chart */}
                  {record.maxMileage && (
                    <div className="mileage-chart">
                      <ResponsiveContainer width="100%" height={40}>
                        <LineChart data={[{ mileage: record.mileage || 0 }, { mileage: record.maxMileage }]}>
                          <Line type="monotone" dataKey="mileage" stroke={lineColor} strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <small>{Math.min(100, mileagePercent).toFixed(1)}% of max distance</small>
                    </div>
                  )}

                  <div className="inuse-card-buttons">
                    <button onClick={() => openEditor(record, index)} className="edit-btn"><FaEdit /> Edit</button>
                    <button onClick={() => handleCancel(key)} className="end-btn"><FaUndo /> End Trip</button>
                  </div>
                  {status && <p className={`save-status ${status.success ? "success" : "fail"}`}>{status.msg}</p>}
                </>
              ) : (
                <>
                  <label>Current Location</label>
                  <input type="text" value={data.currentLocation || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], currentLocation: e.target.value } }))} />

                  <label>Destination</label>
                  <input type="text" value={data.destination || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], destination: e.target.value } }))} />

                  <label>Distance (km)</label>
                  <input type="number" value={data.kmOut || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], kmOut: e.target.value } }))} />

                  <label>Driver</label>
                  <input type="text" value={data.driver || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], driver: e.target.value } }))} />

                  <label>Notes</label>
                  <textarea value={data.notes || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], notes: e.target.value } }))} />

                  <label>Start Time</label>
                  <input type="datetime-local" value={data.startTime || ""} onChange={(e) => setInputs((p) => ({ ...p, [key]: { ...p[key], startTime: e.target.value } }))} />

                  <div className="inuse-card-buttons">
                    <button onClick={() => handleSave(record, index)} className="save-btn"><FaSave /> Save</button>
                    <button onClick={() => handleCancel(key)} className="cancel-btn"><FaTimes /> Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
