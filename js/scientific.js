const state = {
  expr: "",
  display: "0",
  justEvaluated: false,
  angleMode: "deg",
};

let displayEl, exprEl;

function refresh() {
  displayEl.textContent = state.display;
  exprEl.textContent = state.expr;
}

function inputNum(n) {
  if (state.justEvaluated) { state.display = ""; state.expr = ""; state.justEvaluated = false; }
  if (n === ".") {
    if (/\.\d*$/.test(state.display)) return;
    if (state.display === "" || state.display === "-") state.display += "0";
  }
  if (state.display === "0" && n !== ".") state.display = n;
  else state.display += n;
  refresh();
}

function inputOp(op) {
  if (state.justEvaluated) state.justEvaluated = false;
  state.expr += state.display + " " + op + " ";
  state.display = "";
  refresh();
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error("invalid factorial");
  if (n > 170) throw new Error("overflow");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function applyUnary(fn) {
  const cur = state.display !== "" ? Number(state.display) : Number(evalSafeRaw(state.expr || "0"));
  let res;
  const toRad = (x) => (state.angleMode === "deg" ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (state.angleMode === "deg" ? (x * 180) / Math.PI : x);
  try {
    switch (fn) {
      case "sin": res = Math.sin(toRad(cur)); break;
      case "cos": res = Math.cos(toRad(cur)); break;
      case "tan": res = Math.tan(toRad(cur)); break;
      case "asin": res = fromRad(Math.asin(cur)); break;
      case "acos": res = fromRad(Math.acos(cur)); break;
      case "atan": res = fromRad(Math.atan(cur)); break;
      case "log": res = Math.log10(cur); break;
      case "ln": res = Math.log(cur); break;
      case "exp": res = Math.exp(cur); break;
      case "pow10": res = Math.pow(10, cur); break;
      case "sqrt": res = Math.sqrt(cur); break;
      case "square": res = cur * cur; break;
      case "fact": res = factorial(cur); break;
      case "inv": res = 1 / cur; break;
      case "abs": res = Math.abs(cur); break;
      case "neg": res = -cur; break;
      default: return;
    }
    if (!Number.isFinite(res)) throw new Error("invalid");
    state.display = String(round(res));
    state.justEvaluated = false;
    refresh();
  } catch {
    state.display = "Error";
    state.expr = "";
    state.justEvaluated = true;
    refresh();
  }
}

function inputConst(c) {
  const v = c === "pi" ? Math.PI : Math.E;
  if (state.justEvaluated) { state.expr = ""; state.justEvaluated = false; }
  state.display = String(round(v));
  refresh();
}

function inputParen(p) {
  if (state.justEvaluated) { state.expr = ""; state.display = "0"; state.justEvaluated = false; }
  if (state.display && state.display !== "0") {
    state.expr += state.display + " ";
    state.display = "";
  }
  state.expr += p + " ";
  refresh();
}

function inputPow() {
  if (state.justEvaluated) state.justEvaluated = false;
  state.expr += state.display + " ** ";
  state.display = "";
  refresh();
}

function evalSafeRaw(expr) {
  const cleaned = expr.replace(/[^0-9+\-*/.()** ]/g, "");
  const r = Function('"use strict"; return (' + (cleaned || "0") + ")")();
  return Number.isFinite(r) ? r : 0;
}

function evaluate() {
  const full = (state.expr + state.display).trim();
  if (!full) return;
  try {
    const cleaned = full.replace(/[^0-9+\-*/.()** ]/g, "");
    if (cleaned.replace(/\s/g, "") !== full.replace(/\s/g, "")) throw new Error("invalid");
    const result = Function('"use strict"; return (' + cleaned + ")")();
    if (!Number.isFinite(result)) throw new Error("invalid");
    state.expr = full + " =";
    state.display = String(round(result));
    state.justEvaluated = true;
  } catch {
    state.display = "Error";
    state.expr = "";
    state.justEvaluated = true;
  }
  refresh();
}

function round(n) { return Math.round(n * 1e12) / 1e12; }

function clearAll() {
  state.expr = ""; state.display = "0"; state.justEvaluated = false;
  refresh();
}
function backspace() {
  if (state.justEvaluated) return clearAll();
  if (state.display.length > 0) state.display = state.display.slice(0, -1);
  if (state.display === "") state.display = "0";
  refresh();
}

function handleKey(e) {
  if (!document.getElementById("panel-scientific").classList.contains("active")) return;
  if (e.target.matches("input, select, textarea")) return;
  const k = e.key;
  if (/[0-9.]/.test(k)) { inputNum(k); e.preventDefault(); }
  else if (["+", "-", "*", "/"].includes(k)) { inputOp(k); e.preventDefault(); }
  else if (k === "(" || k === ")") { inputParen(k); e.preventDefault(); }
  else if (k === "Enter" || k === "=") { evaluate(); e.preventDefault(); }
  else if (k === "Backspace") { backspace(); e.preventDefault(); }
  else if (k === "Escape") { clearAll(); e.preventDefault(); }
}

export function initScientific() {
  displayEl = document.getElementById("sci-display");
  exprEl = document.getElementById("sci-expr");
  const panel = document.getElementById("panel-scientific");
  panel.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.num !== undefined) inputNum(btn.dataset.num);
    else if (btn.dataset.op !== undefined) inputOp(btn.dataset.op);
    else if (btn.dataset.action === "equals") evaluate();
    else if (btn.dataset.action === "clear") clearAll();
    else if (btn.dataset.action === "back") backspace();
    else if (btn.dataset.sci === "pi" || btn.dataset.sci === "e") inputConst(btn.dataset.sci);
    else if (btn.dataset.sci === "lparen") inputParen("(");
    else if (btn.dataset.sci === "rparen") inputParen(")");
    else if (btn.dataset.sci === "pow") inputPow();
    else if (btn.dataset.sci) applyUnary(btn.dataset.sci);
  });
  panel.querySelectorAll('input[name="angle"]').forEach((r) =>
    r.addEventListener("change", (e) => { state.angleMode = e.target.value; })
  );
  document.addEventListener("keydown", handleKey);
  refresh();
}
