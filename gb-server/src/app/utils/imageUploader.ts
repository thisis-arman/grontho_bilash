import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import multer from "multer";
import os from "os";
import config from "../config";

// Configuration
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const imageUploader = (path: string) => {
  return new Promise((resolve, reject) => {
    // No public_id: Cloudinary generates a unique one. Using the original
    // filename made two sellers' "image.jpg" overwrite each other.
    cloudinary.uploader.upload(
      path,
      { folder: "grontho-bilash/products", resource_type: "image" },
      function (error, result) {
        fs.unlink(path, (err) => {
          if (err) {
            console.error("Error deleting local file after upload:", err);
          }
        });
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage: storage,
  // Vercel rejects request bodies over ~4.5MB before they reach us.
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG or WebP images are allowed"));
    }
  },
});
