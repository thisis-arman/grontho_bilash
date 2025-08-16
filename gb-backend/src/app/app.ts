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
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true, // allow cookies/authorization headers
  })
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
