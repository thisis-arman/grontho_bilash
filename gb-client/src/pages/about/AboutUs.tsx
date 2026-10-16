import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  FileText,
  GraduationCap,
  HandCoins,
  Lightbulb,
  Newspaper,
  Recycle,
  ShieldCheck,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import WhatsAppButton from "../../components/WhatsAppButton";
import { SITE_URL, usePageMeta } from "../../utils/usePageMeta";

const offerings: { icon: LucideIcon; title: string; desc: string; to: string }[] = [
  {
    icon: BookOpen,
    title: "পুরনো ও নতুন বই",
    desc: "একাডেমিক বই, গাইড, উপন্যাস, বিজ্ঞান, প্রযুক্তি, ধর্মীয় ও শিশুতোষ বই। প্রতিটি লিস্টিংয়ে বইয়ের অবস্থা, ছবি আর দাম দেওয়া থাকে।",
    to: "/books",
  },
  {
    icon: FileText,
    title: "ডিজিটাল নোট ও PDF",
    desc: "হাতে লেখা নোট, লেকচার শিট আর স্টাডি ম্যাটেরিয়াল ডিজিটাল আকারে। ডিজিটাল পণ্যে কোনো ডেলিভারি চার্জ নেই।",
    to: "/books",
  },
  {
    icon: Lightbulb,
    title: "পরীক্ষার সাজেশন",
    desc: "বিষয়ভিত্তিক পরীক্ষার সাজেশন, গুরুত্বপূর্ণ প্রশ্ন, PDF ও ছবি এক জায়গায়। পড়ে দেখা ও ডাউনলোড সম্পূর্ণ ফ্রি।",
    to: "/suggestions",
  },
  {
    icon: Calculator,
    title: "ফ্রি স্টুডেন্ট টুলস",
    desc: "CGPA ক্যালকুলেটর, টার্গেট CGPA প্ল্যানার, অ্যাটেনডেন্স ক্যালকুলেটর আর ফোকাস টাইমার। অ্যাকাউন্ট ছাড়াই ব্যবহার করা যায়।",
    to: "/tools",
  },
  {
    icon: Newspaper,
    title: "ব্লগ ও বই রিভিউ",
    desc: "বই রিভিউ, পড়াশোনার কৌশল, পরীক্ষার প্রস্তুতি আর ক্যারিয়ার নিয়ে লেখা।",
    to: "/blogs",
  },
];

const audiences = [
  "এসএসসি ও এইচএসসি শিক্ষার্থী",
  "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার্থী",
  "জাতীয় বিশ্ববিদ্যালয়ের অনার্স ও মাস্টার্স শিক্ষার্থী",
  "পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ের শিক্ষার্থী",
  "মেডিকেল ও ইঞ্জিনিয়ারিং শিক্ষার্থী",
  "বিসিএস ও চাকরির পরীক্ষার প্রস্তুতি নেওয়া পাঠক",
  "গল্প-উপন্যাস ও সাধারণ বইপ্রেমী",
];

const reasons: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Wallet,
    title: "কম দামে বই",
    desc: "সিনিয়র বা অন্য পাঠকের ব্যবহার করা বই নতুন বইয়ের চেয়ে অনেক কম দামে কেনা যায়।",
  },
  {
    icon: HandCoins,
    title: "ফ্রি লিস্টিং",
    desc: "বই বিক্রির জন্য লিস্ট করতে কোনো টাকা লাগে না, কোনো লুকানো চার্জও নেই।",
  },
  {
    icon: Truck,
    title: "সারা দেশে ডেলিভারি",
    desc: "এলাকাভেদে ডেলিভারি চার্জ ৳৭০ বা ৳১৩০। ক্যাশ অন ডেলিভারি ও বিকাশ, দুইভাবেই পেমেন্ট করা যায়।",
  },
  {
    icon: ShieldCheck,
    title: "স্বচ্ছ লিস্টিং",
    desc: "প্রতিটি বইয়ের অবস্থা, আসল ছবি আর দাম আগে থেকেই দেখা যায়, তাই কেনার আগে বুঝে নিতে পারো।",
  },
  {
    icon: Recycle,
    title: "বইয়ের দ্বিতীয় জীবন",
    desc: "একটা বই একাধিকবার পড়া হলে কাগজ ও টাকা দুটোই বাঁচে। পড়া শেষের বই আর শেলফে পড়ে থাকে না।",
  },
  {
    icon: GraduationCap,
    title: "শিক্ষার্থীদের জন্য তৈরি",
    desc: "বই, নোট, সাজেশন আর পড়াশোনার টুলস, একজন শিক্ষার্থীর যা দরকার সব এক প্ল্যাটফর্মে।",
  },
];

