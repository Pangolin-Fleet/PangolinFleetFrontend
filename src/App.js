import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt, FaUserShield, FaUsers } from "react-icons/fa";

import LoginPage from "./LoginPage";
import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import InUsePage from "./components/InUsePage";
import ReportPage from "./components/ReportPage";
import Header from "./components/Header";  
import AddVehicleModal from "./components/AddVehicleModal";
import UserManagementPage from "./components/UserManagementPage";

import vehicleService from "./service/VehicleService";
import userService from "./service/UserService";
import { statusColors } from "./data";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fleetUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState("Vehicles");
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: "", make: "", model: "", year: "", mileage: "", status: "Available",
    description: "", discExpiryDate: "", insuranceExpiryDate: "",
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editVehicleId, setEditVehicleId] = useState(null);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("🔍 USERS STATE CHANGED - Count:", users.length);
    if (users.length > 0) {
      const adminCount = users.filter(u => u.role === "ADMIN").length;
      console.log("🔍 Admin count in state:", adminCount);
    }
  }, [users]);

  useEffect(() => {
    console.log("🔍 USER CHANGED:", user ? user.username : "No user");
  }, [user]);

  // Fetch vehicles and users - IMPROVED VERSION
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        console.log("🔄 Fetching data for user:", user.username);
        
        // Fetch vehicles first
        let vehiclesResponse = [];
        try {
          vehiclesResponse = await vehicleService.getAllVehicles();
          console.log("✅ Vehicles fetched:", vehiclesResponse?.length || 0);
        } catch (vehicleError) {
          console.error("❌ Vehicles fetch failed:", vehicleError);
          vehiclesResponse = [];
        }
        
        // Then fetch users separately with better error handling
        let usersResponse = [];
        try {
          usersResponse = await userService.getAllUsers(user.username);
          console.log("✅ Users fetched:", usersResponse?.length || 0);
        } catch (userError) {
          console.error("❌ Users fetch failed:", userError);
          usersResponse = [];
        }
        
        setVehicles(vehiclesResponse || []);
        setUsers(usersResponse || []);
        
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        setVehicles([]);
        setUsers([]);
      }
    };
    
    fetchData();
  }, [user]);

  // Update status counts whenever vehicles change
  useEffect(() => {
    const counts = {};
    Object.keys(statusColors).forEach((status) => {
      counts[status] = vehicles.filter((v) => v.status === status).length;
    });
    setStatusCounts(counts);
  }, [vehicles]);

  // Login handler
  const handleLogin = async (username, password) => {
    try {
      console.log("🔐 Attempting login for:", username);
      
      const userData = await userService.login(username, password);
      
      // SAFE: Check if we have valid user data
      if (!userData || typeof userData !== 'object') {
        throw new Error("Invalid response from server");
      }

      console.log("📋 User data received:", userData);

      const normalizedUser = { 
        ...userData,
        role: (userData.role || "DRIVER").toUpperCase(),
        isSuperUser: userData.isSuperUser || false,
        username: userData.username || username
      };

      console.log("👤 Normalized user:", normalizedUser);

      setUser(normalizedUser);
      localStorage.setItem("fleetUser", JSON.stringify(normalizedUser));
      return { success: true, user: normalizedUser };
      
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out");
    setUser(null);
    setVehicles([]);
    setUsers([]);
    localStorage.removeItem("fleetUser");
  };

  // Check if user can access admin features
  const isAdmin = () => {
    if (!user) return false;
    return user.role === "ADMIN" || user.isSuperUser;
  };

  // Vehicle operations
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
        vin: "", make: "", model: "", year: "", mileage: "", status: "Available",
        description: "", discExpiryDate: "", insuranceExpiryDate: "",
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

  // User management handlers
  const handleUserCreated = (newUser) => {
    console.log("👤 New user created:", newUser);
    setUsers(prev => [...prev, newUser]);
  };

  const handleUserDeleted = (deletedUser) => {
    console.log("🗑️ User deleted:", deletedUser);
    setUsers(prev => prev.filter(u => u.username !== deletedUser.username));
  };

  // Add refresh function for users
  const refreshUsers = async () => {
    if (!user) return;
    
    try {
      console.log("🔄 Manually refreshing users...");
      const usersResponse = await userService.getAllUsers(user.username);
      setUsers(usersResponse || []);
      console.log("✅ Users refreshed:", usersResponse?.length || 0);
    } catch (error) {
      console.error("❌ Refresh users failed:", error);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      (v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus ? v.status === filterStatus : true)
  );

  if (!user) {
    console.log("👤 No user, showing login page");
    return <LoginPage onLogin={handleLogin} />;
  }

  console.log("🏠 User logged in:", user.username, "Role:", user.role);

  // Define accessible pages based on role
  const pages = [
    { name: "Vehicles", icon: <FaCar /> },
    { name: "In Use", icon: <FaCar /> },
    { name: "Maintenance", icon: <FaTools />, roles: ["ADMIN"] },
    { name: "Reports", icon: <FaFileAlt />, roles: ["ADMIN"] },
    { name: "User Management", icon: <FaUsers />, roles: ["ADMIN"] },
  ];

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <div className="logo">Pangolin Fleet</div>
        <div className="user-info">
          <span>{user.username}</span>
          <span className={`role-badge ${user.role.toLowerCase()}`}>
            {user.role} {user.isSuperUser && "⭐"}
          </span>
        </div>
        
        <nav>
          {pages.map(({ name, icon, roles }) => {
            if (roles && !isAdmin()) return null;
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

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main>
        <Header currentPage={currentPage} user={user} />

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
            canEdit={isAdmin()}
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

        {currentPage === "Maintenance" && isAdmin() && (
          <MaintenancePage
            vehicles={vehicles.filter((v) => v.status === "In Maintenance")}
            updateStatus={updateStatus}
            updateVehicle={updateVehicle}
            incrementMileage={incrementMileage}
            theme={darkMode ? "dark" : "light"}
            user={user}
          />
        )}

        {currentPage === "Reports" && isAdmin() && (
          <ReportPage vehicles={vehicles} darkMode={darkMode} user={user} />
        )}

        {currentPage === "User Management" && isAdmin() && (
          <UserManagementPage 
            users={users} 
            currentUser={user}
            onUserCreated={handleUserCreated}
            onUserDeleted={handleUserDeleted}
            onRefreshUsers={refreshUsers}
          />
        )}
      </main>

      {showModal && isAdmin() && (
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