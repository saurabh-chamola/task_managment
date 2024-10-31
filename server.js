import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.js";
import taskRoutes from "./src/routes/task.js";
import error from "./src/utils/error.js";
import connectDB from "./src/configs/db.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from "swagger-jsdoc";
import cors from "cors";
import { redis } from "./src/configs/redis.js";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;




// Redis connection
redis.on("connect", () => {
  console.log("Redis connected!!");
});



// Create socket server
const server = http.createServer(app);
export const io = new SocketIO(server, {
  cors: {
    origin: 'https://task-managment-fa53.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});




// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:");
  });
});





// CORS configuration
app.use(cors({
  origin: 'https://task-managment-fa53.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));



// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TASK MANAGEMENT',
      version: '1.0.0',
      description: "APIs for Task Management Backend. \n\nNote: To view real-time task updates(SOCKET-IO), please access the following endpoints in browser:\n- For the local server, open   :::    http://localhost:8000/api/v1/realtime-notifications .\n- For the live server, open   :::     https://task-managment-fa53.onrender.com/api/v1/realtime-notifications",
    },
    servers: [
      { url: `http://localhost:${PORT}` },
      { url: "https://task-managment-fa53.onrender.com/" }
    ],
  },
  apis: ["./src/routes/*.js"],
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'))



// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve("./public")))



// Connect to Database
connectDB();



// Route Middlewares
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/task", taskRoutes);

//for watching realtime task updates or task assignment notification
app.get("/api/v1/realtime-notifications", async (req, res) => {
  try {
    res.render("notification.ejs")
  }
  catch (e) {
    res.status(400).json({ message: e?.message || "Internal server error" })
  }
})

app.get('/', (req, res) => {
  res.send("Welcome to the Task Management System Apis.");
});



// Global Error Handler
app.use(error);


// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
