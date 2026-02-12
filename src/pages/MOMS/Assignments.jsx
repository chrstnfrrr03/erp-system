import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd } from "react-icons/md";

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [operators, setOperators] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const [formData, setFormData] = useState({
    machine_id: "",
    operator_id: "",
    job_site: "",
    shift_type: "Day",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    task_description: "",
    status: "Pending",
  });

  const tabs = ["All", "Pending", "Active", "Completed", "Cancelled"];

  useEffect(() => {
    fetchAssignments();
    fetchMachines();
    fetchOperators();
    fetchJobSites();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await baseApi.get("/api/moms/assignments");
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await baseApi.get("/api/moms/machines");
      setMachines(response.data || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await baseApi.get("/api/moms/operators");
      setOperators(response.data || []);
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  const fetchJobSites = async () => {
    try {
      const response = await baseApi.get("/api/moms/job-sites");
      setJobSites(response.data || []);
    } catch (error) {
      console.error("Error fetching job sites:", error);
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
      await baseApi.post("/api/moms/assignments", formData);
      setShowCreateModal(false);
      setFormData({
        machine_id: "",
        operator_id: "",
        job_site: "",
        shift_type: "Day",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        task_description: "",
        status: "Pending",
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: { bg: "#dbeafe", text: "#1e40af" },
      Active: { bg: "#d1fae5", text: "#065f46" },
      Completed: { bg: "#e5e7eb", text: "#374151" },
      Cancelled: { bg: "#fee2e2", text: "#991b1b" },
    };
    return colors[status] || { bg: "#e5e7eb", text: "#374151" };
  };

  const filteredAssignments =
    activeTab === "All"
      ? assignments
      : assignments.filter((a) => a.status === activeTab);

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Assignments
            </h1>
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
              <MdAdd size={20} /> New Assignment
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-3">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor:
                    activeTab === tab
                      ? tab === "Pending"
                        ? "#dbeafe"
                        : tab === "Active"
                        ? "#d1fae5"
                        : tab === "Completed"
                        ? "#e5e7eb"
                        : tab === "Cancelled"
                        ? "#fee2e2"
                        : "#f3f4f6"
                      : "#ffffff",
                  color:
                    activeTab === tab
                      ? tab === "Pending"
                        ? "#1e40af"
                        : tab === "Active"
                        ? "#065f46"
                        : tab === "Completed"
                        ? "#374151"
                        : tab === "Cancelled"
                        ? "#991b1b"
                        : "#374151"
                      : "#6b7280",
                  fontWeight: activeTab === tab ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "14px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e9ecef",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Machine
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Operator
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Job Site
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Shift Type
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Start Date
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No assignments found.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((assignment) => {
                      const statusColors = getStatusColor(assignment.status);
                      return (
                        <tr key={assignment.id}>
                          <td style={{ padding: "16px" }}>
                            <span
                              style={{
                                color: "#3b82f6",
                                fontWeight: "500",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/moms/assignments/${assignment.id}`)
                              }
                            >
                              {assignment.machine_id}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            {assignment.operator_name || "N/A"}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {assignment.job_site || "N/A"}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {assignment.shift_type}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {formatDate(assignment.start_date)}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: statusColors.bg,
                                color: statusColors.text,
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontWeight: "500",
                                fontSize: "12px",
                              }}
                            >
                              {assignment.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="btn btn-sm"
                                style={{
                                  color: "#3b82f6",
                                  padding: "4px 12px",
                                  fontSize: "13px",
                                }}
                                onClick={() =>
                                  navigate(`/moms/assignments/${assignment.id}`)
                                }
                              >
                                View
                              </button>
                              {assignment.status === "Active" && (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    color: "#10b981",
                                    padding: "4px 12px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>New Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Machine</Form.Label>
              <Form.Select
                name="machine_id"
                value={formData.machine_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Machine</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.machine_id} - {machine.category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Operator</Form.Label>
              <Form.Select
                name="operator_id"
                value={formData.operator_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Operator</option>
                {operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.user_name || `Operator ${operator.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Job Site (optional)
              </Form.Label>
              <Form.Select
                name="job_site"
                value={formData.job_site}
                onChange={handleInputChange}
              >
                <option value="">Select Job Site</option>
                {jobSites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Start Date & Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    End Date & Time (optional)
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Shift Type</Form.Label>
              <Form.Select
                name="shift_type"
                value={formData.shift_type}
                onChange={handleInputChange}
                required
              >
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="Full Day">Full Day</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Task Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="task_description"
                value={formData.task_description}
                onChange={handleInputChange}
                placeholder="Describe the task or project details..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
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
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}