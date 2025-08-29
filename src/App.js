import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt } from "react-icons/fa";

import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import InUsePage from "./components/InUsePage";
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
  const [darkMode, setDarkMode] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: "", license: "", name: "", driver: "", mileage: 0,
    status: "Available", disc: "", insurance: "", description: "",
    destination: ""
  });
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

  const deleteVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
  const editVehicle = (id, field, value) => setVehicles(vehicles.map(v => (v.id === id ? { ...v, [field]: value } : v)));

  const addVehicle = () => {
    if (!newVehicle.vin || !newVehicle.name || !newVehicle.driver || !newVehicle.description) {
      alert("Please fill all required fields");
      return;
    }
    const id = vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    setVehicles([...vehicles, { ...newVehicle, id }]);
    setNewVehicle({ vin: "", license: "", name: "", driver: "", mileage: 0, status: "Available", disc: "", insurance: "", description: "", destination: "" });
    setShowModal(false);
  };

  const updateStatus = (id, status, extra = {}) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id ? { ...v, status, ...extra } : v
      )
    );
  };

  const saveDestination = (id, destination) => {
    updateStatus(id, "In Use", { destination });
  };

  const filteredVehicles = vehicles.filter(v =>
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus ? v.status === filterStatus : true)
  );

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <div className="logo">Pangolin Fleet</div>
        <nav>
          {["Vehicles", "In Use", "Maintenance", "Reports"].map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? "active" : ""}>
              {page === "Vehicles" && <FaCar />}
              {page === "Maintenance" && <FaTools />}
              {page === "Reports" && <FaFileAlt />}
              {page === "In Use" && <FaCar />}
              {page}
            </button>
          ))}
        </nav>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
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
            darkMode={darkMode}
          />
        )}

        {currentPage === "In Use" && (
          <InUsePage
            vehicles={vehicles.filter(v => v.status === "In Use")}
            saveDestination={saveDestination}
             incrementMileage={incrementMileage}   // so +10 km works
    editVehicleId={editVehicleId}         // current edit vehicle id
    setEditVehicleId={setEditVehicleId} 
              updateStatus={updateStatus}
            darkMode={darkMode}
          />
        )}

        {currentPage === "Maintenance" && (
          <MaintenancePage
            vehicles={vehicles.filter(v => v.status === "In Maintenance")}
            editVehicle={editVehicle}
            updateStatus={updateStatus}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            completeMaintenance={(id) => updateStatus(id, "Available")}
            animatedId={animatedId}
            darkMode={darkMode}
          />
        )}

        {currentPage === "Reports" && (
          <ReportPage vehicles={vehicles} darkMode={darkMode} />
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
