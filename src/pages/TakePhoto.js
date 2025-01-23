import React, { useRef, useState, useEffect } from 'react';

const TakePhoto = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  let stream = null; // カメラストリームの定義

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    getCameraStream();

    // クリーンアップ処理
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []); // 依存関係は空で適切に管理

  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // 撮影した画像をデータURL形式で取得
    const imageData = canvasRef.current.toDataURL('image/png');
    setPhoto(imageData);

    // ローカルストレージに保存
    localStorage.setItem('photo', imageData);
  };

  return (
    <div>
      <h1>写真を撮影</h1>
      <video
        ref={videoRef}
        style={{
          display: 'block',
          width: '300px',
          height: '300px',
          border: '1px solid black',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={300}
        height={300}
      ></canvas>
      <button onClick={takePhoto}>撮影</button>
      {photo && <img src={photo} alt="Captured" />}
    </div>
  );
};

export default TakePhoto;
