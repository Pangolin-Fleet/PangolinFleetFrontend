import axios from "axios";

const API_URL = "http://localhost:8080/service/maintenance";

// Fetch all maintenance logs
const getAllMaintenance = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Save a new maintenance record
const addMaintenance = async (maintenanceData) => {
  const response = await axios.post(`${API_URL}/add`, maintenanceData);
  return response.data;
};

// Get maintenance logs for a specific vehicle VIN
const getMaintenanceByVehicle = async (vin) => {
  const response = await axios.get(`${API_URL}/vehicle/${vin}`);
  return response.data;
};

// Update maintenance record
const updateMaintenance = async (id, maintenanceData) => {
  const response = await axios.put(`${API_URL}/${id}`, maintenanceData);
  return response.data;
};

// Delete maintenance record
const deleteMaintenance = async (id) => {
  await axios.delete(`${API_URL}/delete/${id}`);
};

export default {
  getAllMaintenance,
  addMaintenance,
  getMaintenanceByVehicle,
  updateMaintenance,
  deleteMaintenance,
};
