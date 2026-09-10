import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Start from "./pages/Start";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";
import ProtectedRoute from "./components/ProtectedRoute";
import { initialChannels, initialMessages } from "./data/mockData";

function App() {
  const [channels, setChannels] = useState(initialChannels);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState(initialMessages);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <Workspace
                channels={channels}
                setChannels={setChannels}
                activeChannel={activeChannel}
                setActiveChannel={setActiveChannel}
                messages={messages}
                setMessages={setMessages}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;