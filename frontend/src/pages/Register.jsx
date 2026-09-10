import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Input from "../components/Input";
import Logo from "../components/Logo";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const nameValid = form.name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const passwordValid = form.password.length >= 6; // matches backend MinLength(6)

  function updateField(field, value) {
    setForm({ ...form, [field]: value });

    if (submitted) {
      setErrors(validateForm({ ...form, [field]: value }));
    }
  }

  function validateForm(values) {
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Invalid format";
    }

    if (values.password.length < 6) {
      nextErrors.password = "Too short";
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          displayName: form.name.trim(),
        }),
      });

      if (res.status === 409) {
        setErrors({ email: "Email registered" });
        setStatus("idle");
        return;
      }

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      setStatus("success");
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
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

          <h1>Account created successfully!</h1>
          <p>
            Welcome to Huddle. Your workspace is ready for you to join your
            team's channels.
          </p>

          <div className="signed-card">
            <div className="user-badge">ME</div>

            <div>
              <span>SIGNED UP AS</span>
              <strong>{form.email}</strong>
            </div>

            <small>Active</small>
          </div>

          <button
            className="primary-btn full"
            onClick={() => navigate("/login")}
          >
            Continue to sign in <ArrowRight size={15} />
          </button>

          <p className="ready-line">Setup complete • Huddle Workspace ready</p>
        </section>

        <FooterLinks />
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <Logo />

      <form className="auth-card" onSubmit={handleSubmit}>
        {submitted && Object.keys(errors).length > 0 && (
          <div className="error-banner">
            <span></span>
            {Object.keys(errors).length} validation errors require attention
          </div>
        )}

        {serverError && <div className="error-banner">{serverError}</div>}

        <div className="auth-title">
          <h1>Create your Huddle account</h1>
          <p>Simple, lightweight team messaging for modern teams.</p>
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Mike Jenkins"
          value={form.name}
          error={submitted ? errors.name : ""}
          isValid={nameValid}
          showLock
          icon={<User size={14} />}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <Input
          label="Work Email"
          placeholder="mike@example.com"
          value={form.email}
          error={submitted ? errors.email : ""}
          isValid={emailValid}
          showLock
          icon={<Mail size={14} />}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Must be at least 6 characters"
          value={form.password}
          error={submitted ? errors.password : ""}
          isValid={passwordValid}
          showLock
          icon={<Lock size={14} />}
          onChange={(e) => updateField("password", e.target.value)}
        />

        <label className="checkbox-line">
          <input type="checkbox" defaultChecked />
          <span>Keep me signed in on this device</span>
        </label>

        <button className="primary-btn full" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="spin" size={15} />
              Creating account...
            </>
          ) : (
            <>
              Create Account <ArrowRight size={15} />
            </>
          )}
        </button>

        <div className="auth-bottom">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Sign In
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

export default Register;