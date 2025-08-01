import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import DB and socket setup
import ConnectDB from "./src/config/db";
import { app, server } from "./src/socket/socket";

// Route imports
import userRoute from "./src/routes/userRoute";
import adminRoute from "./src/routes/adminRoute";
import doctorRoute from "./src/routes/doctorRoute";
import messageRoute from "./src/routes/messageRoute";

// Connect to Database
ConnectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Route setup
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/doctor', doctorRoute);
app.use('/messages', messageRoute);

// Server listener
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
