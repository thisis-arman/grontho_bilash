import { useGetUsersQuery } from "../../../redux/features/user/userApi";
import { useGetOrdersQuery } from "../../../redux/features/order/orderApi";
import { useGetProductsQuery } from "../../../redux/features/book/bookApi";
import { Users, ShoppingBag, BookOpen, TrendingUp, DollarSign, Package, Activity, ArrowRight } from "lucide-react";
import Stats from "../../../components/ui/dashboardComponents/PieChart";
import { Link } from "react-router-dom";

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
            <div className="flex items-center justify-center min-h-[60vh] bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const summaryCards = [
        {
            title: "Total Sales",
            value: `৳ ${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bgLight: "bg-emerald-500/10",
            trend: "+12.5%",
            trendColor: "text-emerald-500 bg-emerald-500/10",
        },
        {
            title: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            color: "text-blue-500",
            bgLight: "bg-blue-500/10",
            trend: "+5.2%",
            trendColor: "text-blue-500 bg-blue-500/10",
        },
        {
            title: "Books Listed",
            value: totalProducts,
            icon: BookOpen,
            color: "text-amber-500",
            bgLight: "bg-amber-500/10",
            trend: "+2.1%",
            trendColor: "text-amber-500 bg-amber-500/10",
        },
        {
            title: "Total Users",
            value: totalUsers,
            icon: Users,
            color: "text-purple-500",
            bgLight: "bg-purple-500/10",
            trend: "+18.2%",
            trendColor: "text-purple-500 bg-purple-500/10",
        }
    ];

    return (
        <div className="p-2 sm:p-4  bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">Welcome back, here's what's happening with your store today.</p>
                </div>
                <Link to="/admin/product-management" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                    <TrendingUp size={18} />
                    <span className="hidden sm:inline">Manage Products</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-2">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-card rounded-lg p-2 md:p-4 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${card.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className={`${card.color}`} size={18} />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{card.value}</h3>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${card.trendColor}`}>
                                {card.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Activity size={20} className="text-amber-500" />
                                Recent Activity
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Latest successful orders from your customers</p>
                        </div>
                        <Link to="/admin/order-management" className="text-sm font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl transition-colors shrink-0">
                            View All Orders
                        </Link>
                    </div>

                    <div className="flex-1 p-0">
                        {ordersData?.data?.slice(0, 5).map((order: any, i: number) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border last:border-0 hover:bg-muted/50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 border border-border">
                                        <Package size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm sm:text-base">Order #{order?._id?.slice(-6).toUpperCase() || 'UNKN'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-block w-2 h-2 rounded-full ${order?.status === 'Delivered' ? 'bg-emerald-500' : order?.status === 'Processing' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                                            <p className="text-xs sm:text-sm font-medium text-muted-foreground capitalize">
                                                {order?.status || 'Pending'} • ৳ {order?.transaction?.amount || order?.totalPrice || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                    <p className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                                        {new Date(order?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors sm:hidden">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!ordersData?.data || ordersData.data.length === 0) && (
                            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <ShoppingBag className="text-muted-foreground" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No recent orders</h3>
                                <p className="text-sm text-muted-foreground mt-1">When customers place orders, they will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart section */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-full min-h-[300px] flex flex-col">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-amber-500" />
                            Sales Overview
                        </h2>
                        <div className="flex-1 flex items-center justify-center relative">
                            {/* Make Stats Component take the full available height and width */}
                            <div className="w-full h-full max-h-[300px]">
                                <Stats />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions / CTA */}
            <div className="mt-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 shadow-lg">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute left-0 bottom-0 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 w-full sm:w-auto text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3">Boost Your Inventory</h3>
                    <p className="text-amber-50 text-sm sm:text-base max-w-md mx-auto sm:mx-0 leading-relaxed">
                        Keep your customers engaged with fresh books. Add new arrivals or manage existing inventory effectively.
                    </p>
                </div>

                <Link to="/admin/product-management" className="relative z-10 w-full sm:w-auto bg-white hover:bg-amber-50 text-amber-900 font-bold px-8 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap group">
                    Go to Products
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;