const faqs = [
  {
    q: "গ্রন্থবিলাস কী?",
    a: "গ্রন্থবিলাস বাংলাদেশের শিক্ষার্থী ও বইপ্রেমীদের জন্য একটি অনলাইন মার্কেটপ্লেস, যেখানে পুরনো ও নতুন বই, ডিজিটাল নোট কেনাবেচা করা যায় এবং ফ্রি পরীক্ষার সাজেশন ও স্টুডেন্ট টুলস পাওয়া যায়।",
  },
  {
    q: "গ্রন্থবিলাসে কি পুরনো বই বিক্রি করা যায়?",
    a: "হ্যাঁ। অ্যাকাউন্ট খুলে বইয়ের ছবি, অবস্থা আর দাম দিয়ে লিস্ট করলেই হবে। লিস্টিং সম্পূর্ণ ফ্রি।",
  },
  {
    q: "পেমেন্ট কীভাবে করা যায়?",
    a: "ক্যাশ অন ডেলিভারি অথবা বিকাশে পেমেন্ট করা যায়। ডেলিভারি চার্জ অর্ডারের সময় বিকাশে আগে পরিশোধ করতে হয়।",
  },
  {
    q: "ডেলিভারি চার্জ কত?",
    a: "এলাকাভেদে প্রতি পার্সেলে ৳৭০ বা ৳১৩০। শুধু ডিজিটাল পণ্যের অর্ডারে কোনো ডেলিভারি চার্জ নেই।",
  },
  {
    q: "পরীক্ষার সাজেশন কি ফ্রি?",
    a: "হ্যাঁ, সাজেশন পড়া ও PDF ডাউনলোড করা ফ্রি। এর জন্য অ্যাকাউন্টও লাগে না।",
  },
];

const card = "rounded-2xl border border-stone-200 bg-white p-6";
const sectionTitle = "font-display text-2xl font-bold text-stone-900 sm:text-3xl";

