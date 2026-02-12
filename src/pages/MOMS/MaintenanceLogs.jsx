import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdFilterList, MdCalendarToday } from "react-icons/md";

export default function MaintenanceLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [machines, setMachines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalLogs: 0,
    critical: 0,
    pending: 0,
    schedules: 0,
  });

  const [formData, setFormData] = useState({
    machine_id: "",
    maintenance_schedule_id: "",
    maintenance_type: "",
    status: "",
    start_time: "",
    end_time: "",
    cost: "",
    description: "",
  });

  const maintenanceTypes = [
    "Preventive",
    "Corrective",
    "Predictive",
    "Emergency",
    "Routine Check",
  ];

  const statuses = [
    "Scheduled",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch logs
      const logsRes = await baseApi.get("/api/moms/maintenance/logs");
      setLogs(logsRes.data || []);

      // Fetch stats
      const statsRes = await baseApi.get("/api/moms/maintenance/stats");
      setStats(statsRes.data || {
        totalLogs: 0,
        critical: 0,
        pending: 0,
        schedules: 0,
      });

      // Fetch machines for dropdown
      const machinesRes = await baseApi.get("/api/moms/machines");
      setMachines(machinesRes.data || []);

      // Fetch schedules for dropdown
      const schedulesRes = await baseApi.get("/api/moms/maintenance/schedules");
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await baseApi.post("/api/moms/maintenance/logs", formData);
      setShowCreateModal(false);
      setFormData({
        machine_id: "",
        maintenance_schedule_id: "",
        maintenance_type: "",
        status: "",
        start_time: "",
        end_time: "",
        cost: "",
        description: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating maintenance log:", error);
      alert("Failed to create maintenance log. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#0ea5e9",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdCalendarToday size={24} color="#fff" />
              </div>
              <div>
                <h1
                  style={{
                    fontWeight: "bold",
                    fontSize: "clamp(20px, 5vw, 28px)",
                    marginBottom: "4px",
                  }}
                >
                  Maintenance Management
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Track and schedule machine maintenance
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 mt-3 mt-md-0 text-md-end">
            <button
              className="btn"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#0ea5e9",
                color: "white",
                border: "none",
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <MdAdd size={20} /> New Maintenance Log
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          <div className="col-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                backgroundColor: "#0891b2",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Total Logs
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold" }}>
                  {stats.totalLogs}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Critical
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold" }}>
                  {stats.critical}
                </h2>
                <p className="mb-0" style={{ fontSize: "12px", opacity: 0.8 }}>
                  Overdue
                </p>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                backgroundColor: "#ca8a04",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Pending
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold" }}>
                  {stats.pending}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Schedules
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold" }}>
                  {stats.schedules}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search machine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: "42px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>
          <div className="col-6 col-md-2">
            <button
              className="btn btn-outline-primary w-100"
              style={{ height: "42px", borderRadius: "8px" }}
            >
              <MdFilterList size={18} className="me-2" /> Filter
            </button>
          </div>
          <div className="col-6 col-md-2">
            <button
              className="btn w-100"
              style={{
                height: "42px",
                borderRadius: "8px",
                backgroundColor: "#8b5cf6",
                color: "white",
                border: "none",
              }}
              onClick={() => navigate("/moms/maintenance/schedules")}
            >
              <MdCalendarToday size={18} className="me-2" /> Schedule Maintenance
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Date
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Machine
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Type
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Performed By
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Cost
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        Loading...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div style={{ opacity: 0.5 }}>
                          <MdCalendarToday size={48} color="#9ca3af" />
                          <p className="text-muted mt-2 mb-0">No maintenance logs found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ padding: "16px" }}>
                          {new Date(log.start_time).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "16px" }}>{log.machine?.machine_id || "N/A"}</td>
                        <td style={{ padding: "16px" }}>{log.maintenance_type}</td>
                        <td style={{ padding: "16px" }}>{log.performed_by || "N/A"}</td>
                        <td style={{ padding: "16px" }}>
                          {log.cost ? `$${parseFloat(log.cost).toFixed(2)}` : "N/A"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                log.status === "Completed"
                                  ? "#d1fae5"
                                  : log.status === "In Progress"
                                  ? "#dbeafe"
                                  : log.status === "Scheduled"
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                log.status === "Completed"
                                  ? "#065f46"
                                  : log.status === "In Progress"
                                  ? "#1e40af"
                                  : log.status === "Scheduled"
                                  ? "#92400e"
                                  : "#991b1b",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            className="btn btn-sm btn-link"
                            style={{ color: "#3b82f6", fontSize: "13px" }}
                            onClick={() => navigate(`/moms/maintenance/logs/${log.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Maintenance Log Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create Maintenance Log</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Machine <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="machine_id"
                    value={formData.machine_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Machine</option>
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machine_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Maintenance Schedule (Optional)
                  </Form.Label>
                  <Form.Select
                    name="maintenance_schedule_id"
                    value={formData.maintenance_schedule_id}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Schedule --</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.title || `Schedule ${schedule.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Maintenance Type <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Type --</option>
                    {maintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Status <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Status --</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Start Time <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>End Time (Optional)</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Cost (Optional)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Description <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              style={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              style={{ borderRadius: "6px", backgroundColor: "#3b82f6" }}
            >
              Create Maintenance Log
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}