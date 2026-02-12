import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdEdit, MdVisibility, MdStar } from "react-icons/md";

export default function Operators() {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    license_number: "",
    license_expiry: "",
    specialization: "",
    experience_years: 0,
    status: "Active",
  });

  useEffect(() => {
    fetchOperators();
    fetchUsers();
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await baseApi.get("/api/moms/operators");
      setOperators(response.data || []);
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await baseApi.get("/api/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      await baseApi.post("/api/moms/operators", formData);
      setShowCreateModal(false);
      setFormData({
        user_id: "",
        license_number: "",
        license_expiry: "",
        specialization: "",
        experience_years: 0,
        status: "Active",
      });
      fetchOperators();
    } catch (error) {
      console.error("Error creating operator:", error);
      alert("Failed to create operator. Please try again.");
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

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Operators
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
              <MdAdd size={20} /> Add Operator
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
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e9ecef",
                  }}
                >
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Name
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      License
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      License Expiry
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Total Hours
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Rating
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
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
                  ) : operators.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No operators found. Click "Add Operator" to create one.
                      </td>
                    </tr>
                  ) : (
                    operators.map((operator) => (
                      <tr key={operator.id}>
                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              color: "#3b82f6",
                              fontWeight: "500",
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(`/moms/operators/${operator.id}`)}
                          >
                            {operator.user_name || `Operator ${operator.id}`}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{operator.license_number}</td>
                        <td style={{ padding: "16px" }}>
                          {formatDate(operator.license_expiry)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {operator.total_hours || 0}h
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <MdStar size={16} color="#fbbf24" />
                            <span style={{ fontWeight: "500" }}>
                              {operator.rating ? operator.rating.toFixed(2) : "0.00"}
                            </span>
                          </div>
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
                                navigate(`/moms/operators/${operator.id}/edit`)
                              }
                            >
                              <MdEdit size={16} className="me-1" /> Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#6b7280",
                                padding: "4px 8px",
                                fontSize: "13px",
                              }}
                              onClick={() => navigate(`/moms/operators/${operator.id}`)}
                            >
                              <MdVisibility size={16} className="me-1" /> View
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

      {/* Create Operator Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create Operator</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>User</Form.Label>
              <Form.Select
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>License Number</Form.Label>
              <Form.Control
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                required
                placeholder="e.g., LIC-OPE-1234"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>License Expiry</Form.Label>
              <Form.Control
                type="date"
                name="license_expiry"
                value={formData.license_expiry}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Specialization</Form.Label>
              <Form.Control
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Excavator, Bulldozer, etc."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Experience Level (years)
              </Form.Label>
              <Form.Control
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                required
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
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
              Create Operator
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}