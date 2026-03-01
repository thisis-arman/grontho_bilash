import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import multer from "multer";
import os from "os";
    // Configuration
    cloudinary.config({
      cloud_name: "dshjcmrd0",
      api_key: "722988628732479",
      api_secret: "fkZhOLsiO7tuzvHA6MbzGOMEXto", 
    });


export const imageUploader = (imageName: string, path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: imageName },
      function (error, result) {
        if (error) {
          reject(error);
          }
          console.log(result?.secure_url);
        resolve(result);
        //delete a file asynchronously
        fs.unlink(path, (err) => {
          if (err) {
            console.error("Error deleting local file after upload:", err);
          }
        });
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

export const upload = multer({ storage: storage });
