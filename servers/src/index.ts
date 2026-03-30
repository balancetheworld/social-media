import Koa from "koa"
import bodyParser from "koa-bodyparser"
import cors from "@koa/cors"
import serve from "koa-static"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

import { authMiddleware } from "./middleware/auth.js"
import authRoutes from "./routes/auth.js"
import postRoutes from "./routes/posts.js"
import userRoutes from "./routes/users.js"
import uploadRoutes from "./routes/upload.js"
import conversationRoutes from "./routes/conversations.js"
import notificationRoutes from "./routes/notifications.js"
import commentRoutes from "./routes/comments.js"
import adminPostsRoutes from "./routes/admin-posts.js"
import adminUsersRoutes from "./routes/admin-users.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, "..", "uploads")

// Ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = new Koa()
const PORT = Number(process.env.PORT) || 4000

app.keys = process.env.APP_KEYS?.split(',') || ['default-session-key-change-in-production']

// CORS -- allow the Next.js frontend
app.use(cors({
  origin: process.env.WEB_ORIGIN || "http://localhost:3000",
  credentials: true,
}))

// Body parser
app.use(bodyParser({ jsonLimit: "5mb" }))

// Serve uploaded files at /uploads/*
app.use(serve(uploadsDir, { prefix: "/uploads" } as any))

// Fix: serve static needs a mount approach. Use manual middleware:
app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/uploads/")) {
    const filePath = path.join(uploadsDir, ctx.path.replace("/uploads/", ""))
    if (fs.existsSync(filePath)) {
      ctx.body = fs.createReadStream(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
        ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
      }
      ctx.type = mimeMap[ext] || "application/octet-stream"
      return
    }
  }
  await next()
})

// Auth middleware (populates ctx.state.user if session cookie exists)
app.use(authMiddleware)

// Routes
app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(postRoutes.routes()).use(postRoutes.allowedMethods())
app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
app.use(uploadRoutes.routes()).use(uploadRoutes.allowedMethods())
app.use(conversationRoutes.routes()).use(conversationRoutes.allowedMethods())
app.use(notificationRoutes.routes()).use(notificationRoutes.allowedMethods())
app.use(commentRoutes.routes()).use(commentRoutes.allowedMethods())
app.use(adminPostsRoutes.routes()).use(adminPostsRoutes.allowedMethods())
app.use(adminUsersRoutes.routes()).use(adminUsersRoutes.allowedMethods())

app.listen(PORT, () => {
  console.log(`[servers] Koa API running on http://localhost:${PORT}`)
})
