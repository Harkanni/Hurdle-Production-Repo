import { useState } from "react";
import Start from "./pages/Start";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";
import { initialChannels, initialMessages } from "./data/mockData";

function App() {
  const [screen, setScreen] = useState("start");
  const [channels, setChannels] = useState(initialChannels);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState(initialMessages);

  if (screen === "start") {
    return (
      <Start
        onCreateAccount={() => setScreen("register")}
        onSignIn={() => setScreen("login")}
      />
    );
  }

  if (screen === "register") {
    return <Register onLogin={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return (
      <Login
        onRegister={() => setScreen("register")}
        onSuccess={() => setScreen("workspace")}
      />
    );
  }

  return (
    <Workspace
      channels={channels}
      setChannels={setChannels}
      activeChannel={activeChannel}
      setActiveChannel={setActiveChannel}
      messages={messages}
      setMessages={setMessages}
      onLogout={() => setScreen("login")}
    />
  );
}

export default App;