import axios from "axios";

// 🔥 FIX: Change this URL to match your AuthController
const AUTH_URL = "http://localhost:8080/api/auth";  // NEW
const USER_URL = "http://localhost:8080/service/users";  // KEEP THIS FOR USER MANAGEMENT

// --- Login --- (FIXED ENDPOINT)
const login = async (username, password) => {
  try {
    console.log("🔐 Attempting login at:", `${AUTH_URL}/login`);
    
    const response = await axios.post(`${AUTH_URL}/login`, { 
      username, 
      password 
    });
    
    console.log("✅ Login successful:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    
    const msg = error.response?.status === 401
      ? "Invalid username or password"
      : "Login failed. Please try again.";
    throw new Error(msg);
  }
};

// --- Get all users --- (KEEP THIS THE SAME)
const getAllUsers = async (requesterUsername) => {
  try {
    const response = await axios.get(`${USER_URL}?requesterUsername=${requesterUsername}`);
    if (!Array.isArray(response.data)) return [];
    return response.data;
  } catch (error) {
    console.error("Fetch users failed:", error.response?.data || error.message);
    return [];
  }
};

// --- Register user by admin --- (KEEP THIS THE SAME)
const registerByAdmin = async (adminUsername, userData) => {
  try {
    console.log('🔄 Registering user by admin:', { adminUsername, userData });
    
    const backendUserData = {
      username: userData.username,
      password: userData.password,
      role: userData.role
    };
    
    console.log('📤 Sending to backend:', backendUserData);
    
    const response = await axios.post(
      `${USER_URL}/register?adminUsername=${encodeURIComponent(adminUsername)}`,
      backendUserData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ User registration successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ User registration failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    let errorMessage = "Failed to create user";
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = JSON.stringify(error.response.data);
      }
    }
    
    throw new Error(errorMessage);
  }
};

// --- Update user password --- (KEEP THIS THE SAME)
const updateUserPassword = async (adminUsername, targetUsername, newPassword) => {
  try {
    const response = await axios.post(
      `${USER_URL}/${targetUsername}/password?adminUsername=${encodeURIComponent(adminUsername)}`,
      {
        newPassword: newPassword
      }
    );
    
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 400) {
      throw new Error("Invalid password data");
    }
    if (status === 403) {
      throw new Error("No permission to update password");
    }
    if (status === 404) {
      throw new Error("User not found");
    }
    throw new Error(error.response?.data?.message || "Failed to update password");
  }
};

// --- Delete user --- (KEEP THIS THE SAME)
const deleteUser = async (adminUsername, targetUsername) => {
  try {
    const response = await axios.delete(
      `${USER_URL}/admin/${targetUsername}?adminUsername=${encodeURIComponent(adminUsername)}`
    );
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 404) {
      throw new Error("User not found");
    }
    if (status === 403) {
      throw new Error("No permission to delete user");
    }
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

export default {
  login,
  getAllUsers,
  registerByAdmin,
  deleteUser,
  updateUserPassword
};