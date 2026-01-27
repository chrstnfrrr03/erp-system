import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

export default function ApplicationFormsTab({ employee, onApplicationUpdated }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  useEffect(() => {
    if (employee?.biometric_id) {
      fetchApplications();
    }
  }, [employee?.biometric_id]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.split("T")[0];
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await baseApi.get(`/api/hrms/applications/${employee.biometric_id}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = async (formData) => {
    try {
      await baseApi.post(`/api/hrms/applications/${employee.biometric_id}`, formData);

      await fetchApplications();

      if (onApplicationUpdated) {
        await onApplicationUpdated();
      }

      setShowNewApplicationModal(false);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Application submitted successfully!",
        confirmButtonColor: "#28a745",
      });
    } catch (err) {
      console.error("Failed to submit application:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to submit application. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "pending supervisor": { bg: "#ffc107", text: "Pending Supervisor" },
      "pending hr": { bg: "#ff9800", text: "Pending HR" },
      approved: { bg: "#28a745", text: "Approved" },
      rejected: { bg: "#dc3545", text: "Rejected" },
      cancelled: { bg: "#6c757d", text: "Cancelled" },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || {
      bg: "#ffc107",
      text: "Pending",
    };

    return (
      <span
        style={{
          backgroundColor: statusInfo.bg,
          color: "white",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "500",
        }}
      >
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="row g-4">
      {/* LEFT SIDE - Employee Info Card */}
      <div className="col-lg-4">
        <div
          className="card"
          style={{
            borderRadius: "12px",
            backgroundColor: "white",
            borderTop: "3px solid #ffe680",
          }}
        >
          <div className="card-body text-center py-5">
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                backgroundColor: "#e0e0e0",
              }}
            >
              {employee.profile_picture ? (
                <img
                  src={employee.profile_picture}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUserCircle size={100} color="#555" />
              )}
            </div>

            <h4 className="mb-2 fw-bold">{employee.fullname}</h4>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              {employee.biometric_id}
            </p>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              {employee.department}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Applications Table */}
      <div className="col-lg-8">
        <div
          className="card"
          style={{
            borderRadius: "12px",
            backgroundColor: "white",
            borderTop: "3px solid #ffe680",
          }}
        >
          <div className="card-body p-4">
            {/* New Application Button */}
            <div className="d-flex justify-content-end mb-4">
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
            </div>

            {/* Applications Table */}
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
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Application Type
                      </th>
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Leave Type
                      </th>
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Purpose
                      </th>
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Date From
                      </th>
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Date To
                      </th>
                      <th style={{ fontSize: "13px", padding: "12px" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length > 0 ? (
                      applications.map((app) => (
                        <tr key={app.id}>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.application_type || "N/A"}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.leave_type || "N/A"}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {app.purpose || "N/A"}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {formatDate(app.date_from)}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {formatDate(app.date_to)}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {getStatusBadge(app.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4"
                          style={{ fontSize: "14px" }}
                        >
                          No applications found
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

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <NewApplicationModal
          onClose={() => setShowNewApplicationModal(false)}
          onSave={handleNewApplication}
        />
      )}
    </div>
  );
}

// New Application Modal Component
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

    // If half-day leave, set date_to same as date_from and add time
    if (formData.leave_duration === "Half Day") {
      payload.date_to = formData.date_from;
      payload.time_from = formData.leave_start_time;
      payload.time_to = formData.leave_end_time;
      // ✅ KEEP these fields - don't delete them!
      // payload.leave_duration is already set
      // payload.half_day_period is already set
    } else {
      // Full day leave - no time needed
      payload.time_from = null;
      payload.time_to = null;
      payload.half_day_period = null; // Not needed for full day
    }
  }

  // Only delete the temporary UI fields
  delete payload.overtime_date;
  delete payload.ot_in;
  delete payload.ot_out;
  delete payload.leave_start_time;
  delete payload.leave_end_time;

  console.log('📤 Submitting payload:', payload); // Debug log

  onSave(payload);
};

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "750px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Application</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Application Type */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Application Type:
                </label>
                <select
                  className="form-select"
                  value={formData.application_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      application_type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select</option>
                  <option value="Leave">Leave</option>
                  <option value="Overtime">Overtime</option>
                </select>
              </div>

              {/* OVERTIME SECTION */}
              {isOvertime && (
                <>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Overtime Type:
                      </label>
                      <select
                        className="form-select"
                        value={formData.overtime_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            overtime_type: e.target.value,
                          })
                        }
                      >
                        <option value="Regular OT">Regular OT</option>
                        <option value="Holiday OT">Holiday OT</option>
                        <option value="Rest Day OT">Rest Day OT</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">Status:</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="Pending Supervisor">
                          Pending Supervisor
                        </option>
                        <option value="Pending HR">Pending HR</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Overtime Date:
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.overtime_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            overtime_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">OT In:</label>
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
                      <label className="form-label fw-semibold">OT Out:</label>
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

              {/* LEAVE SECTION */}
              {isLeave && (
                <>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Leave Type:
                      </label>
                      <select
                        className="form-select"
                        value={formData.leave_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leave_type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option value="Vacation Leave">Vacation Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Leave Duration:
                      </label>
                      <select
                        className="form-select"
                        value={formData.leave_duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leave_duration: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                    </div>
                  </div>

                  {/* Half Day Period and Time */}
                  {formData.leave_duration === "Half Day" && (
                    <>
                      <div className="row mb-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            Half Day Period:
                          </label>
                          <select
                            className="form-select"
                            value={formData.half_day_period}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                half_day_period: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="AM">Morning (AM)</option>
                            <option value="PM">Afternoon (PM)</option>
                          </select>
                          <small className="text-muted">
                            Select which half of the day you'll be on leave
                          </small>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6">
                          <label className="form-label fw-semibold">
                            Leave Start Time:
                          </label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.leave_start_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                leave_start_time: e.target.value,
                              })
                            }
                            required
                          />
                          <small className="text-muted">
                            {formData.half_day_period === "AM"
                              ? "e.g., 08:00"
                              : "e.g., 13:00"}
                          </small>
                        </div>

                        <div className="col-6">
                          <label className="form-label fw-semibold">
                            Leave End Time:
                          </label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.leave_end_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                leave_end_time: e.target.value,
                              })
                            }
                            required
                          />
                          <small className="text-muted">
                            {formData.half_day_period === "AM"
                              ? "e.g., 12:00"
                              : "e.g., 17:00"}
                          </small>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Status:</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="Pending Supervisor">
                          Pending Supervisor
                        </option>
                        <option value="Pending HR">Pending HR</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        {formData.leave_duration === "Half Day"
                          ? "Leave Date:"
                          : "Date From:"}
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date_from}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_from: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {formData.leave_duration === "Full Day" && (
                      <div className="col-6">
                        <label className="form-label fw-semibold">
                          Date To:
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.date_to}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              date_to: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Half Day Leave Summary */}
                  {formData.leave_duration === "Half Day" &&
                    formData.date_from &&
                    formData.leave_start_time &&
                    formData.leave_end_time && (
                      <div className="alert alert-info" role="alert">
                        <strong>📋 Half Day Leave Summary:</strong>
                        <div className="mt-2">
                          <div>Date: {formData.date_from}</div>
                          <div>
                            Period:{" "}
                            {formData.half_day_period === "AM"
                              ? "Morning (AM)"
                              : "Afternoon (PM)"}
                          </div>
                          <div>
                            Time: {formData.leave_start_time} -{" "}
                            {formData.leave_end_time}
                            <span className="ms-2">
                              (
                              {calculateHours(
                                formData.leave_start_time,
                                formData.leave_end_time
                              )}{" "}
                              hours)
                            </span>
                          </div>
                          <div className="text-muted small mt-1">
                            {formData.half_day_period === "AM"
                              ? "You'll be on leave in the morning, available in the afternoon"
                              : "You'll be available in the morning, on leave in the afternoon"}
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}

              {/* PURPOSE */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Purpose / Reason:
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="Explain the reason for this application"
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
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

// Helper function to calculate hours
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes;
  return (totalMinutes / 60).toFixed(1);
}