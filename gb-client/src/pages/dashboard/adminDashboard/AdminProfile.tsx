import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  User, Mail, Phone, Shield, Calendar, Edit3, Key, 
  Trash2, ShoppingBag, BookOpen, Users, Award,
  Check, X, Eye, EyeOff, Lock
} from "lucide-react";
import { selectCurrentUser, logout, TUser } from "../../../redux/features/auth/authSlice";
import { useGetMeQuery, useUpdateUserInfoMutation, useDeleteUserMutation, useGetUsersQuery } from "../../../redux/features/user/userApi";
import { useGetBooksQuery } from "../../../redux/features/book/bookApi";
import { useGetOrdersQuery } from "../../../redux/features/order/orderApi";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { useChangePasswordMutation } from "../../../redux/features/auth/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type TEditProfileInput = {
  name: string;
  contactNo: string;
};

type TChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser) as TUser;

  // Fetch complete profile info
  const { data: response, isLoading: isProfileLoading } = useGetMeQuery(user?.email, {
    skip: !user?.email
  });
  const userData = response?.data;

  // System Stats queries for Admin
  const { data: usersResponse } = useGetUsersQuery(undefined, { skip: user?.role !== "admin" });
  const { data: booksResponse } = useGetBooksQuery(undefined, { skip: user?.role !== "admin" });
  const { data: ordersResponse } = useGetOrdersQuery(undefined, { skip: user?.role !== "admin" });

  const totalUsersCount = usersResponse?.data?.length || 0;
  const totalBooksCount = booksResponse?.data?.length || 0;
  const totalOrdersCount = ordersResponse?.data?.length || 0;

  // Mutations
  const [updateUserInfo, { isLoading: isUpdatingProfile }] = useUpdateUserInfoMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  // Component States
  const [activeTab, setActiveTab] = useState<"details" | "security" | "stats">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState("");

  // Forms
  const { register: editRegister, handleSubmit: handleEditSubmit, reset: resetEditForm, formState: { errors: editErrors } } = useForm<TEditProfileInput>();
  const { register: passRegister, handleSubmit: handlePassSubmit, reset: resetPassForm, formState: { errors: passErrors }, watch } = useForm<TChangePasswordInput>();

  const newPasswordVal = watch("newPassword");

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 font-semibold animate-pulse">Retrieving profile...</p>
      </div>
    );
  }

  // Handlers
  const onEditProfile = async (data: TEditProfileInput) => {
    try {
      await updateUserInfo({
        id: userData?._id,
        userInfo: {
          name: data.name,
          contactNo: data.contactNo,
        }
      }).unwrap();
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile. Please verify that the phone number begins with a + and has country code.");
      console.error(err);
    }
  };

  const onChangePassword = async (data: TChangePasswordInput) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      }).unwrap();

      toast.success("Password changed successfully!");
      resetPassForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password. Please check your credentials.");
      console.error(err);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateConfirmText !== "DEACTIVATE") {
      toast.error("Please type DEACTIVATE to confirm.");
      return;
    }

    try {
      await deleteUser(userData?._id).unwrap();
      toast.success("Your admin account has been deactivated successfully.");
      dispatch(logout());
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deactivate account.");
      console.error(err);
    }
  };

  const startEditing = () => {
    resetEditForm({
      name: userData?.name || "",
      contactNo: userData?.contactNo || ""
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 bg-stone-50 min-h-screen">
      {/* ── Banner and Card Header ── */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {/* Banner with modern shapes/gradient */}
        <div className="h-40 bg-gradient-to-r from-rose-600 via-amber-600 to-amber-700 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.4),_transparent_40%)]" />
          <div className="absolute -bottom-1 right-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-2 left-6 text-white/95 font-bold tracking-widest text-xs uppercase bg-black/25 px-3 py-1 rounded-full backdrop-blur-sm">
            GRONTHO BILASH ADMIN PANEL
          </div>
        </div>

        {/* Profile Identity block */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16">
          {/* Avatar */}
          <div className="relative group">
            <div className="size-28 md:size-32 bg-rose-950 border-4 border-white rounded-2xl flex items-center justify-center font-extrabold text-amber-500 text-4xl md:text-5xl shadow-md transition-all duration-300 group-hover:scale-[1.02]">
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${userData?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </div>

          {/* Name/Status Info */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">{userData?.name}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border border-rose-200 bg-rose-50 text-rose-700 w-fit mx-auto sm:mx-0">
                <Shield size={12} className="mr-1" />
                System Admin
              </span>
            </div>
            <p className="text-sm text-stone-400 font-medium capitalize flex items-center gap-1 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-550" />
              {userData?.email}
            </p>
          </div>

          {/* CTA Edit button */}
          {activeTab === "details" && !isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 py-2.5 px-5 bg-stone-900 hover:bg-stone-850 text-white rounded-2xl transition-all text-sm font-bold shadow-md shadow-stone-900/10 hover:-translate-y-0.5"
            >
              <Edit3 size={15} className="text-amber-400" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => { setActiveTab("details"); setIsEditing(false); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "details"
              ? "border-amber-500 text-stone-900"
              : "border-transparent text-stone-450 hover:text-stone-950"
          }`}
        >
          <User size={16} /> Admin Details
        </button>
        <button
          onClick={() => { setActiveTab("security"); setIsEditing(false); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "border-amber-500 text-stone-900"
              : "border-transparent text-stone-450 hover:text-stone-950"
          }`}
        >
          <Lock size={16} /> Security & Access
        </button>
        <button
          onClick={() => { setActiveTab("stats"); setIsEditing(false); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "stats"
              ? "border-amber-500 text-stone-900"
              : "border-transparent text-stone-450 hover:text-stone-950"
          }`}
        >
          <ShoppingBag size={16} /> System Metrics
        </button>
      </div>

      {/* ── Main Tab Content ── */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: Admin Details */}
        {activeTab === "details" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 mb-1">Administrative Profile</h3>
                  <p className="text-xs text-stone-400">Your profile details in Grontho Bilash.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-bold text-stone-950 mt-0.5">{userData?.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Contact Number</p>
                      <p className="text-sm font-bold text-stone-950 mt-0.5">{userData?.contactNo || "Not provided"}</p>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Joined Date</p>
                      <p className="text-sm font-bold text-stone-950 mt-0.5">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Account Status</p>
                      <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${userData?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {userData?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit(onEditProfile)} className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 mb-1">Edit Administrative Details</h3>
                  <p className="text-xs text-stone-400">Update your administrative credentials.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...editRegister("name", { required: "Full name is required" })}
                        className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-855 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                        placeholder="Full Name"
                      />
                      <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    </div>
                    {editErrors.name && (
                      <p className="text-xs text-red-500 mt-1">{editErrors.name.message}</p>
                    )}
                  </div>

                  {/* Contact Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Contact Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...editRegister("contactNo", { 
                          required: "Contact number is required",
                          pattern: {
                            value: /^\+\d{1,4}\d{10,15}$/,
                            message: "Must include + and country code, e.g. +8801712345678"
                          }
                        })}
                        className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-855 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                        placeholder="+8801712345678"
                      />
                      <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    </div>
                    {editErrors.contactNo && (
                      <p className="text-xs text-red-500 mt-1">{editErrors.contactNo.message}</p>
                    )}
                    <span className="text-[10px] text-amber-600 block mt-1 font-semibold">⚠️ Needs leading `+` and country code.</span>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-150 hover:bg-stone-200 text-stone-700 rounded-2xl text-sm font-bold transition-all"
                  >
                    <X size={15} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-bold transition-all disabled:opacity-60 shadow-sm"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={15} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Security & Password */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password update Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-1">Update Admin Password</h3>
                <p className="text-xs text-stone-400">Regularly update your credentials to safeguard the system.</p>
              </div>

              <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-xl">
                {/* Old Password */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      {...passRegister("oldPassword", { required: "Current password is required" })}
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-850 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passErrors.oldPassword && (
                    <p className="text-xs text-red-500 mt-1">{passErrors.oldPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...passRegister("newPassword", { 
                        required: "New password is required",
                        minLength: { value: 6, message: "Password must have at least 6 characters" }
                      })}
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-855 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{passErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...passRegister("confirmPassword", { 
                        required: "Confirm your new password",
                        validate: (val) => val === newPasswordVal || "Passwords do not match"
                      })}
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-855 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{passErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 py-2.5 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-bold transition-all disabled:opacity-60 shadow-sm"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Key size={15} /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone deactivation Card */}
            <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl shadow-sm border border-red-100 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-red-900 flex items-center gap-2">
                  <Trash2 size={18} /> Danger Zone
                </h3>
                <p className="text-xs text-red-700/80 mt-1">Deactivate your admin profile. This will lock your administrative access.</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold transition-all"
                >
                  Deactivate Admin Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: System Overview Metrics */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Statistics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Registered Users</p>
                  <p className="text-2xl font-black text-stone-900 mt-0.5">{totalUsersCount}</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Books Cataloged</p>
                  <p className="text-2xl font-black text-stone-900 mt-0.5">{totalBooksCount}</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Orders Processed</p>
                  <p className="text-2xl font-black text-stone-900 mt-0.5">{totalOrdersCount}</p>
                </div>
              </div>
            </div>

            {/* Quick Admin Summary card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-1">Administrative Overview</h3>
                <p className="text-xs text-stone-400">Current status details for Grontho Bilash platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-stone-750">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                  <p className="text-stone-400 uppercase tracking-wider text-[9px] font-black">USER ACCESS CONTROL</p>
                  <p>Admins have full write access to block or activate user profiles, delete listings, and update status criteria from the User Management panel.</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                  <p className="text-rose-600 uppercase tracking-wider text-[9px] font-black">SECURITY & COMPLIANCE</p>
                  <p>Password updates on this dashboard require standard old credential match checks and immediately invalidate all prior active JWT sessions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Deactivation Confirmation Modal ── */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsDeactivateModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-red-50 bg-red-50/45 flex items-center justify-between">
              <h3 className="text-base font-black text-red-950 flex items-center gap-1.5">
                <Trash2 size={16} className="text-red-700" /> Confirm Deactivation
              </h3>
              <button 
                onClick={() => setIsDeactivateModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                This action will mark your admin account as deleted and log you out. This is a destructive operation.
              </p>
              
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-[11px] font-semibold border border-amber-100 leading-relaxed">
                ⚠️ To confirm, type <strong className="font-extrabold text-stone-950 bg-amber-200/60 px-1 py-0.5 rounded">DEACTIVATE</strong> in the field below.
              </div>

              <div>
                <input
                  type="text"
                  value={deactivateConfirmText}
                  onChange={(e) => setDeactivateConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/15 transition-all text-center font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                  placeholder="Type DEACTIVATE"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivateConfirmText !== "DEACTIVATE" || isDeletingUser}
                  className="px-5 py-2 bg-red-600 hover:bg-red-755 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isDeletingUser ? "Deactivating..." : "Deactivate Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;