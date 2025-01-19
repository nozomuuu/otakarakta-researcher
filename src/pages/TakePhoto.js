import React, { useRef, useState } from "react";

const TakePhoto = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  // カメラを起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" }, // アウトカメラを使用
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("カメラの起動に失敗しました:", error);
    }
  };

  // 撮影ボタンの動作
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    // Canvasサイズをビデオのサイズに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Canvasにビデオの現在のフレームを描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // キャプチャ画像を取得
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
  };

  return (
    <div>
      <h1>写真を撮影</h1>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          maxWidth: "1080px",
          maxHeight: "1080px",
          borderRadius: "12px"
        }}
      ></video>
      <button onClick={startCamera}>カメラを開始</button>
      <button onClick={takePhoto}>撮影</button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      {photo && (
        <div>
          <h2>撮影結果</h2>
          <img src={photo} alt="撮影された画像" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default TakePhoto;
