import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

// Support line. Shown on the About and Contact pages and in the footer.
export const SUPPORT_PHONE_DISPLAY = "01883-350118";
export const SUPPORT_PHONE_TEL = "+8801883350118";
const SUPPORT_PHONE_WA = "8801883350118";

// Opens a WhatsApp chat with support, with an optional message filled in.
export const whatsappLink = (message?: string) =>
  `https://wa.me/${SUPPORT_PHONE_WA}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

const WhatsAppButton = ({
  message = "আসসালামু আলাইকুম, গ্রন্থবিলাস থেকে বলছি। আমার একটা বিষয়ে সাহায্য দরকার।",
  children = "WhatsApp-এ মেসেজ দাও",
  className = "",
}: {
  message?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <a
    href={whatsappLink(message)}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-[#073b1c] shadow-sm transition hover:bg-[#1ebe5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
  >
    <MessageCircle size={18} aria-hidden="true" />
    {children}
  </a>
);

export default WhatsAppButton;

// Chat link to someone else's Bangladeshi number (e.g. a buyer), or null if
// the number can't be a WhatsApp number.
export const whatsappLinkTo = (phone: string | undefined | null, message: string) => {
  let digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) digits = `88${digits}`;
  if (!/^8801[3-9]\d{8}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
