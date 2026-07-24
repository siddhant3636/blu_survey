import React, { useEffect } from "react";
import { useGPS } from "../../hooks/useGPS";
import Button from "./Button";

const GPS = ({ onCoordinatesFetched }) => {
  const { coordinates, error, loading, getCoordinates } = useGPS();

  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude && onCoordinatesFetched) {
      onCoordinatesFetched(coordinates);
    }
  }, [coordinates, onCoordinatesFetched]);

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
      <h4 style={{ fontSize: "14px" }}>GPS Tagging</h4>
      {loading ? (
        <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Fetching Coordinates...</span>
      ) : coordinates.latitude ? (
        <div style={{ textAlign: "center", fontSize: "13px" }}>
          <p>Lat: {coordinates.latitude.toFixed(6)}</p>
          <p>Lng: {coordinates.longitude.toFixed(6)}</p>
        </div>
      ) : (
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No Coordinates Tagged</span>
      )}
      {error && <p style={{ color: "var(--danger)", fontSize: "11px" }}>{error}</p>}
      <Button variant="secondary" onClick={getCoordinates}>Fetch Location</Button>
    </div>
  );
};

export default GPS;
