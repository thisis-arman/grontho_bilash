import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {  ArrowRight, Mail, MapPin, Phone } from "lucide-react";


const footerNavs = [
  {
    label: "Marketplace",
    items: [
      { to: "/books",               name: "Browse Books"    },
      { to: "/books?type=Digital",  name: "Digital Products"},
      { to: "/books?category=Academic", name: "Academic Books"},
      { to: "/dashboard/add-product",  name: "Sell a Book"     },
    ],
  },
  {
    label: "Company",
    items: [
      { to: "/about",   name: "About Us"    },
      { to: "/blog",    name: "Blog"        },
      { to: "/careers", name: "Careers"     },
      { to: "/contact", name: "Contact"     },
    ],
  },
  {
    label: "Legal",
    items: [
      { to: "/terms",   name: "Terms of Use"      },
      { to: "/privacy", name: "Privacy Policy"    },
      { to: "/license", name: "License"           },
      { to: "/faq",     name: "FAQ"               },
    ],
  },
];

const socials = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 48 48">
        <path d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708v-16.77h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.978 48 24z"/>
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 48 48">
        <path d="M15.1 43.5c18.11 0 28.017-15.006 28.017-28.016 0-.422-.01-.853-.029-1.275A19.998 19.998 0 0048 9.11c-1.795.798-3.7 1.32-5.652 1.546a9.9 9.9 0 004.33-5.445 19.794 19.794 0 01-6.251 2.39 9.86 9.86 0 00-16.788 8.979A27.97 27.97 0 013.346 6.299 9.859 9.859 0 006.393 19.44a9.86 9.86 0 01-4.462-1.228v.122a9.844 9.844 0 007.901 9.656 9.788 9.788 0 01-4.442.169 9.867 9.867 0 009.195 6.843A19.75 19.75 0 010 39.078 27.937 27.937 0 0015.1 43.5z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 48 48">
        <path d="M24 4.322c6.413 0 7.172.028 9.694.14 2.343.104 3.61.497 4.453.825 1.116.432 1.922.957 2.756 1.791.844.844 1.36 1.64 1.79 2.756.329.844.723 2.12.826 4.454.112 2.53.14 3.29.14 9.693 0 6.413-.028 7.172-.14 9.694-.103 2.344-.497 3.61-.825 4.453-.431 1.116-.957 1.922-1.79 2.756-.845.844-1.642 1.36-2.757 1.791-.844.328-2.119.722-4.453.825-2.532.112-3.29.14-9.694.14-6.413 0-7.172-.028-9.694-.14-2.343-.103-3.61-.497-4.453-.825-1.115-.431-1.922-.956-2.756-1.79-.844-.844-1.36-1.641-1.79-2.757-.329-.844-.723-2.119-.826-4.453-.112-2.531-.14-3.29-.14-9.694 0-6.412.028-7.172.14-9.694.103-2.343.497-3.609.825-4.453.431-1.115.957-1.921 1.79-2.756.845-.844 1.642-1.36 2.757-1.79.844-.329 2.119-.722 4.453-.825 2.522-.113 3.281-.141 9.694-.141zM24 0c-6.516 0-7.331.028-9.89.14-2.55.113-4.304.526-5.822 1.116-1.585.619-2.926 1.435-4.257 2.775-1.34 1.332-2.156 2.672-2.775 4.247C.666 9.806.253 11.55.141 14.1.028 16.669 0 17.484 0 24s.028 7.331.14 9.89c.113 2.55.526 4.304 1.116 5.822.619 1.585 1.435 2.925 2.775 4.257a11.732 11.732 0 004.247 2.765c1.528.591 3.272 1.003 5.822 1.116 2.56.112 3.375.14 9.89.14 6.516 0 7.332-.028 9.891-.14 2.55-.113 4.303-.525 5.822-1.116a11.732 11.732 0 004.247-2.765 11.732 11.732 0 002.766-4.247c.59-1.528 1.003-3.272 1.115-5.822.113-2.56.14-3.375.14-9.89 0-6.516-.027-7.332-.14-9.891-.112-2.55-.525-4.303-1.115-5.822-.591-1.594-1.407-2.935-2.747-4.266a11.732 11.732 0 00-4.247-2.765C38.194.675 36.45.262 33.9.15 31.331.028 30.516 0 24 0z"/><path d="M24 11.672c-6.806 0-12.328 5.522-12.328 12.328 0 6.806 5.522 12.328 12.328 12.328 6.806 0 12.328-5.522 12.328-12.328 0-6.806-5.522-12.328-12.328-12.328zm0 20.325a7.998 7.998 0 010-15.994 7.998 7.998 0 010 15.994zM39.694 11.184a2.879 2.879 0 11-2.878-2.878 2.885 2.885 0 012.878 2.878z"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 48 48">
        <path fillRule="evenodd" d="M24 1A24.086 24.086 0 008.454 6.693 23.834 23.834 0 00.319 21.044a23.754 23.754 0 003.153 16.172 23.98 23.98 0 0012.938 10.29c1.192.221 1.641-.518 1.641-1.146 0-.628-.024-2.45-.032-4.442-6.676 1.443-8.087-2.817-8.087-2.817-1.089-2.766-2.663-3.493-2.663-3.493-2.178-1.478.163-1.45.163-1.45 2.413.17 3.68 2.461 3.68 2.461 2.138 3.648 5.616 2.593 6.983 1.976.215-1.545.838-2.596 1.526-3.193-5.333-.6-10.937-2.647-10.937-11.791a9.213 9.213 0 012.472-6.406c-.246-.6-1.069-3.026.234-6.322 0 0 2.015-.64 6.602 2.446a22.904 22.904 0 0112.017 0c4.583-3.086 6.594-2.446 6.594-2.446 1.307 3.288.484 5.714.238 6.322a9.194 9.194 0 012.476 6.414c0 9.163-5.615 11.183-10.957 11.772.859.742 1.626 2.193 1.626 4.421 0 3.193-.028 5.762-.028 6.548 0 .636.433 1.38 1.65 1.146a23.98 23.98 0 0012.938-10.291 23.754 23.754 0 003.151-16.175A23.834 23.834 0 0039.56 6.69 24.086 24.086 0 0024.009 1H24z" clipRule="evenodd"/>
      </svg>
    ),
  },
];

