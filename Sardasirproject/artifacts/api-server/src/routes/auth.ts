import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import * as crypto from "crypto";
// @ts-ignore
import { sign, verify } from "jsonwebtoken";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.warn("JWT_SECRET env var not set — using an insecure default. Set JWT_SECRET in production.");
}
const SECRET = JWT_SECRET || crypto.randomBytes(32).toString("hex");

function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function makeToken(userId: string): string {
  return sign({ sub: userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    return verify(token, SECRET) as { sub: string };
  } catch {
    return null;
  }
}

export function getTokenFromReq(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).userId = payload.sub;
  next();
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, payload.sub));
    if (!profile || !["admin", "super_admin"].includes(profile.role ?? "")) {
      res.status(403).json({ error: "Forbidden: admin access required" });
      return;
    }
    (req as any).userId = payload.sub;
    (req as any).userRole = profile.role;
    next();
  } catch (err: any) {
    logger.error({ err }, "Admin auth check error");
    res.status(500).json({ error: "Auth check failed" });
  }
}

router.post("/auth/signup.php", async (req, res): Promise<void> => {
  const { email, password, data: meta } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const salt = generateSalt();
    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash: `${salt}:${hashPassword(password, salt)}`,
    }).returning();

    await db.insert(profilesTable).values({
      userId: user.id,
      email: user.email,
      fullName: meta?.full_name || null,
      role: "agent",
      status: "active",
    });

    const token = makeToken(user.id);
    const session = { access_token: token, refresh_token: token, token_type: "bearer" };
    const userObj = { id: user.id, email: user.email, user_metadata: meta || {} };
    res.json({ data: { user: userObj, session }, error: null });
  } catch (err: any) {
    logger.error({ err }, "Signup error");
    res.status(500).json({ error: err?.message || "Signup failed" });
  }
});

router.post("/auth/login.php", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    let passwordValid = false;
    if (user.passwordHash.includes(":")) {
      const [salt, hash] = user.passwordHash.split(":");
      passwordValid = hashPassword(password, salt) === hash;
    } else {
      passwordValid = crypto.createHash("sha256").update(password + "lawmind_salt").digest("hex") === user.passwordHash;
    }

    if (!passwordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = makeToken(user.id);
    const session = { access_token: token, refresh_token: token, token_type: "bearer" };
    const userObj = { id: user.id, email: user.email, user_metadata: {} };
    res.json({ data: { user: userObj, session }, error: null });
  } catch (err: any) {
    logger.error({ err }, "Login error");
    res.status(500).json({ error: err?.message || "Login failed" });
  }
});

router.post("/auth/logout.php", async (_req, res): Promise<void> => {
  res.json({ error: null });
});

router.get("/auth/me.php", requireAuth, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userObj = { id: user.id, email: user.email, user_metadata: {} };
    res.json({ data: { user: userObj }, error: null });
  } catch (err: any) {
    logger.error({ err }, "Me error");
    res.status(500).json({ error: err?.message || "Failed" });
  }
});

router.post("/auth/admin_create_user.php", requireAdminAuth, async (req, res): Promise<void> => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const salt = generateSalt();
    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash: `${salt}:${hashPassword(password, salt)}`,
    }).returning();

    await db.insert(profilesTable).values({
      userId: user.id,
      email: user.email,
      fullName: full_name || null,
      role: role || "agent",
      status: "active",
    });

    res.json({ data: { user: { id: user.id, email: user.email } }, error: null });
  } catch (err: any) {
    logger.error({ err }, "Admin create user error");
    res.status(500).json({ error: err?.message || "Failed" });
  }
});

export default router;
