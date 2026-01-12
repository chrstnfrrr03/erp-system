import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import api from "../../api";
import Swal from "sweetalert2";

export default function ApplicationFormsTab({ employee }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [employee.biometric_id]);

  const formatDate = (date) => {
  if (!date) return "N/A";
  return date.split("T")[0];
};



  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${employee.biometric_id}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = async (formData) => {
    try {
      await api.post(`/applications/${employee.biometric_id}`, formData);
      await fetchApplications();
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
      pending: { bg: "#ffc107", text: "Pending" },
      approved: { bg: "#28a745", text: "Approved" },
      rejected: { bg: "#dc3545", text: "Rejected" },
      cancelled: { bg: "#6c757d", text: "Cancelled" },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;

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
    overtime_type: "Regular OT",
    status: "Pending Supervisor",
    overtime_date: "",
    ot_in: "",
    ot_out: "",
    date_from: "",
    date_to: "",
    purpose: "",
  });

  const isOvertime = formData.application_type === "Overtime";
  const isLeave = formData.application_type === "Leave";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
                <label className="form-label">Application Type:</label>
                <select
                  className="form-select"
                  value={formData.application_type}
                  onChange={(e) =>
                    setFormData({ ...formData, application_type: e.target.value })
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
                      <label className="form-label">Overtime Type:</label>
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
                        <option>Regular OT</option>
                        <option>Holiday OT</option>
                        <option>Rest Day OT</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label">Status:</label>
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
                      <label className="form-label">Overtime Date:</label>
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
                      <label className="form-label">OT In:</label>
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
                      <label className="form-label">OT Out:</label>
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
                      <label className="form-label">Leave Type:</label>
                      <select
                        className="form-select"
                        value={formData.leave_type}
                        onChange={(e) =>
                          setFormData({ ...formData, leave_type: e.target.value })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option value="Vacation Leave">Vacation Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Emergency Leave">
                          Emergency Leave
                        </option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label">Status:</label>
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
                      <label className="form-label">Date From:</label>
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

                    <div className="col-6">
                      <label className="form-label">Date To:</label>
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
                  </div>
                </>
              )}

              {/* PURPOSE */}
              <div className="mb-3">
                <label className="form-label">Purpose / Reason:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button"className="btn btn-danger" onClick={onClose}>
              Close
              </button>

              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
