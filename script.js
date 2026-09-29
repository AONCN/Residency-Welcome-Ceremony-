// ---- Настройки ----
// Куда отправлять анкеты (Google Apps Script / Formspree и т.п.). Пока пусто — ответ сохраняется только в браузере.
const RSVP_ENDPOINT = "";
// Дата события: 09.10.2026 19:00 (Астана, UTC+5)
const EVENT = new Date("2026-10-09T19:00:00+05:00");

// ---- Отсчёт ----
const pad = n => String(n).padStart(2, "0");
function tick() {
  let s = Math.max(0, Math.floor((EVENT - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  document.getElementById("cd-d").textContent = pad(d);
  document.getElementById("cd-h").textContent = pad(h);
  document.getElementById("cd-m").textContent = pad(m);
  document.getElementById("cd-s").textContent = pad(s);
}
tick(); setInterval(tick, 1000);

// ---- Календарь (октябрь 2026, неделя с понедельника) ----
(function () {
  const cal = document.getElementById("calendar");
  const y = EVENT.getFullYear(), mo = 9;
  ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].forEach(t => cal.insertAdjacentHTML("beforeend", `<span class="dow">${t}</span>`));
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  for (let i = 0; i < offset; i++) cal.insertAdjacentHTML("beforeend", "<span></span>");
  for (let d = 1; d <= days; d++)
    cal.insertAdjacentHTML("beforeend", `<span class="${d === 9 ? "day" : ""}">${d}</span>`);
})();

// ---- Появление блоков ----
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// ---- Музыка ----
const audio = document.getElementById("audio"), btn = document.getElementById("music");
btn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().then(() => btn.classList.add("on")).catch(() => {});
  } else {
    audio.pause(); btn.classList.remove("on");
  }
});

// ---- Анкета ----
document.getElementById("form").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, status = document.getElementById("status");
  const data = { name: f.name.value.trim(), attend: f.attend.value, at: new Date().toISOString() };
  try {
    if (RSVP_ENDPOINT) {
      await fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    }
    try { localStorage.setItem("rsvp", JSON.stringify(data)); } catch (_) {}
    status.textContent = data.attend === "Приду"
      ? "Спасибо! Ждём вас 9 октября в 19:00."
      : "Спасибо за ответ. Нам жаль, что вы не сможете прийти.";
    f.reset();
  } catch (_) {
    status.textContent = "Не удалось отправить. Попробуйте ещё раз.";
  }
});
