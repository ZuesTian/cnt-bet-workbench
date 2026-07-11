/* tabs-inverse.js -- Inverse design tab */
window.CNTBET = window.CNTBET || {};

function inverseSummary(rows) {
  if (!rows?.length) return "";
  return rows
    .slice(0, 10)
    .map((row) => row.rank + ". BET=" + CNTBET.formatValue(row.BET_predicted) +
      "  误差=" + CNTBET.formatValue(row.abs_error_to_target) + "  样品=" + row.sample_id)
    .join("\n");
}

CNTBET.runInverse = async function () {
  CNTBET.setStatus("搜索中..."); CNTBET.setMessage("", "");
  try {
    const family = CNTBET.qs("#inverseFamily").value;
    const data = await CNTBET.api("/api/inverse-design", {
      family,
      target_bet: Number(CNTBET.qs("#targetBet").value),
      n_candidates: Number(CNTBET.qs("#candidateCount").value),
      top_n: Number(CNTBET.qs("#recommendCount").value),
    });
    CNTBET.setStatus("反向设计完成", "target=" + data.target_bet);
    CNTBET.setMetrics({ target_bet: data.target_bet, count: data.rows.length });
    CNTBET.setResult(data, inverseSummary(data.rows), data.rows);
  } catch (err) {
    CNTBET.setStatus("反向设计失败"); CNTBET.setMessage("error", err.message);
  }
};
