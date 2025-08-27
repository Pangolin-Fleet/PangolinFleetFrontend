import React from "react";
import VehicleItem from "./VehicleItem";

export default function VehiclesPage({
  vehicles,
  incrementMileage,
  updateStatus,
  deleteVehicle,
  editVehicle,
  editVehicleId,
  setEditVehicleId,
  showModal,
  setShowModal,
  newVehicle,
  setNewVehicle,
  addVehicle,
  animatedId,
  statusCounts,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus
}) {
  return (
    <div className="vehicles-page">
      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name, VIN, driver..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc", flex: 1, marginRight: "15px" }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          <option value="">All Vehicles</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>
        <button
          onClick={() => setShowModal(true)}
          style={{ marginLeft: "15px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 15px", cursor: "pointer" }}
        >
          + Add Vehicle
        </button>
      </div>

      {/* Vehicle Cards */}
      <div className="vehicle-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {vehicles.map(vehicle => (
          <VehicleItem
            key={vehicle.id}
            vehicle={vehicle}
            incrementMileage={incrementMileage}
            updateStatus={updateStatus}
            deleteVehicle={deleteVehicle}
            editVehicle={editVehicle}
            editVehicleId={editVehicleId}
            setEditVehicleId={setEditVehicleId}
            animatedId={animatedId}
          />
        ))}
      </div>
    </div>
  );
}
