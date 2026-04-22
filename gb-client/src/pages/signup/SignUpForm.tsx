'use client';
import React, { useState } from 'react';
import countryData from '../../assets/db/country_dial_info.json';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateUserMutation } from '../../redux/features/user/userApi';

const SignUpForm = () => {
    const [selectedCountry, setSelectedCountry] = useState(countryData[0]);
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [isConfirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNo: '',
        password: '',
        confirmPassword: ''
    });
    const [createUser, { isLoading }] = useCreateUserMutation();

    // Retrieve email from localStorage
    const res = localStorage.getItem('otpInfo');
    const email = res ? JSON.parse(res)?.email : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const country = countryData.find((c) => c.code === countryCode);
        setSelectedCountry(country || countryData[0]);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check password matching before creating user
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Combine contact number with country code
        const contactNoWithCountryCode = `${selectedCountry.dial_code}${formData.contactNo}`;
        const name = `${formData.firstName} ${formData.lastName}`;
        
        try {
            const response = await createUser({
                name,
                contactNo: contactNoWithCountryCode,
                password: formData.password,
                email: email
            }).unwrap();
            
            if (response.success) { 
                navigate('/');
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-yellow-900/5 p-8 sm:p-12 border border-gray-100">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Join us to start your journey. Enter your details below.
                    </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="e.g. John"
                                className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6 outline-none bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="e.g. Doe"
                                className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6 outline-none bg-gray-50/50 hover:bg-white"
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="contactNo" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                            Phone Number
                        </label>
                        <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 transition-all duration-200 ease-in-out bg-gray-50/50 hover:bg-white overflow-hidden">
                            <select
                                id="country"
                                name="country"
                                value={selectedCountry.code}
                                onChange={handleCountryChange}
                                className="bg-transparent py-3 pl-4 pr-8 text-gray-600 sm:text-sm border-0 focus:ring-0 outline-none cursor-pointer border-r border-gray-200 font-medium"
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
                                className="block w-full border-0 bg-transparent py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Password */}
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={isPasswordHidden ? "password" : "text"}
                                    id="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="block w-full rounded-xl border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6 outline-none bg-gray-50/50 hover:bg-white"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setPasswordHidden(!isPasswordHidden)} 
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-yellow-600 transition-colors focus:outline-none"
                                >
                                    {isPasswordHidden ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={isConfirmPasswordHidden ? "password" : "text"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className="block w-full rounded-xl border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 transition-all duration-200 ease-in-out sm:text-sm sm:leading-6 outline-none bg-gray-50/50 hover:bg-white"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setConfirmPasswordHidden(!isConfirmPasswordHidden)} 
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-yellow-600 transition-colors focus:outline-none"
                                >
                                    {isConfirmPasswordHidden ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-4 flex items-center justify-center rounded-xl bg-yellow-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-yellow-600 hover:text-yellow-500 transition-colors">
                        Log in instead
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpForm;

