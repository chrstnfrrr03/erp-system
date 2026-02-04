import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

import {
  MdSearch,
  MdAdd,
  MdVisibility,
} from "react-icons/md";

/* ==========================================================
   DATE FORMATTER (FIX – REQUIRED)
========================================================== */
const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function AIMSSalesOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  /* ==========================================================
     FETCH ORDERS
  ========================================================== */
  const fetchOrders = async () => {
    try {
      const res = await baseApi.get("/api/aims/sales-orders");

      const normalized = (res.data.data || []).map((o) => ({
        ...o,
        customer:
          typeof o.customer === "object" ? o.customer?.name : o.customer,
      }));

      setOrders(normalized);
      setFilteredOrders(normalized);
    } catch (err) {
      console.error("Failed to load sales orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ==========================================================
     AUTO FILTERING
  ========================================================== */
  useEffect(() => {
    let data = [...orders];

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.so_number?.toLowerCase().includes(keyword) ||
          o.customer?.toLowerCase().includes(keyword)
      );
    }

    if (status !== "All") {
      data = data.filter((o) => o.status === status);
    }

    setFilteredOrders(data);
  }, [search, status, orders]);

  /* ==========================================================
     FULFILL SALES ORDER (AUTO STOCK OUT)
  ========================================================== */
  const handleFulfill = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Fulfill Sales Order?",
      text: "Fulfilling will automatically stock out all items.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Fulfill",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.post(`/api/aims/sales-orders/${orderId}/fulfill`);

      Swal.fire({
        icon: "success",
        title: "Fulfilled",
        text: "Stock updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchOrders();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to fulfill sales order",
        "error"
      );
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Sales Orders</h1>
            <p className="text-muted mb-0">
              Manage and track customer sales orders
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

        {/* FILTER BAR */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-3 align-items-center">

              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <MdSearch />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search by SO number or customer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-6 col-md-3">
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="All">Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-6 col-md-5 text-end">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/aims/setup/sales-order/create")
                  }
                >
                  <MdAdd className="me-1" />
                  Create Sales Order
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>SO Number</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th className="text-center" style={{ width: "160px" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading sales orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No sales orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      {...order}
                      onView={() =>
                        navigate(`/aims/setup/sales-order/${order.id}`)
                      }
                      onFulfill={() => handleFulfill(order.id)}
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
   TABLE ROW
========================================================== */
function OrderRow({
  so_number,
  customer,
  order_date,
  status,
  total_amount,
  onView,
  onFulfill,
}) {
  let badge = "secondary";
  if (status === "fulfilled") badge = "success";
  if (status === "pending") badge = "warning";
  if (status === "cancelled") badge = "danger";

  return (
    <tr>
      <td className="fw-semibold">{so_number}</td>
      <td>{typeof customer === "object" ? customer?.name : customer}</td>
      <td>{formatDateTime(order_date)}</td>

      <td>
        <span className={`badge rounded-pill bg-${badge}`}>
          {status}
        </span>
      </td>
      <td>{Number(total_amount).toFixed(2)}</td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={onView}
          >
            <MdVisibility />
          </button>

          {status === "pending" && (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={onFulfill}
            >
              Fulfill
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
