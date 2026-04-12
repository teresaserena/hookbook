# Hookbook

A crochet pattern editor for freehanders. Create, edit, and save patterns row by row instead of scribbling in a notebook you can't undo. Every save creates a new version so you can always go back.

## What it does

- Enter pattern rows as free text or using standard crochet abbreviations (sc, dc, hdc, tr, etc.)
- Automatic stitch counting that understands multipliers (`2sc` or `ch 3`), repeats (`8[sc inc sc]`), and special stitches (inc, dec, yo)
- Track yarn details alongside your pattern
- Save and reopen patterns for editing
- Versioned saves — every save creates a snapshot, keeps the last 10 per pattern
- Reference image uploads per pattern

Built for patterns you're making up as you go, not following someone else's.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Chakra UI
- **Backend:** Express
- **Testing:** Vitest, Playwright, Testing Library

## Getting started

```bash
npm install
npm run dev
```

This starts both the Vite dev server and the Express backend via concurrently.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start client and server together |
| `npm run dev:client` | Start the Vite dev server only |
| `npm run dev:server` | Start the Express backend only |
| `npm run build` | Build for production |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint with ESLint |

## Stitch abbreviations

| Abbreviation | Stitch | Count |
|---|---|---|
| sc | Single crochet | 1 |
| dc | Double crochet | 1 |
| hdc | Half double crochet | 1 |
| tr | Triple crochet | 1 |
| slst | Slip stitch | 1 |
| ch | Chain | 1 |
| inc | Increase | 2 |
| dec | Decrease | 1 |
| yo | Yarn over | 0 (modifier) |
| blo | Back loop only | 1 |
| flo | Front loop only | 1 |
| fp | Front post | 1 |
| bp | Back post | 1 |
| pop | Popcorn | 1 |
| rep | Repeat | copies previous row |
| rnd | Round marker | 0 |

## Author

Teresa Wells

## License

ISC
