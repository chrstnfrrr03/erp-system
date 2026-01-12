import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import aimsApi from "../../aimsApi";
import {
  MdInventory,
  MdWarning,
  MdCheckCircle,
  MdSearch,
  MdEdit,
  MdDelete,
  MdDownload,
  MdAdd,
} from "react-icons/md";

export default function AIMSInventoryList() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // FETCH ITEMS
  // ==========================================================
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await aimsApi.get("/items");
        setInventory(res.data.data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ==========================================================
  // KPI COUNTS (MATCH SCREENSHOT)
  // ==========================================================
  const totalItems = inventory.length;

  const lowStock = inventory.filter(
    (i) => i.quantity > 0 && i.quantity <= i.preferred_quantity
  ).length;

  const inStock = inventory.filter(
    (i) => i.quantity > i.preferred_quantity
  ).length;

  const outOfStock = inventory.filter(
    (i) => i.quantity === 0
  ).length;

  return (
    <Layout>
      <div className="container-fluid px-4">

        {/* TITLE */}
        <h3 className="fw-bold mb-1">Inventory List</h3>
        <p className="text-muted mb-3">
          Centralized overview of all inventory records
        </p>

        {/* KPI CARDS */}
        <div className="row g-3 mb-4">
          <KPI
            title="Total Items"
            value={totalItems}
            icon={<MdInventory size={24} />}
            color="primary"
          />
          <KPI
            title="Low Stock"
            value={lowStock}
            icon={<MdWarning size={24} />}
            color="warning"
          />
          <KPI
            title="In Stock"
            value={inStock}
            icon={<MdCheckCircle size={24} />}
            color="success"
          />
        </div>

        {/* FILTER BAR (SCREENSHOT STYLE) */}
        <div className="card mb-3 shadow-sm">
          <div className="card-body d-flex flex-wrap align-items-center gap-2">

            {/* SEARCH */}
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-light border-0">
                <MdSearch className="text-muted" />
              </span>
              <input
                className="form-control bg-light border-0"
                placeholder="Search by item name, code, or category"
              />
            </div>

            {/* CATEGORY */}
            <select
              className="form-select bg-light border-0"
              style={{ maxWidth: 180 }}
            >
              <option>All Categories</option>
            </select>

            {/* STATUS */}
            <select
              className="form-select bg-light border-0"
              style={{ maxWidth: 160 }}
            >
              <option>All Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>

            {/* APPLY */}
            <button className="btn btn-primary px-4">
              Apply
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="d-flex justify-content-end gap-2 p-3 border-bottom">
            <button className="btn btn-sm btn-outline-primary">
              <MdDownload className="me-1" /> Export
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={() => navigate("/aims/add-item")}
            >
              <MdAdd className="me-1" /> Add Item
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="text-center" style={{ width: 120 }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No inventory records found
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <InventoryRow
                      key={item.id}
                      item={item}
                      onEdit={() =>
                        navigate(`/aims/items/${item.id}/edit`)
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ==========================================================
   KPI CARD
========================================================== */
function KPI({ title, value, icon, color }) {
  return (
    <div className="col-md-4">
      <div className={`card shadow-sm border-start border-4 border-${color}`}>
        <div className="card-body d-flex gap-3 align-items-center">
          <div className={`text-${color}`}>{icon}</div>
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="fs-4 fw-bold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   INVENTORY ROW (USES SKU AS ITEM CODE)
========================================================== */
function InventoryRow({ item, onEdit }) {
  let status = "In Stock";
  let badge = "success";

  if (item.quantity === 0) {
    status = "Out of Stock";
    badge = "danger";
  } else if (item.quantity <= item.preferred_quantity) {
    status = "Low Stock";
    badge = "warning";
  }

  return (
    <tr>
      <td className="fw-semibold">{item.sku}</td>
      <td>{item.name}</td>
      <td>{item.category}</td>
      <td>{item.quantity}</td>
      <td>{item.unit}</td>
      <td>
        <span className={`badge rounded-pill bg-${badge} px-3`}>
          {status}
        </span>
      </td>
      <td>{item.updated_at}</td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1 align-items-start">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={onEdit}
          >
            <MdEdit />
          </button>
          <button className="btn btn-sm btn-outline-danger">
            <MdDelete />
          </button>
        </div>
      </td>
    </tr>
  );
}
