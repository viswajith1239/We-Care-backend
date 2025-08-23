import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";


dotenv.config();


import ConnectDB from "./config/db";
import { app, server } from "./socket/socket";


import userRoute from "./routes/userRoute";
import adminRoute from "./routes/adminRoute";
import doctorRoute from "./routes/doctorRoute";
import messageRoute from "./routes/messageRoute";
import morgan from "morgan";


ConnectDB();


const corsOptions = {
  origin: ["https://www.viswajith.site"], // frontend domain
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

const logDirectory = path.join(__dirname, "src", "logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" } 
);


app.use(morgan("dev"));

app.use(morgan("combined", { stream: accessLogStream }));

app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/messages', messageRoute);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
