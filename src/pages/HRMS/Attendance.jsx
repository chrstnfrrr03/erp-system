import { useEffect, useState } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import baseApi from "../../api/baseApi";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/permissions";

// ✅ IMPORT MODAL
import AddAttendanceModal from "../../components/modals/AddAttendanceModal";

const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
};

export default function Attendance() {
    const { permissions } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ MODAL STATE
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);

            const empRes = await baseApi.get("/api/hrms/employees");  
            const employees = empRes.data || [];

            const requests = employees.map((emp) =>
                baseApi.get(`/api/hrms/attendance/${emp.biometric_id}`)
            );

            const responses = await Promise.all(requests);

            const merged = responses.flatMap((res, index) => {
                const emp = employees[index];

                return (res.data || []).map((rec) => ({
                    biometric_id: emp.biometric_id,
                    employee_number: emp.employee_number,
                    fullname: emp.fullname,
                    department: emp.department,
                    date: rec.date,
                    am_in: rec.am_time_in,
                    am_out: rec.am_time_out,
                    pm_in: rec.pm_time_in,
                    pm_out: rec.pm_time_out,
                    status: rec.status,
                }));
            });

            setAttendance(merged);
        } catch (err) {
            console.error("Failed to load attendance", err);
        } finally {
            setLoading(false);
        }
    };

    /* ==============================
     FILTER LOGIC
  ============================== */
    const filteredAttendance = attendance.filter((row) => {
        const matchSearch =
            row.fullname?.toLowerCase().includes(search.toLowerCase()) ||
            row.employee_number?.toLowerCase().includes(search.toLowerCase());

        const matchDepartment =
            department === "All" || row.department === department;

        const matchDate = !date || formatDate(row.date) === date;

        return matchSearch && matchDepartment && matchDate;
    });

    /* ==============================
     EXPORT CSV
  ============================== */
    const handleExport = () => {
        if (filteredAttendance.length === 0) {
            Swal.fire("No data", "Nothing to export.", "info");
            return;
        }

        const headers = [
            "Employee No",
            "Name",
            "Department",
            "Date",
            "AM In",
            "AM Out",
            "PM In",
            "PM Out",
            "Status",
        ];

        const rows = filteredAttendance.map((row) => [
            row.employee_number,
            row.fullname,
            row.department,
            formatDate(row.date),
            row.am_in || "",
            row.am_out || "",
            row.pm_in || "",
            row.pm_out || "",
            row.status,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows]
                .map((e) => e.map((v) => `"${v}"`).join(","))
                .join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `attendance_${
            date || formatDate(new Date().toISOString())
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ==============================
     MARK ABSENT
  ============================== */
    const handleMarkAbsent = async (row) => {
        const result = await Swal.fire({
            title: "Mark as Absent?",
            text: `Mark ${row.fullname} as absent for ${formatDate(row.date)}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, mark absent",
            confirmButtonColor: "#0d6efd",
            cancelButtonColor: "#dc3545",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await baseApi.post("/api/hrms/attendance/mark-absent", {  
                biometric_id: row.biometric_id,
                date: row.date,
            });

            setAttendance((prev) =>
                prev.map((item) =>
                    item.biometric_id === row.biometric_id &&
                    item.date === row.date
                        ? {
                              ...item,
                              status: "Absent",
                              am_in: null,
                              am_out: null,
                              pm_in: null,
                              pm_out: null,
                          }
                        : item
                )
            );

            Swal.fire("Done", "Employee marked absent.", "success");
        } catch (err) {
            Swal.fire("Error", "Unable to mark absent.", "error");
        }
    };

    return (
        <Layout>
            <div className="container-fluid px-2 px-md-4 py-3">
                <h2 className="fw-bold mb-3">Attendance</h2>

                {/* FILTER BAR */}
                <div className="card shadow-sm mb-3">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-sm-6 col-lg-3">
                                <label className="form-label fw-semibold">
                                    Choose Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div className="col-12 col-sm-6 col-lg-3">
                                <label className="form-label fw-semibold">
                                    Department
                                </label>
                                <select
                                    className="form-select"
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(e.target.value)
                                    }
                                >
                                    <option value="All">All</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operations">
                                        Operations
                                    </option>
                                </select>
                            </div>

                            <div className="col-12 col-lg-3">
                                <label className="form-label fw-semibold">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search employee..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="col-12 col-lg-3">
                                <div className="row g-2">
                                    <div className={can(permissions, 'attendance.manage') ? "col-6" : "col-12"}>
                                        <button
                                            className="btn btn-success w-100"
                                            onClick={handleExport}
                                        >
                                            Export
                                        </button>
                                    </div>
                                    {can(permissions, 'attendance.manage') && (
                                        <div className="col-6">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() =>
                                                    setShowAddModal(true)
                                                }
                                            >
                                                Add Attendance
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th rowSpan="2">Employee No</th>
                                    <th rowSpan="2" className="text-start">
                                        Name
                                    </th>
                                    <th rowSpan="2">Department</th>
                                    <th colSpan="2">Morning</th>
                                    <th colSpan="2">Afternoon</th>
                                    <th rowSpan="2">Status</th>
                                    {can(permissions, 'attendance.manage') && (
                                        <th rowSpan="2">Action</th>
                                    )}
                                </tr>
                                <tr>
                                    <th>In</th>
                                    <th>Out</th>
                                    <th>In</th>
                                    <th>Out</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={can(permissions, 'attendance.manage') ? "9" : "8"}
                                            className="py-4 text-center"
                                        >
                                            Loading attendance...
                                        </td>
                                    </tr>
                                ) : filteredAttendance.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={can(permissions, 'attendance.manage') ? "9" : "8"}
                                            className="py-4 text-center text-muted"
                                        >
                                            No attendance records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendance.map((row, index) => (
                                        <tr key={index} className="text-center">
                                            <td>{row.employee_number}</td>
                                            <td className="text-start">
                                                {row.fullname}
                                            </td>
                                            <td>{row.department}</td>
                                            <td>{row.am_in || "--:--"}</td>
                                            <td>{row.am_out || "--:--"}</td>
                                            <td>{row.pm_in || "--:--"}</td>
                                            <td>{row.pm_out || "--:--"}</td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        row.status === "Late"
                                                            ? "bg-warning"
                                                            : row.status ===
                                                              "Absent"
                                                            ? "bg-danger"
                                                            : "bg-success"
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            {can(permissions, 'attendance.manage') && (
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger px-3"
                                                        disabled={
                                                            row.status === "Absent"
                                                        }
                                                        onClick={() =>
                                                            handleMarkAbsent(row)
                                                        }
                                                    >
                                                        Mark Absent
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer text-muted">
                        Showing {filteredAttendance.length} entries
                    </div>
                </div>
            </div>

            {/* ✅ ADD ATTENDANCE MODAL */}
            <AddAttendanceModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSuccess={fetchAttendanceData}
            />
        </Layout>
    );
}