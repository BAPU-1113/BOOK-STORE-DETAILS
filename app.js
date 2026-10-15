require("dotenv").config();
const path = require("path");
const express = require("express");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/book.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/books", bookRoutes);
app.use("/books", bookRoutes); // alias for convenience

// API Health / Status endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Book Store Management API",
    version: "2.0.0",
  });
});

// Fallback to index.html for root or SPA navigation
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 Handler for API endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
  });
});

// Server launcher
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  📚 Book Store Details Management System Running!`);
      console.log(`  🌐 Web UI:   http://localhost:${PORT}`);
      console.log(`  🔌 API Base: http://localhost:${PORT}/api/books`);
      console.log(`  📊 Stats:    http://localhost:${PORT}/api/books/stats`);
      console.log(`======================================================\n`);
    });
    return server;
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
