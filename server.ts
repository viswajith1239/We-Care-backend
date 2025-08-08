import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";


dotenv.config();


import ConnectDB from "./src/config/db";
import { app, server } from "./src/socket/socket";


import userRoute from "./src/routes/userRoute";
import adminRoute from "./src/routes/adminRoute";
import doctorRoute from "./src/routes/doctorRoute";
import messageRoute from "./src/routes/messageRoute";
import morgan from "morgan";


ConnectDB();


const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan('dev'));


app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/messages', messageRoute);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
