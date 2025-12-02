import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

// MATERIAL DESIGN ICONS (matching your Sidebar)
import {
  MdPersonAdd,
  MdPeople,
  MdBarChart,
} from "react-icons/md";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HRMS() {
  const navigate = useNavigate();

  const departmentData = [
    { name: "IT", employees: 45 },
    { name: "HR", employees: 28 },
    { name: "Sales", employees: 52 },
    { name: "Finance", employees: 35 },
    { name: "Operations", employees: 40 },
  ];

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* Title */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              HRMS - Employee Management
            </h1>
          </div>
        </div>

        {/* Statistic Cards */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          <HRMSCard 
            title="Total Employees" 
            value="25" 
            color="#3b82f6"
            icon={<MdPeople size={30} color="#fff" />}
          />

          <HRMSCard 
            title="New Hires" 
            value="5" 
            color="#10b981"
            icon={<MdPersonAdd size={30} color="#fff" />}
          />

          <HRMSCard 
            title="Active vs Inactive" 
            value="20/5" 
            color="#8b5cf6" 
            icon={<MdBarChart size={30} color="#fff" />}
          />
        </div>

        {/* Chart + Quick Actions */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">

          {/* Chart */}
          <div className="col-12 col-lg-8 mb-3 mb-lg-0">
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600", fontSize: "clamp(16px, 4vw, 18px)" }}>
                  Department Distribution
                </h5>
              </div>

              <div className="card-body p-2 p-md-3">
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="employees" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-12 col-lg-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600", fontSize: "clamp(16px, 4vw, 18px)" }}>
                  Quick Actions
                </h5>
              </div>

              <div className="card-body p-3 d-flex flex-column gap-2">

                {/* Add Employee */}
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/hrms/add-employee")}
                  style={{
                    padding: "10px 15px",
                    fontSize: "14px",
                    borderRadius: "8px",
                  }}
                >
                  <MdPersonAdd size={18} className="me-2" /> Add Employee
                </button>

                {/* View all */}
                <button
                  className="btn btn-dark w-100"
                  style={{
                    padding: "10px 15px",
                    fontSize: "14px",
                    borderRadius: "8px",
                  }}
                >
                  <MdPeople size={18} className="me-2" /> View All Employees
                </button>

                {/* View Status */}
                <button
                  className="btn btn-secondary w-100"
                  style={{
                    padding: "10px 15px",
                    fontSize: "14px",
                    borderRadius: "8px",
                  }}
                >
                  <MdBarChart size={18} className="me-2" /> View Status
                </button>

              </div>
            </div>
          </div>

        </div>

        {/* Employee Table */}
        <div className="row mb-4 mb-md-5">
          <div className="col-12">
            <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600", fontSize: "clamp(16px, 4vw, 18px)" }}>
                  Recent Employees
                </h5>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: "#f9fafb" }}>
                      <tr>
                        <th style={{ padding: "12px 8px", fontSize: "14px" }}>ID</th>
                        <th style={{ padding: "12px 8px", fontSize: "14px" }}>Name</th>
                        <th className="d-none d-md-table-cell" style={{ padding: "12px 8px", fontSize: "14px" }}>Department</th>
                        <th className="d-none d-lg-table-cell" style={{ padding: "12px 8px", fontSize: "14px" }}>Position</th>
                        <th style={{ padding: "12px 8px", fontSize: "14px" }}>Status</th>
                        <th style={{ padding: "12px 8px", fontSize: "14px" }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      <EmployeeRow id="001" name="John Doe" department="IT" position="Developer" status="Active" />
                      <EmployeeRow id="002" name="Jane Smith" department="HR" position="Manager" status="Active" />
                      <EmployeeRow id="003" name="Mike Johnson" department="Sales" position="Sales Rep" status="Active" />
                      <EmployeeRow id="004" name="Sarah Williams" department="Finance" position="Accountant" status="Inactive" />
                      <EmployeeRow id="005" name="David Brown" department="Operations" position="Supervisor" status="Active" />
                    </tbody>

                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

// =======================
// STATISTIC CARD Component
// =======================
function HRMSCard({ title, value, color, icon }) {
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
        
        {/* Icon Container */}
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

        {/* Text */}
        <div>
          <h6 style={{ fontWeight: "bold", fontSize: "clamp(11px, 3vw, 12px)", marginBottom: "6px" }}>
            {title}
          </h6>
          <h2 style={{ fontWeight: "bold", fontSize: "clamp(28px, 8vw, 38px)", margin: 0 }}>
            {value}
          </h2>
        </div>

      </div>
    </div>
  );
}

// =======================
// EMPLOYEE ROW Component
// =======================
function EmployeeRow({ id, name, department, position, status }) {
  return (
    <tr>
      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{id}</td>
      <td style={{ fontWeight: "500", padding: "12px 8px", fontSize: "13px" }}>{name}</td>
      <td className="d-none d-md-table-cell" style={{ padding: "12px 8px", fontSize: "13px" }}>{department}</td>
      <td className="d-none d-lg-table-cell" style={{ padding: "12px 8px", fontSize: "13px" }}>{position}</td>

      <td style={{ padding: "12px 8px" }}>
        <span
          className={`badge ${status === "Active" ? "bg-success" : "bg-secondary"}`}
          style={{ fontSize: "11px" }}
        >
          {status}
        </span>
      </td>

      <td style={{ padding: "12px 8px" }}>
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-primary" style={{ fontSize: "12px", padding: "4px 10px" }}>
            View
          </button>
          <button className="btn btn-sm btn-warning" style={{ fontSize: "12px", padding: "4px 10px" }}>
            Edit
          </button>
        </div>
      </td>

    </tr>
  );
}
