import { Schema, model } from "mongoose";

// One row per distinct search, so the team can see what students look for,
// and above all what they look for and don't find.
export interface TSearchLog {
  term: string; // normalised, lowercase
  display: string; // as last typed, for showing in the admin page
  count: number;
  zeroCount: number; // how many of those searches found nothing
  lastResults: number;
  lastSearchedAt: Date;
}

const searchLogSchema = new Schema<TSearchLog>({
  term: { type: String, required: true, unique: true, maxlength: 100 },
  display: { type: String, required: true, maxlength: 100 },
  count: { type: Number, default: 0 },
  zeroCount: { type: Number, default: 0 },
  lastResults: { type: Number, default: 0 },
  // Searches nobody has repeated for 6 months are dropped automatically.
  lastSearchedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

searchLogSchema.index({ zeroCount: -1 });
searchLogSchema.index({ count: -1 });

export const SearchLogModel = model<TSearchLog>("SearchLog", searchLogSchema);
