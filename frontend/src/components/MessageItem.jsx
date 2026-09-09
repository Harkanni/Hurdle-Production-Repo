import { AlertTriangle, Loader2, X } from "lucide-react";

function MessageItem({ message, onRetry }) {
  return (
    <article
      className={
        message.status === "failed"
          ? "message-item failed-message"
          : message.status === "sending"
          ? "message-item sending-message"
          : message.mine
          ? "message-item mine"
          : "message-item"
      }
    >
      <div className="message-avatar">{message.initials}</div>

      <div className="message-content">
        <div className="message-meta">
          <strong>{message.sender}</strong>

          {message.mine && <span>(You)</span>}

          <time>{message.time}</time>

          {message.status === "sending" && (
            <em className="sending-label">
              <Loader2 className="spin" size={12} />
              Sending...
            </em>
          )}

          {message.status === "failed" && (
            <em className="failed-label">Sending failed</em>
          )}
        </div>

        <p>{message.text}</p>

        {message.fileName && (
          <div className="message-file">Attached file: {message.fileName}</div>
        )}

        {message.status === "failed" && (
          <div className="message-error">
            <AlertTriangle size={13} />
            Message failed to send

            <button type="button" onClick={() => onRetry(message.id)}>
              Retry
            </button>

            <X size={12} />
          </div>
        )}
      </div>
    </article>
  );
}

export default MessageItem;