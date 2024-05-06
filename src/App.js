import "./App.css";
import { v4 as uuidv4 } from "uuid";
import io from "socket.io-client";
import { Routes, Route, Redirect, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Canvas } from "./Components/Canvas/Canvas";
import { Join } from "./Forms/JoinRoomForm/Join";
import env from "../src/.env";
const server = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};
const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    console.log("useEffect is running");

    const handleUserJoined = data => {
      if (data.success) {
        setUsers(data.users);
      } else {
        console.log("something went wrong");
      }
    };

    const handleAllUsers = data => {
      setUsers(data);
    };

    const handleUserJoinedMessageBroadcast = data => {
      toast.info(`${data} joined the room`);
    };

    const handleUserLeftMessageBroadcasted = data => {
      toast.info(`${data} left the room`);
    };

    socket.on("userIsJoined", handleUserJoined);
    socket.on("allUsers", handleAllUsers);
    socket.on("userJoinedMessageBroadcaster", handleUserJoinedMessageBroadcast);
    socket.on("userLeftMessageBroadcasted", handleUserLeftMessageBroadcasted);
    return () => {
      socket.off("userIsJoined", handleUserJoined);
      socket.off("allUsers", handleAllUsers);
      socket.off("userJoinedMessageBroadcaster", handleUserJoinedMessageBroadcast);
      socket.off("userLeftMessageBroadcasted", handleUserLeftMessageBroadcasted);
    };
  }, []); 

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };

  return (
    <div className="App">
      <ToastContainer className="toastcont" style={{ zIndex: 9999 }} />
      <Routes>
        <Route path="/:roomId" element={<Canvas user={user} socket={socket} users={users} />} />
        <Route path="/" element={<Join uuid={uuid} socket={socket} setUser={setUser} />} />
      </Routes>
    </div>
  );
};
export default App;
