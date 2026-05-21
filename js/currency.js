// Use frankfurter.app 
// Rates are EUR-based
const API = "https://api.frankfurter.app/latest?from=EUR";

let rates = null;
let updatedAt = null;
const meta = () => document.getElementById("cur-meta");

const FALLBACK = {
  base: "EUR",
  date: "fallback",
  rates: {
    USD: 1.08, INR: 90.5, EUR: 1, GBP: 0.85, JPY: 162, AUD: 1.65, CAD: 1.46, CHF: 0.96,
    CNY: 7.8, SGD: 1.45, AED: 3.97, BRL: 5.5, ZAR: 19.5, MXN: 18.2,
  },
};

async function fetchRates() {
  meta().classList.remove("error");
  meta().textContent = "Loading rates…";
  try {
    const res = await fetch(API, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    rates = { EUR: 1, ...data.rates };
    updatedAt = data.date;
    meta().textContent = `Live rates from frankfurter.app — base EUR — ${updatedAt}`;
    return true;
  } catch (e) {
    rates = { ...FALLBACK.rates };
    updatedAt = "fallback (no internet?)";
    meta().classList.add("error");
    meta().textContent = "Could not fetch live rates — using approximate fallback. Click Refresh to retry.";
    return false;
  }
}

function populate(select) {
  select.innerHTML = "";
  Object.keys(rates).sort().forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    select.appendChild(opt);
  });
}

function convert(value, from, to) {
  if (!rates[from] || !rates[to]) return NaN;
  const eur = value / rates[from];
  return eur * rates[to];
}

function format(n) {
  if (!Number.isFinite(n)) return "";
  return Number(n.toFixed(4)).toString();
}

export async function initCurrency() {
  const fromSel = document.getElementById("cur-from");
  const toSel = document.getElementById("cur-to");
  const fromVal = document.getElementById("cur-from-val");
  const toVal = document.getElementById("cur-to-val");
  const swap = document.getElementById("cur-swap");
  const refresh = document.getElementById("cur-refresh");

  await fetchRates();
  populate(fromSel);
  populate(toSel);
  fromSel.value = "USD";
  toSel.value = "INR";

  function compute() {
    const v = Number(fromVal.value);
    if (!Number.isFinite(v)) { toVal.value = ""; return; }
    toVal.value = format(convert(v, fromSel.value, toSel.value));
  }
  fromSel.addEventListener("change", compute);
  toSel.addEventListener("change", compute);
  fromVal.addEventListener("input", compute);
  swap.addEventListener("click", () => {
    const f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    compute();
  });
  refresh.addEventListener("click", async () => {
    await fetchRates();
    populate(fromSel);
    populate(toSel);
    fromSel.value = "USD";
    toSel.value = "INR";
    compute();
  });
  compute();
}
