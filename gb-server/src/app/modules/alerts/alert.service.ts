import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { emailLayout, escapeHtml, sendMail } from "../../utils/mailer";
import { buildTextFilter, normalizeQuery, queryKey, textMatches } from "../../utils/searchText";
import { ProductModel } from "../book/product.model";
import { FOR_SALE, PRODUCT_SEARCH_FIELDS } from "../search/search.service";
import { User } from "../user/user.model";
import { BookAlertModel } from "./alert.model";

const SITE_URL = "https://www.gronthobilash.com";
const MAX_OPEN_PER_USER = 20;
// Emails sent per new listing at most; the rest still see it in the dashboard.
const MAX_EMAILS_PER_LISTING = 50;

// Saves a "notify me" search. If the book is already for sale, nothing is
// saved and the caller is told how many copies there are instead.
const createAlert = async (userId: string, rawQuery: unknown) => {
  const query = normalizeQuery(rawQuery);
  const key = queryKey(query);
  if (key.length < 3) throw new AppError(httpStatus.BAD_REQUEST, "বইয়ের নাম আরেকটু লিখে দাও (অন্তত ৩ অক্ষর)।");

  const available = await ProductModel.countDocuments({ ...FOR_SALE, ...buildTextFilter(query, PRODUCT_SEARCH_FIELDS) });
  if (available > 0) return { alreadyAvailable: true, available, alert: null };

  const existing = await BookAlertModel.findOne({ user: userId, queryKey: key, status: "open" });
  if (existing) return { alreadyAvailable: false, available: 0, alert: existing };

  const open = await BookAlertModel.countDocuments({ user: userId, status: "open" });
  if (open >= MAX_OPEN_PER_USER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `একসাথে সর্বোচ্চ ${MAX_OPEN_PER_USER}টি বইয়ের খোঁজ রাখা যায়। পুরনো কোনোটা মুছে আবার চেষ্টা করো।`
    );
  }

  const alert = await BookAlertModel.create({ user: userId, query, queryKey: key });
  return { alreadyAvailable: false, available: 0, alert };
};

const myAlerts = (userId: string) =>
  BookAlertModel.find({ user: userId, status: { $ne: "cancelled" } })
    .select("query status matchedProduct notifiedAt createdAt")
    .sort({ status: 1, createdAt: -1 })
    .limit(100)
    .lean();

const cancelAlert = async (userId: string, alertId: string) => {
  if (!Types.ObjectId.isValid(alertId)) throw new AppError(httpStatus.BAD_REQUEST, "ভুল আইডি");
  const result = await BookAlertModel.updateOne(
    { _id: alertId, user: userId, status: { $ne: "cancelled" } },
    { $set: { status: "cancelled" } }
  );
  if (!result.matchedCount) throw new AppError(httpStatus.NOT_FOUND, "এই খোঁজটি পাওয়া যায়নি");
  return null;
};

type ListingLike = {
  _id: unknown;
  title: string;
  slug: string;
  category?: string;
  isPublished?: boolean;
  isDeleted?: boolean;
  bookMetadata?: { author?: string };
  price?: { basePrice?: number; discountPrice?: number };
};

const alertEmail = (query: string, product: ListingLike) => {
  const url = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
  const price = product.price?.discountPrice || product.price?.basePrice;
  return {
    subject: `তোমার খোঁজা বই পাওয়া গেছে: ${product.title}`,
    text: `তুমি "${query}" খুঁজছিলে। গ্রন্থবিলাসে এখন "${product.title}" পাওয়া যাচ্ছে${price ? ` (৳${price})` : ""}। দেখো: ${url}`,
    html: emailLayout(
      "তোমার খোঁজা বই পাওয়া গেছে!",
      `<p style="color:#57534e;margin:0 0 16px;line-height:1.7;">তুমি <b>${escapeHtml(query)}</b> খুঁজছিলে। এইমাত্র এই বইটি লিস্ট হয়েছে:</p>
       <p style="font-size:18px;font-weight:bold;color:#1c1917;margin:0 0 4px;">${escapeHtml(product.title)}</p>
       ${product.bookMetadata?.author ? `<p style="color:#78716c;margin:0 0 4px;">${escapeHtml(product.bookMetadata.author)}</p>` : ""}
       ${price ? `<p style="color:#1c1917;margin:0 0 20px;">দাম: ৳${price}</p>` : ""}
       <a href="${url}" style="display:inline-block;background:#fbbf24;color:#1c1917;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:12px;">বইটি দেখো</a>
       <p style="color:#a8a29e;margin:20px 0 0;font-size:13px;">পুরনো বই দ্রুত বিক্রি হয়ে যায়, তাই দেরি কোরো না।</p>`
    ),
  };
};

// Called when a listing becomes visible in the shop. Never throws: a
// listing must not fail because a notification did.
const notifyForListing = async (product: ListingLike | null | undefined) => {
  try {
    if (!product || product.isDeleted || !product.isPublished) return 0;
    const text = [product.title, product.bookMetadata?.author, product.category].filter(Boolean).join(" ");

    const open = await BookAlertModel.find({ status: "open" }).select("user query").limit(5000).lean();
    const matched = open.filter((alert) => textMatches(alert.query, text));
    if (!matched.length) return 0;

    await BookAlertModel.updateMany(
      { _id: { $in: matched.map((a) => a._id) }, status: "open" },
      { $set: { status: "notified", notifiedAt: new Date(), matchedProduct: { title: product.title, slug: product.slug } } }
    );

    const users = await User.find({ _id: { $in: matched.map((a) => a.user) }, isDeleted: false })
      .select("email")
      .lean<{ _id: Types.ObjectId; email: string }[]>();
    const emailOf = new Map(users.map((u) => [String(u._id), u.email]));

    await Promise.allSettled(
      matched.slice(0, MAX_EMAILS_PER_LISTING).map((alert) => {
        const to = emailOf.get(String(alert.user));
        return to ? sendMail({ to, ...alertEmail(alert.query, product) }) : Promise.resolve(false);
      })
    );
    return matched.length;
  } catch (error) {
    console.error("Book alert matching failed:", (error as Error).message);
    return 0;
  }
};

export const alertService = { createAlert, myAlerts, cancelAlert, notifyForListing };
