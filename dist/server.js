"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const socket_1 = require("./socket/socket");
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const doctorRoute_1 = __importDefault(require("./routes/doctorRoute"));
const messageRoute_1 = __importDefault(require("./routes/messageRoute"));
const morgan_1 = __importDefault(require("morgan"));
(0, db_1.default)();
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};
socket_1.app.use((0, cors_1.default)(corsOptions));
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use(express_1.default.json());
socket_1.app.use(express_1.default.urlencoded({ extended: true }));
socket_1.app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
const logDirectory = path_1.default.join(__dirname, "src", "logs");
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory, { recursive: true });
}
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logDirectory, "access.log"), { flags: "a" });
socket_1.app.use((0, morgan_1.default)("dev"));
socket_1.app.use((0, morgan_1.default)("combined", { stream: accessLogStream }));
socket_1.app.use('/api/user', userRoute_1.default);
socket_1.app.use('/api/admin', adminRoute_1.default);
socket_1.app.use('/api/doctor', doctorRoute_1.default);
socket_1.app.use('/api/messages', messageRoute_1.default);
const PORT = process.env.PORT || 3000;
socket_1.server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
