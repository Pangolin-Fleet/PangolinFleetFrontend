import React, { useState } from "react";
import {
  FaCar,
  FaTimes,
  FaSave,
  FaIdCard,
  FaCalendarAlt,
  FaTachometerAlt
} from "react-icons/fa";
import "./AddVehicalModal.css";

export default function AddVehicleModal({
  newVehicle,
  setNewVehicle,
  setShowModal,
  addVehicle,
  vehicles
}) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeVehicles = vehicles || [];

  // Update newVehicle on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate the form locally
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["vin", "make", "model", "year", "mileage"];

    requiredFields.forEach(field => {
      if (!newVehicle[field] || newVehicle[field].toString().trim() === "") {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (newVehicle.vin && safeVehicles.some(v => v.vin.toLowerCase() === newVehicle.vin.toLowerCase())) {
      newErrors.vin = "This VIN already exists in the system!";
    }

    if (newVehicle.vin && newVehicle.vin.length < 5) {
      newErrors.vin = "VIN must be at least 5 characters";
    }

    if (newVehicle.year) {
      const year = parseInt(newVehicle.year);
      if (year < 1900 || year > new Date().getFullYear() + 1) {
        newErrors.year = "Please enter a valid year";
      }
    }

    if (newVehicle.mileage && parseInt(newVehicle.mileage) < 0) {
      newErrors.mileage = "Mileage cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await addVehicle(newVehicle);
      setShowModal(false);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrors(prev => ({
          ...prev,
          vin: error.response.data
        }));
      } else {
        alert(error.response?.data || error.message || "Failed to add vehicle");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    { name: "vin", label: "VIN Number", icon: <FaIdCard />, type: "text", placeholder: "Enter unique VIN..." },
    { name: "make", label: "Make", icon: <FaCar />, type: "text", placeholder: "e.g., Toyota, BMW..." },
    { name: "model", label: "Model", icon: <FaCar />, type: "text", placeholder: "e.g., Corolla, X5..." },
    { name: "year", label: "Manufacture Year", icon: <FaCalendarAlt />, type: "number", placeholder: "2020" },
    { name: "mileage", label: "Current Mileage (km)", icon: <FaTachometerAlt />, type: "number", placeholder: "50000" }
  ];

  const optionalFields = [
    { name: "description", label: "Description", type: "textarea", placeholder: "Additional vehicle details..." },
    { name: "insuranceExpiryDate", label: "Insurance Expiry", icon: <FaCalendarAlt />, type: "date" },
    { name: "discExpiryDate", label: "Disc Expiry", icon: <FaCalendarAlt />, type: "date" }
  ];

  return (
    <div className="modal-overlay">
      <div className="sexy-modal">
        <div className="modal-header">
          <div className="header-content">
            <FaCar className="header-icon" />
            <div>
              <h2>Add New Vehicle</h2>
              <p>Register a new vehicle to the fleet</p>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3 className="section-title">Vehicle Details</h3>
            <div className="form-grid">
              {inputFields.map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">
                    {field.icon} {field.label} {field.name !== "status" && <span className="required">*</span>}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={newVehicle[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={errors[field.name] ? "input-error" : ""}
                  />
                  {errors[field.name] && <span className="error-message">{errors[field.name]}</span>}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">
                  <FaCar /> Status
                </label>
                <select
                  name="status"
                  value={newVehicle.status || "Available"}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="In Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-grid">
              {optionalFields.map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.icon} {field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={newVehicle[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      rows="3"
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      value={newVehicle[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : <><FaSave /> Add Vehicle</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
