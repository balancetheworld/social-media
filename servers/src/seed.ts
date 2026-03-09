import { createHash, randomInt } from "crypto"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

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
  "/avatar/avatar1.jpg",
  "/avatar/avatar2.jpg",
  "/avatar/avatar3.jpg",
  "/avatar/avatar4.jpg",
  "/avatar/avatar5.jpg",
  "/avatar/a6.jpg",
  "/avatar/a7.jpg",
  "/avatar/a8.jpg",
  "/avatar/a9.jpg",
  "/avatar/a10.jpg",
  "/avatar/a11.jpg",
  "/avatar/a12.jpg",
]

export function seedDatabase(db: any) {
  const defaultPassword = hashPassword("123456")
  const adminPassword = hashPassword("admin1123")

  // 随机打乱头像数组，确保每个用户获得不同的头像
  const shuffledAvatars = shuffle(localAvatars)

  const users = [
    { username: "admin1", display_name: "系统管理员", avatar: shuffledAvatars[0], bio: "平台管理员", location: "", verified: 1, created_at: "2023-01-01T00:00:00.000Z", role: "admin", isAdmin: true },
    { username: "xiaoming", display_name: "林小明", avatar: shuffledAvatars[1], bio: "前端开发工程师 | 热爱开源 | 分享技术与生活", location: "北京", verified: 1, created_at: "2023-03-15T00:00:00.000Z", role: "user" },
    { username: "siyu_chen", display_name: "陈思雨", avatar: shuffledAvatars[2], bio: "UI/UX 设计师 | 喜欢摄影和旅行 | 记录美好瞬间", location: "上海", verified: 1, created_at: "2023-05-20T00:00:00.000Z", role: "user" },
    { username: "haoran_z", display_name: "张浩然", avatar: shuffledAvatars[3], bio: "全栈开发者 | 创业中 | 技术改变世界", location: "深圳", verified: 0, created_at: "2022-11-10T00:00:00.000Z", role: "user" },
    { username: "meilin_w", display_name: "王美琳", avatar: shuffledAvatars[4], bio: "产品经理 | 读书爱好者 | 分享产品思维", location: "杭州", verified: 0, created_at: "2023-01-08T00:00:00.000Z", role: "user" },
    { username: "tianyu_liu", display_name: "刘天宇", avatar: shuffledAvatars[5], bio: "数据科学家 | AI 爱好者 | 分享机器学习知识", location: "成都", verified: 1, created_at: "2023-07-22T00:00:00.000Z", role: "user" },
    { username: "xiaoqing_z", display_name: "赵晓晴", avatar: shuffledAvatars[6], bio: "自由插画师 | 猫奴 | 用画笔记录生活", location: "广州", verified: 0, created_at: "2023-09-01T00:00:00.000Z", role: "user" },
    { username: "weijie_sun", display_name: "孙伟杰", avatar: shuffledAvatars[7], bio: "后端工程师 | Go & Rust | 性能优化狂热者", location: "南京", verified: 0, created_at: "2022-08-15T00:00:00.000Z", role: "user" },
    { username: "yawen_zhou", display_name: "周雅文", avatar: shuffledAvatars[8], bio: "技术写作者 | 开源贡献者 | 终身学习", location: "武汉", verified: 0, created_at: "2023-04-12T00:00:00.000Z", role: "user" },
    { username: "zixuan_wu", display_name: "吴子轩", avatar: shuffledAvatars[9], bio: "移动端开发 | Flutter & React Native | 跑步爱好者", location: "西安", verified: 0, created_at: "2023-06-30T00:00:00.000Z", role: "user" },
  ]

  // Insert users
  for (const u of users) {
    const password = u.isAdmin ? adminPassword : defaultPassword
    db.run(
      "INSERT INTO users (username, password_hash, display_name, avatar, bio, location, verified, created_at, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [u.username, password, u.display_name, u.avatar, u.bio, u.location, u.verified, u.created_at, u.role]
    )
  }

  // Follows
  const followPairs = [
    [2, 3], [2, 4], [2, 7], [2, 8],
    [3, 2], [3, 4], [3, 6],
    [4, 2], [4, 3], [4, 5],
    [5, 2], [5, 3], [5, 4], [5, 7],
    [6, 2], [6, 4], [6, 5],
    [7, 3], [7, 4], [7, 5], [7, 6],
    [8, 2], [8, 4],
    [9, 2], [9, 4], [9, 6],
    [10, 4], [10, 9],
  ]
  const now = Date.now()
  for (const [a, b] of followPairs) {
    db.run("INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)", [a, b, new Date().toISOString()])
  }

  // Posts
  const postsData = [
    { author: 3, content: "今天在外滩拍到了绝美的日落，上海的天际线真的太美了！分享给大家，希望你们也能感受到这份美好。", repost: 5, ago: 30 * 60 * 1000 },
    { author: 4, content: "刚刚发布了我们团队的开源项目 v2.0 版本！经过三个月的重构，性能提升了 300%，新增了插件系统。欢迎大家来 Star 和贡献代码！\n\n#开源 #技术分享", repost: 23, ago: 2 * 60 * 60 * 1000 },
    { author: 2, content: "分享一个前端性能优化的小技巧：使用 React.memo 和 useMemo 的时候要注意，不是所有组件都需要缓存。过度优化反而会带来额外的内存开销。\n\n关键是先用 DevTools 找到真正的性能瓶颈，再针对性地优化。", repost: 12, ago: 5 * 60 * 60 * 1000 },
    { author: 6, content: "用 Python 写了一个自动化数据清洗脚本，处理 100 万条数据只需要 3 秒。Pandas 的 vectorized operations 真的是神器！\n\n有兴趣的同学可以私信我要代码。\n\n#Python #数据科学 #自动化", repost: 8, ago: 8 * 60 * 60 * 1000 },
    { author: 7, content: "今天完成了一组猫咪插画，画了我家三只小猫的日常。它们最喜欢窝在键盘上，所以我每次画画都要先「请」它们走开。\n\n作为一个自由插画师，有猫陪伴的工作日真的很幸福。", repost: 3, ago: 12 * 60 * 60 * 1000 },
    { author: 5, content: "读完了《启示录》这本产品管理经典书，总结几个核心观点：\n\n1. 产品经理的核心职责是发现有价值的、可用的、可行的产品\n2. 用户研究不是问用户想要什么，而是观察他们做什么\n3. 快速原型验证比完美计划更重要\n\n强烈推荐给所有产品人！", repost: 15, ago: 18 * 60 * 60 * 1000 },
    { author: 8, content: "周末花了两天时间用 Rust 重写了一个 Go 微服务，吞吐量提升了 40%，内存占用降低了 60%。Rust 的零成本抽象真的名不虚传。\n\n不过编译时间确实长了不少，trade-off 吧。", repost: 7, ago: 24 * 60 * 60 * 1000 },
    { author: 9, content: "写了一篇关于 TypeScript 5.0 新特性的深度解析文章，涵盖了 const type parameters、decorators 等重要更新。\n\n花了一整周的时间整理，希望对大家有帮助！文章链接在评论区。\n\n#TypeScript #前端", repost: 19, ago: 36 * 60 * 60 * 1000 },
    { author: 10, content: "今天跑了人生第一个半程马拉松！2小时05分完赛，虽然最后5公里真的很痛苦，但是冲过终点线的那一刻觉得一切都值了。\n\n明年的目标：全马！", repost: 2, ago: 48 * 60 * 60 * 1000 },
    { author: 3, content: "分享一个设计原则：好的设计不是添加更多元素，而是减少到不能再减少。Less is more 不只是一句口号，而是一种设计哲学。\n\n每次觉得界面不够好看的时候，试试删除一些元素，你会惊讶于效果。", repost: 9, ago: 56 * 60 * 60 * 1000 },
    { author: 2, content: "Next.js 16 正式发布了！最让我兴奋的是 Turbopack 终于稳定了，编译速度飞起。另外 React Compiler 的支持也很赞，再也不用手动 memo 了。\n\n大家升级了吗？体验如何？", repost: 31, ago: 72 * 60 * 60 * 1000 },
  ]
  for (const p of postsData) {
    db.run("INSERT INTO posts (author_id, content, repost_count, created_at) VALUES (?, ?, ?, ?)",
      [p.author, p.content, p.repost, new Date(now - p.ago).toISOString()])
  }

  // Tags
  const postTags: [number, string[]][] = [
    [1, ["摄影", "上海"]],
    [2, ["开源", "技术分享"]],
    [3, ["前端", "React", "性能优化"]],
    [4, ["Python", "数据科学", "自动化"]],
    [5, ["插画", "猫"]],
    [6, ["产品", "读书笔记"]],
    [7, ["Rust", "Go", "性能优化"]],
    [8, ["TypeScript", "前端"]],
    [9, ["跑步", "马拉松"]],
    [10, ["设计", "设计哲学"]],
    [11, ["Next.js", "前端", "React"]],
  ]
  for (const [postId, tags] of postTags) {
    for (const tag of tags) {
      db.run("INSERT INTO post_tags (post_id, tag) VALUES (?, ?)", [postId, tag])
    }
  }

  // Comments
  const commentsData = [
    { post: 1, author: 2, content: "太美了！下次带上我一起去拍！", ago: 20 * 60 * 1000 },
    { post: 1, author: 5, content: "上海的日落永远不会让人失望", ago: 15 * 60 * 1000 },
    { post: 2, author: 8, content: "性能提升 300%？这也太厉害了，回去研究一下源码！", ago: 60 * 60 * 1000 },
    { post: 2, author: 2, content: "恭喜发布！插件系统看起来很有潜力，我准备写一个插件试试。", ago: 50 * 60 * 1000 },
    { post: 2, author: 9, content: "已经 Star 了！文档写得很清晰，给你们点赞。", ago: 45 * 60 * 1000 },
    { post: 3, author: 6, content: "说得太对了！很多人一上来就 memo 所有东西，反而适得其反。", ago: 4 * 60 * 60 * 1000 },
    { post: 3, author: 8, content: "推荐大家试试 React Compiler，自动处理这些优化问题。", ago: 3 * 60 * 60 * 1000 },
    { post: 4, author: 4, content: "Polars 了解一下，比 Pandas 还要快不少！", ago: 7 * 60 * 60 * 1000 },
    { post: 5, author: 3, content: "好可爱！能分享一下插画吗？", ago: 11 * 60 * 60 * 1000 },
    { post: 5, author: 5, content: "我家猫也是这样！每次开电脑就跑来占键盘。", ago: 10 * 60 * 60 * 1000 },
    { post: 6, author: 2, content: "第二点太重要了！很多时候用户说想要的和真正需要的完全不同。", ago: 17 * 60 * 60 * 1000 },
    { post: 7, author: 4, content: "40% 的吞吐量提升确实值得！不过 Go 的开发效率还是有优势的。", ago: 23 * 60 * 60 * 1000 },
    { post: 7, author: 10, content: "Rust 的学习曲线虽然陡，但是写出来的代码确实更健壮。", ago: 22 * 60 * 60 * 1000 },
    { post: 8, author: 2, content: "写得非常详细！const type parameters 那部分讲得特别清楚。", ago: 35 * 60 * 60 * 1000 },
    { post: 9, author: 4, content: "恭喜！第一次半马就跑进 2:10，很厉害了！", ago: 47 * 60 * 60 * 1000 },
    { post: 9, author: 9, content: "太棒了！全马加油，到时候一起报名！", ago: 46 * 60 * 60 * 1000 },
    { post: 10, author: 7, content: "深有同感！简洁的设计往往最经典。", ago: 55 * 60 * 60 * 1000 },
    { post: 11, author: 4, content: "已经在生产环境用上了，Turbopack 确实快了很多！", ago: 71 * 60 * 60 * 1000 },
    { post: 11, author: 8, content: "React Compiler 是最大的亮点，代码写起来更自然了。", ago: 70 * 60 * 60 * 1000 },
  ]
  for (const c of commentsData) {
    db.run("INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)",
      [c.post, c.author, c.content, new Date(now - c.ago).toISOString()])
  }

  // Likes on posts
  const postLikes: [number, number[]][] = [
    [1, [2, 4, 5, 7]], [2, [2, 6, 8, 9, 10]], [3, [3, 4, 6, 8, 9]],
    [4, [2, 4, 9]], [5, [3, 5, 2]], [6, [2, 3, 7]],
    [7, [2, 4, 6, 10]], [8, [2, 4, 8]], [9, [4, 9]],
    [10, [2, 5, 7]], [11, [4, 6, 8, 9, 10]],
  ]
  for (const [postId, userIds] of postLikes) {
    for (const userId of userIds) {
      db.run("INSERT INTO likes (target_type, target_id, user_id, created_at) VALUES (?, ?, ?, ?)",
        ["post", postId, userId, new Date().toISOString()])
    }
  }

  // Likes on comments
  const commentLikes: [number, number[]][] = [
    [1, [3]], [2, [3, 2]], [3, [4, 6]], [4, [4]], [6, [2, 4]], [7, [2]],
    [8, [6]], [9, [7]], [10, [7, 3]], [11, [5]], [12, [8]], [14, [9]],
    [15, [10]], [16, [10]], [17, [3]], [18, [2, 8]], [19, [2]],
  ]
  for (const [commentId, userIds] of commentLikes) {
    for (const userId of userIds) {
      db.run("INSERT INTO likes (target_type, target_id, user_id, created_at) VALUES (?, ?, ?, ?)",
        ["comment", commentId, userId, new Date().toISOString()])
    }
  }

  // Conversations
  db.run("INSERT INTO conversations (created_at) VALUES (?)", [new Date(now - 15 * 60 * 1000).toISOString()])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [1, 2])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [1, 3])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [1, 3, "嗨！看到你分享的前端优化文章了，写得真好！", 1, new Date(now - 3 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [1, 2, "谢谢！你的设计作品也很棒，特别是那组日落照片。", 1, new Date(now - 2 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [1, 3, "我们可以合作一个项目吗？我最近在做一个设计系统，需要前端实现。", 1, new Date(now - 30 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [1, 2, "当然可以！听起来很有趣，你方便详细说说吗？", 1, new Date(now - 15 * 60 * 1000).toISOString()])

  db.run("INSERT INTO conversations (created_at) VALUES (?)", [new Date(now - 3 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [2, 2])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [2, 4])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [2, 4, "你有时间帮忙 review 一下我的 PR 吗？", 1, new Date(now - 5 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [2, 2, "没问题，发链接给我吧。", 1, new Date(now - 4 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [2, 4, "好的，刚发到你邮箱了。主要是重构了状态管理的部分，改用了 Zustand。", 0, new Date(now - 3 * 60 * 60 * 1000).toISOString()])

  db.run("INSERT INTO conversations (created_at) VALUES (?)", [new Date(now - 23 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [3, 2])
  db.run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [3, 8])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [3, 8, "你觉得 Bun 和 Deno 哪个更有前途？", 1, new Date(now - 24 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)",
    [3, 2, "我个人更看好 Bun，它的兼容性做得更好。不过 Deno 在安全模型上有独到之处。", 1, new Date(now - 23 * 60 * 60 * 1000).toISOString()])

  // Notifications (for user 2, which is xiaoming)
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["like", 2, 3, 3, 0, new Date(now - 10 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["comment", 2, 6, 3, 0, new Date(now - 4 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["follow", 2, 10, null, 0, new Date(now - 6 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["repost", 2, 4, 11, 1, new Date(now - 12 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["like", 2, 9, 11, 1, new Date(now - 15 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["comment", 2, 8, 11, 1, new Date(now - 20 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["follow", 2, 5, null, 1, new Date(now - 48 * 60 * 60 * 1000).toISOString()])
  db.run("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ["like", 2, 7, 3, 1, new Date(now - 50 * 60 * 60 * 1000).toISOString()])
}
