const ADC_MAX = 511;
const FILTER_N = 5;

let mode = 'serial';
let running = false;
let timer = null;
let k = 0;
let lastSampleTime = null;
let filterBuffer = Array(FILTER_N).fill(256);
let filterIndex = 0;
let serialPort = null;
let serialReader = null;
let serialReading = false;
let serialLineCount = 0;
let serialValidCount = 0;
let serialRejectedCount = 0;
let serialBytesCount = 0;
let serialChunkCount = 0;
let serialRawLines = [];
let serialLoopPromise = null;
let stepTestTimer = null;
const history = [];

// Osciloscopio didáctico reconstruido
let scopeRunning = true;
let scopeSingleArmed = false;
let scopeViewMode = 'period';
let scopeLastData = null;
let scopeDisplayData = null;
let scopeLastKey = null;
let scopeSamples = [];
let scopeCursorClickTarget = 'A';

// Medición de muestras discretas
let sampleMeasureHistory = [];
let sampleCursorAIndex = null;
let sampleCursorBIndex = null;
let sampleActiveCursor = 'A';
let sampleMeasureFrozen = false;
let sampleMeasurePurpose = 'free'; // free | ts | change
const serialDtHistory = [];

// Versión de práctica: se conserva únicamente la última muestra real
// para registrar puntos sin mostrar cálculos derivados.
let studentLastData = null;
let studentRecords = [];
const STUDENT_MAX_RECORDS = 5;

const $ = (id) => document.getElementById(id);
const pot = $('pot');
const ts = $('ts');
const potQuick = $('potQuick');
const tsQuick = $('tsQuick');

function setMode(newMode) {
  mode = newMode;
  pauseSimulation();

  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });

  $('simBox').classList.toggle('hidden', mode !== 'sim');
  $('serialBox').classList.toggle('hidden', mode !== 'serial');
  $('pasteBox').classList.toggle('hidden', mode !== 'paste');

  $('modeBadge').textContent =
    mode === 'sim' ? 'SIMULACIÓN' :
    mode === 'serial' ? 'SERIAL ESP32' :
    'TERMINAL PEGADO';

  $('vinNote').textContent = mode === 'sim' ? 'Aproximación en simulación' : 'Valor recibido';
  $('procNote').textContent = mode === 'sim' ? 'Didáctico en simulación' : 'Valor recibido';

  if (mode === 'sim') {
    setTsValue(Number(ts.value));
    updateDataSummary();
  } else if (mode === 'paste') {
    $('headerInfo').textContent =
      'ADC 9 bits · Ts = detectado desde el terminal · Promedio móvil N = 5';
    updateDataSummary();
  } else {
    $('headerInfo').textContent =
      'El ESP32 realiza la adquisición y el muestreo. La página solamente recibe, registra y grafica los datos.';
    updateDataSummary();
    setSerialState(
      serialReading
        ? 'Conectado · esperando datos'
        : serialPort
          ? 'Puerto seleccionado'
          : 'Desconectado'
    );
  }

  updateChartControlsAvailability();
  updateFlowPresentation();

  const currentData = {
    k: Number($('k').textContent) || 0,
    adc: Number($('adc').textContent) || 0,
    adcf: Number($('adcf').textContent) || 0,
    dt: parseFloat($('dt').textContent) || Number(ts.value),
    proc: parseFloat($('proc').textContent) || 0
  };
  updateTimingVisualization(currentData);

  drawChart();
}

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

pot.addEventListener('input', () => {
  setPotValue(Number(pot.value), 'top');
});

potQuick.addEventListener('input', () => {
  setPotValue(Number(potQuick.value), 'quick');
});

ts.addEventListener('input', () => {
  setTsValue(Number(ts.value), 'top');
});

tsQuick.addEventListener('input', () => {
  setTsValue(Number(tsQuick.value), 'quick');
});

document.querySelectorAll('.quick-pot').forEach((button) => {
  button.addEventListener('click', () => {
    setPotValue(Number(button.dataset.value));
  });
});

document.querySelectorAll('.step-test').forEach((button) => {
  button.addEventListener('click', () => {
    runStepTest(Number(button.dataset.from), Number(button.dataset.to));
  });
});

$('start').addEventListener('click', startSimulation);
$('pause').addEventListener('click', pauseSimulation);
$('reset').addEventListener('click', resetSimulation);

$('startQuick').addEventListener('click', startSimulation);
$('pauseQuick').addEventListener('click', pauseSimulation);
$('resetQuick').addEventListener('click', resetSimulation);
$('parse').addEventListener('click', parsePastedText);
$('connect').addEventListener('click', connectSerial);
$('disconnect').addEventListener('click', disconnectSerial);
$('resetEsp32').addEventListener('click', resetEsp32Normal);
$('clearSerialData').addEventListener('click', clearSerialVisualization);

if ($('studentRecordPoint')) {
  $('studentRecordPoint').addEventListener('click', registerStudentPoint);
}
if ($('studentClearRecords')) {
  $('studentClearRecords').addEventListener('click', clearStudentRecords);
}

// Controles del osciloscopio didáctico
$('scopeRun').addEventListener('click', () => setScopeRunState('run'));
$('scopeStop').addEventListener('click', () => setScopeRunState('stop'));
$('scopeSingle').addEventListener('click', () => setScopeRunState('single'));
$('scopeAuto').addEventListener('click', scopeAutoSetup);

$('scopeView').addEventListener('change', () => {
  scopeViewMode = $('scopeView').value;
  $('scopeTimeDiv').value = 'auto';
  drawScope();
});

$('scopeTimeDiv').addEventListener('change', drawScope);
$('scopeTriggerEdge').addEventListener('change', drawScope);

$('scopeTriggerPos').addEventListener('input', () => {
  $('scopeTriggerPosText').textContent = `${$('scopeTriggerPos').value} %`;
  drawScope();
});

$('scopePersistence').addEventListener('change', drawScope);

$('cursorA').addEventListener('input', () => {
  $('cursorAText').textContent = `${Number($('cursorA').value).toFixed(1)} %`;
  drawScope();
});

$('cursorB').addEventListener('input', () => {
  $('cursorBText').textContent = `${Number($('cursorB').value).toFixed(1)} %`;
  drawScope();
});

$('scopeMeasureProc').addEventListener('click', positionCursorsForProc);
$('scopeMeasureTs').addEventListener('click', positionCursorsForTs);
$('scopeResetCursors').addEventListener('click', () => {
  $('cursorA').value = 20;
  $('cursorB').value = 70;
  $('cursorAText').textContent = '20.0 %';
  $('cursorBText').textContent = '70.0 %';
  drawScope();
});


$('sampleSeries').addEventListener('change', drawSampleMeasureChart);
$('sampleWindow').addEventListener('change', drawSampleMeasureChart);

$('measureTsMode').addEventListener('click', () => setSampleMeasurePurpose('ts'));
$('measureChangeMode').addEventListener('click', () => setSampleMeasurePurpose('change'));
$('measureFreeMode').addEventListener('click', () => setSampleMeasurePurpose('free'));

$('sampleCaptureButton').addEventListener('click', captureSamplesForMeasurement);
$('sampleLiveButton').addEventListener('click', returnSampleMeasurementToLive);

$('sampleCursorAButton').addEventListener('click', () => {
  if (!sampleMeasureFrozen) return;
  sampleActiveCursor = 'A';
  updateSampleCursorButtonState();
  $('sampleMeasureInstruction').textContent =
    sampleMeasurePurpose === 'change'
      ? 'Cursor A activo: haga clic donde comienza el cambio.'
      : 'Cursor A activo: haga clic sobre la primera muestra de la medición.';
});

$('sampleCursorBButton').addEventListener('click', () => {
  if (!sampleMeasureFrozen) return;
  sampleActiveCursor = 'B';
  updateSampleCursorButtonState();
  $('sampleMeasureInstruction').textContent =
    sampleMeasurePurpose === 'ts'
      ? 'Cursor B activo: haga clic sobre la muestra consecutiva a A.'
      : sampleMeasurePurpose === 'change'
      ? 'Cursor B activo: haga clic donde termina el cambio.'
      : 'Cursor B activo: haga clic sobre la segunda muestra de la medición.';
});

$('sampleClearCursors').addEventListener('click', clearSampleCursors);

$('sampleAPrev').addEventListener('click', () => moveSampleCursor('A', -1));
$('sampleANext').addEventListener('click', () => moveSampleCursor('A', 1));
$('sampleBPrev').addEventListener('click', () => moveSampleCursor('B', -1));
$('sampleBNext').addEventListener('click', () => moveSampleCursor('B', 1));

$('sampleMeasureCanvas').addEventListener('pointerdown', selectNearestSampleFromCanvas);

$('scopeCanvas').addEventListener('pointerdown', (event) => {
  const rect = $('scopeCanvas').getBoundingClientRect();
  const percent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));

  if (scopeCursorClickTarget === 'A') {
    $('cursorA').value = percent.toFixed(1);
    $('cursorAText').textContent = `${percent.toFixed(1)} %`;
    scopeCursorClickTarget = 'B';
  } else {
    $('cursorB').value = percent.toFixed(1);
    $('cursorBText').textContent = `${percent.toFixed(1)} %`;
    scopeCursorClickTarget = 'A';
  }

  drawScope();
});




// ------------------------------------------------------------
// Ayuda contextual retardada
// Mantener el puntero aproximadamente 2,2 s sobre un control.
// La ayuda desaparece al retirar el puntero, hacer clic,
// cambiar el control o comenzar a moverlo.
// ------------------------------------------------------------
let helpTimer = null;
let helpTarget = null;
const HELP_DELAY_MS = 2200;

