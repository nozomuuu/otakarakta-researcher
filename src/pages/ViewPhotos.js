import React, { useEffect, useState } from 'react';

const ViewPhotos = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const storedPhotos = JSON.parse(localStorage.getItem('photos')) || [];
    setPhotos(storedPhotos);
  }, []);

  return (
    <div>
      <h1>アルバム</h1>
      <div>
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`撮影した写真${index + 1}`} width="300" />
        ))}
      </div>
    </div>
  );
};

export default ViewPhotos;
