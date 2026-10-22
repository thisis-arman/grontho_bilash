const PrivacyPolicy = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">গোপনীয়তা নীতি</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">আমাদের গোপনীয়তা নীতি</h1>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">আমরা কী তথ্য নিই</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        তুমি অ্যাকাউন্ট খুললে বা কিছু কিনলে আমরা তোমার নাম, ইমেইল ঠিকানা আর ফোন নম্বরের মতো ব্যক্তিগত তথ্য নিই।
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">তোমার তথ্য আমরা কীভাবে ব্যবহার করি</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        তোমার অর্ডার প্রসেস করতে, আমাদের সার্ভিস আরও ভালো করতে আর নতুন বইয়ের খবর পাঠাতে আমরা তোমার তথ্য ব্যবহার করি।
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">নিরাপত্তা</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        তোমার তথ্যের নিরাপত্তা আমাদের কাছে খুব গুরুত্বপূর্ণ। তোমার ডেটা সুরক্ষিত রাখতে আমরা প্রচলিত মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি।
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
