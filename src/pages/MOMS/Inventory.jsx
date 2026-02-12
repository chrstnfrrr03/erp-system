import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";

export default function Inventory() {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    part_number: "",
    name: "",
    description: "",
    category: "",
    quantity: 0,
    reorder_level: 5,
    unit_cost: "",
    supplier: "",
    status: "In Stock",
  });

  const categories = [
    "Engine Parts",
    "Hydraulic Parts",
    "Electrical Parts",
    "Body Parts",
    "Filters",
    "Oils & Lubricants",
    "Tires & Tracks",
    "Other",
  ];

  const statuses = ["In Stock", "Low Stock", "Out of Stock", "On Order"];

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await baseApi.get("/api/moms/inventory/parts");
      setParts(response.data || []);
    } catch (error) {
      console.error("Error fetching parts:", error);
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
      await baseApi.post("/api/moms/inventory/parts", formData);
      setShowCreateModal(false);
      setFormData({
        part_number: "",
        name: "",
        description: "",
        category: "",
        quantity: 0,
        reorder_level: 5,
        unit_cost: "",
        supplier: "",
        status: "In Stock",
      });
      fetchParts();
    } catch (error) {
      console.error("Error creating part:", error);
      alert("Failed to create part. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;

    try {
      await baseApi.delete(`/api/moms/inventory/parts/${id}`);
      fetchParts();
    } catch (error) {
      console.error("Error deleting part:", error);
      alert("Failed to delete part. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Machine Parts & Stock
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
              <MdAdd size={20} /> Add Part
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
                      PART NUMBER
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      NAME
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      CATEGORY
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      QUANTITY
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      REORDER LEVEL
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      UNIT COST
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      STATUS
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : parts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <p className="text-muted mb-0">No parts found</p>
                      </td>
                    </tr>
                  ) : (
                    parts.map((part) => (
                      <tr key={part.id}>
                        <td style={{ padding: "16px" }}>
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            {part.part_number}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{part.name}</td>
                        <td style={{ padding: "16px" }}>{part.category}</td>
                        <td style={{ padding: "16px" }}>{part.quantity}</td>
                        <td style={{ padding: "16px" }}>{part.reorder_level}</td>
                        <td style={{ padding: "16px" }}>
                          ${parseFloat(part.unit_cost || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                part.status === "In Stock"
                                  ? "#d1fae5"
                                  : part.status === "Low Stock"
                                  ? "#fef3c7"
                                  : part.status === "Out of Stock"
                                  ? "#fee2e2"
                                  : "#dbeafe",
                              color:
                                part.status === "In Stock"
                                  ? "#065f46"
                                  : part.status === "Low Stock"
                                  ? "#92400e"
                                  : part.status === "Out of Stock"
                                  ? "#991b1b"
                                  : "#1e40af",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {part.status}
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
                              onClick={() => navigate(`/moms/inventory/${part.id}/edit`)}
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
                              onClick={() => handleDelete(part.id)}
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

      {/* Create Part Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create New Part</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Part Number <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="part_number"
                    value={formData.part_number}
                    onChange={handleInputChange}
                    placeholder="e.g., PART-001"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Part Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Engine Oil Filter"
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the part"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
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
                  <Form.Label style={{ fontWeight: "500" }}>
                    Initial Stock Quantity <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Reorder Level <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Unit Cost <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="unit_cost"
                      value={formData.unit_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Supplier</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="Supplier name"
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              style={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" style={{ borderRadius: "6px" }}>
              Create Part
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}