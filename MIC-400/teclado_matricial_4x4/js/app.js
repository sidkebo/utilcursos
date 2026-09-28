const keymap = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];

const rowNames = ['L1', 'L2', 'L3', 'L4'];
const colNames = ['C1', 'C2', 'C3', 'C4'];

let activeRow = 0;
let activeColumn = 0;
let showColumnSweep = true;
let pressed = null; // { row, col, key, id }
let pressSerial = 0;
let lastLoggedPressId = null;
let detectedHistory = [];
let autoTimer = null;
let releaseTimer = null;
let speedLevel = 45;
let scanDelay = speedToDelay(speedLevel);

const nextBtn = document.getElementById('nextBtn');
const autoBtn = document.getElementById('autoBtn');
const resetBtn = document.getElementById('resetBtn');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const modeBadge = document.getElementById('modeBadge');
const columnSweepToggle = document.getElementById('columnSweepToggle');

function speedToDelay(level) {
  const minDelay = 5;
  const maxDelay = 1000;
  const ratio = (100 - level) / 99;
  return Math.max(minDelay, Math.round(minDelay * Math.pow(maxDelay / minDelay, ratio)));
}

function columnStepDelay() {
  return Math.max(4, Math.round(scanDelay / 4));
}

function updateSpeedLabel() {
  speedValue.textContent = `${speedLevel}% · ${scanDelay} ms/fila · ${columnStepDelay()} ms/col`;
}

function detectedNow() {
  return Boolean(pressed && pressed.row === activeRow && pressed.col === activeColumn);
}

function columnStates() {
  return colNames.map((_, colIndex) =>
    detectedNow() && activeColumn === colIndex ? 'LOW' : 'HIGH'
  );
}

function registerDetectionIfNeeded() {
  if (!detectedNow() || !pressed || pressed.id === lastLoggedPressId) return;

  detectedHistory.push(pressed.key);
  lastLoggedPressId = pressed.id;
  renderHistory(true);

  if (autoTimer && !releaseTimer) {
    const detectedPressId = pressed.id;
    releaseTimer = setTimeout(() => {
      if (pressed && pressed.id === detectedPressId) {
        pressed = null;
        render();
      }
      releaseTimer = null;
    }, Math.max(60, Math.min(180, scanDelay)));
  }
}

function renderHistory(highlightLast = false) {
  const body = document.getElementById('historyBody');

  if (detectedHistory.length === 0) {
    body.innerHTML = '<tr class="history-empty"><td>—</td></tr>';
    return;
  }

  body.innerHTML = detectedHistory.map((key, index) => {
    const isLast = highlightLast && index === detectedHistory.length - 1;
    return `<tr class="${isLast ? 'just-added' : ''}"><td>${key}</td></tr>`;
  }).join('');

  const wrap = body.closest('.history-table-wrap');
  if (wrap) wrap.scrollTop = wrap.scrollHeight;
}

function renderColumnStatuses() {
  const target = document.getElementById('columnStatuses');
  const states = columnStates();
  target.innerHTML = states.map((state, i) => `
    <div class="column-status ${state.toLowerCase()} ${showColumnSweep && i === activeColumn ? 'active-scan' : ''}">
      <strong>${colNames[i]}</strong>
      <span>${state}</span>
    </div>
  `).join('');
}

function renderMatrix() {
  const stage = document.getElementById('matrixStage');
  const rowsHtml = `
    <div class="row-status-stack">
      ${rowNames.map((name, r) => `
        <div class="row-status ${r === activeRow ? 'active' : ''}">
          <span>${name}</span>
          <small>${r === activeRow ? 'LOW' : 'HIGH'}</small>
        </div>
      `).join('')}
    </div>
  `;

  let cells = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isPressed = pressed && pressed.row === r && pressed.col === c;
      const isDetected = isPressed && r === activeRow && c === activeColumn;
      const isActiveColumn = showColumnSweep && c === activeColumn;
      cells += `
        <div class="matrix-cell ${r === activeRow ? 'active-row' : ''} ${isActiveColumn ? 'active-column' : ''} ${isPressed ? 'pressed' : ''} ${isDetected ? 'detected' : ''}"
             title="${rowNames[r]} + ${colNames[c]} = tecla ${keymap[r][c]}">
          <div class="switch-symbol"><span class="switch-arm"></span></div>
        </div>
      `;
    }
  }

  stage.innerHTML = `${rowsHtml}<div class="switch-matrix">${cells}</div>`;
}

function renderKeypad() {
  const keypad = document.getElementById('keypad');
  const rowLabels = document.getElementById('rowLabels');
  const columnLabels = document.getElementById('columnLabels');
  const states = columnStates();

  keypad.innerHTML = keymap.flatMap((row, r) =>
    row.map((key, c) => {
      const isPressed = pressed && pressed.row === r && pressed.col === c;
      const isDetected = isPressed && detectedNow();
      return `<button class="key ${isPressed ? 'pressed' : ''} ${isDetected ? 'detected' : ''}"
                      data-row="${r}" data-col="${c}" aria-pressed="${isPressed ? 'true' : 'false'}">${key}</button>`;
    })
  ).join('');

  rowLabels.innerHTML = rowNames.map((name, r) =>
    `<div class="row-chip ${r === activeRow ? 'active' : ''}">${name}</div>`
  ).join('');

  columnLabels.innerHTML = colNames.map((name, c) =>
    `<div class="col-chip ${states[c] === 'LOW' ? 'low' : ''} ${showColumnSweep && c === activeColumn ? 'scan' : ''}">${name}</div>`
  ).join('');
}

