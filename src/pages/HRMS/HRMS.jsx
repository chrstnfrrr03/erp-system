import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";

import { MdPersonAdd, MdPeople, MdBarChart, MdSchedule} from "react-icons/md";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function HRMS() {
  const navigate = useNavigate();
  const { user, permissions } = useAuth();

  const [departmentData, setDepartmentData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [newHires, setNewHires] = useState(0);
  const [activeInactive, setActiveInactive] = useState("0 / 0");

  // ✅ Redirect employees to their profile
  useEffect(() => {
    if (user?.role === "employee" && user?.biometric_id) {
      navigate(`/hrms/employee/${user.biometric_id}`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only fetch dashboard data for non-employees
    if (user?.role !== "employee") {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const statsRes = await baseApi.get("/api/hrms/stats");  
      const deptRes = await baseApi.get("/api/hrms/department-distribution");  

      setTotalEmployees(statsRes.data.totalEmployees);
      setNewHires(statsRes.data.newHires);
      setActiveInactive(
        `${statsRes.data.activeInactive.active} / ${statsRes.data.activeInactive.inactive}`
      );

      setDepartmentData(
        deptRes.data.map((d) => ({
          name: d.department,
          employees: d.employees,
        }))
      );
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  // ✅ If employee, don't render anything (they're being redirected)
  if (user?.role === "employee") {
    return null;
  }

  // 🔥 Standardized Button Style (Same Size Across Devices)
  const buttonStyle = {
    height: "52px",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "8px",
  };

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
            value={totalEmployees}
            color="#3b82f6"
            icon={<MdPeople size={30} color="#fff" />}
          />

          <HRMSCard
            title="New Hires"
            value={newHires}
            color="#10b981"
            icon={<MdPersonAdd size={30} color="#fff" />}
          />

          <HRMSCard
            title="Active vs Inactive"
            value={activeInactive}
            color="#8b5cf6"
            icon={<MdBarChart size={30} color="#fff" />}
          />
        </div>

        {/* Chart + Quick Actions */}
        <div className="row g-2 g-md-3 mb-4">
          {/* Department Chart */}
          <div
            className="col-12 col-lg-8 mb-3 mb-lg-0"
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Department Distribution
                </h5>
              </div>

              <div
                className="card-body p-2 p-md-3"
                style={{
                  height: "500px",
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "100%", height: "100%", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
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

                      {/* Animated Bars */}
                      <Bar
                        dataKey="employees"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                        animationBegin={200}
                        isAnimationActive={true}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Bar>
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
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Quick Actions
                </h5>
              </div>

              <div className="card-body p-3 d-flex flex-column gap-3">
                {/* ✅ Only show Add Employee for system_admin and hr */}
                {can(permissions, 'employee.create') && (
                  <button
                    className="btn btn-primary w-100"
                    style={buttonStyle}
                    onClick={() => navigate("/hrms/add-employee")}
                  >
                    <MdPersonAdd size={20} className="me-2" /> Add Employee
                  </button>
                )}

                <button
                  className="btn w-100"
                  style={{ ...buttonStyle, backgroundColor: "#f59e0b", color: "white" }}
                  onClick={() => navigate("/hrms/employee-overview")}
                >
                  <MdPeople size={20} className="me-2" /> View All Employees
                </button>

                <button
                  className="btn w-100"
                  style={{ ...buttonStyle, backgroundColor: "rgb(16, 185, 129)", color: "white" }}
                  onClick={() => navigate("/hrms/employee-status")}
                >
                  <MdBarChart size={20} className="me-2" /> View Status
                </button>

                <button
                  className="btn w-100"
                  style={{
                    ...buttonStyle,
                    backgroundColor: "red",
                    color: "white",
                  }}
                  onClick={() => navigate("/hrms/attendance")}
                >
                  <MdSchedule size={20} className="me-2" /> View All Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* Statistic Card Component */
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