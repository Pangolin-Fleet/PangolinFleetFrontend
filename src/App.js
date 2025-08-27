import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt, FaPlus, FaEdit, FaTrash, FaArrowUp, FaCheckCircle, FaSearch } from "react-icons/fa";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

const initialVehicles = [
  { id: 1, vin: "1HGBH41JXMN109186", license: "CA12345", name: "Pangolin Hilux", driver: "John", mileage: 12000, status: "Available", disc: "2025-03-01", insurance: "2025-06-01", description: "All good" },
  { id: 2, vin: "1HGCM82633A004352", license: "WP54321", name: "Pangolin Ranger", driver: "Mike", mileage: 9000, status: "In Use", disc: "2025-04-01", insurance: "2025-07-01", description: "" },
  { id: 3, vin: "2FTRX18W1XCA12345", license: "EC98765", name: "Pangolin D-Max", driver: "Sarah", mileage: 15000, status: "In Maintenance", disc: "2025-05-01", insurance: "2025-08-01", description: "Engine making noise" },
  { id: 4, vin: "3D7KU28C73G123456", license: "KZN45678", name: "Pangolin Navara", driver: "Tom", mileage: 7000, status: "Inactive", disc: "2025-02-01", insurance: "2025-05-01", description: "" },
];

const statusColors = { Available: "#22c55e", "In Use": "#3b82f6", "In Maintenance": "#f59e0b", "In Service": "#8b5cf6", Inactive: "#6b7280" };

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [currentPage, setCurrentPage] = useState("Vehicles");
  const [showModal, setShowModal] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ vin: "", license: "", name: "", driver: "", mileage: 0, status: "Available", disc: "", insurance: "", description: "" });
  const [animatedId, setAnimatedId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const counts = {};
    Object.keys(statusColors).forEach(status => {
      counts[status] = vehicles.filter(v => v.status === status).length;
    });
    setStatusCounts(counts);
  }, [vehicles]);

  const incrementMileage = (id, amount) => {
    setAnimatedId(id);
    setVehicles(vehicles.map(v => (v.id === id ? { ...v, mileage: v.mileage + amount } : v)));
    setTimeout(() => setAnimatedId(null), 500);
  };

  const updateStatus = (id, status) => {
    setAnimatedId(id);
    setVehicles(vehicles.map(v => (v.id === id ? { ...v, status } : v)));
    setTimeout(() => setAnimatedId(null), 500);
  };

  const deleteVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
  const editVehicle = (id, field, value) => setVehicles(vehicles.map(v => (v.id === id ? { ...v, [field]: value } : v)));

  const validateVehicle = (vehicle) => {
    if (!vehicle.vin || !vehicle.license || !vehicle.name || !vehicle.driver || !vehicle.description) return false;
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vehicle.vin)) return false;
    return true;
  };

  const addVehicle = () => {
    if (!validateVehicle(newVehicle)) {
      alert("Please fill out all required fields and provide a valid VIN (17 alphanumeric characters).");
      return;
    }
    const id = vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    setVehicles([...vehicles, { ...newVehicle, id }]);
    setNewVehicle({ vin: "", license: "", name: "", driver: "", mileage: 0, status: "Available", disc: "", insurance: "", description: "" });
    setShowModal(false);
  };

  const completeMaintenance = (id) => updateStatus(id, "Available");

  const filteredVehicles = vehicles.filter(v =>
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus ? v.status === filterStatus : true)
  );

  const renderPage = () => {
    if (currentPage === "Vehicles") return <VehiclesPage vehicles={filteredVehicles} incrementMileage={incrementMileage} updateStatus={updateStatus} deleteVehicle={deleteVehicle} editVehicle={editVehicle} editVehicleId={editVehicleId} setEditVehicleId={setEditVehicleId} showModal={showModal} setShowModal={setShowModal} newVehicle={newVehicle} setNewVehicle={setNewVehicle} addVehicle={addVehicle} animatedId={animatedId} statusCounts={statusCounts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />;
    if (currentPage === "Maintenance") return <MaintenancePage vehicles={filteredVehicles.filter(v => v.status === "In Maintenance")} editVehicle={editVehicle} editVehicleId={editVehicleId} setEditVehicleId={setEditVehicleId} completeMaintenance={completeMaintenance} animatedId={animatedId} />;
    if (currentPage === "Reports") return <ReportsPage vehicles={vehicles} />;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">Pangolin Fleet</div>
        <nav>
          {["Vehicles", "Maintenance", "Reports"].map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? "active" : ""}>
              {page === "Vehicles" && <FaCar />} 
              {page === "Maintenance" && <FaTools />} 
              {page === "Reports" && <FaFileAlt />} 
              {page}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <Header currentPage={currentPage} />
        {renderPage()}
      </main>
      {showModal && <AddVehicleModal newVehicle={newVehicle} setNewVehicle={setNewVehicle} setShowModal={setShowModal} addVehicle={addVehicle} />}
    </div>
  );
}

