import { useState, useEffect } from "react";
import { MdSave, MdSettings, MdArrowBack, MdEdit, MdDelete, MdPersonAdd, MdLock } from "react-icons/md";
import Layout from "../../components/layouts/DashboardLayout";
import settingsApi from "../../api/settingsApi";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import { Modal, Button, Form } from "react-bootstrap";

/* HRMS SECTIONS */
import DepartmentsSection from "./sections/Departments/DepartmentsSection";
import ShiftsSection from "./sections/Shifts/ShiftsSection";

/* AUDIT TRAIL */
import AuditTrailSection from "./sections/AuditTrail/AuditTrailSection";

/* =========================
   MAIN SETTINGS PAGE
========================= */
export default function SettingsPage() {
  const { role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [activeModule, setActiveModule] = useState(null);
  const [activeHRMS, setActiveHRMS] = useState(null);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 60 }}>Loading settings...</div>
      </Layout>
    );
  }

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

  const tabs = [
    { id: "general", label: "General", roles: ["system_admin"] },
    { id: "users", label: "Users & Roles", roles: ["system_admin"] },
    { id: "modules", label: "Modules", roles: ["system_admin", "hr"] },
    { id: "security", label: "Security", roles: ["system_admin"] },
    { id: "audit", label: "Audit Trail", roles: ["system_admin", "hr"] },
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
                setActiveModule(null);
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

        {activeTab === "modules" && (activeModule || activeHRMS) && (
          <button
            onClick={() => {
              if (activeHRMS) setActiveHRMS(null);
              else setActiveModule(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <MdArrowBack size={18} /> Back
          </button>
        )}

        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "users" && <UsersAndRoles />}
        {activeTab === "modules" && (
          <>
            {!activeModule && <ModulesChooser onSelect={setActiveModule} />}

            {activeModule === "hrms" && (
              <>
                {!activeHRMS && <HRMSSettings onManage={setActiveHRMS} />}
                {activeHRMS === "departments" && <DepartmentsSection />}
                {activeHRMS === "shifts" && <ShiftsSection />}
                {activeHRMS &&
                  !["departments", "shifts"].includes(activeHRMS) && (
                    <ComingSoon module="HRMS Module" />
                  )}
              </>
            )}

            {activeModule === "payroll" && <PayrollSettings />}
            {activeModule === "aims" && <AIMSSettings />}
            {activeModule === "moms" && <ComingSoon module="MOMS" />}
            {activeModule === "crm" && <ComingSoon module="CRM" />}
            {activeModule === "accounting" && (
              <ComingSoon module="Accounting" />
            )}
          </>
        )}

        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "audit" && <AuditTrailSection />}
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
    country: "Papua New Guinea",
    timezone: "Pacific/Port_Moresby",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    language: "en",
    theme: "light",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "PGK", label: "PGK - Papua New Guinea Kina" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "NZD", label: "NZD - New Zealand Dollar" },
    { value: "SGD", label: "SGD - Singapore Dollar" },
    { value: "PHP", label: "PHP - Philippine Peso" },
    { value: "IDR", label: "IDR - Indonesian Rupiah" },
  ];

  const dateFormats = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY (31-12-2024)" },
    { value: "MM-DD-YYYY", label: "MM-DD-YYYY (12-31-2024)" },
    { value: "DD.MM.YYYY", label: "DD.MM.YYYY (31.12.2024)" },
  ];

  const timezones = [
    { value: "Pacific/Port_Moresby", label: "(UTC+10:00) Port Moresby" },
    { value: "Australia/Sydney", label: "(UTC+11:00) Sydney" },
    { value: "Australia/Melbourne", label: "(UTC+11:00) Melbourne" },
    { value: "Australia/Brisbane", label: "(UTC+10:00) Brisbane" },
    { value: "Australia/Perth", label: "(UTC+08:00) Perth" },
    { value: "Pacific/Auckland", label: "(UTC+13:00) Auckland" },
    { value: "Asia/Manila", label: "(UTC+08:00) Manila" },
    { value: "Asia/Singapore", label: "(UTC+08:00) Singapore" },
    { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo" },
    { value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong" },
    { value: "Asia/Shanghai", label: "(UTC+08:00) Shanghai" },
    { value: "Asia/Jakarta", label: "(UTC+07:00) Jakarta" },
    { value: "America/New_York", label: "(UTC-05:00) New York" },
    { value: "America/Chicago", label: "(UTC-06:00) Chicago" },
    { value: "America/Denver", label: "(UTC-07:00) Denver" },
    { value: "America/Los_Angeles", label: "(UTC-08:00) Los Angeles" },
    { value: "Europe/London", label: "(UTC+00:00) London" },
    { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
    { value: "Europe/Berlin", label: "(UTC+01:00) Berlin" },
    { value: "UTC", label: "(UTC+00:00) UTC" },
  ];

  const languages = [
    { value: "en", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "tpi", label: "Tok Pisin" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
  ];

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "auto", label: "Auto (System)" },
  ];

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
    <div>
      {/* COMPANY INFORMATION SECTION */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Company Information
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Company Name:</label>
              <input 
                type="text"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Email:</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Phone:</label>
              <input 
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Country:</label>
              <input 
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Company Address:</label>
              <textarea 
                value={formData.companyAddress}
                onChange={e => setFormData({ ...formData, companyAddress: e.target.value })}
                className="form-control"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* REGIONAL & FORMAT SETTINGS SECTION */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Regional & Format Settings
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Timezone:</label>
              <select 
                value={formData.timezone} 
                onChange={e => setFormData({ ...formData, timezone: e.target.value })} 
                className="form-select"
              >
                {timezones.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Currency:</label>
              <select 
                value={formData.currency} 
                onChange={e => setFormData({ ...formData, currency: e.target.value })} 
                className="form-select"
              >
                {currencies.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Date Format:</label>
              <select 
                value={formData.dateFormat} 
                onChange={e => setFormData({ ...formData, dateFormat: e.target.value })} 
                className="form-select"
              >
                {dateFormats.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Language:</label>
              <select 
                value={formData.language} 
                onChange={e => setFormData({ ...formData, language: e.target.value })} 
                className="form-select"
              >
                {languages.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* APPEARANCE SECTION */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Appearance
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>Theme Mode:</label>
              <select 
                value={formData.theme} 
                onChange={e => setFormData({ ...formData, theme: e.target.value })} 
                className="form-select"
              >
                {themes.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-outline-secondary">
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <MdSave className="me-2" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* =========================
   USERS & ROLES - NEW SECTION
========================= */
function UsersAndRoles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: "",
    is_active: true,
  });
  const [newPassword, setNewPassword] = useState("");

  const roles = [
    { value: "system_admin", label: "System Admin" },
    { value: "hr", label: "HR" },
    { value: "dept_head", label: "Department Head" },
    { value: "employee", label: "Employee" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await baseApi.get("/api/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      is_active: user.is_active !== false,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await baseApi.put(`/api/users/${selectedUser.id}`, editFormData);
      Swal.fire("Success", "User updated successfully", "success");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Failed to update user", "error");
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      Swal.fire("Error", "Password must be at least 8 characters", "error");
      return;
    }

    try {
      await baseApi.post(`/api/users/${selectedUser.id}/reset-password`, {
        new_password: newPassword,
      });
      Swal.fire("Success", "Password reset successfully", "success");
      setShowResetPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      Swal.fire("Error", "Failed to reset password", "error");
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await baseApi.delete(`/api/users/${user.id}`);
        Swal.fire("Deleted", "User has been deleted", "success");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ["Name", "Email", "Role", "Status", "Created Date"];
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      roles.find(r => r.value === user.role)?.label || user.role,
      user.is_active !== false ? 'Active' : 'Inactive',
      new Date(user.created_at).toLocaleDateString()
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Export Successful",
      text: `Exported ${filteredUsers.length} users to CSV`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header with Search and Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-outline-primary"
                onClick={handleExportCSV}
              >
                <MdPersonAdd className="me-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th style={{ padding: "16px", fontWeight: 600 }}>Username</th>
                  <th style={{ padding: "16px", fontWeight: 600 }}>Email</th>
                  <th style={{ padding: "16px", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: "16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "16px", fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: "16px" }}>{user.name}</td>
                      <td style={{ padding: "16px" }}>{user.email}</td>
                      <td style={{ padding: "16px" }}>
                        <span className="badge bg-primary">
                          {roles.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span 
                          className={`badge ${user.is_active !== false ? 'bg-success' : 'bg-secondary'}`}
                        >
                          {user.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditUser(user)}
                            title="Edit Role"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleResetPassword(user)}
                            title="Reset Password"
                          >
                            <MdLock size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User - {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password - {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleResetPasswordSubmit}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/* =========================
   SECURITY SETTINGS - IMPROVED
========================= */
function SecuritySettings() {
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginAttempts, setLoginAttempts] = useState(5);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.saveSecurity({
        sessionTimeout,
        loginAttempts,
        twoFactorEnabled,
        passwordExpiry,
        auditEnabled,
      });
      Swal.fire("Success", "Security settings saved successfully", "success");
    } catch {
      Swal.fire("Error", "Failed to save security settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Session Management */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Session Management
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>
                Session Timeout (minutes):
              </label>
              <input
                type="number"
                className="form-control"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                min="5"
                max="1440"
              />
              <small className="text-muted">
                Users will be logged out after this period of inactivity
              </small>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>
                Max Login Attempts:
              </label>
              <input
                type="number"
                className="form-control"
                value={loginAttempts}
                onChange={(e) => setLoginAttempts(e.target.value)}
                min="3"
                max="10"
              />
              <small className="text-muted">
                Account will be locked after this many failed attempts
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Password Policy
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label mb-1" style={{ fontSize: 14 }}>
                Password Expiry (days):
              </label>
              <input
                type="number"
                className="form-control"
                value={passwordExpiry}
                onChange={(e) => setPasswordExpiry(e.target.value)}
                min="0"
              />
              <small className="text-muted">
                Set to 0 to disable password expiration
              </small>
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requireStrongPassword"
                  defaultChecked
                  disabled
                />
                <label className="form-check-label" htmlFor="requireStrongPassword">
                  Require strong passwords (min 8 characters)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Authentication
          </h5>
          
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="twoFactorSwitch"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="twoFactorSwitch">
              Enable Two-Factor Authentication (2FA)
            </label>
          </div>
          <small className="text-muted d-block mt-2">
            Require users to verify their identity with a second factor
          </small>
        </div>
      </div>

      {/* Audit & Logging */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3" style={{ fontWeight: 600, fontSize: 16 }}>
            Audit & Logging
          </h5>
          
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="auditSwitch"
              checked={auditEnabled}
              onChange={(e) => setAuditEnabled(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="auditSwitch">
              Enable Audit Logging
            </label>
          </div>
          <small className="text-muted d-block mt-2">
            Track all system activities and user actions for security and compliance
          </small>
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-outline-secondary">
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <MdSave className="me-2" />
          {saving ? "Saving..." : "Save Security Settings"}
        </button>
      </div>
    </div>
  );
}

/* =========================
   MODULE SETTINGS
========================= */

function ModulesChooser({ onSelect }) {
  const modules = [
    { key: "hrms", title: "HRMS", desc: "Human Resource Management" },
    { key: "payroll", title: "Payroll", desc: "Payroll configuration" },
    { key: "aims", title: "AIMS", desc: "Inventory management" },
    { key: "moms", title: "MOMS", desc: "Operations management" },
    { key: "crm", title: "CRM", desc: "Customer management" },
    { key: "accounting", title: "Accounting", desc: "Financial settings" },
  ];

  return <ModuleSettings title="System Modules" items={modules} onManage={onSelect} />;
}

function HRMSSettings({ onManage }) {
  const items = [
    { key: "departments", title: "Departments", desc: "Manage departments" },
    { key: "shifts", title: "Shifts", desc: "Work schedules" },
    { key: "employment", title: "Employment Status", desc: "Employment types" },
  ];

  return <ModuleSettings title="HRMS Settings" items={items} onManage={onManage} />;
}

function PayrollSettings() {
  const items = [
    { title: "Salary Grades", desc: "Salary structures" },
    { title: "Deductions", desc: "Taxes and deductions" },
    { title: "Allowances", desc: "Employee allowances" },
  ];

  return <ModuleSettings title="Payroll Settings" items={items} />;
}

function AIMSSettings() {
  const items = [
    { title: "Categories", desc: "Inventory categories" },
    { title: "Units", desc: "Measurement units" },
    { title: "Suppliers", desc: "Supplier list" },
  ];

  return <ModuleSettings title="AIMS Settings" items={items} />;
}

function ModuleSettings({ title, items, onManage }) {
  return (
    <div>
      <h3 className="mb-4">{title}</h3>
      <div className="row g-3">
        {items.map(item => (
          <div className="col-md-6" key={item.title}>
            <div className="card h-100">
              <div className="card-body">
                <h5>{item.title}</h5>
                <p className="text-muted">{item.desc}</p>
                {onManage && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onManage(item.key)}
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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