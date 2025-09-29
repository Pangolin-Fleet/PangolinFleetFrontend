import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt } from "react-icons/fa";

import LoginPage from "./LoginPage";
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
  const [user, setUser] = useState(null);
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
  const [editVehicleId, setEditVehicleId] = useState(null);

  // Fetch vehicles once
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

  // Update status counts whenever vehicles change
  useEffect(() => {
    const counts = {};
    Object.keys(statusColors).forEach((status) => {
      counts[status] = vehicles.filter((v) => v.status === status).length;
    });
    setStatusCounts(counts);
  }, [vehicles]);

  // Login handler
  const handleLogin = (userData) => {
    console.log("Logged in user:", userData);
    // Normalize role to uppercase
    setUser({ ...userData, role: userData.role.toUpperCase() });
  };

  // Vehicle helpers
  const addVehicle = async (vehicle) => {
    if (!vehicle.vin || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.mileage) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const payload = { ...vehicle, year: Number(vehicle.year), mileage: Number(vehicle.mileage) };
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

  const updateVehicle = async (vin, updatedVehicle) => {
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? { ...v, ...updatedVehicle } : v)));
    try {
      await vehicleService.updateVehicle(vin, updatedVehicle);
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  const deleteVehicle = async (vin) => {
    try {
      await vehicleService.deleteVehicle(vin);
      setVehicles((prev) => prev.filter((v) => v.vin !== vin));
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

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
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? updated : v)));
    try {
      await vehicleService.updateVehicle(vin, updated);
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
      setVehicles((prev) => prev.map((v) => (v.vin === vin ? vehicle : v)));
    }
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

  if (!user) return <LoginPage onLogin={handleLogin} />;

  // Define accessible pages dynamically based on role
  const pages = [
    { name: "Vehicles", icon: <FaCar /> },
    { name: "In Use", icon: <FaCar /> },
    { name: "Maintenance", icon: <FaTools />, roles: ["ADMIN"] },
    { name: "Reports", icon: <FaFileAlt />, roles: ["ADMIN"] },
  ];

  const userRole = user.role.toUpperCase();

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <div className="logo">Pangolin Fleet</div>
        <nav>
          {pages.map(({ name, icon, roles }) => {
            if (roles && !roles.includes(userRole)) return null; // hide pages user can't access
            return (
              <button
                key={name}
                onClick={() => setCurrentPage(name)}
                className={currentPage === name ? "active" : ""}
              >
                {icon} {name}
              </button>
            );
          })}
        </nav>

        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <button className="logout-btn" onClick={() => setUser(null)}>
          Logout
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
            user={user}
          />
        )}

        {currentPage === "In Use" && (
          <InUsePage
            vehicles={vehicles.filter((v) => v.status === "In Use")}
            saveDestination={saveDestination}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            darkMode={darkMode}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            user={user}
          />
        )}

        {currentPage === "Maintenance" && userRole === "ADMIN" && (
          <MaintenancePage
            vehicles={vehicles.filter((v) => v.status === "In Maintenance")}
            updateStatus={updateStatus}
            updateVehicle={updateVehicle}
            incrementMileage={incrementMileage}
            theme={darkMode ? "dark" : "light"}
            user={user}
          />
        )}

        {currentPage === "Reports" && userRole === "ADMIN" && (
          <ReportPage vehicles={vehicles} darkMode={darkMode} user={user} />
        )}
      </main>

      {showModal && userRole === "ADMIN" && (
        <AddVehicleModal
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setShowModal={setShowModal}
          addVehicle={addVehicle}
          darkMode={darkMode}
          user={user}
        />
      )}
    </div>
  );
}

export default App;
