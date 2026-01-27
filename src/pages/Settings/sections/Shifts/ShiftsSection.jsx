import { useEffect, useState } from "react";
import baseApi from "../../../../api/baseApi";
import Swal from "sweetalert2";

import ShiftsTable from "./ShiftsTable";
import ShiftModal from "./ShiftsModal";

export default function ShiftsSection() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  /* =========================
     FETCH REAL SHIFTS
  ========================= */
  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await baseApi.get("/api/hrms/shifts");

      // supports { data: [] } or []
      const list = res.data?.data || res.data || [];
      setShifts(list);
    } catch (err) {
      console.error("Shift fetch error:", err);
      Swal.fire("Error", "Failed to load shifts", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI ACTIONS
  ========================= */
  const handleAdd = () => {
    setEditingShift(null);
    setShowModal(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };

  const handleSave = async (shift) => {
    try {
      if (shift.id) {
        // UPDATE
        await baseApi.put(`/api/hrms/shifts/${shift.id}`, shift);
      } else {
        // CREATE
        await baseApi.post("/api/hrms/shifts", shift);
      }

      await fetchShifts();
      setShowModal(false);

      Swal.fire("Success", "Shift saved", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save shift", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Shift?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.delete(`/api/hrms/shifts/${id}`);
      await fetchShifts();
      Swal.fire("Deleted", "Shift removed", "success");
    } catch {
      Swal.fire("Error", "Failed to delete shift", "error");
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return <div className="p-4">Loading shifts...</div>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Shifts</h3>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Shift
        </button>
      </div>

      <ShiftsTable
        data={shifts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <ShiftModal
          shift={editingShift}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
