/* ui.js -- DOM rendering and display helpers */
window.CNTBET = window.CNTBET || {};

CNTBET.escapeHtml = function (value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
};

CNTBET.formatValue = function (value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001) ? value.toExponential(4) : value.toPrecision(5);
  }
  return String(value ?? "");
};

CNTBET.formatPercent = function (value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return CNTBET.formatValue(value * 100) + "%";
};

CNTBET.DISPLAY_LABELS = {
  sample_id: "样品编号",
  cnt_type: "类型",
  bet_closed: "闭口 BET",
  bet_physics: "理论 BET（m²/g）",
  bet_actual: "实测 BET（m²/g）",
  q_other: "残差比 R",
  BET: "BET（m²/g）",
  BET_predicted: "预测 BET（m²/g）",
  BET_predicted_p05: "BET P05（m²/g）",
  BET_predicted_p95: "BET P95（m²/g）",
  BET_phi2: "BET·φ²",
  Compact: "压实密度（g/cm³）",
  compact_density_g_cm3: "压实密度（g/cm³）",
  q_correction: "修正系数",
  diagnosis: "诊断",
  diagnosis_basis: "诊断依据",
  model_r2: "模型 R2",
  model_rmse: "RMSE（m²/g）",
  model_samples: "训练样本数",
  phi: "体积分数",
  Purity: "纯度",
  impurity: "杂质分数",
  resistivity_unit: "单位",
  rho_recommended: "粉末电阻率（Ω·cm）",
  rho_junction: "接点模型（Ω·cm）",
  rho_data_driven: "数据驱动（Ω·cm）",
  rho_ema: "EMA（Ω·cm）",
  rho_tube: "管体项（Ω·cm）",
  rho_junction_detail: "接点项（Ω·cm）",
  rho_impurity_detail: "杂质项（Ω·cm）",
  rho_total_decomposed: "分解合计（Ω·cm）",
  rho_recommended_mohm_cm: "粉末电阻率（mΩ·cm）",
  rho_junction_mohm_cm: "接点模型（mΩ·cm）",
  rho_data_driven_mohm_cm: "数据驱动（mΩ·cm）",
  rho_ema_mohm_cm: "EMA（mΩ·cm）",
  rho_tube_mohm_cm: "管体项（mΩ·cm）",
  rho_junction_detail_mohm_cm: "接点项（mΩ·cm）",
  rho_impurity_detail_mohm_cm: "杂质项（mΩ·cm）",
  rho_total_decomposed_mohm_cm: "分解合计（mΩ·cm）",
  rho_recommended_p05_mohm_cm: "粉末电阻率 P05（mΩ·cm）",
  rho_recommended_p95_mohm_cm: "粉末电阻率 P95（mΩ·cm）",
  rho_interval_source: "电阻率区间来源",
  rho_estimate_source: "电阻率来源",
  resistivity_prediction_confidence: "电阻率可信度",
  resistivity_prediction_level: "电阻率等级",
  resistivity_validation_scope: "验证区间",
  bet_source: "BET 来源",
  factor2_coverage: "factor-2 覆盖",
  log10_mae: "log10 MAE",
  target_bet: "目标 BET",
  count: "推荐数",
  row_count: "数据行数",
  column_count: "字段数",
  prediction_rows: "成功行",
  error_rows: "失败行",
  generated_at: "生成时间",
};

CNTBET.DISPLAY_VALUES = {
  low: "低",
  medium: "中",
  high: "高",
  process_model: "工艺模型",
  process_physics_blend: "工艺 + 物理融合",
  quick_bet_physics: "快速估算理论 BET",
  BET_actual_input: "输入实测 BET",
  BET_predicted: "模型预测 BET",
  BET_predicted_p05_p95: "BET 预测区间 P05/P95",
  normal_range: "正常验证区间",
  high_tail: "高电阻率尾部",
  swcnt_process_bet: "SWCNT 工艺 BET 模型",
  ExtraTrees: "ExtraTrees 模型",
  "SWCNT process model (no physics baseline)": "SWCNT 工艺模型（无物理基线）",
};

CNTBET.displayValue = function (value, key) {
  if (typeof value === "number") return CNTBET.formatValue(value);
  const text = String(value ?? "");
  if (!text) return "";
  if (CNTBET.DISPLAY_VALUES[text]) return CNTBET.DISPLAY_VALUES[text];
  if (text.startsWith("SWCNT process model")) {
    return text
      .replace("SWCNT process model", "SWCNT 工艺模型")
      .replace("(no physics baseline)", "（无物理基线）")
      .replace(/\(/g, "（")
      .replace(/\)/g, "）")
      .replace(/, /g, "，")
      .replace(/R2/g, "R²");
  }
  if (key === "rho_interval_source" || key === "rho_estimate_source" || key === "bet_source") {
    return text.replace(/_/g, " ");
  }
  return text;
};

CNTBET.modelDisplayName = function (modelName) {
  return CNTBET.displayValue(modelName || "", "model");
};

CNTBET.labelForMetric = function (key) {
  return CNTBET.DISPLAY_LABELS[key] || key;
};

