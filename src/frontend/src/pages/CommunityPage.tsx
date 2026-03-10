import { useActor } from "@/hooks/useActor";
import {
  ArrowLeft,
  Heart,
  ImageIcon,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies: Reply[];
}

interface Post {
  id: string;
  author: string;
  avatarColor: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  likes: number;
  liked: boolean;
  comments: Comment[];
  timestamp: Date;
}

const COMMUNITY_KEY = "xiaoai_community_posts";
const LIKES_KEY = "xiaoai_community_likes";

const CATEGORIES = ["全部", "刑事", "婚姻", "劳动", "民事", "合同", "交通"];
const POST_CATEGORIES = ["刑事", "婚姻", "劳动", "民事", "合同", "交通"];

const AVATAR_COLORS = [
  "oklch(0.35 0.12 255)",
  "oklch(0.48 0.18 320)",
  "oklch(0.40 0.14 200)",
  "oklch(0.45 0.16 150)",
  "oklch(0.52 0.18 40)",
  "oklch(0.42 0.15 270)",
];

function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

const CATEGORY_COLORS: Record<string, string> = {
  刑事: "oklch(0.40 0.14 200)",
  婚姻: "oklch(0.48 0.18 320)",
  劳动: "oklch(0.35 0.12 255)",
  民事: "oklch(0.45 0.16 150)",
  合同: "oklch(0.52 0.18 40)",
  交通: "oklch(0.42 0.15 270)",
};

const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    author: "维权达人",
    avatarColor: "oklch(0.35 0.12 255)",
    title: "被老板拖欠三个月工资，已离职，怎么维权？",
    content:
      "我在一家小公司做了两年，结果老板以资金周转为由，连续三个月没有发工资，现在已经离职了，但工资一直没有追回来。有欠条吗？有微信聊天记录显示老板承认欠薪，请问应该怎么维权？",
    category: "劳动",
    images: [],
    likes: 32,
    liked: false,
    timestamp: new Date("2026-03-06T10:30:00"),
    comments: [
      {
        id: "c1",
        author: "劳动专家",
        content: "可以向劳动局投诉，也可以申请劳动仲裁",
        timestamp: new Date("2026-03-06T11:00:00"),
        replies: [],
      },
      {
        id: "c2",
        author: "维权助手",
        content: "保留好工资条和劳动合同，微信记录也是有效证据！",
        timestamp: new Date("2026-03-06T14:20:00"),
        replies: [],
      },
    ],
  },
  {
    id: "post_2",
    author: "家事顾问",
    avatarColor: "oklch(0.48 0.18 320)",
    title: "离婚后孩子抚养权如何判定？有没有倾向母亲的规定？",
    content:
      "我和妻子准备协议离婚，但在孩子的抚养权问题上存在分歧。孩子目前5岁，双方都想要抚养权。请问法院在判定抚养权时有什么标准？是否真的有倾向母亲的规定？",
    category: "婚姻",
    images: [],
    likes: 45,
    liked: false,
    timestamp: new Date("2026-03-05T15:20:00"),
    comments: [],
  },
  {
    id: "post_3",
    author: "法律小白",
    avatarColor: "oklch(0.45 0.16 150)",
    title: "朋友借我钱一直不还，欠条有，但对方说没钱，怎么办？",
    content:
      "两年前借给朋友5万块，有手写欠条，转账记录也有。最近多次催要，对方一直说没钱还，态度也越来越冷漠。请问这种情况我该怎么办？直接起诉有用吗？",
    category: "民事",
    images: [],
    likes: 28,
    liked: false,
    timestamp: new Date("2026-03-04T09:15:00"),
    comments: [],
  },
];

