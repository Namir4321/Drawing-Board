import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import "./Canvas.css";
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
  TextFields,
  Circle,
  TextFormat,
  PersonAdd,
} from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import eraser from "../../icons/eraser.svg";
import move from "../../icons/move.svg";
import circle from "../../icons/circle.svg";
import triangle from "../../icons/triangle.svg";
import rectangle from "../../icons/rectangle.svg";
import line from "../../icons/line.svg";
import pencil from "../../icons/pencil.svg";
import crisscross from "../../icons/criss-cross-fill.svg";
import linefill from "../../icons/line-fill.svg";
import solidfill from "../../icons/solid-fill.svg";
import text from "../../icons/text.svg";
// import FontPicker from "react-font-picker";
import FontPicker from "font-picker-react";
import { useLocation } from "react-router-dom";
// import FontPicker from "fontsource";
import { Chatbar } from "../Chartbar/Chatbar";

const generator = rough.generator();
export const Canvas = ({ user, socket, users }) => {
  const [mousemoveCoord, setMouseMoveCoord] = useState({ clientX: 0, clientY: 0 });
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [img, setImg] = useState(null);
  const [isDrawing, setisDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState("pencil");
  const [moving, setMoving] = useState(false);
  const [selectelement, setSelectedElement] = useState(null);
  const [resizes, setResize] = useState(false);
  const [back, setback] = useState("pencil");
  const [iscolor, setIscolor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);
  const [isactive, setIsactive] = useState("");
  // const [color, setColor] = useState("black");
  const [eraserWidthon, setEraserWidthon] = useState(true);
  const [backcolor, setBackColor] = useState("black");
  const [activecolor, setActiveColor] = useState("");
  const [colorOpen, setcolorOpen] = useState(false);
  const [fillactive, setFillActive] = useState("");
  const [activeback, setActiveBack] = useState("");
  const [eraserWidth, setEraserWidth] = useState(2);
  const inputRef = useRef(null);
  const [selectedFont, setSelectedFont] = useState("Arimo");
  const [textsize, setsetTextSize] = useState(10);
  const [edit, setEdit] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [textWidth, setTextWidth] = useState("");
  const [history, setHistory] = useState([]);
  const [openedUserTab, setOpenedUserTag] = useState(false);
  const [openedChatTab, setOpenedChatTag] = useState(false);
  const [Coord, setCoord] = useState({ clientX: 0, clientY: 0 });
  const location = useLocation();

  const userId = location.pathname.split("/")[1];

  const handle = e => {
    inputRef.current.focus();
    if (edit && selectelement) {
      return;
    }
    if (edit) {
      setMouseMoveCoord({ clientX: 0, clientY: 0 });
      setTool("selection");
      setEdit(false);
      setMoving(true);
      setSelectedElement("");
    }
  };
  const handleWrite = e => {
    // const canvas = document.getElementById("canvas");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const input = inputRef.current.value;

      if (input && !edit) {
        const textMetrics = ctx.measureText(input);
        setTextWidth(textMetrics);
        setElements(prevElements => [
          ...prevElements,
          {
            type: "text",
            clientX: mousemoveCoord.clientX,
            clientY: mousemoveCoord.clientY,
            height: +textsize,
            width: +textMetrics.width,
            text: input,
            font: `${textsize}px ${selectedFont}`,
            stroke: iscolor,
            id: mousemoveCoord.clientX * mousemoveCoord.clientY + "text",
          },
        ]);
      } else if (input && edit) {
        const textMetrics = ctx.measureText(editedText);
        if (selectelement && selectelement.type === "text") {
          const updatedElements = elements.map(element =>
            element.id === selectelement.id
              ? {
                  ...element,
                  text: editedText,
                  height: +textsize,
                  width: +textMetrics.width,
                  font: `${textsize}px ${selectedFont}`,
                  stroke: iscolor,
                }
              : element
          );
          setElements(updatedElements);
          setTool("selection");
          setEdit(false);
          setMoving(true);
          //  selectelement(null)
        }
      }
    }
    inputRef.current.value = "";
    setEditedText("");
  };
  const handletext = e => {
    const { clientX, clientY } = e.nativeEvent;
    let closestDistance = Infinity;
    let closestRectangle = null;
    elements.forEach(element => {
      if (element.type === "text") {
        const centerX = element.clientX + element.width / 2;
        const centerY = element.clientY + element.height / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (distance < closestDistance && isPointInsideRectangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
        }
      }
    });
    if (closestRectangle) {
      setSelectedElement(closestRectangle);
    }
    if (selectelement && selectelement.closestRectangle.type === "text") {
      setTool("text");
      setEdit(true);
      setMoving(false);
      setMouseMoveCoord({
        clientX: selectelement.closestRectangle.clientX,
        clientY: selectelement.closestRectangle.clientY,
      });
    } else {
      return;
    }
  };
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      const lineHeight = 1.5;
      const padding = 10;
      const height = textsize * lineHeight + padding;
      textarea.style.height = `${height}px`;
      textarea.style.fontSize = `${textsize}px`;
      textarea.style.fontFamily = selectedFont;
      textarea.style.color = iscolor;
      if (edit) {
        setEditedText(
          editedText ? editedText : selectelement && selectelement.text ? selectelement.text : ""
        );
      }
    }
  });
  useEffect(() => {
    socket.on("whiteBoardDataResponse", data => {
      setImg(data.imgUrl);
    });
  }, [socket]);
  const Distance = (clientX, clientY) => {
    let closestDistance = Infinity;
    let closestRectangle = null;
    let closestSide = null;
    elements.forEach(element => {
      if (element.type === "rectangle") {
        const centerX = element.clientX + element.width / 2;
        const centerY = element.clientY + element.height / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (distance < closestDistance && isPointInsideRectangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
          closestSide = IsPointingToCoordinate(clientX, clientY, element);
        }
      } else if (element.type === "circle") {
        const centerX = element.clientX;
        const centerY = element.clientY;

        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (distance < closestDistance && isPointInsideCircle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
          closestSide = isPointOnBoundryCircle(clientX, clientY, element);
        }
      } else if (element.type === "triangle") {
        const [p1, p2, p3] = element.path;

        const centerX = (p1[0] + p2[0] + p3[0]) / 3;
        const centerY = (p1[1] + p2[1] + p3[1]) / 3;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (distance < closestDistance && isPointInsideTriangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
          closestSide = isPointOnVertexTriangle(clientX, clientY, element);
        }
      } else if (element.type === "line") {
        const centerX = (element.clientX + element.width) / 2;
        const centerY = (element.clientY + element.height) / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (distance < closestDistance && isPointInsideLine(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
          closestSide = IsPointingToLine(clientX, clientY, element);
        }
      } else if (element.type === "text") {
        const centerX = element.clientX + element.width / 2;
        const centerY = element.clientY + element.height / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (distance < closestDistance && isPointInsideRectangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
          closestSide = IsPointingToCoordinate(clientX, clientY, element);
        }
      }
    });

    // console.log(closestRectangle)
    if (closestRectangle) {
      setSelectedElement({ closestRectangle, closestSide });
    } else {
      setSelectedElement(null);
    }
  };
  const isPointInsideLine = (x, y, line) => {
    const tolerance = 2;
    const minX = Math.min(line.clientX, line.width);
    const maxX = Math.max(line.clientX, line.width);
    const minY = Math.min(line.clientY, line.height);
    const maxY = Math.max(line.clientY, line.height);

    return (
      x >= minX - tolerance &&
      x <= maxX + tolerance &&
      y >= minY - tolerance &&
      y <= maxY + tolerance
    );
  };
  const IsPointingToLine = (x, y, line) => {
    const tolerance = 3;
    const m = (line.height - line.clientY) / (line.width - line.clientX);
    const b = line.clientY - m * line.clientX;
    const distanceToLine = Math.abs((m * x - y + b) / Math.sqrt(m * m + 1));
    if (distanceToLine < 2) {
      const start = Math.sqrt(Math.pow(x - line.clientX, 2) + Math.pow(y - line.clientY, 2));
      const end = Math.sqrt(Math.pow(x - line.width, 2) + Math.pow(y - line.height, 2));

      if (start <= 5) {
        setResize(true);
        return "start";
      } else if (end <= 5) {
        setResize(true);
        return "end";
      }
      setMoving(true);
      setResize(false);
      return null;
    }
  };
  const IsPointingToCoordinate = (x, y, rectangle) => {
    if (
      x >= rectangle.clientX &&
      x <= rectangle.clientX + rectangle.width &&
      y >= rectangle.clientY &&
      y <= rectangle.clientY + rectangle.height
    ) {
      const top = Math.abs(rectangle.clientY - y);
      const bottom = Math.abs(rectangle.clientY + rectangle.height - y);
      const right = Math.abs(rectangle.clientX + rectangle.width - x);
      const left = Math.abs(rectangle.clientX - x);
      const MinDistance = Math.min(top, bottom, left, right);
      if (top <= 5) {
        setResize(true);
        return "top";
      } else if (bottom <= 3) {
        setResize(true);
        return "bottom";
      } else if (right <= 3) {
        setResize(true);

        return "right";
      } else if (left <= 3) {
        setResize(true);

        return "left";
      }
      setMoving(true);
      setResize(false);
      return null;
    }
  };
  const isPointOnBoundryCircle = (x, y, circle) => {
    if (
      x <= circle.clientX + circle.width &&
      x >= circle.clientX - circle.width &&
      y <= circle.clientY + circle.width &&
      x >= circle.clientX - circle.width
    ) {
      const top = Math.abs(circle.clientY - circle.width / 2 - y);
      const bottom = Math.abs(circle.clientY + circle.width / 2 - y);
      const right = Math.abs(circle.clientX + circle.width / 2 - x);
      const left = Math.abs(circle.clientX - circle.width / 2 - x);

      if (top <= 5) {
        setResize(true);
        return "top";
      } else if (bottom <= 5) {
        setResize(true);
        return "bottom";
      } else if (right <= 5) {
        setResize(true);
        return "right";
      } else if (left <= 5) {
        setResize(true);
        return "left";
      }
      setMoving(true);
      setResize(false);
      return null;
    }
  };
  const isPointOnVertexTriangle = (x, y, triangle) => {
    const [p1, p2, p3] = triangle.path;
    const distance = Math.abs(
      [p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1])] / 2
    );
    const sideone = Math.abs(p1[0] * (p2[1] - y) + p2[0] * (y - p1[1]) + x * (p1[1] - p2[1])) / 2;
    const sidetwo = Math.abs(p2[0] * (p3[1] - y) + p3[0] * (y - p2[1]) + x * (p2[1] - p3[1])) / 2;
    const sidethree = Math.abs(p3[0] * (p1[1] - y) + p1[0] * (y - p3[1]) + x * (p3[1] - p1[1])) / 2;

    if (distance === sideone + sidetwo + sidethree) {
      const top = Math.abs(Math.abs(p1[1] - y));
      const side = Math.abs(Math.abs(p2[1] - y && p2[0] - x));
      const bottom = Math.abs(Math.abs(p3[1] - y));
      const MinDistance = Math.min(top, side, bottom);
      // console.log(MinDistance)
      if (top <= 12) {
        setResize(true);
        return "top";
      } else if (side <= 15) {
        setResize(true);
        return "side";
      } else if (bottom <= 12) {
        setResize(true);
        return "bottom";
      }
    }
  };
  const isPointInsideRectangle = (x, y, rectangle) => {
    return (
      x >= rectangle.clientX &&
      x <= rectangle.clientX + rectangle.width &&
      y >= rectangle.clientY &&
      y <= rectangle.clientY + rectangle.height
    );
  };
  const isPointInsideCircle = (x, y, circle) => {
    const distance = Math.sqrt(Math.pow(x - circle.clientX, 2) + Math.pow(y - circle.clientY, 2));
    return distance <= circle.width / 2;
  };
  const isPointInsideTriangle = (x, y, triangle) => {
    const [p1, p2, p3] = triangle.path;

    const sideone = (p2[1] - p3[1]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[1] - p3[1]);
    const sidetwo = ((p2[1] - p3[1]) * (x - p3[0]) + (p3[0] - p2[0]) * (y - p3[1])) / sideone;
    const sidethree = ((p3[1] - p1[1]) * (x - p3[0]) + (p1[0] - p3[0]) * (y - p3[1])) / sideone;
    const check = 1 - sidetwo - sidethree;

    return sidetwo >= 0 && sidethree >= 0 && check >= 0;
  };

  const BackgroundColor = ({ clientX, clientY, backcolor, fillactive }) => {
    let closestDistance = Infinity;
    let closestRectangle = null;
    elements.forEach(element => {
      if (element.type === "rectangle") {
        const centerX = element.clientX + element.width / 2;
        const centerY = element.clientY + element.height / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (distance < closestDistance && isPointInsideRectangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
        }
      } else if (element.type === "circle") {
        const centerX = element.clientX;
        const centerY = element.clientY;

        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (distance < closestDistance && isPointInsideCircle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
        }
      } else if (element.type === "triangle") {
        const centerX = (element.path[0][0] + element.path[1][0] + element.path[2][0]) / 3;
        const centerY = (element.path[0][1] + element.path[1][1] + element.path[2][1]) / 3;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (distance < closestDistance && isPointInsideTriangle(clientX, clientY, element)) {
          closestDistance = distance;
          closestRectangle = element;
        }
      }
      if (closestRectangle) {
        setElements(prevElem =>
          prevElem.map(element =>
            element.id === closestRectangle.id
              ? {
                  ...element,
                  fill: backcolor,
                  fillStyle: fillactive,
                }
              : element
          )
        );
      }
    });
  };

  const moveshape = (clientX, clientY) => {
    if (selectelement) {
      const offsetX = clientX - mousemoveCoord.clientX;
      const offsetY = clientY - mousemoveCoord.clientY;

      if (selectelement.closestRectangle.type === "triangle") {
        setElements(prevElem =>
          prevElem.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  path: element.path.map(([x, y]) => [x + offsetX, y + offsetY]),
                }
              : element
          )
        );
      } else if (selectelement && selectelement.closestRectangle.type === "line") {
        const offsetX = clientX - mousemoveCoord.clientX;
        const offsetY = clientY - mousemoveCoord.clientY;

        setElements(prevElem =>
          prevElem.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  clientX: element.clientX + offsetX,
                  clientY: element.clientY + offsetY,
                  width: element.width + offsetX,
                  height: element.height + offsetY,
                }
              : element
          )
        );
      } else {
        setElements(prevElem =>
          prevElem.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  clientX: element.clientX + offsetX,
                  clientY: element.clientY + offsetY,
                }
              : element
          )
        );
      }
    }
  };

  const resize = (clientX, clientY) => {
    if (selectelement) {
      if (selectelement.closestRectangle.type === "rectangle") {
        if (selectelement.closestRectangle && selectelement.closestSide === "top") {
          const newHeight =
            selectelement.closestRectangle.height +
            (selectelement.closestRectangle.clientY - clientY);
          const minHeight = 10;
          const adjustedHeight = Math.max(minHeight, newHeight);
          const adjustedClientY =
            selectelement.closestRectangle.clientY -
            (adjustedHeight - selectelement.closestRectangle.height);
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  height: adjustedHeight,
                  clientY: adjustedClientY,
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "bottom") {
          const newHeight = clientY - selectelement.closestRectangle.clientY;
          const minHeight = 10;
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  height: Math.max(minHeight, newHeight),
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "right") {
          const newWidth = clientX - selectelement.closestRectangle.clientX;
          const minWidth = 10;
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: Math.max(minWidth, newWidth),
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "left") {
          const newWidth =
            selectelement.closestRectangle.width +
            (selectelement.closestRectangle.clientX - clientX);
          const minWidth = 10;
          const adjustedWidth = Math.max(minWidth, newWidth);
          const adjustedClientX =
            selectelement.closestRectangle.clientX -
            (adjustedWidth - selectelement.closestRectangle.width);
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: adjustedWidth,
                  clientX: adjustedClientX,
                }
              : element
          );
          setElements(updatedElements);
        }
      } else if (selectelement.closestRectangle.type === "circle") {
        const centerX = selectelement.closestRectangle.clientX;
        const centerY = selectelement.closestRectangle.clientY;

        if (
          selectelement.closestRectangle &&
          (selectelement.closestSide === "right" || selectelement.closestSide === "left")
        ) {
          const newWidth = Math.abs(clientX - centerX) * 2;
          const minWidth = 10;
          const adjustedWidth = Math.max(minWidth, newWidth);

          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: adjustedWidth,
                }
              : element
          );

          setElements(updatedElements);
        } else if (
          selectelement.closestRectangle &&
          (selectelement.closestSide === "top" || selectelement.closestSide === "bottom")
        ) {
          const newHeight = Math.abs(clientY - centerY) * 2;
          const minHeight = 10;
          const adjustedHeight = Math.max(minHeight, newHeight);

          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: adjustedHeight,
                }
              : element
          );

          setElements(updatedElements);
        }
      } else if (selectelement.closestRectangle.type === "triangle") {
        if (selectelement.closestRectangle && selectelement.closestSide === "top") {
          const newHeight =
            selectelement.closestRectangle.path[0][1] +
            (selectelement.closestRectangle.path[0][1] - clientY);
          const minHeight = 10;
          const adjustedHeight = Math.max(minHeight, newHeight);
          const adjustedClientY =
            selectelement.closestRectangle.path[0][1] -
            (adjustedHeight - selectelement.closestRectangle.path[0][1]);

          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  path: [
                    [element.path[0][0], adjustedClientY],
                    [element.path[1][0], element.path[1][1]],
                    element.path[2],
                  ],
                }
              : element
          );

          setElements(updatedElements);
          console.log(selectelement);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "bottom") {
          if (selectelement.closestSide === "bottom") {
            const newHeight =
              selectelement.closestRectangle.path[2][1] +
              (clientY - selectelement.closestRectangle.path[2][1]);
            const minHeight = 10;
            const adjustedHeight = Math.max(minHeight, newHeight);

            const updatedElements = elements.map(element =>
              element.id === selectelement.closestRectangle.id
                ? {
                    ...element,
                    path: [element.path[0], element.path[1], [element.path[2][0], adjustedHeight]],
                  }
                : element
            );

            setElements(updatedElements);
          }
        } else if (selectelement.closestRectangle && selectelement.closestSide === "side") {
          if (selectelement.closestSide === "side") {
            const newHeight =
              selectelement.closestRectangle.path[1][0] +
              (clientX - selectelement.closestRectangle.path[1][0]);
            const minHeight = 10;
            const adjustedHeight = Math.max(minHeight, newHeight);

            const updatedElements = elements.map(element =>
              element.id === selectelement.closestRectangle.id
                ? {
                    ...element,
                    path: [element.path[0], [adjustedHeight, element.path[1][1]], element.path[2]],
                  }
                : element
            );

            setElements(updatedElements);
          }
        }
      } else if (selectelement.closestRectangle.type === "line") {
        if (selectelement.closestRectangle && selectelement.closestSide === "start") {
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  clientX: clientX,
                  clientY: clientY,
                }
              : element
          );

          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "end") {
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: clientX,
                  height: clientY,
                }
              : element
          );

          setElements(updatedElements);
        }
      } else if (selectelement.closestRectangle.type === "text") {
        if (selectelement.closestRectangle && selectelement.closestSide === "top") {
          const newHeight =
            selectelement.closestRectangle.height +
            (selectelement.closestRectangle.clientY - clientY);
          const minHeight = 10;
          const adjustedHeight = Math.max(minHeight, newHeight);
          const adjustedClientY =
            selectelement.closestRectangle.clientY -
            (adjustedHeight - selectelement.closestRectangle.height);
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  height: adjustedHeight,
                  clientY: adjustedClientY,
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "bottom") {
          const newHeight = clientY - selectelement.closestRectangle.clientY;
          const minHeight = 10;
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  height: Math.max(minHeight, newHeight),
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "right") {
          const newWidth = clientX - selectelement.closestRectangle.clientX;
          const minWidth = 10;
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: Math.max(minWidth, newWidth),
                }
              : element
          );
          setElements(updatedElements);
        } else if (selectelement.closestRectangle && selectelement.closestSide === "left") {
          const newWidth =
            selectelement.closestRectangle.width +
            (selectelement.closestRectangle.clientX - clientX);
          const minWidth = 10;
          const adjustedWidth = Math.max(minWidth, newWidth);
          const adjustedClientX =
            selectelement.closestRectangle.clientX -
            (adjustedWidth - selectelement.closestRectangle.width);
          const updatedElements = elements.map(element =>
            element.id === selectelement.closestRectangle.id
              ? {
                  ...element,
                  width: adjustedWidth,
                  clientX: adjustedClientX,
                }
              : element
          );
          setElements(updatedElements);
        }
      }
    }
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
        ctx.lineCap = "round";

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const roughCanvas = rough.canvas(canvas);

        elements.forEach(element => {
          switch (element.type) {
            case "rectangle":
              roughCanvas.rectangle(
                element.clientX,
                element.clientY,
                element.width,
                element.height,
                {
                  stroke: element.stroke,
                  strokeWidth: 2,
                  fill: element.fill,
                  fillStyle: element.fillStyle,
                  roughness: 0,
                }
              );
              break;
            case "circle":
              roughCanvas.circle(element.clientX, element.clientY, element.width, {
                stroke: element.stroke,
                strokeWidth: 2,
                fill: element.fill,
                fillStyle: element.fillStyle,
                roughness: 0,
              });
              break;
            case "triangle":
              roughCanvas.polygon(element.path, {
                stroke: element.stroke,
                strokeWidth: 2,
                fill: element.fill,
                fillStyle: element.fillStyle,
                roughness: 0,
              });
              break;
            case "line":
              roughCanvas.line(element.clientX, element.clientY, element.width, element.height, {
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                roughness: 0,
              });
              break;
            case "pencil":
              roughCanvas.linearPath(element.path, {
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                roughness: 0,
                lineCap: "round",
              });
              break;
            case "eraser":
              roughCanvas.linearPath(element.path, {
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                roughness: 0,
                lineCap: "round",
              });
              break;
            case "text":
              if (edit && selectelement && selectelement.type === "text") {
                const updatedElements = selectelement.id;
                elements.forEach(element => {
                  if (element.id === updatedElements) {
                    return;
                  }

                  ctx.fillStyle = element.stroke;
                  ctx.font = element.font;
                  ctx.textBaseline = "top";
                  const textWidth = ctx.measureText(element.text).width;
                  const textHeight = parseInt(element.font, 10);

                  const rectCenterX = element.clientX + element.width / 2;
                  const rectCenterY = element.clientY + element.height / 2;

                  const textX = rectCenterX - textWidth / 2;
                  const textY = rectCenterY - textHeight / 2;

                  ctx.fillText(element.text, textX, textY);
                  ctx.strokeStyle = element.stroke;
                });
              } else {
                elements.forEach(element => {
                  ctx.fillStyle = element.stroke;
                  ctx.font = element.font;
                  ctx.textBaseline = "top";
                  const textWidth = ctx.measureText(element.text).width;
                  const textHeight = parseInt(element.font, 10);

                  const rectCenterX = element.clientX + element.width / 2;
                  const rectCenterY = element.clientY + element.height / 2;

                  const textX = rectCenterX - textWidth / 2;
                  const textY = rectCenterY - textHeight / 2;

                  ctx.fillText(element.text, textX, textY);
                  ctx.strokeStyle = element.stroke;
                  if (tool === "selection") {
                    ctx.strokeRect(element.clientX, element.clientY, element.width, element.height);
                  }
                });
              }

              break;
          }
          // const canvasImage = canvasRef.current.toDataURL();
          // socket.emit("whiteboardData", canvasImage);
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, [elements, edit, tool]);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;
      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("whiteboardData", canvasImage);
    }
  }, [Coord]);
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillReact = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setElements([]);
    setHistory([]);
  };
  const undo = () => {
    setHistory(prevHistory => [...prevHistory, elements[elements.length - 1]]);
    setElements(prevElements => prevElements.slice(0, prevElements.length - 1));
  };
  const redo = () => {
    if (elements.length > 1) {
      setElements(prevElements => [...prevElements, history[history.length - 1]]);
      setHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
    }
  };
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(userId)
      .then(() => {
        console.log("RoomId copied to clipboard:", userId);
      })
      .catch(err => {
        console.error("Unable to copy RoomId to clipboard", err);
      });
  };
  const isPointInsidePencil = (clientX, clientY, pencil) => {
    // Assuming the pencil is represented as a path, check if the click coordinates are inside the bounding box of the entire pencil array
    const minX = Math.min(...pencil.path.map(point => point[0]));
    const maxX = Math.max(...pencil.path.map(point => point[0]));
    const minY = Math.min(...pencil.path.map(point => point[1]));
    const maxY = Math.max(...pencil.path.map(point => point[1]));

    return clientX >= minX && clientX <= maxX && clientY >= minY && clientY <= maxY;
  };
  const eraserTool = (clientX, clientY) => {
    // Filter out elements that intersect with the given coordinates

    const updatedElements = elements.filter(element => {
      switch (element.type) {
        case "rectangle":
          return !isPointInsideRectangle(clientX, clientY, element);
        case "circle":
          return !isPointInsideCircle(clientX, clientY, element);
        case "triangle":
          return !isPointInsideTriangle(clientX, clientY, element);
        case "line":
          return !isPointInsideLine(clientX, clientY, element);
        case "text":
          return !isPointInsideRectangle(clientX, clientY, element); // Assuming text is represented as a rectangle
        case "pencil":
          return !isPointInsidePencil(clientX, clientY, element);
        default:
          return true;
      }
    });

    // Update the elements state to remove the filtered elements
    setElements(updatedElements);
  };

  const handleMouseDown = e => {
    const { clientX, clientY } = e.nativeEvent;
    if (!edit) {
      setMouseMoveCoord({ clientX, clientY });
    }
    if (moving) {
      Distance(clientX, clientY);
    } else {
      switch (tool) {
        case "pencil":
          setElements(prevElements => [
            ...prevElements,
            {
              type: "pencil",
              clientX,
              clientY,
              path: [[clientX, clientY]],
              stroke: iscolor,
              strokeWidth: lineWidth,
            },
          ]);
          break;

        case "eraser":
          // setElements(prevElements => [
          //   ...prevElements,
          //   {
          //     type: "eraser",
          //     clientX,
          //     clientY,
          //     path: [[clientX, clientY]],
          //     stroke: "white",
          //     strokeWidth: lineWidth,
          //   },
          // ]);
          break;

        case "rectangle":
          setElements(prevElem => [
            ...prevElem,
            {
              type: "rectangle",
              clientX,
              clientY,
              width: 0,
              height: 0,
              id: clientX * clientY + "rect",
              stroke: iscolor,
            },
          ]);
          break;
        case "line":
          setElements(prevElements => [
            ...prevElements,
            {
              type: "line",
              clientX,
              clientY,
              width: clientX,
              height: clientY,
              id: clientX * clientY + "line",
              stroke: iscolor,
            },
          ]);
          break;
        case "circle":
          setElements(prevElem => [
            ...prevElem,
            {
              type: "circle",
              clientX,
              clientY,
              width: 0,
              id: clientX * clientY + "circle",
              stroke: iscolor,
            },
          ]);
          break;
        case "triangle":
          setElements(prevElem => [
            ...prevElem,
            {
              type: "triangle",

              path: [
                [clientX, clientY],
                [clientX, clientY],
                [clientX, clientY],
              ],
              id: clientX * clientY + "triangle",
              stroke: iscolor,
            },
          ]);
          break;
        case "fill":
          BackgroundColor({ clientX, clientY, backcolor, fillactive });
          break;
        case "text":
          handleWrite({ clientX, clientY });
          return;
      }
    }
    // setLastClickTime(currentTime);
    setisDrawing(true);
  };
  const handleMouseMove = e => {
    const { clientX, clientY, offsetX, offsetY } = e.nativeEvent;
    setCoord({ clientX: clientX, clientY: clientY });
    if (isDrawing && !moving) {
      document.body.style.cursor = "cursor";
      switch (tool) {
        case "pencil":
          const { path } = elements[elements.length - 1];
          const newPath = [...path, [clientX, clientY]];
          setElements(prevElements =>
            prevElements.map((ele, index) => {
              if (index === elements.length - 1) {
                return {
                  ...ele,
                  path: newPath,
                  strokeWidth: lineWidth,
                };
              } else {
                return ele;
              }
            })
          );
          break;
        case "eraser":
          eraserTool(clientX, clientY);
          break;
        case "rectangle":
          setElements(prevElem =>
            prevElem.map((ele, index) => {
              if (index === elements.length - 1) {
                return {
                  ...ele,
                  width: clientX - ele.clientX,
                  height: clientY - ele.clientY,
                  fill: "",
                  fillStyle: "",
                };
              } else {
                return ele;
              }
            })
          );
          break;
        case "line":
          setElements(prevElements =>
            prevElements.map((ele, index) => {
              if (index === elements.length - 1) {
                return {
                  ...ele,
                  width: clientX,
                  height: clientY,
                };
              } else {
                return ele;
              }
            })
          );
          break;
        case "circle":
          setElements(prevElements =>
            prevElements.map((ele, index) => {
              if (index === elements.length - 1) {
                return {
                  ...ele,
                  width: clientX - ele.clientX,
                  fill: "",
                  fillStyle: "",
                };
              } else {
                return ele;
              }
            })
          );
          break;
        case "triangle":
          setElements(prevElements =>
            prevElements.map((ele, index) => {
              if (index === elements.length - 1) {
                const deltaX = clientX - ele.path[0][0];
                const deltaY = clientY - ele.path[0][1];

                return {
                  ...ele,
                  path: [
                    [ele.path[0][0], ele.path[0][1]],
                    [ele.path[0][0] + deltaX, ele.path[0][1] + deltaY],
                    [ele.path[0][0], ele.path[0][1] + deltaY * 2],
                  ],
                  fill: "",
                  fillStyle: "",
                };
              } else {
                return ele;
              }
            })
          );
          break;
        case "fill":
          BackgroundColor({ clientX, clientY, backcolor, fillactive });
          break;
        case "text":
          return;
          break;
        default:
          break;
      }
    } else if (isDrawing && moving && tool !== "text") {
      moveshape(clientX, clientY, offsetX, offsetY);
      resize(clientX, clientY);
      setMouseMoveCoord({ clientX, clientY });
    }
  };
  const handleMouseUp = e => {
    setisDrawing(false);
  };

  if (!user?.presenter) {
    return (
      <div className="overflow-hidden " style={{ height: "100vh" }}>
        <div
          className="px-4 my-2  fixed-right rounded-pill m-0 p-0 d-flex"
          style={{ width: "fit-content", position: "fixed", right: "10px", top: "10px" }}
        >
          <button
            className="btn btn-light shadow-none"
            onClick={() => setOpenedChatTag(Opened => !Opened)}
            style={{ cursor: "pointer" }}
          >
            Chat
          </button>
          {openedChatTab && (
            <Chatbar className="mt-1" setOpenedChatTag={setOpenedChatTag} socket={socket} />
          )}
        </div>
        <img
          src={img}
          alt="canvas imge"
          className="w-100 h-100"
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "fixed", zIndex: 3, width: "100%" }}>
        <div className="container-fluid w-100 position-absolute ">
          <div
            className=" px-4 my-3 fixed-top rounded-pill m-0 p-0 d-flex"
            style={{ width: "fit-content" }}
          >
            <button className="btn btn-light shadow-none" onClick={handleClearCanvas}>
              Clear
            </button>
          </div>
          <div className="container-fluid ">
            <ul
              className="nav  px-4 my-2 d-flex justify-content-between justify-content-center top-5 start-50 translate-middle-x position-absolute mx-auto   w-50 floating"
              style={{ zIndex: 2 }}
            >
              <li class="nav-item  ">
                {" "}
                <HorizontalRule
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
                  onClick={e => {
                    setTool("line");
                    setback("line");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
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
                  onClick={e => {
                    setTool("pencil");
                    setback("pencil");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  src={text}
                  className="rounded-circle "
                  style={{
                    opacity: "0.7",
                    opacity: back === "text" ? "2" : "0.5",
                    background: back === "text" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("text");
                    setback("text");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
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
                    opacity: back === "fill" ? "2" : "0.5",
                    background: back === "fill" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setback("fill");
                    setTool("fill");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  src={eraser}
                  className="rounded-circle "
                  style={{
                    opacity: "0.7",
                    opacity: back === "eraser" ? "2" : "0.5",
                    background: back === "eraser" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("eraser");
                    setback("eraser");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  src={move}
                  className="rounded-circle "
                  style={{
                    opacity: "0.7",
                    opacity: back === "move" ? "2" : "0.5",
                    background: back === "move" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("selection");
                    setback("move");
                    setMoving(true);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item ">
                {" "}
                <img
                  src={rectangle}
                  className="rounded-circle "
                  style={{
                    opacity: "0.7",
                    opacity: back === "rectangle" ? "2" : "0.5",
                    background: back === "rectangle" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("rectangle");
                    setback("rectangle");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item  ">
                {" "}
                <ChangeHistory
                  alt="line"
                  className="img-fluid rounded-circle"
                  style={{
                    marginTop: "-25px",
                    opacity: "0.7",
                    marginLeft: "2px",
                    marginBottom: "-25px",
                    opacity: back === "triangle" ? "2" : "0.5",
                    background: back === "triangle" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("triangle");
                    setback("triangle");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
              <li class="nav-item  ">
                {" "}
                <PanoramaFishEye
                  alt="line"
                  className="img-fluid rounded-circle"
                  style={{
                    marginTop: "-25px",
                    opacity: "0.7",
                    marginLeft: "2px",
                    marginBottom: "-25px",
                    opacity: back === "circle" ? "2" : "0.5",
                    background: back === "circle" ? "#E0dfff" : "#ffff",
                  }}
                  onClick={e => {
                    setTool("circle");
                    setback("circle");
                    setMoving(false);
                    setEraserWidthon(ColorOpen => !ColorOpen);
                  }}
                />
              </li>
            </ul>
          </div>
          <div
            className="px-4 my-2  fixed-right rounded-pill m-0 p-0 d-flex"
            style={{ width: "fit-content", position: "fixed", right: "10px", top: "10px" }}
          >
            <button
              className="btn btn-light shadow-none"
              onClick={() => setOpenedChatTag(Opened => !Opened)}
              style={{ cursor: "pointer" }}
            >
              Chat
            </button>
            {openedChatTab && (
              <Chatbar className="mt-1" setOpenedChatTag={setOpenedChatTag} socket={socket} />
            )}
          </div>
        </div>
        <div
          className=" px-4 my-3 fixed-bottom rounded-pill m-0 p-0 d-flex"
          style={{ width: "fit-content" }}
        >
          <button
            className="btn btn-light shadow-none rounded-0  border-0 border-opacity-10 rounded-start"
            disabled={elements.length === 0}
            onClick={() => undo()}
          >
            <Undo />
          </button>
          <button
            className="btn btn-light shadow-none rounded-0 rounded-end"
            disabled={history.length === 0}
            onClick={() => redo()}
          >
            <Redo className="opacity-0" />
          </button>
        </div>
        {!openedChatTab && (
          <div
            className="px-4 my-3  fixed-bottom  float-right rounded-pill  m-0 p-0"
            style={{ textAlignLast: "end", zIndex: "0" }}
          >
            <button
              className={`btn btn-dark ${openedUserTab ? "bg-light" : "bg-secoundry"} shadow-none`}
            >
              {" "}
              <PersonAdd
                className={`justify-space-between w-100`}
                onClick={() => setOpenedUserTag(Opened => !Opened)}
                style={{
                  cursor: "pointer",
                  color: openedUserTab ? "black" : "white",
                  border: "0px",
                }}
              />
              {openedUserTab && (
                <>
                  <div
                    className={`idbox ${
                      openedUserTab ? " open" : " close"
                    } position-fixed bottom-0 h-25  bg-secondary rounded`}
                    style={{
                      width: "250px",
                      right: "0.5%",
                      top: "65%",
                      justifyContent: "center",
                      textAlignLast: "center",
                    }}
                  >
                    <div className="container ">
                      <h6 className="my-3">Room Id</h6>
                      <div className="">
                        <button
                          className=" bg-transparent shadow-none  text-center w-100"
                          onClick={handleCopyClick}
                          style={{ color: "white", border: "none" }}
                        >
                          <br /> {userId}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {eraserWidthon && (
        <div className="container-fluid color-box position-absolute" style={{ zIndex: 3 }}>
          <div className="container-fluid">
            <h6>Stroke</h6>
            <div className="container-fluid d-flex flex-coloumn color-grid">
              <div
                className="container-fluid mx-1 rounded  color-cont bg-dark"
                style={{
                  border: isactive === "black" ? "3px solid black" : "3px solid #777c81",
                }}
                onClick={e => {
                  setIsactive("black");
                  setIscolor("black");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-danger"
                style={{
                  border: isactive === "red" ? "3px solid black" : "3px solid #777c81",
                }}
                onClick={e => {
                  setIsactive("red");
                  setIscolor("red");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-success"
                style={{
                  border: isactive === "green" ? "3px solid black" : "3px solid #777c81",
                }}
                onClick={e => {
                  setIsactive("green");
                  setIscolor("green");
                }}
              ></div>
              <div
                className="container-fluid mx-1 rounded  color-cont bg-primary"
                style={{
                  border: isactive === "blue" ? "3px solid black" : "3px solid #777c81",
                }}
                onClick={e => {
                  setIsactive("blue");
                  setIscolor("blue");
                }}
              ></div>
              <div className=" g-0 container-fluid mx-3 rounded  color-contone ">
                <input
                  className=" input-color "
                  type="color"
                  onChange={e => {
                    setIscolor(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          {tool !== "text" && (
            <div className="container-fluid my-3">
              <h6>Background</h6>
              <div className="container-fluid d-flex flex-coloumn color-grid">
                <div
                  className="container-fluid mx-1 rounded  color-cont bg-dark"
                  style={{
                    border: activecolor === "black" ? "3px solid black" : "3px solid #777c81",
                  }}
                  onClick={e => {
                    setActiveColor("black");
                    setBackColor("black");
                    setcolorOpen(ColorOpen => !ColorOpen);
                  }}
                ></div>
                <div
                  className="container-fluid mx-1 rounded  color-cont bg-danger"
                  style={{
                    border: activecolor === "red" ? "3px solid black" : "3px solid #777c81",
                  }}
                  onClick={e => {
                    setActiveColor("red");
                    setBackColor("red");
                    setcolorOpen(ColorOpen => !ColorOpen);
                  }}
                ></div>
                <div
                  className="container-fluid mx-1 rounded  color-cont bg-success"
                  style={{
                    border: activecolor === "green" ? "3px solid black" : "3px solid #777c81",
                  }}
                  onClick={e => {
                    setActiveColor("green");
                    setBackColor("green");
                    setcolorOpen(ColorOpen => !ColorOpen);
                  }}
                ></div>
                <div
                  className="container-fluid mx-1 rounded  color-cont bg-primary"
                  style={{
                    border: activecolor === "blue" ? "3px solid black" : "3px solid #777c81",
                  }}
                  onClick={e => {
                    setActiveColor("blue");
                    setBackColor("blue");
                    setcolorOpen(ColorOpen => !ColorOpen);
                  }}
                ></div>
                <div className=" g-0 container-fluid mx-3 rounded  color-contone ">
                  <input
                    className=" input-color "
                    type="color"
                    onChange={e => {
                      setBackColor(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {tool !== "text" && (
            <div className="container-fluid  ">
              <h6>Fill</h6>
              <div className="container-fluid g-1  d-flex flex-coloumn ">
                <div className="container-fluid  rounded ">
                  <img
                    src={crisscross}
                    alt=""
                    className="fillimg rounded "
                    style={{
                      backgroundColor: activeback === "cross-hatch" ? "#E0dfff" : " #f1f0ff",
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
                      backgroundColor: activeback === "line" ? "#E0dfff" : " #f1f0ff",
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
                      backgroundColor: activeback === "solid" ? "#E0dfff" : " #f1f0ff",
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
          )}
          {tool === "pencil" && (
            <div className="container-fluid my-4 mx-0" style={{ width: "220px" }}>
              <h6>Line Width</h6>
              <input
                type="range"
                class="form-range"
                id="customRange1"
                min={1}
                max={40}
                defaultValue={5}
                onChange={e => {
                  setLineWidth(e.target.value ? e.target.value : lineWidth);
                  setTool("pencil");
                }}
              />
            </div>
          )}
          {(edit || tool === "text") && (
            <>
              <div className="container-fluid my-4 mx-0" style={{ width: "180px" }}>
                <h6>Font Picker</h6>
                <FontPicker
                  apiKey="AIzaSyCRHAY49DC - CqjF1 - ImJ0n1CpRJjL7dl_4"
                  activeFontFamily={selectedFont}
                  onChange={font => setSelectedFont(font.family)}
                />
              </div>
              <div className="container-fluid my-4 mx-0" style={{ width: "220px" }}>
                <h6>Text Size</h6>
                <input
                  type="range"
                  class="form-range"
                  id="customRange1"
                  min={5}
                  max={100}
                  defaultValue={10}
                  onChange={e => {
                    setsetTextSize(e.target.value ? e.target.value : textsize);
                    setTool("text");
                  }}
                />
              </div>
            </>
          )}
          {tool === "eraser" && (
            <>
              <div className="container-fluid my-4 mx-0" style={{ width: "220px" }}>
                <h6>Line Width</h6>
                <input
                  type="range"
                  class="form-range"
                  id="customRange1"
                  min={1}
                  max={40}
                  defaultValue={5}
                  onChange={e => {
                    setEraserWidth(e.target.value ? e.target.value : eraserWidth);
                    setTool("eraser");
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handletext}
        className={` w-100 h-100 position-absolute ${resizes ? "resizing" : ""}`}
        width={window.innerWidth}
        height={window.innerHeight}

        // socket={socket}
      >
        Canvas
      </canvas>
      {tool === "text" && (
        <textarea
          ref={inputRef}
          className="position-absolute "
          style={{
            height: `${textsize}`,
            top: mousemoveCoord.clientY,
            left: mousemoveCoord.clientX,
            zIndex: 2,
            width: "auto",
            minWidth: "150px",
            background: "transparent",
          }}
          value={
            editedText ? editedText : selectelement && selectelement.text ? 
selectelement.text : ""
          }
          onChange={e => setEditedText(e.target.value)}
          autoFocus
          onClick={handleWrite}
          onBlur={handle}
          min={50}
          max={500}
        />
      )}
    </>
  );
};
