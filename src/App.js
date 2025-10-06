import React, { useState, useEffect } from "react";
import { FaCar, FaTools, FaFileAlt, FaUserShield, FaUsers, FaTachometerAlt, FaBell } from "react-icons/fa";

import LoginPage from "./LoginPage";
import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import InUsePage from "./components/InUsePage";
import ReportPage from "./components/ReportPage";
import DashboardPage from "./components/DashboardPage";
import Header from "./components/Header";  
import AddVehicleModal from "./components/AddVehicleModal";
import UserManagementPage from "./components/UserManagementPage";
import Notifications from "./components/Notifications";

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
  const [currentPage, setCurrentPage] = useState("Dashboard");
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
  
  // Enhanced state management
  const [notifications, setNotifications] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [advancedFilters, setAdvancedFilters] = useState({
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    mileageFrom: '',
    mileageTo: ''
  });

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

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

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
      addNotification(`Welcome back, ${normalizedUser.username}!`, 'success');
      return { success: true, user: normalizedUser };
      
    } catch (error) {
      console.error("❌ Login error:", error);
      addNotification('Login failed. Please check your credentials.', 'error');
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out");
    addNotification('You have been logged out', 'info');
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

  // Enhanced vehicle operations with notifications
  const addVehicle = async (vehicle) => {
    if (!vehicle.vin || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.mileage) {
      addNotification("Please fill all required fields", 'error');
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
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} added successfully!`, 'success');
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      addNotification("Failed to add vehicle. Check backend connection.", 'error');
    }
  };

  const updateVehicle = async (vin, updatedVehicle) => {
    const oldVehicle = vehicles.find(v => v.vin === vin);
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? { ...v, ...updatedVehicle } : v)));
    try {
      await vehicleService.updateVehicle(vin, updatedVehicle);
      addNotification(`Vehicle ${updatedVehicle.make || oldVehicle.make} ${updatedVehicle.model || oldVehicle.model} updated!`, 'success');
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      addNotification("Failed to update vehicle", 'error');
      setVehicles((prev) => prev.map((v) => (v.vin === vin ? oldVehicle : v)));
    }
  };

  const deleteVehicle = async (vin) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    try {
      await vehicleService.deleteVehicle(vin);
      setVehicles((prev) => prev.filter((v) => v.vin !== vin));
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} deleted`, 'success');
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      addNotification("Failed to delete vehicle", 'error');
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedVehicles.size === 0) {
      addNotification("Please select vehicles first", 'warning');
      return;
    }
    
    const updates = Array.from(selectedVehicles).map(vin => 
      updateStatus(vin, newStatus)
    );
    
    await Promise.all(updates);
    setSelectedVehicles(new Set());
    addNotification(`Updated ${selectedVehicles.size} vehicles to ${newStatus}`, 'success');
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) {
      addNotification("Please select vehicles first", 'warning');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedVehicles.size} vehicles?`)) return;
    
    const deletions = Array.from(selectedVehicles).map(vin => 
      deleteVehicle(vin)
    );
    
    await Promise.all(deletions);
    setSelectedVehicles(new Set());
    addNotification(`Deleted ${selectedVehicles.size} vehicles`, 'success');
  };

  const incrementMileage = async (vin, amount) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, mileage: vehicle.mileage + amount };
    await updateVehicle(vin, updated);
    addNotification(`Mileage updated for ${vehicle.make} ${vehicle.model}`, 'info');
  };

  const updateStatus = async (vin, status, extra = {}) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, status, ...extra };
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? updated : v)));
    try {
      await vehicleService.updateVehicle(vin, updated);
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} status changed to ${status}`, 'success');
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
      addNotification(`Failed to update vehicle status`, 'error');
      setVehicles((prev) => prev.map((v) => (v.vin === vin ? vehicle : v)));
    }
  };

  const saveDestination = async (vin, destination) => {
    await updateStatus(vin, "In Use", { destination });
  };

  // Enhanced filtering
  const filteredVehicles = vehicles.filter(
    (v) =>
      (v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus ? v.status === filterStatus : true) &&
      (!advancedFilters.make || v.make?.toLowerCase().includes(advancedFilters.make.toLowerCase())) &&
      (!advancedFilters.model || v.model?.toLowerCase().includes(advancedFilters.model.toLowerCase())) &&
      (!advancedFilters.yearFrom || v.year >= parseInt(advancedFilters.yearFrom)) &&
      (!advancedFilters.yearTo || v.year <= parseInt(advancedFilters.yearTo)) &&
      (!advancedFilters.mileageFrom || v.mileage >= parseInt(advancedFilters.mileageFrom)) &&
      (!advancedFilters.mileageTo || v.mileage <= parseInt(advancedFilters.mileageTo))
  );

  // User management handlers
  const handleUserCreated = (newUser) => {
    console.log("👤 New user created:", newUser);
    setUsers(prev => [...prev, newUser]);
    addNotification(`User ${newUser.username} created successfully`, 'success');
  };

  const handleUserDeleted = (deletedUser) => {
    console.log("🗑️ User deleted:", deletedUser);
    setUsers(prev => prev.filter(u => u.username !== deletedUser.username));
    addNotification(`User ${deletedUser.username} deleted`, 'success');
  };

  // Add refresh function for users
  const refreshUsers = async () => {
    if (!user) return;
    
    try {
      console.log("🔄 Manually refreshing users...");
      const usersResponse = await userService.getAllUsers(user.username);
      setUsers(usersResponse || []);
      console.log("✅ Users refreshed:", usersResponse?.length || 0);
      addNotification('Users list refreshed', 'info');
    } catch (error) {
      console.error("❌ Refresh users failed:", error);
      addNotification('Failed to refresh users', 'error');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setAdvancedFilters({
      make: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      mileageFrom: '',
      mileageTo: ''
    });
    addNotification('All filters cleared', 'info');
  };

  if (!user) {
    console.log("👤 No user, showing login page");
    return <LoginPage onLogin={handleLogin} />;
  }

  console.log("🏠 User logged in:", user.username, "Role:", user.role);

  // Define accessible pages based on role
  const pages = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
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

        {/* Notifications Component */}
        <Notifications notifications={notifications} />

        {currentPage === "Dashboard" && (
          <DashboardPage 
            vehicles={vehicles} 
            user={user}
          />
        )}

        {currentPage === "Vehicles" && (
          <VehiclePage
            vehicles={filteredVehicles}
            allVehicles={vehicles}
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
            // Enhanced props
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={handleBulkDelete}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            clearAllFilters={clearAllFilters}
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
            users={users}
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