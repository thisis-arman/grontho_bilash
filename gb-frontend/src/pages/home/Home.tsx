import Navbar from "../../shared/Navbar";
import Category from "./Category";
import Stats from "./stats";

const Home = () => {
    return (
        <>
            <div className=" bg-opacity-95 relative top-0 z-0 text-black">


                <section className="relative pt-16">
                    <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-28 md:px-8">
                        <div className="space-y-5 max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl  font-extrabold mx-auto md:text-7xl">
                                Your Marketplace for Affordable Learning Resources
                            </h2>
                            <p className="max-w-2xl mx-auto text-gray-900 text-lg">
                                Grontho Bilash is where students come to buy, sell, and exchange educational materials. From textbooks to study guides, find everything you need in one convenient platform.
                            </p>
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex items-center justify-center bg-white rounded-lg p-1 sm:max-w-xl sm:mx-auto"
                            >
                                <input
                                    type="text"
                                    placeholder="Search for books, notes, and more"
                                    className="text-gray-500 w-full outline-none focus:ring-0 p-2 focus:outline-none"
                                />
                                <button
                                    className="p-2 px-3 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 duration-150 outline-none shadow-md focus:shadow-none sm:px-4"
                                >
                                    Search
                                </button>
                            </form>

                            {/* <div className="flex justify-center items-center gap-x-4 text-gray-400 text-sm">
                            <div className="flex">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" /></svg>
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" /></svg>
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" /></svg>
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" /></svg>
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" /></svg>
                            </div>
                            <p><span className="text-gray-100">5.0</span> by over 200 users</p>
                        </div> */}
                        </div>
                    </div>
                    <div className="absolute inset-0 m-auto max-w-xs h-[357px] blur-[118px] sm:max-w-md md:max-w-lg" style={{ background: "linear-gradient(106.89deg, rgba(192, 132, 252, 0.11) 15.73%, rgba(14, 165, 233, 0.41) 15.74%, rgba(232, 121, 249, 0.26) 56.49%, rgba(79, 70, 229, 0.4) 115.91%)" }}></div>
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