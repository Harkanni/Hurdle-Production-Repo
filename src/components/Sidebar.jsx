import { Hash, LogOut, Plus, Search, Settings } from "lucide-react";
import Logo from "./Logo";

function Sidebar({
  channels,
  activeChannel,
  view,
  setView,
  setActiveChannel,
  onCreate,
  onLogout,
}) {
  const joinedChannels = channels.filter((channel) => channel.joined);

  return (
    <aside className="figma-sidebar">
      <div className="figma-sidebar-logo">
        <Logo small />
      </div>

      <button
        className="figma-workspace-card"
        onClick={() => {
          setActiveChannel(null);
          setView("home");
        }}
      >
        <div className="figma-workspace-icon">⌘</div>

        <div>
          <strong>Workspace</strong>
          <span>
            {joinedChannels.length === 0
              ? "Huddle Team"
              : `${joinedChannels.length * 4} online`}
          </span>
        </div>

        <small>⌄</small>
      </button>

      {joinedChannels.length > 0 && (
        <div className="figma-jump-search">
          <Search size={13} />
          <input placeholder="Jump to channel..." />
          <kbd>⌘K</kbd>
        </div>
      )}

      <div className="figma-side-heading">
        <span>CHANNELS</span>
        <button type="button" onClick={onCreate}>
          <Plus size={13} />
        </button>
      </div>

      {joinedChannels.length === 0 ? (
        <div className="no-joined-card">
          <span>No channels joined yet</span>
          <button type="button" onClick={() => setView("directory")}>
            Browse directory
          </button>
        </div>
      ) : (
        <nav className="figma-channel-list">
          {joinedChannels.map((channel) => (
            <button
              key={channel.id}
              className={
                activeChannel?.id === channel.id && view === "channel"
                  ? "figma-channel active"
                  : "figma-channel"
              }
              onClick={() => {
                setActiveChannel(channel);
                setView("channel");
              }}
            >
              <Hash size={12} />
              {channel.name}
              {activeChannel?.id === channel.id && view === "channel" && <i />}
            </button>
          ))}
        </nav>
      )}

      {joinedChannels.length > 0 && (
        <div className="figma-explore">
          <span>EXPLORE</span>

          <button
            className={view === "directory" ? "active" : ""}
            onClick={() => setView("directory")}
          >
            <Search size={12} />
            Channel Directory
          </button>
        </div>
      )}

      <UserBar onLogout={onLogout} />
    </aside>
  );
}

export function UserBar({ onLogout }) {
  return (
    <div className="figma-side-user">
      <img
        className="figma-user-avatar"
        src="/images/mike.png"
        alt="Mike profile"
      />

      <div>
        <strong>Mike</strong>
        <span>Online</span>
      </div>

      <button type="button" aria-label="Settings">
        <Settings size={13} />
      </button>

      <button type="button" onClick={onLogout} aria-label="Sign out">
        <LogOut size={13} />
      </button>
    </div>
  );
}

export default Sidebar;