import React, { useState, useEffect } from "react";
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

export default function InUsePage({
  vehicles,
  saveDestination,
  updateStatus,
  incrementMileage,
  editVehicleId,
  setEditVehicleId,
  darkMode,
}) {
  const [inputs, setInputs] = useState({});
  const [tripStartDistances, setTripStartDistances] = useState({});
  const [tripStartTimes, setTripStartTimes] = useState({});
  const [timer, setTimer] = useState(0);

  const statusColors = {
    "In Use": "#f39c12",
    Available: "#27ae60",
    Maintenance: "#e74c3c",
  };

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const openEditor = (vehicle) => {
    const vin = vehicle.vin;
    setInputs((p) => ({
      ...p,
      [vin]: {
        destination: vehicle.destination ?? "",
        kmOut: vehicle.distanceToDestination ?? vehicle.kmOut ?? "",
        driver: vehicle.driver ?? "",
        notes: vehicle.notes ?? "",
        startTime: vehicle.startTime ?? new Date().toISOString().slice(0, 16),
      },
    }));
    setEditVehicleId(vin);

    if (!tripStartDistances[vin] && vehicle.distanceToDestination != null) {
      setTripStartDistances((p) => ({ ...p, [vin]: vehicle.distanceToDestination }));
    }

    if (!tripStartTimes[vin]) {
      setTripStartTimes((p) => ({ ...p, [vin]: new Date() }));
    }
  };

  const handleSave = (vehicle) => {
    const vin = vehicle.vin;
    const data = inputs[vin];

    // Save destination and km
    saveDestination(vin, data.destination);
    updateStatus(vin, vehicle.status || "In Use", {
      distanceToDestination: Number(data.kmOut),
      driver: data.driver,
      notes: data.notes,
      startTime: data.startTime,
    });

    setEditVehicleId(null);
  };

  const handleCancel = (vin) => {
    setEditVehicleId(null);
    setInputs((p) => ({ ...p, [vin]: {} }));
  };

  const endTrip = (vehicle) => {
    updateStatus(vehicle.vin, "Available", {
      destination: "",
      distanceToDestination: null,
      notes: "",
      driver: "",
      startTime: null,
    });
    setEditVehicleId(null);
    setTripStartTimes((p) => ({ ...p, [vehicle.vin]: null }));
    setTripStartDistances((p) => ({ ...p, [vehicle.vin]: null }));
  };

  const calcProgress = (vehicle) => {
    const vin = vehicle.vin;
    const kmOut = vehicle.distanceToDestination ?? vehicle.kmOut ?? null;
    const start = tripStartDistances[vin];
    if (!start || kmOut == null) return null;
    return Math.max(0, Math.min(100, ((start - kmOut) / start) * 100));
  };

  const getProgressColor = (progress) => {
    if (progress < 50) return "#2ecc71"; // green
    if (progress < 90) return "#f39c12"; // orange
    return "#e74c3c"; // red
  };

  const formatElapsed = (vin) => {
    const start = tripStartTimes[vin];
    if (!start) return null;
    const diff = Math.floor((new Date() - new Date(start)) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
        gap: 20,
        padding: 20,
      }}
    >
      {vehicles.map((vehicle) => {
        const vin = vehicle.vin;
        const editing = editVehicleId === vin;
        const progress = calcProgress(vehicle);
        const elapsed = formatElapsed(vin);
        const data = inputs[vin] || {};

        return (
          <div
            key={vin}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: darkMode ? "#181a1f" : "#ffffff",
              color: darkMode ? "#f8f9fa" : "#222",
              boxShadow: editing
                ? darkMode
                  ? "0 12px 30px rgba(255, 215, 0, 0.6)"
                  : "0 12px 30px rgba(241, 196, 15, 0.4)"
                : darkMode
                ? "0 8px 24px rgba(0,0,0,0.6)"
                : "0 6px 16px rgba(0,0,0,0.1)",
              borderLeft: vehicle.status === "In Use" ? "6px solid #f39c12" : "none",
              transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.5s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = darkMode
                ? "0 18px 40px rgba(255, 215, 0, 0.6)"
                : "0 18px 40px rgba(241, 196, 15, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = editing
                ? darkMode
                  ? "0 12px 30px rgba(255, 215, 0, 0.6)"
                  : "0 12px 30px rgba(241, 196, 15, 0.4)"
                : darkMode
                ? "0 8px 24px rgba(0,0,0,0.6)"
                : "0 6px 16px rgba(0,0,0,0.1)";
            }}
          >
            {/* Header */}
            <div
              style={{
                background: statusColors[vehicle.status] ?? "#7f8c8d",
                color: "#fff",
                padding: 16,
                fontWeight: 700,
                fontSize: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {vehicle.make ?? "Vehicle"} {vehicle.model ?? ""}
              </span>
              <span>{vehicle.status}</span>
            </div>

            {/* Body */}
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {!editing ? (
                <>
                  <p>
                    <FaMapMarkerAlt /> Destination:{" "}
                    <strong>{vehicle.destination || "Not set"}</strong>
                  </p>
                  <p>
                    <FaRoad /> Distance remaining:{" "}
                    <strong>
                      {vehicle.distanceToDestination != null
                        ? `${vehicle.distanceToDestination} km`
                        : "N/A"}
                    </strong>
                  </p>
                  <p>
                    <FaTachometerAlt /> Mileage:{" "}
                    <strong>{vehicle.mileage ?? 0} km</strong>
                  </p>
                  {vehicle.driver && (
                    <p>
                      <FaUser /> Driver: <strong>{vehicle.driver}</strong>
                    </p>
                  )}
                  {vehicle.notes && (
                    <p>
                      <FaStickyNote /> Notes: <strong>{vehicle.notes}</strong>
                    </p>
                  )}
                  {elapsed && (
                    <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#e74c3c",
                          animation: "pulse 1.5s infinite",
                        }}
                      ></span>
                      <FaClock /> Elapsed: <strong>{elapsed}</strong>
                    </p>
                  )}
                  {progress !== null && (
                    <div style={{ height: 8, borderRadius: 4, background: darkMode ? "#333" : "#eee" }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: getProgressColor(progress),
                          transition: "width 0.3s ease, background 0.3s ease",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => openEditor(vehicle)}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        background: "#f1c40f",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => endTrip(vehicle)}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        background: "#e74c3c",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      <FaUndo /> End Trip
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* EDIT MODE */}
                  <label>
                    <FaMapMarkerAlt /> Destination
                  </label>
                  <input
                    type="text"
                    value={data.destination || ""}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [vin]: { ...p[vin], destination: e.target.value },
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <label>
                    <FaRoad /> Distance remaining (km)
                  </label>
                  <input
                    type="number"
                    value={data.kmOut || ""}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [vin]: { ...p[vin], kmOut: e.target.value },
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <label>
                    <FaUser /> Driver
                  </label>
                  <input
                    type="text"
                    value={data.driver || ""}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [vin]: { ...p[vin], driver: e.target.value },
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <label>
                    <FaStickyNote /> Notes
                  </label>
                  <textarea
                    value={data.notes || ""}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [vin]: { ...p[vin], notes: e.target.value },
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <label>
                    <FaCalendarAlt /> Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={data.startTime || ""}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [vin]: { ...p[vin], startTime: e.target.value },
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => handleSave(vehicle)}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        background: "#2ecc71",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      <FaSave /> Save
                    </button>
                    <button
                      onClick={() => handleCancel(vin)}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        background: "#e74c3c",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      {/* Pulsing animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
