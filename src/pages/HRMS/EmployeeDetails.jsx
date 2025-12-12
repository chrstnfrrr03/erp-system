import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Layout from "../../components/layouts/DashboardLayout";
import EmployeeEditModal from "../../components/modals/EmployeeEditModal";
import PersonalInfoEditModal from "../../components/modals/PersonalInfoEditModal";

// Icons
import { FaUserCircle } from "react-icons/fa";
import {
  MdBusiness,
  MdPerson,
  MdGroup,
  MdLocationOn,
  MdEmail,
  MdPhone,
} from "react-icons/md";

export default function EmployeeDetails() {
  const { biometric_id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("employment");
  const [benefitsTab, setBenefitsTab] = useState("leave");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [biometric_id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/employee/${biometric_id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEmployee = async (formData) => {
    try {
      await api.post(
        `/employee/${biometric_id}/update-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await fetchEmployeeDetails();
      setShowEditModal(false);
      alert("Employee information updated successfully!");
    } catch (err) {
      console.error("Failed to update employee:", err);
      alert("Failed to update employee information");
    }
  };

  const handleSavePersonalInfo = async (formData) => {
  try {
    const personalInfoId = employee?.personal_info?.id;

    if (!personalInfoId) {
      console.error("personalInfoId is missing:", employee);
      alert("Cannot update personal info — ID missing.");
      return;
    }

    
    await api.put(`/personal/${personalInfoId}`, formData);

    await fetchEmployeeDetails();
    setShowPersonalModal(false);

    alert("Personal information updated successfully!");
  } catch (err) {
    console.error("Failed to update personal info:", err);
    alert("Failed to update personal information");
  }
};



  const handleExportCV = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/hrms/employee/${biometric_id}/export-cv`,
      "_blank"
    );
  };

  if (!employee) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "20px" }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">List of Employees</h3>

          <div className="d-flex align-items-center gap-2">
            <button className="btn-close" onClick={() => navigate("/hrms/employee-overview")}></button>
          </div>
        </div>

        {/* Main Tabs */}
        <ul className="nav nav-tabs mb-4">
          <TabButton label="Employment Info" active={activeTab === "employment"} onClick={() => setActiveTab("employment")} />
          <TabButton label="Personal Info" active={activeTab === "personal"} onClick={() => setActiveTab("personal")} />
          <TabButton label="Attendance" active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} />
          <TabButton label="Application Forms" active={activeTab === "applications"} onClick={() => setActiveTab("applications")} />
          <TabButton label="Payslips" active={activeTab === "payslips"} onClick={() => setActiveTab("payslips")} />
        </ul>

        {/* Employment Info */}
        {activeTab === "employment" && (
          <div className="row g-4">
            
            {/* EXPORT BUTTON */}
            <div className="col-12 d-flex justify-content-end mb-2">
              <button
                className="btn btn-primary px-4 py-2"
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
                onClick={handleExportCV}
              >
                Export CV
              </button>
            </div>

            {/* LEFT COLUMN */}
            <div className="col-lg-5">
              <div
                className="card mb-4"
                style={{
                  borderRadius: "12px",
                  borderTop: "3px solid #ffe680",
                  backgroundColor: "white",
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
                      margin: "0 auto",
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

                  <h3 className="mt-4 mb-2">{employee.fullname}</h3>
                  <p className="text-muted" style={{ fontSize: "14px" }}>
                    {employee.biometric_id}
                  </p>
                </div>
              </div>

              <div
                className="card"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#0d6efd",
                    padding: "12px 20px",
                  }}
                >
                  <h5 className="mb-0 fw-bold text-white">Details</h5>
                </div>

                <div className="card-body p-4">
                  <DetailItem icon={<MdBusiness size={18} color="#0d6efd" />} label="Department" value={employee.department} />
                  <DetailItem icon={<MdPerson size={18} color="#0d6efd" />} label="Department Head" value={employee.department_head} />
                  <DetailItem icon={<MdGroup size={18} color="#0d6efd" />} label="Immediate Supervisor" value={employee.supervisor} />
                  <DetailItem icon={<MdLocationOn size={18} color="#0d6efd" />} label="Job Location" value={employee.job_location} />
                  <DetailItem icon={<MdEmail size={18} color="#0d6efd" />} label="Company Email" value={employee.company_email} />
                  <DetailItem icon={<MdPhone size={18} color="#0d6efd" />} label="Contact Number" value={employee.mobile_number} />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="col-lg-7">
              <div
                className="card mb-4"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                  borderTop: "3px solid #ffe680",
                }}
              >
                <div className="card-body p-4">

                  {/* Employment Information */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Employment Information</h5>
                    <button 
                      className="btn btn-warning btn-sm px-3" 
                      style={{ color: "white" }}
                      onClick={() => setShowEditModal(true)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="row g-3 mb-4">
                    <InfoField label="Employment Status:" value={employee.employment_classification || "N/A"} />
                    <InfoField label="Salary Type:" value={employee.rate_type} />
                    <InfoField label="Rate:" value={`PGK ${employee.rate}`} />
                    <InfoField label="Date Started:" value={employee.date_started} />
                    <InfoField label="Date Ended:" value={employee.date_ended} />
                  </div>

                  <hr />

                  {/* Account Information (NO EDIT BUTTON) */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Account Information</h5>
                  </div>

                  <div className="row g-3 mb-4">
                    <InfoField label="Nasfund Number:" value={employee.nasfund_number || "N/A"} />
                    <InfoField label="TIN Number:" value={employee.tin_number || "N/A"} />
                    <InfoField label="Work Permit Number:" value={employee.work_permit_number || "N/A"} />
                    <InfoField label="Work Permit Expiry Date:" value={employee.work_permit_expiry || "0000-00-00"} />
                    <InfoField label="Visa Number:" value={employee.visa_number || "N/A"} />
                    <InfoField label="Visa Expiry Date:" value={employee.visa_expiry || "0000-00-00"} />
                  </div>

                  <hr />

                  {/* Bank Information (NO EDIT BUTTON) */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Bank Information</h5>
                  </div>

                  <div className="row g-3">
                    <InfoField label="Account Number:" value={employee.account_number || "N/A"} />
                    <InfoField label="Bank Name:" value={employee.bank_name || "N/A"} />
                    <InfoField label="Account Name:" value={employee.account_name || "N/A"} />
                    <InfoField label="Branch:" value={employee.bsb_code || "N/A"} />
                  </div>

                </div>
              </div>

              {/* Benefits */}
              <div
                className="card"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "white",
                  borderTop: "3px solid #ffe680",
                }}
              >
                <div className="card-body p-4">
                  <h5 className="mb-4 fw-bold">Benefits Information</h5>

                  {/* Sub Tabs */}
                  <div className="d-flex mb-4">
                    <BenefitsTabButton label="Leave Credits" active={benefitsTab === "leave"} onClick={() => setBenefitsTab("leave")} />
                    <BenefitsTabButton label="Deminimis" active={benefitsTab === "deminimis"} onClick={() => setBenefitsTab("deminimis")} />
                  </div>

                  {/* Leave Credits */}
                  {benefitsTab === "leave" && (
                    <>
                      <div className="d-flex justify-content-end mb-3">
                        <button className="btn btn-success btn-sm px-4">Add Credit</button>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered bg-white">
                          <thead className="bg-light">
                            <tr>
                              <th>Leave Type</th>
                              <th>Year</th>
                              <th>Total Credits</th>
                              <th>Used</th>
                              <th>Remaining</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Vacation Leave</td>
                              <td>{employee.vacation_year || "2025"}</td>
                              <td>{employee.vacation_credits || 5}</td>
                              <td>0</td>
                              <td>{employee.vacation_credits || 5}</td>
                              <td>
                                <button className="btn btn-sm btn-warning me-2 px-3" style={{ color: "white" }}>Edit</button>
                                <button className="btn btn-sm btn-danger px-3">Delete</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Deminimis */}
                  {benefitsTab === "deminimis" && (
                    <div className="row g-3">
                      <InfoField label="Clothing Allowance:" value={`${employee.clothing_allowance || "0.00"} USD`} />
                      <InfoField label="Meal Allowance:" value={`${employee.meal_allowance || "0.00"} USD`} />
                      <InfoField label="Rice Subsidy:" value={`${employee.rice_subsidy || "0.00"} USD`} />
                      <InfoField label="Transportation Allowance:" value={`${employee.transportation_allowance || "0.00"} USD`} />
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="card" style={{ borderRadius: "12px", backgroundColor: "white", borderTop: "3px solid #ffe680" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Personal Information</h5>
                <button 
                  className="btn btn-warning btn-sm px-3" 
                  style={{ color: "white" }}
                  onClick={() => setShowPersonalModal(true)}
                >
                  Edit
                </button>
              </div>
              
              <div className="row g-3 mb-4">
                <InfoField label="Birthdate:" value={employee.birthdate || "N/A"} />
                <InfoField label="Age:" value={employee.age || "N/A"} />
                <InfoField label="Birth Place:" value={employee.birthplace || "N/A"} />
                <InfoField label="Nationality:" value={employee.nationality || "N/A"} />
                <InfoField label="Civil Status:" value={employee.civil_status || "N/A"} />
                <InfoField label="Religion:" value={employee.religion || "N/A"} />
                <InfoField label="Gender:" value={employee.gender || "N/A"} />
                <InfoField label="Email:" value={employee.email_address || "N/A"} />
                <InfoField label="Mobile:" value={employee.mobile_number || "N/A"} />
                <InfoField label="Dependents:" value={employee.dependents || "0"} />
                <InfoField label="Lodged:" value={employee.lodged || "N/A"} />
              </div>

              <h6 className="fw-bold mb-3">Address Information</h6>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="text-muted" style={{ fontSize: "13px" }}>Present Address:</div>
                  <div style={{ fontSize: "14px" }}>{employee.present_address || "N/A"}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted" style={{ fontSize: "13px" }}>Home Address:</div>
                  <div style={{ fontSize: "14px" }}>{employee.home_address || "N/A"}</div>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Emergency Contact</h6>
              <div className="row g-3">
                <InfoField label="Contact Person:" value={employee.emergency_contact || "N/A"} />
                <InfoField label="Contact Number:" value={employee.emergency_number || "N/A"} />
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "attendance" && <PlaceholderTab title="Attendance" />}
        {activeTab === "applications" && <PlaceholderTab title="Application Forms" />}
        {activeTab === "payslips" && <PlaceholderTab title="Payslips" />}

      </div>

      {/* Edit Modals */}
      <EmployeeEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        employee={employee}
        onSave={handleSaveEmployee}
      />

      <PersonalInfoEditModal
        show={showPersonalModal}
        onHide={() => setShowPersonalModal(false)}
        employee={employee}
        onSave={handleSavePersonalInfo}
      />
    </Layout>
  );
}

/* ------------------------ COMPONENTS ------------------------ */

function TabButton({ label, active, onClick }) {
  return (
    <li className="nav-item">
      <button
        className="nav-link"
        onClick={onClick}
        style={{
          backgroundColor: "#ffffff",
          color: active ? "#0d6efd" : "#6c757d",
          border: "none",
          borderBottom: active ? "3px solid #0d6efd" : "3px solid transparent",
          padding: "12px 24px",
          fontWeight: active ? "600" : "500",
          borderRadius: 0,
        }}
      >
        {label}
      </button>
    </li>
  );
}

function BenefitsTabButton({ label, active, onClick }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        color: active ? "#0d6efd" : "#6c757d",
        borderBottom: active ? "3px solid #0d6efd" : "none",
        borderRadius: 0,
        padding: "10px 20px",
        fontWeight: active ? "600" : "normal",
      }}
    >
      {label}
    </button>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="col-6 mb-3">
      <div className="text-muted" style={{ fontSize: "13px" }}>{label}</div>
      <div style={{ fontSize: "14px" }}>{value}</div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="mb-3 pb-3 border-bottom">
      <div className="d-flex align-items-center mb-2">
        <span className="me-2">{icon}</span>
        <span className="text-muted" style={{ fontSize: "13px" }}>{label}</span>
      </div>
      <div style={{ fontSize: "14px", paddingLeft: "28px" }}>{value || "N/A"}</div>
    </div>
  );
}

function PlaceholderTab({ title }) {
  return (
    <div
      className="card"
      style={{
        borderRadius: "12px",
        backgroundColor: "white",
        borderTop: "3px solid #ffe680",
      }}
    >
      <div className="card-body text-center py-5">
        <h4>{title} Coming Soon...</h4>
      </div>
    </div>
  );
}