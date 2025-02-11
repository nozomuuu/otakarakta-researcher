import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Rules from "./pages/Rules"
import TakePhoto from "./pages/TakePhoto"
import Report from "./pages/Report"
import SharedPhoto from "./pages/SharedPhoto"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/takephoto" element={<TakePhoto />} />
      <Route path="/report" element={<Report />} />
      <Route path="/shared" element={<SharedPhoto />} />
    </Routes>
  )
}

export default App

