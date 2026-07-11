/* api.js -- HTTP communication with the CNT-BET backend */
window.CNTBET = window.CNTBET || {};

CNTBET.resolveApiBase = function () {
  return window.location.hostname === "zuestian.github.io"
    ? "https://47.236.76.214.nip.io"
    : "";
};

window.CNTBET_API_BASE = window.CNTBET_API_BASE ?? CNTBET.resolveApiBase();

CNTBET.api = async function (path, payload) {
  const options = payload
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    : {};
  const response = await fetch(`${window.CNTBET_API_BASE}${path}`, options);
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_err) {
    if (response.status === 413) throw new Error("请求内容过大。");
    if (response.status === 429) throw new Error("请求过于频繁，请稍后再试。");
    throw new Error("服务返回了无法识别的响应。");
  }
  if (!response.ok || !data.ok) throw new Error(data.error || "HTTP " + response.status);
  return data;
};

CNTBET.fileToBase64 = function (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

CNTBET.downloadBase64 = function (download) {
  if (!download?.content_base64) return;
  const binary = atob(download.content_base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const blob = new Blob([bytes], { type: download.mime_type || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = download.filename || "cnt-bet-results.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
