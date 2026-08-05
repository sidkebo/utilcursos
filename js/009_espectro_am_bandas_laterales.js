        "use strict";

        /*
         * SIT-400 — Clase 9
         * Espectro AM y bandas laterales.
         *
         * Alcance:
         * - Dominio temporal como referencia AM.
         * - Componentes espectrales ideales.
         * - AM convencional, DSB-SC, SSB y VSB.
         * - Cálculo de frecuencias y anchos de banda teóricos.
         *
         * No incluye transformada de Fourier, potencia, eficiencia,
         * ruido, filtros reales, moduladores ni receptores.
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

        const lowerSidebandMetric =
            document.getElementById("lowerSidebandMetric");

        const carrierMetric =
            document.getElementById("carrierMetric");

        const upperSidebandMetric =
            document.getElementById("upperSidebandMetric");

        const bandwidthMetric =
            document.getElementById("bandwidthMetric");

        const sidebandAmplitudeMetric =
            document.getElementById("sidebandAmplitudeMetric");

        const systemMetric =
            document.getElementById("systemMetric");

        const carrierFrequency =
            document.getElementById("carrierFrequency");

        const carrierFrequencyUnit =
            document.getElementById("carrierFrequencyUnit");

        const modulatingFrequency =
            document.getElementById("modulatingFrequency");

        const modulatingFrequencyUnit =
            document.getElementById("modulatingFrequencyUnit");

        const modulatingAmplitude =
            document.getElementById("modulatingAmplitude");

        const modulationIndex =
            document.getElementById("modulationIndex");

        const modulationIndexDisplay =
            document.getElementById("modulationIndexDisplay");

        const systemType =
            document.getElementById("systemType");

        const sideSelectionGroup =
            document.getElementById("sideSelectionGroup");

        const sideSelectionLabel =
            document.getElementById("sideSelectionLabel");

        const sideSelection =
            document.getElementById("sideSelection");

        const vestigeGroup =
            document.getElementById("vestigeGroup");

        const vestigeBandwidth =
            document.getElementById("vestigeBandwidth");

        const vestigeBandwidthUnit =
            document.getElementById("vestigeBandwidthUnit");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedDisplay =
            document.getElementById("animationSpeedDisplay");

        const frequencyFormula =
            document.getElementById("frequencyFormula");

        const amplitudeFormula =
            document.getElementById("amplitudeFormula");

        const bandwidthFormula =
            document.getElementById("bandwidthFormula");

        const comparisonTableBody =
            document.getElementById("comparisonTableBody");

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
            amExample: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 0.6,
                system: "am",
                side: "upper",
                vestige: 1,
                vestigeUnit: "kHz"
            },

            dsbExample: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 0.6,
                system: "dsb",
                side: "upper",
                vestige: 1,
                vestigeUnit: "kHz"
            },

            upperSsb: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 0.6,
                system: "ssb",
                side: "upper",
                vestige: 1,
                vestigeUnit: "kHz"
            },

            lowerSsb: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 0.6,
                system: "ssb",
                side: "lower",
                vestige: 1,
                vestigeUnit: "kHz"
            },

            vsbExample: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 0.6,
                system: "vsb",
                side: "upper",
                vestige: 1,
                vestigeUnit: "kHz"
            },

            overmodulation: {
                fc: 100,
                fcUnit: "kHz",
                fm: 5,
                fmUnit: "kHz",
                am: 1,
                m: 1.2,
                system: "am",
                side: "upper",
                vestige: 1,
                vestigeUnit: "kHz"
            }
        };

        const systemNames = {
            am: "AM convencional",
            dsb: "DSB-SC",
            ssb: "SSB",
            vsb: "VSB"
        };

        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 720;
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

        function formatNumber(value, maximumDecimals = 4) {
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
                    maximumFractionDigits: maximumDecimals
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

        function getSimulationData() {
            const fc =
                Number(carrierFrequency.value) *
                frequencyFactor(
                    carrierFrequencyUnit.value
                );

            const fm =
                Number(modulatingFrequency.value) *
                frequencyFactor(
                    modulatingFrequencyUnit.value
                );

            const am =
                Number(modulatingAmplitude.value);

            const m =
                Number(modulationIndex.value);

            const system =
                systemType.value;

            const selectedSide =
                sideSelection.value;

            const vestige =
                Number(vestigeBandwidth.value) *
                frequencyFactor(
                    vestigeBandwidthUnit.value
                );

            const valid =
                [fc, fm, am, m, vestige].every(Number.isFinite) &&
                fc > 0 &&
                fm > 0 &&
                am > 0 &&
                m >= 0 &&
                vestige >= 0;

            if (!valid) {
                return {
                    valid: false,
                    fc,
                    fm,
                    am,
                    m,
                    system,
                    selectedSide,
                    vestige
                };
            }

            const lowerSideband =
                fc - fm;

            const upperSideband =
                fc + fm;

            const sidebandRelativeAmplitude =
                m / 2;

            let bandwidth;
            let occupiedMinimum;
            let occupiedMaximum;

            if (
                system === "am" ||
                system === "dsb"
            ) {
                bandwidth =
                    2 * fm;

                occupiedMinimum =
                    lowerSideband;

                occupiedMaximum =
                    upperSideband;
            } else if (system === "ssb") {
                bandwidth = fm;

                if (selectedSide === "upper") {
                    occupiedMinimum = fc;
                    occupiedMaximum =
                        upperSideband;
                } else {
                    occupiedMinimum =
                        lowerSideband;

                    occupiedMaximum = fc;
                }
            } else {
                bandwidth =
                    fm +
                    vestige;

                if (selectedSide === "upper") {
                    occupiedMinimum =
                        fc - vestige;

                    occupiedMaximum =
                        upperSideband;
                } else {
                    occupiedMinimum =
                        lowerSideband;

                    occupiedMaximum =
                        fc + vestige;
                }
            }

            const carrierRatio =
                fc / fm;

            const visualCarrierFrequency =
                carrierRatio > 80
                    ? fm * 80
                    : fc;

            return {
                valid: true,
                fc,
                fm,
                am,
                m,
                system,
                selectedSide,
                vestige,
                lowerSideband,
                upperSideband,
                sidebandRelativeAmplitude,
                bandwidth,
                occupiedMinimum,
                occupiedMaximum,
                carrierRatio,
                visualCarrierFrequency,
                compressedCarrier:
                    carrierRatio > 80,
                overmodulated:
                    m > 1,
                vestigeTooLarge:
                    system === "vsb" &&
                    vestige > fm,
                ac: 1
            };
        }

        function updateConditionalControls() {
            const system =
                systemType.value;

            sideSelectionGroup.hidden =
                system !== "ssb" &&
                system !== "vsb";

            vestigeGroup.hidden =
                system !== "vsb";

            if (system === "ssb") {
                sideSelectionLabel.textContent =
                    "Banda transmitida";
            } else if (system === "vsb") {
                sideSelectionLabel.textContent =
                    "Banda lateral completa";
            }
        }

        function getSystemDescription(data) {
            if (data.system === "am") {
                return {
                    title: "AM convencional",
                    description:
                        "Se transmiten la portadora, la banda lateral inferior y la banda lateral superior."
                };
            }

            if (data.system === "dsb") {
                return {
                    title: "DSB-SC",
                    description:
                        "Se transmiten las dos bandas laterales y se suprime la portadora dominante."
                };
            }

            if (data.system === "ssb") {
                return {
                    title:
                        data.selectedSide === "upper"
                            ? "SSB superior"
                            : "SSB inferior",

                    description:
                        data.selectedSide === "upper"
                            ? "Se conserva únicamente la banda lateral superior; la inferior y la portadora dominante no se transmiten."
                            : "Se conserva únicamente la banda lateral inferior; la superior y la portadora dominante no se transmiten."
                };
            }

            return {
                title:
                    data.selectedSide === "upper"
                        ? "VSB con banda superior completa"
                        : "VSB con banda inferior completa",

                description:
                    "Se conserva una banda lateral completa y un vestigio de la banda opuesta."
            };
        }

        function updateInterface() {
            updateConditionalControls();

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
                    "Las frecuencias y la amplitud deben ser positivas. El índice y el vestigio no pueden ser negativos.";

                stateValue.textContent =
                    "Revise los controles";

                lowerSidebandMetric.textContent = "—";
                carrierMetric.textContent = "—";
                upperSidebandMetric.textContent = "—";
                bandwidthMetric.textContent = "—";
                sidebandAmplitudeMetric.textContent = "—";
                systemMetric.textContent = "—";

                comparisonTableBody.innerHTML = "";

                return;
            }

            const systemDescription =
                getSystemDescription(data);

            stateTitle.textContent =
                systemDescription.title;

            stateDescription.textContent =
                systemDescription.description;

            stateValue.textContent =
                "B = " +
                formatFrequency(
                    data.bandwidth
                );

            if (data.fc <= data.fm) {
                stateBanner.className =
                    "state-banner warning";

                stateDescription.textContent =
                    "Para el modelo didáctico de frecuencias positivas se recomienda usar fc > fm. Con los valores actuales, la BLI llega a cero o a frecuencia negativa.";
            } else if (data.vestigeTooLarge) {
                stateBanner.className =
                    "state-banner warning";

                stateDescription.textContent =
                    "El vestigio ingresado supera Bm. El cálculo usa el valor indicado, pero ya no representa un vestigio menor que la banda completa.";
            } else if (data.overmodulated) {
                stateBanner.className =
                    "state-banner danger";

                stateDescription.textContent =
                    "El espectro ideal se calcula con el índice ingresado, pero la referencia temporal presenta sobremodulación y una envolvente deformada.";
            } else if (data.m === 0) {
                stateBanner.className =
                    "state-banner neutral";

                stateDescription.textContent =
                    data.system === "am"
                        ? "Con m = 0 desaparecen las bandas laterales y solo queda la portadora."
                        : "Con m = 0 las componentes laterales tienen amplitud nula en este modelo ideal.";
            } else {
                stateBanner.className =
                    "state-banner";
            }

            lowerSidebandMetric.textContent =
                formatFrequency(
                    data.lowerSideband
                );

            carrierMetric.textContent =
                formatFrequency(
                    data.fc
                );

            upperSidebandMetric.textContent =
                formatFrequency(
                    data.upperSideband
                );

            bandwidthMetric.textContent =
                formatFrequency(
                    data.bandwidth
                );

            sidebandAmplitudeMetric.textContent =
                formatNumber(
                    data.sidebandRelativeAmplitude,
                    5
                ) +
                " Aᶜ";

            systemMetric.textContent =
                systemDescription.title;

            frequencyFormula.textContent =
                "fBLI = " +
                formatFrequency(data.fc) +
                " − " +
                formatFrequency(data.fm) +
                " = " +
                formatFrequency(data.lowerSideband) +
                " · fBLS = " +
                formatFrequency(data.fc) +
                " + " +
                formatFrequency(data.fm) +
                " = " +
                formatFrequency(data.upperSideband);

            amplitudeFormula.textContent =
                "Aportadora = Aᶜ · Alateral = mAᶜ/2 = " +
                formatNumber(
                    data.m,
                    4
                ) +
                "Aᶜ/2 = " +
                formatNumber(
                    data.sidebandRelativeAmplitude,
                    5
                ) +
                "Aᶜ";

            if (data.system === "am") {
                bandwidthFormula.textContent =
                    "BAM = 2Bₘ = 2 × " +
                    formatFrequency(data.fm) +
                    " = " +
                    formatFrequency(data.bandwidth);
            } else if (data.system === "dsb") {
                bandwidthFormula.textContent =
                    "BDSB-SC = 2Bₘ = 2 × " +
                    formatFrequency(data.fm) +
                    " = " +
                    formatFrequency(data.bandwidth);
            } else if (data.system === "ssb") {
                bandwidthFormula.textContent =
                    "BSSB = Bₘ = " +
                    formatFrequency(data.bandwidth);
            } else {
                bandwidthFormula.textContent =
                    "BVSB = Bₘ + Bvestigio = " +
                    formatFrequency(data.fm) +
                    " + " +
                    formatFrequency(data.vestige) +
                    " = " +
                    formatFrequency(data.bandwidth);
            }

            updateComparisonTable(data);
            updateTechnicalNote(data);
        }

        function updateComparisonTable(data) {
            const amBandwidth =
                2 * data.fm;

            const ssbBandwidth =
                data.fm;

            const vsbBandwidth =
                data.fm +
                data.vestige;

            const amRange =
                formatFrequency(
                    data.fc - data.fm
                ) +
                " a " +
                formatFrequency(
                    data.fc + data.fm
                );

            const upperSsbRange =
                formatFrequency(data.fc) +
                " a " +
                formatFrequency(
                    data.fc + data.fm
                );

            const lowerSsbRange =
                formatFrequency(
                    data.fc - data.fm
                ) +
                " a " +
                formatFrequency(data.fc);

            const vsbRange =
                data.selectedSide === "upper"
                    ? formatFrequency(
                        data.fc - data.vestige
                    ) +
                        " a " +
                        formatFrequency(
                            data.fc + data.fm
                        )
                    : formatFrequency(
                        data.fc - data.fm
                    ) +
                        " a " +
                        formatFrequency(
                            data.fc + data.vestige
                        );

            const activeTag =
                function (system) {
                    return (
                        system === data.system
                            ? '<span class="status-tag active">Seleccionado</span>'
                            : '<span class="status-tag inactive">Comparación</span>'
                    );
                };

            comparisonTableBody.innerHTML =
                "<tr>" +
                    "<td>AM convencional</td>" +
                    "<td>Portadora + BLI + BLS</td>" +
                    "<td>" +
                        formatFrequency(amBandwidth) +
                    "</td>" +
                    "<td>" +
                        amRange +
                    "</td>" +
                    "<td>" +
                        activeTag("am") +
                    "</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>DSB-SC</td>" +
                    "<td>BLI + BLS, sin portadora dominante</td>" +
                    "<td>" +
                        formatFrequency(amBandwidth) +
                    "</td>" +
                    "<td>" +
                        amRange +
                    "</td>" +
                    "<td>" +
                        activeTag("dsb") +
                    "</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>SSB superior</td>" +
                    "<td>Solo BLS</td>" +
                    "<td>" +
                        formatFrequency(ssbBandwidth) +
                    "</td>" +
                    "<td>" +
                        upperSsbRange +
                    "</td>" +
                    "<td>" +
                        (
                            data.system === "ssb" &&
                            data.selectedSide === "upper"
                                ? '<span class="status-tag active">Seleccionado</span>'
                                : '<span class="status-tag inactive">Comparación</span>'
                        ) +
                    "</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>SSB inferior</td>" +
                    "<td>Solo BLI</td>" +
                    "<td>" +
                        formatFrequency(ssbBandwidth) +
                    "</td>" +
                    "<td>" +
                        lowerSsbRange +
                    "</td>" +
                    "<td>" +
                        (
                            data.system === "ssb" &&
                            data.selectedSide === "lower"
                                ? '<span class="status-tag active">Seleccionado</span>'
                                : '<span class="status-tag inactive">Comparación</span>'
                        ) +
                    "</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>VSB</td>" +
                    "<td>Una banda completa + vestigio de la opuesta</td>" +
                    "<td>" +
                        formatFrequency(vsbBandwidth) +
                    "</td>" +
                    "<td>" +
                        vsbRange +
                    "</td>" +
                    "<td>" +
                        activeTag("vsb") +
                    "</td>" +
                "</tr>";
        }

        function updateTechnicalNote(data) {
            const notes = [];

            if (data.compressedCarrier) {
                notes.push(
                    "La portadora temporal se comprimió visualmente a una relación de 80:1 respecto de la modulante. Los valores numéricos conservan fc real."
                );
            }

            if (data.fc <= data.fm) {
                notes.push(
                    "La BLI resulta igual o menor que cero. Para los ejercicios básicos de esta clase use una portadora mayor que la frecuencia modulante."
                );
            }

            if (data.overmodulated) {
                notes.push(
                    "La envolvente temporal se cruza porque m > 1. Las alturas espectrales se muestran mediante el desarrollo ideal de una modulante senoidal."
                );
            }

            if (data.system === "vsb") {
                notes.push(
                    "En VSB las zonas coloreadas indican ocupación conceptual. El ancho del vestigio no determina por sí solo su amplitud, por lo que no se asigna una altura física exacta."
                );
            }

            notes.push(
                "El ancho mostrado es teórico y no incluye bandas de guarda, tolerancias ni transiciones de filtros."
            );

            notes.push(
                "Las ondas representan amplitud respecto al tiempo; no representan una trayectoria espacial."
            );

            technicalNote.innerHTML =
                "<strong>Advertencias:</strong> " +
                notes.join(" ");
        }

        function applyPreset(key) {
            const preset =
                presets[key];

            if (!preset) {
                return;
            }

            carrierFrequency.value =
                String(preset.fc);

            carrierFrequencyUnit.value =
                preset.fcUnit;

            modulatingFrequency.value =
                String(preset.fm);

            modulatingFrequencyUnit.value =
                preset.fmUnit;

            modulatingAmplitude.value =
                String(preset.am);

            modulationIndex.value =
                String(preset.m);

            systemType.value =
                preset.system;

            sideSelection.value =
                preset.side;

            vestigeBandwidth.value =
                String(preset.vestige);

            vestigeBandwidthUnit.value =
                preset.vestigeUnit;

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

            applyPreset("amExample");
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            viewHeight =
                viewWidth < 720
                    ? 1080
                    : 720;

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

            ctx.lineTo(x + safeRadius, y);

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
                        y +
                        lineNumber *
                        lineHeight
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

        function drawHeader(data) {
            ctx.save();

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.95)";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "Análisis temporal y espectral",
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                "El gráfico temporal muestra amplitud respecto al tiempo; el espectral muestra las frecuencias presentes o conservadas.",
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
                data.overmodulated
                    ? "#fb7185"
                    : "#38bdf8";

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign = "right";

            ctx.fillText(
                systemNames[data.system] +
                " · fc = " +
                formatFrequency(data.fc) +
                " · fm = " +
                formatFrequency(data.fm),
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

        function drawTimeGrid(
            plot,
            verticalMaximum,
            duration
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
                    plot.y + plot.height
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

            ctx.lineWidth = 1.3;

            ctx.beginPath();
            ctx.moveTo(plot.x, centerY);
            ctx.lineTo(
                plot.x + plot.width,
                centerY
            );
            ctx.stroke();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.72)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "+" +
                formatNumber(
                    verticalMaximum,
                    4
                ) +
                " V",
                plot.x - 6,
                plot.y + 8
            );

            ctx.fillText(
                "0 V",
                plot.x - 6,
                centerY + 3
            );

            ctx.fillText(
                "−" +
                formatNumber(
                    verticalMaximum,
                    4
                ) +
                " V",
                plot.x - 6,
                plot.y +
                plot.height
            );

            ctx.textAlign = "center";

            ctx.fillText(
                "0",
                plot.x,
                plot.y +
                plot.height +
                16
            );

            ctx.fillText(
                formatTime(duration),
                plot.x +
                plot.width,
                plot.y +
                plot.height +
                16
            );

            ctx.restore();
        }

        function timeValueToY(
            value,
            plot,
            verticalMaximum
        ) {
            const centerY =
                plot.y +
                plot.height / 2;

            const scale =
                plot.height *
                0.42 /
                Math.max(
                    verticalMaximum,
                    1e-12
                );

            return (
                centerY -
                value *
                scale
            );
        }

        function drawTimeWave(
            plot,
            duration,
            valueFunction,
            verticalMaximum,
            color,
            lineWidth = 2,
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
                    plot.x +
                    pixel;

                const y =
                    timeValueToY(
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

        function drawTemporalReference(
            panel,
            data
        ) {
            const duration =
                3 /
                data.fm;

            const messagePlot = {
                x: panel.x + 58,
                y: panel.y + 66,
                width: panel.width - 78,
                height:
                    panel.height *
                    0.28
            };

            const amPlot = {
                x: panel.x + 58,
                y:
                    messagePlot.y +
                    messagePlot.height +
                    61,
                width: panel.width - 78,
                height:
                    panel.height -
                    messagePlot.height -
                    154
            };

            const amMaximum =
                data.ac *
                (
                    1 +
                    data.m
                ) *
                1.08;

            drawTimeGrid(
                messagePlot,
                data.am,
                duration
            );

            drawTimeGrid(
                amPlot,
                amMaximum,
                duration
            );

            drawTimeWave(
                messagePlot,
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
                2.3
            );

            drawTimeWave(
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
                            data.visualCarrierFrequency *
                            time
                        )
                    );
                },
                amMaximum,
                data.overmodulated
                    ? "#fb7185"
                    : "#f8fafc",
                1.7
            );

            const envelopeFunction =
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

            if (!data.overmodulated) {
                drawTimeWave(
                    amPlot,
                    duration,
                    envelopeFunction,
                    amMaximum,
                    "#34d399",
                    2,
                    [8, 5]
                );

                drawTimeWave(
                    amPlot,
                    duration,
                    function (time) {
                        return -envelopeFunction(time);
                    },
                    amMaximum,
                    "#34d399",
                    2,
                    [8, 5]
                );
            } else {
                drawTimeWave(
                    amPlot,
                    duration,
                    envelopeFunction,
                    amMaximum,
                    "#fb7185",
                    1.8,
                    [8, 5]
                );

                drawTimeWave(
                    amPlot,
                    duration,
                    function (time) {
                        return -envelopeFunction(time);
                    },
                    amMaximum,
                    "#fb7185",
                    1.8,
                    [8, 5]
                );

                drawTimeWave(
                    amPlot,
                    duration,
                    function (time) {
                        return Math.abs(
                            envelopeFunction(time)
                        );
                    },
                    amMaximum,
                    "#fb923c",
                    2
                );

                drawTimeWave(
                    amPlot,
                    duration,
                    function (time) {
                        return -Math.abs(
                            envelopeFunction(time)
                        );
                    },
                    amMaximum,
                    "#fb923c",
                    2
                );
            }

            drawTimeCursor(
                [messagePlot, amPlot]
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.86)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "MODULANTE DE PRUEBA",
                messagePlot.x,
                messagePlot.y - 12
            );

            ctx.fillText(
                "REFERENCIA AM CON ENVOLVENTE",
                amPlot.x,
                amPlot.y - 12
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.72)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.fillText(
                "Aₘ = " +
                formatNumber(data.am, 4) +
                " V · su forma normalizada controla la envolvente mediante m",
                messagePlot.x,
                messagePlot.y +
                messagePlot.height +
                31
            );

            ctx.fillText(
                "Aᶜ de referencia = 1 V",
                amPlot.x,
                amPlot.y +
                amPlot.height +
                31
            );

            if (data.compressedCarrier) {
                ctx.fillStyle = "#fbbf24";

                ctx.fillText(
                    "Portadora comprimida visualmente",
                    amPlot.x +
                    amPlot.width,
                    amPlot.y - 12
                );
            }

            ctx.restore();
        }

        function drawTimeCursor(plots) {
            const progress =
                (
                    elapsedTime *
                    0.17
                ) %
                1;

            ctx.save();

            plots.forEach(
                function (plot) {
                    const x =
                        plot.x +
                        plot.width *
                        progress;

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
                        "rgba(251, 191, 36, 0.92)";

                    ctx.beginPath();
                    ctx.arc(
                        x,
                        plot.y + 6,
                        3.2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            );

            ctx.restore();
        }

        function frequencyToX(
            frequency,
            plot,
            minimumFrequency,
            maximumFrequency
        ) {
            return (
                plot.x +
                (
                    frequency -
                    minimumFrequency
                ) /
                (
                    maximumFrequency -
                    minimumFrequency
                ) *
                plot.width
            );
        }

        function drawFrequencyGrid(
            plot,
            minimumFrequency,
            maximumFrequency
        ) {
            ctx.save();

            const baseline =
                plot.y +
                plot.height;

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            ctx.lineWidth = 1;

            for (
                let index = 0;
                index <= 5;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.width *
                    index /
                    5;

                ctx.beginPath();
                ctx.moveTo(x, plot.y);
                ctx.lineTo(x, baseline);
                ctx.stroke();

                const frequency =
                    minimumFrequency +
                    (
                        maximumFrequency -
                        minimumFrequency
                    ) *
                    index /
                    5;

                ctx.fillStyle =
                    "rgba(159, 181, 202, 0.74)";

                ctx.font =
                    "600 7.5px Segoe UI, sans-serif";

                ctx.textAlign = "center";

                ctx.fillText(
                    formatFrequency(frequency),
                    x,
                    baseline + 20
                );
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

            ctx.strokeStyle =
                "rgba(186, 230, 253, 0.45)";

            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.moveTo(plot.x, baseline);
            ctx.lineTo(
                plot.x +
                plot.width,
                baseline
            );
            ctx.stroke();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.75)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "Amplitud o presencia relativa",
                plot.x,
                plot.y - 10
            );

            ctx.textAlign = "right";

            ctx.fillText(
                "Frecuencia",
                plot.x +
                plot.width,
                baseline + 40
            );

            ctx.restore();
        }

        function drawGhostComponent(
            x,
            baseline,
            height,
            label
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(148, 163, 184, 0.28)";

            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(x, baseline);
            ctx.lineTo(x, baseline - height);
            ctx.stroke();

            ctx.setLineDash([]);

            ctx.strokeStyle =
                "rgba(251, 113, 133, 0.55)";

            ctx.lineWidth = 1.7;

            ctx.beginPath();
            ctx.moveTo(
                x - 6,
                baseline -
                height * 0.55 -
                6
            );
            ctx.lineTo(
                x + 6,
                baseline -
                height * 0.55 +
                6
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(
                x + 6,
                baseline -
                height * 0.55 -
                6
            );
            ctx.lineTo(
                x - 6,
                baseline -
                height * 0.55 +
                6
            );
            ctx.stroke();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.72)";

            ctx.font =
                "600 7.5px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                x,
                baseline + 34
            );

            ctx.restore();
        }

        function drawSpectrumLine(
            x,
            baseline,
            height,
            color,
            label,
            frequency,
            options = {}
        ) {
            ctx.save();

            const pulse =
                1 +
                0.04 *
                Math.sin(
                    elapsedTime * 4 +
                    x * 0.01
                );

            const displayedHeight =
                height *
                pulse;

            ctx.strokeStyle = color;

            ctx.lineWidth =
                options.thick
                    ? 5
                    : 3;

            ctx.setLineDash(
                options.dashed
                    ? [6, 5]
                    : []
            );

            ctx.shadowBlur =
                options.dashed
                    ? 0
                    : 13;

            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.moveTo(x, baseline);
            ctx.lineTo(
                x,
                baseline -
                displayedHeight
            );
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.shadowBlur = 0;

            ctx.fillStyle =
                options.dashed
                    ? "rgba(159, 181, 202, 0.76)"
                    : color;

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                x,
                baseline -
                displayedHeight -
                11
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 7.5px Segoe UI, sans-serif";

            ctx.fillText(
                formatFrequency(frequency),
                x,
                baseline + 34
            );

            ctx.restore();
        }

        function drawBandBlock(
            x1,
            x2,
            baseline,
            height,
            color,
            label,
            options = {}
        ) {
            const left =
                Math.min(x1, x2);

            const width =
                Math.max(
                    2,
                    Math.abs(x2 - x1)
                );

            ctx.save();

            const gradient =
                ctx.createLinearGradient(
                    0,
                    baseline - height,
                    0,
                    baseline
                );

            gradient.addColorStop(
                0,
                options.ghost
                    ? "rgba(148, 163, 184, 0.10)"
                    : color
            );

            gradient.addColorStop(
                1,
                "rgba(15, 23, 42, 0.18)"
            );

            ctx.globalAlpha =
                options.ghost
                    ? 0.38
                    : 0.72;

            ctx.fillStyle = gradient;

            ctx.fillRect(
                left,
                baseline - height,
                width,
                height
            );

            ctx.globalAlpha = 1;

            ctx.strokeStyle =
                options.ghost
                    ? "rgba(148, 163, 184, 0.28)"
                    : color;

            ctx.lineWidth = 1.5;

            if (options.dashed) {
                ctx.setLineDash([6, 4]);
            }

            ctx.strokeRect(
                left,
                baseline - height,
                width,
                height
            );

            ctx.setLineDash([]);

            ctx.fillStyle =
                options.ghost
                    ? "rgba(159, 181, 202, 0.66)"
                    : "#eaf9ff";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                left +
                width / 2,
                baseline -
                height -
                10
            );

            ctx.restore();
        }

        function drawBandwidthBracket(
            plot,
            minimumFrequency,
            maximumFrequency,
            occupiedMinimum,
            occupiedMaximum,
            bandwidth
        ) {
            const baseline =
                plot.y +
                plot.height;

            const x1 =
                frequencyToX(
                    occupiedMinimum,
                    plot,
                    minimumFrequency,
                    maximumFrequency
                );

            const x2 =
                frequencyToX(
                    occupiedMaximum,
                    plot,
                    minimumFrequency,
                    maximumFrequency
                );

            const y =
                baseline + 61;

            ctx.save();

            ctx.strokeStyle =
                "rgba(251, 191, 36, 0.88)";

            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x1, y - 6);
            ctx.lineTo(x1, y + 6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y - 6);
            ctx.lineTo(x2, y + 6);
            ctx.stroke();

            ctx.fillStyle =
                "#fde68a";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                "B = " +
                formatFrequency(bandwidth),
                (
                    x1 +
                    x2
                ) /
                2,
                y - 8
            );

            ctx.restore();
        }

        function drawSpectrum(
            panel,
            data
        ) {
            const margin =
                Math.max(
                    data.fm,
                    data.vestige,
                    data.bandwidth * 0.15,
                    1
                );

            const minimumFrequency =
                Math.min(
                    data.lowerSideband,
                    data.occupiedMinimum
                ) -
                margin * 0.45;

            const maximumFrequency =
                Math.max(
                    data.upperSideband,
                    data.occupiedMaximum
                ) +
                margin * 0.45;

            const plot = {
                x: panel.x + 30,
                y: panel.y + 84,
                width: panel.width - 60,
                height: panel.height - 190
            };

            drawFrequencyGrid(
                plot,
                minimumFrequency,
                maximumFrequency
            );

            const baseline =
                plot.y +
                plot.height;

            const maximumHeight =
                plot.height * 0.82;

            const sideHeight =
                maximumHeight *
                clamp(
                    data.sidebandRelativeAmplitude,
                    0,
                    1
                );

            const visibleSideHeight =
                data.m === 0
                    ? 0
                    : Math.max(
                        13,
                        sideHeight
                    );

            const carrierX =
                frequencyToX(
                    data.fc,
                    plot,
                    minimumFrequency,
                    maximumFrequency
                );

            const lowerX =
                frequencyToX(
                    data.lowerSideband,
                    plot,
                    minimumFrequency,
                    maximumFrequency
                );

            const upperX =
                frequencyToX(
                    data.upperSideband,
                    plot,
                    minimumFrequency,
                    maximumFrequency
                );

            if (data.system !== "vsb") {
                drawGhostComponent(
                    lowerX,
                    baseline,
                    maximumHeight * 0.48,
                    "BLI eliminada"
                );

                drawGhostComponent(
                    carrierX,
                    baseline,
                    maximumHeight * 0.68,
                    "Portadora suprimida"
                );

                drawGhostComponent(
                    upperX,
                    baseline,
                    maximumHeight * 0.48,
                    "BLS eliminada"
                );
            }

            if (data.system === "am") {
                if (data.m > 0) {
                    drawSpectrumLine(
                        lowerX,
                        baseline,
                        visibleSideHeight,
                        "#38bdf8",
                        "BLI",
                        data.lowerSideband
                    );

                    drawSpectrumLine(
                        upperX,
                        baseline,
                        visibleSideHeight,
                        "#34d399",
                        "BLS",
                        data.upperSideband
                    );
                }

                drawSpectrumLine(
                    carrierX,
                    baseline,
                    maximumHeight,
                    "#c084fc",
                    "Portadora",
                    data.fc,
                    {
                        thick: true
                    }
                );
            } else if (data.system === "dsb") {
                if (data.m > 0) {
                    drawSpectrumLine(
                        lowerX,
                        baseline,
                        visibleSideHeight,
                        "#38bdf8",
                        "BLI",
                        data.lowerSideband
                    );

                    drawSpectrumLine(
                        upperX,
                        baseline,
                        visibleSideHeight,
                        "#34d399",
                        "BLS",
                        data.upperSideband
                    );
                }

                drawSpectrumLine(
                    carrierX,
                    baseline,
                    maximumHeight * 0.72,
                    "rgba(148, 163, 184, 0.62)",
                    "Referencia fᶜ",
                    data.fc,
                    {
                        dashed: true
                    }
                );
            } else if (data.system === "ssb") {
                drawSpectrumLine(
                    carrierX,
                    baseline,
                    maximumHeight * 0.72,
                    "rgba(148, 163, 184, 0.62)",
                    "Referencia fᶜ",
                    data.fc,
                    {
                        dashed: true
                    }
                );

                if (
                    data.m > 0 &&
                    data.selectedSide === "upper"
                ) {
                    drawSpectrumLine(
                        upperX,
                        baseline,
                        visibleSideHeight,
                        "#34d399",
                        "BLS conservada",
                        data.upperSideband
                    );
                } else if (data.m > 0) {
                    drawSpectrumLine(
                        lowerX,
                        baseline,
                        visibleSideHeight,
                        "#38bdf8",
                        "BLI conservada",
                        data.lowerSideband
                    );
                }
            } else {
                const fullBandHeight =
                    maximumHeight * 0.60;

                const vestigeHeight =
                    maximumHeight * 0.34;

                const leftEdge =
                    frequencyToX(
                        data.fc - data.fm,
                        plot,
                        minimumFrequency,
                        maximumFrequency
                    );

                const rightEdge =
                    frequencyToX(
                        data.fc + data.fm,
                        plot,
                        minimumFrequency,
                        maximumFrequency
                    );

                const lowerVestigeEdge =
                    frequencyToX(
                        data.fc - data.vestige,
                        plot,
                        minimumFrequency,
                        maximumFrequency
                    );

                const upperVestigeEdge =
                    frequencyToX(
                        data.fc + data.vestige,
                        plot,
                        minimumFrequency,
                        maximumFrequency
                    );

                if (data.selectedSide === "upper") {
                    drawBandBlock(
                        leftEdge,
                        lowerVestigeEdge,
                        baseline,
                        vestigeHeight,
                        "rgba(148, 163, 184, 0.35)",
                        "Parte eliminada",
                        {
                            ghost: true,
                            dashed: true
                        }
                    );

                    drawBandBlock(
                        lowerVestigeEdge,
                        carrierX,
                        baseline,
                        vestigeHeight,
                        "#fbbf24",
                        "Vestigio BLI"
                    );

                    drawBandBlock(
                        carrierX,
                        rightEdge,
                        baseline,
                        fullBandHeight,
                        "#34d399",
                        "BLS completa"
                    );
                } else {
                    drawBandBlock(
                        leftEdge,
                        carrierX,
                        baseline,
                        fullBandHeight,
                        "#38bdf8",
                        "BLI completa"
                    );

                    drawBandBlock(
                        carrierX,
                        upperVestigeEdge,
                        baseline,
                        vestigeHeight,
                        "#fbbf24",
                        "Vestigio BLS"
                    );

                    drawBandBlock(
                        upperVestigeEdge,
                        rightEdge,
                        baseline,
                        vestigeHeight,
                        "rgba(148, 163, 184, 0.35)",
                        "Parte eliminada",
                        {
                            ghost: true,
                            dashed: true
                        }
                    );
                }

                drawSpectrumLine(
                    carrierX,
                    baseline,
                    maximumHeight * 0.72,
                    "rgba(148, 163, 184, 0.62)",
                    "Referencia fᶜ",
                    data.fc,
                    {
                        dashed: true
                    }
                );
            }

            drawBandwidthBracket(
                plot,
                minimumFrequency,
                maximumFrequency,
                data.occupiedMinimum,
                data.occupiedMaximum,
                data.bandwidth
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            if (data.system === "vsb") {
                ctx.fillText(
                    "VSB: las alturas son esquemáticas; el dato de vestigio define ancho, no amplitud.",
                    plot.x,
                    panel.y +
                    panel.height -
                    24
                );
            } else {
                ctx.fillText(
                    "Altura ideal relativa: portadora = 1 Aᶜ; cada lateral = mAᶜ/2.",
                    plot.x,
                    panel.y +
                    panel.height -
                    24
                );
            }

            ctx.restore();
        }

        function drawDesktop(data) {
            const margin = 20;
            const gap = 16;

            const timePanel = {
                x: margin,
                y: 78,
                width:
                    viewWidth *
                    0.56 -
                    margin,
                height:
                    viewHeight -
                    116
            };

            const spectrumPanel = {
                x:
                    timePanel.x +
                    timePanel.width +
                    gap,

                y: 78,

                width:
                    viewWidth -
                    timePanel.width -
                    gap -
                    margin * 2,

                height:
                    viewHeight -
                    116
            };

            drawPanel(
                timePanel,
                "DOMINIO DEL TIEMPO · REFERENCIA AM",
                "#38bdf8"
            );

            drawPanel(
                spectrumPanel,
                "DOMINIO DE LA FRECUENCIA · " +
                systemNames[data.system].toUpperCase(),
                data.system === "vsb"
                    ? "#fbbf24"
                    : "#c084fc"
            );

            drawTemporalReference(
                timePanel,
                data
            );

            drawSpectrum(
                spectrumPanel,
                data
            );
        }

        function drawMobile(data) {
            const margin = 14;
            const gap = 16;

            const timePanel = {
                x: margin,
                y: 80,
                width:
                    viewWidth -
                    margin * 2,
                height: 480
            };

            const spectrumPanel = {
                x: margin,
                y:
                    timePanel.y +
                    timePanel.height +
                    gap,
                width:
                    viewWidth -
                    margin * 2,
                height: 450
            };

            drawPanel(
                timePanel,
                "DOMINIO DEL TIEMPO",
                "#38bdf8"
            );

            drawPanel(
                spectrumPanel,
                "DOMINIO DE FRECUENCIA · " +
                systemNames[data.system].toUpperCase(),
                data.system === "vsb"
                    ? "#fbbf24"
                    : "#c084fc"
            );

            drawTemporalReference(
                timePanel,
                data
            );

            drawSpectrum(
                spectrumPanel,
                data
            );
        }

        function drawInvalidMessage() {
            ctx.save();

            ctx.fillStyle = "#fb7185";

            ctx.font =
                "700 17px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            wrapText(
                "Revise las frecuencias, la amplitud, el índice de modulación y el ancho del vestigio.",
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
                "Espectro ideal y ancho teórico · escalas adaptadas para enseñanza.",
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

            if (viewWidth < 720) {
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
            carrierFrequency,
            carrierFrequencyUnit,
            modulatingFrequency,
            modulatingFrequencyUnit,
            modulatingAmplitude,
            modulationIndex,
            systemType,
            sideSelection,
            vestigeBandwidth,
            vestigeBandwidthUnit,
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
    
