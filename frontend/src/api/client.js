import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await client.get('/api/health');
    return res.data;
  },

  // Medicines Catalog
  getMedicines: async () => {
    const res = await client.get('/api/medicines');
    return res.data;
  },

  // Inventory Table
  getInventory: async (params = {}) => {
    const res = await client.get('/api/inventory', { params });
    return res.data;
  },

  // Predict Demand
  predict: async (payload) => {
    const res = await client.post('/api/predict', payload);
    return res.data;
  },

  // Specific Medicine Forecast
  getForecast: async (medicine) => {
    const res = await client.get(`/api/forecast/${encodeURIComponent(medicine)}`);
    return res.data;
  },

  // Analytics Aggregations
  getAnalytics: async () => {
    const res = await client.get('/api/analytics');
    return res.data;
  },

  // Smart Reorder Recommendations
  getRecommendations: async () => {
    const res = await client.get('/api/recommendations');
    return res.data;
  },

  // Model Evaluation & Importances
  getModelPerformance: async () => {
    const res = await client.get('/api/model-performance');
    return res.data;
  },

  // Operational Alerts
  getAlerts: async () => {
    const res = await client.get('/api/alerts');
    return res.data;
  }
};

export default api;
