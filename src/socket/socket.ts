


// import { Server as SocketServer } from "socket.io";
// import { Server as HttpServer } from "http";

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

import {Server} from "socket.io"
import http from "http"
import express from "express"
import { Socket } from "dgram"
import dotenv from 'dotenv'
dotenv.config()

const app=express()
const server=http.createServer(app)
const io= new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    credentials:true
  }
})
const userSocketMap: Record<string, string> = {}; 
io.on("connection",(socket)=>{
  console.log("new client connected",socket.id);
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected with ID: ${userId} and socket ID: ${socket.id}`);
  }


  socket.on("disconnect",()=>{
    console.log("client disconnected",socket.id);
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`User with ID: ${userId} disconnected and removed from socket map`);
    }
    
  })

  socket.on('sendMessage', (data) => {
    if (userId) {
      io.emit('messageUpdate',data) 
    } else {
      console.error("receiverId is missing in sendMessage data");
    }
  });
  
})
export{app,io,server}
