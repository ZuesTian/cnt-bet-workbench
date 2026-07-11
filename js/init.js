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
    option.title = ready ? "" : (item.message || "该电阻率模型不可定量使用");
    if (!ready && !option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
    if (ready && option.dataset.baseLabel) option.textContent = option.dataset.baseLabel;
    if (!ready) option.textContent = (option.dataset.baseLabel || option.textContent).replace(/（不可用）$/, "") + "（不可用）";
    if (ready && !firstReady) firstReady = option.value;
  });
  if (select.selectedOptions[0]?.disabled && firstReady) {
    select.value = firstReady;
  }
};

(async function init() {
  try {
    CNTBET.state.config = await CNTBET.api("/api/config");
  } catch (err) {
    CNTBET.setStatus("服务不可用");
    CNTBET.setMessage("error", err.message);
    return;
  }
  CNTBET.qs("#version").textContent = "v" + CNTBET.state.config.version;
  CNTBET.renderModelStatus();
  CNTBET.syncResistivityFamilyAvailability();
  CNTBET.renderTemRows(CNTBET.state.config.default_quick_rows);
  CNTBET.renderFields("#predictFields", "mwcnt");
  CNTBET.renderFields("#resistivityFields", "resistivity");
  CNTBET.wireTabs();

  CNTBET.qs("#addTemRow").addEventListener("click", () => CNTBET.appendTemRow());
  CNTBET.qs("#quickRun").addEventListener("click", CNTBET.runQuick);
  CNTBET.qs("#predictRun").addEventListener("click", CNTBET.runPredict);
  CNTBET.qs("#explainRun").addEventListener("click", CNTBET.runExplain);
  CNTBET.qs("#whatIfRun").addEventListener("click", CNTBET.runWhatIf);
  CNTBET.qs("#resistivityRun").addEventListener("click", CNTBET.runResistivity);
  CNTBET.qs("#inverseRun").addEventListener("click", CNTBET.runInverse);
  CNTBET.qs("#predictFamily").addEventListener("change", (event) => CNTBET.renderFields("#predictFields", event.target.value));
  CNTBET.qs("#inverseFamily").addEventListener("change", (event) => {
    CNTBET.qs("#targetBet").value = event.target.value === "swcnt" ? 800 : 220;
  });
})();
