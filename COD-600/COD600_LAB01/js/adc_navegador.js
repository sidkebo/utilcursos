
(() => {
  "use strict";

  const vin = document.getElementById("vin");
  const vfs = document.getElementById("vfs");
  const marker = document.getElementById("adcNavMarker");
  const markerLabel = document.getElementById("adcNavMarkerLabel");
  const navWindow = document.getElementById("adcNavWindow");
  const navRange = document.getElementById("adcNavRange");

  if (!vin || !vfs || !marker || !markerLabel || !navWindow || !navRange) return;

  const ADC_MAX = 511;

  function updateNavigator() {
    const Vin = Number(vin.value);
    const VFS = Number(vfs.value);

    let code;
    if (!Number.isFinite(Vin) || !Number.isFinite(VFS) || VFS <= 0) {
      code = 0;
    } else if (Vin >= VFS) {
      code = ADC_MAX;
    } else {
      code = Math.round((Vin / VFS) * ADC_MAX);
      code = Math.max(0, Math.min(ADC_MAX, code));
    }

    // Mismo rango aproximado que usa la vista ampliada original.
    const c0 = Math.max(0, code - 7);
    const c1 = Math.min(ADC_MAX, code + 7);

    const markerPct = (code / ADC_MAX) * 100;
    const leftPct = (c0 / ADC_MAX) * 100;
    const widthPct = Math.max(
      (1 / ADC_MAX) * 100,
      ((c1 - c0) / ADC_MAX) * 100
    );

    marker.style.left = `${markerPct}%`;
    markerLabel.textContent = `ADC ${code}`;

    navWindow.style.left = `${leftPct}%`;
    navWindow.style.width = `${widthPct}%`;

    navRange.textContent = `${c0} ... ${c1}`;
  }

  vin.addEventListener("input", updateNavigator);
  vfs.addEventListener("input", updateNavigator);

  updateNavigator();
})();
