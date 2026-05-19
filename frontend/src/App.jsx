import { useEffect, useState } from "react";

const API_BASE_URL = "https://0vs48kzu7i.execute-api.us-east-1.amazonaws.com";

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  
async function deleteShow(showId) {
  await fetch(`${API_BASE_URL}/watchlist/${showId}`, {
    method: "DELETE",
  });

  const res = await fetch(`${API_BASE_URL}/watchlist`);
  const data = await res.json();
  setWatchlist(data);
}

async function fetchDetails(showName) {
  const response = await fetch(
    `${API_BASE_URL}/show-details?name=${encodeURIComponent(showName)}`
  );

  const data = await response.json();
  setSelectedShow(data);
  console.log("Fetching details for:", showName);
  console.log("Received:", data);
}

  // Save a show to DynamoDB, then reload watchlist
  async function saveShow(episode) {
    await fetch(`${API_BASE_URL}/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        showId: episode.showId,
        showName: episode.showName,
      }),
    });

    const response = await fetch(`${API_BASE_URL}/watchlist`);
    const data = await response.json();
    setWatchlist(data);
  }

  // Load today's TV schedule
  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/schedule/today`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const data = await response.json();
        setEpisodes(data.slice(0, 20));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  // Load saved watchlist
  useEffect(() => {
    fetch(`${API_BASE_URL}/watchlist`)
      .then((res) => res.json())
      .then((data) => setWatchlist(data));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          marginBottom: "20px",
          borderBottom: "2px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        <h1>📺 TV Scheduler</h1>
        <p>Your personal TV episode dashboard</p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Today's Episodes */}
        <section
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h2>Today's Episodes</h2>

          {loading && <p>Loading schedule...</p>}
          {error && <p>Error: {error}</p>}

          {!loading &&
            !error &&
            episodes.map((episode) => (
              <div
                key={`${episode.showId}-${episode.season}-${episode.episode}`}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong>{episode.showName}</strong>
                <br />
                S{episode.season}E{episode.episode} — {episode.episodeName}
                <br />
                <small>{episode.airTime}</small>
                <br />

                <button
                  onClick={() => saveShow(episode)}
                  style={{ marginTop: "6px" }}
                >
                  Save to My Shows
                </button>
              </div>
            ))}
        </section>

        {/* My Shows */}
        <section
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h2>My Shows</h2>
      {watchlist.map((show) => (
        <div key={show.showId}>
          <strong>{show.showName}</strong>

          <button onClick={() => fetchDetails(show.showName)}>
            Expand
          </button>

          <button onClick={() => deleteShow(show.showId)}>
            Delete
          </button>
        </div>
      ))}
        </section>

        {/* Show Details */}
        <section
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h2>Show Details</h2>

          {!selectedShow && (
            <p>Select a show from your watchlist to see details.</p>
          )}

          {selectedShow && (
            <div>
              <h3>{selectedShow.name}</h3>

              {selectedShow.nextEpisode && (
                <p>
                  Next Episode Airs: {selectedShow.nextEpisode.airdate}
                </p>
              )}

              {selectedShow.summary && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedShow.summary,
                  }}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;