import { Application, Request, Response } from "express";
import cors from "cors";
import router from "./modules/routers";
import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/NotFound";
import cookieParser from "cookie-parser";
// import notFound from "./middlewares/notFound"

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5173", "http://localhost"]; // List all possible origins

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Specify headers if needed
  })
);

// Ensure OPTIONS requests are handled correctly
app.options("*", cors());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found middleware for all other routes
app.use("*", notFound); // Catch-all for undefined routes

export default app;
