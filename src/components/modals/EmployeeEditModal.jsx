import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import api from "../../api";
import Swal from "sweetalert2";

export default function EmployeeEditModal({ show, onHide, employee, onSave }) {
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isNasfundMember, setIsNasfundMember] = useState(false);

  const [formData, setFormData] = useState({
    biometric_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    department_id: "",
    shift_id: "",
    job_location: "",
    department_head: "",
    supervisor: "",
    position: "",
    company_email: "",
    employment_classification: "Regular",
    employee_type: "",
    rate_type: "",
    rate: "",
    date_started: "",
    date_ended: "",
    nasfund_member: "No", 
    nasfund_number: "",
    tin_number: "",
    work_permit_number: "",
    work_permit_expiry: "",
    visa_number: "",
    visa_expiry: "",
    bsb_code: "",
    bank_name: "",
    account_number: "",
    account_name: "",
    profile_picture: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A" || dateString === "null") return "";
    return dateString.split("T")[0];
  };

  // FETCH DEPARTMENTS
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  // FETCH SHIFTS
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await api.get("/shifts");
        setShifts(res.data);
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      }
    };
    fetchShifts();
  }, []);

  useEffect(() => {
    if (employee && shifts.length > 0) {
      setFormData(prev => ({
        ...prev,
        shift_id: employee.shift?.shift_id
          ? String(employee.shift.shift_id)
          : "",
      }));
    }
  }, [employee, shifts]);

  useEffect(() => {
    if (employee) {
      // ✅ AUTO-DETECT: If NASFUND number exists, set member to "Yes"
      const hasNasfundNumber = employee.nasfund_number && employee.nasfund_number.trim() !== "";
      const nasfundMemberStatus = hasNasfundNumber ? "Yes" : (employee.nasfund_member || "No");
      const isMember = nasfundMemberStatus === "Yes";
      
      setIsNasfundMember(isMember);

      setFormData({
        biometric_id: employee.biometric_id || "",
        first_name: employee.first_name || "",
        middle_name: employee.middle_name || "",
        last_name: employee.last_name || "",

        department_id: employee.employment_information?.department_id
          ? String(employee.employment_information.department_id)
          : "",

        shift_id: employee.shift?.shift_id
          ? String(employee.shift.shift_id)
          : "",

        job_location: employee.job_location || "",
        department_head: employee.department_head || "",
        supervisor: employee.supervisor || "",
        position: employee.position || "",
        company_email: employee.company_email || "",

        employment_classification: employee.employment_classification || "Regular",
        employee_type: employee.employee_type || "",
        rate_type: employee.rate_type || "",
        rate: employee.rate || "",

        date_started: formatDate(employee.date_started),
        date_ended: formatDate(employee.date_ended),

        nasfund_member: nasfundMemberStatus, // ✅ AUTO-SET BASED ON NUMBER
        nasfund_number: employee.nasfund_number || "",
        tin_number: employee.tin_number || "",

        work_permit_number: employee.work_permit_number || "",
        work_permit_expiry: formatDate(employee.work_permit_expiry),

        visa_number: employee.visa_number || "",
        visa_expiry: formatDate(employee.visa_expiry),

        bsb_code: employee.bsb_code || "",
        bank_name: employee.bank_name || "",
        account_number: employee.account_number || "",
        account_name: employee.account_name || "",

        profile_picture: null,
      });

      if (employee.profile_picture) {
        const imageUrl = employee.profile_picture.startsWith("http")
          ? employee.profile_picture
          : `${import.meta.env.VITE_API_URL}/storage/${employee.profile_picture}`;

        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [employee]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please select an image file",
        confirmButtonColor: "#d33",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Image must be smaller than 2MB",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setFormData((prev) => ({ ...prev, profile_picture: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle NASFUND member toggle
    if (name === "nasfund_member") {
      setIsNasfundMember(value === "Yes");
      // Clear NASFUND number if changing to "No"
      if (value === "No") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          nasfund_number: "",
        }));
        return;
      }
    }

    // ✅ AUTO-UPDATE: If NASFUND number is entered, auto-set member to "Yes"
    if (name === "nasfund_number") {
      const hasNumber = value && value.trim() !== "";
      if (hasNumber && formData.nasfund_member === "No") {
        setIsNasfundMember(true);
        setFormData((prev) => ({
          ...prev,
          nasfund_member: "Yes",
          nasfund_number: value,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const result = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    // Create a copy of formData and ensure dates are properly formatted
    const dataToSend = {
      ...formData,
      date_started: formData.date_started || null,
      date_ended: formData.date_ended || null,
    };

    console.log("Submitting data:", dataToSend);
    onSave(dataToSend);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header style={{ backgroundColor: "#ffcc00", border: "none", padding: "12px 20px" }}>
        <Modal.Title style={{ fontSize: "18px", fontWeight: "700" }}>Employee Information</Modal.Title>
        <button className="btn-close" onClick={onHide}></button>
      </Modal.Header>

      <Modal.Body style={{ padding: "20px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        <div className="row">
          {/* LEFT COLUMN */}
          <div className="col-md-5" style={{ borderRight: "1px solid #e0e0e0", paddingRight: "20px" }}>
            <div
              className="text-center mb-3"
              style={{
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                position: "relative",
              }}
            >
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="profile-picture-upload" style={{ cursor: "pointer", display: "inline-block" }}>
                <div
                  style={{
                    backgroundColor: "#e0e0e0",
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    overflow: "hidden",
                    border: "2px solid #ddd",
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <FaUserCircle size={70} color="#4aa3df" />
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#0d6efd", marginTop: "5px" }}>Click to upload photo</div>
              </label>
            </div>

            <InputField label="Emp No." name="biometric_id" value={formData.biometric_id} disabled />

            <div className="row g-2">
              <div className="col-4">
                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
              </div>
              <div className="col-4">
                <InputField label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} />
              </div>
              <div className="col-4">
                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <SelectField
                  label="Department:"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  options={departments.map(dept => ({ id: dept.id, name: dept.name }))}
                  isObjectOptions={true}
                />
              </div>

              <div className="col-6">
                <SelectField
                  label="Shift:"
                  name="shift_id"
                  value={formData.shift_id}
                  onChange={handleChange}
                  options={shifts.map(shift => ({
                    id: shift.id,
                    name: `${shift.shift_name} (${shift.start_time} - ${shift.end_time})`
                  }))}
                  isObjectOptions={true}
                />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <InputField
                  label="Job Location:"
                  name="job_location"
                  value={formData.job_location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <InputField
                  label="Department Head:"
                  name="department_head"
                  value={formData.department_head}
                  onChange={handleChange}
                />
              </div>

              <div className="col-6">
                <InputField
                  label="Supervisor:"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <InputField label="Position:" name="position" value={formData.position} onChange={handleChange} />
            <InputField label="Company Email:" name="company_email" value={formData.company_email} onChange={handleChange} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-7" style={{ paddingLeft: "20px" }}>
            <h6 className="fw-bold mb-3" style={{ fontSize: "15px" }}>
              Employee Information
            </h6>

            <div className="row g-2">
              <div className="col-md-6">
                <SelectField
                  label="Employee Classification:"
                  name="employment_classification"
                  value={formData.employment_classification}
                  onChange={handleChange}
                  options={["Probationary", "Regular", "Resigned", "Terminated", "End of Contract", "Retired"]}
                />
              </div>
              <div className="col-md-6">
                <SelectField
                  label="Employee Type:"
                  name="employee_type"
                  value={formData.employee_type}
                  onChange={handleChange}
                  options={["Local", "Expat"]}
                />
              </div>
              <div className="col-md-6">
                <SelectField
                  label="Rate Type:"
                  name="rate_type"
                  value={formData.rate_type}
                  onChange={handleChange}
                  options={["Annual", "Monthly", "Daily", "Hourly"]}
                />
              </div>
              <div className="col-md-6">
                <InputField label="Rate:" name="rate" type="number" value={formData.rate} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <DateField
                  label="Date Started:"
                  name="date_started"
                  value={formData.date_started}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <DateField
                  label="Date Ended:"
                  name="date_ended"
                  value={formData.date_ended}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h6 className="fw-bold mb-3 mt-3" style={{ fontSize: "15px" }}>
              Account Information
            </h6>

            <div className="row g-2">
              <div className="col-md-6">
                <SelectField
                  label="NASFUND Member:"
                  name="nasfund_member"
                  value={formData.nasfund_member}
                  onChange={handleChange}
                  options={["Yes", "No"]}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  label="Nasfund Number:"
                  name="nasfund_number"
                  value={formData.nasfund_number}
                  onChange={handleChange}
                  disabled={!isNasfundMember}
                />
              </div>
              <div className="col-md-12">
                <InputField label="TIN Number:" name="tin_number" value={formData.tin_number} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <InputField
                  label="Work Permit Number:"
                  name="work_permit_number"
                  value={formData.work_permit_number}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <DateField
                  label="Work Permit Expiry:"
                  name="work_permit_expiry"
                  value={formData.work_permit_expiry}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <InputField label="Visa Number:" name="visa_number" value={formData.visa_number} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <DateField
                  label="Visa Expiry:"
                  name="visa_expiry"
                  value={formData.visa_expiry}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h6 className="fw-bold mb-3 mt-3" style={{ fontSize: "15px" }}>
              Bank Information
            </h6>

            <div className="row g-2">
              <div className="col-md-6">
                <InputField label="BSB Code:" name="bsb_code" value={formData.bsb_code} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <InputField label="Bank Name:" name="bank_name" value={formData.bank_name} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <InputField
                  label="Bank Account Number:"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  label="Account Name:"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: "#ffcc00",
          border: "none",
          padding: "12px 20px",
          justifyContent: "flex-end",
        }}
      >
        <button className="btn btn-success px-4 fw-semibold" onClick={handleSubmit}>
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
}

/* INPUT COMPONENTS */
function InputField({ label, name, value, onChange, type = "text", disabled = false }) {
  return (
    <div className="mb-2">
      <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "500", color: "#555" }}>
        {label}
      </label>
      <input
        type={type}
        className="form-control form-control-sm"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{ 
          fontSize: "13px",
          backgroundColor: disabled ? "#e9ecef" : "white",
          cursor: disabled ? "not-allowed" : "text"
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, isObjectOptions = false }) {
  return (
    <div className="mb-2">
      <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "500", color: "#555" }}>
        {label}
      </label>
      <select
        className="form-select form-select-sm"
        name={name}
        value={value}
        onChange={onChange}
        style={{ fontSize: "13px" }}
      >
        <option value="">Select...</option>
        {isObjectOptions
          ? options.map((opt) => (
              <option key={opt.id} value={String(opt.id)}>
                {opt.name}
              </option>
            ))
          : options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
      </select>
    </div>
  );
}

function DateField({ label, name, value, onChange }) {
  return (
    <div className="mb-2">
      <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "500", color: "#555" }}>
        {label}
      </label>
      <input
        type="date"
        className="form-control form-control-sm"
        name={name}
        value={value}
        onChange={onChange}
        style={{ fontSize: "13px" }}
      />
    </div>
  );
}