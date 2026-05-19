import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const PORT = 3001;

// ======================================================
// MIDDLEWARE
// ======================================================
app.use(cors());
app.use(express.json());

// ======================================================
// DATABASE SETUP
// ======================================================
const db = new sqlite3.Database("./tv_scheduler.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
      showId INTEGER PRIMARY KEY,
      showName TEXT NOT NULL,
      savedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

console.log("SQLite database initialized.");

// ======================================================
// GET /watchlist
// ======================================================
app.get("/watchlist", (req, res) => {
  db.all(
    "SELECT * FROM watchlist ORDER BY savedAt DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: "Failed to load watchlist",
          message: err.message,
        });
      }

      res.json(rows);
    }
  );
});

// ======================================================
// POST /watchlist
// ======================================================
app.post("/watchlist", (req, res) => {
  const { showId, showName } = req.body;

  if (!showId || !showName) {
    return res.status(400).json({
      error: "Missing showId or showName",
    });
  }

  // Check duplicates
  db.get(
    "SELECT showId FROM watchlist WHERE showId = ?",
    [showId],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          error: "Database error",
          message: err.message,
        });
      }

      if (row) {
        return res.json({
          message: "Already saved",
        });
      }

      // Insert new show
      db.run(
        "INSERT INTO watchlist (showId, showName) VALUES (?, ?)",
        [showId, showName],
        function (err) {
          if (err) {
            return res.status(500).json({
              error: "Failed to save show",
              message: err.message,
            });
          }

          res.json({
            message: "Show saved",
            id: this.lastID,
          });
        }
      );
    }
  );
});

// ======================================================
// DELETE /watchlist/:showId
// ======================================================
app.delete("/watchlist/:showId", (req, res) => {
  const showId = Number(req.params.showId);

  db.run(
    "DELETE FROM watchlist WHERE showId = ?",
    [showId],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: "Delete failed",
          message: err.message,
        });
      }

      res.json({
        message: "Deleted successfully",
        changes: this.changes,
      });
    }
  );
});

// ======================================================
// GET /schedule/today
// Fetch yesterday, today, and tomorrow to avoid missing
// shows because of timezone differences.
// ======================================================
app.get("/schedule/today", async (req, res) => {
  try {
    // Format date as YYYY-MM-DD
    function formatDate(date) {
      return date.toISOString().split("T")[0];
    }

    // Create dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dates = [
      formatDate(yesterday),
      formatDate(today),
      formatDate(tomorrow),
    ];

    // Fetch all three dates in parallel
    const responses = await Promise.all(
      dates.map((date) =>
        fetch(`https://api.tvmaze.com/schedule?country=US&date=${date}`)
      )
    );

    // Convert responses to JSON
    const results = await Promise.all(
      responses.map((response) => response.json())
    );

    // Flatten into one array
    const allEpisodes = results.flat();

    // Transform into frontend-friendly format
    const transformed = allEpisodes.map((episode) => ({
      showId: episode.show.id,
      showName: episode.show.name,
      season: episode.season,
      episode: episode.number,
      episodeName: episode.name,
      airTime: episode.airtime,
      airDate: episode.airdate,
    }));

    // Remove duplicates
    // Unique key = showId + season + episode
    const uniqueMap = new Map();

    for (const episode of transformed) {
      const key = `${episode.showId}-${episode.season}-${episode.episode}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, episode);
      }
    }

    const uniqueEpisodes = Array.from(uniqueMap.values());

    // Sort by air date, then air time
    uniqueEpisodes.sort((a, b) => {
      const dateCompare = (a.airDate || "").localeCompare(
        b.airDate || ""
      );

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (a.airTime || "").localeCompare(b.airTime || "");
    });

    console.log(
      `Fetched ${allEpisodes.length} episodes across 3 days. ` +
      `Returning ${uniqueEpisodes.length} unique episodes.`
    );

    res.json(uniqueEpisodes);
  } catch (error) {
    console.error("Schedule fetch failed:", error);

    res.status(500).json({
      error: "Failed to fetch schedule",
      message: error.message,
    });
  }
});

// ======================================================
// GET /show-details?name=Show Name
// ======================================================
app.get("/show-details", async (req, res) => {
  try {
    const showName = req.query.name;

    if (!showName) {
      return res.status(400).json({
        error: "Missing show name",
      });
    }

    const response = await fetch(
      `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(
        showName
      )}&embed=nextepisode`
    );

    const data = await response.json();

    res.json({
      showId: data.id,
      name: data.name,
      summary: data.summary,
      nextEpisode: data._embedded?.nextepisode
        ? {
            airdate:
              data._embedded.nextepisode.airdate,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch show details",
      message: error.message,
    });
  }
});

// ======================================================
// START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(
    `Local backend running at http://localhost:${PORT}`
  );
});