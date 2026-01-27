import { useState, useEffect } from "react";
import { MdSave, MdSettings } from "react-icons/md";
import Layout from "../../components/layouts/DashboardLayout";
import settingsApi from "../../api/settingsApi";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";

/* HRMS SECTIONS */
import DepartmentsSection from "./sections/Departments/DepartmentsSection";
import ShiftsSection from "./sections/Shifts/ShiftsSection";

/* =========================
   MAIN SETTINGS PAGE
========================= */
export default function SettingsPage() {
  const { role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [activeHRMS, setActiveHRMS] = useState(null);

  /* WAIT FOR AUTH */
  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 60 }}>Loading settings...</div>
      </Layout>
    );
  }

  /* 🚫 EMPLOYEE ACCESS BLOCK */
  if (role === "employee") {
    return (
      <Layout>
        <div style={{ padding: 60, textAlign: "center" }}>
          <h3>Access Restricted</h3>
          <p>You do not have permission to access Settings.</p>
        </div>
      </Layout>
    );
  }

  if (!role) return null;

  /* SETTINGS TABS */
  const tabs = [
    { id: "general", label: "General", roles: ["system_admin"] },
    { id: "access", label: "Access & Permissions", roles: ["system_admin"] },
    { id: "hrms", label: "HRMS", roles: ["system_admin", "hr"] },
    { id: "payroll", label: "Payroll", roles: ["system_admin", "hr"] },
    { id: "aims", label: "AIMS", roles: ["system_admin", "hr"] },
    { id: "security", label: "Security", roles: ["system_admin"] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(role));

  return (
    <Layout>
      <div className="container-fluid px-4">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
          Settings
        </h1>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: 24,
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveHRMS(null);
              }}
              style={{
                background: "none",
                border: "none",
                paddingBottom: 12,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                color: activeTab === tab.id ? "#111827" : "#6b7280",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid #111827"
                    : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= CONTENT ================= */}

        {activeTab === "general" && <GeneralSettings />}

        {activeTab === "access" && (
          <ComingSoon module="Access & Permissions" />
        )}

        {activeTab === "hrms" && (
          <>
            {!activeHRMS && (
              <HRMSSettings onManage={setActiveHRMS} />
            )}

            {activeHRMS === "departments" && <DepartmentsSection />}
            {activeHRMS === "shifts" && <ShiftsSection />}

            {activeHRMS &&
              !["departments", "shifts"].includes(activeHRMS) && (
                <ComingSoon module="HRMS Module" />
              )}
          </>
        )}

        {activeTab === "payroll" && <PayrollSettings />}
        {activeTab === "aims" && <AIMSSettings />}

        {activeTab === "security" && (
          <ComingSoon module="Security" />
        )}
      </div>
    </Layout>
  );
}

/* =========================
   GENERAL SETTINGS
========================= */
function GeneralSettings() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.getGeneral();
      setFormData(prev => ({ ...prev, ...res.data }));
    } catch {
      Swal.fire("Error", "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.saveGeneral(formData);
      Swal.fire("Success", "Settings saved successfully", "success");
    } catch {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 className="mb-4">Company Information</h3>

      <InputField
        label="Company Name"
        value={formData.companyName}
        onChange={e =>
          setFormData({ ...formData, companyName: e.target.value })
        }
      />

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        <MdSave /> {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

/* =========================
   HRMS SETTINGS
========================= */
function HRMSSettings({ onManage }) {
  const items = [
    {
      key: "departments",
      title: "Departments",
      desc: "Manage company departments",
    },
    {
      key: "shifts",
      title: "Shifts",
      desc: "Work schedules and shift rules",
    },
    {
      key: "employment",
      title: "Employment Status",
      desc: "Employment types",
    },
  ];

  return (
    <ModuleSettings
      title="HRMS Settings"
      items={items}
      onManage={onManage}
    />
  );
}

/* =========================
   PAYROLL SETTINGS
========================= */
function PayrollSettings() {
  const items = [
    { title: "Salary Grades", desc: "Manage salary structures" },
    { title: "Deductions", desc: "Tax and deductions" },
    { title: "Allowances", desc: "Employee allowances" },
  ];

  return <ModuleSettings title="Payroll Settings" items={items} />;
}

/* =========================
   AIMS SETTINGS
========================= */
function AIMSSettings() {
  const items = [
    { title: "Categories", desc: "Inventory categories" },
    { title: "Units", desc: "Measurement units" },
    { title: "Suppliers", desc: "Supplier master list" },
  ];

  return <ModuleSettings title="AIMS Settings" items={items} />;
}

/* =========================
   SHARED COMPONENTS
========================= */
function ModuleSettings({ title, items, onManage }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <h3 className="mb-4">{title}</h3>

      <div className="row g-3">
        {items.map(item => (
          <div className="col-md-6" key={item.title}>
            <div className="card h-100">
              <div className="card-body">
                <h5>{item.title}</h5>
                <p className="text-muted">{item.desc}</p>

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onManage?.(item.key)}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="form-control"
      />
    </div>
  );
}

function LoadingSpinner() {
  return <div className="spinner-border text-primary" />;
}

function ComingSoon({ module }) {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <MdSettings size={56} color="#9ca3af" />
      <h3>{module}</h3>
      <p>Configuration options will be available soon.</p>
    </div>
  );
}
