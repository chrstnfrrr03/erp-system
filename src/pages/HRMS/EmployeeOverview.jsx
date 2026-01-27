import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import baseApi from "../../api/baseApi";
import { FaEye, FaTrash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";

export default function EmployeeOverview() {
  const navigate = useNavigate();
  const { permissions } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    baseApi
      .get("/api/hrms/employees")
      .then((res) => {
        console.log("EMPLOYEES:", res.data);
        setEmployees(res.data);
      })
      .catch((err) => console.error("Error loading employees:", err));
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      emp.biometric_id?.toString().includes(search);

    const matchDept =
      departmentFilter === "All" ||
      emp.department === departmentFilter;

    const matchStatus =
      statusFilter === "All" || emp.status === statusFilter;

    return matchSearch && matchDept && matchStatus;
  });

  // ✅ Updated export URLs
  const handleExportCSV = () => {
    window.open(
      `http://localhost:8000/api/hrms/export/employees/csv?search=${search}&department=${departmentFilter}&status=${statusFilter}`,
      "_blank"
    );
  };

  const handleExportPDF = () => {
    window.open(
      `http://localhost:8000/api/hrms/export/employees/pdf?search=${search}&department=${departmentFilter}&status=${statusFilter}`,
      "_blank"
    );
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4 py-4">
        <h2 className="fw-bold mb-4">Employee Overview</h2>

        <div className="card shadow-sm p-4" style={{ borderRadius: "12px" }}>

          <div className="row g-4 align-items-center mb-4">

            {/* SEARCH */}
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">Search:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* DEPARTMENT FILTER */}
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">Department:</label>
              <select
                className="form-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">Status:</label>
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

            {/* EXPORTS + ADD BUTTON */}
            <div
              className="col-12 col-md-3 d-flex flex-wrap justify-content-md-end gap-2"
              style={{ rowGap: "10px" }}
            >
              <button className="btn btn-success" onClick={handleExportCSV}>
                Export CSV
              </button>

              <button className="btn btn-danger" onClick={handleExportPDF}>
                Export PDF
              </button>

              {/* ✅ Only show Add Employee for system_admin and hr */}
              {can(permissions, 'employee.create') && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/hrms/add-employee")}
                >
                  Add Employee
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead style={{ background: "#f8f9fa" }}>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-3 text-muted">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.biometric_id}</td>
                      <td>{emp.fullname}</td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td>{emp.hireDate}</td>

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

                      <td>
  <div className="d-flex justify-content-center gap-3">
    {/* ✅ Always show View icon for users with employee.view permission */}
    {can(permissions, 'employee.view') && (
      <FaEye
        className="text-primary"
        style={{ cursor: "pointer" }}
        onClick={() =>
          navigate(`/hrms/employee/${emp.biometric_id}`)
        }
      />
    )}

    {/* ✅ Only show Delete for system_admin and hr */}
    {can(permissions, 'employee.delete') && (
      <FaTrash
        className="text-danger"
        style={{ cursor: "pointer" }}
        onClick={() => alert("Delete employee")}
      />
    )}
  </div>
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