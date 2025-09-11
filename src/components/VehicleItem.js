import React from "react";
import "../AppStyles.css";

export function VehicleItem({ vehicle, theme }) {
  const darkMode = theme === "dark";

  return (
    <div className={`card ${darkMode ? "dark" : ""}`}>
      <div className={`card-header ${
        vehicle.status === "Available"
          ? "status-available"
          : vehicle.status === "In Use"
          ? "status-inuse"
          : "status-maintenance"
      }`}>
        <span>{vehicle.name}</span>
        <span>{vehicle.status}</span>
      </div>

      <div className="card-body">
        <p><strong>VIN:</strong> {vehicle.vin}</p>
        <p><strong>Driver:</strong> {vehicle.driver}</p>
        <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
        <p><strong>Description:</strong> {vehicle.description}</p>
        {vehicle.destination && <p><strong>Destination:</strong> {vehicle.destination}</p>}
      </div>
    </div>
  );
}
