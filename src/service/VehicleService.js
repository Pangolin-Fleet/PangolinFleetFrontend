import axios from "axios";

const API_URL = "http://localhost:8080/service/vehicle";

const VehicleService = {
  getAllVehicles: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  addVehicle: async (vehicle) => {
    const res = await axios.post(`${API_URL}/add`, vehicle);
    return res.data;
  },

  updateVehicle: async (vin, vehicle) => {   // <-- make sure this exists
    const res = await axios.put(`${API_URL}/${vin}`, vehicle);
    return res.data;
  },

  deleteVehicle: async (vin) => {
    const res = await axios.delete(`${API_URL}/delete/${vin}`);
    return res.data;
  }
};

export default VehicleService;  // <-- must export an object, not anonymous
