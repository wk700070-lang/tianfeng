import { Toaster } from "@/components/ui/sonner";
import { BookOpen, MessageSquare, User, Users } from "lucide-react";
import { useState } from "react";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ChatPage } from "./pages/ChatPage";
import { CommunityPage } from "./pages/CommunityPage";
import { LawyerPage } from "./pages/LawyerPage";
import { ProfilePage } from "./pages/ProfilePage";

export type TabId = "home" | "lawyer" | "community" | "profile";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showCalculator, setShowCalculator] = useState(false);

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "首页", icon: <MessageSquare size={22} /> },
    { id: "lawyer", label: "律师", icon: <Users size={22} /> },
    { id: "community", label: "社区", icon: <BookOpen size={22} /> },
    { id: "profile", label: "我的", icon: <User size={22} /> },
  ];

  const handleTabChange = (tab: TabId) => {
    setShowCalculator(false);
    setActiveTab(tab);
  };

  return (
    <div className="app-shell">
      <Toaster position="top-center" richColors />

      {/* Main Content Area */}
      <div style={{ paddingBottom: "var(--law-nav-height)" }}>
        {showCalculator ? (
          <CalculatorPage onBack={() => setShowCalculator(false)} />
        ) : (
          <>
            {activeTab === "home" && <ChatPage />}
            {activeTab === "lawyer" && <LawyerPage />}
            {activeTab === "community" && <CommunityPage />}
            {activeTab === "profile" && (
              <ProfilePage onOpenCalculator={() => setShowCalculator(true)} />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" aria-label="主导航">
        <div className="flex h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-item"
              data-ocid={`nav.${item.id}.tab`}
              onClick={() => handleTabChange(item.id)}
              style={{
                color:
                  activeTab === item.id && !showCalculator
                    ? "oklch(var(--law-blue))"
                    : "oklch(0.55 0.03 250)",
              }}
              aria-current={
                activeTab === item.id && !showCalculator ? "page" : undefined
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
