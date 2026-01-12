import { useEffect, useState } from "react";
import payrollApi from "../../payrollApi";
import Swal from "sweetalert2";
import { MdSearch, MdDownload, MdVisibility, MdAttachMoney } from "react-icons/md";

export default function EmployeePayslips({ employee }) {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchPayslips();
  }, [employee.biometric_id]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await payrollApi.get(`/payslips/${employee.biometric_id}`);
      setPayslips(res.data || []);
    } catch (err) {
      console.error("Failed to fetch payslips:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load payslips",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD", 
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

  const getStatusBadge = (status) => {
    const styles = {
      Paid: "bg-success",
      Pending: "bg-warning",
      Cancelled: "bg-danger",
    };
    return (
      <span className={`badge ${styles[status] || "bg-secondary"} text-white`}>
        {status}
      </span>
    );
  };

  const filteredPayslips = payslips.filter((payslip) => {
    const matchesSearch = 
      String(payslip.pay_period_start || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payslip.pay_period_end || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payslip.payment_date || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "All" || payslip.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalNetPay = payslips
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + parseFloat(p.net_pay || 0), 0);

  return (
    <div className="row g-4">
      {/* Summary Card */}
      <div className="col-12">
        <div className="card" style={{ borderRadius: "12px", borderTop: "3px solid #ffe680" }}>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-4">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "#e7f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdAttachMoney size={32} color="#0d6efd" />
                  </div>
                  <div className="ms-3">
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      Total Payslips
                    </div>
                    <h4 className="mb-0 fw-bold">{payslips.length}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "#d4edda",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdAttachMoney size={32} color="#28a745" />
                  </div>
                  <div className="ms-3">
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      Total Paid
                    </div>
                    <h4 className="mb-0 fw-bold">{formatCurrency(totalNetPay)}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "#fff3cd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdAttachMoney size={32} color="#ffc107" />
                  </div>
                  <div className="ms-3">
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      Pending
                    </div>
                    <h4 className="mb-0 fw-bold">
                      {payslips.filter(p => p.status === "Pending").length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="col-12">
        <div className="card" style={{ borderRadius: "12px", borderTop: "3px solid #ffe680" }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Payroll History</h5>

            {/* Filters */}
            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="position-relative">
                  <MdSearch
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                    }}
                  />
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search by date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th style={{ padding: "12px" }}>Pay Period</th>
                      <th style={{ padding: "12px" }}>Payment Date</th>
                      <th style={{ padding: "12px" }}>Gross Pay</th>
                      <th style={{ padding: "12px" }}>Deductions</th>
                      <th style={{ padding: "12px" }}>Net Pay</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayslips.length > 0 ? (
                      filteredPayslips.map((payslip) => (
                        <tr key={payslip.id}>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            {formatDate(payslip.pay_period_start)} - {formatDate(payslip.pay_period_end)}
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            {formatDate(payslip.payment_date)}
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500" }}>
                            {formatCurrency(payslip.gross_pay)}
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px", color: "#dc3545" }}>
                            -{formatCurrency(payslip.deductions)}
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600", color: "#28a745" }}>
                            {formatCurrency(payslip.net_pay)}
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            {getStatusBadge(payslip.status)}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                              onClick={() => window.open(`/payslip/${payslip.id}`, "_blank")}
                            >
                              <MdVisibility className="me-1" />
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                            >
                              <MdDownload className="me-1" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5" style={{ fontSize: "14px", color: "#6c757d" }}>
                          {searchTerm || filterStatus !== "All" 
                            ? "No payslips found matching your filters" 
                            : "No payslips generated yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}