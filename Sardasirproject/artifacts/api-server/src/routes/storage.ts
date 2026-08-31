import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";
import { ObjectStorageService } from "../lib/objectStorage";
import { requireAuth } from "./auth";
// @ts-ignore
import multer from "multer";

const router: IRouter = Router();
const storage = new ObjectStorageService();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/storage.php", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  const action = req.query["action"] as string;

  if (action === "upload") {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const uploadUrl = await storage.getObjectEntityUploadURL();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": req.file.mimetype },
        body: req.file.buffer,
      });

      if (!putRes.ok) {
        throw new Error(`GCS upload failed: ${putRes.status} ${putRes.statusText}`);
      }

      const rawPath = new URL(uploadUrl).pathname;
      const objectPath = storage.normalizeObjectEntityPath(uploadUrl);

      res.json({ data: { path: objectPath }, error: null });
      return;
    } catch (err: any) {
      logger.error({ err }, "Storage upload error");
      res.status(500).json({ error: err?.message || "Upload failed" });
      return;
    }
  }

  if (action === "remove") {
    const { paths: filePaths } = req.body;
    if (Array.isArray(filePaths)) {
      for (const p of filePaths) {
        try {
          const file = await storage.getObjectEntityFile(p).catch(() => null);
          if (file) await file.delete().catch(() => {});
        } catch (err) {
          logger.warn({ err, path: p }, "Failed to remove file from storage");
        }
      }
    }
    res.json({ data: { message: "Removed" }, error: null });
    return;
  }

  res.status(400).json({ error: "Unknown storage action" });
});

router.get("/storage/objects/{*splat}", requireAuth, async (req, res): Promise<void> => {
  const splat = Array.isArray(req.params.splat) ? req.params.splat[0] : req.params.splat;
  const objectPath = `/objects/${splat}`;
  try {
    const file = await storage.getObjectEntityFile(objectPath);
    const response = await storage.downloadObject(file);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    logger.error({ err, objectPath }, "Storage serve error");
    res.status(404).json({ error: "File not found" });
  }
});

router.get("/storage/public-objects/{*splat}", async (req, res): Promise<void> => {
  const splat = Array.isArray(req.params.splat) ? req.params.splat[0] : req.params.splat;
  try {
    const file = await storage.searchPublicObject(splat);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const response = await storage.downloadObject(file);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    logger.error({ err }, "Public storage serve error");
    res.status(404).json({ error: "File not found" });
  }
});

router.post("/rpc.php", async (req, res): Promise<void> => {
  const fn = req.query["fn"] as string;
  logger.warn({ fn }, "RPC called - not implemented");
  res.json({ data: null, error: null });
});

export default router;
