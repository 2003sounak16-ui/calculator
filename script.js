(() => {
  "use strict";

  // ── State ──
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let shouldResetDisplay = false;

  // ── DOM refs ──
  const resultEl = document.getElementById("result");
  const expressionEl = document.getElementById("expression");

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
    // Avoid very long decimals
    const str = parseFloat(num.toPrecision(12)).toString();
    return str;
  }

  function updateDisplay() {
    resultEl.textContent = formatNumber(currentInput);
    // Shrink text for long results
    resultEl.style.fontSize =
      currentInput.length > 12 ? "1.8rem" :
      currentInput.length > 9  ? "2.1rem" : "";
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
    if (shouldResetDisplay) {
      currentInput = "0.";
      shouldResetDisplay = false;
    } else if (!currentInput.includes(".")) {
      currentInput += ".";
    }
    updateDisplay();
  }

  function handleOperator(nextOp) {
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
    currentInput = "0";
    previousInput = "";
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
    updateExpression();
  }

  function handleToggleSign() {
    if (currentInput === "0" || currentInput === "Error") return;
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }

  function handlePercent() {
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay();
  }

  // ── Event delegation ──
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
    const key = e.key;
    if (key >= "0" && key <= "9")   handleNumber(key);
    else if (key === ".")           handleDecimal();
    else if (key === "+" )          handleOperator("add");
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
})();
