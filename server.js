import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.js";
import taskRoutes from "./src/routes/task.js";
import error from "./src/utils/error.js";
import connectDB from "./src/configs/db.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from "swagger-jsdoc";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TASK MANAGEMENT',
      version: '1.0.0',
      description: "APIs for Task Management Backend",
    },
    servers: [{ url: `http://localhost:${PORT}` },{ url:"https://task-managment-fa53.onrender.com/" }],
  },
  apis: ["./src/routes/*.js"],
}


const swaggerSpec = swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', './views')

// Middleware
app.use(express.json());
app.use(cookieParser());


// Connect to Database
connectDB();


// Route Middlewares
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/task", taskRoutes);
app.get('/', (req, res) => {
  res.send("Welcome to the Task Management System Apis.");
});
// Global Error Handler
app.use(error);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
