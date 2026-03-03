import { useGetUsersQuery } from "../../../redux/features/user/userApi";
import { useGetOrdersQuery } from "../../../redux/features/order/orderApi";
import { useGetProductsQuery } from "../../../redux/features/book/bookApi";
import { Users, ShoppingBag, BookOpen, TrendingUp, DollarSign, Package } from "lucide-react";
import Stats from "../../../components/ui/dashboardComponents/PieChart";

const AdminDashboard = () => {
    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(undefined);
    const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery(undefined);
    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(undefined);

    const totalUsers = usersData?.data?.length || 0;
    const totalOrders = ordersData?.data?.length || 0;
    const totalProducts = productsData?.data?.meta?.total || productsData?.data?.result?.length || productsData?.data?.length || 0;

    // calculate total revenue if ordersData has transaction amount or totalPrice
    const totalRevenue = ordersData?.data?.reduce((acc: number, order: any) => acc + (order?.transaction?.amount || order?.totalPrice || 0), 0) || 0;

    const isLoading = usersLoading || ordersLoading || productsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const summaryCards = [
        {
            title: "Total Users",
            value: totalUsers,
            icon: Users,
            color: "bg-blue-500",
            lightBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Books Listed",
            value: totalProducts,
            icon: BookOpen,
            color: "bg-amber-500",
            lightBg: "bg-amber-100",
            iconColor: "text-amber-600",
        },
        {
            title: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            color: "bg-emerald-500",
            lightBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
        },
        {
            title: "Total Revenue",
            value: `৳ ${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "bg-rose-500",
            lightBg: "bg-rose-100",
            iconColor: "text-rose-600",
        }
    ];

    return (
        <div className=" sm:p-6 lg:p-8 bg-stone-50 min-h-screen max-w-screen">
            {/* Stats Grid */}
            <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.lightBg}`}>
                                <card.icon className={card.iconColor} size={24} />
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${card.color}`}>
                                +12%
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">{card.title}</p>
                            <h3 className="text-3xl font-black text-stone-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-stone-900">Recent Activity</h2>
                            <p className="text-sm text-stone-500">Latest successful orders</p>
                        </div>
                        <button className="text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors">
                            View All
                        </button>
                    </div>

                    {/* Placeholder for recent activity list */}
                    <div className="space-y-4">
                        {ordersData?.data?.slice(0, 5).map((order: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Package size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900 text-sm">Order #{order?._id?.slice(-6).toUpperCase() || 'UNKN'}</p>
                                        <p className="text-xs font-medium text-stone-500 capitalize">{order?.status || 'Pending'} • ৳ {order?.transaction?.amount || order?.totalPrice || 0}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg inline-block">Today</p>
                                </div>
                            </div>
                        ))}
                        {(!ordersData?.data || ordersData.data.length === 0) && (
                            <div className="text-center py-8 text-stone-400 text-sm">
                                No recent orders found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Stats />
                </div>
            </div>

            {/* Call to action or quick actions */}
            <div className="mt-8 bg-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 w-full sm:w-auto text-center sm:text-left">
                    <h3 className="text-2xl font-black mb-2">Need to manage books?</h3>
                    <p className="text-stone-400 text-sm max-w-sm mx-auto sm:mx-0">Manage your inventory efficiently from the products dashboard to keep your catalogue fresh.</p>
                </div>
                <button className="w-full sm:w-auto relative z-10 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap">
                    Manage Products <TrendingUp size={16} />
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;