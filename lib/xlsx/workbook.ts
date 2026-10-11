import "server-only";
import { zip } from "./zip";

/**
 * Minimal .xlsx (Office Open XML) writer: one or more sheets with a bold frozen header row,
 * filters, sized columns, real date cells and clickable links. Opens in Excel, Google Sheets,
 * LibreOffice and Numbers.
 */

export type XlsxCell = string | number | null | undefined | { date: Date } | { link: string; text: string };

export interface XlsxColumn {
  header: string;
  /** Long free text (e.g. messages): fixed width, wrapped. */
  wrap?: boolean;
}

export interface XlsxSheet {
  name: string;
  columns: XlsxColumn[];
  rows: XlsxCell[][];
}

/** Dates are written as wall-clock time in this offset so the sheet shows IST, not UTC. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const EXCEL_EPOCH_DAYS = 25569; // 1970-01-01 as an Excel serial day

const STYLE = { body: 0, header: 1, date: 2, wrap: 3, link: 4 } as const;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="dd mmm yyyy, hh:mm"/></numFmts>
<fonts count="3">
<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFBF8F3"/><name val="Calibri"/><family val="2"/></font>
<font><u/><sz val="11"/><color rgb="FF1D4ED8"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF16110D"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "") // not allowed in XML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnName(index: number): string {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Excel sheet names: max 31 chars, no []:*?/\ and unique within the workbook. */
function sheetNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((raw) => {
    const base = raw.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 31) || "Sheet";
    let name = base;
    for (let i = 2; used.has(name.toLowerCase()); i++) name = `${base.slice(0, 28)} ${i}`;
    used.add(name.toLowerCase());
    return name;
  });
}

function cellXml(ref: string, cell: XlsxCell, wrap: boolean): string {
  if (cell === null || cell === undefined || cell === "") return "";
  if (typeof cell === "number") return Number.isFinite(cell) ? `<c r="${ref}" s="${STYLE.body}"><v>${cell}</v></c>` : "";
  if (typeof cell === "string") {
    return `<c r="${ref}" s="${wrap ? STYLE.wrap : STYLE.body}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
  }
  if ("date" in cell) {
    const serial = (cell.date.getTime() + IST_OFFSET_MS) / 86_400_000 + EXCEL_EPOCH_DAYS;
    return `<c r="${ref}" s="${STYLE.date}"><v>${serial}</v></c>`;
  }
  // HYPERLINK() caps the URL at 255 characters; longer links fall back to plain text.
  if (cell.link.length > 255 || !/^https?:\/\//i.test(cell.link)) return cellXml(ref, cell.link, wrap);
  const formula = `HYPERLINK("${cell.link.replace(/"/g, '""')}","${cell.text.replace(/"/g, '""')}")`;
  return `<c r="${ref}" s="${STYLE.link}" t="str"><f>${escapeXml(formula)}</f><v>${escapeXml(cell.text)}</v></c>`;
}

function displayLength(cell: XlsxCell): number {
  if (cell === null || cell === undefined) return 0;
  if (typeof cell === "number") return String(cell).length;
  if (typeof cell === "string") return Math.max(...cell.split("\n").map((line) => line.length));
  return "date" in cell ? 18 : cell.text.length;
}

function sheetXml(sheet: XlsxSheet): string {
  const widths = sheet.columns.map((col, c) => {
    if (col.wrap) return 60;
    const longest = Math.max(col.header.length, ...sheet.rows.map((row) => displayLength(row[c])));
    return Math.min(Math.max(longest + 2, 10), 48);
  });
  const lastCol = columnName(Math.max(sheet.columns.length - 1, 0));
  const lastRow = sheet.rows.length + 1;

  const header = `<row r="1" ht="22" customHeight="1">${sheet.columns
    .map((col, c) => `<c r="${columnName(c)}1" s="${STYLE.header}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(col.header)}</t></is></c>`)
    .join("")}</row>`;
  const body = sheet.rows
    .map((row, r) => `<row r="${r + 2}">${sheet.columns.map((col, c) => cellXml(`${columnName(c)}${r + 2}`, row[c], Boolean(col.wrap))).join("")}</row>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<dimension ref="A1:${lastCol}${lastRow}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${widths.map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>
<sheetData>${header}${body}</sheetData>
<autoFilter ref="A1:${lastCol}${lastRow}"/>
</worksheet>`;
}

export function buildXlsx(sheets: XlsxSheet[]): Buffer {
  const names = sheetNames(sheets.map((s) => s.name));
  const files: { name: string; content: string }[] = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((name, i) => `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>
<definedNames>${sheets
        .map((s, i) => `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${escapeXml(names[i].replace(/'/g, "''"))}'!$A$1:$${columnName(Math.max(s.columns.length - 1, 0))}$${s.rows.length + 1}</definedName>`)
        .join("")}</definedNames>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: "xl/styles.xml", content: STYLES_XML },
    ...sheets.map((sheet, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, content: sheetXml(sheet) })),
  ];
  return zip(files);
}
