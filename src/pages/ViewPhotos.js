import React, { useState, useEffect } from 'react';

const ViewPhotos = () => {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const savedPhoto = localStorage.getItem('photo');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  return (
    <div>
      <h1>アルバム</h1>
      {photo ? (
        <img src={photo} alt="Saved" style={{ width: '300px', height: '300px' }} />
      ) : (
        <p>ここに撮影した写真を表示します。</p>
      )}
    </div>
  );
};

export default ViewPhotos;
