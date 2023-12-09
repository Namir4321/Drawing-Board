import "./App.css";
import { v4 as uuidv4 } from "uuid";
import io from "socket.io-client";
import { Routes, Route, Redirect, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Roomcanvas } from "./Pages/Roomcanvas";
import { Join } from "./Forms/JoinRoomForm/Join";
const server = "http://localhost:8080";
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
    console.log("useeffect is running");
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        setUsers(data.users);
      } else {
        console.log("something went wrong");
      }
    });

    socket.on("allUsers", (data) => {
      setUsers(data);
    });
    socket.on("userJoinedMessageBroadcaster", (data) => {
      toast.info(`${data} joined the room`);
    });
    socket.on("userLeftMessageBroadcasted", (data) => {
      toast.info(`${data} left the room`);
    });
  }, [user, setUsers]);

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        
        <Route
          path="/:roomId"
          element={<Roomcanvas user={user} socket={socket} users={users} />}
        />
        <Route
          path="/"
          element={<Join uuid={uuid} socket={socket} setUser={setUser} />}
        />
      </Routes>
    </div>
  );
};
export default App;
