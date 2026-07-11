/* fields.js -- Field definitions, rendering, collection, validation */
window.CNTBET = window.CNTBET || {};

CNTBET.FIELD_DEFS = {
  mwcnt: [
    ["sample_id", "样品编号", "text", "样品"],
    ["bet_actual", "实测 BET（可选）", "number", "结果参考"],
    ["diameter_mean_nm", "平均外径（nm）", "number", "结构/TEM"],
    ["diameter_std_nm", "外径标准差（nm）", "number", "结构/TEM"],
    ["wall_mean", "平均层数", "number", "结构/TEM"],
    ["wall_std", "层数标准差", "number", "结构/TEM"],
    ["length_mean_um", "平均长度（μm）", "number", "结构/TEM"],
    ["purity_pct", "纯度（%）", "number", "杂质/纯度"],
    ["fe_ppm", "Fe ppm", "number", "杂质/纯度"],
    ["co_ppm", "Co ppm", "number", "杂质/纯度"],
    ["ni_ppm", "Ni ppm", "number", "杂质/纯度"],
    ["compact_density_g_cm3", "压实密度（g/cm³，粉末电阻率用）", "number", "电阻率联动"],
    ["resistivity_ohm_cm", "粉末电阻率（mΩ·cm，可选）", "number", "电阻率"],
  ],
  swcnt: [
    ["sample_id", "批号", "text", "样品"],
    ["year", "年份", "number", "工艺"],
    ["catalyst", "催化剂来源", "text", "工艺"],
    ["model_type", "型号", "text", "工艺"],
    ["purity_pct", "纯度（%）", "number", "杂质/纯度"],
    ["ig_id", "IG/ID", "number", "结构/TEM"],
    ["ph", "pH", "number", "工艺"],
    ["moisture", "水分 ppm", "number", "工艺"],
    ["fe_ppm", "Fe ppm", "number", "杂质/纯度"],
    ["cu_ppm", "Cu ppm", "number", "杂质/纯度"],
    ["zn_ppm", "Zn ppm", "number", "杂质/纯度"],
    ["ni_ppm", "Ni ppm", "number", "杂质/纯度"],
    ["cr_ppm", "Cr ppm", "number", "杂质/纯度"],
    ["co_ppm", "Co ppm", "number", "杂质/纯度"],
    ["swcnt_ratio", "SWCNT 占比（0-1，可选）", "number", "结构/TEM"],
    ["dwcnt_ratio", "DWCNT 占比（0-1，可选）", "number", "结构/TEM"],
    ["diameter_mean_nm", "平均管径（nm，可选）", "number", "结构/TEM"],
  ],
  resistivity: [
    ["sample_id", "样品编号", "text", "样品"],
    ["bet", "BET（m²/g）", "number", "模型参数"],
    ["compact_density_g_cm3", "压实密度（g/cm³）", "number", "模型参数"],
    ["purity_pct", "纯度（%）", "number", "杂质/纯度"],
    ["fe_ppm", "Fe ppm", "number", "杂质/纯度"],
    ["ig_id", "IG/ID", "number", "结构/TEM"],
  ],
};

CNTBET.renderFields = function (containerId, family) {
  const defaults =
    family === "resistivity"
      ? CNTBET.state.config?.default_resistivity_sample || {}
      : (CNTBET.state.config?.default_samples || {})[family] || {};
  const groups = {};
  CNTBET.FIELD_DEFS[family].forEach(([key, label, type, group]) => {
    groups[group] = groups[group] || [];
    groups[group].push([key, label, type]);
  });
  CNTBET.qs(containerId).innerHTML = Object.entries(groups)
    .map(([group, fields]) => '<fieldset class="field-group"><legend>' + CNTBET.escapeHtml(group) +
      '</legend><div class="field-stack">' +
      fields.map(([key, label, type]) => {
        const value = defaults[key] ?? "";
        const step = type === "number" ? ' step="0.001"' : "";
        return '<label>' + CNTBET.escapeHtml(label) +
          '<input data-sample="' + key + '" type="' + type + '"' + step +
          ' value="' + CNTBET.escapeHtml(value) + '" /></label>';
      }).join("") +
      '</div></fieldset>')
    .join("");
};

