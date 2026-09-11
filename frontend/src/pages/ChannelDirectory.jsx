import { useState } from "react";
import { Check, ChevronDown, Hash, Plus, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";

function ChannelDirectory() {
  const { channels, joinChannel, openChannel, onCreate } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

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
              <input
                placeholder="Search channels by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>

            <button className="primary-btn compact-action" onClick={onCreate}>
              <Plus size={12} />
              Create Channel
            </button>
          </div>
        </header>

        <div className="directory-sub">
          <strong>Available Channels ({filteredChannels.length})</strong>
          <button>
            sort by: <b>Most active</b>
            <ChevronDown size={13} />
          </button>
        </div>

        <div className="directory-list">
          {filteredChannels.length === 0 ? (
            <div className="no-joined-card">
              <span>No channels match "{searchTerm}"</span>
              <button type="button" onClick={() => setSearchTerm("")}>
                Clear search
              </button>
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <article key={channel.id} className="directory-row">
                <div className="directory-hash">
                  <Hash size={15} />
                </div>

                <div>
                  <h3>
                    {channel.name}
                    {channel.isMember && <span>Joined</span>}
                  </h3>
                  <p>{channel.description}</p>
                  <small>{channel.memberCount} Members</small>
                </div>

                {channel.isMember ? (
                  <button className="joined-btn" onClick={() => openChannel(channel)}>
                    <Check size={12} />
                    Open
                  </button>
                ) : (
                  <button className="plain-join-btn" onClick={() => joinChannel(channel.id)}>
                    Join
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ChannelDirectory;