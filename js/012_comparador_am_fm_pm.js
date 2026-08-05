        "use strict";

        /*
         * SIT-400 — Clase 12
         * Comparador AM, FM y PM.
         *
         * Alcance:
         * - Modulante y portadora de referencia.
         * - AM temporal con índice fijo de comparación mAM = 0,60.
         * - FM mediante frecuencia instantánea y desviación Δf.
         * - PM mediante desviación de fase Δφ.
         * - Lecturas instantáneas sincronizadas.
         *
         * No incluye NBFM, WBFM, Carson, espectro FM, VCO ni PLL.
         */

        const canvas =
            document.getElementById("simulationCanvas");

        const canvasWrapper =
            document.getElementById("canvasWrapper");

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

        const stateTag =
            document.getElementById("stateTag");

        const fmFrequencyMetric =
            document.getElementById("fmFrequencyMetric");

        const pmFrequencyMetric =
            document.getElementById("pmFrequencyMetric");

        const fmPhaseMetric =
            document.getElementById("fmPhaseMetric");

        const pmPhaseMetric =
            document.getElementById("pmPhaseMetric");

        const fmPeriodMetric =
            document.getElementById("fmPeriodMetric");

        const pmPeriodMetric =
            document.getElementById("pmPeriodMetric");

        const amAmplitudeMetric =
            document.getElementById("amAmplitudeMetric");

        const angularAmplitudeMetric =
            document.getElementById("angularAmplitudeMetric");

        const carrierFrequencyInput =
            document.getElementById("carrierFrequency");

        const carrierFrequencyUnit =
            document.getElementById("carrierFrequencyUnit");

        const modulatingFrequencyInput =
            document.getElementById("modulatingFrequency");

        const modulatingFrequencyUnit =
            document.getElementById("modulatingFrequencyUnit");

        const modulatingAmplitudeInput =
            document.getElementById("modulatingAmplitude");

        const frequencyDeviationInput =
            document.getElementById("frequencyDeviation");

        const frequencyDeviationUnit =
            document.getElementById("frequencyDeviationUnit");

        const phaseDeviationInput =
            document.getElementById("phaseDeviation");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedOutput =
            document.getElementById("animationSpeedOutput");

        const modulatingFormula =
            document.getElementById("modulatingFormula");

        const fmFrequencyFormula =
            document.getElementById("fmFrequencyFormula");

        const fmPhaseFormula =
            document.getElementById("fmPhaseFormula");

        const pmPhaseFormula =
            document.getElementById("pmPhaseFormula");

        const pmFrequencyFormula =
            document.getElementById("pmFrequencyFormula");

        const sensitivityFormula =
            document.getElementById("sensitivityFormula");

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

        const carrierAmplitude = 1;
        const comparisonAmIndex = 0.6;
        const maximumVisualCarrierRatio = 60;
        const twoPi = 2 * Math.PI;

        const presets = {
            basic: {
                fc: 20,
                fcUnit: "Hz",
                fm: 2,
                fmUnit: "Hz",
                am: 1,
                deltaF: 5,
                deltaFUnit: "Hz",
                deltaPhi: 0.8
            },

            fmRange: {
                fc: 100,
                fcUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                am: 1,
                deltaF: 5,
                deltaFUnit: "kHz",
                deltaPhi: 0.8
            },

            fmIndex: {
                fc: 100,
                fcUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                am: 1,
                deltaF: 5,
                deltaFUnit: "kHz",
                deltaPhi: 0.8
            },

            pmPhase: {
                fc: 20,
                fcUnit: "Hz",
                fm: 2,
                fmUnit: "Hz",
                am: 1,
                deltaF: 5,
                deltaFUnit: "Hz",
                deltaPhi: 0.8
            },

            pmFast: {
                fc: 40,
                fcUnit: "Hz",
                fm: 5,
                fmUnit: "Hz",
                am: 1,
                deltaF: 5,
                deltaFUnit: "Hz",
                deltaPhi: 1.2
            }
        };

        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 920;
        let pixelRatio = 1;

        let currentData = null;

        function frequencyFactor(unit) {
            if (unit === "MHz") {
                return 1e6;
            }

            if (unit === "kHz") {
                return 1e3;
            }

            return 1;
        }

        function clamp(value, minimum, maximum) {
            return Math.min(
                maximum,
                Math.max(
                    minimum,
                    value
                )
            );
        }

        function formatNumber(value, decimals = 4) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            const absolute =
                Math.abs(value);

            if (
                absolute !== 0 &&
                (
                    absolute >= 1e8 ||
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
                    maximumFractionDigits: decimals
                }
            ).format(value);
        }

        function formatFrequency(valueHz) {
            if (!Number.isFinite(valueHz)) {
                return "—";
            }

            const sign =
                valueHz < 0
                    ? "−"
                    : "";

            const absolute =
                Math.abs(valueHz);

            if (absolute >= 1e6) {
                return (
                    sign +
                    formatNumber(
                        absolute / 1e6,
                        6
                    ) +
                    " MHz"
                );
            }

            if (absolute >= 1e3) {
                return (
                    sign +
                    formatNumber(
                        absolute / 1e3,
                        6
                    ) +
                    " kHz"
                );
            }

            return (
                sign +
                formatNumber(
                    absolute,
                    6
                ) +
                " Hz"
            );
        }

        function formatTime(seconds) {
            if (!Number.isFinite(seconds) || seconds <= 0) {
                return "No definida";
            }

            if (seconds >= 1) {
                return (
                    formatNumber(
                        seconds,
                        6
                    ) +
                    " s"
                );
            }

            if (seconds >= 1e-3) {
                return (
                    formatNumber(
                        seconds * 1e3,
                        6
                    ) +
                    " ms"
                );
            }

            if (seconds >= 1e-6) {
                return (
                    formatNumber(
                        seconds * 1e6,
                        6
                    ) +
                    " µs"
                );
            }

            return (
                formatNumber(
                    seconds * 1e9,
                    6
                ) +
                " ns"
            );
        }

        function normalizeAngle(angle) {
            const normalized =
                angle % twoPi;

            return normalized < 0
                ? normalized + twoPi
                : normalized;
        }

        function getSimulationData() {
            const fc =
                Number(
                    carrierFrequencyInput.value
                ) *
                frequencyFactor(
                    carrierFrequencyUnit.value
                );

            const fm =
                Number(
                    modulatingFrequencyInput.value
                ) *
                frequencyFactor(
                    modulatingFrequencyUnit.value
                );

            const modulatingAmplitude =
                Number(
                    modulatingAmplitudeInput.value
                );

            const deltaF =
                Number(
                    frequencyDeviationInput.value
                ) *
                frequencyFactor(
                    frequencyDeviationUnit.value
                );

            const deltaPhi =
                Number(
                    phaseDeviationInput.value
                );

            const valid =
                [
                    fc,
                    fm,
                    modulatingAmplitude,
                    deltaF,
                    deltaPhi
                ].every(Number.isFinite) &&
                fc > 0 &&
                fm > 0 &&
                modulatingAmplitude > 0 &&
                deltaF >= 0 &&
                deltaPhi >= 0;

            if (!valid) {
                return {
                    valid: false
                };
            }

            const beta =
                deltaF /
                fm;

            const pmMaximumFrequencyDeviation =
                deltaPhi *
                fm;

            const fmMinimumFrequency =
                fc -
                deltaF;

            const fmMaximumFrequency =
                fc +
                deltaF;

            const pmMinimumFrequency =
                fc -
                pmMaximumFrequencyDeviation;

            const pmMaximumFrequency =
                fc +
                pmMaximumFrequencyDeviation;

            const carrierRatio =
                fc /
                fm;

            const compressionFactor =
                carrierRatio >
                maximumVisualCarrierRatio
                    ? maximumVisualCarrierRatio /
                        carrierRatio
                    : 1;

            const visualFc =
                fc *
                compressionFactor;

            const visualDeltaF =
                deltaF *
                compressionFactor;

            const visualBeta =
                visualDeltaF /
                fm;

            const visualDeltaPhi =
                deltaPhi *
                compressionFactor;

            return {
                valid: true,
                fc,
                fm,
                modulatingAmplitude,
                deltaF,
                deltaPhi,
                beta,
                pmMaximumFrequencyDeviation,
                fmMinimumFrequency,
                fmMaximumFrequency,
                pmMinimumFrequency,
                pmMaximumFrequency,
                carrierRatio,
                compressionFactor,
                compressed:
                    compressionFactor < 1,
                visualFc,
                visualDeltaF,
                visualBeta,
                visualDeltaPhi,
                duration:
                    3 /
                    fm,
                kf:
                    deltaF /
                    modulatingAmplitude,
                kp:
                    deltaPhi /
                    modulatingAmplitude
            };
        }

        function getInstantaneousValues(
            data,
            time
        ) {
            const modulatingAngle =
                twoPi *
                data.fm *
                time;

            const normalizedMessage =
                Math.cos(
                    modulatingAngle
                );

            const modulatingVoltage =
                data.modulatingAmplitude *
                normalizedMessage;

            const fmPhaseOffset =
                data.beta *
                Math.sin(
                    modulatingAngle
                );

            const pmPhaseOffset =
                data.deltaPhi *
                normalizedMessage;

            const fmInstantaneousFrequency =
                data.fc +
                data.deltaF *
                normalizedMessage;

            const pmInstantaneousFrequency =
                data.fc -
                data.deltaPhi *
                data.fm *
                Math.sin(
                    modulatingAngle
                );

            const carrierAngle =
                twoPi *
                data.fc *
                time;

            const fmAngle =
                carrierAngle +
                fmPhaseOffset;

            const pmAngle =
                carrierAngle +
                pmPhaseOffset;

            const amEnvelope =
                carrierAmplitude *
                (
                    1 +
                    comparisonAmIndex *
                    normalizedMessage
                );

            return {
                normalizedMessage,
                modulatingVoltage,
                fmPhaseOffset,
                pmPhaseOffset,
                fmInstantaneousFrequency,
                pmInstantaneousFrequency,
                fmAngle,
                pmAngle,
                fmAngleModulo:
                    normalizeAngle(
                        fmAngle
                    ),
                pmAngleModulo:
                    normalizeAngle(
                        pmAngle
                    ),
                fmLocalPeriod:
                    fmInstantaneousFrequency > 0
                        ? 1 /
                            fmInstantaneousFrequency
                        : NaN,
                pmLocalPeriod:
                    pmInstantaneousFrequency > 0
                        ? 1 /
                            pmInstantaneousFrequency
                        : NaN,
                amEnvelope,
                amSample:
                    amEnvelope *
                    Math.cos(
                        carrierAngle
                    ),
                fmSample:
                    carrierAmplitude *
                    Math.cos(
                        fmAngle
                    ),
                pmSample:
                    carrierAmplitude *
                    Math.cos(
                        pmAngle
                    )
            };
        }

        function getVisualSamples(
            data,
            time
        ) {
            const modulatingAngle =
                twoPi *
                data.fm *
                time;

            const normalizedMessage =
                Math.cos(
                    modulatingAngle
                );

            const modulatingVoltage =
                data.modulatingAmplitude *
                normalizedMessage;

            const visualCarrierAngle =
                twoPi *
                data.visualFc *
                time;

            const visualAmEnvelope =
                carrierAmplitude *
                (
                    1 +
                    comparisonAmIndex *
                    normalizedMessage
                );

            const visualFmAngle =
                visualCarrierAngle +
                data.visualBeta *
                Math.sin(
                    modulatingAngle
                );

            const visualPmAngle =
                visualCarrierAngle +
                data.visualDeltaPhi *
                normalizedMessage;

            return {
                modulatingVoltage,
                carrierSample:
                    carrierAmplitude *
                    Math.cos(
                        visualCarrierAngle
                    ),
                amSample:
                    visualAmEnvelope *
                    Math.cos(
                        visualCarrierAngle
                    ),
                fmSample:
                    carrierAmplitude *
                    Math.cos(
                        visualFmAngle
                    ),
                pmSample:
                    carrierAmplitude *
                    Math.cos(
                        visualPmAngle
                    )
            };
        }

        function getCursorTime(data) {
            const visualProgress =
                (
                    elapsedTime *
                    0.12
                ) %
                1;

            return (
                visualProgress *
                data.duration
            );
        }

        function updateDynamicMetrics(
            data,
            cursorTime
        ) {
            const instant =
                getInstantaneousValues(
                    data,
                    cursorTime
                );

            fmFrequencyMetric.textContent =
                formatFrequency(
                    instant.fmInstantaneousFrequency
                );

            pmFrequencyMetric.textContent =
                formatFrequency(
                    instant.pmInstantaneousFrequency
                );

            fmPhaseMetric.textContent =
                "θ = " +
                formatNumber(
                    instant.fmAngleModulo,
                    4
                ) +
                " rad · Δθ = " +
                formatNumber(
                    instant.fmPhaseOffset,
                    4
                ) +
                " rad";

            pmPhaseMetric.textContent =
                "θ = " +
                formatNumber(
                    instant.pmAngleModulo,
                    4
                ) +
                " rad · Δθ = " +
                formatNumber(
                    instant.pmPhaseOffset,
                    4
                ) +
                " rad";

            fmPeriodMetric.textContent =
                instant.fmInstantaneousFrequency > 0
                    ? formatTime(
                        instant.fmLocalPeriod
                    )
                    : "No definida: fᵢ ≤ 0";

            pmPeriodMetric.textContent =
                instant.pmInstantaneousFrequency > 0
                    ? formatTime(
                        instant.pmLocalPeriod
                    )
                    : "No definida: fᵢ ≤ 0";

            amAmplitudeMetric.textContent =
                formatNumber(
                    instant.amEnvelope,
                    5
                ) +
                " V pico";

            angularAmplitudeMetric.textContent =
                formatNumber(
                    carrierAmplitude,
                    3
                ) +
                " V pico constante";
        }

        function updateInterface() {
            animationSpeedOutput.textContent =
                Number(
                    animationSpeed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            currentData =
                getSimulationData();

            if (!currentData.valid) {
                stateBanner.className =
                    "banner danger";

                stateTitle.textContent =
                    "Datos no válidos";

                stateDescription.textContent =
                    "Las frecuencias y la amplitud modulante deben ser positivas. Las desviaciones no pueden ser negativas.";

                stateTag.textContent =
                    "Sin cálculo";

                return;
            }

            const warnings = [];

            if (
                currentData.fmMinimumFrequency <=
                0
            ) {
                warnings.push(
                    "En FM la frecuencia instantánea alcanza cero o valores negativos."
                );
            }

            if (
                currentData.pmMinimumFrequency <=
                0
            ) {
                warnings.push(
                    "En PM la rapidez angular alcanza cero o cambia de sentido en parte del ciclo."
                );
            }

            if (
                currentData.fc <=
                currentData.fm
            ) {
                warnings.push(
                    "La portadora no es más rápida que la modulante, por lo que la comparación visual deja de ser la condición didáctica habitual."
                );
            }

            if (warnings.length > 0) {
                stateBanner.className =
                    "banner warning";

                stateTitle.textContent =
                    "Revise la relación entre frecuencias y desviaciones";

                stateDescription.textContent =
                    warnings.join(" ");

                stateTag.textContent =
                    "Condición límite";
            } else {
                stateBanner.className =
                    "banner";

                stateTitle.textContent =
                    "Comparación válida";

                stateDescription.textContent =
                    "AM modifica amplitud; FM modifica frecuencia instantánea; PM modifica fase instantánea.";

                stateTag.textContent =
                    "Amplitud FM/PM constante";
            }

            modulatingFormula.textContent =
                "vₘ(t) = " +
                formatNumber(
                    currentData.modulatingAmplitude,
                    5
                ) +
                " cos(2π·" +
                formatFrequency(
                    currentData.fm
                ) +
                "·t) V · xₘ(t) = vₘ(t)/Aₘ";

            fmFrequencyFormula.textContent =
                "fᵢ,FM(t) = " +
                formatFrequency(
                    currentData.fc
                ) +
                " + " +
                formatFrequency(
                    currentData.deltaF
                ) +
                "·cos(2πfₘt) · rango: " +
                formatFrequency(
                    currentData.fmMinimumFrequency
                ) +
                " a " +
                formatFrequency(
                    currentData.fmMaximumFrequency
                );

            fmPhaseFormula.textContent =
                "β = Δf/fₘ = " +
                formatNumber(
                    currentData.beta,
                    6
                ) +
                " · ΔθFM(t) = β sin(2πfₘt)";

            pmPhaseFormula.textContent =
                "ΔθPM(t) = " +
                formatNumber(
                    currentData.deltaPhi,
                    6
                ) +
                " cos(2πfₘt) rad · mₚ = " +
                formatNumber(
                    currentData.deltaPhi,
                    6
                );

            pmFrequencyFormula.textContent =
                "fᵢ,PM(t) = fᶜ − Δφfₘ sin(2πfₘt) · ΔfPM,max = " +
                formatFrequency(
                    currentData.pmMaximumFrequencyDeviation
                ) +
                " · rango: " +
                formatFrequency(
                    currentData.pmMinimumFrequency
                ) +
                " a " +
                formatFrequency(
                    currentData.pmMaximumFrequency
                );

            sensitivityFormula.textContent =
                "kf = Δf/Aₘ = " +
                formatFrequency(
                    currentData.kf
                ) +
                "/V · kp = Δφ/Aₘ = " +
                formatNumber(
                    currentData.kp,
                    6
                ) +
                " rad/V";

            const notes = [];

            notes.push(
                "La gráfica AM usa mAM = 0,60 como referencia fija, porque esta clase controla Δf y Δφ, no el índice AM."
            );

            if (currentData.compressed) {
                notes.push(
                    "La portadora y las variaciones angulares se comprimieron visualmente por un factor " +
                    formatNumber(
                        currentData.compressionFactor,
                        5
                    ) +
                    ". Los cálculos numéricos conservan los valores reales."
                );
            }

            notes.push(
                "La separación local entre ciclos se interpreta como Tᵢ = 1/fᵢ cuando fᵢ es positiva."
            );

            notes.push(
                "Las ondas muestran amplitud instantánea respecto al tiempo y no una trayectoria espacial de la energía."
            );

            technicalNote.innerHTML =
                "<strong>Advertencias técnicas:</strong> " +
                notes.join(" ");

            updateDynamicMetrics(
                currentData,
                getCursorTime(
                    currentData
                )
            );
        }

        function applyPreset(key) {
            const preset =
                presets[key];

            if (!preset) {
                return;
            }

            carrierFrequencyInput.value =
                String(
                    preset.fc
                );

            carrierFrequencyUnit.value =
                preset.fcUnit;

            modulatingFrequencyInput.value =
                String(
                    preset.fm
                );

            modulatingFrequencyUnit.value =
                preset.fmUnit;

            modulatingAmplitudeInput.value =
                String(
                    preset.am
                );

            frequencyDeviationInput.value =
                String(
                    preset.deltaF
                );

            frequencyDeviationUnit.value =
                preset.deltaFUnit;

            phaseDeviationInput.value =
                String(
                    preset.deltaPhi
                );

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

            lastFrameTime =
                performance.now();

            pauseButton.disabled = false;
            continueButton.disabled = true;

            simulationStatus.textContent =
                "Simulación activa";

            simulationStatus.classList.remove(
                "paused"
            );
        }

        function restartSimulation() {
            carrierFrequencyInput.value = "20";
            carrierFrequencyUnit.value = "Hz";

            modulatingFrequencyInput.value = "2";
            modulatingFrequencyUnit.value = "Hz";

            modulatingAmplitudeInput.value = "1";

            frequencyDeviationInput.value = "5";
            frequencyDeviationUnit.value = "Hz";

            phaseDeviationInput.value = "0.8";
            animationSpeed.value = "1";

            elapsedTime = 0;
            isPaused = false;

            lastFrameTime =
                performance.now();

            pauseButton.disabled = false;
            continueButton.disabled = true;

            simulationStatus.textContent =
                "Simulación activa";

            simulationStatus.classList.remove(
                "paused"
            );

            updateInterface();
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasWrapper.clientWidth
                );

            viewHeight =
                viewWidth < 720
                    ? 1420
                    : 920;

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

        function roundedRectanglePath(
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

            ctx.moveTo(
                x + safeRadius,
                y
            );

            ctx.lineTo(
                x +
                width -
                safeRadius,
                y
            );

            ctx.quadraticCurveTo(
                x + width,
                y,
                x + width,
                y + safeRadius
            );

            ctx.lineTo(
                x + width,
                y +
                height -
                safeRadius
            );

            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x +
                width -
                safeRadius,
                y + height
            );

            ctx.lineTo(
                x + safeRadius,
                y + height
            );

            ctx.quadraticCurveTo(
                x,
                y + height,
                x,
                y +
                height -
                safeRadius
            );

            ctx.lineTo(
                x,
                y + safeRadius
            );

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
                        ? line +
                            " " +
                            words[index]
                        : words[index];

                if (
                    ctx.measureText(testLine).width >
                        maximumWidth &&
                    line
                ) {
                    ctx.fillText(
                        line,
                        x,
                        y +
                        lineNumber *
                        lineHeight
                    );

                    line =
                        words[index];

                    lineNumber += 1;

                    if (
                        lineNumber >=
                        maximumLines - 1
                    ) {
                        break;
                    }
                } else {
                    line =
                        testLine;
                }
            }

            if (
                lineNumber <
                maximumLines
            ) {
                ctx.fillText(
                    line,
                    x,
                    y +
                    lineNumber *
                    lineHeight
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

            gradient.addColorStop(
                0,
                "#020817"
            );

            gradient.addColorStop(
                0.56,
                "#071426"
            );

            gradient.addColorStop(
                1,
                "#081a2e"
            );

            ctx.fillStyle =
                gradient;

            ctx.fillRect(
                0,
                0,
                viewWidth,
                viewHeight
            );

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

        function drawCanvasHeader(data) {
            ctx.save();

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "Comparación temporal sincronizada",
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.83)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                "El cursor amarillo marca el mismo instante en las cinco señales.",
                24,
                50,
                Math.max(
                    190,
                    viewWidth - 430
                ),
                14,
                2
            );

            ctx.fillStyle =
                data.compressed
                    ? "#fbbf24"
                    : "#38bdf8";

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "fc = " +
                formatFrequency(
                    data.fc
                ) +
                " · fm = " +
                formatFrequency(
                    data.fm
                ) +
                " · β = " +
                formatNumber(
                    data.beta,
                    4
                ),
                viewWidth - 24,
                33
            );

            ctx.restore();
        }

        function drawPanel(
            panel,
            title,
            color,
            description
        ) {
            ctx.save();

            roundedRectanglePath(
                panel.x,
                panel.y,
                panel.width,
                panel.height,
                12
            );

            ctx.fillStyle =
                "rgba(2, 10, 24, 0.63)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.15)";

            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.font =
                "700 10.5px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                title,
                panel.x + 14,
                panel.y + 22
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.76)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            if (panel.width < 600) {
                ctx.textAlign =
                    "left";

                ctx.fillText(
                    description,
                    panel.x + 14,
                    panel.y + 36
                );
            } else {
                ctx.textAlign =
                    "right";

                ctx.fillText(
                    description,
                    panel.x +
                    panel.width -
                    14,
                    panel.y + 22
                );
            }

            ctx.restore();
        }

        function drawGrid(
            plot,
            verticalMaximum,
            duration,
            unit
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
                    plot.y +
                    plot.height
                );

                ctx.stroke();
            }

            for (
                let index = 0;
                index <= 4;
                index += 1
            ) {
                const y =
                    plot.y +
                    plot.height *
                    index /
                    4;

                ctx.beginPath();
                ctx.moveTo(plot.x, y);

                ctx.lineTo(
                    plot.x +
                    plot.width,
                    y
                );

                ctx.stroke();
            }

            const centerY =
                plot.y +
                plot.height /
                2;

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.36)";

            ctx.lineWidth = 1.3;

            ctx.beginPath();
            ctx.moveTo(plot.x, centerY);

            ctx.lineTo(
                plot.x +
                plot.width,
                centerY
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.74)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "+" +
                formatNumber(
                    verticalMaximum,
                    3
                ) +
                " " +
                unit,
                plot.x - 7,
                plot.y + 8
            );

            ctx.fillText(
                "0 " +
                unit,
                plot.x - 7,
                centerY + 3
            );

            ctx.fillText(
                "−" +
                formatNumber(
                    verticalMaximum,
                    3
                ) +
                " " +
                unit,
                plot.x - 7,
                plot.y +
                plot.height
            );

            ctx.textAlign =
                "center";

            ctx.fillText(
                "0",
                plot.x,
                plot.y +
                plot.height +
                16
            );

            ctx.fillText(
                formatTime(
                    duration
                ),
                plot.x +
                plot.width,
                plot.y +
                plot.height +
                16
            );

            ctx.restore();
        }

        function valueToY(
            value,
            plot,
            verticalMaximum
        ) {
            return (
                plot.y +
                plot.height /
                2 -
                value /
                Math.max(
                    verticalMaximum,
                    1e-12
                ) *
                plot.height *
                0.42
            );
        }

        function drawWave(
            plot,
            duration,
            valueFunction,
            verticalMaximum,
            color,
            lineWidth = 2,
            dashed = false
        ) {
            ctx.save();
            ctx.beginPath();

            const step =
                Math.max(
                    0.7,
                    plot.width /
                    1500
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
                    plot.x +
                    pixel;

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

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                lineWidth;

            ctx.setLineDash(
                dashed
                    ? [8, 5]
                    : []
            );

            ctx.lineJoin =
                "round";

            ctx.lineCap =
                "round";

            ctx.shadowBlur =
                dashed
                    ? 0
                    : 6;

            ctx.shadowColor =
                color;

            ctx.stroke();
            ctx.restore();
        }

        function drawCursor(
            plots,
            data,
            cursorTime
        ) {
            const progress =
                cursorTime /
                data.duration;

            const visualSamples =
                getVisualSamples(
                    data,
                    cursorTime
                );

            const cursorSamples = [
                visualSamples.modulatingVoltage,
                visualSamples.carrierSample,
                visualSamples.amSample,
                visualSamples.fmSample,
                visualSamples.pmSample
            ];

            const maxima = [
                data.modulatingAmplitude,
                carrierAmplitude,
                carrierAmplitude *
                    (
                        1 +
                        comparisonAmIndex
                    ),
                carrierAmplitude,
                carrierAmplitude
            ];

            ctx.save();

            plots.forEach(
                function (plot, index) {
                    const x =
                        plot.x +
                        plot.width *
                        progress;

                    const y =
                        valueToY(
                            cursorSamples[index],
                            plot,
                            maxima[index]
                        );

                    ctx.strokeStyle =
                        "rgba(251, 191, 36, 0.82)";

                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([5, 5]);

                    ctx.beginPath();
                    ctx.moveTo(x, plot.y);

                    ctx.lineTo(
                        x,
                        plot.y +
                        plot.height
                    );

                    ctx.stroke();

                    ctx.setLineDash([]);

                    ctx.fillStyle =
                        "#fbbf24";

                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "#fbbf24";

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        3.7,
                        0,
                        twoPi
                    );

                    ctx.fill();

                    ctx.shadowBlur = 0;
                }
            );

            ctx.restore();
        }

        function drawSignals(data) {
            const mobile =
                viewWidth < 720;

            const margin =
                mobile
                    ? 14
                    : 20;

            const gap =
                mobile
                    ? 14
                    : 12;

            const top = 78;

            const availableHeight =
                viewHeight -
                top -
                42;

            const panelHeight =
                (
                    availableHeight -
                    gap * 4
                ) /
                5;

            const panels = [];

            for (
                let index = 0;
                index < 5;
                index += 1
            ) {
                panels.push(
                    {
                        x: margin,
                        y:
                            top +
                            index *
                            (
                                panelHeight +
                                gap
                            ),
                        width:
                            viewWidth -
                            margin * 2,
                        height:
                            panelHeight
                    }
                );
            }

            const titles = [
                {
                    title: "1. MODULANTE",
                    color: "#38bdf8",
                    description:
                        "vₘ(t) en V"
                },
                {
                    title: "2. PORTADORA SIN MODULAR",
                    color: "#60a5fa",
                    description:
                        "amplitud y frecuencia constantes"
                },
                {
                    title: "3. AM",
                    color: "#34d399",
                    description:
                        "cambia amplitud"
                },
                {
                    title: "4. FM",
                    color: "#c084fc",
                    description:
                        "cambia frecuencia instantánea"
                },
                {
                    title: "5. PM",
                    color: "#fb923c",
                    description:
                        "cambia fase instantánea"
                }
            ];

            panels.forEach(
                function (panel, index) {
                    drawPanel(
                        panel,
                        titles[index].title,
                        titles[index].color,
                        titles[index].description
                    );
                }
            );

            const plotLeft =
                mobile
                    ? 50
                    : 64;

            const plotRight = 20;

            const plotTop =
                mobile
                    ? 52
                    : 39;

            const plotBottom = 28;

            const plots =
                panels.map(
                    function (panel) {
                        return {
                            x:
                                panel.x +
                                plotLeft,
                            y:
                                panel.y +
                                plotTop,
                            width:
                                panel.width -
                                plotLeft -
                                plotRight,
                            height:
                                panel.height -
                                plotTop -
                                plotBottom
                        };
                    }
                );

            drawGrid(
                plots[0],
                data.modulatingAmplitude,
                data.duration,
                "V"
            );

            drawGrid(
                plots[1],
                carrierAmplitude,
                data.duration,
                "V"
            );

            drawGrid(
                plots[2],
                carrierAmplitude *
                    (
                        1 +
                        comparisonAmIndex
                    ),
                data.duration,
                "V"
            );

            drawGrid(
                plots[3],
                carrierAmplitude,
                data.duration,
                "V"
            );

            drawGrid(
                plots[4],
                carrierAmplitude,
                data.duration,
                "V"
            );

            drawWave(
                plots[0],
                data.duration,
                function (time) {
                    return (
                        data.modulatingAmplitude *
                        Math.cos(
                            twoPi *
                            data.fm *
                            time
                        )
                    );
                },
                data.modulatingAmplitude,
                "#38bdf8",
                2.3
            );

            drawWave(
                plots[1],
                data.duration,
                function (time) {
                    return (
                        carrierAmplitude *
                        Math.cos(
                            twoPi *
                            data.visualFc *
                            time
                        )
                    );
                },
                carrierAmplitude,
                "#60a5fa",
                1.9
            );

            const amEnvelopeFunction =
                function (time) {
                    return (
                        carrierAmplitude *
                        (
                            1 +
                            comparisonAmIndex *
                            Math.cos(
                                twoPi *
                                data.fm *
                                time
                            )
                        )
                    );
                };

            drawWave(
                plots[2],
                data.duration,
                function (time) {
                    return (
                        amEnvelopeFunction(time) *
                        Math.cos(
                            twoPi *
                            data.visualFc *
                            time
                        )
                    );
                },
                carrierAmplitude *
                    (
                        1 +
                        comparisonAmIndex
                    ),
                "#f8fafc",
                1.6
            );

            drawWave(
                plots[2],
                data.duration,
                amEnvelopeFunction,
                carrierAmplitude *
                    (
                        1 +
                        comparisonAmIndex
                    ),
                "#34d399",
                1.8,
                true
            );

            drawWave(
                plots[2],
                data.duration,
                function (time) {
                    return -amEnvelopeFunction(time);
                },
                carrierAmplitude *
                    (
                        1 +
                        comparisonAmIndex
                    ),
                "#34d399",
                1.8,
                true
            );

            drawWave(
                plots[3],
                data.duration,
                function (time) {
                    return (
                        carrierAmplitude *
                        Math.cos(
                            twoPi *
                            data.visualFc *
                            time +
                            data.visualBeta *
                            Math.sin(
                                twoPi *
                                data.fm *
                                time
                            )
                        )
                    );
                },
                carrierAmplitude,
                "#c084fc",
                1.9
            );

            drawWave(
                plots[3],
                data.duration,
                function () {
                    return carrierAmplitude;
                },
                carrierAmplitude,
                "rgba(52, 211, 153, 0.72)",
                1.3,
                true
            );

            drawWave(
                plots[3],
                data.duration,
                function () {
                    return -carrierAmplitude;
                },
                carrierAmplitude,
                "rgba(52, 211, 153, 0.72)",
                1.3,
                true
            );

            drawWave(
                plots[4],
                data.duration,
                function (time) {
                    return (
                        carrierAmplitude *
                        Math.cos(
                            twoPi *
                            data.visualFc *
                            time +
                            data.visualDeltaPhi *
                            Math.cos(
                                twoPi *
                                data.fm *
                                time
                            )
                        )
                    );
                },
                carrierAmplitude,
                "#fb923c",
                1.9
            );

            drawWave(
                plots[4],
                data.duration,
                function () {
                    return carrierAmplitude;
                },
                carrierAmplitude,
                "rgba(52, 211, 153, 0.72)",
                1.3,
                true
            );

            drawWave(
                plots[4],
                data.duration,
                function () {
                    return -carrierAmplitude;
                },
                carrierAmplitude,
                "rgba(52, 211, 153, 0.72)",
                1.3,
                true
            );

            const cursorTime =
                getCursorTime(data);

            drawCursor(
                plots,
                data,
                cursorTime
            );

            const cursorProgress =
                cursorTime /
                data.duration;

            const cursorX =
                plots[0].x +
                plots[0].width *
                cursorProgress;

            ctx.save();

            ctx.fillStyle =
                "rgba(251, 191, 36, 0.92)";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign =
                cursorProgress > 0.82
                    ? "right"
                    : "left";

            ctx.fillText(
                "t = " +
                formatTime(
                    cursorTime
                ),
                cursorX +
                (
                    cursorProgress > 0.82
                        ? -6
                        : 6
                ),
                panels[0].y + 44
            );

            ctx.restore();

            updateDynamicMetrics(
                data,
                cursorTime
            );
        }

        function drawInvalidMessage() {
            ctx.save();

            ctx.fillStyle =
                "#fb7185";

            ctx.font =
                "700 17px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            wrapText(
                "Revise las frecuencias, la amplitud modulante y las desviaciones.",
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

            ctx.textAlign =
                "right";

            ctx.fillText(
                "Amplitud respecto al tiempo · comparación didáctica · sin espectro ni ancho de banda.",
                viewWidth - 18,
                viewHeight - 14
            );

            ctx.restore();
        }

        function drawScene() {
            drawBackground();

            if (
                !currentData ||
                !currentData.valid
            ) {
                drawInvalidMessage();
                return;
            }

            drawCanvasHeader(
                currentData
            );

            drawSignals(
                currentData
            );

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

            lastFrameTime =
                currentTime;

            if (!isPaused) {
                elapsedTime +=
                    deltaTime *
                    Number(
                        animationSpeed.value
                    );

                if (
                    elapsedTime >
                    10000
                ) {
                    elapsedTime = 0;
                }
            }

            drawScene();

            requestAnimationFrame(
                animate
            );
        }

        [
            carrierFrequencyInput,
            carrierFrequencyUnit,
            modulatingFrequencyInput,
            modulatingFrequencyUnit,
            modulatingAmplitudeInput,
            frequencyDeviationInput,
            frequencyDeviationUnit,
            phaseDeviationInput,
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
                lastFrameTime =
                    time;

                animate(time);
            }
        );
    
