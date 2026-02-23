import Navbar from "../../shared/Navbar";
import Category from "./Category";
import Stats from "./stats";

const Home = () => {
    return (
        <>
            <div className=" bg-opacity-95 relative top-0 z-0 text-black">


               <section className="relative overflow-hidden bg-slate-50 pt-16">
    {/* Refined Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
        <div 
            className="absolute inset-0 opacity-30 blur-[120px]" 
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.4), rgba(14, 165, 233, 0.2), transparent 70%)" }}
        ></div>
    </div>

    <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-24 md:px-8 lg:py-32">
        <div className="space-y-8 max-w-4xl mx-auto text-center">
            
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-x-2 bg-white/60 border border-gray-200 backdrop-blur-md p-1 pr-3 rounded-full text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow-md cursor-default">
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">New</span>
                <p>Join 2,000+ students exchanging books daily</p>
            </div>

            {/* Typography: Tighter tracking and balanced line height */}
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl lg:leading-[1.1]">
                Your Marketplace for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500">
                    Affordable Learning
                </span>
            </h1>

            <p className="max-w-2xl mx-auto text-gray-600 text-lg md:text-xl leading-relaxed">
                Grontho Bilash is the premier destination to buy, sell, and exchange educational materials. Quality resources, student-friendly prices.
            </p>

            {/* Premium Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-xl shadow-gray-200/50 transition-all focus-within:ring-4 focus-within:ring-yellow-500/10 focus-within:border-yellow-500/50"
                >
                    <div className="pl-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        className="w-full bg-transparent px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400 border-none focus:border-none "
                    />
                    <button
                        className=" sm:block px-8 py-3 rounded-xl font-semibold text-black bg-yellow-500 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-300"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Simple Trust Signals */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Trusted by students from</p>
                <div className="flex gap-4 font-bold text-xl text-gray-400 italic">
                    <span>UNIVERSITY</span>
                    <span>COLLEGE</span>
                    <span>ACADEMY</span>
                </div>
            </div>
        </div>
    </div>
</section>
            </div>
            <Category />

            {/* CTA SECTION */}
            <section className="relative max-w-screen-xl mx-auto py-4 px-4 md:px-8 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-40"></div>
                <div className="relative z-10 gap-5 items-center lg:flex">
                    <div className="flex-1 max-w-lg py-5 sm:mx-auto sm:text-center lg:max-w-max lg:text-left">
                        <h3 className="text-3xl text-gray-800 font-semibold md:text-4xl">
                            build your websites with <span className="text-indigo-600">high performance</span>
                        </h3>
                        <p className="text-gray-500 leading-relaxed mt-3">
                            Nam erat risus, sodales sit amet lobortis ut, finibus eget metus. Cras aliquam ante ut tortor posuere feugiat. Duis sodales nisi id porta lacinia.
                        </p>
                        <a
                            className="mt-5 px-4 py-2 text-indigo-600 font-medium bg-indigo-50 rounded-full inline-flex items-center"
                            href="javascript:void()">
                            Try it out
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                    <div className="flex-1 mt-5 mx-auto sm:w-9/12 lg:mt-0 lg:w-auto">
                        <img
                            src="https://i.postimg.cc/kgd4WhyS/container.png"
                            alt=""
                            className="w-full"
                        />
                    </div>
                </div>
            </section>

            {/* PROMOTIONAL SEGMENT */}
            <Stats/>
          
        </>
    )
}

export default Home;