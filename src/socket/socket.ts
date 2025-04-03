


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
export const getReceiverSocketId=(receiverId:string)=>{
   
  return userSocketMap[receiverId]
}

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



  socket.on("outgoing-video-call", (data) => {
    const userSocketId = getReceiverSocketId(data.to);
    
    if (userSocketId) {
      io.to(userSocketId).emit('incoming-video-call', {
        _id: data.to,
        from: data.from,
        callType: data.callType,
        doctorName: data.doctorName,
        doctorImage: data.doctorImage,
        roomId: data.roomId,
      });
    } else {
      console.log(`Receiver not found for user ID: ${data.to}`);
    }
  });

  socket.on("accept-incoming-call", async (data) => {
  
    try {
      const friendSocketId = await getReceiverSocketId(data.to);
      if (friendSocketId) {
        const startedAt = new Date();
        const videoCall = {
          doctorId: data.from,
          userId: data.to,
          roomId: data.roomId,
          duration: 0, 
          startedAt,
          endedAt: null, 
          createdAt: new Date(),
          updatedAt: new Date(),
        };
       
        
        socket.to(friendSocketId).emit("accepted-call", { ...data, startedAt });
      } else {
        console.error(`No socket ID found for the receiver with ID: ${data.to}`);
      }
    } catch (error: any) {
      console.error("Error in accept-incoming-call handler:", error.message);
    }
  });
  
  socket.on('doctor-call-accept',async (data) => {
    const doctorSocket = await getReceiverSocketId(data.doctorId)
    
    if(doctorSocket) {

      socket.to(doctorSocket).emit('doctor-accept', data)
    }
  })

  socket.on('reject-call', (data) => {
    const friendSocketId = getReceiverSocketId(data.to);
    if (friendSocketId) {
      
      socket.to(friendSocketId).emit('call-rejected');
    } else {
      console.error(`No socket ID found for the receiver with ID: ${data.to}`);
    }
  });

  socket.on("leave-room", (data) => {
    const friendSocketId = getReceiverSocketId(data.to);
    console.log('friendSocketId',friendSocketId, 'data', data.to);
    if (friendSocketId) {
      socket.to(friendSocketId).emit("user-left",data.to);
    }
  });
  
})
export{app,io,server}
