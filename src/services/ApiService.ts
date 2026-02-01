import axios from "axios";

//const API_BASE_URL = "http://10.0.0.104:8000/api"; 
const API_BASE_URL = "https://presensure.presensure.pro/api";
//const API_BASE_URL = "http://10.20.149.220:8000/api";
const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // store token after login
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiService;
