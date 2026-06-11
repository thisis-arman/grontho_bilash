'use client';
import React, { useState } from 'react';
import countryData from '../../assets/db/country_dial_info.json';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateUserMutation } from '../../redux/features/user/userApi';

interface SignUpFormProps {
  isVerified: boolean;
}

const SignUpForm = ({ isVerified }: SignUpFormProps) => {
  const [selectedCountry, setSelectedCountry] = useState(countryData[0]);
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNo: '',
    password: '',
    confirmPassword: ''
  });

  const [createUser, { isLoading }] = useCreateUserMutation();

  const res = localStorage.getItem('otpInfo');
  const email = res ? JSON.parse(res)?.email : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'confirmPassword' || name === 'password') setPasswordMismatch(false);
    setApiError("");
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countryData.find((c) => c.code === e.target.value);
    setSelectedCountry(country || countryData[0]);
  };

  const passwordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "bg-red-400" },
      { score: 2, label: "Fair", color: "bg-orange-400" },
      { score: 3, label: "Good", color: "bg-yellow-400" },
      { score: 4, label: "Strong", color: "bg-green-500" },
    ];
    return levels[score];
  };

  const pwdStrength = passwordStrength(formData.password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    const contactNoWithCountryCode = `${selectedCountry.dial_code}${formData.contactNo}`;
    const name = `${formData.firstName} ${formData.lastName}`;
    try {
      const response = await createUser({
        name,
        contactNo: contactNoWithCountryCode,
        password: formData.password,
        email,
      }).unwrap();
      if (response.success) {
        navigate('/');
      }
    } catch (error: any) {
      setApiError(error?.data?.message || "Account creation failed. Please try again.");
    }
  };

  const inputClass = (hasError = false) =>
    `block w-full rounded-xl border py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200
    bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 focus:border-transparent
    ${hasError ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"}`;

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
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-yellow-600 transition-colors">
            Already a member? <span className="text-yellow-600 underline underline-offset-2">Log in</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Step indicator (step 3 active) */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-0">
              {[{ id: 1, label: "Email" }, { id: 2, label: "Verify" }, { id: 3, label: "Account" }].map((step, idx, arr) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                      ${step.id < 3 ? "bg-yellow-500 text-white shadow-md shadow-yellow-200" : "bg-white text-yellow-600 border-2 border-yellow-500 shadow-md shadow-yellow-100"}`}>
                      {step.id < 3 ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : step.id}
                    </div>
                    <span className={`mt-1.5 text-xs font-medium ${step.id === 3 ? "text-yellow-600" : "text-yellow-500"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="w-16 sm:w-24 h-0.5 mb-5 mx-1 bg-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100/80 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400" />

            <div className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4 border border-yellow-100">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Setting up account for <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={inputClass()}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <div className={`flex rounded-xl border overflow-hidden transition-all duration-200 bg-gray-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-1 focus-within:border-transparent border-gray-200`}>
                    <select
                      value={selectedCountry.code}
                      onChange={handleCountryChange}
                      className="bg-transparent py-3 pl-3 pr-2 text-sm text-gray-600 border-0 focus:ring-0 outline-none cursor-pointer border-r border-gray-200 font-medium flex-shrink-0"
                    >
                      {countryData.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} ({country.dial_code})
                        </option>
                      ))}
                    </select>
                    <input
                      id="contactNo"
                      name="contactNo"
                      type="tel"
                      required
                      value={formData.contactNo}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="Phone number"
                      className="flex-1 min-w-0 border-0 bg-transparent py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={isPasswordHidden ? "password" : "text"}
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className={inputClass() + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordHidden(!isPasswordHidden)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-yellow-500 transition-colors focus:outline-none"
                      aria-label={isPasswordHidden ? "Show password" : "Hide password"}
                    >
                      {isPasswordHidden ? (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength.score ? pwdStrength.color : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                      {pwdStrength.label && (
                        <p className={`text-xs font-medium ${pwdStrength.score >= 3 ? "text-green-600" : pwdStrength.score === 2 ? "text-orange-500" : "text-red-500"}`}>
                          {pwdStrength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={isConfirmPasswordHidden ? "password" : "text"}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className={inputClass(passwordMismatch) + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordHidden(!isConfirmPasswordHidden)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-yellow-500 transition-colors focus:outline-none"
                      aria-label={isConfirmPasswordHidden ? "Show password" : "Hide password"}
                    >
                      {isConfirmPasswordHidden ? (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Passwords don't match
                    </p>
                  )}
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-red-600">{apiError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 mt-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white text-sm font-semibold shadow-md shadow-yellow-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-yellow-600 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-yellow-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpForm;