// Uses BigInt internally for arbitrary-precision integer math.
const state = {
  base: 10,            // current input base
  expr: [],            // array of { type: 'num'|'op', value }
  current: "",         // current entry as string in current base
  value: 0n,           // last computed value (BigInt)
  justEvaluated: false,
};

const els = {};

const HEX_CHARS = "ABCDEF";

function isValidChar(ch, base) {
  if (base === 2) return /[01]/.test(ch);
  if (base === 8) return /[0-7]/.test(ch);
  if (base === 10) return /[0-9]/.test(ch);
  if (base === 16) return /[0-9A-F]/.test(ch);
  return false;
}

function parseBig(str, base) {
  if (!str) return 0n;
  let neg = false;
  let s = str;
  if (s.startsWith("-")) { neg = true; s = s.slice(1); }
  let r = 0n;
  const B = BigInt(base);
  for (const c of s) {
    let d;
    if (/[0-9]/.test(c)) d = BigInt(c);
    else d = BigInt(c.charCodeAt(0) - 55); // A=10
    if (d >= B) throw new Error("invalid digit");
    r = r * B + d;
  }
  return neg ? -r : r;
}

function bigToBase(n, base) {
  if (n === 0n) return "0";
  const neg = n < 0n;
  let v = neg ? -n : n;
  const B = BigInt(base);
  let s = "";
  while (v > 0n) {
    const d = Number(v % B);
    s = (d < 10 ? String(d) : String.fromCharCode(55 + d)) + s;
    v = v / B;
  }
  return (neg ? "-" : "") + s;
}

function refreshDisplay() {
  const n = state.current ? parseBigSafe(state.current, state.base) : state.value;
  els.dec.textContent = bigToBase(n, 10);
  els.hex.textContent = bigToBase(n, 16);
  els.oct.textContent = bigToBase(n, 8);
  els.bin.textContent = bigToBase(n, 2);

  // highlight buttons that aren't valid in current base
  els.panel.querySelectorAll("[data-pnum]").forEach((btn) => {
    const v = btn.dataset.pnum;
    btn.disabled = !isValidChar(v, state.base);
  });
}

function parseBigSafe(s, base) {
  try { return parseBig(s, base); } catch { return 0n; }
}

function setBase(newBase) {
  // convert current entry to new base
  if (state.current) {
    const n = parseBigSafe(state.current, state.base);
    state.current = bigToBase(n, newBase);
  } else if (state.value !== 0n) {
    state.current = bigToBase(state.value, newBase);
  }
  state.base = newBase;
  els.panel.querySelectorAll(".base-btn").forEach((b) =>
    b.classList.toggle("active", Number(b.dataset.base) === newBase)
  );
  refreshDisplay();
}

function pushNum(ch) {
  if (!isValidChar(ch, state.base)) return;
  if (state.justEvaluated) { state.current = ""; state.expr = []; state.justEvaluated = false; }
  state.current += ch;
  refreshDisplay();
}

function pushOp(op) {
  if (state.justEvaluated) {
    state.expr = [{ type: "num", value: state.value }];
    state.justEvaluated = false;
  } else if (state.current) {
    state.expr.push({ type: "num", value: parseBigSafe(state.current, state.base) });
  }
  if (op === "not") {
    // unary — apply immediately to last operand if available
    const last = state.expr.length ? state.expr[state.expr.length - 1] : null;
    if (last && last.type === "num") last.value = ~last.value;
    state.current = bigToBase(last ? last.value : 0n, state.base);
    state.expr = [];
    state.value = last ? last.value : 0n;
    refreshDisplay();
    return;
  }
  state.expr.push({ type: "op", value: op });
  state.current = "";
  refreshDisplay();
}

function applyOp(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": if (b === 0n) throw new Error("div0"); return a / b;
    case "and": return a & b;
    case "or": return a | b;
    case "xor": return a ^ b;
    case "lsh": return a << b;
    case "rsh": return a >> b;
    default: throw new Error("op");
  }
}

function evaluate() {
  if (state.current) state.expr.push({ type: "num", value: parseBigSafe(state.current, state.base) });
  if (!state.expr.length) return;
  try {
    let acc = null, op = null;
    for (const tok of state.expr) {
      if (tok.type === "num") {
        if (acc === null) acc = tok.value;
        else if (op) { acc = applyOp(acc, op, tok.value); op = null; }
      } else {
        op = tok.value;
      }
    }
    state.value = acc !== null ? acc : 0n;
    state.current = bigToBase(state.value, state.base);
    state.expr = [];
    state.justEvaluated = true;
  } catch {
    state.current = "ERR";
    state.expr = [];
    state.value = 0n;
    state.justEvaluated = true;
  }
  refreshDisplay();
}

function clearAll() {
  state.current = "";
  state.expr = [];
  state.value = 0n;
  state.justEvaluated = false;
  refreshDisplay();
}
function back() {
  if (state.justEvaluated) return clearAll();
  state.current = state.current.slice(0, -1);
  refreshDisplay();
}

function handleKey(e) {
  if (!document.getElementById("panel-programmer").classList.contains("active")) return;
  if (e.target.matches("input, select, textarea")) return;
  const k = e.key.toUpperCase();
  if (/[0-9A-F]/.test(k)) { pushNum(k); e.preventDefault(); }
  else if (["+", "-", "*", "/"].includes(e.key)) { pushOp(e.key); e.preventDefault(); }
  else if (e.key === "Enter" || e.key === "=") { evaluate(); e.preventDefault(); }
  else if (e.key === "Backspace") { back(); e.preventDefault(); }
  else if (e.key === "Escape") { clearAll(); e.preventDefault(); }
}

export function initProgrammer() {
  els.panel = document.getElementById("panel-programmer");
  els.dec = document.getElementById("prog-dec");
  els.hex = document.getElementById("prog-hex");
  els.oct = document.getElementById("prog-oct");
  els.bin = document.getElementById("prog-bin");

  els.panel.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    if (btn.dataset.pnum !== undefined) pushNum(btn.dataset.pnum);
    else if (btn.dataset.pop !== undefined) pushOp(btn.dataset.pop);
    else if (btn.dataset.action === "prog-equals") evaluate();
    else if (btn.dataset.action === "prog-clear") clearAll();
    else if (btn.dataset.action === "prog-back") back();
    else if (btn.dataset.base !== undefined) setBase(Number(btn.dataset.base));
  });

  document.addEventListener("keydown", handleKey);
  refreshDisplay();
}
