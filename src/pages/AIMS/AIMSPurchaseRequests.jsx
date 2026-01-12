import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import { MdSearch, MdAdd, MdVisibility, MdEdit } from "react-icons/md";

export default function AIMSPurchaseRequests() {
  const navigate = useNavigate();
  const purchaseRequests = [];

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE + CLOSE */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Purchase Requests</h1>
            <p className="text-muted mb-0">
              Track and manage inventory purchase requests
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
                    placeholder="Search"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="col-6 col-md-3">
                <select className="form-select">
                  <option value="">Status: All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* CREATE REQUEST */}
              <div className="col-6 col-md-5 text-end">
                <button className="btn btn-primary">
                  <MdAdd className="me-1" />
                  Create Request
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
                  <th>PR Number</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: "120px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchaseRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No purchase requests available
                    </td>
                  </tr>
                ) : (
                  purchaseRequests.map((pr) => (
                    <PurchaseRequestRow key={pr.id} {...pr} />
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
function PurchaseRequestRow({
  pr_number,
  item_name,
  quantity,
  request_date,
  requested,
  status,
}) {
  const statusColor = status === "Completed" ? "success" : "warning";

  return (
    <tr>
      <td className="fw-semibold">{pr_number}</td>
      <td>{item_name}</td>
      <td>{quantity}</td>
      <td>{request_date}</td>
      <td>{requested}</td>
      <td>
        <span className={`badge bg-${statusColor}`}>
          {status}
        </span>
      </td>
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
