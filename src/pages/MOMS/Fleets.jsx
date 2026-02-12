import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";

export default function Fleets() {
  const navigate = useNavigate();
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    fleet_type: "",
    make_brand: "",
    model: "",
    registration_number: "",
    year_of_manufacture: new Date().getFullYear(),
    vin: "",
    color: "",
    purchase_price: "",
    date_of_acquisition: "",
    description: "",
  });

  const fleetTypes = [
    "Excavator",
    "Dozer",
    "Dump Truck",
    "Loader",
    "Grader",
    "Crane",
    "Forklift",
    "Other",
  ];

  useEffect(() => {
    fetchFleets();
  }, []);

  const fetchFleets = async () => {
    try {
      const response = await baseApi.get("/api/moms/fleets");
      setFleets(response.data || []);
    } catch (error) {
      console.error("Error fetching fleets:", error);
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
      await baseApi.post("/api/moms/fleets", formData);
      setShowCreateModal(false);
      setFormData({
        fleet_type: "",
        make_brand: "",
        model: "",
        registration_number: "",
        year_of_manufacture: new Date().getFullYear(),
        vin: "",
        color: "",
        purchase_price: "",
        date_of_acquisition: "",
        description: "",
      });
      fetchFleets();
    } catch (error) {
      console.error("Error creating fleet:", error);
      alert("Failed to create fleet. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fleet?")) return;

    try {
      await baseApi.delete(`/api/moms/fleets/${id}`);
      fetchFleets();
    } catch (error) {
      console.error("Error deleting fleet:", error);
      alert("Failed to delete fleet. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Fleet Management
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
              <MdAdd size={20} /> Add Fleet
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-3">
          <div className="col-12 col-md-10">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Fleet Number, Asset Number, or Registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: "42px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>
          <div className="col-12 col-md-2 mt-2 mt-md-0">
            <button
              className="btn btn-primary w-100"
              style={{ height: "42px", borderRadius: "8px" }}
            >
              <MdSearch size={18} className="me-2" /> Search
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
                      Fleet Number
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Asset Number
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Type
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Make / Model
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Reg. Number
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Stickers
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                      Actions
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
                  ) : fleets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <p className="text-muted mb-0">No fleets found</p>
                      </td>
                    </tr>
                  ) : (
                    fleets.map((fleet) => (
                      <tr key={fleet.id}>
                        <td style={{ padding: "16px" }}>
                          <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                            {fleet.fleet_number || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{fleet.asset_number || "N/A"}</td>
                        <td style={{ padding: "16px" }}>{fleet.fleet_type}</td>
                        <td style={{ padding: "16px" }}>
                          {fleet.make_brand} {fleet.model}
                        </td>
                        <td style={{ padding: "16px" }}>{fleet.registration_number}</td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: fleet.status === "Active" ? "#d1fae5" : "#fee2e2",
                              color: fleet.status === "Active" ? "#065f46" : "#991b1b",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {fleet.status || "Active"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{fleet.stickers || "N/A"}</td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#3b82f6",
                                padding: "4px 8px",
                                fontSize: "13px",
                              }}
                              onClick={() => navigate(`/moms/fleets/${fleet.id}/edit`)}
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
                              onClick={() => handleDelete(fleet.id)}
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

      {/* Create Fleet Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Create Fleet</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>
                Fleet Type <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                name="fleet_type"
                value={formData.fleet_type}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Fleet Type --</option>
                {fleetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Make/Brand <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="make_brand"
                    value={formData.make_brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Caterpillar, Volvo, etc."
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    Model <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., D6T, L120H, etc."
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Registration Number</Form.Label>
              <Form.Control
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                placeholder="License plate number"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Year of Manufacture</Form.Label>
                  <Form.Control
                    type="number"
                    name="year_of_manufacture"
                    value={formData.year_of_manufacture}
                    onChange={handleInputChange}
                    placeholder="2026"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>
                    VIN (Vehicle Identification Number)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    placeholder="Vehicle VIN"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Color</Form.Label>
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Vehicle color"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Purchase Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Date of Acquisition</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_of_acquisition"
                    value={formData.date_of_acquisition}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional fleet details..."
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
            <Button variant="primary" type="submit" style={{ borderRadius: "6px" }}>
              Create Fleet
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}