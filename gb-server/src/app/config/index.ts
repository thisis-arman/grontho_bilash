import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  salt_rounds: process.env.SALT_ROUNDS,
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  node_env: process.env.NODE_ENV,
  // Vercel sets VERCEL_ENV itself, so this stays correct even if NODE_ENV is misconfigured there.
  is_production:
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production",
  stripe_sk: process.env.STRIPE_SK,
  stripe_pk: process.env.STRIPE_PK,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
