import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../redux/features/auth/authApi";

const inputClass =
  "w-full px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 outline-none transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 focus:bg-white";
const labelClass =
  "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setCodeSent(true);
    } catch (err: any) {
      setError(err?.data?.message || "Could not send the code. Please try again.");
    }
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const otp = (form.elements.namedItem("otp") as HTMLInputElement).value.trim();
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ email: email.trim(), otp, newPassword }).unwrap();
      toast.success("Password reset. Please log in with your new password.");
      navigate("/login");
    } catch (err: any) {
      setError(err?.data?.message || "Could not reset the password. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src="/logo.png" className="h-12 w-12" alt="Grontho Bilash" />
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          {codeSent
            ? `If an account exists for ${email}, we emailed it a 6-digit code. It expires in 5 minutes.`
            : "Enter your account email and we will send you a reset code."}
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-60"
            >
              {isSending ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="otp" className={labelClass}>6-digit code</label>
              <input
                id="otp"
                name="otp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
                className={`${inputClass} tracking-[0.4em]`}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClass}>New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isResetting}
              className="w-full py-2.5 rounded-xl bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-60"
            >
              {isResetting ? "Resetting..." : "Reset password"}
            </button>
            <button
              type="button"
              onClick={() => { setCodeSent(false); setError(""); }}
              className="w-full text-sm text-gray-500 hover:text-yellow-700"
            >
              Use a different email or resend the code
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-700">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPassword;
