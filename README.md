# Calculator

A clean, modern calculator web application featuring a responsive UI, dark/light/solarized themes, customizable decimal precision, optional thousands separators, and sound effects.

## Features

- **Core Arithmetic** — Addition, subtraction, multiplication, and division
- **Chained Operations** — Step-by-step intermediate evaluation
- **Special Functions** — Clear (`AC`), sign toggle (`+/-`), and percentage (`%`)
- **Settings Panel (⚙)**:
  - 🎨 **Themes**: Dark, Light, Solarized
  - 🔢 **Decimal Precision**: Auto, 2, 4, 6 places
  - 콤 **Thousands Separator**: Format numbers with commas (e.g. `1,000,000`)
  - 🔊 **Sound Effects**: Audio clicks powered by Web Audio API
  - 💾 **Persistence**: Settings automatically saved to `localStorage`
- **Keyboard Support** — Digits, operators, `Enter`, `Escape`, `Backspace`
- **Error Handling** — Division by zero protection (`Error` state)

## Tech Stack

- HTML5 & CSS3 (CSS Custom Properties & Grid)
- Vanilla JavaScript (ES6+)
- Playwright for End-to-End Testing
- GitHub Actions for Continuous Integration (CI) and automated PR reviews

## Getting Started

To run the calculator locally in your browser:
```bash
# Open directly or use any static file server:
npx serve . -l 3000
```

## Running Tests with Playwright

Playwright is configured to run across **Chromium**, **Firefox**, and **WebKit**.

```bash
# Run all tests headless
npm test

# Run tests in headed browser mode
npm run test:headed

# Open the interactive HTML test report
npm run test:report
```

## Automated GitHub CI & Review

The repository includes a GitHub Actions workflow (`.github/workflows/playwright.yml`):
- Runs automatically on **every push** across all branches (`**`) and on **all pull requests** targeting `main`.
- Executes tests in parallel across desktop browsers.
- Integrates with the **Playwright GitHub Reporter** to provide automated line-by-line annotations and reviews on PR diffs.
- Automatically archives and uploads the Playwright HTML test reports and traces as artifacts for review.
