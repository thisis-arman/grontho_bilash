import { Schema, Types, model } from "mongoose";

// "Tell me when this book is listed." A logged-in student saves a search;
// when a matching listing is published they get an email and see it in
// their dashboard.
export interface TBookAlert {
  user: Types.ObjectId;
  query: string; // as typed (normalised)
  queryKey: string; // lowercase, for grouping and duplicates
  status: "open" | "notified" | "cancelled";
  matchedProduct?: { title: string; slug: string };
  notifiedAt?: Date;
}

const bookAlertSchema = new Schema<TBookAlert>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: String, required: true, maxlength: 100 },
    queryKey: { type: String, required: true, maxlength: 100 },
    status: { type: String, enum: ["open", "notified", "cancelled"], default: "open", index: true },
    matchedProduct: { title: String, slug: String },
    notifiedAt: Date,
  },
  { timestamps: true }
);

// One open alert per student per search.
bookAlertSchema.index(
  { user: 1, queryKey: 1 },
  { unique: true, partialFilterExpression: { status: "open" } }
);

export const BookAlertModel = model<TBookAlert>("BookAlert", bookAlertSchema);
