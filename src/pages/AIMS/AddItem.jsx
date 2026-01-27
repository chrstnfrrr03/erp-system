import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { MdSave, MdClose, MdInfo } from "react-icons/md";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import baseApi from "../../api/baseApi";


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
    valuation_method: "FIFO",

    // Stock Control
    opening_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    reorder_quantity: 0,

    // Notes
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profitMargin, setProfitMargin] = useState(0);

  // ==========================================================
  // CALCULATE PROFIT MARGIN
  // ==========================================================
  useEffect(() => {
    const cost = parseFloat(formData.cost_price) || 0;
    const selling = parseFloat(formData.selling_price) || 0;
    
    if (cost > 0 && selling > 0) {
      const margin = ((selling - cost) / selling * 100).toFixed(2);
      setProfitMargin(margin);
    } else {
      setProfitMargin(0);
    }
  }, [formData.cost_price, formData.selling_price]);

  // ==========================================================
  // VALIDATION
  // ==========================================================
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    
    // Pricing validation
    const cost = parseFloat(formData.cost_price);
    const selling = parseFloat(formData.selling_price);
    
    if (!formData.cost_price || cost <= 0) {
      newErrors.cost_price = "Cost price must be greater than 0";
    }
    
    if (!formData.selling_price || selling <= 0) {
      newErrors.selling_price = "Selling price must be greater than 0";
    }
    
    if (cost > 0 && selling > 0 && selling < cost) {
      newErrors.selling_price = "Selling price should be greater than cost price";
    }

    // Stock validation
    const minStock = parseFloat(formData.minimum_stock);
    const maxStock = parseFloat(formData.maximum_stock);
    
    if (maxStock > 0 && minStock > maxStock) {
      newErrors.minimum_stock = "Minimum stock cannot exceed maximum stock";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================================
  // INPUT HANDLER
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ==========================================================
  // AUTO-GENERATE SKU
  // ==========================================================
  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : "ITM";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setFormData((prev) => ({
      ...prev,
      sku: `${prefix}-${timestamp}-${random}`,
    }));
  };

  // ==========================================================
// SUPPLIERS
// ==========================================================
const [suppliers, setSuppliers] = useState([]);

