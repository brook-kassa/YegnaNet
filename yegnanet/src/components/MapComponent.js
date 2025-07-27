import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import { useState } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const trustedIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconSize: [30, 48],
  iconAnchor: [12, 41],
  className: "trusted-marker"
});

function MapComponent({ hotspots }) {
  const [noteLanguage, setNoteLanguage] = useState("am");

  return (
    <div>
      {/* Global Language Toggle */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <strong>Show Notes in: </strong>
          <select
            value={noteLanguage}
            onChange={(e) => setNoteLanguage(e.target.value)}
          >
            <option value="am">Amharic</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      {/* Map with Markers */}
      <MapContainer
        center={[9.03, 38.74]}
        zoom={13}
        className="map-container"
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"


        />

        {hotspots.map((spot) => {
          let lat = undefined;
          let lon = undefined;

          if (spot.location && typeof spot.location === "string") {
            const parts = spot.location.split(",").map((p) => p.trim());
            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
          }

          if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) return null;

          return (
            <Marker
              key={spot.id}
              position={[lat, lon]}
              icon={spot.trusted ? trustedIcon : markerIcon}
            >
              <Popup>
                <strong>{spot.name}</strong><br />
                {noteLanguage === "am"
                  ? (spot.notes_am || spot.notes || "No notes")
                  : (spot.notes_en || spot.notes || "No translation")}
                <br />
                {spot.tags && (
                  <div style={{ fontSize: "0.85em", marginTop: "4px", color: "#555" }}>
                    {spot.tags.join(', ')}
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
