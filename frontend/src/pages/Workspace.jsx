import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Hash,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import CreateChannelModal from "../components/CreateChannelModal";
import { apiFetch } from "../lib/apiFetch";
import { getSocket, resetSocket } from "../lib/socket";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Workspace() {
  const navigate = useNavigate();
  const location = useLocation();

  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileAside, setShowMobileAside] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    apiFetch("/api/channels")
      .then(setChannels)
      .catch((err) => console.error("Failed to load channels:", err))
      .finally(() => setLoadingChannels(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const s = getSocket(token);
    s.connect();
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const view = location.pathname.includes("/directory")
    ? "directory"
    : location.pathname.includes("/dms")
    ? "dms"
    : location.pathname.includes("/profile")
    ? "profile"
    : location.pathname.includes("/channel/")
    ? "channel"
    : "home";

  const activeChannelId = location.pathname.includes("/channel/")
    ? location.pathname.split("/channel/")[1]
    : null;

  function requestLogout() {
    setShowSignOut(true);
  }

  function confirmLogout() {
    setShowSignOut(false);
    resetSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function openChannel(channel) {
    setSearchTerm("");
    setShowMobileAside(false);
    navigate(`/workspace/channel/${channel.id}`);
  }

  async function joinChannel(channelId) {
    try {
      await apiFetch(`/api/channels/${channelId}/join`, { method: "POST" });
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, isMember: true } : c))
      );
      navigate(`/workspace/channel/${channelId}`);
    } catch (err) {
      console.error("Failed to join channel:", err);
    }
  }

  const joinedChannels = channels.filter((c) => c.isMember);

  if (loadingChannels) {
    return <div className="workspace-loading">Loading workspace...</div>;
  }

  return (
    <div className="figma-shell">
      <Sidebar
        channels={filteredChannels}
        activeChannelId={activeChannelId}
        view={view}
        onNavigateHome={() => navigate("/workspace")}
        onNavigateDirectory={() => navigate("/workspace/directory")}
        onNavigateDMs={() => navigate("/workspace/dms")}
        onNavigateProfile={() => navigate("/workspace/profile")}
        onOpenChannel={openChannel}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onJoin={joinChannel}
        onCreate={() => setShowCreateModal(true)}
        onLogout={requestLogout}
      />

      <main className="figma-main">
        <MobileTopControls
          view={view}
          setShowMobileAside={setShowMobileAside}
          onBack={() => navigate("/workspace")}
        />

        {view === "home" && joinedChannels.length === 0 ? (
          <NoChannelsJoined
            channels={channels}
            onJoin={joinChannel}
            onBrowse={() => navigate("/workspace/directory")}
            onCreate={() => setShowCreateModal(true)}
          />
        ) : view === "home" ? (
          <NoChannelSelected onBrowse={() => navigate("/workspace/directory")} />
        ) : (
          <Outlet context={{ channels, joinChannel, openChannel, socket, setChannels, onCreate: () => setShowCreateModal(true), }} />
        )}

        <MobileBottomNav
          view={view}
          onHome={() => navigate("/workspace")}
          onDirectory={() => navigate("/workspace/directory")}
          onDMs={() => navigate("/workspace/dms")}
          onProfile={() => navigate("/workspace/profile")}
        />
      </main>

      {showMobileAside && (
        <MobileAside
          channels={filteredChannels}
          activeChannelId={activeChannelId}
          openChannel={openChannel}
          onJoin={joinChannel}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreate={() => setShowCreateModal(true)}
          onClose={() => setShowMobileAside(false)}
          onLogout={requestLogout}
        />
      )}

      {showSignOut && (
        <SignOutModal onCancel={() => setShowSignOut(false)} onConfirm={confirmLogout} />
      )}

      {showCreateModal && (
        <CreateChannelModal
          setChannels={setChannels}
          setShowCreateModal={setShowCreateModal}
          onCreated={(newChannel) => navigate(`/workspace/channel/${newChannel.id}`)}
        />
      )}
    </div>
  );
}

function MobileTopControls({ view, setShowMobileAside, onBack }) {
  return (
    <button
      type="button"
      className="mobile-menu-button"
      onClick={() => {
        if (view === "home") {
          setShowMobileAside(true);
        } else {
          onBack();
        }
      }}
    >
      {view === "home" ? <Menu size={16} /> : "<"}
    </button>
  );
}

