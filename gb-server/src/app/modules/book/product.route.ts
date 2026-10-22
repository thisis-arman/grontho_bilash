import express from "express";
import { bookController } from "./book.controllers";
import { imageUploader, upload } from "../../utils/imageUploader";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";
import config from "../../config";

const router = express.Router();

const anyUser = Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin);

// Legacy "books" collection (pre-Product model). Read-only now.
router.get("/", bookController.getBooks);

router.get("/all-products", bookController.getAllProducts);
router.get("/shop-facets", bookController.getShopFacets);
router.get(
  "/admin/all-products",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  bookController.getProductsForAdmin,
);
router.get("/products", bookController.getProductsByCategories);
router.get("/products/:slug", bookController.getProductBySlug);
router.get("/book/:id", bookController.getBook);

// A seller's own listings (drafts included), so it needs a login.
router.get("/:email", anyUser, bookController.getBooksByEmail);

router.post("/search", bookController.searchBooks);

router.post(
  "/upload",
  anyUser,
  upload.single("image"),
  async (req, res): Promise<void> => {
    try {
      const path = req.file?.path;
      console.log(11,
        config.cloudinary_api_secret,
        config.cloudinary_api_key,
        config.cloudinary_cloud_name,
      );
      if (!path) {
        res.status(400).json({ error: "Image file is required." });
        return;
      }
      if (
        !config.cloudinary_cloud_name ||
        !config.cloudinary_api_key ||
        !config.cloudinary_api_secret
      ) {
        res
          .status(503)
          .json({ error: "File uploads are not configured on the server" });
        return;
      }

      // imageUploader removes the temp file itself once Cloudinary answers.
      const result = (await imageUploader(path)) as { secure_url: string };

      res.status(200).json({ url: result?.secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

router.post("/create-product", anyUser, bookController.createProduct);

// Soft delete. Owner or admin only (checked in the service).
router.patch("/:id", anyUser, bookController.deleteBook);

// Owner or admin only (checked in the service).
router.put("/:bookId", anyUser, bookController.updateBook);

export const bookRoutes = router;
