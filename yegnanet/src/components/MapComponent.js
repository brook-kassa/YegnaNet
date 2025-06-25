// src/components/MapComponent.js
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapComponent() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7071/api/getHotspots")
      .then((res) => res.json())
      .then((data) => {
        setHotspots(data);
      })
      .catch((err) => console.error("Error fetching hotspots:", err));
  }, []);

  return (
    <MapContainer center={[9.03, 38.74]} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((spot) => {
        const [lat, lon] = spot.location.split(",").map(Number);
        return (
          <Marker key={spot.id} position={[lat, lon]} icon={markerIcon}>
            <Popup>
              <strong>{spot.name}</strong><br />
              {spot.notes}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapComponent;
