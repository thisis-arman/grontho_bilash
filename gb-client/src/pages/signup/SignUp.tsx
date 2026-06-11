'use client'
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import SignUpForm from "./SignUpForm";
import { useCreateOtpMutation, useVerifyOtpMutation } from "../../redux/features/otp/otpApi";

const STEPS = [
  { id: 1, label: "Email" },
  { id: 2, label: "Verify" },
  { id: 3, label: "Account" },
];

const SignUp = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [createOtp] = useCreateOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const [currentStep, setCurrentStep] = useState(1);

  const fieldsRef = useRef<HTMLDivElement>(null);
  const [otp, setOtp] = useState(Array(6).fill(""));

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const inputFocus = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const elements = fieldsRef.current!.children;
    if (e.key === "Delete" || e.key === "Backspace") {
      if (index > 0) (elements[index - 1] as HTMLElement).focus();
    } else if (e.key.length === 1 && !isNaN(Number(e.key))) {
      if (index < 5) (elements[index + 1] as HTMLElement).focus();
    }
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < 5) {
      const elements = fieldsRef.current!.children;
      (elements[index + 1] as HTMLElement).focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
  };

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setIsSending(true);
    const email = (e.currentTarget as HTMLFormElement).email.value;
    try {
      const response = await createOtp({ email });
      if (response.data?.success) {
        localStorage.setItem('otpInfo', JSON.stringify({ email }));
        setIsOtpSent(true);
        setCurrentStep(2);
        startResendCooldown();
      } else {
        setEmailError("Failed to send OTP. Please try again.");
      }
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError("");
    const otpCode = otp.join("");
    if (otpCode.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    setIsVerifying(true);
    const savedData = localStorage.getItem('otpInfo');
    const email = savedData ? JSON.parse(savedData).email : null;
    try {
      const response = await verifyOtp({ email, otp: Number(otpCode) });
      if (response.data?.data?.verified) {
        setIsVerified(true);
        setCurrentStep(3);
      } else {
        setOtpError("Invalid OTP. Please check and try again.");
        setOtp(Array(6).fill(""));
        (fieldsRef.current!.children[0] as HTMLElement).focus();
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const savedData = localStorage.getItem('otpInfo');
    const email = savedData ? JSON.parse(savedData).email : null;
    if (!email) return;
    setOtp(Array(6).fill(""));
    setOtpError("");
    try {
      await createOtp({ email });
      startResendCooldown();
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">YourBrand</span>
          </div>
          <a href="/login" className="text-sm font-medium text-gray-500 hover:text-yellow-600 transition-colors">
            Already have an account? <span className="text-yellow-600 underline underline-offset-2">Log in</span>
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Step Progress */}
          {!isVerified && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-0">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${currentStep > step.id
                          ? "bg-yellow-500 text-white shadow-md shadow-yellow-200"
                          : currentStep === step.id
                          ? "bg-white text-yellow-600 border-2 border-yellow-500 shadow-md shadow-yellow-100"
                          : "bg-white text-gray-300 border-2 border-gray-200"
                        }
                      `}>
                        {currentStep > step.id ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : step.id}
                      </div>
                      <span className={`mt-1.5 text-xs font-medium transition-colors duration-300 ${currentStep === step.id ? "text-yellow-600" : currentStep > step.id ? "text-yellow-500" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-16 sm:w-24 h-0.5 mb-5 mx-1 transition-colors duration-500 ${currentStep > step.id ? "bg-yellow-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card */}
          {isVerified ? (
            <SignUpForm isVerified={isVerified} />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100/80 overflow-hidden">
              {/* Card Top Accent */}
              <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400" />

              <div className="p-6 sm:p-8">
                {!isOtpSent ? (
                  /* ── Step 1: Email ── */
                  <div>
                    <div className="mb-7">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4 border border-yellow-100">
                        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Get started</h1>
                      <p className="mt-1 text-sm text-gray-500">Enter your email to receive a verification code.</p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          onChange={() => setEmailError("")}
                          className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200
                            bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 focus:border-transparent
                            ${emailError ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"}`}
                        />
                        {emailError && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {emailError}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSending}
                        className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white text-sm font-semibold shadow-md shadow-yellow-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending code…
                          </>
                        ) : (
                          <>
                            Send verification code
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* ── Step 2: OTP ── */
                  <div>
                    <div className="mb-7">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4 border border-yellow-100">
                        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Check your inbox</h1>
                      <p className="mt-1 text-sm text-gray-500">
                        We sent a 6-digit code to{" "}
                        <span className="font-medium text-gray-700">
                          {JSON.parse(localStorage.getItem('otpInfo') || '{}')?.email || "your email"}
                        </span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Verification code</label>
                        <div ref={fieldsRef} className="flex items-center gap-2 justify-between" onPaste={handlePaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              data-index={index}
                              onChange={(e) => handleOtpChange(e, index)}
                              onKeyUp={(e) => inputFocus(e, index)}
                              className={`
                                w-full max-w-[48px] h-12 sm:h-14 rounded-xl border-2 text-center text-xl font-bold text-gray-900
                                outline-none transition-all duration-200 bg-gray-50 hover:bg-white
                                focus:bg-white focus:border-yellow-500 focus:shadow-md focus:shadow-yellow-100
                                ${otpError ? "border-red-400 bg-red-50" : digit ? "border-yellow-400 bg-white" : "border-gray-200"}
                              `}
                            />
                          ))}
                        </div>
                        {otpError && (
                          <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {otpError}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifying || otp.join("").length < 6}
                        className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white text-sm font-semibold shadow-md shadow-yellow-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isVerifying ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Verifying…
                          </>
                        ) : "Verify & continue"}
                      </button>

                      <div className="flex items-center justify-between text-sm pt-1">
                        <button
                          type="button"
                          onClick={() => { setIsOtpSent(false); setCurrentStep(1); setOtp(Array(6).fill("")); setOtpError(""); }}
                          className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                          </svg>
                          Change email
                        </button>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resendCooldown > 0}
                          className="text-yellow-600 hover:text-yellow-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer note */}
          {!isVerified && (
            <p className="mt-6 text-center text-xs text-gray-400">
              By signing up, you agree to our{" "}
              <a href="#" className="text-yellow-600 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-yellow-600 hover:underline">Privacy Policy</a>.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SignUp;