import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { setUser, TUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/hooks";
import { verifyToken } from "../../utils/verifyToken";
import AuthLayout, { authButton, authInput, authLabel, authLink, FormError } from "./AuthLayout";
import { PasswordField, RedirectIfSignedIn, useReturnPath } from "./authHelpers";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const returnPath = useReturnPath();
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await login({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      }).unwrap();
      const user = verifyToken(response.data.accessToken) as TUser;
      dispatch(setUser({ user, token: response.data.accessToken }));
      toast.success(`আবার স্বাগতম, ${user.name?.split(" ")[0] ?? ""}`.trim());
      navigate(returnPath(user.role), { replace: true });
    } catch (err) {
      const status = (err as { status?: number | string })?.status;
      setError(
        status === "FETCH_ERROR"
          ? "সার্ভারে পৌঁছানো যাচ্ছে না। ইন্টারনেট কানেকশন দেখে আবার চেষ্টা করো।"
          : (err as { data?: { message?: string } })?.data?.message || "লগইন করা যায়নি। আবার চেষ্টা করো।"
      );
    }
  };

  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title="আবার স্বাগতম"
        subtitle="বই কিনতে, বেচতে আর অর্ডারের খোঁজ রাখতে লগইন করো।"
        footer={
          <>
            গ্রন্থ বিলাসে নতুন?{" "}
            <Link to="/signup" className={authLink}>
              অ্যাকাউন্ট খোলো
            </Link>
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <FormError message={error} />

          <div>
            <label htmlFor="email" className={authLabel}>
              ইমেইল
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className={authInput}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-stone-700">
                পাসওয়ার্ড
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-amber-700 hover:underline">
                পাসওয়ার্ড ভুলে গেছো?
              </Link>
            </div>
            <PasswordField id="password" name="password" autoComplete="current-password" />
          </div>

          <button type="submit" disabled={isLoading} className={authButton}>
            {isLoading ? "লগইন হচ্ছে..." : "লগইন"}
          </button>
        </form>
      </AuthLayout>
    </RedirectIfSignedIn>
  );
};

export default Login;
