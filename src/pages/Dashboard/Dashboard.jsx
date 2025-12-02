import Layout from "../../components/layouts/DashboardLayout";
import {
  MdPeople,
  MdAttachMoney,
  MdInventory,
  MdWarning,
  MdCode,
  MdManageAccounts
} from "react-icons/md";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="mb-4 dashboard-title">Dashboard</h1>

      <div className="row g-4 mb-4">
        <DashboardCard
          icon={<MdPeople size={38} color="#fff" />}
          title="Employees"
          count={10}
          color="#3b82f6"
        />

        <DashboardCard
          icon={<MdAttachMoney size={38} color="#fff" />}
          title="Payroll"
          count={10}
          color="#8b5cf6"
        />

        <DashboardCard
          icon={<MdInventory size={38} color="#fff" />}
          title="Inventory"
          count={10}
          color="#10b981"
        />

        <DashboardCard
          icon={<MdWarning size={38} color="#fff" />}
          title="Low Stock Items"
          count={10}
          color="#f59e0b"
        />

        <DashboardCard
          icon={<MdCode size={38} color="#fff" />}
          title="Activity Logs"
          count={10}
          color="#6366f1"
        />

        <DashboardCard
          icon={<MdManageAccounts size={38} color="#fff" />}
          title="System Users"
          count={10}
          color="#ef4444"
        />
      </div>

      {/* Recent Activities */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm activities-card">
            <div className="card-header activities-header">
              <h5 className="card-title mb-0 activities-title">Recent Activities</h5>
            </div>
            <div className="card-body">
              <p className="mb-0">Christian updated Inventory Stock Item #3</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DashboardCard({ icon, title, count, color }) {
  return (
    <div className="col-lg-4 col-md-6">
      <div
        className="card shadow-sm"
        style={{
          background: color,
          color: "white",
          borderRadius: "15px",
          padding: "20px",
          minHeight: "160px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        {/* ICON */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
          {icon}
          <h5 style={{ fontWeight: "600", fontSize: "16px" }}>{title}</h5>
        </div>

        {/* COUNT */}
        <h2 style={{ fontWeight: "bold", fontSize: "32px", marginBottom: "10px" }}>
          {count}
        </h2>

        {}
        <button className="dashboard-view-btn">View</button>
      </div>
    </div>
  );
}
