import React, { useState } from "react";

function AddVehicleForm({ onVehicleAdded }) {
  const [name, setName] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !mileage || !fuel) return;

    // Create a new vehicle object
    const newVehicle = {
      id: Date.now(), // simple unique ID
      name,
      mileage: parseInt(mileage),
      fuel,
    };

    // Pass it back to the parent
    onVehicleAdded(newVehicle);

    // Clear form
    setName("");
    setMileage("");
    setFuel("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Vehicle Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="number"
        placeholder="Mileage"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="text"
        placeholder="Fuel Type"
        value={fuel}
        onChange={(e) => setFuel(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button type="submit">Add Vehicle</button>
    </form>
  );
}

export default AddVehicleForm;