function positionHelpTooltip(target) {
  const tooltip = $('helpTooltip');
  if (!tooltip || !target) return;

  const rect = target.getBoundingClientRect();

  // Mostrar primero para conocer su tamaño.
  tooltip.style.left = '12px';
  tooltip.style.top = '12px';
  tooltip.classList.add('visible');

  const tipRect = tooltip.getBoundingClientRect();
  const margin = 10;

  let left = rect.left + rect.width / 2 - tipRect.width / 2;
  left = Math.max(margin, Math.min(window.innerWidth - tipRect.width - margin, left));

  let top = rect.bottom + 9;

  // Si no cabe debajo, mostrar arriba.
  if (top + tipRect.height > window.innerHeight - margin) {
    top = rect.top - tipRect.height - 9;
  }

  top = Math.max(margin, Math.min(window.innerHeight - tipRect.height - margin, top));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function showHelpTooltip(target) {
  const tooltip = $('helpTooltip');
  if (!tooltip || !target?.dataset?.help) return;

  helpTarget = target;
  tooltip.textContent = target.dataset.help;
  tooltip.setAttribute('aria-hidden', 'false');
  positionHelpTooltip(target);
}

function hideHelpTooltip() {
  clearTimeout(helpTimer);
  helpTimer = null;
  helpTarget = null;

  const tooltip = $('helpTooltip');

  if (tooltip) {
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }
}

function scheduleHelpTooltip(target) {
  hideHelpTooltip();

  helpTimer = setTimeout(() => {
    showHelpTooltip(target);
  }, HELP_DELAY_MS);
}

function initContextHelp() {
  document.querySelectorAll('[data-help]').forEach((control) => {
    control.addEventListener('pointerenter', () => {
      scheduleHelpTooltip(control);
    });

    control.addEventListener('pointerleave', hideHelpTooltip);

    // Al comenzar a mover un slider, pulsar un botón o cambiar
    // un selector, la ayuda desaparece inmediatamente.
    control.addEventListener('pointerdown', hideHelpTooltip);
    control.addEventListener('click', hideHelpTooltip);
    control.addEventListener('input', hideHelpTooltip);
    control.addEventListener('change', hideHelpTooltip);

    // Accesibilidad por teclado: mostrar tras el mismo retardo.
    control.addEventListener('focus', () => {
      scheduleHelpTooltip(control);
    });

    control.addEventListener('blur', hideHelpTooltip);
  });

  window.addEventListener('scroll', hideHelpTooltip, { passive: true });
  window.addEventListener('resize', hideHelpTooltip);
}

function setScopeRunState(state) {
  scopeSingleArmed = false;

  if (state === 'run') {
    scopeRunning = true;
    if (scopeLastData) scopeDisplayData = { ...scopeLastData };
    $('scopeState').textContent = 'RUN';
    $('scopeFrozenNote').textContent = 'Actualización en vivo';
  } else if (state === 'stop') {
    scopeRunning = false;
    $('scopeState').textContent = 'STOP';
    $('scopeFrozenNote').textContent = 'Pantalla congelada; los datos seriales continúan llegando';
  } else if (state === 'single') {
    scopeRunning = false;
    scopeSingleArmed = true;
    $('scopeState').textContent = 'SINGLE ARM';
    $('scopeFrozenNote').textContent = 'Esperando la próxima muestra válida';
  }

  $('scopeRun').classList.toggle('scope-active', state === 'run');
  $('scopeStop').classList.toggle('scope-active', state === 'stop');
  $('scopeSingle').classList.toggle('scope-active', state === 'single');

  drawScope();
}

function scopeAutoSetup() {
  $('scopeTimeDiv').value = 'auto';

  if (scopeViewMode === 'pulse') {
    $('scopeTriggerPos').value = 20;
  } else {
    $('scopeTriggerPos').value = 15;
  }

  $('scopeTriggerPosText').textContent = `${$('scopeTriggerPos').value} %`;
  drawScope();
}

function pushScopeSample(data) {
  const dtMs = mode === 'sim' ? Number(ts.value) : Number(data.dt);
  const procUs = Number(data.proc);
  const kValue = Number(data.k);

  if (!Number.isFinite(dtMs) || dtMs <= 0 || !Number.isFinite(procUs) || procUs < 0) {
    return;
  }

  const key = `${mode}:${kValue}:${dtMs.toFixed(6)}:${procUs.toFixed(3)}`;

  if (key === scopeLastKey) return;
  scopeLastKey = key;

  const sample = {
    k: kValue,
    dtUs: dtMs * 1000,
    procUs
  };

  scopeSamples.push(sample);

  if (scopeSamples.length > 30) {
    scopeSamples.shift();
  }

  scopeLastData = sample;

  if (scopeRunning || scopeSingleArmed || !scopeDisplayData) {
    scopeDisplayData = { ...sample };

    if (scopeSingleArmed) {
      scopeSingleArmed = false;
      $('scopeState').textContent = 'SINGLE';
      $('scopeFrozenNote').textContent = `Captura única retenida en k=${sample.k}`;
      $('scopeSingle').classList.remove('scope-active');
      $('scopeStop').classList.add('scope-active');
    }
  }

  updateScopeHistoryStats();

  if (scopeRunning || !scopeSingleArmed) {
    drawScope();
  }
}

function updateScopeHistoryStats() {
  if (scopeSamples.length === 0) {
    $('scopeHistoryStats').textContent = 'Historial: esperando muestras...';
    return;
  }

  const dtValues = scopeSamples.map(s => s.dtUs);
  const procValues = scopeSamples.map(s => s.procUs);

  const dtMin = Math.min(...dtValues);
  const dtMax = Math.max(...dtValues);
  const procMin = Math.min(...procValues);
  const procMax = Math.max(...procValues);

  $('scopeHistoryStats').textContent =
    `Últimas ${scopeSamples.length} muestras · dT: ${(dtMin/1000).toFixed(3)}…${(dtMax/1000).toFixed(3)} ms · Proc: ${Math.round(procMin)}…${Math.round(procMax)} us`;
}

function getScopeTimeDivUs(data) {
  const manual = $('scopeTimeDiv').value;

  if (manual !== 'auto') {
    return Number(manual);
  }

  if (!data) return 10000;

  if (scopeViewMode === 'pulse') {
    return Math.max(1, data.procUs * 0.45);
  }

  return Math.max(1, data.dtUs / 8);
}

function formatScopeTime(us) {
  const value = Math.abs(us);

  if (value >= 1000000) return `${(us/1000000).toFixed(3)} s`;
  if (value >= 1000) return `${(us/1000).toFixed(3)} ms`;
  return `${us.toFixed(1)} us`;
}

function drawScopeTrace(ctx, data, dims, opacity = 1, lineWidth = 2) {
  if (!data) return;

  const { left, right, top, bottom, width, height, spanUs, triggerX, triggerEdge } = dims;
  const plotWidth = width - left - right;
  const yHigh = top + (height - top - bottom) * 0.28;
  const yLow = top + (height - top - bottom) * 0.72;

  const triggerPercent = Number($('scopeTriggerPos').value) / 100;
  const tLeft = -triggerPercent * spanUs;

  // Alinear el flanco seleccionado en t=0.
  const risingOffset = triggerEdge === 'rising' ? 0 : -data.procUs;

  const xFromTime = (t) => left + ((t - tLeft) / spanUs) * plotWidth;

  ctx.save();
  ctx.strokeStyle = `rgba(130,242,143,${opacity})`;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  // Buscar suficientes periodos antes y después del área visible.
  const startN = Math.floor((tLeft - risingOffset) / data.dtUs) - 2;
  const endN = Math.ceil((tLeft + spanUs - risingOffset) / data.dtUs) + 2;

  let firstPoint = true;

  for (let n = startN; n <= endN; n++) {
    const rise = risingOffset + n * data.dtUs;
    const fall = rise + data.procUs;
    const nextRise = rise + data.dtUs;

    const segments = [
      [rise - data.dtUs, rise, yLow],
      [rise, fall, yHigh],
      [fall, nextRise, yLow]
    ];

    for (const [ta, tb, y] of segments) {
      const xa = xFromTime(ta);
      const xb = xFromTime(tb);

      if (xb < left || xa > width - right) continue;

      const ca = Math.max(left, xa);
      const cb = Math.min(width - right, xb);

      if (firstPoint) {
        ctx.moveTo(ca, y);
        firstPoint = false;
      } else {
        ctx.lineTo(ca, y);
      }

      ctx.lineTo(cb, y);

      // Dibujar flancos cuando estén dentro del área.
      if (tb === rise && xb >= left && xb <= width - right) {
        ctx.lineTo(xb, yHigh);
      }
      if (tb === fall && xb >= left && xb <= width - right) {
        ctx.lineTo(xb, yLow);
      }
    }
  }

  ctx.stroke();
  ctx.restore();
}

function drawScope() {
  const canvas = $('scopeCanvas');
  if (!canvas) return;

  const data = scopeDisplayData || scopeLastData;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(320, rect.width);
  const cssHeight = Math.max(260, rect.height || 360);
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const left = 52;
  const right = 18;
  const top = 24;
  const bottom = 34;
  const width = cssWidth;
  const height = cssHeight;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  ctx.fillStyle = '#020805';
  ctx.fillRect(0, 0, width, height);

  // Rejilla tipo osciloscopio: 10 x 8 divisiones.
  ctx.lineWidth = 1;

  for (let i = 0; i <= 10; i++) {
    const x = left + plotWidth * i / 10;
    ctx.strokeStyle = i === 5 ? '#264332' : '#12251b';
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
  }

  for (let i = 0; i <= 8; i++) {
    const y = top + plotHeight * i / 8;
    ctx.strokeStyle = i === 4 ? '#264332' : '#12251b';
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
  }

  if (!data || !Number.isFinite(data.dtUs) || data.dtUs <= 0) {
    ctx.fillStyle = '#7b9384';
    ctx.font = '13px Consolas';
    ctx.fillText('Esperando datos temporales válidos...', left + 16, top + plotHeight / 2);
    updateScopeMeasurements(null, null);
    return;
  }

  const timeDivUs = getScopeTimeDivUs(data);
  const spanUs = timeDivUs * 10;
  const triggerPercent = Number($('scopeTriggerPos').value) / 100;
  const triggerX = left + plotWidth * triggerPercent;
  const triggerEdge = $('scopeTriggerEdge').value;

  const dims = {
    left, right, top, bottom, width, height,
    spanUs, triggerX, triggerEdge
  };

  // Persistencia: dibujar trazas históricas de forma tenue.
  if ($('scopePersistence').checked && scopeSamples.length > 1) {
    const samples = scopeSamples.slice(-8);

    samples.forEach((sample, index) => {
      const opacity = 0.05 + 0.05 * (index + 1);
      drawScopeTrace(ctx, sample, dims, opacity, 1);
    });
  }

  drawScopeTrace(ctx, data, dims, 1, 2);

  // Marcador de trigger.
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(triggerX, top);
  ctx.lineTo(triggerX, height - bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(triggerX - 6, top - 3);
  ctx.lineTo(triggerX + 6, top - 3);
  ctx.lineTo(triggerX, top + 6);
  ctx.closePath();
  ctx.fill();

  // Cursores A/B.
  const cursorAPct = Number($('cursorA').value) / 100;
  const cursorBPct = Number($('cursorB').value) / 100;
  const xA = left + plotWidth * cursorAPct;
  const xB = left + plotWidth * cursorBPct;

  drawCursor(xA, '#45d4ff', 'A');
  drawCursor(xB, '#ff7bd5', 'B');

  function drawCursor(x, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.font = 'bold 11px Consolas';
    ctx.fillText(label, x + 4, top + 13);
  }

  // Etiquetas de niveles lógicos.
  ctx.fillStyle = '#7b9384';
  ctx.font = '11px Consolas';
  const yHigh = top + plotHeight * 0.28;
  const yLow = top + plotHeight * 0.72;
  ctx.fillText('HIGH', 8, yHigh + 4);
  ctx.fillText('LOW', 14, yLow + 4);

  // Escala temporal inferior.
  ctx.fillStyle = '#7b9384';
  ctx.font = '10px Consolas';

  for (let i = 0; i <= 10; i += 2) {
    const t = (i / 10 - triggerPercent) * spanUs;
    const x = left + plotWidth * i / 10;
    const text = formatScopeTime(t);
    ctx.fillText(text, Math.min(width - right - 70, Math.max(left, x - 22)), height - 12);
  }

  // Lecturas de estado.
  $('scopeTimeDivReadout').textContent =
    `TIME ${formatScopeTime(timeDivUs)}/div`;

  $('scopeTriggerReadout').textContent =
    `TRIG ${triggerEdge === 'rising' ? '↑' : '↓'} ${Math.round(triggerPercent * 100)} %`;

  $('scopeSampleReadout').textContent = `k=${data.k}`;

  updateScopeMeasurements(data, {
    spanUs,
    triggerPercent,
    cursorAPct,
    cursorBPct
  });
}

function updateScopeMeasurements(data, geometry) {
  if (!data || !geometry) {
    $('scopeMeasureT').textContent = '—';
    $('scopeMeasureF').textContent = '—';
    $('scopeMeasurePW').textContent = '—';
    $('scopeMeasureDuty').textContent = '—';
    $('scopeMeasureDt').textContent = '—';
    $('scopeMeasureInvDt').textContent = '—';
    return;
  }

  const periodUs = data.dtUs;
  const frequencyHz = 1000000 / periodUs;
  const duty = (data.procUs / periodUs) * 100;
  const deltaCursorUs = Math.abs(
    (geometry.cursorBPct - geometry.cursorAPct) * geometry.spanUs
  );

  $('scopeMeasureT').textContent = formatScopeTime(periodUs);
  $('scopeMeasureF').textContent =
    frequencyHz >= 1000
      ? `${(frequencyHz/1000).toFixed(3)} kHz`
      : `${frequencyHz.toFixed(3)} Hz`;

  $('scopeMeasurePW').textContent = formatScopeTime(data.procUs);
  $('scopeMeasureDuty').textContent = `${duty.toFixed(3)} %`;
  $('scopeMeasureDt').textContent = formatScopeTime(deltaCursorUs);

  if (deltaCursorUs > 0) {
    const invHz = 1000000 / deltaCursorUs;
    $('scopeMeasureInvDt').textContent =
      invHz >= 1000
        ? `${(invHz/1000).toFixed(3)} kHz`
        : `${invHz.toFixed(3)} Hz`;
  } else {
    $('scopeMeasureInvDt').textContent = '—';
  }
}

function positionCursorsForProc() {
  const data = scopeDisplayData || scopeLastData;
  if (!data) return;

  scopeViewMode = 'pulse';
  $('scopeView').value = 'pulse';
  $('scopeTimeDiv').value = 'auto';
  $('scopeTriggerEdge').value = 'rising';
  $('scopeTriggerPos').value = 20;
  $('scopeTriggerPosText').textContent = '20 %';

  const spanUs = getScopeTimeDivUs(data) * 10;
  const startPct = 20;
  const endPct = Math.min(98, startPct + (data.procUs / spanUs) * 100);

  $('cursorA').value = startPct;
  $('cursorB').value = endPct;
  $('cursorAText').textContent = `${startPct.toFixed(1)} %`;
  $('cursorBText').textContent = `${endPct.toFixed(1)} %`;

  drawScope();
}

function positionCursorsForTs() {
  const data = scopeDisplayData || scopeLastData;
  if (!data) return;

  scopeViewMode = 'period';
  $('scopeView').value = 'period';
  $('scopeTimeDiv').value = 'auto';
  $('scopeTriggerEdge').value = 'rising';
  $('scopeTriggerPos').value = 10;
  $('scopeTriggerPosText').textContent = '10 %';

  const spanUs = getScopeTimeDivUs(data) * 10;
  const startPct = 10;
  const endPct = Math.min(98, startPct + (data.dtUs / spanUs) * 100);

  $('cursorA').value = startPct;
  $('cursorB').value = endPct;
  $('cursorAText').textContent = `${startPct.toFixed(1)} %`;
  $('cursorBText').textContent = `${endPct.toFixed(1)} %`;

  drawScope();
}

function setPotValue(value, source = '') {
  const bounded = Math.max(0, Math.min(100, Math.round(value)));

  if (source !== 'top') pot.value = bounded;
  if (source !== 'quick') potQuick.value = bounded;

  $('potText').textContent = `${bounded} %`;
  $('potQuickText').textContent = `${bounded} %`;
}

function setTsValue(value, source = '') {
  const bounded = Math.max(50, Math.min(1000, Math.round(value / 50) * 50));

  if (source !== 'top') ts.value = bounded;
  if (source !== 'quick') tsQuick.value = bounded;

  $('tsText').textContent = `${bounded} ms`;
  $('tsQuickText').textContent = `${bounded} ms`;

  const fs = 1000 / bounded;
  $('fsQuickText').textContent = `fs = ${fs.toFixed(2)} Hz`;
  $('headerInfo').textContent =
    `ADC 9 bits · Ts = ${bounded} ms · fs = ${fs.toFixed(2)} Hz · Promedio móvil N = 5`;

  if (mode === 'sim') {
    updateDataSummary(bounded);
  }
}

function updateChartControlsAvailability() {
  const controls = $('chartControls');
  if (!controls) return;
  controls.classList.toggle('disabled', mode !== 'sim');
}

function runStepTest(fromValue, toValue) {
  if (mode !== 'sim') {
    setMode('sim');
  }

  clearTimeout(stepTestTimer);

  setPotValue(fromValue);
  $('stepTestStatus').textContent =
    `Ensayo ${fromValue} → ${toValue} %: registrando primero la condición inicial de ${fromValue} %.`;

  if (!running) {
    startSimulation();
  }

  // Se dejan tres periodos de muestreo en el valor inicial
  // para que la gráfica muestre una referencia estable antes del salto.
  const delay = Math.max(150, Number(ts.value) * 3);

  stepTestTimer = setTimeout(() => {
    setPotValue(toValue);
    $('stepTestStatus').textContent =
      `Cambio aplicado: ${fromValue} → ${toValue} %. Observe cómo ADC cambia primero y ADCf tarda varias muestras.`;
  }, delay);
}

function startSimulation() {
  if (mode !== 'sim' || running) return;
  running = true;
  runSample();
}

function pauseSimulation() {
  running = false;
  clearTimeout(timer);
  clearTimeout(stepTestTimer);
  clearStep();
  setPulse(false);
}

function resetSimulation() {
  pauseSimulation();
  k = 0;
  lastSampleTime = null;

  const adc = Math.round((Number(pot.value) / 100) * ADC_MAX);
  filterBuffer = Array(FILTER_N).fill(adc);
  filterIndex = 0;
  history.length = 0;

  const data = {
    k: 0,
    t: 0,
    dt: 0,
    proc: 180,
    adc,
    adcf: adc,
    vin: approximateMilliVolts(adc),
    adcp: (adc / ADC_MAX) * 100,
    adcfp: (adc / ADC_MAX) * 100
  };

  updateDisplay(data, 'Simulación reiniciada');
  drawChart();
  updateDataSummary();
  setStep('wait');

  if ($('stepTestStatus')) {
    $('stepTestStatus').textContent =
      'Use estos botones para provocar un cambio controlado y observar el retardo de ADCf.';
  }
}

function runSample() {
  if (!running) return;

  // En simulación, dT representa el periodo configurado del ESP32.
  // No se usa el retraso real del navegador, porque puede variar.
  const dt = k === 0 ? 0 : Number(ts.value);

  const adc = Math.round((Number(pot.value) / 100) * ADC_MAX);
  const vin = approximateMilliVolts(adc);

  filterBuffer[filterIndex] = adc;
  filterIndex = (filterIndex + 1) % FILTER_N;

  const sum = filterBuffer.reduce((a, b) => a + b, 0);
  const adcf = sum / FILTER_N;

  const data = {
    k,
    t: k * Number(ts.value),
    dt: k === 0 ? 0 : dt,
    proc: Math.round(174 + (17 * adc / ADC_MAX)),
    adc,
    adcf,
    vin,
    adcp: (adc / ADC_MAX) * 100,
    adcfp: (adcf / ADC_MAX) * 100
  };

  updateDisplay(data, formatLine(data));
  pushHistory(data);
  animateFlow();

  k += 1;
  timer = setTimeout(runSample, Number(ts.value));
}

// Aproximación didáctica basada en las lecturas observadas en Wokwi.
// En modo Serial se usa el VinADC real enviado por el ESP32.
function approximateMilliVolts(adc) {
  const points = [
    [0, 142],
    [127, 997],
    [256, 1865],
    [382, 2674],
    [511, 3168]
  ];

  if (adc <= 0) return 142;
  if (adc >= 511) return 3168;

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];

    if (adc >= x1 && adc <= x2) {
      const ratio = (adc - x1) / (x2 - x1);
      return Math.round(y1 + ratio * (y2 - y1));
    }
  }

  return 0;
}