CNTBET.collectSample = function (containerId) {
  const sample = {};
  CNTBET.qsa(containerId + " [data-sample]").forEach((input) => {
    if (input.type === "number") {
      const raw = input.value.trim();
      sample[input.dataset.sample] = raw === "" ? null : Number(raw);
    } else {
      sample[input.dataset.sample] = input.value;
    }
  });
  return sample;
};

CNTBET.validateSample = function (kind, sample, task) {
  task = task || "bet";
  const errors = [];
  const positive = (key, label, required = true) => {
    const value = sample[key];
    if (value === null || value === undefined || value === "") {
      if (required) errors.push(label + " 必须填写");
      return;
    }
    if (!Number.isFinite(Number(value)) || Number(value) <= 0) errors.push(label + " 必须大于 0");
  };
  const nonNegative = (key, label) => {
    const value = sample[key];
    if (value === null || value === undefined || value === "") return;
    if (!Number.isFinite(Number(value)) || Number(value) < 0) errors.push(label + " 不能为负数");
  };
  const pct = (key, label) => {
    const value = sample[key];
    if (value === null || value === undefined || value === "") return;
    if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) errors.push(label + " 必须在 0-100 之间");
  };
  if (task === "bet" && kind === "mwcnt") {
    positive("diameter_mean_nm", "平均外径"); positive("wall_mean", "平均层数");
    positive("compact_density_g_cm3", "压实密度", false);
    pct("purity_pct", "纯度");
    ["fe_ppm", "co_ppm", "ni_ppm"].forEach((key) => nonNegative(key, key));
  } else if (task === "bet" && kind === "swcnt") {
    pct("purity_pct", "纯度");
    ["swcnt_ratio", "dwcnt_ratio"].forEach((key) => {
      const value = sample[key];
      if (value !== null && value !== undefined && value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1)) {
        errors.push(key + " 必须在 0-1 之间");
      }
    });
    positive("diameter_mean_nm", "平均管径", false);
    ["fe_ppm", "cu_ppm", "zn_ppm", "ni_ppm", "cr_ppm", "co_ppm"].forEach((key) => nonNegative(key, key));
  } else if (task === "resistivity") {
    positive("bet", "BET"); positive("compact_density_g_cm3", "压实密度", false);
    pct("purity_pct", "纯度"); nonNegative("fe_ppm", "Fe ppm");
  }
  return errors;
};

CNTBET.showValidation = function (errors) {
  if (!errors.length) return false;
  CNTBET.setMessage("error", errors.join("\n"));
  CNTBET.setStatus("输入需要修正");
  return true;
};

/* ---- TEM table helpers ---- */

CNTBET.renderTemRows = function (rows) {
  const tbody = CNTBET.qs("#temTable tbody");
  tbody.innerHTML = "";
  (rows || []).forEach((row) => CNTBET.appendTemRow(row));
};

CNTBET.appendTemRow = function (row) {
  row = row || {};
  const tr = document.createElement("tr");
  const fieldDefs = [
    ["wall_count", row.wall_count ?? 8], ["count_ratio_pct", row.count_ratio_pct ?? 100],
    ["diameter_nm", row.diameter_nm ?? 10], ["length_um", row.length_um ?? 3],
  ];
  tr.innerHTML =
    fieldDefs.map(([key, value]) => '<td><input data-tem="' + key + '" type="number" step="0.1" value="' + CNTBET.escapeHtml(value) + '" /></td>').join("") +
    '<td><button type="button" class="row-remove">×</button></td>';
  tr.querySelector(".row-remove").addEventListener("click", () => tr.remove());
  CNTBET.qs("#temTable tbody").appendChild(tr);
};

CNTBET.collectTemRows = function () {
  return CNTBET.qsa("#temTable tbody tr").map((tr) => {
    const get = (key) => Number(tr.querySelector('[data-tem="' + key + '"]')?.value || 0);
    return {
      wall_count: get("wall_count"), count_ratio_pct: get("count_ratio_pct"),
      diameter_nm: get("diameter_nm"), length_um: get("length_um"),
      diameter_std_nm: 0, open_ratio_pct: 0,
    };
  });
};
