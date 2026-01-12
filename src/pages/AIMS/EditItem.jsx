import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { MdSave } from "react-icons/md";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import aimsApi from "../../aimsApi";

export default function EditItem() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [formData, setFormData] = useState({
    item_type: "",
    status: "",
    location: "",

    name: "",
    sku: "",
    category: "",

    cost_price: "",
    selling_price: "",
    minimum_stock: "",

    tax_category: "",
    valuation_method: "",
  });

  // ==========================================================
  // FETCH ITEM
  // ==========================================================
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await aimsApi.get(`/items/${id}`);

        setFormData({
          item_type: res.data.item_type,
          status: res.data.status,
          location: res.data.location,

          name: res.data.name,
          sku: res.data.sku,
          category: res.data.category,

          cost_price: res.data.cost_price,
          selling_price: res.data.selling_price,
          minimum_stock: res.data.minimum_stock ?? 0,

          tax_category: res.data.tax_category,
          valuation_method: res.data.valuation_method,
        });
      } catch (err) {
        Swal.fire("Error", "Failed to load item", "error");
        navigate("/aims/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

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
      await aimsApi.put(`/items/${id}`, {
        ...formData,
        cost_price: Number(formData.cost_price),
        selling_price: Number(formData.selling_price),
        minimum_stock: Number(formData.minimum_stock),
      });

      await Swal.fire({
        icon: "success",
        title: "Item Updated",
        text: "Inventory item has been updated successfully.",
      });

      navigate("/aims/inventory");
    } catch (err) {
      Swal.fire(
        "Update Failed",
        err.response?.data?.message || "Please check input values.",
        "error"
      );
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">Loading item...</div>
      </Layout>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        <h1 className="fw-bold mb-3">Edit Inventory Item</h1>

        <div className="card shadow-sm">
          <div className="card-body">
            <form className="row g-4" onSubmit={handleSubmit}>

              <div className="col-md-6">
                <label className="form-label">Item Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">SKU</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Selling Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Minimum Stock</label>
                <input
                  type="number"
                  min="0"
                  name="minimum_stock"
                  value={formData.minimum_stock}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-12 d-flex justify-content-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => navigate("/aims/inventory")}
                >
                  Cancel
                </button>

                <button className="btn btn-primary" type="submit">
                  <MdSave className="me-1" /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
