import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { verifyToken } from "../../utils/verifyToken";
import { useAppDispatch } from "../../redux/hooks";
import { setUser, TUser } from "../../redux/features/auth/authSlice";
import { toast } from "sonner";
import { useState } from "react";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    const toastId = toast.loading("Logging in...");
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const response = await login({ email, password }).unwrap();
      const user = verifyToken(response.data.accessToken) as TUser;
      dispatch(setUser({ user, token: response.data.accessToken }));
      toast.success("Login successful", { id: toastId, duration: 2000 });
      if (response.success) navigate(`/${user.role}/dashboard`);
    } catch {
      toast.error("Something went wrong", { id: toastId, duration: 2000 });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden flex"
        style={{ minHeight: "520px" }}
      >
        {/* ── Left decorative panel ── */}
        <div
          className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ width: "42%", background: "#d97706", flexShrink: 0 }}
        >
          {/* Background circles */}
          <div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              top: -70,
              right: -70,
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              bottom: -50,
              left: -50,
              background: "rgba(255,255,255,0.06)",
            }}
          />

          {/* Brand */}
          <div className="flex items-center gap-3 z-10 relative">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                background: "rgba(255,255,255,0.25)",
              }}
            >
              <img
                src="/src/assets/logo/grontho-bilash-transparent.png"
                className="h-7 w-7 object-contain"
                alt="Grontho Bilash"
              />
            </div>
            <span
              className="text-white font-semibold text-lg tracking-wide"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Grontho Bilash
            </span>
          </div>

          {/* Quote */}
          <div className="z-10 relative">
            <blockquote
              className="text-white text-xl leading-relaxed mb-3 italic"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              "A reader lives a thousand lives before he dies."
            </blockquote>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              — George R.R. Martin
            </p>
          </div>

          {/* Dots */}
          <div className="flex gap-2 z-10 relative">
            {[true, false, false].map((active, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: active
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10">
          {/* Mobile logo */}
          <div className="flex md:hidden justify-center mb-6">
            <img
              src="/src/assets/logo/grontho-bilash-transparent.png"
              className="h-12 w-12"
              alt="Grontho Bilash"
            />
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 outline-none transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 outline-none transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-yellow-600 cursor-pointer"
                />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              
               <a href="#"
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "#d97706" }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#b45309")
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#d97706")
              }
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <g clipPath="url(#clip0_17_40)">
                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -.068932 24.48 .00161733C15.4055 .00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
              </g>
              <defs><clipPath id="clip0_17_40"><rect width="48" height="48" fill="white"/></clipPath></defs>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;