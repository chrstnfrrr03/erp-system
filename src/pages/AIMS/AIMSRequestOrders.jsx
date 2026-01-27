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

export default function AIMSRequestOrders() {
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
      const res = await baseApi.get("/api/aims/request-orders");

      const normalized = (res.data.data || []).map((o) => ({
        ...o,
        supplier:
          typeof o.supplier === "object" ? o.supplier?.name : o.supplier,
      }));

      setOrders(normalized);
      setFilteredOrders(normalized);
    } catch (err) {
      console.error("Failed to load request orders", err);
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
          o.po_number?.toLowerCase().includes(keyword) ||
          o.supplier?.toLowerCase().includes(keyword)
      );
    }

    if (status !== "All") {
      data = data.filter((o) => o.status === status);
    }

    setFilteredOrders(data);
  }, [search, status, orders]);

  /* ==========================================================
     APPROVE REQUEST ORDER (AUTO STOCK IN)
  ========================================================== */
  const handleApprove = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Approve Request Order?",
      text: "Approving will automatically stock in all items.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.post(`/api/aims/request-orders/${orderId}/approve`);

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Stock updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchOrders();
    } catch (error) {
      Swal.fire("Error", "Failed to approve request order", "error");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Request Orders</h1>
            <p className="text-muted mb-0">
              Manage and track purchase order requests
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
                    placeholder="Search by PO number or supplier"
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
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-6 col-md-5 text-end">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/aims/request-orders/create")}
                >
                  <MdAdd className="me-1" />
                  Create Order
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
                  <th>PO Number</th>
                  <th>Supplier</th>
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
                      Loading request orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No request orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      {...order}
                      onView={() =>
                        navigate(`/aims/request-orders/${order.id}`)
                      }
                      onApprove={() => handleApprove(order.id)}
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
  po_number,
  supplier,
  order_date,
  status,
  total_amount,
  onView,
  onApprove,
}) {
  let badge = "secondary";
  if (status === "approved") badge = "success";
  if (status === "pending") badge = "warning";
  if (status === "cancelled") badge = "danger";

  return (
    <tr>
      <td className="fw-semibold">{po_number}</td>
      <td>{typeof supplier === "object" ? supplier?.name : supplier}</td>
      <td>{order_date}</td>
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
              onClick={onApprove}
            >
              Approve
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
