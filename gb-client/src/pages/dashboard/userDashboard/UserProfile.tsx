import { Mail, Phone, Shield, User, Calendar, Edit3, Key } from "lucide-react";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetMeQuery } from "../../../redux/features/user/userApi";
import { useAppSelector } from "../../../redux/hooks";

const UserProfile = () => {
    const user = useAppSelector(selectCurrentUser) as TUser;
    const { data: response, isLoading } = useGetMeQuery(user?.email);
    const userData = response?.data;

    if (isLoading) {
        return <div className="p-10 text-center animate-pulse">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your personal information and security.</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${userData?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {userData?.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Avatar & Basic Info */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="size-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <User size={48} />
                    </div>
                    <h2 className="font-bold text-lg text-gray-800">{userData?.name}</h2>
                    <p className="text-sm text-gray-400 capitalize mb-4">{userData?.role}</p>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all text-sm font-medium border border-gray-200">
                        <Edit3 size={16} /> Edit Profile
                    </button>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Information Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Address</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Mail size={16} className="text-yellow-600" />
                                    {userData?.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone Number</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Phone size={16} className="text-yellow-600" />
                                    {userData?.contactNo || "Not provided"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Joined On</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Calendar size={16} className="text-yellow-600" />
                                    {new Date(userData?.createdAt).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <Shield size={18} className="text-yellow-600" /> Security
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Password</p>
                                <p className="text-xs text-gray-500">Last changed: {userData?.passwordChangedAt ? new Date(userData.passwordChangedAt).toLocaleDateString() : 'Never'}</p>
                            </div>
                            <button className="flex items-center gap-2 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-all text-sm font-bold shadow-md shadow-yellow-100">
                                <Key size={16} /> Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;