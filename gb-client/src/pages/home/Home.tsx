import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Category from "./Category";
import Stats from "./stats";
import { BookOpen, Laptop, Recycle } from "lucide-react";

const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <div className="bg-opacity-95 relative top-0 z-0 text-black">
                <section className="relative overflow-hidden bg-white pt-16 pb-12">
                    {/* Yellow Background Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                        <div 
                            className="absolute inset-0 opacity-40 blur-[120px]" 
                            style={{ background: "radial-gradient(circle at 50% 30%, rgba(234, 179, 8, 0.4), rgba(250, 204, 21, 0.1), transparent 70%)" }}
                        ></div>
                    </div>

                    <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-16 md:px-8 lg:py-24">
                        <div className="space-y-8 max-w-4xl mx-auto text-center">
                            
                            {/* Social Proof Badge */}
                            <div className="inline-flex items-center gap-x-2 bg-yellow-50/80 border border-yellow-200 backdrop-blur-md p-1 pr-4 rounded-full text-sm font-medium text-yellow-800 shadow-sm transition-all hover:shadow-md cursor-default">
                                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">New</span>
                                <p>Digital products & premium notes available now!</p>
                            </div>

                            {/* Typography */}
                            <h1 className="text-5xl  font-extrabold tracking-tight text-gray-900 md:text-7xl lg:leading-[1.1]">
                                Give Books a <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                                    Second Life
                                </span>
                            </h1>

                            <p className="max-w-2xl mx-auto text-gray-600 text-lg md:text-xl leading-relaxed">
                                Grontho Bilash is your trusted marketplace to buy and sell <strong className="text-yellow-700">used books, study resources, and digital products</strong>. Affordable learning starts here.
                            </p>

                            {/* Feature Highlights */}
                            <div className="flex flex-wrap justify-center gap-6 py-4 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                    <Recycle className="w-4 h-4 text-yellow-600" />
                                    <span>Old & Used Books</span>
                                </div>
                                <div className="flex items-center gap-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                    <Laptop className="w-4 h-4 text-yellow-600" />
                                    <span>Digital Products</span>
                                </div>
                                <div className="flex items-center gap-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                    <BookOpen className="w-4 h-4 text-yellow-600" />
                                    <span>Study Notes</span>
                                </div>
                            </div>

                            {/* Premium Search Bar */}
                            <div className="relative max-w-2xl mx-auto group mt-4">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex items-center bg-white border border-yellow-200 rounded-2xl p-2 shadow-xl shadow-yellow-100/50 transition-all focus-within:ring-4 focus-within:ring-yellow-500/20 focus-within:border-yellow-400"
                                >
                                    <div className="pl-4 text-yellow-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search old books, digital notes, authors..."
                                        className="w-full bg-transparent px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400 border-none focus:border-none focus:ring-0"
                                    />
                                    <button
                                        type="submit"
                                        className="hidden sm:block px-8 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-all active:scale-95 shadow-md shadow-yellow-200"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Simple Trust Signals */}
                            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 opacity-80 transition-all">
                                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Trusted by students</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <Category />

            {/* CTA SECTION - Updated to Yellow Theme */}
            <section className="relative w-full py-16 bg-yellow-50 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-yellow-200 opacity-50 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-yellow-300 opacity-30 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        <div className="flex-1 max-w-lg mx-auto text-center lg:max-w-xl lg:text-left">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm mb-4">
                                Sell your resources
                            </div>
                            <h3 className="text-3xl text-gray-900 font-bold md:text-4xl lg:text-5xl tracking-tight">
                                Turn your old books into <span className="text-yellow-600">cash</span> today.
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mt-4">
                                Don't let your past semester books gather dust. List them on our platform, help juniors find affordable resources, and earn money for your next read! We also support digital notes.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/user/add-product')}
                                    className="px-8 py-3.5 text-white font-bold bg-yellow-500 hover:bg-yellow-600 rounded-xl inline-flex items-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    Start Selling Now
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-md mx-auto lg:max-w-none lg:w-auto relative">
                            {/* Decorative elements behind the image could go here */}
                            <div className="bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border border-yellow-100">
                                <img
                                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
                                    alt="Students studying with books"
                                    className="w-full rounded-xl object-cover h-80"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROMOTIONAL SEGMENT */}
            <Stats/>
          
        </>
    )
}

export default Home;