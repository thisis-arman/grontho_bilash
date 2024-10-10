'use client';
import React, { useState } from 'react';
import countryData from '../../assets/db/country_dial_info.json';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCreateUserMutation } from '../../redux/features/user/userApi';

const SignUpForm = () => {
    const [selectedCountry, setSelectedCountry] = useState(countryData[0]);
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const navigate  =useNavigate()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNo: '',
        password: '',
        confirmPassword: ''
    });
    const [createUser] = useCreateUserMutation();

    // Retrieve email from localStorage
    const res = localStorage.getItem('otpInfo');
 

    const email = JSON.parse(res).email;
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const country = countryData.find((c) => c.code === countryCode);
        setSelectedCountry(country || countryData[0]);
    };

    // Handle form submission
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Combine contact number with country code
        const contactNoWithCountryCode = `${selectedCountry.dial_code}${formData.contactNo}`;

        const name = `${formData.firstName} ${formData.lastName}`
        // Send data to createUser
        try {
            const response = await createUser({
                name,
                contactNo: contactNoWithCountryCode,
                password: formData.password,
                email: email
            }).unwrap();
            if (response.success) { 
                navigate('/home')
            }
         
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    return (
        <div className="isolate bg-white px-6 py-6 lg:px-8">
            <form onSubmit={handleRegisterSubmit} className="mx-auto max-w-xl sm:mt-8">
                <div className="grid grid-cols-1 gap-y-6">
                    {/* First Name and Last Name in the same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="block w-full rounded-md px-3.5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="block w-full rounded-md px-3.5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>
                    </div>

                    {/* Contact Number with Country Code and Flag */}
                    <div>
                        <label htmlFor="contactNo" className="block text-sm font-semibold text-gray-900">Phone number</label>
                        <div className="flex items-center border rounded-md border-gray-300">
                            <select
                                id="country"
                                name="country"
                                value={selectedCountry.code}
                                onChange={handleCountryChange}
                                className=" h-full max-w-48 rounded-l-md bg-transparent py-2 pr-2 text-gray-400 focus:ring-2 focus:ring-yellow-600"
                            >
                                {countryData.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} {country.dial_code}
                                    </option>
                                ))}
                            </select>
                            {/* <img src={selectedCountry.flag} alt={`${selectedCountry.name} flag`} className="h-6 w-6 mr-2" /> */}
                            <input
                                id="contactNo"
                                name="contactNo"
                                type="tel"
                                value={formData.contactNo}
                                onChange={handleChange}
                                maxLength={10}
                                placeholder="Enter phone number"
                                className="w-full rounded-r-md px-3 py-2 flex-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>
                    </div>

                    {/* Password and Confirm Password in the same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900">Password</label>
                            <input
                                type={isPasswordHidden ? "password" : "text"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full pr-12 pl-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600"
                            />
                            <button type="button" onClick={() => setPasswordHidden(!isPasswordHidden)} className="absolute right-3 top-10 text-gray-600">
                                {isPasswordHidden ? 'Show' : 'Hide'}
                            </button>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900">Confirm Password</label>
                            <input
                                type={isPasswordHidden ? "password" : "text"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="w-full pr-12 pl-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-6 rounded-md bg-yellow-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-yellow-500">
                        Sign Up
                    </button>
                </div>
            </form>

            <p className="text-center py-4">
                Already have an account? <Link to='/login' className="font-medium text-yellow-600">Login</Link>
            </p>
        </div>
    );
};

export default SignUpForm;
