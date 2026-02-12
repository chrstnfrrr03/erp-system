import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdEdit, MdVisibility } from "react-icons/md";

export default function Machines() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState([
    "Excavator",
    "Dozer",
    "Dump Truck",
    "Loader",
    "Grader",
  ]);

  const [formData, setFormData] = useState({
    category: "",
    make: "",
    model: "",
    engine_hours: 0,
    fuel_capacity: "",
    status: "Active",
    location: "",
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await baseApi.get("/api/moms/machines");
      setMachines(response.data || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
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
      await baseApi.post("/api/moms/machines", formData);
      setShowCreateModal(false);
      setFormData({
        category: "",
        make: "",
        model: "",
        engine_hours: 0,
        fuel_capacity: "",
        status: "Active",
        location: "",
      });
      fetchMachines();
    } catch (error) {
      console.error("Error creating machine:", error);
      alert("Failed to create machine. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Machines
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
              <MdAdd size={20} /> Add Machine
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
                    backgroundColor: "#2c3e50",
                    color: "white",
                  }}
                >
                  <tr>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Machine ID</th>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Category</th>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Make/Model</th>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Status</th>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Engine Hours</th>
                    <th style={{ padding: "16px", fontWeight: "600" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : machines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No machines found. Click "Add Machine" to create one.
                      </td>
                    </tr>
                  ) : (
                    machines.map((machine) => (
                      <tr key={machine.id}>
                        <td style={{ padding: "16px" }}>
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            {machine.machine_id}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{machine.category}</td>
                        <td style={{ padding: "16px" }}>
                          {machine.make} {machine.model}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                machine.status === "Active" ? "#d1fae5" : "#fee2e2",
                              color: machine.status === "Active" ? "#065f46" : "#991b1b",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {machine.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{machine.engine_hours}h</td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#3b82f6",
                                padding: "4px 8px",
                                fontSize: "13px",
                              }}
                              onClick={() => navigate(`/moms/machines/${machine.id}/edit`)}
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
                              onClick={() => navigate(`/moms/machines/${machine.id}`)}
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

      {/* Create Machine Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create Machine</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
              Machine ID will be generated automatically when the machine is created.
            </p>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Make</Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Model</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Engine Hours</Form.Label>
                  <Form.Control
                    type="number"
                    name="engine_hours"
                    value={formData.engine_hours}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Fuel Capacity (L)</Form.Label>
                  <Form.Control
                    type="number"
                    name="fuel_capacity"
                    value={formData.fuel_capacity}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
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
              style={{ borderRadius: "6px" }}
            >
              Create Machine
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}