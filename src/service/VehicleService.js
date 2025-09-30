import axios from "axios";

const API_URL = "http://localhost:8080/service/users"; // Updated to match your controller

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { 
      username, 
      password 
    });
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

// Optional: Add permission check methods for your frontend
const checkPermissions = async (username) => {
  try {
    const [canEdit, canAdd, canDelete] = await Promise.all([
      axios.get(`${API_URL}/check/${username}/edit`),
      axios.get(`${API_URL}/check/${username}/add`),
      axios.get(`${API_URL}/check/${username}/delete`)
    ]);
    
    return {
      canEdit: canEdit.data,
      canAdd: canAdd.data,
      canDelete: canDelete.data
    };
  } catch (error) {
    console.error("Permission check failed:", error);
    return {
      canEdit: false,
      canAdd: false,
      canDelete: false
    };
  }
};

export default {
  login,
  register,
  checkPermissions
};