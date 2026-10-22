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
import { bnNumber } from "../../i18n/labels";

const STEPS = ["ইমেইল", "যাচাই", "তথ্য"];
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
  <ol className="mb-8 flex items-center gap-2" aria-label="সাইন আপের ধাপ">
    {STEPS.map((label, i) => (
      <li key={label} className="flex flex-1 items-center gap-2">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            i < step ? "bg-emerald-500 text-white" : i === step ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"
          }`}
          aria-current={i === step ? "step" : undefined}
        >
          {i < step ? <Check size={14} aria-hidden="true" /> : bnNumber(i + 1)}
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
      setError(apiMessage(err, "কোড পাঠানো যায়নি। আবার চেষ্টা করো।"));
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
      setError(apiMessage(err, "কোডটা ঠিক না। আবার চেষ্টা করো।"));
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
        toast.success("গ্রন্থ বিলাসে স্বাগতম!");
        navigate(returnPath(user.role), { replace: true });
      } else {
        toast.success("অ্যাকাউন্ট খোলা হয়েছে। এবার লগইন করো।");
        navigate("/login");
      }
    } catch (err) {
      setError(apiMessage(err, "অ্যাকাউন্ট খোলা যায়নি। আবার চেষ্টা করো।"));
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
        title={step === 0 ? "অ্যাকাউন্ট খোলো" : step === 1 ? "ইমেইল চেক করো" : "প্রায় শেষ"}
        subtitle={
          step === 0 ? (
            "যোগ দিতে কোনো টাকা লাগে না। ইমেইল যাচাই করতে আমরা একটা কোড পাঠাব।"
          ) : step === 1 ? (
            <>
              <strong className="text-stone-900">{email}</strong> ঠিকানায় একটা ৬ সংখ্যার কোড পাঠিয়েছি। কোডটা ৫ মিনিট কাজ করবে।
            </>
          ) : (
            "তোমার সম্পর্কে একটু জানাও আর একটা পাসওয়ার্ড বেছে নাও।"
          )
        }
        footer={
          <>
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className={authLink}>
              লগইন করো
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
                ইমেইল
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
              {isSending ? "কোড পাঠানো হচ্ছে..." : "এগিয়ে যাও"}
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
              {isVerifying ? "যাচাই হচ্ছে..." : "ইমেইল যাচাই করো"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={startOver} className="font-medium text-stone-500 hover:text-stone-900">
                ইমেইল বদলাও
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || isSending}
                className="font-semibold text-amber-700 hover:underline disabled:text-stone-400 disabled:no-underline"
              >
                {cooldown > 0 ? `${bnNumber(cooldown)} সেকেন্ড পর আবার পাঠাও` : isSending ? "পাঠানো হচ্ছে..." : "আবার কোড পাঠাও"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCreate} className="space-y-5">
            <FormError message={error} />
            <div>
              <label htmlFor="signup-name" className={authLabel}>
                পুরো নাম
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
                placeholder="তোমার নাম"
                className={authInput}
              />
            </div>

            
<div>
  <label htmlFor="signup-phone" className={authLabel}>
    ফোন নম্বর
  </label>

  <div className="flex w-full items-stretch gap-2">
    <select
      value={countryCode}
      onChange={(e) => setCountryCode(e.target.value)}
      aria-label="দেশের কোড"
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
      title="শুধু সংখ্যা, যেমন 01712345678"
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
                পাসওয়ার্ড
              </label>
              <PasswordField
                id="signup-password"
                name="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={setPassword}
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
              <PasswordStrength password={password} />
            </div>

            <button type="submit" disabled={isCreating} className={authButton}>
              {isCreating ? "অ্যাকাউন্ট খোলা হচ্ছে..." : "অ্যাকাউন্ট খোলো"}
            </button>
            <p className="text-center text-xs leading-relaxed text-stone-500">
              অ্যাকাউন্ট খুললে তুমি আমাদের{" "}
              <Link to="/terms" className="underline">শর্তাবলি</Link> আর{" "}
              <Link to="/privacy" className="underline">প্রাইভেসি পলিসি</Link> মেনে নিচ্ছ।
            </p>
          </form>
        )}
      </AuthLayout>
    </RedirectIfSignedIn>
  );
};

export default SignUp;
