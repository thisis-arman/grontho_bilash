import { Schema, model } from "mongoose";

const blogSchema = new Schema(
  {
    title:         { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:       { type: String, required: true, maxlength: 300 }, // for cards & SEO
    content:       { type: String, required: true },
    contentFormat: { type: String, enum: ["html", "markdown"], default: "html" },
    featuredImage: { type: String, required: true },

    author:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName:    { type: String }, 

    category: {
      type: String,
      enum: ["Book Review", "Academic Tips", "Platform News", "User Story"],
      required: true,
    },
    tags: [{ type: String }],

    seo: {
      metaTitle:       { type: String, maxlength: 60 },
      metaDescription: { type: String, maxlength: 160 },
      keywords:        [{ type: String }],
      canonicalUrl:    { type: String },
      ogImage:         { type: String },
    },

    // Engagement
    views:        { type: Number, default: 0 },
    likes:        [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedBy:      [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentCount: { type: Number, default: 0 }, // denormalized
    relatedBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    relatedPosts: [{ type: Schema.Types.ObjectId, ref: "Blog" }],

    readingTime: { type: Number },

    status:      { type: String, enum: ["Draft", "Published", "Archived"], default: "Draft" },
    publishedAt: { type: Date },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/g).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Indexes
// blogSchema.index({ slug: 1 });
// blogSchema.index({ status: 1, publishedAt: -1 });
// blogSchema.index({ category: 1, status: 1 });
// blogSchema.index({ tags: 1 });
// blogSchema.index({ author: 1 });
// blogSchema.index({ views: -1 });

export const BlogModel = model("Blog", blogSchema);