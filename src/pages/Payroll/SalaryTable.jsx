import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import payrollApi from "../../payrollApi";
import Swal from "sweetalert2";
import {
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdEdit,
  MdArrowBack,
  MdAttachMoney,
  MdCheckCircle,
} from "react-icons/md";

export default function SalaryTable() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayrolls, setSelectedPayrolls] = useState([]);

  useEffect(() => {
    fetchPayrolls();
  }, [currentPage, filterStatus]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
      };

      if (filterStatus !== "All") {
        params.status = filterStatus;
      }

      const res = await payrollApi.get("/", { params });
      
      setPayrolls(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch payrolls:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load payroll records",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add this function to change single payroll status
  const handleStatusChange = async (payrollId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `Change Status to ${newStatus}?`,
        text: "Are you sure you want to change this payroll status?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, change it",
      });

      if (!result.isConfirmed) return;

      await payrollApi.put(`/${payrollId}/status`, {
        status: newStatus,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Payroll status changed to ${newStatus}`,
        confirmButtonColor: "#28a745",
        timer: 2000,
      });

      fetchPayrolls(); // Refresh the list
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to update payroll status",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ✅ Add bulk approve function
  const handleBulkApprove = async () => {
    if (selectedPayrolls.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one payroll to approve",
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: `Approve ${selectedPayrolls.length} Payrolls?`,
        text: "This will change all selected pending payrolls to approved status",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, approve all",
      });

      if (!result.isConfirmed) return;

      await payrollApi.post("/bulk-approve", {
        payroll_ids: selectedPayrolls,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${selectedPayrolls.length} payrolls approved successfully`,
        confirmButtonColor: "#28a745",
        timer: 2000,
      });

      setSelectedPayrolls([]);
      fetchPayrolls();
    } catch (err) {
      console.error("Failed to bulk approve:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to approve payrolls",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ✅ Toggle selection
  const handleToggleSelect = (payrollId) => {
    setSelectedPayrolls((prev) =>
      prev.includes(payrollId)
        ? prev.filter((id) => id !== payrollId)
        : [...prev, payrollId]
    );
  };

  // ✅ Select all pending
  const handleSelectAllPending = () => {
    const pendingIds = filteredPayrolls
      .filter((p) => p.status === "Pending")
      .map((p) => p.id);
    
    if (selectedPayrolls.length === pendingIds.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(pendingIds);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
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
      Pending: { bg: "#fef3c7", color: "#92400e", text: "Pending" },
      Approved: { bg: "#dbeafe", color: "#1e40af", text: "Approved" },
      Paid: { bg: "#d1fae5", color: "#065f46", text: "Paid" },
      Rejected: { bg: "#fee2e2", color: "#991b1b", text: "Rejected" },
    };

    const style = styles[status] || styles.Pending;

    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {style.text}
      </span>
    );
  };

  // ✅ Get next status options
  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Approved", "Rejected"];
      case "Approved":
        return ["Paid", "Rejected"];
      case "Paid":
        return [];
      case "Rejected":
        return ["Pending"];
      default:
        return [];
    }
  };

  const filteredPayrolls = payrolls.filter((payroll) => {
    const employeeName = payroll.employee?.first_name + " " + payroll.employee?.last_name;
    const biometricId = payroll.employee?.biometric_id || "";
    
    return (
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biometricId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalGross = filteredPayrolls.reduce(
    (sum, p) => sum + parseFloat(p.gross_pay || 0),
    0
  );
  const totalDeductions = filteredPayrolls.reduce(
    (sum, p) => sum + parseFloat(p.deductions || 0),
    0
  );
  const totalNet = filteredPayrolls.reduce(
    (sum, p) => sum + parseFloat(p.net_pay || 0),
    0
  );

  const pendingCount = filteredPayrolls.filter((p) => p.status === "Pending").length;

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "clamp(20px, 5vw, 28px)",
              }}
            >
              Salary Table
            </h1>
            <p className="text-muted mb-0">
              View and manage all payroll records
            </p>
          </div>
          <button
            className="btn btn-outline-danger"
            onClick={() => navigate("/payroll")}
          >
            <MdArrowBack className="me-2" />
            Back
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
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
                      Total Gross Pay
                    </div>
                    <h4 className="mb-0 fw-bold">{formatCurrency(totalGross)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "#fff3e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdAttachMoney size={32} color="#f57c00" />
                  </div>
                  <div className="ms-3">
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      Total Deductions
                    </div>
                    <h4 className="mb-0 fw-bold">{formatCurrency(totalDeductions)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
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
                      Total Net Pay
                    </div>
                    <h4 className="mb-0 fw-bold">{formatCurrency(totalNet)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdAttachMoney size={32} color="#f59e0b" />
                  </div>
                  <div className="ms-3">
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      Pending
                    </div>
                    <h4 className="mb-0 fw-bold">{pendingCount}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card" style={{ borderRadius: "12px" }}>
          <div className="card-body p-4">
            {/* Filters */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3 mb-md-0">
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
                    placeholder="Search by employee name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-2 mb-3 mb-md-0">
                <div className="position-relative">
                  <MdFilterList
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                    }}
                  />
                  <select
                    className="form-select ps-5"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3 mb-3 mb-md-0">
                {pendingCount > 0 && (
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={handleSelectAllPending}
                  >
                    {selectedPayrolls.length === pendingCount
                      ? "Deselect All Pending"
                      : "Select All Pending"}
                  </button>
                )}
              </div>

              <div className="col-md-3">
                {selectedPayrolls.length > 0 ? (
                  <button
                    className="btn btn-success w-100"
                    onClick={handleBulkApprove}
                  >
                    <MdCheckCircle className="me-2" />
                    Approve Selected ({selectedPayrolls.length})
                  </button>
                ) : (
                  <button
                    className="btn btn-success w-100"
                    onClick={() => navigate("/payroll/run")}
                  >
                    + Run New Payroll
                  </button>
                )}
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
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th style={{ padding: "12px", width: "40px" }}>
                          <input
                            type="checkbox"
                            checked={
                              selectedPayrolls.length === pendingCount &&
                              pendingCount > 0
                            }
                            onChange={handleSelectAllPending}
                            disabled={pendingCount === 0}
                          />
                        </th>
                        <th style={{ padding: "12px" }}>Employee</th>
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
                      {filteredPayrolls.length > 0 ? (
                        filteredPayrolls.map((payroll) => (
                          <tr key={payroll.id}>
                            <td style={{ padding: "12px" }}>
                              <input
                                type="checkbox"
                                checked={selectedPayrolls.includes(payroll.id)}
                                onChange={() => handleToggleSelect(payroll.id)}
                                disabled={payroll.status !== "Pending"}
                              />
                            </td>
                            <td style={{ padding: "12px" }}>
                              <div>
                                <div style={{ fontWeight: "600" }}>
                                  {payroll.employee?.first_name}{" "}
                                  {payroll.employee?.last_name}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  {payroll.employee?.biometric_id}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px" }}>
                              {formatDate(payroll.pay_period_start)} -{" "}
                              {formatDate(payroll.pay_period_end)}
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px" }}>
                              {formatDate(payroll.payment_date)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                            >
                              {formatCurrency(payroll.gross_pay)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                fontSize: "14px",
                                color: "#dc3545",
                              }}
                            >
                              -{formatCurrency(payroll.deductions)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#28a745",
                              }}
                            >
                              {formatCurrency(payroll.net_pay)}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {getStatusBadge(payroll.status)}
                            </td>
                            <td style={{ padding: "12px" }}>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "12px", padding: "4px 12px" }}
                                  onClick={() =>
                                    navigate(
                                      `/hrms/employee/${payroll.employee?.biometric_id}`
                                    )
                                  }
                                >
                                  <MdVisibility className="me-1" />
                                  View
                                </button>

                                {/* Status Change Dropdown */}
                                {getNextStatusOptions(payroll.status).length > 0 && (
                                  <div className="dropdown">
                                    <button
                                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                      style={{ fontSize: "12px", padding: "4px 12px"}}
                                    >
                                      <MdEdit className="me-1" />
                                    
                                      Change
                                    </button>
                                    <ul className="dropdown-menu">
                                      {getNextStatusOptions(payroll.status).map(
                                        (status) => (
                                          <li key={status}>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleStatusChange(payroll.id, status)
                                              }
                                            >
                                              {status}
                                            </button>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center py-5"
                            style={{ fontSize: "14px", color: "#6c757d" }}
                          >
                            {searchTerm || filterStatus !== "All"
                              ? "No payroll records found matching your filters"
                              : "No payroll records yet. Run your first payroll to get started!"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li
                            key={i + 1}
                            className={`page-item ${
                              currentPage === i + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}