        "use strict";

        /*
         * SIT-400 — Clase 15
         * Demodulación FM, PLL y ruido en FM.
         *
         * Alcance del modelo:
         * - Señal FM senoidal.
         * - Ruido de amplitud y perturbación de fase/frecuencia.
         * - Limitador ideal de amplitud.
         * - Detectores directos mediante vout ≈ Kd(fi - fc).
         * - PLL mediante tensión de control aproximada ΔV ≈ Δf/Kvco.
         * - Captura didáctica basada en el desajuste inicial del VCO.
         * - Filtro/deénfasis conceptual no normativo.
         *
         * No se diseñan bobinas, discriminadores, filtros de lazo,
         * receptores, circuitos profesionales ni pinout de CD4046.
         */

        const canvas =
            document.getElementById("simulationCanvas");

        const canvasWrapper =
            document.getElementById("canvasWrapper");

        const ctx =
            canvas.getContext("2d");

        const modeButtons =
            Array.from(
                document.querySelectorAll(".mode-button")
            );

        const presetButtons =
            Array.from(
                document.querySelectorAll(".preset-button")
            );

        const simulationStatus =
            document.getElementById("simulationStatus");

        const simulationTitle =
            document.getElementById("simulationTitle");

        const stateBanner =
            document.getElementById("stateBanner");

        const stateTitle =
            document.getElementById("stateTitle");

        const stateDescription =
            document.getElementById("stateDescription");

        const stateTag =
            document.getElementById("stateTag");

        const metrics =
            document.getElementById("metrics");

        const carrierFrequencyInput =
            document.getElementById("carrierFrequency");

        const carrierFrequencyUnit =
            document.getElementById("carrierFrequencyUnit");

        const frequencyDeviationInput =
            document.getElementById("frequencyDeviation");

        const frequencyDeviationUnit =
            document.getElementById("frequencyDeviationUnit");

        const modulatingFrequencyInput =
            document.getElementById("modulatingFrequency");

        const modulatingFrequencyUnit =
            document.getElementById("modulatingFrequencyUnit");

        const captureRangeInput =
            document.getElementById("captureRange");

        const captureRangeUnit =
            document.getElementById("captureRangeUnit");

        const noiseLevel =
            document.getElementById("noiseLevel");

        const noiseLevelOutput =
            document.getElementById("noiseLevelOutput");

        const outputFilter =
            document.getElementById("outputFilter");

        const detectorSensitivity =
            document.getElementById("detectorSensitivity");

        const detectorSensitivityControl =
            document.getElementById("detectorSensitivityControl");

        const vcoSensitivity =
            document.getElementById("vcoSensitivity");

        const vcoSensitivityControl =
            document.getElementById("vcoSensitivityControl");

        const vcoOffset =
            document.getElementById("vcoOffset");

        const vcoOffsetControl =
            document.getElementById("vcoOffsetControl");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedOutput =
            document.getElementById("animationSpeedOutput");

        const formulaFm =
            document.getElementById("formulaFm");

        const formulaInstant =
            document.getElementById("formulaInstant");

        const formulaDetector =
            document.getElementById("formulaDetector");

        const formulaPll =
            document.getElementById("formulaPll");

        const formulaCapture =
            document.getElementById("formulaCapture");

        const formulaOutput =
            document.getElementById("formulaOutput");

        const explanation =
            document.getElementById("explanation");

        const technicalNote =
            document.getElementById("technicalNote");

        const pauseButton =
            document.getElementById("pauseButton");

        const continueButton =
            document.getElementById("continueButton");

        const restartButton =
            document.getElementById("restartButton");

        const TWO_PI =
            2 * Math.PI;

        const CARRIER_AMPLITUDE =
            1;

        const MAXIMUM_VISUAL_CARRIER_RATIO =
            55;

        const MAXIMUM_VISUAL_BETA =
            14;

        const modeDefinitions = {
            slope: {
                name:
                    "Detector de pendiente",

                color:
                    "#38bdf8",

                rgb:
                    "56, 189, 248",

                description:
                    "Una respuesta inclinada convierte cambios de frecuencia en cambios de amplitud y después en tensión recuperada.",

                tag:
                    "Conversión f → A → V",

                chain:
                    "Señal FM → limitador → detector de pendiente → filtro/deénfasis → señal recuperada"
            },

            discriminator: {
                name:
                    "Discriminador de frecuencia",

                color:
                    "#c084fc",

                rgb:
                    "192, 132, 252",

                description:
                    "Una curva centrada alrededor de fᶜ entrega tensiones opuestas para desviaciones opuestas.",

                tag:
                    "Curva S conceptual",

                chain:
                    "Señal FM → limitador → discriminador → filtro/deénfasis → señal recuperada"
            },

            ratio: {
                name:
                    "Detector de relación",

                color:
                    "#34d399",

                rgb:
                    "52, 211, 153",

                description:
                    "La relación entre respuestas permite convertir desviación en tensión y reducir sensibilidad a variaciones de amplitud.",

                tag:
                    "Mayor rechazo de AM",

                chain:
                    "Señal FM → limitador → detector de relación → filtro/deénfasis → señal recuperada"
            },

            pll: {
                name:
                    "PLL como demodulador FM",

                color:
                    "#fb923c",

                rgb:
                    "251, 146, 60",

                description:
                    "El VCO sigue la frecuencia de entrada mediante comparador de fase, filtro de lazo y realimentación.",

                tag:
                    "Lazo cerrado",

                chain:
                    "Señal FM → limitador → PLL → filtro de salida/deénfasis → señal recuperada"
            }
        };

        const presets = {
            cleanDirect: {
                mode: "discriminator",
                fc: 100,
                fcUnit: "kHz",
                deviation: 4,
                deviationUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                capture: 10,
                captureUnit: "kHz",
                noise: 5,
                filter: "active",
                kd: 0.2,
                kvco: 2,
                offset: 3
            },

            noisyDirect: {
                mode: "ratio",
                fc: 100,
                fcUnit: "kHz",
                deviation: 4,
                deviationUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                capture: 10,
                captureUnit: "kHz",
                noise: 70,
                filter: "active",
                kd: 0.2,
                kvco: 2,
                offset: 3
            },

            pllLocked: {
                mode: "pll",
                fc: 100,
                fcUnit: "kHz",
                deviation: 4,
                deviationUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                capture: 10,
                captureUnit: "kHz",
                noise: 15,
                filter: "active",
                kd: 0.2,
                kvco: 2,
                offset: 3
            },

            pllOutside: {
                mode: "pll",
                fc: 100,
                fcUnit: "kHz",
                deviation: 4,
                deviationUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                capture: 5,
                captureUnit: "kHz",
                noise: 15,
                filter: "active",
                kd: 0.2,
                kvco: 2,
                offset: 12
            },

            pllNoisy: {
                mode: "pll",
                fc: 100,
                fcUnit: "kHz",
                deviation: 4,
                deviationUnit: "kHz",
                fm: 1,
                fmUnit: "kHz",
                capture: 10,
                captureUnit: "kHz",
                noise: 85,
                filter: "active",
                kd: 0.2,
                kvco: 2,
                offset: 2
            }
        };

        let currentMode =
            "slope";

        let currentData =
            null;

        let currentFrameData =
            null;

        let elapsedTime =
            0;

        let lastFrameTime =
            performance.now();

        let isPaused =
            false;

        let viewWidth =
            1000;

        let viewHeight =
            930;

        let pixelRatio =
            1;

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

        function formatNumber(value, decimals = 5) {
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
            if (
                !Number.isFinite(seconds) ||
                seconds < 0
            ) {
                return "—";
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

        function fractional(value) {
            return (
                value -
                Math.floor(value)
            );
        }

        function hash(index, seed) {
            const value =
                Math.sin(
                    index *
                    12.9898 +
                    seed *
                    78.233
                ) *
                43758.5453123;

            return fractional(value);
        }

        function interpolatedNoise(position, seed) {
            const index =
                Math.floor(position);

            const fraction =
                position -
                index;

            const smooth =
                fraction *
                fraction *
                (
                    3 -
                    2 *
                    fraction
                );

            const first =
                hash(
                    index,
                    seed
                ) *
                2 -
                1;

            const second =
                hash(
                    index + 1,
                    seed
                ) *
                2 -
                1;

            return (
                first +
                (
                    second -
                    first
                ) *
                smooth
            );
        }

        function smoothNoise(position, seed) {
            return (
                0.58 *
                interpolatedNoise(
                    position,
                    seed
                ) +
                0.29 *
                interpolatedNoise(
                    position *
                    2.13,
                    seed + 3
                ) +
                0.13 *
                interpolatedNoise(
                    position *
                    4.37,
                    seed + 7
                )
            );
        }

        function getSimulationData() {
            const carrierFrequency =
                Number(
                    carrierFrequencyInput.value
                ) *
                frequencyFactor(
                    carrierFrequencyUnit.value
                );

            const frequencyDeviation =
                Number(
                    frequencyDeviationInput.value
                ) *
                frequencyFactor(
                    frequencyDeviationUnit.value
                );

            const modulatingFrequency =
                Number(
                    modulatingFrequencyInput.value
                ) *
                frequencyFactor(
                    modulatingFrequencyUnit.value
                );

            const captureRange =
                Number(
                    captureRangeInput.value
                ) *
                frequencyFactor(
                    captureRangeUnit.value
                );

            const noiseFraction =
                Number(
                    noiseLevel.value
                ) /
                100;

            const detectorSensitivityValue =
                Number(
                    detectorSensitivity.value
                );

            const vcoSensitivityValue =
                Number(
                    vcoSensitivity.value
                ) *
                1000;

            const vcoOffsetValue =
                Number(
                    vcoOffset.value
                ) *
                1000;

            const valid =
                [
                    carrierFrequency,
                    frequencyDeviation,
                    modulatingFrequency,
                    captureRange,
                    noiseFraction,
                    detectorSensitivityValue,
                    vcoSensitivityValue,
                    vcoOffsetValue
                ].every(Number.isFinite) &&
                carrierFrequency > 0 &&
                frequencyDeviation >= 0 &&
                modulatingFrequency > 0 &&
                captureRange >= 0 &&
                detectorSensitivityValue > 0 &&
                vcoSensitivityValue > 0;

            if (!valid) {
                return {
                    valid: false
                };
            }

            const beta =
                frequencyDeviation /
                modulatingFrequency;

            const minimumFrequency =
                carrierFrequency -
                frequencyDeviation;

            const maximumFrequency =
                carrierFrequency +
                frequencyDeviation;

            const carrierRatio =
                carrierFrequency /
                modulatingFrequency;

            const visualCarrierFrequency =
                Math.min(
                    carrierRatio,
                    MAXIMUM_VISUAL_CARRIER_RATIO
                ) *
                modulatingFrequency;

            const visualBeta =
                Math.min(
                    beta,
                    MAXIMUM_VISUAL_BETA
                );

            const visualDeviation =
                visualBeta *
                modulatingFrequency;

            const directRecoveredPeak =
                detectorSensitivityValue *
                frequencyDeviation /
                1000;

            const pllRecoveredPeak =
                frequencyDeviation /
                vcoSensitivityValue;

            const freeRunningFrequency =
                carrierFrequency +
                vcoOffsetValue;

            const pllLocked =
                Math.abs(
                    vcoOffsetValue
                ) <=
                captureRange;

            const controlDc =
                -vcoOffsetValue /
                vcoSensitivityValue;

            return {
                valid: true,
                carrierFrequency,
                frequencyDeviation,
                modulatingFrequency,
                captureRange,
                noiseFraction,
                detectorSensitivityValue,
                vcoSensitivityValue,
                vcoOffsetValue,
                beta,
                minimumFrequency,
                maximumFrequency,
                carrierRatio,
                visualCarrierFrequency,
                visualBeta,
                visualDeviation,
                directRecoveredPeak,
                pllRecoveredPeak,
                freeRunningFrequency,
                pllLocked,
                controlDc,

                filterActive:
                    outputFilter.value ===
                    "active",

                duration:
                    3 /
                    modulatingFrequency,

                carrierCompressed:
                    carrierRatio >
                    MAXIMUM_VISUAL_CARRIER_RATIO,

                betaCompressed:
                    beta >
                    MAXIMUM_VISUAL_BETA
            };
        }

        function renderMetrics(items) {
            metrics.innerHTML =
                items
                    .map(
                        function (item) {
                            return (
                                '<article class="metric">' +
                                    '<span class="metric-label">' +
                                        item[0] +
                                    '</span>' +
                                    '<span class="metric-value">' +
                                        item[1] +
                                    '</span>' +
                                '</article>'
                            );
                        }
                    )
                    .join("");
        }

        function setBanner(
            state,
            title,
            description,
            tag
        ) {
            stateBanner.className =
                "banner" +
                (
                    state
                        ? " " +
                            state
                        : ""
                );

            stateTitle.textContent =
                title;

            stateDescription.textContent =
                description;

            stateTag.textContent =
                tag;
        }

        function updateModeControls() {
            const pllMode =
                currentMode ===
                "pll";

            detectorSensitivityControl.hidden =
                pllMode;

            vcoSensitivityControl.hidden =
                !pllMode;

            vcoOffsetControl.hidden =
                !pllMode;
        }

        function updateInterface() {
            noiseLevelOutput.textContent =
                formatNumber(
                    Number(
                        noiseLevel.value
                    ),
                    0
                ) +
                " %";

            animationSpeedOutput.textContent =
                Number(
                    animationSpeed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            updateModeControls();

            currentData =
                getSimulationData();

            const definition =
                modeDefinitions[currentMode];

            if (!currentData.valid) {
                setBanner(
                    "danger",
                    "Datos no válidos",
                    "Las frecuencias deben ser positivas. Las desviaciones y rangos no pueden ser negativos.",
                    "Sin cálculo"
                );

                renderMetrics(
                    Array(8).fill(
                        [
                            "Valor",
                            "—"
                        ]
                    )
                );

                return;
            }

            const warnings = [];

            if (
                currentData.minimumFrequency <=
                0
            ) {
                warnings.push(
                    "La frecuencia instantánea alcanza cero o valores negativos."
                );
            }

            if (
                currentData.noiseFraction >=
                0.7
            ) {
                warnings.push(
                    "El ruido fuerte puede alterar fase, frecuencia aparente y seguimiento."
                );
            }

            if (
                currentMode === "pll" &&
                !currentData.pllLocked
            ) {
                setBanner(
                    "danger",
                    "PLL no enganchado",
                    "El desajuste inicial del VCO está fuera del rango de captura seleccionado. La salida recuperada no es válida.",
                    "Sin enganche"
                );
            } else if (
                warnings.length >
                0
            ) {
                setBanner(
                    "warning",
                    definition.name,
                    warnings.join(" "),
                    currentMode === "pll"
                        ? "Enganchado · ruido alto"
                        : definition.tag
                );
            } else {
                setBanner(
                    "",
                    definition.name,
                    definition.description,
                    currentMode === "pll"
                        ? "PLL enganchado"
                        : definition.tag
                );
            }

            const recoveredPeak =
                currentMode === "pll"
                    ? currentData.pllRecoveredPeak
                    : currentData.directRecoveredPeak;

            renderMetrics(
                [
                    [
                        "Frecuencia central",
                        formatFrequency(
                            currentData.carrierFrequency
                        )
                    ],
                    [
                        "Desviación máxima",
                        formatFrequency(
                            currentData.frequencyDeviation
                        )
                    ],
                    [
                        "Frecuencia mínima",
                        formatFrequency(
                            currentData.minimumFrequency
                        )
                    ],
                    [
                        "Frecuencia máxima",
                        formatFrequency(
                            currentData.maximumFrequency
                        )
                    ],
                    [
                        "Índice FM β",
                        formatNumber(
                            currentData.beta,
                            7
                        )
                    ],
                    [
                        currentMode === "pll"
                            ? "Variación pico de control"
                            : "Salida pico ideal",

                        currentMode === "pll" &&
                        !currentData.pllLocked
                            ? "No válida"
                            : (
                                formatNumber(
                                    recoveredPeak,
                                    6
                                ) +
                                " V pico"
                            )
                    ],
                    [
                        currentMode === "pll"
                            ? "Frecuencia libre del VCO"
                            : "Sensibilidad del detector",

                        currentMode === "pll"
                            ? formatFrequency(
                                currentData.freeRunningFrequency
                            )
                            : (
                                formatNumber(
                                    currentData.detectorSensitivityValue,
                                    6
                                ) +
                                " V/kHz"
                            )
                    ],
                    [
                        currentMode === "pll"
                            ? "Estado del PLL"
                            : "Nivel de ruido",

                        currentMode === "pll"
                            ? (
                                currentData.pllLocked
                                    ? "Enganchado"
                                    : "No enganchado"
                            )
                            : (
                                formatNumber(
                                    currentData.noiseFraction *
                                    100,
                                    0
                                ) +
                                " %"
                            )
                    ]
                ]
            );

            formulaFm.textContent =
                "sFM(t) = Aᶜ cos[2πfᶜt + β sin(2πfₘt)] · β = " +
                formatNumber(
                    currentData.beta,
                    7
                );

            formulaInstant.textContent =
                "fᵢ(t) = fᶜ + Δf cos(2πfₘt) · rango: " +
                formatFrequency(
                    currentData.minimumFrequency
                ) +
                " a " +
                formatFrequency(
                    currentData.maximumFrequency
                );

            formulaDetector.textContent =
                "vdet(t) ≈ Kd[fᵢ(t) − fᶜ] · Kd = " +
                formatNumber(
                    currentData.detectorSensitivityValue,
                    6
                ) +
                " V/kHz";

            formulaPll.textContent =
                "ΔVcontrol ≈ Δf/Kᵥ꜀ₒ = " +
                formatNumber(
                    currentData.pllRecoveredPeak,
                    6
                ) +
                " V pico · salida útil: control filtrado";

            formulaCapture.textContent =
                "Criterio didáctico: |fᶜ − flibre| ≤ rango de captura · " +
                formatFrequency(
                    Math.abs(
                        currentData.vcoOffsetValue
                    )
                ) +
                " ≤ " +
                formatFrequency(
                    currentData.captureRange
                );

            formulaOutput.textContent =
                currentData.filterActive
                    ? "Salida = componente útil + filtrado conceptual de ondulación/ruido alto"
                    : "Salida en bypass: se conserva mayor ondulación y ruido de alta frecuencia";

            simulationTitle.textContent =
                definition.chain;

            const notes = [];

            notes.push(
                "La portadora y el índice pueden comprimirse visualmente para mantener la gráfica legible."
            );

            if (
                currentData.carrierCompressed
            ) {
                notes.push(
                    "La frecuencia portadora temporal fue comprimida; los cálculos conservan fᶜ real."
                );
            }

            if (
                currentData.betaCompressed
            ) {
                notes.push(
                    "La variación angular visual fue limitada; β real permanece en los cálculos."
                );
            }

            notes.push(
                "El limitador ideal elimina variación de amplitud, pero conserva perturbaciones de fase y frecuencia."
            );

            notes.push(
                "El filtro/deénfasis es conceptual y no usa una constante normativa específica."
            );

            if (
                currentMode ===
                "pll"
            ) {
                notes.push(
                    "El estado de enganche se calcula con el desajuste inicial y el rango de captura; no se modela estabilidad avanzada del lazo."
                );

                notes.push(
                    "CD4046 se muestra por bloques. No se asignan pines ni valores de componentes."
                );
            }

            notes.push(
                "Las curvas de detector son normalizadas y no representan una topología calibrada."
            );

            notes.push(
                "Las ondas representan amplitud instantánea respecto al tiempo, no una trayectoria espacial de la energía."
            );

            technicalNote.innerHTML =
                "<strong>Advertencias técnicas:</strong> " +
                notes.join(" ");

            explanation.innerHTML =
                currentMode === "pll"
                    ? "<strong>Modo PLL:</strong> la entrada se compara con la salida del VCO. El filtro de lazo suaviza el error y genera la tensión que corrige al VCO. La modulante recuperada aparece en esa tensión de control después de separar su componente continua y aplicar el filtrado de salida."
                    : "<strong>Modo detector directo:</strong> el limitador reduce variaciones de amplitud. El detector convierte la desviación respecto de fᶜ en tensión y el filtro/deénfasis reduce ondulación y ruido alto. FM no se recupera observando únicamente la envolvente.";
        }

        function setMode(nextMode) {
            currentMode =
                nextMode;

            elapsedTime =
                0;

            const definition =
                modeDefinitions[nextMode];

            document.documentElement.style.setProperty(
                "--active",
                definition.color
            );

            document.documentElement.style.setProperty(
                "--active-rgb",
                definition.rgb
            );

            modeButtons.forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.mode ===
                        nextMode
                    );
                }
            );

            resizeCanvas();
            updateInterface();
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

            frequencyDeviationInput.value =
                String(
                    preset.deviation
                );

            frequencyDeviationUnit.value =
                preset.deviationUnit;

            modulatingFrequencyInput.value =
                String(
                    preset.fm
                );

            modulatingFrequencyUnit.value =
                preset.fmUnit;

            captureRangeInput.value =
                String(
                    preset.capture
                );

            captureRangeUnit.value =
                preset.captureUnit;

            noiseLevel.value =
                String(
                    preset.noise
                );

            outputFilter.value =
                preset.filter;

            detectorSensitivity.value =
                String(
                    preset.kd
                );

            vcoSensitivity.value =
                String(
                    preset.kvco
                );

            vcoOffset.value =
                String(
                    preset.offset
                );

            setMode(
                preset.mode
            );
        }

        function pauseSimulation() {
            isPaused =
                true;

            pauseButton.disabled =
                true;

            continueButton.disabled =
                false;

            simulationStatus.textContent =
                "Simulación pausada";

            simulationStatus.classList.add(
                "paused"
            );
        }

        function continueSimulation() {
            isPaused =
                false;

            lastFrameTime =
                performance.now();

            pauseButton.disabled =
                false;

            continueButton.disabled =
                true;

            simulationStatus.textContent =
                "Simulación activa";

            simulationStatus.classList.remove(
                "paused"
            );
        }

        function restartSimulation() {
            continueSimulation();

            carrierFrequencyInput.value =
                "100";

            carrierFrequencyUnit.value =
                "kHz";

            frequencyDeviationInput.value =
                "4";

            frequencyDeviationUnit.value =
                "kHz";

            modulatingFrequencyInput.value =
                "1";

            modulatingFrequencyUnit.value =
                "kHz";

            captureRangeInput.value =
                "10";

            captureRangeUnit.value =
                "kHz";

            noiseLevel.value =
                "15";

            outputFilter.value =
                "active";

            detectorSensitivity.value =
                "0.2";

            vcoSensitivity.value =
                "2";

            vcoOffset.value =
                "3";

            animationSpeed.value =
                "1";

            elapsedTime =
                0;

            setMode(
                "slope"
            );
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasWrapper.clientWidth
                );

            viewHeight =
                viewWidth < 720
                    ? 1510
                    : 930;

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

            let line =
                "";

            let lineNumber =
                0;

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
                    ctx.measureText(
                        testLine
                    ).width >
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

                    lineNumber +=
                        1;

                    if (
                        lineNumber >=
                        maximumLines -
                        1
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
            const definition =
                modeDefinitions[currentMode];

            ctx.save();

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "Demodulación FM y recuperación de la modulante",
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.83)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                "Las gráficas comparten el mismo intervalo temporal y el mismo cursor amarillo.",
                24,
                50,
                Math.max(
                    190,
                    viewWidth -
                    460
                ),
                14,
                2
            );

            if (
                viewWidth >=
                610
            ) {
                ctx.fillStyle =
                    definition.color;

                ctx.font =
                    "700 10px Consolas, monospace";

                ctx.textAlign =
                    "right";

                ctx.fillText(
                    "fᶜ = " +
                    formatFrequency(
                        data.carrierFrequency
                    ) +
                    " · Δf = " +
                    formatFrequency(
                        data.frequencyDeviation
                    ) +
                    " · β = " +
                    formatNumber(
                        data.beta,
                        4
                    ),
                    viewWidth -
                    24,
                    33
                );
            }

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
                panel.x +
                14,
                panel.y +
                22
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.76)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            if (
                panel.width <
                600
            ) {
                ctx.textAlign =
                    "left";

                ctx.fillText(
                    description,
                    panel.x +
                    14,
                    panel.y +
                    36
                );
            } else {
                ctx.textAlign =
                    "right";

                ctx.fillText(
                    description,
                    panel.x +
                    panel.width -
                    14,
                    panel.y +
                    22
                );
            }

            ctx.restore();
        }

        function drawArrow(
            x1,
            y1,
            x2,
            y2,
            color
        ) {
            const angle =
                Math.atan2(
                    y2 -
                    y1,
                    x2 -
                    x1
                );

            ctx.save();

            ctx.strokeStyle =
                color;

            ctx.fillStyle =
                color;

            ctx.lineWidth =
                1.4;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(
                x2,
                y2
            );

            ctx.lineTo(
                x2 -
                8 *
                Math.cos(
                    angle -
                    Math.PI /
                    6
                ),
                y2 -
                8 *
                Math.sin(
                    angle -
                    Math.PI /
                    6
                )
            );

            ctx.lineTo(
                x2 -
                8 *
                Math.cos(
                    angle +
                    Math.PI /
                    6
                ),
                y2 -
                8 *
                Math.sin(
                    angle +
                    Math.PI /
                    6
                )
            );

            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function drawBlock(
            x,
            y,
            width,
            height,
            title,
            subtitle,
            color
        ) {
            ctx.save();

            roundedRectanglePath(
                x,
                y,
                width,
                height,
                10
            );

            ctx.fillStyle =
                "rgba(17, 40, 65, 0.70)";

            ctx.fill();

            ctx.strokeStyle =
                color;

            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.font =
                "700 8.5px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                title,
                x +
                width /
                2,
                y +
                height /
                2 -
                5
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 7px Segoe UI, sans-serif";

            wrapText(
                subtitle,
                x +
                width /
                2,
                y +
                height /
                2 +
                11,
                width -
                14,
                10,
                2
            );

            ctx.restore();
        }

        function drawMovingMarker(
            points,
            color,
            speed
        ) {
            const segments = [];

            let totalLength =
                0;

            for (
                let index = 0;
                index < points.length - 1;
                index += 1
            ) {
                const dx =
                    points[index + 1].x -
                    points[index].x;

                const dy =
                    points[index + 1].y -
                    points[index].y;

                const length =
                    Math.hypot(
                        dx,
                        dy
                    );

                segments.push(
                    {
                        start:
                            points[index],

                        end:
                            points[index + 1],

                        length
                    }
                );

                totalLength +=
                    length;
            }

            let distance =
                fractional(
                    elapsedTime *
                    speed
                ) *
                totalLength;

            let position =
                points[0];

            for (
                const segment of segments
            ) {
                if (
                    distance <=
                    segment.length
                ) {
                    const ratio =
                        segment.length > 0
                            ? distance /
                                segment.length
                            : 0;

                    position = {
                        x:
                            segment.start.x +
                            (
                                segment.end.x -
                                segment.start.x
                            ) *
                            ratio,

                        y:
                            segment.start.y +
                            (
                                segment.end.y -
                                segment.start.y
                            ) *
                            ratio
                    };

                    break;
                }

                distance -=
                    segment.length;
            }

            ctx.save();

            ctx.fillStyle =
                color;

            ctx.shadowBlur =
                13;

            ctx.shadowColor =
                color;

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                5,
                0,
                TWO_PI
            );

            ctx.fill();
            ctx.restore();
        }

        function drawDirectChain(panel) {
            const definition =
                modeDefinitions[currentMode];

            const blocks = [
                [
                    "Señal FM",
                    "frecuencia variable",
                    "#38bdf8"
                ],
                [
                    "Limitador",
                    "reduce variación de amplitud",
                    "#60a5fa"
                ],
                [
                    definition.name,
                    "convierte frecuencia en tensión",
                    definition.color
                ],
                [
                    "Filtro / deénfasis",
                    "limpia la salida útil",
                    "#fbbf24"
                ],
                [
                    "Recuperada",
                    "modulante en tensión",
                    "#34d399"
                ]
            ];

            const mobile =
                viewWidth <
                720;

            const markerPoints = [];

            if (!mobile) {
                const gap =
                    21;

                const blockWidth =
                    (
                        panel.width -
                        48 -
                        4 *
                        gap
                    ) /
                    5;

                const blockHeight =
                    82;

                const y =
                    panel.y +
                    58;

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        const x =
                            panel.x +
                            24 +
                            index *
                            (
                                blockWidth +
                                gap
                            );

                        drawBlock(
                            x,
                            y,
                            blockWidth,
                            blockHeight,
                            block[0],
                            block[1],
                            block[2]
                        );

                        markerPoints.push(
                            {
                                x:
                                    x +
                                    blockWidth /
                                    2,

                                y:
                                    y +
                                    blockHeight +
                                    22
                            }
                        );

                        if (
                            index <
                            blocks.length -
                            1
                        ) {
                            drawArrow(
                                x +
                                blockWidth,
                                y +
                                blockHeight /
                                2,
                                x +
                                blockWidth +
                                gap -
                                5,
                                y +
                                blockHeight /
                                2,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );
            } else {
                const blockWidth =
                    panel.width -
                    70;

                const blockHeight =
                    62;

                const gap =
                    19;

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        const x =
                            panel.x +
                            35;

                        const y =
                            panel.y +
                            48 +
                            index *
                            (
                                blockHeight +
                                gap
                            );

                        drawBlock(
                            x,
                            y,
                            blockWidth,
                            blockHeight,
                            block[0],
                            block[1],
                            block[2]
                        );

                        markerPoints.push(
                            {
                                x:
                                    x +
                                    blockWidth +
                                    13,

                                y:
                                    y +
                                    blockHeight /
                                    2
                            }
                        );

                        if (
                            index <
                            blocks.length -
                            1
                        ) {
                            drawArrow(
                                x +
                                blockWidth /
                                2,
                                y +
                                blockHeight,
                                x +
                                blockWidth /
                                2,
                                y +
                                blockHeight +
                                gap -
                                4,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );
            }

            drawMovingMarker(
                markerPoints,
                definition.color,
                0.08
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.72)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            wrapText(
                "El marcador muestra el orden funcional de los bloques; no representa el recorrido físico de la energía.",
                panel.x +
                15,
                panel.y +
                panel.height -
                25,
                panel.width -
                30,
                10,
                2
            );

            ctx.restore();
        }

        function drawPllChain(
            panel,
            data
        ) {
            const mobile =
                viewWidth <
                720;

            if (mobile) {
                const blockWidth =
                    panel.width -
                    86;

                const blockHeight =
                    58;

                const left =
                    panel.x +
                    43;

                const yStart =
                    panel.y +
                    50;

                const gap =
                    17;

                const blocks = [
                    [
                        "Entrada FM limitada",
                        "señal de referencia",
                        "#38bdf8"
                    ],
                    [
                        "Comparador de fase",
                        "genera señal de error",
                        "#c084fc"
                    ],
                    [
                        "Filtro de lazo",
                        "suaviza el error",
                        "#fbbf24"
                    ],
                    [
                        "VCO",
                        "frecuencia controlada",
                        "#fb923c"
                    ]
                ];

                const centers = [];

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        const y =
                            yStart +
                            index *
                            (
                                blockHeight +
                                gap
                            );

                        drawBlock(
                            left,
                            y,
                            blockWidth,
                            blockHeight,
                            block[0],
                            block[1],
                            block[2]
                        );

                        centers.push(
                            {
                                x:
                                    left +
                                    blockWidth /
                                    2,

                                y:
                                    y +
                                    blockHeight /
                                    2
                            }
                        );

                        if (
                            index <
                            blocks.length -
                            1
                        ) {
                            drawArrow(
                                left +
                                blockWidth /
                                2,
                                y +
                                blockHeight,
                                left +
                                blockWidth /
                                2,
                                y +
                                blockHeight +
                                gap -
                                4,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );

                const vcoCenter =
                    centers[3];

                const comparatorCenter =
                    centers[1];

                const feedbackX =
                    panel.x +
                    panel.width -
                    22;

                ctx.save();

                ctx.strokeStyle =
                    "rgba(52, 211, 153, 0.82)";

                ctx.lineWidth =
                    1.5;

                ctx.beginPath();

                ctx.moveTo(
                    left +
                    blockWidth,
                    vcoCenter.y
                );

                ctx.lineTo(
                    feedbackX,
                    vcoCenter.y
                );

                ctx.lineTo(
                    feedbackX,
                    comparatorCenter.y
                );

                ctx.lineTo(
                    left +
                    blockWidth,
                    comparatorCenter.y
                );

                ctx.stroke();

                ctx.fillStyle =
                    "#34d399";

                ctx.font =
                    "700 8px Segoe UI, sans-serif";

                ctx.textAlign =
                    "right";

                ctx.fillText(
                    "realimentación",
                    feedbackX -
                    3,
                    (
                        vcoCenter.y +
                        comparatorCenter.y
                    ) /
                    2
                );

                ctx.restore();

                drawMovingMarker(
                    centers,
                    "#fb923c",
                    0.075
                );
            } else {
                const inputX =
                    panel.x +
                    30;

                const blockY =
                    panel.y +
                    62;

                const blockHeight =
                    80;

                const blockWidth =
                    (
                        panel.width -
                        120
                    ) /
                    4;

                const gap =
                    22;

                const positions = [
                    inputX,
                    inputX +
                    blockWidth +
                    gap,
                    inputX +
                    2 *
                    (
                        blockWidth +
                        gap
                    ),
                    inputX +
                    3 *
                    (
                        blockWidth +
                        gap
                    )
                ];

                const blocks = [
                    [
                        "Entrada FM limitada",
                        "referencia del lazo",
                        "#38bdf8"
                    ],
                    [
                        "Comparador de fase",
                        "genera error",
                        "#c084fc"
                    ],
                    [
                        "Filtro de lazo",
                        "tensión de control",
                        "#fbbf24"
                    ],
                    [
                        "VCO",
                        "sigue a la entrada",
                        "#fb923c"
                    ]
                ];

                const centers = [];

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        drawBlock(
                            positions[index],
                            blockY,
                            blockWidth,
                            blockHeight,
                            block[0],
                            block[1],
                            block[2]
                        );

                        centers.push(
                            {
                                x:
                                    positions[index] +
                                    blockWidth /
                                    2,

                                y:
                                    blockY +
                                    blockHeight /
                                    2
                            }
                        );

                        if (
                            index <
                            blocks.length -
                            1
                        ) {
                            drawArrow(
                                positions[index] +
                                blockWidth,
                                blockY +
                                blockHeight /
                                2,
                                positions[index] +
                                blockWidth +
                                gap -
                                5,
                                blockY +
                                blockHeight /
                                2,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );

                const feedbackY =
                    blockY +
                    blockHeight +
                    48;

                ctx.save();

                ctx.strokeStyle =
                    "rgba(52, 211, 153, 0.82)";

                ctx.lineWidth =
                    1.5;

                ctx.beginPath();

                ctx.moveTo(
                    centers[3].x,
                    blockY +
                    blockHeight
                );

                ctx.lineTo(
                    centers[3].x,
                    feedbackY
                );

                ctx.lineTo(
                    centers[1].x,
                    feedbackY
                );

                ctx.lineTo(
                    centers[1].x,
                    blockY +
                    blockHeight
                );

                ctx.stroke();

                ctx.fillStyle =
                    "#34d399";

                ctx.font =
                    "700 8px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "Realimentación de la salida del VCO al comparador",
                    (
                        centers[1].x +
                        centers[3].x
                    ) /
                    2,
                    feedbackY -
                    8
                );

                ctx.restore();

                drawMovingMarker(
                    centers,
                    "#fb923c",
                    0.075
                );
            }

            ctx.save();

            ctx.fillStyle =
                data.pllLocked
                    ? "#a7f3d0"
                    : "#fda4af";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                data.pllLocked
                    ? "ESTADO: ENGANCHADO"
                    : "ESTADO: NO ENGANCHADO",
                panel.x +
                panel.width -
                16,
                panel.y +
                panel.height -
                23
            );

            ctx.restore();
        }

        function getFrameData(data) {
            const sampleCount =
                viewWidth < 720
                    ? 740
                    : 1050;

            const input = [];
            const limited = [];
            const message = [];
            const recoveredRaw = [];
            const recoveredFiltered = [];
            const instantaneousFrequency = [];

            const normalizedStart =
                elapsedTime *
                0.18;

            const normalizedSpan =
                3;

            const normalizedStep =
                normalizedSpan /
                (
                    sampleCount -
                    1
                );

            const actualStepTime =
                normalizedStep /
                data.modulatingFrequency;

            let phase =
                TWO_PI *
                data.visualCarrierFrequency *
                (
                    normalizedStart /
                    data.modulatingFrequency
                ) +
                data.visualBeta *
                Math.sin(
                    TWO_PI *
                    normalizedStart
                );

            const noiseFrequencyScale =
                data.noiseFraction *
                Math.max(
                    data.frequencyDeviation *
                    0.42,
                    data.modulatingFrequency *
                    0.05
                );

            const visualNoiseScale =
                data.noiseFraction *
                Math.max(
                    data.visualDeviation *
                    0.42,
                    data.modulatingFrequency *
                    0.05
                );

            for (
                let index = 0;
                index < sampleCount;
                index += 1
            ) {
                const normalizedTime =
                    normalizedStart +
                    index *
                    normalizedStep;

                const modulatingValue =
                    Math.cos(
                        TWO_PI *
                        normalizedTime
                    );

                const amplitudeNoise =
                    data.noiseFraction *
                    0.42 *
                    smoothNoise(
                        normalizedTime *
                        8.6,
                        3
                    );

                const frequencyNoise =
                    noiseFrequencyScale *
                    smoothNoise(
                        normalizedTime *
                        10.3,
                        11
                    );

                const visualFrequencyNoise =
                    visualNoiseScale *
                    smoothNoise(
                        normalizedTime *
                        10.3,
                        11
                    );

                const realInstantaneousFrequency =
                    data.carrierFrequency +
                    data.frequencyDeviation *
                    modulatingValue +
                    frequencyNoise;

                const visualInstantaneousFrequency =
                    data.visualCarrierFrequency +
                    data.visualDeviation *
                    modulatingValue +
                    visualFrequencyNoise;

                if (
                    index >
                    0
                ) {
                    phase +=
                        TWO_PI *
                        visualInstantaneousFrequency *
                        actualStepTime;
                }

                const noisyAmplitude =
                    clamp(
                        1 +
                        amplitudeNoise,
                        0.15,
                        1.85
                    );

                input.push(
                    noisyAmplitude *
                    Math.cos(
                        phase
                    )
                );

                limited.push(
                    Math.cos(
                        phase
                    )
                );

                message.push(
                    modulatingValue
                );

                instantaneousFrequency.push(
                    realInstantaneousFrequency
                );

                if (
                    currentMode ===
                    "pll"
                ) {
                    if (
                        data.pllLocked
                    ) {
                        recoveredRaw.push(
                            (
                                realInstantaneousFrequency -
                                data.carrierFrequency
                            ) /
                            data.vcoSensitivityValue
                        );
                    } else {
                        recoveredRaw.push(
                            data.pllRecoveredPeak *
                            0.25 *
                            smoothNoise(
                                normalizedTime *
                                5.7,
                                27
                            )
                        );
                    }
                } else {
                    recoveredRaw.push(
                        data.detectorSensitivityValue *
                        (
                            realInstantaneousFrequency -
                            data.carrierFrequency
                        ) /
                        1000
                    );
                }
            }

            if (
                data.filterActive
            ) {
                const cutoffRatio =
                    3.2;

                const cutoff =
                    cutoffRatio *
                    data.modulatingFrequency;

                const timeConstant =
                    1 /
                    (
                        TWO_PI *
                        cutoff
                    );

                const alpha =
                    1 -
                    Math.exp(
                        -actualStepTime /
                        timeConstant
                    );

                let smoothed =
                    recoveredRaw[0];

                recoveredRaw.forEach(
                    function (value) {
                        smoothed +=
                            alpha *
                            (
                                value -
                                smoothed
                            );

                        recoveredFiltered.push(
                            smoothed
                        );
                    }
                );
            } else {
                recoveredFiltered.push(
                    ...recoveredRaw
                );
            }

            const recoveredPeak =
                currentMode === "pll"
                    ? data.pllRecoveredPeak
                    : data.directRecoveredPeak;

            const originalRecoveredEquivalent =
                message.map(
                    function (value) {
                        return (
                            value *
                            recoveredPeak
                        );
                    }
                );

            return {
                input,
                limited,
                message,
                recoveredRaw,
                recoveredFiltered,
                instantaneousFrequency,
                originalRecoveredEquivalent,
                normalizedStart,
                normalizedSpan
            };
        }

        function getMaximumAbsolute(values) {
            let maximum =
                0;

            values.forEach(
                function (value) {
                    maximum =
                        Math.max(
                            maximum,
                            Math.abs(
                                value
                            )
                        );
                }
            );

            return Math.max(
                maximum,
                0.05
            );
        }

        function drawTimeGrid(
            plot,
            verticalMaximum,
            duration,
            unit
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            ctx.lineWidth =
                1;

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

            ctx.lineWidth =
                1.3;

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
                    4
                ) +
                " " +
                unit,
                plot.x -
                7,
                plot.y +
                8
            );

            ctx.fillText(
                "0 " +
                unit,
                plot.x -
                7,
                centerY +
                3
            );

            ctx.fillText(
                "−" +
                formatNumber(
                    verticalMaximum,
                    4
                ) +
                " " +
                unit,
                plot.x -
                7,
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

        function drawArray(
            plot,
            values,
            verticalMaximum,
            color,
            lineWidth = 2,
            dashed = false
        ) {
            ctx.save();
            ctx.beginPath();

            for (
                let index = 0;
                index < values.length;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.width *
                    index /
                    (
                        values.length -
                        1
                    );

                const y =
                    valueToY(
                        values[index],
                        plot,
                        verticalMaximum
                    );

                if (
                    index ===
                    0
                ) {
                    ctx.moveTo(
                        x,
                        y
                    );
                } else {
                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                lineWidth;

            ctx.setLineDash(
                dashed
                    ? [
                        7,
                        5
                    ]
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

        function drawLegendItem(
            x,
            y,
            color,
            text,
            dashed = false
        ) {
            ctx.save();

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                2;

            ctx.setLineDash(
                dashed
                    ? [
                        7,
                        5
                    ]
                    : []
            );

            ctx.beginPath();
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x + 18, y - 3);
            ctx.stroke();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.84)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                text,
                x +
                25,
                y
            );

            ctx.restore();
        }

        function drawCursorOnPlot(
            plot,
            progress,
            value,
            verticalMaximum
        ) {
            const x =
                plot.x +
                plot.width *
                progress;

            const y =
                valueToY(
                    value,
                    plot,
                    verticalMaximum
                );

            ctx.save();

            ctx.strokeStyle =
                "rgba(251, 191, 36, 0.82)";

            ctx.setLineDash(
                [
                    5,
                    5
                ]
            );

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

            ctx.shadowBlur =
                10;

            ctx.shadowColor =
                "#fbbf24";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3.5,
                0,
                TWO_PI
            );

            ctx.fill();
            ctx.restore();
        }

        function drawWavePanel(
            panel,
            data,
            frameData
        ) {
            const inputPlot = {
                x:
                    panel.x +
                    62,

                y:
                    panel.y +
                    64,

                width:
                    panel.width -
                    84,

                height:
                    panel.height *
                    0.20
            };

            const limitedPlot = {
                x:
                    panel.x +
                    62,

                y:
                    inputPlot.y +
                    inputPlot.height +
                    44,

                width:
                    panel.width -
                    84,

                height:
                    panel.height *
                    0.20
            };

            const recoveredPlot = {
                x:
                    panel.x +
                    62,

                y:
                    limitedPlot.y +
                    limitedPlot.height +
                    45,

                width:
                    panel.width -
                    84,

                height:
                    panel.height -
                    inputPlot.height -
                    limitedPlot.height -
                    188
            };

            const inputMaximum =
                Math.max(
                    1.4,
                    getMaximumAbsolute(
                        frameData.input
                    ) *
                    1.08
                );

            const limitedMaximum =
                1.1;

            const recoveredMaximum =
                Math.max(
                    getMaximumAbsolute(
                        frameData.recoveredFiltered
                    ),
                    getMaximumAbsolute(
                        frameData.originalRecoveredEquivalent
                    ),
                    0.1
                ) *
                1.12;

            drawTimeGrid(
                inputPlot,
                inputMaximum,
                data.duration,
                "V rel."
            );

            drawTimeGrid(
                limitedPlot,
                limitedMaximum,
                data.duration,
                "V rel."
            );

            drawTimeGrid(
                recoveredPlot,
                recoveredMaximum,
                data.duration,
                "V"
            );

            drawArray(
                inputPlot,
                frameData.input,
                inputMaximum,
                "#38bdf8",
                1.8
            );

            drawArray(
                limitedPlot,
                frameData.limited,
                limitedMaximum,
                "#60a5fa",
                1.8
            );

            drawArray(
                recoveredPlot,
                frameData.originalRecoveredEquivalent,
                recoveredMaximum,
                "#34d399",
                1.7,
                true
            );

            drawArray(
                recoveredPlot,
                frameData.recoveredFiltered,
                recoveredMaximum,
                modeDefinitions[currentMode].color,
                2.1
            );

            const cursorProgress =
                0.62;

            const cursorIndex =
                Math.min(
                    frameData.input.length -
                    1,
                    Math.round(
                        cursorProgress *
                        (
                            frameData.input.length -
                            1
                        )
                    )
                );

            drawCursorOnPlot(
                inputPlot,
                cursorProgress,
                frameData.input[cursorIndex],
                inputMaximum
            );

            drawCursorOnPlot(
                limitedPlot,
                cursorProgress,
                frameData.limited[cursorIndex],
                limitedMaximum
            );

            drawCursorOnPlot(
                recoveredPlot,
                cursorProgress,
                frameData.recoveredFiltered[cursorIndex],
                recoveredMaximum
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.fillText(
                "1. SEÑAL FM DE ENTRADA CON RUIDO",
                inputPlot.x,
                inputPlot.y -
                10
            );

            ctx.fillText(
                "2. SALIDA DEL LIMITADOR · AMPLITUD CASI CONSTANTE",
                limitedPlot.x,
                limitedPlot.y -
                10
            );

            ctx.fillText(
                "3. MODULANTE ORIGINAL Y SEÑAL RECUPERADA",
                recoveredPlot.x,
                recoveredPlot.y -
                10
            );

            drawLegendItem(
                recoveredPlot.x,
                recoveredPlot.y +
                13,
                "#34d399",
                "Original equivalente",
                true
            );

            drawLegendItem(
                recoveredPlot.x +
                145,
                recoveredPlot.y +
                13,
                modeDefinitions[currentMode].color,
                "Recuperada"
            );

            ctx.restore();
        }

        function drawTransferAxes(
            plot,
            xLabel,
            yLabel
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            for (
                let index = 0;
                index <= 6;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.width *
                    index /
                    6;

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

            const centerX =
                plot.x +
                plot.width /
                2;

            const centerY =
                plot.y +
                plot.height /
                2;

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.40)";

            ctx.lineWidth =
                1.3;

            ctx.beginPath();
            ctx.moveTo(centerX, plot.y);

            ctx.lineTo(
                centerX,
                plot.y +
                plot.height
            );

            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(plot.x, centerY);

            ctx.lineTo(
                plot.x +
                plot.width,
                centerY
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.76)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                xLabel,
                plot.x +
                plot.width,
                plot.y +
                plot.height +
                28
            );

            ctx.textAlign =
                "left";

            ctx.fillText(
                yLabel,
                plot.x,
                plot.y -
                12
            );

            ctx.restore();
        }

        function drawCharacteristicCurve(
            plot,
            functionValue,
            color
        ) {
            ctx.save();
            ctx.beginPath();

            for (
                let index = 0;
                index <= 400;
                index += 1
            ) {
                const normalizedX =
                    -1.5 +
                    3 *
                    index /
                    400;

                const normalizedY =
                    functionValue(
                        normalizedX
                    );

                const x =
                    plot.x +
                    (
                        normalizedX +
                        1.5
                    ) /
                    3 *
                    plot.width;

                const y =
                    plot.y +
                    plot.height /
                    2 -
                    normalizedY *
                    plot.height *
                    0.38;

                if (
                    index ===
                    0
                ) {
                    ctx.moveTo(
                        x,
                        y
                    );
                } else {
                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                2.2;

            ctx.shadowBlur =
                8;

            ctx.shadowColor =
                color;

            ctx.stroke();
            ctx.restore();
        }

        function drawDirectCharacteristic(
            panel,
            data,
            frameData
        ) {
            const plot = {
                x:
                    panel.x +
                    60,

                y:
                    panel.y +
                    77,

                width:
                    panel.width -
                    86,

                height:
                    panel.height *
                    0.50
            };

            const definition =
                modeDefinitions[currentMode];

            let curveFunction;
            let xLabel;
            let yLabel;
            let curveNote;

            if (
                currentMode ===
                "slope"
            ) {
                curveFunction =
                    function (x) {
                        return clamp(
                            0.58 *
                            x,
                            -1,
                            1
                        );
                    };

                xLabel =
                    "Desviación normalizada respecto de fᶜ";

                yLabel =
                    "Cambio de amplitud normalizado";

                curveNote =
                    "La pendiente convierte frecuencia en amplitud; después se rectifica y filtra.";
            } else if (
                currentMode ===
                "discriminator"
            ) {
                curveFunction =
                    function (x) {
                        return clamp(
                            x,
                            -1,
                            1
                        );
                    };

                xLabel =
                    "Desviación normalizada respecto de fᶜ";

                yLabel =
                    "Tensión normalizada";

                curveNote =
                    "Desviaciones opuestas producen tensiones opuestas; la polaridad real depende del circuito.";
            } else {
                curveFunction =
                    function (x) {
                        return clamp(
                            x /
                            (
                                1 +
                                0.12 *
                                x *
                                x
                            ),
                            -1,
                            1
                        );
                    };

                xLabel =
                    "Desviación normalizada respecto de fᶜ";

                yLabel =
                    "Relación de salida normalizada";

                curveNote =
                    "La respuesta se muestra como curva S conceptual y no como una topología calibrada.";
            }

            drawTransferAxes(
                plot,
                xLabel,
                yLabel
            );

            drawCharacteristicCurve(
                plot,
                curveFunction,
                definition.color
            );

            const cursorIndex =
                Math.min(
                    frameData.instantaneousFrequency.length -
                    1,
                    Math.round(
                        0.62 *
                        (
                            frameData.instantaneousFrequency.length -
                            1
                        )
                    )
                );

            const normalizedDeviation =
                data.frequencyDeviation > 0
                    ? (
                        frameData.instantaneousFrequency[cursorIndex] -
                        data.carrierFrequency
                    ) /
                    data.frequencyDeviation
                    : 0;

            const curveValue =
                curveFunction(
                    normalizedDeviation
                );

            const markerX =
                plot.x +
                (
                    clamp(
                        normalizedDeviation,
                        -1.5,
                        1.5
                    ) +
                    1.5
                ) /
                3 *
                plot.width;

            const markerY =
                plot.y +
                plot.height /
                2 -
                curveValue *
                plot.height *
                0.38;

            ctx.save();

            ctx.fillStyle =
                "#fbbf24";

            ctx.shadowBlur =
                12;

            ctx.shadowColor =
                "#fbbf24";

            ctx.beginPath();

            ctx.arc(
                markerX,
                markerY,
                5,
                0,
                TWO_PI
            );

            ctx.fill();

            ctx.shadowBlur =
                0;

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            wrapText(
                curveNote,
                panel.x +
                18,
                panel.y +
                panel.height *
                0.67,
                panel.width -
                36,
                13,
                3
            );

            ctx.fillStyle =
                "#bae6fd";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.fillText(
                "MODELO IDEAL LOCAL",
                panel.x +
                18,
                panel.y +
                panel.height -
                93
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.fillText(
                "vout ≈ Kd(fi − fᶜ)",
                panel.x +
                18,
                panel.y +
                panel.height -
                72
            );

            ctx.fillText(
                "Pico ideal = " +
                formatNumber(
                    data.directRecoveredPeak,
                    5
                ) +
                " V",
                panel.x +
                18,
                panel.y +
                panel.height -
                54
            );

            ctx.fillText(
                "El limitador previo reduce acoplamiento de ruido de amplitud.",
                panel.x +
                18,
                panel.y +
                panel.height -
                36
            );

            ctx.restore();
        }

        function drawPllDiagnostic(
            panel,
            data
        ) {
            const gauge = {
                x:
                    panel.x +
                    38,

                y:
                    panel.y +
                    83,

                width:
                    panel.width -
                    76,

                height:
                    46
            };

            const span =
                Math.max(
                    data.captureRange *
                    1.5,
                    Math.abs(
                        data.vcoOffsetValue
                    ) *
                    1.3,
                    data.modulatingFrequency
                );

            const minimum =
                data.carrierFrequency -
                span;

            const maximum =
                data.carrierFrequency +
                span;

            const frequencyToX =
                function (frequency) {
                    return (
                        gauge.x +
                        (
                            frequency -
                            minimum
                        ) /
                        (
                            maximum -
                            minimum
                        ) *
                        gauge.width
                    );
                };

            const captureStart =
                data.freeRunningFrequency -
                data.captureRange;

            const captureEnd =
                data.freeRunningFrequency +
                data.captureRange;

            ctx.save();

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.42)";

            ctx.lineWidth =
                2;

            ctx.beginPath();

            ctx.moveTo(
                gauge.x,
                gauge.y +
                gauge.height /
                2
            );

            ctx.lineTo(
                gauge.x +
                gauge.width,
                gauge.y +
                gauge.height /
                2
            );

            ctx.stroke();

            const captureX1 =
                frequencyToX(
                    captureStart
                );

            const captureX2 =
                frequencyToX(
                    captureEnd
                );

            ctx.fillStyle =
                data.pllLocked
                    ? "rgba(52, 211, 153, 0.18)"
                    : "rgba(251, 113, 133, 0.16)";

            ctx.strokeStyle =
                data.pllLocked
                    ? "#34d399"
                    : "#fb7185";

            roundedRectanglePath(
                captureX1,
                gauge.y +
                7,
                Math.max(
                    2,
                    captureX2 -
                    captureX1
                ),
                gauge.height -
                14,
                7
            );

            ctx.fill();
            ctx.stroke();

            const freeX =
                frequencyToX(
                    data.freeRunningFrequency
                );

            const inputX =
                frequencyToX(
                    data.carrierFrequency
                );

            ctx.strokeStyle =
                "#fb923c";

            ctx.lineWidth =
                2;

            ctx.beginPath();
            ctx.moveTo(freeX, gauge.y);

            ctx.lineTo(
                freeX,
                gauge.y +
                gauge.height
            );

            ctx.stroke();

            ctx.strokeStyle =
                "#38bdf8";

            ctx.beginPath();
            ctx.moveTo(inputX, gauge.y);

            ctx.lineTo(
                inputX,
                gauge.y +
                gauge.height
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";

            ctx.font =
                "600 7.5px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "f libre",
                freeX,
                gauge.y -
                8
            );

            ctx.fillText(
                "fᶜ entrada",
                inputX,
                gauge.y +
                gauge.height +
                15
            );

            ctx.fillStyle =
                data.pllLocked
                    ? "#a7f3d0"
                    : "#fda4af";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.fillText(
                data.pllLocked
                    ? "PLL ENGANCHADO"
                    : "PLL NO ENGANCHADO",
                panel.x +
                panel.width /
                2,
                panel.y +
                176
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "Desajuste inicial: " +
                formatFrequency(
                    Math.abs(
                        data.vcoOffsetValue
                    )
                ),
                panel.x +
                20,
                panel.y +
                205
            );

            ctx.fillText(
                "Rango de captura: ±" +
                formatFrequency(
                    data.captureRange
                ),
                panel.x +
                20,
                panel.y +
                224
            );

            ctx.fillText(
                "Nivel DC de control aproximado: " +
                formatNumber(
                    data.controlDc,
                    5
                ) +
                " V",
                panel.x +
                20,
                panel.y +
                243
            );

            ctx.fillText(
                "Variación útil pico: " +
                formatNumber(
                    data.pllRecoveredPeak,
                    5
                ) +
                " V",
                panel.x +
                20,
                panel.y +
                262
            );

            ctx.fillStyle =
                "#fbbf24";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.fillText(
                "CD4046 · REFERENCIA FUNCIONAL",
                panel.x +
                20,
                panel.y +
                294
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 7.5px Segoe UI, sans-serif";

            wrapText(
                "Integra comparadores de fase y VCO; requiere filtro externo y revisión de la hoja de datos de la variante exacta.",
                panel.x +
                20,
                panel.y +
                313,
                panel.width -
                40,
                13,
                4
            );

            ctx.restore();
        }

        function drawMainPanels(
            data,
            frameData
        ) {
            const mobile =
                viewWidth <
                720;

            let chainPanel;
            let wavePanel;
            let diagnosticPanel;

            if (mobile) {
                chainPanel = {
                    x: 14,
                    y: 78,

                    width:
                        viewWidth -
                        28,

                    height:
                        currentMode === "pll"
                            ? 400
                            : 455
                };

                wavePanel = {
                    x: 14,

                    y:
                        chainPanel.y +
                        chainPanel.height +
                        16,

                    width:
                        viewWidth -
                        28,

                    height:
                        650
                };

                diagnosticPanel = {
                    x: 14,

                    y:
                        wavePanel.y +
                        wavePanel.height +
                        16,

                    width:
                        viewWidth -
                        28,

                    height:
                        320
                };
            } else {
                chainPanel = {
                    x: 20,
                    y: 78,

                    width:
                        viewWidth -
                        40,

                    height:
                        190
                };

                wavePanel = {
                    x: 20,
                    y: 284,

                    width:
                        viewWidth *
                        0.62 -
                        28,

                    height:
                        585
                };

                diagnosticPanel = {
                    x:
                        wavePanel.x +
                        wavePanel.width +
                        16,

                    y: 284,

                    width:
                        viewWidth -
                        wavePanel.width -
                        56,

                    height:
                        585
                };
            }

            drawPanel(
                chainPanel,
                currentMode === "pll"
                    ? "CADENA PLL Y REALIMENTACIÓN"
                    : "CADENA FUNCIONAL DE DEMODULACIÓN FM",
                modeDefinitions[currentMode].color,
                currentMode === "pll"
                    ? "comparador, filtro de lazo, VCO y retorno"
                    : "limitador, detector y filtrado de salida"
            );

            drawPanel(
                wavePanel,
                "SEÑALES SINCRONIZADAS",
                "#38bdf8",
                "entrada FM, salida limitada y modulante recuperada"
            );

            drawPanel(
                diagnosticPanel,
                currentMode === "pll"
                    ? "CAPTURA, ENGANCHE Y CD4046"
                    : "CARACTERÍSTICA FRECUENCIA–TENSIÓN",
                modeDefinitions[currentMode].color,
                currentMode === "pll"
                    ? "modelo funcional sin diseño de lazo"
                    : "curva conceptual normalizada"
            );

            if (
                currentMode ===
                "pll"
            ) {
                drawPllChain(
                    chainPanel,
                    data
                );
            } else {
                drawDirectChain(
                    chainPanel
                );
            }

            drawWavePanel(
                wavePanel,
                data,
                frameData
            );

            if (
                currentMode ===
                "pll"
            ) {
                drawPllDiagnostic(
                    diagnosticPanel,
                    data
                );
            } else {
                drawDirectCharacteristic(
                    diagnosticPanel,
                    data,
                    frameData
                );
            }
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
                "Revise las frecuencias, desviación, sensibilidades y rango de captura.",
                viewWidth /
                2,
                viewHeight /
                2,
                viewWidth -
                70,
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
                "Modelo funcional didáctico · sin detector de envolvente AM · sin diseño profesional de PLL o CD4046.",
                viewWidth -
                18,
                viewHeight -
                14
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

            currentFrameData =
                getFrameData(
                    currentData
                );

            drawCanvasHeader(
                currentData
            );

            drawMainPanels(
                currentData,
                currentFrameData
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
                    elapsedTime =
                        0;
                }
            }

            drawScene();

            requestAnimationFrame(
                animate
            );
        }

        modeButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        setMode(
                            button.dataset.mode
                        );
                    }
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

        [
            carrierFrequencyInput,
            carrierFrequencyUnit,
            frequencyDeviationInput,
            frequencyDeviationUnit,
            modulatingFrequencyInput,
            modulatingFrequencyUnit,
            captureRangeInput,
            captureRangeUnit,
            noiseLevel,
            outputFilter,
            detectorSensitivity,
            vcoSensitivity,
            vcoOffset,
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
            function (time) {
                lastFrameTime =
                    time;

                animate(
                    time
                );
            }
        );
    
