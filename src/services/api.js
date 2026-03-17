import axios from 'axios';

const API_BASE_URL = 'https://tgbhydz-rc.isvjcloud.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.succeed === 'true' || data.code === 0) {
      return data.data || [];
    }
    throw new Error(data.message || '查询失败');
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export const queryUserData = (params) => {
  return api.post('/activity/query', params);
};

export default api;
