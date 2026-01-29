import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

export default function Applications() {
  const { user, permissions } = useAuth();
  const biometricId = user?.biometric_id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showBulkApplicationModal, setShowBulkApplicationModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const isEmployee = user.role === "employee";
  const canApprove = can(permissions, "leave.approve") || can(permissions, "leave.manage") || can(permissions, "ot.approve") || can(permissions, "ot.manage");
  const isAdmin = user.role === "system_admin" || user.role === "hr";

  useEffect(() => {
    fetchApplications();
  }, [biometricId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      if (isEmployee && !biometricId) {
        console.warn("No biometric_id found for user");
        setApplications([]);
        return;
      }

      if (isEmployee) {
        const res = await baseApi.get(`/api/hrms/applications/${biometricId}`);
        setApplications(res.data || []);
      } else {
        const res = await baseApi.get("/api/hrms/applications");
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = async (formData) => {
    if (!biometricId) {
      Swal.fire({
        icon: "error",
        title: "Employee not found",
        text: "Employee profile is not linked to this account.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      await baseApi.post(`/api/hrms/applications/${biometricId}`, formData);

      setShowNewApplicationModal(false);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Application submitted successfully!",
        confirmButtonColor: "#28a745",
      });

      fetchApplications();
    } catch (err) {
      console.error("Failed to submit application:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err.response?.data?.message ||
          "Failed to submit application. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Employee Bulk Application (multiple dates for self)
  const handleEmployeeBulkApplication = async (applications) => {
    if (!biometricId) {
      Swal.fire({
        icon: "error",
        title: "Employee not found",
        text: "Employee profile is not linked to this account.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Submitting Applications...",
        text: `Submitting ${applications.length} application(s)`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const promises = applications.map(app => 
        baseApi.post(`/api/hrms/applications/${biometricId}`, app)
      );

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      setShowBulkApplicationModal(false);

      if (failed === 0) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `All ${successful} application(s) submitted successfully!`,
          confirmButtonColor: "#28a745",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partially Successful",
          html: `
            <p>${successful} application(s) submitted successfully</p>
            <p>${failed} application(s) failed</p>
          `,
          confirmButtonColor: "#f59e0b",
        });
      }

      fetchApplications();
    } catch (err) {
      console.error("Failed to submit bulk applications:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to submit applications. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Admin/HR Bulk Application (for multiple employees)
  const handleAdminBulkApplication = async (bulkData) => {
    try {
      Swal.fire({
        title: "Submitting Bulk Applications...",
        text: `Processing applications for ${bulkData.length} employee(s)`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Flatten all applications for all employees
      const allPromises = [];
      bulkData.forEach(employeeData => {
        employeeData.applications.forEach(app => {
          allPromises.push(
            baseApi.post(`/api/hrms/applications/${employeeData.biometric_id}`, app)
          );
        });
      });

      const results = await Promise.allSettled(allPromises);
      
      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      setShowBulkApplicationModal(false);

      if (failed === 0) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `All ${successful} application(s) submitted successfully!`,
          confirmButtonColor: "#28a745",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partially Successful",
          html: `
            <p>${successful} application(s) submitted successfully</p>
            <p>${failed} application(s) failed</p>
          `,
          confirmButtonColor: "#f59e0b",
        });
      }

      fetchApplications();
    } catch (err) {
      console.error("Failed to submit bulk applications:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to submit applications. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleReject = async (app) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Application?",
      html: `
        <div class="text-start mb-3">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
        </div>
      `,
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "Enter reason...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (reason === undefined) return; 

    try {
      await baseApi.put(`/api/hrms/applications/${app.id}`, {
        status: "Rejected",
        rejection_reason: reason || null,
      });

      Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Application has been rejected.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to reject:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to reject application",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = async (app) => {
    const result = await Swal.fire({
      title: "Delete Application?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          <p><strong>Status:</strong> ${app.status}</p>
          <p class="text-danger mt-3"><strong>⚠️ This action cannot be undone!</strong></p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.delete(`/api/hrms/applications/${app.id}`);

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Application has been deleted.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to delete:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to delete application",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Check if user can delete an application
  const canDelete = (app) => {
    const isDraft = app.status === "Draft";
    const isPendingHead = app.status === "Pending Head";
    const isPendingHR = app.status === "Pending HR";
    
    // System Admin can delete any application (any status)
    if (user.role === "system_admin") {
      return true;
    }

    // HR can only delete Draft, Pending Head, and Pending HR
    if (user.role === "hr") {
      return isDraft || isPendingHead || isPendingHR;
    }

    // Department head can only delete Draft and Pending Head
    if (canApprove && !isEmployee) {
      return isDraft || isPendingHead;
    }

    // Employee can only delete their own Draft and Pending Head applications
    if (isEmployee) {
      const isOwnApplication = app.biometric_id === biometricId || app.employee_biometric_id === biometricId;
      return isOwnApplication && (isDraft || isPendingHead);
    }

    return false;
  };

  // Submit application (Draft -> Pending Head)
  const handleSubmit = async (app) => {
    const result = await Swal.fire({
      title: "Submit Application?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          <p class="text-info mt-2"><small>ℹ️ This will submit the application for head approval</small></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.put(`/api/hrms/applications/${app.id}`, {
        status: "Pending Head",
      });

      Swal.fire({
        icon: "success",
        title: "Submitted!",
        text: "Application has been submitted for approval.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to submit:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to submit application",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Head approves (Pending Head -> Pending HR)
  const handleHeadApprove = async (app) => {
    const result = await Swal.fire({
      title: "Approve Application?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          <p class="text-warning mt-2"><small>⚠️ This will forward to HR for final approval</small></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.put(`/api/hrms/applications/${app.id}`, {
        status: "Pending HR",
      });

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Application forwarded to HR for final approval.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to approve:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to approve application",
        confirmButtonColor: "#d33",
      });
    }
  };

  // HR approves (Pending HR -> Approved by HR)
  const handleHRApprove = async (app) => {
    const result = await Swal.fire({
      title: "Approve Application?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          ${app.application_type === 'Leave' ? `<p class="text-warning mt-2"><small>⚠️ This will deduct leave credits</small></p>` : ''}
          <p class="text-success mt-2"><small>✓ Application will be ready for posting</small></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.put(`/api/hrms/applications/${app.id}`, {
        status: "Approved by HR",
      });

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Application approved and ready for posting.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to approve:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to approve application",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Post application (Approved by HR -> Posted)
  const handlePost = async (app) => {
    const result = await Swal.fire({
      title: "Post to Payroll/Attendance?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          <p class="text-success mt-2"><strong>✓ This will post the application to payroll/attendance system</strong></p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, post it",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await baseApi.put(`/api/hrms/applications/${app.id}`, {
        status: "Posted",
      });

      Swal.fire({
        icon: "success",
        title: "Posted!",
        text: "Application has been posted to payroll/attendance.",
        confirmButtonColor: "#28a745",
      });
      
      fetchApplications();
    } catch (err) {
      console.error("Failed to post:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to post application",
        confirmButtonColor: "#d33",
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    // Handle both date-only strings and datetime strings
    // Extract just the date part to avoid timezone conversion
    const dateOnly = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
    
    // Parse the date components to ensure no timezone conversion
    const [year, month, day] = dateOnly.split('-');
    
    // Return in YYYY-MM-DD format (prevents timezone issues)
    return `${year}-${month}-${day}`;
    
    // Alternative formats (uncomment the one you prefer):
    
    // MM/DD/YYYY format:
    // return `${month}/${day}/${year}`;
    
    // More readable format like "Feb 7, 2026":
    // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "draft": { bg: "#9ca3af", text: "Draft" },
      "pending head": { bg: "#f59e0b", text: "Pending Head" },
      "approved by head": { bg: "#3b82f6", text: "Approved by Head" },
      "pending hr": { bg: "#f59e0b", text: "Pending HR" },
      "approved by hr": { bg: "#10b981", text: "Approved by HR" },
      "posted": { bg: "#16a34a", text: "Posted" },
      "rejected": { bg: "#dc2626", text: "Rejected" },
      "cancelled": { bg: "#6b7280", text: "Cancelled" },
    };

    const s = statusMap[status?.toLowerCase()] || statusMap["draft"];

    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: "#fff",
          padding: "3px 8px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: "600",
          lineHeight: "1.2",
          whiteSpace: "nowrap",
        }}
      >
        {s.text}
      </span>
    );
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchStatus =
      statusFilter === "All" ||
      app.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchType = typeFilter === "All" || app.application_type === typeFilter;
    const matchSearch = !searchTerm || 
      app.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.biometric_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchType && matchSearch;
  });

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4 py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h2 className="fw-bold">
            {isEmployee ? "My Applications" : "Applications Management"}
          </h2>

          {/* Action Buttons */}
          <div className="d-flex gap-2 flex-wrap">
            {isEmployee && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewApplicationModal(true)}
                  style={{
                    fontSize: "14px",
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontWeight: "500",
                  }}
                >
                  New Application
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowBulkApplicationModal(true)}
                  style={{
                    fontSize: "14px",
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontWeight: "500",
                  }}
                >
                   Bulk Application
                </button>
              </>
            )}

            {!isEmployee && canApprove && (
              <button
                className="btn btn-primary"
                onClick={() => setShowBulkApplicationModal(true)}
                style={{
                  fontSize: "14px",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  fontWeight: "500",
                }}
              >
                 Bulk Application (Multiple Employees)
              </button>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            <div className="row g-3">
              {/* Search - For managers/HR */}
              {!isEmployee && (
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Search Employee:</label>
                  <input
                    type="text"
                    className="form-control w-100"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {/* Status Filter */}
              <div className={isEmployee ? "col-md-6" : "col-md-4"}>
                <label className="form-label fw-semibold">Status:</label>
                <select
                  className="form-select w-100"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Head">Pending Head</option>
                  <option value="Approved by Head">Approved by Head</option>
                  <option value="Pending HR">Pending HR</option>
                  <option value="Approved by HR">Approved by HR</option>
                  <option value="Posted">Posted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className={isEmployee ? "col-md-6" : "col-md-4"}>
                <label className="form-label fw-semibold">Type:</label>
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Leave">Leave</option>
                  <option value="Overtime">Overtime</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading applications...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      {!isEmployee && (
                        <th style={{ fontSize: "14px", padding: "12px" }}>Employee</th>
                      )}
                      <th className="text-nowrap" style={{ fontSize: "14px", padding: "12px" }}>
                        Type
                      </th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>
                        Leave/OT Type
                      </th>
                      <th className="text-nowrap" style={{ fontSize: "14px", padding: "12px" }}>
                        Date From
                      </th>
                      <th className="text-nowrap" style={{ fontSize: "14px", padding: "12px" }}>
                        Date To
                      </th>
                      <th className="text-nowrap" style={{ fontSize: "14px", padding: "12px" }}>
                        Duration
                      </th>
                      <th
                        className="d-none d-md-table-cell"
                        style={{ fontSize: "14px", padding: "12px" }}
                      >
                        Purpose
                      </th>
                      <th className="text-nowrap" style={{ fontSize: "14px", padding: "12px" }}>
                        Status
                      </th>
                      <th
                        className="text-nowrap text-center"
                        style={{ fontSize: "14px", padding: "12px" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <tr key={app.id}>
                          {!isEmployee && (
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <strong>{app.employee_name || "N/A"}</strong>
                              <br />
                              <small className="text-muted">
                                {app.employee_biometric_id || app.biometric_id}
                              </small>
                            </td>
                          )}

                          <td className="text-nowrap" style={{ fontSize: "13px", padding: "12px" }}>
                            <span
                              style={{
                                backgroundColor:
                                  app.application_type === "Leave" ? "#2563eb" : "#7c3aed",
                                color: "#ffffff",
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "3px 8px",
                                borderRadius: "999px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {app.application_type}
                            </span>
                          </td>

                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.application_type === "Leave" ? (
                              <>
                                {app.leave_type || "N/A"}
                                {app.leave_duration === "Half Day" && (
                                  <div>
                                    <small className="text-muted">
                                      ({app.half_day_period} - Half Day)
                                    </small>
                                  </div>
                                )}
                              </>
                            ) : (
                              app.overtime_type || "N/A"
                            )}
                          </td>

                          <td className="text-nowrap" style={{ fontSize: "13px", padding: "12px" }}>
                            {formatDate(app.date_from)}
                          </td>

                          <td className="text-nowrap" style={{ fontSize: "13px", padding: "12px" }}>
                            {formatDate(app.date_to)}
                          </td>

                          <td className="text-nowrap" style={{ fontSize: "13px", padding: "12px" }}>
                            {app.time_from && app.time_to
                              ? `${app.time_from} - ${app.time_to}`
                              : "—"}
                          </td>

                          <td
                            className="d-none d-md-table-cell"
                            style={{ fontSize: "13px", padding: "12px" }}
                          >
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                              title={app.purpose}
                            >
                              {app.purpose || "N/A"}
                            </span>
                          </td>

                          <td className="text-nowrap" style={{ fontSize: "13px", padding: "12px" }}>
                            {getStatusBadge(app.status)}
                          </td>

                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center flex-wrap">
                              {/* EMPLOYEE: Submit Draft */}
                              {isEmployee && app.status === "Draft" && (
                                <button
                                  className="btn btn-sm w-100 w-sm-auto"
                                  onClick={() => handleSubmit(app)}
                                  style={{
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    fontSize: "12px",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                  }}
                                >
                                  Submit
                                </button>
                              )}

                              {/* DEPARTMENT HEAD: Approve/Reject Pending Head */}
                              {canApprove && !isEmployee && app.status === "Pending Head" && (
                                <>
                                  <button
                                    className="btn btn-sm w-100 w-sm-auto"
                                    onClick={() => handleHeadApprove(app)}
                                    style={{
                                      backgroundColor: "#16a34a",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "none",
                                    }}
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="btn btn-sm w-100 w-sm-auto"
                                    onClick={() => handleReject(app)}
                                    style={{
                                      backgroundColor: "#dc2626",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "none",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* HR: Approve/Reject Pending HR */}
                              {(user.role === "hr" || user.role === "system_admin") && app.status === "Pending HR" && (
                                <>
                                  <button
                                    className="btn btn-sm w-100 w-sm-auto"
                                    onClick={() => handleHRApprove(app)}
                                    style={{
                                      backgroundColor: "#16a34a",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "none",
                                    }}
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="btn btn-sm w-100 w-sm-auto"
                                    onClick={() => handleReject(app)}
                                    style={{
                                      backgroundColor: "#dc2626",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "none",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* HR/ADMIN: Post Approved by HR */}
                              {(user.role === "hr" || user.role === "system_admin") && app.status === "Approved by HR" && (
                                <button
                                  className="btn btn-sm w-100 w-sm-auto"
                                  onClick={() => handlePost(app)}
                                  style={{
                                    backgroundColor: "#10b981",
                                    color: "#ffffff",
                                    fontSize: "12px",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                  }}
                                >
                                  Post
                                </button>
                              )}

                              {/* Delete Button */}
                              {canDelete(app) && (
                                <button
                                  className="btn btn-sm w-100 w-sm-auto"
                                  onClick={() => handleDelete(app)}
                                  style={{
                                    backgroundColor: "#6b7280",
                                    color: "#ffffff",
                                    fontSize: "12px",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                  }}
                                  title={
                                    user.role === "system_admin"
                                      ? "Delete application" 
                                      : "Can only delete draft and pending applications"
                                  }
                                >
                                  Delete
                                </button>
                              )}

                              {/* Show dash if no actions available */}
                              {!canDelete(app) && 
                                app.status !== "Draft" &&
                                app.status !== "Pending Head" &&
                                app.status !== "Pending HR" &&
                                app.status !== "Approved by HR" && (
                                <span className="text-muted text-center d-block">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={isEmployee ? 8 : 9}
                          className="text-center py-5"
                        >
                          <div className="text-muted">
                            <p className="mb-2">📋 No applications found</p>
                            {isEmployee && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setShowNewApplicationModal(true)}
                              >
                                Create New Application
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Results Count */}
            {!loading && filteredApplications.length > 0 && (
              <div className="mt-3 text-muted" style={{ fontSize: "13px" }}>
                Showing {filteredApplications.length} of {applications.length} application(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Application Modal - Employee Only */}
      {showNewApplicationModal && isEmployee && (
        <NewApplicationModal
          onClose={() => setShowNewApplicationModal(false)}
          onSave={handleNewApplication}
        />
      )}

      {/* Bulk Application Modal - Employee (multiple dates for self) */}
      {showBulkApplicationModal && isEmployee && (
        <EmployeeBulkApplicationModal
          onClose={() => setShowBulkApplicationModal(false)}
          onSave={handleEmployeeBulkApplication}
        />
      )}

      {/* Bulk Application Modal - Admin/HR (multiple employees) */}
      {showBulkApplicationModal && !isEmployee && (
        <AdminBulkApplicationModal
          onClose={() => setShowBulkApplicationModal(false)}
          onSave={handleAdminBulkApplication}
        />
      )}
    </Layout>
  );
}

// ============================================================
// NEW APPLICATION MODAL (Employee Only)
// ============================================================

function NewApplicationModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    application_type: "",
    leave_type: "",
    leave_duration: "Full Day",
    half_day_period: "AM",
    leave_start_time: "",
    leave_end_time: "",
    overtime_type: "Regular OT",
    status: "Draft",
    overtime_date: "",
    ot_in: "",
    ot_out: "",
    date_from: "",
    date_to: "",
    purpose: "",
  });

  useEffect(() => {
    if (formData.application_type === "Leave") {
      setFormData((prev) => ({
        ...prev,
        overtime_date: "",
        ot_in: "",
        ot_out: "",
        overtime_type: "Regular OT",
      }));
    }

    if (formData.application_type === "Overtime") {
      setFormData((prev) => ({
        ...prev,
        leave_type: "",
        leave_duration: "Full Day",
        half_day_period: "AM",
        leave_start_time: "",
        leave_end_time: "",
        date_from: "",
        date_to: "",
      }));
    }
  }, [formData.application_type]);

  const isOvertime = formData.application_type === "Overtime";
  const isLeave = formData.application_type === "Leave";

  const handleSubmit = (e) => {
    e.preventDefault();

    let payload = { ...formData };

    if (formData.application_type === "Overtime") {
      payload.date_from = formData.overtime_date;
      payload.date_to = formData.overtime_date;
      payload.time_from = formData.ot_in;
      payload.time_to = formData.ot_out;
      payload.leave_type = null;
      payload.leave_duration = null;
      payload.half_day_period = null;
    }

    if (formData.application_type === "Leave") {
      payload.overtime_type = null;

      if (formData.leave_duration === "Half Day") {
        payload.date_to = formData.date_from;
        payload.time_from = formData.leave_start_time;
        payload.time_to = formData.leave_end_time;
      } else {
        payload.time_from = null;
        payload.time_to = null;
        payload.half_day_period = null;
      }
    }

    delete payload.overtime_date;
    delete payload.ot_in;
    delete payload.ot_out;
    delete payload.leave_start_time;
    delete payload.leave_end_time;

    onSave(payload);
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ borderRadius: "12px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">New Application</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4">
              {/* Application Type */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Application Type:</label>
                <select
                  className="form-select"
                  value={formData.application_type}
                  onChange={(e) =>
                    setFormData({ ...formData, application_type: e.target.value })
                  }
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Leave">Leave</option>
                  <option value="Overtime">Overtime</option>
                </select>
              </div>

              {/* OVERTIME FIELDS */}
              {isOvertime && (
                <>
                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Overtime Type:</label>
                      <select
                        className="form-select"
                        value={formData.overtime_type}
                        onChange={(e) =>
                          setFormData({ ...formData, overtime_type: e.target.value })
                        }
                      >
                        <option value="Regular OT">Regular OT</option>
                        <option value="Holiday OT">Holiday OT</option>
                        <option value="Rest Day OT">Rest Day OT</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Overtime Date:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.overtime_date}
                        onChange={(e) =>
                          setFormData({ ...formData, overtime_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">OT Start Time:</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.ot_in}
                        onChange={(e) =>
                          setFormData({ ...formData, ot_in: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">OT End Time:</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.ot_out}
                        onChange={(e) =>
                          setFormData({ ...formData, ot_out: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LEAVE FIELDS */}
              {isLeave && (
                <>
                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Leave Type:</label>
                      <select
                        className="form-select"
                        value={formData.leave_type}
                        onChange={(e) =>
                          setFormData({ ...formData, leave_type: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Leave Type</option>
                        <option value="Vacation Leave">Vacation Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Leave Duration:</label>
                      <select
                        className="form-select"
                        value={formData.leave_duration}
                        onChange={(e) =>
                          setFormData({ ...formData, leave_duration: e.target.value })
                        }
                        required
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                    </div>
                  </div>

                  {/* Half Day Fields */}
                  {formData.leave_duration === "Half Day" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Half Day Period:</label>
                        <select
                          className="form-select"
                          value={formData.half_day_period}
                          onChange={(e) =>
                            setFormData({ ...formData, half_day_period: e.target.value })
                          }
                          required
                        >
                          <option value="AM">Morning (AM)</option>
                          <option value="PM">Afternoon (PM)</option>
                        </select>
                        <small className="text-muted">Select which half of the day you'll be on leave</small>
                      </div>

                      <div className="row mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">Start Time:</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.leave_start_time}
                            onChange={(e) =>
                              setFormData({ ...formData, leave_start_time: e.target.value })
                            }
                            required
                          />
                          <small className="text-muted">
                            {formData.half_day_period === "AM" ? "e.g., 08:00" : "e.g., 13:00"}
                          </small>
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">End Time:</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.leave_end_time}
                            onChange={(e) =>
                              setFormData({ ...formData, leave_end_time: e.target.value })
                            }
                            required
                          />
                          <small className="text-muted">
                            {formData.half_day_period === "AM" ? "e.g., 12:00" : "e.g., 17:00"}
                          </small>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        {formData.leave_duration === "Half Day" ? "Leave Date:" : "Date From:"}
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date_from}
                        onChange={(e) =>
                          setFormData({ ...formData, date_from: e.target.value })
                        }
                        required
                      />
                    </div>

                    {formData.leave_duration === "Full Day" && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Date To:</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.date_to}
                          onChange={(e) =>
                            setFormData({ ...formData, date_to: e.target.value })
                          }
                          required
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Purpose */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Purpose / Reason:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="Explain the reason for this application..."
                  required
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{
                  backgroundColor: "#dc2626", 
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: "#2563eb", 
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYEE BULK APPLICATION MODAL (Multiple dates for self)
// ============================================================

function EmployeeBulkApplicationModal({ onClose, onSave }) {
  const [applications, setApplications] = useState([]);
  const [commonData, setCommonData] = useState({
    application_type: "",
    leave_type: "",
    overtime_type: "Regular OT",
    purpose: "",
  });

  const addApplication = () => {
    const newApp = {
      id: Date.now(),
      date_from: "",
      date_to: "",
      time_from: "",
      time_to: "",
      leave_duration: "Full Day",
      half_day_period: "AM",
    };
    setApplications([...applications, newApp]);
  };

  const removeApplication = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const updateApplication = (id, field, value) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, [field]: value } : app
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (applications.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Applications",
        text: "Please add at least one application.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const payload = applications.map(app => {
      let finalApp = {
        application_type: commonData.application_type,
        purpose: commonData.purpose,
        status: "Draft",
      };

      if (commonData.application_type === "Leave") {
        finalApp.leave_type = commonData.leave_type;
        finalApp.leave_duration = app.leave_duration;
        finalApp.date_from = app.date_from;
        
        if (app.leave_duration === "Half Day") {
          finalApp.date_to = app.date_from;
          finalApp.time_from = app.time_from;
          finalApp.time_to = app.time_to;
          finalApp.half_day_period = app.half_day_period;
        } else {
          finalApp.date_to = app.date_to;
          finalApp.time_from = null;
          finalApp.time_to = null;
          finalApp.half_day_period = null;
        }
      }

      if (commonData.application_type === "Overtime") {
        finalApp.overtime_type = commonData.overtime_type;
        finalApp.date_from = app.date_from;
        finalApp.date_to = app.date_from;
        finalApp.time_from = app.time_from;
        finalApp.time_to = app.time_to;
      }

      return finalApp;
    });

    onSave(payload);
  };

  const isLeave = commonData.application_type === "Leave";
  const isOvertime = commonData.application_type === "Overtime";

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw" }}
      >
        <div className="modal-content" style={{ borderRadius: "12px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold"> Bulk Application (Multiple Dates)</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Common Fields */}
              <div className="card mb-4" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Common Information (applies to all)</h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Application Type:</label>
                      <select
                        className="form-select"
                        value={commonData.application_type}
                        onChange={(e) => {
                          setCommonData({ ...commonData, application_type: e.target.value });
                          setApplications([]);
                        }}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Leave">Leave</option>
                        <option value="Overtime">Overtime</option>
                      </select>
                    </div>

                    {isLeave && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Leave Type:</label>
                        <select
                          className="form-select"
                          value={commonData.leave_type}
                          onChange={(e) =>
                            setCommonData({ ...commonData, leave_type: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Leave Type</option>
                          <option value="Vacation Leave">Vacation Leave</option>
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Emergency Leave">Emergency Leave</option>
                          <option value="Unpaid Leave">Unpaid Leave</option>
                        </select>
                      </div>
                    )}

                    {isOvertime && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Overtime Type:</label>
                        <select
                          className="form-select"
                          value={commonData.overtime_type}
                          onChange={(e) =>
                            setCommonData({ ...commonData, overtime_type: e.target.value })
                          }
                        >
                          <option value="Regular OT">Regular OT</option>
                          <option value="Holiday OT">Holiday OT</option>
                          <option value="Rest Day OT">Rest Day OT</option>
                        </select>
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Purpose / Reason:</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={commonData.purpose}
                        onChange={(e) =>
                          setCommonData({ ...commonData, purpose: e.target.value })
                        }
                        placeholder="This purpose will apply to all applications..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Applications */}
              {commonData.application_type && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Individual Dates ({applications.length})</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addApplication}
                    >
                      + Add Date
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="alert alert-info">
                      Click "Add Date" to start adding individual dates/times for your applications
                    </div>
                  ) : (
                    <div className="row g-3">
                      {applications.map((app, index) => (
                        <div key={app.id} className="col-12">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-semibold mb-0">Date #{index + 1}</h6>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeApplication(app.id)}
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="row g-3">
                                {/* Leave Fields */}
                                {isLeave && (
                                  <>
                                    <div className="col-md-3">
                                      <label className="form-label fw-semibold">Duration:</label>
                                      <select
                                        className="form-select"
                                        value={app.leave_duration}
                                        onChange={(e) =>
                                          updateApplication(app.id, "leave_duration", e.target.value)
                                        }
                                        required
                                      >
                                        <option value="Full Day">Full Day</option>
                                        <option value="Half Day">Half Day</option>
                                      </select>
                                    </div>

                                    {app.leave_duration === "Half Day" && (
                                      <div className="col-md-3">
                                        <label className="form-label fw-semibold">Period:</label>
                                        <select
                                          className="form-select"
                                          value={app.half_day_period}
                                          onChange={(e) =>
                                            updateApplication(app.id, "half_day_period", e.target.value)
                                          }
                                          required
                                        >
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                        </select>
                                      </div>
                                    )}

                                    <div className="col-md-3">
                                      <label className="form-label fw-semibold">
                                        {app.leave_duration === "Half Day" ? "Date:" : "Date From:"}
                                      </label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        value={app.date_from}
                                        onChange={(e) =>
                                          updateApplication(app.id, "date_from", e.target.value)
                                        }
                                        required
                                      />
                                    </div>

                                    {app.leave_duration === "Full Day" && (
                                      <div className="col-md-3">
                                        <label className="form-label fw-semibold">Date To:</label>
                                        <input
                                          type="date"
                                          className="form-control"
                                          value={app.date_to}
                                          onChange={(e) =>
                                            updateApplication(app.id, "date_to", e.target.value)
                                          }
                                          required
                                        />
                                      </div>
                                    )}

                                    {app.leave_duration === "Half Day" && (
                                      <>
                                        <div className="col-md-3">
                                          <label className="form-label fw-semibold">Start Time:</label>
                                          <input
                                            type="time"
                                            className="form-control"
                                            value={app.time_from}
                                            onChange={(e) =>
                                              updateApplication(app.id, "time_from", e.target.value)
                                            }
                                            required
                                          />
                                        </div>
                                        <div className="col-md-3">
                                          <label className="form-label fw-semibold">End Time:</label>
                                          <input
                                            type="time"
                                            className="form-control"
                                            value={app.time_to}
                                            onChange={(e) =>
                                              updateApplication(app.id, "time_to", e.target.value)
                                            }
                                            required
                                          />
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}

                                {/* Overtime Fields */}
                                {isOvertime && (
                                  <>
                                    <div className="col-md-4">
                                      <label className="form-label fw-semibold">Date:</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        value={app.date_from}
                                        onChange={(e) =>
                                          updateApplication(app.id, "date_from", e.target.value)
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label fw-semibold">Start Time:</label>
                                      <input
                                        type="time"
                                        className="form-control"
                                        value={app.time_from}
                                        onChange={(e) =>
                                          updateApplication(app.id, "time_from", e.target.value)
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label fw-semibold">End Time:</label>
                                      <input
                                        type="time"
                                        className="form-control"
                                        value={app.time_to}
                                        onChange={(e) =>
                                          updateApplication(app.id, "time_to", e.target.value)
                                        }
                                        required
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn"
                disabled={applications.length === 0}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Submit {applications.length} Application(s)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN BULK APPLICATION MODAL (Multiple employees)
// ============================================================

function AdminBulkApplicationModal({ onClose, onSave }) {
  const [employees, setEmployees] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [commonData, setCommonData] = useState({
    application_type: "",
    leave_type: "",
    overtime_type: "Regular OT",
    purpose: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    leave_duration: "Full Day",
    half_day_period: "AM",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await baseApi.get("/api/hrms/employees");
      setEmployeeList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load employees",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const addEmployee = (employee) => {
    if (employees.find(e => e.biometric_id === employee.biometric_id)) {
      Swal.fire({
        icon: "warning",
        title: "Already Added",
        text: "This employee is already in the list.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    setEmployees([...employees, employee]);
  };

  const removeEmployee = (biometric_id) => {
    setEmployees(employees.filter(e => e.biometric_id !== biometric_id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (employees.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Employees Selected",
        text: "Please select at least one employee.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // Build payload for each employee
    const bulkData = employees.map(emp => {
      let application = {
        application_type: commonData.application_type,
        purpose: commonData.purpose,
        status: "Draft",
      };

      if (commonData.application_type === "Leave") {
        application.leave_type = commonData.leave_type;
        application.leave_duration = commonData.leave_duration;
        application.date_from = commonData.date_from;

        if (commonData.leave_duration === "Half Day") {
          application.date_to = commonData.date_from;
          application.time_from = commonData.time_from;
          application.time_to = commonData.time_to;
          application.half_day_period = commonData.half_day_period;
        } else {
          application.date_to = commonData.date_to;
          application.time_from = null;
          application.time_to = null;
          application.half_day_period = null;
        }
      }

      if (commonData.application_type === "Overtime") {
        application.overtime_type = commonData.overtime_type;
        application.date_from = commonData.date_from;
        application.date_to = commonData.date_from;
        application.time_from = commonData.time_from;
        application.time_to = commonData.time_to;
      }

      return {
        biometric_id: emp.biometric_id,
        applications: [application]
      };
    });

    onSave(bulkData);
  };

  const isLeave = commonData.application_type === "Leave";
  const isOvertime = commonData.application_type === "Overtime";

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "95vw" }}
      >
        <div className="modal-content" style={{ borderRadius: "12px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold"> Bulk Application (Multiple Employees)</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              <div className="row">
                {/* LEFT: Employee Selection */}
                <div className="col-md-4">
                  <div className="card mb-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Select Employees</h6>
                      
                      {loadingEmployees ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          {employeeList.map(emp => (
                            <div
                              key={emp.biometric_id}
                              className="d-flex justify-content-between align-items-center p-2 mb-2 bg-white rounded"
                              style={{ cursor: "pointer" }}
                              onClick={() => addEmployee(emp)}
                            >
                              <div>
                                <div className="fw-semibold" style={{ fontSize: "13px" }}>
                                  {emp.first_name} {emp.last_name}
                                </div>
                                <small className="text-muted">{emp.biometric_id}</small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addEmployee(emp);
                                }}
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Employees */}
                  <div className="card" style={{ backgroundColor: "#e0f2fe" }}>
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Selected ({employees.length})</h6>
                      
                      {employees.length === 0 ? (
                        <p className="text-muted small">No employees selected</p>
                      ) : (
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {employees.map(emp => (
                            <div
                              key={emp.biometric_id}
                              className="d-flex justify-content-between align-items-center p-2 mb-2 bg-white rounded"
                            >
                              <div>
                                <div className="fw-semibold" style={{ fontSize: "13px" }}>
                                  {emp.first_name} {emp.last_name}
                                </div>
                                <small className="text-muted">{emp.biometric_id}</small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeEmployee(emp.biometric_id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Application Details */}
                <div className="col-md-8">
                  <div className="card" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Application Details (applies to all selected employees)</h6>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Application Type:</label>
                          <select
                            className="form-select"
                            value={commonData.application_type}
                            onChange={(e) =>
                              setCommonData({ ...commonData, application_type: e.target.value })
                            }
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Leave">Leave</option>
                            <option value="Overtime">Overtime</option>
                          </select>
                        </div>

                        {isLeave && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Leave Type:</label>
                              <select
                                className="form-select"
                                value={commonData.leave_type}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, leave_type: e.target.value })
                                }
                                required
                              >
                                <option value="">Select Leave Type</option>
                                <option value="Vacation Leave">Vacation Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Emergency Leave">Emergency Leave</option>
                                <option value="Unpaid Leave">Unpaid Leave</option>
                              </select>
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Leave Duration:</label>
                              <select
                                className="form-select"
                                value={commonData.leave_duration}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, leave_duration: e.target.value })
                                }
                                required
                              >
                                <option value="Full Day">Full Day</option>
                                <option value="Half Day">Half Day</option>
                              </select>
                            </div>

                            {commonData.leave_duration === "Half Day" && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Half Day Period:</label>
                                <select
                                  className="form-select"
                                  value={commonData.half_day_period}
                                  onChange={(e) =>
                                    setCommonData({ ...commonData, half_day_period: e.target.value })
                                  }
                                  required
                                >
                                  <option value="AM">Morning (AM)</option>
                                  <option value="PM">Afternoon (PM)</option>
                                </select>
                              </div>
                            )}

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                {commonData.leave_duration === "Half Day" ? "Leave Date:" : "Date From:"}
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={commonData.date_from}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, date_from: e.target.value })
                                }
                                required
                              />
                            </div>

                            {commonData.leave_duration === "Full Day" && (
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Date To:</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={commonData.date_to}
                                  onChange={(e) =>
                                    setCommonData({ ...commonData, date_to: e.target.value })
                                  }
                                  required
                                />
                              </div>
                            )}

                            {commonData.leave_duration === "Half Day" && (
                              <>
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">Start Time:</label>
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={commonData.time_from}
                                    onChange={(e) =>
                                      setCommonData({ ...commonData, time_from: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">End Time:</label>
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={commonData.time_to}
                                    onChange={(e) =>
                                      setCommonData({ ...commonData, time_to: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {isOvertime && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Overtime Type:</label>
                              <select
                                className="form-select"
                                value={commonData.overtime_type}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, overtime_type: e.target.value })
                                }
                              >
                                <option value="Regular OT">Regular OT</option>
                                <option value="Holiday OT">Holiday OT</option>
                                <option value="Rest Day OT">Rest Day OT</option>
                              </select>
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Date:</label>
                              <input
                                type="date"
                                className="form-control"
                                value={commonData.date_from}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, date_from: e.target.value })
                                }
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Start Time:</label>
                              <input
                                type="time"
                                className="form-control"
                                value={commonData.time_from}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, time_from: e.target.value })
                                }
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">End Time:</label>
                              <input
                                type="time"
                                className="form-control"
                                value={commonData.time_to}
                                onChange={(e) =>
                                  setCommonData({ ...commonData, time_to: e.target.value })
                                }
                                required
                              />
                            </div>
                          </>
                        )}

                        <div className="col-12">
                          <label className="form-label fw-semibold">Purpose / Reason:</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={commonData.purpose}
                            onChange={(e) =>
                              setCommonData({ ...commonData, purpose: e.target.value })
                            }
                            placeholder="This will apply to all selected employees..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn"
                disabled={employees.length === 0}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "6px",
                }}
              >
                Submit for {employees.length} Employee(s)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}