import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import "./chabar.css";
export const Chatbar = ({ socket, openedChatTab }) => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("messageResponse", data => {
      setChat(prevChats => [...prevChats, data]);
    });
  }, [socket]);

  const handleSubmit = e => {
    e.preventDefault();
    if (message.trim() !== "") {
      setChat(prevChats => [...prevChats, { message, name: "You" }]);
      socket.emit("message", { message });
      setMessage("");
    }
  };
  return (
    <>
      <div
        className={`chatbox position-fixed bg-secondary round p-2   ${
          openedChatTab ? " close" : " open"
        }  text-center`}
        style={{
          width: "280px",
          right: "0%",
          zIndex: "2",
          top: "10%",
          height: "85%",
          borderTopLeftRadius: "10px",
          borderBottomLeftRadius: "10px",
        }}
      >
        {/* <button
          type="button"
          onClick={() => setOpenedChatTag(false)}
          className="btn btn-light btn-block w-75 mt-5 mb-4"
        >
          Close
        </button> */}

        <div
          className="w-100 my-3 mt-3 mx-1 border border-1 border-white rounded-3"
          style={{ height: "85%" }}
        >
          {chat.map((msg, index) => (
            <p key={index * 999} className="my-2 text-center w-100" style={{ color: "white" }}>
              {console.log(msg)}
              {msg.name}:{msg.message}
            </p>
          ))}
        </div>
        <form onSubmit={handleSubmit} className=" d-flex mx-2  w-100   mt-2   rounded-3">
          <input
            className="w-100 mx-1 h-100 border-0 rounded-0 py-2 px-4"
            type="text"
            placeholder="type message"
            style={{ width: "90%" }}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button type="submit" className="btn  mx-2 btn-primary">
            Send
          </button>
        </form>
      </div>
    </>
  );
};
