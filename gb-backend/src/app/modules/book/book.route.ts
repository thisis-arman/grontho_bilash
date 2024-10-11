import fs  from 'fs';
import { zodValidationSchema } from "./book.validation";
import express, { Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { bookController } from "./book.controllers";
import { imageUploader, upload } from "../../utils/imageUploader";

const router = express.Router();

router.get("/", bookController.getBooks);
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageName = req.file?.originalname;
    const path = req.file?.path;

    if (!imageName || !path) {
      return res.status(400).json({ error: "Image file is required." });
    }

    // Upload image to Cloudinary
    const result = await imageUploader(imageName, path);

    // Delete the file after uploading to Cloudinary
    fs.unlink(path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    // Send the Cloudinary URL as a response to the frontend
    return res.status(200).json({ url: result?.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post(
  "/create-book",
  validateRequest(zodValidationSchema.createBookSchema),
  bookController.listABook
);
router.patch(
  "/:bookId",
  validateRequest(zodValidationSchema.updateBookSchema),
  bookController.updateBook
);
router.get("/:bookId", bookController.getBook);
router.patch("/:bookId", bookController.deleteBook);

export const bookRoutes = router;
