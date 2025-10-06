import React, { useState, useEffect } from "react";
import {
  FaCar, FaMapMarkerAlt, FaRoad, FaTachometerAlt, FaUser,
  FaClock, FaHistory, FaExclamationCircle, FaSpinner,
  FaArrowRight, FaLocationArrow, FaGasPump, FaCog
} from "react-icons/fa";
import "./DriverPage.css";

export default function DriverPage({ vehicles, user, updateStatus }) {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(null);

  useEffect(() => {
    // Filter vehicles assigned to the current driver
    const driverVehicles = vehicles.filter(vehicle => 
      vehicle.status === "In Use" && 
      vehicle.assignedDriver === user.username
    );
    setAssignedVehicles(driverVehicles);
    setLoading(false);
  }, [vehicles, user]);

  const handleEndTrip = async (vin) => {
    if (!window.confirm("Are you sure you want to end this trip?")) return;
    
    try {
      await updateStatus(vin, "Available", {
        assignedDriver: "",
        currentLocation: "",
        destination: ""
      });
    } catch (error) {
      console.error("Error ending trip:", error);
      alert("Failed to end trip");
    }
  };

  const handleUpdateLocation = async (vin) => {
    setUpdatingLocation(vin);
    const vehicle = vehicles.find(v => v.vin === vin);
    const currentLocation = vehicle?.currentLocation || "";
    
    const newLocation = prompt("Enter your current location:", currentLocation);
    if (newLocation && newLocation.trim()) {
      try {
        await updateStatus(vin, "In Use", {
          currentLocation: newLocation.trim()
        });
      } catch (error) {
        console.error("Error updating location:", error);
        alert("Failed to update location");
      }
    }
    setUpdatingLocation(null);
  };

  const handleUpdateDestination = async (vin) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    const currentDestination = vehicle?.destination || "";
    
    const newDestination = prompt("Enter your destination:", currentDestination);
    if (newDestination && newDestination.trim()) {
      try {
        await updateStatus(vin, "In Use", {
          destination: newDestination.trim()
        });
      } catch (error) {
        console.error("Error updating destination:", error);
        alert("Failed to update destination");
      }
    }
  };

  // Calculate trip statistics
  const getTripStats = (vehicle) => {
    const stats = {
      distance: vehicle.mileage?.toLocaleString() || "0",
      location: vehicle.currentLocation || "Not specified",
      destination: vehicle.destination || "Not specified"
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="driver-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-main">
              <h1>My Assigned Vehicles</h1>
              <p>Loading your vehicles...</p>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <FaSpinner className="spin large" />
        </div>
      </div>
    );
  }

  return (
    <div className="driver-page">
      {/* Space Background */}
      <div className="space-background"></div>
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Pangolin Fleet</h1>
            <p>My Assigned Vehicles & Active Missions</p>
            <div className="driver-welcome">
              <span className="welcome-text">Welcome, {user.name || user.username}</span>
              <span className="mission-count">
                {assignedVehicles.length} Active Mission{assignedVehicles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="user-info">
            <div className="user-name">{user.name || user.username}</div>
            <div className="user-role">Driver</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Summary Cards for Driver */}
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#10b981" }}>
                  <FaCar />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#10b981" }}>
                    {assignedVehicles.length}
                  </div>
                  <div className="summary-label">Active Missions</div>
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#3b82f6" }}>
                  <FaRoad />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#3b82f6" }}>
                    {vehicles.filter(v => v.status === "In Use").length}
                  </div>
                  <div className="summary-label">Total In Use</div>
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#f59e0b" }}>
                  <FaTachometerAlt />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#f59e0b" }}>
                    {assignedVehicles.reduce((total, v) => total + (v.mileage || 0), 0).toLocaleString()} km
                  </div>
                  <div className="summary-label">Total Mileage</div>
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-card-content">
                <div className="summary-icon" style={{ color: "#8b5cf6" }}>
                  <FaUser />
                </div>
                <div className="summary-text">
                  <div className="summary-value" style={{ color: "#8b5cf6" }}>
                    {user.username}
                  </div>
                  <div className="summary-label">Your ID</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {assignedVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No Active Missions Assigned</h3>
            <p>You don't have any vehicles assigned to you currently.</p>
            <p>Vehicles will appear here when an administrator assigns them to you for missions.</p>
            <div className="empty-tips">
              <div className="tip-card">
                <FaCog className="tip-icon" />
                <h4>How to get assigned:</h4>
                <p>Administrators will assign vehicles to you when they need you for missions.</p>
              </div>
              <div className="tip-card">
                <FaCar className="tip-icon" />
                <h4>Check back later:</h4>
                <p>New assignments appear here automatically when they're made.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="missions-grid">
            {assignedVehicles.map(vehicle => {
              const stats = getTripStats(vehicle);
              
              return (
                <div key={vehicle.vin} className="mission-card">
                  <div className="mission-header">
                    <div className="vehicle-info">
                      <h3>{vehicle.make} {vehicle.model}</h3>
                      <span className="vehicle-details">
                        {vehicle.year} • {vehicle.vin}
                      </span>
                    </div>
                    <span className="mission-status">
                      <FaCar className="status-icon" />
                      Active Mission
                    </span>
                  </div>

                  <div className="mission-body">
                    {/* Trip Route Visualization */}
                    <div className="route-section">
                      <div className="route-point current">
                        <FaMapMarkerAlt className="point-icon" />
                        <div className="point-info">
                          <span className="point-label">Current Location</span>
                          <span className="point-value">{stats.location}</span>
                        </div>
                        <button 
                          className="btn-location-update"
                          onClick={() => handleUpdateLocation(vehicle.vin)}
                          disabled={updatingLocation === vehicle.vin}
                        >
                          {updatingLocation === vehicle.vin ? (
                            <FaSpinner className="spin" />
                          ) : (
                            <FaLocationArrow />
                          )}
                          Update
                        </button>
                      </div>
                      
                      <div className="route-arrow">
                        <FaArrowRight />
                      </div>
                      
                      <div className="route-point destination">
                        <FaMapMarkerAlt className="point-icon destination" />
                        <div className="point-info">
                          <span className="point-label">Destination</span>
                          <span className="point-value">{stats.destination}</span>
                        </div>
                        <button 
                          className="btn-location-update"
                          onClick={() => handleUpdateDestination(vehicle.vin)}
                        >
                          <FaLocationArrow />
                          Update
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="vehicle-stats">
                      <div className="stat-item">
                        <div className="stat-icon">
                          <FaTachometerAlt />
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{stats.distance} km</span>
                          <span className="stat-label">Mileage</span>
                        </div>
                      </div>
                      
                      <div className="stat-item">
                        <div className="stat-icon">
                          <FaGasPump />
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">Ready</span>
                          <span className="stat-label">Status</span>
                        </div>
                      </div>
                      
                      {vehicle.description && (
                        <div className="stat-item full-width">
                          <div className="stat-icon">
                            <FaHistory />
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{vehicle.description}</span>
                            <span className="stat-label">Notes</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expiry Information */}
                    {(vehicle.discExpiryDate || vehicle.licenseExpiryDate || vehicle.insuranceExpiryDate) && (
                      <div className="expiry-info">
                        <h4 className="expiry-title">Document Expiry</h4>
                        <div className="expiry-grid">
                          {vehicle.discExpiryDate && (
                            <div className="expiry-item">
                              <span className="expiry-label">Disc:</span>
                              <span className={`expiry-value ${new Date(vehicle.discExpiryDate) < new Date() ? 'expired' : ''}`}>
                                {new Date(vehicle.discExpiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {vehicle.licenseExpiryDate && (
                            <div className="expiry-item">
                              <span className="expiry-label">License:</span>
                              <span className={`expiry-value ${new Date(vehicle.licenseExpiryDate) < new Date() ? 'expired' : ''}`}>
                                {new Date(vehicle.licenseExpiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {vehicle.insuranceExpiryDate && (
                            <div className="expiry-item">
                              <span className="expiry-label">Insurance:</span>
                              <span className={`expiry-value ${new Date(vehicle.insuranceExpiryDate) < new Date() ? 'expired' : ''}`}>
                                {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mission-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleUpdateLocation(vehicle.vin)}
                      disabled={updatingLocation === vehicle.vin}
                    >
                      {updatingLocation === vehicle.vin ? (
                        <FaSpinner className="spin" />
                      ) : (
                        <FaLocationArrow />
                      )}
                      Update Location
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleUpdateDestination(vehicle.vin)}
                    >
                      <FaMapMarkerAlt />
                      Change Destination
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleEndTrip(vehicle.vin)}
                    >
                      <FaClock />
                      End Mission
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other Active Vehicles Section */}
        {vehicles.filter(v => v.status === "In Use" && v.assignedDriver !== user.username).length > 0 && (
          <div className="other-missions-section">
            <div className="section-header">
              <h3>Other Active Missions</h3>
              <p>Vehicles currently in use by other drivers</p>
            </div>
            <div className="other-missions-grid">
              {vehicles
                .filter(v => v.status === "In Use" && v.assignedDriver !== user.username)
                .map(vehicle => (
                  <div key={vehicle.vin} className="other-mission-card">
                    <div className="other-vehicle-info">
                      <span className="vehicle-name">{vehicle.make} {vehicle.model}</span>
                      <span className="assigned-driver">
                        <FaUser /> {vehicle.assignedDriver}
                      </span>
                    </div>
                    <div className="other-vehicle-location">
                      <span className="location-text">
                        {vehicle.currentLocation || "Location not set"}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}