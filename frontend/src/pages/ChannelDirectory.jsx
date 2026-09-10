import { Check, ChevronDown, Hash, Plus, Search } from "lucide-react";

function ChannelDirectory({ channels, onJoin, onOpen, onCreate }) {
  return (
    <section className="figma-directory">
      <div className="directory-panel">
        <header className="directory-top">
          <div>
            <p>WORKSPACE MANAGEMENT • Active Workspace</p>
            <h1>Channel Directory</h1>
            <span>Discover, join, or create channels for team communication.</span>
          </div>

          <div className="directory-tools">
            <label>
              <Search size={12} />
              <input placeholder="Search channels by name..." />
            </label>

            <button className="primary-btn compact-action" onClick={onCreate}>
              <Plus size={12} />
              Create Channel
            </button>
          </div>
        </header>

        <div className="directory-sub">
          <strong>Available Channel ({channels.length})</strong>
          <button>
            sort by: <b>Most active</b>
            <ChevronDown size={13} />
          </button>
        </div>

        <div className="directory-list">
          {channels.map((channel) => (
            <article key={channel.id} className="directory-row">
              <div className="directory-hash">
                <Hash size={15} />
              </div>

              <div>
                <h3>
                  {channel.name}
                  {channel.badge && <span>{channel.badge}</span>}
                </h3>
                <p>{channel.description}</p>
                <small>
                  {channel.members} Members
                  {channel.updated && <> • {channel.updated}</>}
                </small>
              </div>

              {channel.joined ? (
                <button className="joined-btn" onClick={() => onOpen(channel)}>
                  <Check size={12} />
                  Join
                </button>
              ) : (
                <button className="plain-join-btn" onClick={() => onJoin(channel.id)}>
                  Join
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ChannelDirectory;