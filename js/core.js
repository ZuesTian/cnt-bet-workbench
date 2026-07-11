/* core.js -- Global state, constants, DOM shortcuts */
window.CNTBET = window.CNTBET || {};

CNTBET.state = { config: null };

CNTBET.MODE_TITLES = {
  quick: "CNT快速估算",
  predict: "BET预测",
  resistivity: "粉末电阻率预测",
  batch: "批量预测",
  inverse: "反向设计",
};

CNTBET.qs = (sel) => document.querySelector(sel);
CNTBET.qsa = (sel) => Array.from(document.querySelectorAll(sel));
