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
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [watchlistSearch, setWatchlistSearch] = useState("");
  const [showDetailsMap, setShowDetailsMap] = useState({});
  const [popularShows, setPopularShows] = useState([]);
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

    await loadWatchlistDetails(data);
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

  async function loadWatchlistDetails(shows) {
    const detailsMap = {};

    for (const show of shows) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/show-details?name=${encodeURIComponent(
            show.showName
          )}`
        );

        if (!response.ok) continue;

        const data = await response.json();

        detailsMap[show.showName] = data;
      } catch (error) {
        console.error(
          "Failed to load details for",
          show.showName,
          error
        );
      }
    }

    setShowDetailsMap(detailsMap);
  }


  async function loadSchedule() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/schedule/today`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const data = await response.json();

      const sorted = [...data].sort((a, b) => {
        const dateCompare = (a.airDate || "").localeCompare(
          b.airDate || ""
        );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (a.airTime || "").localeCompare(
          b.airTime || ""
        );
      });

      setEpisodes(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPopularShows() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/popular-shows`
    );

    if (!response.ok) {
      throw new Error("Failed to load popular shows");
    }

    const data = await response.json();

    setPopularShows(data);
  } catch (err) {
    console.error(err);
  }
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

      loadSchedule();
      loadWatchlist();
      loadPopularShows();
  }, []);
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const yesterdayDate = formatDate(yesterday);
  const todayDate = formatDate(now);
  const tomorrowDate = formatDate(tomorrow);

  const yesterdayEpisodes = episodes.filter(
    (ep) => ep.airDate === yesterdayDate
  );

  const todayEpisodes = episodes.filter(
    (ep) => ep.airDate === todayDate
  );

  const tomorrowEpisodes = episodes.filter(
    (ep) => ep.airDate === tomorrowDate
  );

  function renderEpisodes(list) {
    if (list.length === 0) {
      return (
        <p style={mutedTextStyle}>
          No episodes found.
        </p>
      );
    }

    return list.map((episode) => (
      <div
        key={`${episode.showId}-${episode.season}-${episode.episode}-${episode.airDate}`}
        style={itemStyle}
      >
        <strong>{episode.showName}</strong>

        <p style={{ ...mutedTextStyle, margin: "6px 0" }}>
          S{episode.season}E{episode.episode} — {episode.episodeName}
        </p>

        <small style={mutedTextStyle}>
          {episode.airTime || "Unknown Time"}
        </small>

        <br />

        <button
          onClick={() => saveShow(episode)}
          style={buttonStyle}
        >
          Save to My Shows
        </button>
      </div>
    ));
  }

  const filteredYesterdayEpisodes = yesterdayEpisodes.filter((episode) =>
      episode.showName
        .toLowerCase()
        .includes(scheduleSearch.toLowerCase())
    );

    const filteredTodayEpisodes = todayEpisodes.filter((episode) =>
      episode.showName
        .toLowerCase()
        .includes(scheduleSearch.toLowerCase())
    );

    const filteredTomorrowEpisodes = tomorrowEpisodes.filter((episode) =>
      episode.showName
        .toLowerCase()
        .includes(scheduleSearch.toLowerCase())
    );

    const filteredWatchlist = watchlist.filter((show) =>
      show.showName
        .toLowerCase()
        .includes(watchlistSearch.toLowerCase())
    );


    function prettyDate(dateString) {
      return new Date(dateString).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
          month: "short",
          day: "numeric",
        }
      );
    }
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


    {/* Top Section: Watchlist + Details */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "20px",
        alignItems: "start",
        
      }}
    >
      {/* My Shows */}
      <section
        style={{
          ...cardStyle,
          maxHeight: "40vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>⭐ My Shows</h2>

        <input
          type="text"
          placeholder="Search saved shows..."
          value={watchlistSearch}
          onChange={(e) =>
            setWatchlistSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            borderRadius: "6px",
            border: `1px solid ${theme.cardBorder}`,
            background: theme.itemBackground,
            color: theme.text,
            boxSizing: "border-box",
          }}
        />

        {watchlist.length === 0 && (
          <p style={mutedTextStyle}>
            No saved shows yet.
          </p>
        )}

        {filteredWatchlist.map((show) => (
          <div
            key={show.showId}
            style={itemStyle}
          >
            <strong>{show.showName}</strong>
            {showDetailsMap[show.showName]?.nextEpisode ? (
              <p
                style={{
                  ...mutedTextStyle,
                  margin: "6px 0",
                  fontSize: "14px",
                }}
              >
                📅 Next Episode:{" "}
                {
                  showDetailsMap[show.showName].nextEpisode.airdate
                }
              </p>
            ) : (
              <p
                style={{
                  ...mutedTextStyle,
                  margin: "6px 0",
                  fontSize: "14px",
                }}
              >
                📅 No upcoming episode
              </p>
            )}

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
        <h2 style={{ marginTop: 0 }}>📄 Show Details</h2>

        {!selectedShow && (
          <p style={mutedTextStyle}>
            Select a show to see details.
          </p>
        )}

        {selectedShow && (
          <div>
            <h3>{selectedShow.name}</h3>

            {selectedShow.nextEpisode ? (
              <p>
                <strong>Next Episode:</strong>{" "}
                {selectedShow.nextEpisode.airdate}
              </p>
            ) : (
              <p style={mutedTextStyle}>
                No upcoming episode information.
              </p>
            )}

            {selectedShow.summary && (
              <div
                style={{ lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{
                  __html: selectedShow.summary,
                }}
              />
            )}
          </div>
        )}
      </section>
    </div>

    {/* Popular Shows */}
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>
        🔥 Popular Shows
      </h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {popularShows.map((show) => (
          <div
            key={show.showId}
            style={{
              minWidth: "140px",
              maxWidth: "140px",
              background: theme.itemBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "10px",
              padding: "12px",
              flexShrink: 0,
            }}
          >
            <img
              src={show.image}
              alt={show.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />

            <strong>{show.name}</strong>

            <p
              style={{
                ...mutedTextStyle,
                margin: "6px 0",
              }}
            >
              ⭐ {show.rating || "N/A"}
            </p>

            <p
              style={{
                ...mutedTextStyle,
                fontSize: "13px",
              }}
            >
              {show.genres.join(", ")}
            </p>

            <button
              style={buttonStyle}
              onClick={() =>
                saveShow({
                  showId: show.showId,
                  showName: show.name,
                })
              }
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </section>


    {/* Schedule Section */}
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>📅 Episode Schedule</h2>

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={loadSchedule}
          style={buttonStyle}
        >
          🔄 Refresh Schedule
        </button>
      </div>
      {/* Search Episodes Section */}
    <input
      type="text"
      placeholder="Search all episodes..."
      value={scheduleSearch}
      onChange={(e) =>
        setScheduleSearch(e.target.value)
      }
      style={{
        width: "100%",
        padding: "8px",
        marginBottom: "16px",
        borderRadius: "6px",
        border: `1px solid ${theme.cardBorder}`,
        background: theme.itemBackground,
        color: theme.text,
        boxSizing: "border-box",
      }}
    />
      {loading && <p>Loading schedule...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <section style={scrollSectionStyle}>
            <h3>{prettyDate(yesterdayDate)}</h3>
            {renderEpisodes(filteredYesterdayEpisodes)}
          </section>

          <section style={scrollSectionStyle}>
            <h3>{prettyDate(todayDate)}</h3>
            {renderEpisodes(filteredTodayEpisodes)}
          </section>

          <section style={scrollSectionStyle}>
            <h3>{prettyDate(tomorrowDate)}</h3>
            {renderEpisodes(filteredTomorrowEpisodes)}
          </section>
        </div>
      )}
    </section>
    </div>
  );
}

export default App;