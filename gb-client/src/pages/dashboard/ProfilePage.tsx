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
    formatDateBn,
    inputClass,
    LoadingRows,
    Modal,
    PageHeader,
    Panel,
} from "../../components/dashboard/ui";

// Same pattern the API enforces for contact numbers.
const PHONE_PATTERN = "\\+\\d{11,19}";

const ROLE_LABELS: Record<string, string> = { user: "সদস্য", admin: "অ্যাডমিন" };
const ACCOUNT_STATUS_LABELS: Record<string, string> = { active: "সক্রিয়", blocked: "ব্লক করা" };

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
                aria-label={visible ? "পাসওয়ার্ড লুকাও" : "পাসওয়ার্ড দেখাও"}
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
            toast.success("প্রোফাইল আপডেট হয়েছে");
        } catch (error) {
            toast.error(errorMessage(error, "প্রোফাইল আপডেট করা যায়নি"));
        }
    };

    const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const newPassword = String(form.get("newPassword"));
        if (newPassword !== String(form.get("confirmPassword"))) {
            toast.error("নতুন পাসওয়ার্ড দুটো মিলছে না");
            return;
        }
        try {
            await changePassword({ oldPassword: String(form.get("oldPassword")), newPassword }).unwrap();
            // The old session is no longer valid once the password changes.
            toast.success("পাসওয়ার্ড বদলানো হয়েছে। আবার লগইন করো।");
            dispatch(signOut());
            navigate("/login");
        } catch (error) {
            toast.error(errorMessage(error, "পাসওয়ার্ড বদলানো যায়নি"));
        }
    };

    const handleDeactivate = async () => {
        try {
            await deleteUser(profile._id).unwrap();
            toast.success("তোমার অ্যাকাউন্ট বন্ধ করা হয়েছে");
            dispatch(signOut());
            navigate("/");
        } catch (error) {
            toast.error(errorMessage(error, "অ্যাকাউন্ট বন্ধ করা যায়নি"));
        }
    };

    if (isLoading) {
        return (
            <>
                <PageHeader title="প্রোফাইল" />
                <Panel flush><LoadingRows rows={4} /></Panel>
            </>
        );
    }

    if (isError || !profile) {
        return (
            <>
                <PageHeader title="প্রোফাইল" />
                <Panel flush><ErrorState onRetry={refetch} /></Panel>
            </>
        );
    }

    return (
        <>
            <PageHeader title="প্রোফাইল" desc="তোমার অ্যাকাউন্টের তথ্য আর নিরাপত্তা।" />

            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                <Panel className="lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 font-display text-3xl font-bold text-stone-950">
                            {profile.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                        <p className="mt-4 break-words font-display text-xl font-bold text-stone-900">{profile.name}</p>
                        <p className="break-all text-sm text-stone-500">{profile.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            <Badge tone="amber">{ROLE_LABELS[profile.role] ?? profile.role}</Badge>
                            <Badge tone={profile.status === "active" ? "green" : "red"}>{ACCOUNT_STATUS_LABELS[profile.status] ?? profile.status}</Badge>
                        </div>
                    </div>
                    <dl className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
                        <div className="flex justify-between gap-3">
                            <dt className="text-stone-500">ফোন</dt>
                            <dd className="font-medium text-stone-900">{profile.contactNo}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-stone-500">সদস্য হয়েছ</dt>
                            <dd className="font-medium text-stone-900">{formatDateBn(profile.createdAt)}</dd>
                        </div>
                    </dl>
                </Panel>

                <div className="space-y-6 lg:col-span-2">
                    <Panel title="ব্যক্তিগত তথ্য">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="পুরো নাম">
                                    <input name="name" required defaultValue={profile.name} autoComplete="name" className={inputClass} />
                                </Field>
                                <Field label="ফোন নম্বর" hint="দেশের কোডসহ লেখো, যেমন +8801712345678">
                                    <input
                                        name="contactNo"
                                        type="tel"
                                        required
                                        pattern={PHONE_PATTERN}
                                        title="+ আর দেশের কোড দিয়ে শুরু করো, বাকিটা শুধু সংখ্যা"
                                        defaultValue={profile.contactNo}
                                        autoComplete="tel"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                            <Field label="ইমেইল" hint="এই ইমেইল দিয়েই তুমি লগইন করো, তাই এখান থেকে বদলানো যাবে না।">
                                <input value={profile.email} disabled readOnly className={inputClass} />
                            </Field>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSaving} className={`${btn.primary} w-full sm:w-auto`}>
                                    {isSaving ? "সেভ হচ্ছে..." : "সেভ করো"}
                                </button>
                            </div>
                        </form>
                    </Panel>

                    <Panel title="পাসওয়ার্ড বদলাও">
                        <form onSubmit={handlePassword} className="space-y-4">
                            <Field label="এখনকার পাসওয়ার্ড">
                                <PasswordInput name="oldPassword" autoComplete="current-password" />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="নতুন পাসওয়ার্ড" hint="কমপক্ষে ৬ অক্ষর।">
                                    <PasswordInput name="newPassword" autoComplete="new-password" />
                                </Field>
                                <Field label="নতুন পাসওয়ার্ড আবার দাও">
                                    <PasswordInput name="confirmPassword" autoComplete="new-password" />
                                </Field>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isChangingPassword} className={`${btn.secondary} w-full sm:w-auto`}>
                                    {isChangingPassword ? "বদলানো হচ্ছে..." : "পাসওয়ার্ড বদলাও"}
                                </button>
                            </div>
                        </form>
                    </Panel>

                    <Panel title="অ্যাকাউন্ট বন্ধ করো" className="border-red-200">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-stone-600">
                                তুমি লগআউট হয়ে যাবে, পরে আর লগইন করতে পারবে না। অ্যাকাউন্ট আবার চালু করতে সাপোর্টে যোগাযোগ করো।
                            </p>
                            <button type="button" onClick={() => setDeactivateOpen(true)} className={`${btn.danger} flex-shrink-0`}>
                                বন্ধ করো
                            </button>
                        </div>
                    </Panel>
                </div>
            </div>

            <Modal
                open={deactivateOpen}
                onClose={() => { setDeactivateOpen(false); setConfirmText(""); }}
                title="অ্যাকাউন্ট বন্ধ করবে?"
                footer={
                    <>
                        <button type="button" onClick={() => { setDeactivateOpen(false); setConfirmText(""); }} className={btn.secondary}>
                            না, রেখে দাও
                        </button>
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={confirmText !== "DEACTIVATE" || isDeactivating}
                            className={btn.danger}
                        >
                            {isDeactivating ? "বন্ধ করা হচ্ছে..." : "অ্যাকাউন্ট বন্ধ করো"}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-sm leading-relaxed text-stone-600">
                    এতে তুমি লগআউট হয়ে যাবে আর পরে আর লগইন করতে পারবে না। নিশ্চিত করতে ইংরেজি বড় হাতের অক্ষরে <strong className="text-stone-900">DEACTIVATE</strong> লেখো।
                </p>
                <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    aria-label="নিশ্চিত করতে DEACTIVATE লেখো"
                    placeholder="DEACTIVATE"
                    autoComplete="off"
                    className={inputClass}
                />
            </Modal>
        </>
    );
};

export default ProfilePage;
