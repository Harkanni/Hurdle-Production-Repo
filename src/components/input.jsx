import { CheckCircle2, Lock, AlertCircle } from "lucide-react";

function Input({
  label,
  error,
  isValid = false,
  showLock = false,
  rightText = "",
  icon,
  ...props
}) {
  return (
    <label className="field">
      <div className="field-row">
        <span className={error ? "field-label-error" : ""}>{label}</span>
        {error && <em className="field-error-text">{error}</em>}
        {!error && rightText && <em>{rightText}</em>}
      </div>

      <div className={error ? "input-wrap error" : "input-wrap"}>
        {icon && <span className="input-icon">{icon}</span>}

        <input {...props} />

        {isValid && !error && (
          <CheckCircle2 className="valid-icon" size={15} />
        )}

        {error && <AlertCircle className="danger-icon" size={15} />}

        {showLock && !isValid && !error && (
          <Lock className="lock-icon" size={14} />
        )}
      </div>

      {error && <small>{getErrorHelp(label, error)}</small>}
    </label>
  );
}

function getErrorHelp(label, error) {
  if (label === "Full Name") return "Full name is required";
  if (label === "Work Email") return "Please enter a valid work email address";
  if (label === "Password") return "Password must be at least 8 characters long";
  return error;
}

export default Input;