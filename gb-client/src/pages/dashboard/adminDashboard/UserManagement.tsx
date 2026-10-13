import { FormEvent, useMemo, useState } from "react";
import { Ban, Pencil, ShieldCheck, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { selectCurrentUser, TUser } from "../../../redux/features/auth/authSlice";
import { useGetUsersQuery, useUpdateUserInfoMutation } from "../../../redux/features/user/userApi";
import { useAppSelector } from "../../../redux/hooks";
import {
    Badge,
    btn,
    ConfirmDialog,
    DataList,
    EmptyState,
    errorMessage,
    ErrorState,
    Field,
    formatDate,
    inputClass,
    LoadingRows,
    Modal,
    PageHeader,
    Pagination,
    Panel,
    SearchInput,
    SelectFilter,
    StatCard,
    StatGrid,
    Toolbar,
    usePaged,
} from "../../../components/dashboard/ui";

interface Member {
    _id: string;
    name: string;
    email: string;
    contactNo: string;
    role: "user" | "admin";
    status: "active" | "blocked";
    createdAt?: string;
}

const FILTER_OPTIONS = [
    { value: "all", label: "Everyone" },
    { value: "admin", label: "Admins" },
    { value: "user", label: "Members" },
    { value: "blocked", label: "Blocked" },
];

const MemberCell = ({ member, isSelf }: { member: Member; isSelf: boolean }) => (
    <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
            {member.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
        <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">
                {member.name}
                {isSelf && <span className="ml-1.5 text-xs font-normal text-stone-500">(you)</span>}
            </p>
            <p className="truncate text-xs text-stone-500">{member.email}</p>
        </div>
    </div>
);

const UserManagement = () => {
    const me = useAppSelector(selectCurrentUser) as TUser;
    const { data, isLoading, isError, refetch } = useGetUsersQuery(undefined);
    const [updateUserInfo, { isLoading: isUpdating }] = useUpdateUserInfoMutation();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState<Member | null>(null);
    const [toggling, setToggling] = useState<Member | null>(null);

    const members: Member[] = useMemo(() => data?.data ?? [], [data]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return members.filter((member) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "blocked" ? member.status === "blocked" : member.role === filter);
            const matchesSearch =
                !term ||
                member.name?.toLowerCase().includes(term) ||
                member.email?.toLowerCase().includes(term) ||
                member.contactNo?.includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [members, search, filter]);

    const { page, setPage, pageCount, pageItems } = usePaged(filtered);

    const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;
        const form = new FormData(event.currentTarget);
        const isSelf = editing.email === me.email;
        try {
            await updateUserInfo({
                id: editing._id,
                userInfo: {
                    name: String(form.get("name")).trim(),
                    contactNo: String(form.get("contactNo")).trim(),
                    // Your own role and status are locked so you cannot lock yourself out.
                    ...(isSelf ? {} : { role: String(form.get("role")), status: String(form.get("status")) }),
                },
            }).unwrap();
            toast.success("User updated");
            setEditing(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the user"));
        }
    };

    const handleToggle = async () => {
        if (!toggling) return;
        const status = toggling.status === "blocked" ? "active" : "blocked";
        try {
            await updateUserInfo({ id: toggling._id, userInfo: { status } }).unwrap();
            toast.success(status === "blocked" ? "User blocked" : "User unblocked");
            setToggling(null);
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the user"));
        }
    };

    const badges = (member: Member) => (
        <div className="flex flex-wrap gap-1.5">
            <Badge tone={member.role === "admin" ? "amber" : "stone"}>{member.role === "admin" ? "Admin" : "Member"}</Badge>
            <Badge tone={member.status === "active" ? "green" : "red"}>{member.status}</Badge>
        </div>
    );

    const actions = (member: Member) => {
        const isSelf = member.email === me.email;
        return (
            <div className="flex justify-end gap-1">
                <button type="button" onClick={() => setEditing(member)} aria-label={`Edit ${member.name}`} className={btn.icon}>
                    <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => setToggling(member)}
                    disabled={isSelf}
                    aria-label={member.status === "blocked" ? `Unblock ${member.name}` : `Block ${member.name}`}
                    title={isSelf ? "You cannot block yourself" : member.status === "blocked" ? "Unblock" : "Block"}
                    className={`${btn.icon} ${member.status === "blocked" ? "hover:!bg-emerald-50 hover:!text-emerald-600" : "hover:!bg-red-50 hover:!text-red-600"}`}
                >
                    {member.status === "blocked" ? <UserCheck size={16} aria-hidden="true" /> : <Ban size={16} aria-hidden="true" />}
                </button>
            </div>
        );
    };

    const editingSelf = editing?.email === me.email;

    return (
        <>
            <PageHeader title="Users" desc="Everyone registered on Grontho Bilash." />

            <StatGrid>
                <StatCard label="Total users" value={members.length} icon={Users} />
                <StatCard label="Admins" value={members.filter((m) => m.role === "admin").length} icon={ShieldCheck} />
                <StatCard label="Active" value={members.filter((m) => m.status === "active").length} icon={UserCheck} />
                <StatCard label="Blocked" value={members.filter((m) => m.status === "blocked").length} icon={Ban} />
            </StatGrid>

            <Toolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone" />
                <SelectFilter value={filter} onChange={setFilter} options={FILTER_OPTIONS} label="Filter users" />
            </Toolbar>

            <Panel flush>
                {isLoading ? (
                    <LoadingRows />
                ) : isError ? (
                    <ErrorState onRetry={refetch} />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={Users} title="No matching users" desc="Try a different search or filter." />
                ) : (
                    <>
                        <DataList
                            rows={pageItems}
                            rowKey={(member) => member._id}
                            columns={[
                                { header: "User", cell: (member) => <MemberCell member={member} isSelf={member.email === me.email} /> },
                                { header: "Phone", cell: (member) => <span className="whitespace-nowrap">{member.contactNo}</span> },
                                { header: "Joined", cell: (member) => <span className="whitespace-nowrap">{formatDate(member.createdAt)}</span> },
                                { header: "Role and status", cell: badges },
                                { header: "Actions", align: "right", cell: actions },
                            ]}
                            renderCard={(member) => (
                                <div className="space-y-3">
                                    <MemberCell member={member} isSelf={member.email === me.email} />
                                    <p className="text-xs text-stone-500">
                                        {member.contactNo} · Joined {formatDate(member.createdAt)}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        {badges(member)}
                                        {actions(member)}
                                    </div>
                                </div>
                            )}
                        />
                        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
                    </>
                )}
            </Panel>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit user">
                {editing && (
                    <form onSubmit={handleEdit} className="space-y-4">
                        <Field label="Full name">
                            <input name="name" required defaultValue={editing.name} className={inputClass} />
                        </Field>
                        <Field label="Phone number" hint="With country code, e.g. +8801712345678">
                            <input
                                name="contactNo"
                                type="tel"
                                required
                                pattern="\+\d{11,19}"
                                title="Start with + and the country code, digits only"
                                defaultValue={editing.contactNo}
                                className={inputClass}
                            />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Role">
                                <select name="role" defaultValue={editing.role} disabled={editingSelf} className={`${inputClass} cursor-pointer`}>
                                    <option value="user">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select name="status" defaultValue={editing.status} disabled={editingSelf} className={`${inputClass} cursor-pointer`}>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </Field>
                        </div>
                        {editingSelf && (
                            <p className="text-xs text-stone-500">You cannot change your own role or status.</p>
                        )}
                        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setEditing(null)} className={btn.secondary}>
                                Close
                            </button>
                            <button type="submit" disabled={isUpdating} className={btn.primary}>
                                {isUpdating ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <ConfirmDialog
                open={!!toggling}
                onClose={() => setToggling(null)}
                onConfirm={handleToggle}
                loading={isUpdating}
                title={toggling?.status === "blocked" ? "Unblock this user?" : "Block this user?"}
                desc={
                    toggling?.status === "blocked"
                        ? `${toggling?.name ?? ""} will be able to log in and use the site again.`
                        : `${toggling?.name ?? ""} will be signed out and unable to log in until unblocked.`
                }
                confirmLabel={toggling?.status === "blocked" ? "Unblock user" : "Block user"}
            />
        </>
    );
};

export default UserManagement;
