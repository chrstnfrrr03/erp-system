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
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  // BULK SELECTION
  const [selectedItems, setSelectedItems] = useState([]);

  /* ==========================================================
     FETCH ITEMS
  ========================================================== */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await aimsApi.get("/items");
        setInventory(res.data.data);
        setFilteredInventory(res.data.data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  /* ==========================================================
     AUTO FILTERING (REACTIVE)
  ========================================================== */
  useEffect(() => {
    let data = [...inventory];

    // SEARCH
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.name?.toLowerCase().includes(keyword) ||
          i.sku?.toLowerCase().includes(keyword) ||
          i.category?.toLowerCase().includes(keyword)
      );
    }

    // CATEGORY
    if (category !== "All") {
      data = data.filter((i) => i.category === category);
    }

    // STATUS
    if (status !== "All") {
      data = data.filter((i) => {
        if (status === "In Stock")
          return i.quantity > i.preferred_quantity;
        if (status === "Low Stock")
          return i.quantity > 0 && i.quantity <= i.preferred_quantity;
        if (status === "Out of Stock") return i.quantity === 0;
        return true;
      });
    }

    setFilteredInventory(data);
    setSelectedItems([]); // reset bulk selection on filter change
  }, [search, category, status, inventory]);

  /* ==========================================================
     BULK HELPERS
  ========================================================== */
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredInventory.map((i) => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ==========================================================
     KPI COUNTS
  ========================================================== */
  const totalItems = filteredInventory.length;

  const lowStock = filteredInventory.filter(
    (i) => i.quantity > 0 && i.quantity <= i.preferred_quantity
  ).length;

  const inStock = filteredInventory.filter(
    (i) => i.quantity > i.preferred_quantity
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
          <KPI title="Total Items" value={totalItems} icon={<MdInventory />} color="primary" />
          <KPI title="Low Stock" value={lowStock} icon={<MdWarning />} color="warning" />
          <KPI title="In Stock" value={inStock} icon={<MdCheckCircle />} color="success" />
        </div>

        {/* FILTER BAR */}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <select
              className="form-select bg-light border-0"
              style={{ maxWidth: 180 }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {[...new Set(inventory.map((i) => i.category))].map(
                (cat) =>
                  cat && (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
              )}
            </select>

            {/* STATUS */}
            <select
              className="form-select bg-light border-0"
              style={{ maxWidth: 160 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedItems.length > 0 && (
          <div className="alert alert-light border d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">
              {selectedItems.length} item(s) selected
            </span>

            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-danger">
                <MdDelete className="me-1" /> Delete Selected
              </button>
              <button className="btn btn-sm btn-outline-primary">
                <MdDownload className="me-1" /> Export Selected
              </button>
            </div>
          </div>
        )}

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
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredInventory.length > 0 &&
                        selectedItems.length === filteredInventory.length
                      }
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <InventoryRow
                      key={item.id}
                      item={item}
                      isSelected={selectedItems.includes(item.id)}
                      onSelect={toggleSelectItem}
                      onEdit={() => navigate(`/aims/items/${item.id}/edit`)}
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
      <div
        className="card shadow-sm"
        style={{ borderLeft: `5px solid var(--bs-${color})` }}
      >
        <div className="card-body d-flex gap-3 align-items-center">
          <div className={`text-${color} fs-4`}>{icon}</div>
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
   INVENTORY ROW
========================================================== */
function InventoryRow({ item, onEdit, isSelected, onSelect }) {
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
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(item.id)}
        />
      </td>
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
        <div className="d-flex justify-content-center gap-1">
          <button className="btn btn-sm btn-outline-primary" onClick={onEdit}>
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
