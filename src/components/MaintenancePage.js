import React, { useState, useEffect } from "react";
import vehicleService from "../service/VehicleService";
import maintenanceService from "../service/MaintenanceService"; // Axios service
import "./MaintenancePage.css";

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vin: "",
    severity: "Low",
    problem: "",
    mileage: "",
    mechanic: "",
    cost: "",
    date: "",
  });

  const severityColors = {
    Low: "#2ecc71",      // Green
    Medium: "#f1c40f",   // Yellow
    High: "#e67e22",     // Orange
    Critical: "#e74c3c", // Red
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.vin) return alert("Please select a vehicle.");

    // Backend expects a Vehicle object
    const vehicleObj = { vin: form.vin };

    const payload = {
      vehicle: vehicleObj,
      severity: form.severity,
      problem: form.problem,
      mileage: Number(form.mileage),
      mechanic: form.mechanic,
      cost: Number(form.cost),
      serviceDate: form.date, // maps frontend "date" to backend
    };

    try {
      const response = await maintenanceService.addMaintenance(payload);
      console.log("Maintenance saved:", response);
      alert("Maintenance saved successfully!");

      // Reset form
      setForm({
        vin: "",
        severity: "Low",
        problem: "",
        mileage: "",
        mechanic: "",
        cost: "",
        date: "",
      });
    } catch (err) {
      console.error("Error saving maintenance:", err);
      alert("Failed to save maintenance. Check console.");
    }
  };

  return (
    <div className="maintenance-container">
      <div
        className="maintenance-card"
        style={{ borderTopColor: severityColors[form.severity] }}
      >
        <h2 className="card-header">⚙️ Log Vehicle Maintenance</h2>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Vehicle Dropdown */}
          <div className="form-group">
            <label>Vehicle</label>
            <select
              name="vin"
              value={form.vin}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.vin} value={v.vin}>
                  {v.vin} - {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="form-group">
            <label>Severity</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              style={{
                backgroundColor: severityColors[form.severity],
                color: "#fff",
              }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          {/* Problem Details */}
          <div className="form-group span-2">
            <label>Problem Details</label>
            <textarea
              name="problem"
              value={form.problem}
              onChange={handleChange}
              placeholder="Describe the issue..."
            />
          </div>

          <div className="form-group">
            <label>Mileage (km)</label>
            <input
              type="number"
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              placeholder="e.g. 120000"
            />
          </div>

          <div className="form-group">
            <label>Mechanic</label>
            <input
              type="text"
              name="mechanic"
              value={form.mechanic}
              onChange={handleChange}
              placeholder="Mechanic Name"
            />
          </div>

          <div className="form-group">
            <label>Cost (R)</label>
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              placeholder="Enter cost"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions span-2">
            <button type="submit">💾 Save Maintenance</button>
          </div>
        </form>
      </div>
    </div>
  );
}
