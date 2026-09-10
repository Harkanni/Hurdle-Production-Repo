import { Bell, LogOut, Mail, UserCircle } from "lucide-react";

function ProfileView({ onLogout }) {
  return (
    <section className="profile-view">
      <div className="profile-panel">
        <div className="profile-avatar-large">
          <img src="/images/mike.png" alt="Mike profile" />
        </div>

        <h1>
          <UserCircle size={22} />
          User Profile
        </h1>

        <p>Manage your Huddle workspace identity and notification settings.</p>

        <div className="profile-card">
          <div className="profile-card-header">
            <strong>Account Details</strong>
            <span>Personal workspace information</span>
          </div>

          <div className="profile-info-row">
            <UserCircle size={16} />
            <div>
              <span>Name</span>
              <strong>Mike Jenkins</strong>
            </div>
          </div>

          <div className="profile-info-row">
            <Mail size={16} />
            <div>
              <span>Email</span>
              <strong>mike@gmail.com</strong>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <strong>Notification Settings</strong>
            <span>Choose how Huddle should alert you</span>
          </div>

          <label className="profile-checkbox-row">
            <input type="checkbox" defaultChecked />
            <Bell size={15} />
            Enable desktop notifications
          </label>

          <label className="profile-checkbox-row">
            <input type="checkbox" defaultChecked />
            <Bell size={15} />
            Sound alerts for direct messages
          </label>
        </div>

        <button className="danger-btn profile-logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          Sign Out of Workspace
        </button>
      </div>
    </section>
  );
}

export default ProfileView;