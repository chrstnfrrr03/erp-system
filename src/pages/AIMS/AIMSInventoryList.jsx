import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";

import {
  MdRemoveCircle,
  MdInventory,
  MdWarning,
  MdCheckCircle,
  MdEdit,
  MdDelete,
  MdAdd,
  MdAttachMoney,
  MdTrendingDown,
} from "react-icons/md";

import Swal from "sweetalert2";

export default function AIMSInventoryList() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [itemType, setItemType] = useState("All");

  // BULK SELECTION
  const [selectedItems, setSelectedItems] = useState([]);

  /* ==========================================================
     FETCH ITEMS
  ========================================================== */
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await baseApi.get("/api/aims/items");
      const data = res.data.data || res.data;
      setInventory(data);
      setFilteredInventory(data);
    } catch (err) {
      Swal.fire("Error", "Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     FILTER OPTIONS (AUTO)
  ========================================================== */
  const categories = useMemo(
    () => ["All", ...new Set(inventory.map((i) => i.category).filter(Boolean))],
    [inventory]
  );

  const itemTypes = useMemo(
    () =>
      ["All", ...new Set(inventory.map((i) => i.item_type).filter(Boolean))],
    [inventory]
  );


  /* ==========================================================
   STOCK OUT HANDLER (AUTO INVENTORY)
========================================================== */
const handleStockOut = async (item) => {
  const { value: quantity } = await Swal.fire({
    title: "Stock Out",
    input: "number",
    inputLabel: `Current Stock: ${item.current_stock}`,
    inputPlaceholder: "Enter quantity to deduct",
    inputAttributes: { min: 1, step: 1 },
    showCancelButton: true,
    confirmButtonText: "Confirm",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#dc3545",
  });

  const qty = Number(quantity);
  if (!qty || qty <= 0) return;

  if (qty > item.current_stock) {
    return Swal.fire("Error", "Quantity exceeds available stock", "error");
  }

  try {
    await baseApi.post("/api/aims/stock-out", {
      item_id: item.id,
      quantity: qty,
      remarks: "Manual stock out",
    });

    Swal.fire("Success", "Stock deducted successfully", "success");
    fetchItems();
  } catch {
    Swal.fire("Error", "Failed to stock out item", "error");
  }
};


const handleStockIn = async (item) => {
  const { value: quantity } = await Swal.fire({
    title: "Stock In",
    input: "number",
    inputLabel: `Current Stock: ${item.current_stock}`,
    inputPlaceholder: "Enter quantity to add",
    inputAttributes: { min: 1, step: 1 },
    showCancelButton: true,
    confirmButtonText: "Confirm",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#dc3545",
  });

  const qty = Number(quantity);
  if (!qty || qty <= 0) return;

  try {
    await baseApi.post("/api/aims/stock-in", {
      item_id: item.id,
      quantity: qty,
      remarks: "Manual stock in",
    });

    Swal.fire("Success", "Stock added successfully", "success");
    fetchItems();
  } catch {
    Swal.fire("Error", "Failed to stock in item", "error");
  }
};



  /* ==========================================================
     AUTO FILTERING
  ========================================================== */
  useEffect(() => {
    let data = [...inventory];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.name?.toLowerCase().includes(keyword) ||
          i.sku?.toLowerCase().includes(keyword) ||
          i.category?.toLowerCase().includes(keyword) ||
          i.brand?.toLowerCase().includes(keyword)
      );
    }

    if (category !== "All") {
      data = data.filter((i) => i.category === category);
    }

    if (itemType !== "All") {
      data = data.filter((i) => i.item_type === itemType);
    }

    if (status !== "All") {
      data = data.filter((i) => {
        const current = i.current_stock || 0;
        const min = i.minimum_stock || 0;
        const max = i.maximum_stock || 0;

        if (status === "In Stock") return current > min;
        if (status === "Low Stock") return current > 0 && current <= min;
        if (status === "Out of Stock") return current === 0;
        if (status === "Overstock") return max > 0 && current > max;

        return true;
      });
    }

    setFilteredInventory(data);
    setSelectedItems([]);
  }, [search, category, status, itemType, inventory]);

  /* ==========================================================
     BULK HELPERS
  ========================================================== */
  const toggleSelectAll = (checked) => {
    setSelectedItems(checked ? filteredInventory.map((i) => i.id) : []);
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ==========================================================
     DELETE HANDLERS
  ========================================================== */
  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Delete Item?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#dc3545",
  });

  if (!confirm.isConfirmed) return;

  await baseApi.delete(`/api/aims/items/${id}`);
  fetchItems();
  Swal.fire("Deleted", "Item removed", "success");
};

 const handleBulkDelete = async () => {
  const confirm = await Swal.fire({
    title: `Delete ${selectedItems.length} Items?`,
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#dc3545",
  });

  if (!confirm.isConfirmed) return;

  await Promise.all(
    selectedItems.map((id) => aimsApi.delete(`/items/${id}`))
  );

  setSelectedItems([]);
  fetchItems();
  Swal.fire("Deleted", "Selected items removed", "success");
};


  /* ==========================================================
     KPI CALCULATIONS
  ========================================================== */
  const totalItems = filteredInventory.length;

  const lowStock = filteredInventory.filter((i) => {
    const current = i.current_stock || 0;
    const min = i.minimum_stock || 0;
    return current > 0 && current <= min;
  }).length;

  const inStock = filteredInventory.filter((i) => {
    const current = i.current_stock || 0;
    const min = i.minimum_stock || 0;
    return current > min;
  }).length;

  const outOfStock = filteredInventory.filter(
    (i) => (i.current_stock || 0) === 0
  ).length;

  const totalValue = filteredInventory.reduce(
    (sum, i) => sum + (i.current_stock || 0) * (i.cost_price || 0),
    0
  );

  /* ==========================================================
     RENDER
  ========================================================== */
  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4 py-4">
        {/* HEADER */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="fw-bold mb-1">Inventory Management</h1>
            <p className="text-muted mb-0">
              Monitor stock levels and valuation
            </p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => navigate("/aims/add-item")}
            >
              <MdAdd /> Add Item
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="row g-3 mb-4">
          <KPI title="Total Items" value={totalItems} icon={<MdInventory />} color="primary" />
          <KPI title="Low Stock" value={lowStock} icon={<MdWarning />} color="warning" />
          <KPI title="In Stock" value={inStock} icon={<MdCheckCircle />} color="success" />
          <KPI title="Out of Stock" value={outOfStock} icon={<MdTrendingDown />} color="danger" />
          <KPI
            title="Total Value"
            value={`$${totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
            icon={<MdAttachMoney />}
            color="info"
          />
        </div>

        {/* FILTERS */}
        <div className="card mb-3 p-3">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search name, SKU, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                {itemTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
                <option>Overstock</option>
              </select>
            </div>
          </div>
        </div>

        {/* BULK BAR */}
        {selectedItems.length > 0 && (
          <div className="alert alert-light d-flex justify-content-between">
            <span>{selectedItems.length} selected</span>
            <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>
              <MdDelete /> Delete Selected
            </button>
          </div>
        )}

        {/* TABLE (SCROLL KEPT) */}
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
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
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Cost</th>
                  <th>Selling</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-4 text-muted">
                      No items found
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
  onDelete={handleDelete}
  handleStockOut={handleStockOut}
  handleStockIn={handleStockIn}
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
    <div className="col-md col-sm-6">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex gap-3 align-items-center">
          <div className={`text-${color}`} style={{ fontSize: "28px" }}>
            {icon}
          </div>
          <div>
            <div className="text-muted small">{title}</div>
            <div className="fw-bold fs-4">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   INVENTORY ROW
========================================================== */
function InventoryRow({
  item,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  handleStockOut,
  handleStockIn,
}) {

  const current = item.current_stock || 0;
  const min = item.minimum_stock || 0;
  const max = item.maximum_stock || 0;

  let status = "In Stock";
  let badge = "success";

  if (current === 0) {
    status = "Out of Stock";
    badge = "danger";
  } else if (current <= min) {
    status = "Low Stock";
    badge = "warning";
  } else if (max > 0 && current > max) {
    status = "Overstock";
    badge = "info";
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
      <td>{item.sku}</td>
      <td className="fw-semibold">{item.name}</td>
      <td>{item.item_type}</td>
      <td>{item.category}</td>
      <td>{item.brand || "-"}</td>
      <td>{current}</td>
      <td>{item.unit}</td>
      <td>${Number(item.cost_price || 0).toFixed(2)}</td>
      <td>${Number(item.selling_price || 0).toFixed(2)}</td>
      <td>
        <span className={`badge bg-${badge}`}>{status}</span>
      </td>
      <td>{item.location || "-"}</td>
      <td className="text-center">
  <button
    className="btn btn-sm btn-outline-success me-1"
    title="Stock In"
    onClick={() => handleStockIn(item)}
  >
    <MdAdd />
  </button>

  <button
    className="btn btn-sm btn-outline-danger me-1"
    title="Stock Out"
    onClick={() => handleStockOut(item)}
    disabled={current === 0}
  >
    <MdRemoveCircle />
  </button>

  <button className="btn btn-sm btn-outline-primary me-1" onClick={onEdit}>
    <MdEdit />
  </button>

  <button
    className="btn btn-sm btn-outline-danger"
    onClick={() => onDelete(item.id)}
  >
    <MdDelete />
  </button>
</td>


    </tr>
  );
}
