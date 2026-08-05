    "use strict";

    /*
     * SIT-400 — Clase 13
     * NBFM, WBFM, espectro FM y regla de Carson.
     *
     * Alcance:
     * - Señal FM temporal con amplitud ideal constante.
     * - Índice beta para modulante senoidal.
     * - Clasificación didáctica aproximada.
     * - Líneas espectrales en fc ± n·fm.
     * - Alturas relativas aproximadas mediante Jn(beta).
     * - Regla de Carson como estimación práctica.
     *
     * No incluye generación FM, VCO, varactor, métodos directos o
     * indirectos, demodulación, PLL ni ruido en FM.
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

    const betaMetric =
        document.getElementById("betaMetric");

    const classificationMetric =
        document.getElementById("classificationMetric");

    const carsonMetric =
        document.getElementById("carsonMetric");

    const instantRangeMetric =
        document.getElementById("instantRangeMetric");

    const carsonRangeMetric =
        document.getElementById("carsonRangeMetric");

    const spacingMetric =
        document.getElementById("spacingMetric");

    const orderMetric =
        document.getElementById("orderMetric");

    const instantFrequencyMetric =
        document.getElementById("instantFrequencyMetric");

    const carrierFrequencyInput =
        document.getElementById("carrierFrequency");

    const carrierFrequencyUnit =
        document.getElementById("carrierFrequencyUnit");

    const modulatingFrequencyInput =
        document.getElementById("modulatingFrequency");

    const modulatingFrequencyUnit =
        document.getElementById("modulatingFrequencyUnit");

    const frequencyDeviationInput =
        document.getElementById("frequencyDeviation");

    const frequencyDeviationUnit =
        document.getElementById("frequencyDeviationUnit");

    const animationSpeed =
        document.getElementById("animationSpeed");

    const animationSpeedOutput =
        document.getElementById("animationSpeedOutput");

    const betaFormula =
        document.getElementById("betaFormula");

    const carsonFormula =
        document.getElementById("carsonFormula");

    const carsonBetaFormula =
        document.getElementById("carsonBetaFormula");

    const instantRangeFormula =
        document.getElementById("instantRangeFormula");

    const lineLocationFormula =
        document.getElementById("lineLocationFormula");

    const besselFormula =
        document.getElementById("besselFormula");

    const componentTableBody =
        document.getElementById("componentTableBody");

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

    const twoPi = 2 * Math.PI;
    const carrierAmplitude = 1;
    const maximumVisibleCarrierRatio = 55;
    const maximumVisibleBeta = 14;
    const maximumDisplayedOrder = 18;

    const presets = {
        nbfm: {
            fc: 100,
            fcUnit: "kHz",
            fm: 10,
            fmUnit: "kHz",
            deltaF: 2,
            deltaFUnit: "kHz"
        },

        wbfm: {
            fc: 100,
            fcUnit: "kHz",
            fm: 5,
            fmUnit: "kHz",
            deltaF: 25,
            deltaFUnit: "kHz"
        },

        carsonBasic: {
            fc: 100,
            fcUnit: "kHz",
            fm: 1,
            fmUnit: "kHz",
            deltaF: 5,
            deltaFUnit: "kHz"
        },

        spectrum: {
            fc: 200,
            fcUnit: "kHz",
            fm: 10,
            fmUnit: "kHz",
            deltaF: 20,
            deltaFUnit: "kHz"
        },

        transition: {
            fc: 100,
            fcUnit: "kHz",
            fm: 5,
            fmUnit: "kHz",
            deltaF: 5,
            deltaFUnit: "kHz"
        },

        broadcastExample: {
            fc: 100,
            fcUnit: "MHz",
            fm: 15,
            fmUnit: "kHz",
            deltaF: 75,
            deltaFUnit: "kHz"
        }
    };

    let elapsedTime = 0;
    let lastFrameTime = performance.now();
    let isPaused = false;

    let viewWidth = 1000;
    let viewHeight = 930;
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

    function factorial(integer) {
        let result = 1;

        for (
            let value = 2;
            value <= integer;
            value += 1
        ) {
            result *= value;
        }

        return result;
    }

    /*
     * Aproximación numérica de la función de Bessel J_n(x) mediante
     * su serie de potencias. Se usa únicamente para las alturas relativas
     * del dibujo educativo; no se presenta como cálculo obligatorio.
     */
    function besselJ(order, argument) {
        const n =
            Math.max(
                0,
                Math.floor(order)
            );

        const x =
            Math.abs(argument);

        if (x === 0) {
            return n === 0
                ? 1
                : 0;
        }

        let term =
            Math.pow(
                x / 2,
                n
            ) /
            factorial(n);

        let sum = term;

        for (
            let index = 1;
            index < 160;
            index += 1
        ) {
            term *= -(
                x *
                x /
                4
            ) /
            (
                index *
                (
                    n +
                    index
                )
            );

            sum += term;

            if (
                Math.abs(term) <
                1e-14 *
                Math.max(
                    1,
                    Math.abs(sum)
                )
            ) {
                break;
            }
        }

        if (
            argument < 0 &&
            n % 2 === 1
        ) {
            return -sum;
        }

        return sum;
    }

    function classifyBeta(beta) {
        if (beta < 0.3) {
            return {
                title:
                    "NBFM clara",

                state:
                    "",

                description:
                    "El índice beta es mucho menor que uno y el espectro práctico se concentra cerca de la portadora."
            };
        }

        if (beta < 0.8) {
            return {
                title:
                    "Tendencia a NBFM",

                state:
                    "neutral",

                description:
                    "El índice es menor que uno, pero no extremadamente pequeño. Conviene usar Carson completo."
            };
        }

        if (beta <= 1.2) {
            return {
                title:
                    "Zona de transición",

                state:
                    "warning",

                description:
                    "Beta está cerca de uno. La frontera no es universal y no debe presentarse como una división exacta."
            };
        }

        if (beta <= 3) {
            return {
                title:
                    "Tendencia a WBFM",

                state:
                    "neutral",

                description:
                    "El índice es mayor que uno y aparecen más componentes laterales con nivel apreciable."
            };
        }

        return {
            title:
                "WBFM clara",

            state:
                "",

            description:
                "El índice beta es grande y la energía espectral se distribuye entre varias componentes laterales."
        };
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

        const deltaF =
            Number(
                frequencyDeviationInput.value
            ) *
            frequencyFactor(
                frequencyDeviationUnit.value
            );

        const valid =
            [
                fc,
                fm,
                deltaF
            ].every(Number.isFinite) &&
            fc > 0 &&
            fm > 0 &&
            deltaF >= 0;

        if (!valid) {
            return {
                valid: false
            };
        }

        const beta =
            deltaF /
            fm;

        const carsonBandwidth =
            2 *
            (
                deltaF +
                fm
            );

        const instantaneousMinimum =
            fc -
            deltaF;

        const instantaneousMaximum =
            fc +
            deltaF;

        const carsonMinimum =
            fc -
            carsonBandwidth /
            2;

        const carsonMaximum =
            fc +
            carsonBandwidth /
            2;

        const practicalOrder =
            Math.max(
                1,
                Math.floor(
                    beta +
                    1
                )
            );

        const classification =
            classifyBeta(beta);

        const carrierRatio =
            fc /
            fm;

        const visualCarrierRatio =
            Math.min(
                carrierRatio,
                maximumVisibleCarrierRatio
            );

        const visualBeta =
            Math.min(
                beta,
                maximumVisibleBeta
            );

        const displayOrder =
            Math.min(
                maximumDisplayedOrder,
                Math.max(
                    3,
                    practicalOrder +
                    2
                )
            );

        return {
            valid: true,
            fc,
            fm,
            deltaF,
            beta,
            carsonBandwidth,
            instantaneousMinimum,
            instantaneousMaximum,
            carsonMinimum,
            carsonMaximum,
            practicalOrder,
            classification,
            carrierRatio,

            visualCarrierFrequency:
                visualCarrierRatio *
                fm,

            visualBeta,

            carrierCompressed:
                carrierRatio >
                maximumVisibleCarrierRatio,

            betaCompressed:
                beta >
                maximumVisibleBeta,

            displayOrder,

            spectrumBeta:
                Math.min(
                    beta,
                    20
                ),

            duration:
                3 /
                fm
        };
    }

    function getCurrentInstant(data) {
        const progress =
            (
                elapsedTime *
                0.12
            ) %
            1;

        const time =
            progress *
            data.duration;

        const message =
            Math.cos(
                twoPi *
                data.fm *
                time
            );

        const instantaneousFrequency =
            data.fc +
            data.deltaF *
            message;

        return {
            progress,
            time,
            message,
            instantaneousFrequency
        };
    }

    function updateComponentTable(data) {
        const maximumRows =
            Math.min(
                5,
                data.displayOrder
            );

        const rows = [];

        rows.push(
            "<tr>" +
                "<td>Central</td>" +
                "<td colspan=\"2\">" +
                    formatFrequency(
                        data.fc
                    ) +
                "</td>" +
                "<td>" +
                    formatNumber(
                        Math.abs(
                            besselJ(
                                0,
                                data.spectrumBeta
                            )
                        ),
                        6
                    ) +
                "</td>" +
                "<td>Su amplitud depende de J₀(β); no siempre domina.</td>" +
            "</tr>"
        );

        for (
            let order = 1;
            order <= maximumRows;
            order += 1
        ) {
            const coefficient =
                Math.abs(
                    besselJ(
                        order,
                        data.spectrumBeta
                    )
                );

            const insideCarson =
                order *
                data.fm <=
                data.carsonBandwidth /
                2;

            rows.push(
                "<tr>" +
                    "<td>n = " +
                        order +
                    "</td>" +
                    "<td>" +
                        formatFrequency(
                            data.fc -
                            order *
                            data.fm
                        ) +
                    "</td>" +
                    "<td>" +
                        formatFrequency(
                            data.fc +
                            order *
                            data.fm
                        ) +
                    "</td>" +
                    "<td>" +
                        formatNumber(
                            coefficient,
                            6
                        ) +
                    "</td>" +
                    "<td>" +
                        (
                            insideCarson
                                ? "Dentro del intervalo estimado por Carson."
                                : "Fuera del intervalo práctico estimado; puede ser pequeña."
                        ) +
                    "</td>" +
                "</tr>"
            );
        }

        componentTableBody.innerHTML =
            rows.join("");
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
                "Las frecuencias deben ser positivas y la desviación no puede ser negativa.";

            stateTag.textContent =
                "Sin cálculo";

            return;
        }

        const classification =
            currentData.classification;

        stateBanner.className =
            "banner" +
            (
                classification.state
                    ? " " +
                        classification.state
                    : ""
            );

        stateTitle.textContent =
            classification.title;

        stateDescription.textContent =
            classification.description;

        stateTag.textContent =
            "β = " +
            formatNumber(
                currentData.beta,
                5
            );

        betaMetric.textContent =
            formatNumber(
                currentData.beta,
                7
            );

        classificationMetric.textContent =
            classification.title;

        carsonMetric.textContent =
            formatFrequency(
                currentData.carsonBandwidth
            );

        instantRangeMetric.textContent =
            formatFrequency(
                currentData.instantaneousMinimum
            ) +
            " a " +
            formatFrequency(
                currentData.instantaneousMaximum
            );

        carsonRangeMetric.textContent =
            formatFrequency(
                currentData.carsonMinimum
            ) +
            " a " +
            formatFrequency(
                currentData.carsonMaximum
            );

        spacingMetric.textContent =
            formatFrequency(
                currentData.fm
            );

        orderMetric.textContent =
            "≈ " +
            currentData.practicalOrder +
            (
                currentData.practicalOrder === 1
                    ? " par"
                    : " pares"
            );

        betaFormula.textContent =
            "β = Δf/fₘ = " +
            formatFrequency(
                currentData.deltaF
            ) +
            "/" +
            formatFrequency(
                currentData.fm
            ) +
            " = " +
            formatNumber(
                currentData.beta,
                7
            );

        carsonFormula.textContent =
            "B₍FM₎ ≈ 2(Δf + fₘ) = 2(" +
            formatFrequency(
                currentData.deltaF
            ) +
            " + " +
            formatFrequency(
                currentData.fm
            ) +
            ") = " +
            formatFrequency(
                currentData.carsonBandwidth
            );

        carsonBetaFormula.textContent =
            "B₍FM₎ ≈ 2fₘ(β + 1) = 2·" +
            formatFrequency(
                currentData.fm
            ) +
            "·(" +
            formatNumber(
                currentData.beta,
                5
            ) +
            " + 1) = " +
            formatFrequency(
                currentData.carsonBandwidth
            );

        instantRangeFormula.textContent =
            "fᵢ,min = fᶜ − Δf = " +
            formatFrequency(
                currentData.instantaneousMinimum
            ) +
            " · fᵢ,max = fᶜ + Δf = " +
            formatFrequency(
                currentData.instantaneousMaximum
            );

        lineLocationFormula.textContent =
            "fₙ = fᶜ ± n·fₘ · separación = " +
            formatFrequency(
                currentData.fm
            );

        besselFormula.textContent =
            "Central: AᶜJ₀(β) · laterales: AᶜJₙ(β) · dibujo normalizado y simplificado";

        updateComponentTable(
            currentData
        );

        const notes = [];

        notes.push(
            "La clasificación alrededor de β = 1 es orientativa; no existe una frontera universal exacta."
        );

        if (
            currentData.carrierCompressed
        ) {
            notes.push(
                "La frecuencia portadora temporal se comprimió visualmente para mostrar la variación de ciclos. Los valores numéricos conservan fᶜ real."
            );
        }

        if (
            currentData.betaCompressed
        ) {
            notes.push(
                "La profundidad visual de FM se limitó para evitar una curva ilegible; β real permanece en los cálculos y en el espectro."
            );
        }

        if (
            currentData.beta >
            20
        ) {
            notes.push(
                "Para β mayor que 20, las alturas del espectro usan β = 20 como límite gráfico; la clasificación y Carson conservan el valor real."
            );
        }

        if (
            currentData.displayOrder >=
            maximumDisplayedOrder
        ) {
            notes.push(
                "El Canvas limita la cantidad de órdenes dibujados; Carson puede abarcar más pares que los visibles."
            );
        }

        if (
            currentData.instantaneousMinimum <=
            0
        ) {
            notes.push(
                "Con los datos ingresados, la frecuencia instantánea alcanza cero o valores negativos; revise la relación entre fᶜ y Δf."
            );
        }

        notes.push(
            "Las alturas espectrales se normalizan y no deben leerse como voltajes absolutos."
        );

        notes.push(
            "Las ondas representan amplitud instantánea respecto al tiempo, no la trayectoria física de la energía."
        );

        technicalNote.innerHTML =
            "<strong>Advertencias técnicas:</strong> " +
            notes.join(" ");

        updateDynamicMetric();
    }

    function updateDynamicMetric() {
        if (
            !currentData ||
            !currentData.valid
        ) {
            instantFrequencyMetric.textContent =
                "—";

            return;
        }

        const instant =
            getCurrentInstant(
                currentData
            );

        instantFrequencyMetric.textContent =
            formatFrequency(
                instant.instantaneousFrequency
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

        frequencyDeviationInput.value =
            String(
                preset.deltaF
            );

        frequencyDeviationUnit.value =
            preset.deltaFUnit;

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
        carrierFrequencyInput.value =
            "100";

        carrierFrequencyUnit.value =
            "kHz";

        modulatingFrequencyInput.value =
            "10";

        modulatingFrequencyUnit.value =
            "kHz";

        frequencyDeviationInput.value =
            "2";

        frequencyDeviationUnit.value =
            "kHz";

        animationSpeed.value =
            "1";

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
                ? 1500
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

                lineNumber += 1;

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

        ctx.lineWidth =
            1;

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
            "FM temporal y ocupación espectral",
            24,
            31
        );

        ctx.fillStyle =
            "rgba(159, 181, 202, 0.83)";

        ctx.font =
            "500 10px Segoe UI, sans-serif";

        wrapText(
            "El cursor amarillo sincroniza la modulante, la frecuencia instantánea y la señal FM.",
            24,
            50,
            Math.max(
                190,
                viewWidth -
                440
            ),
            14,
            2
        );

        ctx.fillStyle =
            data.classification.state ===
            "warning"
                ? "#fbbf24"
                : "#38bdf8";

        ctx.font =
            "700 10px Consolas, monospace";

        ctx.textAlign =
            "right";

        ctx.fillText(
            "β = " +
            formatNumber(
                data.beta,
                4
            ) +
            " · Carson = " +
            formatFrequency(
                data.carsonBandwidth
            ),
            viewWidth -
            24,
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
                3
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
                3
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

    function timeValueToY(
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

    function drawTimeWave(
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
                valueFunction(
                    time
                );

            const x =
                plot.x +
                pixel;

            const y =
                timeValueToY(
                    value,
                    plot,
                    verticalMaximum
                );

            if (
                pixel === 0
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

    function drawTemporalPanel(
        panel,
        data
    ) {
        const messagePlot = {
            x:
                panel.x +
                62,

            y:
                panel.y +
                60,

            width:
                panel.width -
                84,

            height:
                panel.height *
                0.22
        };

        const frequencyPlot = {
            x:
                panel.x +
                62,

            y:
                messagePlot.y +
                messagePlot.height +
                41,

            width:
                panel.width -
                84,

            height:
                panel.height *
                0.22
        };

        const fmPlot = {
            x:
                panel.x +
                62,

            y:
                frequencyPlot.y +
                frequencyPlot.height +
                43,

            width:
                panel.width -
                84,

            height:
                panel.height -
                messagePlot.height -
                frequencyPlot.height -
                176
        };

        drawTimeGrid(
            messagePlot,
            1,
            data.duration,
            "rel."
        );

        const frequencyScale =
            Math.max(
                data.deltaF,
                data.fm *
                0.05,
                1e-12
            );

        drawTimeGrid(
            frequencyPlot,
            frequencyScale,
            data.duration,
            "Hz Δ"
        );

        drawTimeGrid(
            fmPlot,
            carrierAmplitude,
            data.duration,
            "V"
        );

        drawTimeWave(
            messagePlot,
            data.duration,

            function (time) {
                return Math.cos(
                    twoPi *
                    data.fm *
                    time
                );
            },

            1,
            "#38bdf8",
            2.2
        );

        drawTimeWave(
            frequencyPlot,
            data.duration,

            function (time) {
                return (
                    data.deltaF *
                    Math.cos(
                        twoPi *
                        data.fm *
                        time
                    )
                );
            },

            frequencyScale,
            "#fbbf24",
            2
        );

        drawTimeWave(
            fmPlot,
            data.duration,

            function (time) {
                return (
                    carrierAmplitude *
                    Math.cos(
                        twoPi *
                        data.visualCarrierFrequency *
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
            1.8
        );

        drawTimeWave(
            fmPlot,
            data.duration,

            function () {
                return carrierAmplitude;
            },

            carrierAmplitude,
            "rgba(52, 211, 153, 0.72)",
            1.2,
            true
        );

        drawTimeWave(
            fmPlot,
            data.duration,

            function () {
                return -carrierAmplitude;
            },

            carrierAmplitude,
            "rgba(52, 211, 153, 0.72)",
            1.2,
            true
        );

        const instant =
            getCurrentInstant(
                data
            );

        const plots = [
            messagePlot,
            frequencyPlot,
            fmPlot
        ];

        const values = [
            instant.message,

            instant.instantaneousFrequency -
            data.fc,

            carrierAmplitude *
            Math.cos(
                twoPi *
                data.visualCarrierFrequency *
                instant.time +
                data.visualBeta *
                Math.sin(
                    twoPi *
                    data.fm *
                    instant.time
                )
            )
        ];

        const maxima = [
            1,
            frequencyScale,
            carrierAmplitude
        ];

        ctx.save();

        plots.forEach(
            function (
                plot,
                index
            ) {
                const x =
                    plot.x +
                    plot.width *
                    instant.progress;

                const y =
                    timeValueToY(
                        values[index],
                        plot,
                        maxima[index]
                    );

                ctx.strokeStyle =
                    "rgba(251, 191, 36, 0.82)";

                ctx.lineWidth =
                    1.2;

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
                    twoPi
                );

                ctx.fill();

                ctx.shadowBlur =
                    0;
            }
        );

        ctx.fillStyle =
            "rgba(199, 220, 235, 0.80)";

        ctx.font =
            "700 8px Segoe UI, sans-serif";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "MODULANTE NORMALIZADA",
            messagePlot.x,
            messagePlot.y -
            10
        );

        ctx.fillText(
            "DESVIACIÓN INSTANTÁNEA fᵢ − fᶜ",
            frequencyPlot.x,
            frequencyPlot.y -
            10
        );

        ctx.fillText(
            "SEÑAL FM · AMPLITUD IDEAL CONSTANTE",
            fmPlot.x,
            fmPlot.y -
            10
        );

        ctx.fillStyle =
            "#fde68a";

        ctx.textAlign =
            instant.progress >
            0.82
                ? "right"
                : "left";

        ctx.fillText(
            "fᵢ = " +
            formatFrequency(
                instant.instantaneousFrequency
            ),
            messagePlot.x +
            messagePlot.width *
            instant.progress +
            (
                instant.progress >
                0.82
                    ? -6
                    : 6
            ),
            messagePlot.y +
            11
        );

        ctx.restore();
    }

    function frequencyToX(
        frequency,
        plot,
        minimum,
        maximum
    ) {
        return (
            plot.x +
            (
                frequency -
                minimum
            ) /
            (
                maximum -
                minimum
            ) *
            plot.width
        );
    }

    function drawSpectrumGrid(
        plot,
        minimum,
        maximum
    ) {
        const baseline =
            plot.y +
            plot.height;

        ctx.save();

        ctx.strokeStyle =
            "rgba(125, 211, 252, 0.08)";

        ctx.lineWidth =
            1;

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
                baseline
            );

            ctx.stroke();

            const frequency =
                minimum +
                (
                    maximum -
                    minimum
                ) *
                index /
                6;

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.74)";

            ctx.font =
                "600 7.5px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                formatFrequency(
                    frequency
                ),
                x,
                baseline +
                20
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

        ctx.lineWidth =
            1.4;

        ctx.beginPath();

        ctx.moveTo(
            plot.x,
            baseline
        );

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

        ctx.textAlign =
            "left";

        ctx.fillText(
            "Amplitud relativa normalizada",
            plot.x,
            plot.y -
            10
        );

        ctx.textAlign =
            "right";

        ctx.fillText(
            "Frecuencia",
            plot.x +
            plot.width,
            baseline +
            40
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
        faded,
        negativeCoefficient,
        displayFrequency = true
    ) {
        ctx.save();

        const pulse =
            1 +
            0.025 *
            Math.sin(
                elapsedTime *
                3.5 +
                x *
                0.013
            );

        const displayedHeight =
            Math.max(
                3,
                height *
                pulse
            );

        ctx.globalAlpha =
            faded
                ? 0.25
                : 1;

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            faded
                ? 1.7
                : 3.6;

        ctx.setLineDash(
            faded
                ? [
                    5,
                    5
                ]
                : []
        );

        ctx.shadowBlur =
            faded
                ? 0
                : 10;

        ctx.shadowColor =
            color;

        ctx.beginPath();

        ctx.moveTo(
            x,
            baseline
        );

        ctx.lineTo(
            x,
            baseline -
            displayedHeight
        );

        ctx.stroke();

        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        if (
            negativeCoefficient &&
            !faded
        ) {
            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.moveTo(
                x,
                baseline -
                displayedHeight -
                2
            );

            ctx.lineTo(
                x -
                4,
                baseline -
                displayedHeight -
                8
            );

            ctx.lineTo(
                x +
                4,
                baseline -
                displayedHeight -
                8
            );

            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle =
            color;

        ctx.font =
            "700 7.5px Segoe UI, sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            label,
            x,
            baseline -
            displayedHeight -
            12
        );

        if (
            !faded &&
            displayFrequency
        ) {
            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 7px Segoe UI, sans-serif";

            ctx.fillText(
                formatFrequency(
                    frequency
                ),
                x,
                baseline +
                33
            );
        }

        ctx.restore();
    }

    function drawCarsonBracket(
        plot,
        minimum,
        maximum,
        lower,
        upper,
        bandwidth
    ) {
        const baseline =
            plot.y +
            plot.height;

        const x1 =
            frequencyToX(
                lower,
                plot,
                minimum,
                maximum
            );

        const x2 =
            frequencyToX(
                upper,
                plot,
                minimum,
                maximum
            );

        const y =
            baseline +
            58;

        ctx.save();

        ctx.strokeStyle =
            "#fbbf24";

        ctx.lineWidth =
            1.5;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y - 6);
        ctx.lineTo(x1, y + 6);
        ctx.moveTo(x2, y - 6);
        ctx.lineTo(x2, y + 6);
        ctx.stroke();

        ctx.fillStyle =
            "#fde68a";

        ctx.font =
            "700 8px Segoe UI, sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Carson ≈ " +
            formatFrequency(
                bandwidth
            ),
            (
                x1 +
                x2
            ) /
            2,
            y -
            8
        );

        ctx.restore();
    }

    function drawSpectrumPanel(
        panel,
        data
    ) {
        const outerOrder =
            data.displayOrder;

        const marginOrders =
            0.7;

        const minimum =
            data.fc -
            (
                outerOrder +
                marginOrders
            ) *
            data.fm;

        const maximum =
            data.fc +
            (
                outerOrder +
                marginOrders
            ) *
            data.fm;

        const plot = {
            x:
                panel.x +
                32,

            y:
                panel.y +
                70,

            width:
                panel.width -
                64,

            height:
                panel.height -
                165
        };

        drawSpectrumGrid(
            plot,
            minimum,
            maximum
        );

        const coefficients = [];

        for (
            let order = 0;
            order <= outerOrder;
            order += 1
        ) {
            coefficients.push(
                besselJ(
                    order,
                    data.spectrumBeta
                )
            );
        }

        const maximumCoefficient =
            Math.max(
                1e-9,
                ...coefficients.map(
                    function (value) {
                        return Math.abs(
                            value
                        );
                    }
                )
            );

        const baseline =
            plot.y +
            plot.height;

        const maximumHeight =
            plot.height *
            0.84;

        for (
            let order = 0;
            order <= outerOrder;
            order += 1
        ) {
            const coefficient =
                coefficients[order];

            const normalizedHeight =
                Math.abs(
                    coefficient
                ) /
                maximumCoefficient *
                maximumHeight;

            const offset =
                order *
                data.fm;

            const insideCarson =
                offset <=
                data.carsonBandwidth /
                2 +
                1e-9;

            if (
                order === 0
            ) {
                const x =
                    frequencyToX(
                        data.fc,
                        plot,
                        minimum,
                        maximum
                    );

                drawSpectrumLine(
                    x,
                    baseline,
                    normalizedHeight,
                    "#c084fc",
                    "fᶜ",
                    data.fc,
                    false,
                    coefficient < 0,
                    true
                );
            } else {
                const lowerFrequency =
                    data.fc -
                    offset;

                const upperFrequency =
                    data.fc +
                    offset;

                const lowerX =
                    frequencyToX(
                        lowerFrequency,
                        plot,
                        minimum,
                        maximum
                    );

                const upperX =
                    frequencyToX(
                        upperFrequency,
                        plot,
                        minimum,
                        maximum
                    );

                drawSpectrumLine(
                    lowerX,
                    baseline,
                    normalizedHeight,
                    "#38bdf8",
                    "−" +
                    order,
                    lowerFrequency,
                    !insideCarson,
                    coefficient < 0,
                    viewWidth >= 720 ||
                    order <= 1
                );

                drawSpectrumLine(
                    upperX,
                    baseline,
                    normalizedHeight,
                    "#34d399",
                    "+" +
                    order,
                    upperFrequency,
                    !insideCarson,
                    coefficient < 0,
                    viewWidth >= 720 ||
                    order <= 1
                );
            }
        }

        const carrierX =
            frequencyToX(
                data.fc,
                plot,
                minimum,
                maximum
            );

        ctx.save();

        ctx.strokeStyle =
            "rgba(192, 132, 252, 0.50)";

        ctx.lineWidth =
            1;

        ctx.setLineDash(
            [
                4,
                4
            ]
        );

        ctx.beginPath();

        ctx.moveTo(
            carrierX,
            plot.y
        );

        ctx.lineTo(
            carrierX,
            baseline
        );

        ctx.stroke();
        ctx.restore();

        drawCarsonBracket(
            plot,
            minimum,
            maximum,
            data.carsonMinimum,
            data.carsonMaximum,
            data.carsonBandwidth
        );

        ctx.save();

        ctx.fillStyle =
            "rgba(199, 220, 235, 0.78)";

        ctx.font =
            "600 8px Segoe UI, sans-serif";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "Líneas separadas por fₘ = " +
            formatFrequency(
                data.fm
            ),
            plot.x,
            panel.y +
            panel.height -
            22
        );

        ctx.textAlign =
            "right";

        ctx.fillText(
            "Triángulo superior: coeficiente Jₙ negativo",
            plot.x +
            plot.width,
            panel.y +
            panel.height -
            22
        );

        ctx.restore();
    }

    function drawMiniSpectrum(
        plot,
        beta,
        title,
        color
    ) {
        const displayOrder =
            beta < 1
                ? 3
                : 8;

        const coefficients = [];

        for (
            let order = 0;
            order <= displayOrder;
            order += 1
        ) {
            coefficients.push(
                besselJ(
                    order,
                    beta
                )
            );
        }

        const maximumCoefficient =
            Math.max(
                1e-9,
                ...coefficients.map(
                    function (value) {
                        return Math.abs(
                            value
                        );
                    }
                )
            );

        ctx.save();

        roundedRectanglePath(
            plot.x,
            plot.y,
            plot.width,
            plot.height,
            10
        );

        ctx.fillStyle =
            "rgba(17, 40, 65, 0.46)";

        ctx.fill();

        ctx.strokeStyle =
            "rgba(125, 211, 252, 0.12)";

        ctx.stroke();

        ctx.fillStyle =
            color;

        ctx.font =
            "700 9px Segoe UI, sans-serif";

        ctx.textAlign =
            "left";

        ctx.fillText(
            title,
            plot.x +
            12,
            plot.y +
            20
        );

        ctx.fillStyle =
            "rgba(199, 220, 235, 0.72)";

        ctx.font =
            "600 7.5px Segoe UI, sans-serif";

        ctx.fillText(
            "β = " +
            formatNumber(
                beta,
                2
            ),
            plot.x +
            12,
            plot.y +
            34
        );

        const baseline =
            plot.y +
            plot.height -
            28;

        const centerX =
            plot.x +
            plot.width /
            2;

        const spacing =
            plot.width /
            (
                2 *
                displayOrder +
                3
            );

        ctx.strokeStyle =
            "rgba(186, 230, 253, 0.36)";

        ctx.beginPath();

        ctx.moveTo(
            plot.x +
            12,
            baseline
        );

        ctx.lineTo(
            plot.x +
            plot.width -
            12,
            baseline
        );

        ctx.stroke();

        for (
            let order = 0;
            order <= displayOrder;
            order += 1
        ) {
            const height =
                Math.abs(
                    coefficients[order]
                ) /
                maximumCoefficient *
                (
                    plot.height -
                    72
                );

            const faded =
                Math.abs(
                    coefficients[order]
                ) <
                0.03;

            if (
                order === 0
            ) {
                drawSpectrumLine(
                    centerX,
                    baseline,
                    height,
                    "#c084fc",
                    "0",
                    0,
                    faded,
                    coefficients[order] < 0,
                    false
                );
            } else {
                drawSpectrumLine(
                    centerX -
                    order *
                    spacing,
                    baseline,
                    height,
                    "#38bdf8",
                    "−" +
                    order,
                    -order,
                    faded,
                    coefficients[order] < 0,
                    false
                );

                drawSpectrumLine(
                    centerX +
                    order *
                    spacing,
                    baseline,
                    height,
                    "#34d399",
                    "+" +
                    order,
                    order,
                    faded,
                    coefficients[order] < 0,
                    false
                );
            }
        }

        ctx.fillStyle =
            "rgba(159, 181, 202, 0.70)";

        ctx.font =
            "600 7px Segoe UI, sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            beta < 1
                ? "Pocas líneas con nivel apreciable"
                : "Más líneas con nivel apreciable",
            centerX,
            plot.y +
            plot.height -
            9
        );

        ctx.restore();
    }

    function drawComparisonPanel(
        panel
    ) {
        const mobile =
            viewWidth <
            720;

        if (mobile) {
            const first = {
                x:
                    panel.x +
                    16,

                y:
                    panel.y +
                    50,

                width:
                    panel.width -
                    32,

                height:
                    (
                        panel.height -
                        116
                    ) /
                    2
            };

            const second = {
                x:
                    panel.x +
                    16,

                y:
                    first.y +
                    first.height +
                    16,

                width:
                    panel.width -
                    32,

                height:
                    first.height
            };

            drawMiniSpectrum(
                first,
                0.2,
                "NBFM clara",
                "#38bdf8"
            );

            drawMiniSpectrum(
                second,
                5,
                "WBFM clara",
                "#fb923c"
            );
        } else {
            const gap =
                16;

            const width =
                (
                    panel.width -
                    48 -
                    gap
                ) /
                2;

            const first = {
                x:
                    panel.x +
                    16,

                y:
                    panel.y +
                    48,

                width,

                height:
                    panel.height -
                    64
            };

            const second = {
                x:
                    first.x +
                    width +
                    gap,

                y:
                    first.y,

                width,

                height:
                    first.height
            };

            drawMiniSpectrum(
                first,
                0.2,
                "NBFM clara",
                "#38bdf8"
            );

            drawMiniSpectrum(
                second,
                5,
                "WBFM clara",
                "#fb923c"
            );
        }
    }

    function drawMainPanels(
        data
    ) {
        const mobile =
            viewWidth <
            720;

        let timePanel;
        let spectrumPanel;
        let comparisonPanel;

        if (mobile) {
            timePanel = {
                x: 14,
                y: 78,

                width:
                    viewWidth -
                    28,

                height:
                    580
            };

            spectrumPanel = {
                x: 14,
                y: 674,

                width:
                    viewWidth -
                    28,

                height:
                    430
            };

            comparisonPanel = {
                x: 14,
                y: 1120,

                width:
                    viewWidth -
                    28,

                height:
                    330
            };
        } else {
            timePanel = {
                x: 20,
                y: 78,

                width:
                    viewWidth *
                    0.54 -
                    28,

                height:
                    565
            };

            spectrumPanel = {
                x:
                    timePanel.x +
                    timePanel.width +
                    16,

                y:
                    78,

                width:
                    viewWidth -
                    timePanel.width -
                    56,

                height:
                    565
            };

            comparisonPanel = {
                x:
                    20,

                y:
                    659,

                width:
                    viewWidth -
                    40,

                height:
                    220
            };
        }

        drawPanel(
            timePanel,
            "DOMINIO DEL TIEMPO",
            "#c084fc",
            "amplitud FM constante; cambia la separación de ciclos"
        );

        drawPanel(
            spectrumPanel,
            "ESPECTRO FM SIMPLIFICADO",
            "#38bdf8",
            "fᶜ ± n·fₘ · alturas normalizadas"
        );

        drawPanel(
            comparisonPanel,
            "COMPARACIÓN NORMALIZADA NBFM Y WBFM",
            "#fbbf24",
            "misma escala conceptual de órdenes laterales"
        );

        drawTemporalPanel(
            timePanel,
            data
        );

        drawSpectrumPanel(
            spectrumPanel,
            data
        );

        drawComparisonPanel(
            comparisonPanel
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
            "Revise la frecuencia portadora, la frecuencia modulante y la desviación máxima.",
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
            "Espectro educativo y simplificado · Carson es una estimación práctica · no se incluyen VCO ni PLL.",
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

        drawCanvasHeader(
            currentData
        );

        drawMainPanels(
            currentData
        );

        drawFooter();
        updateDynamicMetric();
    }

    function animate(
        currentTime
    ) {
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
        frequencyDeviationInput,
        frequencyDeviationUnit,
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

            animate(
                time
            );
        }
    );
