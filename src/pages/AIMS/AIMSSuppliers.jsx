import Layout from "../../components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import aimsApi from "../../aimsApi";
import Swal from "sweetalert2";

import { MdAdd, MdEdit, MdDelete } from "react-icons/md";

export default function AIMSSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* ===============================
     FETCH SUPPLIERS
  =============================== */
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await aimsApi.get("/suppliers");
      setSuppliers(res.data.data ?? res.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await aimsApi.put(`/suppliers/${editingId}`, form);
        Swal.fire("Updated", "Supplier updated successfully", "success");
      } else {
        await aimsApi.post("/suppliers", form);
        Swal.fire("Created", "Supplier added successfully", "success");
      }

      setForm({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
      });
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      Swal.fire("Error", "Failed to save supplier", "error");
    }
  };

  /* ===============================
     EDIT
  =============================== */
  const handleEdit = (supplier) => {
    setForm({
      name: supplier.name,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setEditingId(supplier.id);
  };

  /* ===============================
     DELETE
  =============================== */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete supplier?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await aimsApi.delete(`/suppliers/${id}`);
      Swal.fire("Deleted", "Supplier removed", "success");
      fetchSuppliers();
    } catch (err) {
      Swal.fire("Error", "Failed to delete supplier", "error");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* HEADER */}
        <div className="row mb-3">
          <div className="col">
            <h1 className="fw-bold">Suppliers</h1>
            <p className="text-muted mb-0">Manage suppliers for procurement</p>
          </div>
        </div>

        {/* FORM */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            {editingId ? "Edit Supplier" : "Add Supplier"}
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Supplier Name</label>
                <input
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-control"
                  value={form.contact_person}
                  onChange={(e) =>
                    setForm({ ...form, contact_person: e.target.value })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <MdAdd className="me-1" />
                  {editingId ? "Update Supplier" : "Add Supplier"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        name: "",
                        contact_person: "",
                        email: "",
                        phone: "",
                        address: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-semibold">
            Supplier List
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th width="120"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="fw-semibold">{supplier.name}</td>
                      <td>{supplier.contact_person || "—"}</td>
                      <td>{supplier.email || "—"}</td>
                      <td>{supplier.phone || "—"}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(supplier)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(supplier.id)}
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
      </div>
    </Layout>
  );
}
