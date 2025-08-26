import React, { useState } from "react";

export default function App() {
  const [vehicles, setVehicles] = useState([
    { id: 1, name: "Car A", status: "available", currentMileage: 12000 },
    { id: 2, name: "Car B", status: "in-use", currentMileage: 8000 },
    { id: 3, name: "Car C", status: "service-due", currentMileage: 15000 },
  ]);

  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleMileage, setNewVehicleMileage] = useState("");

  const handleAddVehicle = () => {
    if (!newVehicleName || !newVehicleMileage) return;
    setVehicles(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newVehicleName,
        status: "available",
        currentMileage: Number(newVehicleMileage),
      },
    ]);
    setNewVehicleName("");
    setNewVehicleMileage("");
  };

  const handleRemoveVehicle = id => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Vehicle Fleet Dashboard</h1>

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

      {/* Vehicle Table */}
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
              <td className="border p-2">{v.name}</td>
              <td className="border p-2">{v.status}</td>
              <td className="border p-2">{v.currentMileage}</td>
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
