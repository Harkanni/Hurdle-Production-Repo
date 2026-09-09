import { Hash, LogOut, Plus, Search, Settings } from "lucide-react";
import Logo from "./Logo";

function Sidebar({
  channels,
  activeChannel,
  view,
  setView,
  setActiveChannel,
  searchTerm,
  setSearchTerm,
  onJoin,
  onCreate,
  onLogout,
}) {
  const isSearching = searchTerm.trim().length > 0;
  const joinedChannels = channels.filter((channel) => channel.joined);

  function openJoinedChannel(channel) {
    setActiveChannel(channel);
    setSearchTerm("");
    setView("channel");
  }

  function handleJoinChannel(e, channelId) {
    e.preventDefault();
    e.stopPropagation();

    if (onJoin) {
      onJoin(channelId);
    }
  }

  return (
    <aside className="figma-sidebar">
      <div className="figma-sidebar-logo">
        <Logo small />
      </div>

      <button
        className="figma-workspace-card"
        type="button"
        onClick={() => {
          setActiveChannel(null);
          setSearchTerm("");
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

      <div className="figma-jump-search">
        <Search size={13} />
        <input
          type="text"
          placeholder="Jump to channel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <kbd>⌘K</kbd>
      </div>

      <div className="figma-side-heading">
        <span>{isSearching ? "SEARCH RESULTS" : "CHANNELS"}</span>
        <button type="button" onClick={onCreate}>
          <Plus size={13} />
        </button>
      </div>

      {isSearching ? (
        channels.length === 0 ? (
          <div className="no-joined-card">
            <span>This channel does not exist</span>
            <button type="button" onClick={() => setSearchTerm("")}>
              Clear search
            </button>
          </div>
        ) : (
          <nav className="figma-channel-list">
            {channels.map((channel) => (
              <div key={channel.id} className="figma-search-channel">
                <button
                  type="button"
                  className={
                    activeChannel?.id === channel.id && view === "channel"
                      ? "figma-channel active"
                      : "figma-channel"
                  }
                  onClick={() => {
                    if (channel.joined) {
                      openJoinedChannel(channel);
                    }
                  }}
                >
                  <Hash size={12} />
                  {channel.name}
                  {!channel.joined && <small>Join first</small>}
                </button>

                {!channel.joined && (
                  <button
                    type="button"
                    className="sidebar-join-btn"
                    onClick={(e) => handleJoinChannel(e, channel.id)}
                  >
                    Join
                  </button>
                )}
              </div>
            ))}
          </nav>
        )
      ) : joinedChannels.length === 0 ? (
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
              type="button"
              className={
                activeChannel?.id === channel.id && view === "channel"
                  ? "figma-channel active"
                  : "figma-channel"
              }
              onClick={() => openJoinedChannel(channel)}
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
            type="button"
            className={view === "directory" ? "active" : ""}
            onClick={() => {
              setSearchTerm("");
              setView("directory");
            }}
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