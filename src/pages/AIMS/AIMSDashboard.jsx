import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import baseApi from "../../api/baseApi";


import {
  MdInventory,
  MdWarning,
  MdAddBox,
  MdList,
  MdLocalShipping,
  MdSwapHoriz,
} from "react-icons/md";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AIMSDashboard() {
  const navigate = useNavigate();

  /* ===============================
     STATE
  =============================== */
  const [kpis, setKpis] = useState({
    total_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
  });

  const [lowStockTrend, setLowStockTrend] = useState([]);

  /* ===============================
     FETCH DASHBOARD DATA
  =============================== */
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [kpiRes, trendRes] = await Promise.all([
        baseApi.get("/api/aims/dashboard"),
        baseApi.get("/api/aims/dashboard/low-stock-trend"),
      ]);

      setKpis(kpiRes.data);
      setLowStockTrend(trendRes.data);
    } catch (error) {
      console.error("Failed to fetch AIMS dashboard data", error);
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              AIMS – Auto Inventory Management System
            </h1>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="row g-3 mb-4">
          <AIMSCard
            title="Total Items"
            value={kpis.total_items}
            color="#3b82f6"
            icon={<MdInventory size={30} color="#fff" />}
          />

          <AIMSCard
            title="Low Stock Items"
            value={kpis.low_stock_items}
            color="#f59e0b"
            icon={<MdWarning size={30} color="#fff" />}
          />

          <AIMSCard
            title="Out of Stock Items"
            value={kpis.out_of_stock_items}
            color="#ef4444"
            icon={<MdWarning size={30} color="#fff" />}
          />
        </div>

        {/* LOW STOCK TREND CHART */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-semibold">Low Stock Trend</h5>
              </div>

              <div className="card-body" style={{ height: "350px" }}>
                {lowStockTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lowStockTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        animationDuration={1200}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted">Loading...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-semibold">Quick Actions</h5>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <ActionButton
                    label="Add Item"
                    icon={<MdAddBox size={20} />}
                    color="#3b82f6"
                    onClick={() => navigate("/aims/add-item")}
                  />

                  <ActionButton
                    label="View Inventory List"
                    icon={<MdList size={20} />}
                    color="#6366f1"
                    onClick={() => navigate("/aims/inventory")}
                  />

                  <ActionButton
                    label="View Stock Movements"
                    icon={<MdSwapHoriz size={20} />}
                    color="#10b981"
                    onClick={() => navigate("/aims/stock-movements")}
                  />

                  <ActionButton
                    label="View Request Order"
                    icon={<MdLocalShipping size={20} />}
                    color="#f59e0b"
                    onClick={() => navigate("/aims/request-orders")}
                  />

                  <ActionButton
                    label="View Purchase Request"
                    icon={<MdLocalShipping size={20} />}
                    color="#ef4444"
                    onClick={() => navigate("/aims/purchase-requests")}
                  />

                  {/* ✅ NEW: SUPPLIERS */}
                  <ActionButton
                    label="Suppliers"
                    icon={<MdLocalShipping size={20} />}
                    color="#0ea5e9"
                    onClick={() => navigate("/aims/suppliers")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

/* KPI CARD */
function AIMSCard({ title, value, color, icon }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div
        className="card d-flex flex-row align-items-center"
        style={{
          background: color,
          color: "white",
          borderRadius: "15px",
          padding: "20px",
          minHeight: "120px",
          gap: "15px",
        }}
      >
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

        <div>
          <h6 style={{ fontWeight: "bold" }}>{title}</h6>
          <h2 style={{ fontWeight: "bold" }}>{value}</h2>
        </div>
      </div>
    </div>
  );
}

/* QUICK ACTION BUTTON */
function ActionButton({ label, icon, color, onClick }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <button
        className="btn w-100"
        onClick={onClick}
        style={{
          height: "52px",
          fontSize: "15px",
          fontWeight: "500",
          borderRadius: "8px",
          backgroundColor: color,
          color: "white",
        }}
      >
        {icon} <span className="ms-2">{label}</span>
      </button>
    </div>
  );
}
