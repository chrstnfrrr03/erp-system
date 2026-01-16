import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";

/* HRMS */
import HRMS from "./pages/HRMS/HRMS";
import AddEmployee from "./pages/HRMS/AddEmployee";
import EmployeeOverview from "./pages/HRMS/EmployeeOverview";
import EmployeeDetails from "./pages/HRMS/EmployeeDetails";
import EmployeeStatus from "./pages/HRMS/EmployeeStatus";
import Attendance from "./pages/HRMS/Attendance";

/* Payroll */
import Payroll from "./pages/Payroll/Payroll";
import RunPayroll from "./pages/Payroll/RunPayroll";
import PayslipView from "./pages/Payroll/PayslipView";
import SalaryTable from "./pages/Payroll/SalaryTable";

/* AIMS */
import AIMSDashboard from "./pages/AIMS/AIMSDashboard";
import AddItem from "./pages/AIMS/AddItem";
import AIMSInventoryList from "./pages/AIMS/AIMSInventoryList";
import AIMSStockMovements from "./pages/AIMS/AIMSStockMovements";
import AIMSRequestOrders from "./pages/AIMS/AIMSRequestOrders";
import AIMSPurchaseRequests from "./pages/AIMS/AIMSPurchaseRequests";
import AIMSSuppliers from "./pages/AIMS/AIMSSuppliers";
import EditItem from "./pages/AIMS/EditItem";





export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {/* HRMS */}
      <Route path="/hrms" element={<HRMS />} />
      <Route path="/hrms/add-employee" element={<AddEmployee />} />
      <Route path="/hrms/employee-overview" element={<EmployeeOverview />} />
      <Route path="/hrms/employee/:biometric_id" element={<EmployeeDetails />} />
      <Route path="/hrms/employee-status" element={<EmployeeStatus />} />
      <Route path="/hrms/attendance" element={<Attendance />} />

      {/* Payroll */}
      <Route path="/payroll" element={<Payroll />} />
      <Route path="/payroll/run" element={<RunPayroll />} />
      <Route path="/payslip/:id" element={<PayslipView />} />
      <Route path="/payroll/salary-table" element={<SalaryTable />} />

      {/* AIMS */}
      <Route path="/aims" element={<AIMSDashboard />} />
      <Route path="/aims/add-item" element={<AddItem />} />
      <Route path="/aims/items/:id/edit" element={<EditItem />} />
      <Route path="/aims/inventory" element={<AIMSInventoryList />} />
      <Route path="/aims/stock-movements" element={<AIMSStockMovements />} />
      <Route path="/aims/request-orders" element={<AIMSRequestOrders />} />
      <Route path="/aims/purchase-requests" element={<AIMSPurchaseRequests />} />
      <Route path="/aims/suppliers" element={<AIMSSuppliers />} />
    </Routes>
  );
}
