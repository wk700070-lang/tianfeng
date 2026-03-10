import { ArrowLeft, Calculator } from "lucide-react";
import { useState } from "react";

interface CalculatorPageProps {
  onBack: () => void;
}

type CalcTab = "injury" | "fee" | "compensation";

// Injury compensation calculation
function calcInjury(salary: number, level: number): number {
  const multipliers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  return salary * (multipliers[level - 1] || 1);
}

// Litigation fee calculation
function calcFee(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 10000) return 50;
  if (amount <= 100000) return Math.max(amount * 0.025, 50);
  if (amount <= 200000) return amount * 0.02;
  return amount * 0.015;
}

// Economic compensation calculation (N+1)
function calcComp(years: number, salary: number): number {
  const n = Math.min(years, 12);
  return (n + 1) * salary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function CalculatorPage({ onBack }: CalculatorPageProps) {
  const [activeTab, setActiveTab] = useState<CalcTab>("injury");

  // Injury tab state
  const [injurySalary, setInjurySalary] = useState("");
  const [injuryLevel, setInjuryLevel] = useState("1");
  const [injuryResult, setInjuryResult] = useState<number | null>(null);

  // Fee tab state
  const [feeAmount, setFeeAmount] = useState("");
  const [feeResult, setFeeResult] = useState<number | null>(null);

  // Compensation tab state
  const [compYears, setCompYears] = useState("");
  const [compSalary, setCompSalary] = useState("");
  const [compResult, setCompResult] = useState<{
    compensation: number;
    months: number;
  } | null>(null);

  const tabs: { id: CalcTab; label: string }[] = [
    { id: "injury", label: "工伤赔偿" },
    { id: "fee", label: "诉讼费" },
    { id: "compensation", label: "经济补偿金" },
  ];

  const handleCalcInjury = () => {
    const salary = Number.parseFloat(injurySalary);
    const level = Number.parseInt(injuryLevel);
    if (!salary || salary <= 0) {
      alert("请输入有效的月工资");
      return;
    }
    setInjuryResult(calcInjury(salary, level));
  };

  const handleCalcFee = () => {
    const amount = Number.parseFloat(feeAmount);
    if (!amount || amount <= 0) {
      alert("请输入有效的案件标的额");
      return;
    }
    setFeeResult(calcFee(amount));
  };

  const handleCalcComp = () => {
    const years = Number.parseFloat(compYears);
    const salary = Number.parseFloat(compSalary);
    if (!years || years <= 0) {
      alert("请输入有效的工作年限");
      return;
    }
    if (!salary || salary <= 0) {
      alert("请输入有效的月工资");
      return;
    }
    const effectiveMonths = Math.min(years, 12) + 1;
    setCompResult({
      compensation: calcComp(years, salary),
      months: effectiveMonths,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-border px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          data-ocid="calculator.back_button"
          onClick={onBack}
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Calculator size={20} style={{ color: "oklch(var(--law-blue))" }} />
          <h1
            className="text-base font-bold"
            style={{
              color: "oklch(var(--law-blue))",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            法律计算器
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {tabs.map((tab, i) => (
            <button
              type="button"
              key={tab.id}
              className="flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all"
              data-ocid={`calculator.tab.${i + 1}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background:
                  activeTab === tab.id
                    ? "oklch(var(--law-blue))"
                    : "transparent",
                color: activeTab === tab.id ? "white" : "oklch(0.55 0.02 250)",
                boxShadow:
                  activeTab === tab.id
                    ? "0 2px 8px rgba(30,60,114,0.25)"
                    : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* ── Injury Compensation Tab ── */}
        {activeTab === "injury" && (
          <div className="space-y-4 page-enter">
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "oklch(var(--law-blue))" }}
              >
                工伤赔偿计算器
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                根据月工资和伤残等级计算一次性伤残补助金
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="injury-salary"
                    className="block text-sm font-medium mb-1.5 text-gray-700"
                  >
                    月工资（元）
                  </label>
                  <input
                    id="injury-salary"
                    type="number"
                    className="calc-input"
                    data-ocid="calculator.salary.input"
                    placeholder="例如：5000"
                    value={injurySalary}
                    onChange={(e) => setInjurySalary(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="injury-level"
                    className="block text-sm font-medium mb-1.5 text-gray-700"
                  >
                    伤残等级
                  </label>
                  <select
                    id="injury-level"
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-colors font-normal"
                    style={{
                      borderColor: "oklch(var(--border))",
                      fontFamily: "inherit",
                    }}
                    data-ocid="calculator.injury_level.select"
                    value={injuryLevel}
                    onChange={(e) => setInjuryLevel(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "oklch(var(--law-blue))";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "oklch(var(--border))";
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(
                      (level) => (
                        <option key={level} value={level.toString()}>
                          {level}级（{11 - level}个月工资）
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "oklch(var(--law-blue))" }}
                  data-ocid="calculator.injury.submit_button"
                  onClick={handleCalcInjury}
                >
                  立即计算
                </button>
              </div>
            </div>

            {injuryResult !== null && (
              <div className="result-card page-enter">
                <p className="text-xs text-gray-500 mb-1">一次性伤残补助金</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(var(--law-blue))" }}
                >
                  {formatCurrency(injuryResult)}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="text-xs text-gray-500">
                    计算公式：月工资 × {11 - Number.parseInt(injuryLevel)}个月
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    * 此为参考金额，实际赔偿可能因地区政策有所不同
                  </p>
                </div>
              </div>
            )}

            {/* Reference Table */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                伤残等级对应月数参考
              </h4>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <div
                    key={level}
                    className="text-center py-1.5 px-1 rounded-lg text-xs"
                    style={{
                      background:
                        Number.parseInt(injuryLevel) === level
                          ? "oklch(var(--law-blue))"
                          : "oklch(var(--law-blue-pale))",
                      color:
                        Number.parseInt(injuryLevel) === level
                          ? "white"
                          : "oklch(var(--law-blue))",
                    }}
                  >
                    <div className="font-bold">{level}级</div>
                    <div>{11 - level}月</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Litigation Fee Tab ── */}
        {activeTab === "fee" && (
          <div className="space-y-4 page-enter">
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "oklch(var(--law-blue))" }}
              >
                诉讼费计算器
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                根据案件标的额计算应缴纳的诉讼费用
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="fee-amount"
                    className="block text-sm font-medium mb-1.5 text-gray-700"
                  >
                    案件标的额（元）
                  </label>
                  <input
                    id="fee-amount"
                    type="number"
                    className="calc-input"
                    data-ocid="calculator.amount.input"
                    placeholder="例如：50000"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    min="0"
                  />
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "oklch(var(--law-blue))" }}
                  data-ocid="calculator.fee.submit_button"
                  onClick={handleCalcFee}
                >
                  立即计算
                </button>
              </div>
            </div>

            {feeResult !== null && (
              <div className="result-card page-enter">
                <p className="text-xs text-gray-500 mb-1">应缴诉讼费</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(var(--law-blue))" }}
                >
                  {formatCurrency(feeResult)}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="text-xs text-gray-400 mt-1">
                    * 部分案件类型适用不同标准，仅供参考
                  </p>
                </div>
              </div>
            )}

            {/* Fee Rate Table */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                费率参考标准
              </h4>
              <div className="space-y-1.5">
                {[
                  { range: "1万元以下", rate: "50元（固定）" },
                  { range: "1万 - 10万", rate: "2.5%（最低50元）" },
                  { range: "10万 - 20万", rate: "2%" },
                  { range: "20万以上", rate: "1.5%" },
                ].map((item) => (
                  <div
                    key={item.range}
                    className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50 text-xs"
                  >
                    <span className="text-gray-600">{item.range}</span>
                    <span
                      className="font-medium"
                      style={{ color: "oklch(var(--law-blue))" }}
                    >
                      {item.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Economic Compensation Tab ── */}
        {activeTab === "compensation" && (
          <div className="space-y-4 page-enter">
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "oklch(var(--law-blue))" }}
              >
                经济补偿金计算器
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                依据N+1原则计算劳动关系解除时的经济补偿
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="comp-years"
                    className="block text-sm font-medium mb-1.5 text-gray-700"
                  >
                    工作年限（年）
                  </label>
                  <input
                    id="comp-years"
                    type="number"
                    className="calc-input"
                    data-ocid="calculator.years.input"
                    placeholder="例如：3"
                    value={compYears}
                    onChange={(e) => setCompYears(e.target.value)}
                    min="0"
                    step="0.5"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    工作年限上限为12年（月工资有上限的情形）
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="comp-salary"
                    className="block text-sm font-medium mb-1.5 text-gray-700"
                  >
                    月工资（元）
                  </label>
                  <input
                    id="comp-salary"
                    type="number"
                    className="calc-input"
                    data-ocid="calculator.comp_salary.input"
                    placeholder="例如：8000"
                    value={compSalary}
                    onChange={(e) => setCompSalary(e.target.value)}
                    min="0"
                  />
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "oklch(var(--law-blue))" }}
                  data-ocid="calculator.comp.submit_button"
                  onClick={handleCalcComp}
                >
                  立即计算
                </button>
              </div>
            </div>

            {compResult !== null && (
              <div className="result-card page-enter">
                <p className="text-xs text-gray-500 mb-1">
                  应获经济补偿金（N+1）
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(var(--law-blue))" }}
                >
                  {formatCurrency(compResult.compensation)}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="text-xs text-gray-500">
                    计算公式：min({compYears}, 12) + 1 = {compResult.months}{" "}
                    个月月工资
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    * 月工资超过当地平均工资3倍时，按3倍上限计算
                  </p>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                N+1 计算说明
              </h4>
              <div className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <p>
                  • <strong>N</strong> = 实际工作年限（最高12个月）
                </p>
                <p>
                  • <strong>+1</strong> = 代通知金（用人单位未提前30天通知）
                </p>
                <p>• 不满6个月按0.5个月计算</p>
                <p>• 适用于公司违法解除劳动合同或协商解除的情形</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Banner */}
      <div className="ad-banner">广告位招租 · 联系：ad@xiaoai-law.com</div>
    </div>
  );
}