function updateDisplay(data, rawLine) {
  $('k').textContent = data.k;

  if ($('studentT')) {
    $('studentT').textContent = `${Number(data.t).toFixed(3)} ms`;
  }

  // Solo se habilita el registro manual con datos reales recibidos por Serial.
  if (mode === 'serial') {
    studentLastData = {
      k: Number(data.k),
      t: Number(data.t),
      adc: Number(data.adc),
      adcf: Number(data.adcf),
      vin: Number(data.vin),
      proc: Number(data.proc)
    };
    updateStudentRecordAvailability();
  }
  $('adc').textContent = Math.round(data.adc);
  $('adcf').textContent = Number(data.adcf).toFixed(1);
  $('vin').textContent = `${Math.round(data.vin)} mV`;
  $('adcp').textContent = `${Number(data.adcp).toFixed(2)} %`;
  $('adcfp').textContent = `${Number(data.adcfp).toFixed(2)} %`;
  $('dt').textContent = `${Number(data.dt).toFixed(3)} ms`;
  $('proc').textContent = `${Math.round(data.proc)} us`;
  $('line').textContent = rawLine || formatLine(data);

  updateChartStatus(data);
  updateTimingCheck(data);
  updateTimingVisualization(data);
  updateSerialSampleIndicator(data);
  updateMemory(data);
}



