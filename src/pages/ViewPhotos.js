import React, { useState, useEffect } from 'react';

const ViewPhotos = () => {
  const [photos, setPhotos] = useState([]);

  // サンプル用データを使用
  useEffect(() => {
    const savedPhotos = JSON.parse(localStorage.getItem('photos')) || [];
    setPhotos(savedPhotos);
  }, []);

  return (
    <div>
      <h2>アルバム</h2>
      <div>
        {photos.length > 0 ? (
          photos.map((photo, index) => (
            <img key={index} src={photo} alt={`Photo ${index + 1}`} />
          ))
        ) : (
          <p>撮影した写真をここに表示します。</p>
        )}
      </div>
    </div>
  );
};

export default ViewPhotos;
