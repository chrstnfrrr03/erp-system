import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

import { MdAdd, MdDelete } from "react-icons/md";

export default function AIMSSalesOrderCreate() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    so_number: "",
    customer_id: "",
    order_date: new Date().toISOString().split("T")[0],
  });

  const [rows, setRows] = useState([]);

  /* ===============================
     AUTO SO NUMBER
  =============================== */
  const generateSONumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SO-${year}-${random}`;
  };

  /* ===============================
     FETCH DATA
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, customersRes] = await Promise.all([
          baseApi.get("/api/aims/items"),
          baseApi.get("/api/aims/customers"),
        ]);

        const itemsData =
          itemsRes?.data?.data ||
          itemsRes?.data?.items ||
          itemsRes?.data ||
          [];

        const customersData =
          customersRes?.data?.data ||
          customersRes?.data?.customers ||
          customersRes?.data ||
          [];

        setItems(Array.isArray(itemsData) ? itemsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);

        setForm((prev) => ({
          ...prev,
          so_number: generateSONumber(),
        }));
      } catch (error) {
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     ROW HANDLERS
  =============================== */
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { item_id: "", quantity: 1, unit_price: 0 },
    ]);
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

  /* ===============================
     TOTAL
  =============================== */
  const totalAmount = rows.reduce(
    (sum, r) => sum + r.quantity * r.unit_price,
    0
  );

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_id) {
      return Swal.fire("Error", "Please select a customer", "error");
    }

    if (rows.length === 0) {
      return Swal.fire("Error", "Add at least one item", "error");
    }

    try {
      await baseApi.post("/api/aims/sales-orders", {
        ...form,
        items: rows,
      });

      Swal.fire({
        icon: "success",
        title: "Sales Order Created",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/aims/setup/sales-order");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create sales order", "error");
    }
  };

  /* ===============================
     LOADING
  =============================== */
  if (loading) {
    return (
      <Layout>
        <div className="container-fluid p-4 text-center text-muted">
          Loading data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        <h1 className="fw-bold mb-3">Create Sales Order</h1>

        <form onSubmit={handleSubmit}>
          {/* ORDER INFO */}
          <div className="card shadow-sm mb-3">
            <div className="card-body row g-3">
              <div className="col-md-4">
                <label className="form-label">SO Number</label>
                <input className="form-control" value={form.so_number} readOnly />
              </div>

              <div className="col-md-4">
                <label className="form-label">Customer</label>
                <select
                  className="form-select"
                  required
                  value={form.customer_id}
                  onChange={(e) =>
                    setForm({ ...form, customer_id: e.target.value })
                  }
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Order Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.order_date}
                  onChange={(e) =>
                    setForm({ ...form, order_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="card shadow-sm mb-3">
            <div className="card-header d-flex align-items-center">
              <span className="fw-semibold">Order Items</span>

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
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th width="100">Qty</th>
                    <th width="150">Unit Price</th>
                    <th width="150">Total</th>
                    <th width="80"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No items added
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <select
                            className="form-select"
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
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={row.unit_price}
                            onChange={(e) =>
                              updateRow(i, "unit_price", Number(e.target.value))
                            }
                          />
                        </td>

                        <td>{(row.quantity * row.unit_price).toFixed(2)}</td>

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
          <div className="d-flex justify-content-between">
            <strong>Total: {totalAmount.toFixed(2)}</strong>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => navigate("/aims/setup/sales-order")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Sales Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}