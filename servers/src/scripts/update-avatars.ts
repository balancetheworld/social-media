/**
 * 更新现有用户头像为本地随机图片
 * 运行方式: npx tsx src/scripts/update-avatars.ts
 */

// @ts-expect-error -- asm.js build has no type declarations
import initSqlJs from 'sql.js/dist/sql-asm.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomInt } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'social.db')

/**
 * Fisher-Yates 洗牌算法，随机打乱数组
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 本地头像资源列表
 */
const localAvatars = [
  '/avatar/avatar1.jpg',
  '/avatar/avatar2.jpg',
  '/avatar/avatar3.jpg',
  '/avatar/avatar4.jpg',
  '/avatar/avatar5.jpg',
  '/avatar/a6.jpg',
  '/avatar/a7.jpg',
  '/avatar/a8.jpg',
  '/avatar/a9.jpg',
  '/avatar/a10.jpg',
  '/avatar/a11.jpg',
  '/avatar/a12.jpg',
]

async function main() {
  console.log('🔄 开始更新用户头像...\n')

  // 初始化 SQL.js
  const SQL = await initSqlJs()

  // 读取数据库
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ 数据库文件不存在: ${DB_PATH}`)
    process.exit(1)
  }

  const fileBuffer = fs.readFileSync(DB_PATH)
  const db = new SQL.Database(fileBuffer)

  // 获取所有用户
  const result = db.exec('SELECT id, username, display_name, avatar FROM users ORDER BY id')
  const users: any[] = []

  if (result.length > 0 && result[0].values) {
    const columns = result[0].columns
    result[0].values.forEach((row: any) => {
      const user: any = {}
      columns.forEach((col: string, i: number) => {
        user[col] = row[i]
      })
      users.push(user)
    })
  }

  console.log(`📊 找到 ${users.length} 个用户:\n`)

  // 随机打乱头像数组
  const shuffledAvatars = shuffle(localAvatars)

  // 更新每个用户的头像
  users.forEach((user: any, index: number) => {
    const oldAvatar = user.avatar
    const newAvatar = shuffledAvatars[index % shuffledAvatars.length]

    db.run('UPDATE users SET avatar = ? WHERE id = ?', [newAvatar, user.id])

    console.log(`  ✅ ${user.display_name} (@${user.username})`)
    console.log(`     旧头像: ${oldAvatar.substring(0, 50)}...`)
    console.log(`     新头像: ${newAvatar}`)
    console.log('')
  })

  // 保存数据库
  const data = db.export()
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DB_PATH, Buffer.from(data))

  db.close()

  console.log('🎉 头像更新完成！')
}

main().catch(console.error)
