// import { NextFunction, Request, Response } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import config from "../config";

// const auth = (...roles: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const headerToken = req.headers.authorization;

//       if (!headerToken) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const parts = headerToken.split(" ");

//       if (parts.length !== 2 || parts[0] !== "Bearer") {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       // Extract token safely
//       const token = parts[1];

//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       // Fix TypeScript error by asserting token as string
//       const decodedToken = jwt.verify(token as string, config.jwtSecret as string) as JwtPayload;

//       req.user = decodedToken;

//       // Role checking
//       if (roles.length > 0 && !roles.includes(decodedToken.role)) {
//         return res.status(403).json({
//           error: "You do not have permission to access this resource",
//         });
//       }

//       next();
//     } catch (err: any) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//   };
// };

// export default auth;

 import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

interface UserJwtPayload {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const headerToken = req.headers.authorization;

      // Guard: if headerToken is undefined
      if (!headerToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parts = headerToken.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = parts[1];

      // Guard again: TypeScript still thinks token could be undefined
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Now token is guaranteed to be string
      const decoded = jwt.verify(token, config.jwtSecret as string) as unknown;
      // console.log("Decoded token:", decoded);
      const user = decoded as UserJwtPayload;
// console.log("Decoded user from token:", user);

      if (!user || !user.id) {
        
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;

      // Role check
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "You do not have permission" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

export default auth;
