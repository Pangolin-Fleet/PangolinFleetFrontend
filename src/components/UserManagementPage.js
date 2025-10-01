import React, { useState, useEffect } from "react";
import { FaUserPlus, FaUser, FaUserShield, FaTrash, FaCrown, FaSync } from "react-icons/fa";
import userService from "../service/UserService";
import "./UserManagementPage.css";

export default function UserManagementPage({ users, currentUser, onUserCreated, onUserDeleted }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    role: "DRIVER" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminCount, setAdminCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate admin count from the actual users prop
  useEffect(() => {
    console.log("📊 Users updated, recalculating admin count:", users);
    const admins = users.filter(user => user.role === "ADMIN").length;
    console.log("👥 Current admin count:", admins);
    setAdminCount(admins);
  }, [users]); // This will recalculate whenever users prop changes

  const canCreateAdmin = () => {
    if (currentUser.isSuperUser) {
      console.log("🔓 Super user can create unlimited admins");
      return true;
    }
    
    if (currentUser.role === "ADMIN") {
      const canCreate = adminCount < 3;
      console.log(`🔐 Regular admin - Current: ${adminCount}, Limit: 3, Can create: ${canCreate}`);
      return canCreate;
    }
    
    console.log("❌ User cannot create admins");
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

    // Check admin limit BEFORE making the API call
    if (formData.role === "ADMIN" && !canCreateAdmin()) {
      setError("Cannot create more admin users. Maximum limit of 3 admins reached.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("🔄 Creating user:", formData);
      const newUser = await userService.registerByAdmin(currentUser.username, formData);
      console.log("✅ User created response:", newUser);
      
      setSuccess(`User ${newUser.username} created successfully as ${newUser.role}`);
      setFormData({ username: "", password: "", role: "DRIVER" });
      setShowForm(false);
      
      // Call the parent handler to update the users list
      onUserCreated(newUser);
      
    } catch (err) {
      console.error("❌ User creation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canDeleteUser = (targetUser) => {
    if (!targetUser) return false;
    if (targetUser.username === currentUser.username) return false;
    if (currentUser.isSuperUser) return true;
    if (currentUser.role === "ADMIN") return targetUser.role === "DRIVER";
    return false;
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
      return;
    }

    try {
      console.log("🗑️ Deleting user:", username);
      await userService.deleteUser(currentUser.username, username);
      setSuccess(`User ${username} deleted successfully`);
      
      // Call the parent handler to update the users list
      onUserDeleted({ username });
      
    } catch (err) {
      console.error("❌ User deletion failed:", err);
      setError(err.message);
    }
  };

  const getRoleIcon = (user) => {
    if (!user) return <FaUser />;
    if (user.isSuperUser) return <FaCrown className="super-user-icon" />;
    return user.role === "ADMIN" ? <FaUserShield /> : <FaUser />;
  };

  const getRoleDisplay = (user) => {
    if (!user) return "UNKNOWN";
    return user.isSuperUser ? "SUPER ADMIN" : user.role;
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="user-count">
            Total users: {users.length} | 
            Admins: {adminCount} / 3 |
            {currentUser.isSuperUser ? " ⭐ Super User (Unlimited)" : " Regular Admin"}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
            disabled={formData.role === "ADMIN" && !canCreateAdmin()}
          >
            <FaUserPlus /> Create New User
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {/* Admin limit notice */}
      {currentUser.role === "ADMIN" && !currentUser.isSuperUser && (
        <div className="admin-limit-notice">
          <p>⚠️ Administrator Accounts: {adminCount} / 3 ({3 - adminCount} remaining)</p>
          {adminCount >= 3 && (
            <p className="warning">You have reached the maximum number of administrator accounts.</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={loading}
                >
                  <option value="DRIVER">Driver</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                
                {formData.role === "ADMIN" && !canCreateAdmin() && (
                  <div className="warning-text">
                    ❌ Cannot create more admin accounts. Maximum limit reached.
                  </div>
                )}
                
                {formData.role === "ADMIN" && canCreateAdmin() && (
                  <div className="info-text">
                    ✅ You can create admin accounts ({3 - adminCount} remaining)
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || (formData.role === "ADMIN" && !canCreateAdmin())}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-grid">
        {users.map(user => (
          <div key={user.username} className={`user-card ${user.isSuperUser ? 'super-user' : ''}`}>
            <div className="user-avatar">
              {getRoleIcon(user)}
            </div>
            <div className="user-info">
              <h3>{user.username}</h3>
              <span className={`user-role ${user.role.toLowerCase()} ${user.isSuperUser ? 'super' : ''}`}>
                {getRoleDisplay(user)}
              </span>
            </div>
            <div className="user-actions">
              {canDeleteUser(user) && (
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteUser(user.username)}
                  title={`Delete ${user.username}`}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="no-users">
            <p>No users found in the system.</p>
            <p>Create your first user using the "Create New User" button.</p>
          </div>
        )}
      </div>
    </div>
  );
}