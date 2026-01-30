import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdSearch } from "react-icons/md";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";
import { can } from "../../utils/permissions"; 

export default function AttendanceTab({ employee, permissions }) { 
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAbsentModal, setShowAbsentModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const formatDate = (date) => {
    if (!date) return "N/A";
    // Extract just the date part to avoid timezone conversion
    const dateOnly = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
    return dateOnly;
};

    useEffect(() => {
        fetchAttendanceRecords();
    }, [employee.biometric_id]);

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true);
            const res = await baseApi.get(`/api/hrms/attendance/${employee.biometric_id}`);
            setAttendanceRecords(res.data || []);
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAttendance = async (formData) => {
        const exists = attendanceRecords.some(
            (r) => formatDate(r.date) === formData.date
        );

        if (exists) {
            Swal.fire({
                icon: "warning",
                title: "Duplicate Entry",
                text: "Attendance for this date already exists.",
            });
            return;
        }

        try {
            await baseApi.post(`/api/hrms/attendance/${employee.biometric_id}`, formData);
            await fetchAttendanceRecords();
            setShowAddModal(false);
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Attendance record added successfully!",
                confirmButtonColor: "#28a745",
            });
        } catch (err) {
            console.error("Failed to add attendance:", err);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Failed to add attendance record. Please try again.",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleMarkAbsent = async (formData) => {
        try {
            await baseApi.post(`/api/hrms/attendance/${employee.biometric_id}/absent`, formData);
            await fetchAttendanceRecords();
            setShowAbsentModal(false);
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Employee marked as absent!",
                confirmButtonColor: "#28a745",
            });
        } catch (err) {
            console.error("Failed to mark absent:", err);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Failed to mark absent. Please try again.",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleUpdateAttendance = async (id, formData) => {
        try {
            await baseApi.put(`/api/hrms/attendance/${id}`, formData);
            await fetchAttendanceRecords();
            setShowUpdateModal(false);
            setSelectedRecord(null);
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Attendance record updated successfully!",
                confirmButtonColor: "#28a745",
            });
        } catch (err) {
            console.error("Failed to update attendance:", err);
            console.error("Error response:", err.response?.data);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    err.response?.data?.message ||
                    "Failed to update attendance record. Please try again.",
                confirmButtonColor: "#d33",
            });
        }
    };

    const filteredRecords = attendanceRecords.filter((record) =>
        String(record.date || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Updated to calculate both AM and PM hours
    const calculateTotalHours = (amIn, amOut, pmIn, pmOut) => {
        let totalMinutes = 0;

        // ✅ Calculate AM hours - Remove the "00:00:00" check
        if (amIn && amOut && amIn !== "00:00:00" && amOut !== "00:00:00") {
            const [inHours, inMinutes] = amIn.split(":").map(Number);
            const [outHours, outMinutes] = amOut.split(":").map(Number);

            // Skip if both are actually zero (not entered)
            if (
                inHours !== 0 ||
                inMinutes !== 0 ||
                outHours !== 0 ||
                outMinutes !== 0
            ) {
                let minutes =
                    outHours * 60 + outMinutes - (inHours * 60 + inMinutes);

                if (minutes < 0) {
                    minutes += 24 * 60;
                }

                totalMinutes += minutes;
            }
        }

        // ✅ Calculate PM hours - FIXED: Don't skip "00:00:00" for PM Out
        if (pmIn && pmOut) {
            const [inHours, inMinutes] = pmIn.split(":").map(Number);
            const [outHours, outMinutes] = pmOut.split(":").map(Number);

            // Only skip if BOTH are zero
            if (
                !(
                    inHours === 0 &&
                    inMinutes === 0 &&
                    outHours === 0 &&
                    outMinutes === 0
                )
            ) {
                let minutes =
                    outHours * 60 + outMinutes - (inHours * 60 + inMinutes);

                // ✅ Handle midnight crossing (22:00 to 06:00)
                if (minutes < 0) {
                    minutes += 24 * 60;
                }

                totalMinutes += minutes;
            }
        }

        const hours = (totalMinutes / 60).toFixed(2);
        return hours > 0 ? hours : "0.00";
    };

    return (
        <div className="row g-4">
            {/* LEFT SIDE - Employee Info Card */}
            <div className="col-lg-4">
                <div
                    className="card"
                    style={{
                        borderRadius: "12px",
                        backgroundColor: "white",
                        borderTop: "3px solid #ffe680",
                    }}
                >
                    <div className="card-body text-center py-5">
                        <div
                            style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                                backgroundColor: "#e0e0e0",
                            }}
                        >
                            {employee.profile_picture ? (
                                <img
                                    src={employee.profile_picture}
                                    alt="Profile"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <FaUserCircle size={100} color="#555" />
                            )}
                        </div>

                        <h4 className="mb-2 fw-bold">{employee.fullname}</h4>
                        <p
                            className="text-muted mb-0"
                            style={{ fontSize: "14px" }}
                        >
                            {employee.biometric_id}
                        </p>
                        <p className="text-muted" style={{ fontSize: "13px" }}>
                            {employee.department}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Attendance Table */}
            <div className="col-lg-8">
                <div
                    className="card"
                    style={{
                        borderRadius: "12px",
                        backgroundColor: "white",
                        borderTop: "3px solid #ffe680",
                    }}
                >
                    <div className="card-body p-4">
                       {/* Action Buttons */}
