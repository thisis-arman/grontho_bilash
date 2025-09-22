import { useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";

import { useAppSelector } from "../../../redux/hooks";
import { Link } from "react-router-dom";
// import { useGetBooksByEmailQuery } from "../../../redux/features/order/orderApi";
const MyOrders = () => {

        // const { data, isLoading } = useGetBooksQuery(undefined);
        const { id } = useAppSelector(selectCurrentUser) as TUser;

        const { data, isLoading } = useGetOrderByUserIdQuery(id);
    return (
        <>
         {
                        isLoading ?
                            <p>Loading...</p>
        
                            : <div className="max-w-screen-xl mx-auto px-4 md:px-8">
                                <div className="items-start justify-between md:flex">
                                    <div className="max-w-lg">
                                        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                                            My Orders
                                        </h3>
                                        <p className="text-gray-600 mt-2">
                                            The product i have ordered
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
                                                <th className="py-3 px-6">Order NO</th>
                                                <th className="py-3 px-6">Product Title</th>
                                                <th className="py-3 px-6">Ordered Amount</th>
                                                <th className="py-3 px-6">Status</th>
                                                <th className="py-3 px-6">Actions</th>
        
                                                <th className="py-3 px-6 text-center">Actions</th>
        
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 divide-y">
                                            {
                                                data?.data?.map((item, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                                                            <td className="px-6 py-4 whitespace-nowrap">#{item?.orderId}</td>
                                                            {/* <img src={item?} className="w-10 h-10 rounded-full" /> */}
                                                            <div>
                                                                <span className="block text-gray-700 text-sm font-medium">{item?.books[idx]?.bookTitle}</span>
                                                                <span className="block text-gray-700 text-sm font-medium">{item?.books[idx +1]?.bookTitle}</span>
                                                                {/* <span className="block text-gray-700 text-xs">{item.email}</span> */}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">&#2547;  {item?.totalAmount}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap"> {item?.buyer.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{item?.paymentStatus}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{item?.orderStatus}</td>
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
    );
};

export default MyOrders;