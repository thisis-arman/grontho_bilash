import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../redux/features/auth/authApi";
import AuthLayout, { authButton, authInput, authLabel, authLink, FormError } from "./AuthLayout";
import { OtpInput, PasswordField, PasswordStrength, RedirectIfSignedIn } from "./authHelpers";

const RESEND_SECONDS = 30;

const apiMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setCodeSent(true);
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(apiMessage(err, "Could not send the code. Please try again."));
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    try {
      await resetPassword({ email: email.trim(), otp: code, newPassword: password }).unwrap();
      toast.success("Password reset. Log in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      setCode("");
      setError(apiMessage(err, "Could not reset the password. Please try again."));
    }
  };

  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title={codeSent ? "Set a new password" : "Reset your password"}
        subtitle={
          codeSent ? (
            <>
              If <strong className="text-stone-900">{email}</strong> has an account, we emailed it a 6-digit code. It
              expires in 5 minutes.
            </>
          ) : (
            "Enter the email you signed up with and we will send you a reset code."
          )
        }
        footer={
          <>
            Remembered it?{" "}
            <Link to="/login" className={authLink}>
              Back to login
            </Link>
          </>
        }
      >
        {!codeSent ? (
          <form onSubmit={sendCode} className="space-y-5">
            <FormError message={error} />
            <div>
              <label htmlFor="reset-email" className={authLabel}>
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={authInput}
              />
            </div>
            <button type="submit" disabled={isSending} className={authButton}>
              {isSending ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <FormError message={error} />
            <div>
              <p className={authLabel}>6-digit code</p>
              <OtpInput value={code} onChange={setCode} disabled={isResetting} />
            </div>
            <div>
              <label htmlFor="new-password" className={authLabel}>
                New password
              </label>
              <PasswordField
                id="new-password"
                name="newPassword"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
              />
              <PasswordStrength password={password} />
            </div>
            <div>
              <label htmlFor="confirm-password" className={authLabel}>
                Confirm new password
              </label>
              <PasswordField
                id="confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={6}
                value={confirm}
                onChange={setConfirm}
              />
            </div>
            <button type="submit" disabled={isResetting} className={authButton}>
              {isResetting ? "Resetting..." : "Reset password"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setCodeSent(false); setError(""); }}
                className="font-medium text-stone-500 hover:text-stone-900"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={cooldown > 0 || isSending}
                className="font-semibold text-amber-700 hover:underline disabled:text-stone-400 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    </RedirectIfSignedIn>
  );
};

export default ForgotPassword;
