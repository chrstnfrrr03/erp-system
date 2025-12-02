export default function EmploymentInfoTab({ formData, handleInputChange, handleNext }) {
  return (
    <div className="tab-content" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* Row 1: First Name, Middle Name, Last Name */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            First Name:
          </label>
          <input 
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="First Name"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Middle Name:
          </label>
          <input 
            type="text"
            name="middle_name"
            className="form-control"
            value={formData.middle_name}
            onChange={handleInputChange}
            placeholder="Middle Name"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Last Name:
          </label>
          <input 
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Last Name"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
      </div>

      {/* Row 2: Department, Position, Department Head, Supervisor */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Department:
          </label>
          <select 
            name="department"
            className="form-select"
            value={formData.department}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
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
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Position:
          </label>
          <input 
            type="text"
            name="position"
            className="form-control"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Position"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Department Head:
          </label>
          <input 
            type="text"
            name="department_head"
            className="form-control"
            value={formData.department_head}
            onChange={handleInputChange}
            placeholder="Department Head"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Supervisor:
          </label>
          <input 
            type="text"
            name="supervisor"
            className="form-control"
            value={formData.supervisor}
            onChange={handleInputChange}
            placeholder="Supervisor"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
      </div>

      {/* Row 3: Job Location, Company Email */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Job Location:
          </label>
          <input 
            type="text"
            name="job_location"
            className="form-control"
            value={formData.job_location}
            onChange={handleInputChange}
            placeholder="Job Location"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Company Email:
          </label>
          <input 
            type="email"
            name="company_email"
            className="form-control"
            value={formData.company_email}
            onChange={handleInputChange}
            placeholder="Company Email"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
      </div>

      {/* Row 4: Employee Type, Employment Status, Rate, Type Rate */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Employee Type:
          </label>
          <select 
            name="employee_type"
            className="form-select"
            value={formData.employee_type}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          >
            <option value="">Select Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Employment Status:
          </label>
          <select 
            name="employment_status"
            className="form-select"
            value={formData.employment_status}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Rate:
          </label>
          <input 
            type="number"
            name="rate"
            className="form-control"
            value={formData.rate}
            onChange={handleInputChange}
            placeholder="Rate"
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Type Rate:
          </label>
          <select 
            name="type_rate"
            className="form-select"
            value={formData.type_rate}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          >
            <option value="">Select Type</option>
            <option value="Hourly">Hourly</option>
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Row 5: Date Started, Date Ended */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Date Started:
          </label>
          <input 
            type="date"
            name="date_started"
            className="form-control"
            value={formData.date_started}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
            Date Ended:
          </label>
          <input 
            type="date"
            name="date_ended"
            className="form-control"
            value={formData.date_ended}
            onChange={handleInputChange}
            style={{ borderRadius: "8px", padding: "10px", fontSize: "14px", width: "100%", maxWidth: "100%" }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="d-flex justify-content-end mt-4">
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          style={{ 
            padding: "10px 40px", 
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}