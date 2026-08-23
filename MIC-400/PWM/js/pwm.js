const dutySlider = document.getElementById('duty');
const freqSlider = document.getElementById('frequency');
const resolutionSelect = document.getElementById('resolution');
const presetButtons = document.querySelectorAll('.preset-btn');
const dutyControls = document.querySelectorAll('.duty-sync');

const dutyText = document.getElementById('dutyText');
const freqText = document.getElementById('freqText');
const resText = document.getElementById('resText');
const periodText = document.getElementById('periodText');
const tonText = document.getElementById('tonText');
const toffText = document.getElementById('toffText');
const ledcText = document.getElementById('ledcText');
const ledcPercentText = document.getElementById('ledcPercentText');
const windowText = document.getElementById('windowText');

const realDutyInfo = document.getElementById('realDutyInfo');
const zoomDutyInfo = document.getElementById('zoomDutyInfo');
const resolutionDutyInfo = document.getElementById('resolutionDutyInfo');
const unifiedDutyInfo = document.getElementById('unifiedDutyInfo');

const realScaleCanvas = document.getElementById('realScaleCanvas');
const singlePeriodCanvas = document.getElementById('singlePeriodCanvas');
const resolutionCanvas = document.getElementById('resolutionCanvas');
const unifiedCanvas = document.getElementById('unifiedCanvas');
const ctxReal = realScaleCanvas.getContext('2d');
const ctxZoom = singlePeriodCanvas.getContext('2d');
const ctxResolution = resolutionCanvas.getContext('2d');
const ctxUnified = unifiedCanvas.getContext('2d');

const miniLeds = document.querySelectorAll('.mini-led');

function formatFrequency(hz) {
  if (hz >= 1000) return `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 2)} kHz`;
  return `${hz} Hz`;
}
function formatTime(seconds) {
  if (seconds === 0) return '0 ms';

  // Mantiene una unidad coherente para Periodo, Ton y Toff.
  // Evita mezclar ms y µs dentro del mismo periodo.
  if (seconds >= 1) {
    return `${seconds.toFixed(3)} s`;
  }

  if (seconds >= 1e-3) {
    return `${(seconds * 1000).toFixed(3)} ms`;
  }

  return `${(seconds * 1000000).toFixed(3)} µs`;
}
function chooseWindowSeconds(freqHz) {
  // Mantiene aproximadamente cinco periodos visibles en la vista real
  const period = 1 / freqHz;
  const window = period * 5;

  // Evita ventanas demasiado pequeñas o demasiado grandes para la visualización
  if (window > 5) return 5;
  if (window < 0.0001) return 0.0001;
  return window;
}
function resizeCanvasToDisplaySize(canvas, height) {
  const width = Math.max(320, Math.floor(canvas.clientWidth));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}
