import React, { useState, useEffect } from "react";
import maintenanceService from "../service/MaintenanceService";
import vehicleService from "../service/VehicleService";
import "./MaintenancePage.css";

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [form, setForm] = useState({
    vin: "",
    vehicleName: "",
    severity: "Low",
    problem: "",
    mileage: "",
    technician: "",
    cost: "",
    date: "",
  });
  const [editingId, setEditingId] = useState(null);

  const severityColors = {
    Low: "#2ecc71",
    Medium: "#f1c40f",
    High: "#e67e22",
    Critical: "#e74c3c",
  };

  // --- Fetch vehicles and maintenance records ---
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };

    const fetchMaintenances = async () => {
      try {
        const data = await maintenanceService.getAllMaintenance();
        setMaintenances(data);
      } catch (err) {
        console.error("Error fetching maintenances:", err);
      }
    };

    fetchVehicles();
    fetchMaintenances();
  }, []);

  // --- Auto-update vehicleName when VIN changes ---
  useEffect(() => {
    const selectedVehicle = vehicles.find((v) => v.vin === form.vin);
    if (selectedVehicle) {
      setForm((prev) => ({
        ...prev,
        vehicleName: `${selectedVehicle.make} ${selectedVehicle.model}`,
      }));
    } else {
      setForm((prev) => ({ ...prev, vehicleName: "" }));
    }
  }, [form.vin, vehicles]);

  // --- Handle form changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // --- Submit new or edited maintenance ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicle = vehicles.find((v) => v.vin === form.vin);
      if (!vehicle) return alert("Select a vehicle first!");

      const maintenanceData = {
        vehicle,
        severity: form.severity,
        problem: form.problem,
        mileage: parseInt(form.mileage),
        mechanic: form.technician,
        cost: parseFloat(form.cost),
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

      setForm({
        vin: "",
        vehicleName: "",
        severity: "Low",
        problem: "",
        mileage: "",
        technician: "",
        cost: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Edit maintenance record ---
  const handleEdit = (m) => {
    setForm({
      vin: m.vehicle?.vin || "",
      vehicleName: m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}` : "",
      severity: m.severity || "Low",
      problem: m.problem || "",
      mileage: m.mileage || "",
      technician: m.mechanic || "",
      cost: m.cost || "",
      date: m.serviceDate || "",
    });
    setEditingId(m.id);
  };

  // --- Delete maintenance ---
  const handleDelete = async (id) => {
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances(maintenances.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="maintenance-container">
      {/* Form */}
      <div
        className="maintenance-card"
        style={{ borderTopColor: severityColors[form.severity] }}
      >
        <h2 className="card-header">⚙️ Log Vehicle Maintenance</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle</label>
            <select name="vin" value={form.vin} onChange={handleChange} required>
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.vin} value={v.vin}>
                  {v.vin} - {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vehicle Name</label>
            <input type="text" name="vehicleName" value={form.vehicleName} disabled />
          </div>

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
            <input type="number" name="mileage" value={form.mileage} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Technician</label>
            <input type="text" name="technician" value={form.technician} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Cost (R)</label>
            <input type="number" name="cost" value={form.cost} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>

          <div className="form-actions span-2">
            <button type="submit">
              {editingId ? "💾 Update Maintenance" : "💾 Save Maintenance"}
            </button>
          </div>
        </form>
      </div>

      {/* Maintenance Table */}
      <div className="maintenance-card" style={{ marginTop: "30px" }}>
        <h2 className="card-header">📜 Maintenance History</h2>
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Vehicle</th>
              <th>Severity</th>
              <th>Problem</th>
              <th>Mileage</th>
              <th>Technician</th>
              <th>Cost (R)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((m) => (
              <tr key={m.id}>
                <td>{m.vehicle?.vin || "N/A"}</td>
                <td>{m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}` : "N/A"}</td>
                <td style={{ color: severityColors[m.severity], fontWeight: "600" }}>
                  {m.severity}
                </td>
                <td>{m.problem || "N/A"}</td>
                <td>{m.mileage ?? "N/A"}</td>
                <td>{m.mechanic || "N/A"}</td>
                <td>{m.cost ?? "N/A"}</td>
                <td>{m.serviceDate || "N/A"}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(m)}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(m.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