function MobileAside({
  channels,
  activeChannelId,
  openChannel,
  onJoin,
  searchTerm,
  setSearchTerm,
  onCreate,
  onClose,
  onLogout,
}) {
  const isSearching = searchTerm.trim().length > 0;
  const currentUser = useCurrentUser();

  return (
    <aside className="mobile-aside-panel">
      <div className="mobile-aside-head">
        <LogoMark />
        <strong>Huddle</strong>
        <button type="button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="mobile-profile-row">
        <img src="/images/mike.png" alt="Profile" />
        <div>
          <strong>{currentUser?.displayName || "Me"}</strong>
          <span>{currentUser?.email || ""}</span>
        </div>
        <span>{">"}</span>
      </div>

      <div className="figma-search">
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

      <nav className="figma-channel-list">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div key={channel.id} className="figma-search-channel">
              <button
                type="button"
                className={
                  activeChannelId === channel.id
                    ? "figma-channel active"
                    : "figma-channel"
                }
                onClick={() => {
                  if (channel.isMember) {
                    openChannel(channel);
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onJoin(channel.id);
                  }}
                >
                  Join
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-joined-card">
            <span>This channel does not exist</span>
            <button type="button" onClick={() => setSearchTerm("")}>
              Clear search
            </button>
          </div>
        )}
      </nav>

      <div className="mobile-aside-footer">
        <button type="button">
          <Settings size={14} />
          Settings
        </button>

        <button type="button" onClick={onLogout}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function SignOutModal({ onCancel, onConfirm }) {
  const currentUser = useCurrentUser();

  return (
    <div className="signout-overlay">
      <section className="signout-modal">
        <div className="signout-icon">
          <LogOut size={18} />
        </div>

        <h2>Sign out of Huddle?</h2>

        <p>
          You are signed in as {currentUser?.displayName || "user"}. You will
          need to enter your credentials to access your workspace again.
        </p>

        <div className="signout-user">
          <img src="/images/mike.png" alt="Profile" />
          <div>
            <strong>{currentUser?.displayName || "Me"}</strong>
            <span>Huddle Workspace • Active</span>
          </div>
        </div>

        <div className="signout-actions">
          <button type="button" className="soft-btn" onClick={onCancel}>
            Cancel
          </button>

          <button type="button" className="danger-btn" onClick={onConfirm}>
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

function NoChannelsJoined({ channels, onJoin, onBrowse, onCreate }) {
  const recommended = channels.filter(
    (channel) => channel.name === "general" || channel.name === "announcements"
  );

  return (
    <section className="figma-welcome-page">
      <header className="mini-topbar">
        <MessageSquare size={13} />
        <span>Workspace</span>
      </header>

      <div className="welcome-center">
        <div className="welcome-icon">
          <MessageSquare size={35} />
          <i></i>
        </div>

        <h1>Welcome to Huddle!</h1>

        <p>
          Huddle is lightweight team messaging for modern teams. You aren&apos;t
          in any channels yet. Get started by joining existing channels below or
          exploring the directory.
        </p>

        <div className="welcome-actions">
          <button className="primary-btn compact-action" onClick={onBrowse}>
            Browse Channel Directory
          </button>

          <button className="soft-btn compact-action" onClick={onCreate}>
            <Plus size={12} />
            Create New Channel
          </button>
        </div>

        <div className="recommended-card">
          <div className="recommended-head">
            <div>
              <strong>Recommended Channels</strong>
              <span>Recommended default channels for every team member</span>
            </div>

            <small>{recommended.length} suggestions</small>
          </div>

          {recommended.map((channel) => (
            <article key={channel.id}>
              <div className="rec-icon">
                <Hash size={15} />
              </div>

              <div>
                <h3>
                  {channel.name}
                  <span>
                    {channel.name === "general" ? "Default" : "Broadcast"}
                  </span>
                </h3>

                <p>{channel.description}</p>
              </div>

              <button type="button" onClick={() => onJoin(channel.id)}>
                Join Channel
              </button>
            </article>
          ))}
        </div>

        <div className="workspace-footer">
          <span>
            Keyboard shortcuts: <b>Ctrl + K</b>
          </span>
          <span>•</span>
          <span>Help & Support</span>
          <span>•</span>
          <span>Privacy</span>
        </div>
      </div>
    </section>
  );
}

function NoChannelSelected({ onBrowse }) {
  return (
    <section className="no-channel-page">
      <header className="no-channel-top">
        <Hash size={13} />
        <strong>No Channel Selected</strong>
        <span>• Select a conversation to start</span>
      </header>

      <div className="no-channel-center">
        <div className="huddle-empty-logo">H</div>

        <h1>Select a channel to start messaging</h1>

        <p>
          Choose a conversation from the sidebar on the left, or explore
          available channels in the directory.
        </p>

        <button className="primary-btn compact-action" onClick={onBrowse}>
          <Search size={12} />
          Browse Channel Directory
        </button>

        <div className="tip-pill">
          Tip: Press <strong>Ctrl + K</strong> to quickly jump anywhere
        </div>

        <div className="mini-footer">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>System Status</span>
        </div>
      </div>
    </section>
  );
}

function MobileBottomNav({ view, onHome, onDirectory, onDMs, onProfile }) {
  return (
    <nav className="mobile-bottom-nav">
      <button type="button" className={view === "home" ? "active" : ""} onClick={onHome}>
        <Home size={16} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={view === "directory" || view === "channel" ? "active" : ""}
        onClick={onDirectory}
      >
        <Hash size={16} />
        <span>Channel</span>
      </button>

      <button type="button" className={view === "dms" ? "active" : ""} onClick={onDMs}>
        <MessageCircle size={16} />
        <span>DMs</span>
      </button>

      <button type="button" className={view === "profile" ? "active" : ""} onClick={onProfile}>
        <UserCircle size={16} />
        <span>Profile</span>
      </button>
    </nav>
  );
}

function LogoMark() {
  return <img src="/images/huddle-logo.png" alt="Huddle logo" />;
}

export default Workspace;