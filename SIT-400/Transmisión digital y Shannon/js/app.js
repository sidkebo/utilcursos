(() => {
  const $ = (id) => document.getElementById(id);
  const fmt = (value, digits = 1) => Number(value).toLocaleString('es-BO', { maximumFractionDigits: digits });

  // Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active-panel'));
      btn.classList.add('active');
      $(btn.dataset.tab).classList.add('active-panel');
    });
  });

  // -------------------- 1. Cuantificación --------------------
  const qBits = $('qBits');
  const qSample = $('qSample');

  function updateQuantization() {
    const n = Number(qBits.value);
    const sample = Number(qSample.value);
    const vMin = 0;
    const vMax = 8;
    const levels = 2 ** n;
    const delta = (vMax - vMin) / levels;
    const inside = sample >= vMin && sample < vMax;

    let index = inside ? Math.floor((sample - vMin) / delta) : (sample < vMin ? 0 : levels - 1);
    index = Math.max(0, Math.min(levels - 1, index));

    const low = vMin + index * delta;
    const high = low + delta;
    const represented = low + delta / 2;
    const error = sample - represented;
    const code = index.toString(2).padStart(n, '0');

    $('qBitsOut').textContent = n;
    $('qSampleOut').textContent = `${fmt(sample, 1)} V`;
    $('qLevels').textContent = levels;
    $('qDelta').textContent = `${fmt(delta, 3)} V`;
    $('qIndex').textContent = index;
    $('qCode').textContent = inside ? code : `${code} (extremo)`;
    $('qRep').textContent = `${fmt(represented, 3)} V`;
    $('qError').textContent = inside ? `${fmt(error, 3)} V` : 'fuera de rango';

    const status = $('qStatus');
    status.className = `status-box ${inside ? 'ok' : 'bad'}`;
    status.textContent = inside ? 'Dentro del rango' : 'Fuera del rango → saturación';

    drawQuantization(levels, delta, sample, represented, inside);
  }

  function drawQuantization(levels, delta, sample, represented, inside) {
    const group = $('quantSteps');
    group.innerHTML = '';

    const x0 = 70, y0 = 285, w = 770, h = 235;
    const xFor = v => x0 + (Math.max(0, Math.min(8, v)) / 8) * w;
    const yFor = v => y0 - (Math.max(0, Math.min(8, v)) / 8) * h;

    for (let i = 0; i < levels; i++) {
      const low = i * delta;
      const high = (i + 1) * delta;
      const mid = low + delta / 2;

      const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hLine.setAttribute('x1', xFor(low));
      hLine.setAttribute('x2', xFor(high));
      hLine.setAttribute('y1', yFor(mid));
      hLine.setAttribute('y2', yFor(mid));
      hLine.setAttribute('class', 'quant-step');
      group.appendChild(hLine);

      if (i < levels - 1) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xFor(high));
        vLine.setAttribute('x2', xFor(high));
        vLine.setAttribute('y1', yFor(mid));
        vLine.setAttribute('y2', yFor(mid + delta));
        vLine.setAttribute('class', 'quant-step');
        group.appendChild(vLine);
      }
    }

    const sampleShown = Math.max(0, Math.min(8, sample));
    const x = xFor(sampleShown);
    const yReal = yFor(sampleShown);
    const yRep = yFor(represented);

    $('sampleGuide').setAttribute('x1', x);
    $('sampleGuide').setAttribute('x2', x);
    $('realDot').setAttribute('cx', x);
    $('realDot').setAttribute('cy', yReal);
    $('repDot').setAttribute('cx', x);
    $('repDot').setAttribute('cy', yRep);

    $('realLabel').setAttribute('x', Math.min(760, Math.max(75, x + 10)));
    $('realLabel').setAttribute('y', Math.max(28, yReal - 10));
    $('realLabel').textContent = `${fmt(sample, 1)} V${inside ? '' : ' · SAT'}`;

    $('repLabel').setAttribute('x', Math.min(760, Math.max(75, x + 10)));
    $('repLabel').setAttribute('y', Math.min(280, yRep + 20));
    $('repLabel').textContent = `${fmt(represented, 3)} V`;
  }

  qBits.addEventListener('input', updateQuantization);
  qSample.addEventListener('input', updateQuantization);

  // -------------------- 2. Velocidad binaria --------------------
  const rbFs = $('rbFs');
  const rbBits = $('rbBits');

  function updateBitRate() {
    const fs = Number(rbFs.value);
    const n = Number(rbBits.value);
    const rb = fs * n;

    $('rbFsOut').textContent = `${fmt(fs, 0)} muestras/s`;
    $('rbBitsOut').textContent = `${n} bits/muestra`;
    $('rbCalc1').innerHTML = `R<sub>b</sub> = ${fmt(fs, 0)} × ${n}`;
    $('rbCalc2').innerHTML = `R<sub>b</sub> = ${fmt(rb, 0)} bit/s`;
    $('rbCalc3').textContent = `${fmt(rb / 1000, 2)} kbit/s`;
    $('rbBarText').textContent = `${fmt(rb / 1000, 2)} kbit/s`;
    $('rbBar').style.width = `${Math.min(100, (rb / 320000) * 100)}%`;
  }

  rbFs.addEventListener('input', updateBitRate);
  rbBits.addEventListener('input', updateBitRate);

  // -------------------- 3. Shannon --------------------
  const shB = $('shB');
  const shSnr = $('shSnr');

  function shannonCapacity(bKHz, snrDb) {
    const B = bKHz * 1000;
    const snLinear = 10 ** (snrDb / 10);
    const capacity = B * Math.log2(1 + snLinear);
    return { B, snLinear, capacity };
  }

  function updateShannon() {
    const bKHz = Number(shB.value);
    const snrDb = Number(shSnr.value);
    const { B, snLinear, capacity } = shannonCapacity(bKHz, snrDb);

    $('shBOut').textContent = `${bKHz} kHz`;
    $('shSnrOut').textContent = `${snrDb} dB`;
    $('shLine1').textContent = `S/N = ${fmt(snLinear, 2)}`;
    $('shLine2').innerHTML = `C = ${fmt(B, 0)} × log<sub>2</sub>(${fmt(1 + snLinear, 2)})`;
    $('shResult').textContent = `${fmt(capacity / 1000, 2)} kbit/s`;
  }

  shB.addEventListener('input', updateShannon);
  shSnr.addEventListener('input', updateShannon);

  // -------------------- 4. Comparar --------------------
  const cmpFs = $('cmpFs');
  const cmpBits = $('cmpBits');
  const cmpB = $('cmpB');
  const cmpSnr = $('cmpSnr');

  const cmpFsNumber = $('cmpFsNumber');
  const cmpBitsNumber = $('cmpBitsNumber');
  const cmpBNumber = $('cmpBNumber');
  const cmpSnrNumber = $('cmpSnrNumber');

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function safeNumber(input, fallback) {
    const value = Number(input.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function syncRangeFromNumber(numberInput, rangeInput) {
    const value = safeNumber(numberInput, Number(rangeInput.value));
    const min = Number(rangeInput.min);
    const max = Number(rangeInput.max);
    rangeInput.value = clamp(value, min, max);
  }

  function setCompareValue(rangeInput, numberInput, value, digits = 6) {
    if (!Number.isFinite(value)) return false;
    const numberMin = numberInput.min === '' ? -Infinity : Number(numberInput.min);
    const numberMax = numberInput.max === '' ? Infinity : Number(numberInput.max);
    const applied = clamp(value, numberMin, numberMax);
    numberInput.value = Number(applied.toFixed(digits));
    syncRangeFromNumber(numberInput, rangeInput);
    return Math.abs(applied - value) < Math.max(1e-9, Math.abs(value) * 1e-9);
  }

  function getCompareValues() {
    const fs = Math.max(1, safeNumber(cmpFsNumber, 8000));
    const n = Math.max(1, safeNumber(cmpBitsNumber, 8));
    const bKHz = Math.max(0.000001, safeNumber(cmpBNumber, 10));
    const snrDb = safeNumber(cmpSnrNumber, 20);
    return { fs, n, bKHz, snrDb };
  }

  function updateCompare() {
    const { fs, n, bKHz, snrDb } = getCompareValues();

    const rb = fs * n;
    const { capacity } = shannonCapacity(bKHz, snrDb);
    const sufficient = rb <= capacity + Math.max(1e-9, capacity * 1e-12);

    $('cmpFsOut').textContent = `${fmt(fs, 3)} muestras/s`;
    $('cmpBitsOut').textContent = `${fmt(n, 3)} bits/muestra`;
    $('cmpBOut').textContent = `${fmt(bKHz, 6)} kHz`;
    $('cmpSnrOut').textContent = `${fmt(snrDb, 6)} dB`;

    const rbK = rb / 1000;
    const cK = capacity / 1000;
    $('cmpRb').textContent = `${fmt(rbK, 3)} kbit/s`;
    $('cmpC').textContent = `${fmt(cK, 3)} kbit/s`;
    $('cmpRbText').textContent = `${fmt(rbK, 3)} kbit/s`;
    $('cmpCText').textContent = `${fmt(cK, 3)} kbit/s`;

    const max = Math.max(rb, capacity, 1);
    $('cmpRbBar').style.width = `${(rb / max) * 100}%`;
    $('cmpCBar').style.width = `${(capacity / max) * 100}%`;

    $('compareExpression').textContent = `${fmt(rbK, 3)} ${sufficient ? '≤' : '>'} ${fmt(cK, 3)} kbit/s`;
    $('compareMessage').textContent = sufficient
      ? 'Cumple el límite teórico de Shannon.'
      : 'No cumple: Rb supera la capacidad C.';

    const decision = $('compareDecision');
    decision.className = `decision ${sufficient ? 'good' : 'bad'}`;
  }

  function bindRangeAndNumber(rangeInput, numberInput) {
    rangeInput.addEventListener('input', () => {
      numberInput.value = rangeInput.value;
      updateCompare();
    });

    numberInput.addEventListener('input', () => {
      const value = Number(numberInput.value);
      if (!Number.isFinite(value)) return;
      syncRangeFromNumber(numberInput, rangeInput);
      updateCompare();
    });

    numberInput.addEventListener('change', () => {
      let value = Number(numberInput.value);
      if (!Number.isFinite(value)) value = Number(rangeInput.value);
      const min = numberInput.min === '' ? -Infinity : Number(numberInput.min);
      const max = numberInput.max === '' ? Infinity : Number(numberInput.max);
      value = clamp(value, min, max);
      numberInput.value = value;
      syncRangeFromNumber(numberInput, rangeInput);
      updateCompare();
    });
  }

  bindRangeAndNumber(cmpFs, cmpFsNumber);
  bindRangeAndNumber(cmpBits, cmpBitsNumber);
  bindRangeAndNumber(cmpB, cmpBNumber);
  bindRangeAndNumber(cmpSnr, cmpSnrNumber);

  function applyPreset(fs, n, bKHz, snrDb, message) {
    setCompareValue(cmpFs, cmpFsNumber, fs, 3);
    setCompareValue(cmpBits, cmpBitsNumber, n, 3);
    setCompareValue(cmpB, cmpBNumber, bKHz, 6);
    setCompareValue(cmpSnr, cmpSnrNumber, snrDb, 6);
    updateCompare();
    $('solverResult').textContent = message;
  }

  $('presetBad').addEventListener('click', () => {
    applyPreset(8000, 8, 3, 10, 'Ejemplo cargado: Rb es mayor que C.');
  });

  $('presetGood').addEventListener('click', () => {
    applyPreset(4000, 4, 10, 20, 'Ejemplo cargado: Rb es menor que C.');
  });

  // ----- Calculadores de valores límite -----
  $('solveB').addEventListener('click', () => {
    const { fs, n, snrDb } = getCompareValues();
    const rb = fs * n;
    const snLinear = 10 ** (snrDb / 10);
    const efficiency = Math.log2(1 + snLinear);

    if (!Number.isFinite(efficiency) || efficiency <= 0) {
      $('solverResult').textContent = 'No se puede calcular B mínimo con el SNR actual.';
      return;
    }

    const bMinKHz = (rb / efficiency) / 1000;
    const bApplied = Math.ceil(bMinKHz * 1e6) / 1e6;
    const applied = setCompareValue(cmpB, cmpBNumber, bApplied, 6);
    updateCompare();

    $('solverResult').innerHTML = applied
      ? `<strong>B mínimo ≈ ${fmt(bMinKHz, 6)} kHz</strong> · se aplica ${fmt(bApplied, 6)} kHz para asegurar Rb ≤ C.`
      : `<strong>B mínimo teórico ≈ ${fmt(bMinKHz, 6)} kHz</strong> · supera el rango permitido por el campo.`;
  });

  $('solveSnr').addEventListener('click', () => {
    const { fs, n, bKHz } = getCompareValues();
    const rb = fs * n;
    const B = bKHz * 1000;
    const exponent = rb / B;

    if (!Number.isFinite(exponent) || exponent > 1023) {
      $('solverResult').textContent = 'El SNR mínimo requerido es demasiado grande para calcularlo numéricamente con estos datos.';
      return;
    }

    const snLinearMin = 2 ** exponent - 1;
    const snrMinDb = snLinearMin <= 0 ? -Infinity : 10 * Math.log10(snLinearMin);

    if (!Number.isFinite(snrMinDb)) {
      $('solverResult').textContent = 'No se puede obtener un SNR mínimo finito con estos datos.';
      return;
    }

    const snrApplied = Math.ceil(snrMinDb * 1e6) / 1e6;
    const applied = setCompareValue(cmpSnr, cmpSnrNumber, snrApplied, 6);
    updateCompare();

    $('solverResult').innerHTML = applied
      ? `<strong>SNR mínimo ≈ ${fmt(snrMinDb, 6)} dB</strong> · se aplica ${fmt(snrApplied, 6)} dB para asegurar Rb ≤ C.`
      : `<strong>SNR mínimo teórico ≈ ${fmt(snrMinDb, 6)} dB</strong> · supera el rango permitido por el campo.`;
  });

  $('solveFs').addEventListener('click', () => {
    const { n, bKHz, snrDb } = getCompareValues();
    const { capacity } = shannonCapacity(bKHz, snrDb);
    const fsMaxExact = capacity / n;
    const fsMax = Math.max(1, Math.floor(fsMaxExact));

    const applied = setCompareValue(cmpFs, cmpFsNumber, fsMax, 0);
    updateCompare();

    $('solverResult').innerHTML = applied
      ? `<strong>f<sub>s</sub> máximo = ${fmt(fsMax, 0)} muestras/s</strong> · se redondea hacia abajo para no superar C.`
      : `<strong>f<sub>s</sub> máximo teórico = ${fmt(fsMax, 0)} muestras/s</strong> · supera el rango permitido por el campo.`;
  });

  $('solveBits').addEventListener('click', () => {
    const { fs, bKHz, snrDb } = getCompareValues();
    const { capacity } = shannonCapacity(bKHz, snrDb);
    const nMax = Math.floor(capacity / fs);

    if (nMax < 1) {
      setCompareValue(cmpBits, cmpBitsNumber, 1, 0);
      updateCompare();
      $('solverResult').innerHTML = '<strong>No existe n ≥ 1 que cumpla.</strong> Incluso con 1 bit/muestra, Rb supera C. Aumenta B o SNR, o reduce f<sub>s</sub>.';
      return;
    }

    const applied = setCompareValue(cmpBits, cmpBitsNumber, nMax, 0);
    updateCompare();

    $('solverResult').innerHTML = applied
      ? `<strong>n máximo = ${fmt(nMax, 0)} bits/muestra</strong> · máximo entero que mantiene Rb ≤ C.`
      : `<strong>n máximo teórico = ${fmt(nMax, 0)} bits/muestra</strong> · supera el rango permitido por el campo.`;
  });

  updateQuantization();
  updateBitRate();
  updateShannon();
  updateCompare();
})();
