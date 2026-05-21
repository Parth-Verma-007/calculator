const state = {
  expr: "",
  display: "0",
  justEvaluated: false,
  memory: 0,
};

let displayEl, exprEl, memIndEl;

function refresh() {
  displayEl.textContent = formatDisplay(state.display);
  exprEl.textContent = state.expr;
  memIndEl.textContent = state.memory !== 0 ? "M" : "";
}

function formatDisplay(s) {
  if (s === "" || s === "-") return "0";
  if (s === "Error") return "Error";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-6)) return n.toExponential(6);
  const [intPart, decPart] = s.split(".");
  const withCommas = Number(intPart).toLocaleString("en-US");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function inputNum(n) {
  if (state.justEvaluated) {
    state.display = "";
    state.expr = "";
    state.justEvaluated = false;
  }
  if (n === ".") {
    if (state.display.includes(".")) return;
    if (state.display === "" || state.display === "-") state.display += "0";
  }
  if (state.display === "0" && n !== ".") state.display = n;
  else state.display += n;
  refresh();
}

function inputOp(op) {
  if (state.display === "" && state.expr === "") return;
  if (state.justEvaluated) {
    state.expr = state.display + " " + op + " ";
    state.justEvaluated = false;
  } else if (state.display === "" && state.expr.endsWith(" ")) {
    state.expr = state.expr.slice(0, -3) + " " + op + " ";
  } else {
    state.expr += state.display + " " + op + " ";
  }
  state.display = "";
  refresh();
}

function evaluate() {
  const full = (state.expr + state.display).trim();
  if (!full) return;
  try {
    const result = evalSafe(full);
    state.expr = full + " =";
    state.display = String(result);
    state.justEvaluated = true;
  } catch {
    state.display = "Error";
    state.expr = "";
    state.justEvaluated = true;
  }
  refresh();
}

function evalSafe(expr) {
  const cleaned = expr.replace(/[^0-9+\-*/.() ]/g, "");
  if (cleaned !== expr) throw new Error("invalid");
  const result = Function('"use strict"; return (' + cleaned + ")")();
  if (!Number.isFinite(result)) throw new Error("invalid");
  return Math.round(result * 1e12) / 1e12;
}

function clearAll() {
  state.expr = "";
  state.display = "0";
  state.justEvaluated = false;
  refresh();
}
function clearEntry() {
  state.display = "0";
  refresh();
}
function backspace() {
  if (state.justEvaluated) return clearAll();
  if (state.display.length > 0) state.display = state.display.slice(0, -1);
  if (state.display === "") state.display = "0";
  refresh();
}
function percent() {
  if (!state.display) return;
  state.display = String(Number(state.display) / 100);
  refresh();
}
function memOp(action) {
  const cur = Number(state.display) || 0;
  if (action === "mc") state.memory = 0;
  else if (action === "mr") {
    state.display = String(state.memory);
    state.justEvaluated = true;
  } else if (action === "mplus") state.memory += cur;
  else if (action === "mminus") state.memory -= cur;
  refresh();
}

function handleKey(e) {
  if (!document.getElementById("panel-standard").classList.contains("active")) return;
  if (e.target.matches("input, select, textarea")) return;
  const k = e.key;
  if (/[0-9.]/.test(k)) { inputNum(k); e.preventDefault(); }
  else if (["+", "-", "*", "/"].includes(k)) { inputOp(k); e.preventDefault(); }
  else if (k === "Enter" || k === "=") { evaluate(); e.preventDefault(); }
  else if (k === "Backspace") { backspace(); e.preventDefault(); }
  else if (k === "Escape") { clearAll(); e.preventDefault(); }
  else if (k === "%") { percent(); e.preventDefault(); }
}

export function initStandard() {
  displayEl = document.getElementById("std-display");
  exprEl = document.getElementById("std-expr");
  memIndEl = document.getElementById("std-mem-ind");

  const panel = document.getElementById("panel-standard");
  panel.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.num !== undefined) inputNum(btn.dataset.num);
    else if (btn.dataset.op !== undefined) inputOp(btn.dataset.op);
    else if (btn.dataset.action === "equals") evaluate();
    else if (btn.dataset.action === "clear") clearAll();
    else if (btn.dataset.action === "ce") clearEntry();
    else if (btn.dataset.action === "back") backspace();
    else if (btn.dataset.action === "percent") percent();
    else if (["mc", "mr", "mplus", "mminus"].includes(btn.dataset.action)) memOp(btn.dataset.action);
  });
  document.addEventListener("keydown", handleKey);
  refresh();
}
