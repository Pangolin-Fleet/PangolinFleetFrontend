
import React, { useState } from "react";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([
    { id: 1, name: "Car A", status: "available", currentMileage: 12000 },
    { id: 2, name: "Car B", status: "in-use", currentMileage: 8000 },
    { id: 3, name: "Car C", status: "service-due", currentMileage: 15000 },
  ]);

  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleMileage, setNewVehicleMileage] = useState("");

  const handleChange = (id, field, value) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, [field]: field === "currentMileage" ? Number(value) : value }
          : v
      )
    );
  };

  const handleAddVehicle = () => {
    if (!newVehicleName || !newVehicleMileage) return;
    const newVehicle = {
      id: Date.now(),
      name: newVehicleName,
      status: "available",
      currentMileage: Number(newVehicleMileage),
    };
    setVehicles(prev => [...prev, newVehicle]);
    setNewVehicleName("");
    setNewVehicleMileage("");
  };

  const handleRemoveVehicle = id => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const totalVehicles = vehicles.length;
  const available = vehicles.filter(v => v.status === "available").length;
  const inUse = vehicles.filter(v => v.status === "in-use").length;
  const serviceDue = vehicles.filter(v => v.status === "service-due").length;
  const maintenance = vehicles.filter(v => v.status === "maintenance").length;
  const outOfService = vehicles.filter(v => v.status === "out-of-service").length;
  const totalMileage = vehicles.reduce((acc, v) => acc + v.currentMileage, 0);
  const avgMileage = totalVehicles ? Math.round(totalMileage / totalVehicles) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Vehicle Fleet Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card title="Total Vehicles" value={totalVehicles} />
        <Card title="Available" value={available} />
        <Card title="In Use" value={inUse} />
        <Card title="Service Due" value={serviceDue} />
        <Card title="Maintenance" value={maintenance} />
        <Card title="Out of Service" value={outOfService} />
        <Card title="Average Mileage" value={avgMileage} />
        <Card title="Total Mileage" value={totalMileage} />
      </div>

      {/* Add Vehicle Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Vehicle Name"
          value={newVehicleName}
          onChange={e => setNewVehicleName(e.target.value)}
          className="border px-2 py-1 rounded w-1/2"
        />
        <input
          type="number"
          placeholder="Mileage"
          value={newVehicleMileage}
          onChange={e => setNewVehicleMileage(e.target.value)}
          className="border px-2 py-1 rounded w-1/4"
        />
        <button
          onClick={handleAddVehicle}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Add Vehicle
        </button>
      </div>

      {/* Editable Table */}
      <table className="w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Mileage</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td className="border p-2">{v.id}</td>
              <td className="border p-2">
                <input
                  type="text"
                  value={v.name}
                  onChange={e => handleChange(v.id, "name", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </td>
              <td className="border p-2">
                <select
                  value={v.status}
                  onChange={e => handleChange(v.id, "status", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="service-due">Service Due</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-service">Out of Service</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={v.currentMileage}
                  onChange={e => handleChange(v.id, "currentMileage", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleRemoveVehicle(v.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
