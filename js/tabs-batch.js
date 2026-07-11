/* tabs-batch.js -- limited public batch prediction */
window.CNTBET = window.CNTBET || {};

async function batchPayloadBase() {
  const file = CNTBET.qs("#batchFile").files?.[0];
  if (file) {
    if (file.size > 1024 * 1024) throw new Error("文件不能超过 1 MB。");
    const suffix = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".csv", ".xlsx", ".xlsm"].includes(suffix)) throw new Error("仅支持 CSV、XLSX 或 XLSM 文件。");
    return { filename: file.name, content_base64: await CNTBET.fileToBase64(file) };
  }
  const text = CNTBET.qs("#batchText").value.trim();
  if (!text) throw new Error("请上传文件或粘贴 CSV。");
  if (new Blob([text]).size > 1024 * 1024) throw new Error("CSV 内容不能超过 1 MB。");
  return { filename: "pasted.csv", text };
}

CNTBET.runImportPreview = async function () {
  CNTBET.setStatus("正在预览");
  CNTBET.setMessage("", "");
  try {
    const data = await CNTBET.api("/api/import-preview", await batchPayloadBase());
    CNTBET.setStatus("预览完成", data.row_count + " 行");
    CNTBET.setMetrics({ row_count: data.row_count, column_count: data.columns.length });
    CNTBET.setResult(data, "已识别 " + data.columns.length + " 列", data.rows);
  } catch (err) {
    CNTBET.setStatus("预览失败");
    CNTBET.setMessage("error", err.message);
  }
};

CNTBET.runBatchPredict = async function () {
  CNTBET.setStatus("正在批量预测");
  CNTBET.setMessage("", "");
  try {
    const payload = await batchPayloadBase();
    payload.task = CNTBET.qs("#batchTask").value;
    payload.family = CNTBET.qs("#batchFamily").value;
    const data = await CNTBET.api("/api/batch-predict", payload);
    CNTBET.setStatus("批量预测完成", data.summary.prediction_rows + " 成功 / " + data.summary.error_rows + " 失败");
    CNTBET.setMetrics(data.summary);
    CNTBET.setResult(data, "报告已生成并开始下载", data.rows);
    if (data.download.content_base64) CNTBET.downloadBase64(data.download);
    if (data.errors?.length) CNTBET.setMessage("error", "有 " + data.errors.length + " 行需要检查。");
  } catch (err) {
    CNTBET.setStatus("批量预测失败");
    CNTBET.setMessage("error", err.message);
  }
};
