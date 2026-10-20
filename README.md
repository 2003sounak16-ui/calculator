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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0-9` | Input digits |
| `.` | Decimal point |
| `+ - * /` | Operators |
| `Enter` or `=` | Evaluate |
| `Escape` | Clear (AC) |
| `Backspace` | Delete last digit |

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


## Apache Maven & GitHub Packages

This repository is published to the **GitHub Packages Apache Maven Registry**.

### Maven Coordinates

```xml
<dependency>
  <groupId>com.github.2003sounak16-ui</groupId>
  <artifactId>calculator</artifactId>
  <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### Authenticating & Installing

To consume packages from GitHub Packages in another Maven project:

1. **Configure your `~/.m2/settings.xml`**:
   ```xml
   <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
     <servers>
       <server>
         <id>github</id>
         <username>YOUR_GITHUB_USERNAME</username>
         <password>YOUR_PERSONAL_ACCESS_TOKEN</password>
       </server>
     </servers>
   </settings>
   ```
   *(Ensure your Personal Access Token (classic) has at least `read:packages` scope).*

2. **Add Repository to your project's `pom.xml`**:
   ```xml
   <repositories>
     <repository>
       <id>github</id>
       <name>GitHub 2003sounak16-ui Packages</name>
       <url>https://maven.pkg.github.com/2003sounak16-ui/calculator</url>
       <snapshots>
         <enabled>true</enabled>
       </snapshots>
     </repository>
   </repositories>
   ```
