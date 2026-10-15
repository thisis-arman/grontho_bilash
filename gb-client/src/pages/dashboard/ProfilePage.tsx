import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useChangePasswordMutation } from "../../redux/features/auth/authApi";
import { signOut, selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import {
    useDeleteUserMutation,
    useGetMeQuery,
    useUpdateUserInfoMutation,
} from "../../redux/features/user/userApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    Badge,
    btn,
    errorMessage,
    ErrorState,
    Field,
    formatDate,
    inputClass,
    LoadingRows,
    Modal,
    PageHeader,
    Panel,
} from "../../components/dashboard/ui";

// Same pattern the API enforces for contact numbers.
const PHONE_PATTERN = "\\+\\d{11,19}";

const PasswordInput = ({ name, autoComplete }: { name: string; autoComplete: string }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input
                name={name}
                type={visible ? "text" : "password"}
                required
                minLength={6}
                autoComplete={autoComplete}
                className={`${inputClass} pr-11`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700"
            >
                {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
        </div>
    );
};

// Used for both the member and the admin profile routes.
const ProfilePage = () => {
    const authUser = useAppSelector(selectCurrentUser) as TUser;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useGetMeQuery(authUser?.email, { skip: !authUser?.email });
    const [updateUserInfo, { isLoading: isSaving }] = useUpdateUserInfoMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
    const [deleteUser, { isLoading: isDeactivating }] = useDeleteUserMutation();

    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const profile = data?.data;

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        try {
            await updateUserInfo({
                id: profile._id,
                userInfo: {
                    name: String(form.get("name")).trim(),
                    contactNo: String(form.get("contactNo")).trim(),
                },
            }).unwrap();
            toast.success("Profile updated");
        } catch (error) {
            toast.error(errorMessage(error, "Could not update your profile"));
        }
    };

    const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const newPassword = String(form.get("newPassword"));
        if (newPassword !== String(form.get("confirmPassword"))) {
            toast.error("The new passwords do not match");
            return;
        }
        try {
            await changePassword({ oldPassword: String(form.get("oldPassword")), newPassword }).unwrap();
            // The old session is no longer valid once the password changes.
            toast.success("Password changed. Please log in again.");
            dispatch(signOut());
            navigate("/login");
        } catch (error) {
            toast.error(errorMessage(error, "Could not change your password"));
        }
    };

    const handleDeactivate = async () => {
        try {
            await deleteUser(profile._id).unwrap();
            toast.success("Your account has been deactivated");
            dispatch(signOut());
            navigate("/");
        } catch (error) {
            toast.error(errorMessage(error, "Could not deactivate your account"));
        }
    };

    if (isLoading) {
        return (
            <>
                <PageHeader title="Profile" />
                <Panel flush><LoadingRows rows={4} /></Panel>
            </>
        );
    }

    if (isError || !profile) {
        return (
            <>
                <PageHeader title="Profile" />
                <Panel flush><ErrorState onRetry={refetch} /></Panel>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Profile" desc="Your account details and security." />

            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                <Panel className="lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 font-display text-3xl font-bold text-stone-950">
                            {profile.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                        <p className="mt-4 break-words font-display text-xl font-bold text-stone-900">{profile.name}</p>
                        <p className="break-all text-sm text-stone-500">{profile.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            <Badge tone="amber">{profile.role}</Badge>
                            <Badge tone={profile.status === "active" ? "green" : "red"}>{profile.status}</Badge>
                        </div>
                    </div>
                    <dl className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
                        <div className="flex justify-between gap-3">
                            <dt className="text-stone-500">Phone</dt>
                            <dd className="font-medium text-stone-900">{profile.contactNo}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-stone-500">Member since</dt>
                            <dd className="font-medium text-stone-900">{formatDate(profile.createdAt)}</dd>
                        </div>
                    </dl>
                </Panel>

                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Personal details">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Full name">
                                    <input name="name" required defaultValue={profile.name} autoComplete="name" className={inputClass} />
                                </Field>
                                <Field label="Phone number" hint="With country code, e.g. +8801712345678">
                                    <input
                                        name="contactNo"
                                        type="tel"
                                        required
                                        pattern={PHONE_PATTERN}
                                        title="Start with + and the country code, digits only"
                                        defaultValue={profile.contactNo}
                                        autoComplete="tel"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                            <Field label="Email" hint="Your email is your login and cannot be changed here.">
                                <input value={profile.email} disabled readOnly className={inputClass} />
                            </Field>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSaving} className={`${btn.primary} w-full sm:w-auto`}>
                                    {isSaving ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </Panel>

                    <Panel title="Change password">
                        <form onSubmit={handlePassword} className="space-y-4">
                            <Field label="Current password">
                                <PasswordInput name="oldPassword" autoComplete="current-password" />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="New password" hint="At least 6 characters.">
                                    <PasswordInput name="newPassword" autoComplete="new-password" />
                                </Field>
                                <Field label="Confirm new password">
                                    <PasswordInput name="confirmPassword" autoComplete="new-password" />
                                </Field>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isChangingPassword} className={`${btn.secondary} w-full sm:w-auto`}>
                                    {isChangingPassword ? "Updating..." : "Update password"}
                                </button>
                            </div>
                        </form>
                    </Panel>

                    <Panel title="Deactivate account" className="border-red-200">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-stone-600">
                                You will be signed out and will no longer be able to log in. Contact support to restore your account.
                            </p>
                            <button type="button" onClick={() => setDeactivateOpen(true)} className={`${btn.danger} flex-shrink-0`}>
                                Deactivate
                            </button>
                        </div>
                    </Panel>
                </div>
            </div>

            <Modal
                open={deactivateOpen}
                onClose={() => { setDeactivateOpen(false); setConfirmText(""); }}
                title="Deactivate your account?"
                footer={
                    <>
                        <button type="button" onClick={() => { setDeactivateOpen(false); setConfirmText(""); }} className={btn.secondary}>
                            Keep my account
                        </button>
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={confirmText !== "DEACTIVATE" || isDeactivating}
                            className={btn.danger}
                        >
                            {isDeactivating ? "Deactivating..." : "Deactivate account"}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-sm leading-relaxed text-stone-600">
                    This signs you out and blocks future logins. Type <strong className="text-stone-900">DEACTIVATE</strong> to confirm.
                </p>
                <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    aria-label="Type DEACTIVATE to confirm"
                    placeholder="DEACTIVATE"
                    autoComplete="off"
                    className={inputClass}
                />
            </Modal>
        </>
    );
};

export default ProfilePage;