CNTBET.setStatus = function (text, detail) {
  CNTBET.qs("#statusText").textContent = text || "";
  CNTBET.qs("#pathLine").textContent = detail || "";
  const state = CNTBET.qs("#resultState");
  if (state) state.textContent = /失败|不可用/.test(text || "") ? "CHECK" : (/完成|成功/.test(text || "") ? "READY" : "WORKING");
};

CNTBET.setMessage = function (level, text) {
  CNTBET.qs("#messages").innerHTML = text
    ? '<div class="message ' + level + '">' + CNTBET.escapeHtml(text) + '</div>'
    : "";
};

CNTBET.setResult = function (data, summary, tableRows) {
  CNTBET.qs("#resultSummary").textContent = summary || "";
  CNTBET.renderTable(CNTBET.qs("#resultTable"), tableRows || []);
  const details = CNTBET.qs("#tableDetails");
  if (details) details.open = Boolean(tableRows?.length);
};

CNTBET.PRIMARY_METRICS = [
  ["BET_predicted", "预测 BET", "m²/g"],
  ["bet_physics", "理论 BET", "m²/g"],
  ["rho_recommended_mohm_cm", "粉末电阻率", "mΩ·cm"],
  ["target_bet", "目标 BET", "m²/g"],
  ["prediction_rows", "成功预测", "行"],
  ["row_count", "数据预览", "行"],
];

CNTBET.setPrimaryResult = function (metrics) {
  const match = CNTBET.PRIMARY_METRICS.find(([key]) => Number.isFinite(Number(metrics?.[key])));
  if (!match) return;
  const [key, label, unit] = match;
  const value = Number(metrics[key]);
  CNTBET.qs("#primaryLabel").textContent = label;
  CNTBET.qs("#primaryValue").textContent = Math.abs(value) >= 100 ? value.toFixed(1) : value.toPrecision(4);
  CNTBET.qs("#primaryUnit").textContent = unit;
  const confidence = metrics.resistivity_prediction_confidence
    ? "可信度 " + CNTBET.displayValue(metrics.resistivity_prediction_confidence, "resistivity_prediction_confidence")
    : "结果详情可在下方展开";
  CNTBET.qs("#primaryMeta").textContent = confidence;
};

CNTBET.setMetrics = function (metrics) {
  const entries = Object.entries(metrics || {}).filter(([, v]) => v !== undefined && v !== null && v !== "");
  CNTBET.setPrimaryResult(metrics || {});
  CNTBET.qs("#metricGrid").innerHTML = entries
    .map(([k, v]) => '<div class="metric"><span>' + CNTBET.labelForMetric(k) + '</span><strong>' + CNTBET.displayValue(v, k) + '</strong></div>')
    .join("");
};

CNTBET.renderTable = function (container, rows) {
  if (!rows || !rows.length) { container.innerHTML = ""; return; }
  const columns = Object.keys(rows[0]).slice(0, 18);
  container.innerHTML =
    "<table><thead><tr>" +
    columns.map((col) => "<th>" + CNTBET.escapeHtml(CNTBET.labelForMetric(col)) + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows.map((row) => "<tr>" + columns.map((col) => "<td>" + CNTBET.escapeHtml(CNTBET.displayValue(row[col] ?? "", col)) + "</td>").join("") + "</tr>").join("") +
    "</tbody></table>";
};

CNTBET.renderModelStatus = function () {
  const status = CNTBET.state.config?.model_status || {};
  const items = [status.mwcnt_bet, status.swcnt_bet, status.swcnt_resistivity, status.mwcnt_resistivity].filter(Boolean);
  CNTBET.qs("#modelStatus").innerHTML = items
    .map((item) => {
      const metricSource =
        item.metric_source === "direct_bet" ? "BET直接指标" :
        item.metric_source === "group_validation" ? "分组验证" :
        item.metric_source === "training" ? "训练指标" :
        (item.metric_source || "");
      const detail = [
        item.mae !== null && item.mae !== undefined
          ? "MAE=" + CNTBET.formatValue(item.mae) + (item.metric_units ? " " + item.metric_units : "")
          : "",
        item.rmse !== null && item.rmse !== undefined
          ? "RMSE=" + CNTBET.formatValue(item.rmse) + (item.metric_units ? " " + item.metric_units : "")
          : "",
        item.factor2_coverage !== null && item.factor2_coverage !== undefined ? "factor-2=" + CNTBET.formatPercent(item.factor2_coverage) : "",
        metricSource,
      ].filter(Boolean).join(" · ");
      const statusLabel = item.status === "ready" ? "可用" : (item.status === "unsupported" ? "暂不可用" : "受限");
      return '<div class="model-chip ' + CNTBET.escapeHtml(item.status) + '"><strong>' +
        CNTBET.escapeHtml(item.label) + '</strong><span>' +
        CNTBET.escapeHtml(statusLabel) + '</span><small>' +
        CNTBET.escapeHtml(detail) + '</small></div>';
    })
    .join("");
};
