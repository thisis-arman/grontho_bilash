import { Calculator, CalendarCheck, Target, Timer, type LucideIcon } from "lucide-react";

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
    path: "/tools/focus-timer",
    title: "ফোকাস টাইমার",
    shortTitle: "টাইমার",
    desc: "পোমোডোরো পদ্ধতিতে পড়ো: নির্দিষ্ট সময় মনোযোগ, তারপর ছোট বিরতি।",
    icon: Timer,
  },
];
