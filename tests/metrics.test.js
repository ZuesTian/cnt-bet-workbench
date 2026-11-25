const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

test("metric labels and values preserve text punctuation", () => {
  const grid = {};
  const api = {qs: () => grid};
  const env = { window: {CNTBET:api}, CNTBET:api };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/ui.js"),"utf8"),env);
  api.setPrimaryResult = () => {};
  api.setMetrics({"A&B":"< 5 nm"});
  assert.match(grid.innerHTML,/A&amp;B/);
  assert.match(grid.innerHTML,/&lt; 5 nm/);
});