function drawAxes(ctx, width, height, left, top, plotWidth, plotHeight, timeEnd) {
  const bgGrid = 'rgba(144, 186, 242, 0.14)';
  const axis = '#b8c9e4';
  const labels = '#d9e6fb';
  ctx.lineWidth = 1;
  ctx.strokeStyle = bgGrid;
  ctx.fillStyle = labels;
  ctx.font = '12px Arial';
  for (let i = 0; i <= 4; i++) {
    const y = top + (plotHeight / 4) * i;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotWidth, y); ctx.stroke();
  }
  for (let i = 0; i <= 5; i++) {
    const x = left + (plotWidth / 5) * i;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotHeight); ctx.stroke();
    const timeValue = timeEnd * (i / 5);
    ctx.fillText(formatTime(timeValue), x - 18, top + plotHeight + 20);
  }
  ctx.strokeStyle = axis;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(left, top); ctx.lineTo(left, top + plotHeight); ctx.lineTo(left + plotWidth, top + plotHeight); ctx.stroke();
  ctx.fillText('3.3 V', left - 36, top + 4);
  ctx.fillText('1.65 V', left - 42, top + plotHeight / 2 + 4);
  ctx.fillText('0 V', left - 22, top + plotHeight + 4);
  ctx.fillText('Tiempo', left + plotWidth / 2 - 16, top + plotHeight + 40);
}
function drawPwmWave(ctx, canvas, totalTime, period, ton, dutyPercent, dutyValue, maxValue, mode) {
  resizeCanvasToDisplaySize(canvas, mode === 'real' ? 270 : 290);
  const width = canvas.width, height = canvas.height;
  const left = 50, top = 18, plotWidth = width - 78, plotHeight = height - 48;
  const yHigh = top + 18, yLow = top + plotHeight - 18, plotRight = left + plotWidth;
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, left, top, plotWidth, plotHeight, totalTime);
  if (mode === 'zoom') {
    const onWidth = plotWidth * (ton / period);
    ctx.fillStyle = 'rgba(111,221,111,0.12)'; ctx.fillRect(left, top, onWidth, plotHeight);
    ctx.fillStyle = 'rgba(255,124,124,0.10)'; ctx.fillRect(left + onWidth, top, plotWidth - onWidth, plotHeight);
  }
  ctx.strokeStyle = '#84f268'; ctx.lineWidth = 2.5; ctx.beginPath();
  if (dutyPercent <= 0) {
    ctx.moveTo(left, yLow); ctx.lineTo(plotRight, yLow);
  } else if (dutyPercent >= 100) {
    ctx.moveTo(left, yHigh); ctx.lineTo(plotRight, yHigh);
  } else {
    let t = 0, started = false;
    while (t < totalTime) {
      const x1 = left + (t / totalTime) * plotWidth;
      const x2 = left + ((t + ton) / totalTime) * plotWidth;
      const x3 = left + (Math.min(t + period, totalTime) / totalTime) * plotWidth;
      if (!started) { ctx.moveTo(x1, yLow); ctx.lineTo(x1, yHigh); started = true; }
      else { ctx.lineTo(x1, yLow); ctx.lineTo(x1, yHigh); }
      ctx.lineTo(x2, yHigh); ctx.lineTo(x2, yLow); ctx.lineTo(x3, yLow);
      t += period;
    }
  }
  ctx.stroke();
  ctx.font = 'bold 12px Arial';
  if (mode === 'zoom') {
    const onMidX = left + (ton / period) * plotWidth / 2;
    const offMidX = left + ((ton / period) + (1 - ton / period) / 2) * plotWidth;
    ctx.fillStyle = '#84f268'; ctx.fillText(`Ton = ${formatTime(ton)}`, onMidX - 38, top - 6);
    ctx.fillStyle = '#ff9f9f'; ctx.fillText(`Toff = ${formatTime(period - ton)}`, offMidX - 44, top - 6);
  } else {
    ctx.fillStyle = '#dce7fb'; ctx.fillText(`Valor PWM = ${dutyValue}/${maxValue}`, plotRight - 100, top - 6);
  }
}
function drawResolutionPWM(value, maxValue, bits) {
  resizeCanvasToDisplaySize(resolutionCanvas, 230);
  const width = resolutionCanvas.width, height = resolutionCanvas.height;
  ctxResolution.clearRect(0,0,width,height);
  const left = 62, right = width - 38, y = 138;
  ctxResolution.strokeStyle = '#8aa0bd'; ctxResolution.lineWidth = 1.6;
  ctxResolution.beginPath(); ctxResolution.moveTo(left,y); ctxResolution.lineTo(right,y); ctxResolution.stroke();
  for(let i=0;i<=10;i++){
    const x=left+((right-left)*i/10);
    ctxResolution.beginPath(); ctxResolution.moveTo(x,y-7); ctxResolution.lineTo(x,y+7); ctxResolution.stroke();
  }
  const x=left+(value/maxValue)*(right-left);
  ctxResolution.fillStyle='#ffd54a'; ctxResolution.beginPath(); ctxResolution.arc(x,y,10,0,Math.PI*2); ctxResolution.fill();
  ctxResolution.fillStyle='white'; ctxResolution.font='13px Arial';
  ctxResolution.fillText(`Valor actual: ${value}/${maxValue} (${bits} bits)`, 72, 48);
  ctxResolution.fillText(`Trabajo: ${((value/maxValue)*100).toFixed(2)} %`, 72, 68);
  ctxResolution.fillText('0', left-4, y+25); ctxResolution.fillText(maxValue, right-20, y+25); ctxResolution.fillText(value, x-10, y-22);
}

