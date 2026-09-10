import { useState } from "react";
import { AlertCircle, Hash, X } from "lucide-react";

function CreateChannelModal({
  channels,
  setChannels,
  setActiveChannel,
  setShowCreateModal,
  setView,
}) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  function handleCreate(e) {
    e.preventDefault();

    const cleanName = form.name.trim().toLowerCase().replace(/\s+/g, "-");

    if (!cleanName) {
      setError("Channel name is required.");
      return;
    }

    const exists = channels.some((channel) => channel.name === cleanName);

    if (exists) {
      setError("A channel with this name already exists.");
      return;
    }

    const newChannel = {
      id: Date.now(),
      name: cleanName,
      description: form.description || "New team conversation space.",
      joined: true,
      members: 1,
      badge: "Joined",
    };

    setChannels([...channels, newChannel]);
    setActiveChannel(newChannel);
    setShowCreateModal(false);
    setView("channel");
  }

  return (
    <div className="modal-overlay">
      <form className="create-modal" onSubmit={handleCreate}>
        <div className="modal-head">
          <div>
            <h2>Create a channel</h2>
            <p>Channels are where your team communicates on a topic.</p>
          </div>

          <button type="button" onClick={() => setShowCreateModal(false)}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <AlertCircle size={16} />
            <div>
              <strong>{error}</strong>
              <span>Please choose a distinct name or view the existing channel in the directory.</span>
            </div>
          </div>
        )}

        <label className={error ? "modal-field danger" : "modal-field"}>
          <div>
            <span>Channel Name</span>
            {error && <em>Already in use</em>}
          </div>

          <div className="modal-input">
            <Hash size={14} />
            <input
              placeholder="e.g. feedback"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setError("");
              }}
            />
          </div>

          <small>Names must be lowercase, without spaces or periods.</small>
        </label>

        <label className="modal-field">
          <div>
            <span>Description</span>
            <em>OPTIONAL</em>
          </div>

          <textarea
            placeholder="What is this channel about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="text-btn"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </button>

          <button className="primary-btn compact">Create Channel</button>
        </div>
      </form>
    </div>
  );
}

export default CreateChannelModal;