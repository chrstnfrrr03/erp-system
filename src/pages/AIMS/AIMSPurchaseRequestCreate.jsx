import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

import { MdAdd, MdDelete } from "react-icons/md";

export default function AIMSPurchaseRequestCreate() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pr_number: "",
    request_date: "",
    notes: "",
  });

  const [rows, setRows] = useState([]);

  /* ==========================================================
     AUTO GENERATE PR NUMBER
     Example: PR-2026-0001
  ========================================================== */
  const generatePRNumber = async () => {
    try {
      const res = await baseApi.get("/api/aims/purchase-requests/latest");
      const last = Number(res.data?.last_number || 0);
      const next = String(last + 1).padStart(4, "0");

      setForm((prev) => ({
        ...prev,
        pr_number: `PR-${new Date().getFullYear()}-${next}`,
      }));
    } catch {
      setForm((prev) => ({
        ...prev,
        pr_number: `PR-${new Date().getFullYear()}-0001`,
      }));
    }
  };

  /* ==========================================================
     FETCH ITEMS
  ========================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await baseApi.get("/api/aims/items");
        setItems(res.data.data || []);
        await generatePRNumber();
      } catch {
        Swal.fire("Error", "Failed to load items", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ==========================================================
     ROW MANAGEMENT
  ========================================================== */
  const addRow = () => {
    setRows((prev) => [...prev, { item_id: "", quantity: 1 }]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.request_date) {
      return Swal.fire("Error", "Request date is required", "error");
    }

    if (rows.length === 0) {
      return Swal.fire("Error", "Add at least one item", "error");
    }

    const invalidRow = rows.find(
      (r) => !r.item_id || r.quantity <= 0
    );

    if (invalidRow) {
      return Swal.fire(
        "Error",
        "All items must have valid quantity",
        "error"
      );
    }

    setSubmitting(true);

    try {
      await baseApi.post("/api/aims/purchase-requests", {
        ...form,
        items: rows,
      });

      Swal.fire({
        icon: "success",
        title: "Purchase Request Created",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/aims/purchase-requests");
    } catch {
      Swal.fire("Error", "Failed to create purchase request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     LOADING STATE
  ========================================================== */
  if (loading) {
    return (
      <Layout>
        <div className="container-fluid p-4 text-center text-muted">
          Loading purchase request form...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* HEADER */}
        <div className="row mb-3">
          <div className="col">
            <h1 className="fw-bold">Create Purchase Request</h1>
            <p className="text-muted mb-0">
              Request items to be purchased for inventory
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* REQUEST INFO */}
          <div className="card shadow-sm mb-3">
            <div className="card-body row g-3">

              <div className="col-md-4">
                <label className="form-label">PR Number</label>
                <input
                  className="form-control"
                  value={form.pr_number}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Request Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={form.request_date}
                  onChange={(e) =>
                    setForm({ ...form, request_date: e.target.value })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Notes</label>
                <input
                  className="form-control"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>

            </div>
          </div>

          {/* ITEMS */}
          <div className="card shadow-sm mb-3">
            <div className="card-header d-flex align-items-center">
  <span className="fw-semibold">Requested Items</span>

  <button
    type="button"
    className="btn btn-sm btn-primary ms-auto"
    onClick={addRow}
  >
    <MdAdd className="me-1" />
    Add Item
  </button>
</div>


            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th width="120">Quantity</th>
                    <th width="80"></th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        No items added
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <select
                            className="form-select"
                            required
                            value={row.item_id}
                            onChange={(e) =>
                              updateRow(i, "item_id", e.target.value)
                            }
                          >
                            <option value="">Select item</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(i, "quantity", Number(e.target.value))
                            }
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeRow(i)}
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/aims/purchase-requests")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}
