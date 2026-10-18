import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, uiConfirm, burst, countUp, skeleton } from "./ui.js";
export { toast, uiConfirm, burst, countUp, skeleton };

export const $ = id => document.getElementById(id);
export const rp = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
export const tgl = s => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
export const malam = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
export const kodeBooking = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `RSV-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
};
export const LOGO = `<svg class="logo-svg" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gLogo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d9a4"/><stop offset=".55" stop-color="#c9a35f"/><stop offset="1" stop-color="#9c7433"/></linearGradient></defs><g fill="none" stroke="url(#gLogo)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 45V27l9-8v26"/><path d="M27 45V15l7-8 7 8v30"/><path d="M46 45V28l6 4v13"/><path d="M6 55q26-16 52 0" stroke-width="2.6"/></g></svg>`;
export const STATUS = { pending: "secondary", dikonfirmasi: "info", checkin: "primary", selesai: "success", batal: "danger" };
export const stLabel = s => ({ pending: "Pending", dikonfirmasi: "Dikonfirmasi", checkin: "Check-in", selesai: "Selesai", batal: "Batal" }[s] || s);
export const badge = s => `<span class="badge text-bg-${STATUS[s]} badge-st">${stLabel(s)}</span>`;

export function shell(nama) {
  const ini = (nama || "?").trim().charAt(0).toUpperCase();
  $("nav").innerHTML = `<div class="topbar noprint"><div class="container py-2 d-flex justify-content-between align-items-center">
    <a class="brand" href="#">${LOGO}<span>HotelKu</span></a>
    <div class="d-flex align-items-center gap-2 gap-md-3"><span class="avatar" aria-hidden="true">${ini}</span><span class="small who">${nama || ""}</span>
    <button class="btn btn-sm btn-outline-light" id="btnOut">Keluar</button></div></div></div>`;
  $("btnOut").onclick = () => signOut(auth).then(() => location = "index.html");
}
export function footer() {
  $("foot").innerHTML = `<footer class="noprint"><div class="container">
    <div class="foot-mark">${LOGO}</div>
    <div><b>Dibangun oleh Kelompok 2</b></div>
    <div><b>Muhammad Haikal (240155201001) | Andre Al Hafid | Fastabiqul Khairat</b></div></div></footer>`;
}
export function guard(role, cb) {
  footer();
  onAuthStateChanged(auth, async u => {
    if (!u) return (location = "index.html");
    const s = await getDoc(doc(db, "users", u.uid));
    const me = s.exists() ? { id: u.uid, ...s.data() } : null;
    if (!me || me.role !== role) { await signOut(auth); return (location = "index.html"); }
    shell(me.nama); cb(me);
  });
}
export function showStruk(r) {
  const el = document.createElement("div");
  el.className = "struk-overlay";
  el.innerHTML = `<div class="struk" role="dialog" aria-modal="true">
    <div class="struk-head text-center">${LOGO}<h4 class="mb-0">HotelKu</h4><small>Struk Reservasi</small></div>
    <div class="kode">${r.kode}</div>
    <table>
      <tr><td>Nama tamu</td><td>${r.nama}</td></tr>
      <tr><td>Kamar</td><td>${r.noKamar} (${r.tipe})</td></tr>
      <tr><td>Check-in</td><td>${tgl(r.in)}</td></tr>
      <tr><td>Check-out</td><td>${tgl(r.out)}</td></tr>
      <tr><td>Jumlah malam</td><td>${r.malam}</td></tr>
      <tr><td>Jumlah tamu</td><td>${r.tamu}</td></tr>
      <tr><td>Harga per malam</td><td>${rp(r.harga)}</td></tr>
      <tr class="tot"><td><b>Total</b></td><td><b>${rp(r.total)}</b></td></tr>
      <tr><td>Status bayar</td><td><b class="${r.lunas ? "pay-ok" : "pay-wait"}">${r.lunas ? "LUNAS" : "BELUM DIBAYAR"}</b></td></tr>
    </table>
    <p class="small mt-3 mb-0 text-center">${r.lunas ? "Terima kasih atas pembayaran Anda." : "Tunjukkan struk ini dan bayar di kasir."}</p>
    <div class="d-flex gap-2 mt-3 noprint"><button class="btn btn-ink flex-fill" id="sp">Cetak</button><button class="btn btn-outline-secondary flex-fill" id="sc">Tutup</button></div>
  </div>`;
  document.body.appendChild(el); document.body.classList.add("ps");
  el.querySelector("#sp").onclick = () => window.print();
  const tutup = () => { el.classList.add("out"); document.body.classList.remove("ps"); setTimeout(() => el.remove(), 260); };
  el.querySelector("#sc").onclick = tutup;
  el.addEventListener("click", e => { if (e.target === el) tutup(); });
}
