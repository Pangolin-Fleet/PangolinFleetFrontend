import axios from "axios";

const API_URL = "http://localhost:8080/service/vehicle";

const VehicleService = {
  getAllVehicles: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  addVehicle: async (vehicle) => {
    try {
      const res = await axios.post(`${API_URL}/add`, vehicle);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // VIN already exists
        throw new Error(err.response.data);
      } else {
        throw new Error("Failed to add vehicle. Please try again.");
      }
    }
  },

  updateVehicle: async (vin, vehicle) => {
    const res = await axios.put(`${API_URL}/${vin}`, vehicle);
    return res.data;
  },

  deleteVehicle: async (vin) => {
    const res = await axios.delete(`${API_URL}/delete/${vin}`);
    return res.data;
  },
};

export default VehicleService;
