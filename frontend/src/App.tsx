import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatGeneral from "./pages/ChatGeneral";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatGeneral />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
