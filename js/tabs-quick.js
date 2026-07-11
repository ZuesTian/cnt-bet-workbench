/* tabs-quick.js -- TEM quick estimate tab */
window.CNTBET = window.CNTBET || {};

function quickSummary(data) {
  const lines = [data.summary || ""];
  const quick = data.quick_resistivity || null;
  if (quick?.ok) {
    const row = quick.rows?.[0] || {};
    const unit = quick.unit || row.resistivity_unit || "mΩ·cm";
    const details = [];
    if (!(data.summary || "").includes("快速粉末电阻率")) {
      details.unshift("快速粉末电阻率：" + CNTBET.formatValue(row.rho_recommended_mohm_cm ?? row.rho_recommended) + " " + unit);
    }
    details.push("可信度：" + CNTBET.displayValue(row.resistivity_prediction_confidence || "low", "resistivity_prediction_confidence"));
    lines.push("", ...details);
  }
  return lines.join("\n");
}

CNTBET.runQuick = async function () {
  CNTBET.setStatus("计算中..."); CNTBET.setMessage("", "");
  try {
    const rawActual = CNTBET.qs("#quickActual").value.trim();
    const data = await CNTBET.api("/api/quick-estimate", {
      purity_pct: Number(CNTBET.qs("#quickPurity").value),
      bet_actual: rawActual === "" ? null : Number(rawActual),
      compact_density_g_cm3: Number(CNTBET.qs("#quickCompactDensity").value),
      rows: CNTBET.collectTemRows(),
    });
    CNTBET.setStatus("快速估算完成");
    CNTBET.setMetrics(data.metrics);
    CNTBET.setResult(data, quickSummary(data), data.detail);
  } catch (err) {
    CNTBET.setStatus("快速估算失败"); CNTBET.setMessage("error", err.message);
  }
};
