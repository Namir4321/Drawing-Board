import React from "react";
import { useState } from "react";
import "./join.css";
import { useNavigate } from "react-router-dom";
import { KeyboardAltOutlined, VideoCall } from "@mui/icons-material";
export const Join = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const date = new Date();
  const handleSubmit = (e) => {
    e.preventDefault();
    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: false,
      presenter: true,
    };
    setRoomCode(roomId)
    setUser(roomData);
    socket.emit("userJoined", roomData);
    navigate(`/${roomId}`);
  };
  const handleJoinRoom = (e) => {
    e.preventDefault();
    const roomData = {
      name,
      roomId: roomCode,
      userId: uuid(),
      host: true,
      presenter: false,
    };
    setUser(roomData);
    navigate(`/${roomCode}`);
    socket.emit("userJoined", roomData);
  };
  return (
    <div className="container-fluid g-0 ">
      <nav className="navbar navbar-light bg-light p-2">
        <div className="container-fluid">
          <a className="navbar-brand"></a>
          <div className="d-flex px-3 py-2">
            <h6>{`${date.getHours()}:${date.getMinutes()}  ${date.toDateString()}`}</h6>
          </div>
        </div>
      </nav>
      <div className="container-fluid g-0 d-flex flex-column flex-md-row">
        <div className="container-fluid g-0">
          <div className="col-12 p-5 ">
            {" "}
            <div className="container heading mt-5 px-4 aboutcol ">
              <h1 className="heading mt-5 ">
                {" "}
                Premium Class Meetings,
                <br /> Now Free for everyone.
              </h1>
            </div>
            <div className="container span ">
              <h6 className="g-0 ">
                We re-engineered the service that we built for secure <br />{" "}
                business meetings,Google Meet, to make it free and <br />{" "}
                available for all.{" "}
              </h6>
            </div>
          </div>
          <div className="col-12 ">
            <div className="container-fluid px-5  text-start">
              <div className="  d-flex flex-row flex-grow-1">
                <input
                  className=" fs-4 py-2 my-2 rounded "
                  placeholder="Whats your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ maxWidth: "850px", paddingLeft: "35px" }}
                />
                <KeyboardAltOutlined className="position-absolute my-4 mx-2" />
              </div>
            </div>
          </div>
          <div className="col-12 ">
            <div className="container-fluid  text-start btnmain dropdown">
              <button
                className="px-4  bg-primary   meetbtn"
                onClick={handleSubmit}
                disabled={!name}
              >
                <VideoCall className="mx-1" />
                New meeting
              </button>
              <div className="d-flex align-items-center">
                <input
                  className="fs-4 py-2 my-2 rounded"
                  placeholder="Rooms Id"
                  style={{ maxWidth: "850px", paddingLeft: "35px" }}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <KeyboardAltOutlined className="position-absolute my-4 mx-2" />
                <button
                  disabled={!name}
                  className="mx-1 px-2 fs-5 btn btn-transparent btnjoin"
                  onClick={handleJoinRoom}
                  style={{ height: "100%" }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid  mt-5 p-5">
          <div className="circle carsouel mb-3 ">
            {/* carsouel */}
            <div
              id="carouselExampleControls"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner transition text-center">
                <div className="carousel-item active mt-2">
                  <div className="d-flex justify-content-center">
                    <img
                      src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"
                      className="d-block img-fluid"
                      alt="..."
                    />
                  </div>
                  <h6 className="carhead m-1">Your meeting is safe</h6>
                  <p>
                    No one can join a meeting unless invited or admitted <br />{" "}
                    by the host
                  </p>
                </div>
                <div className="carousel-item">
                  <div className="d-flex justify-content-center">
                    <img
                      src="https://www.gstatic.com/meet/user_edu_scheduling_light_b352efa017e4f8f1ffda43e847820322.svg"
                      className="d-block img-fluid"
                      alt="..."
                    />
                  </div>
                  <h6 className="carhead m-1">Plan ahead</h6>
                  <p>
                    Click <strong>New Meeting </strong> to schedule meetings in
                    Google <br /> Calendar and send invitations to participants
                  </p>
                </div>
                <div className="carousel-item">
                  <div className="d-flex justify-content-center">
                    <img
                      src="https://www.gstatic.com/meet/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg"
                      className="d-block img-fluid"
                      alt="..."
                    />
                  </div>
                  <h6 className="carhead m-1">Get a link that you can share</h6>
                  <p>
                    click <strong> New Meeting </strong> to get a link that you
                    can <br /> send to people that you want to meet with
                  </p>
                </div>
              </div>
              <button
                className="carousel-control-prev p-5"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next p-5"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Next</span>
              </button>
            </div>

            {/* carsouel */}
          </div>
        </div>
      </div>
    </div>
  );
};
