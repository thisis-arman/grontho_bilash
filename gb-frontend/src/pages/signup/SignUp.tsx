import { FormEvent, useRef, useState } from "react";

const SignUp = () => {

    const [steps, setStep] = useState({
        stpesCount: [1, 2,],
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

    const handleChange = (e:FormEvent, codeNumber: number) => {
        const value = e.target.value
        setState({ ...state, [codeNumber]: value.slice(value.length - 1) })
    }
    return (
        <div>
            {/* Steps  */}
            <div className="max-w-lg mx-auto px-4 sm:px-0 py-10">
                <ul aria-label="Steps" className="flex items-center">
                    {steps.stpesCount.map((item, idx) => (
                        <li aria-current={steps.currentStep == idx + 1 ? "step" : false} className="flex-1 last:flex-none flex items-center">
                            <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${steps.currentStep > idx + 1 ? "bg-indigo-600 border-indigo-600" : "" || steps.currentStep == idx + 1 ? "border-indigo-600" : ""}`}>
                                <span className={`w-2.5 h-2.5 rounded-full bg-indigo-600 ${steps.currentStep != idx + 1 ? "hidden" : ""}`}></span>
                                {
                                    steps.currentStep > idx + 1 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    ) : ""
                                }
                            </div>
                            <hr className={`w-full border ${idx + 1 == steps.stpesCount.length ? "hidden" : "" || steps.currentStep > idx + 1 ? "border-indigo-600" : ""}`} />
                        </li>
                    ))}
                </ul>
            </div>
            {/*step: 1 - OTP Verification */}

            <div className="relative max-w-sm mx-auto">
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
                <button className="px-7 mt-10 py-2.5 text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Send OTP</button>
            </div>
            {/* Verification Code */}
            <div className="max-w-sm mx-auto">
                <label className="text-gray-600">
                    Verification code
                </label>
                <div ref={fieldsRef} className="mt-2 flex items-center gap-x-2">
                    <input type="text" data-index="0" placeholder="0" value={state.code1} className="w-12 h-12 rounded-lg border focus:border-indigo-600 outline-none text-center text-2xl"
                        onChange={(e) => handleChange(e, "code1")}
                        onKeyUp={inputFocus}
                    />
                    <input type="text" data-index="1" placeholder="0" value={state.code2} className="w-12 h-12 rounded-lg border focus:border-indigo-600 outline-none text-center text-2xl"
                        onChange={(e) => handleChange(e, "code2")}
                        onKeyUp={inputFocus}
                    />
                    <input type="text" data-index="2" placeholder="0" value={state.code3} className="w-12 h-12 rounded-lg border focus:border-indigo-600 outline-none text-center text-2xl"
                        onChange={(e) => handleChange(e, "code3")}
                        onKeyUp={inputFocus}
                    />
                    <input type="text" data-index="3" placeholder="0" value={state.code4} className="w-12 h-12 rounded-lg border focus:border-indigo-600 outline-none text-center text-2xl"
                        onChange={(e) => handleChange(e, "code4")}
                        onKeyUp={inputFocus}
                    />

                </div>
                    <button className="px-7 mt-10 py-2.5 text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Verify OTP</button>
            </div>
        </div>
    );
};

export default SignUp;