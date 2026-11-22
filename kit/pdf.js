/* Mathemission Teach · PDF downloads (22 Nov 2026).
   One branded A4 document per download, made with the browser's print window ("Save as PDF"), so text and maths stay sharp.
   Free plan: 3 PDFs a calendar month (IST), counted per document: downloading the same document again that month is free.
   Teach Pro / admin: unlimited. Count lives in user_kv `teach_pdf_quota` = { m: 'YYYY-MM', keys: [...] } (and on this device).
   Used by the standalone pages (kit.js) and by the main app (src/teach.js loads this file).
   window.MMPDF.make({ sb, user, pro, key, title, sub, filename, orient, html, css, onPro, toast }) → true when printed. */
(() => {
'use strict';
if (window.MMPDF) return;
const FREE = 3;
const KV = 'teach_pdf_quota';
const LS = 'mmk.' + KV;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const month = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7);
const monthName = () => new Date().toLocaleDateString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });
const nextMonthName = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString('en-IN', { month: 'long' }); };
const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

/* ---------- monthly count ---------- */
function clean(v) { const m = month(); return v && v.m === m && Array.isArray(v.keys) ? { m, keys: v.keys.slice(0, 50) } : { m, keys: [] }; }
async function readQuota(o) {
  let local = null; try { local = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) {}
  let acct = null;
  if (o.sb && o.user) try { const { data } = await o.sb.from('user_kv').select('value').eq('user_id', o.user.id).eq('key', KV).maybeSingle(); acct = data && data.value; } catch (e) {}
  const a = clean(acct), b = clean(local);
  return { m: a.m, keys: [...new Set([...a.keys, ...b.keys])] };
}
async function writeQuota(o, q) {
  try { localStorage.setItem(LS, JSON.stringify(q)); } catch (e) {}
  if (o.sb && o.user) try { await o.sb.from('user_kv').upsert({ user_id: o.user.id, key: KV, value: q, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' }); } catch (e) {}
}
/* How many free PDFs are left this month (Infinity on Pro). */
async function left(o) { if (o.pro) return Infinity; const q = await readQuota(o); return Math.max(0, FREE - q.keys.length); }

/* ---------- styles ---------- */
const CSS = `
#mmpdf{position:absolute;left:-12000px;top:0;width:186mm;background:#fff;color:#0b1a3d;font:10pt/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:left}
html.mmpdf-land #mmpdf{width:273mm}
#mmpdf *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
#mmpdf .pm{display:flex;align-items:center;gap:4mm;background:#0b1a3d;color:#fff;border-radius:2.5mm;padding:3.2mm 4.5mm;border-bottom:1.2mm solid #f5c542;margin-bottom:4mm}
#mmpdf .pm img{width:11mm;height:11mm;border-radius:2mm;background:#1e2f5e;flex:none}
#mmpdf .pm .bn{flex:1;min-width:0}
#mmpdf .pm .bn b{display:block;font:900 14pt/1.1 Inter,system-ui,sans-serif;letter-spacing:.12em}
#mmpdf .pm .bn small{display:block;font:700 8pt/1.3 Inter,system-ui,sans-serif;color:#7fe3f5;letter-spacing:.02em;margin-top:.6mm}
#mmpdf .pm .dl{text-align:right;font:700 7.6pt/1.35 Inter,system-ui,sans-serif;color:#c9d6f5}
#mmpdf .pm .dl b{display:block;color:#f5c542;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:7pt}
#mmpdf h1.pt{font:800 17pt/1.2 Inter,system-ui,sans-serif;color:#0b1a3d;margin:0 0 1mm}
#mmpdf .ps{color:#4a5a85;font-size:9.4pt;margin:0 0 4mm}
#mmpdf .lb{font:800 7.2pt Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#1d64d8;margin:3.5mm 0 1mm}
#mmpdf .bx{border:1px solid #cfd8ee;border-radius:2mm;padding:2.6mm 3.4mm;margin:0 0 3mm;break-inside:avoid}
#mmpdf .bx.key{border-color:#0891b2;background:#ecfbff}
#mmpdf .bx.warn{border-color:#e0b43a;background:#fff8e6;color:#4a3800}
#mmpdf .muted{color:#5b6a92}
#mmpdf p{margin:0 0 1.6mm}
#mmpdf ol,#mmpdf ul{padding-left:6mm;margin:1mm 0}
#mmpdf table{border-collapse:collapse}
#mmpdf img{max-width:100%}
#mmpdf mjx-container{max-width:100%}
#mmpdf mjx-container[display="true"]{margin:.4em 0!important}
#mmpdf .pend{margin-top:6mm;padding-top:2.4mm;border-top:1.4px solid #0b1a3d;display:flex;justify-content:space-between;gap:4mm;font:700 8pt Inter,system-ui,sans-serif;color:#0b1a3d}
#mmpdf .pend span:last-child{color:#5b6a92;font-weight:600}
@media print{
  html.mmpdf,html.mmpdf body{background:#fff!important;height:auto!important;min-height:0!important;overflow:visible!important;display:block!important}
  html.mmpdf body>*:not(#mmpdf){display:none!important}
  html.mmpdf #mmpdf{position:static;left:auto;width:auto}
}
.mmpdf-lim{position:fixed;inset:0;z-index:2147483000;background:#020617b3;display:grid;place-items:center;padding:16px;font:15px/1.55 Inter,system-ui,sans-serif}
.mmpdf-lim>div{max-width:420px;width:100%;background:#0d1630;color:#eaf1ff;border:1px solid #f5c54266;border-radius:14px;padding:18px 18px 14px;box-shadow:0 20px 50px #0009}
.mmpdf-lim h3{margin:0 0 6px;font-size:18px;color:#f5c542}
.mmpdf-lim p{margin:0 0 10px;color:#c9d6f5;font-size:14px}
.mmpdf-lim .r{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.mmpdf-lim button{font:600 14px Inter,system-ui,sans-serif;border-radius:10px;padding:9px 14px;cursor:pointer;border:1px solid #1d2a52;background:transparent;color:#eaf1ff}
.mmpdf-lim button.g{background:#f5c542;color:#1a1300;border-color:#f5c542}`;
function addCss() {
  if (document.getElementById('mmpdf-css')) return;
  const s = document.createElement('style'); s.id = 'mmpdf-css'; s.textContent = CSS; document.head.appendChild(s);
}
const cssStr = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"';
function pageCss(o) {
  return `@media print{@page{size:A4 ${o.orient === 'landscape' ? 'landscape' : 'portrait'};margin:11mm 11mm 13mm;
    @top-left{content:"MATHEMISSION TEACH";font:800 7.5pt Inter,sans-serif;letter-spacing:.14em;color:#0b1a3d}
    @top-right{content:${cssStr(o.title)};font:600 7.5pt Inter,sans-serif;color:#5b6a92}
    @bottom-left{content:"Downloaded from Mathemission Teach  ·  teach.mathemission.in  ·  AK · Stay Mathactive";font:700 7.5pt Inter,sans-serif;color:#0b1a3d}
    @bottom-right{content:"Page " counter(page) " of " counter(pages);font:600 7.5pt Inter,sans-serif;color:#5b6a92}}
  @page:first{@top-left{content:none}@top-right{content:none}}}`;
}

/* ---------- the limit box ---------- */
function limitBox(o) {
  addCss();
  document.querySelector('.mmpdf-lim')?.remove();
  const el = document.createElement('div'); el.className = 'mmpdf-lim';
  el.innerHTML = `<div role="dialog" aria-modal="true"><h3>You’ve used your ${FREE} free PDFs for ${esc(monthName())}</h3>
    <p>The Free plan includes ${FREE} PDF downloads a month (PYQ Trends, Weekly Problem, notes and Weekly Notes). A PDF you already downloaded this month downloads again for free.</p>
    <p>New downloads open on 1 ${esc(nextMonthName())}. <b>Teach Pro</b> gives unlimited PDFs and the Excel download of PYQ Trends.</p>
    <div class="r"><button class="g" data-pro>Try Teach Pro free</button><button data-x>Close</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('[data-x]').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  el.querySelector('[data-pro]').onclick = () => {
    el.remove();
    if (o.onPro) return o.onPro();
    try { (window.top || window).location.href = '/?go=pdf'; } catch (e) { location.href = '/?go=pdf'; }
  };
}

/* ---------- make one PDF ---------- */
async function waitMath(el) {
  if (!/\$|\\\(|\\\[/.test(el.textContent)) return;
  for (let i = 0; i < 100 && !(window.MathJax && MathJax.typesetPromise); i++) await new Promise(r => setTimeout(r, 100));
  if (window.MathJax && MathJax.typesetPromise) try { await MathJax.typesetPromise([el]); } catch (e) { console.warn(e); }
}
let busy = false;
async function make(o) {
  if (busy) return false;
  busy = true;
  try {
    addCss();
    let q = null, isNew = false;
    if (!o.pro) {
      q = await readQuota(o);
      isNew = !q.keys.includes(o.key);
      if (isNew && q.keys.length >= FREE) { limitBox(o); return false; }
    }
    document.getElementById('mmpdf')?.remove();
    const doc = document.createElement('div'); doc.id = 'mmpdf';
    doc.innerHTML = `${o.css ? `<style>${o.css}</style>` : ''}
      <header class="pm"><img src="/logo-m-96.png" alt=""><div class="bn"><b>MATHEMISSION TEACH</b><small>teach.mathemission.in · JEE maths for teachers</small></div>
        <div class="dl"><b>Downloaded from Mathemission Teach</b>${esc(today())}</div></header>
      <h1 class="pt">${esc(o.title)}</h1>${o.sub ? `<p class="ps">${o.sub}</p>` : ''}
      ${o.html}
      <div class="pend"><span>Downloaded from Mathemission Teach · teach.mathemission.in</span><span>AK · Stay Mathactive · mathemission.in</span></div>`;
    document.body.appendChild(doc);
    document.documentElement.classList.toggle('mmpdf-land', o.orient === 'landscape');
    let ps = document.getElementById('mmpdf-page'); if (!ps) { ps = document.createElement('style'); ps.id = 'mmpdf-page'; document.head.appendChild(ps); }
    ps.textContent = pageCss(o);
    await waitMath(doc);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all([...doc.querySelectorAll('img')].map(i => (i.complete ? null : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
    if (isNew) { q.keys.push(o.key); await writeQuota(o, q); }
    const oldTitle = document.title;
    document.title = String(o.filename || o.title).replace(/[\\/:*?"<>|]/g, '-') + ' · Mathemission Teach';
    document.documentElement.classList.add('mmpdf');
    const done = () => {
      window.removeEventListener('afterprint', done);
      setTimeout(() => { document.documentElement.classList.remove('mmpdf', 'mmpdf-land'); document.title = oldTitle; }, 1200);
    };
    window.addEventListener('afterprint', done);
    window.print();
    if (!o.pro && o.toast) {
      const n = FREE - q.keys.length;
      o.toast(isNew ? `PDF ready. ${n} free PDF${n === 1 ? '' : 's'} left this month.` : 'PDF ready (already counted this month).');
    }
    return true;
  } finally { busy = false; }
}

window.MMPDF = { make, left, FREE };
})();
