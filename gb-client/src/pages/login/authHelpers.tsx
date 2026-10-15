import { ClipboardEvent, KeyboardEvent, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { authInput } from "./AuthLayout";
import { useAppSelector } from "../../redux/hooks";
import { useCurrentToken } from "../../redux/features/auth/authSlice";

export const dashboardFor = (role?: string) => (role === "user" ? "/user/dashboard" : "/admin/dashboard");

// Where to go after signing in: back to the page that sent the visitor to
// the login form (only same-site paths), otherwise their dashboard.
export const useReturnPath = () => {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return (role?: string) =>
    from && from.startsWith("/") && !from.startsWith("//") && !/^\/(login|signup|forgot-password)/.test(from)
      ? from
      : dashboardFor(role);
};

// Visitors who are already signed in skip the auth pages.
export const RedirectIfSignedIn = ({ children }: { children: JSX.Element }) => {
  const token = useAppSelector(useCurrentToken);
  if (token) {
    try {
      const { exp, role } = jwtDecode<{ exp?: number; role?: string }>(token);
      if (exp && exp * 1000 > Date.now()) return <Navigate to={dashboardFor(role)} replace />;
    } catch {
      // Unreadable token: show the form.
    }
  }
  return children;
};

export const PasswordField = ({
  name,
  autoComplete,
  value,
  onChange,
  placeholder,
  minLength,
  id,
}: {
  name: string;
  autoComplete: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  id?: string;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        maxLength={128}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        className={`${authInput} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
};

const STRENGTH = [
  { label: "Too short", color: "bg-red-400" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-amber-400" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

export const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score = 1;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const level = STRENGTH[Math.min(score, 4)];
  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={`h-1 flex-1 rounded-full ${step <= score ? level.color : "bg-stone-200"}`} />
        ))}
      </div>
      <span className="w-16 text-right text-xs font-medium text-stone-500">{level.label}</span>
    </div>
  );
};

// Six single-digit boxes: typing moves forward, backspace moves back, and a
// pasted code fills every box. Calls onComplete once all six are filled.
export const OtpInput = ({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const update = (code: string) => {
    onChange(code);
    if (code.length === 6) onComplete?.(code);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    update(next.join("").slice(0, 6));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    update(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (refs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-full min-w-0 rounded-xl border border-stone-200 bg-white text-center font-display text-2xl font-bold text-stone-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-stone-50 sm:h-16"
        />
      ))}
    </div>
  );
};