function updateStudentRecordAvailability() {
  const button = $('studentRecordPoint');
  if (!button) return;

  const hasRealData =
    mode === 'serial' &&
    serialReading &&
    studentLastData &&
    Number.isFinite(studentLastData.k);

  button.disabled = !hasRealData || studentRecords.length >= STUDENT_MAX_RECORDS;

  if (studentRecords.length >= STUDENT_MAX_RECORDS) {
    $('studentRecordStatus').textContent =
      'Se completaron los cinco puntos. Borre los registros para iniciar una nueva serie.';
  } else if (hasRealData) {
    $('studentRecordStatus').textContent =
      `Última muestra disponible: k=${studentLastData.k}. Puede registrar este punto.`;
  }
}

function renderStudentRecords() {
  const body = $('studentRecordsBody');
  if (!body) return;

  $('studentRecordCount').textContent =
    `${studentRecords.length} / ${STUDENT_MAX_RECORDS}`;

  if (studentRecords.length === 0) {
    body.innerHTML = `
      <tr class="student-empty-row">
        <td colspan="8">Sin mediciones registradas.</td>
      </tr>`;
    updateStudentRecordAvailability();
    return;
  }

  body.innerHTML = studentRecords.map((p, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeStudentHtml(p.label)}</td>
      <td>${p.k}</td>
      <td>${p.t.toFixed(3)}</td>
      <td>${Math.round(p.adc)}</td>
      <td>${p.adcf.toFixed(1)}</td>
      <td>${Math.round(p.vin)}</td>
      <td>${Math.round(p.proc)}</td>
    </tr>
  `).join('');

  updateStudentRecordAvailability();
}

function escapeStudentHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function registerStudentPoint() {
  if (mode !== 'serial' || !serialReading || !studentLastData) {
    $('studentRecordStatus').textContent =
      'No hay una muestra real disponible. Conecte el ESP32 y espere datos.';
    return;
  }

  if (studentRecords.length >= STUDENT_MAX_RECORDS) {
    $('studentRecordStatus').textContent =
      'Ya se registraron cinco puntos.';
    return;
  }

  const labelInput = $('studentPointLabel');
  const label = labelInput.value.trim() || `Punto ${studentRecords.length + 1}`;

  studentRecords.push({
    ...studentLastData,
    label
  });

  labelInput.value = '';
  renderStudentRecords();

  $('studentRecordStatus').textContent =
    `Punto ${studentRecords.length} registrado con la muestra k=${studentLastData.k}.`;
}

function clearStudentRecords() {
  studentRecords = [];
  renderStudentRecords();
  $('studentRecordStatus').textContent =
    studentLastData
      ? `Registros borrados. Última muestra disponible: k=${studentLastData.k}.`
      : 'Registros borrados. Espere una muestra válida del ESP32.';
}

function resetStudentVisibleValues() {
  if ($('k')) $('k').textContent = '—';
  if ($('studentT')) $('studentT').textContent = '—';
  if ($('adc')) $('adc').textContent = '—';
  if ($('adcf')) $('adcf').textContent = '—';
  if ($('vin')) $('vin').textContent = '—';
  if ($('proc')) $('proc').textContent = '—';
}

function updateFlowPresentation() {
  const flow = document.querySelector('.flow');
  const pulseRow = $('pulseRow');
  const serialInfo = $('serialSampleInfo');

  if (!flow || !pulseRow || !serialInfo) return;

  if (mode === 'sim') {
    flow.classList.remove('static-flow');
    pulseRow.classList.remove('hidden');
    serialInfo.classList.add('hidden');

    $('indicatorLabel').textContent = 'GPIO25';
    $('flowModeBadge').textContent = 'ANIMADO';
    $('flowModeBadge').classList.remove('static');
    $('flowModeNote').textContent =
      'Representación didáctica del orden de ejecución del programa.';

    setStep('wait');
    setPulse(false);

  } else if (mode === 'serial') {
    // En Serial no se anima el flujo: la página NO está midiendo GPIO25.
    flow.classList.add('static-flow');
    pulseRow.classList.add('hidden');
    serialInfo.classList.remove('hidden');

    $('flowModeBadge').textContent = 'REFERENCIA';
    $('flowModeBadge').classList.add('static');
    $('flowModeNote').textContent =
      'Diagrama estático de referencia. La temporización de GPIO25 se reconstruye abajo con dT y Proc; la medición física requiere osciloscopio o analizador lógico.';

    clearStep();

    $('serialSampleTitle').textContent = serialReading
      ? 'Recepción Serial activa'
      : 'Modo Serial ESP32';

    $('serialSampleText').textContent = serialReading
      ? 'Esperando una muestra válida del ESP32...'
      : 'Conecte el ESP32 para visualizar datos reales.';

  } else {
    flow.classList.add('static-flow');
    pulseRow.classList.add('hidden');
    serialInfo.classList.remove('hidden');

    $('flowModeBadge').textContent = 'REFERENCIA';
    $('flowModeBadge').classList.add('static');
    $('flowModeNote').textContent =
      'Diagrama estático de referencia para interpretar los datos pegados del terminal.';

    clearStep();

    $('serialSampleTitle').textContent = 'Datos de terminal';
    $('serialSampleText').textContent =
      'La página representa datos ya registrados; no mide GPIO25.';
  }
}

function updateSerialSampleIndicator(data) {
  if (mode !== 'serial' || !$('serialSampleInfo')) return;

  $('serialSampleTitle').textContent = 'Recepción Serial activa';
  $('serialSampleText').textContent =
    `Última muestra válida recibida: k=${data.k} · ADC=${Math.round(data.adc)} · dT=${Number(data.dt).toFixed(3)} ms`;
}

function updateTimingCheck(data) {
  const state = $('timingState');
  if (!state) return;

  let tsUs;

  if (mode === 'sim') {
    tsUs = Number(ts.value) * 1000;
  } else {
    const dtMs = Number(data.dt);

    // En k=0 puede no existir todavía un dT representativo.
    if (!Number.isFinite(dtMs) || dtMs <= 0) {
      state.textContent = 'ESPERANDO dT';
      state.className = 'timing-state waiting';
      $('timingTs').textContent = '—';
      $('timingProc').textContent = `${Math.round(data.proc)} us`;
      $('timingUsage').textContent = '—';
      $('timingMargin').textContent = '—';
      $('timingEquation').textContent =
        'Se necesita un dT válido para realizar la comparación.';
      return;
    }

    tsUs = dtMs * 1000;
  }

  const procUs = Number(data.proc);
  const valid = Number.isFinite(procUs) && Number.isFinite(tsUs) && tsUs > 0;

  if (!valid) {
    state.textContent = 'DATOS NO VÁLIDOS';
    state.className = 'timing-state waiting';
    return;
  }

  const usage = (procUs / tsUs) * 100;
  const margin = tsUs - procUs;
  const ok = procUs < tsUs;

  $('timingTs').textContent = `${Math.round(tsUs)} us`;
  $('timingProc').textContent = `${Math.round(procUs)} us`;
  $('timingUsage').textContent = `${usage.toFixed(3)} %`;
  $('timingMargin').textContent = `${Math.round(margin)} us`;

  $('timingEquation').textContent =
    `Proc = ${Math.round(procUs)} us ${ok ? '<' : '≥'} Ts = ${Math.round(tsUs)} us`;

  state.textContent = ok ? 'CORRECTO · Proc < Ts' : 'REVISAR · Proc ≥ Ts';
  state.className = `timing-state ${ok ? 'ok' : 'fail'}`;
}


function updateTimingVisualization(data) {
  if (!$('timingVisualBadge')) return;

  let dtMs;
  let procUs = Number(data.proc);

  if (mode === 'sim') {
    dtMs = Number(ts.value);

    $('timingVisualBadge').textContent = 'SIMULACIÓN';
    $('timingVisualBadge').classList.remove('real');
    $('timingVisualNote').textContent =
      'Representación del comportamiento programado con los valores seleccionados en la simulación.';
    $('timingDisclaimer').textContent =
      'En simulación la forma de onda es didáctica. Para observar GPIO25 físicamente use osciloscopio o analizador lógico.';
  } else {
    dtMs = Number(data.dt);

    $('timingVisualBadge').textContent =
      mode === 'serial' ? 'DATOS DEL ESP32' : 'DATOS REGISTRADOS';
    $('timingVisualBadge').classList.add('real');

    $('timingVisualNote').textContent =
      mode === 'serial'
        ? 'Reconstrucción temporal actualizada con dT y Proc recibidos en tiempo real desde el ESP32.'
        : 'Reconstrucción temporal calculada con dT y Proc del registro pegado.';

    $('timingDisclaimer').textContent =
      'La forma de onda se reconstruye con los valores dT y Proc reportados por el programa. No es una medición eléctrica directa del pin GPIO25; para verificar el pulso físico use osciloscopio o analizador lógico.';
  }

  if (!Number.isFinite(dtMs) || dtMs <= 0 || !Number.isFinite(procUs) || procUs < 0) {
    $('periodLabel').textContent = 'dT = —';
    $('periodAxisLabel').textContent = 'Periodo no disponible';
    $('procLabel').textContent = 'Proc = —';
    $('zoomProcLabel').textContent = 'Esperando datos válidos';
    $('periodPulse').style.width = '4px';

    $('scopeSourceBadge').textContent =
      mode === 'serial' ? 'DATOS DEL ESP32'
      : mode === 'paste' ? 'DATOS REGISTRADOS'
      : 'SIMULACIÓN';
    $('scopeSourceBadge').classList.toggle('real', mode !== 'sim');

    drawScope();
    return;
  }

  const dtUs = dtMs * 1000;
  const occupancy = dtUs > 0 ? procUs / dtUs : 0;

  $('periodLabel').textContent = `dT = ${dtMs.toFixed(3)} ms`;
  $('periodAxisLabel').textContent = `dT = ${dtMs.toFixed(3)} ms`;
  $('procLabel').textContent = `Proc ≈ ${Math.round(procUs)} us`;
  $('zoomProcLabel').textContent = `HIGH durante ≈ ${Math.round(procUs)} us`;

  // El ancho real puede ser inferior a un píxel (ej. 83 us / 100 ms).
  // Se conserva un mínimo visible de 4 px, pero el dato numérico siempre
  // muestra la relación temporal real.
  const track = $('periodPulse').parentElement;
  const trackWidth = Math.max(1, track.clientWidth - 4);
  const realWidth = trackWidth * occupancy;
  const visibleWidth = Math.min(trackWidth * 0.30, Math.max(4, realWidth));

  $('periodPulse').style.width = `${visibleWidth}px`;
  $('periodPulse').title =
    `Ocupación real aproximada: ${(occupancy * 100).toFixed(3)} % del periodo`;

  // La vista ampliada no está a escala con Ts. Su ancho varía suavemente
  // solo para facilitar comparaciones entre diferentes tiempos Proc.
  const zoomPercent = Math.max(22, Math.min(58, 22 + Math.log10(Math.max(1, procUs)) * 8));
  $('zoomHigh').style.width = `${zoomPercent}%`;
  $('zoomHigh').style.justifySelf = 'center';

  // Alimentar el osciloscopio didáctico con la misma muestra temporal.
  pushScopeSample(data);

  $('scopeSourceBadge').textContent =
    mode === 'serial' ? 'DATOS DEL ESP32'
    : mode === 'paste' ? 'DATOS REGISTRADOS'
    : 'SIMULACIÓN';

  $('scopeSourceBadge').classList.toggle('real', mode !== 'sim');
}

function updateMemory(data) {
  if (mode !== 'sim') {
    $('memory').innerHTML = `
      <div class="mem"><span>ADC actual</span><strong>${Math.round(data.adc)}</strong></div>
      <div class="mem"><span>ADCf</span><strong>${Number(data.adcf).toFixed(1)}</strong></div>
      <div class="mem"><span>N</span><strong>5</strong></div>
      <div class="mem"><span>Memoria</span><strong>interna</strong></div>
      <div class="mem"><span>Filtro</span><strong>activo</strong></div>`;
    return;
  }

  $('memory').innerHTML = filterBuffer.map((value, index) => `
    <div class="mem">
      <span>x${index + 1}</span>
      <strong>${value}</strong>
    </div>`).join('');
}


function updateChartStatus(data) {
  const status = $('chartStatus');
  if (!status) return;

  const difference = Math.abs(Number(data.adc) - Number(data.adcf));

  if (difference < 0.05) {
    status.textContent =
      `ADC = ADCf ≈ ${Number(data.adc).toFixed(1)}. Las dos curvas coinciden porque la entrada está estable.`;
    status.classList.remove('separated');
  } else {
    status.textContent =
      `ADC = ${Math.round(data.adc)} y ADCf = ${Number(data.adcf).toFixed(1)}. El promedio móvil todavía está siguiendo el cambio.`;
    status.classList.add('separated');
  }
}

function formatLine(data) {
  return `k=${data.k} | t=${Number(data.t).toFixed(3)} ms | dT=${Number(data.dt).toFixed(3)} ms | Proc=${Math.round(data.proc)} us | ADC=${Math.round(data.adc)} | ADCf=${Number(data.adcf).toFixed(1)} | VinADC=${Math.round(data.vin)} mV | ADC%=${Number(data.adcp).toFixed(2)} % | ADCf%=${Number(data.adcfp).toFixed(2)} %`;
}

function parseLine(text) {
  const regex = /k=(\d+)\s*\|\s*t=([\d.]+)\s*ms\s*\|\s*dT=([\d.]+)\s*ms\s*\|\s*Proc=(\d+)\s*us\s*\|\s*ADC=(\d+)\s*\|\s*ADCf=([\d.]+)\s*\|\s*Vin(?:ADC)?=(\d+)\s*mV\s*\|\s*(?:ADC%|Directo)=([\d.]+)\s*%\s*\|\s*(?:ADCf%|Filtrado)=([\d.]+)\s*%/i;
  const match = text.match(regex);

  if (!match) return null;

  return {
    k: Number(match[1]),
    t: Number(match[2]),
    dt: Number(match[3]),
    proc: Number(match[4]),
    adc: Number(match[5]),
    adcf: Number(match[6]),
    vin: Number(match[7]),
    adcp: Number(match[8]),
    adcfp: Number(match[9])
  };
}

function parsePastedText() {
  const lines = $('terminalInput').value
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean);

  const parsed = [];

  lines.forEach((text) => {
    const data = parseLine(text);
    if (data) parsed.push({ data, text });
  });

  if (parsed.length === 0) {
    $('line').textContent =
      'No se encontró una línea compatible con el formato del programa.';
    history.length = 0;
    drawChart();
    updateDataSummary();
    return;
  }

  // En modo "Pegar terminal" cada carga reemplaza el registro anterior.
  history.length = 0;
  sampleMeasureHistory.length = 0;
  sampleCursorAIndex = null;
  sampleCursorBIndex = null;

  parsed.forEach(({ data }) => {
    const point = {
      k: Number(data.k),
      t: Number(data.t),
      adc: Number(data.adc),
      adcf: Number(data.adcf),
      dt: Number(data.dt)
    };

    history.push(point);
    sampleMeasureHistory.push({ ...point });
  });

  const last = parsed[parsed.length - 1];
  updateDisplay(last.data, last.text);

  const detectedTsMs = detectTsFromData(
    parsed.map(({ data }) => data)
  );

  updateDetectedTiming(detectedTsMs, 'terminal');
  updateDataSummary(detectedTsMs);

  drawChart();

  // Un registro pegado ya es estático, por lo que queda listo para medir.
  sampleMeasureFrozen = true;
  setSampleMeasurementMode(true);
}

function pushHistory(data) {
  history.push({
    k: Number(data.k),
    t: Number(data.t),
    adc: Number(data.adc),
    adcf: Number(data.adcf),
    dt: Number(data.dt)
  });

  const measurementPoint = {
    k: Number(data.k),
    t: Number(data.t),
    adc: Number(data.adc),
    adcf: Number(data.adcf),
    dt: Number(data.dt)
  };

  const lastMeasurement = sampleMeasureHistory[sampleMeasureHistory.length - 1];

  // Esta gráfica puede congelarse para medir. El resto de la aplicación
  // sigue recibiendo datos normalmente.
  if (!sampleMeasureFrozen) {
    // Evitar duplicar la misma muestra cuando varias funciones refrescan la interfaz.
    if (!lastMeasurement || lastMeasurement.k !== measurementPoint.k || lastMeasurement.t !== measurementPoint.t) {
      sampleMeasureHistory.push(measurementPoint);

      // Historial suficientemente amplio para análisis sin crecimiento indefinido.
      if (sampleMeasureHistory.length > 1500) {
        sampleMeasureHistory.shift();

        if (sampleCursorAIndex !== null) sampleCursorAIndex = Math.max(0, sampleCursorAIndex - 1);
        if (sampleCursorBIndex !== null) sampleCursorBIndex = Math.max(0, sampleCursorBIndex - 1);
      }
    }
  }

  // Simulación: ventana corta para observar claramente los cambios.
  if (mode === 'sim' && history.length > 60) {
    history.shift();
  }

  // Serial puede ejecutarse indefinidamente: se conserva una ventana amplia.
  if (mode === 'serial' && history.length > 120) {
    history.shift();
  }

  // En "Pegar terminal" NO se recortan muestras.
  drawChart();
  updateDataSummary();

  if (mode === 'serial') {
    const dtValue = Number(data.dt);

    if (Number.isFinite(dtValue) && dtValue > 0) {
      serialDtHistory.push(dtValue);

      if (serialDtHistory.length > 30) {
        serialDtHistory.shift();
      }

      const detectedTsMs = median(serialDtHistory);
      updateDetectedTiming(detectedTsMs, 'serial');
      updateDataSummary(detectedTsMs);
    }
  }

  drawSampleMeasureChart();
}



function median(values) {
  const clean = values
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (clean.length === 0) return null;

  const middle = Math.floor(clean.length / 2);

  return clean.length % 2 === 0
    ? (clean[middle - 1] + clean[middle]) / 2
    : clean[middle];
}

function detectTsFromData(dataList) {
  // Se usa la mediana de dT positivos.
  // Esto evita que un primer intervalo irregular de arranque
  // distorsione el periodo representativo.
  const dtValues = dataList
    .map((data) => Number(data.dt))
    .filter((value) => Number.isFinite(value) && value > 0);

  return median(dtValues);
}

function updateDetectedTiming(tsMs, source) {
  if (!Number.isFinite(tsMs) || tsMs <= 0) return;

  const fs = 1000 / tsMs;

  if (source === 'terminal') {
    $('headerInfo').textContent =
      `ADC 9 bits · Ts medido ≈ ${tsMs.toFixed(3)} ms · fs ≈ ${fs.toFixed(2)} Hz · Promedio móvil N = 5`;
  } else if (source === 'serial') {
    $('headerInfo').textContent =
      `ADC 9 bits · Ts medido ≈ ${tsMs.toFixed(3)} ms · fs ≈ ${fs.toFixed(2)} Hz · Promedio móvil N = 5`;
  }
}

function updateDataSummary(forcedTs = null) {
  if (!$('sampleCount')) return;

  $('sampleCount').textContent = history.length;

  if (history.length === 0) {
    $('sampleRange').textContent = '—';

    if (mode === 'sim') {
      const tsMs = Number(ts.value);
      $('detectedTs').textContent = `${tsMs.toFixed(0)} ms`;
      $('detectedFs').textContent = `${(1000 / tsMs).toFixed(2)} Hz`;
    } else {
      $('detectedTs').textContent = '—';
      $('detectedFs').textContent = '—';
    }

    return;
  }

  const firstK = history[0].k;
  const lastK = history[history.length - 1].k;
  $('sampleRange').textContent = `k=${firstK} ... k=${lastK}`;

  let tsMs = forcedTs;

  if (!Number.isFinite(tsMs) || tsMs <= 0) {
    if (mode === 'sim') {
      tsMs = Number(ts.value);
    } else {
      tsMs = median(
        history
          .map((point) => Number(point.dt))
          .filter((value) => Number.isFinite(value) && value > 0)
      );
    }
  }

  if (Number.isFinite(tsMs) && tsMs > 0) {
    $('detectedTs').textContent = `${tsMs.toFixed(3)} ms`;
    $('detectedFs').textContent = `${(1000 / tsMs).toFixed(2)} Hz`;
  } else {
    $('detectedTs').textContent = '—';
    $('detectedFs').textContent = '—';
  }
}




function setSampleMeasurePurpose(purpose) {
  sampleMeasurePurpose = purpose;

  $('measureTsMode').classList.toggle('active', purpose === 'ts');
  $('measureChangeMode').classList.toggle('active', purpose === 'change');
  $('measureFreeMode').classList.toggle('active', purpose === 'free');

  if (purpose === 'ts') {
    $('measureStep2Text').textContent = 'Seleccione una muestra.';
    $('measureStep3Text').textContent = 'Seleccione la muestra consecutiva.';
    $('measureStep4Text').textContent = 'Compruebe Δt ≈ Ts y fs = 1/Ts.';
    $('measureTopExtraLabel').textContent = 'fs';
  } else if (purpose === 'change') {
    $('measureStep2Text').textContent = 'Seleccione donde comienza el cambio.';
    $('measureStep3Text').textContent = 'Seleccione donde termina el cambio.';
    $('measureStep4Text').textContent = 'Analice Δt, ΔADC y ΔADCf.';
    $('measureTopExtraLabel').textContent = 'ΔADC';
  } else {
    $('measureStep2Text').textContent = 'Seleccione el primer punto.';
    $('measureStep3Text').textContent = 'Seleccione el segundo punto.';
    $('measureStep4Text').textContent = 'La página calculará las diferencias.';
    $('measureTopExtraLabel').textContent = 'Resultado';
  }

  clearSampleCursors();
  updateMeasurementGuide();
}

function updateMeasurementGuide() {
  const a = sampleCursorAIndex !== null ? sampleMeasureHistory[sampleCursorAIndex] : null;
  const b = sampleCursorBIndex !== null ? sampleMeasureHistory[sampleCursorBIndex] : null;

  const steps = [
    $('measureStep1'), $('measureStep2'), $('measureStep3'), $('measureStep4')
  ];
  steps.forEach(step => step.classList.remove('current','done'));

  if (!sampleMeasureFrozen) {
    $('measureStep1').classList.add('current');
    $('measureResultMain').textContent = 'Esperando captura';
    $('measureResultBanner').classList.remove('complete');
    return;
  }

  $('measureStep1').classList.add('done');

  if (!a) {
    $('measureStep2').classList.add('current');
    $('measureResultMain').textContent = 'Capture congelada · seleccione Cursor A';
    $('measureResultBanner').classList.remove('complete');
    return;
  }

  $('measureStep2').classList.add('done');

  if (!b) {
    $('measureStep3').classList.add('current');
    $('measureResultMain').textContent = `A = k${a.k} · ahora seleccione Cursor B`;
    $('measureResultBanner').classList.remove('complete');
    return;
  }

  $('measureStep3').classList.add('done');
  $('measureStep4').classList.add('done');
  $('measureResultBanner').classList.add('complete');

  const deltaK = b.k - a.k;
  const deltaT = b.t - a.t;
  const deltaAdc = b.adc - a.adc;

  $('measureTopDeltaK').textContent = deltaK;
  $('measureTopDeltaT').textContent = `${deltaT.toFixed(3)} ms`;

  if (sampleMeasurePurpose === 'ts') {
    const absDeltaK = Math.abs(deltaK);
    if (absDeltaK === 1 && Math.abs(deltaT) > 0) {
      const fs = 1000 / Math.abs(deltaT);
      $('measureTopExtra').textContent = `${fs.toFixed(3)} Hz`;
      $('measureResultMain').textContent =
        `Ts medido entre muestras consecutivas: ${Math.abs(deltaT).toFixed(3)} ms`;
    } else {
      $('measureTopExtra').textContent = 'Seleccione k consecutivos';
      $('measureResultMain').textContent =
        `Para medir Ts seleccione muestras consecutivas (Δk debe ser ±1). Actualmente Δk=${deltaK}.`;
    }
  } else if (sampleMeasurePurpose === 'change') {
    $('measureTopExtra').textContent =
      `${deltaAdc >= 0 ? '+' : ''}${deltaAdc.toFixed(0)}`;
    $('measureResultMain').textContent =
      `Cambio medido desde k=${a.k} hasta k=${b.k}`;
  } else {
    $('measureTopExtra').textContent = 'A ↔ B';
    $('measureResultMain').textContent =
      `Medición libre entre k=${a.k} y k=${b.k}`;
  }
}

function updateMeasurementInstructionFromCursors() {
  const a = sampleCursorAIndex !== null ? sampleMeasureHistory[sampleCursorAIndex] : null;
  const b = sampleCursorBIndex !== null ? sampleMeasureHistory[sampleCursorBIndex] : null;

  if (!sampleMeasureFrozen) {
    $('sampleMeasureInstruction').textContent =
      'la gráfica se actualiza con cada muestra. Pulse «Capturar para medir» antes de colocar los cursores.';
    updateMeasurementGuide();
    return;
  }

  if (!a) {
    $('sampleMeasureInstruction').textContent =
      'captura lista. Cursor A está activo: haga clic sobre la primera muestra de la medición.';
  } else if (!b) {
    if (sampleMeasurePurpose === 'ts') {
      $('sampleMeasureInstruction').textContent =
        `A = k${a.k}. Ahora seleccione la muestra consecutiva k=${a.k + 1} o k=${a.k - 1} para medir Ts.`;
    } else if (sampleMeasurePurpose === 'change') {
      $('sampleMeasureInstruction').textContent =
        `A = k${a.k}. Ahora haga clic donde termina el cambio para colocar B.`;
    } else {
      $('sampleMeasureInstruction').textContent =
        `A = k${a.k}. Ahora haga clic sobre otra muestra para colocar B.`;
    }
  } else {
    $('sampleMeasureInstruction').textContent =
      `Medición actual: A=k${a.k}, B=k${b.k}. Puede mover A/B muestra por muestra o seleccionar nuevos puntos.`;
  }

  updateMeasurementGuide();
}

function setSampleMeasurementMode(frozen) {
  sampleMeasureFrozen = frozen;

  const state = $('sampleMeasureState');
  const instruction = $('sampleMeasureInstruction');
  const captureButton = $('sampleCaptureButton');
  const liveButton = $('sampleLiveButton');

  captureButton.classList.toggle('sample-captured', frozen);
  liveButton.classList.toggle('sample-live-active', !frozen);

  // Los cursores solo se habilitan cuando existe una captura fija.
  [
    'sampleCursorAButton','sampleCursorBButton',
    'sampleAPrev','sampleANext','sampleBPrev','sampleBNext'
  ].forEach((id) => {
    if ($(id)) $(id).disabled = !frozen;
  });

  if (frozen) {
    state.textContent = 'CAPTURA CONGELADA:';
    state.classList.add('frozen');
    instruction.textContent =
      'seleccione Cursor A y haga clic sobre una muestra; después seleccione B o haga otro clic para medir el intervalo.';

    sampleActiveCursor = 'A';
    updateSampleCursorButtonState();
    updateMeasurementInstructionFromCursors();
  } else {
    state.textContent = 'TIEMPO REAL:';
    state.classList.remove('frozen');
    instruction.textContent =
      'la gráfica comienza una adquisición nueva con las muestras que lleguen desde este momento. Pulse «Capturar para medir» cuando tenga una zona de interés.';

    // Al volver a vivo se inicia una adquisición limpia.
    sampleMeasureHistory.length = 0;
    sampleCursorAIndex = null;
    sampleCursorBIndex = null;
    sampleActiveCursor = 'A';

    updateSampleCursorButtonState();
    updateSampleCursorPanels();
    updateMeasurementInstructionFromCursors();
  }

  drawSampleMeasureChart();
  updateMeasurementGuide();
}

function captureSamplesForMeasurement() {
  if (sampleMeasureHistory.length < 2) {
    $('sampleMeasureInstruction').textContent =
      'todavía no hay suficientes muestras. Espere a que la gráfica acumule datos y vuelva a intentar.';
    return;
  }

  setSampleMeasurementMode(true);
}

function returnSampleMeasurementToLive() {
  setSampleMeasurementMode(false);
}

function getVisibleSampleMeasurePoints() {
  const setting = $('sampleWindow')?.value || '120';

  if (setting === 'all') {
    return sampleMeasureHistory.map((point, index) => ({ ...point, sourceIndex: index }));
  }

  const count = Math.max(1, Number(setting) || 120);
  const start = Math.max(0, sampleMeasureHistory.length - count);

  return sampleMeasureHistory
    .slice(start)
    .map((point, localIndex) => ({
      ...point,
      sourceIndex: start + localIndex
    }));
}

function drawSampleMeasureChart() {
  const canvas = $('sampleMeasureCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = 360;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pad = { left: 48, right: 18, top: 18, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.fillStyle = '#070c11';
  ctx.fillRect(0, 0, width, height);

  // Rejilla
  ctx.font = '11px Arial';

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + plotH * i / 4;
    ctx.strokeStyle = '#1d2a37';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#718196';
    ctx.fillText(String(Math.round(ADC_MAX * (1 - i / 4))), 7, y + 4);
  }

  const points = getVisibleSampleMeasurePoints();

  if (points.length === 0) {
    ctx.fillStyle = '#718196';
    ctx.fillText('Esperando muestras para realizar mediciones...', pad.left + 12, height / 2);
    updateSampleCursorPanels();
    return;
  }

  const xFor = (i) => {
    if (points.length === 1) return pad.left + plotW / 2;
    return pad.left + plotW * i / (points.length - 1);
  };

  const yFor = (value) => pad.top + (ADC_MAX - value) / ADC_MAX * plotH;

  const series = $('sampleSeries')?.value || 'both';

  // Líneas como ayuda visual.
  if (series === 'both' || series === 'adcf') {
    ctx.strokeStyle = '#a3ff6f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xFor(i);
      const y = yFor(p.adcf);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  if (series === 'both' || series === 'adc') {
    ctx.strokeStyle = '#45d4ff';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xFor(i);
      const y = yFor(p.adc);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Puntos reales de ADC
    points.forEach((p, i) => {
      ctx.fillStyle = '#45d4ff';
      ctx.beginPath();
      ctx.arc(xFor(i), yFor(p.adc), 2.7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (series === 'adcf') {
    // Si solo ADCf está visible, mostrar también sus puntos reales.
    points.forEach((p, i) => {
      ctx.fillStyle = '#a3ff6f';
      ctx.beginPath();
      ctx.arc(xFor(i), yFor(p.adcf), 2.7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Cursores
  drawSampleCursor(sampleCursorAIndex, '#45d4ff', 'A');
  drawSampleCursor(sampleCursorBIndex, '#ff7bd5', 'B');

  function drawSampleCursor(sourceIndex, color, label) {
    if (sourceIndex === null) return;

    const localIndex = points.findIndex(p => p.sourceIndex === sourceIndex);
    if (localIndex < 0) return;

    const point = points[localIndex];
    const x = xFor(localIndex);
    const y = series === 'adcf' ? yFor(point.adcf) : yFor(point.adc);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, height - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(label, x + 5, pad.top + 13);
  }

  // Etiquetas eje X
  ctx.fillStyle = '#718196';
  ctx.font = '10px Arial';

  const first = points[0];
  const last = points[points.length - 1];

  ctx.fillText(`k=${first.k}`, pad.left, height - 10);

  const lastText = `k=${last.k}`;
  const lastW = ctx.measureText(lastText).width;
  ctx.fillText(lastText, width - pad.right - lastW, height - 10);

  // Guardar geometría para clic.
  canvas._sampleGeometry = { points, pad, plotW, plotH, width, height };

  updateSampleCursorPanels();
}

function selectNearestSampleFromCanvas(event) {
  if (!sampleMeasureFrozen) {
    $('sampleMeasureInstruction').textContent =
      'primero pulse «Capturar para medir». Los cursores no se colocan mientras la señal está desplazándose.';
    return;
  }

  const canvas = $('sampleMeasureCanvas');
  const geom = canvas?._sampleGeometry;

  if (!canvas || !geom || geom.points.length === 0) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const relative = Math.max(0, Math.min(1, (x - geom.pad.left) / geom.plotW));

  const localIndex = Math.round(relative * Math.max(0, geom.points.length - 1));
  const point = geom.points[Math.max(0, Math.min(geom.points.length - 1, localIndex))];

  if (sampleActiveCursor === 'A') {
    sampleCursorAIndex = point.sourceIndex;
    sampleActiveCursor = 'B';
  } else {
    sampleCursorBIndex = point.sourceIndex;
    sampleActiveCursor = 'A';
  }

  updateSampleCursorButtonState();

  updateMeasurementInstructionFromCursors();
  drawSampleMeasureChart();
}

function updateSampleCursorButtonState() {
  $('sampleCursorAButton')?.classList.toggle(
    'active',
    sampleMeasureFrozen && sampleActiveCursor === 'A'
  );
  $('sampleCursorBButton')?.classList.toggle(
    'active',
    sampleMeasureFrozen && sampleActiveCursor === 'B'
  );
}

function moveSampleCursor(which, direction) {
  const historyLength = sampleMeasureHistory.length;
  if (historyLength === 0) return;

  const prop = which === 'A' ? 'A' : 'B';
  let index = which === 'A' ? sampleCursorAIndex : sampleCursorBIndex;

  if (index === null) {
    index = historyLength - 1;
  } else {
    index = Math.max(0, Math.min(historyLength - 1, index + direction));
  }

  if (which === 'A') sampleCursorAIndex = index;
  else sampleCursorBIndex = index;

  updateMeasurementInstructionFromCursors();
  drawSampleMeasureChart();
}

function updateSampleCursorPanels() {
  const a = sampleCursorAIndex !== null ? sampleMeasureHistory[sampleCursorAIndex] : null;
  const b = sampleCursorBIndex !== null ? sampleMeasureHistory[sampleCursorBIndex] : null;

  fill('A', a);
  fill('B', b);

  function fill(prefix, point) {
    $(`sample${prefix}Status`).textContent = point ? `Muestra k=${point.k}` : 'Sin seleccionar';
    $(`sample${prefix}K`).textContent = point ? point.k : '—';
    $(`sample${prefix}T`).textContent = point && Number.isFinite(point.t)
      ? `${point.t.toFixed(3)} ms`
      : '—';
    $(`sample${prefix}Adc`).textContent = point ? Math.round(point.adc) : '—';
    $(`sample${prefix}Adcf`).textContent = point ? Number(point.adcf).toFixed(1) : '—';
  }

  if (!a || !b) {
    clearSampleDeltas();
    return;
  }

  const deltaK = b.k - a.k;
  const deltaT = b.t - a.t;
  const deltaAdc = b.adc - a.adc;
  const deltaAdcf = b.adcf - a.adcf;

  $('sampleDeltaK').textContent = `${deltaK}`;
  $('sampleDeltaT').textContent = `${deltaT.toFixed(3)} ms`;
  $('sampleDeltaAdc').textContent = `${deltaAdc >= 0 ? '+' : ''}${deltaAdc.toFixed(0)}`;
  $('sampleDeltaAdcf').textContent = `${deltaAdcf >= 0 ? '+' : ''}${deltaAdcf.toFixed(1)}`;

  const i0 = Math.min(sampleCursorAIndex, sampleCursorBIndex);
  const i1 = Math.max(sampleCursorAIndex, sampleCursorBIndex);
  const interval = sampleMeasureHistory.slice(i0, i1 + 1);

  const validDt = interval
    .map(p => Number(p.dt))
    .filter(v => Number.isFinite(v) && v > 0);

  if (validDt.length) {
    const meanTs = validDt.reduce((a, b) => a + b, 0) / validDt.length;
    $('sampleMeanTs').textContent = `${meanTs.toFixed(3)} ms`;
    $('sampleMeanFs').textContent = `${(1000 / meanTs).toFixed(3)} Hz`;
  } else {
    $('sampleMeanTs').textContent = '—';
    $('sampleMeanFs').textContent = '—';
  }

  const adcValues = interval.map(p => p.adc);
  const adcfValues = interval.map(p => p.adcf);

  $('sampleAdcMin').textContent = Math.min(...adcValues).toFixed(0);
  $('sampleAdcMax').textContent = Math.max(...adcValues).toFixed(0);
  $('sampleAdcfMin').textContent = Math.min(...adcfValues).toFixed(1);
  $('sampleAdcfMax').textContent = Math.max(...adcfValues).toFixed(1);
  $('sampleIntervalCount').textContent = interval.length;
  updateMeasurementGuide();
}

function clearSampleDeltas() {
  if ($('measureTopDeltaK')) $('measureTopDeltaK').textContent = '—';
  if ($('measureTopDeltaT')) $('measureTopDeltaT').textContent = '—';
  if ($('measureTopExtra')) $('measureTopExtra').textContent = '—';

  [
    'sampleDeltaK','sampleDeltaT','sampleDeltaAdc','sampleDeltaAdcf',
    'sampleMeanTs','sampleMeanFs','sampleAdcMin','sampleAdcMax',
    'sampleAdcfMin','sampleAdcfMax','sampleIntervalCount'
  ].forEach(id => {
    if ($(id)) $(id).textContent = '—';
  });
}

function clearSampleCursors() {
  sampleCursorAIndex = null;
  sampleCursorBIndex = null;
  sampleActiveCursor = 'A';
  updateSampleCursorButtonState();

  updateMeasurementInstructionFromCursors();
  drawSampleMeasureChart();
}

function drawChart() {
  const canvas = $('chart');
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth;
  const height = 320;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, width * dpr);
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = '#090d12';
  ctx.fillRect(0, 0, width, height);

  const left = 44;
  const right = 16;
  const top = 16;
  const bottom = 32;

  ctx.font = '11px Arial';

  // Rejilla y escala vertical 0...511.
  for (let i = 0; i <= 4; i++) {
    const y = top + ((height - top - bottom) * i / 4);

    ctx.strokeStyle = '#1d2a37';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();

    ctx.fillStyle = '#718196';
    ctx.fillText(String(Math.round(ADC_MAX * (1 - i / 4))), 6, y + 4);
  }

  if (history.length < 2) {
    ctx.fillStyle = '#718196';

    const message =
      mode === 'serial'
        ? 'ESP32 conectado. Esperando más muestras seriales...'
        : mode === 'paste'
        ? 'Se necesita más de una muestra para trazar la curva.'
        : 'Inicie la simulación para registrar muestras.';

    ctx.fillText(message, left + 10, height / 2);
    return;
  }

  const dx = (width - left - right) / Math.max(1, history.length - 1);
  const yScale = (height - top - bottom) / ADC_MAX;

  // 1) ADC filtrado: línea verde continua.
  plotLine('adcf', '#a3ff6f', 2.4, []);

  // 2) ADC directo: línea celeste discontinua.
  // Si ADC y ADCf son iguales, los trazos celestes siguen siendo visibles
  // sobre la línea verde sin modificar los datos.
  plotLine('adc', '#45d4ff', 1.8, [6, 5]);

  // 3) Puntos celestes del ADC directo.
  history.forEach((point, i) => {
    const x = left + i * dx;
    const y = top + (ADC_MAX - point.adc) * yScale;

    ctx.fillStyle = '#45d4ff';
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Índices de muestra en los extremos del eje X.
  ctx.setLineDash([]);
  ctx.fillStyle = '#718196';
  const firstK = history[0].k ?? 0;
  const lastK = history[history.length - 1].k ?? (history.length - 1);
  ctx.fillText(`k=${firstK}`, left, height - 9);

  const lastText = `k=${lastK}`;
  const tw = ctx.measureText(lastText).width;
  ctx.fillText(lastText, width - right - tw, height - 9);

  function plotLine(key, color, lineWidth, dash) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.beginPath();

    history.forEach((point, i) => {
      const x = left + i * dx;
      const y = top + (ADC_MAX - point[key]) * yScale;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function animateFlow() {
  const sequence = ['pulse', 'adc', 'mv', 'filter', 'scale', 'end'];
  const totalWindow = Math.min(80, Math.max(30, Number(ts.value) * 0.8));
  const gap = totalWindow / sequence.length;

  setPulse(true);

  sequence.forEach((name, index) => {
    setTimeout(() => {
      setStep(name);
      if (name === 'end') setPulse(false);
    }, index * gap);
  });

  setTimeout(() => setStep('wait'), totalWindow + 5);
}

function setStep(name) {
  document.querySelectorAll('.step').forEach((element) => {
    element.classList.toggle('active', element.dataset.step === name);
  });
}

function clearStep() {
  document.querySelectorAll('.step').forEach((element) => {
    element.classList.remove('active');
  });
}

function setPulse(high) {
  $('gpio').textContent = high ? 'HIGH' : 'LOW';
  $('pulse').classList.toggle('high', high);
}


function resetSerialDiagnostics() {
  serialLineCount = 0;
  serialValidCount = 0;
  serialRejectedCount = 0;
  serialBytesCount = 0;
  serialChunkCount = 0;
  serialRawLines = [];

  if ($('serialBytes')) $('serialBytes').textContent = '0';
  if ($('serialChunks')) $('serialChunks').textContent = '0';
  if ($('serialLines')) $('serialLines').textContent = '0';
  if ($('serialValid')) $('serialValid').textContent = '0';
  if ($('serialRejected')) $('serialRejected').textContent = '0';
  if ($('serialUsbInfo')) $('serialUsbInfo').textContent = '—';
  if ($('serialLastK')) $('serialLastK').textContent = '—';
  if ($('serialRawMonitor')) $('serialRawMonitor').textContent = 'Esperando datos...';
}

function setSerialState(text) {
  if ($('serialState')) $('serialState').textContent = text;
}

function appendRawSerial(text) {
  if (!text) return;

  serialRawLines.push(text);

  if (serialRawLines.length > 18) {
    serialRawLines.shift();
  }

  if ($('serialRawMonitor')) {
    $('serialRawMonitor').textContent = serialRawLines.join('\n');
    $('serialRawMonitor').scrollTop = $('serialRawMonitor').scrollHeight;
  }
}

function registerSerialChunk(value) {
  const bytes = value?.byteLength ?? value?.length ?? 0;

  serialChunkCount += 1;
  serialBytesCount += bytes;

  if ($('serialChunks')) $('serialChunks').textContent = serialChunkCount;
  if ($('serialBytes')) $('serialBytes').textContent = serialBytesCount;
}

function registerSerialLine(text, valid, data = null) {
  serialLineCount += 1;

  if (valid) {
    serialValidCount += 1;
  } else {
    serialRejectedCount += 1;
  }

  if ($('serialLines')) $('serialLines').textContent = serialLineCount;
  if ($('serialValid')) $('serialValid').textContent = serialValidCount;
  if ($('serialRejected')) $('serialRejected').textContent = serialRejectedCount;

  if (data && $('serialLastK')) {
    $('serialLastK').textContent = data.k;
  }

  appendRawSerial(text);
}

function clearSerialVisualization() {
  history.length = 0;
  serialDtHistory.length = 0;
  sampleMeasureHistory.length = 0;
  sampleCursorAIndex = null;
  sampleCursorBIndex = null;
  sampleMeasureFrozen = false;

  drawChart();
  drawSampleMeasureChart();
  updateDataSummary();
  updateSampleCursorPanels();
  updateSampleCursorButtonState();

  $('line').textContent = 'Datos seriales limpiados. Esperando nuevas muestras...';
}

async function resetEsp32Normal() {
  if (!serialPort) {
    setSerialState('Conecte primero el ESP32');
    return;
  }

  if (typeof serialPort.setSignals !== 'function') {
    setSerialState('El navegador no permite controlar RTS/DTR');
    return;
  }

  try {
    setSerialState('Reiniciando ESP32...');

    // Reset normal para ESP32 clásico con puente USB-UART:
    // GPIO0/DTR permanece desactivado y EN/RTS se pulsa brevemente.
    await serialPort.setSignals({
      dataTerminalReady: false,
      requestToSend: true
    });

    await new Promise((resolve) => setTimeout(resolve, 120));

    await serialPort.setSignals({
      dataTerminalReady: false,
      requestToSend: false
    });

    await new Promise((resolve) => setTimeout(resolve, 900));

    setSerialState('ESP32 reiniciado · esperando datos');

  } catch (error) {
    setSerialState(`Error al reiniciar: ${error.message}`);
    appendRawSerial(`[ERROR RESET] ${error.message}`);
  }
}

async function readSerialLoop() {
  const decoder = new TextDecoder();
  let textBuffer = '';

  while (serialReading && serialPort && serialPort.readable) {
    let reader = null;

    try {
      reader = serialPort.readable.getReader();
      serialReader = reader;

      while (serialReading) {
        const { value, done } = await reader.read();

        if (done) break;
        if (!value) continue;

        registerSerialChunk(value);

        textBuffer += decoder.decode(value, { stream: true });

        // Extraer líneas completas; conservar el fragmento incompleto.
        const lines = textBuffer.split(/\r\n|\n|\r/);
        textBuffer = lines.pop() || '';

        for (const rawText of lines) {
          const text = rawText.trim();

          if (!text) continue;

          const data = parseLine(text);
          registerSerialLine(text, Boolean(data), data);

          if (!data) {
            // Los mensajes de arranque del ESP32 también se muestran
            // en el monitor crudo, aunque no se grafiquen.
            continue;
          }

          setSerialState(`Recibiendo datos · k=${data.k}`);

          updateDisplay(data, text);
          pushHistory(data);

          // En modo Serial NO se simula GPIO25.
          // La recepción de la muestra se informa mediante texto estable.
          updateFlowPresentation();
          updateSerialSampleIndicator(data);
        }
      }

    } catch (error) {
      if (!serialReading) break;

      appendRawSerial(`[ERROR LECTURA] ${error.message}`);
      setSerialState(`Error de lectura: ${error.message}`);

      // Los errores no fatales pueden recuperarse obteniendo otro reader.
      await new Promise((resolve) => setTimeout(resolve, 150));

    } finally {
      if (reader) {
        try {
          reader.releaseLock();
        } catch (_) {}
      }

      if (serialReader === reader) {
        serialReader = null;
      }
    }
  }
}

async function connectSerial() {
  if (!('serial' in navigator)) {
    $('line').textContent =
      'Web Serial no disponible. Use Chrome o Edge.';
    setSerialState('Web Serial no compatible');
    return;
  }

  if (serialPort && serialReading) {
    setSerialState('Ya está conectado');
    return;
  }

  resetSerialDiagnostics();
  clearSerialVisualization();

  try {
    serialPort = await navigator.serial.requestPort();

    const info = serialPort.getInfo ? serialPort.getInfo() : {};
    const vid = info.usbVendorId != null
      ? info.usbVendorId.toString(16).padStart(4, '0').toUpperCase()
      : '----';
    const pid = info.usbProductId != null
      ? info.usbProductId.toString(16).padStart(4, '0').toUpperCase()
      : '----';

    if ($('serialUsbInfo')) {
      $('serialUsbInfo').textContent = `${vid}:${pid}`;
    }

    await serialPort.open({
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 4096
    });

    serialReading = true;

    // La conexión Serial solo abre el puerto y comienza a leer.
    // NO se manipulan RTS/DTR ni se reinicia automáticamente el ESP32.
    // El botón "Reiniciar ESP32" queda disponible como acción manual.
    serialLoopPromise = readSerialLoop();

    $('modeBadge').textContent = 'ESP32 CONECTADO';
    setSerialState('Conectado · esperando datos');
    $('line').textContent = 'Puerto Serial abierto a 115200 baudios. Esperando la primera muestra...';

    updateFlowPresentation();
    drawChart();

  } catch (error) {
    serialReading = false;
    $('line').textContent = `Error serial: ${error.message}`;
    $('modeBadge').textContent = 'ERROR SERIAL';
    setSerialState(`Error: ${error.message}`);
    appendRawSerial(`[ERROR CONEXIÓN] ${error.message}`);

    if (serialPort) {
      try {
        await serialPort.close();
      } catch (_) {}
      serialPort = null;
    }
  }
}

async function disconnectSerial() {
  serialReading = false;

  try {
    if (serialReader) {
      try {
        await serialReader.cancel();
      } catch (_) {}
    }

    if (serialLoopPromise) {
      try {
        await serialLoopPromise;
      } catch (_) {}
      serialLoopPromise = null;
    }

    if (serialPort) {
      try {
        await serialPort.close();
      } catch (_) {}

      serialPort = null;
    }

    serialReader = null;
    serialDtHistory.length = 0;
    studentLastData = null;
    updateStudentRecordAvailability();

    $('modeBadge').textContent = 'SERIAL ESP32';
    setSerialState('Desconectado');
    updateFlowPresentation();
    drawChart();

  } catch (error) {
    $('line').textContent = `Error al desconectar: ${error.message}`;
    setSerialState(`Error: ${error.message}`);
  }
}

window.addEventListener('resize', () => {
  drawChart();
  drawScope();
  drawSampleMeasureChart();
});

setPotValue(Number(pot.value));
setTsValue(Number(ts.value));
setMode('serial');

history.length = 0;
sampleMeasureHistory.length = 0;
serialDtHistory.length = 0;
studentLastData = null;

resetStudentVisibleValues();
renderStudentRecords();
clearSerialVisualization();

setScopeRunState('run');
drawScope();
updateSampleCursorButtonState();
setSampleMeasurePurpose('free');
setSampleMeasurementMode(false);
drawSampleMeasureChart();
updateStudentRecordAvailability();
initContextHelp();
