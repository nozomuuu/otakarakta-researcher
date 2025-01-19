import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CountdownTimer from './components/CountdownTimer';
import TakePhoto from './pages/TakePhoto'; // 写真撮影用ページ
import ViewPhotos from './pages/ViewPhotos'; // アルバム表示ページ
import Encyclopedia from './pages/Encyclopedia'; // 図鑑ページ

function App() {
  return (
    <Router>
      <div>
        <h1>オタカラクタ リサーチャーへようこそ！</h1>
        <nav>
          <ul>
            <li><Link to="/take-photo">とる</Link></li>
            <li><Link to="/view-photos">みる</Link></li>
            <li><Link to="/encyclopedia">ずかん</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<CountdownTimer minutes={10} />} />
          <Route path="/take-photo" element={<TakePhoto />} />
          <Route path="/view-photos" element={<ViewPhotos />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