function renderInfo() {
  const explanation = document.getElementById('explanation');
  const activeName = rowNames[activeRow];
  const activeColName = colNames[activeColumn];

  document.getElementById('scanCounter').textContent = showColumnSweep
    ? `Fila activa: ${activeName} · Columna en lectura: ${activeColName}`
    : `Fila activa: ${activeName}`;

  document.getElementById('pressedBadge').textContent = pressed ? `Tecla: ${pressed.key}` : 'Tecla: ninguna';
  document.getElementById('activeRowText').textContent = showColumnSweep
    ? `${activeName} = LOW · ${activeColName} en lectura`
    : `${activeName} = LOW`;

  if (!pressed) {
    document.getElementById('resultText').textContent = 'Sin tecla detectada';
    explanation.innerHTML = showColumnSweep
      ? `La fila <strong>${activeName}</strong> está activa en <strong>LOW</strong> y ahora se está leyendo la columna <strong>${activeColName}</strong>. Como no hay ninguna tecla presionada, todas las columnas se mantienen en <strong>HIGH</strong> gracias a <strong>INPUT_PULLUP</strong>.`
      : `La fila <strong>${activeName}</strong> está activa en <strong>LOW</strong>. Como no hay ninguna tecla presionada, todas las columnas se mantienen en <strong>HIGH</strong> gracias a <strong>INPUT_PULLUP</strong>.`;
    return;
  }

  if (detectedNow()) {
    document.getElementById('resultText').textContent = `${activeName} + ${activeColName} = tecla ${pressed.key}`;
    explanation.innerHTML = `La tecla <strong>${pressed.key}</strong> está presionada y pertenece a <strong>${rowNames[pressed.row]} + ${colNames[pressed.col]}</strong>. Como coinciden la fila activa y la columna en lectura, la columna <strong>${activeColName}</strong> cae a <strong>LOW</strong> y la tecla queda detectada.`;
  } else {
    document.getElementById('resultText').textContent = 'Todavía no detectada';
    explanation.innerHTML = showColumnSweep
      ? `La tecla <strong>${pressed.key}</strong> está presionada, pero el barrido todavía no coincide completamente. En este momento está activa la fila <strong>${activeName}</strong> y se está leyendo la columna <strong>${activeColName}</strong>. Debe llegar a <strong>${rowNames[pressed.row]} + ${colNames[pressed.col]}</strong> para detectar la tecla.`
      : `La tecla <strong>${pressed.key}</strong> está presionada, pero el barrido todavía está en <strong>${activeName}</strong>. Debe avanzar hasta <strong>${rowNames[pressed.row]}</strong> para que aparezca el <strong>LOW</strong> en la columna correspondiente.`;
  }
}

function render() {
  registerDetectionIfNeeded();
  renderColumnStatuses();
  renderMatrix();
  renderKeypad();
  renderInfo();
}

function simulateKeyPress(row, col) {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }

  pressSerial += 1;
  pressed = { row, col, key: keymap[row][col], id: pressSerial };

  if (autoTimer) {
    render();
  } else {
    activeRow = row;
    activeColumn = col;
    render();

    const thisPressId = pressSerial;
    releaseTimer = setTimeout(() => {
      if (pressed && pressed.id === thisPressId) {
        pressed = null;
        render();
      }
      releaseTimer = null;
    }, 180);
  }
}

function nextRow() {
  activeRow = (activeRow + 1) % 4;
  activeColumn = 0;
  render();
}

function nextAutoStep() {
  activeColumn = (activeColumn + 1) % 4;
  if (activeColumn === 0) {
    activeRow = (activeRow + 1) % 4;
  }
  render();
}

function startAuto() {
  stopAuto(false);
  autoTimer = setInterval(nextAutoStep, columnStepDelay());
  autoBtn.textContent = 'Detener barrido automático';
  autoBtn.classList.add('active');
  modeBadge.textContent = 'Automático';
}

function stopAuto(updateUi = true) {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;

  if (updateUi) {
    autoBtn.textContent = 'Iniciar barrido automático';
    autoBtn.classList.remove('active');
    modeBadge.textContent = 'Manual';
  }
}

nextBtn.addEventListener('click', nextRow);
autoBtn.addEventListener('click', () => {
  if (autoTimer) {
    stopAuto();
  } else {
    startAuto();
  }
});

resetBtn.addEventListener('click', () => {
  stopAuto();
  if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
  activeRow = 0;
  activeColumn = 0;
  pressed = null;
  lastLoggedPressId = null;
  detectedHistory = [];
  renderHistory();
  render();
});

document.getElementById('keypad').addEventListener('pointerdown', (event) => {
  const btn = event.target.closest('.key');
  if (!btn) return;

  event.preventDefault();
  const row = Number(btn.dataset.row);
  const col = Number(btn.dataset.col);
  simulateKeyPress(row, col);
});

speedRange.addEventListener('input', () => {
  speedLevel = Number(speedRange.value);
  scanDelay = speedToDelay(speedLevel);
  updateSpeedLabel();

  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextAutoStep, columnStepDelay());
  }
});

columnSweepToggle.addEventListener('change', () => {
  showColumnSweep = columnSweepToggle.checked;
  render();
});

updateSpeedLabel();
renderHistory();
render();
