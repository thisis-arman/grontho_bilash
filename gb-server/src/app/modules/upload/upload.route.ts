import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import { Auth } from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { DIGITAL_FORMATS, digitalFolder } from "../../utils/digitalFile";

const router = Router();

// Each content type gets its own folder, so the browser cannot pick an
// arbitrary location in the Cloudinary account.
const FOLDERS: Record<string, string> = {
  blog: "grontho-bilash/blog",
  suggestion: "grontho-bilash/suggestions",
};

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,pdf";

const isAdmin = (role?: string) => role === USER_ROLE.admin || role === USER_ROLE.superAdmin;

// Returns a short-lived signature that lets the browser upload one file
// straight to Cloudinary. Files never pass through this server, so the
// Vercel request-size limit does not apply, and the API secret never
// leaves it.
router.post(
  "/signature",
  Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  catchAsync(async (req, res) => {
    const purpose = String(req.body?.purpose);
    // Digital books (any seller) are uploaded privately into the seller's
    // own folder; blog and suggestion images are for admins only.
    const isDigital = purpose === "digital";
    const folder = isDigital ? digitalFolder(String(req.user?.id)) : FOLDERS[purpose];
    if (!folder) {
      throw new AppError(httpStatus.BAD_REQUEST, "Unknown upload purpose");
    }
    if (!isDigital && !isAdmin(req.user?.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You cannot upload this kind of file");
    }
    if (
      !config.cloudinary_api_secret ||
      !config.cloudinary_api_key ||
      !config.cloudinary_cloud_name
    ) {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "File uploads are not configured on the server",
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const params: Record<string, string | number> = isDigital
      ? { timestamp, folder, allowed_formats: DIGITAL_FORMATS, type: "authenticated" }
      : { timestamp, folder, allowed_formats: ALLOWED_FORMATS };
    const signature = cloudinary.utils.api_sign_request(
      params,
      config.cloudinary_api_secret,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Upload signature created",
      data: {
        ...params,
        signature,
        apiKey: config.cloudinary_api_key,
        cloudName: config.cloudinary_cloud_name,
      },
    });
  }),
);

export const uploadRoutes = router;
