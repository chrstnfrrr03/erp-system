import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import { MdSearch, MdAdd, MdVisibility, MdEdit } from "react-icons/md";

export default function AIMSRequestOrders() {
  const navigate = useNavigate();
  const orders = [];

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
              type="button"
              className="btn btn-outline-danger"
              onClick={() => navigate("/aims")}
              style={{
                height: "42px",
                padding: "0 18px",
                borderRadius: "8px",
                fontWeight: 500,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#dc3545";
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="card shadow-sm mb-3" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            <div className="row g-3 align-items-center">

              {/* SEARCH */}
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <MdSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by PO number or supplier"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="col-6 col-md-3">
                <select className="form-select">
                  <option value="">Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* CREATE ORDER */}
              <div className="col-6 col-md-5 text-end">
                <button className="btn btn-primary">
                  <MdAdd className="me-1" />
                  Create Order
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
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
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No request orders available
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <OrderRow key={order.id} {...order} />
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

/* ROW */
function OrderRow({
  po_number,
  supplier,
  order_date,
  status,
  total_amount,
}) {
  return (
    <tr>
      <td className="fw-semibold">{po_number}</td>
      <td>{supplier}</td>
      <td>{order_date}</td>
      <td>{status}</td>
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
