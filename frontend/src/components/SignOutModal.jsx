import { LogOut } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";


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

export default SignOutModal;    