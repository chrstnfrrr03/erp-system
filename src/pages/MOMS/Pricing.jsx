import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import { Form } from "react-bootstrap";

export default function Pricing() {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    cost_per_litre: "",
    effective_date: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await baseApi.get("/api/moms/finance/fuel-pricing");
      setCurrentPrice(response.data?.currentPrice || null);
      setPriceHistory(response.data?.history || []);
    } catch (error) {
      console.error("Error fetching fuel pricing:", error);
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
      await baseApi.post("/api/moms/finance/fuel-pricing", formData);
      alert("Fuel price updated successfully!");
      setFormData({
        cost_per_litre: "",
        effective_date: new Date().toISOString().slice(0, 16),
        notes: "",
      });
      fetchPricing();
    } catch (error) {
      console.error("Error updating fuel price:", error);
      alert("Failed to update fuel price. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Fuel Pricing Management
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            {/* Current Fuel Price Card */}
            <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>
                  Current Fuel Price
                </h5>

                {loading ? (
                  <p className="text-muted">Loading...</p>
                ) : currentPrice ? (
                  <div
                    style={{
                      backgroundColor: "#eff6ff",
                      padding: "20px",
                      borderRadius: "8px",
                    }}
                  >
                    <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                      Cost per Litre
                    </p>
                    <h2
                      style={{
                        fontWeight: "bold",
                        fontSize: "36px",
                        color: "#2563eb",
                        marginBottom: "8px",
                      }}
                    >
                      {parseFloat(currentPrice.cost_per_litre).toFixed(2)}
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                      Last updated:{" "}
                      {currentPrice.last_updated
                        ? new Date(currentPrice.last_updated).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "20px",
                      borderRadius: "8px",
                    }}
                  >
                    <p className="text-muted mb-0">No current price set</p>
                  </div>
                )}
              </div>
            </div>

            {/* Set New Fuel Price Form */}
            <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>
                  Set New Fuel Price
                </h5>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Cost per Litre (in currency units)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="cost_per_litre"
                      value={formData.cost_per_litre}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.50"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>Effective Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="effective_date"
                      value={formData.effective_date}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>Notes (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g., Supplier increase due to market conditions"
                    />
                  </Form.Group>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ borderRadius: "8px", width: "100%" }}
                  >
                    Update Fuel Price
                  </button>
                </Form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            {/* Price History */}
            <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Price History</h5>

                {loading ? (
                  <p className="text-muted">Loading...</p>
                ) : priceHistory.length === 0 ? (
                  <p className="text-muted">No price history available</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          <th
                            style={{
                              padding: "12px",
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            EFFECTIVE DATE
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            COST PER LITRE
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            NOTES
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceHistory.map((record, index) => (
                          <tr key={index}>
                            <td style={{ padding: "12px" }}>
                              {new Date(record.effective_date).toLocaleString()}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {parseFloat(record.cost_per_litre).toFixed(2)}
                            </td>
                            <td style={{ padding: "12px" }}>{record.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}