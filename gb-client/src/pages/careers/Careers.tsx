const Careers = () => {
    return (
        <div>
            <section className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-stone-900 mb-4">আমাদের টিমে যোগ দাও</h2>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        দারুণ কিছুর অংশ হও। অনলাইন পড়াশোনার ভবিষ্যৎ গড়তে আমরা আগ্রহী আর পরিশ্রমী মানুষ খুঁজছি।
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">ফ্রন্টএন্ড ইঞ্জিনিয়ার</h3>
                        <p className="text-stone-600 mb-4">আমরা এমন একজন ক্রিয়েটিভ ফ্রন্টএন্ড ডেভেলপার খুঁজছি, যে সুন্দর আর সহজে ব্যবহার করা যায় এমন ইন্টারফেস দিয়ে আমাদের প্ল্যাটফর্মকে প্রাণ দিতে পারবে।</p>
                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                            <span>ফুল-টাইম</span>
                            <span>রিমোট</span>
                            <span>ঢাকা</span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white hover:bg-black transition">
                            এখনই আবেদন করো
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">কনটেন্ট রাইটার</h3>
                        <p className="text-stone-600 mb-4">বই আর লেখালেখি ভালোবাসো? আকর্ষণীয় বইয়ের বর্ণনা আর প্রচারের কনটেন্ট লেখার জন্য আমরা দক্ষ লেখক খুঁজছি।</p>
                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                            <span>পার্ট-টাইম</span>
                            <span>রিমোট</span>
                            <span>সময় নিজের মতো</span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white hover:bg-black transition">
                            এখনই আবেদন করো
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-stone-600">মনের মতো পদ খুঁজে পাচ্ছো না? তবুও তোমার সিভি পাঠাও। আমরা সবসময় বড় হচ্ছি!</p>
                </div>
            </section>
        </div>
    );
};

export default Careers;
