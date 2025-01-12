import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import path from "path"
import express from "express"
import userRoute from "./src/routes/userRoute"
import adminRoute from "./src/routes/adminRoute"
import doctorRoute from "./src/routes/doctorRoute"
import { createServer } from 'http';
import ConnectDB from './src/config/db';


dotenv.config()
const app = express();
const server = createServer(app);
ConnectDB()



app.use(cookieParser());
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));



app.use('/user', userRoute);
app.use('/admin',adminRoute)
app.use('/doctor',doctorRoute)

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});