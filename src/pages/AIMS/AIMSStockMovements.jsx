import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import {
  MdSearch,
  MdSwapHoriz,
  MdVisibility,
  MdAdd,
} from "react-icons/md";

export default function AIMSStockMovements() {
  const navigate = useNavigate();
  const movements = [];

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE + CLOSE */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Stock Movements</h1>
            <p className="text-muted mb-0">
              Track all inventory stock in and out transactions
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

        {/* TOP CONTROLS */}
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
                    placeholder="Search by item or reference"
                  />
                </div>
              </div>

              {/* MOVEMENT TYPE */}
              <div className="col-6 col-md-3">
                <select className="form-select">
                  <option value="">Movement Type: All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>

              {/* ADD NEW */}
              <div className="col-6 col-md-5 text-end">
                <button className="btn btn-primary">
                  <MdAdd className="me-1" />
                  Add New
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
                  <th>Date & Time</th>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Movement Type</th>
                  <th>Reference ID</th>
                  <th className="text-center" style={{ width: "100px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No stock movement records
                    </td>
                  </tr>
                ) : (
                  movements.map((move) => (
                    <StockMovementRow key={move.id} {...move} />
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

/* TABLE ROW */
function StockMovementRow({
  datetime,
  item_id,
  item_name,
  type,
  reference,
}) {
  return (
    <tr>
      <td>{datetime}</td>
      <td>{item_id}</td>
      <td>{item_name}</td>
      <td>
        <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
          <MdSwapHoriz />
          {type}
        </span>
      </td>
      <td>{reference}</td>
      <td className="text-center">
        <button className="btn btn-sm btn-outline-primary">
          <MdVisibility />
        </button>
      </td>
    </tr>
  );
}
