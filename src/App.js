import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt } from "react-icons/fa";

// Corrected imports based on your file names
import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import ReportPage from "./components/ReportPage";
import Header from "./components/Header";
import AddVehicleModal from "./components/AddVehicleModal";
import { statusColors, initialVehicles } from "./data";

import "./App.css";

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [currentPage, setCurrentPage] = useState("Vehicles");
  const [showModal, setShowModal] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    vin: "", license: "", name: "", driver: "", mileage: 0,
    status: "Available", disc: "", insurance: "", description: ""
  });
  const [animatedId, setAnimatedId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Count vehicles by status
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

  const addVehicle = () => {
    if (!newVehicle.vin || !newVehicle.name || !newVehicle.driver || !newVehicle.description) {
      alert("Please fill all required fields");
      return;
    }
    const id = vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    setVehicles([...vehicles, { ...newVehicle, id }]);
    setNewVehicle({ vin: "", license: "", name: "", driver: "", mileage: 0, status: "Available", disc: "", insurance: "", description: "" });
    setShowModal(false);
  };

  const filteredVehicles = vehicles.filter(v =>
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus ? v.status === filterStatus : true)
  );

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

        {currentPage === "Vehicles" && (
          <VehiclePage
            vehicles={filteredVehicles}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            deleteVehicle={deleteVehicle}
            editVehicle={editVehicle}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            showModal={showModal}
            setShowModal={setShowModal}
            newVehicle={newVehicle}
            setNewVehicle={setNewVehicle}
            addVehicle={addVehicle}
            animatedId={animatedId}
            statusCounts={statusCounts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        )}

        {currentPage === "Maintenance" && (
          <MaintenancePage
            vehicles={filteredVehicles.filter(v => v.status === "In Maintenance")}
            editVehicle={editVehicle}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            completeMaintenance={(id) => updateStatus(id, "Available")}
            animatedId={animatedId}
          />
        )}

        {currentPage === "Reports" && (
          <ReportPage vehicles={vehicles} />
        )}
      </main>

      {showModal && (
        <AddVehicleModal
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setShowModal={setShowModal}
          addVehicle={addVehicle}
        />
      )}
    </div>
  );
}

export default App;
