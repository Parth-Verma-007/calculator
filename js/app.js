import { initStandard } from "./standard.js";
import { initScientific } from "./scientific.js";
import { initUnit } from "./unit.js";
import { initCurrency } from "./currency.js";
import { initProgrammer } from "./programmer.js";
import { initDateTime } from "./datetime.js";

function setupModeSwitcher() {
  const buttons = document.querySelectorAll(".mode-btn");
  const panels = document.querySelectorAll(".panel");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      panels.forEach((p) => p.classList.toggle("active", p.id === `panel-${mode}`));
    });
  });
}

function setupKeyboardHelp() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" && !e.target.matches("input, select, textarea")) {
      alert(
        "Keyboard shortcuts:\n\n" +
          "Numbers/operators: type directly\n" +
          "Enter or =  : evaluate\n" +
          "Backspace   : delete\n" +
          "Escape      : clear\n" +
          "%           : percent (standard)\n\n" +
          "Click any mode in the sidebar to switch."
      );
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupModeSwitcher();
  setupKeyboardHelp();
  initStandard();
  initScientific();
  initUnit();
  initCurrency();
  initProgrammer();
  initDateTime();
});
