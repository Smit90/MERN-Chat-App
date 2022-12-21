import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homepage from "./Pages/HomePage";
import Chatpage from "./Pages/ChatPage";
import VideoPage from "./Pages/VideoPage";
import SettingPage from "./Pages/SettingPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/chats" exact element={<Chatpage />} />
        <Route path="/video" exact element={<VideoPage />} />
        <Route path="/settings" exact element={<SettingPage />} />
      </Routes>
    </div>
  );
}

export default App;
