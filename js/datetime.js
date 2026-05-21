const MS_DAY = 86400000;

function fmt(date) {
  if (!(date instanceof Date) || isNaN(date)) return "—";
  return date.toISOString().slice(0, 10);
}

function diffParts(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.round((to - from) / MS_DAY);
  return { years, months, days, totalDays };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function initDateTime() {
  const today = todayStr();

  // Date difference
  const dFrom = document.getElementById("dt-from");
  const dTo = document.getElementById("dt-to");
  const diffResult = document.getElementById("dt-diff-result");
  dFrom.value = today;
  dTo.value = today;

  function updateDiff() {
    if (!dFrom.value || !dTo.value) { diffResult.textContent = "—"; return; }
    const f = new Date(dFrom.value);
    const t = new Date(dTo.value);
    if (isNaN(f) || isNaN(t)) { diffResult.textContent = "—"; return; }
    const swap = f > t;
    const a = swap ? t : f;
    const b = swap ? f : t;
    const d = diffParts(a, b);
    diffResult.textContent =
      `${d.years} year(s), ${d.months} month(s), ${d.days} day(s)` +
      ` (${d.totalDays} day(s) total${swap ? ", reversed" : ""})`;
  }
  dFrom.addEventListener("change", updateDiff);
  dTo.addEventListener("change", updateDiff);
  updateDiff();

  // Add / subtract days
  const dStart = document.getElementById("dt-start");
  const dDays = document.getElementById("dt-days");
  const dOp = document.getElementById("dt-op");
  const addSubResult = document.getElementById("dt-addsub-result");
  dStart.value = today;

  function updateAddSub() {
    if (!dStart.value) { addSubResult.textContent = "—"; return; }
    const start = new Date(dStart.value);
    const n = Number(dDays.value) || 0;
    const delta = dOp.value === "add" ? n : -n;
    const out = new Date(start.getTime() + delta * MS_DAY);
    addSubResult.textContent = `${fmt(out)} (${out.toDateString()})`;
  }
  dStart.addEventListener("change", updateAddSub);
  dDays.addEventListener("input", updateAddSub);
  dOp.addEventListener("change", updateAddSub);
  updateAddSub();

  // Age
  const dDob = document.getElementById("dt-dob");
  const ageResult = document.getElementById("dt-age-result");

  function updateAge() {
    if (!dDob.value) { ageResult.textContent = "—"; return; }
    const dob = new Date(dDob.value);
    const now = new Date();
    if (isNaN(dob) || dob > now) { ageResult.textContent = "Invalid date of birth"; return; }
    const d = diffParts(dob, now);
    ageResult.textContent =
      `${d.years} year(s), ${d.months} month(s), ${d.days} day(s) old` +
      ` (${d.totalDays.toLocaleString()} days)`;
  }
  dDob.addEventListener("change", updateAge);
  updateAge();
}
