require("dotenv").config();
const express=require("express");
const app=express();
const cors = require("cors");
const server=require("http").createServer(app);
const {Server}=require("socket.io");
const { addUser, getUser,removeUser } = require("./middleware/middleware");
const io=new Server(server);
let roomIdGlobal,imgUrlGlobal;
app.use(
  cors({
    origin: process.env.BASE_URL, 
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
console.log(process.env.BASE_URL);
io.on("connection",(socket)=>{
   socket.on("userJoined", (data) => {
     const { name, userId, roomId, host, presenter } = data;
     roomIdGlobal = roomId;
     const users = addUser({
       name,
       userId,
       roomId,
       host,
       presenter,
       socketId: socket.id,
     });
     socket.join(roomId);
     socket.emit("userIsJoined", { success: true, users });

     // Broadcast to other users in the room
     socket.to(roomId).emit("userJoinedMessageBroadcaster", name);
     socket.to(roomId).emit("allUsers", users);
     socket.to(roomId).emit("whiteBoardDataResponse", { imgUrl: imgUrlGlobal });
   });
socket.on("whiteboardData",(data)=>{
imgUrlGlobal=data;
socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse",{
    imgUrl:data,  
})
})
socket.on("message", (data) => {
  const { message } = data;
  console.log(message);
  const user = getUser(socket.id);
  if (user) {
    // Broadcast to other users in the room
    socket
      .to(roomIdGlobal)
      .emit("messageResponse", { message, name: user.name });
  }
});
socket.on("disconnect", () => {
  const user = getUser(socket.id);
  if (user) {
    removeUser(socket.id);
    socket.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user.name);
  }
});
    
})
const port =process.env.PORT  ;

server.listen(port,()=>
console.log(`server is running on ${port}`))
