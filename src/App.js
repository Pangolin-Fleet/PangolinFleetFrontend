import React, { useState, useEffect } from "react";
import { 
  FaCar, FaTools, FaTachometerAlt, 
  FaHistory, FaChartLine, FaUsers
} from "react-icons/fa";

import VehiclePage from "./components/VehiclePage";
import MaintenancePage from "./components/MaintenancePage";
import InUsePage from "./components/InUsePage";
import ReportPage from "./components/ReportPage";
import DashboardPage from "./components/DashboardPage";
import Header from "./components/Header";  
import AddVehicleModal from "./components/AddVehicleModal";
import Notifications from "./components/Notifications";
import ActivityLogPage from "./components/ActivityLogPage";
import UserAccessModal from "./components/UserAccessModal";
import UserManagementPage from "./components/UserManagementPage";

import vehicleService from "./service/VehicleService";
import userService from "./service/UserService";
import { statusColors } from "./data";
import "./App.css";

// Simplified user roles
const USER_ROLES = {
  SUPERADMIN: {
    name: "Super Admin",
    permissions: ["all", "users:manage"]
  },
  ADMIN: {
    name: "Administrator", 
    permissions: [
      "vehicles:all", 
      "maintenance:all", 
      "reports:all", 
      "activity:view",
      "users:manage" // ADMIN can manage drivers
    ]
  },
  DRIVER: {
    name: "Driver",
    permissions: [
      "vehicles:view", 
      "inuse:self", 
      "reports:self"
    ]
  }
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fleetUser");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [showAccessModal, setShowAccessModal] = useState(!user);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]); // Add users state
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("fleetDarkMode");
    return saved ? JSON.parse(saved) : false;
  });
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
    make: '', model: '', yearFrom: '', yearTo: '', mileageFrom: '', mileageTo: ''
  });

  // Activity log state
  const [activityLog, setActivityLog] = useState([]);

  // Permission checking function
  const hasPermission = (permission) => {
    if (!user) return false;
    
    const userRole = USER_ROLES[user.role];
    if (!userRole) return false;
    
    // Super admin has all permissions
    if (userRole.permissions.includes("all")) return true;
    
    // Check specific permission
    return userRole.permissions.includes(permission);
  };

  // Check if user can access a page
  const canAccessPage = (pageId) => {
    if (!user) return false;
    
    const permissions = {
      dashboard: true, // Everyone can access dashboard
      vehicles: hasPermission("vehicles:view") || hasPermission("vehicles:all"),
      inuse: hasPermission("vehicles:view") || hasPermission("inuse:self"),
      maintenance: hasPermission("maintenance:all"), // Only ADMIN and SUPERADMIN
      reports: hasPermission("reports:all") || hasPermission("reports:self"),
      activity: hasPermission("activity:view") || hasPermission("all"),
      users: user.role === "ADMIN" || user.role === "SUPERADMIN" // Only ADMIN and SUPERADMIN
    };
    
    return permissions[pageId] || false;
  };

  // Check if user can perform action
  const canPerformAction = (action, resource = null) => {
    if (!user) return false;
    
    const actionMap = {
      // Vehicle actions
      "add-vehicle": hasPermission("vehicles:all"),
      "edit-vehicle": hasPermission("vehicles:all"), 
      "delete-vehicle": hasPermission("vehicles:all"),
      "update-status": hasPermission("vehicles:all") || hasPermission("inuse:self"),
      
      // Maintenance actions
      "add-maintenance": hasPermission("maintenance:all"),
      "edit-maintenance": hasPermission("maintenance:all"),
      "delete-maintenance": hasPermission("maintenance:all"),
      
      // Report actions
      "export-reports": hasPermission("reports:all"),
      "view-all-reports": hasPermission("reports:all"),

      // User management actions
      "create-user": user.role === "SUPERADMIN",
      "edit-user": user.role === "SUPERADMIN" || (user.role === "ADMIN" && resource?.role === "DRIVER"),
      "delete-user": user.role === "SUPERADMIN",
      "update-password": user.role === "SUPERADMIN" || (user.role === "ADMIN" && resource?.role === "DRIVER")
    };
    
    return actionMap[action] || false;
  };

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("fleetDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Show access modal if no user
  useEffect(() => {
    if (!user) {
      setShowAccessModal(true);
    }
  }, [user]);

  // Ensure we always start on dashboard when user logs in
  useEffect(() => {
    if (user && currentPage !== "dashboard") {
      console.log("🎯 Ensuring user starts on dashboard");
      setCurrentPage("dashboard");
    }
  }, [user]);

  // Fetch vehicles and users when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching data for user:", user?.username);
        
        // Fetch vehicles
        let vehiclesResponse = [];
        try {
          vehiclesResponse = await vehicleService.getAllVehicles();
          console.log("✅ Vehicles fetched:", vehiclesResponse?.length || 0);
        } catch (vehicleError) {
          console.error("❌ Vehicles fetch failed:", vehicleError);
          vehiclesResponse = getDemoVehicles();
        }
        
        // Fetch users (only if user has permission)
        let usersResponse = [];
        if (user && (user.role === "SUPERADMIN" || user.role === "ADMIN")) {
          try {
            usersResponse = await userService.getAllUsers(user.username);
            console.log("✅ Users fetched:", usersResponse?.length || 0);
          } catch (userError) {
            console.error("❌ Users fetch failed:", userError);
            usersResponse = [];
          }
        }
        
        setVehicles(vehiclesResponse || []);
        setUsers(usersResponse || []);
        
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        setVehicles(getDemoVehicles());
        setUsers([]);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  // Refresh users function for UserManagementPage
  const refreshUsers = async () => {
    if (!user || !(user.role === "SUPERADMIN" || user.role === "ADMIN")) return;
    
    try {
      const usersResponse = await userService.getAllUsers(user.username);
      setUsers(usersResponse || []);
      addNotification("Users list refreshed", "success");
    } catch (error) {
      console.error("Failed to refresh users:", error);
      addNotification("Failed to refresh users", "error");
    }
  };

  // Demo data functions (fallback if backend is unavailable)
  const getDemoVehicles = () => {
    return [
      {
        vin: "1HGCM82633A123456",
        make: "Toyota",
        model: "Camry", 
        year: 2022,
        mileage: 15000,
        status: "Available",
        description: "Sedan - Company Car",
        discExpiryDate: "2024-12-31",
        insuranceExpiryDate: "2024-12-31"
      },
      {
        vin: "2FMDK3GC5DBA56789",
        make: "Ford",
        model: "Explorer",
        year: 2023, 
        mileage: 8000,
        status: "In Use",
        description: "SUV - Field Operations",
        discExpiryDate: "2024-11-30",
        insuranceExpiryDate: "2024-11-30",
        destination: "Client Site A"
      },
      {
        vin: "3VWDP7AJ7DM234567",
        make: "Volkswagen",
        model: "Jetta",
        year: 2021,
        mileage: 35000,
        status: "In Maintenance",
        description: "Compact Sedan - Maintenance Required",
        discExpiryDate: "2024-10-15", 
        insuranceExpiryDate: "2024-10-15"
      }
    ];
  };

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
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Activity logging
  const logActivity = (action, details) => {
    const activity = {
      id: Date.now(),
      timestamp: new Date(),
      user: user?.username,
      action,
      details,
      type: 'info'
    };
    
    setActivityLog(prev => [activity, ...prev.slice(0, 99)]);
  };

  // User authentication - REAL IMPLEMENTATION
  const handleLogin = async (username, password) => {
    try {
      console.log("🔐 Attempting login for:", username);
      
      // Real authentication with your database
      const userData = await userService.login(username, password);
      console.log("✅ Authentication successful:", userData);

      if (!userData || !userData.role) {
        throw new Error("Invalid user data received");
      }

      // Normalize user data to match your database enum
      const normalizedUser = {
        username: userData.username || username,
        role: userData.role.toUpperCase(),
        name: userData.name || userData.username,
        email: userData.email || `${username}@pangolinfleet.com`,
        permissions: USER_ROLES[userData.role.toUpperCase()]?.permissions || []
      };

      // Validate role
      if (!USER_ROLES[normalizedUser.role]) {
        throw new Error(`Invalid user role: ${normalizedUser.role}`);
      }

      // CRITICAL FIX: ALWAYS go to dashboard, regardless of role
      console.log("🎯 Setting current page to DASHBOARD for user:", normalizedUser.username);
      setCurrentPage("dashboard");
      setUser(normalizedUser);
      localStorage.setItem("fleetUser", JSON.stringify(normalizedUser));
      setShowAccessModal(false);
      
      logActivity("User Login", `User ${username} logged in as ${normalizedUser.role}`);
      addNotification(`Welcome back, ${normalizedUser.name}!`, 'success');
      
      return { success: true, user: normalizedUser };
      
    } catch (error) {
      console.error("❌ Login error:", error);
      addNotification('Login failed. Please check your credentials.', 'error');
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out");
    logActivity("User Logout", `User ${user?.username} logged out`);
    addNotification('You have been logged out', 'info');
    
    setUser(null);
    setVehicles([]);
    setUsers([]);
    setCurrentPage("dashboard");
    localStorage.removeItem("fleetUser");
    setShowAccessModal(true);
  };

  // Enhanced vehicle operations with permission checks
  const addVehicle = async (vehicle) => {
    if (!canPerformAction("add-vehicle")) {
      addNotification("You don't have permission to add vehicles", 'error');
      return;
    }
    
    if (!vehicle.vin || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.mileage) {
      addNotification("Please fill all required fields", 'error');
      return;
    }
    
    try {
      const payload = { ...vehicle, year: Number(vehicle.year), mileage: Number(vehicle.mileage) };
      
      let savedVehicle;
      try {
        savedVehicle = await vehicleService.addVehicle(payload);
      } catch (error) {
        console.log("Backend unavailable, using local state");
        savedVehicle = { ...payload, id: Date.now() };
      }
      
      setVehicles([...vehicles, savedVehicle]);
      setNewVehicle({
        vin: "", make: "", model: "", year: "", mileage: "", status: "Available",
        description: "", discExpiryDate: "", insuranceExpiryDate: "",
      });
      setShowModal(false);
      
      logActivity("Vehicle Added", `Added ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`);
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} added successfully!`, 'success');
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      addNotification("Failed to add vehicle", 'error');
    }
  };

  const updateVehicle = async (vin, updatedVehicle) => {
    if (!canPerformAction("edit-vehicle")) {
      addNotification("You don't have permission to edit vehicles", 'error');
      return;
    }
    
    const oldVehicle = vehicles.find(v => v.vin === vin);
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? { ...v, ...updatedVehicle } : v)));
    try {
      await vehicleService.updateVehicle(vin, updatedVehicle);
      
      logActivity("Vehicle Updated", `Updated ${updatedVehicle.make || oldVehicle.make} ${updatedVehicle.model || oldVehicle.model}`);
      addNotification(`Vehicle ${updatedVehicle.make || oldVehicle.make} ${updatedVehicle.model || oldVehicle.model} updated!`, 'success');
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      addNotification("Vehicle updated locally", 'info');
    }
  };

  const deleteVehicle = async (vin) => {
    if (!canPerformAction("delete-vehicle")) {
      addNotification("You don't have permission to delete vehicles", 'error');
      return;
    }
    
    const vehicle = vehicles.find(v => v.vin === vin);
    try {
      await vehicleService.deleteVehicle(vin);
    } catch (error) {
      console.error("Backend delete failed, removing locally:", error);
    }
    
    setVehicles((prev) => prev.filter((v) => v.vin !== vin));
    
    logActivity("Vehicle Deleted", `Deleted ${vehicle.make} ${vehicle.model} (VIN: ${vin})`);
    addNotification(`Vehicle ${vehicle.make} ${vehicle.model} deleted`, 'success');
  };

  const updateStatus = async (vin, status, extra = {}) => {
    if (!canPerformAction("update-status")) {
      addNotification("You don't have permission to update vehicle status", 'error');
      return;
    }
    
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, status, ...extra };
    setVehicles((prev) => prev.map((v) => (v.vin === vin ? updated : v)));
    try {
      await vehicleService.updateVehicle(vin, updated);
      
      logActivity("Status Change", `Changed ${vehicle.make} ${vehicle.model} status to ${status}`);
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} status changed to ${status}`, 'success');
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
      addNotification(`Status updated locally`, 'info');
    }
  };

  const incrementMileage = async (vin, amount) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    if (!vehicle) return;
    const updated = { ...vehicle, mileage: vehicle.mileage + amount };
    await updateVehicle(vin, updated);
    
    logActivity("Mileage Update", `Updated mileage for ${vehicle.make} ${vehicle.model} by ${amount} km`);
    addNotification(`Mileage updated for ${vehicle.make} ${vehicle.model}`, 'info');
  };

  const saveDestination = async (vin, destination) => {
    await updateStatus(vin, "In Use", { destination });
  };

  // Bulk operations
  const handleBulkStatusChange = async (newStatus) => {
    if (!canPerformAction("update-status")) {
      addNotification("You don't have permission to update vehicle status", 'error');
      return;
    }
    
    if (selectedVehicles.size === 0) {
      addNotification("Please select vehicles first", 'warning');
      return;
    }
    
    const updates = Array.from(selectedVehicles).map(vin => 
      updateStatus(vin, newStatus)
    );
    
    await Promise.all(updates);
    setSelectedVehicles(new Set());
    
    logActivity("Bulk Status Update", `Updated ${selectedVehicles.size} vehicles to ${newStatus}`);
    addNotification(`Updated ${selectedVehicles.size} vehicles to ${newStatus}`, 'success');
  };

  const handleBulkDelete = async () => {
    if (!canPerformAction("delete-vehicle")) {
      addNotification("You don't have permission to delete vehicles", 'error');
      return;
    }
    
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
    
    logActivity("Bulk Delete", `Deleted ${selectedVehicles.size} vehicles`);
    addNotification(`Deleted ${selectedVehicles.size} vehicles`, 'success');
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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setAdvancedFilters({
      make: '', model: '', yearFrom: '', yearTo: '', mileageFrom: '', mileageTo: ''
    });
    addNotification('All filters cleared', 'info');
  };

  // Define accessible pages based on role
  const pages = [
    { id: "dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "vehicles", name: "Vehicles", icon: <FaCar /> },
    { id: "inuse", name: "In Use", icon: <FaCar /> },
    { id: "maintenance", name: "Maintenance", icon: <FaTools /> },
    { id: "reports", name: "Reports", icon: <FaChartLine /> },
    { id: "activity", name: "Activity Log", icon: <FaHistory /> },
    { id: "users", name: "User Management", icon: <FaUsers /> },
  ];

  // Show access modal if no user
  if (!user) {
    return (
      <UserAccessModal 
        onLogin={handleLogin}
        darkMode={darkMode}
      />
    );
  }

  console.log("🏠 User logged in:", user.username, "Role:", user.role, "Current Page:", currentPage);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <div className="logo">Pangolin Fleet</div>
        <div className="user-info">
          <span>{user.name || user.username}</span>
          <span className={`role-badge ${user.role.toLowerCase()}`}>
            {USER_ROLES[user.role]?.name || user.role}
            {user.role === "SUPERADMIN" && " ⭐"}
          </span>
        </div>
        
        <nav>
          {pages.map(({ id, name, icon }) => {
            // ✅ FIXED: Only show page if user has permission to access it
            const shouldShow = canAccessPage(id);
            
            console.log(`🔐 Navigation check - Page: ${id}, User: ${user.role}, Can Access: ${shouldShow}`);
            
            if (!shouldShow) return null;
            
            return (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={currentPage === id ? "active" : ""}
              >
                {icon} {name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main>
        <Header currentPage={currentPage} user={user} />

        <Notifications notifications={notifications} />

        {/* Routing with permission checks - ALWAYS START WITH DASHBOARD */}
        {currentPage === "dashboard" && canAccessPage("dashboard") && (
          <DashboardPage 
            vehicles={vehicles} 
            user={user}
            activityLog={activityLog}
            canPerformAction={canPerformAction}
            // ADD THESE NAVIGATION FUNCTIONS:
            onNavigateToVehicles={(filter = 'all') => {
              console.log("🚗 Navigating to vehicles with filter:", filter);
              setCurrentPage("vehicles");
              if (filter !== 'all') {
                setFilterStatus(filter);
              }
            }}
            onNavigateToMaintenance={() => {
              console.log("🔧 Navigating to maintenance");
              setCurrentPage("maintenance");
            }}
            onNavigateToInUse={() => {
              console.log("🚀 Navigating to in use");
              setCurrentPage("inuse");
            }}
            onNavigateToReports={() => {
              console.log("📊 Navigating to reports");
              setCurrentPage("reports");
            }}
            onNavigateToUsers={() => {
              console.log("👥 Navigating to users");
              setCurrentPage("users");
            }}
            onShowVehicleRequestModal={() => {
              addNotification("Vehicle request feature coming soon!", "info");
            }}
            onContactFleetManager={() => {
              window.open('mailto:fleetmanager@pangolinfleet.com', '_blank');
              addNotification("Opening email to fleet manager", "info");
            }}
            onExportData={() => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "Make,Model,Year,Status,Mileage\n"
                + vehicles.map(v => `${v.make},${v.model},${v.year},${v.status},${v.mileage}`).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "fleet_data.csv");
              document.body.appendChild(link);
              link.click();
              
              addNotification("Data exported successfully!", "success");
            }}
            onRefreshData={async () => {
              addNotification("Refreshing data...", "info");
              try {
                const vehiclesResponse = await vehicleService.getAllVehicles();
                setVehicles(vehiclesResponse || []);
                addNotification("Data refreshed successfully!", "success");
              } catch (error) {
                console.error("Refresh failed:", error);
                addNotification("Refresh failed, using cached data", "warning");
              }
            }}
          />
        )}

        {currentPage === "vehicles" && canAccessPage("vehicles") && (
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
            canEdit={canPerformAction("edit-vehicle")}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={handleBulkDelete}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            clearAllFilters={clearAllFilters}
            canPerformAction={canPerformAction}
            users={users}
            // Add navigation props
            onNavigateToMaintenance={() => setCurrentPage("maintenance")}
            onNavigateToReports={() => setCurrentPage("reports")}
          />
        )}

        {currentPage === "inuse" && canAccessPage("inuse") && (
          <InUsePage
            vehicles={vehicles.filter((v) => v.status === "In Use")}
            saveDestination={saveDestination}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            darkMode={darkMode}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            user={user}
            canPerformAction={canPerformAction}
            users={users}
          />
        )}

        {currentPage === "maintenance" && canAccessPage("maintenance") && (
          <MaintenancePage
            vehicles={vehicles.filter((v) => v.status === "In Maintenance")}
            updateStatus={updateStatus}
            updateVehicle={updateVehicle}
            incrementMileage={incrementMileage}
            theme={darkMode ? "dark" : "light"}
            user={user}
            canPerformAction={canPerformAction}
          />
        )}

        {currentPage === "reports" && canAccessPage("reports") && (
          <ReportPage 
            vehicles={vehicles} 
            darkMode={darkMode} 
            user={user} 
            activityLog={activityLog}
            canPerformAction={canPerformAction}
          />
        )}

        {currentPage === "activity" && canAccessPage("activity") && (
          <ActivityLogPage 
            activityLog={activityLog}
            user={user}
            canPerformAction={canPerformAction}
          />
        )}

        {currentPage === "users" && canAccessPage("users") && (
          <UserManagementPage 
            user={user}
            users={users}
            refreshUsers={refreshUsers}
          />
        )}
      </main>

      {showModal && canPerformAction("add-vehicle") && (
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