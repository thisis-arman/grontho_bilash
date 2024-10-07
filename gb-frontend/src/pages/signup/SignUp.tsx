'use client'
import { FormEvent, useRef, useState } from "react";

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Field, Label, Switch } from '@headlessui/react'

const SignUp = () => {

    const [isOtpSent, setIsOtpSent] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [agreed, setAgreed] = useState(false)


    const [steps, setStep] = useState({
        stpesCount: [1, 2, 3],
        currentStep: 2
    })



    const fieldsRef = useRef()
    const [state, setState] = useState({ code1: "", code2: "", code3: "", code4: "" })

    // Switch to input fields method
    const inputFocus = (e) => {
        const elements = fieldsRef.current.children
        const dataIndex = +e.target.getAttribute("data-index")
        if ((e.key === "Delete" || e.key === "Backspace")) {
            const next = dataIndex - 1;
            if (next > -1) {
                elements[next].focus()
            }
        } else {

            const next = dataIndex + 1
            if (next < elements.length && e.target.value != " " && e.target.value != "" && e.key.length == 1) {
                elements[next].focus()
            }
        }
    }

    const handleChange = (e: FormEvent, codeNumber: number) => {
        const value = e.target.value
        setState({ ...state, [codeNumber]: value.slice(value.length - 1) })
    }

    const handleSentOtp = () => {
        console.log("hits");
        setIsOtpSent(true)
        setStep({ currentStep: 1, stpesCount: [1, 2, 3] })
    }
    const handleVerifyOtp = () => {
        console.log("hits");
        setIsValid(true)
        setStep({ currentStep: 2, stpesCount: [1, 2, 3] })

    }



    return (
        <div>
            {/* Steps  */}
            <div className="max-w-lg mx-auto px-4 sm:px-0 py-10">
                <ul aria-label="Steps" className="flex items-center">
                    {steps.stpesCount.map((item, idx) => (
                        <li aria-current={steps.currentStep == idx + 1 ? "step" : false} className="flex-1 last:flex-none flex items-center">
                            <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${steps.currentStep > idx + 1 ? "bg-yellow-600 border-yellow-600" : "" || steps.currentStep == idx + 1 ? "border-yellow-600" : ""}`}>
                                <span className={`w-2.5 h-2.5 rounded-full bg-yellow-600 ${steps.currentStep != idx + 1 ? "hidden" : ""}`}></span>
                                {
                                    steps.currentStep > idx + 1 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    ) : ""
                                }
                            </div>
                            <hr className={`w-full border ${idx + 1 == steps.stpesCount.length ? "hidden" : "" || steps.currentStep > idx + 1 ? "border-yellow-600" : ""}`} />
                        </li>
                    ))}
                </ul>
            </div>
            {/*step: 1 - OTP Verification */}

            <div className="hidden">
                <div className={`relative max-w-sm mx-auto  hidden}`} id="">
                    <div>
                        <svg className="w-6 h-6 text-gray-400 absolute left-3 mt-2 inset-y-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter your email"
                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-yellow-500 shadow-sm rounded-lg"
                        />
                    </div>
                    <button onClick={() => handleSentOtp()} className="px-7 mt-10 py-2.5 text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Send OTP</button>
                </div>
                {/* Verification Code */}
                <div className={`max-w-sm mx-auto ${isOtpSent ? "block" : "hidden"} `}>
                    <label className="text-gray-600">
                        Verification code
                    </label>
                    <div ref={fieldsRef} className="mt-2 flex items-center gap-x-2">
                        <input type="text" data-index="0" placeholder="0" value={state.code1} className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                            onChange={(e) => handleChange(e, "code1")}
                            onKeyUp={inputFocus}
                        />
                        <input type="text" data-index="1" placeholder="0" value={state.code2} className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                            onChange={(e) => handleChange(e, "code2")}
                            onKeyUp={inputFocus}
                        />
                        <input type="text" data-index="2" placeholder="0" value={state.code3} className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                            onChange={(e) => handleChange(e, 5)}
                            onKeyUp={inputFocus}
                        />
                        <input type="text" data-index="3" placeholder="0" value={state.code4} className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                            onChange={(e) => handleChange(e, "code4")}
                            onKeyUp={inputFocus}
                        />
                        <input type="text" data-index="3" placeholder="0" value={state.code4} className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                            onChange={(e) => handleChange(e, "code4")}
                            onKeyUp={inputFocus}
                        />

                    </div>
                    <button onClick={() => handleVerifyOtp()} className="px-7 mt-10 py-2.5 text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Verify OTP</button>
                </div>
            </div>
            {/* Form */}
            <div className="isolate bg-gray-700 px-6 py-6  lg:px-8">
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
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        className="h-full rounded-md border-0 bg-transparent bg-none py-0 pl-4 pr-9 text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                    >
                                        <option>US</option>
                                        <option>CA</option>
                                        <option>EU</option>
                                    </select>
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
                                    className="block w-full rounded-md border-0 px-3.5 py-2 pl-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                                Message
                            </label>
                            <div className="mt-2.5">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue={''}
                                />
                            </div>
                        </div>
                        <Field className="flex gap-x-4 sm:col-span-2">
                            <div className="flex h-6 items-center">
                                <Switch
                                    checked={agreed}
                                    onChange={setAgreed}
                                    className="group flex w-8 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-[checked]:bg-indigo-600"
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
                                <a href="#" className="font-semibold text-indigo-600">
                                    privacy&nbsp;policy
                                </a>
                                .
                            </Label>
                        </Field>
                    </div>
                    <div className="mt-10">
                        <button
                            type="submit"
                            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Let's talk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;