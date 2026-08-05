        "use strict";

        /*
         * SIT-400 — Clase 8
         * Modulación AM básica en el dominio del tiempo.
         *
         * Alcance:
         * - Señal modulante senoidal de prueba.
         * - Portadora senoidal.
         * - Señal AM con portadora.
         * - Envolvente, índice de modulación y sobremodulación.
         *
         * No incluye espectro, bandas laterales, DSB, SSB, VSB,
         * potencia, eficiencia, detectores ni circuitos moduladores.
         */

        const canvas =
            document.getElementById("simulationCanvas");

        const canvasContainer =
            document.getElementById("canvasContainer");

        const ctx =
            canvas.getContext("2d");

        const simulationStatus =
            document.getElementById("simulationStatus");

        const stateBanner =
            document.getElementById("stateBanner");

        const stateTitle =
            document.getElementById("stateTitle");

        const stateDescription =
            document.getElementById("stateDescription");

        const stateValue =
            document.getElementById("stateValue");

        const configuredIndexMetric =
            document.getElementById("configuredIndexMetric");

        const calculatedIndexMetric =
            document.getElementById("calculatedIndexMetric");

        const percentageMetric =
            document.getElementById("percentageMetric");

        const maximumEnvelopeMetric =
            document.getElementById("maximumEnvelopeMetric");

        const minimumEnvelopeLabel =
            document.getElementById("minimumEnvelopeLabel");

        const minimumEnvelopeMetric =
            document.getElementById("minimumEnvelopeMetric");

        const frequencyRatioMetric =
            document.getElementById("frequencyRatioMetric");

        const modulatingFrequency =
            document.getElementById("modulatingFrequency");

        const modulatingFrequencyUnit =
            document.getElementById("modulatingFrequencyUnit");

        const carrierFrequency =
            document.getElementById("carrierFrequency");

        const carrierFrequencyUnit =
            document.getElementById("carrierFrequencyUnit");

        const modulatingAmplitude =
            document.getElementById("modulatingAmplitude");

        const carrierAmplitude =
            document.getElementById("carrierAmplitude");

        const modulationIndex =
            document.getElementById("modulationIndex");

        const modulationIndexDisplay =
            document.getElementById("modulationIndexDisplay");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedDisplay =
            document.getElementById("animationSpeedDisplay");

        const signalFormula =
            document.getElementById("signalFormula");

        const amFormula =
            document.getElementById("amFormula");

        const envelopeFormula =
            document.getElementById("envelopeFormula");

        const technicalNote =
            document.getElementById("technicalNote");

        const pauseButton =
            document.getElementById("pauseButton");

        const continueButton =
            document.getElementById("continueButton");

        const restartButton =
            document.getElementById("restartButton");

        const presetButtons =
            Array.from(
                document.querySelectorAll("[data-preset]")
            );

        const presets = {
            unmodulated: {
                fm: 2,
                fmUnit: "Hz",
                fc: 20,
                fcUnit: "Hz",
                am: 1,
                ac: 5,
                m: 0
            },

            normal: {
                fm: 2,
                fmUnit: "Hz",
                fc: 20,
                fcUnit: "Hz",
                am: 1,
                ac: 5,
                m: 0.5
            },

            classExercise: {
                fm: 2,
                fmUnit: "Hz",
                fc: 20,
                fcUnit: "Hz",
                am: 1,
                ac: 5,
                m: 0.6
            },

            limit: {
                fm: 2,
                fmUnit: "Hz",
                fc: 20,
                fcUnit: "Hz",
                am: 1,
                ac: 5,
                m: 1
            },

            overmodulated: {
                fm: 2,
                fmUnit: "Hz",
                fc: 20,
                fcUnit: "Hz",
                am: 1,
                ac: 5,
                m: 1.2
            }
        };

        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;
        let viewWidth = 1000;
        let viewHeight = 830;
        let pixelRatio = 1;

        function frequencyFactor(unit) {
            if (unit === "kHz") {
                return 1e3;
            }

            if (unit === "MHz") {
                return 1e6;
            }

            return 1;
        }

        function clamp(value, minimum, maximum) {
            return Math.min(
                maximum,
                Math.max(minimum, value)
            );
        }

        function nearlyEqual(first, second) {
            const scale =
                Math.max(
                    1,
                    Math.abs(first),
                    Math.abs(second)
                );

            return (
                Math.abs(first - second) <=
                scale * 1e-9
            );
        }

        function formatNumber(value, maximumDecimals = 4) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            const absolute =
                Math.abs(value);

            if (
                absolute !== 0 &&
                (
                    absolute >= 1e7 ||
                    absolute < 1e-5
                )
            ) {
                return value
                    .toExponential(3)
                    .replace(".", ",");
            }

            return new Intl.NumberFormat(
                "es-BO",
                {
                    maximumFractionDigits: maximumDecimals
                }
            ).format(value);
        }

        function formatFrequency(valueHz) {
            if (!Number.isFinite(valueHz)) {
                return "—";
            }

            if (Math.abs(valueHz) >= 1e6) {
                return (
                    formatNumber(valueHz / 1e6, 5) +
                    " MHz"
                );
            }

            if (Math.abs(valueHz) >= 1e3) {
                return (
                    formatNumber(valueHz / 1e3, 5) +
                    " kHz"
                );
            }

            return (
                formatNumber(valueHz, 5) +
                " Hz"
            );
        }

        function formatTime(seconds) {
            if (!Number.isFinite(seconds)) {
                return "—";
            }

            if (seconds >= 1) {
                return (
                    formatNumber(seconds, 6) +
                    " s"
                );
            }

            if (seconds >= 1e-3) {
                return (
                    formatNumber(seconds * 1e3, 6) +
                    " ms"
                );
            }

            if (seconds >= 1e-6) {
                return (
                    formatNumber(seconds * 1e6, 6) +
                    " µs"
                );
            }

            return (
                formatNumber(seconds * 1e9, 6) +
                " ns"
            );
        }

        function getSimulationData() {
            const fm =
                Number(modulatingFrequency.value) *
                frequencyFactor(
                    modulatingFrequencyUnit.value
                );

            const fc =
                Number(carrierFrequency.value) *
                frequencyFactor(
                    carrierFrequencyUnit.value
                );

            const am =
                Number(modulatingAmplitude.value);

            const ac =
                Number(carrierAmplitude.value);

            const m =
                Number(modulationIndex.value);

            const valid =
                [fm, fc, am, ac, m].every(Number.isFinite) &&
                fm > 0 &&
                fc > 0 &&
                am > 0 &&
                ac > 0 &&
                m >= 0;

            if (!valid) {
                return {
                    valid: false,
                    fm,
                    fc,
                    am,
                    ac,
                    m
                };
            }

            const tm = 1 / fm;
            const tc = 1 / fc;
            const ratio = fc / fm;
            const aMaximum = ac * (1 + m);
            const algebraicMinimum = ac * (1 - m);
            const percentage = m * 100;

            let classification;

            if (nearlyEqual(m, 0)) {
                classification = "unmodulated";
            } else if (nearlyEqual(m, 1)) {
                classification = "limit";
            } else if (m > 1) {
                classification = "overmodulated";
            } else {
                classification = "normal";
            }

            const calculatedIndex =
                m <= 1
                    ? (
                        aMaximum -
                        algebraicMinimum
                    ) /
                    (
                        aMaximum +
                        algebraicMinimum
                    )
                    : NaN;

            return {
                valid: true,
                fm,
                fc,
                am,
                ac,
                m,
                tm,
                tc,
                ratio,
                aMaximum,
                algebraicMinimum,
                percentage,
                classification,
                calculatedIndex
            };
        }

        function updateInterface() {
            const data =
                getSimulationData();

            modulationIndexDisplay.textContent =
                formatNumber(
                    Number(modulationIndex.value),
                    2
                );

            animationSpeedDisplay.textContent =
                Number(animationSpeed.value)
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            if (!data.valid) {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "Datos no válidos";

                stateDescription.textContent =
                    "Las frecuencias y amplitudes deben ser positivas, y m no puede ser negativo.";

                stateValue.textContent =
                    "Revise los controles";

                configuredIndexMetric.textContent = "—";
                calculatedIndexMetric.textContent = "—";
                percentageMetric.textContent = "—";
                maximumEnvelopeMetric.textContent = "—";
                minimumEnvelopeMetric.textContent = "—";
                frequencyRatioMetric.textContent = "—";

                return;
            }

            configuredIndexMetric.textContent =
                formatNumber(data.m, 4);

            percentageMetric.textContent =
                formatNumber(data.percentage, 2) +
                " %";

            maximumEnvelopeMetric.textContent =
                formatNumber(data.aMaximum, 5) +
                " V";

            frequencyRatioMetric.textContent =
                formatNumber(data.ratio, 5);

            if (data.classification === "unmodulated") {
                stateBanner.className =
                    "state-banner neutral";

                stateTitle.textContent =
                    "Sin modulación";

                stateDescription.textContent =
                    "La portadora conserva amplitud constante; no existe variación de información en la amplitud.";

                stateValue.textContent =
                    "m = 0 · 0 %";

                calculatedIndexMetric.textContent =
                    "0";

                minimumEnvelopeLabel.textContent =
                    "A mínimo";

                minimumEnvelopeMetric.textContent =
                    formatNumber(
                        data.algebraicMinimum,
                        5
                    ) +
                    " V";
            } else if (data.classification === "normal") {
                stateBanner.className =
                    "state-banner";

                stateTitle.textContent =
                    "Submodulación o modulación normal";

                stateDescription.textContent =
                    "La envolvente no se cruza, A mínimo es mayor que cero y la forma de la modulante puede reconocerse.";

                stateValue.textContent =
                    "m = " +
                    formatNumber(data.m, 2) +
                    " · " +
                    formatNumber(data.percentage, 1) +
                    " %";

                calculatedIndexMetric.textContent =
                    formatNumber(
                        data.calculatedIndex,
                        5
                    );

                minimumEnvelopeLabel.textContent =
                    "A mínimo";

                minimumEnvelopeMetric.textContent =
                    formatNumber(
                        data.algebraicMinimum,
                        5
                    ) +
                    " V";
            } else if (data.classification === "limit") {
                stateBanner.className =
                    "state-banner limit";

                stateTitle.textContent =
                    "Modulación al 100 %";

                stateDescription.textContent =
                    "La envolvente llega exactamente a cero en su punto mínimo, pero todavía no se cruza.";

                stateValue.textContent =
                    "m = 1 · 100 %";

                calculatedIndexMetric.textContent =
                    "1";

                minimumEnvelopeLabel.textContent =
                    "A mínimo";

                minimumEnvelopeMetric.textContent =
                    "0 V";
            } else {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "Sobremodulación";

                stateDescription.textContent =
                    "El factor de amplitud cambia de signo, los contornos algebraicos se cruzan y aparece inversión de fase.";

                stateValue.textContent =
                    "m = " +
                    formatNumber(data.m, 2) +
                    " · " +
                    formatNumber(data.percentage, 1) +
                    " %";

                calculatedIndexMetric.textContent =
                    "No aplicable";

                minimumEnvelopeLabel.textContent =
                    "Mínimo algebraico";

                minimumEnvelopeMetric.textContent =
                    formatNumber(
                        data.algebraicMinimum,
                        5
                    ) +
                    " V";
            }

            signalFormula.textContent =
                "xₘ(t) = cos(2π·" +
                formatFrequency(data.fm) +
                "·t) · c(t) = " +
                formatNumber(data.ac, 4) +
                " cos(2π·" +
                formatFrequency(data.fc) +
                "·t)";

            amFormula.textContent =
                "sAM(t) = " +
                formatNumber(data.ac, 4) +
                "[1 + " +
                formatNumber(data.m, 4) +
                "·cos(2π·" +
                formatFrequency(data.fm) +
                "·t)]cos(2π·" +
                formatFrequency(data.fc) +
                "·t)";

            if (data.m <= 1) {
                envelopeFormula.textContent =
                    "Amax = " +
                    formatNumber(data.aMaximum, 5) +
                    " V · Amin = " +
                    formatNumber(data.algebraicMinimum, 5) +
                    " V · m = (Amax − Amin)/(Amax + Amin) = " +
                    formatNumber(data.calculatedIndex, 5);
            } else {
                envelopeFormula.textContent =
                    "Amax = " +
                    formatNumber(data.aMaximum, 5) +
                    " V · Ac(1 − m) = " +
                    formatNumber(data.algebraicMinimum, 5) +
                    " V · valor negativo algebraico: sobremodulación";
            }

            if (data.ratio <= 1) {
                technicalNote.innerHTML =
                    "<strong>Advertencia de frecuencias:</strong> " +
                    "la portadora debería ser más rápida que la modulante. " +
                    "Con fc ≤ fm la demostración deja de mostrar claramente " +
                    "una portadora rápida dentro de una envolvente lenta. " +
                    "Las curvas siguen siendo matemáticas, pero no representan " +
                    "el caso didáctico recomendado para AM convencional.";
            } else if (data.ratio < 5) {
                technicalNote.innerHTML =
                    "<strong>Advertencia visual:</strong> " +
                    "fc es solo " +
                    formatNumber(data.ratio, 3) +
                    " veces fm. La portadora es más rápida, pero la separación " +
                    "entre oscilación rápida y envolvente lenta es poco marcada. " +
                    "La gráfica representa amplitud respecto al tiempo, no una trayectoria espacial.";
            } else if (data.classification === "overmodulated") {
                technicalNote.innerHTML =
                    "<strong>Sobremodulación:</strong> " +
                    "las líneas rojas discontinuas muestran los contornos algebraicos " +
                    "±Ac[1 + m·xₘ(t)], que se cruzan. La línea naranja muestra la " +
                    "magnitud observable |Ac[1 + m·xₘ(t)]|. Esa forma plegada ya no " +
                    "reproduce correctamente la modulante. No se aplica mecánicamente " +
                    "m = (Amax − Amin)/(Amax + Amin).";
            } else {
                technicalNote.innerHTML =
                    "<strong>Advertencia visual:</strong> " +
                    "se muestran tres periodos de la modulante y se comprime la escala " +
                    "para visualizar simultáneamente la portadora. La onda representa " +
                    "amplitud instantánea respecto al tiempo, no la trayectoria física " +
                    "seguida por la energía. Tm = " +
                    formatTime(data.tm) +
                    " y Tc = " +
                    formatTime(data.tc) +
                    ".";
            }
        }

        function applyPreset(key) {
            const preset =
                presets[key];

            if (!preset) {
                return;
            }

            modulatingFrequency.value =
                String(preset.fm);

            modulatingFrequencyUnit.value =
                preset.fmUnit;

            carrierFrequency.value =
                String(preset.fc);

            carrierFrequencyUnit.value =
                preset.fcUnit;

            modulatingAmplitude.value =
                String(preset.am);

            carrierAmplitude.value =
                String(preset.ac);

            modulationIndex.value =
                String(preset.m);

            elapsedTime = 0;
            updateInterface();
        }

        function pauseSimulation() {
            isPaused = true;

            pauseButton.disabled = true;
            continueButton.disabled = false;

            simulationStatus.textContent =
                "Simulación pausada";

            simulationStatus.classList.add(
                "paused"
            );
        }

        function continueSimulation() {
            isPaused = false;
            lastFrameTime = performance.now();

            pauseButton.disabled = false;
            continueButton.disabled = true;

            simulationStatus.textContent =
                "Simulación activa";

            simulationStatus.classList.remove(
                "paused"
            );
        }

        function restartSimulation() {
            elapsedTime = 0;
            isPaused = false;
            lastFrameTime = performance.now();

            pauseButton.disabled = false;
            continueButton.disabled = true;

            simulationStatus.textContent =
                "Simulación activa";

            simulationStatus.classList.remove(
                "paused"
            );

            animationSpeed.value = "1";
            applyPreset("classExercise");
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            viewHeight =
                viewWidth < 680
                    ? 1260
                    : 830;

            pixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            canvas.width =
                Math.round(
                    viewWidth *
                    pixelRatio
                );

            canvas.height =
                Math.round(
                    viewHeight *
                    pixelRatio
                );

            canvas.style.width =
                viewWidth +
                "px";

            canvas.style.height =
                viewHeight +
                "px";

            ctx.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );
        }

        function roundedRectPath(
            x,
            y,
            width,
            height,
            radius
        ) {
            const safeRadius =
                Math.min(
                    radius,
                    width / 2,
                    height / 2
                );

            ctx.beginPath();
            ctx.moveTo(x + safeRadius, y);
            ctx.lineTo(x + width - safeRadius, y);
            ctx.quadraticCurveTo(
                x + width,
                y,
                x + width,
                y + safeRadius
            );
            ctx.lineTo(
                x + width,
                y + height - safeRadius
            );
            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - safeRadius,
                y + height
            );
            ctx.lineTo(x + safeRadius, y + height);
            ctx.quadraticCurveTo(
                x,
                y + height,
                x,
                y + height - safeRadius
            );
            ctx.lineTo(x, y + safeRadius);
            ctx.quadraticCurveTo(
                x,
                y,
                x + safeRadius,
                y
            );
            ctx.closePath();
        }

        function wrapText(
            text,
            x,
            y,
            maximumWidth,
            lineHeight,
            maximumLines = 3
        ) {
            const words =
                String(text).split(" ");

            let line = "";
            let lineNumber = 0;

            for (
                let index = 0;
                index < words.length;
                index += 1
            ) {
                const testLine =
                    line
                        ? line + " " + words[index]
                        : words[index];

                if (
                    ctx.measureText(testLine).width >
                        maximumWidth &&
                    line
                ) {
                    ctx.fillText(
                        line,
                        x,
                        y + lineNumber * lineHeight
                    );

                    line = words[index];
                    lineNumber += 1;

                    if (
                        lineNumber >=
                        maximumLines - 1
                    ) {
                        break;
                    }
                } else {
                    line = testLine;
                }
            }

            if (lineNumber < maximumLines) {
                ctx.fillText(
                    line,
                    x,
                    y + lineNumber * lineHeight
                );
            }
        }

        function drawBackground() {
            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    viewWidth,
                    viewHeight
                );

            gradient.addColorStop(0, "#020817");
            gradient.addColorStop(0.56, "#071426");
            gradient.addColorStop(1, "#081a2e");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, viewWidth, viewHeight);

            ctx.save();
            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.045)";
            ctx.lineWidth = 1;

            for (
                let x = 0;
                x <= viewWidth;
                x += 40
            ) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, viewHeight);
                ctx.stroke();
            }

            for (
                let y = 0;
                y <= viewHeight;
                y += 40
            ) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(viewWidth, y);
                ctx.stroke();
            }

            ctx.restore();
        }

        function drawHeader(data) {
            ctx.save();

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.95)";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "AM básica en el dominio del tiempo",
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                "Las tres gráficas comparten el mismo eje temporal. La portadora debe observarse más rápida que la modulante.",
                24,
                50,
                Math.max(
                    190,
                    viewWidth - 390
                ),
                14,
                2
            );

            ctx.fillStyle =
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : data.classification === "limit"
                        ? "#fbbf24"
                        : "#38bdf8";

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign = "right";

            ctx.fillText(
                "fm = " +
                formatFrequency(data.fm) +
                " · fc = " +
                formatFrequency(data.fc) +
                " · m = " +
                formatNumber(data.m, 2),
                viewWidth - 24,
                33
            );

            ctx.restore();
        }

        function drawPanel(
            panel,
            title,
            color
        ) {
            ctx.save();

            roundedRectPath(
                panel.x,
                panel.y,
                panel.width,
                panel.height,
                13
            );

            ctx.fillStyle =
                "rgba(2, 10, 24, 0.62)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.15)";

            ctx.stroke();

            ctx.fillStyle = color;
            ctx.font =
                "700 11px Segoe UI, sans-serif";
            ctx.textAlign = "left";

            ctx.fillText(
                title,
                panel.x + 15,
                panel.y + 24
            );

            ctx.restore();
        }

        function drawPlotGrid(
            plot,
            verticalMaximum,
            duration,
            amplitudeUnit = "V"
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            ctx.lineWidth = 1;

            for (
                let index = 0;
                index <= 10;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.width *
                    index /
                    10;

                ctx.beginPath();
                ctx.moveTo(x, plot.y);
                ctx.lineTo(
                    x,
                    plot.y + plot.height
                );
                ctx.stroke();
            }

            for (
                let index = 0;
                index <= 6;
                index += 1
            ) {
                const y =
                    plot.y +
                    plot.height *
                    index /
                    6;

                ctx.beginPath();
                ctx.moveTo(plot.x, y);
                ctx.lineTo(
                    plot.x + plot.width,
                    y
                );
                ctx.stroke();
            }

            const centerY =
                plot.y +
                plot.height / 2;

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.38)";

            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(plot.x, centerY);
            ctx.lineTo(
                plot.x + plot.width,
                centerY
            );
            ctx.stroke();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.74)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "+" +
                formatNumber(verticalMaximum, 4) +
                " " +
                amplitudeUnit,
                plot.x - 7,
                plot.y + 9
            );

            ctx.fillText(
                "0 " + amplitudeUnit,
                plot.x - 7,
                centerY + 3
            );

            ctx.fillText(
                "−" +
                formatNumber(verticalMaximum, 4) +
                " " +
                amplitudeUnit,
                plot.x - 7,
                plot.y + plot.height
            );

            ctx.textAlign = "center";

            ctx.fillText(
                "0",
                plot.x,
                plot.y + plot.height + 17
            );

            ctx.fillText(
                formatTime(duration),
                plot.x + plot.width,
                plot.y + plot.height + 17
            );

            ctx.restore();
        }

        function valueToY(
            value,
            plot,
            verticalMaximum
        ) {
            const centerY =
                plot.y +
                plot.height / 2;

            const scale =
                plot.height *
                0.43 /
                Math.max(
                    verticalMaximum,
                    1e-12
                );

            return centerY - value * scale;
        }

        function drawWave(
            plot,
            duration,
            valueFunction,
            verticalMaximum,
            color,
            lineWidth = 2.1,
            dash = []
        ) {
            ctx.save();
            ctx.beginPath();

            const step =
                Math.max(
                    0.7,
                    plot.width / 1400
                );

            for (
                let pixel = 0;
                pixel <= plot.width;
                pixel += step
            ) {
                const time =
                    duration *
                    pixel /
                    plot.width;

                const value =
                    valueFunction(time);

                const x =
                    plot.x + pixel;

                const y =
                    valueToY(
                        value,
                        plot,
                        verticalMaximum
                    );

                if (pixel === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash(dash);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowBlur = 7;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.restore();
        }

        function drawEnvelope(
            plot,
            duration,
            data,
            verticalMaximum
        ) {
            const algebraicEnvelope =
                function (time) {
                    return (
                        data.ac *
                        (
                            1 +
                            data.m *
                            Math.cos(
                                2 *
                                Math.PI *
                                data.fm *
                                time
                            )
                        )
                    );
                };

            if (data.m <= 1) {
                drawWave(
                    plot,
                    duration,
                    algebraicEnvelope,
                    verticalMaximum,
                    "#34d399",
                    2,
                    [8, 5]
                );

                drawWave(
                    plot,
                    duration,
                    function (time) {
                        return -algebraicEnvelope(time);
                    },
                    verticalMaximum,
                    "#34d399",
                    2,
                    [8, 5]
                );
            } else {
                drawWave(
                    plot,
                    duration,
                    algebraicEnvelope,
                    verticalMaximum,
                    "rgba(251, 113, 133, 0.95)",
                    1.9,
                    [8, 5]
                );

                drawWave(
                    plot,
                    duration,
                    function (time) {
                        return -algebraicEnvelope(time);
                    },
                    verticalMaximum,
                    "rgba(251, 113, 133, 0.95)",
                    1.9,
                    [8, 5]
                );

                drawWave(
                    plot,
                    duration,
                    function (time) {
                        return Math.abs(
                            algebraicEnvelope(time)
                        );
                    },
                    verticalMaximum,
                    "#fb923c",
                    2.2
                );

                drawWave(
                    plot,
                    duration,
                    function (time) {
                        return -Math.abs(
                            algebraicEnvelope(time)
                        );
                    },
                    verticalMaximum,
                    "#fb923c",
                    2.2
                );
            }
        }

        function drawLegendItem(
            x,
            y,
            color,
            text,
            options = {}
        ) {
            ctx.save();

            if (options.point) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(
                    x + 7,
                    y - 3,
                    4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.setLineDash(
                    options.dashed
                        ? [7, 5]
                        : []
                );
                ctx.beginPath();
                ctx.moveTo(x, y - 3);
                ctx.lineTo(x + 18, y - 3);
                ctx.stroke();
            }

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.84)";

            ctx.font =
                "600 8.5px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                text,
                x + 25,
                y
            );

            ctx.restore();
        }

        function drawSynchronizedCursor(
            plots,
            color
        ) {
            const progress =
                (
                    elapsedTime *
                    0.18
                ) %
                1;

            ctx.save();

            plots.forEach(
                function (plot) {
                    const x =
                        plot.x +
                        plot.width *
                        progress;

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(x, plot.y);
                    ctx.lineTo(
                        x,
                        plot.y + plot.height
                    );
                    ctx.stroke();

                    ctx.fillStyle = color;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(
                        x,
                        plot.y + 7,
                        3.4,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            );

            ctx.restore();
        }

        function drawAmplitudeMarkers(
            panel,
            plot,
            data,
            verticalMaximum
        ) {
            const maximumY =
                valueToY(
                    data.aMaximum,
                    plot,
                    verticalMaximum
                );

            const minimumValue =
                data.m <= 1
                    ? data.algebraicMinimum
                    : 0;

            const minimumY =
                valueToY(
                    minimumValue,
                    plot,
                    verticalMaximum
                );

            const markerX =
                panel.x +
                panel.width -
                62;

            ctx.save();

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.54)";

            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(
                markerX,
                plot.y + plot.height / 2
            );
            ctx.lineTo(markerX, maximumY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(markerX - 5, maximumY);
            ctx.lineTo(markerX + 5, maximumY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(
                markerX - 5,
                plot.y + plot.height / 2
            );
            ctx.lineTo(
                markerX + 5,
                plot.y + plot.height / 2
            );
            ctx.stroke();

            ctx.fillStyle =
                "rgba(236, 254, 255, 0.90)";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "Amax " +
                formatNumber(data.aMaximum, 3) +
                " V",
                markerX - 8,
                maximumY + 3
            );

            ctx.strokeStyle =
                data.m > 1
                    ? "rgba(251, 113, 133, 0.72)"
                    : "rgba(186, 230, 253, 0.54)";

            ctx.beginPath();
            ctx.moveTo(markerX + 14, minimumY);
            ctx.lineTo(
                markerX + 14,
                plot.y + plot.height / 2
            );
            ctx.stroke();

            ctx.fillStyle =
                data.m > 1
                    ? "#fb7185"
                    : "rgba(236, 254, 255, 0.90)";

            ctx.fillText(
                data.m > 1
                    ? "Cruce a 0 V"
                    : "Amin " +
                        formatNumber(
                            data.algebraicMinimum,
                            3
                        ) +
                        " V",
                markerX + 6,
                minimumY - 6
            );

            ctx.restore();
        }

        function drawDesktop(data) {
            const panelMargin = 20;
            const panelGap = 14;
            const availableHeight =
                viewHeight - 120;

            const panelHeight =
                (
                    availableHeight -
                    panelGap * 2
                ) /
                3;

            const modulatingPanel = {
                x: panelMargin,
                y: 78,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            const carrierPanel = {
                x: panelMargin,
                y:
                    modulatingPanel.y +
                    panelHeight +
                    panelGap,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            const amPanel = {
                x: panelMargin,
                y:
                    carrierPanel.y +
                    panelHeight +
                    panelGap,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            drawPanel(
                modulatingPanel,
                "1. SEÑAL MODULANTE DE PRUEBA",
                "#38bdf8"
            );

            drawPanel(
                carrierPanel,
                "2. PORTADORA SIN MODULAR",
                "#c084fc"
            );

            drawPanel(
                amPanel,
                "3. SEÑAL AM Y ENVOLVENTE",
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : "#34d399"
            );

            const duration =
                3 /
                data.fm;

            const plotLeft = 72;
            const plotRight = 28;
            const plotTop = 48;
            const plotBottom = 31;

            const modulatingPlot = {
                x: modulatingPanel.x + plotLeft,
                y: modulatingPanel.y + plotTop,
                width:
                    modulatingPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    modulatingPanel.height -
                    plotTop -
                    plotBottom
            };

            const carrierPlot = {
                x: carrierPanel.x + plotLeft,
                y: carrierPanel.y + plotTop,
                width:
                    carrierPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    carrierPanel.height -
                    plotTop -
                    plotBottom
            };

            const amPlot = {
                x: amPanel.x + plotLeft,
                y: amPanel.y + plotTop,
                width:
                    amPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    amPanel.height -
                    plotTop -
                    plotBottom
            };

            const amVerticalMaximum =
                Math.max(
                    data.aMaximum * 1.08,
                    data.ac * 1.1
                );

            drawPlotGrid(
                modulatingPlot,
                data.am,
                duration
            );

            drawPlotGrid(
                carrierPlot,
                data.ac,
                duration
            );

            drawPlotGrid(
                amPlot,
                amVerticalMaximum,
                duration
            );

            drawWave(
                modulatingPlot,
                duration,
                function (time) {
                    return (
                        data.am *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fm *
                            time
                        )
                    );
                },
                data.am,
                "#38bdf8",
                2.4
            );

            drawWave(
                carrierPlot,
                duration,
                function (time) {
                    return (
                        data.ac *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fc *
                            time
                        )
                    );
                },
                data.ac,
                "#c084fc",
                2
            );

            drawWave(
                amPlot,
                duration,
                function (time) {
                    const envelopeFactor =
                        1 +
                        data.m *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fm *
                            time
                        );

                    return (
                        data.ac *
                        envelopeFactor *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fc *
                            time
                        )
                    );
                },
                amVerticalMaximum,
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : "#f8fafc",
                1.8
            );

            drawEnvelope(
                amPlot,
                duration,
                data,
                amVerticalMaximum
            );

            drawLegendItem(
                modulatingPanel.x + 16,
                modulatingPanel.y + 42,
                "#38bdf8",
                "vₘ(t) = Aₘ cos(2πfₘt)"
            );

            drawLegendItem(
                carrierPanel.x + 16,
                carrierPanel.y + 42,
                "#c084fc",
                "c(t) = Aᶜ cos(2πfᶜt)"
            );

            drawLegendItem(
                amPanel.x + 16,
                amPanel.y + 42,
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : "#f8fafc",
                "Señal AM"
            );

            if (data.classification === "overmodulated") {
                drawLegendItem(
                    amPanel.x + 130,
                    amPanel.y + 42,
                    "#fb7185",
                    "Contornos algebraicos",
                    { dashed: true }
                );

                drawLegendItem(
                    amPanel.x + 300,
                    amPanel.y + 42,
                    "#fb923c",
                    "Magnitud plegada"
                );
            } else {
                drawLegendItem(
                    amPanel.x + 130,
                    amPanel.y + 42,
                    "#34d399",
                    "Envolvente superior e inferior",
                    { dashed: true }
                );
            }

            drawAmplitudeMarkers(
                amPanel,
                amPlot,
                data,
                amVerticalMaximum
            );

            drawSynchronizedCursor(
                [
                    modulatingPlot,
                    carrierPlot,
                    amPlot
                ],
                "rgba(251, 191, 36, 0.84)"
            );
        }

        function drawMobile(data) {
            const panelMargin = 14;
            const panelGap = 16;
            const panelHeight = 350;

            const modulatingPanel = {
                x: panelMargin,
                y: 82,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            const carrierPanel = {
                x: panelMargin,
                y:
                    modulatingPanel.y +
                    panelHeight +
                    panelGap,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            const amPanel = {
                x: panelMargin,
                y:
                    carrierPanel.y +
                    panelHeight +
                    panelGap,
                width: viewWidth - panelMargin * 2,
                height: panelHeight
            };

            drawPanel(
                modulatingPanel,
                "1. MODULANTE",
                "#38bdf8"
            );

            drawPanel(
                carrierPanel,
                "2. PORTADORA",
                "#c084fc"
            );

            drawPanel(
                amPanel,
                "3. SEÑAL AM Y ENVOLVENTE",
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : "#34d399"
            );

            const duration =
                3 /
                data.fm;

            const plotLeft = 54;
            const plotRight = 18;
            const plotTop = 72;
            const plotBottom = 35;

            const modulatingPlot = {
                x: modulatingPanel.x + plotLeft,
                y: modulatingPanel.y + plotTop,
                width:
                    modulatingPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    modulatingPanel.height -
                    plotTop -
                    plotBottom
            };

            const carrierPlot = {
                x: carrierPanel.x + plotLeft,
                y: carrierPanel.y + plotTop,
                width:
                    carrierPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    carrierPanel.height -
                    plotTop -
                    plotBottom
            };

            const amPlot = {
                x: amPanel.x + plotLeft,
                y: amPanel.y + plotTop,
                width:
                    amPanel.width -
                    plotLeft -
                    plotRight,
                height:
                    amPanel.height -
                    plotTop -
                    plotBottom
            };

            const amVerticalMaximum =
                Math.max(
                    data.aMaximum * 1.08,
                    data.ac * 1.1
                );

            drawPlotGrid(
                modulatingPlot,
                data.am,
                duration
            );

            drawPlotGrid(
                carrierPlot,
                data.ac,
                duration
            );

            drawPlotGrid(
                amPlot,
                amVerticalMaximum,
                duration
            );

            drawWave(
                modulatingPlot,
                duration,
                function (time) {
                    return (
                        data.am *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fm *
                            time
                        )
                    );
                },
                data.am,
                "#38bdf8",
                2.4
            );

            drawWave(
                carrierPlot,
                duration,
                function (time) {
                    return (
                        data.ac *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fc *
                            time
                        )
                    );
                },
                data.ac,
                "#c084fc",
                1.9
            );

            drawWave(
                amPlot,
                duration,
                function (time) {
                    const factor =
                        1 +
                        data.m *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fm *
                            time
                        );

                    return (
                        data.ac *
                        factor *
                        Math.cos(
                            2 *
                            Math.PI *
                            data.fc *
                            time
                        )
                    );
                },
                amVerticalMaximum,
                data.classification === "overmodulated"
                    ? "#fb7185"
                    : "#f8fafc",
                1.7
            );

            drawEnvelope(
                amPlot,
                duration,
                data,
                amVerticalMaximum
            );

            ctx.save();
            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";
            ctx.font =
                "600 8px Segoe UI, sans-serif";
            ctx.textAlign = "left";

            ctx.fillText(
                "Azul: señal de información de prueba",
                modulatingPanel.x + 16,
                modulatingPanel.y + 50
            );

            ctx.fillText(
                "Morado: portadora de amplitud constante",
                carrierPanel.x + 16,
                carrierPanel.y + 50
            );

            ctx.fillText(
                data.classification === "overmodulated"
                    ? "Rojo: AM y cruce · naranja: magnitud plegada"
                    : "Blanco: AM · verde: envolvente",
                amPanel.x + 16,
                amPanel.y + 50
            );

            ctx.restore();

            drawSynchronizedCursor(
                [
                    modulatingPlot,
                    carrierPlot,
                    amPlot
                ],
                "rgba(251, 191, 36, 0.84)"
            );
        }

        function drawInvalidMessage() {
            ctx.save();

            ctx.fillStyle = "#fb7185";
            ctx.font =
                "700 17px Segoe UI, sans-serif";
            ctx.textAlign = "center";

            wrapText(
                "Las frecuencias y amplitudes deben ser positivas, y el índice de modulación no puede ser negativo.",
                viewWidth / 2,
                viewHeight / 2,
                viewWidth - 70,
                23,
                3
            );

            ctx.restore();
        }

        function drawFooter() {
            ctx.save();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.68)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "Gráficas de amplitud respecto al tiempo · escalas comprimidas para enseñanza.",
                viewWidth - 18,
                viewHeight - 14
            );

            ctx.restore();
        }

        function drawScene() {
            drawBackground();

            const data =
                getSimulationData();

            if (!data.valid) {
                drawInvalidMessage();
                return;
            }

            drawHeader(data);

            if (viewWidth < 680) {
                drawMobile(data);
            } else {
                drawDesktop(data);
            }

            drawFooter();
        }

        function animate(currentTime) {
            const deltaTime =
                Math.min(
                    (
                        currentTime -
                        lastFrameTime
                    ) /
                    1000,
                    0.05
                );

            lastFrameTime = currentTime;

            if (!isPaused) {
                elapsedTime +=
                    deltaTime *
                    Number(animationSpeed.value);

                if (elapsedTime > 10000) {
                    elapsedTime = 0;
                }
            }

            drawScene();

            requestAnimationFrame(animate);
        }

        [
            modulatingFrequency,
            modulatingFrequencyUnit,
            carrierFrequency,
            carrierFrequencyUnit,
            modulatingAmplitude,
            carrierAmplitude,
            modulationIndex,
            animationSpeed
        ].forEach(
            function (element) {
                element.addEventListener(
                    "input",
                    updateInterface
                );

                element.addEventListener(
                    "change",
                    updateInterface
                );
            }
        );

        presetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyPreset(
                            button.dataset.preset
                        );
                    }
                );
            }
        );

        pauseButton.addEventListener(
            "click",
            pauseSimulation
        );

        continueButton.addEventListener(
            "click",
            continueSimulation
        );

        restartButton.addEventListener(
            "click",
            restartSimulation
        );

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        resizeCanvas();
        updateInterface();

        requestAnimationFrame(
            function startAnimation(time) {
                lastFrameTime = time;
                animate(time);
            }
        );
    