function drawUnified(canvas, dutyPercent, period, ton, dutyValue, maxValue, bits) {
  resizeCanvasToDisplaySize(canvas, 260);
  const ctx = ctxUnified;
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const left = 62;
  const right = width - 42;
  const span = right - left;

  const titlePwmY = 26;
  const pwmAxisTop = 42;
  const pwmHighY = 64;
  const pwmLowY = 118;
  const titleLedcY = 146;
  const ledcY = 192;

  const dutyRatio = dutyPercent / 100;
  const dutyX = left + span * dutyRatio;

  ctx.fillStyle = '#dce7fb';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Señal PWM (1 periodo)', 16, titlePwmY);
  ctx.fillText('Valor PWM', 16, titleLedcY);

  // PWM axes and shared width
  ctx.strokeStyle = 'rgba(144,186,242,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, pwmAxisTop);
  ctx.lineTo(left, pwmLowY + 8);
  ctx.lineTo(right, pwmLowY + 8);
  ctx.stroke();

  ctx.fillStyle = '#d9e6fb';
  ctx.font = '12px Arial';
  ctx.fillText('3.3 V', 16, pwmHighY + 2);
  ctx.fillText('0 V', 28, pwmLowY + 8);

  // PWM shaded regions using same width as PWM scale
  ctx.fillStyle = 'rgba(111,221,111,0.12)';
  ctx.fillRect(left, pwmAxisTop, span * dutyRatio, pwmLowY - pwmAxisTop);
  ctx.fillStyle = 'rgba(255,124,124,0.10)';
  ctx.fillRect(dutyX, pwmAxisTop, span * (1 - dutyRatio), pwmLowY - pwmAxisTop);

  // PWM waveform
  ctx.strokeStyle = '#84f268';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (dutyPercent <= 0) {
    ctx.moveTo(left, pwmLowY);
    ctx.lineTo(right, pwmLowY);
  } else if (dutyPercent >= 100) {
    ctx.moveTo(left, pwmHighY);
    ctx.lineTo(right, pwmHighY);
  } else {
    ctx.moveTo(left, pwmLowY);
    ctx.lineTo(left, pwmHighY);
    ctx.lineTo(dutyX, pwmHighY);
    ctx.lineTo(dutyX, pwmLowY);
    ctx.lineTo(right, pwmLowY);
  }
  ctx.stroke();

  // Labels Ton / Toff
  ctx.font = 'bold 12px Arial';
  if (dutyPercent > 0) {
    const tonLabelX = left + Math.max(16, (span * dutyRatio) / 2 - 40);
    ctx.fillStyle = '#84f268';
    ctx.fillText(`Ton = ${formatTime(ton)}`, tonLabelX, pwmAxisTop - 6);
  } else {
    ctx.fillStyle = '#84f268';
    ctx.fillText('Ton = 0.000 ns', left + 12, pwmAxisTop - 6);
  }
  if (dutyPercent < 100) {
    const offStart = dutyX;
    const offWidth = span * (1 - dutyRatio);
    const toffLabelX = Math.min(right - 110, offStart + Math.max(12, offWidth / 2 - 45));
    ctx.fillStyle = '#ff9f9f';
    ctx.fillText(`Toff = ${formatTime(period - ton)}`, toffLabelX, pwmAxisTop - 6);
  } else {
    ctx.fillStyle = '#ff9f9f';
    ctx.fillText('Toff = 0.000 ns', right - 110, pwmAxisTop - 6);
  }

  // Shared mapping connector
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = '#8aa0bd';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(dutyX, pwmLowY + 12);
  ctx.lineTo(dutyX, ledcY - 16);
  ctx.stroke();
  ctx.restore();

  // PWM scale with exact same width as PWM period
  ctx.strokeStyle = '#8aa0bd';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(left, ledcY);
  ctx.lineTo(right, ledcY);
  ctx.stroke();

  for (let i = 0; i <= 10; i++) {
    const x = left + (span * i / 10);
    ctx.beginPath();
    ctx.moveTo(x, ledcY - 7);
    ctx.lineTo(x, ledcY + 7);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.arc(dutyX, ledcY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('0', left - 4, ledcY + 24);
  ctx.fillText(maxValue, right - 20, ledcY + 24);
  ctx.fillText(`${dutyValue}/${maxValue}`, Math.min(right - 64, dutyX + 8), ledcY - 14);
  ctx.fillText(`Resolución: ${bits} bits`, 16, height - 16);
  ctx.fillText(`Trabajo real: ${((dutyValue / maxValue) * 100).toFixed(2)} %`, width - 170, height - 16);
}
function updatePresetButtons(freq) { presetButtons.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.freq) === freq)); }
function updateMiniLeds(dutyPercent) {
  const alpha = 0.08 + (dutyPercent / 100) * 0.92;
  const shadow = 4 + (dutyPercent / 100) * 18;
  miniLeds.forEach(led => {
    led.style.background = `rgba(255, 231, 76, ${alpha})`;
    led.style.boxShadow = `0 0 ${shadow}px rgba(255, 231, 76, ${0.15 + (dutyPercent / 100) * 0.65})`;
  });
}
function update() {
  const duty = Number(dutySlider.value), freq = Number(freqSlider.value), bits = Number(resolutionSelect.value);
  const period = 1 / freq, ton = period * (duty / 100), toff = period - ton;
  const maxValue = (2 ** bits) - 1, dutyValue = Math.round((duty / 100) * maxValue);
  const realWindow = chooseWindowSeconds(freq), realPercent = ((dutyValue / maxValue) * 100).toFixed(2);
  dutyText.textContent = `${duty} %`; freqText.textContent = formatFrequency(freq); resText.textContent = `${bits} bits`;
  periodText.textContent = formatTime(period); tonText.textContent = formatTime(ton); toffText.textContent = formatTime(toff);
  ledcText.textContent = `${dutyValue} / ${maxValue}`; ledcPercentText.textContent = `(${realPercent} %)`; windowText.textContent = `Ventana: ${formatTime(realWindow)}`;
  const infoText = `Duty = ${duty}% | Valor PWM = ${dutyValue}/${maxValue}`;
  realDutyInfo.textContent = infoText; zoomDutyInfo.textContent = infoText; resolutionDutyInfo.textContent = infoText; unifiedDutyInfo.textContent = infoText;
  updateMiniLeds(duty);
  drawPwmWave(ctxReal, realScaleCanvas, realWindow, period, ton, duty, dutyValue, maxValue, 'real');
  drawPwmWave(ctxZoom, singlePeriodCanvas, period, period, ton, duty, dutyValue, maxValue, 'zoom');
  drawResolutionPWM(dutyValue, maxValue, bits);
  drawUnified(unifiedCanvas, duty, period, ton, dutyValue, maxValue, bits);
  updatePresetButtons(freq);
}
function syncDuty(value) { dutyControls.forEach(control => { control.value = value; }); dutySlider.value = value; update(); }
dutyControls.forEach(control => control.addEventListener('input', function(){ syncDuty(this.value); }));
freqSlider.addEventListener('input', update); resolutionSelect.addEventListener('change', update);
presetButtons.forEach(btn => btn.addEventListener('pointerdown', (event) => { event.preventDefault(); freqSlider.value = Number(btn.dataset.freq); update(); }));
window.addEventListener('resize', update);
update();
