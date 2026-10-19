(() => {
  "use strict";

  // ── Settings (persisted in localStorage) ──
  const SETTINGS_KEY = "calculator-settings";
  const defaults = {
    theme: "dark",
    precision: "auto",
    separator: false,
    sound: false,
  };

  function loadSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  let settings = loadSettings();

  // ── Calculator State ──
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let shouldResetDisplay = false;

  // ── DOM refs ──
  const calculatorEl = document.getElementById("calculator");
  const resultEl = document.getElementById("result");
  const expressionEl = document.getElementById("expression");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsClose = document.getElementById("settings-close");
  const themeOptions = document.getElementById("theme-options");
  const precisionOptions = document.getElementById("precision-options");
  const separatorToggle = document.getElementById("separator-toggle");
  const soundToggle = document.getElementById("sound-toggle");

  // ── Audio (Web Audio API – no external files needed) ──
  let audioCtx = null;

  function playClickSound() {
    if (!settings.sound) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  }

  // ── Helpers ──
  const OPERATOR_SYMBOLS = {
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷",
  };

  function formatNumber(n) {
    if (n === "Error") return "Error";
    // Keep it as-is while user is still typing a decimal
    if (typeof n === "string" && n.endsWith(".")) return n;
    const num = parseFloat(n);
    if (isNaN(num)) return "0";

    let str;
    if (settings.precision === "auto") {
      str = parseFloat(num.toPrecision(12)).toString();
    } else {
      const places = parseInt(settings.precision, 10);
      str = num.toFixed(places);
    }

    if (settings.separator) {
      const parts = str.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      str = parts.join(".");
    }

    return str;
  }

  function updateDisplay() {
    resultEl.textContent = formatNumber(currentInput);
    // Shrink text for long results
    const len = resultEl.textContent.length;
    resultEl.style.fontSize =
      len > 14 ? "1.6rem" :
      len > 11 ? "1.9rem" :
      len > 9  ? "2.1rem" : "";
  }

  function updateExpression() {
    if (operator && previousInput !== "") {
      expressionEl.textContent =
        `${formatNumber(previousInput)} ${OPERATOR_SYMBOLS[operator]}`;
    } else {
      expressionEl.textContent = "";
    }
  }

  // ── Calculation ──
  function calculate(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) return "Error";
    switch (op) {
      case "add":      return x + y;
      case "subtract": return x - y;
      case "multiply": return x * y;
      case "divide":   return y === 0 ? "Error" : x / y;
      default:         return y;
    }
  }

  // ── Action handlers ──
  function handleNumber(value) {
    playClickSound();
    if (shouldResetDisplay) {
      currentInput = value;
      shouldResetDisplay = false;
    } else {
      currentInput =
        currentInput === "0" ? value : currentInput + value;
    }
    updateDisplay();
  }

  function handleDecimal() {
    playClickSound();
    if (shouldResetDisplay) {
      currentInput = "0.";
      shouldResetDisplay = false;
    } else if (!currentInput.includes(".")) {
      currentInput += ".";
    }
    updateDisplay();
  }

  function handleOperator(nextOp) {
    playClickSound();
    if (operator && !shouldResetDisplay) {
      // Chain operations
      const result = calculate(previousInput, currentInput, operator);
      currentInput = result.toString();
      updateDisplay();
    }
    previousInput = currentInput;
    operator = nextOp;
    shouldResetDisplay = true;
    updateExpression();
  }

  function handleEquals() {
    playClickSound();
    if (!operator) return;
    const result = calculate(previousInput, currentInput, operator);
    expressionEl.textContent =
      `${formatNumber(previousInput)} ${OPERATOR_SYMBOLS[operator]} ${formatNumber(currentInput)} =`;
    currentInput = result.toString();
    previousInput = "";
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
  }

  function handleClear() {
    playClickSound();
    currentInput = "0";
    previousInput = "";
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
    updateExpression();
  }

  function handleToggleSign() {
    playClickSound();
    if (currentInput === "0" || currentInput === "Error") return;
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }

  function handlePercent() {
    playClickSound();
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay();
  }

  // ── Settings UI ──

  function applyTheme(theme) {
    calculatorEl.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }

  function syncSettingsUI() {
    // Theme buttons
    themeOptions.querySelectorAll(".settings-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === settings.theme);
    });
    // Precision buttons
    precisionOptions.querySelectorAll(".settings-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.precision === settings.precision);
    });
    // Toggles
    separatorToggle.checked = settings.separator;
    soundToggle.checked = settings.sound;

    applyTheme(settings.theme);
  }

  function toggleSettingsPanel() {
    settingsPanel.classList.toggle("open");
  }

  // Settings toggle & close
  settingsToggle.addEventListener("click", toggleSettingsPanel);
  settingsClose.addEventListener("click", toggleSettingsPanel);

  // Theme selection
  themeOptions.addEventListener("click", (e) => {
    const btn = e.target.closest(".settings-option");
    if (!btn || !btn.dataset.theme) return;
    settings.theme = btn.dataset.theme;
    saveSettings();
    syncSettingsUI();
  });

  // Precision selection
  precisionOptions.addEventListener("click", (e) => {
    const btn = e.target.closest(".settings-option");
    if (!btn || !btn.dataset.precision) return;
    settings.precision = btn.dataset.precision;
    saveSettings();
    syncSettingsUI();
    updateDisplay();
    updateExpression();
  });

  // Separator toggle
  separatorToggle.addEventListener("change", () => {
    settings.separator = separatorToggle.checked;
    saveSettings();
    updateDisplay();
    updateExpression();
  });

  // Sound toggle
  soundToggle.addEventListener("change", () => {
    settings.sound = soundToggle.checked;
    saveSettings();
    if (settings.sound) playClickSound(); // feedback
  });

  // ── Event delegation (buttons) ──
  document.querySelector(".buttons").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const action = btn.dataset.action;

    if (currentInput === "Error" && action !== "clear") {
      handleClear();
    }

    switch (action) {
      case "number":      handleNumber(btn.dataset.value); break;
      case "decimal":     handleDecimal(); break;
      case "add":
      case "subtract":
      case "multiply":
      case "divide":      handleOperator(action); break;
      case "equals":      handleEquals(); break;
      case "clear":       handleClear(); break;
      case "toggle-sign": handleToggleSign(); break;
      case "percent":     handlePercent(); break;
    }
  });

  // ── Keyboard support ──
  document.addEventListener("keydown", (e) => {
    // Don't handle keys while settings panel is open
    if (settingsPanel.classList.contains("open")) return;

    const key = e.key;
    if (key >= "0" && key <= "9")   handleNumber(key);
    else if (key === ".")           handleDecimal();
    else if (key === "+")           handleOperator("add");
    else if (key === "-")           handleOperator("subtract");
    else if (key === "*")           handleOperator("multiply");
    else if (key === "/")         { e.preventDefault(); handleOperator("divide"); }
    else if (key === "Enter" || key === "=") handleEquals();
    else if (key === "Escape")      handleClear();
    else if (key === "Backspace") {
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = "0";
      }
      updateDisplay();
    }
  });

  // ── Init ──
  syncSettingsUI();
})();
