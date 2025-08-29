"use strict";
// import { Server as SocketServer } from "socket.io";
// import { Server as HttpServer } from "http";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = exports.getReceiverSocketId = void 0;
// let io: SocketServer;
// const configSocketIO = (server: HttpServer) => {
//       io = new SocketServer(server, {
//         cors: {
//            origin: "http://localhost:5173",
//            credentials:true
//       },
// });
// const userSocketMap: Record<string, string> = {}; 
//  const getReceiverSocketId=(receiverId:string)=>{
//     return userSocketMap[receiverId]
// }
// io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId as string; 
//     console.log("$$$$$$$$$$$$$",userId);
// if (userId) {
//     userSocketMap[userId] = socket.id; 
//     console.log(`User ${userId} connected with socket ${socket.id}`);
// }
// socket.on("disconnect", () => {
//     console.log(`User ${userId} disconnected`);
//     if (userId && userSocketMap[userId]) {
//       delete userSocketMap[userId];
//       console.log(`User with ID: ${userId} disconnected and removed from socket map`);
//     }});
// socket.on('sendMessage', (data) => {
//     if (userId) {
//       io.emit('messageUpdate',data) 
//     } else {
//       console.error("receiverId is missing in sendMessage data");
//     }
//   });
// })
// }
// export { configSocketIO, io}
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        // origin: "http://localhost:5173",
        origin: [
            "https://www.viswajith.site",
            "https://viswajith.site",
            "http://localhost:5173"
        ],
        credentials: true,
    },
});
exports.io = io;
const userSocketMap = {};
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId] || [];
};
exports.getReceiverSocketId = getReceiverSocketId;
io.on("connection", (socket) => {
    console.log("new client connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
        console.log(`User connected: ${userId}, Socket: ${socket.id}`);
        socket.userId = userId;
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);
        console.log("Updated userSocketMap:", userSocketMap);
        // Notify all clients of online users
        io.emit("getonline", Object.keys(userSocketMap));
    }
    socket.on("disconnect", () => {
        const disconnectedUserId = socket.userId;
        if (disconnectedUserId) {
            console.log(`User disconnected: ${disconnectedUserId}, Socket: ${socket.id}`);
            userSocketMap[disconnectedUserId] = userSocketMap[disconnectedUserId]?.filter((id) => id !== socket.id);
            if (userSocketMap[disconnectedUserId]?.length === 0) {
                delete userSocketMap[disconnectedUserId];
                io.emit("getonline", Object.keys(userSocketMap));
            }
            console.log(`Updated userSocketMap after disconnection:`, userSocketMap);
        }
    });
    socket.on("sendMessage", (data) => {
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("messageUpdate", data);
            });
            // Also emit to sender's sockets to confirm message delivery
            const senderSocketIds = (0, exports.getReceiverSocketId)(data.senderId);
            senderSocketIds.forEach((socketId) => {
                io.to(socketId).emit("messageUpdate", data);
            });
        }
        else {
            console.error("No active sockets for receiverId:", data.receiverId);
        }
    });
    socket.on("messageDeleted", (data) => {
        console.log(`Message deleted: ${data.messageId} by user: ${data.senderId}`);
        // Send to receiver
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("messageDeleted", { messageId: data.messageId });
            });
        }
        // Also send to sender's other sockets (if they have multiple tabs open)
        const senderSocketIds = (0, exports.getReceiverSocketId)(data.senderId);
        senderSocketIds.forEach((socketId) => {
            io.to(socketId).emit("messageDeleted", { messageId: data.messageId });
        });
    });
    // New messageRead event handler
    socket.on("markMessageRead", ({ messageId, senderId }) => {
        console.log(`Message read: ${messageId} by sender: ${senderId}`);
        const senderSocketIds = (0, exports.getReceiverSocketId)(senderId);
        if (senderSocketIds.length > 0) {
            senderSocketIds.forEach((socketId) => {
                io.to(socketId).emit("messageRead", { messageId });
            });
        }
        else {
            console.warn(`No active sockets for senderId: ${senderId}`);
        }
    });
    socket.on("outgoing-video-call", (data) => {
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.to);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("incoming-video-call", {
                    _id: data.to,
                    from: data.from,
                    callType: data.callType,
                    doctorName: data.doctorName,
                    doctorImage: data.doctorImage,
                    roomId: data.roomId,
                });
            });
        }
        else {
            console.log(`Receiver not found for user ID: ${data.to}`);
        }
    });
    socket.on("accept-incoming-call", async (data) => {
        try {
            const friendSocketIds = (0, exports.getReceiverSocketId)(data.to);
            if (friendSocketIds.length > 0) {
                friendSocketIds.forEach((socketId) => {
                    io.to(socketId).emit("accepted-call", { ...data, startedAt: new Date() });
                });
            }
            else {
                console.error(`No active socket found for user ID: ${data.to}`);
            }
        }
        catch (error) {
            console.error("Error in accept-incoming-call handler:", error.message);
        }
    });
    socket.on("doctor-call-accept", async (data) => {
        const doctorSocketIds = (0, exports.getReceiverSocketId)(data.doctorId);
        if (doctorSocketIds.length > 0) {
            doctorSocketIds.forEach((socketId) => {
                socket.to(socketId).emit("doctor-accept", data);
            });
        }
        else {
            console.warn(`Doctor with ID ${data.doctorId} is not connected.`);
        }
    });
    socket.on("reject-call", (data) => {
        const friendSocketIds = (0, exports.getReceiverSocketId)(data.to);
        if (friendSocketIds.length > 0) {
            friendSocketIds.forEach((socketId) => {
                socket.to(socketId).emit("call-rejected");
            });
        }
        else {
            console.error(`No socket ID found for the receiver with ID: ${data.to}`);
        }
    });
    socket.on("leave-room", (data) => {
        const friendSocketIds = (0, exports.getReceiverSocketId)(data.to);
        if (friendSocketIds.length > 0) {
            friendSocketIds.forEach((socketId) => {
                socket.to(socketId).emit("user-left", data.to);
            });
        }
    });
    socket.on("newBookingNotification", (data) => {
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("receiveNewBooking", data.content);
            });
        }
        else {
            console.warn("Receiver not connected:", data.receiverId);
        }
    });
    socket.on("cancelDoctorNotification", (data) => {
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("receiveCancelNotificationForDoctor", data.content);
            });
        }
        else {
            console.warn("No receiverSocketId found for receiverId:", data.receiverId);
        }
    });
    socket.on("cancelUserNotification", (data) => {
        const receiverSocketIds = (0, exports.getReceiverSocketId)(data.userId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("receiveCancelNotificationForUser", data.content);
            });
        }
        else {
            console.warn("No receiverSocketId found for receiverId:", data.userId);
        }
    });
});