useEffect(() => {
  const fetchSuppliers = async () => {
    try {
      const res = await baseApi.get("/api/aims/suppliers");
     setSuppliers(res.data.data ?? res.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    }
  };

  fetchSuppliers();
}, []);


  // ==========================================================
  // SUBMIT
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please correct the highlighted fields before submitting.",
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    setLoading(true);

    try {
      await baseApi.post("/api/aims/items", {
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
        title: "Item Added Successfully",
        text: `${formData.name} has been registered in the inventory.`,
        confirmButtonColor: "#28a745",
      });

      navigate("/aims/inventory");
    } catch (err) {
      console.error(err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Failed to Save Item",
        text:
          err.response?.data?.message ||
          "An error occurred while saving the item. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // STYLES
  // ==========================================================
  const inputStyle = {
    height: "48px",
    borderRadius: "8px",
    fontSize: "14px",
    border: "1px solid #dee2e6",
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: "13px",
    marginBottom: "8px",
    color: "#2c3e50",
  };

  const sectionTitle = {
    fontWeight: 700,
    fontSize: "16px",
    marginBottom: "16px",
    color: "#1a252f",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const errorStyle = {
    fontSize: "12px",
    color: "#dc3545",
    marginTop: "4px",
  };

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4 py-4">
        {/* HEADER */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="fw-bold mb-2" style={{ fontSize: "28px", color: "#1a252f" }}>
              Add New Inventory Item
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Complete the form below to register a new item in your inventory system
            </p>
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

        {/* MAIN FORM CARD */}
        <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <div className="card-body p-4 p-md-5">
            <form className="row g-4" onSubmit={handleSubmit}>
              
              {/* ==================== SECTION 1: CLASSIFICATION ==================== */}
              <div className="col-12">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
                  Item Classification
                </div>
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
                  <option>Service</option>
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
                <label style={labelStyle}>Warehouse Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                >
                  <option>Main Warehouse</option>
                  <option>Secondary Storage</option>
                  <option>Showroom</option>
                  <option>Transit</option>
                </select>
              </div>

              {/* ==================== SECTION 2: BASIC INFORMATION ==================== */}
              <div className="col-12 mt-5">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
                  Basic Information
                </div>
              </div>

              <div className="col-md-8">
                <label style={labelStyle}>
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-control ${errors?.name ? 'is-invalid' : ''}`}
                  style={inputStyle}
                  placeholder="Enter descriptive item name"
                />
                {errors.name && <div style={errorStyle}>{errors.name}</div>}
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>
                  SKU (Stock Keeping Unit) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`form-control ${errors?.sku ? 'is-invalid' : ''}`}
                    style={{ ...inputStyle, borderRadius: "8px 0 0 8px" }}
                    placeholder="Auto-generate or enter"
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={generateSKU}
                    style={{ borderRadius: "0 8px 8px 0", height: "48px" }}
                    title="Auto-generate SKU"
                  >
                    Generate
                  </button>
                </div>
                {errors.sku && <div style={errorStyle}>{errors.sku}</div>}
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Barcode / EAN</label>
                <input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="Scan or enter barcode"
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  style={inputStyle}
                >
                  <option value="">Select Category</option>
                  <option>Spare Parts</option>
                  <option>Consumables</option>
                  <option>Tools & Equipment</option>
                  <option>Electronics</option>
                  <option>Raw Materials</option>
                  <option>Finished Goods</option>
                </select>
                {errors.category && <div style={errorStyle}>{errors.category}</div>}
              </div>

              <div className="col-md-2">
                <label style={labelStyle}>
                  Unit <span className="text-danger">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`form-select ${errors.unit ? 'is-invalid' : ''}`}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option>Pieces</option>
                  <option>Boxes</option>
                  <option>Liters</option>
                  <option>Kilograms</option>
                  <option>Meters</option>
                  <option>Sets</option>
                </select>
                {errors.unit && <div style={errorStyle}>{errors.unit}</div>}
              </div>

              <div className="col-md-2">
                <label style={labelStyle}>Brand</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="Optional"
                />
              </div>

              {/* ==================== SECTION 3: PRICING & VALUATION ==================== */}
              <div className="col-12 mt-5">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
                  Pricing & Valuation
                </div>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>
                  Cost Price <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px" }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleChange}
                    className={`form-control ${errors?.cost_price ? 'is-invalid' : ''}`}
                    style={{ ...inputStyle, borderLeft: "none", borderRadius: "0 8px 8px 0" }}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost_price && <div style={errorStyle}>{errors.cost_price}</div>}
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>
                  Selling Price <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: "8px 0 0 8px" }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    className={`form-control ${errors?.selling_price ? 'is-invalid' : ''}`}
                    style={{ ...inputStyle, borderLeft: "none", borderRadius: "0 8px 8px 0" }}
                    placeholder="0.00"
                  />
                </div>
                {errors.selling_price && <div style={errorStyle}>{errors.selling_price}</div>}
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Profit Margin</label>
                <div 
                  className="form-control d-flex align-items-center justify-content-center fw-bold"
                  style={{ 
                    ...inputStyle, 
                    backgroundColor: profitMargin > 0 ? "#d4edda" : "#f8f9fa",
                    color: profitMargin > 0 ? "#155724" : "#6c757d",
                    border: profitMargin > 0 ? "1px solid #c3e6cb" : "1px solid #dee2e6"
                  }}
                >
                  {profitMargin}%
                </div>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Valuation Method</label>
                <select
                  name="valuation_method"
                  value={formData.valuation_method}
                  onChange={handleChange}
                  className="form-select"
                  style={inputStyle}
                >
                  <option>FIFO</option>
                  <option>LIFO</option>
                  <option>Weighted Average</option>
                </select>
              </div>

              {/* ==================== SECTION 4: STOCK CONTROL ==================== */}
              <div className="col-12 mt-5">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>4</div>
                  Stock Control & Thresholds
                </div>
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>
  Opening Stock <span className="text-danger">*</span>
</label>
<small className="text-muted">
  This will create an automatic stock-in record
</small>

                <input
                  type="number"
                  min="0"
                  name="opening_stock"
                  value={formData.opening_stock}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>Minimum Stock Level</label>
                <input
                  type="number"
                  min="0"
                  name="minimum_stock"
                  value={formData.minimum_stock}
                  onChange={handleChange}
                  className={`form-control ${errors?.minimum_stock ? 'is-invalid' : ''}`}
                  style={inputStyle}
                  placeholder="0"
                />
                {errors.minimum_stock && <div style={errorStyle}>{errors.minimum_stock}</div>}
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>Maximum Stock Level</label>
                <input
                  type="number"
                  min="0"
                  name="maximum_stock"
                  value={formData.maximum_stock}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              <div className="col-md-3">
                <label style={labelStyle}>Reorder Quantity</label>
                <input
                  type="number"
                  min="0"
                  name="reorder_quantity"
                  value={formData.reorder_quantity}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              {/* INFO BOX */}
              <div className="col-12">
                <div 
                  className="alert alert-info d-flex align-items-start gap-2" 
                  style={{ borderRadius: "8px", backgroundColor: "#e7f3ff", border: "1px solid #b3d9ff" }}
                >
                  <MdInfo size={20} style={{ marginTop: "2px", color: "#0066cc" }} />
                  <div style={{ fontSize: "13px", color: "#004085" }}>
                    <strong>Stock Thresholds:</strong> Set minimum stock to trigger low stock alerts. 
                    Maximum stock helps prevent overstocking. Reorder quantity suggests how much to order when restocking.
                  </div>
                </div>
              </div>

              {/* ==================== SECTION 5: SUPPLIER & PROCUREMENT ==================== */}
              <div className="col-12 mt-5">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>5</div>
                  Supplier & Procurement (Optional)
                </div>
              </div>

              <div className="col-md-4">
               <label style={labelStyle}>Preferred Supplier</label>
                <select
  name="supplier_id"
  value={formData.supplier_id}
  onChange={handleChange}
  className="form-select"
  style={inputStyle}
  disabled={!Array.isArray(suppliers) || suppliers.length === 0}
>
  <option value="">Select Supplier</option>

  {Array.isArray(suppliers) &&
    suppliers.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
</select>


              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Lead Time (Days)</label>
                <input
                  type="number"
                  min="0"
                  name="lead_time"
                  value={formData.lead_time}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>Preferred Purchase Quantity</label>
                <input
                  type="number"
                  min="0"
                  name="preferred_purchase_qty"
                  value={formData.preferred_purchase_qty}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              {/* ==================== SECTION 6: NOTES ==================== */}
              <div className="col-12 mt-5">
                <div style={sectionTitle}>
                  <div className="badge bg-primary" style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>6</div>
                  Additional Notes
                </div>
              </div>

              <div className="col-12">
                <label style={labelStyle}>Internal Notes & Remarks</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                  style={{ borderRadius: "8px", fontSize: "14px" }}
                  placeholder="Add any additional information about this item (storage instructions, handling notes, etc.)"
                />
              </div>

              {/* ==================== ACTIONS ==================== */}
              <div className="col-12 d-flex justify-content-end gap-3 pt-4 mt-4 border-top">
                <button
  type="button"
  className="btn btn-danger d-flex align-items-center gap-2"
  onClick={() => navigate("/aims")}
  disabled={loading}
>
  Cancel
</button>


                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: "8px", padding: "12px 32px" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <MdSave size={18} />
                      Save Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}