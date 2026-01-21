import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import aimsApi from "../../aimsApi";

export default function AIMSViewPurchaseRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseRequest();
  }, []);

  const fetchPurchaseRequest = async () => {
    try {
      const res = await aimsApi.get(`/purchase-requests/${id}`);
      setPr(res.data);
    } catch (err) {
      console.error("Failed to load purchase request", err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    await aimsApi.post(`/purchase-requests/${id}/approve`);
    fetchPurchaseRequest();
  };

  const reject = async () => {
    await aimsApi.post(`/purchase-requests/${id}/reject`);
    fetchPurchaseRequest();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">Loading...</div>
      </Layout>
    );
  }

  if (!pr) {
    return (
      <Layout>
        <div className="container py-5 text-center text-danger">
          Purchase Request not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid px-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold">{pr.pr_number}</h2>
            <p className="text-muted mb-0">Purchase Request Details</p>
          </div>

          <button
  className="btn btn-outline-danger"
  onClick={() => navigate("/aims/purchase-requests")}
>
  Back
</button>

        </div>

        {/* INFO */}
        <div className="card shadow-sm mb-3">
          <div className="card-body row g-3">
            <div className="col-md-4">
              <strong>Request Date</strong>
              <div>{pr.request_date}</div>
            </div>
            <div className="col-md-4">
              <strong>Requested By</strong>
              <div>{pr.requester?.name ?? "—"}</div>
            </div>
            <div className="col-md-4">
              <strong>Status</strong>
              <div className="fw-semibold">{pr.status}</div>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="card shadow-sm mb-3">
          <div className="card-header fw-semibold">Requested Items</div>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {pr.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item?.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIONS */}
        {pr.status === "Pending" && (
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={approve}>
              Approve
            </button>
            <button className="btn btn-danger" onClick={reject}>
              Reject
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}
