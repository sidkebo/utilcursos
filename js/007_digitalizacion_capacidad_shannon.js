        "use strict";

        /*
         * SIT-400 — Clase 7
         * Digitalización funcional y capacidad de Shannon-Hartley.
         *
         * No incluye ASK, FSK, PSK, QAM, televisión digital,
         * diseño interno de ADC, códigos de línea, protocolos
         * ni corrección de errores.
         */

        const canvas =
            document.getElementById("simulationCanvas");

        const canvasContainer =
            document.getElementById("canvasContainer");

        const ctx =
            canvas.getContext("2d");

        const moduleButtons =
            Array.from(
                document.querySelectorAll(".module-button")
            );

        const canvasTitle =
            document.getElementById("canvasTitle");

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

        const metricLabels =
            Array.from(
                { length: 6 },
                function (_, index) {
                    return document.getElementById(
                        "metricLabel" + index
                    );
                }
            );

        const metricValues =
            Array.from(
                { length: 6 },
                function (_, index) {
                    return document.getElementById(
                        "metricValue" + index
                    );
                }
            );

        const digitalizationControls =
            document.getElementById("digitalizationControls");

        const shannonControls =
            document.getElementById("shannonControls");

        const explanation =
            document.getElementById("explanation");

        const technicalNote =
            document.getElementById("technicalNote");

        const signalAmplitude =
            document.getElementById("signalAmplitude");

        const signalFrequency =
            document.getElementById("signalFrequency");

        const signalFrequencyUnit =
            document.getElementById("signalFrequencyUnit");

        const samplingFrequency =
            document.getElementById("samplingFrequency");

        const samplingFrequencyUnit =
            document.getElementById("samplingFrequencyUnit");

        const initialPhase =
            document.getElementById("initialPhase");

        const initialPhaseDisplay =
            document.getElementById("initialPhaseDisplay");

        const bitsPerSample =
            document.getElementById("bitsPerSample");

        const quantizationLevels =
            document.getElementById("quantizationLevels");

        const minimumVoltage =
            document.getElementById("minimumVoltage");

        const maximumVoltage =
            document.getElementById("maximumVoltage");

        const digitalizationSpeed =
            document.getElementById("digitalizationSpeed");

        const digitalizationSpeedDisplay =
            document.getElementById("digitalizationSpeedDisplay");

        const sampleTableBody =
            document.getElementById("sampleTableBody");

        const digitalFormula1 =
            document.getElementById("digitalFormula1");

        const digitalFormula2 =
            document.getElementById("digitalFormula2");

        const digitalFormula3 =
            document.getElementById("digitalFormula3");

        const channelBandwidth =
            document.getElementById("channelBandwidth");

        const channelBandwidthUnit =
            document.getElementById("channelBandwidthUnit");

        const signalPower =
            document.getElementById("signalPower");

        const signalPowerUnit =
            document.getElementById("signalPowerUnit");

        const noisePower =
            document.getElementById("noisePower");

        const noisePowerUnit =
            document.getElementById("noisePowerUnit");

        const shannonSpeed =
            document.getElementById("shannonSpeed");

        const shannonSpeedDisplay =
            document.getElementById("shannonSpeedDisplay");

        const shannonFormula1 =
            document.getElementById("shannonFormula1");

        const shannonFormula2 =
            document.getElementById("shannonFormula2");

        const shannonFormula3 =
            document.getElementById("shannonFormula3");

        const comparisonTableBody =
            document.getElementById("comparisonTableBody");

        const pauseButton =
            document.getElementById("pauseButton");

        const continueButton =
            document.getElementById("continueButton");

        const restartButton =
            document.getElementById("restartButton");

        const digitalPresetButtons =
            Array.from(
                document.querySelectorAll("[data-digital-preset]")
            );

        const shannonPresetButtons =
            Array.from(
                document.querySelectorAll("[data-shannon-preset]")
            );

        const digitalPresets = {
            classExample: {
                amplitude: 3.7,
                frequency: 1,
                frequencyUnit: "Hz",
                sampling: 8,
                samplingUnit: "Hz",
                bits: 3,
                minimum: 0,
                maximum: 8,
                phase: 0
            },

            basicRate: {
                amplitude: 1,
                frequency: 1000,
                frequencyUnit: "Hz",
                sampling: 8000,
                samplingUnit: "Hz",
                bits: 8,
                minimum: -1.2,
                maximum: 1.2,
                phase: 0
            },

            fewBits: {
                amplitude: 1,
                frequency: 500,
                frequencyUnit: "Hz",
                sampling: 5000,
                samplingUnit: "Hz",
                bits: 2,
                minimum: -1.2,
                maximum: 1.2,
                phase: 30
            },

            moreBits: {
                amplitude: 1,
                frequency: 500,
                frequencyUnit: "Hz",
                sampling: 5000,
                samplingUnit: "Hz",
                bits: 6,
                minimum: -1.2,
                maximum: 1.2,
                phase: 30
            },

            saturation: {
                amplitude: 2,
                frequency: 1000,
                frequencyUnit: "Hz",
                sampling: 8000,
                samplingUnit: "Hz",
                bits: 3,
                minimum: -1,
                maximum: 1,
                phase: 15
            }
        };

        const shannonPresets = {
            linear31: {
                bandwidth: 3000,
                bandwidthUnit: "Hz",
                signal: 31,
                signalUnit: "mW",
                noise: 1,
                noiseUnit: "mW"
            },

            snr20: {
                bandwidth: 10,
                bandwidthUnit: "kHz",
                signal: 100,
                signalUnit: "mW",
                noise: 1,
                noiseUnit: "mW"
            },

            lowSnr: {
                bandwidth: 10,
                bandwidthUnit: "kHz",
                signal: 2,
                signalUnit: "mW",
                noise: 1,
                noiseUnit: "mW"
            },

            wideBand: {
                bandwidth: 100,
                bandwidthUnit: "kHz",
                signal: 100,
                signalUnit: "mW",
                noise: 1,
                noiseUnit: "mW"
            },

            insufficient: {
                bandwidth: 3000,
                bandwidthUnit: "Hz",
                signal: 31,
                signalUnit: "mW",
                noise: 1,
                noiseUnit: "mW"
            }
        };

        let currentModule = "digitalization";
        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 760;
        let pixelRatio = 1;
        let synchronizingLevels = false;

        function setActiveColor(color, rgb) {
            document.documentElement.style.setProperty(
                "--active",
                color
            );

            document.documentElement.style.setProperty(
                "--active-rgb",
                rgb
            );
        }

        function setMetric(index, label, value) {
            metricLabels[index].textContent = label;
            metricValues[index].textContent = value;
        }

        function formatNumber(value, decimals = 4) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            const absolute = Math.abs(value);

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
                    maximumFractionDigits: decimals
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

        function formatRate(value) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            if (Math.abs(value) >= 1e6) {
                return (
                    formatNumber(value / 1e6, 5) +
                    " Mbit/s"
                );
            }

            if (Math.abs(value) >= 1e3) {
                return (
                    formatNumber(value / 1e3, 5) +
                    " kbit/s"
                );
            }

            return (
                formatNumber(value, 5) +
                " bit/s"
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

        function formatPower(watts) {
            if (!Number.isFinite(watts)) {
                return "—";
            }

            if (watts >= 1) {
                return (
                    formatNumber(watts, 6) +
                    " W"
                );
            }

            if (watts >= 1e-3) {
                return (
                    formatNumber(watts * 1e3, 6) +
                    " mW"
                );
            }

            return (
                formatNumber(watts * 1e6, 6) +
                " µW"
            );
        }

        function clamp(value, minimum, maximum) {
            return Math.min(
                maximum,
                Math.max(minimum, value)
            );
        }

        function logarithmBase2(value) {
            return Math.log(value) / Math.log(2);
        }

        function frequencyFactor(unit) {
            if (unit === "kHz") {
                return 1e3;
            }

            if (unit === "MHz") {
                return 1e6;
            }

            return 1;
        }

        function powerFactor(unit) {
            if (unit === "mW") {
                return 1e-3;
            }

            if (unit === "uW") {
                return 1e-6;
            }

            return 1;
        }

        function toBinary(index, numberOfBits) {
            return Math.max(0, index)
                .toString(2)
                .padStart(numberOfBits, "0")
                .slice(-numberOfBits);
        }

        function getDigitalizationData() {
            const amplitude =
                Number(signalAmplitude.value);

            const frequency =
                Number(signalFrequency.value) *
                frequencyFactor(signalFrequencyUnit.value);

            const sampling =
                Number(samplingFrequency.value) *
                frequencyFactor(samplingFrequencyUnit.value);

            const numberOfBits =
                Number(bitsPerSample.value);

            const numberOfLevels =
                Math.pow(2, numberOfBits);

            const minimum =
                Number(minimumVoltage.value);

            const maximum =
                Number(maximumVoltage.value);

            const phaseDegrees =
                Number(initialPhase.value);

            const phaseRadians =
                phaseDegrees *
                Math.PI /
                180;

            const valid =
                [
                    amplitude,
                    frequency,
                    sampling,
                    numberOfBits,
                    minimum,
                    maximum
                ].every(Number.isFinite) &&
                amplitude > 0 &&
                frequency > 0 &&
                sampling > 0 &&
                numberOfBits >= 1 &&
                maximum > minimum;

            if (!valid) {
                return {
                    valid: false,
                    amplitude,
                    frequency,
                    sampling,
                    numberOfBits,
                    numberOfLevels,
                    minimum,
                    maximum,
                    phaseDegrees,
                    phaseRadians
                };
            }

            const quantizationStep =
                (
                    maximum -
                    minimum
                ) /
                numberOfLevels;

            const maximumError =
                quantizationStep /
                2;

            const bitRate =
                sampling *
                numberOfBits;

            const nyquistSatisfied =
                sampling >=
                2 *
                frequency;

            const samplesPerCycle =
                sampling /
                frequency;

            const visibleCount =
                Math.min(
                    18,
                    Math.max(
                        8,
                        Math.round(
                            samplesPerCycle *
                            2.2
                        )
                    )
                );

            const samples = [];
            let saturatedCount = 0;

            for (
                let index = 0;
                index < visibleCount;
                index += 1
            ) {
                const sampleTime =
                    index /
                    sampling;

                const realValue =
                    amplitude *
                    Math.sin(
                        2 *
                        Math.PI *
                        frequency *
                        sampleTime +
                        phaseRadians
                    );

                const belowRange =
                    realValue <
                    minimum;

                const aboveRange =
                    realValue >=
                    maximum;

                const saturated =
                    belowRange ||
                    aboveRange;

                let quantizationIndex =
                    Math.floor(
                        (
                            realValue -
                            minimum
                        ) /
                        quantizationStep
                    );

                quantizationIndex =
                    clamp(
                        quantizationIndex,
                        0,
                        numberOfLevels - 1
                    );

                const quantizedValue =
                    minimum +
                    (
                        quantizationIndex +
                        0.5
                    ) *
                    quantizationStep;

                const error =
                    realValue -
                    quantizedValue;

                if (saturated) {
                    saturatedCount += 1;
                }

                samples.push({
                    index,
                    time: sampleTime,
                    realValue,
                    quantizationIndex,
                    quantizedValue,
                    error,
                    binaryCode: toBinary(
                        quantizationIndex,
                        numberOfBits
                    ),
                    saturated
                });
            }

            return {
                valid: true,
                amplitude,
                frequency,
                sampling,
                numberOfBits,
                numberOfLevels,
                minimum,
                maximum,
                phaseDegrees,
                phaseRadians,
                quantizationStep,
                maximumError,
                bitRate,
                nyquistSatisfied,
                samplesPerCycle,
                visibleCount,
                samples,
                saturatedCount
            };
        }

        function getShannonData() {
            const bandwidth =
                Number(channelBandwidth.value) *
                frequencyFactor(channelBandwidthUnit.value);

            const signalWatts =
                Number(signalPower.value) *
                powerFactor(signalPowerUnit.value);

            const noiseWatts =
                Number(noisePower.value) *
                powerFactor(noisePowerUnit.value);

            const valid =
                [
                    bandwidth,
                    signalWatts,
                    noiseWatts
                ].every(Number.isFinite) &&
                bandwidth > 0 &&
                signalWatts > 0 &&
                noiseWatts > 0;

            if (!valid) {
                return {
                    valid: false,
                    bandwidth,
                    signalWatts,
                    noiseWatts
                };
            }

            const signalToNoiseRatio =
                signalWatts /
                noiseWatts;

            const signalToNoiseDb =
                10 *
                Math.log10(
                    signalToNoiseRatio
                );

            const capacity =
                bandwidth *
                logarithmBase2(
                    1 +
                    signalToNoiseRatio
                );

            const doubleBandwidthCapacity =
                (
                    2 *
                    bandwidth
                ) *
                logarithmBase2(
                    1 +
                    signalToNoiseRatio
                );

            const improvedRatio =
                signalToNoiseRatio *
                2;

            const improvedSnrCapacity =
                bandwidth *
                logarithmBase2(
                    1 +
                    improvedRatio
                );

            const digitalizationData =
                getDigitalizationData();

            const requiredRate =
                digitalizationData.valid
                    ? digitalizationData.bitRate
                    : NaN;

            const sufficient =
                Number.isFinite(requiredRate)
                    ? requiredRate <= capacity
                    : null;

            return {
                valid: true,
                bandwidth,
                signalWatts,
                noiseWatts,
                signalToNoiseRatio,
                signalToNoiseDb,
                capacity,
                doubleBandwidthCapacity,
                improvedRatio,
                improvedSnrCapacity,
                requiredRate,
                sufficient
            };
        }

        function synchronizeFromBits() {
            if (synchronizingLevels) {
                return;
            }

            synchronizingLevels = true;

            quantizationLevels.value =
                String(
                    Math.pow(
                        2,
                        Number(bitsPerSample.value)
                    )
                );

            synchronizingLevels = false;
        }

        function synchronizeFromLevels() {
            if (synchronizingLevels) {
                return;
            }

            synchronizingLevels = true;

            bitsPerSample.value =
                String(
                    Math.log2(
                        Number(
                            quantizationLevels.value
                        )
                    )
                );

            synchronizingLevels = false;
        }

        function updateDigitalizationInterface() {
            const data =
                getDigitalizationData();

            initialPhaseDisplay.textContent =
                formatNumber(
                    Number(initialPhase.value),
                    0
                ) +
                "°";

            digitalizationSpeedDisplay.textContent =
                Number(digitalizationSpeed.value)
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            setActiveColor(
                "#38bdf8",
                "56, 189, 248"
            );

            if (!data.valid) {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "Datos de digitalización no válidos";

                stateDescription.textContent =
                    "Revise amplitud, frecuencias, bits y límites del rango.";

                stateValue.textContent =
                    "Sin resultado";

                for (
                    let index = 0;
                    index < 6;
                    index += 1
                ) {
                    setMetric(
                        index,
                        "Valor",
                        "—"
                    );
                }

                sampleTableBody.innerHTML =
                    "";

                digitalFormula1.textContent =
                    "No es posible calcular niveles y paso.";

                digitalFormula2.textContent =
                    "Revise el rango y los valores de entrada.";

                digitalFormula3.textContent =
                    "Rb no disponible.";

                return;
            }

            if (data.saturatedCount > 0) {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "Saturación o desbordamiento de rango";

                stateDescription.textContent =
                    data.saturatedCount +
                    " de las muestras visibles quedaron fuera del rango y fueron limitadas a un código extremo.";
            } else if (!data.nyquistSatisfied) {
                stateBanner.className =
                    "state-banner warning";

                stateTitle.textContent =
                    "Advertencia heredada del muestreo";

                stateDescription.textContent =
                    "La cuantificación y la codificación no corrigen un muestreo insuficiente ni eliminan el aliasing previo.";
            } else {
                stateBanner.className =
                    "state-banner";

                stateTitle.textContent =
                    "Digitalización dentro del rango";

                stateDescription.textContent =
                    "Las muestras se asignan a intervalos uniformes y cada índice se representa mediante binario natural.";
            }

            stateValue.textContent =
                "L = " +
                data.numberOfLevels +
                " niveles";

            setMetric(
                0,
                "Bits por muestra",
                data.numberOfBits +
                (
                    data.numberOfBits === 1
                        ? " bit"
                        : " bits"
                )
            );

            setMetric(
                1,
                "Niveles o códigos",
                formatNumber(
                    data.numberOfLevels,
                    0
                )
            );

            setMetric(
                2,
                "Paso de cuantificación",
                formatNumber(
                    data.quantizationStep,
                    6
                ) +
                " V"
            );

            setMetric(
                3,
                "Error máximo aproximado",
                "±" +
                formatNumber(
                    data.maximumError,
                    6
                ) +
                " V"
            );

            setMetric(
                4,
                "Frecuencia de muestreo",
                formatFrequency(
                    data.sampling
                )
            );

            setMetric(
                5,
                "Velocidad binaria",
                formatRate(
                    data.bitRate
                )
            );

            digitalFormula1.textContent =
                "L = 2^" +
                data.numberOfBits +
                " = " +
                data.numberOfLevels +
                " · Δ = (" +
                formatNumber(data.maximum, 4) +
                " − " +
                formatNumber(data.minimum, 4) +
                ") / " +
                data.numberOfLevels +
                " = " +
                formatNumber(
                    data.quantizationStep,
                    6
                ) +
                " V";

            const firstSample =
                data.samples[0];

            digitalFormula2.textContent =
                firstSample
                    ? "e₀ = " +
                        formatNumber(
                            firstSample.realValue,
                            5
                        ) +
                        " − " +
                        formatNumber(
                            firstSample.quantizedValue,
                            5
                        ) +
                        " = " +
                        formatNumber(
                            firstSample.error,
                            5
                        ) +
                        " V · código " +
                        firstSample.binaryCode
                    : "Sin muestra disponible";

            digitalFormula3.textContent =
                "Rb = fs × n = " +
                formatFrequency(
                    data.sampling
                ) +
                " × " +
                data.numberOfBits +
                " = " +
                formatRate(
                    data.bitRate
                );

            sampleTableBody.innerHTML =
                data.samples
                    .slice(0, 12)
                    .map(
                        function (sample) {
                            const sampleStatus =
                                sample.saturated
                                    ? '<span class="status-tag danger">Saturada</span>'
                                    : '<span class="status-tag success">Dentro de rango</span>';

                            return (
                                "<tr>" +
                                    "<td>" +
                                        sample.index +
                                    "</td>" +
                                    "<td>" +
                                        formatTime(
                                            sample.time
                                        ) +
                                    "</td>" +
                                    "<td>" +
                                        formatNumber(
                                            sample.realValue,
                                            6
                                        ) +
                                        " V" +
                                    "</td>" +
                                    "<td>" +
                                        sample.quantizationIndex +
                                    "</td>" +
                                    "<td>" +
                                        formatNumber(
                                            sample.quantizedValue,
                                            6
                                        ) +
                                        " V" +
                                    "</td>" +
                                    "<td>" +
                                        formatNumber(
                                            sample.error,
                                            6
                                        ) +
                                        " V" +
                                    "</td>" +
                                    '<td><span class="code-chip">' +
                                        sample.binaryCode +
                                    "</span></td>" +
                                    "<td>" +
                                        sampleStatus +
                                    "</td>" +
                                "</tr>"
                            );
                        }
                    )
                    .join("");
        }

        function updateShannonInterface() {
            const data =
                getShannonData();

            shannonSpeedDisplay.textContent =
                Number(shannonSpeed.value)
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            setActiveColor(
                "#c084fc",
                "192, 132, 252"
            );

            if (!data.valid) {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "Datos del canal no válidos";

                stateDescription.textContent =
                    "El ancho de banda, la potencia de señal y la potencia de ruido deben ser positivos.";

                stateValue.textContent =
                    "Sin capacidad";

                for (
                    let index = 0;
                    index < 6;
                    index += 1
                ) {
                    setMetric(
                        index,
                        "Valor",
                        "—"
                    );
                }

                comparisonTableBody.innerHTML =
                    "";

                shannonFormula1.textContent =
                    "S/N no disponible.";

                shannonFormula2.textContent =
                    "SNR en dB no disponible.";

                shannonFormula3.textContent =
                    "Capacidad no disponible.";

                return;
            }

            if (data.sufficient === false) {
                stateBanner.className =
                    "state-banner danger";

                stateTitle.textContent =
                    "El canal no es suficiente en teoría";

                stateDescription.textContent =
                    "La velocidad binaria generada por el módulo de digitalización supera la capacidad de Shannon bajo estas condiciones.";
            } else if (data.sufficient === true) {
                stateBanner.className =
                    "state-banner";

                stateTitle.textContent =
                    "La transmisión no queda descartada por Shannon";

                stateDescription.textContent =
                    "La velocidad requerida no supera el límite teórico, aunque un sistema real todavía necesita margen y otros elementos.";
            } else {
                stateBanner.className =
                    "state-banner warning";

                stateTitle.textContent =
                    "Capacidad calculada sin comparación digital";

                stateDescription.textContent =
                    "Revise el módulo de digitalización para obtener una velocidad binaria válida.";
            }

            stateValue.textContent =
                "C = " +
                formatRate(
                    data.capacity
                );

            setMetric(
                0,
                "Ancho de banda",
                formatFrequency(
                    data.bandwidth
                )
            );

            setMetric(
                1,
                "S/N lineal",
                formatNumber(
                    data.signalToNoiseRatio,
                    7
                )
            );

            setMetric(
                2,
                "SNR",
                formatNumber(
                    data.signalToNoiseDb,
                    5
                ) +
                " dB"
            );

            setMetric(
                3,
                "Capacidad teórica",
                formatRate(
                    data.capacity
                )
            );

            setMetric(
                4,
                "Velocidad requerida",
                formatRate(
                    data.requiredRate
                )
            );

            setMetric(
                5,
                "Margen teórico",
                Number.isFinite(
                    data.requiredRate
                )
                    ? formatRate(
                        data.capacity -
                        data.requiredRate
                    )
                    : "—"
            );

            shannonFormula1.textContent =
                "S/N = " +
                formatNumber(
                    data.signalWatts,
                    8
                ) +
                " W ÷ " +
                formatNumber(
                    data.noiseWatts,
                    8
                ) +
                " W = " +
                formatNumber(
                    data.signalToNoiseRatio,
                    8
                );

            shannonFormula2.textContent =
                "SNRdB = 10 × log10(" +
                formatNumber(
                    data.signalToNoiseRatio,
                    8
                ) +
                ") = " +
                formatNumber(
                    data.signalToNoiseDb,
                    6
                ) +
                " dB";

            shannonFormula3.textContent =
                "C = " +
                formatFrequency(
                    data.bandwidth
                ) +
                " × log2(1 + " +
                formatNumber(
                    data.signalToNoiseRatio,
                    7
                ) +
                ") = " +
                formatRate(
                    data.capacity
                );

            const comparisonText =
                data.sufficient === null
                    ? "No disponible"
                    : data.sufficient
                        ? "Rb ≤ C · no queda descartado"
                        : "Rb > C · canal insuficiente";

            const comparisonClass =
                data.sufficient === null
                    ? "warning"
                    : data.sufficient
                        ? "success"
                        : "danger";

            comparisonTableBody.innerHTML =
                "<tr>" +
                    "<td>Velocidad binaria requerida</td>" +
                    "<td>" +
                        formatRate(
                            data.requiredRate
                        ) +
                    "</td>" +
                    "<td>Rb = fs × n del módulo de digitalización</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Capacidad de Shannon</td>" +
                    "<td>" +
                        formatRate(
                            data.capacity
                        ) +
                    "</td>" +
                    "<td>Límite máximo teórico, no velocidad garantizada</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Comparación</td>" +
                    '<td><span class="status-tag ' +
                        comparisonClass +
                        '">' +
                        comparisonText +
                    "</span></td>" +
                    "<td>Solo constituye una decisión técnica inicial</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Si B se duplica</td>" +
                    "<td>" +
                        formatRate(
                            data.doubleBandwidthCapacity
                        ) +
                    "</td>" +
                    "<td>Con S/N constante, la capacidad se duplica</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Si S/N se duplica</td>" +
                    "<td>" +
                        formatRate(
                            data.improvedSnrCapacity
                        ) +
                    "</td>" +
                    "<td>La mejora es logarítmica, no proporcional</td>" +
                "</tr>";
        }

        function updateInterface() {
            if (currentModule === "digitalization") {
                updateDigitalizationInterface();
            } else {
                updateShannonInterface();
            }
        }

        function setModule(module) {
            currentModule = module;
            elapsedTime = 0;

            moduleButtons.forEach(
                function (button) {
                    const active =
                        button.dataset.module ===
                        module;

                    button.classList.toggle(
                        "active",
                        active
                    );

                    button.setAttribute(
                        "aria-selected",
                        String(active)
                    );
                }
            );

            digitalizationControls.hidden =
                module !== "digitalization";

            shannonControls.hidden =
                module !== "shannon";

            if (module === "digitalization") {
                canvasTitle.textContent =
                    "Señal analógica, muestras, niveles y códigos";

                explanation.innerHTML =
                    "<strong>Digitalización funcional:</strong> " +
                    "muestrear selecciona instantes, cuantificar aproxima amplitudes " +
                    "y codificar asigna bits al índice del intervalo.";

                technicalNote.innerHTML =
                    "<strong>Alcance:</strong> " +
                    "se utiliza un cuantificador uniforme con punto medio y " +
                    "codificación binaria natural. No se modela el diseño interno " +
                    "de un ADC, códigos de línea ni modulación digital.";
            } else {
                canvasTitle.textContent =
                    "Ancho de banda, ruido y capacidad teórica";

                explanation.innerHTML =
                    "<strong>Shannon-Hartley:</strong> " +
                    "la capacidad depende del ancho de banda y de la relación " +
                    "señal a ruido lineal. La capacidad calculada es un límite " +
                    "teórico, no una velocidad real garantizada.";

                technicalNote.innerHTML =
                    "<strong>Unidades:</strong> " +
                    "B se expresa en Hz; S y N son potencias dentro del ancho " +
                    "de banda considerado; S/N entra en forma lineal y C resulta " +
                    "en bit/s.";
            }

            resizeCanvas();
            updateInterface();
        }

        function applyDigitalPreset(key) {
            const preset =
                digitalPresets[key];

            if (!preset) {
                return;
            }

            signalAmplitude.value =
                String(preset.amplitude);

            signalFrequency.value =
                String(preset.frequency);

            signalFrequencyUnit.value =
                preset.frequencyUnit;

            samplingFrequency.value =
                String(preset.sampling);

            samplingFrequencyUnit.value =
                preset.samplingUnit;

            bitsPerSample.value =
                String(preset.bits);

            synchronizeFromBits();

            minimumVoltage.value =
                String(preset.minimum);

            maximumVoltage.value =
                String(preset.maximum);

            initialPhase.value =
                String(preset.phase);

            elapsedTime = 0;

            updateInterface();
        }

        function applyShannonPreset(key) {
            const preset =
                shannonPresets[key];

            if (!preset) {
                return;
            }

            channelBandwidth.value =
                String(preset.bandwidth);

            channelBandwidthUnit.value =
                preset.bandwidthUnit;

            signalPower.value =
                String(preset.signal);

            signalPowerUnit.value =
                preset.signalUnit;

            noisePower.value =
                String(preset.noise);

            noisePowerUnit.value =
                preset.noiseUnit;

            if (key === "insufficient") {
                samplingFrequency.value =
                    "8000";

                samplingFrequencyUnit.value =
                    "Hz";

                bitsPerSample.value =
                    "8";

                synchronizeFromBits();
            }

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

            if (currentModule === "digitalization") {
                signalAmplitude.value = "1";
                signalFrequency.value = "1000";
                signalFrequencyUnit.value = "Hz";
                samplingFrequency.value = "8000";
                samplingFrequencyUnit.value = "Hz";
                initialPhase.value = "0";
                bitsPerSample.value = "3";

                synchronizeFromBits();

                minimumVoltage.value = "-1.2";
                maximumVoltage.value = "1.2";
                digitalizationSpeed.value = "1";
            } else {
                channelBandwidth.value = "3000";
                channelBandwidthUnit.value = "Hz";
                signalPower.value = "31";
                signalPowerUnit.value = "mW";
                noisePower.value = "1";
                noisePowerUnit.value = "mW";
                shannonSpeed.value = "1";
            }

            updateInterface();
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            if (viewWidth < 680) {
                viewHeight =
                    currentModule === "digitalization"
                        ? 1000
                        : 900;
            } else {
                viewHeight =
                    currentModule === "digitalization"
                        ? 760
                        : 650;
            }

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

            ctx.moveTo(
                x + safeRadius,
                y
            );

            ctx.lineTo(
                x + width - safeRadius,
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
                y + height - safeRadius
            );

            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - safeRadius,
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
                y + height - safeRadius
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

            if (lineNumber < maximumLines) {
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

            ctx.fillStyle = gradient;

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

        function drawHeader(
            title,
            subtitle,
            formula,
            color
        ) {
            ctx.save();

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.95)";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                title,
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                subtitle,
                24,
                50,
                Math.max(
                    190,
                    viewWidth - 350
                ),
                14,
                2
            );

            ctx.fillStyle = color;

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign = "right";

            ctx.fillText(
                formula,
                viewWidth - 24,
                33
            );

            ctx.restore();
        }

        function drawPlotGrid(
            plot,
            minimum,
            maximum,
            duration
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

                ctx.moveTo(
                    x,
                    plot.y
                );

                ctx.lineTo(
                    x,
                    plot.y +
                    plot.height
                );

                ctx.stroke();
            }

            for (
                let index = 0;
                index <= 8;
                index += 1
            ) {
                const y =
                    plot.y +
                    plot.height *
                    index /
                    8;

                ctx.beginPath();

                ctx.moveTo(
                    plot.x,
                    y
                );

                ctx.lineTo(
                    plot.x +
                    plot.width,
                    y
                );

                ctx.stroke();
            }

            const zeroY =
                plot.y +
                (
                    maximum /
                    (
                        maximum -
                        minimum
                    )
                ) *
                plot.height;

            if (
                zeroY >= plot.y &&
                zeroY <=
                    plot.y +
                    plot.height
            ) {
                ctx.strokeStyle =
                    "rgba(186, 230, 253, 0.35)";

                ctx.beginPath();

                ctx.moveTo(
                    plot.x,
                    zeroY
                );

                ctx.lineTo(
                    plot.x +
                    plot.width,
                    zeroY
                );

                ctx.stroke();
            }

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.74)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                formatNumber(
                    maximum,
                    3
                ) +
                " V",
                plot.x - 7,
                plot.y + 8
            );

            ctx.fillText(
                formatNumber(
                    minimum,
                    3
                ) +
                " V",
                plot.x - 7,
                plot.y +
                plot.height
            );

            ctx.textAlign = "center";

            ctx.fillText(
                "0",
                plot.x,
                plot.y +
                plot.height +
                17
            );

            ctx.fillText(
                formatTime(duration),
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
            minimum,
            maximum
        ) {
            return (
                plot.y +
                (
                    maximum -
                    value
                ) /
                (
                    maximum -
                    minimum
                ) *
                plot.height
            );
        }

        function drawAnalogWave(
            plot,
            data,
            duration,
            color = "#38bdf8",
            dash = []
        ) {
            ctx.save();
            ctx.beginPath();

            for (
                let pixel = 0;
                pixel <= plot.width;
                pixel += 1.5
            ) {
                const time =
                    duration *
                    pixel /
                    plot.width;

                const value =
                    data.amplitude *
                    Math.sin(
                        2 *
                        Math.PI *
                        data.frequency *
                        time +
                        data.phaseRadians
                    );

                const x =
                    plot.x +
                    pixel;

                const y =
                    valueToY(
                        value,
                        plot,
                        data.minimum,
                        data.maximum
                    );

                if (pixel === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 2.2;
            ctx.setLineDash(dash);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowBlur = 8;
            ctx.shadowColor = color;
            ctx.stroke();

            ctx.restore();
        }

        function quantizeValue(
            realValue,
            data
        ) {
            let quantizationIndex =
                Math.floor(
                    (
                        realValue -
                        data.minimum
                    ) /
                    data.quantizationStep
                );

            quantizationIndex =
                clamp(
                    quantizationIndex,
                    0,
                    data.numberOfLevels - 1
                );

            return {
                quantizationIndex,

                quantizedValue:
                    data.minimum +
                    (
                        quantizationIndex +
                        0.5
                    ) *
                    data.quantizationStep,

                saturated:
                    realValue <
                        data.minimum ||
                    realValue >=
                        data.maximum
            };
        }

        function drawQuantizedStaircase(
            plot,
            data,
            duration
        ) {
            ctx.save();
            ctx.beginPath();

            const steps =
                Math.min(
                    900,
                    Math.max(
                        240,
                        Math.round(
                            plot.width *
                            1.2
                        )
                    )
                );

            let previousY = null;

            for (
                let index = 0;
                index <= steps;
                index += 1
            ) {
                const time =
                    duration *
                    index /
                    steps;

                const realValue =
                    data.amplitude *
                    Math.sin(
                        2 *
                        Math.PI *
                        data.frequency *
                        time +
                        data.phaseRadians
                    );

                const quantized =
                    quantizeValue(
                        realValue,
                        data
                    );

                const x =
                    plot.x +
                    plot.width *
                    index /
                    steps;

                const y =
                    valueToY(
                        quantized.quantizedValue,
                        plot,
                        data.minimum,
                        data.maximum
                    );

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else if (previousY !== y) {
                    ctx.lineTo(
                        x,
                        previousY
                    );

                    ctx.lineTo(
                        x,
                        y
                    );
                } else {
                    ctx.lineTo(x, y);
                }

                previousY = y;
            }

            ctx.strokeStyle =
                "#c084fc";

            ctx.lineWidth = 2;
            ctx.shadowBlur = 7;
            ctx.shadowColor = "#c084fc";
            ctx.stroke();

            ctx.restore();
        }

        function drawSamplePoints(
            plot,
            data,
            duration,
            showCodes
        ) {
            const sampleCount =
                Math.floor(
                    duration *
                    data.sampling
                ) +
                1;

            const sampleStep =
                Math.max(
                    1,
                    Math.ceil(
                        sampleCount /
                        120
                    )
                );

            ctx.save();

            ctx.font =
                "700 8px Consolas, monospace";

            ctx.textAlign = "center";

            for (
                let index = 0;
                index < sampleCount;
                index += sampleStep
            ) {
                const time =
                    index /
                    data.sampling;

                if (time > duration) {
                    break;
                }

                const realValue =
                    data.amplitude *
                    Math.sin(
                        2 *
                        Math.PI *
                        data.frequency *
                        time +
                        data.phaseRadians
                    );

                const quantized =
                    quantizeValue(
                        realValue,
                        data
                    );

                const x =
                    plot.x +
                    time /
                    duration *
                    plot.width;

                const realY =
                    valueToY(
                        realValue,
                        plot,
                        data.minimum,
                        data.maximum
                    );

                const quantizedY =
                    valueToY(
                        quantized.quantizedValue,
                        plot,
                        data.minimum,
                        data.maximum
                    );

                ctx.strokeStyle =
                    "rgba(251, 191, 36, 0.42)";

                ctx.lineWidth = 1;

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    realY
                );

                ctx.lineTo(
                    x,
                    quantizedY
                );

                ctx.stroke();

                ctx.fillStyle =
                    quantized.saturated
                        ? "#fb7185"
                        : "#fbbf24";

                ctx.shadowBlur = 9;
                ctx.shadowColor =
                    ctx.fillStyle;

                ctx.beginPath();

                ctx.arc(
                    x,
                    realY,
                    3.7,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.fillStyle =
                    "#c084fc";

                ctx.beginPath();

                ctx.arc(
                    x,
                    quantizedY,
                    3.2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                if (
                    showCodes &&
                    index < 12
                ) {
                    ctx.shadowBlur = 0;

                    ctx.fillStyle =
                        "rgba(236, 254, 255, 0.88)";

                    ctx.fillText(
                        toBinary(
                            quantized.quantizationIndex,
                            data.numberOfBits
                        ),
                        x,
                        plot.y +
                        plot.height +
                        33 +
                        (
                            index % 2
                        ) *
                        12
                    );
                }
            }

            ctx.restore();
        }

        function drawDigitalizationCursor(
            plot,
            color
        ) {
            const speed =
                Number(
                    digitalizationSpeed.value
                );

            const progress =
                (
                    elapsedTime *
                    0.22 *
                    speed
                ) %
                1;

            const x =
                plot.x +
                plot.width *
                progress;

            ctx.save();

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.3;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();

            ctx.moveTo(
                x,
                plot.y
            );

            ctx.lineTo(
                x,
                plot.y +
                plot.height
            );

            ctx.stroke();

            ctx.restore();
        }

        function drawLegend(
            x,
            y,
            items
        ) {
            let offset = 0;

            items.forEach(
                function (item) {
                    ctx.save();

                    if (item.point) {
                        ctx.fillStyle =
                            item.color;

                        ctx.beginPath();

                        ctx.arc(
                            x +
                            offset +
                            7,
                            y - 3,
                            4,
                            0,
                            Math.PI * 2
                        );

                        ctx.fill();
                    } else {
                        ctx.strokeStyle =
                            item.color;

                        ctx.lineWidth = 2;

                        ctx.setLineDash(
                            item.dashed
                                ? [7, 5]
                                : []
                        );

                        ctx.beginPath();

                        ctx.moveTo(
                            x + offset,
                            y - 3
                        );

                        ctx.lineTo(
                            x +
                            offset +
                            18,
                            y - 3
                        );

                        ctx.stroke();
                    }

                    ctx.fillStyle =
                        "rgba(199, 220, 235, 0.84)";

                    ctx.font =
                        "600 8.5px Segoe UI, sans-serif";

                    ctx.textAlign = "left";

                    ctx.fillText(
                        item.text,
                        x +
                        offset +
                        25,
                        y
                    );

                    offset +=
                        25 +
                        ctx.measureText(
                            item.text
                        ).width +
                        24;

                    ctx.restore();
                }
            );
        }

        function drawDigitalizationDesktop(data) {
            const topPanel = {
                x: 20,
                y: 78,
                width: viewWidth - 40,
                height: 300
            };

            const bottomPanel = {
                x: 20,
                y: 400,
                width: viewWidth - 40,
                height: 300
            };

            drawPanel(
                topPanel,
                "1. SEÑAL ANALÓGICA Y MUESTRAS",
                "#38bdf8"
            );

            drawPanel(
                bottomPanel,
                "2. NIVELES CUANTIFICADOS Y CÓDIGOS",
                "#c084fc"
            );

            const duration =
                3 /
                data.frequency;

            const topPlot = {
                x: topPanel.x + 68,
                y: topPanel.y + 58,
                width: topPanel.width - 95,
                height: 190
            };

            const bottomPlot = {
                x: bottomPanel.x + 68,
                y: bottomPanel.y + 58,
                width: bottomPanel.width - 95,
                height: 190
            };

            drawPlotGrid(
                topPlot,
                data.minimum,
                data.maximum,
                duration
            );

            drawAnalogWave(
                topPlot,
                data,
                duration
            );

            drawSamplePoints(
                topPlot,
                data,
                duration,
                false
            );

            drawPlotGrid(
                bottomPlot,
                data.minimum,
                data.maximum,
                duration
            );

            drawAnalogWave(
                bottomPlot,
                data,
                duration,
                "rgba(56, 189, 248, 0.42)",
                [7, 5]
            );

            drawQuantizedStaircase(
                bottomPlot,
                data,
                duration
            );

            drawSamplePoints(
                bottomPlot,
                data,
                duration,
                true
            );

            drawLegend(
                topPanel.x + 18,
                topPanel.y + 48,
                [
                    {
                        color: "#38bdf8",
                        text: "Señal analógica"
                    },
                    {
                        color: "#fbbf24",
                        text: "Muestra real",
                        point: true
                    },
                    {
                        color: "#fb7185",
                        text: "Muestra saturada",
                        point: true
                    }
                ]
            );

            drawLegend(
                bottomPanel.x + 18,
                bottomPanel.y + 48,
                [
                    {
                        color: "rgba(56, 189, 248, 0.65)",
                        text: "Original",
                        dashed: true
                    },
                    {
                        color: "#c084fc",
                        text: "Valor cuantificado"
                    },
                    {
                        color: "#fbbf24",
                        text: "Error entre muestra y nivel",
                        point: true
                    }
                ]
            );

            drawDigitalizationCursor(
                topPlot,
                "#34d399"
            );

            drawDigitalizationCursor(
                bottomPlot,
                "#34d399"
            );
        }

        function drawDigitalizationMobile(data) {
            const topPanel = {
                x: 14,
                y: 78,
                width: viewWidth - 28,
                height: 420
            };

            const bottomPanel = {
                x: 14,
                y: 520,
                width: viewWidth - 28,
                height: 420
            };

            drawPanel(
                topPanel,
                "1. SEÑAL ANALÓGICA Y MUESTRAS",
                "#38bdf8"
            );

            drawPanel(
                bottomPanel,
                "2. CUANTIFICACIÓN Y CÓDIGOS",
                "#c084fc"
            );

            const duration =
                3 /
                data.frequency;

            const topPlot = {
                x: topPanel.x + 52,
                y: topPanel.y + 90,
                width: topPanel.width - 70,
                height: 250
            };

            const bottomPlot = {
                x: bottomPanel.x + 52,
                y: bottomPanel.y + 90,
                width: bottomPanel.width - 70,
                height: 250
            };

            drawPlotGrid(
                topPlot,
                data.minimum,
                data.maximum,
                duration
            );

            drawAnalogWave(
                topPlot,
                data,
                duration
            );

            drawSamplePoints(
                topPlot,
                data,
                duration,
                false
            );

            drawPlotGrid(
                bottomPlot,
                data.minimum,
                data.maximum,
                duration
            );

            drawAnalogWave(
                bottomPlot,
                data,
                duration,
                "rgba(56, 189, 248, 0.42)",
                [7, 5]
            );

            drawQuantizedStaircase(
                bottomPlot,
                data,
                duration
            );

            drawSamplePoints(
                bottomPlot,
                data,
                duration,
                true
            );

            drawDigitalizationCursor(
                topPlot,
                "#34d399"
            );

            drawDigitalizationCursor(
                bottomPlot,
                "#34d399"
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "Azul: señal original · amarillo: muestras",
                topPanel.x + 16,
                topPanel.y + 56
            );

            ctx.fillText(
                "Morado: niveles · códigos debajo del eje",
                bottomPanel.x + 16,
                bottomPanel.y + 56
            );

            ctx.restore();
        }

        function drawBar(
            x,
            baseY,
            width,
            height,
            color,
            label,
            value
        ) {
            ctx.save();

            const gradient =
                ctx.createLinearGradient(
                    x,
                    baseY - height,
                    x,
                    baseY
                );

            gradient.addColorStop(
                0,
                "rgba(255, 255, 255, 0.90)"
            );

            gradient.addColorStop(
                0.18,
                color
            );

            gradient.addColorStop(
                1,
                "rgba(30, 41, 59, 0.35)"
            );

            roundedRectPath(
                x,
                baseY - height,
                width,
                height,
                8
            );

            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#f0f9ff";

            ctx.font =
                "700 10px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                x +
                width / 2,
                baseY + 20
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            wrapText(
                value,
                x +
                width / 2,
                baseY + 37,
                width + 28,
                11,
                2
            );

            ctx.restore();
        }

        function drawCapacityGauge(
            panel,
            data
        ) {
            const x =
                panel.x + 30;

            const y =
                panel.y + 82;

            const width =
                panel.width - 60;

            const height = 22;

            const maximum =
                Math.max(
                    data.capacity,
                    data.requiredRate || 0,
                    1
                );

            const capacityWidth =
                width *
                data.capacity /
                maximum;

            const requiredX =
                x +
                width *
                (
                    data.requiredRate || 0
                ) /
                maximum;

            ctx.save();

            roundedRectPath(
                x,
                y,
                width,
                height,
                9
            );

            ctx.fillStyle =
                "rgba(51, 65, 85, 0.55)";

            ctx.fill();

            roundedRectPath(
                x,
                y,
                capacityWidth,
                height,
                9
            );

            ctx.fillStyle =
                "rgba(192, 132, 252, 0.55)";

            ctx.fill();

            if (
                Number.isFinite(
                    data.requiredRate
                )
            ) {
                ctx.strokeStyle =
                    data.sufficient
                        ? "#34d399"
                        : "#fb7185";

                ctx.lineWidth = 3;

                ctx.beginPath();

                ctx.moveTo(
                    requiredX,
                    y - 7
                );

                ctx.lineTo(
                    requiredX,
                    y +
                    height +
                    7
                );

                ctx.stroke();
            }

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "0",
                x,
                y +
                height +
                17
            );

            ctx.textAlign = "right";

            ctx.fillText(
                formatRate(maximum),
                x + width,
                y +
                height +
                17
            );

            ctx.textAlign = "center";
            ctx.fillStyle = "#c084fc";

            ctx.fillText(
                "C = " +
                formatRate(
                    data.capacity
                ),
                x +
                width / 2,
                y - 10
            );

            if (
                Number.isFinite(
                    data.requiredRate
                )
            ) {
                ctx.fillStyle =
                    data.sufficient
                        ? "#34d399"
                        : "#fb7185";

                ctx.fillText(
                    "Rb = " +
                    formatRate(
                        data.requiredRate
                    ),
                    clamp(
                        requiredX,
                        x + 45,
                        x +
                        width -
                        45
                    ),
                    y +
                    height +
                    34
                );
            }

            ctx.restore();
        }

        function drawShannonDesktop(data) {
            const leftPanel = {
                x: 20,
                y: 78,
                width: viewWidth * 0.47,
                height: 515
            };

            const rightPanel = {
                x:
                    leftPanel.x +
                    leftPanel.width +
                    18,

                y: 78,

                width:
                    viewWidth -
                    leftPanel.width -
                    58,

                height: 515
            };

            drawPanel(
                leftPanel,
                "RELACIÓN SEÑAL / RUIDO",
                "#38bdf8"
            );

            drawPanel(
                rightPanel,
                "CAPACIDAD Y EFECTOS",
                "#c084fc"
            );

            const maximumPower =
                Math.max(
                    data.signalWatts,
                    data.noiseWatts
                );

            const baseY =
                leftPanel.y +
                360;

            const maximumHeight = 220;
            const barWidth = 90;

            drawBar(
                leftPanel.x +
                leftPanel.width *
                0.28 -
                barWidth / 2,
                baseY,
                barWidth,
                Math.max(
                    15,
                    maximumHeight *
                    data.signalWatts /
                    maximumPower
                ),
                "#38bdf8",
                "Señal",
                formatPower(
                    data.signalWatts
                )
            );

            drawBar(
                leftPanel.x +
                leftPanel.width *
                0.72 -
                barWidth / 2,
                baseY,
                barWidth,
                Math.max(
                    15,
                    maximumHeight *
                    data.noiseWatts /
                    maximumPower
                ),
                "#fb7185",
                "Ruido",
                formatPower(
                    data.noiseWatts
                )
            );

            ctx.save();

            ctx.fillStyle = "#f0f9ff";

            ctx.font =
                "700 22px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                "S/N = " +
                formatNumber(
                    data.signalToNoiseRatio,
                    5
                ),
                leftPanel.x +
                leftPanel.width / 2,
                leftPanel.y + 70
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";

            ctx.font =
                "600 10px Segoe UI, sans-serif";

            ctx.fillText(
                "SNR = " +
                formatNumber(
                    data.signalToNoiseDb,
                    4
                ) +
                " dB",
                leftPanel.x +
                leftPanel.width / 2,
                leftPanel.y + 94
            );

            ctx.restore();

            const capacities = [
                data.capacity,
                data.doubleBandwidthCapacity,
                data.improvedSnrCapacity
            ];

            const maximumCapacity =
                Math.max.apply(
                    null,
                    capacities
                );

            const capacityBaseY =
                rightPanel.y +
                390;

            const capacityBarWidth =
                Math.min(
                    86,
                    (
                        rightPanel.width -
                        70
                    ) /
                    3 -
                    12
                );

            const positions = [
                rightPanel.x +
                rightPanel.width *
                0.20 -
                capacityBarWidth / 2,

                rightPanel.x +
                rightPanel.width *
                0.50 -
                capacityBarWidth / 2,

                rightPanel.x +
                rightPanel.width *
                0.80 -
                capacityBarWidth / 2
            ];

            drawBar(
                positions[0],
                capacityBaseY,
                capacityBarWidth,
                240 *
                data.capacity /
                maximumCapacity,
                "#c084fc",
                "Actual",
                formatRate(
                    data.capacity
                )
            );

            drawBar(
                positions[1],
                capacityBaseY,
                capacityBarWidth,
                240 *
                data.doubleBandwidthCapacity /
                maximumCapacity,
                "#34d399",
                "B × 2",
                formatRate(
                    data.doubleBandwidthCapacity
                )
            );

            drawBar(
                positions[2],
                capacityBaseY,
                capacityBarWidth,
                240 *
                data.improvedSnrCapacity /
                maximumCapacity,
                "#fbbf24",
                "S/N × 2",
                formatRate(
                    data.improvedSnrCapacity
                )
            );

            drawCapacityGauge(
                rightPanel,
                data
            );
        }

        function drawShannonMobile(data) {
            const topPanel = {
                x: 14,
                y: 78,
                width: viewWidth - 28,
                height: 360
            };

            const bottomPanel = {
                x: 14,
                y: 460,
                width: viewWidth - 28,
                height: 360
            };

            drawPanel(
                topPanel,
                "RELACIÓN SEÑAL / RUIDO",
                "#38bdf8"
            );

            drawPanel(
                bottomPanel,
                "CAPACIDAD Y EFECTOS",
                "#c084fc"
            );

            const maximumPower =
                Math.max(
                    data.signalWatts,
                    data.noiseWatts
                );

            const baseY =
                topPanel.y +
                280;

            const maximumHeight = 150;
            const barWidth = 72;

            drawBar(
                topPanel.x +
                topPanel.width *
                0.30 -
                barWidth / 2,
                baseY,
                barWidth,
                Math.max(
                    14,
                    maximumHeight *
                    data.signalWatts /
                    maximumPower
                ),
                "#38bdf8",
                "Señal",
                formatPower(
                    data.signalWatts
                )
            );

            drawBar(
                topPanel.x +
                topPanel.width *
                0.70 -
                barWidth / 2,
                baseY,
                barWidth,
                Math.max(
                    14,
                    maximumHeight *
                    data.noiseWatts /
                    maximumPower
                ),
                "#fb7185",
                "Ruido",
                formatPower(
                    data.noiseWatts
                )
            );

            ctx.save();

            ctx.fillStyle = "#f0f9ff";

            ctx.font =
                "700 18px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                "S/N = " +
                formatNumber(
                    data.signalToNoiseRatio,
                    5
                ) +
                " · " +
                formatNumber(
                    data.signalToNoiseDb,
                    4
                ) +
                " dB",
                topPanel.x +
                topPanel.width / 2,
                topPanel.y + 65
            );

            ctx.restore();

            const capacities = [
                data.capacity,
                data.doubleBandwidthCapacity,
                data.improvedSnrCapacity
            ];

            const maximumCapacity =
                Math.max.apply(
                    null,
                    capacities
                );

            const capacityBaseY =
                bottomPanel.y +
                285;

            const capacityBarWidth = 60;

            const positions = [
                bottomPanel.x +
                bottomPanel.width *
                0.22 -
                capacityBarWidth / 2,

                bottomPanel.x +
                bottomPanel.width *
                0.50 -
                capacityBarWidth / 2,

                bottomPanel.x +
                bottomPanel.width *
                0.78 -
                capacityBarWidth / 2
            ];

            drawBar(
                positions[0],
                capacityBaseY,
                capacityBarWidth,
                155 *
                data.capacity /
                maximumCapacity,
                "#c084fc",
                "Actual",
                formatRate(
                    data.capacity
                )
            );

            drawBar(
                positions[1],
                capacityBaseY,
                capacityBarWidth,
                155 *
                data.doubleBandwidthCapacity /
                maximumCapacity,
                "#34d399",
                "B × 2",
                formatRate(
                    data.doubleBandwidthCapacity
                )
            );

            drawBar(
                positions[2],
                capacityBaseY,
                capacityBarWidth,
                155 *
                data.improvedSnrCapacity /
                maximumCapacity,
                "#fbbf24",
                "S/N × 2",
                formatRate(
                    data.improvedSnrCapacity
                )
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                "Duplicar B duplica C; mejorar S/N produce crecimiento logarítmico.",
                bottomPanel.x +
                bottomPanel.width / 2,
                bottomPanel.y + 55
            );

            ctx.restore();
        }

        function drawInvalidMessage(
            message,
            color
        ) {
            ctx.save();

            ctx.fillStyle = color;

            ctx.font =
                "700 17px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            wrapText(
                message,
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
                currentModule === "digitalization"
                    ? "Curvas: amplitud respecto al tiempo · no representan una trayectoria espacial."
                    : "Barras y escalas visuales comprimidas · consulte siempre los valores numéricos.",
                viewWidth - 18,
                viewHeight - 14
            );

            ctx.restore();
        }

        function drawScene() {
            drawBackground();

            if (currentModule === "digitalization") {
                const digitalizationData =
                    getDigitalizationData();

                if (!digitalizationData.valid) {
                    drawInvalidMessage(
                        "Revise amplitud, frecuencias, bits y rango de cuantificación.",
                        "#fb7185"
                    );

                    return;
                }

                drawHeader(
                    "Digitalización de una señal senoidal",
                    "Se muestran muestras, intervalos uniformes, valores representativos y códigos binarios.",
                    "L = 2ⁿ · Rb = fs × n",
                    "#38bdf8"
                );

                if (viewWidth < 680) {
                    drawDigitalizationMobile(
                        digitalizationData
                    );
                } else {
                    drawDigitalizationDesktop(
                        digitalizationData
                    );
                }
            } else {
                const shannonData =
                    getShannonData();

                if (!shannonData.valid) {
                    drawInvalidMessage(
                        "El ancho de banda, la señal y el ruido deben ser positivos.",
                        "#fb7185"
                    );

                    return;
                }

                drawHeader(
                    "Capacidad teórica de un canal con ruido",
                    "Shannon utiliza S/N lineal; la capacidad no es una velocidad comercial garantizada.",
                    "C = B × log2(1 + S/N)",
                    "#c084fc"
                );

                if (viewWidth < 680) {
                    drawShannonMobile(
                        shannonData
                    );
                } else {
                    drawShannonDesktop(
                        shannonData
                    );
                }
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

            lastFrameTime =
                currentTime;

            if (!isPaused) {
                const speed =
                    currentModule === "digitalization"
                        ? Number(
                            digitalizationSpeed.value
                        )
                        : Number(
                            shannonSpeed.value
                        );

                elapsedTime +=
                    deltaTime *
                    speed;

                if (elapsedTime > 10000) {
                    elapsedTime = 0;
                }
            }

            drawScene();

            requestAnimationFrame(
                animate
            );
        }

        moduleButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        setModule(
                            button.dataset.module
                        );
                    }
                );
            }
        );

        [
            signalAmplitude,
            signalFrequency,
            signalFrequencyUnit,
            samplingFrequency,
            samplingFrequencyUnit,
            initialPhase,
            minimumVoltage,
            maximumVoltage,
            digitalizationSpeed
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

        bitsPerSample.addEventListener(
            "change",
            function () {
                synchronizeFromBits();
                updateInterface();
            }
        );

        quantizationLevels.addEventListener(
            "change",
            function () {
                synchronizeFromLevels();
                updateInterface();
            }
        );

        [
            channelBandwidth,
            channelBandwidthUnit,
            signalPower,
            signalPowerUnit,
            noisePower,
            noisePowerUnit,
            shannonSpeed
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

        digitalPresetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyDigitalPreset(
                            button.dataset.digitalPreset
                        );
                    }
                );
            }
        );

        shannonPresetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyShannonPreset(
                            button.dataset.shannonPreset
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

        synchronizeFromBits();
        resizeCanvas();
        updateInterface();

        requestAnimationFrame(
            function startAnimation(time) {
                lastFrameTime = time;
                animate(time);
            }
        );
    
