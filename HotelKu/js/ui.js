/* HotelKu - lapisan UI saja (animasi, pop up, interaksi sentuh).
   Tidak menyentuh Firebase / data / logika bisnis. */

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $q = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICON = {
  ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg>',
  err: '<svg viewBox="0 0 24 24"><path d="M12 7v6m0 3.5v.01" /><circle cx="12" cy="12" r="9"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6m0-9.5v.01" /><circle cx="12" cy="12" r="9"/></svg>',
  ask: '<svg viewBox="0 0 24 24"><path d="M9.5 9.2a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.4 1-1.4 2M12 17.4v.01" /><circle cx="12" cy="12" r="9"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 8.5v5m0 3v.01M10.3 4.6L3.5 17a2 2 0 0 0 1.7 3h13.6a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z"/></svg>'
};

/* ---------- Toast ---------- */
let toastBox;
export function toast(msg, type = "info", ms = 3400) {
  if (!toastBox) {
    toastBox = document.createElement("div");
    toastBox.className = "toast-stack noprint";
    toastBox.setAttribute("role", "status");
    toastBox.setAttribute("aria-live", "polite");
    document.body.appendChild(toastBox);
  }
  const t = document.createElement("div");
  t.className = `toast-item t-${type}`;
  t.innerHTML = `<span class="t-ic">${ICON[type === "success" ? "ok" : type === "error" ? "err" : "info"]}</span><span class="t-tx">${esc(msg)}</span><i class="t-bar" style="animation-duration:${ms}ms"></i>`;
  toastBox.appendChild(t);
  const close = () => { if (t._c) return; t._c = 1; t.classList.add("out"); setTimeout(() => t.remove(), 380); };
  t.addEventListener("click", close);
  setTimeout(close, ms);
}

