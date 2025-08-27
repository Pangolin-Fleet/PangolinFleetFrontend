import React from "react";
import VehicleItem from "./VehicleItem";

const VehicleList = ({ vehicles, incrementMileage, updateStatus, deleteVehicle, editVehicle, editVehicleId, setEditVehicleId, animatedId }) => {
  if (!vehicles) return <p>No vehicles available</p>;

  return (
    <div>
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
  );
};

export default VehicleList;
