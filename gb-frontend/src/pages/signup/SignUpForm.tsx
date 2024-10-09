'use client'
import React, { useState } from 'react';
import countryData from "../../assets/db/country_dial_info.json";
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Field, Label, Switch } from '@headlessui/react'
import { Link } from 'react-router-dom';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SignUpForm = ({ isVerified: isValid }: { isVerified?: boolean }) => {
    const [agreed, setAgreed] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(countryData[0]); // Default to the first country

    const [isPasswordHidden, setPasswordHidden] = useState(true)
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        const countryCode = e.target.value;
        const country = countryData.find((c) => c.code === countryCode);
        setSelectedCountry(country || countryData[0]);
    };
    return (
        <div className={`isolate bg-white px-6 py-6  lg:px-8 ${isValid && "block"}`}>
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
                />
            </div>

            <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">
                            First name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="first-name"
                                name="first-name"
                                type="text"
                                autoComplete="given-name"
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900">
                            Last name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="last-name"
                                name="last-name"
                                type="text"
                                autoComplete="family-name"
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    {/* <div className="sm:col-span-2">
                            <label htmlFor="company" className="block text-sm font-semibold leading-6 text-gray-900">
                                Company
                            </label>
                            <div className="mt-2.5">
                                <input
                                    id="company"
                                    name="company"
                                    type="text"
                                    autoComplete="organization"
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div> */}
                    {/* <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2.5">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div> */}
                    <div className="sm:col-span-2">
                        <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-900">
                            Phone number
                        </label>
                        <div className="relative mt-2.5">
                            <div className="absolute inset-y-0 left-0 flex items-center">
                                <label htmlFor="country" className="sr-only">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={selectedCountry.code}
                                    onChange={handleCountryChange}

                                    className="h-full rounded-md border-0 bg-transparent bg-none py-0 pl-8 pr-9   text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm"
                                >
                                    {countryData.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            <img
                                                src={`https://flagsapi.com/${country.code}/shiny/24.png`}
                                                alt={`${country.name} flag`}
                                                className="w-4 h-4 "
                                            />   {country.dial_code}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-1 flex items-center ">
                                    <img
                                        src={`https://flagsapi.com/${selectedCountry.code}/shiny/24.png`}
                                        alt={`${selectedCountry.name} flag`}
                                        className="w-5 h-5 "
                                    />
                                </div>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-3 top-0 h-full w-5 text-gray-400"
                                />
                            </div>
                            <input
                                id="phone-number"
                                name="phone-number"
                                type="tel"
                                autoComplete="tel"
                                maxLength={10}
                                placeholder="1827926219"
                                className="block w-full rounded-md border-0  py-2 pl-28 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    {/* TODO: EYE ICON SHOULD BE WORKABLE */}
                    {/* <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"> */}
                        <div>
                            <label className="text-black">
                                Password
                            </label>
                            <div className="relative  mt-2">
                                <button className="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                    onClick={() => setPasswordHidden(!isPasswordHidden)}
                                >
                                    {
                                        isPasswordHidden ? (
                                            "Show"
                                        ) : (
                                            "Hide"
                                        )
                                    }
                                </button>
                                <input
                                    type={isPasswordHidden ? "password" : "text"}
                                    placeholder="Enter your password"
                                    className="w-full pr-12 pl-3 py-2 text-gray-500 outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                            </div>

                        </div>
                        <div>

                            <label className="text-black">
                                Confirm Password
                            </label>
                            <div className="relative  mt-2">
                                <button className="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                    onClick={() => setPasswordHidden(!isPasswordHidden)}
                                >
                                    {
                                        isPasswordHidden ? (
                                            "Show"
                                        ) : (
                                            "Hide"
                                        )
                                    }
                                </button>
                                <input
                                    type={isPasswordHidden ? "password" : "text"}
                                    placeholder="Enter your password"
                                    className="w-full pr-12 pl-3 py-2 text-gray-500 outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                            </div>
                        </div>

                    {/* </div> */}

                    {/* <div className="sm:col-span-2">
                        <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                            Message
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                defaultValue={''}
                            />
                        </div>
                    </div> */}
                    <Field className="flex gap-x-4 sm:col-span-2">
                        <div className="flex h-6 items-center">
                            <Switch
                                checked={agreed}
                                onChange={setAgreed}
                                className="group flex w-8 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 data-[checked]:bg-yellow-600"
                            >
                                <span className="sr-only">Agree to policies</span>
                                <span
                                    aria-hidden="true"
                                    className="h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-[checked]:translate-x-3.5"
                                />
                            </Switch>
                        </div>
                        <Label className="text-sm leading-6 text-gray-600">
                            By selecting this, you agree to our{' '}
                            <a href="#" className="font-semibold text-yellow-600">
                                privacy&nbsp;policy
                            </a>
                            .
                        </Label>
                    </Field>
                </div>
                <div className="mt-10">
                    <button
                        type="submit"
                        className="block w-full rounded-md bg-yellow-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
            <p className="text-center py-2">Already have an account? <Link to='/login' className="font-medium text-yellow-600 hover:text-yellow-500">Login</Link></p>
        </div>
    );
};

export default SignUpForm;