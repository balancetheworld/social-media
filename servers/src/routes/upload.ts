import Router from "koa-router"
import multer from "@koa/multer"
import path from "path"
import { fileURLToPath } from "url"
import { requireAuth } from "../middleware/auth.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, "..", "..", "uploads")

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg"
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true)
    } else {
      cb(new Error("仅支持图片和视频文件"))
    }
  },
})

const router = new Router({ prefix: "/api" })

// POST /api/upload
router.post("/upload", requireAuth, upload.single("file"), async (ctx) => {
  const file = ctx.file
  if (!file) { ctx.status = 400; ctx.body = { error: "未选择文件" }; return }

  const isImage = file.mimetype.startsWith("image/")
  if (isImage && file.size > 10 * 1024 * 1024) {
    ctx.status = 400; ctx.body = { error: "图片不能超过10MB" }; return
  }

  const url = `/uploads/${file.filename}`
  const type = isImage ? "image" : "video"
  ctx.body = { url, type }
})

export default router
