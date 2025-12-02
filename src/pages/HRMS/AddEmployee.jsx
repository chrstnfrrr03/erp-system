import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import EmploymentInfoTab from "./Tabs/EmploymentInfoTab";
import PersonalInfoTab from "./Tabs/PersonalInfoTab";
import AccountInformationTab from "./Tabs/AccountInformationTab";
import LeaveCreditsTab from "./Tabs/LeaveCreditsTab";
import DeminimisTab from "./Tabs/DeminimisTab";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employment");
  
  const [formData, setFormData] = useState({
    // Employment Info
    first_name: "",
    middle_name: "",
    last_name: "",
    department: "",
    position: "",
    department_head: "",
    supervisor: "",
    job_location: "",
    company_email: "",
    employee_type: "",
    employment_status: "",
    rate: "",
    type_rate: "",
    date_started: "",
    date_ended: "",
    
    // Personal Info
    birthdate: "",
    age: "",
    birth_place: "",
    nationality: "",
    civil_status: "",
    religion: "",
    gender: "",
    present_address: "",
    home_address: "",
    same_as_present: false,
    email: "",
    mobile_number: "",
    no_of_dependents: "",
    declaration_of_lodged: "",
    emergency_contact_person: "",
    emergency_contact_number: "",
    
    // Account Information
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
    vacation_leave: "",
    sick_leave: "",
    
    // Deminimis
    rice_subsidy: "",
    clothing_allowance: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    const tabOrder = ["employment", "personal", "account", "leave", "deminimis"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    // Add your submit logic here (API call, etc.)
    alert("Employee Added Successfully!");
    navigate("/hrms");
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
          Add Employee
        </h1>
        <button 
          className="btn btn-danger"
          onClick={() => navigate("/hrms")}
          style={{ fontSize: "clamp(14px, 3vw, 16px)" }}
        >
          ✕
        </button>
      </div>

      <div className="card shadow-sm" style={{ borderRadius: "15px" }}>
        <div className="card-body p-3 p-md-4">
          {/* Tabs */}
          <div className="mb-4" style={{ overflowX: "auto" }}>
            <ul className="nav nav-tabs" style={{ borderBottom: "2px solid #dee2e6", flexWrap: "nowrap" }}>
              <TabButton 
                label="Employment Info" 
                isActive={activeTab === "employment"}
                onClick={() => setActiveTab("employment")}
              />
              <TabButton 
                label="Personal Info" 
                isActive={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
              />
              <TabButton 
                label="Account Information" 
                isActive={activeTab === "account"}
                onClick={() => setActiveTab("account")}
              />
              <TabButton 
                label="Leave Credits" 
                isActive={activeTab === "leave"}
                onClick={() => setActiveTab("leave")}
              />
              <TabButton 
                label="Deminimis" 
                isActive={activeTab === "deminimis"}
                onClick={() => setActiveTab("deminimis")}
              />
            </ul>
          </div>

          {/* Tab Content */}
          <form>
            {activeTab === "employment" && (
              <EmploymentInfoTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
              />
            )}

            {activeTab === "personal" && (
              <PersonalInfoTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
              />
            )}

            {activeTab === "account" && (
              <AccountInformationTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
              />
            )}

            {activeTab === "leave" && (
              <LeaveCreditsTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
              />
            )}

            {activeTab === "deminimis" && (
              <DeminimisTab 
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
              />
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}

// Tab Button Component
function TabButton({ label, isActive, onClick }) {
  return (
    <li className="nav-item" style={{ whiteSpace: "nowrap" }}>
      <button
        type="button"
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={{
          border: "none",
          background: isActive ? "#007bff" : "transparent",
          color: isActive ? "#fff" : "#666",
          fontWeight: isActive ? "600" : "500",
          padding: "12px 15px",
          borderRadius: "8px 8px 0 0",
          cursor: "pointer",
          transition: "all 0.2s",
          fontSize: "clamp(12px, 2.5vw, 14px)"
        }}
      >
        {label}
      </button>
    </li>
  );
}