import { useEffect, useState } from "react";
import baseApi from "../../../../api/baseApi";

import {
  MdHistory,
  MdSearch,
  MdRefresh,
  MdVisibility,
  MdPerson,
  MdCalendarToday,
} from "react-icons/md";

export default function AuditTrailSection() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("All");
  const [action, setAction] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // MODAL
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ==========================================================
     FETCH LOGS
  ========================================================== */
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        per_page: 50,
      });

      if (search) params.append("search", search);
      if (module !== "All") params.append("module", module);
      if (action !== "All") params.append("action", action);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await baseApi.get(`/api/audit-logs?${params}`);
      setLogs(res.data.data);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     FETCH STATISTICS
  ========================================================== */
  const fetchStats = async () => {
    try {
      const res = await baseApi.get("/api/audit-logs/statistics");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch statistics", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [search, module, action, startDate, endDate]);

  /* ==========================================================
     VIEW DETAILS
  ========================================================== */
  const handleViewDetails = async (log) => {
    try {
      const res = await baseApi.get(`/api/audit-logs/${log.id}`);
      setSelectedLog(res.data.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch log details", err);
    }
  };

  /* ==========================================================
     ACTION BADGE COLOR
  ========================================================== */
  const getActionBadge = (action) => {
    const badges = {
      created: "success",
      updated: "primary",
      deleted: "danger",
      approved: "success",
      rejected: "danger",
      fulfilled: "success",
      cancelled: "warning",
      stock_in: "info",
      stock_out: "warning",
      login: "secondary",
      logout: "secondary",
    };

    return badges[action] || "secondary";
  };

  return (
    <div>
      
      {/* HEADER */}
      <div className="row mb-3 align-items-center">
        <div className="col">
          <h3 className="fw-bold d-flex align-items-center gap-2">
            <MdHistory size={28} className="text-primary" />
            Audit Trail
          </h3>
          <p className="text-muted mb-0">
            System activity and change history
          </p>
        </div>
      </div>

      {/* STATISTICS */}
      {stats && (
        <div className="row g-3 mb-4">
          <StatCard
            title="Total Logs"
            value={stats.total_logs?.toLocaleString()}
            icon={<MdHistory />}
            color="primary"
          />
          <StatCard
            title="Today"
            value={stats.today_logs?.toLocaleString()}
            icon={<MdCalendarToday />}
            color="success"
          />
          <StatCard
            title="This Week"
            value={stats.week_logs?.toLocaleString()}
            icon={<MdCalendarToday />}
            color="info"
          />
        </div>
      )}

      {/* FILTERS */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            
            {/* Search */}
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <MdSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search description or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Module Filter */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={module}
                onChange={(e) => setModule(e.target.value)}
              >
                <option value="All">All Modules</option>
                <option value="HRMS">HRMS</option>
                <option value="Payroll">Payroll</option>
                <option value="AIMS">AIMS</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="All">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="stock_in">Stock In</option>
                <option value="stock_out">Stock Out</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => fetchLogs(currentPage)}
            >
              <MdRefresh className="me-1" />
              Refresh
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearch("");
                setModule("All");
                setAction("All");
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <AuditLogRow
                    key={log.id}
                    log={log}
                    onView={handleViewDetails}
                    getBadge={getActionBadge}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Page {currentPage} of {totalPages}
            </div>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === 1}
                onClick={() => fetchLogs(currentPage - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === totalPages}
                onClick={() => fetchLogs(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {showModal && selectedLog && (
        <AuditLogModal
          log={selectedLog}
          onClose={() => setShowModal(false)}
          getBadge={getActionBadge}
        />
      )}
    </div>
  );
}

/* ==========================================================
   STAT CARD
========================================================== */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex gap-3 align-items-center">
          <div
            className={`text-${color}`}
            style={{ fontSize: "32px" }}
          >
            {icon}
          </div>
          <div>
            <div className="text-muted small">{title}</div>
            <div className="fw-bold fs-3">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   AUDIT LOG ROW
========================================================== */
function AuditLogRow({ log, onView, getBadge }) {
  return (
    <tr>
      <td>
        <small className="text-muted">
          {new Date(log.created_at).toLocaleString()}
        </small>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <MdPerson className="text-muted" />
          <div>
            <div className="fw-semibold">{log.user_name || "System"}</div>
            {log.user_role && (
              <small className="text-muted">{log.user_role}</small>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className={`badge bg-${getBadge(log.action)} rounded-pill`}>
          {log.action}
        </span>
      </td>
      <td>
        {log.module && (
          <span className="badge bg-secondary">{log.module}</span>
        )}
      </td>
      <td>{log.description}</td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onView(log)}
        >
          <MdVisibility />
        </button>
      </td>
    </tr>
  );
}

/* ==========================================================
   AUDIT LOG MODAL
========================================================== */
function AuditLogModal({ log, onClose, getBadge }) {
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
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            
            {/* HEADER */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                <MdHistory className="me-2" />
                Audit Log Details
              </h5>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <div className="row g-3">
                
                <div className="col-md-6">
                  <strong>Date & Time</strong>
                  <div>{new Date(log.created_at).toLocaleString()}</div>
                </div>

                <div className="col-md-6">
                  <strong>User</strong>
                  <div>{log.user_name || "System"}</div>
                  {log.user_role && (
                    <small className="text-muted">{log.user_role}</small>
                  )}
                </div>

                <div className="col-md-6">
                  <strong>Action</strong>
                  <div>
                    <span className={`badge bg-${getBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <strong>Module</strong>
                  <div>{log.module || "—"}</div>
                </div>

                <div className="col-12">
                  <strong>Description</strong>
                  <div>{log.description}</div>
                </div>

                {log.ip_address && (
                  <div className="col-md-6">
                    <strong>IP Address</strong>
                    <div className="font-monospace small">{log.ip_address}</div>
                  </div>
                )}

                {log.changes && Object.keys(log.changes).length > 0 && (
                  <div className="col-12">
                    <strong>Changes</strong>
                    <div className="table-responsive mt-2">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Field</th>
                            <th>Old Value</th>
                            <th>New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(log.changes).map(([field, values]) => (
                            <tr key={field}>
                              <td className="fw-semibold">
                                {field.replace(/_/g, " ").toUpperCase()}
                              </td>
                              <td>
                                <code>{JSON.stringify(values.old)}</code>
                              </td>
                              <td>
                                <code>{JSON.stringify(values.new)}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer bg-light">
              <button className="btn btn-danger" onClick={onClose}>
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}