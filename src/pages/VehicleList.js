import React, { useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
} from "@mui/material";

function VehicleList() {
  const [vehicles, setVehicles] = useState([
    { id: 1, name: "Toyota Corolla", mileage: 120000, fuel: "Petrol" },
    { id: 2, name: "Ford Ranger", mileage: 90000, fuel: "Diesel" },
    { id: 3, name: "Honda Civic", mileage: 60000, fuel: "Petrol" },
  ]);

  const [name, setName] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");

  const handleAddVehicle = () => {
    if (!name || !mileage || !fuel) return;
    const newVehicle = {
      id: Date.now(),
      name,
      mileage: parseInt(mileage),
      fuel,
    };
    setVehicles([...vehicles, newVehicle]);
    setName("");
    setMileage("");
    setFuel("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Vehicle List
      </Typography>

      <Box sx={{ marginBottom: 2, display: "flex", gap: 1 }}>
        <TextField
          label="Vehicle Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Mileage"
          type="number"
          variant="outlined"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
        />
        <TextField
          label="Fuel Type"
          variant="outlined"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddVehicle}>
          Add Vehicle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vehicle Name</TableCell>
              <TableCell>Mileage</TableCell>
              <TableCell>Fuel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.mileage}</TableCell>
                <TableCell>{v.fuel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default VehicleList;
