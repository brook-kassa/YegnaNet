import { useState } from "react";

function HotspotList({ hotspots }) {
  const [votedHotspots, setVotedHotspots] = useState(() => {
    const savedVotes = localStorage.getItem("votedHotspots");
    return savedVotes ? JSON.parse(savedVotes) : {};
  });

  const [noteLanguage, setNoteLanguage] = useState("am");

  function handleVote(hotspotId, voteType) {
    if (votedHotspots[hotspotId] === voteType) {
      setVotedHotspots((prevVotes) => {
        const newVotes = { ...prevVotes };
        delete newVotes[hotspotId];
        localStorage.setItem("votedHotspots", JSON.stringify(newVotes));
        return newVotes;
      });
      return;
    }

    fetch("http://localhost:7071/api/vote_hotspot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: hotspotId,
        vote: voteType
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Vote request failed");
        }
        return res.json();
      })
      .then(() => {
        setVotedHotspots((prevVotes) => {
          const newVotes = {
            ...prevVotes,
            [hotspotId]: voteType
          };
          localStorage.setItem("votedHotspots", JSON.stringify(newVotes));
          return newVotes;
        });
      })
      .catch((err) => {
        console.error("Error voting:", err);
        alert("Voting failed. Please try again.");
      });
  }

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "20px" }}>
      <h3>Submitted Spots</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <strong>Show Notes in: </strong>
          <select
            value={noteLanguage}
            onChange={(e) => setNoteLanguage(e.target.value)}
          >
            <option value="am">Amharic (አማርኛ)</option>
            <option value="en">English (እንግሊዝኛ)</option>
          </select>
        </label>
      </div>

      {[...hotspots]
        .sort((a, b) => (b.trusted === true) - (a.trusted === true))
        .map((spot) => {
          const userVote = votedHotspots[spot.id];

          return (
            <div
              key={spot.id}
              style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}
            >
              <strong>
                {spot.name}
                {spot.trusted && (
                  <span style={{ color: "green", fontSize: "0.9em", marginLeft: "8px" }}>
                    ✅ Verified
                  </span>
                )}
              </strong>
              <br />
              {noteLanguage === "am"
                ? (spot.notes_am || spot.notes || "No notes")
                : (spot.notes_en || spot.notes || "No translation")}
              <br />
              <span>👍 {spot.upvotes ?? 0}   👎 {spot.downvotes ?? 0}</span><br />

              <button
                onClick={() => handleVote(spot.id, "up")}
                disabled={userVote === "down"}
              >
                Upvote
              </button>

              <button
                onClick={() => handleVote(spot.id, "down")}
                disabled={userVote === "up"}
              >
                Downvote
              </button>

              {userVote && (
                <div style={{ fontSize: "0.9em", color: "#555" }}>
                  You voted {userVote}.
                </div>
              )}

              {spot.tags && spot.tags.length > 0 && (
                <div style={{ fontSize: "0.85em", color: "#666" }}>
                  Tags: {spot.tags.join(', ')}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

export default HotspotList;
