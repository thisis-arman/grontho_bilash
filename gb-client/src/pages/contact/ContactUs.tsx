import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookUp,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldAlert,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import WhatsAppButton, { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL, whatsappLink } from "../../components/WhatsAppButton";
import { SITE_URL, usePageMeta } from "../../utils/usePageMeta";

const EMAIL = "hello@gronthobilash.com";

// Each topic opens WhatsApp with a message already started, so support
// knows straight away what the chat is about.
const topics: { icon: LucideIcon; title: string; desc: string; message: string }[] = [
  {
    icon: Package,
    title: "অর্ডারের অবস্থা",
    desc: "অর্ডার কোথায় আছে, কবে পৌঁছাবে বা অর্ডার বাতিল করতে চাইলে।",
    message: "আসসালামু আলাইকুম, আমার অর্ডারের ব্যাপারে জানতে চাই। অর্ডার আইডি: ",
  },
  {
    icon: Truck,
    title: "ডেলিভারি",
    desc: "ডেলিভারি চার্জ, ঠিকানা পরিবর্তন বা ডেলিভারিতে দেরি হলে।",
    message: "আসসালামু আলাইকুম, ডেলিভারি নিয়ে একটা প্রশ্ন আছে।",
  },
  {
    icon: CreditCard,
    title: "পেমেন্ট ও বিকাশ",
    desc: "বিকাশ পেমেন্ট, ট্রানজেকশন আইডি বা ক্যাশ অন ডেলিভারি নিয়ে।",
    message: "আসসালামু আলাইকুম, পেমেন্ট নিয়ে সাহায্য দরকার। ট্রানজেকশন আইডি: ",
  },
  {
    icon: BookUp,
    title: "বই বিক্রি ও লিস্টিং",
    desc: "কীভাবে বই লিস্ট করবে, দাম কত রাখবে বা লিস্টিং এডিট করতে চাইলে।",
    message: "আসসালামু আলাইকুম, বই বিক্রি/লিস্টিং নিয়ে সাহায্য দরকার।",
  },
  {
    icon: UserRound,
    title: "অ্যাকাউন্ট ও লগইন",
    desc: "লগইন করতে সমস্যা, পাসওয়ার্ড বা প্রোফাইলের তথ্য পরিবর্তন।",
    message: "আসসালামু আলাইকুম, আমার অ্যাকাউন্টে লগইন/প্রোফাইল নিয়ে সমস্যা হচ্ছে।",
  },
  {
    icon: ShieldAlert,
    title: "সমস্যা বা অভিযোগ",
    desc: "ভুল বই, বইয়ের অবস্থা বর্ণনার সাথে না মিললে বা কোনো লিস্টিং রিপোর্ট করতে।",
    message: "আসসালামু আলাইকুম, একটা সমস্যার কথা জানাতে চাই।",
  },
];

const faqs = [
  {
    q: "গ্রন্থবিলাস সাপোর্টে সবচেয়ে দ্রুত কীভাবে যোগাযোগ করা যায়?",
    a: `WhatsApp-এ ${SUPPORT_PHONE_DISPLAY} নম্বরে মেসেজ দেওয়াই সবচেয়ে দ্রুত উপায়। অর্ডার নিয়ে লিখলে অর্ডার আইডিও দিয়ো।`,
  },
  {
    q: "অর্ডার আইডি কোথায় পাবো?",
    a: "লগইন করে ড্যাশবোর্ডের 'আমার অর্ডার' পাতায় প্রতিটি অর্ডারের আইডি ও অবস্থা দেখা যায়।",
  },
  {
    q: "ইমেইলে যোগাযোগ করা যায়?",
    a: `হ্যাঁ, ${EMAIL} ঠিকানায় ইমেইল করতে পারো। বিস্তারিত বা স্ক্রিনশটসহ কিছু জানাতে ইমেইল সুবিধাজনক।`,
  },
];

const card = "rounded-2xl border border-stone-200 bg-white p-6";

