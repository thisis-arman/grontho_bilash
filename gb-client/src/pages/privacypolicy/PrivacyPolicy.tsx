import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">Privacy Policy</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">Our Privacy Policy</h1>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">Information We Collect</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        We collect personal information such as your name, email address, and phone number when you create an account or make a purchase.
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">How We Use Your Information</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        We use your information to process your orders, improve our services, and send you updates about new books.
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">Security</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        We take the security of your information very seriously and use industry-standard measures to protect your data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;