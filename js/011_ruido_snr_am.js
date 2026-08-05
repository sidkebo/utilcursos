        "use strict";

        /*
         * SIT-400 — Clase 11
         * Ruido, otras perturbaciones y SNR en AM.
         *
         * Modelo base:
         * Ac = variable
         * fc = 20 Hz
         * fm = 2 Hz
         * m = 0,5
         *
         * El simulador distingue:
         * - Ruido aleatorio.
         * - Ruido impulsivo.
         * - Interferencia senoidal.
         * - Saturación.
         * - Mala conexión.
         * - Sobremodulación.
         *
         * No incluye ruido en FM, BER, temperatura equivalente,
         * propagación, radioenlaces ni diseño profesional de receptores.
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

        const signalPowerMetric =
            document.getElementById("signalPowerMetric");

        const disturbancePowerLabel =
            document.getElementById("disturbancePowerLabel");

        const disturbancePowerMetric =
            document.getElementById("disturbancePowerMetric");

        const snrLinearMetric =
            document.getElementById("snrLinearMetric");

        const snrDbMetric =
            document.getElementById("snrDbMetric");

        const receivedAmplitudeMetric =
            document.getElementById("receivedAmplitudeMetric");

        const effectiveParameterLabel =
            document.getElementById("effectiveParameterLabel");

        const effectiveParameterMetric =
            document.getElementById("effectiveParameterMetric");

        const signalAmplitude =
            document.getElementById("signalAmplitude");

        const disturbanceType =
            document.getElementById("disturbanceType");

        const controlMode =
            document.getElementById("controlMode");

        const noiseLevel =
            document.getElementById("noiseLevel");

        const noiseLevelOutput =
            document.getElementById("noiseLevelOutput");

        const targetSnr =
            document.getElementById("targetSnr");

        const targetSnrOutput =
            document.getElementById("targetSnrOutput");

        const attenuation =
            document.getElementById("attenuation");

        const attenuationOutput =
            document.getElementById("attenuationOutput");

        const interferenceIntensity =
            document.getElementById("interferenceIntensity");

        const interferenceOutput =
            document.getElementById("interferenceOutput");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedOutput =
            document.getElementById("animationSpeedOutput");

        const signalPowerFormula =
            document.getElementById("signalPowerFormula");

        const disturbanceFormulaLabel =
            document.getElementById("disturbanceFormulaLabel");

        const disturbancePowerFormula =
            document.getElementById("disturbancePowerFormula");

        const snrLinearFormula =
            document.getElementById("snrLinearFormula");

        const snrDbFormula =
            document.getElementById("snrDbFormula");

        const diagnosticSymptom =
            document.getElementById("diagnosticSymptom");

        const diagnosticCause =
            document.getElementById("diagnosticCause");

        const diagnosticCheck =
            document.getElementById("diagnosticCheck");

        const diagnosticDifference =
            document.getElementById("diagnosticDifference");

        const diagnosticTableBody =
            document.getElementById("diagnosticTableBody");

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

        const carrierFrequency = 20;
        const modulatingFrequency = 2;
        const baseModulationIndex = 0.5;
        const displayDuration = 2;

        const diagnosis = {
            random: {
                title: "Ruido aleatorio",

                description:
                    "La perturbación irregular se suma a la señal y vuelve menos uniforme la envolvente.",

                symptom:
                    "Variación irregular continua, sin periodicidad claramente estable.",

                cause:
                    "Ruido interno de componentes o ruido externo captado por el sistema.",

                check:
                    "Alimentación, tierra, blindaje, cableado, ganancia y fuentes cercanas.",

                difference:
                    "No mantiene una frecuencia fija y no aparece únicamente como picos aislados.",

                tableEffect:
                    "La envolvente se vuelve rugosa y menos clara."
            },

            impulsive: {
                title: "Ruido impulsivo",

                description:
                    "Aparecen picos breves que deforman momentáneamente la señal y la envolvente.",

                symptom:
                    "Picos bruscos, aislados y de corta duración.",

                cause:
                    "Motores, relés, interruptores, chispas o descargas transitorias.",

                check:
                    "Equipos conmutados, relés, cables, tierra y cercanía de cargas inductivas.",

                difference:
                    "Se presenta en eventos breves; no es una variación aleatoria continua.",

                tableEffect:
                    "Introduce picos y errores momentáneos en la envolvente."
            },

            sinusoidal: {
                title: "Interferencia senoidal",

                description:
                    "Una señal periódica identificable se superpone a la AM y produce una deformación repetitiva.",

                symptom:
                    "Ondulación periódica o batido con frecuencia relativamente estable.",

                cause:
                    "Otra señal, fuente conmutada, motor o transmisor próximo.",

                check:
                    "Fuentes periódicas cercanas, blindaje, separación física y sintonía.",

                difference:
                    "La perturbación mantiene un patrón repetitivo, a diferencia del ruido aleatorio.",

                tableEffect:
                    "La envolvente presenta una ondulación periódica."
            },

            saturation: {
                title: "Saturación",

                description:
                    "Los máximos de la señal quedan recortados porque la etapa no puede entregar mayor amplitud.",

                symptom:
                    "Picos superiores e inferiores aplanados o recortados.",

                cause:
                    "Ganancia excesiva, alimentación insuficiente o límite de una etapa activa.",

                check:
                    "Nivel de entrada, ganancia, alimentación y margen de salida.",

                difference:
                    "El recorte aparece al superar un límite; no es una señal aleatoria añadida.",

                tableEffect:
                    "La envolvente pierde sus máximos y se aplana."
            },

            connection: {
                title: "Mala conexión",

                description:
                    "La señal presenta caídas, cortes parciales y perturbaciones de contacto.",

                symptom:
                    "Interrupciones, cambios bruscos de nivel o señal intermitente.",

                cause:
                    "Conector flojo, cable dañado, tierra deficiente o contacto inestable.",

                check:
                    "Continuidad, conectores, tierra común, soldaduras y movimiento del cable.",

                difference:
                    "Produce caídas de nivel o cortes; no conserva una distribución aleatoria uniforme.",

                tableEffect:
                    "La envolvente desaparece o cae durante intervalos."
            },

            overmodulation: {
                title: "Sobremodulación",

                description:
                    "El índice efectivo supera uno y la envolvente algebraica se cruza.",

                symptom:
                    "Cruce de la envolvente, estrechamientos hasta cero e inversión de fase.",

                cause:
                    "Amplitud modulante o profundidad de modulación excesiva.",

                check:
                    "Nivel de modulante, ajuste del modulador e índice de modulación.",

                difference:
                    "Proviene de m > 1; no es una perturbación aleatoria añadida.",

                tableEffect:
                    "La envolvente se cruza y deja de representar correctamente el mensaje."
            }
        };

        const presets = {
            clean: {
                type: "random",
                mode: "manual",
                noise: 0,
                intensity: 0,
                attenuation: 0
            },

            low: {
                type: "random",
                mode: "manual",
                noise: 0.05,
                intensity: 0.15,
                attenuation: 0
            },

            medium: {
                type: "random",
                mode: "manual",
                noise: 0.15,
                intensity: 0.3,
                attenuation: 0
            },

            high: {
                type: "random",
                mode: "manual",
                noise: 0.35,
                intensity: 0.5,
                attenuation: 0
            },

            impulsive: {
                type: "impulsive",
                mode: "manual",
                noise: 0.05,
                intensity: 0.75,
                attenuation: 0
            },

            interference: {
                type: "sinusoidal",
                mode: "manual",
                noise: 0.02,
                intensity: 0.35,
                attenuation: 0
            },

            saturation: {
                type: "saturation",
                mode: "manual",
                noise: 0.02,
                intensity: 0.75,
                attenuation: 0
            },

            overmodulation: {
                type: "overmodulation",
                mode: "manual",
                noise: 0,
                intensity: 0.65,
                attenuation: 0
            }
        };

        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 810;
        let pixelRatio = 1;

        let currentAnalysis = null;

        function clamp(value, minimum, maximum) {
            return Math.min(
                maximum,
                Math.max(minimum, value)
            );
        }

        function smoothStep(edge0, edge1, value) {
            if (edge0 === edge1) {
                return value < edge0
                    ? 0
                    : 1;
            }

            const normalized =
                clamp(
                    (
                        value -
                        edge0
                    ) /
                    (
                        edge1 -
                        edge0
                    ),
                    0,
                    1
                );

            return (
                normalized *
                normalized *
                (
                    3 -
                    2 *
                    normalized
                )
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

        function interpolatedNoise(
            time,
            rate,
            seed
        ) {
            const position =
                time *
                rate;

            const index =
                Math.floor(position);

            const fraction =
                position -
                index;

            const interpolation =
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
                interpolation
            );
        }

        function randomNoise(time) {
            return (
                interpolatedNoise(
                    time,
                    173,
                    1
                ) +
                interpolatedNoise(
                    time,
                    239,
                    3
                ) +
                interpolatedNoise(
                    time,
                    311,
                    7
                )
            );
        }

        function impulseNoise(time) {
            const repetitionRate = 2.4;

            const cycle =
                Math.floor(
                    time *
                    repetitionRate
                );

            const localTime =
                fractional(
                    time *
                    repetitionRate
                );

            const center =
                0.12 +
                0.7 *
                hash(
                    cycle,
                    11
                );

            const width =
                0.012 +
                0.018 *
                hash(
                    cycle,
                    19
                );

            const polarity =
                hash(
                    cycle,
                    23
                ) >
                0.5
                    ? 1
                    : -1;

            const distance =
                (
                    localTime -
                    center
                ) /
                width;

            return (
                polarity *
                Math.exp(
                    -distance *
                    distance
                )
            );
        }

        function connectionWindow(time) {
            const repetitionRate = 0.9;

            const cycle =
                Math.floor(
                    time *
                    repetitionRate
                );

            const localTime =
                fractional(
                    time *
                    repetitionRate
                );

            const start =
                0.12 +
                0.38 *
                hash(
                    cycle,
                    31
                );

            const width =
                0.1 +
                0.18 *
                hash(
                    cycle,
                    37
                );

            const rise =
                smoothStep(
                    start,
                    start + 0.025,
                    localTime
                );

            const fall =
                1 -
                smoothStep(
                    start +
                    width -
                    0.025,
                    start +
                    width,
                    localTime
                );

            return (
                rise *
                fall
            );
        }

        function formatNumber(value, decimals = 4) {
            if (!Number.isFinite(value)) {
                return "∞";
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

        function formatPower(value) {
            if (!Number.isFinite(value)) {
                return "∞";
            }

            return (
                formatNumber(
                    value,
                    7
                ) +
                " V² rel."
            );
        }

        function formatSnrDb(value) {
            if (!Number.isFinite(value)) {
                return "∞ dB";
            }

            return (
                formatNumber(
                    value,
                    3
                ) +
                " dB"
            );
        }

        function getParameters() {
            const amplitude =
                Number(
                    signalAmplitude.value
                );

            const attenuationDb =
                Number(
                    attenuation.value
                );

            const baseNoiseLevel =
                Number(
                    noiseLevel.value
                );

            const intensity =
                Number(
                    interferenceIntensity.value
                );

            const targetSnrDb =
                Number(
                    targetSnr.value
                );

            const type =
                disturbanceType.value;

            const mode =
                controlMode.value;

            const attenuationFactor =
                Math.pow(
                    10,
                    -attenuationDb /
                    20
                );

            const receivedCarrierAmplitude =
                amplitude *
                attenuationFactor;

            const valid =
                [
                    amplitude,
                    attenuationDb,
                    baseNoiseLevel,
                    intensity,
                    targetSnrDb,
                    attenuationFactor,
                    receivedCarrierAmplitude
                ].every(Number.isFinite) &&
                amplitude > 0 &&
                attenuationDb >= 0 &&
                baseNoiseLevel >= 0 &&
                intensity >= 0;

            return {
                valid,
                amplitude,
                attenuationDb,
                attenuationFactor,
                receivedCarrierAmplitude,
                baseNoiseLevel,
                intensity,
                targetSnrDb,
                type,
                mode
            };
        }

        function cleanEnvelope(
            time,
            parameters
        ) {
            return (
                parameters.receivedCarrierAmplitude *
                (
                    1 +
                    baseModulationIndex *
                    Math.cos(
                        2 *
                        Math.PI *
                        modulatingFrequency *
                        time
                    )
                )
            );
        }

        function cleanSignal(
            time,
            parameters
        ) {
            return (
                cleanEnvelope(
                    time,
                    parameters
                ) *
                Math.cos(
                    2 *
                    Math.PI *
                    carrierFrequency *
                    time
                )
            );
        }

        function getDisturbanceSample(
            time,
            parameters,
            scale
        ) {
            const base =
                cleanSignal(
                    time,
                    parameters
                );

            const referenceAmplitude =
                parameters.amplitude;

            const noiseAmplitude =
                referenceAmplitude *
                parameters.baseNoiseLevel *
                scale;

            const severity =
                clamp(
                    parameters.intensity *
                    scale,
                    0,
                    2.5
                );

            let received = base;
            let effectiveModulationIndex =
                baseModulationIndex;

            if (
                parameters.type === "random"
            ) {
                received =
                    base +
                    noiseAmplitude *
                    randomNoise(time);
            } else if (
                parameters.type === "impulsive"
            ) {
                const background =
                    noiseAmplitude *
                    0.25 *
                    randomNoise(time);

                const impulses =
                    referenceAmplitude *
                    severity *
                    1.45 *
                    impulseNoise(time);

                received =
                    base +
                    background +
                    impulses;
            } else if (
                parameters.type === "sinusoidal"
            ) {
                const background =
                    noiseAmplitude *
                    0.15 *
                    randomNoise(time);

                const interference =
                    referenceAmplitude *
                    severity *
                    Math.sin(
                        2 *
                        Math.PI *
                        13 *
                        time +
                        0.45
                    );

                received =
                    base +
                    background +
                    interference;
            } else if (
                parameters.type === "saturation"
            ) {
                const noisyInput =
                    base +
                    noiseAmplitude *
                    0.12 *
                    randomNoise(time);

                const normalizedSeverity =
                    clamp(
                        severity,
                        0,
                        1
                    );

                const clippingLevel =
                    parameters.receivedCarrierAmplitude *
                    (
                        1.5 -
                        1.18 *
                        normalizedSeverity
                    );

                received =
                    clamp(
                        noisyInput,
                        -Math.max(
                            clippingLevel,
                            0.08 *
                            parameters.receivedCarrierAmplitude
                        ),
                        Math.max(
                            clippingLevel,
                            0.08 *
                            parameters.receivedCarrierAmplitude
                        )
                    );
            } else if (
                parameters.type === "connection"
            ) {
                const dropout =
                    connectionWindow(time);

                const gate =
                    1 -
                    clamp(
                        severity,
                        0,
                        1
                    ) *
                    0.96 *
                    dropout;

                const contactNoise =
                    noiseAmplitude *
                    (
                        0.55 *
                        randomNoise(time) +
                        1.2 *
                        impulseNoise(
                            time +
                            0.13
                        )
                    );

                received =
                    base *
                    gate +
                    contactNoise *
                    (
                        0.25 +
                        dropout
                    );
            } else if (
                parameters.type === "overmodulation"
            ) {
                effectiveModulationIndex =
                    baseModulationIndex +
                    0.55 *
                    scale +
                    0.55 *
                    parameters.intensity *
                    scale;

                effectiveModulationIndex =
                    clamp(
                        effectiveModulationIndex,
                        baseModulationIndex,
                        2.5
                    );

                const alteredEnvelope =
                    parameters.receivedCarrierAmplitude *
                    (
                        1 +
                        effectiveModulationIndex *
                        Math.cos(
                            2 *
                            Math.PI *
                            modulatingFrequency *
                            time
                        )
                    );

                received =
                    alteredEnvelope *
                    Math.cos(
                        2 *
                        Math.PI *
                        carrierFrequency *
                        time
                    ) +
                    noiseAmplitude *
                    0.08 *
                    randomNoise(time);
            }

            return {
                clean: base,
                received,
                disturbance:
                    received -
                    base,
                effectiveModulationIndex
            };
        }

        function calculateMetrics(
            parameters,
            scale
        ) {
            const sampleCount = 2600;
            const duration = 2;

            let signalSquareSum = 0;
            let disturbanceSquareSum = 0;
            let maximumReceived = 0;
            let effectiveModulationIndex =
                baseModulationIndex;

            for (
                let index = 0;
                index < sampleCount;
                index += 1
            ) {
                const time =
                    duration *
                    index /
                    sampleCount;

                const sample =
                    getDisturbanceSample(
                        time,
                        parameters,
                        scale
                    );

                signalSquareSum +=
                    sample.clean *
                    sample.clean;

                disturbanceSquareSum +=
                    sample.disturbance *
                    sample.disturbance;

                maximumReceived =
                    Math.max(
                        maximumReceived,
                        Math.abs(
                            sample.received
                        )
                    );

                effectiveModulationIndex =
                    sample.effectiveModulationIndex;
            }

            const signalPower =
                signalSquareSum /
                sampleCount;

            const disturbancePower =
                disturbanceSquareSum /
                sampleCount;

            const snrLinear =
                disturbancePower >
                1e-14
                    ? signalPower /
                        disturbancePower
                    : Infinity;

            const snrDb =
                Number.isFinite(
                    snrLinear
                )
                    ? 10 *
                        Math.log10(
                            snrLinear
                        )
                    : Infinity;

            return {
                scale,
                signalPower,
                disturbancePower,
                snrLinear,
                snrDb,
                maximumReceived,
                effectiveModulationIndex
            };
        }

        function solveScaleForTargetSnr(
            parameters
        ) {
            const baseAnalysis =
                calculateMetrics(
                    parameters,
                    0
                );

            const targetPower =
                baseAnalysis.signalPower /
                Math.pow(
                    10,
                    parameters.targetSnrDb /
                    10
                );

            let lower = 0;
            let upper = 1;

            let upperAnalysis =
                calculateMetrics(
                    parameters,
                    upper
                );

            while (
                upperAnalysis.disturbancePower <
                    targetPower &&
                upper < 32
            ) {
                upper *= 2;

                upperAnalysis =
                    calculateMetrics(
                        parameters,
                        upper
                    );
            }

            for (
                let iteration = 0;
                iteration < 24;
                iteration += 1
            ) {
                const middle =
                    (
                        lower +
                        upper
                    ) /
                    2;

                const middleAnalysis =
                    calculateMetrics(
                        parameters,
                        middle
                    );

                if (
                    middleAnalysis.disturbancePower <
                    targetPower
                ) {
                    lower =
                        middle;
                } else {
                    upper =
                        middle;
                }
            }

            return calculateMetrics(
                parameters,
                (
                    lower +
                    upper
                ) /
                2
            );
        }

        function getSnrClassification(
            snrDb
        ) {
            if (!Number.isFinite(snrDb)) {
                return {
                    label: "Sin perturbación",
                    state: "neutral"
                };
            }

            if (snrDb >= 20) {
                return {
                    label: "SNR alta",
                    state: ""
                };
            }

            if (snrDb >= 10) {
                return {
                    label: "SNR media",
                    state: "warning"
                };
            }

            if (snrDb >= 0) {
                return {
                    label: "SNR baja",
                    state: "danger"
                };
            }

            return {
                label: "Ruido dominante",
                state: "danger"
            };
        }

        function updateControlAvailability() {
            const targetMode =
                controlMode.value ===
                "target";

            noiseLevel.disabled =
                targetMode;

            targetSnr.disabled =
                !targetMode;
        }

        function updateDiagnosticTable() {
            const selectedType =
                disturbanceType.value;

            const rows = [
                {
                    key: "random",
                    name: "Ruido aleatorio",
                    appearance:
                        "Variación irregular continua.",
                    effect:
                        "Envolvente rugosa o menos definida.",
                    check:
                        "Alimentación, blindaje, tierra y etapas activas."
                },
                {
                    key: "impulsive",
                    name: "Ruido impulsivo",
                    appearance:
                        "Picos breves y aislados.",
                    effect:
                        "Errores momentáneos o picos de envolvente.",
                    check:
                        "Motores, relés, chispas e interruptores."
                },
                {
                    key: "sinusoidal",
                    name: "Interferencia",
                    appearance:
                        "Ondulación periódica o batido.",
                    effect:
                        "Variación repetitiva superpuesta.",
                    check:
                        "Fuentes periódicas, sintonía y separación."
                },
                {
                    key: "saturation",
                    name: "Saturación",
                    appearance:
                        "Picos recortados o aplanados.",
                    effect:
                        "La envolvente pierde sus máximos.",
                    check:
                        "Ganancia, alimentación y nivel de entrada."
                },
                {
                    key: "connection",
                    name: "Mala conexión",
                    appearance:
                        "Caídas, cortes o señal intermitente.",
                    effect:
                        "Pérdida parcial o total de la envolvente.",
                    check:
                        "Cables, conectores, soldaduras y tierra."
                },
                {
                    key: "overmodulation",
                    name: "Sobremodulación",
                    appearance:
                        "Cruce de envolvente e inversión.",
                    effect:
                        "La envolvente deja de representar el mensaje.",
                    check:
                        "Nivel de modulante e índice m."
                }
            ];

            diagnosticTableBody.innerHTML =
                rows
                    .map(
                        function (row) {
                            const active =
                                row.key ===
                                selectedType;

                            return (
                                '<tr class="' +
                                    (
                                        active
                                            ? "active-row"
                                            : ""
                                    ) +
                                '">' +
                                    "<td>" +
                                        row.name +
                                    "</td>" +
                                    "<td>" +
                                        row.appearance +
                                    "</td>" +
                                    "<td>" +
                                        row.effect +
                                    "</td>" +
                                    "<td>" +
                                        row.check +
                                    "</td>" +
                                    "<td>" +
                                        (
                                            active
                                                ? '<span class="status-chip active">Seleccionado</span>'
                                                : '<span class="status-chip inactive">Referencia</span>'
                                        ) +
                                    "</td>" +
                                "</tr>"
                            );
                        }
                    )
                    .join("");
        }

        function updateInterface() {
            updateControlAvailability();

            const parameters =
                getParameters();

            noiseLevelOutput.textContent =
                formatNumber(
                    Number(
                        noiseLevel.value
                    ),
                    2
                ) +
                " V";

            targetSnrOutput.textContent =
                formatNumber(
                    Number(
                        targetSnr.value
                    ),
                    0
                ) +
                " dB";

            attenuationOutput.textContent =
                formatNumber(
                    Number(
                        attenuation.value
                    ),
                    1
                ) +
                " dB";

            interferenceOutput.textContent =
                formatNumber(
                    Number(
                        interferenceIntensity.value
                    ),
                    2
                );

            animationSpeedOutput.textContent =
                Number(
                    animationSpeed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            if (!parameters.valid) {
                stateBanner.className =
                    "banner danger";

                stateTitle.textContent =
                    "Datos no válidos";

                stateDescription.textContent =
                    "La amplitud debe ser positiva y los niveles no pueden ser negativos.";

                stateTag.textContent =
                    "Sin cálculo";

                return;
            }

            currentAnalysis =
                parameters.mode ===
                "target"
                    ? solveScaleForTargetSnr(
                        parameters
                    )
                    : calculateMetrics(
                        parameters,
                        1
                    );

            currentAnalysis.parameters =
                parameters;

            const diagnostic =
                diagnosis[
                    parameters.type
                ];

            const classification =
                getSnrClassification(
                    currentAnalysis.snrDb
                );

            stateBanner.className =
                "banner" +
                (
                    classification.state
                        ? " " +
                            classification.state
                        : ""
                );

            stateTitle.textContent =
                diagnostic.title;

            stateDescription.textContent =
                diagnostic.description;

            stateTag.textContent =
                classification.label;

            signalPowerMetric.textContent =
                formatPower(
                    currentAnalysis.signalPower
                );

            const isNoiseMode =
                parameters.type === "random" ||
                parameters.type === "impulsive";

            disturbancePowerLabel.textContent =
                isNoiseMode
                    ? "Potencia relativa de ruido"
                    : "Potencia equivalente de perturbación";

            disturbancePowerMetric.textContent =
                formatPower(
                    currentAnalysis.disturbancePower
                );

            snrLinearMetric.textContent =
                formatNumber(
                    currentAnalysis.snrLinear,
                    5
                );

            snrDbMetric.textContent =
                formatSnrDb(
                    currentAnalysis.snrDb
                );

            receivedAmplitudeMetric.textContent =
                formatNumber(
                    parameters.receivedCarrierAmplitude,
                    5
                ) +
                " V pico";

            if (
                parameters.type ===
                "overmodulation"
            ) {
                effectiveParameterLabel.textContent =
                    "Índice AM efectivo";

                effectiveParameterMetric.textContent =
                    formatNumber(
                        currentAnalysis.effectiveModulationIndex,
                        4
                    );
            } else if (
                parameters.type ===
                "saturation"
            ) {
                effectiveParameterLabel.textContent =
                    "Máximo recibido";

                effectiveParameterMetric.textContent =
                    formatNumber(
                        currentAnalysis.maximumReceived,
                        5
                    ) +
                    " V";
            } else {
                effectiveParameterLabel.textContent =
                    "Índice AM de referencia";

                effectiveParameterMetric.textContent =
                    "0,50";
            }

            signalPowerFormula.textContent =
                "Ps = RMS(sAM limpia)² = " +
                formatNumber(
                    currentAnalysis.signalPower,
                    7
                ) +
                " V² rel.";

            disturbanceFormulaLabel.textContent =
                isNoiseMode
                    ? "Potencia relativa de ruido"
                    : "Potencia equivalente del error";

            disturbancePowerFormula.textContent =
                isNoiseMode
                    ? "Pn = RMS(ruido)² = " +
                        formatNumber(
                            currentAnalysis.disturbancePower,
                            7
                        ) +
                        " V² rel."
                    : "Ppert = RMS(recibida − limpia)² = " +
                        formatNumber(
                            currentAnalysis.disturbancePower,
                            7
                        ) +
                        " V² rel.";

            snrLinearFormula.textContent =
                "SNR = Ps / Ppert = " +
                formatNumber(
                    currentAnalysis.snrLinear,
                    6
                );

            snrDbFormula.textContent =
                "SNRdB = 10 log10(SNR) = " +
                formatSnrDb(
                    currentAnalysis.snrDb
                );

            diagnosticSymptom.textContent =
                diagnostic.symptom;

            diagnosticCause.textContent =
                diagnostic.cause;

            diagnosticCheck.textContent =
                diagnostic.check;

            diagnosticDifference.textContent =
                diagnostic.difference;

            updateDiagnosticTable();

            const notes = [];

            notes.push(
                "Se usan fc = 20 Hz, fm = 2 Hz y m = 0,5 para facilitar la visualización."
            );

            if (
                parameters.mode ===
                "target"
            ) {
                notes.push(
                    "La escala interna de la perturbación se ajusta numéricamente para aproximar la SNR objetivo."
                );
            }

            if (!isNoiseMode) {
                notes.push(
                    "En saturación, mala conexión, interferencia y sobremodulación, la potencia mostrada es una potencia equivalente del error, no ruido térmico."
                );
            }

            if (
                parameters.type ===
                    "overmodulation" &&
                currentAnalysis.effectiveModulationIndex >
                    1
            ) {
                notes.push(
                    "La envolvente algebraica se cruza porque el índice efectivo supera uno."
                );
            }

            notes.push(
                "Las potencias son relativas: equivalen a valores proporcionales a V² sobre una misma impedancia."
            );

            technicalNote.innerHTML =
                "<strong>Advertencias técnicas:</strong> " +
                notes.join(" ");
        }

        function applyPreset(key) {
            const preset =
                presets[key];

            if (!preset) {
                return;
            }

            disturbanceType.value =
                preset.type;

            controlMode.value =
                preset.mode;

            noiseLevel.value =
                String(
                    preset.noise
                );

            interferenceIntensity.value =
                String(
                    preset.intensity
                );

            attenuation.value =
                String(
                    preset.attenuation
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
            signalAmplitude.value = "1";
            disturbanceType.value = "random";
            controlMode.value = "manual";
            noiseLevel.value = "0.1";
            targetSnr.value = "20";
            attenuation.value = "0";
            interferenceIntensity.value = "0.35";
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
                    ? 1330
                    : 810;

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

        function drawCanvasHeader() {
            ctx.save();

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "Perturbaciones y recuperación de envolvente",
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.83)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                "Las cuatro gráficas utilizan el mismo intervalo temporal para facilitar la comparación.",
                24,
                50,
                Math.max(
                    190,
                    viewWidth - 420
                ),
                14,
                2
            );

            ctx.fillStyle =
                "#38bdf8";

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "fc = 20 Hz · fm = 2 Hz · m = 0,5",
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

            roundedRectanglePath(
                panel.x,
                panel.y,
                panel.width,
                panel.height,
                13
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
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                title,
                panel.x + 15,
                panel.y + 24
            );

            ctx.restore();
        }

        function drawGrid(
            plot,
            verticalMaximum,
            duration,
            positiveOnly = false
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            ctx.lineWidth = 1;

            for (
                let index = 0;
                index <= 8;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.width *
                    index /
                    8;

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

            const zeroY =
                positiveOnly
                    ? plot.y +
                        plot.height
                    : plot.y +
                        plot.height /
                        2;

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.36)";

            ctx.lineWidth = 1.3;

            ctx.beginPath();
            ctx.moveTo(plot.x, zeroY);

            ctx.lineTo(
                plot.x +
                plot.width,
                zeroY
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.74)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                formatNumber(
                    verticalMaximum,
                    3
                ) +
                " V",
                plot.x - 7,
                plot.y + 8
            );

            if (!positiveOnly) {
                ctx.fillText(
                    "0 V",
                    plot.x - 7,
                    zeroY + 3
                );

                ctx.fillText(
                    "−" +
                    formatNumber(
                        verticalMaximum,
                        3
                    ) +
                    " V",
                    plot.x - 7,
                    plot.y +
                    plot.height
                );
            } else {
                ctx.fillText(
                    "0 V",
                    plot.x - 7,
                    plot.y +
                    plot.height
                );
            }

            ctx.textAlign =
                "center";

            ctx.fillText(
                "0",
                plot.x,
                plot.y +
                plot.height +
                17
            );

            ctx.fillText(
                formatNumber(
                    duration,
                    2
                ) +
                " s",
                plot.x +
                plot.width,
                plot.y +
                plot.height +
                17
            );

            ctx.restore();
        }

        function valueToY(
            value,
            plot,
            verticalMaximum,
            positiveOnly
        ) {
            if (positiveOnly) {
                return (
                    plot.y +
                    plot.height -
                    value /
                    Math.max(
                        verticalMaximum,
                        1e-12
                    ) *
                    plot.height *
                    0.88
                );
            }

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
                0.43
            );
        }

        function drawArray(
            plot,
            values,
            verticalMaximum,
            color,
            lineWidth,
            dashed,
            positiveOnly
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
                        verticalMaximum,
                        positiveOnly
                    );

                if (
                    index === 0
                ) {
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

        function createFrameData(
            parameters,
            analysis
        ) {
            const sampleCount =
                viewWidth < 720
                    ? 760
                    : 1100;

            const clean = [];
            const disturbance = [];
            const received = [];
            const idealEnvelope = [];

            const timeOffset =
                elapsedTime *
                0.22;

            for (
                let index = 0;
                index < sampleCount;
                index += 1
            ) {
                const time =
                    timeOffset +
                    displayDuration *
                    index /
                    (
                        sampleCount -
                        1
                    );

                const sample =
                    getDisturbanceSample(
                        time,
                        parameters,
                        analysis.scale
                    );

                clean.push(
                    sample.clean
                );

                disturbance.push(
                    sample.disturbance
                );

                received.push(
                    sample.received
                );

                idealEnvelope.push(
                    cleanEnvelope(
                        time,
                        parameters
                    )
                );
            }

            const samplesPerCarrierPeriod =
                Math.max(
                    3,
                    Math.round(
                        sampleCount /
                        (
                            displayDuration *
                            carrierFrequency
                        )
                    )
                );

            const recoveredEnvelope = [];

            let smoothed =
                Math.abs(
                    received[0]
                );

            const timeStep =
                displayDuration /
                (
                    sampleCount -
                    1
                );

            const timeConstant =
                0.018;

            const alpha =
                1 -
                Math.exp(
                    -timeStep /
                    timeConstant
                );

            for (
                let index = 0;
                index < sampleCount;
                index += 1
            ) {
                let localMaximum = 0;

                const start =
                    Math.max(
                        0,
                        index -
                        samplesPerCarrierPeriod
                    );

                for (
                    let sampleIndex = start;
                    sampleIndex <= index;
                    sampleIndex += 1
                ) {
                    localMaximum =
                        Math.max(
                            localMaximum,
                            Math.abs(
                                received[
                                    sampleIndex
                                ]
                            )
                        );
                }

                smoothed +=
                    alpha *
                    (
                        localMaximum -
                        smoothed
                    );

                recoveredEnvelope.push(
                    smoothed
                );
            }

            return {
                clean,
                disturbance,
                received,
                idealEnvelope,
                recoveredEnvelope
            };
        }

        function getMaximumAbsolute(values) {
            let maximum = 0;

            for (
                let index = 0;
                index < values.length;
                index += 1
            ) {
                maximum =
                    Math.max(
                        maximum,
                        Math.abs(
                            values[index]
                        )
                    );
            }

            return Math.max(
                maximum,
                0.05
            );
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

            ctx.lineWidth = 2;

            ctx.setLineDash(
                dashed
                    ? [
                        7,
                        5
                    ]
                    : []
            );

            ctx.beginPath();

            ctx.moveTo(
                x,
                y - 3
            );

            ctx.lineTo(
                x + 18,
                y - 3
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.84)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                text,
                x + 25,
                y
            );

            ctx.restore();
        }

        function drawCursor(plots) {
            const progress =
                fractional(
                    elapsedTime *
                    0.17
                );

            ctx.save();

            plots.forEach(
                function (plot) {
                    const x =
                        plot.x +
                        plot.width *
                        progress;

                    ctx.strokeStyle =
                        "rgba(251, 191, 36, 0.75)";

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
                }
            );

            ctx.restore();
        }

        function drawFourPanels(
            frameData,
            parameters
        ) {
            const mobile =
                viewWidth < 720;

            let panels;

            if (mobile) {
                const margin = 14;
                const gap = 16;
                const panelHeight = 285;

                panels = [
                    {
                        x: margin,
                        y: 82,
                        width:
                            viewWidth -
                            margin * 2,
                        height:
                            panelHeight
                    },
                    {
                        x: margin,
                        y:
                            82 +
                            panelHeight +
                            gap,
                        width:
                            viewWidth -
                            margin * 2,
                        height:
                            panelHeight
                    },
                    {
                        x: margin,
                        y:
                            82 +
                            2 *
                            (
                                panelHeight +
                                gap
                            ),
                        width:
                            viewWidth -
                            margin * 2,
                        height:
                            panelHeight
                    },
                    {
                        x: margin,
                        y:
                            82 +
                            3 *
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
                ];
            } else {
                const margin = 20;
                const gap = 16;

                const panelWidth =
                    (
                        viewWidth -
                        margin * 2 -
                        gap
                    ) /
                    2;

                const panelHeight =
                    (
                        viewHeight -
                        118 -
                        gap
                    ) /
                    2;

                panels = [
                    {
                        x: margin,
                        y: 78,
                        width:
                            panelWidth,
                        height:
                            panelHeight
                    },
                    {
                        x:
                            margin +
                            panelWidth +
                            gap,
                        y: 78,
                        width:
                            panelWidth,
                        height:
                            panelHeight
                    },
                    {
                        x: margin,
                        y:
                            78 +
                            panelHeight +
                            gap,
                        width:
                            panelWidth,
                        height:
                            panelHeight
                    },
                    {
                        x:
                            margin +
                            panelWidth +
                            gap,
                        y:
                            78 +
                            panelHeight +
                            gap,
                        width:
                            panelWidth,
                        height:
                            panelHeight
                    }
                ];
            }

            const titles = [
                {
                    text:
                        "1. SEÑAL AM LIMPIA",
                    color:
                        "#38bdf8"
                },
                {
                    text:
                        "2. PERTURBACIÓN O ERROR EQUIVALENTE",
                    color:
                        "#fb7185"
                },
                {
                    text:
                        "3. SEÑAL AM RECIBIDA",
                    color:
                        "#c084fc"
                },
                {
                    text:
                        "4. ENVOLVENTE RECUPERADA",
                    color:
                        "#34d399"
                }
            ];

            panels.forEach(
                function (panel, index) {
                    drawPanel(
                        panel,
                        titles[index].text,
                        titles[index].color
                    );
                }
            );

            const plots =
                panels.map(
                    function (panel) {
                        return {
                            x:
                                panel.x +
                                54,
                            y:
                                panel.y +
                                63,
                            width:
                                panel.width -
                                74,
                            height:
                                panel.height -
                                103
                        };
                    }
                );

            const cleanMaximum =
                Math.max(
                    parameters.receivedCarrierAmplitude *
                    1.65,
                    getMaximumAbsolute(
                        frameData.clean
                    ) *
                    1.08
                );

            const disturbanceMaximum =
                getMaximumAbsolute(
                    frameData.disturbance
                ) *
                1.15;

            const receivedMaximum =
                getMaximumAbsolute(
                    frameData.received
                ) *
                1.08;

            const envelopeMaximum =
                Math.max(
                    getMaximumAbsolute(
                        frameData.recoveredEnvelope
                    ),
                    getMaximumAbsolute(
                        frameData.idealEnvelope
                    )
                ) *
                1.08;

            drawGrid(
                plots[0],
                cleanMaximum,
                displayDuration,
                false
            );

            drawGrid(
                plots[1],
                disturbanceMaximum,
                displayDuration,
                false
            );

            drawGrid(
                plots[2],
                receivedMaximum,
                displayDuration,
                false
            );

            drawGrid(
                plots[3],
                envelopeMaximum,
                displayDuration,
                true
            );

            drawArray(
                plots[0],
                frameData.clean,
                cleanMaximum,
                "#38bdf8",
                1.8,
                false,
                false
            );

            drawArray(
                plots[0],
                frameData.idealEnvelope,
                cleanMaximum,
                "#34d399",
                1.7,
                true,
                false
            );

            drawArray(
                plots[0],
                frameData.idealEnvelope.map(
                    function (value) {
                        return -value;
                    }
                ),
                cleanMaximum,
                "#34d399",
                1.7,
                true,
                false
            );

            drawArray(
                plots[1],
                frameData.disturbance,
                disturbanceMaximum,
                "#fb7185",
                1.7,
                false,
                false
            );

            drawArray(
                plots[2],
                frameData.received,
                receivedMaximum,
                "#c084fc",
                1.7,
                false,
                false
            );

            drawArray(
                plots[3],
                frameData.idealEnvelope,
                envelopeMaximum,
                "#38bdf8",
                1.7,
                true,
                true
            );

            drawArray(
                plots[3],
                frameData.recoveredEnvelope,
                envelopeMaximum,
                "#34d399",
                2.1,
                false,
                true
            );

            drawLegendItem(
                panels[0].x + 15,
                panels[0].y + 48,
                "#38bdf8",
                "AM limpia"
            );

            drawLegendItem(
                panels[0].x + 125,
                panels[0].y + 48,
                "#34d399",
                "Envolvente ideal",
                true
            );

            drawLegendItem(
                panels[1].x + 15,
                panels[1].y + 48,
                "#fb7185",
                "Recibida − referencia"
            );

            drawLegendItem(
                panels[2].x + 15,
                panels[2].y + 48,
                "#c084fc",
                "Señal observada"
            );

            drawLegendItem(
                panels[3].x + 15,
                panels[3].y + 48,
                "#38bdf8",
                "Ideal",
                true
            );

            drawLegendItem(
                panels[3].x + 87,
                panels[3].y + 48,
                "#34d399",
                "Recuperada"
            );

            drawCursor(
                plots
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
                "Revise la amplitud y los niveles de perturbación.",
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
                "Modelo temporal didáctico · escalas adaptadas · potencia relativa sobre igual impedancia.",
                viewWidth - 18,
                viewHeight - 14
            );

            ctx.restore();
        }

        function drawScene() {
            drawBackground();

            if (
                !currentAnalysis ||
                !currentAnalysis.parameters ||
                !currentAnalysis.parameters.valid
            ) {
                drawInvalidMessage();
                return;
            }

            drawCanvasHeader();

            const frameData =
                createFrameData(
                    currentAnalysis.parameters,
                    currentAnalysis
                );

            drawFourPanels(
                frameData,
                currentAnalysis.parameters
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
            signalAmplitude,
            disturbanceType,
            controlMode,
            noiseLevel,
            targetSnr,
            attenuation,
            interferenceIntensity,
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
    
