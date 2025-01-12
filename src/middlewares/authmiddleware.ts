import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  authData?: { id: string; email: string; role: string };
}

const authMiddleware = (roles: string[] = []) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Access Denied, token Missing" });
      return; // Early return after response, no need to continue
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string) as CustomRequest["authData"];
      req.authData = decoded;

      // Role check
      if (roles.length && !roles.includes(decoded.role)) {
        res.status(403).json({ message: "Access Denied, Role Insufficient" });
        return; // Early return after response
      }

      // Proceed to next middleware or route handler
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or Expired Token" });
      return; // Early return after response
    }
  };
};

export default authMiddleware;
