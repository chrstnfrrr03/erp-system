import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";

import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPerson,
} from "react-icons/md";

export default function AIMSCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER
  const [search, setSearch] = useState("");

  // MODAL
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  /* ==========================================================
     FETCH CUSTOMERS
  ========================================================== */
  const fetchCustomers = async () => {
    try {
      const res = await baseApi.get("/api/aims/customers");
      const data = res.data.data || res.data || [];
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ==========================================================
     FILTER
  ========================================================== */
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const keyword = search.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(keyword) ||
            c.email?.toLowerCase().includes(keyword) ||
            c.phone?.toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, customers]);

  /* ==========================================================
     MODAL HANDLERS
  ========================================================== */
  const openAddModal = () => {
    setEditMode(false);
    setCurrentCustomer({ id: null, name: "", email: "", phone: "", address: "" });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditMode(true);
    setCurrentCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCustomer({ id: null, name: "", email: "", phone: "", address: "" });
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentCustomer.name.trim()) {
      return Swal.fire("Error", "Customer name is required", "error");
    }

    try {
      if (editMode) {
        await baseApi.put(`/api/aims/customers/${currentCustomer.id}`, currentCustomer);
        Swal.fire("Success", "Customer updated", "success");
      } else {
        await baseApi.post("/api/aims/customers", currentCustomer);
        Swal.fire("Success", "Customer added", "success");
      }

      closeModal();
      fetchCustomers();
    } catch (err) {
      Swal.fire("Error", "Failed to save customer", "error");
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Customer?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.delete(`/api/aims/customers/${id}`);
      Swal.fire("Deleted", "Customer removed", "success");
      fetchCustomers();
    } catch (err) {
      Swal.fire("Error", "Failed to delete customer", "error");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* HEADER */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Customers</h1>
            <p className="text-muted mb-0">
              Manage customer information for sales orders
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

              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <MdSearch />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search by name, email, or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 text-end">
                <button
                  className="btn btn-primary"
                  onClick={openAddModal}
                >
                  <MdAdd className="me-1" />
                  Add Customer
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th className="text-center" style={{ width: "120px" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onEdit={() => openEditModal(customer)}
                      onDelete={() => handleDelete(customer.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <CustomerModal
          editMode={editMode}
          customer={currentCustomer}
          onChange={setCurrentCustomer}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}

/* ==========================================================
   TABLE ROW
========================================================== */
function CustomerRow({ customer, onEdit, onDelete }) {
  return (
    <tr>
      <td className="fw-semibold">
        <MdPerson className="me-2 text-primary" />
        {customer.name}
      </td>
      <td>{customer.email || "-"}</td>
      <td>{customer.phone || "-"}</td>
      <td>{customer.address || "-"}</td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-outline-primary me-1"
          onClick={onEdit}
        >
          <MdEdit />
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={onDelete}
        >
          <MdDelete />
        </button>
      </td>
    </tr>
  );
}

/* ==========================================================
   CUSTOMER MODAL
========================================================== */
function CustomerModal({ editMode, customer, onChange, onSubmit, onClose }) {
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
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            
            {/* HEADER */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                {editMode ? "Edit Customer" : "Add New Customer"}
              </h5>
            </div>

            {/* BODY */}
            <form onSubmit={onSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Customer Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={customer.name}
                    onChange={(e) =>
                      onChange({ ...customer, name: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={customer.email}
                    onChange={(e) =>
                      onChange({ ...customer, email: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customer.phone}
                    onChange={(e) =>
                      onChange({ ...customer, phone: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={customer.address}
                    onChange={(e) =>
                      onChange({ ...customer, address: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? "Update" : "Add"} Customer
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}