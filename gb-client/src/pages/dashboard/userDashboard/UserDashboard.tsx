import React from 'react';
import { useGetBooksByEmailQuery } from "../../../redux/features/book/bookApi";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetOrderByUserIdQuery } from "../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../redux/hooks";
import ReuseableCard from "./components/ReuseableCard";
import { Link } from "react-router-dom";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { BookOpen, Wallet, ShoppingBag, Clock } from 'lucide-react';

const UserDashboard = () => {
    const { id, email, name } = useAppSelector(selectCurrentUser) as TUser;

    const { data: orderData, isLoading: isLoadingOrders } = useGetOrderByUserIdQuery(id);
    const { data: bookData, isLoading: isLoadingBooks } = useGetBooksByEmailQuery(email);

    const orders = orderData?.data || [];
    const books = bookData?.data || [];
    
    const totalSpentAmount = orders.reduce((acc: number, data: any) => acc + data.totalAmount, 0);
    const pendingOrders = orders.filter((order: any) => order.orderStatus === 'Pending' || order.orderStatus === 'Processing');

    // Chart Data Preparation (Group by Date or use Sequence)
    const chartData = orders.map((order: any, idx: number) => ({
        name: `Order ${idx + 1}`,
        amount: order.totalAmount,
    }));

    if (isLoadingOrders || isLoadingBooks) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 ">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back, {name || 'User'}! 👋
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Here is what's happening with your bookstore account today.
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ReuseableCard
                        amount={`৳ ${totalSpentAmount}`}
                        icon={<Wallet color='gold' className="w-6 h-6" />}
                        stat={'+12.5%'}
                        trend="up"
                        title="Total Spent"
                    />
                    <ReuseableCard
                        amount={orders.length}
                        icon={<ShoppingBag color='gold' className="w-6 h-6" />}
                        stat={'+5.2%'}
                        trend="up"
                        title="Total Orders"
                    />
                    <ReuseableCard
                        amount={pendingOrders.length}
                        icon={<Clock color='gold' className="w-6 h-6 text-amber-600" />}
                        stat={pendingOrders.length > 0 ? "Action needed" : "All clear"}
                        trend={pendingOrders.length > 0 ? "down" : "neutral"}
                        title="In Progress"
                    />
                    <ReuseableCard
                        amount={books.length}
                        icon={<BookOpen color='gold' className="w-6 h-6 text-indigo-600" />}
                        stat={'+2 New this week'}
                        trend="up"
                        title="Books Owned"
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Spending Overview</h2>
                            <p className="text-sm text-gray-500">Your total spending across recent orders.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(value) => `৳ ${value}`} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`৳ ${value}`, 'Amount']}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No order data available yet to display graph.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders List Component */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                                <p className="text-sm text-gray-500">Your last 5 transactions</p>
                            </div>
                            <Link to="/user/my-orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                View all
                            </Link>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                {orders.slice(0, 5).map((order: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                                                #{order.orderId ? order.orderId.substring(0, 3) : idx}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {order.books?.[0]?.bookTitle || 'Book Order'} {order.books?.length > 1 ? `+${order.books.length - 1} more` : ''}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">৳ {order.totalAmount}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                                                ${order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 
                                                order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                                                'bg-blue-100 text-blue-800'}`}>
                                                {order.orderStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        You haven't placed any orders yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;