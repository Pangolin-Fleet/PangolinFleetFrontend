import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt } from "react-icons/fa";

import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import InUsePage from "./components/InUsePage";
import ReportPage from "./components/ReportPage";
import Header from "./components/Header";
import AddVehicleModal from "./components/AddVehicleModal";

import vehicleService from "./service/VehicleService";
import { statusColors } from "./data";

import "./App.css";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState("Vehicles");
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    status: "Available",
    description: "",
    discExpiryDate: "",
    insuranceExpiryDate: "",
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch vehicles on load
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getAllVehicles();
        setVehicles(response);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  // Update status counts
  useEffect(() => {
    const counts = {};
    Object.keys(statusColors).forEach((status) => {
      counts[status] = vehicles.filter((v) => v.status === status).length;
    });
    setStatusCounts(counts);
  }, [vehicles]);

  // Add Vehicle
  const addVehicle = async (vehicle) => {
    if (!vehicle.vin || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.mileage) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...vehicle,
        year: Number(vehicle.year),
        mileage: Number(vehicle.mileage),
      };
      const savedVehicle = await vehicleService.addVehicle(payload);
      setVehicles([...vehicles, savedVehicle]);
      setNewVehicle({
        vin: "",
        make: "",
        model: "",
        year: "",
        mileage: "",
        status: "Available",
        description: "",
        discExpiryDate: "",
        insuranceExpiryDate: "",
      });
      setShowModal(false);
      alert("Vehicle added successfully!");
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      alert("Failed to add vehicle. Check backend connection.");
    }
  };

  // Update Vehicle
  const updateVehicle = async (vin, updatedVehicle) => {
    try {
      const saved = await vehicleService.updateVehicle(vin, updatedVehicle);
      setVehicles((prev) => prev.map((v) => (v.vin === vin ? saved : v)));
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      alert("Failed to update vehicle.");
    }
  };

  // Delete Vehicle
  const deleteVehicle = async (vin) => {
    try {
      await vehicleService.deleteVehicle(vin);
      setVehicles((prev) => prev.filter((v) => v.vin !== vin));
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      alert("Failed to delete vehicle.");
    }
  };

  // Helper Methods
  const incrementMileage = async (vin, amount) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, mileage: vehicle.mileage + amount };
    await updateVehicle(vin, updated);
  };

  const updateStatus = async (vin, status, extra = {}) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, status, ...extra };
    await updateVehicle(vin, updated);
  };

  const saveDestination = async (vin, destination) => {
    await updateStatus(vin, "In Use", { destination });
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      (v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus ? v.status === filterStatus : true)
  );

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <div className="logo">Pangolin Fleet</div>
        <nav>
          {["Vehicles", "In Use", "Maintenance", "Reports"].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "active" : ""}
            >
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
            editVehicle={updateVehicle}
            showModal={showModal}
            setShowModal={setShowModal}
            newVehicle={newVehicle}
            setNewVehicle={setNewVehicle}
            addVehicle={addVehicle}
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
            vehicles={vehicles.filter((v) => v.status === "In Use")}
            saveDestination={saveDestination}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            darkMode={darkMode}
          />
        )}

        {currentPage === "Maintenance" && (
          <MaintenancePage
            vehicles={vehicles.filter((v) => v.status === "In Maintenance")}
            updateStatus={updateStatus}
            incrementMileage={incrementMileage}
            darkMode={darkMode}
          />
        )}

        {currentPage === "Reports" && <ReportPage vehicles={vehicles} darkMode={darkMode} />}
      </main>

      {showModal && (
        <AddVehicleModal
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setShowModal={setShowModal}
          addVehicle={addVehicle}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;
