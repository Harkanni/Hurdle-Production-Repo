import { useEffect, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
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
import { apiFetch } from "../lib/apiFetch";

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
  "😎",
  "😅",
  "🙏",
  "🎉",
  "❤️",
  "💡",
  "📎",
  "⭐",
];

const currentUser = JSON.parse(localStorage.getItem("user") || "null");

// Adapts a backend message object into the shape MessageItem expects.
// Field names here are best-guess pending the real Message schema —
// see flagged assumptions in chat.
function mapMessage(msg) {
  const id = String(msg.id || msg._id);
  const senderId = String(
    msg.senderId || msg.sender?.id || msg.sender?._id || "",
  );
  const isMine = currentUser && senderId === String(currentUser.id);

  const senderName = isMine
    ? currentUser.displayName
    : msg.sender?.displayName || msg.senderName || "Unknown";

  return {
    id,
    channelId: msg.channelId,
    sender: senderName,
    initials: senderName.slice(0, 1).toUpperCase(),
    text: msg.content,
    fileName: msg.fileName || "",
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Just now",
    mine: isMine,
    status: "sent",
  };
}

function ChannelView() {
  const { channelId } = useParams();
  const { channels, socket } = useOutletContext();
  const channel = channels.find((c) => c.id === channelId);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load message history for this channel
  useEffect(() => {
    setLoadingMessages(true);
    apiFetch(`/api/channels/${channelId}/messages`)
      .then((data) => {
        // Handles either a bare array or an enveloped { messages, nextCursor } shape.
        // Confirm the real envelope once the Messages controller is shared.
        const list = Array.isArray(data) ? data : data.messages || [];
        setMessages(list.map(mapMessage));
      })
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoadingMessages(false));
  }, [channelId]);

  // Join the socket room for this channel, listen for live events
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_channel", { channelId });

    function onNewMessage(raw) {
      if (raw.channelId !== channelId) return;
      const mapped = mapMessage(raw);

      setMessages((prev) => {
        // Already have this exact real id? Skip.
        if (prev.some((m) => m.id === mapped.id)) return prev;

        // Is there a pending optimistic message (still "temp-...") from us,
        // with the same text, waiting to be reconciled? If so, replace it
        // instead of appending a second copy.
        const pendingIndex = prev.findIndex(
          (m) => m.id.startsWith("temp-") && m.mine && m.text === mapped.text,
        );

        if (pendingIndex !== -1) {
          const next = [...prev];
          next[pendingIndex] = mapped;
          return next;
        }

        return [...prev, mapped];
      });
    }

    function onMessageDeleted({ messageId, channelId: c }) {
      if (c !== channelId) return;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }

    socket.on("new_message", onNewMessage);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("error", (err) => console.error("Socket error:", err.message));

    return () => {
      socket.emit("leave_channel", { channelId });
      socket.off("new_message", onNewMessage);
      socket.off("message_deleted", onMessageDeleted);
    };
  }, [socket, channelId]);

  function getPlainMessage() {
    return messageInputRef.current?.innerText.trim() || "";
  }

  function getRichMessage() {
    return messageInputRef.current?.innerHTML || "";
  }

  function focusMessageInput() {
    messageInputRef.current?.focus();
  }

  function runFormat(command) {
    messageInputRef.current?.focus();
    document.execCommand(command, false, null);
    setMessage(getRichMessage());
  }

  function insertTextAtCursor(text) {
    const editor = messageInputRef.current;
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editor.append(text);
      setMessage(getRichMessage());
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      editor.append(text);
      setMessage(getRichMessage());
      return;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    setMessage(getRichMessage());
  }

  function insertCode() {
    messageInputRef.current?.focus();
    document.execCommand("insertHTML", false, "<code>code</code>");
    setMessage(getRichMessage());
  }

  function clearComposer() {
    setMessage("");
    if (messageInputRef.current) {
      messageInputRef.current.innerHTML = "";
    }
  }

  async function handleSend(e) {
    e.preventDefault();

    const plainMessage = getPlainMessage();
    const richMessage = getRichMessage();

    if (!plainMessage && !selectedFile) return;

    // NOTE: file attachment is not yet wired to any backend endpoint —
    // there's no documented upload route. Sending text only for now;
    // flag to BE if file/image messages are in scope.
    if (selectedFile) {
      console.warn(
        "File attachment selected but no backend upload endpoint is wired yet.",
      );
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      channelId,
      sender: currentUser?.displayName || "Me",
      initials: (currentUser?.displayName || "M").slice(0, 1).toUpperCase(),
      text: richMessage,
      fileName: selectedFile?.name || "",
      time: "Just now",
      mine: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    clearComposer();
    setSelectedFile(null);
    setShowEmojiPicker(false);

    try {
      const created = await apiFetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: plainMessage }),
      });

      const mapped = mapMessage(created);

      setMessages((prev) => {
        // If the socket echo already replaced our temp message (arrived first),
        // the tempId is gone and the real id is already present — don't add again.
        if (prev.some((m) => m.id === mapped.id)) return prev;

        // Otherwise, replace our temp entry with the confirmed real message.
        return prev.map((m) => (m.id === tempId ? mapped : m));
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    }
  }

  function handleComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  async function retryMessage(id) {
    const failed = messages.find((m) => m.id === id);
    if (!failed) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "sending" } : m)),
    );

    try {
      const created = await apiFetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: failed.text }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? mapMessage(created) : m)),
      );
    } catch (err) {
      console.error("Retry failed:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "failed" } : m)),
      );
    }
  }

  function addEmoji(emoji) {
    insertTextAtCursor(emoji);
    setShowEmojiPicker(false);
  }

  function insertMention() {
    insertTextAtCursor("@");
  }

  if (!channel) return <div>Channel not found</div>;
  if (loadingMessages) return <div>Loading messages...</div>;

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
          {channel.memberCount} members
        </div>
      </div>

      <div className="chat-content">
        {messages.length === 0 ? (
          <EmptyChannel channel={channel} />
        ) : (
          <>
            <ChannelIntro channel={channel} />

            <div className="today-line">
              <span>Today</span>
            </div>

            <div className="message-list">
              {messages.map((item) => (
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
          <button
            type="button"
            aria-label="Bold"
            onClick={() => runFormat("bold")}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            aria-label="Italic"
            onClick={() => runFormat("italic")}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            aria-label="List"
            onClick={() => runFormat("insertUnorderedList")}
          >
            <List size={14} />
          </button>
          <button type="button" aria-label="Code" onClick={insertCode}>
            <Code size={14} />
          </button>
        </div>

        <div
          ref={messageInputRef}
          className="figma-composer-message rich-message-box"
          contentEditable
          data-placeholder={`Message #${channel.name}...`}
          onInput={() => setMessage(getRichMessage())}
          onFocus={() => setShowEmojiPicker(false)}
          onKeyDown={handleComposerKeyDown}
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowEmojiPicker((current) => !current);
                  focusMessageInput();
                }}
              >
                <Smile size={16} />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addEmoji(emoji);
                      }}
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
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention();
              }}
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
        #<span></span>
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
