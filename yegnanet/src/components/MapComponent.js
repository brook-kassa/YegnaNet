import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapComponent() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7071/api/get_scans")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched scans:", data);
        setHotspots(data);
      })
      .catch((err) => console.error("Error fetching scans:", err));
  }, []);

  return (
    <MapContainer center={[9.03, 38.74]} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((spot) => {
        const { lat, lon } = spot.location || {};
        if (lat === undefined || lon === undefined) return null;

        return (
          <Marker key={spot.id} position={[lat, lon]} icon={markerIcon}>
            <Popup>
              <strong>{spot.name || spot.source}</strong><br />
              Ping: {spot.ping_result ? spot.ping_result.avg_ms + " ms" : "N/A"}<br />
              {spot.notes_en || spot.notes_am || "No notes"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapComponent;