const Footer = () => {
  const [email, setEmail]     = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-400">

      <div className="border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-1">Stay in the loop</p>
              <h3 className="text-lg font-bold text-white">Get new listings straight to your inbox.</h3>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
                You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 text-stone-200 placeholder:text-stone-600 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  Subscribe
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          <div className="sm:col-span-2 lg:col-span-2">
            
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                {/* <BookOpen size={16} className="text-stone-900" /> */}
                <img src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png" alt="" srcset="" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">Grontho Bilash</span>
            </Link>

            <p className="text-sm leading-relaxed text-stone-500 mb-6 max-w-xs">
              Bangladesh's trusted marketplace to buy and sell used books, textbooks,
              study resources, and digital products. Affordable learning starts here.
            </p>

            {/* Contact info */}
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-stone-500">
                <MapPin size={14} className="text-amber-500 flex-shrink-0" />
                Dhaka, Bangladesh
              </li>
              <li className="flex items-center gap-2.5 text-stone-500">
                <Mail size={14} className="text-amber-500 flex-shrink-0" />
                <a href="mailto:hello@gronthobilash.com" className="hover:text-amber-400 transition-colors">
                  hello@gronthobilash.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-stone-500">
                <Phone size={14} className="text-amber-500 flex-shrink-0" />
                <a href="tel:+8801700000000" className="hover:text-amber-400 transition-colors">
                  +880 1700-000000
                </a>
              </li>
            </ul>
          </div>

          {/* Nav columns */}
          {footerNavs.map((nav) => (
            <div key={nav.label}>
              <h4 className="text-xs font-bold tracking-widest uppercase text-stone-300 mb-4">
                {nav.label}
              </h4>
              <ul className="space-y-3">
                {nav.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.to}
                      className="text-sm text-stone-500 hover:text-amber-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600 text-center sm:text-left">
            © {new Date().getFullYear()} Grontho Bilash. All rights reserved. Made with ❤️ in Bangladesh.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2">
            {socials.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-amber-500 text-stone-400 hover:text-stone-900 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;