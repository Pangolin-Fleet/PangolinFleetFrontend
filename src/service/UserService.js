import axios from "axios";

const API_URL = "http://localhost:8080/service/users";

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    console.log("✅ Login successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    }
    throw new Error("Login failed. Please try again.");
  }
};

// REAL implementation that calls your backend
const getAllUsers = async (requesterUsername) => {
  try {
    console.log("👥 Fetching users from backend for:", requesterUsername);
    
    const response = await axios.get(`${API_URL}?requesterUsername=${requesterUsername}`);
    
    console.log("📊 Users API response status:", response.status);
    
    // Handle different response types
    if (response.status === 200) {
      if (Array.isArray(response.data)) {
        console.log("✅ Users fetched successfully:", response.data.length, "users");
        return response.data;
      } else {
        console.log("⚠️ Response is not an array, returning empty array");
        return [];
      }
    } else {
      console.log("⚠️ Non-200 response, returning empty array");
      return [];
    }
    
  } catch (error) {
    console.error("❌ Fetch users failed:", error);
    
    // More detailed error logging
    if (error.response) {
      console.log("❌ Error response status:", error.response.status);
      console.log("❌ Error response data:", error.response.data);
      
      if (error.response.status === 404) {
        console.log("⚠️ Users endpoint not found - make sure getAllUsers endpoint exists in backend");
        return [];
      }
      if (error.response.status === 403) {
        console.log("⚠️ Access denied for user:", requesterUsername);
        return [];
      }
    } else if (error.request) {
      console.log("❌ No response received:", error.request);
    } else {
      console.log("❌ Error setting up request:", error.message);
    }
    
    return [];
  }
};

// REAL implementation that calls your backend
const registerByAdmin = async (adminUsername, userData) => {
  try {
    console.log("📝 Creating user in backend:", userData);
    const response = await axios.post(
      `${API_URL}/register?adminUsername=${adminUsername}`, 
      userData
    );
    console.log("✅ User created in database:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ User creation failed:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error("User registration endpoint not implemented in backend yet");
    }
    if (error.response?.status === 403) {
      throw new Error("Only ADMIN users can create new users");
    }
    if (error.response?.status === 409) {
      throw new Error("Username already exists");
    }
    
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

// REAL implementation that calls your backend
const deleteUser = async (adminUsername, targetUsername) => {
  try {
    console.log("🗑️ Deleting user from backend:", targetUsername);
    const response = await axios.delete(
      `${API_URL}/admin/${targetUsername}?adminUsername=${adminUsername}`
    );
    console.log("✅ User deleted from database");
    return response.data;
  } catch (error) {
    console.error("❌ Delete user failed:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error("User deletion endpoint not implemented in backend yet");
    }
    
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

const getAdminCount = async (requesterUsername) => {
  try {
    const response = await axios.get(`${API_URL}/admin/count?requesterUsername=${requesterUsername}`);
    return response.data;
  } catch (error) {
    console.error("Get admin count failed:", error.response?.data || error.message);
    return 0;
  }
};

export default {
  login,
  registerByAdmin,
  getAllUsers,
  deleteUser,
  getAdminCount
};