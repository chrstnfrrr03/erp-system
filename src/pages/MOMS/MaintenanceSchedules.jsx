import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdEdit, MdDelete, MdCalendarToday } from "react-icons/md";

export default function MaintenanceSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [machines, setMachines] = useState([]);

  const [formData, setFormData] = useState({
    machine_id: "",
    title: "",
    description: "",
    frequency: "Weekly",
    interval_value: 1,
    next_due_date: "",
    is_active: true,
  });

  const frequencies = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const schedulesRes = await baseApi.get("/api/moms/maintenance/schedules");
      setSchedules(schedulesRes.data || []);

      const machinesRes = await baseApi.get("/api/moms/machines");
      setMachines(machinesRes.data || []);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await baseApi.post("/api/moms/maintenance/schedules", formData);
      setShowCreateModal(false);
      setFormData({
        machine_id: "",
        title: "",
        description: "",
        frequency: "Weekly",
        interval_value: 1,
        next_due_date: "",
        is_active: true,
      });
      fetchData();
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      alert("Failed to create maintenance schedule. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      await baseApi.delete(`/api/moms/maintenance/schedules/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Maintenance Schedules
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Plan and schedule recurring maintenance activities
            </p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <MdAdd size={20} /> Create Schedule
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Machine
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Title
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Frequency
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Next Due
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
                      <td colSpan="6" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : schedules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div style={{ opacity: 0.5 }}>
                          <MdCalendarToday size={48} color="#9ca3af" />
                          <p className="text-muted mt-2 mb-0">
                            No maintenance schedules found. Click "Create Schedule" to add one.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td style={{ padding: "16px" }}>
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            {schedule.machine?.machine_id || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{schedule.title}</td>
                        <td style={{ padding: "16px" }}>
                          {schedule.frequency}
                          {schedule.interval_value > 1 && ` (Every ${schedule.interval_value})`}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {schedule.next_due_date
                            ? new Date(schedule.next_due_date).toLocaleDateString()
                            : "Not set"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: schedule.is_active ? "#d1fae5" : "#fee2e2",
                              color: schedule.is_active ? "#065f46" : "#991b1b",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {schedule.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#3b82f6",
                                padding: "4px 8px",
                                fontSize: "13px",
                              }}
                              onClick={() =>
                                navigate(`/moms/maintenance/schedules/${schedule.id}/edit`)
                              }
                            >
                              <MdEdit size={16} className="me-1" /> Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#dc2626",
                                padding: "4px 8px",
                                fontSize: "13px",
                              }}
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <MdDelete size={16} className="me-1" /> Delete
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
      </div>

      {/* Create Schedule Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create Maintenance Schedule</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
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
                    {machine.machine_id} - {machine.make} {machine.model}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Title <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Oil Change, Tire Rotation"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Description <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the maintenance task..."
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Frequency <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Interval Value <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="interval_value"
                    value={formData.interval_value}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  <Form.Text className="text-muted">
                    E.g., 2 for "Every 2 weeks"
                  </Form.Text>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Next Due Date <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="next_due_date"
                value={formData.next_due_date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_active"
                label="Active"
                checked={formData.is_active}
                onChange={handleInputChange}
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
              style={{ borderRadius: "6px" }}
            >
              Create Schedule
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}