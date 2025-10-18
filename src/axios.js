import axios from "axios";

// Lấy API URL từ file .env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8800/api";

export const apiImage = `${baseURL}/images/`;

export const makeRequest = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
