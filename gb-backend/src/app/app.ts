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
// const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

// app.use(cors({ origin: "*", credentials: true }));app.use(
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Specific frontend origins
    credentials: true, // Allow cookies and authorization headers
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
