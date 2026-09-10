import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Input from "../components/Input";
import Logo from "../components/Logo";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!email.includes("@") || password.length < 6) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setStatus("success");
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
      setStatus("idle");
    }
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

          <button
            className="primary-btn full"
            onClick={() => navigate("/workspace")}
          >
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
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            setError("");
          }}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="password123"
          value={form.password}
          icon={<Lock size={14} />}
          rightText="Forgot password?"
          rightIcon={
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            setError("");
          }}
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
          Don&apos;t have an account?{" "}
          <button type="button" onClick={() => navigate("/register")}>
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
