const Careers = () => {
    return (
        <div>
            <section className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-stone-900 mb-4">Join Our Team</h2>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        Be part of something special. We’re looking for passionate individuals to help us
                        build the future of online learning.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">Frontend Engineer</h3>
                        <p className="text-stone-600 mb-4">We're looking for a creative frontend developer who can bring our platform to life with beautiful, intuitive interfaces.</p>
                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                            <span>Full-time</span>
                            <span>Remote</span>
                            <span>Dhaka</span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white hover:bg-black transition">
                            Apply Now
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">Content Writer</h3>
                        <p className="text-stone-600 mb-4">Do you love books and writing? We need talented writers to create engaging course descriptions and promotional content.</p>
                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                            <span>Part-time</span>
                            <span>Remote</span>
                            <span>Flexible</span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white hover:bg-black transition">
                            Apply Now
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-stone-600">Don’t see the perfect role? Send us your CV anyway. We’re always growing!</p>
                </div>
            </section>
        </div>
    );
};

export default Careers;