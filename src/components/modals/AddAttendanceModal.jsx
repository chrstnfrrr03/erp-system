import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

export default function AddAttendanceModal({ show, onHide, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    biometric_id: "",
    date: "",
    am_time_in: "",
    am_time_out: "",
    pm_time_in: "",
    pm_time_out: "",
  });

  useEffect(() => {
    if (show) fetchEmployees();
  }, [show]);

  const fetchEmployees = async () => {
    try {
      const res = await baseApi.get("/api/hrms/employees");
      setEmployees(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load employees.", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.biometric_id || !form.date || !form.am_time_in) {
      Swal.fire(
        "Required",
        "Employee, Date, and AM Time In are required.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      // ✅ POST TO SHIFT-AWARE ENDPOINT
     await baseApi.post(`/api/hrms/attendance/${form.biometric_id}`, {
          date: form.date,
          am_time_in: form.am_time_in,
          am_time_out: form.am_time_out || null,
          pm_time_in: form.pm_time_in || null,
          pm_time_out: form.pm_time_out || null,
        }
      );

      Swal.fire("Success", "Attendance saved.", "success");

      onHide();
      onSuccess();

      setForm({
        biometric_id: "",
        date: "",
        am_time_in: "",
        am_time_out: "",
        pm_time_in: "",
        pm_time_out: "",
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save attendance.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Attendance</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-semibold">Employee</label>
            <select
              className="form-select"
              name="biometric_id"
              value={form.biometric_id}
              onChange={handleChange}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.biometric_id}>
                  {emp.employee_number} - {emp.fullname}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">Date</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">AM In *</label>
            <input
              type="time"
              className="form-control"
              name="am_time_in"
              value={form.am_time_in}
              onChange={handleChange}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">AM Out</label>
            <input
              type="time"
              className="form-control"
              name="am_time_out"
              value={form.am_time_out}
              onChange={handleChange}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">PM In</label>
            <input
              type="time"
              className="form-control"
              name="pm_time_in"
              value={form.pm_time_in}
              onChange={handleChange}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">PM Out</label>
            <input
              type="time"
              className="form-control"
              name="pm_time_out"
              value={form.pm_time_out}
              onChange={handleChange}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-danger" onClick={onHide}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Attendance"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
