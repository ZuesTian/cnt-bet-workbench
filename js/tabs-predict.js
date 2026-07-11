/* tabs-predict.js -- BET prediction + explain + what-if tabs */
window.CNTBET = window.CNTBET || {};

function predictionSummary(data) {
  const row = data.rows?.[0] || {};
  if (data.family === "swcnt") {
    const model = data.model || {};
    const modelName = CNTBET.modelDisplayName(model.direct_model || "swcnt_process");
    return [
      "预测 BET：" + CNTBET.formatValue(row.BET_predicted) + " m²/g",
      "区间：[" + CNTBET.formatValue(row.BET_predicted_p05) + " , " + CNTBET.formatValue(row.BET_predicted_p95) + "]",
      "方法：" + CNTBET.displayValue(row.prediction_method || modelName, "prediction_method"),
      row.domain_status === "out_of_domain" ? "提示：输入超出训练域，结果仅供筛选" : "",
    ].filter(Boolean).join("\n");
  }
  const lines = [
    "预测 BET：" + CNTBET.formatValue(row.BET_predicted) + " m²/g",
    "区间：[" + CNTBET.formatValue(row.BET_predicted_p05) + " , " + CNTBET.formatValue(row.BET_predicted_p95) + "]",
    "物理基线：" + CNTBET.formatValue(row.bet_physics) + " m²/g",
    "修正系数：" + CNTBET.formatValue(row.q_correction),
  ];
  const linked = data.linked_resistivity || null;
  if (linked?.ok) {
    const rhoRow = linked.rows?.[0] || {};
    const metrics = linked.metrics || {};
    const unit = linked.unit || rhoRow.resistivity_unit || "mΩ·cm";
    lines.push(
      "",
      "联动粉末电阻率：" + CNTBET.formatValue(rhoRow.rho_recommended_mohm_cm ?? rhoRow.rho_recommended) + " " + unit,
      "可信度：" + CNTBET.displayValue(rhoRow.resistivity_prediction_confidence || "low", "resistivity_prediction_confidence")
    );
    if (metrics.rho_recommended_p05_mohm_cm !== undefined && metrics.rho_recommended_p95_mohm_cm !== undefined) {
      lines.push(
        "联动区间：[" + CNTBET.formatValue(metrics.rho_recommended_p05_mohm_cm) +
          " , " + CNTBET.formatValue(metrics.rho_recommended_p95_mohm_cm) + "] " + unit
      );
    }
  } else if (linked) {
    lines.push("", "联动粉末电阻率：不可用");
  }
  return lines.join("\n");
}

function modelCardSummary(card) {
  card = card || {};
  return [
    "模型：" + CNTBET.modelDisplayName(card.direct_model || card.selected_model || ""),
    "目标：" + (card.target || "") + " " + (card.target_unit || ""),
    "R2：" + CNTBET.formatValue(card.r2),
    "RMSE：" + CNTBET.formatValue(card.rmse),
    "训练样本数：" + CNTBET.formatValue(card.n_samples),
  ].join("\n");
}

CNTBET.runPredict = async function () {
  CNTBET.setStatus("预测中..."); CNTBET.setMessage("", "");
  try {
    const family = CNTBET.qs("#predictFamily").value;
    const sample = CNTBET.collectSample("#predictFields");
    if (CNTBET.showValidation(CNTBET.validateSample(family, sample, "bet"))) return;
    const data = await CNTBET.api("/api/predict", { family, sample });
    CNTBET.setStatus("BET预测完成", CNTBET.modelDisplayName(data.model?.direct_model || data.model?.selected_model || ""));
    CNTBET.setMetrics(data.metrics);
    CNTBET.setResult(data, predictionSummary(data), data.rows);
  } catch (err) {
    CNTBET.setStatus("BET预测失败"); CNTBET.setMessage("error", err.message);
  }
};

CNTBET.runExplain = async function () {
  CNTBET.setStatus("解释中..."); CNTBET.setMessage("", "");
  try {
    const family = CNTBET.qs("#predictFamily").value;
    const sample = CNTBET.collectSample("#predictFields");
    if (CNTBET.showValidation(CNTBET.validateSample(family, sample, "bet"))) return;
    const data = await CNTBET.api("/api/explain", { family, sample, top_n: 6 });
    CNTBET.setStatus("解释完成", family.toUpperCase());
    CNTBET.setMetrics(data.model_card || {});
    if (data.feature_importance?.length) {
      CNTBET.setResult(data, modelCardSummary(data.model_card), data.feature_importance);
      return;
    }
    const rows = [];
    (data.explanations || []).forEach((item) => {
      (item.main_factors || []).forEach((factor, idx) => {
        rows.push({
          sample_id: item.sample_id, rank: idx + 1,
          factor: factor.factor, log_q_delta: factor.log_q_delta,
          direction: factor.direction, value: factor.value, baseline: factor.baseline,
        });
      });
    });
    CNTBET.setResult(data, "", rows);
  } catch (err) {
    CNTBET.setStatus("解释失败"); CNTBET.setMessage("error", err.message);
  }
};

CNTBET.runWhatIf = async function () {
  CNTBET.setStatus("What-if 对比中..."); CNTBET.setMessage("", "");
  try {
    const family = CNTBET.qs("#predictFamily").value;
    const base = CNTBET.collectSample("#predictFields");
    if (CNTBET.showValidation(CNTBET.validateSample(family, base, "bet"))) return;
    const scenario = { ...base, sample_id: (base.sample_id || "sample") + "-what-if" };
    for (let i = 1; i <= 3; i += 1) {
      const key = CNTBET.qs("#whatIfKey" + i).value.trim();
      const raw = CNTBET.qs("#whatIfValue" + i).value.trim();
      if (!key || raw === "") continue;
      const parsed = Number(raw);
      scenario[key] = Number.isFinite(parsed) && raw !== "" ? parsed : raw;
    }
    const baseData = await CNTBET.api("/api/predict", { family, sample: base });
    const scenarioData = await CNTBET.api("/api/predict", { family, sample: scenario });
    const rows = [
      { scenario: "当前", ...(baseData.rows?.[0] || {}) },
      { scenario: "what-if", ...(scenarioData.rows?.[0] || {}) },
    ];
    CNTBET.setStatus("What-if 对比完成", family.toUpperCase());
    CNTBET.setMetrics({
      BET_predicted: scenarioData.metrics?.BET_predicted,
      BET_predicted_p05: scenarioData.metrics?.BET_predicted_p05,
      BET_predicted_p95: scenarioData.metrics?.BET_predicted_p95,
    });
    CNTBET.setResult(scenarioData, "", rows);
  } catch (err) {
    CNTBET.setStatus("What-if 对比失败"); CNTBET.setMessage("error", err.message);
  }
};
