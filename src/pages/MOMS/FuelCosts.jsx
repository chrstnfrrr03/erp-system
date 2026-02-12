import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";

export default function FuelCosts() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("2026-01-10");
  const [endDate, setEndDate] = useState("2026-02-10");
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await baseApi.get(
        `/api/moms/finance/fuel-costs?start_date=${startDate}&end_date=${endDate}`
      );
      setTransactions(response.data?.transactions || []);
      setTotalVolume(response.data?.totalVolume || 0);
      setTotalCost(response.data?.totalCost || 0);
    } catch (error) {
      console.error("Error fetching fuel costs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchTransactions();
  };

  const handleExport = () => {
    alert("Exporting to ERP...");
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Fuel Costs Overview
            </h1>
            <p className="text-muted mb-0">
              This is a placeholder page for fuel cost reports. Replace with charts, tables or
              exports as needed.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body p-3">
            <div className="row align-items-end g-3">
              <div className="col-auto">
                <button
                  className="btn btn-primary"
                  style={{ height: "42px", borderRadius: "8px" }}
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
              </div>

              <div className="col-auto">
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ height: "42px", borderRadius: "8px" }}
                />
              </div>

              <div className="col-auto">
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ height: "42px", borderRadius: "8px" }}
                />
              </div>

              <div className="col-auto">
                <button
                  className="btn btn-success"
                  style={{ height: "42px", borderRadius: "8px" }}
                  onClick={handleExport}
                >
                  Export to ERP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      DATE
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      TOTAL VOLUME
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      TOTAL COST
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-5">
                        <p className="text-muted mb-0">
                          No fuel transactions found for the selected period.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td style={{ padding: "16px" }}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {transaction.volume ? `${transaction.volume} L` : "-"}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {transaction.cost ? `$${parseFloat(transaction.cost).toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: "#f8fafc", fontWeight: "600" }}>
                        <td style={{ padding: "16px" }}>Total</td>
                        <td style={{ padding: "16px" }}>
                          {totalVolume > 0 ? `${totalVolume} L` : "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {totalCost.toFixed(2)}
                        </td>
                      </tr>
                    </>
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