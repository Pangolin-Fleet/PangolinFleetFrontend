import React from "react";

export default function AddVehicleModal({ newVehicle, setNewVehicle, setShowModal, addVehicle }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Vehicle</h3>
        <input
          placeholder="VIN"
          value={newVehicle.vin}
          onChange={e => setNewVehicle({ ...newVehicle, vin: e.target.value })}
        />
        <input
          placeholder="Vehicle Name"
          value={newVehicle.name}
          onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
        />
        <input
          placeholder="Driver"
          value={newVehicle.driver}
          onChange={e => setNewVehicle({ ...newVehicle, driver: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newVehicle.description}
          onChange={e => setNewVehicle({ ...newVehicle, description: e.target.value })}
        />
        <div className="modal-buttons">
          <button onClick={addVehicle}>Add</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
