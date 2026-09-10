function Logo({ small = false }) {
  return (
    <div className={small ? "logo logo-small" : "logo"}>
      <img src="/images/huddle-logo.jpg" alt="Huddle logo" />
      <span>Huddle</span>
    </div>
  );
}

export default Logo;