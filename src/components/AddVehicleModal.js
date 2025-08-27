import React from "react";

const AddVehicleModal = ({ newVehicle, setNewVehicle, setShowModal, addVehicle }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ position: "fixed", top: "20%", left: "30%", width: "40%", padding: "20px", background: "white", border: "1px solid #ccc" }}>
      <h3>Add New Vehicle</h3>
      <input name="vin" placeholder="VIN" value={newVehicle.vin} onChange={handleChange} />
      <input name="name" placeholder="Name" value={newVehicle.name} onChange={handleChange} />
      <input name="driver" placeholder="Driver" value={newVehicle.driver} onChange={handleChange} />
      <input name="description" placeholder="Description" value={newVehicle.description} onChange={handleChange} />
      <button onClick={addVehicle}>Add Vehicle</button>
      <button onClick={() => setShowModal(false)}>Cancel</button>
    </div>
  );
};

export default AddVehicleModal;
