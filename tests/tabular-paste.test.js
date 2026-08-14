const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizePastedTable } = require("../js/tabular-paste.js");

test("normalizes an Excel tab-separated clipboard block", () => {
  const result = normalizePastedTable("sample_id\tdiameter_mean_nm\twall_mean\tpurity_pct\nMW-001\t8\t6\t96");
  assert.equal(result.columnCount, 4);
  assert.equal(result.rowCount, 1);
  assert.equal(result.delimiterLabel, "Excel 制表符");
  assert.equal(result.csv, "sample_id,diameter_mean_nm,wall_mean,purity_pct\nMW-001,8,6,96");
});

test("preserves quoted commas while converting a tab-separated table", () => {
  const result = normalizePastedTable('sample_id\tnote\nMW-001\t"base, trial"');
  assert.equal(result.csv, 'sample_id,note\nMW-001,"base, trial"');
});

test("rejects a malformed one-column paste", () => {
  assert.throws(() => normalizePastedTable("sample_id\nMW-001"), /未识别到表格分隔符/);
});

