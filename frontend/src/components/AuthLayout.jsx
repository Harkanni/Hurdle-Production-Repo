import Logo from "./Logo";

function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="visual-content">
          <Logo />
          <h2>One workspace for focused team conversations.</h2>
          <p>Register, join channels and keep sprint communication moving.</p>
        </div>
      </section>

      <section className="auth-form-area">{children}</section>
    </main>
  );
}

export default AuthLayout;