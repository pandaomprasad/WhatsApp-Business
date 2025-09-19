import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authMiddleware(req, allowedRoles = []) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No token");

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      throw new Error("Forbidden");
    }

    return payload; // { userId, role, name }
  } catch (err) {
    return null;
  }
}
