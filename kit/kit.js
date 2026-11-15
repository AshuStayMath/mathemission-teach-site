/* Mathemission Teach · shared kit for the standalone pages (Worksheet Builder, PYQ Trends, Weekly Problem).
   Load after supabase-js; it sets up MathJax, the sign-in, the plan and small helpers. 12 Nov 2026. */
(() => {
'use strict';
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['\\[', '\\]'], ['$$', '$$']],
    processEnvironments: true,
    macros: {
      li: ['\\lim\\limits_{#1 \\to #2} #3', 3], integ: ['\\displaystyle\\int #1', 1],
      defint: ['\\displaystyle\\int_{#1}^{#2}#3', 3], Sum: ['\\displaystyle\\sum_{#1}^{#2}#3', 3],
      opop: ['\\left( #1 \\right)', 1], of: ['\\left( #1 \\right)', 1],
      clop: ['\\left[ #1 \\right)', 1], opcl: ['\\left( #1 \\right]', 1], clcl: ['\\left[ #1 \\right]', 1],
      curlybrace: ['\\{#1\\}', 1], curlyBrace: ['\\left\\{#1\\right\\}', 1],
      magn: ['\\left| {#1} \\right|', 1], conj: ['\\overline{#1}', 1], set: ['\\mathbb{#1}', 1],
      powset: ['\\mathcal{P}(#1)', 1], logb: ['\\log_{#1}#2', 2, 'e'], piby: ['\\dfrac{#1}{#2}', 2, '\\pi'],
      rsubp: ['{#1}_{#2}^{#3}', 3], mtx: ['\\begin{bmatrix}#1\\end{bmatrix}', 1], gif: ['\\left\\lfloor {#1} \\right\\rfloor', 1],
      signum: ['\\operatorname{sgn}\\left(#1\\right)', 1], pmtx: ['\\begin{pmatrix}#1\\end{pmatrix}', 1],
      ui: '\\hat{i}', uj: '\\hat{j}', uk: '\\hat{k}', dotp: '\\boldsymbol{\\cdot}', crtp: '\\boldsymbol{\\times}',
      pv: ['\\overrightarrow{#1}', 1], pvec: ['\\overrightarrow{#1}', 1], re: ['\\operatorname{Re}\\left(#1\\right)', 1],
      im: ['\\operatorname{Im}\\left(#1\\right)', 1], Deg: ['{#1}^{\\circ}', 1], gifdef: ['\\lfloor #1 \\rfloor', 1],
      dmt: ['\\begin{vmatrix}#1\\end{vmatrix}', 1], Perm: ['{}^{#1}\\!P_{#2}', 2], Comb: ['{}^{#1}C_{#2}', 2],
      symline: ['\\dfrac{#1}{#2}=\\dfrac{#3}{#4}=\\dfrac{#5}{#6}', 6], vecomp: ['{#1}\\hat{i}{#2}\\hat{j}{#3}\\hat{k}', 3]
    }
  },
  options: { skipHtmlTags: ['script', 'style', 'textarea'] },
  startup: { typeset: false }
};
const mj = document.createElement('script');
mj.defer = true; mj.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js';
document.head.appendChild(mj);

const SB_URL = 'https://utcydlppkmwwwrkqwhzk.supabase.co';
const SB_KEY = 'sb_publishable_SMYHoFtw8otE40zU9MU7rw_am0Czdrm';
const sb = window.supabase.createClient(SB_URL, SB_KEY);   // default storage key: shares the Teach sign-in on this site

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toast = msg => { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2400); };
let tq = Promise.resolve();
const typeset = el => (tq = tq.then(async () => {
  for (let i = 0; i < 80 && !(window.MathJax && MathJax.typesetPromise); i++) await new Promise(r => setTimeout(r, 100));
  if (!el || !el.isConnected || !MathJax.typesetPromise) return;
  try { MathJax.typesetClear && MathJax.typesetClear([el]); await MathJax.typesetPromise([el]); } catch (e) { console.warn(e); }
}));

const S = { user: null, plan: 'free', admin: false };
const pro = () => S.admin || S.plan === 'pro';

const PAGES = [['/my/', 'My Questions'], ['/worksheet/', 'Worksheet Builder'], ['/trends/', 'PYQ Trends'], ['/problem/', 'Weekly Problem']];
function chrome(sub) {
  const here = location.pathname.replace(/index\.html$/, '');
  document.getElementById('nav').innerHTML = PAGES.map(([h, t]) => `<a href="${h}" class="${here === h ? 'on' : ''}">${t}</a>`).join('');
  document.getElementById('sub').textContent = sub;
}

/* Signed-in teacher, plan and admin flag. Returns false (and shows a sign-in box) when signed out. */
async function boot(app, intro) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    app.innerHTML = `${intro}<div class="lock"><h3>Sign in first</h3><p>Open Mathemission Teach, sign in, then come back here.</p><a class="btn" href="/">Open Teach</a></div>`;
    return false;
  }
  S.user = session.user;
  const [plan, admin] = await Promise.all([
    sb.rpc('my_teach_plan').then(r => r.data, () => null),
    sb.rpc('is_admin').then(r => r.data === true, () => false)
  ]);
  S.plan = plan === 'pro' ? 'pro' : 'free';
  S.admin = !!admin;
  const pl = document.getElementById('plan');
  pl.textContent = S.admin ? 'Admin' : (S.plan === 'pro' ? 'Teach Pro' : 'Free plan');
  pl.className = 'plan' + (pro() ? ' pro' : '');
  return true;
}

