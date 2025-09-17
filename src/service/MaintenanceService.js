import axios from "axios";

const API_URL = "http://localhost:8080/service/maintenance";

const getAllMaintenance = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (err) {
    console.error("Error fetching maintenance:", err);
    return [];
  }
};

const addMaintenance = async (maintenanceData) => {
  try {
    const response = await axios.post(`${API_URL}/add`, maintenanceData);
    return response.data;
  } catch (err) {
    console.error("Error adding maintenance:", err);
    throw err;
  }
};

const updateMaintenance = async (id, maintenanceData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, maintenanceData);
    return response.data;
  } catch (err) {
    console.error("Error updating maintenance:", err);
    throw err;
  }
};

const deleteMaintenance = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (err) {
    console.error("Error deleting maintenance:", err);
    throw err;
  }
};

// Optional: fetch by vehicle VIN
const getMaintenanceByVehicle = async (vin) => {
  try {
    const response = await axios.get(`${API_URL}/vehicle/${vin}`);
    return response.data;
  } catch (err) {
    console.error(`Error fetching maintenance for vehicle ${vin}:`, err);
    return [];
  }
};

export default {
  getAllMaintenance,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceByVehicle,
};
