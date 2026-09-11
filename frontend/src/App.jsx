import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";
import ChannelView from "./pages/ChannelView";
import ChannelDirectory from "./pages/ChannelDirectory";
import DMView from "./pages/DMView";
import ProfileView from "./pages/ProfileView";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
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
              <Workspace />
            </ProtectedRoute>
          }
        >
          <Route path="channel/:channelId" element={<ChannelView />} />
          <Route path="directory" element={<ChannelDirectory />} />
          <Route path="dms" element={<DMView />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;