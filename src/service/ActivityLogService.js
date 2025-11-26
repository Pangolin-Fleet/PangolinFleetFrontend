
// ActivityLogService.js
import axios from "axios";

const API_URL = "http://localhost:8080/service/activity";

const ActivityLogService = {
  getAllActivities: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      return [];
    }
  },

  logActivity: async (username, action, details, type = "INFO", entityType = null, entityId = null) => {
    try {
      const response = await axios.post(`${API_URL}/log`, {
        username,
        action, 
        details,
        type,
        entityType,
        entityId
      });
      return response.data;
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  },

  searchActivities: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Failed to search activities:", error);
      return [];
    }
  },

  getActivityStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error("Failed to get activity stats:", error);
      return {};
    }
  },

  clearActivities: async () => {
    try {
      await axios.delete(API_URL);
      return true;
    } catch (error) {
      console.error("Failed to clear activities:", error);
      return false;
    }
  }
};

export default ActivityLogService;