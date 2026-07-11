/* tabs-resistivity.js -- Powder resistivity prediction tab */
window.CNTBET = window.CNTBET || {};

function resistivitySummary(data) {
  const row = data.rows?.[0] || {};
  const unit = data.unit || row.resistivity_unit || "mΩ·cm";
  const family = (data.family || "").toUpperCase();
  return [
    "推荐粉末电阻率：" + CNTBET.formatValue(row.rho_recommended_mohm_cm ?? row.rho_recommended) + " " + unit,
    "可信度：" + CNTBET.displayValue(row.resistivity_prediction_confidence || "low", "resistivity_prediction_confidence"),
  ].join("\n");
}

CNTBET.runResistivity = async function () {
  CNTBET.setStatus("粉末电阻率预测中..."); CNTBET.setMessage("", "");
  try {
    const family = CNTBET.qs("#resistivityFamily").value;
    const sample = CNTBET.collectSample("#resistivityFields");
    if (CNTBET.showValidation(CNTBET.validateSample("resistivity", sample, "resistivity"))) return;
    const data = await CNTBET.api("/api/predict-resistivity", { family, sample });
    const kindLabels = { powder_resistivity: "粉末电阻率", resistivity: "电阻率" };
    const targetKind = kindLabels[data.model?.target_kind || "resistivity"] || (data.model?.target_kind || "resistivity").replace(/_/g, " ");
    CNTBET.qs("#workspaceTitle").textContent = "粉末电阻率预测 · " + targetKind;
    CNTBET.setStatus("粉末电阻率预测完成", ((data.family || family).toUpperCase() + " " + (data.unit || "")).trim());
    CNTBET.setMetrics(data.metrics);
    CNTBET.setResult(data, resistivitySummary(data), data.rows);
    if (data.model?.warning) CNTBET.setMessage("error", data.model.warning);
  } catch (err) {
    CNTBET.setStatus("粉末电阻率预测失败"); CNTBET.setMessage("error", err.message);
  }
};
