/* init.js -- Bootstrap and wire all event listeners */
window.CNTBET = window.CNTBET || {};

CNTBET.wireTabs = function () {
  CNTBET.qsa(".mode-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      CNTBET.qsa(".mode-tabs button").forEach((item) => item.classList.toggle("active", item === btn));
      CNTBET.qsa(".mode-panel").forEach((panel) => panel.classList.toggle("active", panel.id === "panel-" + btn.dataset.mode));
      CNTBET.qs("#workspaceTitle").textContent = CNTBET.MODE_TITLES[btn.dataset.mode] || "CNT-BET";
    });
  });
};

CNTBET.syncResistivityFamilyAvailability = function () {
  const select = CNTBET.qs("#resistivityFamily");
  const status = CNTBET.state.config?.model_status || {};
  let firstReady = "";
  Array.from(select.options).forEach((option) => {
    const item = status[option.value + "_resistivity"] || {};
    const ready = item.status === "ready";
    option.disabled = !ready;
    option.title = ready ? "" : "该模型暂不可用于定量预测";
    if (!ready && !option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
    if (ready && option.dataset.baseLabel) option.textContent = option.dataset.baseLabel;
    if (!ready) option.textContent = (option.dataset.baseLabel || option.textContent).replace(/（不可用）$/, "") + "（不可用）";
    if (ready && !firstReady) firstReady = option.value;
  });
  if (select.selectedOptions[0]?.disabled && firstReady) {
    select.value = firstReady;
  }
};

function bindAction(selector, action) {
  const button = CNTBET.qs(selector);
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    try { await action(); } finally { button.disabled = false; }
  });
}

(async function init() {
  CNTBET.qs("#clearBatchFile").addEventListener("click", () => { CNTBET.qs("#batchFile").value = ""; });
  CNTBET.wireTabs();
  CNTBET.renderFields("#predictFields", "mwcnt");
  CNTBET.renderFields("#resistivityFields", "resistivity");
  CNTBET.renderTemRows([]);
  const edited = new Set();
  for (const selector of ["#predictFields", "#resistivityFields", "#temTable"]) {
    CNTBET.qs(selector).addEventListener("input", () => edited.add(selector), {once: true});
  }
  CNTBET.qs("#addTemRow").addEventListener("click", () => { edited.add("#temTable"); CNTBET.appendTemRow(); });
  bindAction("#quickRun", CNTBET.runQuick);
  bindAction("#predictRun", CNTBET.runPredict);
  bindAction("#explainRun", CNTBET.runExplain);
  bindAction("#whatIfRun", CNTBET.runWhatIf);
  bindAction("#resistivityRun", CNTBET.runResistivity);
  CNTBET.qs("#batchClipboard").addEventListener("click", CNTBET.readBatchClipboard);
  bindAction("#batchPreviewRun", CNTBET.runImportPreview);
  bindAction("#batchPredictRun", CNTBET.runBatchPredict);
  bindAction("#inverseRun", CNTBET.runInverse);
  CNTBET.qs("#predictFamily").addEventListener("change", (event) => CNTBET.renderFields("#predictFields", event.target.value));
  CNTBET.qs("#inverseFamily").addEventListener("change", (event) => {
    CNTBET.qs("#targetBet").value = event.target.value === "swcnt" ? 800 : 220;
  });
  try {
    CNTBET.state.config = await CNTBET.api("/api/config");
    CNTBET.qs(".service-state")?.classList.add("online");
    CNTBET.qs("#serviceText").textContent = "API 在线";
    CNTBET.qs("#version").textContent = "v" + CNTBET.state.config.version;
    CNTBET.renderModelStatus();
    CNTBET.syncResistivityFamilyAvailability();
    if (!edited.has("#temTable")) CNTBET.renderTemRows(CNTBET.state.config.default_quick_rows);
    if (!edited.has("#predictFields")) CNTBET.renderFields("#predictFields", CNTBET.qs("#predictFamily").value);
    if (!edited.has("#resistivityFields")) CNTBET.renderFields("#resistivityFields", "resistivity");
  } catch (err) {
    CNTBET.setStatus("服务不可用");
    CNTBET.setMessage("error", err.message);
    CNTBET.qs(".service-state")?.classList.add("offline");
    CNTBET.qs("#serviceText").textContent = "API 离线";
  }
})();
