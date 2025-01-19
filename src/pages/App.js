import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TakePhoto from './pages/TakePhoto';
import Album from './pages/Album';
import Encyclopedia from './pages/Encyclopedia';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/take-photo">とる</Link></li>
          <li><Link to="/album">みる</Link></li>
          <li><Link to="/encyclopedia">ずかん</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/take-photo" element={<TakePhoto />} />
        <Route path="/album" element={<Album />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
      </Routes>
    </Router>
  );
}

export default App;
