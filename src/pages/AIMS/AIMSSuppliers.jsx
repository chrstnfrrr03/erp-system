import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/DashboardLayout";
import {
  MdSearch,
  MdAdd,
  MdVisibility,
  MdEdit,
  MdDelete,
} from "react-icons/md";

export default function AIMSSuppliers() {
  const navigate = useNavigate();

  // 🔹 API data later
  const suppliers = [];

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">

        {/* TITLE + CLOSE */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1 className="fw-bold">Suppliers</h1>
            <p className="text-muted mb-0">
              Manage supplier information and contacts
            </p>
          </div>

          <div className="col-auto">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => navigate("/aims")}
              style={{
                height: "42px",
                padding: "0 18px",
                borderRadius: "8px",
                fontWeight: 500,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#dc3545";
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            <div className="row g-3 align-items-center">

              {/* SEARCH */}
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <MdSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search supplier name or contact person"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="col-12 col-md-3">
                <select className="form-select">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* ADD SUPPLIER */}
              <div className="col-12 col-md-3 text-md-end">
                <button className="btn btn-info text-white">
                  <MdAdd className="me-1" /> Add Supplier
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Supplier Code</th>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: "140px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No suppliers available
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <SupplierRow key={supplier.id} {...supplier} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="card-footer bg-white text-muted">
            No supplier data loaded
          </div>
        </div>

      </div>
    </Layout>
  );
}

/* SUPPLIER ROW */
function SupplierRow({
  supplier_code,
  name,
  contact_person,
  phone,
  email,
  status,
}) {
  return (
    <tr>
      <td className="fw-semibold">{supplier_code}</td>
      <td>{name}</td>
      <td>{contact_person}</td>
      <td>{phone}</td>
      <td>{email}</td>
      <td>
        <span
          className={`badge bg-${status === "active" ? "success" : "secondary"}`}
        >
          {status}
        </span>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button className="btn btn-sm btn-outline-primary">
            <MdVisibility size={16} />
          </button>
          <button className="btn btn-sm btn-outline-warning">
            <MdEdit size={16} />
          </button>
          <button className="btn btn-sm btn-outline-danger">
            <MdDelete size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
