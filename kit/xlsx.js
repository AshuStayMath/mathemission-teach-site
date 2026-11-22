/* Mathemission Teach · tiny .xlsx writer (22 Nov 2026). No library: an uncompressed zip of the Office Open XML parts.
   window.MMXLSX.download(filename, sheets)
   sheet = { name, cols: [width, …], rows: [[cell, …], …], freeze: { r, c } }
   cell  = null | number | string | { v, s }   (s = style name below) */
(() => {
'use strict';
if (window.MMXLSX) return;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

/* styles: [name, fontId, fillId, numFmtId, align] */
const HEAT = ['FFFFFFFF', 'FFE3F6FD', 'FFC4ECFB', 'FF9EDFF7', 'FF6FCDF1', 'FF38B6E8'];
const FONTS = ['<font><sz val="10"/><name val="Calibri"/></font>',
  '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>',
  '<font><b/><sz val="10"/><color rgb="FF0E7490"/><name val="Calibri"/></font>',
  '<font><b/><sz val="15"/><color rgb="FF0B1A3D"/><name val="Calibri"/></font>',
  '<font><i/><sz val="9"/><color rgb="FF5B6A92"/><name val="Calibri"/></font>',
  '<font><b/><sz val="10"/><color rgb="FF0B1A3D"/><name val="Calibri"/></font>',
  '<font><b/><sz val="10"/><color rgb="FF15803D"/><name val="Calibri"/></font>',
  '<font><b/><sz val="10"/><color rgb="FFDC2626"/><name val="Calibri"/></font>'];
const FILLS = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>',
  '<fill><patternFill patternType="solid"><fgColor rgb="FF0B1A3D"/></patternFill></fill>',
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEEF3FC"/></patternFill></fill>',
  ...HEAT.map(c => `<fill><patternFill patternType="solid"><fgColor rgb="${c}"/></patternFill></fill>`)];
const ST = [
  ['', 0, 0, 0, ''], ['head', 1, 2, 0, 'center'], ['headL', 1, 2, 0, ''], ['group', 2, 3, 0, ''], ['title', 3, 0, 0, ''], ['note', 4, 0, 0, ''],
  ['bold', 5, 0, 0, ''], ['num1', 0, 0, 164, 'center'], ['bnum1', 5, 0, 164, 'center'], ['int', 0, 0, 1, 'center'], ['bint', 5, 0, 1, 'center'],
  ['up', 6, 0, 0, 'center'], ['down', 7, 0, 0, 'center'], ['flat', 4, 0, 0, 'center'],
  ...HEAT.map((_, i) => ['heat' + i, 0, 4 + i, 164, 'center'])];
const SID = Object.fromEntries(ST.map((s, i) => [s[0], i]));
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts>
<fonts count="${FONTS.length}">${FONTS.join('')}</fonts><fills count="${FILLS.length}">${FILLS.join('')}</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${ST.length}">${ST.map(([, f, fi, n, a]) => `<xf numFmtId="${n}" fontId="${f}" fillId="${fi}" borderId="0" xfId="0"${f ? ' applyFont="1"' : ''}${fi ? ' applyFill="1"' : ''}${n ? ' applyNumberFormat="1"' : ''}${a ? ` applyAlignment="1"><alignment horizontal="${a}"/></xf>` : '/>'}`).join('')}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

const colName = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
function sheetXml(sh) {
  const rows = sh.rows.map((r, ri) => `<row r="${ri + 1}">${r.map((c, ci) => {
    if (c === null || c === undefined || c === '') return '';
    const o = typeof c === 'object' ? c : { v: c };
    if (o.v === null || o.v === undefined || o.v === '') return o.s ? `<c r="${colName(ci)}${ri + 1}" s="${SID[o.s] || 0}"/>` : '';
    const s = o.s ? ` s="${SID[o.s] || 0}"` : '';
    return typeof o.v === 'number' && isFinite(o.v) ? `<c r="${colName(ci)}${ri + 1}"${s}><v>${o.v}</v></c>`
      : `<c r="${colName(ci)}${ri + 1}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(o.v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  const f = sh.freeze;
  const view = f ? `<sheetViews><sheetView workbookViewId="0"><pane${f.c ? ` xSplit="${f.c}"` : ''}${f.r ? ` ySplit="${f.r}"` : ''} topLeftCell="${colName(f.c || 0)}${(f.r || 0) + 1}" activePane="${f.r && f.c ? 'bottomRight' : f.r ? 'bottomLeft' : 'topRight'}" state="frozen"/></sheetView></sheetViews>` : '';
  const cols = sh.cols && sh.cols.length ? `<cols>${sh.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${view}${cols}<sheetData>${rows}</sheetData></worksheet>`;
}

/* ---------- zip (stored) ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let off = 0;
  const u16 = (a, v) => a.push(v & 255, (v >>> 8) & 255), u32 = (a, v) => a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255);
  for (const [name, text] of files) {
    const nb = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const h = []; u32(h, 0x04034b50); u16(h, 20); u16(h, 0x0800); u16(h, 0); u16(h, 0); u16(h, 0x21); u32(h, crc); u32(h, data.length); u32(h, data.length); u16(h, nb.length); u16(h, 0);
    parts.push(new Uint8Array(h), nb, data);
    const c = []; u32(c, 0x02014b50); u16(c, 20); u16(c, 20); u16(c, 0x0800); u16(c, 0); u16(c, 0); u16(c, 0x21); u32(c, crc); u32(c, data.length); u32(c, data.length); u16(c, nb.length); u16(c, 0); u16(c, 0); u16(c, 0); u16(c, 0); u32(c, 0); u32(c, off);
    central.push(new Uint8Array(c), nb);
    off += h.length + nb.length + data.length;
  }
  const cs = central.reduce((a, b) => a + b.length, 0);
  const e = []; u32(e, 0x06054b50); u16(e, 0); u16(e, 0); u16(e, files.length); u16(e, files.length); u32(e, cs); u32(e, off); u16(e, 0);
  return new Blob([...parts, ...central, new Uint8Array(e)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function build(sheets) {
  const names = sheets.map((s, i) => esc(String(s.name || 'Sheet' + (i + 1)).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)));
  return zip([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', STYLES],
    ...sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s)])
  ]);
}
function download(filename, sheets) {
  const blob = build(sheets), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = String(filename).replace(/[\\/:*?"<>|]/g, '-') + '.xlsx';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
window.MMXLSX = { build, download, HEAT_STEPS: HEAT.length };
})();
