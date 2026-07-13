const TermsOfUse = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">Terms of Use</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">Terms of Use</h1>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">User Accounts</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">Book Listings</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        When you list a book, you must provide accurate information about its condition and pricing. We reserve the right to remove listings that violate our policies.
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">Payment and Shipping</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        All payments are processed securely through our platform. Sellers are responsible for shipping books to buyers in a timely manner.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;