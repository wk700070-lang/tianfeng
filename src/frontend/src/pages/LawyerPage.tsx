import { ArrowLeft, MessageCircle, Phone, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Lawyer {
  id: number;
  name: string;
  city: string;
  field: string;
  firm: string;
  phone: string;
  wechat: string;
  avatarColor: string;
  licenseNo: string;
  experience: number;
  successCases: SuccessCase[];
  reviews: Review[];
  intro: string;
}

interface SuccessCase {
  title: string;
  result: string;
  year: number;
}

interface Review {
  author: string;
  rating: number;
  content: string;
  date: string;
}

const LAWYERS: Lawyer[] = [
  {
    id: 1,
    name: "张明华",
    city: "重庆",
    field: "劳动争议",
    firm: "重庆正义律师事务所",
    phone: "023-88881234",
    wechat: "lawyer_zhangmh",
    avatarColor: "oklch(0.35 0.15 255)",
    licenseNo: "11500120210012345",
    experience: 12,
    intro:
      "专注劳动争议领域12年，处理过大量劳动仲裁、工伤赔偿及劳动合同纠纷案件，在维护劳动者合法权益方面积累了丰富经验。",
    successCases: [
      {
        title: "某制造企业拖欠工资集体仲裁",
        result: "为50名工人追回欠薪共计180万元",
        year: 2024,
      },
      {
        title: "工伤赔偿纠纷案",
        result: "成功争取赔偿金额从8万提升至35万",
        year: 2023,
      },
      {
        title: "违法解除劳动合同案",
        result: "获赔双倍经济补偿金12万元",
        year: 2023,
      },
    ],
    reviews: [
      {
        author: "王**",
        rating: 5,
        content: "专业负责，帮我追回了三个月工资，非常感谢！",
        date: "2024-11",
      },
      {
        author: "李**",
        rating: 5,
        content: "律师很有耐心，案件进展顺利，推荐！",
        date: "2024-09",
      },
      {
        author: "赵**",
        rating: 4,
        content: "处理速度快，结果满意。",
        date: "2024-07",
      },
    ],
  },
  {
    id: 2,
    name: "李晓雯",
    city: "上海",
    field: "婚姻家事",
    firm: "上海融和律师事务所",
    phone: "021-66667890",
    wechat: "lawyer_lixw",
    avatarColor: "oklch(0.48 0.18 320)",
    licenseNo: "13100120180056789",
    experience: 9,
    intro:
      "深耕婚姻家事领域9年，擅长处理离婚财产分割、子女抚养权争夺及遗产继承等复杂家事纠纷，以专业和温情化解家庭矛盾。",
    successCases: [
      {
        title: "高净值人群离婚财产分割案",
        result: "成功为当事人争取到房产及股权价值超2000万",
        year: 2024,
      },
      {
        title: "跨国婚姻子女抚养权案",
        result: "为国内母亲争取到孩子主要抚养权",
        year: 2023,
      },
      {
        title: "遗产继承纠纷案",
        result: "成功维护合法继承人权益，获得遗产份额130万",
        year: 2022,
      },
    ],
    reviews: [
      {
        author: "陈**",
        rating: 5,
        content: "离婚案处理得非常专业，财产分割很公平，谢谢李律师！",
        date: "2024-10",
      },
      {
        author: "刘**",
        rating: 5,
        content: "温柔又专业，在最难的时候给了我很大支持。",
        date: "2024-08",
      },
      {
        author: "张**",
        rating: 5,
        content: "抚养权案件结果超出预期，强烈推荐！",
        date: "2024-06",
      },
    ],
  },
  {
    id: 3,
    name: "王建国",
    city: "北京",
    field: "刑事辩护",
    firm: "北京天权律师事务所",
    phone: "010-55554321",
    wechat: "lawyer_wangjg",
    avatarColor: "oklch(0.40 0.14 200)",
    licenseNo: "11010120150034567",
    experience: 15,
    intro:
      "从事刑事辩护15年，曾参与多起重大疑难案件，对侦查、审查起诉、审判各阶段辩护均有深入研究，维权成功率高。",
    successCases: [
      {
        title: "故意伤害案无罪辩护",
        result: "成功证明正当防卫，当事人无罪释放",
        year: 2024,
      },
      {
        title: "经济诈骗案辩护",
        result: "指控金额从500万降至80万，量刑大幅减轻",
        year: 2023,
      },
      {
        title: "毒品犯罪案件辩护",
        result: "成功争取缓刑，避免当事人入狱",
        year: 2022,
      },
    ],
    reviews: [
      {
        author: "孙**",
        rating: 5,
        content: "王律师非常专业，无罪辩护成功，救了我！",
        date: "2025-01",
      },
      {
        author: "周**",
        rating: 5,
        content: "经验丰富，思路清晰，关键时刻挺身而出。",
        date: "2024-11",
      },
      {
        author: "吴**",
        rating: 4,
        content: "结果不错，沟通顺畅，费用合理。",
        date: "2024-09",
      },
    ],
  },
  {
    id: 4,
    name: "陈思远",
    city: "深圳",
    field: "合同纠纷",
    firm: "深圳创新律师事务所",
    phone: "0755-33332468",
    wechat: "lawyer_chensy",
    avatarColor: "oklch(0.45 0.16 150)",
    licenseNo: "14403120190078901",
    experience: 8,
    intro:
      "专注商事合同及知识产权领域，服务过大量初创企业及上市公司，熟悉各类商业合同的谈判、起草和纠纷处理。",
    successCases: [
      {
        title: "建设工程合同纠纷案",
        result: "为施工方追回工程款860万",
        year: 2024,
      },
      {
        title: "买卖合同违约案",
        result: "成功索赔违约金及损失合计220万",
        year: 2023,
      },
      {
        title: "股权转让合同纠纷",
        result: "保护创始人权益，阻止恶意稀释股权",
        year: 2023,
      },
    ],
    reviews: [
      {
        author: "林**",
        rating: 5,
        content: "合同纠纷处理迅速，追回欠款，非常靠谱！",
        date: "2024-12",
      },
      {
        author: "黄**",
        rating: 4,
        content: "专业细致，条款分析很到位。",
        date: "2024-10",
      },
      {
        author: "郑**",
        rating: 5,
        content: "帮公司规避了很大风险，感谢陈律师。",
        date: "2024-08",
      },
    ],
  },
  {
    id: 5,
    name: "刘雅婷",
    city: "广州",
    field: "知识产权",
    firm: "广州智慧律师事务所",
    phone: "020-44441357",
    wechat: "lawyer_liuyt",
    avatarColor: "oklch(0.52 0.18 40)",
    licenseNo: "14401120200089012",
    experience: 7,
    intro:
      "专注知识产权保护，包括商标、专利、版权及商业秘密，为众多互联网公司和品牌提供全方位知识产权法律服务。",
    successCases: [
      {
        title: "商标侵权案",
        result: "成功维权，获赔300万及停止侵权判决",
        year: 2024,
      },
      {
        title: "软件著作权侵权案",
        result: "为科技公司追回损失150万",
        year: 2023,
      },
      {
        title: "专利无效宣告案",
        result: "成功宣告竞争对手专利无效，扫清市场障碍",
        year: 2022,
      },
    ],
    reviews: [
      {
        author: "何**",
        rating: 5,
        content: "知识产权专家，帮公司打赢了商标侵权案！",
        date: "2024-11",
      },
      {
        author: "钱**",
        rating: 5,
        content: "反应迅速，专业度高，值得信赖。",
        date: "2024-09",
      },
      {
        author: "许**",
        rating: 4,
        content: "处理结果满意，感谢刘律师。",
        date: "2024-07",
      },
    ],
  },
  {
    id: 6,
    name: "赵志强",
    city: "重庆",
    field: "婚姻家事",
    firm: "重庆和谐律师事务所",
    phone: "023-77779753",
    wechat: "lawyer_zhaozq",
    avatarColor: "oklch(0.42 0.15 270)",
    licenseNo: "11500120170045678",
    experience: 11,
    intro:
      "从事婚姻家事法律服务11年，擅长调解与诉讼并重，帮助众多家庭化解矛盾，守护合法权益。",
    successCases: [
      { title: "离婚房产纠纷案", result: "保住婚前购买房产所有权", year: 2024 },
      {
        title: "婚外情损害赔偿案",
        result: "成功争取精神损害赔偿20万",
        year: 2023,
      },
      {
        title: "老人赡养纠纷案",
        result: "调解成功，赡养方案获各方认可",
        year: 2023,
      },
    ],
    reviews: [
      {
        author: "蒋**",
        rating: 5,
        content: "家事纠纷处理圆满，赵律师非常专业！",
        date: "2025-01",
      },
      {
        author: "沈**",
        rating: 4,
        content: "耐心解答，帮我度过了难关。",
        date: "2024-10",
      },
      {
        author: "韩**",
        rating: 5,
        content: "结果令人满意，推荐！",
        date: "2024-08",
      },
    ],
  },
  {
    id: 7,
    name: "孙美玲",
    city: "上海",
    field: "劳动争议",
    firm: "上海劳权律师事务所",
    phone: "021-22223691",
    wechat: "lawyer_sunml",
    avatarColor: "oklch(0.50 0.17 290)",
    licenseNo: "13100120160067890",
    experience: 10,
    intro:
      "专注劳动权益保护10年，服务过数百名劳动者，对劳动仲裁、工伤认定、竞业限制等领域有丰富实战经验。",
    successCases: [
      {
        title: "竞业限制协议无效案",
        result: "成功认定竞业限制无效，当事人自由择业",
        year: 2024,
      },
      {
        title: "职场性骚扰维权案",
        result: "为当事人争取赔偿及公开道歉",
        year: 2023,
      },
      {
        title: "公司违法辞退案",
        result: "获赔违法解除赔偿金及欠薪共计45万",
        year: 2023,
      },
    ],
    reviews: [
      {
        author: "方**",
        rating: 5,
        content: "非常负责的律师，劳动仲裁全程跟进，感谢！",
        date: "2024-12",
      },
      {
        author: "曹**",
        rating: 5,
        content: "专业靠谱，帮我打赢了官司！",
        date: "2024-10",
      },
      {
        author: "冯**",
        rating: 4,
        content: "沟通顺畅，结果满意。",
        date: "2024-09",
      },
    ],
  },
];

const CITIES = ["全部", "重庆", "上海", "广州", "深圳", "北京"];
const FIELDS = [
  "全部",
  "劳动争议",
  "婚姻家事",
  "刑事辩护",
  "合同纠纷",
  "知识产权",
];

const FIELD_COLORS: Record<string, string> = {
  劳动争议: "oklch(0.35 0.12 255)",
  婚姻家事: "oklch(0.48 0.18 320)",
  刑事辩护: "oklch(0.40 0.14 200)",
  合同纠纷: "oklch(0.45 0.16 150)",
  知识产权: "oklch(0.52 0.18 40)",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= rating ? "oklch(0.78 0.18 85)" : "none"}
          stroke={s <= rating ? "oklch(0.78 0.18 85)" : "oklch(0.7 0 0)"}
        />
      ))}
    </div>
  );
}

