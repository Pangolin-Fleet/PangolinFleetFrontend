import React, { useState } from "react";
import axios from "axios";

export default function AddVehicleForm() {
  const [formData, setFormData] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    status: "Available",
    description: "",
    insuranceExpiryDate: "",
    discExpiryDate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: check that no required field is empty after trimming
    const requiredFields = [
      "vin",
      "make",
      "model",
      "year",
      "mileage",
      "status",
      "insuranceExpiryDate",
      "discExpiryDate"
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`Please fill out the ${field} field.`);
        return;
      }
    }

    try {
      // Convert year + mileage to numbers
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year, 10),
        mileage: parseInt(formData.mileage, 10),
      };

      const response = await axios.post(
        "http://localhost:8080/service/vehicle/add",
        vehicleData
      );

      alert("Vehicle added successfully!");
      console.log("Vehicle added:", response.data);

      // reset form
      setFormData({
        vin: "",
        make: "",
        model: "",
        year: "",
        mileage: "",
        status: "Available",
        description: "",
        insuranceExpiryDate: "",
        discExpiryDate: ""
      });

    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle. Check backend logs.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-gray-100 rounded">
      <input name="vin" placeholder="VIN" value={formData.vin} onChange={handleChange} className="p-2 w-full" />
      <input name="make" placeholder="Make" value={formData.make} onChange={handleChange} className="p-2 w-full" />
      <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="p-2 w-full" />
      <input name="year" type="number" placeholder="Year" value={formData.year} onChange={handleChange} className="p-2 w-full" />
      <input name="mileage" type="number" placeholder="Mileage" value={formData.mileage} onChange={handleChange} className="p-2 w-full" />
      <select name="status" value={formData.status} onChange={handleChange} className="p-2 w-full">
        <option value="Available">Available</option>
        <option value="In Use">In Use</option>
        <option value="Maintenance">Maintenance</option>
      </select>
      <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="p-2 w-full" />
      <label>Insurance Expiry Date</label>
      <input name="insuranceExpiryDate" type="date" value={formData.insuranceExpiryDate} onChange={handleChange} className="p-2 w-full" />
      <label>Disc Expiry Date</label>
      <input name="discExpiryDate" type="date" value={formData.discExpiryDate} onChange={handleChange} className="p-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Vehicle</button>
    </form>
  );
}
