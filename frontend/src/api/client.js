import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // required: backend uses express-session cookies
});

export function fileUrl(path) {
  return `${API_URL}${path}`;
}

export default api;
