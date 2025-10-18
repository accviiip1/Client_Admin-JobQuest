// client/src/makeRequest.js
import axios from "axios";

const makeRequest = axios.create({
  baseURL: "http://localhost:8800/api", // 👈 backend port của cậu
  withCredentials: true,
});

export default makeRequest;
  