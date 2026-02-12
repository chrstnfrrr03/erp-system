import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";

import {
  MdPrecisionManufacturing,
  MdAssignment,
  MdWarning,
  MdBuild,
  MdPlayArrow,
  MdViewList,
  MdLocalGasStation,
  MdSchedule,
} from "react-icons/md";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MOMS() {
  const navigate = useNavigate();
  const { user, permissions } = useAuth();

  const [activeMachines, setActiveMachines] = useState(0);
  const [activeAssignments, setActiveAssignments] = useState(0);
  const [maintenanceOverdue, setMaintenanceOverdue] = useState(0);
  const [breakdownsToday, setBreakdownsToday] = useState(0);
  const [fuelUsage, setFuelUsage] = useState({ amount: 0, cost: 0 });
  const [machineUtilization, setMachineUtilization] = useState({ percentage: 0, active: 0, total: 0 });
  const [activeJobSites, setActiveJobSites] = useState({ count: 0, avgProgress: 0 });
  const [utilizationData, setUtilizationData] = useState([]);
  const [downtimeData, setDowntimeData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalOpHours: 0,
    totalDowntime: 0,
    machinesTracked: 0,
    avgDowntimePerMachine: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Fetch dashboard statistics
      const statsRes = await baseApi.get("/api/moms/stats");
      
      setActiveMachines(statsRes.data.activeMachines || 0);
      setActiveAssignments(statsRes.data.activeAssignments || 0);
      setMaintenanceOverdue(statsRes.data.maintenanceOverdue || 0);
      setBreakdownsToday(statsRes.data.breakdownsToday || 0);
      setFuelUsage(statsRes.data.fuelUsage || { amount: 0, cost: 0 });
      setMachineUtilization(statsRes.data.machineUtilization || { percentage: 0, active: 0, total: 0 });
      setActiveJobSites(statsRes.data.activeJobSites || { count: 0, avgProgress: 0 });

      // Fetch utilization data
      const utilizationRes = await baseApi.get("/api/moms/machine-utilization");
      setUtilizationData(utilizationRes.data || []);

      // Fetch downtime data
      const downtimeRes = await baseApi.get("/api/moms/downtime-overview");
      setDowntimeData(downtimeRes.data.chartData || []);
      setSummaryStats(downtimeRes.data.summary || {
        totalOpHours: 0,
        totalDowntime: 0,
        machinesTracked: 0,
        avgDowntimePerMachine: 0,
      });
    } catch (error) {
      console.error("Error loading MOMS dashboard:", error);
    }
  };

  const buttonStyle = {
    height: "52px",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "8px",
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Title */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Dashboard
            </h1>
            <p className="text-muted mb-0">Machine Operations Management System</p>
          </div>
        </div>

        {/* Top Statistic Cards */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          <MOMSCard
            title="Active Machines"
            value={activeMachines}
            color="#3b82f6"
            icon={<MdPrecisionManufacturing size={30} color="#fff" />}
          />

          <MOMSCard
            title="Active Assignments"
            value={activeAssignments}
            color="#10b981"
            icon={<MdAssignment size={30} color="#fff" />}
          />

          <MOMSCard
            title="Maintenance Overdue"
            value={maintenanceOverdue}
            color="#ef4444"
            icon={<MdWarning size={30} color="#fff" />}
          />

          <MOMSCard
            title="Breakdowns Today"
            value={breakdownsToday}
            color="#f59e0b"
            icon={<MdBuild size={30} color="#fff" />}
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          {/* Fuel Usage */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-body p-3">
                <h6 className="text-muted mb-1" style={{ fontSize: "14px" }}>
                  Fuel Usage (This Month)
                </h6>
                <h3 className="mb-0" style={{ fontWeight: "bold" }}>
                  {fuelUsage.amount.toFixed(2)} L
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Cost: ${fuelUsage.cost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Machine Utilization */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-body p-3">
                <h6 className="text-muted mb-1" style={{ fontSize: "14px" }}>
                  Machine Utilization
                </h6>
                <h3 className="mb-0" style={{ fontWeight: "bold" }}>
                  {machineUtilization.percentage.toFixed(1)}%
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  {machineUtilization.active} of {machineUtilization.total}
                </p>
              </div>
            </div>
          </div>

          {/* Active Job Sites */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-body p-3">
                <h6 className="text-muted mb-1" style={{ fontSize: "14px" }}>
                  Active Job Sites
                </h6>
                <h3 className="mb-0" style={{ fontWeight: "bold" }}>
                  {activeJobSites.count}
                </h3>
                <div className="mt-2">
                  <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${activeJobSites.avgProgress}%` }}
                      aria-valuenow={activeJobSites.avgProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <p className="text-muted mb-0 mt-1" style={{ fontSize: "13px" }}>
                    Avg Progress: {activeJobSites.avgProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-2 g-md-3 mb-4">
          {/* Machine Utilization Pie Chart */}
          <div className="col-12 col-lg-4 mb-3 mb-lg-0">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Machine Utilization Overview (Last 30 Days)
                </h5>
              </div>

              <div className="card-body p-3" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Downtime Bar Chart */}
          <div className="col-12 col-lg-5 mb-3 mb-lg-0">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-header bg-white p-3 border-bottom d-flex align-items-center gap-2">
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#f59e0b",
                    borderRadius: "2px",
                  }}
                ></div>
                <span style={{ fontSize: "14px", color: "#666" }}>Downtime Hours</span>
              </div>

              <div className="card-body p-3" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={downtimeData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="machine" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="downtime" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="col-12 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Summary Stats
                </h5>
              </div>

              <div className="card-body p-3">
                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Total Op Hours:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#10b981" }}>
                    {summaryStats.totalOpHours} hrs
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Total Downtime:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#ef4444" }}>
                    {summaryStats.totalDowntime} hrs
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Machines Tracked:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#3b82f6" }}>
                    {summaryStats.machinesTracked}
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Avg Downtime/Machine:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#f59e0b" }}>
                    {summaryStats.avgDowntimePerMachine.toFixed(2)} hrs
                  </h5>
                </div>

                <button
                  className="btn btn-secondary w-100 mt-2"
                  style={{ ...buttonStyle, height: "40px", fontSize: "14px" }}
                  disabled
                  title="Feature coming soon"
                >
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Consumption Overview & Recent Breakdowns */}
        <div className="row g-2 g-md-3 mb-4">
          {/* Fuel Consumption Chart */}
          <div className="col-12 col-lg-8 mb-3 mb-lg-0">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Fuel Consumption Overview (Last 30 Days)
                </h5>
              </div>

              <div className="card-body p-3" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Fuel Volume (L)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="fuel" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Fuel Summary */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm" style={{ borderRadius: "12px", height: "100%" }}>
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Fuel Summary
                </h5>
              </div>

              <div className="card-body p-3">
                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    This Month:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#3b82f6" }}>
                    0.00 L
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Month Cost:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#10b981" }}>
                    $0.00
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Daily Average:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#f59e0b" }}>
                    0.00 L
                  </h5>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Fuel Types Used:
                  </p>
                  <h5 style={{ fontWeight: "bold", color: "#8b5cf6" }}>
                    0
                  </h5>
                </div>

                <button
                  className="btn btn-primary w-100 mt-2"
                  style={{ ...buttonStyle, height: "40px", fontSize: "14px" }}
                  disabled
                  title="Feature coming soon"
                >
                  View Fuel Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Breakdowns */}
        <div className="row g-2 g-md-3 mb-4">
          <div className="col-12">
            <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: "600" }}>
                  Recent Breakdowns
                </h5>
              </div>

              <div className="card-body p-3">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>MACHINE</th>
                        <th style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>TYPE</th>
                        <th style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>SEVERITY</th>
                        <th style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>STATUS</th>
                        <th style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: "40px" }}>
                          No recent breakdowns
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="row g-2 g-md-3 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", cursor: "pointer" }}>
              <div className="card-body p-4">
                <h6 className="mb-2" style={{ fontWeight: "600" }}>
                  Daily Operations Report
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  View detailed daily operations and machine utilization
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", cursor: "pointer" }}>
              <div className="card-body p-4">
                <h6 className="mb-2" style={{ fontWeight: "600" }}>
                  Fuel Consumption Report
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Analyze fuel usage and cost trends
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", cursor: "pointer" }}>
              <div className="card-body p-4">
                <h6 className="mb-2" style={{ fontWeight: "600" }}>
                  Machine Utilization Report
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Monitor machine efficiency and downtime
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", cursor: "pointer" }}>
              <div className="card-body p-4">
                <h6 className="mb-2" style={{ fontWeight: "600" }}>
                  Operator Performance Report
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Evaluate operator efficiency and ratings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* Statistic Card Component */
function MOMSCard({ title, value, color, icon }) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card shadow-sm"
        style={{
          borderRadius: "12px",
          border: "none",
          overflow: "hidden",
        }}
      >
        <div
          className="card-body p-3 d-flex align-items-center gap-3"
          style={{ minHeight: "100px" }}
        >
          <div
            style={{
              backgroundColor: color,
              width: "50px",
              height: "50px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ overflow: "hidden" }}>
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "13px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </p>
            <h3 className="mb-0" style={{ fontWeight: "bold", fontSize: "24px" }}>
              {value}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}