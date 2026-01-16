import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import aimsApi from "../../aimsApi";
import {
  MdSearch,
  MdAdd,
  MdVisibility,
  MdEdit,
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
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // replace endpoint when backend is ready
        const res = await aimsApi.get("/request-orders");
        setOrders(res.data.data);
        setFilteredOrders(res.data.data);
      } catch (err) {
        console.error("Failed to load request orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ==========================================================
     AUTO FILTERING
  ========================================================== */
  useEffect(() => {
    let data = [...orders];

    // SEARCH
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.po_number?.toLowerCase().includes(keyword) ||
          o.supplier?.toLowerCase().includes(keyword)
      );
    }

    // STATUS
    if (status !== "All") {
      data = data.filter((o) => o.status === status);
    }

    setFilteredOrders(data);
  }, [search, status, orders]);

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE + CLOSE */}
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

              {/* SEARCH */}
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

              {/* STATUS */}
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

              {/* CREATE */}
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
                  <th className="text-center" style={{ width: "120px" }}>
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
}) {
  let badge = "secondary";

  if (status === "approved") badge = "success";
  if (status === "pending") badge = "warning";
  if (status === "cancelled") badge = "danger";

  return (
    <tr>
      <td className="fw-semibold">{po_number}</td>
      <td>{supplier}</td>
      <td>{order_date}</td>
      <td>
        <span className={`badge rounded-pill bg-${badge}`}>
          {status}
        </span>
      </td>
      <td>{total_amount}</td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button className="btn btn-sm btn-outline-primary">
            <MdVisibility />
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <MdEdit />
          </button>
        </div>
      </td>
    </tr>
  );
}
