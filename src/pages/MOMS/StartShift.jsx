import { useState, useEffect } from "react";
import Layout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { Form, Alert } from "react-bootstrap";

export default function StartShift() {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [formData, setFormData] = useState({
    operator_id: "",
    machine_id: "",
    assignment_id: "",
    starting_hour_meter: "",
    starting_odometer: "",
    fuel_level_observed: "",
    estimated_fuel_in_tank: "",
    // Safety Checklist
    engine_condition: null,
    tires_condition: null,
    lights_signals: null,
    brakes_responsive: null,
    fluid_levels: null,
    safety_equipment: null,
    mirrors_windows: null,
    seatbelt_functioning: null,
    checklist_notes: "",
    operator_remarks: "",
  });

  const fuelLevels = ["Full", "3/4", "1/2", "1/4", "Empty"];

  const safetyChecklist = [
    { key: "engine_condition", label: "Engine condition (sounds/leaks)" },
    { key: "tires_condition", label: "Tires (pressure/condition)" },
    { key: "lights_signals", label: "Lights and signals working" },
    { key: "brakes_responsive", label: "Brakes responsive" },
    { key: "fluid_levels", label: "Fluid levels adequate" },
    { key: "safety_equipment", label: "Safety equipment present" },
    { key: "mirrors_windows", label: "Mirrors and windows clean" },
    { key: "seatbelt_functioning", label: "Seatbelt functioning" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [operatorsRes, machinesRes, assignmentsRes] = await Promise.all([
        baseApi.get("/api/moms/operators"),
        baseApi.get("/api/moms/machines"),
        baseApi.get("/api/moms/assignments"),
      ]);

      setOperators(operatorsRes.data || []);
      setMachines(machinesRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChecklistChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all safety checklist items are answered
    const allChecked = safetyChecklist.every((item) => formData[item.key] !== null);
    if (!allChecked) {
      alert("Please complete all safety checklist items before starting your shift.");
      return;
    }

    try {
      await baseApi.post("/api/moms/operations/start-shift", formData);
      alert("Shift started successfully!");
      navigate("/moms/operations/daily-ops");
    } catch (error) {
      console.error("Error starting shift:", error);
      alert("Failed to start shift. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid px-3 px-md-4">
        {/* Header */}
        <div className="row mb-3 mb-md-4 align-items-center">
          <div className="col">
            <h1 style={{ fontWeight: "bold", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Start Shift
            </h1>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
              onClick={() => navigate("/moms/operations/daily-ops")}
            >
              View Operations History
            </button>
          </div>
        </div>

        {/* Tip Alert */}
        <Alert variant="info" className="mb-4">
          <strong>💡 Tip:</strong> Once you start your shift, a floating widget will appear in the
          bottom-right corner showing your active shift status. You can minimize it, but it will
          remain accessible. Close it anytime to hide it, and it will only disappear when you end
          your shift.
        </Alert>

        <Form onSubmit={handleSubmit}>
          {/* Pre-Start Shift Checklist */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <div className="card-body p-4">
              <h5 style={{ fontWeight: "600", marginBottom: "8px" }}>
                Pre-Start Shift Checklist
              </h5>
              <p className="text-muted mb-4">Complete this form to begin your shift</p>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Operator <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Text className="d-block text-muted mb-2">
                      Select an operator to view their assignments
                    </Form.Text>
                    <Form.Select
                      name="operator_id"
                      value={formData.operator_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Operator --</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Select Machine <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Select
                      name="machine_id"
                      value={formData.machine_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Machine --</option>
                      {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                          {machine.machine_id} - {machine.make} {machine.model}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: "500" }}>Assignment (Optional)</Form.Label>
                <Form.Select
                  name="assignment_id"
                  value={formData.assignment_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Assignment --</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title || `Assignment ${assignment.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <h6 style={{ fontWeight: "600", marginBottom: "16px", marginTop: "24px" }}>
                Initial Readings
              </h6>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Starting Hour Meter (hours) <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="starting_hour_meter"
                      value={formData.starting_hour_meter}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Starting Odometer (km) - Optional
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="starting_odometer"
                      value={formData.starting_odometer}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Fuel Level Observed <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Select
                      name="fuel_level_observed"
                      value={formData.fuel_level_observed}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Level --</option>
                      {fuelLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Estimated Fuel in Tank (liters)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="estimated_fuel_in_tank"
                      value={formData.estimated_fuel_in_tank}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Start Safety Checklist */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <div className="card-body p-4">
              <h6 style={{ fontWeight: "600", marginBottom: "16px" }}>
                Pre-Start Safety Checklist
              </h6>

              {safetyChecklist.map((item) => (
                <div key={item.key} className="mb-3">
                  <div className="d-flex align-items-center gap-4">
                    <Form.Check
                      type="radio"
                      label="Pass"
                      name={item.key}
                      checked={formData[item.key] === "Pass"}
                      onChange={() => handleChecklistChange(item.key, "Pass")}
                      style={{ color: "#16a34a" }}
                    />
                    <Form.Check
                      type="radio"
                      label="Fail"
                      name={item.key}
                      checked={formData[item.key] === "Fail"}
                      onChange={() => handleChecklistChange(item.key, "Fail")}
                      style={{ color: "#dc2626" }}
                    />
                    <span style={{ fontWeight: "500" }}>{item.label}</span>
                  </div>
                </div>
              ))}

              <Form.Group className="mb-3 mt-4">
                <Form.Label style={{ fontWeight: "500" }}>
                  Checklist Notes (if any items failed)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="checklist_notes"
                  value={formData.checklist_notes}
                  onChange={handleInputChange}
                  placeholder="Describe any issues found..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "500" }}>Operator Remarks (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="operator_remarks"
                  value={formData.operator_remarks}
                  onChange={handleInputChange}
                  placeholder="Any additional notes..."
                />
              </Form.Group>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3 mb-4">
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                minWidth: "120px",
              }}
              onClick={() => navigate("/moms")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                height: "42px",
                fontSize: "15px",
                fontWeight: "500",
                borderRadius: "8px",
                minWidth: "120px",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
              }}
            >
              Start Shift
            </button>
          </div>
        </Form>
      </div>
    </Layout>
  );
}