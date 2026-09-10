import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import ChannelDirectory from "./ChannelDirectory";
import ChannelView from "./ChannelView";
import CreateChannelModal from "../components/CreateChannelModal";
import DMView from "./DMView";
import ProfileView from "./ProfileView";

function Workspace({
  channels,
  setChannels,
  activeChannel,
  setActiveChannel,
  messages,
  setMessages,
}) {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileAside, setShowMobileAside] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  const joinedChannels = channels.filter((channel) => channel.joined);

  function requestLogout() {
    setShowSignOut(true);
  }

  function confirmLogout() {
    setShowSignOut(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function openChannel(channel) {
    setActiveChannel(channel);
    setView("channel");
    setSearchTerm("");
    setShowMobileAside(false);
  }

  function joinChannel(channelId) {
    const updatedChannels = channels.map((channel) =>
      channel.id === channelId ? { ...channel, joined: true } : channel,
    );

    const selectedChannel = updatedChannels.find(
      (channel) => channel.id === channelId,
    );

    setChannels(updatedChannels);
    setActiveChannel(selectedChannel);
    setView("channel");
    setSearchTerm("");
    setShowMobileAside(false);
  }

  return (
    <div className="figma-shell">
      <Sidebar
        channels={filteredChannels}
        activeChannel={activeChannel}
        view={view}
        setView={setView}
        setActiveChannel={setActiveChannel}
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
          setActiveChannel={setActiveChannel}
          setView={setView}
        />

        {view === "directory" ? (
          <ChannelDirectory
            channels={channels}
            onJoin={joinChannel}
            onOpen={openChannel}
            onCreate={() => setShowCreateModal(true)}
          />
        ) : view === "dms" ? (
          <DMView />
        ) : view === "profile" ? (
          <ProfileView onLogout={requestLogout} />
        ) : activeChannel ? (
          <ChannelView
            channel={activeChannel}
            messages={messages}
            setMessages={setMessages}
          />
        ) : joinedChannels.length === 0 ? (
          <NoChannelsJoined
            channels={channels}
            onJoin={joinChannel}
            onBrowse={() => setView("directory")}
            onCreate={() => setShowCreateModal(true)}
          />
        ) : (
          <NoChannelSelected onBrowse={() => setView("directory")} />
        )}

        <MobileBottomNav
          view={view}
          setView={setView}
          setActiveChannel={setActiveChannel}
          setSearchTerm={setSearchTerm}
        />
      </main>

      {showMobileAside && (
        <MobileAside
          channels={filteredChannels}
          activeChannel={activeChannel}
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
        <SignOutModal
          onCancel={() => setShowSignOut(false)}
          onConfirm={confirmLogout}
        />
      )}

      {showCreateModal && (
        <CreateChannelModal
          channels={channels}
          setChannels={setChannels}
          setActiveChannel={setActiveChannel}
          setShowCreateModal={setShowCreateModal}
          setView={setView}
        />
      )}
    </div>
  );
}

function MobileTopControls({
  view,
  setShowMobileAside,
  setActiveChannel,
  setView,
}) {
  return (
    <button
      type="button"
      className="mobile-menu-button"
      onClick={() => {
        if (view === "home") {
          setShowMobileAside(true);
        } else {
          setActiveChannel(null);
          setView("home");
        }
      }}
    >
      {view === "home" ? <Menu size={16} /> : "<"}
    </button>
  );
}

function MobileAside({
  channels,
  activeChannel,
  openChannel,
  onJoin,
  searchTerm,
  setSearchTerm,
  onCreate,
  onClose,
  onLogout,
}) {
  const isSearching = searchTerm.trim().length > 0;

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
        <img src="/images/mike.png" alt="Mike profile" />
        <div>
          <strong>Mike</strong>
          <span>mike@gmail.com</span>
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
                  activeChannel?.id === channel.id
                    ? "figma-channel active"
                    : "figma-channel"
                }
                onClick={() => {
                  if (channel.joined) {
                    openChannel(channel);
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
  return (
    <div className="signout-overlay">
      <section className="signout-modal">
        <div className="signout-icon">
          <LogOut size={18} />
        </div>

        <h2>Sign out of Huddle?</h2>

        <p>
          You are signed in as Mike. You will need to enter your credentials to
          access your workspace again.
        </p>

        <div className="signout-user">
          <img src="/images/mike.png" alt="Mike profile" />
          <div>
            <strong>Mike</strong>
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
    (channel) => channel.name === "general" || channel.name === "announcements",
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

            <small>2 suggestions</small>
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

function MobileBottomNav({ view, setView, setActiveChannel, setSearchTerm }) {
  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={view === "home" ? "active" : ""}
        onClick={() => {
          setActiveChannel(null);
          setSearchTerm("");
          setView("home");
        }}
      >
        <Home size={16} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={view === "directory" || view === "channel" ? "active" : ""}
        onClick={() => {
          setSearchTerm("");
          setView("directory");
        }}
      >
        <Hash size={16} />
        <span>Channel</span>
      </button>

      <button
        type="button"
        className={view === "dms" ? "active" : ""}
        onClick={() => {
          setActiveChannel(null);
          setSearchTerm("");
          setView("dms");
        }}
      >
        <MessageCircle size={16} />
        <span>DMs</span>
      </button>

      <button
        type="button"
        className={view === "profile" ? "active" : ""}
        onClick={() => {
          setActiveChannel(null);
          setSearchTerm("");
          setView("profile");
        }}
      >
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
