import { useEffect, useState } from "react";

// export the component
function AddNewSpotForm(){
    const [currLocation, setcurrLocation] = useState("")
    const [spotName, setspotName] = useState("")
    const [userNotes, setuserNotes] = useState("")

    useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    const locationStr = `${lat}, ${lon}`
    setcurrLocation(locationStr);
});
}, []);

return(
    <form>
    <input 
      type="text" 
      placeholder="Location"
      value={currLocation}
      onChange={(e) => setcurrLocation(e.target.value)}
    />

    <input 
      type="text" 
      placeholder="Name"
      value={spotName}
      onChange={(e) => setspotName(e.target.value)}
    />

    <textarea 
      placeholder="Notes"
      value={userNotes}
      onChange={(e) => setuserNotes(e.target.value)}
      />
    <button type="submit">Submit</button>
    </form>
);
}
export default AddNewSpotForm;

// return some JSX
// bonus: use hoos like useState or useEffect if need be