export function LawyerPage() {
  const [cityFilter, setCityFilter] = useState("全部");
  const [fieldFilter, setFieldFilter] = useState("全部");
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | null>(null);

  const filtered = LAWYERS.filter(
    (l) =>
      (cityFilter === "全部" || l.city === cityFilter) &&
      (fieldFilter === "全部" || l.field === fieldFilter),
  );

  const handleWechat = (lawyer: Lawyer, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(lawyer.wechat);
    } catch {
      // Ignore clipboard errors
    }
    toast.success(`律师微信号：${lawyer.wechat} 已复制到剪贴板`, {
      duration: 3000,
    });
  };

  const selectedLawyer = LAWYERS.find((l) => l.id === selectedLawyerId);

  // Lawyer Detail Page
  if (selectedLawyer) {
    return (
      <div
        className="flex flex-col min-h-screen"
        style={{ paddingBottom: "var(--law-nav-height)" }}
        data-ocid="lawyer.detail.panel"
      >
        <header className="sticky top-0 z-10 bg-white border-b border-border px-4 pt-12 pb-4 flex items-center gap-3">
          <button
            type="button"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            data-ocid="lawyer.detail.back_button"
            onClick={() => setSelectedLawyerId(null)}
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-base flex-1 truncate">律师详情</h2>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-border">
            <div className="flex items-start gap-4">
              <div
                className="lawyer-avatar text-xl"
                style={{
                  background: selectedLawyer.avatarColor,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {selectedLawyer.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold">{selectedLawyer.name}</h3>
                  <span className="text-sm text-gray-500">
                    {selectedLawyer.city}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedLawyer.firm}
                </p>
                <div className="mt-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                    style={{
                      background:
                        FIELD_COLORS[selectedLawyer.field] ||
                        "oklch(var(--law-blue))",
                    }}
                  >
                    擅长{selectedLawyer.field}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs">执业证号</span>
                <p className="font-mono text-xs mt-0.5 text-gray-700">
                  {selectedLawyer.licenseNo}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">执业年限</span>
                <p
                  className="font-semibold mt-0.5"
                  style={{ color: "oklch(var(--law-blue))" }}
                >
                  {selectedLawyer.experience}年
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {selectedLawyer.intro}
            </p>

            {/* Contact Actions */}
            <div className="flex items-center gap-2 mt-4">
              <a
                href={`tel:${selectedLawyer.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors font-medium text-gray-600"
                data-ocid="lawyer.detail.call_button"
              >
                <Phone size={15} />
                拨打电话
              </a>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "oklch(var(--law-blue))" }}
                data-ocid="lawyer.detail.wechat_button"
                onClick={(e) => handleWechat(selectedLawyer, e)}
              >
                <MessageCircle size={15} />
                微信咨询
              </button>
            </div>
          </div>

          {/* Success Cases */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
            <h4
              className="font-bold text-sm mb-3"
              style={{ color: "oklch(var(--law-blue))" }}
            >
              成功案例
            </h4>
            <div className="space-y-3">
              {selectedLawyer.successCases.map((c) => (
                <div
                  key={c.title}
                  className="border-l-2 pl-3 py-1"
                  style={{ borderColor: "oklch(var(--law-blue))" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.title}</span>
                    <span className="text-xs text-gray-400">{c.year}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{c.result}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
            <h4
              className="font-bold text-sm mb-3"
              style={{ color: "oklch(var(--law-blue))" }}
            >
              服务评价（{selectedLawyer.reviews.length}条）
            </h4>
            <div className="space-y-3">
              {selectedLawyer.reviews.map((r) => (
                <div
                  key={r.author + r.date}
                  className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{r.author}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-border px-4 pt-12 pb-4">
        <h1
          className="text-lg font-bold mb-3"
          style={{
            color: "oklch(var(--law-blue))",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          专业律师
        </h1>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white outline-none focus:border-primary transition-colors"
              data-ocid="lawyer.city.select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ fontFamily: "inherit" }}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white outline-none focus:border-primary transition-colors"
              data-ocid="lawyer.field.select"
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              style={{ fontFamily: "inherit" }}
            >
              {FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          共找到 {filtered.length} 位律师
        </p>
      </header>

      {/* Lawyer List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="lawyer.empty_state"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">暂无符合条件的律师</p>
          </div>
        ) : (
          filtered.map((lawyer, index) => {
            const cardIndex = index + 1;
            return (
              <button
                key={lawyer.id}
                type="button"
                className="w-full text-left bg-white rounded-2xl p-4 shadow-card card-hover border border-border cursor-pointer"
                data-ocid={`lawyer.item.${cardIndex}`}
                onClick={() => setSelectedLawyerId(lawyer.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="lawyer-avatar text-base"
                    style={{ background: lawyer.avatarColor }}
                  >
                    {lawyer.name[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground">
                        {lawyer.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {lawyer.city}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {lawyer.firm}
                    </p>

                    {/* Field Tag - 擅长+领域 format */}
                    <div className="mt-2">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                        style={{
                          background:
                            FIELD_COLORS[lawyer.field] ||
                            "oklch(var(--law-blue))",
                        }}
                      >
                        擅长{lawyer.field}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={`tel:${lawyer.phone}`}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-border hover:bg-gray-50 transition-colors font-medium text-gray-600"
                        data-ocid={`lawyer.call_button.${cardIndex}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={14} />
                        {lawyer.phone}
                      </a>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "oklch(var(--law-blue))" }}
                        data-ocid={`lawyer.wechat_button.${cardIndex}`}
                        onClick={(e) => handleWechat(lawyer, e)}
                      >
                        <MessageCircle size={14} />
                        微信咨询
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Ad Banner */}
      <div className="ad-banner">广告位招租 · 联系：18888888888</div>
    </div>
  );
}
