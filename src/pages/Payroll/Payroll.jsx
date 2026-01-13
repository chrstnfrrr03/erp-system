import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import payrollApi from "../../payrollApi"; 

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { MdAttachMoney, MdPendingActions, MdCheckCircle } from "react-icons/md";

export default function Payroll() {
  const navigate = useNavigate();
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);

const [totalRuns, setTotalRuns] = useState(0);
const [pendingRuns, setPendingRuns] = useState(0);
const [completedAmount, setCompletedAmount] = useState(0);
const [statusData, setStatusData] = useState([]);
const [trendData, setTrendData] = useState([]);

  const buttonStyle = {
    height: "52px",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "8px",
  };

useEffect(() => {
  fetchDashboardStats();
}, []);

const fetchDashboardStats = async () => {
  try {
    const res = await payrollApi.get("/dashboard-stats");

    setTotalRuns(res.data.totalRuns);
    setPendingRuns(res.data.pendingRuns);
    setCompletedAmount(res.data.completedAmount);
    setStatusData(res.data.statusData);
    setTrendData(res.data.trendData);
  } catch (err) {
    console.error("Failed to fetch payroll dashboard stats", err);
  }
};


  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* PAGE TITLE */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Payroll Management
            </h1>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          <PayrollCard
            title="Total Payroll Runs"
            value={totalRuns}
            color="#3b82f6"
            icon={<MdAttachMoney size={30} color="#fff" />}
          />

          <PayrollCard
            title="Pending Payrolls"
            value={pendingRuns}
            color="#f59e0b"
            icon={<MdPendingActions size={30} color="#fff" />}
          />

          <PayrollCard
            title="Completed Payrolls"
            value={`$${completedAmount.toLocaleString()}`}
            color="#10b981"
            icon={<MdCheckCircle size={30} color="#fff" />}
          />
        </div>

        {/* STATUS CHART + TREND */}
        <div className="row g-2 g-md-3 mb-4">
          
          {/* STATUS DISTRIBUTION */}
          <div className="col-12 col-lg-8 mb-3 mb-lg-0" style={{ minWidth: 0 }}>
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Payroll Status Distribution
                </h5>
              </div>

              <div className="card-body p-2 p-md-3" style={{ height: "500px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />

                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationBegin={200}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={["#3b82f6", "#10b981", "#ef4444", "#8b5cf6"][index]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PAYROLL TREND */}
          <div className="col-12 col-lg-4" style={{ minWidth: 0 }}>
            <div className="card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Payroll Trend
                </h5>
              </div>

              <div className="card-body p-2 p-md-3" style={{ height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* QUICK ACTIONS */}
              <div className="card-body p-3 d-flex flex-column gap-3">
                <button 
                  className="btn btn-primary w-100" 
                  style={buttonStyle}
                  onClick={() => navigate("/payroll/run")}
                >
                  Run Payroll
                </button>

                <button
                  className="btn w-100"
                  style={{ ...buttonStyle, backgroundColor: "#f59e0b", color: "white" }}
                >
                  View Salary Table
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Run Payroll Modal */}
      {/* {showRunPayrollModal && (
        <RunPayrollModal
          show={showRunPayrollModal}
          onHide={() => setShowRunPayrollModal(false)}
        />
      )} */}
    </Layout>
  );
}

/* CARD COMPONENT */
function PayrollCard({ title, value, color, icon }) {
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