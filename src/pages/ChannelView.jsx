import { useRef, useState } from "react";
import {
  AtSign,
  Bold,
  Code,
  Hash,
  Italic,
  List,
  Pin,
  PlusCircle,
  Send,
  Smile,
  Users,
  X,
} from "lucide-react";
import MessageItem from "../components/MessageItem";

const emojis = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🥳",
  "👏",
  "🙌",
  "👍",
  "🔥",
  "✨",
  "💜",
  "✅",
  "🚀",
  "📌",
  "👀",
  "💬",
];

function ChannelView({ channel, messages, setMessages }) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const channelMessages = messages.filter(
    (item) => item.channelId === channel.id
  );

  function handleSend(e) {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;

    const shouldFail = message.toLowerCase().includes("fail");

    const newMessage = {
      id: Date.now(),
      channelId: channel.id,
      sender: "Mike",
      initials: "M",
      text: message || `Shared a file: ${selectedFile.name}`,
      fileName: selectedFile?.name || "",
      time: "Just now",
      mine: true,
      status: shouldFail ? "failed" : "sending",
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    setSelectedFile(null);
    setShowEmojiPicker(false);

    if (!shouldFail) {
      setTimeout(() => {
        setMessages((current) =>
          current.map((item) =>
            item.id === newMessage.id ? { ...item, status: "sent" } : item
          )
        );
      }, 900);
    }
  }

  function retryMessage(id) {
    setMessages((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "sending" } : item
      )
    );

    setTimeout(() => {
      setMessages((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "sent" } : item
        )
      );
    }, 900);
  }

  function addEmoji(emoji) {
    setMessage((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);
  }

  function insertMention() {
    setMessage((current) => `${current}@`);
  }

  return (
    <section className="chat-view">
      <div className="channel-top">
        <h1>
          <Hash size={16} />
          {channel.name}
        </h1>

        <span>{channel.description}</span>

        <div className="members-pill">
          <Users size={12} />
          {channel.members} members
        </div>
      </div>

      <div className="chat-content">
        {channelMessages.length === 0 ? (
          <EmptyChannel channel={channel} />
        ) : (
          <>
            <ChannelIntro channel={channel} />

            <div className="today-line">
              <span>Today</span>
            </div>

            <div className="message-list">
              {channelMessages.map((item) => (
                <MessageItem
                  key={item.id}
                  message={item}
                  onRetry={retryMessage}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <form className="figma-composer" onSubmit={handleSend}>
        <div className="figma-composer-toolbar">
          <Bold size={14} />
          <Italic size={14} />
          <List size={14} />
          <Code size={14} />
        </div>

        <input
          className="figma-composer-message"
          placeholder={`Message #${channel.name}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {selectedFile && (
          <div className="selected-file">
            <span>{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)}>
              <X size={13} />
            </button>
          </div>
        )}

        <div className="figma-composer-bottom">
          <div className="figma-composer-tools">
            <button
              type="button"
              aria-label="Upload file"
              onClick={() => fileInputRef.current.click()}
            >
              <PlusCircle size={16} />
            </button>

            <div className="emoji-picker-wrap">
              <button
                type="button"
                aria-label="Choose emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={16} />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Mention teammate"
              onClick={insertMention}
            >
              <AtSign size={16} />
            </button>
          </div>

          <span>Press Enter to send, Shift+Enter for newline</span>

          <button className="figma-send-btn" aria-label="Send message">
            <Send size={17} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
      </form>
    </section>
  );
}

function ChannelIntro({ channel }) {
  return (
    <div className="channel-welcome">
      <div className="hash-large">#</div>

      <h2>Welcome to #{channel.name}!</h2>

      <p>
        This is the start of the #{channel.name} channel. Use this space for
        essential updates, company-wide broadcasts, and team-wide conversation.
      </p>
    </div>
  );
}

function EmptyChannel({ channel }) {
  return (
    <div className="empty-channel-state">
      <div className="hash-large active-hash">
        #
        <span></span>
      </div>

      <h2>This is the start of the #{channel.name} channel</h2>

      <p>
        This channel was created recently. Send the first message below to kick
        off the conversation with your team.
      </p>

      <div className="empty-channel-cards">
        <article>
          <div>
            <Hash size={15} />
          </div>
          <strong>Welcome the team</strong>
          <span>
            Broadcast a kickoff post and set clear communication expectations.
          </span>
        </article>

        <article>
          <div>
            <Pin size={15} />
          </div>
          <strong>Pin guidelines</strong>
          <span>
            Pin posting etiquette, notification rules, and leadership contacts.
          </span>
        </article>
      </div>

      <div className="today-line empty-today">
        <span>Today</span>
      </div>
    </div>
  );
}

export default ChannelView;