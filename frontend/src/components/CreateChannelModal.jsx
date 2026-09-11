import { useState } from "react";
import { AlertCircle, Hash, X } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";

function CreateChannelModal({ setChannels, setShowCreateModal, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const cleanName = form.name.trim().toLowerCase().replace(/\s+/g, "-");

    if (!cleanName) {
      setError("Channel name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const newChannel = await apiFetch("/api/channels", {
        method: "POST",
        body: JSON.stringify({
          name: cleanName,
          description: form.description || undefined,
        }),
      });

      // Backend already adds the creator as a member, so mark isMember
      // locally to match what a fresh GET /channels would return.
      setChannels((prev) => [...prev, { ...newChannel, isMember: true }]);
      setShowCreateModal(false);
      onCreated(newChannel);
    } catch (err) {
      if (err.message?.includes("409")) {
        setError("A channel with this name already exists.");
      } else {
        setError("Failed to create channel. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
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

          <button className="primary-btn compact" disabled={submitting}>
            {submitting ? "Creating..." : "Create Channel"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateChannelModal;