import { useEffect, useState } from "react";
import baseApi from "../../../../api/baseApi";
import Swal from "sweetalert2";

import EmploymentStatusTable from "./EmploymentStatusTable";
import EmploymentStatusModal from "./EmploymentStatusModal";

export default function EmploymentStatusSection() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await baseApi.get(
        "/api/hrms/employment-classifications"
      );

      const list = res.data?.data || res.data || [];
      setStatuses(list);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load employment statuses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingStatus(item);
    setShowModal(true);
  };

  const handleSave = async (item) => {
    try {
      if (item.id) {
        await baseApi.put(
          `/api/hrms/employment-classifications/${item.id}`,
          item
        );
      } else {
        await baseApi.post(
          "/api/hrms/employment-classifications",
          item
        );
      }

      await fetchStatuses();
      setShowModal(false);

      Swal.fire("Success", "Employment status saved", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save employment status", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Employment Status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await baseApi.delete(
        `/api/hrms/employment-classifications/${id}`
      );
      await fetchStatuses();
      Swal.fire("Deleted", "Employment status removed", "success");
    } catch {
      Swal.fire("Error", "Failed to delete employment status", "error");
    }
  };

  if (loading) {
    return <div className="p-4">Loading employment statuses...</div>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Employment Status</h3>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Employment Status
        </button>
      </div>

      <EmploymentStatusTable
        data={statuses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <EmploymentStatusModal
          status={editingStatus}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
