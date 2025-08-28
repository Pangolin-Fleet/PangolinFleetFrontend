import React from "react";

export default function ReportPage({ vehicles }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Mileage</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Destination / Issue</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map(vehicle => (
          <tr key={vehicle.id}>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{vehicle.id}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{vehicle.name}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{vehicle.status}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{vehicle.mileage}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{vehicle.destination || vehicle.issue || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