<div className="d-flex justify-content-between align-items-center mb-4">
    {can(permissions, 'attendance.manage') && (
        <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Add Attendance
            </button>
            <button className="btn btn-danger" onClick={() => setShowAbsentModal(true)}>
                Mark Absent
            </button>
        </div>
    )}
</div>

                        {/* Table Controls */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: "14px" }}>Show</span>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: "70px" }}
                                    value={entriesPerPage}
                                    onChange={(e) => {
                                        setEntriesPerPage(
                                            Number(e.target.value)
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span style={{ fontSize: "14px" }}>
                                    entries
                                </span>
                            </div>

                            <div className="position-relative">
                                <MdSearch
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "8px",
                                        transform: "translateY(-50%)",
                                        color: "#6c757d",
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-control form-control-sm ps-4"
                                    style={{ width: "200px" }}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search by date..."
                                />
                            </div>
                        </div>

                        {/* Attendance Table */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead
                                            style={{
                                                backgroundColor: "#f8f9fa",
                                            }}
                                        >
                                            <tr>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    Date
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    AM In
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    AM Out
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    PM In
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    PM Out
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    Total Hours
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "12px",
                                                    }}
                                                >
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.length > 0 ? (
                                                currentRecords.map((record) => (
                                                    <tr key={record.id}>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {formatDate(
                                                                record.date
                                                            )}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {record.am_time_in ||
                                                                "00:00:00"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {record.am_time_out ||
                                                                "00:00:00"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {record.pm_time_in ||
                                                                "00:00:00"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {record.pm_time_out ||
                                                                "00:00:00"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            {calculateTotalHours(
                                                                record.am_time_in,
                                                                record.am_time_out,
                                                                record.pm_time_in,
                                                                record.pm_time_out
                                                            )}
                                                        </td>
                                                        <td style={{ fontSize: "13px", padding: "12px" }}>
    {can(permissions, 'attendance.manage') && (
        <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
                setSelectedRecord(record);
                setShowUpdateModal(true);
            }}
        >
            Update
        </button>
    )}
</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="7"
                                                        className="text-center py-4"
                                                        style={{
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        No attendance records
                                                        found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                color: "#6c757d",
                                            }}
                                        >
                                            Showing {startIndex + 1} to{" "}
                                            {Math.min(
                                                endIndex,
                                                filteredRecords.length
                                            )}{" "}
                                            of {filteredRecords.length} entries
                                        </div>

                                        <nav>
                                            <ul className="pagination pagination-sm mb-0">
                                                <li
                                                    className={`page-item ${
                                                        currentPage === 1
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                (prev) =>
                                                                    Math.max(
                                                                        1,
                                                                        prev - 1
                                                                    )
                                                            )
                                                        }
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {[...Array(totalPages)].map(
                                                    (_, index) => {
                                                        const pageNumber =
                                                            index + 1;
                                                        if (
                                                            pageNumber === 1 ||
                                                            pageNumber ===
                                                                totalPages ||
                                                            (pageNumber >=
                                                                currentPage -
                                                                    1 &&
                                                                pageNumber <=
                                                                    currentPage +
                                                                        1)
                                                        ) {
                                                            return (
                                                                <li
                                                                    key={
                                                                        pageNumber
                                                                    }
                                                                    className={`page-item ${
                                                                        currentPage ===
                                                                        pageNumber
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() =>
                                                                            setCurrentPage(
                                                                                pageNumber
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            pageNumber
                                                                        }
                                                                    </button>
                                                                </li>
                                                            );
                                                        } else if (
                                                            pageNumber ===
                                                                currentPage -
                                                                    2 ||
                                                            pageNumber ===
                                                                currentPage + 2
                                                        ) {
                                                            return (
                                                                <li
                                                                    key={
                                                                        pageNumber
                                                                    }
                                                                    className="page-item disabled"
                                                                >
                                                                    <span className="page-link">
                                                                        ...
                                                                    </span>
                                                                </li>
                                                            );
                                                        }
                                                        return null;
                                                    }
                                                )}

                                                <li
                                                    className={`page-item ${
                                                        currentPage ===
                                                        totalPages
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                (prev) =>
                                                                    Math.min(
                                                                        totalPages,
                                                                        prev + 1
                                                                    )
                                                            )
                                                        }
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Attendance Modal */}
            {showAddModal && (
                <AddAttendanceModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddAttendance}
                />
            )}

            {/* Mark Absent Modal */}
            {showAbsentModal && (
                <MarkAbsentModal
                    onClose={() => setShowAbsentModal(false)}
                    onSave={handleMarkAbsent}
                />
            )}

            {/* Update Attendance Modal */}
            {showUpdateModal && selectedRecord && (
                <UpdateAttendanceModal
                    record={selectedRecord}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedRecord(null);
                    }}
                    onSave={(formData) => {
                        handleUpdateAttendance(selectedRecord.id, formData);
                        setShowUpdateModal(false);
                        setSelectedRecord(null);
                    }}
                />
            )}
        </div>
    );
}

// Add Attendance Modal Component
function AddAttendanceModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        date: "",
        am_time_in: "",
        am_time_out: "",
        pm_time_in: "",
        pm_time_out: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean the data - remove empty strings
        const cleanData = {
            date: formData.date,
            am_time_in: formData.am_time_in || null,
            am_time_out: formData.am_time_out || null,
            pm_time_in: formData.pm_time_in || null,
            pm_time_out: formData.pm_time_out || null,
        };

        // Remove null values
        Object.keys(cleanData).forEach((key) => {
            if (cleanData[key] === null && key !== "date") {
                delete cleanData[key];
            }
        });

        onSave(cleanData);
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Attendance</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        date: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">AM Time In</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.am_time_in}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            am_time_in: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label">
                                    AM Time Out
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.am_time_out}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            am_time_out: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">PM Time In</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.pm_time_in}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pm_time_in: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label">
                                    PM Time Out
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.pm_time_out}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pm_time_out: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Add Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mark Absent Modal Component
function MarkAbsentModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        date: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Mark as Absent</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        date: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Mark Absent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Update Attendance Modal Component
function UpdateAttendanceModal({ record, onClose, onSave }) {
    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5);
    };

    const [formData, setFormData] = useState({
        date: record.date ? record.date.split("T")[0] : "",
        am_time_in: formatTime(record.am_time_in),
        am_time_out: formatTime(record.am_time_out),
        pm_time_in: formatTime(record.pm_time_in),
        pm_time_out: formatTime(record.pm_time_out),
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanData = {
            am_time_in: formData.am_time_in || null,
            am_time_out: formData.am_time_out || null,
            pm_time_in: formData.pm_time_in || null,
            pm_time_out: formData.pm_time_out || null,
        };

        // Remove any null/empty values before sending
        Object.keys(cleanData).forEach((key) => {
            if (!cleanData[key]) {
                delete cleanData[key];
            }
        });

        onSave(cleanData);
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Attendance</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.date}
                                disabled
                            />
                        </div>

                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">AM Time In</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.am_time_in}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            am_time_in: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="col-6 mb-3">
                                <label className="form-label">
                                    AM Time Out
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.am_time_out}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            am_time_out: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">PM Time In</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.pm_time_in}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pm_time_in: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="col-6 mb-3">
                                <label className="form-label">
                                    PM Time Out
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.pm_time_out}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pm_time_out: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Update Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
