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
    // Replace your ENTIRE /schedule/today route with this version.
    // TVMaze's /schedule/full does NOT include episode.show.
    // Instead, it includes _embedded.show.
    app.get("/schedule/today", async (req, res) => {
    try {
        const response = await fetch(
        "https://api.tvmaze.com/schedule/full"
        );

        const data = await response.json();

        console.log(`Full schedule returned ${data.length} episodes.`);

        // Transform from _embedded.show
        const transformed = data
        .filter(
            (episode) =>
            episode?._embedded?.show?.id != null &&
            episode?._embedded?.show?.name &&
            episode?._embedded?.show?.language === "English" &&
            !["Talk Show", "News", "Sports"].includes(episode?._embedded?.show?.type)
        )
        .map((episode) => ({
            showId: episode._embedded.show.id,
            showName: episode._embedded.show.name,
            season: episode.season,
            episode: episode.number,
            episodeName: episode.name,
            airTime: episode.airtime,
            airDate: episode.airdate,
        }));

        // Helper to format local dates
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

        const validDates = new Set([
        formatDate(yesterday),
        formatDate(now),
        formatDate(tomorrow),
        ]);

        // Keep only yesterday, today, tomorrow
        const filtered = transformed.filter((episode) =>
        validDates.has(episode.airDate)
        );

        // Remove duplicates
        const uniqueMap = new Map();

        for (const episode of filtered) {
        const key = `${episode.showId}-${episode.season ?? "0"}-${
            episode.episode ?? episode.episodeName ?? "unknown"
        }`;

        uniqueMap.set(key, episode);
        }

        const uniqueEpisodes = Array.from(uniqueMap.values());

        // Sort by date, then time
        uniqueEpisodes.sort((a, b) => {
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

        console.log(
        `Returning ${uniqueEpisodes.length} episodes for 3 days.`
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
// GET /popular-shows
// ======================================================
app.get("/popular-shows", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.tvmaze.com/schedule/full"
    );

    const data = await response.json();

    const showMap = new Map();

    for (const episode of data) {
      const show = episode?._embedded?.show;

      if (!show) continue;

      // Filters
      if (
        show.language !== "English" ||
        show.type !== "Scripted" ||
        !show.image?.medium ||
        !show.rating?.average
      ) {
        continue;
      }

      // Exclude unwanted genres
      const excludedGenres = [
        "Sports",
        "Talk Show",
        "Game Show",
        "Reality",
      ];

      if (
        show.genres.some((genre) =>
          excludedGenres.includes(genre)
        )
      ) {
        continue;
      }

      // Keep only one entry per show
      if (!showMap.has(show.id)) {
        showMap.set(show.id, {
          showId: show.id,
          name: show.name,
          rating: show.rating.average,
          genres: show.genres,
          image: show.image.medium,
          weight: show.weight || 0,
          airDate: episode.airdate,
        });
      }
    }

    // Convert to array
    const shows = Array.from(showMap.values());

    // Sort by:
    // 1. Rating
    // 2. Weight
    shows.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return b.weight - a.weight;
    });

    // Return top 15
    res.json(shows.slice(0, 15));
  } catch (error) {
    console.error(
      "Popular shows fetch failed:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch popular shows",
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