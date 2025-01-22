import React, { useState, useRef, useEffect } from "react";

const TakePhoto = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    // クリーンアップ処理: コンポーネントがアンマウントされたときにカメラを停止
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", aspectRatio: 1 },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play(); // カメラプレビューを開始
    } catch (error) {
      setErrorMessage("カメラの起動に失敗しました。ブラウザの設定を確認してください。");
      console.error("カメラの起動エラー:", error);
    }
  };

  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 300, 300); // スクエア画像を生成
    const imageData = canvasRef.current.toDataURL("image/png");
    setPhoto(imageData);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>写真を撮影</h1>
      {!cameraActive && (
        <button
          onClick={() => setCameraActive(true)}
          style={{ marginBottom: "20px" }}
        >
          カメラを開始
        </button>
      )}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
          margin: "0 auto",
          border: "2px solid black",
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
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                border: "2px solid red",
                borderRadius: "50%",
              }}
            ></div>
          </>
        )}
      </div>
      {cameraActive && (
        <button
          onClick={takePhoto}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
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
      {errorMessage && (
        <div style={{ color: "red", marginTop: "20px" }}>{errorMessage}</div>
      )}
    </div>
  );
};

export default TakePhoto;
