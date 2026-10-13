import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      // Set by the Auth middleware; id and role are re-read from the database.
      user: JwtPayload & { id: string; email: string; role: string };
    }
  }
}
