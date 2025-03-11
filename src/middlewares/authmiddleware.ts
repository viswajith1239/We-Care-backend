import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

interface CustomRequest extends Request {
  authData?: { id: string; email: string; role: string };
}

const authMiddleware = (roles: string[] = []) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];

    console.log("Checking Token:", token); // Debugging

    if (!token) {
      res.status(401).json({ message: "Access Denied, Token Missing" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      if (!decoded || typeof decoded !== "object") {
        res.status(401).json({ message: "Invalid Token Structure" });
        return;
      }

      req.authData = {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as string,
      };

      // Role check
      if (roles.length && !roles.includes(req.authData.role)) {
        res.status(403).json({ message: "Access Denied, Role Insufficient" });
        return;
      }

      return next(); // Ensure middleware flow control
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(401).json({ message: "Token Expired, Please Login Again" });
      } else {
        res.status(401).json({ message: "Invalid Token" });
      }
      return;
    }
  };
};

export default authMiddleware;
