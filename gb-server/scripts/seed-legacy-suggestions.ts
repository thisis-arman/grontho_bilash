/**
 * One-off migration: moves the BBA suggestions that used to be hard-coded in
 * gb-client/src/assets/db/exam_suggestions.json into the Suggestion module.
 *
 *   npm run seed:suggestions             # dry run: prints what would happen
 *   npm run seed:suggestions -- --write  # actually writes to the database
 *
 * Safe to run more than once: an entry whose slug already exists is skipped.
 * Entries prepared by "Demo Teacher" are placeholder content, so they are
 * imported as drafts for an admin to review rather than published.
 */
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import slugify from "slugify";
import config from "../src/app/config";
import { User } from "../src/app/modules/user/user.model";
import { SuggestionModel } from "../src/app/modules/suggestion/suggestion.model";

interface LegacyItem {
  subjectCode: string;
  subjectName: string;
  department: string;
  year: string; // "BBA 4th Year"
  examYear: string; // "2024 (Held in 2026)"
  preparedBy: string;
  chapters: {
    chapterNo: string;
    chapterName: string;
    questions: { text: string; priority: number }[];
  }[];
}

const SOURCE = path.resolve(__dirname, "../../gb-client/src/assets/db/exam_suggestions.json");
const WRITE = process.argv.includes("--write");

const toMarkdown = (item: LegacyItem) => {
  const lines = [
    "★★★ = very important, ★★ = important.",
    "",
  ];
  for (const chapter of item.chapters) {
    lines.push(`## অধ্যায় ${chapter.chapterNo}: ${chapter.chapterName}`, "");
    chapter.questions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.text} ${q.priority > 2 ? "★★★" : "★★"}`);
    });
    lines.push("");
  }
  return lines.join("\n").trim();
};

const main = async () => {
  const items: LegacyItem[] = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  await mongoose.connect(config.database_url as string);

  const admin = await User.findOne({ role: "admin", isDeleted: false }).sort({ createdAt: 1 });
  if (!admin) throw new Error("No admin user found to set as the author.");

  for (const item of items) {
    const [program, ...rest] = item.year.split(" ");
    const slug = slugify(`${item.subjectCode} ${item.subjectName} final suggestion`, { lower: true, strict: true });
    const isDemo = /demo/i.test(item.preparedBy);

    if (await SuggestionModel.exists({ slug })) {
      console.log(`skip     ${slug} (already exists)`);
      continue;
    }

    const doc = {
      title: `${item.subjectName} — Final Exam Suggestion`,
      slug,
      summary: `${item.year} final exam suggestion for ${item.subjectName} (${item.subjectCode}), chapter by chapter with the most important questions marked.`,
      body: toMarkdown(item),
      attachments: [],
      level: "Honours" as const,
      subject: item.subjectName,
      subjectCode: item.subjectCode,
      program,
      department: item.department,
      academicYear: rest.join(" "),
      examYear: item.examYear,
      preparedBy: item.preparedBy,
      tags: [program.toLowerCase(), item.department.toLowerCase()],
      author: admin._id,
      status: isDemo ? ("draft" as const) : ("published" as const),
      publishedAt: isDemo ? undefined : new Date(),
    };

    if (WRITE) await SuggestionModel.create(doc);
    console.log(`${WRITE ? "created" : "would add"} ${slug} as ${doc.status}`);
  }

  if (!WRITE) console.log("\nDry run only. Re-run with --write to save.");
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
