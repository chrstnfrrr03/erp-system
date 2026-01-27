import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

export default function Applications() {
  const { user, permissions } = useAuth();
  const biometricId = user?.employee?.biometric_id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const isEmployee = user.role === "employee";
  const canApprove = can(permissions, "leave.approve") || can(permissions, "leave.manage") || can(permissions, "ot.approve") || can(permissions, "ot.manage");

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


  const handleApprove = async (app) => {
    const result = await Swal.fire({
      title: "Approve Application?",
      html: `
        <div class="text-start">
          <p><strong>Employee:</strong> ${app.employee_name || app.biometric_id}</p>
          <p><strong>Type:</strong> ${app.application_type}</p>
          <p><strong>Date:</strong> ${formatDate(app.date_from)} to ${formatDate(app.date_to)}</p>
          ${app.application_type === 'Leave' ? `<p class="text-warning mt-2"><small>⚠️ This will deduct leave credits</small></p>` : ''}
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
        status: "Approved",
      });

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Application has been approved.",
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
    } 
    
    catch (err) {
      console.error("Failed to reject:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to reject application",
        confirmButtonColor: "#d33",
      });
    }
  };


  
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.split("T")[0];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "pending supervisor": { bg: "warning", text: "Pending Supervisor" },
      "pending hr": { bg: "warning", text: "Pending HR" },
      "approved": { bg: "success", text: "Approved" },
      "rejected": { bg: "danger", text: "Rejected" },
      "cancelled": { bg: "secondary", text: "Cancelled" },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { bg: "warning", text: "Pending" };

    return (
      <span className={`badge bg-${statusInfo.bg}`}>
        {statusInfo.text}
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            {isEmployee ? "My Applications" : "Applications Management"}
          </h2>

          {/* New Application Button - Only for employees */}
          {isEmployee && (
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
          )}
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
                    className="form-control"
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
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Pending Supervisor">Pending Supervisor</option>
                  <option value="Pending HR">Pending HR</option>
                  <option value="Approved">Approved</option>
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
                      {!isEmployee && <th style={{ fontSize: "14px", padding: "12px" }}>Employee</th>}
                      <th style={{ fontSize: "14px", padding: "12px" }}>Type</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Leave/OT Type</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Date From</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Date To</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Duration</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Purpose</th>
                      <th style={{ fontSize: "14px", padding: "12px" }}>Status</th>
                      {canApprove && <th style={{ fontSize: "14px", padding: "12px", textAlign: "center" }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <tr key={app.id}>
                          {!isEmployee && (
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <div>
                                <strong>{app.employee_name || "N/A"}</strong>
                                <br />
                                <small className="text-muted">{app.employee_biometric_id || app.biometric_id}</small>
                              </div>
                            </td>
                          )}
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            <span className={`badge ${app.application_type === "Leave" ? "bg-info" : "bg-primary"}`}>
                              {app.application_type}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.application_type === "Leave" ? (
                              <div>
                                {app.leave_type || "N/A"}
                                {app.leave_duration === "Half Day" && (
                                  <div>
                                    <small className="text-muted">
                                      ({app.half_day_period} - Half Day)
                                    </small>
                                  </div>
                                )}
                              </div>
                            ) : (
                              app.overtime_type || "N/A"
                            )}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>{formatDate(app.date_from)}</td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>{formatDate(app.date_to)}</td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.application_type === "Leave" && app.leave_duration === "Half Day" ? (
                              <div>
                                <small>{app.time_from} - {app.time_to}</small>
                              </div>
                            ) : app.application_type === "Overtime" ? (
                              <div>
                                <small>{app.time_from} - {app.time_to}</small>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            <span 
                              className="text-truncate d-inline-block" 
                              style={{ maxWidth: "200px" }} 
                              title={app.purpose}
                            >
                              {app.purpose || "N/A"}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>{getStatusBadge(app.status)}</td>
                          {canApprove && (
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              {(app.status === "Pending Supervisor" || app.status === "Pending HR") ? (
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleApprove(app)}
                                    title="Approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleReject(app)}
                                    title="Reject"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted text-center d-block">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={canApprove ? (isEmployee ? 8 : 9) : (isEmployee ? 7 : 8)}
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

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <NewApplicationModal
          onClose={() => setShowNewApplicationModal(false)}
          onSave={handleNewApplication}
        />
      )}
    </Layout>
  );
}

// ============================================================
// NEW APPLICATION MODAL
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
    status: "Pending Supervisor",
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
                    <div className="col-6">
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

                    <div className="col-6">
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
                    <div className="col-6">
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

                    <div className="col-6">
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
                    <div className="col-6">
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

                    <div className="col-6">
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
                        <div className="col-6">
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

                        <div className="col-6">
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
                    <div className="col-6">
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
                      <div className="col-6">
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
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}