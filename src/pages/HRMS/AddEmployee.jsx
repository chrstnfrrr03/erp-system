import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";

// Tabs
import EmploymentInfoTab from "./Tabs/EmploymentInfoTab";
import PersonalInfoTab from "./Tabs/PersonalInfoTab";
import AccountInformationTab from "./Tabs/AccountInformationTab";
import LeaveCreditsTab from "./Tabs/LeaveCreditsTab";
import DeminimisTab from "./Tabs/DeminimisTab";

export default function AddEmployee() {
  const navigate = useNavigate();
  const { permissions } = useAuth();

  const [activeTab, setActiveTab] = useState("employment");
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);

  // User Account Creation State
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("employee");

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
    // Employment + Employee (biometric_id removed - now auto-generated)
    first_name: "",
    middle_name: "",
    last_name: "",
    department_id: "",
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
    nasfund: 0,
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
    vacation_total: "",
    sick_year: "",
    sick_total: "",
    emergency_year: "",
    emergency_total: "",
  });

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
  // STEP 1 — EMPLOYMENT + EMPLOYEE (with optional user account)
  // ===========================================================
  const submitEmployment = async () => {
    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        department_id: formData.department_id,
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
      };

      // Add user account data if checkbox is checked
      if (createUserAccount && can(permissions, 'user.create')) {
        payload.create_user_account = true;
        payload.user_email = userEmail;
        payload.user_password = userPassword;
        payload.user_role = userRole;
      }

      const res = await baseApi.post("/api/hrms/employment", payload);

      setEmployeeId(res.data.employee_id);

      // Show success message with login credentials if user was created
      if (res.data.user_created) {
        await Swal.fire({
          icon: "success",
          title: "Employee & User Account Created!",
          html: `
            <p>Employee created successfully!</p>
            <hr>
            <strong>Login Credentials:</strong><br>
            <strong>Email:</strong> ${userEmail}<br>
            <strong>Password:</strong> ${userPassword}<br>
            <strong>Role:</strong> ${userRole}<br>
            <hr>
            <small class="text-warning">⚠️ Please save these credentials securely!</small>
          `,
          confirmButtonColor: "#28a745",
        });
      }

      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Employment Info Failed",
        text:
          err.response?.data?.message ||
          "Failed to save employment information. Please try again.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // STEP 2 — PERSONAL
  // ===========================================================
  const submitPersonal = async () => {
    if (!employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please complete the Employment Info tab first.",
        confirmButtonColor: "#f39c12",
      });
      return false;
    }

    setLoading(true);
    try {
      await baseApi.post("/api/hrms/personal", {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        shift_id: formData.shift_id,
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

      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Personal Info Failed",
        text:
          err.response?.data?.message ||
          "Failed to save personal information. Please try again.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // STEP 3 — ACCOUNT
  // ===========================================================
  const submitAccount = async () => {
    if (!employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please complete the Employment Info tab first.",
        confirmButtonColor: "#f39c12",
      });
      return false;
    }

    setLoading(true);
    try {
      await baseApi.post("/api/hrms/account", {
        employee_id: employeeId,
        nasfund: formData.nasfund || 0,
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

      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Account Info Failed",
        text:
          err.response?.data?.message ||
          "Failed to save account information. Please try again.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // STEP 4 — LEAVE CREDITS
  // ===========================================================
  const submitLeaveCredits = async () => {
    if (!employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please complete the Employment Info tab first.",
        confirmButtonColor: "#f39c12",
      });
      return false;
    }

    setLoading(true);
    try {
      await baseApi.post("/api/hrms/leave-credits", {
        employee_id: employeeId,
        vacation_year: formData.vacation_year,
        vacation_total: formData.vacation_total,
        sick_year: formData.sick_year,
        sick_total: formData.sick_total,
        emergency_year: formData.emergency_year,
        emergency_total: formData.emergency_total,
      });

      return true;
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Leave Credits Failed",
        text:
          err.response?.data?.message ||
          "Failed to save leave credits. Please try again.",
        confirmButtonColor: "#d33",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // STEP 5 — DEMINIMIS
  // ===========================================================
  const submitDeminimis = async (allowances) => {
    if (!employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please complete the Employment Info tab first.",
        confirmButtonColor: "#f39c12",
      });
      return false;
    }

    if (!allowances || allowances.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Allowances",
        text: "Please add at least one allowance or skip this step.",
        confirmButtonColor: "#f39c12",
      });
      return false;
    }

    setLoading(true);
    try {
      await baseApi.post("/api/hrms/deminimis", {
        employee_id: employeeId,
        allowances: allowances,
      });

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Employee has been successfully added to the system.",
        confirmButtonText: "OK",
        confirmButtonColor: "#28a745",
      });

      navigate("/hrms");
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Deminimis Failed",
        text:
          err.response?.data?.message ||
          "Failed to save deminimis benefits. Please try again.",
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
      const ok = await submitEmployment();
      if (ok) setActiveTab("personal");
      return;
    }
    if (activeTab === "personal") {
      const ok = await submitPersonal();
      if (ok) setActiveTab("account");
      return;
    }
    if (activeTab === "account") {
      const ok = await submitAccount();
      if (ok) setActiveTab("leave");
      return;
    }
    if (activeTab === "leave") {
      const ok = await submitLeaveCredits();
      if (ok) setActiveTab("deminimis");
      return;
    }
  };

  // ===========================================================
  // UI RENDER
  // ===========================================================
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold">Add Employee</h2>

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
            <Tab
              label="Employment Info"
              tab="employment"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <Tab
              label="Personal Info"
              tab="personal"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <Tab
              label="Account Info"
              tab="account"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <Tab
              label="Leave Credits"
              tab="leave"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <Tab
              label="Deminimis"
              tab="deminimis"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </ul>

          {/* TAB CONTENT */}
          {activeTab === "employment" && (
            <>
              <EmploymentInfoTab
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
                loading={loading}
                shifts={shifts}
              />

              {/* ✅ USER ACCOUNT CREATION SECTION - Only for system_admin */}
              {can(permissions, "user.create") && (
                <div className="mt-4 p-4 border rounded bg-light">
                  <h5 className="mb-3">
                    <strong>Create User Login Account (Optional)</strong>
                  </h5>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="createUserAccount"
                      checked={createUserAccount}
                      onChange={(e) => setCreateUserAccount(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="createUserAccount"
                    >
                      <strong>
                        Create a login account for this employee
                      </strong>
                    </label>
                  </div>

                  {createUserAccount && (
                    <>
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">
                            Login Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                            placeholder="employee@erp.test"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">
                            Password <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required
                            placeholder="Minimum 8 characters"
                            minLength={8}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">
                            User Role <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={userRole}
                            onChange={(e) => setUserRole(e.target.value)}
                            required
                          >
                            <option value="employee">Employee</option>
                            <option value="dept_head">Department Head</option>
                            <option value="hr">HR</option>
                            <option value="system_admin">System Admin</option>
                          </select>
                        </div>
                      </div>

                      <div className="alert alert-warning mb-0">
                        <small>
                          <strong>⚠️ Warning:</strong> This will create a login
                          account with <strong>{userRole}</strong> permissions.
                          Only create accounts for users who need system access.
                        </small>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
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
              setFormData={setFormData}
              handleSubmit={submitDeminimis}
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
        className={`nav-link ${
          activeTab === tab ? "active fw-semibold" : ""
        }`}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
    </li>
  );
}