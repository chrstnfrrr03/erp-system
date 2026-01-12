import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  MdInventory,
  MdWarning,
  MdPeople,
  MdAddBox,
  MdList,
  MdLocalShipping,
  MdSwapHoriz,
} from "react-icons/md";

export default function AIMSDashboard() {
  const navigate = useNavigate();

  const buttonStyle = {
    height: "52px",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "8px",
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
            value="0"
            color="#3b82f6"
            icon={<MdInventory size={30} color="#fff" />}
          />

          <AIMSCard
            title="Low Stock Items"
            value="0"
            color="#f59e0b"
            icon={<MdWarning size={30} color="#fff" />}
          />

          <AIMSCard
            title="Active Suppliers"
            value="0"
            color="#10b981"
            icon={<MdPeople size={30} color="#fff" />}
          />
        </div>

        {/* CHARTS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-semibold">Stock Distribution</h5>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center text-muted">
                No data available
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-semibold">Low Stock Trend</h5>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center text-muted">
                No data available
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

                  <ActionButton
  label="View Supplier"
  icon={<MdPeople size={20} />}
  color="#14b8a6" 
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
