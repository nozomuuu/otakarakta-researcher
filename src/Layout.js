import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ margin: '0 auto', width: '80%', textAlign: 'center' }}>
      {children}
    </div>
  );
};

export default Layout;

