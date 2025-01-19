import React, { useRef, useState } from "react";

const TakePhoto = () => {
  const videoRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // アウトカメラを利用
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play(); // カメラストリームの再生
      setCameraActive(true);
    } catch (error) {
      console.error("カメラの起動に失敗しました:", error);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; // スクエア画角
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // ビデオからフレームをキャンバスに描画
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);

    // カメラ停止
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
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // スクエアに固定
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
              pointerEvents: "none", // マークはクリック不能にする
            }}
          ></div>
        </div>
      )}
      {cameraActive && (
        <button onClick={capturePhoto}>撮影</button>
      )}
      {photo && (
        <div>
          <h2>撮影結果</h2>
          <img
            src={photo}
            alt="撮影画像"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
};

export default TakePhoto;
