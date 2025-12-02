import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import HRMS from "./pages/HRMS/HRMS";
import AddEmployee from "./pages/HRMS/AddEmployee";  

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/hrms" element={<HRMS />} />
      <Route path="/hrms/add-employee" element={<AddEmployee />} />  {}
    </Routes>
  );
}