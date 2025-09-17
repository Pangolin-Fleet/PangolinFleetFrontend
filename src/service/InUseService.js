import axios from "axios";

const API_URL = "http://localhost:8080/service/vehicle";

const getInUseVehicles = async () => {
  const response = await axios.get(API_URL);
  return response.data.filter(v => v.status === "In Use");
};

const updateVehicleDetails = async (vin, details) => {
  const response = await axios.put(`${API_URL}/${vin}`, details);
  return response.data;
};

export default {
  getInUseVehicles,
  updateVehicleDetails,
};
