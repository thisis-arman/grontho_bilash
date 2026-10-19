import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MailCheck } from "lucide-react";
import { toast } from "sonner";
import countryData from "../../assets/db/country_dial_info.json";
import { useCreateOtpMutation, useVerifyOtpMutation } from "../../redux/features/otp/otpApi";
import { useCreateUserMutation } from "../../redux/features/user/userApi";
import { setUser, TUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/hooks";
import { verifyToken } from "../../utils/verifyToken";
import AuthLayout, { authButton, authInput, authLabel, authLink, FormError } from "../login/AuthLayout";
import { OtpInput, PasswordField, PasswordStrength, RedirectIfSignedIn, useReturnPath } from "../login/authHelpers";

const STEPS = ["Email", "Verify", "Details"];
const RESEND_SECONDS = 30;
// Survives a page refresh during sign-up; cleared once the account exists.
const PROGRESS_KEY = "gb_signup";

const DEFAULT_COUNTRY = countryData.find((c) => c.code === "BD") ?? countryData[0];

const apiMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

const loadProgress = (): { email: string; step: number } => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PROGRESS_KEY) ?? "null");
    if (saved?.email && (saved.step === 1 || saved.step === 2)) return saved;
  } catch {
    // ignore
  }
  return { email: "", step: 0 };
};

const Stepper = ({ step }: { step: number }) => (
  <ol className="mb-8 flex items-center gap-2" aria-label="Sign-up progress">
    {STEPS.map((label, i) => (
      <li key={label} className="flex flex-1 items-center gap-2">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            i < step ? "bg-emerald-500 text-white" : i === step ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"
          }`}
          aria-current={i === step ? "step" : undefined}
        >
          {i < step ? <Check size={14} aria-hidden="true" /> : i + 1}
        </span>
        <span className={`text-sm font-semibold ${i === step ? "text-stone-900" : "text-stone-400"}`}>{label}</span>
        {i < STEPS.length - 1 && <span className="ml-1 h-px flex-1 bg-stone-200" aria-hidden="true" />}
      </li>
    ))}
  </ol>
);

const SignUp = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const returnPath = useReturnPath();

  const [createOtp, { isLoading: isSending }] = useCreateOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const initial = loadProgress();
  const [step, setStep] = useState(initial.step);
  const [email, setEmail] = useState(initial.email);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (step > 0) sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ email, step }));
  }, [email, step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const goTo = (next: number) => {
    setError("");
    setStep(next);
  };

  const sendCode = async () => {
    setError("");
    try {
      await createOtp({ email: email.trim() }).unwrap();
      setCode("");
      setCooldown(RESEND_SECONDS);
      return true;
    } catch (err) {
      setError(apiMessage(err, "Could not send the code. Please try again."));
      return false;
    }
  };

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await sendCode()) goTo(1);
  };

  const handleVerify = async (value = code) => {
    if (value.length !== 6 || isVerifying) return;
    setError("");
    try {
      await verifyOtp({ email: email.trim(), otp: value }).unwrap();
      goTo(2);
    } catch (err) {
      setCode("");
      setError(apiMessage(err, "That code is not right. Please try again."));
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const dial = countryData.find((c) => c.code === countryCode)?.dial_code ?? DEFAULT_COUNTRY.dial_code;
    // People usually type the local form (01712...); drop the trunk zero
    // so the stored number is +8801712... rather than +88001712...
    const localNumber = phone.replace(/\D/g, "").replace(/^0+/, "");

    try {
      const response = await createUser({
        name: name.trim(),
        email: email.trim(),
        contactNo: `${dial}${localNumber}`,
        password,
      }).unwrap();
      sessionStorage.removeItem(PROGRESS_KEY);

      const token = response?.data?.accessToken;
      if (token) {
        const user = verifyToken(token) as TUser;
        dispatch(setUser({ user, token }));
        toast.success("Welcome to Grontho Bilash!");
        navigate(returnPath(user.role), { replace: true });
      } else {
        toast.success("Account created. Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(apiMessage(err, "Could not create your account. Please try again."));
    }
  };

  const startOver = () => {
    sessionStorage.removeItem(PROGRESS_KEY);
    setCode("");
    goTo(0);
  };

  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title={step === 0 ? "Create your account" : step === 1 ? "Check your email" : "Almost done"}
        subtitle={
          step === 0 ? (
            "Free to join. We will send a code to confirm your email."
          ) : step === 1 ? (
            <>
              We sent a 6-digit code to <strong className="text-stone-900">{email}</strong>. It expires in 5 minutes.
            </>
          ) : (
            "Tell us a little about you and choose a password."
          )
        }
        footer={
          <>
            Already have an account?{" "}
            <Link to="/login" className={authLink}>
              Log in
            </Link>
          </>
        }
      >
        <Stepper step={step} />

        {step === 0 && (
          <form onSubmit={handleEmail} className="space-y-5">
            <FormError message={error} />
            <div>
              <label htmlFor="signup-email" className={authLabel}>
                Email
              </label>
              <input
                id="signup-email"
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
              {isSending ? "Sending code..." : "Continue"}
            </button>
          </form>
        )}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-5"
          >
            <FormError message={error} />
            <OtpInput value={code} onChange={setCode} onComplete={handleVerify} disabled={isVerifying} />
            <button type="submit" disabled={code.length !== 6 || isVerifying} className={authButton}>
              <MailCheck size={18} aria-hidden="true" />
              {isVerifying ? "Checking..." : "Verify email"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={startOver} className="font-medium text-stone-500 hover:text-stone-900">
                Change email
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || isSending}
                className="font-semibold text-amber-700 hover:underline disabled:text-stone-400 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : isSending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCreate} className="space-y-5">
            <FormError message={error} />
            <div>
              <label htmlFor="signup-name" className={authLabel}>
                Full name
              </label>
              <input
                id="signup-name"
                required
                minLength={2}
                maxLength={80}
                autoFocus
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={authInput}
              />
            </div>

            
<div>
  <label htmlFor="signup-phone" className={authLabel}>
    Phone number
  </label>

  <div className="flex w-full items-stretch gap-2">
    <select
      value={countryCode}
      onChange={(e) => setCountryCode(e.target.value)}
      aria-label="Country code"
      className={`${authInput} !w-[120px] !min-w-[120px] flex-none cursor-pointer px-3`}
    >
      {countryData.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.dial_code}
        </option>
      ))}
    </select>

    <input
      id="signup-phone"
      type="tel"
      inputMode="tel"
      required
      pattern="[0-9\s-]{8,16}"
      title="Digits only, e.g. 01712345678"
      autoComplete="tel-national"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="01712345678"
      className={`${authInput} min-w-0 flex-1`}
    />
  </div>
</div>


            <div>
              <label htmlFor="signup-password" className={authLabel}>
                Password
              </label>
              <PasswordField
                id="signup-password"
                name="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
              />
              <PasswordStrength password={password} />
            </div>

            <button type="submit" disabled={isCreating} className={authButton}>
              {isCreating ? "Creating account..." : "Create account"}
            </button>
            <p className="text-center text-xs leading-relaxed text-stone-500">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="underline">Terms</Link> and{" "}
              <Link to="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </AuthLayout>
    </RedirectIfSignedIn>
  );
};

export default SignUp;
