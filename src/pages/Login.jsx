import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Input from "../components/Input";
import Logo from "../components/Logo";

function Login({ onRegister, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!email.includes("@") || password.length < 6) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
    }, 800);
  }

  if (status === "success") {
    return (
      <main className="auth-screen">
        <Logo />

        <section className="success-card">
          <div className="success-ring">
            <CheckCircle2 size={30} />
          </div>

          <h1>Signed in successfully!</h1>
          <p>Welcome back to Huddle. Your workspace is ready.</p>

          <div className="signed-card">
            <div className="user-badge">ME</div>

            <div>
              <span>SIGNED IN AS</span>
              <strong>{form.email}</strong>
            </div>

            <small>Active</small>
          </div>

          <button className="primary-btn full" onClick={onSuccess}>
            Continue to workspace <ArrowRight size={15} />
          </button>

          <p className="ready-line">Workspace connected and ready</p>
        </section>

        <FooterLinks />
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <Logo />

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-title">
          <h1>Sign in to Huddle</h1>
          <p>Welcome back! Enter your work credentials to continue.</p>
        </div>

        {error && (
          <div className="form-alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Input
          label="Work Email"
          placeholder="mike@example.com"
          value={form.email}
          icon={<Mail size={14} />}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="password123"
          value={form.password}
          icon={<Lock size={14} />}
          hint="Forgot password?"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label className="checkbox-line">
          <input type="checkbox" defaultChecked />
          <span>Keep me signed in on this device</span>
        </label>

        <button className="primary-btn full" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="spin" size={15} />
              Signing in...
            </>
          ) : (
            <>
              Sign in <ArrowRight size={15} />
            </>
          )}
        </button>

        <div className="auth-bottom">
          Don't have an account?{" "}
          <button type="button" onClick={onRegister}>
            Create Account
          </button>
        </div>
      </form>

      <FooterLinks />
    </main>
  );
}

function FooterLinks() {
  return (
    <div className="footer-links">
      <span>Privacy Policy</span>
      <span>•</span>
      <span>Terms of Service</span>
      <span>•</span>
      <span>System Status</span>
    </div>
  );
}

export default Login;