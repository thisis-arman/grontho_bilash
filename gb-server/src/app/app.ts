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

// Security Middlewares
app.use(helmet());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://gronthobilash.vercel.app", // Add your Vercel URL here later
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow server-to-server or Postman (where origin is undefined)
      if (!origin) return callback(null, true);

      // 2. Check if the origin is in our whitelist
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log for debugging so you can see which origin failed in production
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// Handle OPTIONS preflight requests for all routes
app.options("*", cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Grontho Bilash server is working...");
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
