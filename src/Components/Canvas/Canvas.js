import React, { useEffect, useState, useLayoutEffect } from "react";
import rough from "roughjs";
const roughGenerator = rough.generator();
export const Canvas = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  lineWidth,
  user,
  socket,
  eraserWidth,
  fillactive,
  backcolor,
}) => {
  const [img, setImg] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inWidth, setInWidth] = useState(window.innerWidth - 65);
  const [inHeight, setInHeight] = useState(window.innerHeight);
  const [iscolor, setIscolor] = useState("");
  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgUrl);
    });
  }, [socket]);
  console.log(iscolor);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.height = inHeight;
      canvas.width = inWidth;
      ctxRef.current = ctx;
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      ctxRef.current.rough = 0;
      ctx.lineCap = "round";
    }
  }, [inHeight, inWidth]);

  useState(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    const handleResize = () => {
      setInWidth(window.innerWidth - 69);
      setInHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {});

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const roughCanvas = rough.canvas(canvasRef.current);
      if (elements) {
        if (elements.length > 0) {
          ctxRef.current.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }

        elements.forEach((element) => {
          if (element.type === "pencil") {
            roughCanvas.linearPath(element.path, {
              stroke: element.stroke,
              strokeWidth: element.strokeWidth,
              roughness: 0.05,
            });
          }
          if (element.type === "eraser") {
            roughCanvas.linearPath(element.path, {
              stroke: element.stroke,
              strokeWidth: element.strokeWidth,
              roughness: 0,
            });
          } else if (element.type === "line") {
            // roughGenerator.draw(
            roughCanvas.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 2,
                roughness: 0,
              }
            );
            // )
          } else if (element.type === "rectangle") {
            roughCanvas.rectangle(
              element.offsetX,
              element.offsetY,
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
          } else if (element.type === "circle") {
            roughCanvas.circle(
              element.offsetX,
              element.offsetY,
              element.width,
              {
                stroke: element.stroke,
                strokeWidth: 2,
                fill: element.fill,
                fillStyle: element.fillStyle,
                roughness: 0,
              }
            );
          } else if (element.type === "triangle-horizontal") {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(
              element.offsetX,
              element.offsetY + element.height
            );
            ctxRef.current.lineTo(element.offsetX, element.offsetY);
            ctxRef.current.lineTo(
              element.offsetX + element.width,
              element.offsetY + element.height / 2
            );

            ctxRef.current.closePath();
            ctxRef.current.strokeStyle = element.stroke;
            if(element.fill){
                ctxRef.current.fillStyle = element.fill || "transparent";
            ctxRef.current.strokeStyle = element.fill || element.stroke;

              ctxRef.current.fill();
            }
            ctxRef.current.stroke();

          } else if (element.type === "triangle-vertical") {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(
              element.offsetX + element.width / 2,
              element.offsetY
            );
            ctxRef.current.lineTo(
              element.offsetX,
              element.offsetY + element.height
            );
            ctxRef.current.lineTo(
              element.offsetX + element.width,
              element.offsetY + element.height
            );
            ctxRef.current.closePath();
            ctxRef.current.strokeStyle = element.stroke;
            if (element.fill) {
              ctxRef.current.fillStyle = element.fill || "transparent";
              ctxRef.current.strokeStyle = element.fill || element.stroke;

              ctxRef.current.fill();
            }
            ctxRef.current.stroke();
          }
        });

        const canvasImage = canvasRef.current.toDataURL();

        socket.emit("whiteboardData", canvasImage);
      }
    }
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
          strokeWidth: lineWidth,
        },
      ]);
    }
    if (tool === "eraser") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "eraser",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: "white",
          strokeWidth: eraserWidth,
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
        },
      ]);
    } else if (tool === "rectangle") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "rectangle",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    } else if (tool === "circle") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "circle",
          offsetX,
          offsetY,
          width: 0,
          // height:0,
          stroke: color,
        },
      ]);
    } else if (tool === "triangle-horizontal") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "triangle-horizontal",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    } else if (tool === "triangle-vertical") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "triangle-vertical",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    } else if (tool === "text") {
      const { offsetX, offsetY } = e.nativeEvent;

     const isMouseOverCircle = elements.some((element) => {
       if (element.type === "circle") {
         const distance = Math.sqrt(
           Math.pow(offsetX - element.offsetX, 2) +
             Math.pow(offsetY - element.offsetY, 2)
         );

         if (distance <= element.width / 2) {
           const filledCircle = {
             ...element,
             fill: backcolor,
             fillStyle: fillactive,
           };
           setElements((prevElements) =>
             prevElements.map((el) => (el === element ? filledCircle : el))
           );

           return true;
         }
       }
       return false;
     });

      const isMouseOverRectangle = elements.some((element) => {
        if (element.type === "rectangle") {
          const centerX = element.offsetX + element.width / 2;
          const centerY = element.offsetY + element.height / 2;

          const distance = Math.sqrt(
            Math.pow(offsetX - centerX, 2) + Math.pow(offsetY - centerY, 2)
          );

          const clickedRectangle = elements.find(
            (element) =>
              element.type === "rectangle" &&
              offsetX >= element.offsetX &&
              offsetX <= element.offsetX + element.width &&
              offsetY >= element.offsetY &&
              offsetY <= element.offsetY + element.height
          );

          console.log("Clicked rectangle:", clickedRectangle);

          if (distance <= Math.max(element.width, element.height) / 2) {
            const filledRectangle = {
              ...clickedRectangle,
              fill: backcolor,
              fillStyle: fillactive,
            };
            setElements((prevElements) =>
              prevElements.map((el) =>
                el === clickedRectangle ? filledRectangle : el
              )
            );

            return true; 
           }
        }
        return false;
      });
      const isMouseOverTriangleHorizontal = elements.some((element) => {
        if (element.type === "triangle-horizontal") {
          const { offsetX, offsetY } = e.nativeEvent;

          const isInTriangle =
            offsetX >= element.offsetX &&
            offsetX <= element.offsetX + element.width &&
            offsetY >= element.offsetY &&
            offsetY <= element.offsetY + element.height;

          if (isInTriangle) {
            const filledTriangle = {
              ...element,
              fill: backcolor,
              fillStyle: fillactive,
            };

            setElements((prevElements) =>
              prevElements.map((el) => (el === element ? filledTriangle : el))
            );

            return true;
          }
        }
        return false;
      });
      const isMouseOverTriangleVertical = elements.some((element) => {
        if (element.type === "triangle-vertical") {
          const { offsetX, offsetY } = e.nativeEvent;

          const isInTriangle =
            offsetX >= element.offsetX &&
            offsetX <= element.offsetX + element.width &&
            offsetY >= element.offsetY &&
            offsetY <= element.offsetY + element.height;

          if (isInTriangle) {
            const filledTriangle = {
              ...element,
              fill: backcolor,
              fillStyle: fillactive,
            };

            setElements((prevElements) =>
              prevElements.map((el) => (el === element ? filledTriangle : el))
            );

            return true;
          }
        }
        return false;
      });
      
    }

    setIsDrawing(true);
  };
  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) =>
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
      }
      if (tool === "eraser") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                path: newPath,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "line") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "rectangle") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
                fill: "",
                fillStyle: "",
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "circle") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                fill: "",
                fillStyle: "",
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "triangle-horizontal") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
                fill: "",
                fillStyle: "",
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "triangle-vertical") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
                fill: "",
                fillStyle: "",
              };
            } else {
              return ele;
            }
          })
        );
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };

  if (!user?.presenter) {
    return (
      <div className="overflow-hidden " style={{ height: "100vh" }}>
        <img
          src={img}
          alt="canvas imge"
          className="w-100 h-100"
          style={{ width: inWidth, height: inHeight }}
        />
      </div>
    );
  }

  return (
    <div
      className=" g-0 overflow-hidden "
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        className=" g-0 container-fluid  overflow-hidden "
        style={{ Width: { inWidth } }}
      />
    </div>
  );
};
