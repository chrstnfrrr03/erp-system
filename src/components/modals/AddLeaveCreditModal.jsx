import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import api from "../../api";
import Swal from "sweetalert2";

export default function AddLeaveCreditModal({
  show,
  onHide,
  biometricId,
  leaveCredits,
  editType,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    vacation_year: "",
    vacation_credits: "",
    sick_year: "",
    sick_credits: "",
    emergency_year: "",
    emergency_credits: "",
  });

  const [loading, setLoading] = useState(false);

  /* ==============================
     UI STYLES
  ============================== */
  const inputStyle = {
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 600,
  };

  const sectionTitle = {
    fontWeight: 600,
    fontSize: "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #dee2e6",
    marginBottom: "20px",
  };

  /* ==============================
     FETCH EXISTING LEAVE CREDITS
  ============================== */
  useEffect(() => {
    if (!show) return;

    api
      .get(`/employee/${biometricId}/leave-credits`)
      .then((res) => {
        if (res.data) {
          setFormData({
            vacation_year: res.data.vacation_year ?? "",
            vacation_credits: res.data.vacation_credits ?? "",
            sick_year: res.data.sick_year ?? "",
            sick_credits: res.data.sick_credits ?? "",
            emergency_year: res.data.emergency_year ?? "",
            emergency_credits: res.data.emergency_credits ?? "",
          });
        }
      })
      .catch(() => {});
  }, [show, biometricId]);

  /* ==============================
     AUTO-FILL CURRENT YEAR
  ============================== */
  useEffect(() => {
    if (!show) return;

    const currentYear = new Date().getFullYear();

    setFormData((prev) => ({
      ...prev,
      vacation_year: prev.vacation_year || currentYear,
      sick_year: prev.sick_year || currentYear,
      emergency_year: prev.emergency_year || currentYear,
    }));
  }, [show]);

  useEffect(() => {
    if (!show || !leaveCredits) return;

    if (editType) {
      setFormData({
        vacation_year:
          editType === "vacation" ? leaveCredits.vacation_year ?? "" : "",
        vacation_credits:
          editType === "vacation" ? leaveCredits.vacation_credits ?? "" : "",

        sick_year: editType === "sick" ? leaveCredits.sick_year ?? "" : "",
        sick_credits:
          editType === "sick" ? leaveCredits.sick_credits ?? "" : "",

        emergency_year:
          editType === "emergency" ? leaveCredits.emergency_year ?? "" : "",
        emergency_credits:
          editType === "emergency" ? leaveCredits.emergency_credits ?? "" : "",
      });
    } else {
      setFormData({
        vacation_year: "",
        vacation_credits: "",
        sick_year: "",
        sick_credits: "",
        emergency_year: "",
        emergency_credits: "",
      });
    }
  }, [show, editType, leaveCredits]);

  /* ==============================
     HANDLE INPUT CHANGE
  ============================== */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ==============================
     SAVE (UPDATE ONLY)
  ============================== */
  const handleSave = async () => {
    const currentYear = new Date().getFullYear();

    const payload = {
      vacation_year: formData.vacation_year || currentYear,
      vacation_credits: formData.vacation_credits || 0,

      sick_year: formData.sick_year || currentYear,
      sick_credits: formData.sick_credits || 0,

      emergency_year: formData.emergency_year || currentYear,
      emergency_credits: formData.emergency_credits || 0,
    };

    const result = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update leave credits?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      confirmButtonColor: "#0d6efd", 
      cancelButtonColor: "#dc3545",  
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      await api.put(`/employee/${biometricId}/leave-credits`, payload);

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "Leave credits have been updated.",
        confirmButtonColor: "#0d6efd",
      });

      onHide();
      onSuccess && onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating leave credits.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Leave Credits</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h5 style={sectionTitle}>Leave Credits</h5>

        {/* Vacation */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Vacation Leave Year
            </label>
            <input
              type="number"
              name="vacation_year"
              className="form-control"
              value={formData.vacation_year}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Vacation Leave Credits
            </label>
            <input
              type="number"
              name="vacation_credits"
              className="form-control"
              value={formData.vacation_credits}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Sick */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Sick Leave Year
            </label>
            <input
              type="number"
              name="sick_year"
              className="form-control"
              value={formData.sick_year}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Sick Leave Credits
            </label>
            <input
              type="number"
              name="sick_credits"
              className="form-control"
              value={formData.sick_credits}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Emergency */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Emergency Leave Year
            </label>
            <input
              type="number"
              name="emergency_year"
              className="form-control"
              value={formData.emergency_year}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label" style={labelStyle}>
              Emergency Leave Credits
            </label>
            <input
              type="number"
              name="emergency_credits"
              className="form-control"
              value={formData.emergency_credits}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        {/* 🔴 RED CANCEL */}
        <button
          className="btn btn-danger"
          onClick={onHide}
          disabled={loading}
        >
          Cancel
        </button>

        {/* 🔵 SAVE */}
        <button
          className="btn btn-primary px-4"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
