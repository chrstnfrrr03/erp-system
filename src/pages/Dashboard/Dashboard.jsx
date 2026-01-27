import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";

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

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    employees: 0,
    payroll: 0,
    inventory: 0,
    lowStock: 0,
    systemUsers: 0,
    recentActivity: "Loading...",
  });

  const [user, setUser] = useState({
    role: null,
    permissions: [],
  });

  /* ================= EFFECT ================= */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await Promise.all([fetchUser(), fetchDashboardData()]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= API ================= */
  const fetchUser = async () => {
    const res = await baseApi.get("/api/me");

    setUser({
      role: res.data.role,
      permissions: res.data.permissions ?? [],
    });
  };

  const fetchDashboardData = async () => {
    const res = await baseApi.get("/api/dashboard");
    const data = res.data;

    setStats({
      employees: data.employees ?? 0,
      payroll: data.payroll ?? 0,
      inventory: data.inventory ?? 0,
      lowStock: data.lowStock ?? 0,
      systemUsers: data.systemUsers ?? 0,
      recentActivity: data.recentActivity ?? "No recent activity.",
    });
  };

  /* ================= PERMISSION HELPERS ================= */
  const isAdmin = user.role === "system_admin";

  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return user.permissions.includes(permission);
  };

  if (loading) return null;

  /* ================= UI ================= */
  return (
    <Layout>
      <h1
        className="mb-4"
        style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}
      >
        Dashboard
      </h1>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="row g-3 mb-4">

        {/* HRMS */}
        {hasPermission("access_hrms") && (
          <DashboardCard
            title="Employees"
            value={stats.employees}
            color="#3b82f6"
            icon={<MdPeople size={30} color="#fff" />}
            onView={() => navigate("/hrms/employee-overview")}
          />
        )}

        {/* PAYROLL */}
        {hasPermission("access_payroll") && (
          <DashboardCard
            title="Payroll"
            value={stats.payroll}
            color="#8b5cf6"
            icon={<MdAttachMoney size={30} color="#fff" />}
            onView={() => navigate("/payroll")}
          />
        )}

        {/* AIMS */}
        {hasPermission("access_aims") && (
          <DashboardCard
            title="Inventory"
            value={stats.inventory}
            color="#10b981"
            icon={<MdInventory size={30} color="#fff" />}
            onView={() => navigate("/aims/items")}
          />
        )}

        {hasPermission("access_aims") && (
          <DashboardCard
            title="Low Stock Items"
            value={stats.lowStock}
            color="#f59e0b"
            icon={<MdWarning size={30} color="#fff" />}
            onView={() => navigate("/aims/stock-movements")}
          />
        )}

        {/* SYSTEM */}
        {isAdmin && (
          <DashboardCard
            title="System Users"
            value={stats.systemUsers}
            color="#ef4444"
            icon={<MdManageAccounts size={30} color="#fff" />}
          />
        )}

        {isAdmin && (
          <DashboardCard
            title="Activity Logs"
            value="Soon"
            color="#6366f1"
            icon={<MdCode size={30} color="#fff" />}
          />
        )}
      </div>

      {/* ================= RECENT ACTIVITY ================= */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm" style={{ borderRadius: 15 }}>
            <div className="card-header bg-white p-3">
              <h5 className="mb-0 fw-semibold">Recent Activities</h5>
            </div>
            <div className="card-body p-3">
              <p className="mb-0">{stats.recentActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ================= CARD ================= */
function DashboardCard({ title, value, color, icon, onView }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div
        className="card shadow-sm"
        style={{
          background: color,
          color: "white",
          borderRadius: 15,
          padding: 20,
          minHeight: onView ? 170 : 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              background: "rgba(255,255,255,0.25)",
              width: 55,
              height: 55,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <h6 className="fw-bold m-0">{title}</h6>
        </div>

        <h2 className="fw-bold m-0">{value}</h2>

        {onView && (
          <button
            className="btn btn-light fw-semibold mt-2"
            style={{ borderRadius: 8 }}
            onClick={onView}
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}
