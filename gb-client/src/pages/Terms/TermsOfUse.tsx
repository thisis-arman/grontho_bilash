const TermsOfUse = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">ব্যবহারের শর্তাবলি</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">ব্যবহারের শর্তাবলি</h1>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">ইউজার অ্যাকাউন্ট</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        আমাদের সার্ভিস ব্যবহার করতে তোমাকে একটা অ্যাকাউন্ট খুলতে হবে। তোমার অ্যাকাউন্টের লগইন তথ্য গোপন রাখার দায়িত্ব তোমার।
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">বইয়ের লিস্টিং</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        বইয়ের লিস্টিং দিলে তার অবস্থা আর দাম সম্পর্কে সঠিক তথ্য দিতে হবে। আমাদের নীতিমালা ভাঙে এমন লিস্টিং সরিয়ে দেওয়ার অধিকার আমরা রাখি।
                    </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">পেমেন্ট ও ডেলিভারি</h3>
                    <p className="text-text text-sm md:text-base leading-relaxed">
                        সব পেমেন্ট আমাদের প্ল্যাটফর্মের মাধ্যমে নিরাপদে প্রসেস করা হয়। ক্রেতার কাছে সময়মতো বই পাঠানোর দায়িত্ব বিক্রেতার।
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
