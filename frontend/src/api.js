import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTopics = async () => {
  const response = await api.get('/topics');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/leaderboard');
  return response.data;
};

export const predictTopic = async (topicName) => {
  const response = await api.post('/predict', { topic: topicName });
  return response.data;
};

export const analyzePaper = async (title, abstract) => {
  const response = await api.post('/analyze-paper', { title, abstract });
  return response.data;
};

export const getFutureAspects = async (topicName) => {
  const response = await api.post('/future-aspects', { topic: topicName });
  return response.data;
};

export default api;
