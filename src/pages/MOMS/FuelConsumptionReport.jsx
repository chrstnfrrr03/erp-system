import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Button, Form } from "react-bootstrap";
import { MdArrowBack } from "react-icons/md";

export default function FuelConsumptionReport() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await baseApi.get("/api/moms/fuel-consumption-report", {
        params: dateRange,
      });
      setReportData(response.data || []);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4">
          <div className="col">
            <button
              className="btn btn-link p-0 mb-2"
              onClick={() => navigate("/moms/fuel")}
              style={{ textDecoration: "none", color: "#3b82f6" }}
            >
              <MdArrowBack size={20} className="me-1" />
              Back to Fuel Management
            </button>
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Fuel Consumption Report
            </h1>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500" }}>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-4">
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500" }}>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-4">
                <Button
                  variant="success"
                  className="w-100"
                  onClick={generateReport}
                  disabled={loading}
                  style={{ borderRadius: "8px", fontWeight: "500", height: "38px" }}
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e9ecef",
                  }}
                >
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Machine
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Total Volume (L)
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Engine Hours
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Efficiency (L/hr)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No data available for the selected date range
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, index) => (
                      <tr key={index}>
                        <td style={{ padding: "16px", fontWeight: "500" }}>
                          {row.machine_id}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {parseFloat(row.total_volume || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {parseFloat(row.engine_hours || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {parseFloat(row.efficiency || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}