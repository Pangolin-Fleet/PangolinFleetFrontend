import React, { useState, useEffect } from "react";
import { 
  FaUserPlus, FaUser, FaUserShield, FaTrash, FaCrown, FaSync, 
  FaTimes, FaSave, FaExclamationTriangle, FaEdit, FaEye, FaSearch,
  FaKey, FaLock, FaCheckCircle, FaEyeSlash
} from "react-icons/fa";
import userService from "../service/UserService";
import "./UserManagementPage.css";

export default function UserManagementPage({ users, currentUser, onUserCreated, onUserDeleted, onUserUpdated }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  
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
  
  // Password modal states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate admin count from the actual users prop
  useEffect(() => {
    const admins = users.filter(user => user.role === "ADMIN" || isSuperAdminUser(user)).length;
    setAdminCount(admins);
  }, [users]);

  // Enhanced super admin detection
  const isSuperAdmin = () => {
    if (!currentUser) return false;
    
    const superAdminIndicators = [
      currentUser.isSuperUser === true,
      currentUser.role === "SUPER_ADMIN",
      currentUser.role === "SUPERADMIN", 
      currentUser.username === "superadmin",
      currentUser.username?.toLowerCase().includes("super"),
      currentUser.role?.toLowerCase().includes("super"),
    ];
    
    return superAdminIndicators.some(indicator => indicator === true);
  };

  // Improved super admin user detection
  const isSuperAdminUser = (user) => {
    if (!user) return false;
    
    const superAdminIndicators = [
      user.isSuperUser === true,
      user.role === "SUPER_ADMIN",
      user.role === "SUPERADMIN", 
      user.username === "superadmin",
      user.username?.toLowerCase().includes("super"),
      user.role?.toLowerCase().includes("super"),
    ];
    
    return superAdminIndicators.some(indicator => indicator === true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isSuperAdminUser(user) && "super admin".includes(searchTerm.toLowerCase()))
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

  const canDeleteUser = (targetUser) => {
    if (!targetUser) return false;
    
    // ONLY Super Admin can delete users (admins and drivers)
    if (!isSuperAdmin()) return false;
    
    // Super Admin cannot delete themselves
    if (targetUser.username === currentUser?.username) {
      return false;
    }
    
    return true;
  };

  // Permission check for password updates
  const canUpdatePassword = (targetUser) => {
    if (!targetUser || !currentUser) return false;
    
    // Rule 1: Users can always update their own password
    if (targetUser.username === currentUser.username) {
      return true;
    }
    
    // Rule 2: Super Admin can update anyone's password
    if (isSuperAdmin()) {
      return true;
    }
    
    // Rule 3: Admin can update drivers' passwords
    if (currentUser.role === "ADMIN" && targetUser.role === "DRIVER") {
      return true;
    }
    
    return false;
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    // Common password check
    const commonPasswords = [
      '123456', 'password', '12345678', 'qwerty', '123456789', 
      '12345', '1234', '111111', '1234567', 'dragon', '123123',
      'admin', 'letmein', 'welcome', 'monkey', 'password1'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push("This password is too common");
    }

    return { score, feedback };
  };

  // Real-time password strength indicator component
  const PasswordStrengthIndicator = ({ strength }) => {
    const { score, feedback } = strength;
    
    const getStrengthColor = () => {
      if (score <= 2) return '#ff4444';
      if (score <= 3) return '#ffaa00';
      if (score <= 4) return '#00aa44';
      return '#00aa44';
    };

    const getStrengthText = () => {
      if (score <= 2) return 'Weak';
      if (score <= 3) return 'Fair';
      if (score <= 4) return 'Good';
      return 'Strong';
    };

    return (
      <div className="password-strength-indicator">
        <div className="strength-bar">
          <div 
            className="strength-fill"
            style={{
              width: `${(score / 5) * 100}%`,
              backgroundColor: getStrengthColor()
            }}
          ></div>
        </div>
        <div className="strength-info">
          <span style={{ color: getStrengthColor() }}>
            Strength: {getStrengthText()} ({score}/5)
          </span>
          {feedback.length > 0 && (
            <div className="strength-feedback">
              <small>Requirements missing:</small>
              <ul>
                {feedback.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
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
      setShowCreateModal(false);
      onUserCreated(newUser);
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    const userToDelete = users.find(u => u.username === username);
    
    // Extra confirmation for admin deletion
    if (userToDelete?.role === "ADMIN" || isSuperAdminUser(userToDelete)) {
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
      setError(err.message || "Failed to delete user");
    }
  };

  // Password update handlers
  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStrength({ score: 0, feedback: [] });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleNewPasswordChange = (password) => {
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Enhanced password strength validation
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please meet the requirements above.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Special case: If user is updating their own password, require current password
    const isUpdatingOwnPassword = passwordUser.username === currentUser.username;
    if (isUpdatingOwnPassword && !currentPassword) {
      setError("Please enter your current password for security verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare password data for the service
      const passwordData = {
        newPassword: newPassword
      };

      // Only include current password if user is updating their own password
      if (isUpdatingOwnPassword) {
        passwordData.currentPassword = currentPassword;
      }

      await userService.updateUserPassword(
        currentUser.username, 
        passwordUser.username, 
        passwordData
      );
      
      setSuccess(`Password for ${passwordUser.username} updated successfully`);
      setShowPasswordModal(false);
      setPasswordUser(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength({ score: 0, feedback: [] });
      
    } catch (err) {
      console.error('❌ Password update error:', err);
      
      // Provide more specific error messages
      let errorMessage = err.message || "Failed to update password";
      
      if (err.message.includes("current password") || err.message.includes("Current password")) {
        errorMessage = "Current password is incorrect. Please try again.";
      } else if (err.message.includes("permission") || err.message.includes("Permission")) {
        errorMessage = "You don't have permission to update this user's password.";
      } else if (err.message.includes("400")) {
        errorMessage = "Invalid password format. Please check the requirements.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowPasswordModal(false);
    setPasswordUser(null);
    setFormData({ username: "", password: "", role: "DRIVER" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStrength({ score: 0, feedback: [] });
  };

  // Generate a secure random password
  const generateSecurePassword = () => {
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*";
    
    // Ensure at least one of each type
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  };

  const getRoleIcon = (user) => {
    if (!user) return <FaUser />;
    if (isSuperAdminUser(user)) return <FaCrown className="super-user-icon" />;
    return user.role === "ADMIN" ? <FaUserShield /> : <FaUser />;
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
      } else if (currentUser?.role === "ADMIN" && (user.role === "ADMIN" || isSuperAdminUser(user))) {
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
      value: users.filter(user => user.role === "DRIVER" && !isSuperAdminUser(user)).length, 
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
              <span className={`permission-badge ${isSuperAdmin() ? 'super' : currentUser?.role?.toLowerCase()}`}>
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
                <p>You can create drivers and update passwords. You can view all users but cannot delete anyone. Administrator accounts: {adminCount} / 3</p>
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
                <p>As a Driver, you can view user information but cannot create or delete users. You can only update your own password.</p>
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
            <FaCheckCircle /> {success}
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
                onClick={() => setShowCreateModal(true)}
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
                          canUpdatePassword(user) ? 'editable' : 'view-only'
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
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FaUserPlus /> Create First User
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <FaUserPlus /> Create New User
              </h2>
              <button 
                className="modal-close"
                onClick={closeModals}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
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
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaLock style={{ marginRight: '8px' }} /> 
                    Password *
                  </label>
                  <div className="password-input-group">
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="form-input"
                      placeholder="Enter password (min 4 characters)"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="generate-password-btn"
                      onClick={generateRandomPassword}
                      title="Generate secure password"
                    >
                      <FaKey />
                    </button>
                  </div>
                  <div className="info-text">
                    <FaKey /> Password must be at least 4 characters long
                  </div>
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
                    disabled={loading}
                  >
                    <option value="DRIVER">Driver</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                  
                  {formData.role === "ADMIN" && !canCreateAdmin() && (
                    <div className="validation-message error">
                      <FaExclamationTriangle /> Cannot create more admin accounts. Maximum limit reached.
                    </div>
                  )}
                  
                  {formData.role === "ADMIN" && canCreateAdmin() && (
                    <div className="validation-message success">
                      <FaCheckCircle /> You can create admin accounts ({3 - adminCount} remaining)
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={closeModals}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={loading || 
                    (formData.role === "ADMIN" && !canCreateAdmin())
                  }
                >
                  {loading ? <FaSync className="spin" /> : <FaUserPlus />}
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {showPasswordModal && passwordUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <FaLock /> Update Password for {passwordUser.username}
              </h2>
              <button 
                className="modal-close"
                onClick={closeModals}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword}>
              <div className="form-grid">
                {/* Current Password (only required when user is updating their own password) */}
                {passwordUser.username === currentUser.username && (
                  <div className="form-group">
                    <label className="form-label">
                      <FaLock style={{ marginRight: '8px' }} /> 
                      Current Password *
                    </label>
                    <div className="password-input-group">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-input"
                        placeholder="Enter your current password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <div className="info-text">
                      <FaKey /> You must verify your current password to change it
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">
                    <FaLock style={{ marginRight: '8px' }} /> 
                    New Password *
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      className="form-input"
                      placeholder="Enter new password (min 8 characters)"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      type="button"
                      className="generate-password-btn"
                      onClick={generateSecurePassword}
                      title="Generate secure password"
                    >
                      <FaKey />
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <PasswordStrengthIndicator strength={passwordStrength} />
                  )}
                  
                  <div className="info-text">
                    <FaKey /> Password must be at least 8 characters with uppercase, lowercase, number, and special character
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label className="form-label">
                    <FaLock style={{ marginRight: '8px' }} /> 
                    Confirm New Password *
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`form-input ${confirmPassword && newPassword !== confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="validation-message error">
                      <FaExclamationTriangle /> Passwords do not match
                    </div>
                  )}
                  {confirmPassword && newPassword === confirmPassword && passwordStrength.score >= 3 && (
                    <div className="validation-message success">
                      <FaCheckCircle /> Passwords match and meet security requirements
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={closeModals}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={loading || 
                    !newPassword || 
                    !confirmPassword || 
                    newPassword !== confirmPassword || 
                    passwordStrength.score < 3 ||
                    (passwordUser.username === currentUser.username && !currentPassword)
                  }
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