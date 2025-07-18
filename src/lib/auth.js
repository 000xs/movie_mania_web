import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const generateTokens = (payload) => {
  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: "60m" });
  const refresh = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  return { access, refresh };
};

export const verifyToken = (token) =>
  jwt.verify(token, JWT_SECRET) ;