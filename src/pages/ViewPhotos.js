import React, { useRef, useState } from "react";

const CameraPage = () => {
  const videoRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // アウトカメラを使用
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; // スクエアサイズ
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // ビデオフレームをキャンバスに描画
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);

    // カメラを停止
    const stream = videoRef.current.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  return (
    <div>
      <h1>写真を撮影</h1>
      {!cameraActive && (
        <button onClick={startCamera}>カメラを開始</button>
      )}
      {cameraActive && (
        <div style={{ position: "relative", width: "1080px", height: "1080px" }}>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          ></video>

          {/* ターゲットマーク */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100px",
              height: "100px",
              border: "2px solid red",
              borderRadius: "50%",
              pointerEvents: "none", // クリックを無効化
            }}
          ></div>
        </div>
      )}
      {cameraActive && <button onClick={capturePhoto}>撮影</button>}
      {photo && (
        <div>
          <h2>撮影結果</h2>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraPage;
