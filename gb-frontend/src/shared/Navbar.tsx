import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, selectCurrentUser, TUser } from "../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getProductsFromCart } from "../../src/redux/features/cart/cartSlice";

const Navbar = () => {

    const user = useAppSelector(selectCurrentUser) as TUser;
    const dispatch = useAppDispatch();
    const navigate = useNavigate()

    const cartItems = useAppSelector(getProductsFromCart);


    const [state, setState] = useState(false)

    // Replace javascript:void(0) paths with your paths
    const navigation = [
        { title: "Blogs", path: "/blogs" },
        { title: "Books", path: "/books" },
        { title: "Dashboard", path: `/${user?.role}/dashboard` }
    ]

    useEffect(() => {
        document.onclick = (e) => {
            const target = e.target as Element;
            if (!target.closest(".menu-btn")) setState(false);
        };
    }, [])

    const handleLogout = () => {

        dispatch(logout())
        navigate('/login')
    }

    const Brand = () => (
        <div className="flex items-center justify-between py-3 md:block">
            <a href="/">
                <img
                    src="/src/assets/logo/grontho-bilash-transparent.png"
                    width={30}
                    height={20}
                    alt="Grontho Bilash "
                    className="object-fill"
                />
            </a>
            <div className="md:hidden">
                <button className="menu-btn text-gray-400 hover:text-gray-300"
                    onClick={() => setState(!state)}
                >
                    {
                        state ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )
                    }
                </button>
            </div>
        </div>
    )
    return (
        <div className=" flex justify-center">
            <header className="shadow border-gray-500 glass bg-yellow-100  mt-3 fixed w-full max-w-screen-md mx-auto top-0  z-10  rounded-full ">
                <div className={` md:hidden ${state ? "mx-2 pb-5" : "hidden"}`}>
                    <Brand />
                </div>
                <nav className={` md:text-sm ${state ? "absolute z-20 top-0 inset-x-0 bg-gray-800 rounded-xl mx-2  md:mx-0 md:mt-0 md:relative  " : ""}`}>
                    <div className="gap-x-14 items-center max-w-screen-xl mx-auto px-4 md:flex md:px-8">
                        <Brand />
                        <div className={`flex-1 items-center mt-8 md:mt-0 md:flex ${state ? 'block' : 'hidden'} `}>
                            <ul className="flex-1 justify-end items-center space-y-4 md:flex md:space-x-6 md:space-y-0">
                                {
                                    navigation.map((item, idx) => {
                                        return (
                                            <li key={idx} className="">
                                                <a href={item.path} className="block">
                                                    {item.title}
                                                </a>
                                            </li>
                                        )
                                    })
                                }
                                <li>

                                    {user ?
                                        <><a onClick={handleLogout} className="flex items-center justify-center gap-x-1 py-2 px-4 text-gray-900 font-medium bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 duration-150 rounded-full md:inline-flex cursor-pointer">
                                            Log Out
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>

                                        </a>
                                            
                                        </>
                                        :
                                        <Link to='/login' className="flex items-center justify-center gap-x-1 py-2 px-4 text-gray-900 font-medium bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 duration-150 rounded-full md:inline-flex">
                                            Login
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    }
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header >
      </div>
    );
};

export default Navbar;