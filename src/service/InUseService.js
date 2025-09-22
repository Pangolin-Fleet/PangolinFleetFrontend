// src/service/InUseService.js
import axios from "axios";

const API_URL = "http://localhost:8080/service/inuse";

// ✅ Fetch all "in use" vehicles
const getAllInUse = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (err) {
    console.error("❌ Failed to fetch in-use vehicles:", err);
    throw err;
  }
};

// ✅ Add a new "in use" record
const addInUse = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/add`, data);
    return response.data;
  } catch (err) {
    console.error("❌ Failed to add InUse record:", err);
    throw err;
  }
};

// ✅ Update an existing "in use" record
const updateInUse = async (vin, updates) => {
  try {
    const response = await axios.put(`${API_URL}/${vin}`, updates);
    return response.data;
  } catch (err) {
    console.error("❌ Failed to update in-use vehicle:", err);
    throw err;
  }
};

export default {
  getAllInUse,
  addInUse,
  updateInUse,
};
