import axios from "axios";

const API_URL = "http://localhost:8080/service/user"; // Backend base URL

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    // response.data should be { id, username, role }
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

const register = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/register`, user);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// Admin only: get all users
const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: { requesterUsername: "admin" }, // replace dynamically if needed
    });
    return response.data;
  } catch (error) {
    console.error("Fetching users failed:", error.response?.data || error.message);
    throw error;
  }
};

// Get user by username
const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/role`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error(`Fetching user ${username} failed:`, error.response?.data || error.message);
    throw error;
  }
};

export default {
  login,
  register,
  getAllUsers,
  getUserByUsername,
};
