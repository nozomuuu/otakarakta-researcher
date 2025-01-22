import React, { useState, useRef } from "react";

const TakePhoto = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", aspectRatio: 1 },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraActive(true);
    } catch (error) {
      console.error("カメラの起動に失敗しました:", error);
    }
  };

  const takePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 300, 300); // スクエアの画像にする
    const imageData = canvasRef.current.toDataURL("image/png");
    setPhoto(imageData);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>写真を撮影</h1>
      {!cameraActive && (
        <button onClick={startCamera} style={{ marginBottom: "20px" }}>
          カメラを開始
        </button>
      )}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
          margin: "0 auto",
          border: "2px solid #000",
        }}
      >
        {cameraActive && (
          <>
            <video
              ref={videoRef}
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
              }}
            />
            {/* ターゲットマーク */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "50px",
                height: "50px",
                border: "2px solid red",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
              }}
            ></div>
          </>
        )}
      </div>
      {cameraActive && (
        <button
          onClick={takePhoto}
          style={{ marginTop: "20px", display: "block", margin: "0 auto" }}
        >
          撮影
        </button>
      )}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={300}
        height={300}
      ></canvas>
      {photo && (
        <div>
          <h2>撮影結果</h2>
          <img src={photo} alt="撮影した写真" style={{ width: "300px" }} />
        </div>
      )}
    </div>
  );
};

export default TakePhoto;
