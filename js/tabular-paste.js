/* tabular-paste.js -- normalize clipboard tables to backend-compatible CSV */
(function exposeTabularPaste(root) {
  function parseRow(line, delimiter) {
    const cells = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === delimiter && !quoted) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += character;
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  function detectTable(text) {
    const lines = String(text).split(/\r?\n/).filter((line) => line.trim()).slice(0, 30);
    if (lines.length < 2) throw new Error("粘贴内容至少需要表头和一行数据。");
    const candidates = ["\t", ",", ";", "|"]
      .map((delimiter, priority) => {
        const rows = lines.map((line) => parseRow(line, delimiter));
        const widths = rows.map((row) => row.length);
        const width = Math.max(...widths);
        const consistent = widths.filter((value) => value === width).length;
        return { delimiter, priority, width, consistent, rows };
      })
      .filter((candidate) => candidate.width > 1)
      .sort((left, right) => right.consistent - left.consistent || right.width - left.width || left.priority - right.priority);
    if (!candidates.length) throw new Error("未识别到表格分隔符，请从 Excel 复制单元格区域或粘贴 CSV。");
    const selected = candidates[0];
    if (selected.consistent !== selected.rows.length) throw new Error("粘贴表格的列数不一致，请检查缺失单元格或引号。");
    return selected;
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function normalizePastedTable(value) {
    const text = String(value || "").trim();
    if (!text) throw new Error("请先粘贴 Excel 单元格或 CSV 数据。");
    const selected = detectTable(text);
    const rows = text.split(/\r?\n/).filter((line) => line.trim()).map((line) => parseRow(line, selected.delimiter));
    if (rows.some((row) => row.length !== selected.width)) throw new Error("粘贴表格的列数不一致，请检查缺失单元格或引号。");
    return {
      csv: rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      columnCount: selected.width,
      rowCount: rows.length - 1,
      delimiterLabel: { "\t": "Excel 制表符", ",": "逗号", ";": "分号", "|": "竖线" }[selected.delimiter],
    };
  }

  root.CNTBET = root.CNTBET || {};
  root.CNTBET.normalizePastedTable = normalizePastedTable;
  if (typeof module !== "undefined" && module.exports) module.exports = { normalizePastedTable };
})(typeof window === "undefined" ? globalThis : window);

