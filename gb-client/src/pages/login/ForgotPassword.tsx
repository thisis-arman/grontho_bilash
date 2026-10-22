import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../redux/features/auth/authApi";
import AuthLayout, { authButton, authInput, authLabel, authLink, FormError } from "./AuthLayout";
import { OtpInput, PasswordField, PasswordStrength, RedirectIfSignedIn } from "./authHelpers";
import { bnNumber } from "../../i18n/labels";

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
      setError(apiMessage(err, "কোড পাঠানো যায়নি। আবার চেষ্টা করো।"));
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("ইমেইলে পাওয়া ৬ সংখ্যার কোডটা দাও।");
      return;
    }
    if (password !== confirm) {
      setError("দুটো পাসওয়ার্ড মিলছে না।");
      return;
    }
    try {
      await resetPassword({ email: email.trim(), otp: code, newPassword: password }).unwrap();
      toast.success("পাসওয়ার্ড বদলানো হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করো।");
      navigate("/login", { replace: true });
    } catch (err) {
      setCode("");
      setError(apiMessage(err, "পাসওয়ার্ড বদলানো যায়নি। আবার চেষ্টা করো।"));
    }
  };

  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title={codeSent ? "নতুন পাসওয়ার্ড দাও" : "পাসওয়ার্ড রিসেট করো"}
        subtitle={
          codeSent ? (
            <>
              <strong className="text-stone-900">{email}</strong> দিয়ে অ্যাকাউন্ট থাকলে সেখানে একটা ৬ সংখ্যার কোড পাঠিয়েছি।
              কোডটা ৫ মিনিট কাজ করবে।
            </>
          ) : (
            "যে ইমেইল দিয়ে সাইন আপ করেছিলে সেটা দাও, আমরা একটা রিসেট কোড পাঠাব।"
          )
        }
        footer={
          <>
            মনে পড়েছে?{" "}
            <Link to="/login" className={authLink}>
              লগইনে ফিরে যাও
            </Link>
          </>
        }
      >
        {!codeSent ? (
          <form onSubmit={sendCode} className="space-y-5">
            <FormError message={error} />
            <div>
              <label htmlFor="reset-email" className={authLabel}>
                ইমেইল
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
              {isSending ? "পাঠানো হচ্ছে..." : "রিসেট কোড পাঠাও"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <FormError message={error} />
            <div>
              <p className={authLabel}>৬ সংখ্যার কোড</p>
              <OtpInput value={code} onChange={setCode} disabled={isResetting} />
            </div>
            <div>
              <label htmlFor="new-password" className={authLabel}>
                নতুন পাসওয়ার্ড
              </label>
              <PasswordField
                id="new-password"
                name="newPassword"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={setPassword}
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
              <PasswordStrength password={password} />
            </div>
            <div>
              <label htmlFor="confirm-password" className={authLabel}>
                নতুন পাসওয়ার্ড আবার দাও
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
              {isResetting ? "বদলানো হচ্ছে..." : "পাসওয়ার্ড বদলাও"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setCodeSent(false); setError(""); }}
                className="font-medium text-stone-500 hover:text-stone-900"
              >
                ইমেইল বদলাও
              </button>
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={cooldown > 0 || isSending}
                className="font-semibold text-amber-700 hover:underline disabled:text-stone-400 disabled:no-underline"
              >
                {cooldown > 0 ? `${bnNumber(cooldown)} সেকেন্ড পর আবার পাঠাও` : "আবার কোড পাঠাও"}
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    </RedirectIfSignedIn>
  );
};

export default ForgotPassword;
