import axios from "axios";

const payrollApi = axios.create({
  baseURL: "http://localhost:8000/api/payroll",
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

export default payrollApi;