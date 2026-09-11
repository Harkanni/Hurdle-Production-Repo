import { useState } from "react";
import {
  AtSign,
  MessageCircle,
  PlusCircle,
  Send,
  Smile,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

function DMView() {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Toluwani",
      initials: "T",
      text: "Hey! Are the API routes ready?",
      time: "11:00 AM",
      mine: false,
    },
  ]);

  const [text, setText] = useState("");

  function sendDM(e) {
    e.preventDefault();

    if (!text.trim()) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: Date.now(),
        sender: currentUser?.displayName || "Mike",
        initials: currentUser?.initials || currentUser?.displayName?.[0] || "M",
        text,
        time: "Just now",
        mine: true,
      },
    ]);

    setText("");
  }

  return (
    <section className="chat-view">
      <div className="channel-top">
        <h1>
          <MessageCircle size={16} />
          Direct Messages
        </h1>

        <span>Private conversation with Toluwani</span>
      </div>

      <div className="chat-content dm-chat-content">
        <div className="channel-welcome">
          <div className="hash-large">
            <MessageCircle size={22} />
          </div>

          <h2>Toluwani</h2>

          <p>
            This is a direct conversation between you and Toluwani. Messages
            here are private to both teammates.
          </p>
        </div>

        <div className="today-line">
          <span>Today</span>
        </div>

        <div className="message-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={message.mine ? "message-item mine" : "message-item"}
            >
              <div className="message-avatar">{message.initials}</div>

              <div className="message-content">
                <div className="message-meta">
                  <strong>{message.sender}</strong>
                  {message.mine && <span>(You)</span>}
                  <time>{message.time}</time>
                </div>

                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form className="figma-composer" onSubmit={sendDM}>
        <div className="figma-composer-toolbar">
          <span>B</span>
          <span>I</span>
          <span>≡</span>
          <span>&lt;&gt;</span>
        </div>

        <input
          className="figma-composer-message"
          placeholder="Message Toluwani..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="figma-composer-bottom">
          <div className="figma-composer-tools">
            <button type="button" aria-label="Add attachment">
              <PlusCircle size={16} />
            </button>

            <button type="button" aria-label="Add emoji">
              <Smile size={16} />
            </button>

            <button type="button" aria-label="Mention teammate">
              <AtSign size={16} />
            </button>
          </div>

          <span>Press Enter to send, Shift+Enter for newline</span>

          <button className="figma-send-btn" aria-label="Send message">
            <Send size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default DMView;