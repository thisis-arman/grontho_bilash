import { useState, useMemo } from "react";
import { useGetUsersQuery, useUpdateUserInfoMutation } from "../../../redux/features/user/userApi";
import { useForm } from "react-hook-form";
import {
  Shield, Ban, CheckCircle2, Edit2, ShieldAlert,
  Search, ChevronLeft, ChevronRight, Users, X,
  SlidersHorizontal, UserCheck, UserX
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TUser = {
  _id: string;
  name: string;
  email: string;
  contactNo: string;
  password?: string;
  needsUpdateProfile?: boolean;
  passwordChangedAt?: Date;
  role: "user" | "admin";
  status: "active" | "blocked";
  isDeleted?: boolean;
  avatar?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Sub-components ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all";

const selectCls =
  "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all appearance-none cursor-pointer";

const StatCard = ({
  label, value, icon: Icon, color,
}: { label: string; value: number; icon: React.ElementType; color: string }) => (
  <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-stone-900">{value}</p>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const UserManagement = () => {
  const { data: usersData, isLoading } = useGetUsersQuery(undefined);
  const [updateUserInfo, { isLoading: isUpdating }] = useUpdateUserInfoMutation();

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen]   = useState(false);
  const [selectedUser, setSelectedUser]         = useState<TUser | null>(null);

  // ── Filter & search state ────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [showFilters, setShowFilters]  = useState(false);

  // ── Pagination state ─────────────────────────────────────────────────────────
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TUser>();

  // ── Derived data ─────────────────────────────────────────────────────────────

  const allUsers: TUser[] = usersData?.data ?? [];

  const filtered = useMemo(() => {
    let list = [...allUsers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.contactNo?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all")   list = list.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") list = list.filter((u) => u.status === statusFilter);

    return list;
  }, [allUsers, search, roleFilter, statusFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Stats
  const totalActive  = allUsers.filter((u) => u.status === "active").length;
  const totalBlocked = allUsers.filter((u) => u.status === "blocked").length;
  const totalAdmins  = allUsers.filter((u) => u.role === "admin").length;

  const activeFilterCount = [roleFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  // Reset page when filters change
  const applyFilter = (fn: () => void) => { fn(); setPage(1); };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleEditClick = (user: TUser) => {
    setSelectedUser(user);
    reset(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    reset();
  };

  const onSubmitUpdate = async (formData: TUser) => {
    if (!selectedUser) return;
    try {
      await updateUserInfo({
        id: selectedUser._id,
        userInfo: {
          name: formData.name,
          contactNo: formData.contactNo,
          role: formData.role,
          status: formData.status,
        },
      }).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const toggleUserStatus = async (user: TUser) => {
    const newStatus = user.status === "active" ? "blocked" : "active";
    if (newStatus === "blocked" && !window.confirm(`Block ${user.name}?`)) return;
    try {
      await updateUserInfo({ id: user._id, userInfo: { status: newStatus } }).unwrap();
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-stone-50 min-h-screen">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">User Management</h1>
          <p className="text-stone-400 text-sm mt-1">Manage roles, statuses and profiles across {allUsers.length} users.</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Users"   value={allUsers.length}  icon={Users}       color="bg-stone-100 text-stone-600" />
          <StatCard label="Admins"        value={totalAdmins}      icon={ShieldAlert}  color="bg-rose-100 text-rose-600"   />
          <StatCard label="Active"        value={totalActive}      icon={UserCheck}    color="bg-emerald-100 text-emerald-600" />
          <StatCard label="Blocked"       value={totalBlocked}     icon={UserX}        color="bg-red-100 text-red-500"     />
        </div>
      )}

      {/* ── Search + filter bar ── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => applyFilter(() => setSearch(""))} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear */}
        {(activeFilterCount > 0 || search) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 text-sm font-semibold hover:bg-rose-100 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="mb-4 bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-6">
          {/* Role */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Role</p>
            <div className="flex gap-2">
              {(["all", "user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => applyFilter(() => setRoleFilter(r))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${
                    roleFilter === r
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {r === "all" ? "All Roles" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Status</p>
            <div className="flex gap-2">
              {(["all", "active", "blocked"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => applyFilter(() => setStatusFilter(s))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${
                    statusFilter === s
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results summary ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-stone-400 font-medium">
          Showing{" "}
          <span className="font-bold text-stone-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-bold text-stone-700">{filtered.length}</span> users
        </p>
        {/* Page size */}
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-100 text-[11px] font-bold tracking-widest uppercase text-stone-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <Users size={28} className="text-stone-300" />
                        <p className="text-sm font-medium">No users match your filters</p>
                        <button onClick={resetFilters} className="text-xs text-amber-600 font-semibold hover:underline mt-1">
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((user: TUser) => (
                  <tr key={user._id} className="hover:bg-stone-50/60 transition-colors group">

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-stone-900 font-semibold text-sm">{user.name}</p>
                          <p className="text-stone-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 text-stone-600 text-sm">
                      {user.contactNo || <span className="text-stone-300 italic text-xs">Not set</span>}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === "admin"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-stone-100 text-stone-600"
                      }`}>
                        {user.role === "admin" ? <ShieldAlert size={11} /> : <Shield size={11} />}
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {user.status === "active" ? <CheckCircle2 size={11} /> : <Ban size={11} />}
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          title={user.status === "active" ? "Block User" : "Unblock User"}
                          className={`p-2 rounded-xl transition-colors ${
                            user.status === "active"
                              ? "text-stone-400 hover:text-red-600 hover:bg-red-50"
                              : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {user.status === "active" ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          title="Edit User"
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-4">
              <p className="text-xs text-stone-400">
                Page <span className="font-bold text-stone-700">{safePage}</span> of{" "}
                <span className="font-bold text-stone-700">{totalPages}</span>
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-stone-400 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          safePage === p
                            ? "bg-stone-900 text-white"
                            : "border border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={handleCloseModal} />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Edit2 size={15} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Edit User</h3>
                  <p className="text-xs text-stone-400">{selectedUser?.email}</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitUpdate)} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className={inputCls}
                  placeholder="Full name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  {...register("contactNo")}
                  className={inputCls}
                  placeholder="+880 ..."
                />
              </div>

              {/* Role + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Role</label>
                  <div className="relative">
                    <select {...register("role")} className={selectCls}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Shield size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Status</label>
                  <div className="relative">
                    <select {...register("status")} className={selectCls}>
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <CheckCircle2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-900/20 border-t-stone-900 rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;