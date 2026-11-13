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

const PAGES = [['/worksheet/', 'Worksheet Builder'], ['/trends/', 'PYQ Trends'], ['/problem/', 'Weekly Problem']];
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
  if (k.kind === 'grid' && q.options) return q.options.rows.map((r, i) => `${r} → ${q.options.cols.filter((_, j) => a[i][j]).join(', ')}`).join('; ');
  return '';
}
function typeName(q) {
  const k = kind(q);
  if (q.track === 'main') return k === 'sc' ? 'MCQ' : 'Numerical';
  if (q.qtype === 'MATCH' || k === 'grid') return 'Matching';
  if (q.passage_id) return 'Paragraph';
  return { sc: 'Single correct', mc: 'Multiple correct', num: 'Numerical' }[k] || q.qtype;
}
function srcText(q) {
  if (isRA(q)) return 'RA Plus · ' + (q.paper || '');
  if (isSC(q)) return 'Sri Chaitanya · ' + (q.source_ref || '').replace(/^SC /, '');
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

window.MMK = { sb, S, pro, esc, toast, typeset, chrome, boot, fetchAll, fetchIn, chapters, kvGet, kvSet,
  LET, kind, isRA, isSC, keyText, typeName, srcText, body, optLabel, hash, rng, shuffle };
})();