const AboutUs = () => {
  usePageMeta(
    "আমাদের সম্পর্কে – পুরনো বই কেনাবেচার অনলাইন মার্কেটপ্লেস",
    "গ্রন্থবিলাস বাংলাদেশের শিক্ষার্থীদের পুরনো বই কেনাবেচার অনলাইন প্ল্যাটফর্ম। কম দামে সেকেন্ড হ্যান্ড বই, ডিজিটাল নোট, ফ্রি পরীক্ষার সাজেশন ও CGPA ক্যালকুলেটর।",
    undefined,
    {
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "AboutPage",
            url: `${SITE_URL}/about`,
            name: "গ্রন্থবিলাস সম্পর্কে",
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
        {/* Intro */}
        <header className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-amber-600">আমাদের সম্পর্কে</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-stone-900 sm:text-5xl">
            গ্রন্থবিলাস: শিক্ষার্থীদের পুরনো বই কেনাবেচার অনলাইন মার্কেটপ্লেস
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            গ্রন্থবিলাস (Grontho Bilash) বাংলাদেশের শিক্ষার্থী ও বইপ্রেমীদের জন্য তৈরি একটি অনলাইন প্ল্যাটফর্ম।
            এখানে কম দামে পুরনো বা সেকেন্ড হ্যান্ড বই কেনা যায়, পড়া শেষের বই বিক্রি করা যায়, আর পাওয়া যায়
            ডিজিটাল নোট, ফ্রি পরীক্ষার সাজেশন ও পড়াশোনার কাজের টুলস।
          </p>
        </header>

        {/* Story */}
        <section className="mt-14 grid gap-8 lg:grid-cols-2" aria-labelledby="story">
          <div>
            <h2 id="story" className={sectionTitle}>কেন গ্রন্থবিলাস</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-stone-600">
              <p>
                প্রতি বছর নতুন সেমিস্টার বা নতুন ক্লাস শুরু হলে শিক্ষার্থীদের অনেক টাকার বই কিনতে হয়। অথচ ঠিক
                একই বই সিনিয়রদের শেলফে পড়ে থাকে, পরীক্ষা শেষে যেগুলো আর কোনো কাজে আসে না।
              </p>
              <p>
                গ্রন্থবিলাস এই দুই পক্ষকে এক জায়গায় আনে। যার বই দরকার, সে কম দামে ব্যবহৃত বই কিনতে পারে; যার পড়া
                শেষ, সে অনলাইনে বই বিক্রি করে কিছু টাকা ফেরত পায়। ফলে পড়াশোনার খরচ কমে, আর একটা বই অনেকজনের
                কাজে লাগে।
              </p>
            </div>
          </div>
          <div className={`${card} flex flex-col justify-center`}>
            <h2 className="font-display text-xl font-bold text-stone-900">আমাদের লক্ষ্য</h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              বাংলাদেশের প্রত্যেক শিক্ষার্থীর কাছে দরকারি বই ও পড়ার উপকরণ সহজে এবং কম খরচে পৌঁছে দেওয়া, যাতে টাকার
              অভাবে কারও পড়াশোনা থেমে না থাকে।
            </p>
            <h2 className="mt-6 font-display text-xl font-bold text-stone-900">আমাদের স্বপ্ন</h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              দেশের সবচেয়ে বড় শিক্ষার্থী-বান্ধব বইয়ের বাজার গড়ে তোলা, যেখানে কোনো বই অব্যবহৃত পড়ে থাকবে না।
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="mt-16" aria-labelledby="offerings">
          <h2 id="offerings" className={sectionTitle}>গ্রন্থবিলাসে যা যা পাবে</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map(({ icon: Icon, title, desc, to }) => (
              <li key={title}>
                <Link
                  to={to}
                  className={`${card} group block h-full transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
                >
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-stone-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Who it's for */}
        <section className="mt-16" aria-labelledby="audience">
          <h2 id="audience" className={sectionTitle}>কাদের জন্য গ্রন্থবিলাস</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-stone-600">
            স্কুল-কলেজ থেকে বিশ্ববিদ্যালয়, ভর্তি পরীক্ষা থেকে চাকরির প্রস্তুতি, পড়াশোনার যেকোনো ধাপে থাকা
            মানুষের জন্য গ্রন্থবিলাস।
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {audiences.map((a) => (
              <li key={a} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-16 grid gap-4 md:grid-cols-2" aria-labelledby="how">
          <h2 id="how" className={`${sectionTitle} md:col-span-2`}>কীভাবে কাজ করে</h2>
          <div className={card}>
            <h3 className="font-display text-lg font-bold text-stone-900">বই কিনতে চাইলে</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-600">
              <li>বইয়ের নাম, লেখক বা ক্যাটাগরি দিয়ে বই খুঁজে নাও।</li>
              <li>বইয়ের অবস্থা, ছবি ও দাম দেখে ব্যাগে যোগ করো।</li>
              <li>ঠিকানা দিয়ে ক্যাশ অন ডেলিভারি বা বিকাশে অর্ডার করো।</li>
              <li>ড্যাশবোর্ড থেকে অর্ডারের অবস্থা দেখো, বই পৌঁছে যাবে তোমার ঠিকানায়।</li>
            </ol>
            <Link to="/books" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
              সব বই দেখো <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className={card}>
            <h3 className="font-display text-lg font-bold text-stone-900">বই বিক্রি করতে চাইলে</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-600">
              <li>ফ্রিতে অ্যাকাউন্ট খোলো।</li>
              <li>বইয়ের ছবি তুলে অবস্থা ও দাম লিখে লিস্ট করো।</li>
              <li>অর্ডার এলে ড্যাশবোর্ডের বিক্রি পাতায় দেখতে পাবে।</li>
              <li>বই প্যাক করে ক্রেতার কাছে পাঠিয়ে দাও।</li>
            </ol>
            <Link to="/user/add-product" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
              বই বিক্রি করো <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Why us */}
        <section className="mt-16" aria-labelledby="why">
          <h2 id="why" className={sectionTitle}>কেন গ্রন্থবিলাস থেকে বই কিনবে বা বেচবে</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <li key={title} className={card}>
                <Icon size={22} className="text-amber-600" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-bold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-16" aria-labelledby="about-faq">
          <h2 id="about-faq" className={sectionTitle}>সাধারণ জিজ্ঞাসা</h2>
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
            আরও প্রশ্ন আছে?{" "}
            <Link to="/faq" className="font-semibold text-amber-600 hover:text-amber-700">সব প্রশ্নোত্তর দেখো</Link>{" "}
            অথবা{" "}
            <Link to="/contact" className="font-semibold text-amber-600 hover:text-amber-700">আমাদের সাথে যোগাযোগ করো</Link>।
          </p>
        </section>

        {/* CTA */}
        <section className="scheme-fixed mt-16 rounded-3xl bg-stone-900 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">কোনো প্রশ্ন বা সাহায্য দরকার?</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-stone-300">
            বই কেনা, বিক্রি, অর্ডার বা পেমেন্ট নিয়ে যেকোনো প্রশ্নে সরাসরি WhatsApp-এ মেসেজ দাও।
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <WhatsAppButton />
            <Link
              to="/books"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              বই খুঁজো <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
