function App() {
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
          <p>Episodes airing today will appear here.</p>
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
          <p>Your saved shows will appear here.</p>
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
          <p>Last aired and episode history will appear here.</p>
        </section>
      </div>
    </div>
  );
}

export default App;