import React, { useState, useEffect } from "react";
import { 
  FaUserPlus, FaUser, FaUserShield, FaTrash, FaCrown, FaSync, 
  FaTimes, FaSave, FaExclamationTriangle, FaEdit, FaEye, FaSearch,
  FaKey, FaLock
} from "react-icons/fa";
import userService from "../service/UserService";
import "./UserManagementPage.css";

export default function UserManagementPage({ users, currentUser, onUserCreated, onUserDeleted, onUserUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    role: "DRIVER" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminCount, setAdminCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New states for password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Calculate admin count from the actual users prop
  useEffect(() => {
    const admins = users.filter(user => user.role === "ADMIN" || user.role === "SUPERADMIN").length;
    setAdminCount(admins);
  }, [users]);

  // Enhanced super admin detection
  const isSuperAdmin = () => {
    const superAdminIndicators = [
      currentUser?.isSuperUser,
      currentUser?.role === "SUPER_ADMIN",
      currentUser?.role === "SUPERADMIN", 
      currentUser?.username === "superadmin",
    ];
    
    const isSuper = superAdminIndicators.some(indicator => 
      indicator === true || (typeof indicator === 'string' && indicator.includes('SUPER'))
    );
    
    return isSuper;
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.isSuperUser && "super admin".includes(searchTerm.toLowerCase()))
  );

  // Permission checks
  const canCreateUsers = () => {
    return isSuperAdmin() || currentUser?.role === "ADMIN";
  };

  const canCreateAdmin = () => {
    if (isSuperAdmin()) return true;
    if (currentUser?.role === "ADMIN") return adminCount < 3;
    return false;
  };

  const canEditUser = (targetUser) => {
    if (!targetUser) return false;
    
    // Super Admin can edit anyone (admins and drivers)
    if (isSuperAdmin()) return true;
    
    // Admin can only edit drivers, NOT other admins
    if (currentUser?.role === "ADMIN") {
      return targetUser.role === "DRIVER";
    }
    
    // Drivers cannot edit anyone
    return false;
  };

  const canDeleteUser = (targetUser) => {
    if (!targetUser) return false;
    
    // ONLY Super Admin can delete users (admins or drivers)
    if (!isSuperAdmin()) return false;
    
    // Super Admin cannot delete themselves
    if (targetUser.username === currentUser?.username) {
      return false;
    }
    
    return true;
  };

  // New permission check for password updates
  const canUpdatePassword = (targetUser) => {
    if (!targetUser) return false;
    
    // Users can always update their own password
    if (targetUser.username === currentUser?.username) {
      return true;
    }
    
    // Super Admin can update anyone's password
    if (isSuperAdmin()) return true;
    
    // Admin can update drivers' passwords
    if (currentUser?.role === "ADMIN" && targetUser.role === "DRIVER") {
      return true;
    }
    
    return false;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (formData.role === "ADMIN" && !canCreateAdmin()) {
      setError("Cannot create more admin users. Maximum limit of 3 admins reached.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const newUser = await userService.registerByAdmin(currentUser.username, formData);
      setSuccess(`User ${newUser.username} created successfully as ${newUser.role}`);
      setFormData({ username: "", password: "", role: "DRIVER" });
      setShowForm(false);
      onUserCreated(newUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role
    });
    setShowForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setError("Username is required");
      return;
    }

    // Check if trying to change role to admin when not allowed
    if (formData.role === "ADMIN" && editingUser.role !== "ADMIN" && !canCreateAdmin()) {
      setError("Cannot change user to admin. Maximum limit of 3 admins reached.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatedUser = await userService.updateUser(
        currentUser.username, 
        editingUser.username, 
        formData
      );
      setSuccess(`User ${updatedUser.username} updated successfully`);
      setShowForm(false);
      setEditingUser(null);
      setFormData({ username: "", password: "", role: "DRIVER" });
      onUserUpdated(updatedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    const userToDelete = users.find(u => u.username === username);
    
    // Extra confirmation for admin deletion
    if (userToDelete?.role === "ADMIN" || userToDelete?.role === "SUPERADMIN") {
      if (!window.confirm(`⚠️ ADMIN DELETION: You are about to delete Administrator "${username}". This action cannot be undone. Are you absolutely sure?`)) {
        return;
      }
    } else if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
      return;
    }

    try {
      await userService.deleteUser(currentUser.username, username);
      setSuccess(`User ${username} deleted successfully`);
      onUserDeleted({ username });
    } catch (err) {
      setError(err.message);
    }
  };

  // New password update handlers
  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await userService.updateUserPassword(
        currentUser.username, 
        passwordUser.username, 
        passwordData.newPassword
      );
      
      setSuccess(`Password for ${passwordUser.username} updated successfully`);
      setShowPasswordModal(false);
      setPasswordUser(null);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordUser(null);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const getRoleIcon = (user) => {
    if (!user) return <FaUser />;
    if (user.isSuperUser || isSuperAdminUser(user)) return <FaCrown className="super-user-icon" />;
    return user.role === "ADMIN" ? <FaUserShield /> : <FaUser />;
  };

  const isSuperAdminUser = (user) => {
    return user?.isSuperUser || user?.role === "SUPER_ADMIN" || user?.role === "SUPERADMIN";
  };

  const getRoleDisplay = (user) => {
    if (!user) return "UNKNOWN";
    if (isSuperAdminUser(user)) return "SUPER ADMIN";
    return user.role;
  };

  const getCurrentUserRoleDisplay = () => {
    if (isSuperAdmin()) return "SUPER ADMIN";
    return currentUser?.role || "UNKNOWN";
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: "", password: "", role: "DRIVER" });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Get action buttons based on user role and target user
  const getActionButtons = (user) => {
    const buttons = [];
    
    // Update Password Button - Users can update their own password, admins can update others
    if (canUpdatePassword(user)) {
      buttons.push(
        <button 
          key="password"
          className="btn btn-password"
          onClick={() => handleOpenPasswordModal(user)}
          title={`Update password for ${user.username}`}
        >
          <FaKey /> Update Password
        </button>
      );
    }
    
    // Edit Button - Super Admin can edit anyone, Admin can only edit drivers
    if (canEditUser(user)) {
      buttons.push(
        <button 
          key="edit"
          className="btn btn-edit"
          onClick={() => handleEditUser(user)}
          title={`Edit ${user.username}`}
        >
          <FaEdit /> Edit User
        </button>
      );
    }
    
    // Delete Button - ONLY Super Admin can delete (and not themselves)
    if (canDeleteUser(user)) {
      buttons.push(
        <button 
          key="delete"
          className="btn btn-delete"
          onClick={() => handleDeleteUser(user.username)}
          title={`Delete ${user.username}`}
        >
          <FaTrash /> Delete User
        </button>
      );
    }
    
    // No actions available
    if (buttons.length === 0) {
      let message = "No Management Access";
      if (user.username === currentUser?.username) {
        message = "Your Account";
      } else if (currentUser?.role === "ADMIN" && user.role === "ADMIN") {
        message = "Admin Account (View Only)";
      } else if (currentUser?.role === "DRIVER") {
        message = "View Only";
      }
      
      buttons.push(
        <span key="no-actions" className="no-actions">
          {message}
        </span>
      );
    }
    
    return buttons;
  };

  // Summary statistics
  const summaryCards = [
    { 
      label: "Total Users", 
      value: users.length, 
      icon: <FaUser />, 
      color: "#6366f1" 
    },
    { 
      label: "Administrators", 
      value: adminCount, 
      icon: <FaUserShield />, 
      color: "#10b981" 
    },
    { 
      label: "Drivers", 
      value: users.filter(user => user.role === "DRIVER").length, 
      icon: <FaUser />, 
      color: "#f59e0b" 
    },
    { 
      label: "Your Access", 
      value: isSuperAdmin() ? "Full Control" : currentUser?.role === "ADMIN" ? "Manage Drivers" : "View Only", 
      icon: isSuperAdmin() ? <FaCrown /> : currentUser?.role === "ADMIN" ? <FaUserShield /> : <FaEye />, 
      color: isSuperAdmin() ? "#FFD700" : currentUser?.role === "ADMIN" ? "#00d4ff" : "#94a3b8" 
    }
  ];

  return (
    <div className="user-management-page">
      {/* Space Background */}
      <div className="space-background"></div>
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Pangolin Fleet</h1>
            <p>User Management & Access Control</p>
            <div className="user-permission-level">
              <span className={`permission-badge ${currentUser?.role?.toLowerCase()} ${isSuperAdmin() ? 'super' : ''}`}>
                {isSuperAdmin() ? "⭐ Super Administrator - Full System Control" : 
                 currentUser?.role === "ADMIN" ? "🛡️ Administrator - Can Manage Drivers" : 
                 "👤 Driver - View Only Access"}
              </span>
            </div>
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name || currentUser?.username || "Admin"}</div>
            <div className="user-role">
              {isSuperAdmin() ? "⭐ Super Administrator" : getCurrentUserRoleDisplay()}
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-cards">
            {summaryCards.map((card, idx) => (
              <div key={idx} className="summary-card">
                <div className="summary-card-content">
                  <div className="summary-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="summary-text">
                    <div className="summary-value" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="summary-label">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role-based Notices */}
        {isSuperAdmin() && (
          <div className="super-admin-notice">
            <div className="notice-content">
              <FaCrown className="notice-icon" />
              <div>
                <p><strong>Super Administrator Access</strong></p>
                <p>You have full system control. Only you can delete users (admins and drivers). You cannot delete your own account.</p>
              </div>
            </div>
          </div>
        )}

        {currentUser?.role === "ADMIN" && !isSuperAdmin() && (
          <div className="admin-limit-notice">
            <div className="notice-content">
              <FaUserShield className="notice-icon" />
              <div>
                <p><strong>Administrator Access</strong></p>
                <p>You can create and edit drivers. You can view all users but cannot delete anyone. Administrator accounts: {adminCount} / 3</p>
                {adminCount >= 3 && (
                  <p className="warning">You have reached the maximum number of administrator accounts.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentUser?.role === "DRIVER" && !isSuperAdmin() && (
          <div className="driver-notice">
            <div className="notice-content">
              <FaEye className="notice-icon" />
              <div>
                <p><strong>View Only Access</strong></p>
                <p>As a Driver, you can view user information but cannot create, edit, or delete users.</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="alert error" onClick={clearMessages}>
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {success && (
          <div className="alert success" onClick={clearMessages}>
            <FaSave /> {success}
          </div>
        )}

        {/* Toolbar with Search */}
        <div className="page-toolbar">
          <div className="search-filters">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users by username or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="search-clear"
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            {searchTerm && (
              <div className="search-results-info">
                Found {filteredUsers.length} user(s) matching "{searchTerm}"
              </div>
            )}
          </div>

          <div className="action-buttons">
            {canCreateUsers() && (
              <button 
                className="btn-compact btn-primary-compact"
                onClick={() => setShowForm(true)}
                disabled={formData.role === "ADMIN" && !canCreateAdmin()}
              >
                <FaUserPlus /> Create New User
              </button>
            )}
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.username} className={`user-card vehicle-card ${isSuperAdminUser(user) ? 'super-user' : user.role.toLowerCase()}`}>
              <div className="card-header">
                <div className="vehicle-title">
                  <h3>{user.username}</h3>
                  <span className="vehicle-year">
                    {isSuperAdminUser(user) ? "Super Administrator" : 
                     user.role === "ADMIN" ? "Administrator" : "Driver"}
                    {user.username === currentUser?.username && " (You)"}
                  </span>
                </div>
                <span className={`status-pill ${isSuperAdminUser(user) ? 'super' : user.role.toLowerCase()}`}>
                  {getRoleIcon(user)}
                  {getRoleDisplay(user)}
                </span>
              </div>

              <div className="card-body">
                <div className="vehicle-info">
                  <div className="info-section">
                    <div className="info-row">
                      <span className="info-label">Username:</span>
                      <span className="info-value">{user.username}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Role:</span>
                      <span className="info-value">
                        <span className={`role-badge ${isSuperAdminUser(user) ? 'super' : user.role.toLowerCase()}`}>
                          {getRoleDisplay(user)}
                        </span>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status:</span>
                      <span className="info-value">
                        <span className="status-active">Active</span>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Access Level:</span>
                      <span className="info-value">
                        <span className={`permission-indicator ${
                          canEditUser(user) ? 'editable' : 'view-only'
                        }`}>
                          {isSuperAdminUser(user) ? "Super Admin" : 
                           user.role === "ADMIN" ? "Administrator" : "Driver"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {getActionButtons(user)}
                </div>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <FaUser className="empty-icon" />
              <h3>No Users Found</h3>
              <p>
                {searchTerm 
                  ? `No users found matching "${searchTerm}"` 
                  : "Get started by creating your first user account"
                }
              </p>
              {searchTerm ? (
                <button className="btn btn-primary" onClick={clearSearch}>
                  <FaTimes /> Clear Search
                </button>
              ) : (
                canCreateUsers() && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowForm(true)}
                  >
                    <FaUserPlus /> Create First User
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingUser ? <><FaEdit /> Edit User</> : <><FaUserPlus /> Create New User</>}
              </h2>
              <button 
                className="modal-close"
                onClick={cancelForm}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaUser style={{ marginRight: '8px' }} /> 
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="form-input"
                    placeholder="Enter username"
                    required
                    disabled={loading || !!editingUser}
                  />
                  {editingUser && (
                    <div className="info-text">
                      Username cannot be changed
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaKey style={{ marginRight: '8px' }} /> 
                    {editingUser ? "New Password" : "Password *"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="form-input"
                    placeholder={editingUser ? "Enter new password to change, or leave blank to keep current" : "Enter password (min 4 characters)"}
                    required={!editingUser}
                    disabled={loading}
                  />
                  {editingUser && (
                    <div className="info-text">
                      <FaKey /> Leave blank to keep current password, or enter new password to change
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaUserShield style={{ marginRight: '8px' }} /> 
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="form-select"
                    disabled={loading || (editingUser && isSuperAdminUser(editingUser))}
                  >
                    <option value="DRIVER">Driver</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                  
                  {editingUser && isSuperAdminUser(editingUser) && (
                    <div className="validation-message info">
                      <FaCrown /> Super Admin role cannot be changed
                    </div>
                  )}
                  
                  {formData.role === "ADMIN" && !canCreateAdmin() && (
                    <div className="validation-message error">
                      <FaExclamationTriangle /> Cannot create more admin accounts. Maximum limit reached.
                    </div>
                  )}
                  
                  {formData.role === "ADMIN" && canCreateAdmin() && (
                    <div className="validation-message success">
                      <FaSave /> You can create admin accounts ({3 - adminCount} remaining)
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={cancelForm}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={loading || 
                    (formData.role === "ADMIN" && !canCreateAdmin()) ||
                    (editingUser && isSuperAdminUser(editingUser) && formData.role !== "ADMIN")
                  }
                >
                  {loading ? <FaSync className="spin" /> : (editingUser ? <FaSave /> : <FaUserPlus />)}
                  {loading ? "Saving..." : (editingUser ? "Update User" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <FaLock /> Update Password for {passwordUser?.username}
              </h2>
              <button 
                className="modal-close"
                onClick={closePasswordModal}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaLock style={{ marginRight: '8px' }} /> 
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="form-input"
                    placeholder="Enter new password (min 4 characters)"
                    required
                    disabled={loading}
                  />
                  <div className="info-text">
                    Password must be at least 4 characters long
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaLock style={{ marginRight: '8px' }} /> 
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={closePasswordModal}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={loading}
                >
                  {loading ? <FaSync className="spin" /> : <FaKey />}
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}