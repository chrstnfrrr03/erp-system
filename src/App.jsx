import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import HRMS from "./pages/HRMS/HRMS";
import AddEmployee from "./pages/HRMS/AddEmployee";
import EmployeeOverview from "./pages/HRMS/EmployeeOverview";
import EmployeeDetails from "./pages/HRMS/EmployeeDetails";
import Payroll from "./pages/Payroll/Payroll";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/hrms" element={<HRMS />} />
      <Route path="/hrms/add-employee" element={<AddEmployee />} />
      <Route path="/hrms/employee-overview" element={<EmployeeOverview />} />
      <Route path="/hrms/employee/:biometric_id" element={<EmployeeDetails />} />
      <Route path="/payroll" element={<Payroll />} />
    </Routes>
  );
}