const ContactUs = () => {
  usePageMeta(
    "যোগাযোগ – WhatsApp সাপোর্ট ও হেল্পলাইন",
    `গ্রন্থবিলাস সাপোর্টে যোগাযোগ করো: WhatsApp ও ফোন ${SUPPORT_PHONE_DISPLAY}, ইমেইল ${EMAIL}। অর্ডার, ডেলিভারি, বিকাশ পেমেন্ট ও বই বিক্রি নিয়ে সাহায্য।`,
    undefined,
    {
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ContactPage",
            url: `${SITE_URL}/contact`,
            name: "গ্রন্থবিলাস – যোগাযোগ",
            inLanguage: "bn",
            about: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ],
      },
    }
  );

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        <header className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-amber-600">যোগাযোগ</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-stone-900 sm:text-5xl">
            গ্রন্থবিলাস সাপোর্ট: আমরা সাহায্য করতে প্রস্তুত
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            বই কেনা, বই বিক্রি, অর্ডার, ডেলিভারি বা বিকাশ পেমেন্ট নিয়ে কোনো প্রশ্ন থাকলে সরাসরি WhatsApp-এ মেসেজ
            দাও। মেসেজ পেলে যত দ্রুত সম্ভব উত্তর দিই।
          </p>
        </header>

        {/* Primary: WhatsApp */}
        <section className="scheme-fixed mt-10 flex flex-col gap-6 rounded-3xl bg-stone-900 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#25D366]">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp সাপোর্ট
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {SUPPORT_PHONE_DISPLAY}
            </p>
            <p className="mt-2 text-sm text-stone-300">চ্যাট খুলতে বাটনে চাপ দাও, মেসেজ লেখা শুরু করাই থাকবে।</p>
          </div>
          <WhatsAppButton className="sm:flex-shrink-0">WhatsApp-এ চ্যাট শুরু করো</WhatsAppButton>
        </section>

        {/* Other channels */}
        <section className="mt-4 grid gap-4 sm:grid-cols-3" aria-label="অন্যান্য যোগাযোগের উপায়">
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className={`${card} group transition hover:border-amber-400`}>
            <Phone size={20} className="text-amber-600" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-stone-900">ফোন করো</h2>
            <p className="mt-1 text-sm text-stone-600">{SUPPORT_PHONE_DISPLAY}</p>
          </a>
          <a href={`mailto:${EMAIL}`} className={`${card} group transition hover:border-amber-400`}>
            <Mail size={20} className="text-amber-600" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-stone-900">ইমেইল করো</h2>
            <p className="mt-1 break-all text-sm text-stone-600">{EMAIL}</p>
          </a>
          <div className={card}>
            <MapPin size={20} className="text-amber-600" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-stone-900">ঠিকানা</h2>
            <p className="mt-1 text-sm text-stone-600">ঢাকা, বাংলাদেশ (অনলাইন প্ল্যাটফর্ম)</p>
          </div>
        </section>

        {/* Topics */}
        <section className="mt-16" aria-labelledby="topics">
          <h2 id="topics" className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            কোন বিষয়ে সাহায্য দরকার?
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-stone-600">
            বিষয় বেছে নাও, WhatsApp-এ সেই বিষয়ের মেসেজ লেখা শুরু হয়ে যাবে। এতে তোমার সমস্যাটা আমরা দ্রুত বুঝতে পারি।
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ icon: Icon, title, desc, message }) => (
              <li key={title}>
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${card} group flex h-full flex-col transition hover:border-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]`}
                >
                  <span className="flex items-start justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <ArrowUpRight size={18} className="text-stone-400 transition group-hover:text-[#25D366]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-stone-900">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{desc}</p>
                  <span className="mt-4 text-sm font-semibold text-[#128C4B] dark:text-[#25D366]">WhatsApp-এ জানাও</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Tips */}
        <section className={`${card} mt-10`} aria-labelledby="tips">
          <h2 id="tips" className="font-display text-xl font-bold text-stone-900">দ্রুত সমাধান পেতে মেসেজে যা দিবে</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
            <li>অর্ডার নিয়ে হলে অর্ডার আইডি (ড্যাশবোর্ডের 'আমার অর্ডার' পাতায় পাবে)।</li>
            <li>পেমেন্ট নিয়ে হলে বিকাশের ট্রানজেকশন আইডি।</li>
            <li>বইয়ের অবস্থা নিয়ে অভিযোগ হলে বইয়ের ছবি।</li>
            <li>অ্যাকাউন্টের সমস্যায় যে ইমেইল দিয়ে অ্যাকাউন্ট খুলেছ সেটি।</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-16" aria-labelledby="contact-faq">
          <h2 id="contact-faq" className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">সাধারণ জিজ্ঞাসা</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className={`${card} group py-4`}>
                <summary className="cursor-pointer list-none font-semibold text-stone-900 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-amber-600 transition group-open:rotate-45" aria-hidden="true">+</span>
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-sm text-stone-600">
            উত্তর আগে নিজে খুঁজে দেখতে চাও?{" "}
            <Link to="/faq" className="font-semibold text-amber-600 hover:text-amber-700">সব প্রশ্নোত্তর দেখো</Link>{" "}
            অথবা জানো{" "}
            <Link to="/about" className="font-semibold text-amber-600 hover:text-amber-700">গ্রন্থবিলাস সম্পর্কে</Link>।
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
