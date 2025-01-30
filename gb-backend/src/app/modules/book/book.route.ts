import fs from "fs";
import { zodValidationSchema } from "./book.validation";
import express, { Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { bookController } from "./book.controllers";
import { imageUploader, upload } from "../../utils/imageUploader";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const router = express.Router();

router.get(
  "/",
  // Auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  bookController.getBooks
);
router.get('/products',bookController.getProductsByCategories)
router.get("/:email", bookController.getBooksByEmail);
router.post("/upload", upload.single("image"), async (req, res): Promise<void> => {
  try {
    const imageName = req.file?.originalname;
    const path = req.file?.path;

    if (!imageName || !path) {
      res.status(400).json({ error: "Image file is required." });
      return;
    }

    // Upload image to Cloudinary
    const result = await imageUploader(imageName, path) as { secure_url: string };

    // Delete the file after uploading to Cloudinary
    fs.unlink(path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    // Send the Cloudinary URL as a response to the frontend
    res.status(200).json({ url: result?.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.patch("/:id", bookController.deleteBook);
router.post(
  "/create-book",
  validateRequest(zodValidationSchema.createBookSchema),
  bookController.listABook
);
router.get("/book/:id", bookController.getBook);
router.patch(
  "/:bookId",
  validateRequest(zodValidationSchema.updateBookSchema),
  bookController.updateBook
);

export const bookRoutes = router;
