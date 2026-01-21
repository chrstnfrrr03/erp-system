import { useState, useEffect } from "react";
import {
  MdSave,
  MdSettings,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";
import Layout from "../../components/layouts/DashboardLayout";
import settingsApi from "../../settingsApi";
import Swal from "sweetalert2";

/* =========================
   MAIN SETTINGS PAGE
========================= */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "users", label: "Users & Roles" },
    { id: "preferences", label: "System Preferences" },
    { id: "modules", label: "Modules" },
    { id: "security", label: "Security" },
  ];

  return (
    <Layout>
      <div className="container-fluid px-4">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
          Settings
        </h1>

        {/* TOP TABS */}
        <div
          style={{
            display: "flex",
            gap: 24,
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 24,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* TAB CONTENT */}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "modules" && <ModulesSettings />}
        {activeTab !== "general" && activeTab !== "modules" && (
          <ComingSoon module={tabs.find(t => t.id === activeTab)?.label} />
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
    timezone: "UTC",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get("/general");
      setFormData({
        ...res.data,
        timezone: "UTC",
        currency: "USD",
      });
    } catch {
      Swal.fire("Error", "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.post("/general", formData);
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
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
        Company Information
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InputField label="Company Name" value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
        <InputField label="Company Address" value={formData.companyAddress}
          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} />
        <InputField label="Email" type="email" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <InputField label="Phone" value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

        <SelectField
          label="Timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          options={[
            { value: "UTC", label: "UTC (Universal Time)" },
            { value: "America/New_York", label: "US Eastern Time" },
            { value: "America/Los_Angeles", label: "US Pacific Time" },
          ]}
        />

        <SelectField
          label="Currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          options={[
            { value: "USD", label: "US Dollar (USD)" },
          ]}
        />

        <SelectField
          label="Date Format"
          value={formData.dateFormat}
          onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
          options={[
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
          ]}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <MdSave /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* =========================
   MODULES SETTINGS (MANAGER)
========================= */
function ModulesSettings() {
  const [modules, setModules] = useState([
    { id: "hrms", name: "HRMS", enabled: true },
    { id: "payroll", name: "Payroll", enabled: true },
    { id: "aims", name: "AIMS", enabled: false },
    { id: "moms", name: "MOMS", enabled: false },
  ]);

  const toggleModule = (id) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  const saveModules = async () => {
    try {
      await settingsApi.post("/modules", modules);
      Swal.fire("Success", "Modules updated successfully", "success");
    } catch {
      Swal.fire("Error", "Failed to save modules", "error");
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
        Module Control
      </h3>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Module</th>
            <th style={{ width: 140 }}>Status</th>
            <th style={{ width: 120 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <tr key={module.id}>
              <td>{module.name}</td>
              <td>
                <span className={`badge ${module.enabled ? "bg-success" : "bg-secondary"}`}>
                  {module.enabled ? "Enabled" : "Disabled"}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleModule(module.id)}
                >
                  {module.enabled ? <MdToggleOff /> : <MdToggleOn />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary" onClick={saveModules}>
        <MdSave /> Save Module Settings
      </button>
    </div>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */
function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} className="form-control" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>
      <select value={value} onChange={onChange} className="form-select">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div className="spinner-border text-primary" />
    </div>
  );
}

function ComingSoon({ module }) {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <MdSettings size={56} color="#9ca3af" />
      <h3 style={{ marginTop: 16 }}>{module}</h3>
      <p style={{ color: "#6b7280" }}>
        Configuration options will be available soon.
      </p>
    </div>
  );
}
