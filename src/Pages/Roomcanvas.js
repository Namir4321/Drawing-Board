import React, { useState } from "react";
import "./Room.css";
import {
  Redo,
  Undo,
  ModeEditOutline,
  ChangeHistory,
  PanoramaFishEye,
  HorizontalRule,
  RectangleOutlined,
  FormatColorFill,
  People,
  InsertComment,
} from "@mui/icons-material";
import eraser from "../icons/eraser.svg";
import circle from "../icons/circle.svg";
import triangle from "../icons/triangle.svg";
import rectangle from "../icons/rectangle.svg";
import line from "../icons/line.svg";
import pencil from "../icons/pencil.svg";
import crisscross from "../icons/criss-cross-fill.svg";
import linefill from "../icons/line-fill.svg";
import solidfill from "../icons/solid-fill.svg";

import { Canvas } from "../Components/Canvas/Canvas";
import { useRef } from "react";
import { Chatbar } from "../Components/ChatBar/Chatbar";
import text from "../icons/text.svg";
import {useLocation} from "react-router-dom";

export const Roomcanvas = ({ user, socket, users }) => {
const [content, setContent] = useState("");

  const [colorOpen, setcolorOpen] = useState(false);
  const [linesWidthon, setLineWidthon] = useState(false);
  const [eraserWidthon, setEraserWidthon] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(2);
  const [color, setColor] = useState("black");
  const [backcolor, setBackColor] = useState("black");
  const [activeback,setActiveBack]=useState("")
const [fillactive,setFillActive]=useState("")
  const [activecolor, setActiveColor] = useState("");

 const [openedUserTab, setOpenedUserTag] = useState(false);
 const [openedChatTab, setOpenedChatTag] = useState(false);
 
  const [back, setback] = useState("pencil");
  const [tool, setTool] = useState("pencil");
  const [isactive, setIsactive] = useState("");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
const location=useLocation();
const userId=location.pathname.split("/")[1]
console.log(userId)
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillReact = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setElements([]);
  };
   const handleCopyClick = () => {
     navigator.clipboard
       .writeText(userId)
       .then(() => {
         console.log("RoomId copied to clipboard:", userId);
       })
       .catch((err) => {
         console.error("Unable to copy RoomId to clipboard", err);
       });
   };
  const undo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length - 1)
    );
  };
  const redo = () => {
    if (elements.length > 1) {
      setElements((prevElements) => [
        ...prevElements,
        history[history.length - 1],
      ]);
      setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
    }
  };
  console.log(activeback)
  return (
    <div className="container-fluid">
      <div className="row  undorow">
        <div className="col-4  d-flex ">
          <div className="contianer-fluid justify-space-between undoredo">
            <button
              className="btn btn-secoundry mx-2 my-1"
              disabled={history.length === 0}
              onClick={() => redo()}
            >
              <Redo />
            </button>
            <button
              className="btn btn-secoundry mx-2 my-1"
              disabled={elements.length === 0}
              onClick={() => undo()}
            >
              <Undo />
            </button>
          </div>
          <button
            className="btn btn-secoundry mx-2 my-1"
            onClick={handleClearCanvas}
          >
            Clear
          </button>
        </div>
        <div className="col-5"></div>
        <div className="col-3 ">
          <div className="contianer-fluid justify-space-between text-end ">
            <People
              className="justify-space-between mx-3 my-3"
              onClick={() => setOpenedUserTag(true)}
              style={{ cursor: "pointer" }}
            />
            {openedUserTab && (
              <div
                className="position-fixed  top-0  h-100 text-center bg-dark"
                style={{ width: "250px", right: "0%" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenedUserTag(false)}
                  className="btn btn-light btn-block w-75 mt-5"
                >
                  Close
                </button>
                <div className="w-100 mt-1 pt-2">
                  <h4 style={{ color: "white" }}>RoomId</h4>
                  <button
                    className=" bg-dark p-1 text-center w-100"
                    onClick={handleCopyClick}
                    style={{ color: "white" }}
                  >
                    <br /> {userId}
                  </button>
                  <h2 style={{ color: "white" }}>In Meeting</h2>

                  {users.map((userlist, index) => (
                    <p
                      key={index * 999}
                      className=" text-center my-2 w-100"
                      style={{ color: "white" }}
                    >
                      {userlist.name}
                      {user && user.userId === userlist.userId && "(You)"}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <InsertComment
              className="justify-space-between mx-5 my-3"
              onClick={() => setOpenedChatTag(true)}
              style={{ cursor: "pointer" }}
            />
            {openedChatTab && (
              <Chatbar setOpenedChatTag={setOpenedChatTag} socket={socket} />
            )}
          </div>
        </div>
      </div>

      {user?.presenter && (
        <>
          <div className="container-fluid " style={{ zIndex: 2 }}>
            <ul
              class="nav  px-4 my-2 d-flex justify-content-between justify-content-center top-5 start-50 translate-middle-x position-absolute mx-auto   w-50 floating"
              style={{ zIndex: 2 }}
            >
              <li class="nav-item  ">
                {" "}
                <HorizontalRule
                  src={line}
                  alt="line"
                  className="img-fluid rounded-circle"
                  style={{
                    marginTop: "-25px",
                    opacity: "0.7",
                    marginLeft: "2px",
                    marginBottom: "-25px",
                    opacity: back === "line" ? "2" : "0.5",
                    background: back === "line" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("line");
                    setTool("line");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  src={pencil}
                  className="rounded-circle "
                  style={{
                    opacity: "0.7",
                    opacity: back === "pencil" ? "2" : "0.5",
                    background: back === "pencil" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("pencil");
                    setLineWidth(e.target.value);
                    setLineWidthon((ColorOpen) => !ColorOpen);
                    setTool("pencil");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  className="img-fluid w-100 rounded-circle"
                  src={eraser}
                  alt="eraser"
                  style={{
                    opacity: back === "eraser" ? "2" : "0.5",
                    background: back === "eraser" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("eraser");
                    setTool("eraser");
                    setEraserWidth(e.target.value);
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <PanoramaFishEye
                  className="rounded-circle img-fluid"
                  src={circle}
                  alt="circle"
                  style={{
                    opacity: back === "circle" ? "2" : "0.5",
                    background: back === "circle" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("circle");
                    setTool("circle");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <ChangeHistory
                  src={triangle}
                  alt="triangle-horizontal"
                  className="img-fluid  rounded-circle"
                  style={{
                    background:
                      back === "triangle-vertical" ? "#E0dfff" : "#ffff",

                    opacity: back === "triangle-vertical" ? "2" : "0.5",
                  }}
                  onClick={(e) => {
                    setback("triangle-vertical");
                    setTool("triangle-vertical");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li className="nav-item">
                {" "}
                <ChangeHistory
                  src={triangle}
                  alt="eraser"
                  className="img-fluid  rounded-circle"
                  style={{
                    transform: "rotate(90deg)",
                    marginLeft: "2px",
                    background:
                      back === "triangle-horizontal" ? "#E0dfff" : "#ffff",
                    opacity: back === "triangle-horizontal" ? "2" : "0.5",
                  }}
                  onClick={(e) => {
                    setback("triangle-horizontal");
                    setTool("triangle-horizontal");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li className="nav-item ">
                <FormatColorFill
                  // src={text}
                  alt="eraser"
                  className="img-fluid  rounded-circle"
                  style={{
                    height: "20px",
                    width: "20px",
                    opacity: "0.7",
                    opacity: back === "text" ? "2" : "0.5",
                    background: back === "text" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("text");
                    setTool("text");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
              <li className="nav-item ">
                <img
                  src={rectangle}
                  alt="rectangle"
                  className="img-fluid  rounded-circle"
                  style={{
                    opacity: back === "rectangle" ? "2" : "0.5",
                    background: back === "rectangle" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={(e) => {
                    setback("rectangle");
                    setTool("rectangle");
                    setEraserWidthon((ColorOpen) => !ColorOpen);
                  }}
                />
              </li>
            </ul>
          </div>
        </>
      )}
      {eraserWidthon && (
        <div className="container color-box position-absolute  ">
          <div className="container-fluid">
            <h6>Stroke</h6>
            <div className="container-fluid d-flex flex-coloumn color-grid">
              <div
                className="container-fluid mx-1 rounded  color-cont bg-dark"
                style={{
                  border:
                    isactive === "black"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setIsactive("black");
                  setColor("black");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-danger"
                style={{
                  border:
                    isactive === "red"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setIsactive("red");
                  setColor("red");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-success"
                style={{
                  border:
                    isactive === "green"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setIsactive("green");
                  setColor("green");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-primary"
                style={{
                  border:
                    isactive === "blue"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setIsactive("blue");
                  setColor("blue");
                }}
              ></div>
              <div className=" g-0 container-fluid mx-3 rounded  color-contone ">
                <input
                  className=" input-color "
                  type="color"
                  onChange={(e) => {
                    setColor(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="container-fluid my-3">
            <h6>Background</h6>
            <div className="container-fluid d-flex flex-coloumn color-grid">
              <div
                className="container-fluid mx-1 rounded  color-cont bg-dark"
                style={{
                  border:
                    activecolor === "black"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setActiveColor("black");
                  setBackColor("black");
                  setcolorOpen((ColorOpen) => !ColorOpen);
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-danger"
                style={{
                  border:
                    activecolor === "red"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setActiveColor("red");
                  setBackColor("red");
                  setcolorOpen((ColorOpen) => !ColorOpen);
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-success"
                style={{
                  border:
                    activecolor === "green"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setActiveColor("green");
                  setBackColor("green");
                  setcolorOpen((ColorOpen) => !ColorOpen);
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-primary"
                style={{
                  border:
                    activecolor === "blue"
                      ? "3px solid black"
                      : "3px solid #777c81",
                }}
                onClick={(e) => {
                  setActiveColor("blue");
                  setBackColor("blue");
                  setcolorOpen((ColorOpen) => !ColorOpen);
                }}
              ></div>
              <div className=" g-0 container-fluid mx-3 rounded  color-contone ">
                <input
                  className=" input-color "
                  type="color"
                  onChange={(e) => {
                    setBackColor(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="container-fluid  ">
            <h6>Fill</h6>
            <div className="container-fluid g-1  d-flex flex-coloumn ">
              <div className="container-fluid  rounded ">
                <img
                  src={crisscross}
                  alt=""
                  className="fillimg rounded "
                  style={{
                    backgroundColor:
                      activeback === "cross-hatch" ? "#E0dfff" : " #f1f0ff",
                  }}
                  onClick={() => {
                    setActiveBack("cross-hatch");
                    setFillActive("cross-hatch");
                  }}
                />
              </div>
              <div className="container-fluid mx-1 rounded ">
                <img
                  src={linefill}
                  alt=""
                  className="fillimg rounded "
                  style={{
                    backgroundColor:
                      activeback === "line" ? "#E0dfff" : " #f1f0ff",
                  }}
                  onClick={() => {
                    setActiveBack("line");
                    setFillActive("line");
                  }}
                />
              </div>
              <div className="container-fluid mx-1 rounded  ">
                <img
                  src={solidfill}
                  alt=""
                  style={{
                    backgroundColor:
                      activeback === "solid" ? "#E0dfff" : " #f1f0ff",
                  }}
                  className="fillimg rounded "
                  onClick={() => {
                    setActiveBack("solid");
                    setFillActive("solid");
                  }}
                />
              </div>
            </div>
          </div>
          {tool === "pencil" && (
            <div
              className="container-fluid my-4 mx-0"
              style={{ width: "180px" }}
            >
              <h6>Line Width</h6>
              <input
                type="range"
                class="form-range"
                id="customRange1"
                min={1}
                max={40}
                defaultValue={5}
                onChange={(e) => {
                  setLineWidth(e.target.value);
                  setTool("pencil");
                }}
              />
            </div>
          )}
          {tool === "eraser" && (
            <div
              className="container-fluid my-4 mx-0"
              style={{ width: "180px" }}
            >
              <h6>Line Width</h6>
              <input
                type="range"
                class="form-range"
                id="customRange1"
                min={1}
                max={40}
                defaultValue={5}
                onChange={(e) => {
                  setEraserWidth(e.target.value || lineWidth);
                  setTool("eraser");
                }}
              />
            </div>
          )}
        </div>
      )}
      <div className="container-fluid  ">
        <div className="" style={{ zIndex: 1 }}>
          <Canvas
            style={{ zIndex: 2 }}
            className="g-0 candiv"
            canvasRef={canvasRef}
            ctxRef={ctxRef}
            elements={elements}
            setElements={setElements}
            tool={tool}
            color={color}
            lineWidth={lineWidth}
            eraserWidth={eraserWidth}
            user={user}
            socket={socket}
            fillactive={fillactive}
            backcolor={backcolor}
          />
        </div>
      </div>
    </div>
  );
};
