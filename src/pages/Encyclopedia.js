import React from 'react';

const Encyclopedia = () => {
  const items = [
    { name: 'オタカラクタ1', description: '説明1' },
    { name: 'オタカラクタ2', description: '説明2' },
  ];

  return (
    <div>
      <h2>図鑑</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Encyclopedia;
