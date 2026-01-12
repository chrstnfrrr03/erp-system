import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { MdSave } from "react-icons/md";
import { useState } from "react";
import Swal from "sweetalert2";
import aimsApi from "../../aimsApi";

export default function AddItem() {
  const navigate = useNavigate();

  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [formData, setFormData] = useState({
    // Classification
    item_type: "Inventory Item",
    status: "Active",
    location: "Main Warehouse",

    // Basic Info
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    unit: "",

    // Supplier & Procurement
    supplier_id: "",
    lead_time: "",
    preferred_purchase_qty: "",

    // Pricing
    cost_price: "",
    selling_price: "",
    tax_category: "VAT 12%",
    valuation_method: "FIFO",

    // Stock Control
    opening_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    reorder_quantity: 0,

    // Notes
    notes: "",
  });

  // ==========================================================
  // INPUT HANDLER
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await aimsApi.post("/items", {
        ...formData,
        supplier_id: formData.supplier_id || null,
        lead_time:
          formData.lead_time !== "" ? Number(formData.lead_time) : null,
        preferred_purchase_qty:
          formData.preferred_purchase_qty !== ""
            ? Number(formData.preferred_purchase_qty)
            : null,

        cost_price: Number(formData.cost_price),
        selling_price: Number(formData.selling_price),

        opening_stock: Number(formData.opening_stock),
        minimum_stock: Number(formData.minimum_stock),
        maximum_stock: Number(formData.maximum_stock),
        reorder_quantity: Number(formData.reorder_quantity),
      });

      await Swal.fire({
        icon: "success",
        title: "Item Added",
        text: "Inventory item has been saved successfully.",
        confirmButtonColor: "#28a745",
      });

      navigate("/aims/inventory");
    } catch (err) {
      console.error(err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          err.response?.data?.message ||
          "Please complete all required fields.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ==========================================================
  // STYLES
  // ==========================================================
  const inputStyle = {
    height: "54px",
    borderRadius: "10px",
    fontSize: "15px",
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: "14px",
    marginBottom: "6px",
  };

  const sectionTitle = {
    fontWeight: 600,
    fontSize: "15px",
    marginBottom: "6px",
  };

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* HEADER */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="fw-bold mb-1">Add Inventory Item</h1>
            <div className="text-muted" style={{ fontSize: "14px" }}>
              Register item details for inventory, accounting, and procurement
            </div>
          </div>

          <div className="col-auto">
            <button
              className="btn btn-outline-danger"
              onClick={() => navigate("/aims")}
            >
              Close
            </button>
          </div>
        </div>

        <div className="card shadow-sm" style={{ borderRadius: "14px" }}>
          <div className="card-body p-4">
            <form className="row g-4" onSubmit={handleSubmit}>
              {/* ITEM CLASSIFICATION */}
              <div className="col-12">
                <div style={sectionTitle}>Item Classification</div>
                <hr />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Item Type</label>
                <select
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                >
                  <option>Inventory Item</option>
                  <option>Consumable</option>
                  <option>Fixed Asset</option>
                </select>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Discontinued</option>
                </select>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Warehouse / Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                >
                  <option>Main Warehouse</option>
                  <option>Secondary Storage</option>
                </select>
              </div>

              {/* BASIC INFORMATION */}
              <div className="col-12 mt-3">
                <div style={sectionTitle}>Basic Information</div>
                <hr />
              </div>

              <div className="col-md-6">
                <label style={labelStyle}>Item Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>SKU *</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>Barcode</label>
                <input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                  required
                >
                  <option value="">Select Category</option>
                  <option>Spare Parts</option>
                  <option>Consumables</option>
                  <option>Tools</option>
                  <option>Electronics</option>
                </select>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Brand</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                  required
                >
                  <option value="">Select Unit</option>
                  <option>Pieces</option>
                  <option>Boxes</option>
                  <option>Liters</option>
                  <option>Kilograms</option>
                </select>
              </div>

              {/* PRICING */}
              <div className="col-md-4">
                <label style={labelStyle}>Cost Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Opening Stock *</label>
                <input
                  type="number"
                  min="0"
                  name="opening_stock"
                  value={formData.opening_stock}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  required
                />
              </div>

              {/* NOTES */}
              <div className="col-12">
                <label style={labelStyle}>Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  style={{ borderRadius: "10px" }}
                />
              </div>

              {/* ACTIONS */}
              <div className="col-12 d-flex justify-content-end gap-3 pt-3">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => navigate("/aims")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <MdSave size={18} /> Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
