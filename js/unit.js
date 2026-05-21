// Factors are relative to the base unit (first one in each category).
const UNITS = {
  length: {
    base: "Meter",
    units: {
      Meter: 1,
      Kilometer: 1000,
      Centimeter: 0.01,
      Millimeter: 0.001,
      Mile: 1609.344,
      Yard: 0.9144,
      Foot: 0.3048,
      Inch: 0.0254,
      "Nautical mile": 1852,
    },
  },
  weight: {
    base: "Kilogram",
    units: {
      Kilogram: 1,
      Gram: 0.001,
      Milligram: 0.000001,
      "Metric ton": 1000,
      Pound: 0.45359237,
      Ounce: 0.028349523125,
      Stone: 6.35029318,
    },
  },
  temperature: { base: "Celsius", units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 } },
  volume: {
    base: "Liter",
    units: {
      Liter: 1,
      Milliliter: 0.001,
      "Cubic meter": 1000,
      "US gallon": 3.785411784,
      "UK gallon": 4.54609,
      "US quart": 0.946352946,
      "US pint": 0.473176473,
      "US cup": 0.2365882365,
      "Fluid ounce (US)": 0.0295735295625,
    },
  },
  area: {
    base: "Square meter",
    units: {
      "Square meter": 1,
      "Square kilometer": 1e6,
      "Square centimeter": 0.0001,
      Hectare: 10000,
      Acre: 4046.8564224,
      "Square foot": 0.09290304,
      "Square inch": 0.00064516,
      "Square yard": 0.83612736,
      "Square mile": 2589988.110336,
    },
  },
  speed: {
    base: "Meter/second",
    units: {
      "Meter/second": 1,
      "Kilometer/hour": 0.27777777777778,
      "Mile/hour": 0.44704,
      Knot: 0.514444,
      "Foot/second": 0.3048,
    },
  },
  time: {
    base: "Second",
    units: {
      Second: 1,
      Millisecond: 0.001,
      Minute: 60,
      Hour: 3600,
      Day: 86400,
      Week: 604800,
      Year: 31557600,
    },
  },
};

function convertTemperature(value, from, to) {
  let c;
  if (from === "Celsius") c = value;
  else if (from === "Fahrenheit") c = (value - 32) * (5 / 9);
  else c = value - 273.15; // Kelvin
  if (to === "Celsius") return c;
  if (to === "Fahrenheit") return c * (9 / 5) + 32;
  return c + 273.15;
}

function convert(category, value, from, to) {
  if (category === "temperature") return convertTemperature(value, from, to);
  const u = UNITS[category].units;
  return (value * u[from]) / u[to];
}

function populate(select, units) {
  select.innerHTML = "";
  Object.keys(units).forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    select.appendChild(opt);
  });
}

function format(n) {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12 || (n !== 0 && Math.abs(n) < 1e-6)) return n.toExponential(6);
  return Number(n.toFixed(10)).toString();
}

export function initUnit() {
  const category = document.getElementById("unit-category");
  const fromSel = document.getElementById("unit-from");
  const toSel = document.getElementById("unit-to");
  const fromVal = document.getElementById("unit-from-val");
  const toVal = document.getElementById("unit-to-val");
  const swap = document.getElementById("unit-swap");

  function rebuild() {
    const cat = category.value;
    populate(fromSel, UNITS[cat].units);
    populate(toSel, UNITS[cat].units);
    const keys = Object.keys(UNITS[cat].units);
    if (keys.length > 1) toSel.value = keys[1];
    compute();
  }
  function compute() {
    const v = Number(fromVal.value);
    if (!Number.isFinite(v)) { toVal.value = ""; return; }
    toVal.value = format(convert(category.value, v, fromSel.value, toSel.value));
  }

  category.addEventListener("change", rebuild);
  fromSel.addEventListener("change", compute);
  toSel.addEventListener("change", compute);
  fromVal.addEventListener("input", compute);
  swap.addEventListener("click", () => {
    const f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    compute();
  });

  rebuild();
}
