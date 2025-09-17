import axios from "axios";

const API_URL = "http://localhost:8080/service/maintenance";

const MaintenanceService = {

  /** Fetch all maintenance records */
  getAllMaintenance: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch maintenance records:", err);
      throw err;
    }
  },

  /** Add a new maintenance record */
  addMaintenance: async (maintenanceData) => {
    try {
      const response = await axios.post(`${API_URL}/add`, maintenanceData);
      return response.data;
    } catch (err) {
      console.error("Failed to add maintenance:", err.response || err);
      throw err;
    }
  },

  /** Get maintenance records for a specific vehicle VIN */
  getMaintenanceByVehicle: async (vin) => {
    try {
      const response = await axios.get(`${API_URL}/vehicle/${vin}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch maintenance for vehicle ${vin}:`, err);
      throw err;
    }
  },

  /** Update a maintenance record by ID */
  updateMaintenance: async (id, maintenanceData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, maintenanceData);
      return response.data;
    } catch (err) {
      console.error(`Failed to update maintenance ${id}:`, err);
      throw err;
    }
  },

  /** Delete a maintenance record by ID */
  deleteMaintenance: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete maintenance ${id}:`, err);
      throw err;
    }
  }
};

export default MaintenanceService;
