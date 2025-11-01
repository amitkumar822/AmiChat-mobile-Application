import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connectDB from "./src/config/db";
import authRoutes from "./src/routes/auth.routes";
import { initializeSocket } from "./src/socket/socket";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Chat App API" });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// initialize socket
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
