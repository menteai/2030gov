(function (root) {
  "use strict";

  const METRICS = [
    { key: "treasury", label: "국고", color: "#f5c451" },
    { key: "consumption", label: "소비력", color: "#4dc6ff" },
    { key: "employment", label: "고용율", color: "#7bdc76" },
    { key: "capital", label: "국내 자본", color: "#b58cff" },
    { key: "approval", label: "정부 지지율", color: "#ff7ca8" }
  ];

  const POLICIES = [
    {
      key: "income",
      label: "보편소득",
      note: "소비자와 지지율을 살리지만 국고를 빠르게 소모합니다."
    },
    {
      key: "tax",
      label: "기업세",
      note: "국고를 회복시키지만 기업과 자본의 반발을 키웁니다."
    },
    {
      key: "jobs",
      label: "일자리 창출",
      note: "고용과 소비를 떠받치지만 자동화 충격을 완전히 막지는 못합니다."
    },
    {
      key: "control",
      label: "통제경제",
      note: "붕괴를 늦추지만 높은 통제는 자본과 지지율을 깎습니다."
    }
  ];

  const YEAR_TABLE = [
    phase("0년차", "자동화 충격 개시", 1.00, 0.82, 0.82, 0.18, 0.82, 0.54, 0.92, 0.44, 0.88, 1.00, 0.82, 20, 1.00, 1.00),
    phase("1년차", "고용 대체 가속", 1.18, 0.92, 0.88, 0.24, 1.18, 0.66, 1.18, 0.54, 0.94, 1.00, 0.92, 20, 1.08, 1.00),
    phase("2년차", "소비 후행 붕괴", 1.24, 1.02, 0.96, 0.30, 1.22, 1.06, 1.10, 0.62, 1.00, 1.04, 1.00, 21, 1.15, 0.96),
    phase("3년차", "기업 반발 확대", 1.28, 1.22, 1.00, 0.36, 1.18, 1.12, 1.00, 0.92, 1.04, 1.08, 1.04, 22, 1.18, 0.92),
    phase("4년차", "내수 임계점 상승", 1.32, 1.28, 1.08, 0.44, 1.20, 1.18, 0.92, 1.05, 1.08, 1.12, 1.10, 28, 1.36, 0.88),
    phase("5년차", "재정 부담 심화", 1.36, 1.34, 1.34, 0.52, 1.24, 1.22, 0.82, 1.18, 1.34, 1.16, 1.18, 29, 1.46, 0.82),
    phase("6년차", "정책 효율 저하", 1.42, 1.42, 1.42, 0.62, 1.30, 1.28, 0.72, 1.30, 1.44, 1.38, 1.26, 30, 1.56, 0.76),
    phase("7년차", "사회 불안 고조", 1.50, 1.56, 1.52, 0.72, 1.36, 1.34, 0.62, 1.44, 1.55, 1.46, 1.55, 31, 1.66, 0.70),
    phase("8년차", "자본 이탈 국면", 1.60, 1.68, 1.66, 0.86, 1.45, 1.42, 0.45, 1.78, 1.70, 1.54, 1.68, 32, 1.82, 0.64),
    phase("9년차", "세수 기반 침식", 1.72, 1.78, 1.82, 1.02, 1.58, 1.52, 0.30, 1.95, 1.84, 1.66, 1.84, 33, 1.98, 0.52),
    phase("10년차", "연쇄 붕괴", 1.92, 2.05, 2.10, 1.30, 1.82, 1.78, 0.10, 2.32, 2.08, 1.86, 2.18, 35, 2.30, 0.42)
  ];

  const EVENTS = [
    ev("AI 대체", "사무직 자동화", "대기업들이 사무직 인력의 상당수를 AI 시스템으로 대체했습니다.", { employment: -10, consumption: -6, capital: 5, approval: -4 }, "기업은 성장했지만 일자리를 잃은 시민의 소비력이 줄었습니다."),
    ev("AI 대체", "무인 물류 확산", "무인 창고와 자율 배송망이 전국 물류업을 빠르게 대체했습니다.", { employment: -8, consumption: -5, capital: 4 }, "물류 효율은 올랐지만 노동 소득이 더 얇아졌습니다."),
    ev("AI 대체", "자동 생산 라인 증설", "제조업체들이 신규 생산 라인을 거의 전부 자동화했습니다.", { employment: -11, consumption: -6, capital: 7, treasury: 2 }, "초기 세수는 늘었지만 고용 기반은 크게 흔들렸습니다."),
    ev("AI 대체", "AI 콜센터 전환", "서비스 기업들이 상담 직군을 대화형 AI로 일괄 전환했습니다.", { employment: -7, consumption: -5, capital: 3, approval: -3 }, "소비자는 싸진 서비스를 얻었지만 일자리는 사라졌습니다."),
    ev("AI 대체", "무인 매장 확산", "도심 상권의 판매직이 무인 결제와 재고 AI로 대체됐습니다.", { employment: -9, consumption: -4, capital: 4, approval: -2 }, "상점은 버텼지만 시민의 임금 소득은 줄었습니다."),
    ev("AI 대체", "전문직 자동화 충격", "회계, 번역, 법무 보조 직군에 자동화 해고가 집중됐습니다.", { employment: -12, consumption: -7, capital: 5, approval: -5 }, "고소득 직군까지 흔들리며 소비 심리가 꺾였습니다."),
    ev("기업 반발", "대기업 세금 저항", "대기업 연합이 증세에 반발하며 투자 보류를 선언했습니다.", { capital: -8, treasury: -4, approval: -3 }, "국고를 살리려던 압력이 투자 위축으로 돌아왔습니다."),
    ev("기업 반발", "해외 이전 경고", "핵심 기업들이 생산 거점을 해외로 옮길 수 있다고 경고했습니다.", { capital: -12, employment: -6, treasury: -5 }, "기업을 압박한 비용이 고용과 세수에 동시에 번졌습니다."),
    ev("기업 반발", "신규 투자 동결", "벤처 투자와 설비 투자가 동시에 얼어붙었습니다.", { capital: -9, employment: -4, consumption: -3 }, "자본이 움츠러들면 다음 일자리도 줄어듭니다."),
    ev("기업 반발", "자동화 로비전", "기업 단체가 규제 완화를 요구하며 대규모 여론전을 시작했습니다.", { approval: -6, capital: -4, treasury: -2 }, "정책 신뢰가 흔들리고 협상 비용이 커졌습니다."),
    ev("기업 반발", "조세 회피 확산", "대기업들이 AI 회계망을 통해 세금 부담을 빠르게 줄였습니다.", { treasury: -9, capital: -3, approval: -3 }, "높은 세율이 항상 높은 세수로 이어지지는 않았습니다."),
    ev("기업 반발", "공급망 재편 압박", "기업들이 통제 강화를 이유로 국내 공급망 축소를 시작했습니다.", { capital: -10, employment: -5, consumption: -4 }, "통제는 속도를 늦췄지만 자본의 체류 의지도 낮췄습니다."),
    ev("시민 빈곤", "중산층 붕괴", "대출과 생활비를 감당하지 못한 중산층이 빠르게 빈곤층으로 밀려났습니다.", { consumption: -12, approval: -8, capital: -4 }, "소비자가 사라지자 기업의 내수 기반도 약해졌습니다."),
    ev("시민 빈곤", "청년 구직 포기", "청년층이 구직을 포기하며 노동시장 밖으로 밀려났습니다.", { employment: -9, consumption: -6, approval: -5 }, "고용 포기는 곧 소비와 정부 신뢰의 하락으로 이어졌습니다."),
    ev("시민 빈곤", "가계 연체 급증", "가계 연체율이 급등하며 소비 지출이 급격히 줄었습니다.", { consumption: -11, capital: -5, approval: -5 }, "빚을 갚는 시민은 물건을 살 수 없습니다."),
    ev("시민 빈곤", "지역 상권 폐업", "일자리 감소 지역에서 소상공인 폐업이 이어졌습니다.", { consumption: -8, employment: -5, capital: -6 }, "소비력과 고용이 서로를 끌어내리기 시작했습니다."),
    ev("시민 빈곤", "임금 협상 붕괴", "자동화 대체 가능성이 커지며 노동자의 협상력이 약해졌습니다.", { employment: -6, consumption: -9, approval: -4 }, "일자리가 있어도 소득이 낮으면 소비는 버티지 못합니다."),
    ev("시민 빈곤", "필수재 구매 축소", "가계가 식료품과 의료비를 제외한 지출을 줄였습니다.", { consumption: -10, capital: -7, approval: -4 }, "소비 축소가 기업 매출 기반을 직접 깎았습니다."),
    ev("재정 위기", "복지 지출 폭증", "실업과 빈곤 확대로 보편소득 지출 압력이 커졌습니다.", { treasury: -12, approval: 4, consumption: 3 }, "시민은 잠시 숨을 돌렸지만 국고는 빠르게 줄었습니다."),
    ev("재정 위기", "세수 결손", "기업 이익과 임금 소득이 줄며 예상 세수가 크게 비었습니다.", { treasury: -11, approval: -5 }, "국고가 약해지면 모든 정책의 지속성이 흔들립니다."),
    ev("재정 위기", "국채 금리 상승", "시장 불안으로 정부의 조달 비용이 급등했습니다.", { treasury: -10, capital: -4, approval: -4 }, "재정은 숫자만이 아니라 신뢰 위에서 움직입니다."),
    ev("재정 위기", "공공 일자리 비용 초과", "공공 일자리 예산이 예상보다 빠르게 소진됐습니다.", { treasury: -13, employment: 3, approval: 2 }, "고용을 지키는 비용이 매년 더 비싸지고 있습니다."),
    ev("재정 위기", "지방 재정 경보", "지방정부가 복지와 고용 예산 부족을 중앙정부에 통보했습니다.", { treasury: -8, approval: -6, consumption: -3 }, "국가 재정 압박이 지역의 불만으로 번졌습니다."),
    ev("재정 위기", "정책 집행 누수", "급히 확대한 정책망에서 행정 비용과 누수가 늘었습니다.", { treasury: -9, consumption: -2, approval: -3 }, "돈을 쓰는 것과 효과가 도착하는 것은 다른 문제입니다."),
    ev("시장 붕괴", "소비자 감소", "구매력을 잃은 시민이 늘며 내수 시장이 급격히 작아졌습니다.", { consumption: -10, capital: -10, employment: -4 }, "기업을 살리는 것은 결국 구매하는 시민입니다."),
    ev("시장 붕괴", "플랫폼 매출 급락", "자동화 플랫폼 기업의 국내 매출이 소비 부진으로 꺾였습니다.", { capital: -12, treasury: -5, employment: -3 }, "자동화 기업도 소비자가 없으면 성장할 수 없습니다."),
    ev("시장 붕괴", "재고 과잉", "생산은 늘었지만 구매자가 줄어 재고가 쌓였습니다.", { capital: -9, employment: -5, consumption: -5 }, "생산성의 승리가 판매의 실패로 바뀌었습니다."),
    ev("시장 붕괴", "내수 신용 경색", "은행이 소비자와 중소기업 대출을 동시에 줄였습니다.", { consumption: -8, capital: -8, approval: -4 }, "돈의 흐름이 막히면 정책 효과도 둔해집니다."),
    ev("시장 붕괴", "기업 매출 경보", "국내 소비 지표가 악화되며 기업 실적 전망이 급락했습니다.", { capital: -11, treasury: -4, consumption: -6 }, "소비 붕괴는 자본 붕괴의 예고 신호입니다."),
    ev("시장 붕괴", "소상공인 연쇄 폐업", "내수 침체가 골목 경제를 무너뜨리기 시작했습니다.", { capital: -7, employment: -7, consumption: -7 }, "작은 폐업들이 모이면 국가 전체의 기반이 흔들립니다."),
    ev("사회 불안", "대규모 실업 시위", "실직자와 가족들이 도심에서 대규모 시위를 벌였습니다.", { approval: -12, capital: -4, consumption: -4 }, "사회 신뢰가 흔들리면 시장과 정책이 동시에 약해집니다."),
    ev("사회 불안", "기본소득 확대 요구", "시민단체가 생존 보장을 요구하며 전국 행동에 나섰습니다.", { approval: -7, treasury: -4, consumption: 2 }, "시민을 살리라는 압력은 재정 부담으로 돌아옵니다."),
    ev("사회 불안", "반자동화 파업", "노동조합이 자동화 중단과 고용 보장을 요구하며 파업했습니다.", { employment: -3, capital: -8, approval: -6 }, "자동화 속도와 사회적 합의가 정면으로 충돌했습니다."),
    ev("사회 불안", "도시 치안 비용 증가", "빈곤 지역의 불안이 커지며 치안과 긴급 지원 비용이 늘었습니다.", { treasury: -8, approval: -7, capital: -3 }, "지지율 하락은 재정 비용으로도 나타납니다."),
    ev("사회 불안", "정부 불신 확산", "정책이 어느 편도 만족시키지 못한다는 여론이 확산됐습니다.", { approval: -10, consumption: -3, capital: -3 }, "모순을 관리하지 못하면 신뢰가 먼저 무너집니다.")
  ];

  function phase(label, title, aiShock, conflict, fiscalPressure, decayPressure, jobReplacement, lagConsumption, automationBoom, capitalFlight, leakage, policyDrag, approvalSensitivity, consumptionThreshold, capitalCrash, taxEfficiency) {
    return {
      label,
      title,
      aiShock,
      conflict,
      fiscalPressure,
      decayPressure,
      jobReplacement,
      lagConsumption,
      automationBoom,
      capitalFlight,
      leakage,
      policyDrag,
      approvalSensitivity,
      consumptionThreshold,
      capitalCrash,
      taxEfficiency
    };
  }

  function ev(category, title, description, effects, notice) {
    return { category, title, description, effects, notice };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createInitialState() {
    return {
      elapsedDays: 0,
      scoreMonths: 0,
      metrics: {
        treasury: 74,
        consumption: 76,
        employment: 82,
        capital: 68,
        approval: 64
      },
      policies: {
        income: 38,
        tax: 34,
        jobs: 42,
        control: 28
      },
      history: [],
      lagEmployment: 82,
      ended: false,
      collapseCause: null,
      lastDelta: {},
      nextEventIn: 6.3
    };
  }

  function yearIndex(state) {
    return clamp(Math.floor(state.elapsedDays / 365), 0, 10);
  }

  function currentPhase(state) {
    return YEAR_TABLE[yearIndex(state)];
  }

  function normalizePolicies(policies) {
    return {
      income: clamp(Number(policies.income) || 0, 0, 100) / 100,
      tax: clamp(Number(policies.tax) || 0, 0, 100) / 100,
      jobs: clamp(Number(policies.jobs) || 0, 0, 100) / 100,
      control: clamp(Number(policies.control) || 0, 0, 100) / 100
    };
  }

  function getDateParts(elapsedDays) {
    const start = Date.UTC(2030, 0, 1);
    const date = new Date(start + Math.floor(elapsedDays) * 86400000);
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    };
  }

  function survivalParts(state) {
    const months = Math.floor(state.elapsedDays / 30.4375);
    return {
      years: Math.floor(months / 12),
      months: months % 12,
      totalMonths: months
    };
  }

  function formatNumber(value) {
    return Math.round(value);
  }

  function applyMetricDelta(state, delta) {
    const applied = {};
    METRICS.forEach((metric) => {
      const change = delta[metric.key] || 0;
      if (change !== 0) {
        state.metrics[metric.key] = clamp(state.metrics[metric.key] + change, 0, 100);
        applied[metric.key] = change;
      }
    });
    state.lastDelta = applied;
    updateCollapse(state);
    return applied;
  }

  function stepSimulation(state, realSeconds) {
    if (state.ended) return { delta: {}, phase: currentPhase(state) };

    const before = Object.assign({}, state.metrics);
    const gameDays = realSeconds * (365 / 15);
    state.elapsedDays += gameDays;
    state.scoreMonths = survivalParts(state).totalMonths;

    const p = normalizePolicies(state.policies);
    const phaseData = currentPhase(state);
    const years = state.elapsedDays / 365;
    const policyEfficiency = clamp(1 - years * 0.032 * phaseData.policyDrag, 0.34, 1);
    const stateTrust = clamp(state.metrics.approval / 100, 0.22, 1.12);
    const taxBase = clamp((state.metrics.capital * 0.62 + state.metrics.consumption * 0.38) / 100, 0.08, 1.05);
    const lowTreasuryStress = state.metrics.treasury < 30 ? (30 - state.metrics.treasury) / 30 : 0;
    const lowCapitalStress = state.metrics.capital < 38 ? (38 - state.metrics.capital) / 38 : 0;
    const lowConsumptionStress = state.metrics.consumption < 46 ? (46 - state.metrics.consumption) / 46 : 0;
    const dt = realSeconds;

    state.lagEmployment += (state.metrics.employment - state.lagEmployment) * clamp(dt * 0.12, 0, 0.35);

    const automationPressure = phaseData.aiShock * (1.18 - p.control * 0.58) * (1 + years * 0.03);
    const jobSupport = p.jobs * 3.2 * policyEfficiency * stateTrust;
    const incomeSupport = p.income * 2.65 * policyEfficiency * stateTrust;
    const controlBurden = Math.max(0, p.control - 0.46);
    const taxBurden = Math.max(0, p.tax - 0.42);
    const consumptionThreshold = phaseData.consumptionThreshold;
    const belowThreshold = Math.max(0, consumptionThreshold - state.metrics.consumption) / consumptionThreshold;

    const delta = {
      employment: (
        -1.18 * phaseData.jobReplacement * automationPressure
        + jobSupport
        - taxBurden * 1.32 * phaseData.conflict
        - lowCapitalStress * 0.82
        - phaseData.decayPressure * 0.45
      ) * dt,
      consumption: (
        -0.038 * phaseData.lagConsumption * Math.max(0, 78 - state.lagEmployment)
        + incomeSupport
        + p.jobs * 1.28 * policyEfficiency * stateTrust
        + p.control * 0.42 * (state.metrics.consumption < 58 ? 1 : -0.25)
        - lowTreasuryStress * 0.74
        - phaseData.decayPressure * 0.48
      ) * dt,
      capital: (
        0.62 * phaseData.automationBoom * (1 - years * 0.035)
        + (state.metrics.consumption - 50) * 0.026
        + p.income * 0.62 * policyEfficiency
        - p.tax * 1.18 * phaseData.capitalFlight
        - p.control * 1.04 * phaseData.capitalFlight
        - belowThreshold * 8.2 * phaseData.capitalCrash
        - lowConsumptionStress * 0.52
      ) * dt,
      treasury: (
        p.tax * 3.45 * phaseData.taxEfficiency * taxBase
        + state.metrics.capital * 0.006
        - p.income * 2.55 * phaseData.leakage
        - p.jobs * 2.20 * phaseData.leakage
        - p.control * 0.72 * phaseData.fiscalPressure
        - lowConsumptionStress * 0.62 * phaseData.fiscalPressure
      ) * dt,
      approval: (
        (state.metrics.consumption - 56) * 0.035 * phaseData.approvalSensitivity
        + p.income * 1.12 * policyEfficiency
        + p.jobs * 0.82 * policyEfficiency
        + (0.42 - p.control) * 1.22
        - Math.max(0, p.control - 0.56) * 2.25 * phaseData.conflict
        - Math.max(0, p.tax - 0.64) * 0.82 * phaseData.conflict
        - lowTreasuryStress * 1.12
        - phaseData.decayPressure * 0.54
      ) * dt
    };

    applyMetricDelta(state, delta);
    maybeRecordHistory(state);

    const actualDelta = {};
    METRICS.forEach((metric) => {
      actualDelta[metric.key] = state.metrics[metric.key] - before[metric.key];
    });
    state.lastDelta = actualDelta;
    updateCollapse(state);

    return { delta: actualDelta, phase: phaseData };
  }

  function maybeRecordHistory(state) {
    const last = state.history[state.history.length - 1];
    const month = survivalParts(state).totalMonths;
    if (!last || last.month !== month || state.history.length < 2) {
      state.history.push({
        month,
        metrics: Object.assign({}, state.metrics)
      });
      if (state.history.length > 96) state.history.shift();
    } else {
      last.metrics = Object.assign({}, state.metrics);
    }
  }

  function updateCollapse(state) {
    if (state.ended) return;
    for (const metric of METRICS) {
      if (state.metrics[metric.key] <= 0) {
        state.metrics[metric.key] = 0;
        state.ended = true;
        state.collapseCause = metric.key;
        return;
      }
    }
  }

  function categoryWeight(category, state) {
    const p = normalizePolicies(state.policies);
    const m = state.metrics;
    const phaseData = currentPhase(state);
    if (category === "AI 대체") {
      return 1 + (1 - p.control) * 2.4 + phaseData.aiShock * 0.9 + Math.max(0, m.employment - 35) / 60;
    }
    if (category === "기업 반발") {
      return 0.65 + (p.tax + p.control) * 2.7 + phaseData.conflict * 0.8 + Math.max(0, 48 - m.capital) / 18;
    }
    if (category === "시민 빈곤") {
      return 0.75 + Math.max(0, 56 - m.consumption) / 12 + Math.max(0, 58 - m.employment) / 14;
    }
    if (category === "재정 위기") {
      return 0.75 + Math.max(0, 52 - m.treasury) / 13 + (p.income + p.jobs) * 1.6 + phaseData.fiscalPressure * 0.7;
    }
    if (category === "시장 붕괴") {
      return 0.65 + Math.max(0, 54 - m.consumption) / 11 + Math.max(0, 50 - m.capital) / 13;
    }
    if (category === "사회 불안") {
      return 0.65 + Math.max(0, 55 - m.approval) / 10 + Math.max(0, 50 - m.employment) / 12 + phaseData.approvalSensitivity * 0.35;
    }
    return 1;
  }

  function pickEvent(state, random) {
    const weighted = EVENTS.map((event) => {
      const phaseData = currentPhase(state);
      const lateShock = 1 + yearIndex(state) * 0.045;
      return {
        event,
        weight: categoryWeight(event.category, state) * lateShock * (event.category === "시장 붕괴" && state.metrics.consumption < phaseData.consumptionThreshold ? 1.8 : 1)
      };
    });
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let cursor = random() * total;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) return item.event;
    }
    return weighted[weighted.length - 1].event;
  }

  function scaleEventEffects(event, state) {
    const p = normalizePolicies(state.policies);
    const phaseData = currentPhase(state);
    const scale = 0.92 + yearIndex(state) * 0.052;
    const effects = {};
    Object.keys(event.effects).forEach((key) => {
      let value = event.effects[key] * scale;
      if (event.category === "AI 대체" && key === "employment") value *= 1 - p.control * 0.36;
      if (event.category === "AI 대체" && key === "capital") value *= 0.86 + (1 - p.control) * 0.22;
      if (event.category === "기업 반발") value *= 0.82 + (p.tax + p.control) * 0.45;
      if (event.category === "재정 위기" && key === "treasury") value *= phaseData.leakage;
      if (event.category === "시장 붕괴" && key === "capital" && state.metrics.consumption < phaseData.consumptionThreshold) value *= 1.55;
      if (event.category === "사회 불안" && key === "approval") value *= phaseData.approvalSensitivity;
      effects[key] = value;
    });
    return effects;
  }

  function triggerEvent(state, random) {
    if (state.ended) return null;
    const event = pickEvent(state, random || Math.random);
    const before = Object.assign({}, state.metrics);
    const effects = scaleEventEffects(event, state);
    const applied = applyMetricDelta(state, effects);
    maybeRecordHistory(state);
    const display = {};
    METRICS.forEach((metric) => {
      const change = state.metrics[metric.key] - before[metric.key];
      if (Math.abs(change) >= 0.1) display[metric.key] = change;
    });
    state.lastDelta = display;
    state.nextEventIn = 5.5 + (random || Math.random)() * 2.5;
    return {
      event,
      effects: display,
      before,
      after: Object.assign({}, state.metrics)
    };
  }

  function pressureText(state) {
    const p = normalizePolicies(state.policies);
    const spend = p.income + p.jobs + p.control * 0.38;
    const revenue = p.tax * currentPhase(state).taxEfficiency;
    if (state.metrics.consumption < 26) return "내수 붕괴 위험";
    if (state.metrics.treasury < 25) return "재정 위기";
    if (state.metrics.capital < 25) return "자본 이탈 위험";
    if (state.metrics.approval < 25) return "사회 불안 위험";
    if (spend > revenue + 0.65) return "지출 압력 높음";
    if (revenue > spend + 0.5) return "기업 반발 높음";
    return "균형 상태";
  }

  root.NationSim = {
    METRICS,
    POLICIES,
    YEAR_TABLE,
    EVENTS,
    createInitialState,
    stepSimulation,
    triggerEvent,
    currentPhase,
    yearIndex,
    getDateParts,
    survivalParts,
    pressureText,
    formatNumber,
    clamp
  };

  if (typeof module !== "undefined") {
    module.exports = root.NationSim;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
