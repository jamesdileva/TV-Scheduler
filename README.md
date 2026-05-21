# 📺 TV Scheduler

A full-stack desktop TV tracking application built with React, Express, SQLite, and Electron.

TV Scheduler allows users to:

* Browse upcoming TV episodes
* Track favorite shows locally
* View upcoming air dates
* Explore trending/popular TV shows
* Run the app completely offline from cloud services
* Install as a standalone Windows desktop application

---

# 🖥️ Preview

## Main Dashboard

Features:

* Yesterday / Today / Tomorrow schedule columns
* Watchlist panel
* Popular TV shows section
* Detailed show summaries
* Dark mode UI
* Local persistence with SQLite

---

# ✨ Features

## 📅 Episode Schedule Tracking

Pulls TV schedule data from the TVMaze API and organizes it into:

* Yesterday
* Today
* Tomorrow

Episodes are:

* Sorted by date/time
* Deduplicated
* Filtered for cleaner viewing
* Organized into responsive dashboard columns

---

## ⭐ Watchlist System

Users can:

* Save favorite shows
* Prevent duplicate saves
* Delete shows from watchlist
* Persist watchlist locally using SQLite

The watchlist survives:

* app restarts
* system reboots
* offline usage

---

## 📖 Show Details Expansion

Each saved show can display:

* Summary/description
* Upcoming episode date
* Next episode information

Powered by:

* TVMaze show lookup API

---

## 🔥 Popular Shows Section

Displays trending/popular television series in a horizontal card layout.

Includes:

* Poster artwork
* Show names
* Responsive UI cards

---

## 🌙 Dark Mode UI

Custom dark-themed dashboard built using:

* React inline styling
* Responsive CSS grid layouts
* Scrollable sections
* Sticky information panels

---

## 💾 Local-First Architecture

The final production architecture intentionally moved away from AWS cloud dependency.

Benefits:

* No monthly hosting costs
* No API Gateway/Lambda maintenance
* No free-tier limitations
* Fully offline/local persistence
* Easier Electron packaging
* Faster startup and responsiveness

---

# 🏗️ Architecture

## Final Desktop Architecture

```text
Electron Desktop App
│
├── React Frontend (Vite)
│     ├── Dashboard UI
│     ├── Watchlist UI
│     ├── Popular Shows UI
│     └── Show Details Panel
│
├── Express Backend
│     ├── /schedule/today
│     ├── /watchlist
│     ├── /show-details
│     └── /popular-shows
│
├── SQLite Database
│     └── Persistent local watchlist
│
└── TVMaze External APIs
      ├── Full TV schedule
      ├── Show metadata
      └── Episode information
```

---

# ⚙️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* CSS Grid / Inline Styling

## Backend

* Node.js
* Express.js
* SQLite3

## Desktop Packaging

* Electron
* Electron Builder

## External APIs

* TVMaze API

---

# 📂 Project Structure

```text
TV-Scheduler/
│
├── backend/
│   ├── server.js
│   └── tv_scheduler.db
│
├── frontend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
├── dist/
├── main.js
├── package.json
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Development Mode

### 1. Clone Repository

```bash
git clone <repo-url>
cd TV-Scheduler
```

---

### 2. Install Dependencies

#### Root

```bash
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```

---

### 3. Run Backend

```bash
cd backend
node server.js
```

Backend runs on:

```text
http://localhost:3001
```

---

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🖥️ Electron Desktop Build

## Build Frontend

```bash
npm run build --prefix frontend
```

---

## Package Electron App

```bash
npm run dist
```

Generated files:

```text
/dist
```

Includes:

* Windows installer
* Portable unpacked application
* Electron packaged build

---

# 🧠 Major Engineering Concepts Learned

## Full-Stack Architecture

Built and connected:

* React frontend
* Express API backend
* SQLite persistence layer
* Electron desktop runtime

---

## REST API Design

Implemented custom API endpoints:

```text
GET /schedule/today
GET /watchlist
POST /watchlist
DELETE /watchlist/:showId
GET /show-details
GET /popular-shows
```

---

## SQLite Persistence

Implemented:

* local database creation
* duplicate prevention
* persistent storage
* CRUD operations

---

## Electron Packaging

Learned:

* frontend production builds
* Electron runtime architecture
* packaged asset handling
* Vite pathing fixes
* standalone executable generation

---

## Cloud vs Local Architecture

This project originally began as a cloud-based AWS application using:

* Lambda
* API Gateway
* DynamoDB
* S3 Hosting

The project was later intentionally migrated to:

* local Express backend
* SQLite persistence
* Electron desktop packaging

This provided hands-on experience with:

* serverless architecture
* local-first application design
* migration strategies
* deployment tradeoffs

---

# ☁️ Previous AWS Architecture (Archived Branch)

An earlier version of this project used:

```text
React Frontend
   ↓
AWS API Gateway
   ↓
AWS Lambda Functions
   ↓
DynamoDB
```

Features implemented in the AWS version:

* CORS configuration
* Lambda APIs
* DynamoDB watchlist persistence
* API Gateway routing
* S3 frontend hosting
* CloudWatch debugging

This version remains available in a separate Git branch for study/reference.

---

# 📈 Future Roadmap

Potential future features:

## Planned Improvements

* Search functionality
* Advanced filtering
* Notifications/reminders
* Auto-refresh scheduling
* User preferences
* Better popularity/trending algorithms
* Streaming platform integration
* TMDB integration
* Genre filters
* Favorites sorting
* Mobile companion version
* Auto-update system

---

# 🧪 Challenges Solved

## Major Debugging Topics

### React State Management

* Async loading
* watchlist refreshes
* selected show state

### API/CORS Issues

* API Gateway CORS debugging
* Lambda response headers
* local vs cloud networking

### Electron Packaging

* Vite asset path issues
* production build handling
* Electron file loading
* backend integration

### Data Processing

* duplicate removal
* date filtering
* schedule normalization
* API transformation pipelines

---

# 🏆 Final Outcome

This project evolved from:

```text
Simple TV schedule viewer
```

into:

```text
A packaged full-stack desktop application
```

with:

* frontend UI
* backend APIs
* local database persistence
* desktop runtime
* standalone installers
* production packaging

---

# 📚 Educational Value

This project demonstrates practical understanding of:

* Frontend development
* Backend API architecture
* Database persistence
* Electron desktop development
* Production packaging
* AWS serverless concepts
* Debugging workflows
* Git branching/versioning
* Full-stack integration

---

# 📜 License

MIT License

---

# 🙌 Acknowledgements

* TVMaze API
* Electron
* React
* Express
* SQLite
* Vite

---

# 🚀 Version

```text
TV Scheduler v1.0.0
```

Initial production-ready Electron desktop release.
