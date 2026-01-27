import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";


import { MdSearch, MdAdd, MdVisibility } from "react-icons/md";

export default function AIMSPurchaseRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const fetchRequests = async () => {
    try {
      const res = await baseApi.get("/api/aims/purchase-requests");
      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((r) => {
        const firstItem = r.items?.[0];

        return {
          id: r.id,
          pr_number: r.pr_number,
          item_name: firstItem?.item?.name || "—",
          quantity: firstItem?.quantity || 0,
          request_date: r.request_date,
          requested: r.requester?.name || "—",
          status: r.status,
        };
      });

      setRequests(normalized);
      setFilteredRequests(normalized);
    } catch (err) {
      console.error("Failed to load purchase requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let data = [...requests];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.pr_number?.toLowerCase().includes(keyword) ||
          r.item_name?.toLowerCase().includes(keyword)
      );
    }

    if (status !== "All") {
      data = data.filter((r) => r.status === status);
    }

    setFilteredRequests(data);
  }, [search, status, requests]);

  const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-warning text-dark";
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};


  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
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
                    placeholder="Search by PR number or item"
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
                  <option value="rejected">Rejected</option>
                </select>
              </div>

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
                  <th className="text-center">Actions</th>
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
                    <tr key={pr.id}>
                      <td className="fw-semibold">{pr.pr_number}</td>
                      <td>{pr.item_name}</td>
                      <td>{pr.quantity}</td>
                      <td>{pr.request_date}</td>
                      <td>{pr.requested}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${getStatusBadgeClass(
                            pr.status
                          )}`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigate(`/aims/purchase-requests/${pr.id}`)
                          }
                        >
                          <MdVisibility />
                        </button>
                      </td>
                    </tr>
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
