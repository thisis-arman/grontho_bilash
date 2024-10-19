import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { Link } from "react-router-dom";
import { TBook } from "../../../redux/features/book/bookSlice";
import { useAppSelector } from "../../../redux/hooks";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";


const MyProducts = () => {
    // const { data, isLoading } = useGetBooksQuery(undefined);
    const { email,  } = useAppSelector(selectCurrentUser) as TUser;
    const { data, isLoading } = useGetBooksByEmailQuery(email);
    console.log({ data });
 
    return (
        <>
            {
                isLoading ?
                    <p>Loading...</p>

                    : <div className="max-w-screen-xl mx-auto px-4 md:px-8">
                        <div className="items-start justify-between md:flex">
                            <div className="max-w-lg">
                                <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                                    My Products
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    The product i have listed from this profile
                                </p>
                            </div>
                            <div className="mt-3 md:mt-0">
                                <Link to={'/user/add-product'}
                                    className="inline-block px-4 py-2 text-white duration-150 hover:text-black font-medium bg-yellow-600 rounded-lg hover:bg-yellow-500 active:bg-yellow-700 md:text-sm">
                                    Add Product
                                </Link>
                            </div>
                        </div>
                        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
                            <table className="w-full table-auto text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="py-3 px-6">Book Title</th>
                                        <th className="py-3 px-6">Price</th>
                                        <th className="py-3 px-6">Condition</th>
                                        <th className="py-3 px-6">Delivery Option</th>

                                        <th className="py-3 px-6 text-center">Actions</th>

                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 divide-y">
                                    {
                                        data?.data?.map((item: TBook, idx: number) => (
                                            <tr key={idx}>
                                                <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                                                    <img src={item?.images[0]} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <span className="block text-gray-700 text-sm font-medium">{item.bookTitle}</span>
                                                        {/* <span className="block text-gray-700 text-xs">{item.email}</span> */}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap"> &#2547; {item.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.condition}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.deliveryOption}</td>
                                                <td className="text-right px-6 whitespace-nowrap">
                                                    <a href="javascript:void()" className="py-2 px-3 font-medium text-yellow-600 hover:text-yellow-500 duration-150 hover:bg-gray-50 rounded-lg">
                                                        Edit
                                                    </a>
                                                    <button  className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
            }
        </>
    )
}

export default MyProducts;