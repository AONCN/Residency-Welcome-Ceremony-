// ---- Настройки ----
// URL веб-приложения Google Apps Script (см. apps-script/README.md), заканчивается на /exec.
// Если оставить пустым, анкета никуда не уходит, ответ сохраняется только в браузере гостя.
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbyfTUH6STXgrxndmp34r-85NIOp240yYdQF1mrdDnKleyCGufaOC664XdwBR1E3jCKr6A/exec";
// 09.10.2026 19:00, Астана (UTC+5)
const EVENT = new Date("2026-10-09T19:00:00+05:00");
const $ = id => document.getElementById(id);

// ---- Отсчёт ----
function tick() {
  const d = Math.max(0, EVENT - Date.now());
  const p = n => String(n).padStart(2, "0");
  $("cd-d").textContent = p(Math.floor(d / 86400000));
  $("cd-h").textContent = p(Math.floor(d % 86400000 / 3600000));
  $("cd-m").textContent = p(Math.floor(d % 3600000 / 60000));
  $("cd-s").textContent = p(Math.floor(d % 60000 / 1000));
}
tick(); setInterval(tick, 1000);

// ---- Календарь: октябрь 2026, неделя с понедельника ----
(function () {
  const y = 2026, m = 9;
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = Array(offset).fill("<td></td>");
  for (let d = 1; d <= days; d++) cells.push(`<td${d === 9 ? ' class="hi"' : ""}>${d}</td>`);
  while (cells.length % 7) cells.push("<td></td>");
  let html = "";
  for (let i = 0; i < cells.length; i += 7) html += "<tr>" + cells.slice(i, i + 7).join("") + "</tr>";
  $("cal-body").innerHTML = html;
})();

// ---- Анкета ----
let chosen = "";
document.querySelectorAll(".r-opt").forEach(el => {
  const pick = () => {
    chosen = el.dataset.v;
    document.querySelectorAll(".r-opt").forEach(o => o.classList.remove("on"));
    el.classList.add("on");
  };
  el.addEventListener("click", pick);
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
});
$("anketa").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, name = $("fn").value.trim();
  form.querySelector(".err")?.remove();
  if (!name) { $("fn").focus(); return; }
  if (!chosen) {
    form.querySelector(".radio-row").insertAdjacentHTML("afterend", '<div class="err">Выберите «Приду» или «Не приду»</div>');
    return;
  }
  form.querySelector(".send-btn").disabled = true;
  const data = { "ФИО": name, "Ответ": chosen };
  // Apps Script отвечает несколько секунд, поэтому «Спасибо» показываем сразу, а данные уходят в фоне
  form.style.display = "none";
  $("ok").style.display = "block";
  queueRsvp(data);
  flushRsvp();
});

// Ответы, которые не удалось отправить (нет сети), хранятся и досылаются при следующем заходе на сайт
function readQueue() { try { return JSON.parse(localStorage.getItem("rsvpQueue") || "[]"); } catch (_) { return []; } }
function writeQueue(q) { try { localStorage.setItem("rsvpQueue", JSON.stringify(q)); } catch (_) {} }
function queueRsvp(data) { const q = readQueue(); q.push(data); writeQueue(q); }
function flushRsvp() {
  if (!RSVP_ENDPOINT) return;
  readQueue().forEach(item => {
    // Apps Script не отдаёт CORS-заголовки, поэтому no-cors; keepalive — чтобы запрос дошёл, даже если гость закроет вкладку
    fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, body: new URLSearchParams(item) })
      .then(() => writeQueue(readQueue().filter(x => JSON.stringify(x) !== JSON.stringify(item))))
      .catch(() => {});
  });
}
flushRsvp();

// ---- Музыка ----
const audio = $("bg-audio"), wrap = $("music-wrap"), icon = $("music-icon");
audio.volume = 0.4;
const setOn = on => { wrap.classList.toggle("on", on); icon.textContent = on ? "❚❚" : "♪"; };
function toggle() {
  if (audio.paused) audio.play().then(() => setOn(true)).catch(() => {});
  else { audio.pause(); setOn(false); }
}
wrap.addEventListener("click", e => { e.stopPropagation(); toggle(); });
wrap.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
// Автозапуск: сразу, а если браузер не разрешил — на первом касании
function tryPlay() { if (audio.paused) audio.play().then(() => setOn(true)).catch(() => {}); }
tryPlay();
["touchstart", "click"].forEach(ev => document.addEventListener(ev, tryPlay, { once: true }));
