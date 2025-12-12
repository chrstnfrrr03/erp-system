import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";

import {
  MdPeople,
  MdAttachMoney,
  MdInventory,
  MdWarning,
  MdCode,
  MdManageAccounts,
} from "react-icons/md";

export default function Dashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState(0);
  const [payroll, setPayroll] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [systemUsers, setSystemUsers] = useState(0);
  const [recentActivity, setRecentActivity] = useState("Loading...");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard");
      const data = await res.json();

      setEmployees(data.employees);
      setPayroll(data.payroll);
      setInventory(data.inventory);
      setLowStock(data.lowStock);
      setSystemUsers(data.systemUsers);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  return (
    <Layout>
      <h1 className="mb-4" style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
        Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <DashboardCard
          title="Employees"
          value={employees}
          color="#3b82f6"
          icon={<MdPeople size={30} color="#fff" />}
          onView={() => navigate("/hrms/employee-overview")}
        />

        <DashboardCard
          title="Payroll"
          value={payroll}
          color="#8b5cf6"
          icon={<MdAttachMoney size={30} color="#fff" />}
        />

        <DashboardCard
          title="Inventory"
          value={inventory}
          color="#10b981"
          icon={<MdInventory size={30} color="#fff" />}
        />

        <DashboardCard
          title="Low Stock Items"
          value={lowStock}
          color="#f59e0b"
          icon={<MdWarning size={30} color="#fff" />}
        />

        <DashboardCard
          title="Activity Logs"
          value="View"
          color="#6366f1"
          icon={<MdCode size={30} color="#fff" />}
          onView={() => navigate("/logs")}
        />

        <DashboardCard
          title="System Users"
          value={systemUsers}
          color="#ef4444"
          icon={<MdManageAccounts size={30} color="#fff" />}
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="row">
        <div className="col-12">
          <div
            className="card shadow-sm"
            style={{
              borderRadius: "15px",
              overflow: "hidden",
            }}
          >
            <div className="card-header bg-white p-3">
              <h5 className="mb-0" style={{ fontWeight: 600 }}>
                Recent Activities
              </h5>
            </div>

            <div className="card-body p-3">
              <p className="mb-0">{recentActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* 🔥 Dashboard Card WITH View Button Preserved */
function DashboardCard({ title, value, color, icon, onView }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div
        className="card shadow-sm"
        style={{
          background: color,
          color: "white",
          borderRadius: "15px",
          padding: "20px",
          minHeight: onView ? "170px" : "140px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        {/* ICON + TITLE */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.25)",
              width: "55px",
              height: "55px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>

          <h6 style={{ fontWeight: "bold", margin: 0 }}>{title}</h6>
        </div>

        {/* VALUE */}
        <h2 style={{ fontWeight: "bold", margin: 0 }}>{value}</h2>

        {/* VIEW BUTTON (IF AVAILABLE) */}
        {onView && (
          <button
            className="btn btn-light"
            style={{
              fontWeight: 600,
              borderRadius: "8px",
              marginTop: "5px",
            }}
            onClick={onView}
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}
