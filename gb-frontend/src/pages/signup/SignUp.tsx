'use client'
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import SignUpForm from "./SignUpForm";
import { useCreateOtpMutation, useVerifyOtpMutation } from "../../redux/features/otp/otpApi";

const SignUp = () => {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(true);
    const [otpInfo, setOtpInfo] = useState({});
    const [createOtp] = useCreateOtpMutation();
    const [verifyOtp] = useVerifyOtpMutation();

    const [steps, setStep] = useState({
        stepsCount: [1, 2, 3],
        currentStep: 1
    });

    const fieldsRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState({ code1: "", code2: "", code3: "", code4: "", code5: "", code6: "" });

    // Function to handle input focus behavior
    const inputFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const elements = fieldsRef.current!.children;
        const dataIndex = +e.currentTarget.getAttribute("data-index")!;

        if (e.key === "Delete" || e.key === "Backspace") {
            const prev = dataIndex - 1;
            if (prev > -1) (elements[prev] as HTMLElement).focus();
        } else {
            const next = dataIndex + 1;
            if (next < elements.length && e.currentTarget.value && e.key.length === 1) (elements[next] as HTMLElement).focus();
        }
    };

    // Handle individual OTP input field changes
    const handleChange = (e: ChangeEvent<HTMLInputElement>, codeNumber: string) => {
        const value = e.target.value.slice(-1); // Ensure only 1 character
        setState({ ...state, [codeNumber]: value });
    };

    // Handle sending OTP
    const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = (e.currentTarget as HTMLFormElement).email.value;

        try {
            const response = await createOtp({ email });
            if (response.data?.success) {
                setOtpInfo(response.data);
                localStorage.setItem('otpInfo', JSON.stringify({ email }));
                setIsOtpSent(true);
                setStep({ currentStep: 2, stepsCount: [1, 2, 3] });
            }
        } catch (error) {
            console.error("Error during OTP creation:", error);
        }
    };

    // Handle verifying OTP
    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otp = `${state.code1}${state.code2}${state.code3}${state.code4}${state.code5}${state.code6}`;
        const savedData = localStorage.getItem('otpInfo');
        const email = savedData ? JSON.parse(savedData).email : null;

        try {
            const response = await verifyOtp({ email, otp: Number(otp) });
            console.log({response});
            if (response.data && response.data?.data?.verified) {
                console.log(response);
                setIsVerified(true);
                setStep({ currentStep: 3, stepsCount: [1, 2, 3] });
            } else {
                console.log("Invalid OTP or OTP verification failed.");
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
        }
    };

    return (
        <>
            <div className="max-w-lg mx-auto p-4 sm:px-0 pt-10">
                <ul aria-label="Steps" className="flex items-center">
                    {steps.stepsCount.map((item, idx) => (
                        <li key={idx} aria-current={steps.currentStep === idx + 1 ? "step" : undefined} className="flex-1 last:flex-none flex items-center">
                            <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${steps.currentStep > idx + 1 ? "bg-yellow-600 border-yellow-600" : steps.currentStep === idx + 1 ? "border-yellow-600" : ""}`}>
                                <span className={`w-2.5 h-2.5 rounded-full bg-yellow-600 ${steps.currentStep !== idx + 1 ? "hidden" : ""}`}></span>
                                {steps.currentStep > idx + 1 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                )}
                            </div>
                            <hr className={`w-full border ${idx + 1 === steps.stepsCount.length ? "hidden" : steps.currentStep > idx + 1 ? "border-yellow-600" : ""}`} />
                        </li>
                    ))}
                </ul>
            </div>

            {!isVerified ? (
                <div className="p-4 max-w-sm mx-auto">
                    {!isOtpSent ? (
                        <div className="relative max-w-sm mx-auto flex flex-col justify-center">
                            <form onSubmit={handleSendOtp}>
                                <div>
                                    <svg className="w-6 h-6 text-gray-400 absolute left-3 mt-2 inset-y-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-yellow-500 shadow-sm rounded-lg"
                                    />
                                </div>
                                <button type="submit" className="px-7 mt-10 py-2.5 max-w-xs mx-auto text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Send OTP</button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="max-w-sm mx-auto">
                            <label className="text-gray-600">Verification code</label>
                            <div ref={fieldsRef} className="mt-2 flex items-center gap-x-2">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        data-index={index}
                                        placeholder="0"
                                        value={state[`code${index + 1}` as keyof typeof state]}
                                        className="w-12 h-12 rounded-lg border focus:border-yellow-600 outline-none text-center text-2xl"
                                        onChange={(e) => handleChange(e, `code${index + 1}`)}
                                        onKeyUp={inputFocus}
                                    />
                                ))}
                            </div>
                            <button type="submit" className="px-7 mt-10 max-w-xs mx-auto py-2.5 text-white bg-yellow-500 rounded-lg shadow-md focus:shadow-none duration-100 ring-offset-2 ring-yellow-500 focus:ring-2">Verify OTP</button>
                        </form>
                    )}
                </div>
            ) : (
                <SignUpForm isVerified={isVerified} />
            )}
        </>
    );
};

export default SignUp;
