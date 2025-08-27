import React, { useState } from "react";

function AddVehicleForm({ addVehicle }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addVehicle({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Vehicle Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Vehicle Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Add Vehicle</button>
    </form>
  );
}

export default AddVehicleForm;
