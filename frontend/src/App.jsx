import { useEffect, useState } from "react";
/*
const API_BASE_URL =
  "https://0vs48kzu7i.execute-api.us-east-1.amazonaws.com";
*/
const API_BASE_URL = "http://localhost:3001";
function App() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);

  // ======================================================
  // THEME
  // ======================================================
  const theme = {
    background: "#0f172a",
    card: "#1e293b",
    cardBorder: "#334155",
    text: "#e2e8f0",
    mutedText: "#94a3b8",
    primary: "#3b82f6",
    danger: "#ef4444",
    itemBackground: "#0b1220",
  };

  // ======================================================
  // STYLES
  // ======================================================
  const appStyle = {
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: theme.background,
    minHeight: "100vh",
    color: theme.text,
  };

  const headerStyle = {
    background: theme.card,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  };

  const gridStyle = {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "1.5fr 1fr 1fr",
    alignItems: "start",
  };

  const cardStyle = {
    background: theme.card,
    borderRadius: "12px",
    padding: "16px",
    border: `1px solid ${theme.cardBorder}`,
  };

  const scrollSectionStyle = {
    ...cardStyle,
    maxHeight: "80vh",
    overflowY: "auto",
  };

  const stickyCardStyle = {
    ...cardStyle,
    position: "sticky",
    top: "20px",
  };

  const itemStyle = {
    background: theme.itemBackground,
    border: `1px solid ${theme.cardBorder}`,
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "10px",
  };

  const buttonStyle = {
    marginTop: "8px",
    marginRight: "8px",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: theme.primary,
    color: "white",
    fontSize: "14px",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: theme.danger,
  };

  const mutedTextStyle = {
    color: theme.mutedText,
  };

  // ======================================================
  // API FUNCTIONS
  // ======================================================
  async function loadWatchlist() {
    const response = await fetch(`${API_BASE_URL}/watchlist`);
    const data = await response.json();
    setWatchlist(data);
  }

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

    await loadWatchlist();
  }

  async function deleteShow(showId) {
    await fetch(`${API_BASE_URL}/watchlist/${showId}`, {
      method: "DELETE",
    });

    // Clear selected show if it was deleted
    if (selectedShow && selectedShow.showId === showId) {
      setSelectedShow(null);
    }

    await loadWatchlist();
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

  // ======================================================
  // EFFECTS
  // ======================================================
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

        const sorted = [...data].sort((a, b) =>
          (a.airTime || "").localeCompare(b.airTime || "")
        );

        setEpisodes(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
    loadWatchlist();
  }, []);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div style={appStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={{ marginTop: 0, marginBottom: "8px" }}>
          📺 TV Scheduler
        </h1>
        <p style={{ ...mutedTextStyle, margin: 0 }}>
          Your personal TV episode dashboard
        </p>
      </header>

      {/* Main Dashboard */}
      <div style={gridStyle}>
        {/* Today's Episodes */}
        <section style={scrollSectionStyle}>
          <h2 style={{ marginTop: 0 }}>Today's Episodes</h2>

          {loading && <p>Loading schedule...</p>}
          {error && <p>Error: {error}</p>}

          {!loading &&
            !error &&
            episodes.map((episode) => (
              <div
                key={`${episode.showId}-${episode.season}-${episode.episode}`}
                style={itemStyle}
              >
                <strong>{episode.showName}</strong>

                <p style={{ ...mutedTextStyle, margin: "6px 0" }}>
                  S{episode.season}E{episode.episode} —{" "}
                  {episode.episodeName}
                </p>

                <small style={mutedTextStyle}>
                  Air Time: {episode.airTime || "Unknown"}
                </small>

                <br />

                <button
                  onClick={() => saveShow(episode)}
                  style={buttonStyle}
                >
                  Save to My Shows
                </button>
              </div>
            ))}
        </section>

        {/* My Shows */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>My Shows</h2>

          {watchlist.length === 0 && (
            <p style={mutedTextStyle}>
              No saved shows yet.
            </p>
          )}

          {watchlist.map((show) => (
            <div
              key={show.showId}
              style={itemStyle}
            >
              <strong>{show.showName}</strong>

              <div>
                <button
                  onClick={() =>
                    fetchDetails(show.showName)
                  }
                  style={buttonStyle}
                >
                  Expand
                </button>

                <button
                  onClick={() =>
                    deleteShow(show.showId)
                  }
                  style={dangerButtonStyle}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Show Details */}
        <section style={stickyCardStyle}>
          <h2 style={{ marginTop: 0 }}>Show Details</h2>

          {!selectedShow && (
            <p style={mutedTextStyle}>
              Select a show from your watchlist to
              see details.
            </p>
          )}

          {selectedShow && (
            <div>
              <h3>{selectedShow.name}</h3>

              {selectedShow.nextEpisode && (
                <p>
                  <strong>Next Episode:</strong>{" "}
                  {selectedShow.nextEpisode.airdate}
                </p>
              )}

              {!selectedShow.nextEpisode && (
                <p style={mutedTextStyle}>
                  No upcoming episode information.
                </p>
              )}

              {selectedShow.summary && (
                <div
                  style={{
                    lineHeight: 1.6,
                    color: theme.text,
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedShow.summary,
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