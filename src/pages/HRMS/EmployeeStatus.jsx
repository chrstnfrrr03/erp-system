import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import baseApi from "../../api/baseApi";

export default function EmployeeStatus() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

 useEffect(() => {
  baseApi
    .get("/api/hrms/employees")  
    .then((res) => {
      setEmployees(res.data);
    })
    .catch((err) => console.error("Error loading employees:", err));
}, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      emp.biometric_id?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || emp.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4 py-4">
        <h2 className="fw-bold mb-4">Employee Status Overview</h2>

        <div className="card shadow-sm p-4" style={{ borderRadius: "12px" }}>
          {/* FILTERS */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Regular">Regular</option>
                <option value="Probationary">Probationary</option>
                <option value="End of Contract">End of Contract</option>
                <option value="Retired">Retired</option>
                <option value="Terminated">Terminated</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Employee No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Date Hired</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.biometric_id}</td>
                      <td>{emp.fullname}</td>
                      <td>{emp.department}</td>

                      {/* STATUS BADGE */}
                      <td>
                        <span
                          className={`badge ${
                            emp.status === "Regular"
                              ? "bg-success"
                              : emp.status === "Probationary"
                              ? "bg-warning"
                              : emp.status === "Resigned"
                              ? "bg-secondary"
                              : emp.status === "Terminated"
                              ? "bg-danger"
                              : emp.status === "Retired"
                              ? "bg-info"
                              : "bg-dark"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td>{emp.hireDate}</td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigate(`/hrms/employee/${emp.biometric_id}`)
                          }
                        >
                          View
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
