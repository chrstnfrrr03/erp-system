import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

// Tabs
import EmploymentInfoTab from "./Tabs/EmploymentInfoTab";
import PersonalInfoTab from "./Tabs/PersonalInfoTab";
import AccountInformationTab from "./Tabs/AccountInformationTab";
import LeaveCreditsTab from "./Tabs/LeaveCreditsTab";
import DeminimisTab from "./Tabs/DeminimisTab";

export default function EditEmployee() {
  const navigate = useNavigate();
  const { biometric_id } = useParams();

  const [activeTab, setActiveTab] = useState("employment");
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // ===========================================================
  // LOAD ALL SHIFTS
  // ===========================================================
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const res = await baseApi.get("/api/hrms/shifts");
        setShifts(res.data);
      } catch (err) {
        console.error("Failed to load shifts:", err);
      }
    };
    loadShifts();
  }, []);

  // ===========================================================
  // FORM DATA
  // ===========================================================
  const [formData, setFormData] = useState({
    // Employment + Employee
    first_name: "",
    middle_name: "",
    last_name: "",
    department: "",
    position: "",
    department_head: "",
    supervisor: "",
    job_location: "",
    employee_type: "",
    employment_status: "",
    employment_classification: "",
    company_email: "",
    rate: "",
    rate_type: "",
    date_started: "",
    date_ended: "",
    shift_id: "",

    // Personal
    birthdate: "",
    age: "",
    birthplace: "",
    nationality: "",
    civil_status: "",
    religion: "",
    gender: "",
    present_address: "",
    home_address: "",
    same_as_present: false,
    email_address: "",
    mobile_number: "",
    dependents: "",
    lodged: "",
    emergency_contact: "",
    emergency_number: "",

    // Account
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

    // Leave Credits
    vacation_year: "",
    vacation_credits: "",
    sick_year: "",
    sick_credits: "",
    emergency_year: "",
    emergency_credits: "",

    // Deminimis
    clothing_allowance: "",
    meal_allowance: "",
    rice_subsidy: "",
    transportation_allowance: "",
  });

  // ===========================================================
  // LOAD EMPLOYEE DATA
  // ===========================================================
  useEffect(() => {
    if (biometric_id) {
      fetchEmployeeData();
    }
  }, [biometric_id]);

  const fetchEmployeeData = async () => {
    setLoadingData(true);
    try {
      const res = await baseApi.get(`/api/hrms/employee/${biometric_id}`); 
      const emp = res.data;

      // Pre-fill form data
      setFormData({
        // Employment
        first_name: emp.fullname?.split(' ')[0] || "",
        middle_name: emp.fullname?.split(' ')[1] || "",
        last_name: emp.fullname?.split(' ').slice(2).join(' ') || "",
        department: emp.department || "",
        position: emp.position || "",
        department_head: emp.department_head || "",
        supervisor: emp.supervisor || "",
        job_location: emp.job_location || "",
        employee_type: emp.employee_type || "",
        employment_status: emp.employment_status || "",
        employment_classification: emp.employment_classification || "",
        company_email: emp.company_email || "",
        rate: emp.rate || "",
        rate_type: emp.rate_type || "",
        date_started: emp.date_started || "",
        date_ended: emp.date_ended || "",
        shift_id: emp.shift_id || "",

        // Personal
        birthdate: emp.birthdate || "",
        age: emp.age || "",
        birthplace: emp.birthplace || "",
        nationality: emp.nationality || "",
        civil_status: emp.civil_status || "",
        religion: emp.religion || "",
        gender: emp.gender || "",
        present_address: emp.present_address || "",
        home_address: emp.home_address || "",
        same_as_present: false,
        email_address: emp.email_address || "",
        mobile_number: emp.mobile_number || "",
        dependents: emp.dependents || "",
        lodged: emp.lodged || "",
        emergency_contact: emp.emergency_contact || "",
        emergency_number: emp.emergency_number || "",

        // Account
        nasfund_number: emp.nasfund_number || "",
        tin_number: emp.tin_number || "",
        work_permit_number: emp.work_permit_number || "",
        work_permit_expiry: emp.work_permit_expiry || "",
        visa_number: emp.visa_number || "",
        visa_expiry: emp.visa_expiry || "",
        bsb_code: emp.bsb_code || "",
        bank_name: emp.bank_name || "",
        account_number: emp.account_number || "",
        account_name: emp.account_name || "",

        // Leave Credits
        vacation_year: emp.vacation_year || "",
        vacation_credits: emp.vacation_credits || "",
        sick_year: emp.sick_year || "",
        sick_credits: emp.sick_credits || "",
        emergency_year: emp.emergency_year || "",
        emergency_credits: emp.emergency_credits || "",

        // Deminimis
        clothing_allowance: emp.clothing_allowance || "",
        meal_allowance: emp.meal_allowance || "",
        rice_subsidy: emp.rice_subsidy || "",
        transportation_allowance: emp.transportation_allowance || "",
      });

      // Store employee_id for updates
      setEmployeeId(emp.employee_id);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Employee",
        text: "Could not load employee data. Please try again.",
        confirmButtonColor: "#d33",
      });
      navigate("/hrms");
    } finally {
      setLoadingData(false);
    }
  };

  // ===========================================================
  // INPUT HANDLER
  // ===========================================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===========================================================
  // UPDATE METHODS (using PUT/PATCH)
  // ===========================================================
  const updateEmployment = async () => {
    setLoading(true);
    try {
      await baseApi.put(`/api/hrms/employment/${employeeId}`, { 
        department: formData.department,
        position: formData.position,
        department_head: formData.department_head,
        supervisor: formData.supervisor,
        job_location: formData.job_location,
        employee_type: formData.employee_type,
        employment_status: formData.employment_status,
        employment_classification: formData.employment_classification,
        company_email: formData.company_email,
        rate: formData.rate,
        rate_type: formData.rate_type,
        date_started: formData.date_started,
        date_ended: formData.date_ended,
        shift_id: formData.shift_id,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Employment information updated successfully.",
        confirmButtonColor: "#28a745",
        timer: 2000,
      });
      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update employment information.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonal = async () => {
    setLoading(true);
    try {
      await baseApi.put(`/api/hrms/personal/${employeeId}`, { 
        birthdate: formData.birthdate,
        age: formData.age,
        birthplace: formData.birthplace,
        nationality: formData.nationality,
        civil_status: formData.civil_status,
        religion: formData.religion,
        gender: formData.gender,
        present_address: formData.present_address,
        home_address: formData.home_address,
        email_address: formData.email_address,
        mobile_number: formData.mobile_number,
        dependents: formData.dependents,
        lodged: formData.lodged,
        emergency_contact: formData.emergency_contact,
        emergency_number: formData.emergency_number,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Personal information updated successfully.",
        confirmButtonColor: "#28a745",
        timer: 2000,
      });
      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update personal information.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async () => {
    setLoading(true);
    try {
      await baseApi.put(`/api/hrms/account/${employeeId}`, {
        nasfund_number: formData.nasfund_number,
        tin_number: formData.tin_number,
        work_permit_number: formData.work_permit_number,
        work_permit_expiry: formData.work_permit_expiry,
        visa_number: formData.visa_number,
        visa_expiry: formData.visa_expiry,
        bsb_code: formData.bsb_code,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_name: formData.account_name,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Account information updated successfully.",
        confirmButtonColor: "#28a745",
        timer: 2000,
      });
      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update account information.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveCredits = async () => {
    setLoading(true);
    try {
      await baseApi.put(`/api/hrms/leave-credits/${employeeId}`, { 
        vacation_year: formData.vacation_year,
        vacation_credits: formData.vacation_credits,
        sick_year: formData.sick_year,
        sick_credits: formData.sick_credits,
        emergency_year: formData.emergency_year,
        emergency_credits: formData.emergency_credits,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Leave credits updated successfully.",
        confirmButtonColor: "#28a745",
        timer: 2000,
      });
      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update leave credits.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDeminimis = async () => {
    setLoading(true);
    try {
      await baseApi.put(`/api/hrms/deminimis/${employeeId}`, { 
        clothing_allowance: formData.clothing_allowance,
        meal_allowance: formData.meal_allowance,
        rice_subsidy: formData.rice_subsidy,
        transportation_allowance: formData.transportation_allowance,
      });

      await Swal.fire({
        icon: "success",
        title: "All Changes Saved!",
        text: "Employee information has been successfully updated.",
        confirmButtonText: "OK",
        confirmButtonColor: "#28a745",
      });
      
      navigate("/hrms");
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update deminimis benefits.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // NEXT BUTTON HANDLER
  // ===========================================================
  const handleNext = async () => {
    if (activeTab === "employment") {
      const ok = await updateEmployment();
      if (ok) setActiveTab("personal");
      return;
    }
    if (activeTab === "personal") {
      const ok = await updatePersonal();
      if (ok) setActiveTab("account");
      return;
    }
    if (activeTab === "account") {
      const ok = await updateAccount();
      if (ok) setActiveTab("leave");
      return;
    }
    if (activeTab === "leave") {
      const ok = await updateLeaveCredits();
      if (ok) setActiveTab("deminimis");
      return;
    }
  };

  // ===========================================================
  // UI RENDER
  // ===========================================================
  if (loadingData) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading employee data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold">Edit Employee</h2>

        <button
          className="btn btn-outline-danger px-4"
          onClick={() => navigate("/hrms")}
        >
          Close
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">

          {/* TABS */}
          <ul className="nav nav-tabs mb-4">
            <Tab label="Employment Info" tab="employment" activeTab={activeTab} setActiveTab={setActiveTab} />
            <Tab label="Personal Info" tab="personal" activeTab={activeTab} setActiveTab={setActiveTab} />
            <Tab label="Account Info" tab="account" activeTab={activeTab} setActiveTab={setActiveTab} />
            <Tab label="Leave Credits" tab="leave" activeTab={activeTab} setActiveTab={setActiveTab} />
            <Tab label="Deminimis" tab="deminimis" activeTab={activeTab} setActiveTab={setActiveTab} />
          </ul>

          {/* TAB CONTENT */}
          {activeTab === "employment" && (
            <EmploymentInfoTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleNext={handleNext}
              loading={loading}
              shifts={shifts}
            />
          )}

          {activeTab === "personal" && (
            <PersonalInfoTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleNext={handleNext}
              loading={loading}
            />
          )}

          {activeTab === "account" && (
            <AccountInformationTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleNext={handleNext}
              loading={loading}
            />
          )}

          {activeTab === "leave" && (
            <LeaveCreditsTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleNext={handleNext}
              loading={loading}
            />
          )}

          {activeTab === "deminimis" && (
            <DeminimisTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={updateDeminimis}
              loading={loading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

// ===========================================================
// TAB BUTTON COMPONENT
// ===========================================================
function Tab({ label, tab, activeTab, setActiveTab }) {
  return (
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === tab ? "active fw-semibold" : ""}`}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
    </li>
  );
}