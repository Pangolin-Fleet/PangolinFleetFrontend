import React from "react";
import VehicleItem from "./VehicleItem";

export default function MaintenancePage({ vehicles, editVehicle, editVehicleId, setEditVehicleId, completeMaintenance, animatedId }) {
  return (
    <div className="vehicle-grid">
      {vehicles.map(vehicle => (
        <VehicleItem
          key={vehicle.id}
          vehicle={vehicle}
          incrementMileage={() => {}}
          updateStatus={completeMaintenance}
          deleteVehicle={() => {}}
          editVehicle={editVehicle}
          editVehicleId={editVehicleId}
          setEditVehicleId={setEditVehicleId}
          animatedId={animatedId}
        />
      ))}
    </div>
  );
}
