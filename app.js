const START_DATE_UTC = Date.UTC(2030, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;
const GAME_DAYS_PER_REAL_MS = 365 / 60000;

const metricDefs = [
  { id: "treasury", name: "국고", color: "#306fbb" },
  { id: "consumption", name: "소비력", color: "#bd6f1f" },
  { id: "employment", name: "고용율", color: "#337f69" },
  { id: "capital", name: "국내 자본", color: "#6f52b5" },
  { id: "support", name: "정부 지지율", color: "#bc4e73" },
];

const policyDefs = [
  {
    id: "ubi",
    name: "보편소득",
    desc: "소비와 지지를 살리지만 국고를 빠르게 소모",
    initial: 42,
  },
  {
    id: "tax",
    name: "기업세",
    desc: "운영 재원을 만들지만 자본과 고용을 압박",
    initial: 38,
  },
  {
    id: "jobs",
    name: "일자리 창출",
    desc: "고용과 소비를 지탱하지만 비용이 큼",
    initial: 36,
  },
  {
    id: "control",
    name: "통제경제",
    desc: "AI 충격을 늦추지만 경제 활력을 떨어뜨림",
    initial: 30,
  },
];

const events = [
  {
    category: "AI 대체",
    title: "사무직 자동화",
    body: "대기업들이 사무직 인력의 상당수를 AI 시스템으로 대체했습니다.",
    effects: { employment: -10, consumption: -6, capital: 5, support: -4 },
    notice: "기업은 생산성을 얻었지만, 일자리를 잃은 시민의 소비력이 줄었습니다.",
  },
  {
    category: "AI 대체",
    title: "무인 물류 확산",
    body: "도심 물류망이 무인 창고와 자율 배송으로 빠르게 전환되었습니다.",
    effects: { employment: -8, consumption: -5, capital: 4 },
    notice: "비용 절감은 자본을 키웠지만, 고용과 소비 기반은 약해졌습니다.",
  },
  {
    category: "AI 대체",
    title: "콜센터 폐쇄",
    body: "금융권과 통신사가 상담 업무를 음성 AI로 대체했습니다.",
    effects: { employment: -9, consumption: -5, support: -5, capital: 3 },
    notice: "서비스 비용은 낮아졌지만 시민은 정책 대응을 요구하고 있습니다.",
  },
  {
    category: "AI 대체",
    title: "자동 생산 라인 증설",
    body: "제조업체들이 신규 채용 대신 완전 자동화 설비를 들였습니다.",
    effects: { employment: -11, capital: 7, consumption: -6, treasury: 2 },
    notice: "단기 세수는 늘었지만 일자리와 소비가 더 크게 흔들렸습니다.",
  },
  {
    category: "AI 대체",
    title: "전문직 AI 보급",
    body: "법률, 회계, 설계 분야에 구독형 전문 AI가 보급되었습니다.",
    effects: { employment: -12, consumption: -7, capital: 5, support: -6 },
    notice: "고소득층 고용까지 흔들리며 소비 시장의 하단이 빠르게 꺼졌습니다.",
  },
  {
    category: "AI 대체",
    title: "플랫폼 노동 축소",
    body: "배달, 운송, 단기 업무 플랫폼이 알고리즘 운영으로 인력을 줄였습니다.",
    effects: { employment: -8, consumption: -7, support: -4 },
    notice: "불안정 노동층의 소득이 감소해 소비와 지지가 동시에 내려갔습니다.",
  },
  {
    category: "기업 반발",
    title: "대기업 세금 저항",
    body: "주요 기업들이 세 부담을 이유로 투자 계획을 보류했습니다.",
    effects: { capital: -8, treasury: -4, support: -3 },
    notice: "재원을 확보하려는 압박이 투자 위축으로 되돌아오고 있습니다.",
  },
  {
    category: "기업 반발",
    title: "해외 이전 경고",
    body: "자동화 기업 연합이 세금과 통제를 낮추지 않으면 해외 이전을 검토하겠다고 밝혔습니다.",
    effects: { capital: -12, employment: -6, treasury: -5 },
    notice: "기업이 빠져나가면 세수와 고용이 함께 약해집니다.",
  },
  {
    category: "기업 반발",
    title: "투자 파업",
    body: "대형 펀드들이 국내 신규 투자를 잠정 중단했습니다.",
    effects: { capital: -10, employment: -4, support: -3 },
    notice: "자본의 반발은 실물 고용까지 끌어내립니다.",
  },
  {
    category: "기업 반발",
    title: "가격 인상 압박",
    body: "기업들이 세금과 규제를 이유로 생필품 가격 인상을 예고했습니다.",
    effects: { consumption: -8, support: -6, capital: 2 },
    notice: "기업 마진은 방어됐지만 시민 체감 소득은 낮아졌습니다.",
  },
  {
    category: "기업 반발",
    title: "로비 공세",
    body: "산업계가 규제 완화와 세액 공제를 요구하는 대규모 캠페인을 시작했습니다.",
    effects: { support: -5, treasury: -3, capital: -4 },
    notice: "정부 신뢰가 흔들리면 정책 효과도 약해집니다.",
  },
  {
    category: "기업 반발",
    title: "자동화 특구 요구",
    body: "기업들이 고용 의무가 없는 자동화 특구 지정을 요구했습니다.",
    effects: { capital: 5, employment: -9, consumption: -5, support: -4 },
    notice: "자본에는 호재지만 소비자를 만드는 일자리는 줄어듭니다.",
  },
  {
    category: "시민 빈곤",
    title: "중산층 붕괴",
    body: "주택 대출과 생활비를 버티던 중산층의 소비 여력이 급감했습니다.",
    effects: { consumption: -12, support: -8, capital: -4 },
    notice: "소비자가 사라지자 기업 매출도 함께 흔들립니다.",
  },
  {
    category: "시민 빈곤",
    title: "월세 체납 급증",
    body: "도시 지역에서 월세 체납과 강제 퇴거가 급증했습니다.",
    effects: { consumption: -8, support: -6, employment: -3 },
    notice: "생활 안정이 무너지면 소비와 정부 신뢰가 동시에 떨어집니다.",
  },
  {
    category: "시민 빈곤",
    title: "가계 파산 증가",
    body: "소득이 끊긴 가구가 신용 시장에서 빠르게 탈락하고 있습니다.",
    effects: { consumption: -10, support: -7, treasury: -3 },
    notice: "빈곤은 소비 위축뿐 아니라 세수 감소로도 이어집니다.",
  },
  {
    category: "시민 빈곤",
    title: "의료비 포기",
    body: "필수 의료 지출을 줄이는 시민이 늘며 사회 불안이 커졌습니다.",
    effects: { support: -9, consumption: -5, employment: -3 },
    notice: "기본 생활이 위협받으면 시장보다 정부에 분노가 집중됩니다.",
  },
  {
    category: "시민 빈곤",
    title: "청년 구직 포기",
    body: "자동화 경쟁에서 밀린 청년층이 노동 시장에서 이탈하고 있습니다.",
    effects: { employment: -9, consumption: -6, support: -5 },
    notice: "고용율 하락은 곧 다음 분기의 소비 하락으로 번집니다.",
  },
  {
    category: "시민 빈곤",
    title: "지역 상권 공실",
    body: "소비가 끊긴 지역 상권에서 폐업과 공실이 늘었습니다.",
    effects: { consumption: -9, capital: -8, employment: -4 },
    notice: "시민이 가난해지자 기업도 버틸 시장을 잃고 있습니다.",
  },
  {
    category: "재정 위기",
    title: "복지 지출 폭증",
    body: "소득 보전 수요가 급증하며 정부 지출이 예상치를 넘어섰습니다.",
    effects: { treasury: -12, support: 4, consumption: 3 },
    notice: "시민은 버텼지만 국고의 압박은 더 커졌습니다.",
  },
  {
    category: "재정 위기",
    title: "국채 이자 상승",
    body: "국가 신용 위험이 반영되며 국채 이자 비용이 뛰었습니다.",
    effects: { treasury: -10, support: -4, capital: -3 },
    notice: "국고가 약해지면 정부 신뢰와 투자 기반도 함께 낮아집니다.",
  },
  {
    category: "재정 위기",
    title: "세수 결손",
    body: "기업 이익과 가계 소비가 동시에 줄어 세입이 비었습니다.",
    effects: { treasury: -11, support: -5 },
    notice: "소비와 자본의 약화는 결국 국고 부족으로 돌아옵니다.",
  },
  {
    category: "재정 위기",
    title: "긴급 추경",
    body: "정부가 붕괴를 막기 위해 긴급 예산을 편성했습니다.",
    effects: { treasury: -9, support: 3, employment: 2, consumption: 2 },
    notice: "돈을 쓰면 지표는 잠시 버티지만 재정 여력은 줄어듭니다.",
  },
  {
    category: "재정 위기",
    title: "공공기관 적자",
    body: "요금 통제와 지원 정책으로 공공기관 적자가 커졌습니다.",
    effects: { treasury: -8, capital: -3, support: 2 },
    notice: "통제는 시민 부담을 늦추지만 정부 장부에 비용을 남깁니다.",
  },
  {
    category: "재정 위기",
    title: "신용등급 경고",
    body: "국제 신용평가사가 재정 지속 가능성에 경고를 냈습니다.",
    effects: { treasury: -7, capital: -7, support: -5 },
    notice: "재정 불안은 해외 자본과 국내 기업 심리를 동시에 흔듭니다.",
  },
  {
    category: "시장 붕괴",
    title: "소비자 감소",
    body: "대량 자동화 이후 구매력을 가진 소비자층이 눈에 띄게 줄었습니다.",
    effects: { consumption: -10, capital: -10, employment: -4 },
    notice: "소비자가 사라지면 기업의 생산성도 매출로 이어지지 않습니다.",
  },
  {
    category: "시장 붕괴",
    title: "내수 기업 연쇄 폐업",
    body: "내수 의존 기업들이 매출 부진을 견디지 못하고 폐업했습니다.",
    effects: { capital: -12, employment: -8, treasury: -5 },
    notice: "소비 시장이 무너지면 자본과 세수도 동시에 꺼집니다.",
  },
  {
    category: "시장 붕괴",
    title: "재고 폭증",
    body: "자동화 공장은 물건을 만들지만 살 사람이 부족합니다.",
    effects: { capital: -8, consumption: -6, employment: -4 },
    notice: "생산 능력만으로는 경제가 유지되지 않습니다.",
  },
  {
    category: "시장 붕괴",
    title: "소상공인 도산",
    body: "동네 상권의 매출이 급락하며 고용 흡수력이 사라졌습니다.",
    effects: { capital: -7, employment: -7, consumption: -5 },
    notice: "작은 사업장의 폐업은 고용율과 소비력을 함께 낮춥니다.",
  },
  {
    category: "시장 붕괴",
    title: "필수재 가격 충격",
    body: "공급망 비용이 올라 저소득층의 실질 구매력이 줄었습니다.",
    effects: { consumption: -9, support: -6, treasury: -2 },
    notice: "물가 충격은 시민의 지갑과 정부 지지를 동시에 깎습니다.",
  },
  {
    category: "시장 붕괴",
    title: "투자 회수",
    body: "수익 전망이 낮아진 기업들이 국내 설비를 매각하고 있습니다.",
    effects: { capital: -11, employment: -5, treasury: -4 },
    notice: "시장이 줄면 자본은 더 빠르게 빠져나갑니다.",
  },
  {
    category: "사회 불안",
    title: "대규모 실업 시위",
    body: "자동화 실직자들이 도심에서 대규모 시위를 벌였습니다.",
    effects: { support: -12, capital: -4, consumption: -4 },
    notice: "정부 지지가 낮아지면 모든 정책의 체감 효과가 둔해집니다.",
  },
  {
    category: "사회 불안",
    title: "기본소득 요구 확산",
    body: "시민 단체들이 즉각적인 소득 보전을 요구하고 있습니다.",
    effects: { support: -7, consumption: -3 },
    notice: "소득 안전망이 약하면 정치적 압박이 빠르게 커집니다.",
  },
  {
    category: "사회 불안",
    title: "노사 충돌",
    body: "자동화 설비 도입을 둘러싸고 공장 점거와 해고 갈등이 벌어졌습니다.",
    effects: { employment: -5, capital: -6, support: -6 },
    notice: "기업과 시민의 충돌은 정부가 어느 쪽도 완전히 만족시키기 어렵게 만듭니다.",
  },
  {
    category: "사회 불안",
    title: "지방 행정 마비",
    body: "세수 부족과 민원 폭증으로 일부 지방 행정 서비스가 중단되었습니다.",
    effects: { support: -8, treasury: -4, consumption: -3 },
    notice: "국고 부족은 행정 신뢰 하락으로 바로 이어집니다.",
  },
  {
    category: "사회 불안",
    title: "치안 비용 증가",
    body: "빈곤과 실업으로 사회 갈등이 커지며 치안 비용이 늘었습니다.",
    effects: { treasury: -7, support: -5, capital: -3 },
    notice: "사회 불안은 재정을 소모하고 자본의 이탈을 부릅니다.",
  },
  {
    category: "사회 불안",
    title: "정책 불복 운동",
    body: "정부 정책에 대한 불복과 납세 거부 움직임이 확산되고 있습니다.",
    effects: { support: -10, treasury: -6, capital: -4 },
    notice: "지지가 무너지면 세금을 걷고 정책을 집행하는 힘도 약해집니다.",
  },
];

const metricEls = new Map();
const policyEls = new Map();
let state;

const $ = (selector) => document.querySelector(selector);

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function signed(value) {
  return `${value > 0 ? "+" : ""}${Math.round(value)}`;
}

function formatDate(days) {
  const date = new Date(START_DATE_UTC + Math.floor(days) * DAY_MS);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
}

function survivalMonths() {
  return Math.max(0, Math.floor(state.elapsedGameDays / (365 / 12)));
}

function formatSurvival() {
  const months = survivalMonths();
  return `${Math.floor(months / 12)}년 ${months % 12}개월`;
}

function difficulty() {
  const months = survivalMonths();
  let ai = 1;
  let conflict = 1;
  let fiscal = 1;
  let pressure = 1;
  let label = "2030년대 자동화 충격이 시작되었습니다.";

  if (months >= 12) {
    ai = 1.45;
    pressure = 1.12;
    label = "난이도 상승: AI 대체 속도 증가";
  }
  if (months >= 36) {
    conflict = 1.42;
    pressure = 1.24;
    label = "난이도 상승: 기업과 시민의 충돌 심화";
  }
  if (months >= 60) {
    fiscal = 1.52;
    pressure = 1.38;
    label = "난이도 상승: 재정 압박 증가";
  }
  if (months >= 96) {
    ai = 1.82;
    conflict = 1.72;
    fiscal = 1.78;
    pressure = 1.7;
    label = "난이도 상승: 모든 지표의 하락 압력 증가";
  }

  return { ai, conflict, fiscal, pressure, label };
}

function buildUi() {
  const metricList = $("#metricList");
  metricDefs.forEach((metric) => {
    const row = document.createElement("div");
    row.className = "metric";
    row.dataset.metric = metric.id;
    row.style.setProperty("--metric-color", metric.color);
    row.innerHTML = `
      <span class="metric-name">${metric.name}</span>
      <span class="metric-track"><span class="metric-fill"></span></span>
      <strong class="metric-value">0</strong>
      <span class="delta"></span>
    `;
    metricList.append(row);
    metricEls.set(metric.id, {
      row,
      fill: row.querySelector(".metric-fill"),
      value: row.querySelector(".metric-value"),
      delta: row.querySelector(".delta"),
    });
  });

  const policyList = $("#policyList");
  policyDefs.forEach((policy) => {
    const row = document.createElement("label");
    row.className = "policy";
    row.innerHTML = `
      <span class="policy-top">
        <span class="policy-name">${policy.name}</span>
        <input type="range" min="0" max="100" value="${policy.initial}" data-policy="${policy.id}" />
        <strong class="policy-value">${policy.initial}</strong>
      </span>
      <span class="policy-desc">${policy.desc}</span>
    `;
    policyList.append(row);
    const input = row.querySelector("input");
    const value = row.querySelector(".policy-value");
    input.addEventListener("input", () => {
      state.policies[policy.id] = Number(input.value);
      value.textContent = input.value;
    });
    policyEls.set(policy.id, { input, value });
  });
}

function resetGame() {
  state = {
    elapsedGameDays: 0,
    metrics: {
      treasury: 72,
      consumption: 68,
      employment: 70,
      capital: 72,
      support: 66,
    },
    policies: Object.fromEntries(policyDefs.map((policy) => [policy.id, policy.initial])),
    lastFrame: performance.now(),
    nextEventAt: performance.now() + rand(30000, 40000),
    gameOver: false,
  };

  policyDefs.forEach((policy) => {
    const els = policyEls.get(policy.id);
    if (!els) return;
    els.input.value = policy.initial;
    els.value.textContent = policy.initial;
  });

  $("#collapseScreen").classList.add("hidden");
  $("#eventCategory").textContent = "상황 보고";
  $("#eventTitle").textContent = "국가 운영 시작";
  $("#eventBody").textContent =
    "정책 Bar를 조절해 국고, 소비력, 고용율, 국내 자본, 정부 지지율을 동시에 버티게 하십시오.";
  $("#eventEffects").innerHTML = "";
  $("#noticeText").textContent =
    "알림: 소비자와 기업, 재정은 서로를 필요로 하지만 같은 방향으로 움직이지 않습니다.";
  render();
}

function applyMetricDelta(id, amount, showEffect = false) {
  const before = state.metrics[id];
  const after = clamp(before + amount);
  state.metrics[id] = after;
  if (showEffect && Math.abs(after - before) >= 0.5) {
    flashMetric(id, after - before);
  }
  return after - before;
}

function flashMetric(id, delta) {
  const els = metricEls.get(id);
  if (!els) return;
  els.row.classList.remove("shake", "flash-positive", "flash-negative");
  els.delta.classList.remove("show", "positive", "negative");
  void els.row.offsetWidth;
  els.row.classList.add("shake", delta >= 0 ? "flash-positive" : "flash-negative");
  els.delta.textContent = `${delta >= 0 ? "▲" : "▼"} ${signed(delta)}`;
  els.delta.classList.add("show", delta >= 0 ? "positive" : "negative");
  window.setTimeout(() => {
    els.row.classList.remove("shake", "flash-positive", "flash-negative");
    els.delta.classList.remove("show");
  }, 1200);
}

function applyDynamics(dt) {
  const d = difficulty();
  const p = Object.fromEntries(
    Object.entries(state.policies).map(([key, value]) => [key, value / 100]),
  );
  const m = Object.fromEntries(
    Object.entries(state.metrics).map(([key, value]) => [key, value / 100]),
  );
  const legitimacy = 0.5 + m.support * 0.78;
  const aiShock = (0.52 + m.capital * 0.5) * (1 - p.control * 0.55) * d.ai;
  const marketWeakness = Math.max(0, 0.58 - m.consumption) * 2.2;
  const fiscalStress = Math.max(0, 0.48 - m.treasury) * d.fiscal;
  const capitalFlight = Math.max(0, p.tax - 0.38) * 1.35 + p.control * 0.62;
  const povertyStress = Math.max(0, 0.62 - m.employment) + Math.max(0, 0.58 - m.consumption);

  const deltas = {
    treasury:
      (p.tax * (0.55 + m.capital * 1.05) * legitimacy -
        p.ubi * 0.95 * d.fiscal -
        p.jobs * 0.86 * d.fiscal -
        p.control * 0.42 * d.fiscal -
        fiscalStress * 0.72 -
        marketWeakness * 0.32) *
      dt,
    consumption:
      (p.ubi * 0.92 * legitimacy +
        p.jobs * 0.64 * legitimacy +
        (m.employment - 0.55) * 1.15 +
        (m.capital - 0.48) * 0.28 -
        aiShock * 0.56 -
        Math.max(0, p.tax - 0.58) * 0.42 -
        povertyStress * 0.36) *
      dt,
    employment:
      (p.jobs * 0.92 * legitimacy -
        aiShock * 0.94 -
        capitalFlight * 0.45 * d.conflict -
        marketWeakness * 0.34 +
        p.control * 0.34 * legitimacy) *
      dt,
    capital:
      ((m.consumption - 0.5) * 0.92 +
        p.ubi * 0.22 +
        p.jobs * 0.12 -
        p.tax * 0.78 * d.conflict -
        p.control * 0.78 * d.conflict -
        marketWeakness * 0.62) *
      dt,
    support:
      (p.ubi * 0.46 +
        p.jobs * 0.42 +
        p.control * (m.consumption < 0.45 ? 0.24 : -0.26) -
        Math.max(0, p.tax - 0.52) * 0.44 * d.conflict -
        fiscalStress * 0.86 -
        povertyStress * 0.62 -
        aiShock * 0.2) *
      dt,
  };

  const globalDrag = (d.pressure - 1) * 0.22 * dt;
  metricDefs.forEach((metric) => {
    const noise = rand(-0.08, 0.08) * d.pressure * dt;
    applyMetricDelta(metric.id, deltas[metric.id] - globalDrag + noise);
  });

  checkCollapse();
}

function chooseEvent() {
  const m = state.metrics;
  const p = state.policies;
  const weighted = events.map((event) => {
    let weight = 1;
    if (event.category === "AI 대체") weight += 0.9 + (p.control < 35 ? 0.7 : 0);
    if (event.category === "기업 반발") weight += p.tax > 52 || p.control > 52 ? 2.1 : 0.2;
    if (event.category === "시민 빈곤") weight += m.consumption < 52 || m.employment < 52 ? 2.1 : 0.2;
    if (event.category === "재정 위기") weight += m.treasury < 55 || p.ubi + p.jobs > 105 ? 2.2 : 0.1;
    if (event.category === "시장 붕괴") weight += m.consumption < 48 || m.capital < 48 ? 2 : 0.1;
    if (event.category === "사회 불안") weight += m.support < 50 || m.employment < 48 ? 2 : 0.1;
    return { event, weight };
  });
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let target = rand(0, total);
  for (const item of weighted) {
    target -= item.weight;
    if (target <= 0) return item.event;
  }
  return events[0];
}

function triggerEvent() {
  const event = chooseEvent();
  const d = difficulty();
  const multiplier = rand(0.9, 1.2) * (0.9 + (d.pressure - 1) * 0.85);
  const effectRows = [];

  Object.entries(event.effects).forEach(([id, raw]) => {
    const amount = raw * multiplier;
    const before = Math.round(state.metrics[id]);
    const actual = applyMetricDelta(id, amount, true);
    const after = Math.round(state.metrics[id]);
    const metricName = metricDefs.find((metric) => metric.id === id).name;
    effectRows.push({
      id,
      html: `<span class="effect-pill ${actual >= 0 ? "positive" : "negative"}">${metricName} ${before} → ${after} ${actual >= 0 ? "▲" : "▼"} ${signed(actual)}</span>`,
    });
  });

  $("#eventCategory").textContent = event.category;
  $("#eventTitle").textContent = event.title;
  $("#eventBody").textContent = event.body;
  $("#eventEffects").innerHTML = effectRows.map((row) => row.html).join("");
  $("#noticeText").textContent = `알림: ${event.notice}`;
  state.nextEventAt = performance.now() + rand(30000, 40000);
  checkCollapse();
}

function render() {
  $("#currentDate").textContent = formatDate(state.elapsedGameDays);
  $("#survivalText").textContent = formatSurvival();
  $("#scoreText").textContent = `${survivalMonths()}개월`;
  $("#difficultyText").textContent = difficulty().label;

  metricDefs.forEach((metric) => {
    const value = Math.round(state.metrics[metric.id]);
    const els = metricEls.get(metric.id);
    els.fill.style.width = `${clamp(value)}%`;
    els.value.textContent = value;
  });
}

function checkCollapse() {
  if (state.gameOver) return;
  const fallen = metricDefs.find((metric) => state.metrics[metric.id] <= 0);
  if (!fallen) return;
  state.gameOver = true;
  $("#finalSurvival").textContent = formatSurvival();
  $("#finalScore").textContent = `${survivalMonths()}개월`;
  $("#collapseReason").textContent = fallen.name;
  $("#collapseScreen").classList.remove("hidden");
}

function frame(now) {
  const dt = Math.min(0.25, (now - state.lastFrame) / 1000);
  state.lastFrame = now;

  if (!state.gameOver) {
    state.elapsedGameDays += (now - (state.lastRenderNow ?? now)) * GAME_DAYS_PER_REAL_MS;
    state.lastRenderNow = now;
    applyDynamics(dt);
    if (now >= state.nextEventAt) triggerEvent();
    render();
  }

  requestAnimationFrame(frame);
}

buildUi();
resetGame();
$("#restartButton").addEventListener("click", resetGame);
requestAnimationFrame((now) => {
  state.lastFrame = now;
  state.lastRenderNow = now;
  requestAnimationFrame(frame);
});
