import { useEffect, useState } from "react";
import axios from "axios";

export default function EmploymentInfoTab({ formData, handleInputChange, handleNext }) {
  const baseInputStyle = {
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    width: "100%",
  };

  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/hrms/shifts`)
      .then((res) => {
        console.log("Shift API Response:", res.data);

        const shiftList =
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        setShifts(shiftList);
      })
      .catch((err) => {
        console.error("Shift fetch error:", err);
      });
  }, []);

  return (
    <div className="tab-content" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* Row 1: Name fields */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>First Name:</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="First Name"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Middle Name:</label>
          <input
            type="text"
            name="middle_name"
            className="form-control"
            value={formData.middle_name}
            onChange={handleInputChange}
            placeholder="Middle Name"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Last Name:</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Last Name"
            style={baseInputStyle}
          />
        </div>
      </div>

      {/* Row 2: Department, Position, etc. */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Department:</label>
          <select
            name="department"
            className="form-select"
            value={formData.department}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Position:</label>
          <input
            type="text"
            name="position"
            className="form-control"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Position"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Department Head:</label>
          <input
            type="text"
            name="department_head"
            className="form-control"
            value={formData.department_head}
            onChange={handleInputChange}
            placeholder="Department Head"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Supervisor:</label>
          <input
            type="text"
            name="supervisor"
            className="form-control"
            value={formData.supervisor}
            onChange={handleInputChange}
            placeholder="Supervisor"
            style={baseInputStyle}
          />
        </div>
      </div>

      {/* Row 3: Job location, Company email */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Job Location:</label>
          <input
            type="text"
            name="job_location"
            className="form-control"
            value={formData.job_location}
            onChange={handleInputChange}
            placeholder="Job Location"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Company Email:</label>
          <input
            type="email"
            name="company_email"
            className="form-control"
            value={formData.company_email}
            onChange={handleInputChange}
            placeholder="Company Email"
            style={baseInputStyle}
          />
        </div>
      </div>

      {/* Row 4: Type, Status, Rate */}
      <div className="row g-3 mb-3">
        {/* UPDATED EMPLOYEE TYPE */}
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Employee Type:</label>
          <select
            name="employee_type"
            className="form-select"
            value={formData.employee_type}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Type</option>
            <option value="Local">Local</option>
            <option value="Expat">Expat</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Employment Status:</label>
          <select
            name="employment_status"
            className="form-select"
            value={formData.employment_status}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Employment Classification:
          </label>
          <select
            name="employment_classification"
            className="form-select"
            value={formData.employment_classification}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Classification</option>
            <option value="Probationary">Probationary</option>
            <option value="Regular">Regular</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
            <option value="End of Contract">End of Contract</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Rate:</label>
          <input
            type="number"
            name="rate"
            className="form-control"
            value={formData.rate}
            onChange={handleInputChange}
            placeholder="Rate"
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Rate Type:</label>
          <select
            name="rate_type"
            className="form-select"
            value={formData.rate_type}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Type</option>
            <option value="Hourly">Hourly</option>
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Row 5: Shift from Seeder */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Shift:</label>
          <select
            name="shift_id"
            className="form-select"
            value={formData.shift_id || ""}
            onChange={handleInputChange}
            style={baseInputStyle}
          >
            <option value="">Select Shift</option>

            {shifts.length === 0 && <option disabled>Loading shifts...</option>}

            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.shift_name}
                {shift.start_time && shift.end_time
                  ? ` (${shift.start_time} - ${shift.end_time})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 6: Dates */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Date Started:</label>
          <input
            type="date"
            name="date_started"
            className="form-control"
            value={formData.date_started}
            onChange={handleInputChange}
            style={baseInputStyle}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Date Ended:</label>
          <input
            type="date"
            name="date_ended"
            className="form-control"
            value={formData.date_ended}
            onChange={handleInputChange}
            style={baseInputStyle}
          />
        </div>
      </div>

      {/* Next button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          style={{
            padding: "10px 40px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
