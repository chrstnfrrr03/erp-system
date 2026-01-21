import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import aimsApi from "../../aimsApi";
import {
  MdSearch,
  MdSwapHoriz,
  MdVisibility,
  MdAdd,
  MdArrowBack,
} from "react-icons/md";

export default function AIMSStockMovements() {
  const navigate = useNavigate();

  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  // MODAL STATE
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  /* ==========================================================
     FETCH MOVEMENTS
  ========================================================== */
  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const res = await aimsApi.get("/stock-movements");
      setMovements(res.data.data || []);
      setFilteredMovements(res.data.data || []);
    } catch (err) {
      console.error("Failed to load stock movements", err);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     AUTO FILTERING
  ========================================================== */
  useEffect(() => {
    let data = [...movements];

    // SEARCH
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.item_name?.toLowerCase().includes(keyword) ||
          m.reference?.toLowerCase().includes(keyword) ||
          m.item_id?.toString().includes(keyword)
      );
    }

    // TYPE
    if (type !== "All") {
      data = data.filter((m) => m.type === type);
    }

    setFilteredMovements(data);
  }, [search, type, movements]);

  /* ==========================================================
     HANDLE VIEW
  ========================================================== */
  const handleView = async (movement) => {
    setLoadingModal(true);
    setShowModal(true);
    
    try {
      const res = await aimsApi.get(`/stock-movements/${movement.id}`);
      setSelectedMovement(res.data.data);
    } catch (err) {
      console.error("Failed to fetch movement details", err);
      setShowModal(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovement(null);
  };

  return (
    <Layout>
      <div className="container-fluid px-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fw-bold mb-1">Stock Movements</h3>
            <p className="text-muted mb-0">
              Track all inventory stock in and out transactions
            </p>
          </div>

          <button
            className="btn btn-outline-danger"
            onClick={() => navigate("/aims")}
          >
            <MdArrowBack className="me-1" />
            Back
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="card shadow-sm mb-3">
          <div className="card-body d-flex flex-wrap gap-2 align-items-center">
            {/* SEARCH */}
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-light border-0">
                <MdSearch className="text-muted" />
              </span>
              <input
                className="form-control bg-light border-0"
                placeholder="Search by item or reference"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* TYPE */}
            <select
              className="form-select bg-light border-0"
              style={{ maxWidth: 180 }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="All">All Movements</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
            </select>

            <div className="ms-auto">
              <span className="text-muted small">
  Stock movements are generated automatically by system actions
</span>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date & Time</th>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th className="text-center" style={{ width: "90px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Loading stock movements...
                    </td>
                  </tr>
                ) : filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No stock movement records found
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((move) => (
                    <StockMovementRow
                      key={move.id}
                      movement={move}
                      onView={handleView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showModal && (
        <ViewMovementModal
          movement={selectedMovement}
          loading={loadingModal}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}

/* ==========================================================
   TABLE ROW
========================================================== */
function StockMovementRow({ movement, onView }) {
  const badge = movement.type === "IN" ? "success" : "danger";

  return (
    <tr>
      <td>{movement.datetime}</td>
      <td className="fw-semibold">{movement.item_id}</td>
      <td>{movement.item_name}</td>
      <td>
        <span className={`badge bg-${badge} rounded-pill px-3 py-2`}>
          <MdSwapHoriz className="me-1" />
          {movement.type}
        </span>
      </td>
      <td className="fw-semibold">{movement.quantity}</td>
      <td>{movement.reference || "-"}</td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onView(movement)}
          title="View Details"
        >
          <MdVisibility />
        </button>
      </td>
    </tr>
  );
}

/* ==========================================================
   VIEW MODAL
========================================================== */
function ViewMovementModal({ movement, loading, onClose }) {
  if (loading || !movement) {
    return (
      <>
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
        <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mb-0">Loading movement details...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const badge = movement.type === "IN" ? "success" : "danger";
  const typeLabel = movement.type === "IN" ? "Stock In" : "Stock Out";
  const typeIcon = movement.type === "IN" ? "+" : "-";

  return (
    <>
      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {/* MODAL */}
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            {/* HEADER */}
            <div className={`modal-header bg-${badge} text-white`}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <MdSwapHoriz size={24} />
                Stock Movement Details
              </h5>
            </div>

            {/* BODY */}
            <div className="modal-body p-4">
              {/* MOVEMENT TYPE BADGE */}
              <div className="text-center mb-4">
                <span className={`badge bg-${badge} rounded-pill px-4 py-2 fs-5`}>
                  {typeIcon} {typeLabel}
                </span>
              </div>

              <div className="row g-4">
                {/* LEFT COLUMN */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="text-muted small mb-1">Movement ID</label>
                    <div className="fw-bold fs-5 text-primary">#{movement.id}</div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small mb-1">Date & Time</label>
                    <div className="fw-semibold">{movement.datetime}</div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small mb-1">Quantity</label>
                    <div className={`fw-bold fs-3 text-${badge}`}>
                      {typeIcon}{movement.quantity}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="text-muted small mb-1">Item ID</label>
                    <div className="fw-semibold">{movement.item_id}</div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small mb-1">Item Name</label>
                    <div className="fw-bold">{movement.item_name}</div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small mb-1">Reference</label>
                    <div className="fw-semibold">
                      {movement.reference || <span className="text-muted">No reference</span>}
                    </div>
                  </div>
                </div>

                {/* NOTES - FULL WIDTH */}
                {movement.notes && (
                  <div className="col-12">
                    <label className="text-muted small mb-2">Notes</label>
                    <div className="p-3 bg-light rounded border">
                      <p className="mb-0">{movement.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-danger"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}