# Calculator

A multi-mode web calculator with Standard, Scientific, Unit, Currency, Programmer, and Date/Time modes.

## Run

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Modes

- **Standard** — everyday arithmetic
- **Scientific** — trig, logs, powers, constants
- **Unit** — length, weight, temperature, and more
- **Currency** — convert between currencies
- **Programmer** — binary / octal / hex with bitwise operations
- **Date/Time** — date arithmetic and duration calculations

## Structure

- `index.html` — main page
- `styles.css` — styling
- `server.js` — local static server
- `js/` — per-mode logic (`standard.js`, `scientific.js`, `unit.js`, `currency.js`, `programmer.js`, `datetime.js`, `app.js`)
