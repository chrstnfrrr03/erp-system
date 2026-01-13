import axios from "axios";

const aimsApi = axios.create({
  baseURL: "http://localhost:8000/api/aims",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default aimsApi;
