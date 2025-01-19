import React, { useRef, useState } from 'react';

const TakePhoto = () => {
  const videoRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/png'));
  };

  return (
    <div>
      <h2>写真を撮影</h2>
      <button onClick={startCamera}>カメラを開始</button>
      <div>
        <video ref={videoRef} autoPlay playsInline />
      </div>
      <button onClick={takePhoto}>撮影</button>
      {photo && <img src={photo} alt="Captured" />}
    </div>
  );
};

export default TakePhoto;
