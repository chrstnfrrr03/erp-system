import axios from "axios";

const settingsApi = axios.create({
  baseURL: "http://localhost:8000/api/settings",
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

export default settingsApi;