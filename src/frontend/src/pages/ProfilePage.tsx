import {
  Bookmark,
  Calculator,
  ChevronRight,
  Crown,
  Info,
  MessageCircleMore,
  MessageSquare,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LIMIT_KEY = "xiaoai_daily_limit";
const DAILY_FREE_COUNT = 5;

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getRemainingCount(): number {
  try {
    const stored = localStorage.getItem(LIMIT_KEY);
    if (!stored) return DAILY_FREE_COUNT;
    const data = JSON.parse(stored) as { date: string; remaining: number };
    if (data.date !== getTodayKey()) return DAILY_FREE_COUNT;
    return data.remaining;
  } catch {
    return DAILY_FREE_COUNT;
  }
}

function getChatCount(): number {
  try {
    const stored = localStorage.getItem("xiaoai_chat_messages");
    if (!stored) return 0;
    const parsed = JSON.parse(stored) as Array<{ role: string }>;
    return parsed.filter((m) => m.role === "user").length;
  } catch {
    return 0;
  }
}

interface ProfilePageProps {
  onOpenCalculator: () => void;
}

function ModalBackdrop({
  children,
  onClose,
  alignEnd = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  alignEnd?: boolean;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex ${alignEnd ? "items-end" : "items-center justify-center px-6"}`}
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {children}
    </div>
  );
}

export function ProfilePage({ onOpenCalculator }: ProfilePageProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const remaining = getRemainingCount();
  const chatCount = getChatCount();

  const menuItems = [
    {
      icon: <MessageSquare size={18} />,
      label: "我的咨询",
      desc: `历史记录 ${chatCount} 条`,
      action: () => setShowHistoryModal(true),
      color: "oklch(0.35 0.12 255)",
    },
    {
      icon: <Bookmark size={18} />,
      label: "我的收藏",
      desc: "暂无收藏",
      action: () => setShowCollectionsModal(true),
      color: "oklch(0.52 0.18 40)",
    },
    {
      icon: <Calculator size={18} />,
      label: "法律计算器",
      desc: "工伤 · 诉讼费 · 补偿金",
      action: onOpenCalculator,
      color: "oklch(0.45 0.16 150)",
      ocid: "profile.calculator.button",
    },
    {
      icon: <MessageCircleMore size={18} />,
      label: "意见反馈",
      desc: "告诉我们您的想法",
      action: () => setShowFeedbackModal(true),
      color: "oklch(0.48 0.18 320)",
    },
    {
      icon: <Info size={18} />,
      label: "关于我们",
      desc: "版本 v1.0.0",
      action: () => setShowAboutModal(true),
      color: "oklch(0.55 0.03 250)",
    },
  ];

  const handleFeedback = () => {
    if (!feedbackText.trim()) {
      toast.error("请填写反馈内容");
      return;
    }
    toast.success("感谢您的反馈！我们会认真改进");
    setFeedbackText("");
    setShowFeedbackModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div
        className="px-4 pt-14 pb-8"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.35 0.12 255) 0%, oklch(0.28 0.10 270) 100%)",
        }}
      >
        <div className="profile-avatar mb-4 border-4 border-white/20">法</div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white">法律探索者</h2>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="badge-member bg-white/20 text-white">
              <Shield size={10} />
              普通会员
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Member Center Card */}
        <div
          className="rounded-2xl p-4 text-white shadow-blue"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.35 0.12 255), oklch(0.45 0.16 290))",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown size={18} className="text-yellow-300" />
            <span className="font-bold text-base">会员中心</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs mb-0.5">今日剩余免费咨询</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">{remaining}</span>
                <span className="text-white/70 text-sm mb-0.5">
                  / {DAILY_FREE_COUNT} 次
                </span>
              </div>
              <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(remaining / DAILY_FREE_COUNT) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "oklch(0.85 0.14 80)",
                color: "oklch(0.25 0.06 80)",
              }}
              data-ocid="profile.upgrade_button"
              onClick={() => setShowUpgradeModal(true)}
            >
              升级尊享
            </button>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              key={index}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
              data-ocid={item.ocid || `profile.menu.item.${index + 1}`}
              onClick={item.action}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: item.color }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">
                  {item.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "oklch(var(--law-blue))" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <ModalBackdrop onClose={() => setShowUpgradeModal(false)} alignEnd>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 pb-10 page-enter"
            data-ocid="profile.upgrade.modal"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-yellow-500" />
                <h3 className="font-bold text-base">升级尊享会员</h3>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                data-ocid="profile.upgrade.close_button"
                onClick={() => setShowUpgradeModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div
                className="rounded-2xl p-4 border-2"
                style={{
                  borderColor: "oklch(var(--law-blue))",
                  background: "oklch(var(--law-blue-pale))",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-base">月度会员</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      每日20次咨询 · 专属律师推荐
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-bold text-xl"
                      style={{ color: "oklch(var(--law-blue))" }}
                    >
                      ¥29
                    </div>
                    <div className="text-xs text-gray-400">/月</div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-4 border-2 relative overflow-hidden"
                style={{
                  borderColor: "oklch(0.78 0.14 75)",
                  background: "oklch(0.97 0.03 80)",
                }}
              >
                <div
                  className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                  style={{ background: "oklch(0.78 0.14 75)" }}
                >
                  推荐
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-base">年度会员</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      无限次咨询 · 一对一律师服务
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-bold text-xl"
                      style={{ color: "oklch(0.55 0.14 75)" }}
                    >
                      ¥199
                    </div>
                    <div className="text-xs text-gray-400">/年</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "oklch(var(--law-blue))" }}
              data-ocid="profile.upgrade.confirm_button"
              onClick={() => {
                toast.success("开通成功！（演示模式）");
                setShowUpgradeModal(false);
              }}
            >
              立即开通
            </button>
          </div>
        </ModalBackdrop>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <ModalBackdrop onClose={() => setShowFeedbackModal(false)} alignEnd>
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 pb-10 page-enter">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base">意见反馈</h3>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setShowFeedbackModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-colors resize-none mb-4"
              style={{
                borderColor: "oklch(var(--border))",
                fontFamily: "inherit",
              }}
              placeholder="请告诉我们您的使用体验和改进建议..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              onFocus={(e) => {
                e.target.style.borderColor = "oklch(var(--law-blue))";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "oklch(var(--border))";
              }}
            />
            <button
              type="button"
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ background: "oklch(var(--law-blue))" }}
              onClick={handleFeedback}
            >
              提交反馈
            </button>
          </div>
        </ModalBackdrop>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <ModalBackdrop onClose={() => setShowAboutModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 page-enter text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
              style={{ background: "oklch(var(--law-blue))" }}
            >
              法
            </div>
            <h3 className="font-bold text-lg mb-1">小爱法律AI助手</h3>
            <p className="text-xs text-gray-400 mb-4">版本 v1.0.0</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              面向大众的轻量级"AI+律师"法律服务平台，提供智能咨询、律师匹配、社区问答、法律工具等一站式服务。
            </p>
            <p className="text-xs text-gray-400 mb-5">
              本平台仅提供法律信息参考，不构成正式法律建议。如遇重大法律问题，请咨询持证律师。
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "oklch(var(--law-blue-pale))",
                color: "oklch(var(--law-blue))",
              }}
              onClick={() => setShowAboutModal(false)}
            >
              关闭
            </button>
          </div>
        </ModalBackdrop>
      )}

      {/* Collections Modal */}
      {showCollectionsModal && (
        <ModalBackdrop onClose={() => setShowCollectionsModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 page-enter text-center">
            <Bookmark size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600 mb-1">暂无收藏</p>
            <p className="text-xs text-gray-400 mb-5">
              在AI咨询中收藏重要回答，方便随时查阅
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "oklch(var(--law-blue-pale))",
                color: "oklch(var(--law-blue))",
              }}
              onClick={() => setShowCollectionsModal(false)}
            >
              关闭
            </button>
          </div>
        </ModalBackdrop>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <ModalBackdrop onClose={() => setShowHistoryModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 page-enter text-center">
            <MessageSquare
              size={40}
              className="mx-auto mb-3"
              style={{ color: "oklch(var(--law-blue))" }}
            />
            <p className="font-semibold text-gray-600 mb-1">我的咨询记录</p>
            <p className="text-sm text-gray-500 mb-2">
              共进行了{" "}
              <strong style={{ color: "oklch(var(--law-blue))" }}>
                {chatCount}
              </strong>{" "}
              次咨询
            </p>
            <p className="text-xs text-gray-400 mb-5">
              请到"首页"查看完整的聊天记录
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "oklch(var(--law-blue-pale))",
                color: "oklch(var(--law-blue))",
              }}
              onClick={() => setShowHistoryModal(false)}
            >
              关闭
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
