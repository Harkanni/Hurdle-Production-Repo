import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import Logo from "../components/Logo";

function Start() {
  const navigate = useNavigate();

  return (
    <main className="auth-screen">
      <section className="start-header">
        <Logo />
        <h1>Huddle</h1>
        <p>A simple, focused collaboration space for your team.</p>
      </section>

      <section className="start-card start-choice-card">
        <div className="start-tabs">
          <button type="button" onClick={() => navigate("/register")}>
            <UserPlus size={13} />
            Create Account
          </button>

          <button type="button" onClick={() => navigate("/login")}>
            <LogIn size={13} />
            Sign In
          </button>
        </div>
      </section>

      <p className="start-terms">
        By continuing, you agree to Huddle&apos;s Terms of Service and Privacy
        Policy.
      </p>
    </main>
  );
}

export default Start;