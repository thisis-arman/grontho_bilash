import { zodValidationSchema } from "./book.validation";
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { bookController } from "./book.controllers";

const router = express.Router();

router.get("/", bookController.getBooks);
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
