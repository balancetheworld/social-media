"use client"

import { use } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PostCard } from "@/components/post/post-card"
import { ProfileHeader } from "@/components/profile/profile-header"
import { useSocial } from "@/lib/social-context"
import AppShell from "@/components/layout/app-shell"

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AppShell>
      <ProfileContent userId={id} />
    </AppShell>
  )
}

function ProfileContent({ userId }: { userId: string }) {
  const { getUser, posts } = useSocial()
  const user = getUser(userId)

  if (!user) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">用户不存在</p>
        <Link href="/" className="mt-3 text-sm text-primary hover:underline">返回首页</Link>
      </div>
    )
  }

  const userPosts = posts.filter((p) => p.authorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const likedPosts = posts.filter((p) => userId && p.likes.includes(userId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const commentedPosts = posts.filter((p) => p.comments.some((c) => c.authorId === userId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <header className="flex h-12 items-center gap-4 border-b border-border/30 px-5">
        <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/30 transition-colors" aria-label="返回">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-base font-bold leading-tight text-card-foreground">{user.name}</h1>
          <span className="text-[11px] text-muted-foreground">{userPosts.length} 条帖子</span>
        </div>
      </header>

      <ProfileHeader user={user} />

      {/* Tabs */}
      <Tabs defaultValue="posts" className="mt-2">
        <TabsList className="w-full justify-around rounded-none border-b border-border/30 bg-transparent p-0 h-auto">
          <TabsTrigger value="posts" className="flex-1 rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">帖子</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1 rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">回复</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">喜欢</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-0">
          {userPosts.length > 0 ? userPosts.map((post) => <PostCard key={post.id} post={post} />) : <div className="py-12 text-center text-sm text-muted-foreground">暂无帖子</div>}
        </TabsContent>
        <TabsContent value="replies" className="mt-0">
          {commentedPosts.length > 0 ? commentedPosts.map((post) => <PostCard key={post.id} post={post} />) : <div className="py-12 text-center text-sm text-muted-foreground">暂无回复</div>}
        </TabsContent>
        <TabsContent value="likes" className="mt-0">
          {likedPosts.length > 0 ? likedPosts.map((post) => <PostCard key={post.id} post={post} />) : <div className="py-12 text-center text-sm text-muted-foreground">暂无喜欢</div>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
