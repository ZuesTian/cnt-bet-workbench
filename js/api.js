/* api.js -- HTTP communication with the CNT-BET backend */
window.CNTBET = window.CNTBET || {};

CNTBET.api = async function (path, payload) {
  const options = payload
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    : {};
  const response = await fetch(`${window.CNTBET_API_BASE}${path}`, options);
  const data = await response.json();
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
