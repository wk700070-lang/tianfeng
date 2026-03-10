import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = "xiaoai_chat_messages";
const LIMIT_KEY = "xiaoai_daily_limit";
const DAILY_FREE_COUNT = 5;

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getRemainingCount(): number {
  try {
    const stored = localStorage.getItem(LIMIT_KEY);
    if (!stored) return DAILY_FREE_COUNT;
    const data = JSON.parse(stored);
    if (data.date !== getTodayKey()) return DAILY_FREE_COUNT;
    return data.remaining;
  } catch {
    return DAILY_FREE_COUNT;
  }
}

function decrementCount(): number {
  const current = getRemainingCount();
  const newCount = Math.max(0, current - 1);
  localStorage.setItem(
    LIMIT_KEY,
    JSON.stringify({ date: getTodayKey(), remaining: newCount }),
  );
  return newCount;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const QUICK_QUESTIONS = [
  "欠钱不还怎么办",
  "离婚孩子怎么判",
  "打架会被判多久",
  "公司拖欠工资",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ai",
  content: "您好！我是小爱法律AI助手，请问您有什么法律问题需要咨询？",
  timestamp: new Date(),
};

function generateAIResponse(userMessage: string): string {
  const msg = userMessage;
  if (/欠钱|借钱|还钱|借款|债务|欠债/.test(msg)) {
    return "📋 相关法条\n《民法典》第667条：借款合同是借款人向贷款人借款，到期返还借款并支付利息的合同。\n\n🔍 问题分析\n民间借贷关系受法律保护，债权人有权依法追偿。若有书面借条或转账记录，维权更为有力。\n\n💡 操作建议\n1. 收集证据：借条原件、银行转账记录、聊天记录。\n2. 发送催款函：书面通知对方还款。\n3. 向法院起诉：5万元以下可申请小额诉讼程序。\n\n⚠️ 风险提示\n诉讼时效为3年，民间借贷利率不得超过LPR的4倍。\n\n📌 免责声明\n本回答仅供参考，不构成正式法律意见。";
  }
  if (/离婚|孩子|抚养|夫妻|婚姻|结婚|分居|出轨|外遇/.test(msg)) {
    return "📋 相关法条\n《民法典》第1084条：不满两周岁的子女，以由母亲直接抚养为原则。\n\n🔍 问题分析\n抚养权归属以「子女最佳利益原则」为核心，综合考量双方经济状况、抚养能力及子女意愿（8周岁以上）。\n\n💡 操作建议\n1. 收集证据：收入证明、住房条件、照料记录。\n2. 协议优先：协议离婚可双方协商。\n3. 诉讼离婚：协议不成可提起诉讼。\n\n⚠️ 风险提示\n抚养费通常为收入的20%-30%。\n\n📌 免责声明\n本回答仅供参考，不构成正式法律意见。";
  }
  if (/打架|伤害|刑事|判刑|坐牢|犯罪|逮捕|拘留|故意伤害/.test(msg)) {
    return "📋 相关法条\n《刑法》第234条：故意伤害他人身体的，处3年以下有期徒刑。致人重伤的，处3年以上10年以下有期徒刑。\n\n🔍 问题分析\n需根据伤情鉴定结果、主观故意、是否具有防卫情节等综合判断。\n\n💡 操作建议\n1. 立即就医并保留病历记录。\n2. 保存现场照片、视频、证人信息。\n3. 尽早委托专业刑辩律师介入。\n\n⚠️ 风险提示\n积极赔偿并取得谅解书，可作为从轻处罚情节。\n\n📌 免责声明\n本回答仅供参考，不构成正式法律意见。";
  }
  if (/工资|欠薪|劳动|辞退|裁员|解雇|加班|社保|劳动合同/.test(msg)) {
    return "📋 相关法条\n《劳动合同法》第30条：用人单位应当按时足额支付劳动报酬。\n\n🔍 问题分析\n拖欠工资是违法行为，劳动仲裁是必经前置程序，且免费、时效快。\n\n💡 操作建议\n1. 收集证据：劳动合同、工资条、银行流水、打卡记录。\n2. 向劳动监察大队举报。\n3. 申请劳动仲裁。\n\n⚠️ 风险提示\n劳动仲裁时效为1年（自劳动关系终止之日起）。\n\n📌 免责声明\n本回答仅供参考，不构成正式法律意见。";
  }
  return "📋 相关法条\n《中华人民共和国宪法》第33条：公民在法律面前一律平等，国家尊重和保障人权。\n\n🔍 问题分析\n您的问题涉及一般法律事项。遇到法律问题时，建议通过合法途径维权。\n\n💡 操作建议\n1. 明确权利义务，查阅相关法律法规。\n2. 收集合同、协议、往来记录等证据。\n3. 向法律援助中心申请免费援助，或委托律师代理。\n\n⚠️ 风险提示\n各类法律诉求均有时效限制，不及时主张可能丧失权利。\n\n📌 免责声明\n本回答仅供参考，不构成正式法律意见。";
}

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(stored) as Array<{
      id: string;
      role: string;
      content: string;
      timestamp: string;
    }>;
    if (!parsed.length) return [WELCOME_MESSAGE];
    return parsed.map((m) => ({
      ...m,
      role: m.role as "user" | "ai" | "system",
      timestamp: new Date(m.timestamp),
    }));
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chatEndRef is stable
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleAutoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "44px";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const currentRemaining = getRemainingCount();
      if (currentRemaining <= 0) {
        toast.error("今日免费次数已用完，请升级会员或明日再来", {
          duration: 4000,
        });
        return;
      }

      if (actor && identity) {
        try {
          const principal = identity.getPrincipal();
          await actor.consumeConsultation(principal);
        } catch {
          // Fall back to localStorage
        }
      }

      decrementCount();

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }
      setIsTyping(true);

      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: generateAIResponse(trimmed),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    },
    [isTyping, actor, identity],
  );

  const handleSubmit = () => {
    sendMessage(input);
  };

  const isSpeechSupported = () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: isSpeechSupported is a stable pure function
  const startRecording = useCallback(() => {
    if (!isSpeechSupported()) {
      toast.error("您的浏览器不支持语音识别，请使用Chrome或Edge浏览器");
      return;
    }
    if (isRecording || isProcessingVoice) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      const combined = finalTranscript || interimTranscript;
      if (combined) {
        setInput((prev) => prev + combined);
        if (textareaRef.current) {
          textareaRef.current.style.height = "44px";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      setIsProcessingVoice(false);
      if (event.error === "no-speech") {
        toast.info("未检测到语音，请重试");
      } else if (event.error === "not-allowed") {
        toast.error("麦克风权限被拒绝，请在浏览器设置中允许麦克风访问");
      } else if (event.error !== "aborted") {
        toast.error("语音识别失败，请重试");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessingVoice(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      toast.error("启动语音识别失败，请重试");
      setIsRecording(false);
    }
  }, [isRecording, isProcessingVoice]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsProcessingVoice(true);
      recognitionRef.current.stop();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    saveMessages([WELCOME_MESSAGE]);
    toast.success("聊天记录已清空");
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", paddingBottom: "var(--law-nav-height)" }}
    >
      {/* Header - fixed, does not scroll */}
      <header className="flex-shrink-0 bg-white border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <h1
            className="text-lg font-bold"
            style={{
              color: "oklch(var(--law-blue))",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            小爱法律AI助手
          </h1>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            data-ocid="chat.delete_button"
            onClick={clearChat}
            aria-label="清空聊天"
          >
            <Trash2 size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Quick Questions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              type="button"
              key={q}
              className="quick-card"
              onClick={() => {
                setInput(q);
                textareaRef.current?.focus();
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </header>

      {/* Chat Messages - only this area scrolls */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}
              >
                <div
                  className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" ? "bubble-user" : "bubble-ai"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bubble-ai px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span
                    className="text-xs ml-1"
                    style={{ color: "oklch(var(--law-blue))" }}
                  >
                    AI正在输入...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area - fixed at bottom, does not scroll */}
      <div className="flex-shrink-0 bg-white border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            className="chat-textarea flex-1"
            data-ocid="chat.input"
            placeholder={isRecording ? "正在聆听..." : "请输入您的法律问题..."}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleAutoResize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          {/* Voice Button */}
          <button
            type="button"
            data-ocid="chat.voice_button"
            aria-label={isRecording ? "松开停止录音" : "按住说话"}
            title={isSpeechSupported() ? "按住说话" : "浏览器不支持语音识别"}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={(e) => {
              e.preventDefault();
              startRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s ease",
              background: isRecording
                ? "oklch(0.55 0.22 25)"
                : isProcessingVoice
                  ? "oklch(var(--law-blue) / 0.5)"
                  : "oklch(var(--law-blue-pale))",
              color: isRecording ? "white" : "oklch(var(--law-blue))",
              boxShadow: isRecording
                ? "0 0 0 4px oklch(0.55 0.22 25 / 0.25)"
                : "none",
              transform: isRecording ? "scale(1.1)" : "scale(1)",
            }}
          >
            {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
          <button
            type="button"
            className="send-btn"
            data-ocid="chat.submit_button"
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            aria-label="发送"
          >
            <Send size={18} />
          </button>
        </div>
        {isRecording && (
          <p
            className="text-center text-xs mt-2 animate-pulse"
            style={{ color: "oklch(0.55 0.22 25)" }}
          >
            正在聆听，松开手指停止录音...
          </p>
        )}
        {isProcessingVoice && !isRecording && (
          <p
            className="text-center text-xs mt-2"
            style={{ color: "oklch(var(--law-blue))" }}
          >
            正在识别语音...
          </p>
        )}
      </div>
    </div>
  );
}
