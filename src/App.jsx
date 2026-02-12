import { Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./pages/auth/Login";

/* ================= DASHBOARD ================= */
import Dashboard from "./pages/Dashboard/Dashboard";

/* ================= HRMS ================= */
import HRMS from "./pages/HRMS/HRMS";
import AddEmployee from "./pages/HRMS/AddEmployee";
import EmployeeOverview from "./pages/HRMS/EmployeeOverview";
import EmployeeDetails from "./pages/HRMS/EmployeeDetails";
import EmployeeStatus from "./pages/HRMS/EmployeeStatus";
import Attendance from "./pages/HRMS/Attendance";
import Applications from "./pages/HRMS/Applications";

/* ================= PAYROLL ================= */
import Payroll from "./pages/Payroll/Payroll";
import RunPayroll from "./pages/Payroll/RunPayroll";
import PayslipView from "./pages/Payroll/PayslipView";
import SalaryTable from "./pages/Payroll/SalaryTable";

/* ================= AIMS ================= */
import AIMSDashboard from "./pages/AIMS/AIMSDashboard";
import AddItem from "./pages/AIMS/AddItem";
import EditItem from "./pages/AIMS/EditItem";
import AIMSInventoryList from "./pages/AIMS/AIMSInventoryList";
import AIMSStockMovements from "./pages/AIMS/AIMSStockMovements";
import AIMSRequestOrders from "./pages/AIMS/AIMSRequestOrders";
import AIMSRequestOrderCreate from "./pages/AIMS/AIMSRequestOrderCreate";
import AIMSRequestOrderView from "./pages/AIMS/AIMSRequestOrderView";
import AIMSPurchaseRequests from "./pages/AIMS/AIMSPurchaseRequests";
import AIMSPurchaseRequestCreate from "./pages/AIMS/AIMSPurchaseRequestCreate";
import AIMSViewPurchaseRequest from "./pages/AIMS/AIMSViewPurchaseRequest";
import AIMSSuppliers from "./pages/AIMS/AIMSSuppliers";
import AIMSCustomers from "./pages/AIMS/AIMSCustomers";
import AIMSSalesOrders from "./pages/AIMS/AIMSSalesOrders";
import AIMSSalesOrderCreate from "./pages/AIMS/AIMSSalesOrderCreate";
import AIMSSalesOrderView from "./pages/AIMS/AIMSSalesOrderView";

/* ================= MOMS ================= */
import MOMS from "./pages/MOMS/MOMS";
import Machines from "./pages/MOMS/Machines";
import Operators from "./pages/MOMS/Operators";
import Assignments from "./pages/MOMS/Assignments";
import Fuel from "./pages/MOMS/Fuel";
import Breakdowns from "./pages/MOMS/Breakdowns";
import MaintenanceLogs from "./pages/MOMS/MaintenanceLogs";
import MaintenanceSchedules from "./pages/MOMS/MaintenanceSchedules";
import Fleets from "./pages/MOMS/Fleets";
import Inventory from "./pages/MOMS/Inventory";
import StartShift from "./pages/MOMS/StartShift";
import DailyOps from "./pages/MOMS/DailyOps";
import FuelCosts from "./pages/MOMS/FuelCosts";
import Pricing from "./pages/MOMS/Pricing";
import FuelConsumptionReport from "./pages/MOMS/FuelConsumptionReport";

/* ================= REPORTS ================= */
import ReportsPage from "./pages/ReportsPage";

/* ================= SETTINGS ================= */
import SettingsPage from "./pages/Settings/SettingsPage";

/* ================= PROFILE ================= */
import Profile from "./pages/Profile/Profile";

/* ================= ROUTE GUARDS ================= */
import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= AUTHENTICATED ================= */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />

        {/* ================= PROFILE (UNIVERSAL ACCESS) ================= */}
        <Route path="/profile" element={<Profile />} />

        {/* ================= PAYSLIP VIEW (UNIVERSAL ACCESS) ================= */}
        <Route path="/payslip/:id" element={<PayslipView />} />

        {/* ================= HRMS ================= */}
        <Route element={<PermissionRoute permission="access_hrms" />}>
          <Route path="/hrms" element={<HRMS />} />
          <Route path="/hrms/add-employee" element={<AddEmployee />} />
          <Route path="/hrms/employee-overview" element={<EmployeeOverview />} />
          <Route
            path="/hrms/employee/:biometric_id"
            element={<EmployeeDetails />}
          />
          <Route path="/hrms/employee-status" element={<EmployeeStatus />} />
          <Route path="/hrms/attendance" element={<Attendance />} />
          <Route path="/hrms/applications" element={<Applications />} />
        </Route>

        {/* ================= PAYROLL ================= */}
        <Route element={<PermissionRoute permission="access_payroll" />}>
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/payroll/run" element={<RunPayroll />} />
          <Route path="/payroll/salary-table" element={<SalaryTable />} />
        </Route>

        {/* ================= AIMS ================= */}
        <Route element={<PermissionRoute permission="access_aims" />}>
          <Route path="/aims" element={<AIMSDashboard />} />
          <Route path="/aims/add-item" element={<AddItem />} />
          <Route path="/aims/items/:id/edit" element={<EditItem />} />
          <Route path="/aims/inventory" element={<AIMSInventoryList />} />
          <Route path="/aims/stock-movements" element={<AIMSStockMovements />} />
          <Route path="/aims/suppliers" element={<AIMSSuppliers />} />

          {/* Request Orders */}
          <Route path="/aims/request-orders" element={<AIMSRequestOrders />} />
          <Route
            path="/aims/request-orders/create"
            element={<AIMSRequestOrderCreate />}
          />
          <Route
            path="/aims/request-orders/:id"
            element={<AIMSRequestOrderView />}
          />

          {/* Purchase Requests */}
          <Route
            path="/aims/purchase-requests"
            element={<AIMSPurchaseRequests />}
          />
          <Route
            path="/aims/purchase-requests/create"
            element={<AIMSPurchaseRequestCreate />}
          />
          <Route
            path="/aims/purchase-requests/:id"
            element={<AIMSViewPurchaseRequest />}
          />

          {/* Setup */}
          <Route path="/aims/setup/customers" element={<AIMSCustomers />} />

          {/* Sales Orders */}
          <Route
            path="/aims/setup/sales-order"
            element={<AIMSSalesOrders />}
          />
          <Route
            path="/aims/setup/sales-order/create"
            element={<AIMSSalesOrderCreate />}
          />
          <Route
            path="/aims/setup/sales-order/:id"
            element={<AIMSSalesOrderView />}
          />
        </Route>

        {/* ================= MOMS ================= */}
        <Route element={<PermissionRoute permission="access_moms" />}>
          <Route path="/moms" element={<MOMS />} />
          <Route path="/moms/machines" element={<Machines />} />
          <Route path="/moms/operators" element={<Operators />} />
          <Route path="/moms/assignments" element={<Assignments />} />
          <Route path="/moms/fuel" element={<Fuel />} />
          <Route path="/moms/fuel/consumption-report" element={<FuelConsumptionReport />} />
          <Route path="/moms/breakdowns" element={<Breakdowns />} />
          
          {/* Maintenance */}
          <Route path="/moms/maintenance/logs" element={<MaintenanceLogs />} />
          <Route path="/moms/maintenance/schedules" element={<MaintenanceSchedules />} />
          
          {/* Fleet & Inventory */}
          <Route path="/moms/fleets" element={<Fleets />} />
          <Route path="/moms/inventory" element={<Inventory />} />
          
          {/* Operations */}
          <Route path="/moms/operations/start-shift" element={<StartShift />} />
          <Route path="/moms/operations/daily-ops" element={<DailyOps />} />
          
          {/* Finance */}
          <Route path="/moms/finance/fuel-costs" element={<FuelCosts />} />
          <Route path="/moms/finance/pricing" element={<Pricing />} />
        </Route>

        {/* ================= REPORTS ================= */}
        <Route element={<PermissionRoute permission="access_reports" />}>
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* ================= SETTINGS ================= */}
        <Route element={<PermissionRoute permission="access_settings" />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}