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

export default function AIMSPurchaseRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  /* ==========================================================
     FETCH PURCHASE REQUESTS
  ========================================================== */
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // replace endpoint once backend is ready
        const res = await aimsApi.get("/purchase-requests");
        setRequests(res.data.data);
        setFilteredRequests(res.data.data);
      } catch (err) {
        console.error("Failed to load purchase requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  /* ==========================================================
     AUTO FILTERING
  ========================================================== */
  useEffect(() => {
    let data = [...requests];

    // SEARCH
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.pr_number?.toLowerCase().includes(keyword) ||
          r.item_name?.toLowerCase().includes(keyword)
      );
    }

    // STATUS
    if (status !== "All") {
      data = data.filter((r) => r.status === status);
    }

    setFilteredRequests(data);
  }, [search, status, requests]);

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
                    placeholder="Search by PR number or item"
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
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* CREATE */}
              <div className="col-6 col-md-5 text-end">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/aims/purchase-requests/create")
                  }
                >
                  <MdAdd className="me-1" />
                  Create Request
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
                  <th>PR Number</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: "120px" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading purchase requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No purchase requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((pr) => (
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

/* ==========================================================
   TABLE ROW
========================================================== */
function PurchaseRequestRow({
  pr_number,
  item_name,
  quantity,
  request_date,
  requested,
  status,
}) {
  let badge = "secondary";

  if (status === "completed") badge = "success";
  if (status === "pending") badge = "warning";

  return (
    <tr>
      <td className="fw-semibold">{pr_number}</td>
      <td>{item_name}</td>
      <td>{quantity}</td>
      <td>{request_date}</td>
      <td>{requested}</td>
      <td>
        <span className={`badge rounded-pill bg-${badge}`}>
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
