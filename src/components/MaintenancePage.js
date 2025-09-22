import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
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
    date: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  const severityColors = {
    Low: "#27ae60",
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
        setFilteredMaintenances(data);
      } catch (err) {
        console.error("Error fetching maintenances:", err);
      }
    };

    fetchVehicles();
    fetchMaintenances();
  }, []);

  // Auto-update vehicleName when VIN changes
  useEffect(() => {
    const selectedVehicle = vehicles.find((v) => v.vin === form.vin);
    setForm((prev) => ({
      ...prev,
      vehicleName: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "",
    }));
  }, [form.vin, vehicles]);

  // Filter & search
  useEffect(() => {
    let data = [...maintenances];

    if (searchTerm) {
      data = data.filter((m) =>
        (m.vehicle?.vin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}`.toLowerCase() : "").includes(searchTerm.toLowerCase()) ||
        (m.mechanic || "").toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances(maintenances.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="maintenance-container">
      {/* Maintenance Form */}
      <div className="maintenance-card" style={{ borderTopColor: severityColors[form.severity] }}>
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
              style={{ backgroundColor: severityColors[form.severity], color: "#fff" }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Problem Details</label>
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Describe the issue..." />
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

      {/* Search + Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search VIN, Vehicle, Technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Maintenance Table */}
      <div className="maintenance-card table-responsive">
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
            {filteredMaintenances.map((m) => (
              <tr key={m.id}>
                <td>{m.vehicle?.vin || "N/A"}</td>
                <td>{m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}` : "N/A"}</td>
                <td>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: severityColors[m.severity], color: "#fff" }}
                  >
                    {m.severity}
                  </span>
                </td>
                <td>{m.problem || "N/A"}</td>
                <td>{m.mileage ?? "N/A"}</td>
                <td>{m.mechanic || "N/A"}</td>
                <td>{m.cost ?? "N/A"}</td>
                <td>{m.serviceDate || "N/A"}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(m)}><FaEdit /></button>
                  <button className="delete-btn" onClick={() => handleDelete(m.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
