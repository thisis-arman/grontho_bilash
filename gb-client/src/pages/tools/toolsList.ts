import { Calculator, CalendarCheck, CalendarClock, GraduationCap, Percent, Target, Timer, type LucideIcon } from "lucide-react";

export interface ToolInfo {
  path: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: LucideIcon;
}

// Single source for the tools hub, the tools sub-navigation and the navbar
// dropdown. Add a tool here (and its route) and it shows up everywhere.
export const TOOLS: ToolInfo[] = [
  {
    path: "/tools/cgpa-calculator",
    title: "CGPA ক্যালকুলেটর",
    shortTitle: "CGPA",
    desc: "সেমিস্টার বা ইয়ার ধরে রেজাল্ট বসাও, CGPA বের করো আর নিজের নামে রিপোর্ট কার্ড ডাউনলোড করো।",
    icon: Calculator,
  },
  {
    path: "/tools/gpa-calculator",
    title: "SSC / HSC GPA ক্যালকুলেটর",
    shortTitle: "GPA",
    desc: "কোন গ্রেড কয়টা বিষয়ে পেয়েছ বসাও, ৪র্থ বিষয়সহ বোর্ডের নিয়মে GPA বের করো।",
    icon: GraduationCap,
  },
  {
    path: "/tools/grade-converter",
    title: "নম্বর থেকে গ্রেড",
    shortTitle: "গ্রেড",
    desc: "কত নম্বরে কোন গ্রেড আর কত পয়েন্ট, বিশ্ববিদ্যালয় (UGC) ও বোর্ড দুই পদ্ধতিতে।",
    icon: Percent,
  },
  {
    path: "/tools/target-cgpa",
    title: "টার্গেট CGPA প্ল্যানার",
    shortTitle: "টার্গেট",
    desc: "কাঙ্ক্ষিত CGPA পেতে বাকি ক্রেডিটগুলোতে গড়ে কত GPA লাগবে, হিসাব করে নাও।",
    icon: Target,
  },
  {
    path: "/tools/attendance",
    title: "অ্যাটেনডেন্স ক্যালকুলেটর",
    shortTitle: "অ্যাটেনডেন্স",
    desc: "উপস্থিতির হার কত, আর কয়টা ক্লাস মিস করা যাবে বা টানা করতে হবে, এক নজরে দেখো।",
    icon: CalendarCheck,
  },
  {
    path: "/tools/age-calculator",
    title: "চাকরির বয়স ক্যালকুলেটর",
    shortTitle: "বয়স",
    desc: "সার্কুলারের তারিখে তোমার বয়স কত, আর বয়সসীমার মধ্যে আছ কিনা দেখো।",
    icon: CalendarClock,
  },
  {
    path: "/tools/focus-timer",
    title: "ফোকাস টাইমার",
    shortTitle: "টাইমার",
    desc: "পোমোডোরো পদ্ধতিতে পড়ো: নির্দিষ্ট সময় মনোযোগ, তারপর ছোট বিরতি।",
    icon: Timer,
  },
];
