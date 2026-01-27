import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

export default function AIMSRequestOrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ==========================================================
     FETCH REQUEST ORDER
  ========================================================== */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await baseApi.get(`/api/aims/request-orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Failed to load request order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ==========================================================
     APPROVE REQUEST ORDER
  ========================================================== */
  const handleApprove = async () => {
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
      await baseApi.post(`/api/aims/request-orders/${order.id}/approve`);

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Stock updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/aims/request-orders");
    } catch (error) {
      Swal.fire("Error", "Failed to approve request order", "error");
    }
  };

  /* ==========================================================
     STATUS BADGE
  ========================================================== */
  const statusBadge = (status) => {
    let badge = "secondary";
    if (status === "approved") badge = "success";
    if (status === "pending") badge = "warning";
    if (status === "cancelled") badge = "danger";

    return (
      <span className={`badge rounded-pill bg-${badge}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* HEADER */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">View Request Order</h1>
            <p className="text-muted mb-0">
              Purchase Order Details
            </p>
          </div>

          <div className="col-auto">
            <button
              className="btn btn-outline-danger"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : !order ? (
          <div className="text-center text-muted py-4">
            Request order not found
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">

              {/* ORDER INFO */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <strong>PO Number</strong>
                  <div>{order.po_number}</div>
                </div>

                <div className="col-md-4">
                  <strong>Supplier</strong>
                  <div>{order.supplier?.name || order.supplier}</div>
                </div>

                <div className="col-md-4">
                  <strong>Status</strong>
                  <div>{statusBadge(order.status)}</div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <strong>Order Date</strong>
                  <div>{order.order_date}</div>
                </div>

                <div className="col-md-4">
                  <strong>Total Amount</strong>
                  <div>{Number(order.total_amount).toFixed(2)}</div>
                </div>
              </div>

              <hr />

              {/* ITEMS */}
              <h6 className="fw-bold mb-3">Items</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((row) => (
                      <tr key={row.id}>
                        <td>{row.item?.name}</td>
                        <td className="text-center">{row.quantity}</td>
                        <td className="text-end">
                          {Number(row.unit_cost).toFixed(2)}
                        </td>
                        <td className="text-end">
                          {Number(row.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTIONS */}
              {order.status === "pending" && (
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-success"
                    onClick={handleApprove}
                  >
                    Approve Order
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
