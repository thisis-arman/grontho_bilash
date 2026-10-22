import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import SearchBox from "../../components/search/SearchBox";
import WhatsAppButton from "../../components/WhatsAppButton";

// A lost visitor gets three easy ways forward: search, home, or ask.
const NotFound = () => (
  <main className="grid min-h-screen place-items-center bg-stone-50 px-4 py-20">
    <div className="w-full max-w-lg text-center">
      <p className="font-display text-base font-semibold text-amber-600">৪০৪</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">পেজটা পাওয়া যায়নি</h1>
      <p className="mt-3 leading-relaxed text-stone-600">
        লিংকটা হয়তো ভুল বা পুরনো। যে বই বা বিষয় খুঁজছিলে, নিচে লিখে খুঁজে দেখো।
      </p>
      <div className="mt-8 text-left">
        <SearchBox id="notfound-search" autoFocus />
      </div>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/" className="inline-flex h-12 items-center gap-2 rounded-xl bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-stone-800">
          <Home size={16} aria-hidden="true" /> হোমে ফিরে যাও
        </Link>
        <WhatsAppButton message="আসসালামু আলাইকুম, সাইটে একটা পেজ খুঁজে পাচ্ছি না। সাহায্য দরকার।">সাহায্য চাও</WhatsAppButton>
      </div>
    </div>
  </main>
);

export default NotFound;
