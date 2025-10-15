import React, { useState, useEffect } from "react";
import { 
  FaUsers, FaUserPlus, FaTrash, FaEye, FaEyeSlash, 
  FaShieldAlt, FaUserShield, FaUser, FaSearch,
  FaSync, FaCheck, FaTimesCircle, FaExclamationTriangle,
  FaKey, FaStar, FaCrown, FaCar
} from "react-icons/fa";
import userService from "../service/UserService";
import "./UserManagementPage.css";

export default function UserManagementPage({ user: currentUser, users: initialUsers = [], refreshUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [passwordUpdate, setPasswordUpdate] = useState({});
  const [updatingPasswords, setUpdatingPasswords] = useState({});

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "DRIVER"
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers(currentUser.username);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      addNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 3)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole ? user.role === filterRole : true;
    
    return matchesSearch && matchesRole;
  });

  const canCreateUser = currentUser.role === "SUPERADMIN" || currentUser.role === "ADMIN";
  const canEditUser = (targetUser) => 
    currentUser.role === "SUPERADMIN" || 
    (currentUser.role === "ADMIN" && targetUser.role === "DRIVER");
  
  const canDeleteUser = (targetUser) => 
    currentUser.role === "SUPERADMIN" && targetUser.username !== currentUser.username;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      addNotification("Please fill in username and password", "error");
      return;
    }

    if (newUser.password.length < 4) {
      addNotification("Password must be at least 4 characters", "error");
      return;
    }

    try {
      setLoading(true);
      await userService.registerByAdmin(currentUser.username, newUser);
      
      addNotification(`User ${newUser.username} created successfully!`, "success");
      setNewUser({
        username: "",
        password: "",
        role: "DRIVER"
      });
      setShowCreateForm(false);
      await loadUsers();
      
    } catch (error) {
      console.error("Failed to create user:", error);
      if (error.message.includes("Max admin users reached") || error.message.includes("maximum limit")) {
        addNotification("Cannot create admin user - maximum admin limit reached (3 admins max)", "error");
      } else if (error.message.includes("Username already exists")) {
        addNotification("Username already exists", "error");
      } else if (error.message.includes("permission") || error.message.includes("Permission") || error.message.includes("cannot create admin")) {
        addNotification("You don't have permission to create this type of user", "error");
      } else {
        addNotification(error.message || "Failed to create user", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (userToUpdate) => {
    const newPassword = passwordUpdate[userToUpdate.username];
    
    if (!newPassword) {
      addNotification("Please enter a new password", "error");
      return;
    }

    if (newPassword.length < 4) {
      addNotification("Password must be at least 4 characters", "error");
      return;
    }

    try {
      setUpdatingPasswords(prev => ({ ...prev, [userToUpdate.username]: true }));
      
      await userService.updateUserPassword(
        currentUser.username, 
        userToUpdate.username, 
        newPassword
      );
      
      addNotification(`Password updated for ${userToUpdate.username}`, "success");
      setPasswordUpdate(prev => ({ ...prev, [userToUpdate.username]: "" }));
      
    } catch (error) {
      console.error("Failed to update password:", error);
      addNotification(error.message || "Failed to update password", "error");
    } finally {
      setUpdatingPasswords(prev => ({ ...prev, [userToUpdate.username]: false }));
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.username === currentUser.username) {
      addNotification("You cannot delete your own account", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${userToDelete.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(currentUser.username, userToDelete.username);
      
      addNotification(`User ${userToDelete.username} deleted successfully`, "success");
      await loadUsers();
      
    } catch (error) {
      console.error("Failed to delete user:", error);
      addNotification(error.message || "Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (username) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handlePasswordUpdate = (username, password) => {
    setPasswordUpdate(prev => ({
      ...prev,
      [username]: password
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', text: 'Enter password' };
    if (password.length < 4) return { strength: 'weak', text: 'Too short' };
    if (password.length < 8) return { strength: 'medium', text: 'Could be stronger' };
    return { strength: 'strong', text: 'Strong password' };
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      SUPERADMIN: { color: "#f59e0b", icon: <FaCrown />, label: "Super Admin" },
      ADMIN: { color: "#3b82f6", icon: <FaShieldAlt />, label: "Administrator" },
      DRIVER: { color: "#10b981", icon: <FaCar />, label: "Driver" }
    };
    
    const config = roleConfig[role] || roleConfig.DRIVER;
    
    return (
      <span className="role-badge" style={{ backgroundColor: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getCardClass = (role) => {
    switch (role) {
      case 'SUPERADMIN': return 'user-card superadmin';
      case 'ADMIN': return 'user-card admin';
      case 'DRIVER': return 'user-card driver';
      default: return 'user-card';
    }
  };

  const isAdminLimitReached = () => {
    const adminCount = users.filter(u => u.role === "ADMIN" || u.role === "SUPERADMIN").length;
    return adminCount >= 3;
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-main">
              <h1>User Management</h1>
              <p>Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      {/* Space Background */}
      <div className="space-background"></div>
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>
              <FaUsers className="header-icon" />
              User Management
            </h1>
            <p>Manage system users and their permissions securely</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">{currentUser.name || currentUser.username}</span>
              {getRoleBadge(currentUser.role)}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.type === 'success' && <FaCheck />}
            {notification.type === 'error' && <FaTimesCircle />}
            {notification.type === 'info' && <FaExclamationTriangle />}
            {notification.message}
          </div>
        ))}
      </div>

      <div className="page-content">
        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card interactive">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#6366f1" }}>
                  <FaUsers />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#6366f1" }}>
                    {users.length}
                  </div>
                  <div className="summary-label">Total Users</div>
                </div>
              </div>
              <div className="card-hover-effect">View All Users</div>
            </div>
            <div className="summary-card interactive">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#f59e0b" }}>
                  <FaCrown />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#f59e0b" }}>
                    {users.filter(u => u.role === "SUPERADMIN").length}
                  </div>
                  <div className="summary-label">Super Admins</div>
                </div>
              </div>
              <div className="card-hover-effect">Super Admin Team</div>
            </div>
            <div className="summary-card interactive">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#3b82f6" }}>
                  <FaShieldAlt />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#3b82f6" }}>
                    {users.filter(u => u.role === "ADMIN").length}
                  </div>
                  <div className="summary-label">Administrators</div>
                </div>
              </div>
              <div className="card-hover-effect">Admin Team</div>
            </div>
            <div className="summary-card interactive">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#10b981" }}>
                  <FaCar />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#10b981" }}>
                    {users.filter(u => u.role === "DRIVER").length}
                  </div>
                  <div className="summary-label">Drivers</div>
                </div>
              </div>
              <div className="card-hover-effect">Driver Team</div>
            </div>
          </div>
        </div>

        {/* Admin Limit Warning */}
        {isAdminLimitReached() && (
          <div className={`permission-notice ${currentUser.role === "SUPERADMIN" ? "superadmin" : ""}`}>
            <FaShieldAlt /> 
            <div>
              <strong>Admin Limit Reached</strong>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
                {currentUser.role === "SUPERADMIN" 
                  ? "You can override the 3-admin limit as a Super Admin" 
                  : "Maximum of 3 admin users allowed. Contact Super Admin for assistance."
                }
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="page-toolbar">
          <div className="search-filters">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Administrator</option>
              <option value="DRIVER">Driver</option>
            </select>

            <button 
              onClick={loadUsers}
              className="btn-compact btn-mileage-compact"
              disabled={loading}
            >
              <FaSync /> Refresh
            </button>
          </div>

          {canCreateUser && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-compact btn-primary-compact"
              disabled={loading}
            >
              <FaUserPlus /> Create User
            </button>
          )}
        </div>

        {/* Create User Form */}
        {showCreateForm && canCreateUser && (
          <div className="create-user-form user-card">
            <div className="card-header">
              <div className="vehicle-title">
                <h3>
                  <FaUserPlus style={{ marginRight: '10px' }} />
                  Create New User
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            
            <div className="card-body">
              {currentUser.role === "ADMIN" && (
                <div className="permission-notice">
                  <FaExclamationTriangle /> 
                  <strong>Note:</strong> Admin users can only create Driver accounts. 
                  Only SUPERADMIN can create other Admin users.
                </div>
              )}
              
              {isAdminLimitReached() && currentUser.role === "SUPERADMIN" && (
                <div className="permission-notice superadmin-notice">
                  <FaShieldAlt /> 
                  <strong>Super Admin Override:</strong> Admin limit reached, but you can override this limit.
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      className="form-input"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className="form-input"
                      placeholder="Enter password"
                      required
                      minLength="4"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="form-select"
                      required
                      disabled={currentUser.role === "ADMIN"}
                    >
                      <option value="DRIVER">Driver</option>
                      {currentUser.role === "SUPERADMIN" && (
                        <>
                          <option value="ADMIN">Administrator</option>
                          <option value="SUPERADMIN">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-save" disabled={loading}>
                    {loading ? "Creating..." : <><FaUserPlus /> Create User</>}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-cancel"
                  >
                    <FaTimesCircle /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="users-grid-container">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h3>No users found</h3>
              <p>
                {searchQuery || filterRole 
                  ? "Try adjusting your search criteria" 
                  : "Get started by creating your first user"
                }
              </p>
              {canCreateUser && !searchQuery && !filterRole && (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  <FaUserPlus /> Create First User
                </button>
              )}
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.username} className={getCardClass(user.role)}>
                  <div className="card-header">
                    <div className="user-header">
                      <div className="user-info-main">
                        <h3>{user.username}</h3>
                        <div className="user-meta">
                          <span className="username">@{user.username}</span>
                        </div>
                      </div>
                      <div className="user-role">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Security Section */}
                    {(currentUser.role === "SUPERADMIN" || 
                      (currentUser.role === "ADMIN" && user.role === "DRIVER")) && (
                      <div className="security-section">
                        <div className="security-header">
                          <FaShieldAlt className="security-icon" />
                          <h4>Reset Password</h4>
                        </div>
                        
                        <div className="password-input-wrapper">
                          <input
                            type={passwordVisibility[user.username] ? "text" : "password"}
                            value={passwordUpdate[user.username] || ""}
                            onChange={(e) => handlePasswordUpdate(user.username, e.target.value)}
                            placeholder="Enter new secure password..."
                            className="form-input"
                          />
                          <div className="password-actions">
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility(user.username)}
                              title={passwordVisibility[user.username] ? "Hide password" : "Show password"}
                            >
                              {passwordVisibility[user.username] ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            <button
                              onClick={() => handleUpdatePassword(user)}
                              disabled={!passwordUpdate[user.username] || 
                                       passwordUpdate[user.username].length < 4 ||
                                       updatingPasswords[user.username]}
                              className="btn btn-mileage"
                            >
                              {updatingPasswords[user.username] ? (
                                <><FaSync /> Updating</>
                              ) : (
                                <><FaKey /> Update</>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="password-strength">
                          <div className={`strength-dot ${getPasswordStrength(passwordUpdate[user.username]).strength}`} />
                          {getPasswordStrength(passwordUpdate[user.username]).text}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="card-actions">
                      {canDeleteUser(user) && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="btn btn-delete"
                        >
                          <FaTrash /> Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}