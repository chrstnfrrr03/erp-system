import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Modal, Button, Form } from "react-bootstrap";
import { MdLocalGasStation, MdFilterList, MdWarning, MdAssessment } from "react-icons/md";

export default function Fuel() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAnomaliesModal, setShowAnomaliesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("All Fuel Types");
  const [currentFuelPrice, setCurrentFuelPrice] = useState(null);

  const [stats, setStats] = useState({
    totalTransactions: 0,
    thisMonth: 0,
    fuelTypes: ["Diesel", "Petrol", "LPG", "CNG"],
    avgCostPerUnit: 0,
  });

  const [formData, setFormData] = useState({
    machine_id: "",
    fuel_type: "Diesel",
    volume: "",
    unit_price: "",
    total_cost: "0.00",
    transaction_date: "",
  });

  const fuelTypes = ["Diesel", "Petrol", "LPG", "CNG"];

  useEffect(() => {
    fetchTransactions();
    fetchMachines();
    fetchStats();
    fetchCurrentFuelPrice();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await baseApi.get("/api/moms/fuel-transactions");
      setTransactions(response.data || []);
    } catch (error) {
      console.error("Error fetching fuel transactions:", error);
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

  const fetchStats = async () => {
    try {
      const response = await baseApi.get("/api/moms/fuel-stats");
      setStats(response.data || stats);
    } catch (error) {
      console.error("Error fetching fuel stats:", error);
    }
  };

  const fetchCurrentFuelPrice = async () => {
    try {
      const response = await baseApi.get("/api/moms/finance/fuel-pricing");
      const price = response.data?.currentPrice;
      setCurrentFuelPrice(price);
      
      // Auto-populate unit price if available
      if (price?.cost_per_litre) {
        setFormData((prev) => ({
          ...prev,
          unit_price: parseFloat(price.cost_per_litre).toFixed(2),
        }));
      }
    } catch (error) {
      console.error("Error fetching current fuel price:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate total cost when volume or unit price changes
      if (name === "volume" || name === "unit_price") {
        const volume = parseFloat(name === "volume" ? value : prev.volume) || 0;
        const unitPrice = parseFloat(name === "unit_price" ? value : prev.unit_price) || 0;
        updated.total_cost = (volume * unitPrice).toFixed(2);
      }

      return updated;
    });
  };

  const loadCurrentFuelPrice = () => {
    if (currentFuelPrice?.cost_per_litre) {
      setFormData((prev) => ({
        ...prev,
        unit_price: parseFloat(currentFuelPrice.cost_per_litre).toFixed(2),
      }));
    } else {
      alert("No current fuel price available. Please set fuel pricing first.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await baseApi.post("/api/moms/fuel-transactions", formData);
      setShowLogModal(false);
      setFormData({
        machine_id: "",
        fuel_type: "Diesel",
        volume: "",
        unit_price: currentFuelPrice?.cost_per_litre 
          ? parseFloat(currentFuelPrice.cost_per_litre).toFixed(2) 
          : "",
        total_cost: "0.00",
        transaction_date: "",
      });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error("Error logging fuel transaction:", error);
      alert("Failed to log fuel transaction. Please try again.");
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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.machine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fuel_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuelType =
      selectedFuelType === "All Fuel Types" || transaction.fuel_type === selectedFuelType;
    return matchesSearch && matchesFuelType;
  });

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MdLocalGasStation size={32} color="#f97316" />
              <div>
                <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)", margin: 0 }}>
                  Fuel Management
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Manage fuel transactions and consumption
                </p>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <button
              className="btn"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
              }}
              onClick={() => setShowLogModal(true)}
            >
              <MdLocalGasStation size={20} /> Log Fuel Transaction
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Total Transactions
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px" }}>
                  {stats.totalTransactions}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  This Month
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px" }}>
                  {stats.thisMonth}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Fuel Types
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px" }}>
                  {stats.fuelTypes.length}
                </h2>
                <p className="mb-0 mt-1" style={{ fontSize: "12px", opacity: 0.8 }}>
                  {stats.fuelTypes.join(" • ")}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="card-body p-3">
                <p className="mb-1" style={{ fontSize: "14px", opacity: 0.9 }}>
                  Avg Cost/Unit
                </p>
                <h2 className="mb-0" style={{ fontWeight: "bold", fontSize: "32px" }}>
                  K{stats.avgCostPerUnit.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card shadow-sm mb-3" style={{ borderRadius: "12px" }}>
          <div className="card-body p-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search machine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div className="col-12 col-md-3">
                <select
                  className="form-select"
                  value={selectedFuelType}
                  onChange={(e) => setSelectedFuelType(e.target.value)}
                  style={{ borderRadius: "8px" }}
                >
                  <option>All Fuel Types</option>
                  {fuelTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-2">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#f97316",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  <MdFilterList size={18} className="me-1" /> Filter
                </button>
              </div>
              <div className="col-12 col-md-2">
                <button
                  className="btn btn-danger w-100"
                  style={{ borderRadius: "8px", fontWeight: "500" }}
                  onClick={() => setShowAnomaliesModal(true)}
                >
                  <MdWarning size={18} className="me-1" /> Detect Anomalies
                </button>
              </div>
              <div className="col-12 col-md-2">
                <button
                  className="btn btn-success w-100"
                  style={{ borderRadius: "8px", fontWeight: "500" }}
                  onClick={() => navigate("/moms/fuel/consumption-report")}
                >
                  <MdAssessment size={18} className="me-1" /> Consumption Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
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
                      Date
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Machine
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Fuel Type
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Volume (L)
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Unit Price
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Total Cost
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
                      Logged By
                    </th>
                    <th style={{ padding: "16px", fontWeight: "600", color: "#495057" }}>
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
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <MdLocalGasStation size={48} color="#cbd5e1" />
                        <p className="text-muted mt-2 mb-0">No fuel transactions found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td style={{ padding: "16px" }}>
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td style={{ padding: "16px" }}>{transaction.machine_id}</td>
                        <td style={{ padding: "16px" }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontWeight: "500",
                            }}
                          >
                            {transaction.fuel_type}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>{transaction.volume}L</td>
                        <td style={{ padding: "16px" }}>K{transaction.unit_price}</td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>
                          K{transaction.total_cost}
                        </td>
                        <td style={{ padding: "16px" }}>{transaction.logged_by || "Admin"}</td>
                        <td style={{ padding: "16px" }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              color: "#3b82f6",
                              padding: "4px 12px",
                              fontSize: "13px",
                            }}
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

      {/* Log Fuel Transaction Modal */}
      <Modal
        show={showLogModal}
        onHide={() => setShowLogModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Log Fuel Transaction</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "24px" }}>
            <div className="row">
              <div className="col-md-6">
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
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Fuel Type</Form.Label>
                  <Form.Select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleInputChange}
                    required
                  >
                    {fuelTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Volume (L)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Unit Price</Form.Label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      variant="primary"
                      onClick={loadCurrentFuelPrice}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Load Current
                    </Button>
                  </div>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    {currentFuelPrice 
                      ? `Current price: K${parseFloat(currentFuelPrice.cost_per_litre).toFixed(2)}/L` 
                      : "No current fuel price set. Click 'Load Current' or enter manually."}
                  </small>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Total Cost</Form.Label>
                  <Form.Control
                    type="text"
                    name="total_cost"
                    value={formData.total_cost}
                    readOnly
                    style={{ fontWeight: "600", backgroundColor: "#f8f9fa" }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Transaction Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() => setShowLogModal(false)}
              style={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              style={{ borderRadius: "6px", backgroundColor: "#f97316", border: "none" }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detect Anomalies Modal */}
      <Modal
        show={showAnomaliesModal}
        onHide={() => setShowAnomaliesModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Fuel Consumption Anomalies</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px" }}>
          <p className="text-muted mb-4">
            The system analyzes recent fuel transactions and operations logs to detect large
            variances that may indicate theft or recording errors.
          </p>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Machine</th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Expected Usage</th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Actual Usage</th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Variance %</th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No anomalies detected
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
}