// Header
const Header = ({ currentPage }) => (
  <div className="header-banner">
    <h1>{currentPage} Dashboard</h1>
    <div className="header-icons">
      <div className="notification">🚨</div>
      <div className="notification">🛠️</div>
    </div>
  </div>
);

// Vehicles Page
const VehiclesPage = ({ vehicles, incrementMileage, updateStatus, deleteVehicle, editVehicle, editVehicleId, setEditVehicleId, showModal, setShowModal, newVehicle, setNewVehicle, addVehicle, animatedId, statusCounts, searchQuery, setSearchQuery, filterStatus, setFilterStatus }) => (
  <>
    <div className="topbar">
      <div className="topbar-left">
        <h1>Vehicle Overview</h1>
        <div className="search-filter">
          <input placeholder="Search VIN, Name, Driver..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button className="add-btn" onClick={() => setShowModal(true)}><FaPlus /> Add Vehicle</button>
    </div>

    <div className="stats">
      {Object.keys(statusColors).map((status, idx) => (
        <div key={idx} className="card" style={{ backgroundColor: statusColors[status], color: "#fff" }}>
          <div className="icon"><FaCar /></div>
          <div>
            <p>{status}</p>
            <p className="counter">{statusCounts[status]}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>VIN</th><th>License</th><th>Vehicle</th><th>Driver</th><th>Mileage</th><th>Status</th><th>Description</th><th>Documents</th><th>Actions</th>
          </tr>
        </thead>
        <TransitionGroup component="tbody">
          {vehicles.map(v => (
            <CSSTransition key={v.id} timeout={400} classNames="row">
              <tr className={animatedId === v.id ? "highlight-row" : ""}>
                <td>{v.vin}</td>
                <td>{v.license}</td>
                <td>{editVehicleId === v.id ? <input value={v.name} onChange={e => editVehicle(v.id, "name", e.target.value)} /> : v.name}</td>
                <td>{editVehicleId === v.id ? <input value={v.driver} onChange={e => editVehicle(v.id, "driver", e.target.value)} /> : v.driver}</td>
                <td>{v.mileage}</td>
                <td>
                  <select value={v.status} onChange={e => updateStatus(v.id, e.target.value)} style={{ backgroundColor: statusColors[v.status], color: "#fff" }}>
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <textarea value={v.description} onChange={e => editVehicle(v.id, "description", e.target.value)} placeholder="Add notes here..." />
                </td>
                <td>
                  <span className={new Date(v.disc) < new Date() ? "expired" : ""}>Disc: {v.disc}</span><br/>
                  <span className={new Date(v.insurance) < new Date() ? "expired" : ""}>Insurance: {v.insurance}</span>
                </td>
                <td className="action-buttons">
                  {editVehicleId === v.id 
                    ? <button className="save-btn" onClick={() => setEditVehicleId(null)}><FaCheckCircle /></button> 
                    : <button className="edit-btn" onClick={() => setEditVehicleId(v.id)}><FaEdit /></button>}
                  <button className="mileage-btn" onClick={() => incrementMileage(v.id, 10)}><FaArrowUp /> +10</button>
                  <button className="mileage-btn" onClick={() => incrementMileage(v.id, 25)}><FaArrowUp /> +25</button>
                  <button className="delete-btn" onClick={() => deleteVehicle(v.id)}><FaTrash /></button>
                </td>
              </tr>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </table>
    </div>
  </>
);

// Maintenance Page
const MaintenancePage = ({ vehicles, editVehicle, editVehicleId, setEditVehicleId, completeMaintenance, animatedId }) => (
  <>
    <h2>Maintenance Vehicles</h2>
    <div className="table-container">
      <table>
        <thead><tr><th>VIN</th><th>Vehicle</th><th>Driver</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead>
        <TransitionGroup component="tbody">
          {vehicles.map(v => (
            <CSSTransition key={v.id} timeout={400} classNames="row">
              <tr className={animatedId === v.id ? "highlight-row" : ""}>
                <td>{v.vin}</td>
                <td>{editVehicleId === v.id ? <input value={v.name} onChange={e => editVehicle(v.id, "name", e.target.value)} /> : v.name}</td>
                <td>{editVehicleId === v.id ? <input value={v.driver} onChange={e => editVehicle(v.id, "driver", e.target.value)} /> : v.driver}</td>
                <td>{v.status}</td>
                <td>
                  <textarea value={v.description} onChange={e => editVehicle(v.id, "description", e.target.value)} placeholder="Add notes here..." />
                </td>
                <td>
                  {editVehicleId === v.id ? <button onClick={() => setEditVehicleId(null)}><FaCheckCircle /></button> : <button onClick={() => setEditVehicleId(v.id)}><FaEdit /></button>}
                  <button onClick={() => completeMaintenance(v.id)}>Complete</button>
                </td>
              </tr>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </table>
    </div>
  </>
);

// Reports Page
const ReportsPage = ({ vehicles }) => {
  const data = Object.keys(statusColors).map(status => ({ name: status, value: vehicles.filter(v => v.status === status).length }));
  const colors = Object.values(statusColors);
  const now = new Date();

  return (
    <div className="reports-page">
      <h2>Status Reports</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {data.map((entry, index) => <Cell key={index} fill={colors[index]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h3>Document Expirations</h3>
      <div className="table-container">
        <table>
          <thead><tr><th>Vehicle</th><th>Disc Expiration</th><th>Insurance Expiration</th></tr></thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td className={new Date(v.disc) < now ? "expired" : ""}>{v.disc}</td>
                <td className={new Date(v.insurance) < now ? "expired" : ""}>{v.insurance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Add Vehicle Modal
const AddVehicleModal = ({ newVehicle, setNewVehicle, setShowModal, addVehicle }) => (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h2>Add New Vehicle</h2>
      <div className="modal-inputs">
        <input placeholder="VIN (17 chars)" value={newVehicle.vin} onChange={e => setNewVehicle({ ...newVehicle, vin: e.target.value })} />
        <input placeholder="License" value={newVehicle.license} onChange={e => setNewVehicle({ ...newVehicle, license: e.target.value })} />
        <input placeholder="Vehicle Name" value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} />
        <input placeholder="Driver" value={newVehicle.driver} onChange={e => setNewVehicle({ ...newVehicle, driver: e.target.value })} />
        <input type="number" placeholder="Mileage" value={newVehicle.mileage} onChange={e => setNewVehicle({ ...newVehicle, mileage: Number(e.target.value) })} />
        <input type="date" placeholder="Disc Expiration" value={newVehicle.disc} onChange={e => setNewVehicle({ ...newVehicle, disc: e.target.value })} />
        <input type="date" placeholder="Insurance Expiration" value={newVehicle.insurance} onChange={e => setNewVehicle({ ...newVehicle, insurance: e.target.value })} />
        <textarea placeholder="Description (required)" value={newVehicle.description} onChange={e => setNewVehicle({ ...newVehicle, description: e.target.value })} />
        <select value={newVehicle.status} onChange={e => setNewVehicle({ ...newVehicle, status: e.target.value })}>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="modal-actions">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button onClick={addVehicle}>Add Vehicle</button>
      </div>
    </div>
  </div>
);

export default App;
