// @ts-expect-error -- asm.js build has no type declarations
import initSqlJs from "sql.js/dist/sql-asm.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { seedDatabase } from "./seed.js"

type SqlJsDatabase = any

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "..", "data", "social.db")

let db: SqlJsDatabase | null = null
let initPromise: Promise<SqlJsDatabase> | null = null

function saveDb() {
  if (!db) return
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db

  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run("PRAGMA foreign_keys = ON")
  initTables(db)

  const result = db.exec("SELECT COUNT(*) as count FROM users")
  const count = result[0]?.values[0]?.[0] as number
  if (count === 0) {
    seedDatabase(db)
    saveDb()
  }

  return db
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db
  if (!initPromise) {
    initPromise = initDb()
  }
  return initPromise
}

export function persistDb() {
  saveDb()
}

export async function queryAll(sql: string, params: any[] = []): Promise<any[]> {
  const database = await getDb()
  const stmt = database.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  const rows: any[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

export async function queryOne(sql: string, params: any[] = []): Promise<any | undefined> {
  const rows = await queryAll(sql, params)
  return rows[0]
}

export async function execute(sql: string, params: any[] = []): Promise<{ lastId: number; changes: number }> {
  const database = await getDb()
  database.run(sql, params)
  const lastIdResult = database.exec("SELECT last_insert_rowid() as id")
  const lastId = (lastIdResult[0]?.values[0]?.[0] as number) || 0
  const changesResult = database.exec("SELECT changes() as c")
  const changes = (changesResult[0]?.values[0]?.[0] as number) || 0
  persistDb()
  return { lastId, changes }
}

function initTables(database: SqlJsDatabase) {
  database.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL, avatar TEXT DEFAULT '', bio TEXT DEFAULT '', location TEXT DEFAULT '',
    verified INTEGER DEFAULT 0, cover_image TEXT DEFAULT '', created_at TEXT NOT NULL
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE NOT NULL, user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER NOT NULL, content TEXT NOT NULL,
    repost_count INTEGER DEFAULT 0, created_at TEXT NOT NULL, FOREIGN KEY (author_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, author_id INTEGER NOT NULL,
    content TEXT NOT NULL, created_at TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE, FOREIGN KEY (author_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, target_type TEXT NOT NULL, target_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(target_type, target_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT, follower_id INTEGER NOT NULL, following_id INTEGER NOT NULL,
    created_at TEXT NOT NULL, UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id), FOREIGN KEY (following_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS post_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS post_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, type TEXT NOT NULL, url TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, sender_id INTEGER NOT NULL,
    content TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE, FOREIGN KEY (sender_id) REFERENCES users(id)
  )`)
  database.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, to_user_id INTEGER NOT NULL,
    from_user_id INTEGER NOT NULL, post_id INTEGER, is_read INTEGER DEFAULT 0, created_at TEXT NOT NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(id), FOREIGN KEY (from_user_id) REFERENCES users(id)
  )`)
}
