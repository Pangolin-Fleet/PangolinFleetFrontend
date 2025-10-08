import axios from "axios";

const API_URL = "http://localhost:8080/service/users";

// --- Login ---
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    const msg = error.response?.status === 401
      ? "Invalid username or password"
      : "Login failed. Please try again.";
    throw new Error(msg);
  }
};

// --- Get all users ---
const getAllUsers = async (requesterUsername) => {
  try {
    const response = await axios.get(`${API_URL}?requesterUsername=${requesterUsername}`);
    if (!Array.isArray(response.data)) return [];
    return response.data;
  } catch (error) {
    console.error("Fetch users failed:", error.response?.data || error.message);
    return [];
  }
};

// --- Register user by admin ---
const registerByAdmin = async (adminUsername, userData) => {
  try {
    const response = await axios.post(`${API_URL}/register?adminUsername=${adminUsername}`, userData);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 403) throw new Error("Only SUPERADMIN can create new users");
    if (status === 409) throw new Error("Username already exists");
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

// --- Update user ---
const updateUser = async (adminUsername, targetUsername, userData) => {
  try {
    console.log('🔄 Updating user request:', {
      adminUsername,
      targetUsername, 
      userData
    });

    // Try different endpoint variations
    let response;
    
    // Option 1: PUT with different endpoint structure
    try {
      console.log('🔄 Trying Option 1: PUT /update');
      response = await axios.put(
        `${API_URL}/update?adminUsername=${adminUsername}`,
        {
          targetUsername: targetUsername,
          username: userData.username,
          role: userData.role
        }
      );
      console.log('✅ Option 1 succeeded');
      return response.data;
    } catch (error1) {
      console.log('❌ Option 1 failed:', error1.response?.status);
    }

    // Option 2: POST with different endpoint structure
    try {
      console.log('🔄 Trying Option 2: POST /update');
      response = await axios.post(
        `${API_URL}/update?adminUsername=${adminUsername}`,
        {
          targetUsername: targetUsername,
          username: userData.username,
          role: userData.role
        }
      );
      console.log('✅ Option 2 succeeded');
      return response.data;
    } catch (error2) {
      console.log('❌ Option 2 failed:', error2.response?.status);
    }

    // Option 3: PUT with username in path
    try {
      console.log('🔄 Trying Option 3: PUT with username in path');
      response = await axios.put(
        `${API_URL}/${targetUsername}?adminUsername=${adminUsername}`,
        {
          role: userData.role
          // Don't send username if it can't be changed
        }
      );
      console.log('✅ Option 3 succeeded');
      return response.data;
    } catch (error3) {
      console.log('❌ Option 3 failed:', error3.response?.status);
    }

    // Option 4: POST with username in path but different structure
    try {
      console.log('🔄 Trying Option 4: POST with username in path');
      response = await axios.post(
        `${API_URL}/${targetUsername}/update?adminUsername=${adminUsername}`,
        {
          role: userData.role
        }
      );
      console.log('✅ Option 4 succeeded');
      return response.data;
    } catch (error4) {
      console.log('❌ Option 4 failed:', error4.response?.status);
    }

    // If all options fail
    throw new Error("All update methods failed. Please check backend endpoint.");

  } catch (error) {
    console.error('❌ User update error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    const status = error.response?.status;
    const errorData = error.response?.data;
    
    if (status === 400) {
      const errorMsg = errorData?.message || errorData || "Invalid user data provided";
      throw new Error(errorMsg);
    }
    if (status === 403) throw new Error("You don't have permission to update this user");
    if (status === 404) throw new Error("User not found");
    if (status === 405) throw new Error("Method not allowed - please contact administrator");
    if (status === 409) throw new Error("Username already exists");
    
    throw new Error(errorData?.message || "Failed to update user. Please check your permissions.");
  }
};

// --- Delete user ---
const deleteUser = async (adminUsername, targetUsername) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/${targetUsername}?adminUsername=${adminUsername}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 404) throw new Error("User not found or cannot delete");
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

// --- Update user password ---
const updateUserPassword = async (adminUsername, targetUsername, passwordData) => {
  try {
    console.log('🔐 Password update request:', {
      adminUsername,
      targetUsername, 
      passwordData
    });

    // Build request body based on what's provided
    const requestBody = {};
    
    if (passwordData.newPassword) {
      requestBody.newPassword = passwordData.newPassword;
    }
    
    if (passwordData.currentPassword) {
      requestBody.currentPassword = passwordData.currentPassword;
    }

    const response = await axios.post(
      `${API_URL}/${targetUsername}/password?adminUsername=${adminUsername}`,
      requestBody
    );
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 400) {
      const errorMsg = error.response?.data?.message || error.response?.data || "Invalid password data";
      throw new Error(errorMsg);
    }
    if (status === 403) throw new Error("No permission to update password");
    if (status === 404) throw new Error("User not found");
    throw new Error(error.response?.data?.message || "Failed to update password");
  }
};

// --- Get admin count ---
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
  getAllUsers,
  registerByAdmin,
  updateUser,
  deleteUser,
  updateUserPassword,
  getAdminCount
};