function loadPosts(): Post[] {
  try {
    const stored = localStorage.getItem(COMMUNITY_KEY);
    const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || "{}") as Record<
      string,
      boolean
    >;
    if (!stored) {
      return INITIAL_POSTS.map((p) => ({ ...p, liked: !!likes[p.id] }));
    }
    const parsed = JSON.parse(stored) as Array<
      Omit<Post, "timestamp" | "comments"> & {
        timestamp: string;
        comments: Array<
          Omit<Comment, "timestamp" | "replies"> & {
            timestamp: string;
            replies: Array<Omit<Reply, "timestamp"> & { timestamp: string }>;
          }
        >;
      }
    >;
    return parsed.map((p) => ({
      ...p,
      liked: !!likes[p.id],
      category: p.category || "民事",
      images: p.images || [],
      timestamp: new Date(p.timestamp),
      comments: (p.comments || []).map((c) => ({
        ...c,
        timestamp: new Date(c.timestamp),
        replies: (c.replies || []).map((r) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        })),
      })),
    }));
  } catch {
    return INITIAL_POSTS;
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  const likes: Record<string, boolean> = {};
  for (const p of posts) {
    if (p.liked) likes[p.id] = true;
  }
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

export function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(() => loadPosts());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("民事");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { actor } = useActor();

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllPosts()
      .then((backendPosts) => {
        if (backendPosts.length > 0) {
          const converted: Post[] = backendPosts.map((p) => ({
            id: p.id.toString(),
            author: p.author,
            avatarColor: randomAvatarColor(),
            title: p.title,
            content: p.content,
            category: "民事",
            images: [],
            likes: Number(p.likes),
            liked: false,
            timestamp: new Date(Number(p.timestamp) / 1_000_000),
            comments: p.comments.map((c, i) => ({
              id: `c_${i}`,
              author: c.author,
              content: c.content,
              timestamp: new Date(Number(c.timestamp) / 1_000_000),
              replies: [],
            })),
          }));
          const localLikes = JSON.parse(
            localStorage.getItem(LIKES_KEY) || "{}",
          ) as Record<string, boolean>;
          setPosts(converted.map((p) => ({ ...p, liked: !!localLikes[p.id] })));
        }
      })
      .catch(() => {
        // Use localStorage fallback
      });
  }, [actor]);

  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );

    try {
      if (actor && /^\d+$/.test(postId)) {
        const bigId = BigInt(postId);
        if (!post.liked) {
          await actor.likePost(bigId);
        } else {
          await actor.unlikePost(bigId);
        }
      }
    } catch {
      // Keep local state
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 9 - newImages.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setNewImages((prev) => [...prev, result].slice(0, 9));
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("请填写标题和内容");
      return;
    }

    const newPost: Post = {
      id: `local_${Date.now()}`,
      author: "法律探索者",
      avatarColor: randomAvatarColor(),
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      images: newImages,
      likes: 0,
      liked: false,
      timestamp: new Date(),
      comments: [],
    };

    try {
      if (actor) {
        const created = await actor.createPost({
          title: newTitle.trim(),
          content: newContent.trim(),
          author: "法律探索者",
        });
        newPost.id = created.id.toString();
      }
    } catch {
      // Use local id
    }

    setPosts((prev) => [newPost, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewCategory("民事");
    setNewImages([]);
    setShowPublishModal(false);
    toast.success("发布成功！");
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPostId) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: "法律探索者",
      content: commentText.trim(),
      timestamp: new Date(),
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPostId
          ? { ...p, comments: [...p.comments, newComment] }
          : p,
      ),
    );

    try {
      if (actor && /^\d+$/.test(selectedPostId)) {
        await actor.addCommentToPost(BigInt(selectedPostId), {
          content: commentText.trim(),
          author: "法律探索者",
        });
      }
    } catch {
      // Keep local
    }

    setCommentText("");
    toast.success("评论已发布");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim() || !selectedPostId) return;

    const newReply: Reply = {
      id: `reply_${Date.now()}`,
      author: "法律探索者",
      content: replyText.trim(),
      timestamp: new Date(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPostId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? { ...c, replies: [...c.replies, newReply] }
                  : c,
              ),
            }
          : p,
      ),
    );

    setReplyText("");
    setReplyingToId(null);
    toast.success("回复已发布");
  };

  const filteredPosts =
    categoryFilter === "全部"
      ? posts
      : posts.filter((p) => p.category === categoryFilter);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  // Post Detail View
  if (selectedPost) {
    return (
      <div
        className="flex flex-col"
        style={{ height: "100dvh", paddingBottom: "var(--law-nav-height)" }}
        data-ocid="community.detail.panel"
      >
        <header className="flex-shrink-0 bg-white border-b border-border px-4 pt-12 pb-4 flex items-center gap-3">
          <button
            type="button"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setSelectedPostId(null)}
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-base flex-1 truncate">帖子详情</h2>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
          {/* Post Content */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: selectedPost.avatarColor }}
              >
                {selectedPost.author[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {selectedPost.author}
                </div>
                <div className="text-xs text-gray-400">
                  {formatRelativeTime(selectedPost.timestamp)}
                </div>
              </div>
              {selectedPost.category && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{
                    background:
                      CATEGORY_COLORS[selectedPost.category] ||
                      "oklch(var(--law-blue))",
                  }}
                >
                  {selectedPost.category}
                </span>
              )}
            </div>
            <h3 className="font-bold text-base mb-2">{selectedPost.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedPost.content}
            </p>

            {/* Images */}
            {selectedPost.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {selectedPost.images.map((img) => (
                  <img
                    key={img.substring(0, 40)}
                    src={img}
                    alt="图片"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{
                  color: selectedPost.liked
                    ? "oklch(0.60 0.22 27)"
                    : "oklch(0.55 0.02 250)",
                }}
                onClick={() => handleLike(selectedPost.id)}
              >
                <Heart
                  size={16}
                  fill={selectedPost.liked ? "currentColor" : "none"}
                />
                {selectedPost.likes}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <MessageCircle size={16} />
                {selectedPost.comments.length}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-gray-600 mb-3">
              全部回答（{selectedPost.comments.length}）
            </h4>
            {selectedPost.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无回答，来抢沙发吧！
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPost.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white rounded-2xl p-3 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: randomAvatarColor() }}
                      >
                        {comment.author[0]}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-xs">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg transition-colors"
                        style={{
                          color: "oklch(var(--law-blue))",
                          background:
                            replyingToId === comment.id
                              ? "oklch(var(--law-blue-pale))"
                              : "transparent",
                        }}
                        onClick={() => {
                          if (replyingToId === comment.id) {
                            setReplyingToId(null);
                            setReplyText("");
                          } else {
                            setReplyingToId(comment.id);
                            setReplyText("");
                          }
                        }}
                      >
                        回复
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 ml-9">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-9 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: randomAvatarColor() }}
                              >
                                {reply.author[0]}
                              </div>
                              <span className="font-semibold text-xs">
                                {reply.author}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatRelativeTime(reply.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 ml-6.5">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingToId === comment.id && (
                      <div className="ml-9 mt-2 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 text-xs px-3 py-2 border border-border rounded-xl outline-none"
                          style={{ fontFamily: "inherit" }}
                          placeholder={`回复 ${comment.author}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddReply(comment.id);
                          }}
                          // biome-ignore lint/a11y/noAutofocus: intentional for reply UX
                          autoFocus
                          data-ocid="community.reply.input"
                        />
                        <button
                          type="button"
                          className="text-xs px-3 py-2 rounded-xl font-medium text-white"
                          style={{ background: "oklch(var(--law-blue))" }}
                          data-ocid="community.reply.submit_button"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          发送
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="flex-shrink-0 bg-white border-t border-border px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              className="chat-textarea flex-1 text-sm"
              data-ocid="community.comment.input"
              placeholder="写下您的回答..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={1}
            />
            <button
              type="button"
              className="send-btn"
              data-ocid="community.comment.submit_button"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              aria-label="发布评论"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <title>发送</title>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1
            className="text-lg font-bold"
            style={{
              color: "oklch(var(--law-blue))",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            法律社区
          </h1>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "oklch(var(--law-blue))" }}
            data-ocid="community.open_modal_button"
            onClick={() => setShowPublishModal(true)}
          >
            <Plus size={16} />
            发布问题
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                background:
                  categoryFilter === cat
                    ? "oklch(var(--law-blue))"
                    : "oklch(var(--law-blue-pale))",
                color:
                  categoryFilter === cat ? "white" : "oklch(var(--law-blue))",
              }}
              data-ocid="community.category.tab"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Post List */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        data-ocid="community.list"
      >
        {filteredPosts.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="community.empty_state"
          >
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">暂无相关帖子，来发布第一个问题吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post, index) => {
              const cardIndex = index + 1;
              return (
                <button
                  key={post.id}
                  type="button"
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-card border border-border card-hover cursor-pointer"
                  data-ocid={`community.item.${cardIndex}`}
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: post.avatarColor }}
                    >
                      {post.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">
                        {post.author}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatRelativeTime(post.timestamp)}
                      </span>
                    </div>
                    {post.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
                        style={{
                          background:
                            CATEGORY_COLORS[post.category] ||
                            "oklch(var(--law-blue))",
                        }}
                      >
                        {post.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>

                  {post.images.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <ImageIcon size={12} />
                      {post.images.length}张图片
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs transition-colors"
                      style={{
                        color: post.liked
                          ? "oklch(0.60 0.22 27)"
                          : "oklch(0.55 0.02 250)",
                      }}
                      data-ocid={`community.like_button.${cardIndex}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                    >
                      <Heart
                        size={14}
                        fill={post.liked ? "currentColor" : "none"}
                      />
                      {post.likes}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MessageCircle size={14} />
                      {post.comments.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ad Banner */}
      <div className="ad-banner">广告位招租 · 联系：ad@xiaoai-law.com</div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          data-ocid="community.modal"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPublishModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowPublishModal(false);
          }}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto page-enter overflow-y-auto"
            style={{
              maxHeight: "85vh",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
            }}
          >
            <div className="sticky top-0 bg-white px-6 pt-6 pb-3 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-base">发布法律问题</h3>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                data-ocid="community.cancel_button"
                onClick={() => setShowPublishModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Category Select */}
              <div>
                <label
                  htmlFor="post-category"
                  className="block text-sm font-medium mb-1.5 text-gray-700"
                >
                  问题分类 *
                </label>
                <select
                  id="post-category"
                  className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-colors"
                  style={{
                    borderColor: "oklch(var(--border))",
                    fontFamily: "inherit",
                  }}
                  data-ocid="community.category.select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "oklch(var(--law-blue))";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "oklch(var(--border))";
                  }}
                >
                  {POST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="post-title"
                  className="block text-sm font-medium mb-1.5 text-gray-700"
                >
                  问题标题 *
                </label>
                <input
                  id="post-title"
                  className="calc-input"
                  data-ocid="community.title.input"
                  placeholder="用一句话描述您的法律问题"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="post-content"
                  className="block text-sm font-medium mb-1.5 text-gray-700"
                >
                  详细描述 *
                </label>
                <textarea
                  id="post-content"
                  className="w-full px-3 py-2.5 border rounded-xl text-sm font-normal outline-none transition-colors resize-none overflow-y-auto"
                  style={{
                    borderColor: "oklch(var(--border))",
                    fontFamily: "inherit",
                    minHeight: "120px",
                    maxHeight: "200px",
                  }}
                  data-ocid="community.content.textarea"
                  placeholder="描述问题的背景和细节，便于获得更准确的解答..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  onFocus={(e) => {
                    e.target.style.borderColor = "oklch(var(--law-blue))";
                    e.target.style.boxShadow =
                      "0 0 0 3px oklch(var(--law-blue) / 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "oklch(var(--border))";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label
                  htmlFor="image-upload"
                  className="block text-sm font-medium mb-1.5 text-gray-700"
                >
                  上传图片（最多9张）
                </label>
                <input
                  ref={imageInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  data-ocid="community.upload_button"
                />
                {newImages.length < 9 && (
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors w-full justify-center"
                    style={{
                      borderColor: "oklch(var(--law-blue))",
                      color: "oklch(var(--law-blue))",
                    }}
                    onClick={() => imageInputRef.current?.click()}
                    data-ocid="community.image.upload_button"
                  >
                    <ImageIcon size={16} />
                    添加图片 ({newImages.length}/9)
                  </button>
                )}
                {newImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {newImages.map((img, i) => (
                      <div
                        key={`new-img-${i}-${img.length}`}
                        className="relative aspect-square"
                      >
                        <img
                          src={img}
                          alt={`预览${i + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                          onClick={() =>
                            setNewImages((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          aria-label="删除图片"
                        >
                          <X size={10} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "oklch(var(--law-blue))" }}
                data-ocid="community.submit_button"
                onClick={handlePublish}
              >
                发布问题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
