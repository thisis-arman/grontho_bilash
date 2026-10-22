import { Application, Request, Response } from "express";
import cors from "cors";
import router from "./modules/routers";
import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/NotFound";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app: Application = express();

// Behind Vercel's proxy: without this every visitor shares one rate-limit bucket.
app.set("trust proxy", 1);

// Security Middlewares
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "অনেক বেশি অনুরোধ এসেছে। ১৫ মিনিট পরে আবার চেষ্টা করো।",
  },
});
app.use(limiter);

// Tighter limit on endpoints that can be brute-forced or used to spam email.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "অনেকবার চেষ্টা করা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করো।",
  },
});

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gronthobilash.com",
  "https://www.gronthobilash.com",
  "https://gronthobilash.vercel.app",
  "https://grontho-bilash-hpt4.vercel.app",
  // Optional extra origins for local testing, e.g. "http://localhost:5174".
  ...(process.env.EXTRA_CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin) return callback(null, true);

    // Other origins get no CORS headers (so browsers can't read responses)
    // rather than a 400 error. Requests that reach us through the website's
    // own /api-proxy rewrite (Vercel previews) carry the preview's Origin but
    // are same-origin for the browser, so they must not be rejected here.
    // Logged-in requests stay protected: they need the Authorization header,
    // which triggers a preflight that only allowed origins pass.
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/otp", authLimiter);
app.use("/api/v1/users/register", authLimiter);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is operational.",
    data: {
      name: "Grontho Bilash API",
      version: "1.0.0",
    },
    timestamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
