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

  /* ==========================================================
     FETCH MOVEMENTS
  ========================================================== */
  useEffect(() => {
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

    fetchMovements();
  }, []);

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
              <button
                className="btn btn-success"
                onClick={() => navigate("/aims/stock-movements/add")}
              >
                <MdAdd className="me-1" />
                Add Movement
              </button>
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
                  <th>Reference</th>
                  <th className="text-center" style={{ width: "90px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading stock movements...
                    </td>
                  </tr>
                ) : filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No stock movement records found
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((move) => (
                    <StockMovementRow key={move.id} movement={move} />
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
function StockMovementRow({ movement }) {
  const badge =
    movement.type === "IN" ? "success" : "danger";

  return (
    <tr>
      <td>{movement.datetime}</td>
      <td className="fw-semibold">{movement.item_id}</td>
      <td>{movement.item_name}</td>
      <td>
        <span className={`badge bg-${badge} rounded-pill px-3`}>
          <MdSwapHoriz className="me-1" />
          {movement.type}
        </span>
      </td>
      <td>{movement.reference}</td>
      <td className="text-center">
        <button className="btn btn-sm btn-outline-primary">
          <MdVisibility />
        </button>
      </td>
    </tr>
  );
}
