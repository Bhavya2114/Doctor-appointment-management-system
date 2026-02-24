import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import "dotenv/config"

import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"

import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"

import paymentRoutes from "./routes/paymentRoutes.js"


// ============================
// Application Initialization
// ============================

// Create Express application instance
const app = express()
// [SOCKET] Create HTTP server from Express app
const httpServer = createServer(app)

// Use environment port if available (for deployment), otherwise default to 4000
const port = process.env.PORT || 4000
// [SOCKET] Allowed origins for both user and admin frontends
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)


// ============================
// Global Middlewares
// ============================

// Enables cross-origin requests so frontend (different port/domain)
// can communicate with this backend without being blocked by browser CORS policy
app.use(cors({ origin: allowedOrigins, credentials: true }))

// Parses incoming JSON request bodies
// Converts raw JSON into JavaScript object and attaches it to req.body
app.use(express.json())

// [SOCKET] Initialize Socket.IO on top of HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
})

// [SOCKET] Expose io instance safely to controllers via req.app.get('io')
app.set("io", io)

// [SOCKET] JWT auth + user room join: user:{userId}
io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token
    const headerToken = socket.handshake.headers?.token
    const authorization = socket.handshake.headers?.authorization
    const bearerToken = authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : null

    const token = authToken || headerToken || bearerToken
    if (!token) {
      return next(new Error("Socket authentication failed: token missing"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch (error) {
    return next(new Error("Socket authentication failed"))
  }
})

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`)
})


// ============================
// Route Mounting (API Endpoints)
// ============================

// All routes starting with /api/user will be handled inside userRouter
app.use("/api/user", userRouter)

// All routes starting with /api/admin will be handled inside adminRouter
app.use("/api/admin", adminRouter)

// All routes starting with /api/doctor will be handled inside doctorRouter
app.use("/api/doctor", doctorRouter)

// All routes starting with /api/payment will be handled inside paymentRoutes
app.use("/api/payment", paymentRoutes);


// ============================
// 404 Handler (Must come AFTER routes)
// ============================

// If no route matches, this middleware runs
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})


// ============================
// Global Error Handling Middleware
// ============================

// Express identifies error middleware by 4 parameters
// Any error passed using next(err) will be handled here
app.use((err, req, res, next) => {
  console.error("Global Error:", err)

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  })
})


// ============================
// Server Startup Logic
// ============================

// Start server only AFTER external services connect successfully
const startServer = async () => {
  try {
    // Connect to MongoDB database
    await connectDB()

    // Connect to Cloudinary image storage service
    await connectCloudinary()

    // Start listening for incoming HTTP requests + Socket.IO
    httpServer.listen(port, () => {
      console.log(`Server started on PORT: ${port}`)
    })

  } catch (error) {
    console.error("Startup failed:", error)

    // Exit process if critical service fails
    process.exit(1)
  }
}

// Initialize application
startServer()