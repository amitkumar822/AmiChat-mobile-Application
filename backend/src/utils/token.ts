import jwt from "jsonwebtoken";
import { UserProps } from "../types/types";

export const generateToken = (user: UserProps) => {
  const payload: jwt.JwtPayload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

// "30d" for 30 days
// "1m" for 1 minute
// "24h" for 24 hours
// "60s" for 60 seconds
// "1y" for 1 year
// "1d" for 1 day
// "1w" for 1 week
// "1h" for 1 hour
// "1min" for 1 minute
// "1s" for 1 second
// "1ms" for 1 millisecond