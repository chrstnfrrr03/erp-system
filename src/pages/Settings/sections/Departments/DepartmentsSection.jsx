import { useEffect, useState } from "react";
import baseApi from "../../../../api/baseApi";
import Swal from "sweetalert2";

import DepartmentsTable from "./DepartmentsTable";
import DepartmentModal from "./DepartmentModal";

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  /* =========================
     FETCH REAL DEPARTMENTS
  ========================= */
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await baseApi.get("/api/hrms/departments");

      // supports both { data: [] } and []
      const list = res.data?.data || res.data || [];
      setDepartments(list);
    } catch (err) {
      console.error("Department fetch error:", err);
      Swal.fire("Error", "Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI ACTIONS
  ========================= */
  const handleAdd = () => {
    setEditingDept(null);
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setShowModal(true);
  };

  const handleSave = async (dept) => {
    try {
      if (dept.id) {
        // UPDATE
        await baseApi.put(`/api/hrms/departments/${dept.id}`, dept);
      } else {
        // CREATE
        await baseApi.post("/api/hrms/departments", dept);
      }

      await fetchDepartments();
      setShowModal(false);

      Swal.fire("Success", "Department saved", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save department", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Department?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.delete(`/api/hrms/departments/${id}`);
      await fetchDepartments();
      Swal.fire("Deleted", "Department removed", "success");
    } catch {
      Swal.fire("Error", "Failed to delete department", "error");
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return <div className="p-4">Loading departments...</div>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Departments</h3>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Department
        </button>
      </div>

      <DepartmentsTable
        data={departments}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <DepartmentModal
          department={editingDept}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
