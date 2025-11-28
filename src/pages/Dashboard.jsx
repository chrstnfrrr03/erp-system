import React from "react";
import { FaUsers, FaExclamationCircle, FaCode, FaMoneyCheckAlt, FaUsersCog } from "react-icons/fa";
import { MdInventory } from "react-icons/md";

export default function Dashboard() {
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <DashboardCard icon={<FaUsers size={36} />} title="Employees" count={10} color="#3b82f6" />
        <DashboardCard icon={<FaMoneyCheckAlt size={36} />} title="Payroll" count={10} color="#8b5cf6" />
        <DashboardCard icon={<MdInventory size={36} />} title="Inventory" count={10} color="#10b981" />
        <DashboardCard icon={<FaExclamationCircle size={36} />} title="Low Stock Items" count={10} color="#f59e0b" />
        <DashboardCard icon={<FaCode size={36} />} title="Activity Logs" count={10} color="#6366f1" />
        <DashboardCard icon={<FaUsersCog size={36} />} title="System Users" count={10} color="#ef4444" />
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activities</h3>
            </div>
            <div className="card-body">
              <p className="mb-0">Christian updated Inventory Stock Item #3</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function DashboardCard({ icon, title, count, color }) {
  return (
    <div className="col-lg-4 col-md-6">
      <div
        className="card dashboard-card text-white"
        style={{
          background: color,
          border: "none",
          height: 170,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 20,
          boxSizing: "border-box",
          borderRadius: 8,
        }}
      >
        {}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>{icon}</div>
          <h5 style={{ margin: 0, fontWeight: 600 }}>{title}</h5>
        </div>

        {}
        <div style={{ fontSize: 28, fontWeight: 700 }}>{count}</div>

        {}
        <div>
          <button className="btn btn-light btn-sm">View</button>
        </div>
      </div>
    </div>
  );
}
