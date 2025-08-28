import React from "react";
import { VehicleItem } from "./VehicleItem";

export default function MaintenancePage({ vehicles, updateStatus, editVehicle, editVehicleId, setEditVehicleId, animatedId, theme }) {
  return (
    <div className="vehicle-list">
      {vehicles.map(vehicle => (
        <VehicleItem
          key={vehicle.id}
          vehicle={vehicle}
          incrementMileage={() => {}}
          updateStatus={(id, status) => updateStatus(id, status)}
          deleteVehicle={() => {}}
          editVehicle={editVehicle}
          editVehicleId={editVehicleId}
          setEditVehicleId={setEditVehicleId}
          animatedId={animatedId}
          theme={theme}
        />
      ))}
    </div>
  );
}