/* ---------- Konfirmasi (pengganti confirm bawaan browser) ---------- */
export function uiConfirm(message, { title = "Konfirmasi", ok = "Ya, lanjutkan", cancel = "Batal", danger = false } = {}) {
  return new Promise(resolve => {
    const wrap = document.createElement("div");
    wrap.className = "modal-layer noprint";
    wrap.innerHTML = `<div class="modal-back"></div>
      <div class="modal-card ${danger ? "is-danger" : ""}" role="dialog" aria-modal="true" aria-labelledby="mt">
        <div class="modal-ic">${ICON[danger ? "warn" : "ask"]}</div>
        <h4 id="mt">${esc(title)}</h4>
        <p>${esc(message)}</p>
        <div class="modal-act"><button class="btn btn-ghost" data-v="0">${esc(cancel)}</button>
        <button class="btn ${danger ? "btn-danger-soft" : "btn-brass"}" data-v="1">${esc(ok)}</button></div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("modal-open");
    const prev = document.activeElement;
    let done = false;
    const end = v => {
      if (done) return; done = true;
      document.removeEventListener("keydown", key);
      wrap.classList.add("out");
      document.body.classList.remove("modal-open");
      setTimeout(() => { wrap.remove(); prev && prev.focus && prev.focus({ preventScroll: true }); }, 260);
      resolve(v);
    };
    const key = e => { if (e.key === "Escape") end(false); };
    document.addEventListener("keydown", key);
    wrap.querySelector(".modal-back").onclick = () => end(false);
    wrap.querySelectorAll("button").forEach(b => b.onclick = () => end(b.dataset.v === "1"));
    setTimeout(() => wrap.querySelector('[data-v="1"]').focus({ preventScroll: true }), 60);
  });
}

/* ---------- Skeleton loading ---------- */
export const skeleton = (n = 3) => Array.from({ length: n }, (_, i) =>
  `<div class="col-md-6 col-lg-4"><div class="room-card sk" style="--i:${i}"><div class="room-vis sk-b"></div><div class="room-body">
   <i class="sk-l w60"></i><i class="sk-l w90"></i><i class="sk-l w40"></i><i class="sk-l w100 h44"></i></div></div></div>`).join("");

/* ---------- Count up angka dashboard ---------- */
export function countUp(root = document) {
  root.querySelectorAll(".num").forEach(el => {
    const t = el.textContent, m = t.match(/[\d.]+/);
    if (!m || reduce) return;
    const target = parseInt(m[0].replace(/\./g, ""), 10);
    if (!isFinite(target) || target === 0) return;
    const pre = t.slice(0, m.index), post = t.slice(m.index + m[0].length), t0 = performance.now(), dur = 1100;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + Math.round(target * e).toLocaleString("id-ID") + post;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------- Confetti emas ---------- */
export function burst(x = innerWidth / 2, y = innerHeight / 3) {
  if (reduce) return;
  const c = document.createElement("canvas");
  c.className = "burst noprint";
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const g = c.getContext("2d"); g.scale(dpr, dpr);
  const cols = ["#e6c78c", "#c9a35f", "#f6e7c8", "#8fb5dc", "#f0a56a", "#ffffff"];
  const P = Array.from({ length: 90 }, () => {
    const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 9;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, w: 4 + Math.random() * 6, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.random() * cols.length | 0] };
  });
  let f = 0;
  (function tick() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    P.forEach(p => {
      p.vy += .28; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - f / 110);
      g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    });
    if (++f < 110) requestAnimationFrame(tick); else c.remove();
  })();
}

/* ---------- Debu emas melayang (canvas[data-dust]) ---------- */
function dust(cv) {
  const g = cv.getContext("2d"), host = cv.parentElement;
  let W = 0, H = 0, P = [], run = true;
  const size = () => {
    const r = host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, Math.max(18, W * H / 16000)));
    P = Array.from({ length: n }, () => mk(true));
  };
  const mk = init => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: .6 + Math.random() * 2.2, vy: .12 + Math.random() * .42, vx: (Math.random() - .5) * .18, ph: Math.random() * 6.28, sp: .008 + Math.random() * .02 });
  new ResizeObserver(size).observe(host); size();
  const draw = () => {
    if (!run) return;
    g.clearRect(0, 0, W, H);
    P.forEach((p, i) => {
      p.y -= p.vy; p.x += p.vx + Math.sin(p.ph) * .15; p.ph += p.sp;
      if (p.y < -10) P[i] = mk(false);
      const a = .35 + .45 * Math.sin(p.ph * 2.2);
      const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      gr.addColorStop(0, `rgba(255,232,178,${a})`); gr.addColorStop(.35, `rgba(230,199,140,${a * .5})`); gr.addColorStop(1, "rgba(230,199,140,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 5, 0, 6.283); g.fill();
    });
    requestAnimationFrame(draw);
  };
  if (reduce) { draw(); run = false; return; }
  document.addEventListener("visibilitychange", () => { const v = !document.hidden; if (v && !run) { run = true; draw(); } else run = v; });
  draw();
}

/* ---------- Init otomatis ---------- */
function init() {
  /* ripple saat disentuh */
  document.addEventListener("pointerdown", e => {
    const el = e.target.closest(".btn,.tabs button,.ripple,.room-card:not(.sk),.stat-card,.seg button");
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement("span");
    s.className = "rip";
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
    const glow = e.target.closest(".panel,.glass,.room-card,.stat-card");
    if (glow) { glow.classList.add("lit"); setTimeout(() => glow.classList.remove("lit"), 650); }
  }, { passive: true });

  /* cahaya mengikuti jari / kursor */
  let raf = 0;
  document.addEventListener("pointermove", e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const el = e.target.closest && e.target.closest(".panel,.glass,.room-card,.stat-card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  }, { passive: true });

  /* indikator tab geser */
  document.querySelectorAll(".tabs").forEach(tabs => {
    const ind = document.createElement("i"); ind.className = "tab-ind"; tabs.appendChild(ind);
    const place = () => {
      const on = tabs.querySelector("button.on"); if (!on) return;
      tabs.style.setProperty("--ix", on.offsetLeft + "px");
      tabs.style.setProperty("--iw", on.offsetWidth + "px");
      if (tabs.scrollWidth > tabs.clientWidth) on.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
    };
    new MutationObserver(place).observe(tabs, { attributes: true, subtree: true, attributeFilter: ["class"] });
    new ResizeObserver(place).observe(tabs);
    place(); document.fonts && document.fonts.ready.then(place);
  });

  /* label sel untuk tampilan kartu di HP */
  document.querySelectorAll("table.table-stack").forEach(tb => {
    const heads = [...tb.querySelectorAll("thead th")].map(h => h.textContent.trim());
    const lab = () => tb.querySelectorAll("tbody tr").forEach(tr => {
      const tds = [...tr.children];
      if (tds.length === 1) return tr.classList.add("empty-row");
      tds.forEach((td, i) => { if (heads[i]) td.setAttribute("data-label", heads[i]); });
    });
    new MutationObserver(lab).observe(tb.tBodies[0], { childList: true });
    lab();
  });

  /* pesan error bergetar */
  document.querySelectorAll(".msg-error").forEach(m => new MutationObserver(() => {
    if (!m.textContent) return;
    m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake");
  }).observe(m, { childList: true, characterData: true, subtree: true }));

  /* navbar berubah saat scroll */
  const sc = () => { const t = $q(".topbar"); t && t.classList.toggle("scrolled", scrollY > 8); };
  addEventListener("scroll", sc, { passive: true }); sc();

  document.querySelectorAll("canvas[data-dust]").forEach(dust);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