/* All rows of a query, 1000 at a time (Supabase's page limit). build(q) adds filters. */
async function fetchAll(table, cols, build = q => q, onPage) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(sb.from(table).select(cols)).range(from, from + 999);
    if (error) throw error;
    out.push(...data); onPage && onPage(out.length);
    if (data.length < 1000) return out;
  }
}
/* Rows whose `col` is in `ids`, 150 ids per request. */
async function fetchIn(table, cols, col, ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 150) {
    const { data, error } = await sb.from(table).select(cols).in(col, ids.slice(i, i + 150));
    if (error) throw error;
    out.push(...data);
  }
  return out;
}

let chapCache = null;
const chapters = async () => chapCache || (chapCache = (await sb.from('chapters').select('id,track,slug,name,syllabus_order,grp,grp_order').order('syllabus_order')).data || []);

/* Per-account settings in user_kv (syncs across the teacher's devices); falls back to this device. */
async function kvGet(key, dflt) {
  try {
    const { data, error } = await sb.from('user_kv').select('value').eq('user_id', S.user.id).eq('key', key).maybeSingle();
    if (!error && data) return data.value;
  } catch (e) {}
  try { const v = localStorage.getItem('mmk.' + key); if (v) return JSON.parse(v); } catch (e) {}
  return dflt;
}
async function kvSet(key, value) {
  try { localStorage.setItem('mmk.' + key, JSON.stringify(value)); } catch (e) {}
  const { error } = await sb.from('user_kv').upsert({ user_id: S.user.id, key, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' });
  return !error;
}

/* ---------- questions ---------- */
const LET = ['A', 'B', 'C', 'D', 'E', 'F'];
const kind = q => q.answer_key && q.answer_key.kind;              // 'sc' | 'mc' | 'num' | 'grid'
const isRA = q => /^RA/.test(q.id);
const isSC = q => /^SC-/.test(q.id);                       // Sri Chaitanya GTA (institute)
const optLabel = (q, j) => (q.track === 'main' ? String(j + 1) : LET[j]);
const fmt = v => (Number.isInteger(v) ? String(v) : String(+(+v).toFixed(4)));
function keyText(q) {
  const k = q.answer_key || {}, a = k.ans;
  if (k.kind === 'sc') return `(${optLabel(q, a)})`;
  if (k.kind === 'mc') return a.map(i => `(${LET[i]})`).join(', ');
  if (k.kind === 'num') return k.keytxt || (Array.isArray(a) ? a.map(fmt).join(' or ') : fmt(a));
  if (k.kind === 'subj') return k.keytxt ? k.keytxt : '—';
  if (k.kind === 'grid' && q.options) return q.options.rows.map((r, i) => `${r} → ${q.options.cols.filter((_, j) => a[i][j]).join(', ')}`).join('; ');
  return '';
}
function typeName(q) {
  const k = kind(q);
  if (q.track === 'main') return k === 'sc' ? 'MCQ' : 'Numerical';
  if (k === 'subj') return 'Subjective';
  if (q.qtype === 'MATCH' || k === 'grid') return 'Matching';
  if (q.passage_id) return 'Paragraph';
  return { sc: 'Single correct', mc: 'Multiple correct', num: 'Numerical' }[k] || q.qtype;
}
function srcText(q) {
  if (q.my) return 'My question';
  if (isRA(q)) return 'RA Plus · ' + (q.paper || '');
  if (isSC(q)) return 'Sri Chaitanya · ' + (q.source_ref || '').replace(/^SC /, '');
  if (/^FJ-/.test(q.id)) return 'FIITJEE · ' + (q.source_ref || '').replace(/^FIITJEE /, '');
  if (/^NN-/.test(q.id)) return 'Narayana · ' + (q.source_ref || '').replace(/^Narayana /, '');
  if (q.track === 'main') return `JEE Main ${q.year}${q.paper ? ' · ' + q.paper : ''}`;
  return `JEE Advanced ${q.year}${q.paper ? ', Paper ' + q.paper : ''}`;
}
/* The question body: stem + options (or the matching grid). */
function body(q) {
  let h = q._pass ? `<div class="box small"><h3>Paragraph</h3>${q._pass}</div>` : '';
  h += `<div class="stem">${q.stem_html || ''}</div>`;
  const k = kind(q);
  if (k === 'grid' && q.options && q.options.rows) {
    h += `<div class="tw"><table><tr><th></th>${q.options.cols.map(c => `<th>${c}</th>`).join('')}</tr>${q.options.rows.map(r => `<tr><th>${r}</th>${q.options.cols.map(() => '<td></td>').join('')}</tr>`).join('')}</table></div>`;
  } else if (Array.isArray(q.options) && q.options.length) {
    h += `<ol class="opts" style="list-style:none;padding-left:4px">${q.options.map((o, j) => `<li>(${optLabel(q, j)}) ${typeof o === 'string' ? o : (o.html || '')}</li>`).join('')}</ol>`;
  }
  return h;
}
/* Simple stable hash (for weekly picks and shuffles). */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let x = hash(String(seed)) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function shuffle(arr, r = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- the teacher's own questions ("My Questions → Written by me"), user_kv teach_my_questions ---------- */
const MYQ_KEY = 'teach_my_questions';
/* LaTeX-in-text → HTML: blank line = new paragraph, newline = line break; maths stays for MathJax. */
function texToHtml(t) {
  return String(t || '').trim().split(/\n\s*\n/).map(p => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
}
async function myQuestions() { const all = await kvGet(MYQ_KEY, {}); return all && typeof all === 'object' ? all : {}; }
async function saveMyQuestions(all) { return kvSet(MYQ_KEY, all); }
/* One of my questions in the same shape as a bank question, so body()/keyText() and the worksheet can use it. */
function myToQ(r) {
  const kind = r.type === 'match' ? 'sc' : r.type === 'subj' ? 'subj' : r.type;
  let ans = r.ans;
  if (kind === 'num') ans = [parseFloat(String(r.ans).replace('−', '-'))];
  return {
    id: 'MY-' + r.id, my: true, track: r.track || 'adv', chapter_id: r.chapter_id || null, year: null, paper: null,
    qtype: { sc: 'SC', mc: 'MC', num: 'NUM', match: 'MATCH', subj: 'SUBJ' }[r.type] || 'SC', passage_id: null,
    stem_html: texToHtml(r.stem), options: ['sc', 'mc', 'match'].includes(r.type) ? (r.options || []).map(o => esc(o).replace(/\n/g, '<br>')) : null,
    answer_key: { kind, ans, keytxt: kind === 'num' ? String(r.ans) : kind === 'subj' ? (r.ans || '') : undefined },
    difficulty: r.difficulty || null, marks: r.marks || null, sol_html: r.solution ? texToHtml(r.solution) : '', source_ref: 'My question',
  };
}

/* A handwritten board (note "Board · …", ink in localStorage mm_ink under "note:<id>") as an SVG for paper: dark ink, no background. */
const INK_DARK = { '#eaf1ff': '#111827', '#22d3ee': '#0e7490', '#f5c542': '#b45309', '#ff6b6b': '#dc2626', '#4ade80': '#15803d' };
function boards() {
  try {
    const notes = JSON.parse(localStorage.getItem('mm_notes') || '{}'), ink = JSON.parse(localStorage.getItem('mm_ink') || '{}');
    return Object.entries(notes).filter(([id, n]) => !n.deleted && /^Board ·/.test(n.title || '') && ink['note:' + id] && !ink['note:' + id].deleted && (ink['note:' + id].s || []).length)
      .map(([id, n]) => ({ id, title: n.title, updated: n.updated || 0 })).sort((a, b) => b.updated - a.updated);
  } catch (e) { return []; }
}
function inkPaperSvg(noteId) {
  let e; try { e = JSON.parse(localStorage.getItem('mm_ink') || '{}')['note:' + noteId]; } catch (x) { e = null; }
  if (!e || !e.s || !e.s.length) return '';
  let x0 = Infinity, y0 = Infinity, x1 = 0, y1 = 0;
  for (const st of e.s) for (let i = 0; i < st.p.length; i += 3) { x0 = Math.min(x0, st.p[i]); x1 = Math.max(x1, st.p[i]); y0 = Math.min(y0, st.p[i + 1]); y1 = Math.max(y1, st.p[i + 1]); }
  const pad = 16; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(1000, x1 + pad); y1 += pad;
  const paths = e.s.map(st => {
    const p = st.p; let d = `M${p[0]} ${p[1]}`; if (p.length === 3) d += 'l0.1 0';
    for (let i = 3; i < p.length; i += 3) d += `L${p[i]} ${p[i + 1]}`;
    const avg = p.reduce((a, v, i) => (i % 3 === 2 ? a + v : a), 0) / (p.length / 3);
    const w = st.t === 'h' ? st.w * 4 : st.w * (0.45 + 1.1 * avg / 100);
    const col = st.t === 'h' ? (st.c === '#eaf1ff' ? '#facc15' : st.c) : (INK_DARK[st.c] || st.c);
    return `<path d="${d}" stroke="${esc(col)}" stroke-width="${w.toFixed(1)}"${st.t === 'h' ? ' stroke-opacity=".4"' : ''}/>`;
  }).join('');
  return `<svg class="inkpaper" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width:${Math.round((x1 - x0) / 10)}%">${paths}</svg>`;
}

window.MMK = { sb, S, pro, esc, toast, typeset, chrome, boot, fetchAll, fetchIn, chapters, kvGet, kvSet,
  LET, kind, isRA, isSC, keyText, texToHtml, boards, inkPaperSvg, myQuestions, saveMyQuestions, myToQ, typeName, srcText, body, optLabel, hash, rng, shuffle };
})();
