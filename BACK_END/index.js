const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { registerUser, loginUser, authenticateToken } = require("./src/auth")

const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true)

      // Allow all localhost and 127.0.0.1 origins on any port
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true)
      }

      // Allow file:// protocol (when opening HTML files directly)
      if (origin === "null") {
        return callback(null, true)
      }

      // Allow any origin for development (remove in production)
      return callback(null, true)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  console.log("Origin:", req.headers.origin)
  console.log("User-Agent:", req.headers["user-agent"])
  next()
})

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Universal Market Backend is running 🚀",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected", // You can add actual DB health check here
  })
})

// Authentication routes
app.post("/api/auth/register", registerUser)
app.post("/api/auth/login", loginUser)

// Protected route example
app.get("/api/auth/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  })
})

// Test protected route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", userId: req.user.userId })
})

app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// Handle 404 for all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`)
})
