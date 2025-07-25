import { toast } from 'react-toastify';
import { useEffect, useState } from "react";

function AddNewSpotForm({ onNewHotspot }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [currLocation, setCurrLocation] = useState("");
  const [spotName, setSpotName] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [trusted, setTrusted] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const locationStr = `${lat}, ${lon}`;
      setCurrLocation(locationStr);
    });
  }, []);

function handleSubmit(e) {
  e.preventDefault();

  const formData = {
    location: currLocation,
    name: spotName,
    notes: userNotes,
    tags: selectedTags,
    trusted: trusted
  };

  fetch("http://localhost:7071/api/addHotspot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server error");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Success:", data);
      toast.success("Hotspot added successfully!");
      setSpotName("");
      setUserNotes("");

      if (onNewHotspot) {
        onNewHotspot();
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      toast.error("Failed to add hotspot.");
    });
}


  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Add New WiFi Spot</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Location
          <input
            type="text"
            value={currLocation}
            readOnly
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </label>
        <label>
          Name
          <input
            type="text"
            value={spotName}
            onChange={(e) => setSpotName(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </label>
        <label>
          Notes
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </label>
        <label>
          Tags
          <select
            multiple
            value={selectedTags}
            onChange={(e) =>
              setSelectedTags(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <option value="cafe">Cafe</option>
            <option value="library">Library</option>
            <option value="gov">Government</option>
            <option value="school">School</option>
            <option value="restaurant">Restaurant</option>
            <option value="shop">Shop</option>
          </select>
        </label>
        <label>
        <input
            type="checkbox"
            checked={trusted}
            onChange={(e) => setTrusted(e.target.checked)}
            style={{ marginRight: "10px" }}
          /> 
          Mark as Trusted (admin use)
        </label>  
        <button type="submit" style={{ width: "100%" }}>Submit</button>
      </form>
    </div>
  );
}

export default AddNewSpotForm;
