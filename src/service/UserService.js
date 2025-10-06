import axios from "axios";

const API_URL = "http://localhost:8080/service/users";

// --- Login ---
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    console.log("✅ Login successful:", response.data);
    return response.data;
  } catch (error) {
    const msg = error.response?.status === 401
      ? "Invalid username or password"
      : "Login failed. Please try again.";
    console.error("❌ Login failed:", error.response?.data || error.message);
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
    console.error("❌ Fetch users failed:", error.response?.data || error.message);
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
const updateUserPassword = async (adminUsername, targetUsername, newPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/${targetUsername}/password?adminUsername=${adminUsername}`,
      { newPassword }
    );
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 400) throw new Error(error.response?.data || "Failed to update password");
    if (status === 403) throw new Error("No permission to update password");
    throw new Error(error.response?.data?.message || "Failed to update password");
  }
};

// --- Get admin count ---
const getAdminCount = async (requesterUsername) => {
  try {
    const response = await axios.get(`${API_URL}/admin/count?requesterUsername=${requesterUsername}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get admin count failed:", error.response?.data || error.message);
    return 0;
  }
};

export default {
  login,
  getAllUsers,
  registerByAdmin,
  deleteUser,
  updateUserPassword,
  getAdminCount
};