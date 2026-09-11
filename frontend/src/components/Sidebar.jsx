import { Hash, LogOut, Plus, Search, Settings } from "lucide-react";
import Logo from "./Logo";

function Sidebar({
  channels,
  activeChannelId,
  view,
  onNavigateHome,
  onNavigateDirectory,
  onNavigateDMs,
  onNavigateProfile,
  onOpenChannel,
  searchTerm,
  setSearchTerm,
  onJoin,
  onCreate,
  onLogout,
}) {
  const isSearching = searchTerm.trim().length > 0;
  const joinedChannels = channels.filter((channel) => channel.isMember);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

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

      <button className="figma-workspace-card" type="button" onClick={onNavigateHome}>
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
                    activeChannelId === channel.id && view === "channel"
                      ? "figma-channel active"
                      : "figma-channel"
                  }
                  onClick={() => {
                    if (channel.isMember) {
                      onOpenChannel(channel);
                    }
                  }}
                >
                  <Hash size={12} />
                  {channel.name}
                  {!channel.isMember && <small>Join first</small>}
                </button>

                {!channel.isMember && (
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
          <button type="button" onClick={onNavigateDirectory}>
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
                activeChannelId === channel.id && view === "channel"
                  ? "figma-channel active"
                  : "figma-channel"
              }
              onClick={() => onOpenChannel(channel)}
            >
              <Hash size={12} />
              {channel.name}
              {activeChannelId === channel.id && view === "channel" && <i />}
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
            onClick={onNavigateDirectory}
          >
            <Search size={12} />
            Channel Directory
          </button>
        </div>
      )}

      <UserBar onLogout={onLogout} user={currentUser} />
    </aside>
  );
}

export function UserBar({ onLogout, user }) {
  return (
    <div className="figma-side-user">
      <img className="figma-user-avatar" src="/images/mike.png" alt="Profile" />

      <div>
        <strong>{user?.displayName || "Me"}</strong>
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