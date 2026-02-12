import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { MdAdd } from "react-icons/md";

export default function DailyOps() {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [stats, setStats] = useState({
    totalShifts: 0,
    inProgress: 0,
    pendingApproval: 0,
    approved: 0,
  });
  const [reportData, setReportData] = useState({
    totalEngineHours: 0,
    fuelConsumed: 0,
    workDone: 0,
    fuelEfficiency: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [operationsRes, statsRes] = await Promise.all([
        baseApi.get(`/api/moms/operations/daily?date=${selectedDate}`),
        baseApi.get("/api/moms/operations/stats"),
      ]);

      setOperations(operationsRes.data?.operations || []);
      setReportData(operationsRes.data?.reportData || {
        totalEngineHours: 0,
        fuelConsumed: 0,
        workDone: 0,
        fuelEfficiency: 0,
      });
      setStats(statsRes.data || {
        totalShifts: 0,
        inProgress: 0,
        pendingApproval: 0,
        approved: 0,
      });
    } catch (error) {
      console.error("Error fetching operations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    alert("Report generated for " + selectedDate);
  };

  const handleExportCSV = () => {
    alert("Exporting CSV...");
  };

  const handleExportPDF = () => {
    alert("Exporting PDF...");
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Operations History
            </h1>
          </div>
          <div className="col-auto">
            <button
              className="btn"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => navigate("/moms/operations/start-shift")}
            >
              <MdAdd size={20} /> Start New Shift
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
              <div className="card-body p-3">
                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                  Total Shifts
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px" }}>
                  {stats.totalShifts}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
              <div className="card-body p-3">
                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                  In Progress
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px", color: "#3b82f6" }}>
                  {stats.inProgress}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
              <div className="card-body p-3">
                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                  Pending Approval
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px", color: "#ca8a04" }}>
                  {stats.pendingApproval}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
              <div className="card-body p-3">
                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                  Approved
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px", color: "#16a34a" }}>
                  {stats.approved}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Report Section */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-12 col-md-auto mb-3 mb-md-0">
                <label style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}>
                  Select Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ height: "42px", borderRadius: "8px" }}
                />
              </div>
              <div className="col-auto d-flex align-items-end gap-2">
                <button
                  className="btn btn-primary"
                  style={{ height: "42px", borderRadius: "8px" }}
                  onClick={handleGenerateReport}
                >
                  Generate Report
                </button>
                <button
                  className="btn btn-success"
                  style={{ height: "42px", borderRadius: "8px" }}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
                <button
                  className="btn"
                  style={{
                    height: "42px",
                    borderRadius: "8px",
                    backgroundColor: "#475569",
                    color: "white",
                    border: "none",
                  }}
                  onClick={handleExportPDF}
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Report Stats */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="p-3" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                    Total Engine Hours
                  </p>
                  <h4 className="mb-0" style={{ fontWeight: "600" }}>
                    {reportData.totalEngineHours}
                  </h4>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                    Fuel Consumed
                  </p>
                  <h4 className="mb-0" style={{ fontWeight: "600" }}>
                    {reportData.fuelConsumed.toFixed(2)} L
                  </h4>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                    Work Done
                  </p>
                  <h4 className="mb-0" style={{ fontWeight: "600" }}>
                    {reportData.workDone.toFixed(2)}
                  </h4>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="p-3" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                    Fuel Efficiency
                  </p>
                  <h4 className="mb-0" style={{ fontWeight: "600" }}>
                    {reportData.fuelEfficiency.toFixed(2)} L/hr
                  </h4>
                </div>
              </div>
            </div>

            {/* Daily Operations Title */}
            <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>
              Daily Operations - {new Date(selectedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </h5>

            {/* Recent Operations Table */}
            {loading ? (
              <p className="text-center text-muted py-4">Loading...</p>
            ) : operations.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">
                  No operations recorded for {new Date(selectedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Date
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Operator
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Machine
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Duration
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Hours
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Status
                      </th>
                      <th style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((operation) => (
                      <tr key={operation.id}>
                        <td style={{ padding: "12px" }}>
                          {new Date(operation.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px" }}>{operation.operator}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            {operation.machine}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>{operation.duration}</td>
                        <td style={{ padding: "12px" }}>{operation.hours}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                operation.status === "In progress"
                                  ? "#dbeafe"
                                  : operation.status === "Completed"
                                  ? "#d1fae5"
                                  : "#fef3c7",
                              color:
                                operation.status === "In progress"
                                  ? "#1e40af"
                                  : operation.status === "Completed"
                                  ? "#065f46"
                                  : "#92400e",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                              fontSize: "12px",
                            }}
                          >
                            {operation.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            className="btn btn-sm btn-link"
                            style={{ color: "#3b82f6", fontSize: "13px", padding: 0 }}
                            onClick={() => navigate(`/moms/operations/${operation.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4">
              <button
                className="btn btn-secondary"
                style={{ borderRadius: "8px" }}
                onClick={() => navigate("/moms")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}