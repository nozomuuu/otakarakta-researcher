import React, { useRef, useState, useEffect } from 'react';

const TakePhoto = () => {
  const videoRef = useRef(null); // ビデオ要素の参照
  const canvasRef = useRef(null); // Canvas要素の参照
  const [stream, setStream] = useState(null); // カメラストリームの状態

  // カメラを起動する関数
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream; // ビデオ要素にストリームを設定
      }
    } catch (error) {
      console.error('カメラの起動に失敗しました:', error);
    }
  };

  // 撮影機能
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // Canvasに画像を描画
      const imageData = canvas.toDataURL('image/png'); // 画像データをBase64形式で取得
      const photos = JSON.parse(localStorage.getItem('photos')) || []; // 既存の写真データを取得
      photos.push(imageData); // 新しい写真を追加
      localStorage.setItem('photos', JSON.stringify(photos)); // localStorageに保存
    }
  };

  // ストリームを停止する関数
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // コンポーネントのアンマウント時にカメラを停止
  useEffect(() => {
    return () => stopCamera();
  }, [stream]);

  return (
    <div>
      <h1>写真を撮影</h1>
      <button onClick={startCamera}>カメラを開始</button>
      <div>
        <video ref={videoRef} autoPlay playsInline width="300" height="300" />
        <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }} />
      </div>
      <button onClick={capturePhoto}>撮影</button>
    </div>
  );
};

export default TakePhoto;
