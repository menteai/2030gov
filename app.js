(function () {
  "use strict";

  const sim = window.NationSim;
  const metricRoot = document.getElementById("metrics");
  const policyRoot = document.getElementById("policies");
  const canvas = document.getElementById("historyCanvas");
  const ctx = canvas.getContext("2d");
  const dateText = document.getElementById("dateText");
  const survivalText = document.getElementById("survivalText");
  const scoreText = document.getElementById("scoreText");
  const phaseText = document.getElementById("phaseText");
  const pressureText = document.getElementById("pressureText");
  const eventCard = document.getElementById("eventCard");
  const eventEffects = document.getElementById("eventEffects");
  const noticeText = document.getElementById("noticeText");
  const gameOver = document.getElementById("gameOver");
  const finalSurvival = document.getElementById("finalSurvival");
  const finalScore = document.getElementById("finalScore");
  const collapseCause = document.getElementById("collapseCause");

  let state = sim.createInitialState();
  let lastTime = performance.now();
  const heldDeltas = new Map();
  const metricEls = new Map();
  const policyEls = new Map();

  function createMetricViews() {
    metricRoot.innerHTML = "";
    sim.METRICS.forEach((metric) => {
      const item = document.createElement("article");
      item.className = "metric";
      item.style.setProperty("--metric-color", metric.color);
      item.innerHTML = [
        '<div class="metric-top">',
        '<span class="metric-name"></span>',
        '<span class="metric-meta">0 → 0</span>',
        "</div>",
        '<div class="metric-value-row">',
        '<strong class="metric-value">0</strong>',
        '<span class="delta"></span>',
        "</div>",
        '<div class="bar"><div class="bar-fill"></div></div>'
      ].join("");
      item.querySelector(".metric-name").textContent = metric.label;
      metricRoot.appendChild(item);
      metricEls.set(metric.key, {
        item,
        value: item.querySelector(".metric-value"),
        delta: item.querySelector(".delta"),
        fill: item.querySelector(".bar-fill"),
        meta: item.querySelector(".metric-meta")
      });
    });
  }

  function createPolicyViews() {
    policyRoot.innerHTML = "";
    sim.POLICIES.forEach((policy) => {
      const item = document.createElement("label");
      item.className = "policy";
      item.innerHTML = [
        '<div class="policy-top">',
        '<span class="policy-name"></span>',
        '<strong class="policy-value">0</strong>',
        "</div>",
        '<input type="range" min="0" max="100" step="1">',
        '<span class="policy-note"></span>'
      ].join("");
      item.querySelector(".policy-name").textContent = policy.label;
      item.querySelector(".policy-note").textContent = policy.note;
      const input = item.querySelector("input");
      const value = item.querySelector(".policy-value");
      input.value = state.policies[policy.key];
      value.textContent = state.policies[policy.key];
      input.addEventListener("input", () => {
        state.policies[policy.key] = Number(input.value);
        value.textContent = input.value;
        pressureText.textContent = sim.pressureText(state);
      });
      policyRoot.appendChild(item);
      policyEls.set(policy.key, { input, value });
    });
  }

  function formatDate(parts) {
    return parts.year + "년 " + pad(parts.month) + "월 " + pad(parts.day) + "일";
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateMetricViews(delta) {
    const now = performance.now();
    sim.METRICS.forEach((metric) => {
      const els = metricEls.get(metric.key);
      const value = sim.formatNumber(state.metrics[metric.key]);
      const held = heldDeltas.get(metric.key);
      const heldActive = held && held.until > now;
      if (held && !heldActive) heldDeltas.delete(metric.key);
      const change = heldActive ? held.change : (delta && delta[metric.key] ? delta[metric.key] : 0);
      els.value.textContent = value;
      els.fill.style.width = sim.clamp(value, 0, 100) + "%";
      if (Math.abs(change) >= 0.22) {
        const rounded = Math.round(change);
        const sign = rounded > 0 ? "+" : "";
        els.delta.textContent = (rounded > 0 ? "▲ " : "▼ ") + sign + rounded;
        els.delta.classList.toggle("up", rounded > 0);
        els.delta.classList.toggle("down", rounded < 0);
        els.delta.classList.add("show");
        els.meta.textContent = heldActive ? Math.round(held.before) + " → " + Math.round(held.after) : Math.round(value - change) + " → " + value;
        if (!heldActive || !held.flashed) {
          flashMetric(metric.key, change);
          if (heldActive) held.flashed = true;
        }
      } else {
        els.delta.classList.remove("show", "up", "down");
        els.meta.textContent = "현재 " + value;
      }
    });
  }

  function flashMetric(key, change) {
    const item = metricEls.get(key).item;
    item.classList.remove("flash-up", "flash-down", "shake");
    void item.offsetWidth;
    item.classList.add("shake", change > 0 ? "flash-up" : "flash-down");
  }

  function drawGraph() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width * dpr));
    const height = Math.max(150, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0d1012";
    ctx.fillRect(0, 0, width, height);

    const padX = 34 * dpr;
    const padY = 18 * dpr;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i <= 4; i += 1) {
      const y = padY + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();
    }

    const points = state.history.length > 1 ? state.history : [{ metrics: state.metrics }, { metrics: state.metrics }];
    sim.METRICS.forEach((metric) => {
      ctx.strokeStyle = metric.color;
      ctx.lineWidth = 2.4 * dpr;
      ctx.beginPath();
      points.forEach((point, index) => {
        const x = padX + (plotW * index) / Math.max(1, points.length - 1);
        const y = padY + plotH - (sim.clamp(point.metrics[metric.key], 0, 100) / 100) * plotH;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  function updateTimeViews() {
    const date = sim.getDateParts(state.elapsedDays);
    const survival = sim.survivalParts(state);
    const phase = sim.currentPhase(state);
    dateText.textContent = formatDate(date);
    survivalText.textContent = survival.years + "년 " + survival.months + "개월";
    scoreText.textContent = survival.totalMonths + "개월";
    phaseText.textContent = phase.label + " · " + phase.title;
    pressureText.textContent = sim.pressureText(state);
  }

  function renderEvent(result) {
    if (!result) return;
    eventCard.querySelector(".event-category").textContent = "[" + result.event.category + "]";
    eventCard.querySelector("h2").textContent = result.event.title;
    eventCard.querySelector("p").textContent = result.event.description;
    eventEffects.innerHTML = "";
    Object.keys(result.effects).forEach((key) => {
      const metric = sim.METRICS.find((item) => item.key === key);
      const change = Math.round(result.effects[key]);
      if (change === 0) return;
      heldDeltas.set(key, {
        change: result.effects[key],
        before: result.before[key],
        after: result.after[key],
        until: performance.now() + 1600,
        flashed: false
      });
      const pill = document.createElement("span");
      pill.className = "effect-pill " + (change > 0 ? "up" : "down");
      pill.textContent = metric.label + " " + (change > 0 ? "+" : "") + change;
      eventEffects.appendChild(pill);
    });
    noticeText.textContent = "알림: " + result.event.notice;
    eventCard.classList.remove("pop");
    void eventCard.offsetWidth;
    eventCard.classList.add("pop");
    updateMetricViews(result.effects);
  }

  function showGameOver() {
    const survival = sim.survivalParts(state);
    const metric = sim.METRICS.find((item) => item.key === state.collapseCause);
    finalSurvival.textContent = "존속 기간: " + survival.years + "년 " + survival.months + "개월";
    finalScore.textContent = "최종 점수: " + survival.totalMonths + "개월";
    collapseCause.textContent = "붕괴 원인: " + (metric ? metric.label : "알 수 없음");
    gameOver.hidden = false;
  }

  function restart() {
    state = sim.createInitialState();
    sim.stepSimulation(state, 0.01);
    gameOver.hidden = true;
    lastTime = performance.now();
    sim.POLICIES.forEach((policy) => {
      const els = policyEls.get(policy.key);
      els.input.value = state.policies[policy.key];
      els.value.textContent = state.policies[policy.key];
    });
    eventCard.querySelector(".event-category").textContent = "시뮬레이션 시작";
    eventCard.querySelector("h2").textContent = "정책 bar를 조절해 국가를 유지하십시오";
    eventCard.querySelector("p").textContent = "고용 붕괴는 먼저 오고, 소비 붕괴는 뒤늦게 따라옵니다.";
    eventEffects.innerHTML = "";
    noticeText.textContent = "알림: 국가가 2030년 01월 01일부터 실시간으로 운영됩니다.";
    updateMetricViews({});
    updateTimeViews();
    drawGraph();
  }

  function tick(now) {
    const dt = Math.min(0.12, (now - lastTime) / 1000);
    lastTime = now;
    if (!state.ended) {
      const result = sim.stepSimulation(state, dt);
      state.nextEventIn -= dt;
      if (state.nextEventIn <= 0) {
        renderEvent(sim.triggerEvent(state, Math.random));
      } else {
        updateMetricViews(result.delta);
      }
      updateTimeViews();
      drawGraph();
      if (state.ended) showGameOver();
    }
    requestAnimationFrame(tick);
  }

  createMetricViews();
  createPolicyViews();
  document.getElementById("restartButton").addEventListener("click", restart);
  document.getElementById("modalRestartButton").addEventListener("click", restart);
  restart();
  requestAnimationFrame(tick);
})();
