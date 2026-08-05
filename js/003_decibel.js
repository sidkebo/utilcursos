    "use strict";

    /*
     * SIT-400 — Clase 3
     * El decibel en sistemas de telecomunicaciones.
     *
     * Alcance:
     * - Relación de potencia.
     * - Relación de tensión.
     * - Relación de corriente.
     * - Conversiones W ↔ dBW y W ↔ dBm.
     * - No incluye cascadas ni referencias de tensión.
     */

    const canvas =
        document.getElementById("simulationCanvas");

    const canvasContainer =
        document.getElementById("canvasContainer");

    const ctx =
        canvas.getContext("2d");

    const modeButtons =
        Array.from(
            document.querySelectorAll(".mode-button")
        );

    const exampleButtons =
        Array.from(
            document.querySelectorAll(".example-button")
        );

    const converterExamples =
        Array.from(
            document.querySelectorAll(".converter-example")
        );

    const canvasTitle =
        document.getElementById("canvasTitle");

    const simulationStatus =
        document.getElementById("simulationStatus");

    const value1Input =
        document.getElementById("value1Input");

    const value2Input =
        document.getElementById("value2Input");

    const unit1Select =
        document.getElementById("unit1Select");

    const unit2Select =
        document.getElementById("unit2Select");

    const value1Label =
        document.getElementById("value1Label");

    const value2Label =
        document.getElementById("value2Label");

    const animationSpeed =
        document.getElementById("animationSpeed");

    const animationSpeedDisplay =
        document.getElementById("animationSpeedDisplay");

    const swapButton =
        document.getElementById("swapButton");

    const conditionalControls =
        document.getElementById("conditionalControls");

    const measurementType =
        document.getElementById("measurementType");

    const impedanceCondition =
        document.getElementById("impedanceCondition");

    const ratioMetric =
        document.getElementById("ratioMetric");

    const dbMetric =
        document.getElementById("dbMetric");

    const interpretationMetric =
        document.getElementById("interpretationMetric");

    const factorMetric =
        document.getElementById("factorMetric");

    const formulaDisplay =
        document.getElementById("formulaDisplay");

    const substitutionDisplay =
        document.getElementById("substitutionDisplay");

    const resultDisplay =
        document.getElementById("resultDisplay");

    const validationMessage =
        document.getElementById("validationMessage");

    const converterType =
        document.getElementById("converterType");

    const converterInput =
        document.getElementById("converterInput");

    const converterInputLabel =
        document.getElementById("converterInputLabel");

    const converterOutput =
        document.getElementById("converterOutput");

    const converterFormula =
        document.getElementById("converterFormula");

    const pauseButton =
        document.getElementById("pauseButton");

    const continueButton =
        document.getElementById("continueButton");

    const restartButton =
        document.getElementById("restartButton");

    const explanation =
        document.getElementById("explanation");

    const technicalNote =
        document.getElementById("technicalNote");

    const modes = {
        power: {
            title: "Relación de potencia",
            canvasTitle:
                "Escala lineal y escala logarítmica de potencia",
            symbol: "P",
            firstName: "Potencia inicial P1",
            secondName: "Potencia final P2",
            factor: 10,
            color: "#38bdf8",
            rgb: "56, 189, 248",
            units: [
                {
                    label: "W",
                    factor: 1
                },
                {
                    label: "mW",
                    factor: 1e-3
                },
                {
                    label: "µW",
                    factor: 1e-6
                },
                {
                    label: "nW",
                    factor: 1e-9
                }
            ],
            defaultUnit: "W",
            baseUnit: "W",
            formula:
                "dB = 10 × log10(P2 / P1)"
        },

        voltage: {
            title: "Relación de tensión",
            canvasTitle:
                "Escala lineal y escala logarítmica de tensión",
            symbol: "V",
            firstName: "Tensión de referencia V1",
            secondName: "Tensión comparada V2",
            factor: 20,
            color: "#34d399",
            rgb: "52, 211, 153",
            units: [
                {
                    label: "V",
                    factor: 1
                },
                {
                    label: "mV",
                    factor: 1e-3
                },
                {
                    label: "µV",
                    factor: 1e-6
                }
            ],
            defaultUnit: "V",
            baseUnit: "V",
            formula:
                "dB = 20 × log10(V2 / V1)"
        },

        current: {
            title: "Relación de corriente",
            canvasTitle:
                "Escala lineal y escala logarítmica de corriente",
            symbol: "I",
            firstName: "Corriente de referencia I1",
            secondName: "Corriente comparada I2",
            factor: 20,
            color: "#c084fc",
            rgb: "192, 132, 252",
            units: [
                {
                    label: "A",
                    factor: 1
                },
                {
                    label: "mA",
                    factor: 1e-3
                },
                {
                    label: "µA",
                    factor: 1e-6
                }
            ],
            defaultUnit: "mA",
            baseUnit: "A",
            formula:
                "dB = 20 × log10(I2 / I1)"
        }
    };

    const examples = {
        powerUp: {
            mode: "power",
            value1: 1,
            unit1: "W",
            value2: 10,
            unit2: "W"
        },

        powerDown: {
            mode: "power",
            value1: 10,
            unit1: "W",
            value2: 1,
            unit2: "W"
        },

        voltageDouble: {
            mode: "voltage",
            value1: 1,
            unit1: "V",
            value2: 2,
            unit2: "V"
        },

        currentDown: {
            mode: "current",
            value1: 20,
            unit1: "mA",
            value2: 2,
            unit2: "mA"
        },

        equal: {
            mode: "power",
            value1: 5,
            unit1: "W",
            value2: 5,
            unit2: "W"
        }
    };

    let currentMode = "power";
    let elapsedTime = 0;
    let lastFrameTime = performance.now();
    let isPaused = false;

    let viewWidth = 1000;
    let viewHeight = 590;
    let pixelRatio = 1;

    modeButtons.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    setMode(
                        button.dataset.mode,
                        true
                    );
                }
            );
        }
    );

    [
        value1Input,
        value2Input,
        unit1Select,
        unit2Select,
        measurementType,
        impedanceCondition
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

    animationSpeed.addEventListener(
        "input",
        function () {
            updateSpeedDisplay();
        }
    );

    swapButton.addEventListener(
        "click",
        swapValues
    );

    exampleButtons.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    applyExample(
                        button.dataset.example
                    );
                }
            );
        }
    );

    converterType.addEventListener(
        "change",
        updateConverter
    );

    converterInput.addEventListener(
        "input",
        updateConverter
    );

    converterExamples.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    applyConverterExample(
                        button.dataset.converter
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

    function formatNumber(
        value,
        maximumDecimals = 3
    ) {
        if (!Number.isFinite(value)) {
            return "—";
        }

        const absolute =
            Math.abs(value);

        if (
            absolute !== 0 &&
            (
                absolute >= 1e6 ||
                absolute < 1e-4
            )
        ) {
            return value
                .toExponential(3)
                .replace(".", ",");
        }

        return new Intl.NumberFormat(
            "es-BO",
            {
                maximumFractionDigits:
                    maximumDecimals
            }
        ).format(value);
    }

    function formatSignedDb(value) {
        if (!Number.isFinite(value)) {
            return "—";
        }

        const prefix =
            value > 0.0005
                ? "+"
                : "";

        return (
            prefix +
            value
                .toFixed(2)
                .replace(".", ",") +
            " dB"
        );
    }

    function clamp(
        value,
        minimum,
        maximum
    ) {
        return Math.min(
            maximum,
            Math.max(
                minimum,
                value
            )
        );
    }

    function getModeData() {
        return modes[currentMode];
    }

    function getUnitFactor(
        mode,
        unitLabel
    ) {
        const unit =
            modes[mode].units.find(
                function (item) {
                    return (
                        item.label ===
                        unitLabel
                    );
                }
            );

        return unit
            ? unit.factor
            : 1;
    }

    function setUnitOptions(
        select,
        mode,
        selectedLabel
    ) {
        select.innerHTML = "";

        modes[mode].units.forEach(
            function (unit) {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    unit.label;

                option.textContent =
                    unit.label;

                select.appendChild(
                    option
                );
            }
        );

        const exists =
            modes[mode].units.some(
                function (unit) {
                    return (
                        unit.label ===
                        selectedLabel
                    );
                }
            );

        select.value =
            exists
                ? selectedLabel
                : modes[mode].defaultUnit;
    }

    function setMode(
        mode,
        resetValues
    ) {
        currentMode = mode;

        const data =
            getModeData();

        document.documentElement
            .style
            .setProperty(
                "--active",
                data.color
            );

        document.documentElement
            .style
            .setProperty(
                "--active-rgb",
                data.rgb
            );

        modeButtons.forEach(
            function (button) {
                const active =
                    button.dataset.mode ===
                    mode;

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

        setUnitOptions(
            unit1Select,
            mode,
            data.defaultUnit
        );

        setUnitOptions(
            unit2Select,
            mode,
            data.defaultUnit
        );

        value1Label.textContent =
            data.firstName;

        value2Label.textContent =
            data.secondName;

        canvasTitle.textContent =
            data.canvasTitle;

        conditionalControls.hidden =
            mode === "power";

        if (resetValues) {
            if (mode === "power") {
                value1Input.value = "1";
                value2Input.value = "10";
                unit1Select.value = "W";
                unit2Select.value = "W";
            }

            if (mode === "voltage") {
                value1Input.value = "1";
                value2Input.value = "2";
                unit1Select.value = "V";
                unit2Select.value = "V";
            }

            if (mode === "current") {
                value1Input.value = "20";
                value2Input.value = "2";
                unit1Select.value = "mA";
                unit2Select.value = "mA";
            }
        }

        updateExplanations();
        updateInterface();
    }

    function updateExplanations() {
        if (currentMode === "power") {
            explanation.innerHTML =
                "<strong>Relación de potencia:</strong> " +
                "se utiliza el factor 10 porque se comparan " +
                "directamente dos potencias. Las dos potencias deben " +
                "estar expresadas en la misma unidad antes de dividir.";

            technicalNote.innerHTML =
                "<strong>Nota didáctica:</strong> las barras representan " +
                "niveles relativos. La escala logarítmica no altera " +
                "físicamente la señal; solamente expresa de forma compacta " +
                "la relación P2/P1. Un dB negativo no significa potencia " +
                "física negativa.";
        }

        if (currentMode === "voltage") {
            explanation.innerHTML =
                "<strong>Relación de tensión:</strong> se utiliza el " +
                "factor 20. Deben compararse tensiones del mismo tipo: " +
                "RMS con RMS, pico con pico o pico a pico con pico a pico.";

            technicalNote.innerHTML =
                "<strong>Condición de impedancia:</strong> la fórmula " +
                "20 × log10(V2/V1) expresa correctamente una relación de " +
                "tensión. Para afirmar que representa también el mismo " +
                "cambio relativo de potencia, las impedancias deben ser " +
                "iguales.";
        }

        if (currentMode === "current") {
            explanation.innerHTML =
                "<strong>Relación de corriente:</strong> se utiliza el " +
                "factor 20 porque la potencia depende del cuadrado de la " +
                "corriente en una carga resistiva.";

            technicalNote.innerHTML =
                "<strong>Condición de impedancia:</strong> la fórmula " +
                "20 × log10(I2/I1) expresa una relación de corriente. " +
                "Su interpretación como relación equivalente de potencia " +
                "requiere condiciones de resistencia o impedancia iguales.";
        }
    }

    function getCalculation() {
        const data =
            getModeData();

        const rawValue1 =
            Number(
                value1Input.value
            );

        const rawValue2 =
            Number(
                value2Input.value
            );

        const factor1 =
            getUnitFactor(
                currentMode,
                unit1Select.value
            );

        const factor2 =
            getUnitFactor(
                currentMode,
                unit2Select.value
            );

        const baseValue1 =
            rawValue1 * factor1;

        const baseValue2 =
            rawValue2 * factor2;

        const valid =
            Number.isFinite(
                baseValue1
            ) &&
            Number.isFinite(
                baseValue2
            ) &&
            baseValue1 > 0 &&
            baseValue2 > 0;

        if (!valid) {
            return {
                valid: false,
                data,
                rawValue1,
                rawValue2,
                baseValue1,
                baseValue2,
                ratio: NaN,
                db: NaN
            };
        }

        const ratio =
            baseValue2 /
            baseValue1;

        const db =
            data.factor *
            Math.log10(
                ratio
            );

        return {
            valid: true,
            data,
            rawValue1,
            rawValue2,
            baseValue1,
            baseValue2,
            ratio,
            db
        };
    }

    function getInterpretation(db) {
        if (!Number.isFinite(db)) {
            return "Valores no válidos";
        }

        if (Math.abs(db) < 0.0005) {
            return "Igualdad entre valores";
        }

        return db > 0
            ? "Aumento relativo"
            : "Disminución relativa";
    }

    function getRatioDescription(ratio) {
        if (!Number.isFinite(ratio)) {
            return "—";
        }

        if (
            Math.abs(
                ratio - 1
            ) < 1e-12
        ) {
            return "1 vez";
        }

        if (ratio > 1) {
            return (
                formatNumber(
                    ratio,
                    4
                ) +
                " veces"
            );
        }

        return (
            formatNumber(
                ratio,
                5
            ) +
            " del valor inicial"
        );
    }

    function updateInterface() {
        const calculation =
            getCalculation();

        const data =
            calculation.data;

        formulaDisplay.textContent =
            data.formula;

        factorMetric.textContent =
            String(
                data.factor
            );

        if (!calculation.valid) {
            validationMessage.textContent =
                "Los dos valores deben ser números positivos mayores que cero.";

            ratioMetric.textContent = "—";
            dbMetric.textContent = "—";
            interpretationMetric.textContent =
                "Entrada inválida";

            substitutionDisplay.textContent =
                "No es posible calcular el logaritmo con valores nulos o negativos.";

            resultDisplay.textContent =
                "Revise los valores introducidos.";

            return;
        }

        validationMessage.textContent = "";

        ratioMetric.textContent =
            getRatioDescription(
                calculation.ratio
            );

        dbMetric.textContent =
            formatSignedDb(
                calculation.db
            );

        interpretationMetric.textContent =
            getInterpretation(
                calculation.db
            );

        substitutionDisplay.textContent =
            "dB = " +
            data.factor +
            " × log10(" +
            formatNumber(
                calculation.baseValue2,
                6
            ) +
            " " +
            data.baseUnit +
            " / " +
            formatNumber(
                calculation.baseValue1,
                6
            ) +
            " " +
            data.baseUnit +
            ")";

        resultDisplay.textContent =
            formatSignedDb(
                calculation.db
            ) +
            " · " +
            getInterpretation(
                calculation.db
            ).toLowerCase();

        updateImpedanceMessage(
            calculation
        );
    }

    function updateImpedanceMessage(
        calculation
    ) {
        if (currentMode === "power") {
            return;
        }

        const condition =
            impedanceCondition.value;

        const measurement =
            measurementType.options[
                measurementType.selectedIndex
            ].text;

        if (condition === "equal") {
            technicalNote.innerHTML =
                "<strong>Medición seleccionada:</strong> " +
                measurement +
                ". Las impedancias se declararon iguales, por lo que el " +
                "resultado puede relacionarse con un cambio equivalente " +
                "de potencia bajo esa condición.";
        }

        if (condition === "unknown") {
            technicalNote.innerHTML =
                "<strong>Precaución técnica:</strong> " +
                measurement +
                ". La relación de " +
                (
                    currentMode === "voltage"
                        ? "tensión"
                        : "corriente"
                ) +
                " es válida, pero no debe interpretarse directamente " +
                "como relación de potencia porque las impedancias son " +
                "desconocidas.";
        }

        if (condition === "different") {
            technicalNote.innerHTML =
                "<strong>Precaución técnica:</strong> " +
                measurement +
                ". Con impedancias diferentes, el resultado expresa una " +
                "relación de " +
                (
                    currentMode === "voltage"
                        ? "tensión"
                        : "corriente"
                ) +
                ", pero no determina por sí solo la relación de potencia.";
        }
    }

    function updateSpeedDisplay() {
        animationSpeedDisplay.textContent =
            Number(
                animationSpeed.value
            )
                .toFixed(1)
                .replace(".", ",") +
            "×";
    }

    function swapValues() {
        const value1 =
            value1Input.value;

        const unit1 =
            unit1Select.value;

        value1Input.value =
            value2Input.value;

        unit1Select.value =
            unit2Select.value;

        value2Input.value =
            value1;

        unit2Select.value =
            unit1;

        elapsedTime = 0;
        updateInterface();
    }

    function applyExample(key) {
        const example =
            examples[key];

        if (!example) {
            return;
        }

        setMode(
            example.mode,
            false
        );

        value1Input.value =
            String(
                example.value1
            );

        value2Input.value =
            String(
                example.value2
            );

        unit1Select.value =
            example.unit1;

        unit2Select.value =
            example.unit2;

        elapsedTime = 0;
        updateInterface();
    }

    function updateConverter() {
        const type =
            converterType.value;

        const input =
            Number(
                converterInput.value
            );

        if (!Number.isFinite(input)) {
            converterOutput.textContent =
                "Introduce un valor numérico.";

            converterFormula.textContent =
                "No es posible realizar la conversión.";

            return;
        }

        if (type === "wToDbw") {
            converterInputLabel.textContent =
                "Potencia en W";

            converterFormula.textContent =
                "dBW = 10 × log10(P en W)";

            if (input <= 0) {
                converterOutput.textContent =
                    "La potencia debe ser mayor que cero.";

                return;
            }

            const result =
                10 *
                Math.log10(
                    input
                );

            converterOutput.textContent =
                formatNumber(
                    input,
                    6
                ) +
                " W = " +
                formatNumber(
                    result,
                    3
                ) +
                " dBW";
        }

        if (type === "dbwToW") {
            converterInputLabel.textContent =
                "Nivel en dBW";

            converterFormula.textContent =
                "P(W) = 10^(dBW / 10)";

            const result =
                Math.pow(
                    10,
                    input / 10
                );

            converterOutput.textContent =
                formatNumber(
                    input,
                    3
                ) +
                " dBW = " +
                formatNumber(
                    result,
                    8
                ) +
                " W";
        }

        if (type === "wToDbm") {
            converterInputLabel.textContent =
                "Potencia en W";

            converterFormula.textContent =
                "dBm = 10 × log10(P en W × 1000 mW/W)";

            if (input <= 0) {
                converterOutput.textContent =
                    "La potencia debe ser mayor que cero.";

                return;
            }

            const powerMilliwatts =
                input * 1000;

            const result =
                10 *
                Math.log10(
                    powerMilliwatts
                );

            converterOutput.textContent =
                formatNumber(
                    input,
                    8
                ) +
                " W = " +
                formatNumber(
                    result,
                    3
                ) +
                " dBm";
        }

        if (type === "dbmToW") {
            converterInputLabel.textContent =
                "Nivel en dBm";

            converterFormula.textContent =
                "P(mW) = 10^(dBm / 10)  |  P(W) = P(mW) / 1000";

            const milliWatts =
                Math.pow(
                    10,
                    input / 10
                );

            const watts =
                milliWatts / 1000;

            converterOutput.textContent =
                formatNumber(
                    input,
                    3
                ) +
                " dBm = " +
                formatNumber(
                    milliWatts,
                    8
                ) +
                " mW = " +
                formatNumber(
                    watts,
                    10
                ) +
                " W";
        }
    }

    function applyConverterExample(key) {
        if (key === "10wDbw") {
            converterType.value =
                "wToDbw";

            converterInput.value =
                "10";
        }

        if (key === "20dbwW") {
            converterType.value =
                "dbwToW";

            converterInput.value =
                "20";
        }

        if (key === "1wDbm") {
            converterType.value =
                "wToDbm";

            converterInput.value =
                "1";
        }

        if (key === "20dbmW") {
            converterType.value =
                "dbmToW";

            converterInput.value =
                "20";
        }

        updateConverter();
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

        if (currentMode === "power") {
            value1Input.value = "1";
            value2Input.value = "10";
            unit1Select.value = "W";
            unit2Select.value = "W";
        }

        if (currentMode === "voltage") {
            value1Input.value = "1";
            value2Input.value = "2";
            unit1Select.value = "V";
            unit2Select.value = "V";
        }

        if (currentMode === "current") {
            value1Input.value = "20";
            value2Input.value = "2";
            unit1Select.value = "mA";
            unit2Select.value = "mA";
        }

        updateInterface();
    }

    function resizeCanvas() {
        viewWidth =
            Math.max(
                300,
                canvasContainer.clientWidth
            );

        viewHeight =
            viewWidth < 680
                ? 820
                : 590;

        pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width =
            Math.round(
                viewWidth * pixelRatio
            );

        canvas.height =
            Math.round(
                viewHeight * pixelRatio
            );

        canvas.style.width =
            viewWidth + "px";

        canvas.style.height =
            viewHeight + "px";

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
        x,
        y,
        width,
        height,
        title,
        color
    ) {
        ctx.save();

        roundedRectPath(
            x,
            y,
            width,
            height,
            13
        );

        ctx.fillStyle =
            "rgba(2, 10, 24, 0.62)";

        ctx.fill();

        ctx.strokeStyle =
            "rgba(125, 211, 252, 0.15)";

        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = color;

        ctx.font =
            "700 11px Segoe UI, sans-serif";

        ctx.textAlign = "left";

        ctx.fillText(
            title,
            x + 15,
            y + 24
        );

        ctx.restore();
    }

    function drawLinearScale(
        calculation,
        panel
    ) {
        const data =
            calculation.data;

        drawPanel(
            panel.x,
            panel.y,
            panel.width,
            panel.height,
            "ESCALA LINEAL",
            data.color
        );

        if (!calculation.valid) {
            drawCanvasError(
                panel,
                "Valores inválidos"
            );

            return;
        }

        const maxValue =
            Math.max(
                calculation.baseValue1,
                calculation.baseValue2
            );

        const firstRatio =
            calculation.baseValue1 /
            maxValue;

        const secondRatio =
            calculation.baseValue2 /
            maxValue;

        const baseY =
            panel.y +
            panel.height -
            72;

        const maximumBarHeight =
            panel.height - 155;

        const barWidth =
            Math.min(
                94,
                panel.width * 0.22
            );

        const firstX =
            panel.x +
            panel.width * 0.27 -
            barWidth / 2;

        const secondX =
            panel.x +
            panel.width * 0.73 -
            barWidth / 2;

        const firstHeight =
            Math.max(
                3,
                maximumBarHeight *
                firstRatio
            );

        const secondHeight =
            Math.max(
                3,
                maximumBarHeight *
                secondRatio
            );

        drawLevelBar(
            firstX,
            baseY,
            barWidth,
            firstHeight,
            data.color,
            data.symbol + "1",
            calculation.rawValue1 +
            " " +
            unit1Select.value
        );

        drawLevelBar(
            secondX,
            baseY,
            barWidth,
            secondHeight,
            calculation.db >= 0
                ? "#34d399"
                : "#fb7185",
            data.symbol + "2",
            calculation.rawValue2 +
            " " +
            unit2Select.value
        );

        ctx.save();

        ctx.strokeStyle =
            "rgba(186,230,253,0.34)";

        ctx.lineWidth = 1.4;

        ctx.beginPath();

        ctx.moveTo(
            panel.x + 25,
            baseY
        );

        ctx.lineTo(
            panel.x +
            panel.width -
            25,
            baseY
        );

        ctx.stroke();

        const particleProgress =
            (
                elapsedTime *
                Number(
                    animationSpeed.value
                ) /
                1.7
            ) % 1;

        const startX =
            firstX +
            barWidth / 2;

        const endX =
            secondX +
            barWidth / 2;

        const controlY =
            panel.y + 80;

        const oneMinus =
            1 -
            particleProgress;

        const particleX =
            oneMinus *
            oneMinus *
            startX +
            2 *
            oneMinus *
            particleProgress *
            (
                panel.x +
                panel.width / 2
            ) +
            particleProgress *
            particleProgress *
            endX;

        const particleY =
            oneMinus *
            oneMinus *
            (
                baseY -
                firstHeight
            ) +
            2 *
            oneMinus *
            particleProgress *
            controlY +
            particleProgress *
            particleProgress *
            (
                baseY -
                secondHeight
            );

        drawGlowPoint(
            particleX,
            particleY,
            data.color,
            4
        );

        ctx.fillStyle =
            "rgba(159,181,202,0.75)";

        ctx.font =
            "500 9px Segoe UI, sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            "Comparación matemática entre valor 1 y valor 2",
            panel.x +
            panel.width / 2,
            panel.y +
            panel.height -
            26
        );

        if (
            Math.min(
                firstRatio,
                secondRatio
            ) < 0.02
        ) {
            ctx.fillStyle =
                "rgba(251,191,36,0.88)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.fillText(
                "La barra menor se dibuja con un mínimo visible",
                panel.x +
                panel.width / 2,
                panel.y + 48
            );
        }

        ctx.restore();
    }

    function drawLevelBar(
        x,
        baseY,
        width,
        height,
        color,
        label,
        valueText
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
            "rgba(255,255,255,0.88)"
        );

        gradient.addColorStop(
            0.18,
            color
        );

        gradient.addColorStop(
            1,
            hexToRgba(
                color,
                0.28
            )
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

        ctx.strokeStyle =
            hexToRgba(
                color,
                0.78
            );

        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle =
            "rgba(240,249,255,0.95)";

        ctx.font =
            "700 11px Segoe UI, sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            label,
            x + width / 2,
            baseY + 23
        );

        ctx.fillStyle =
            "rgba(199,220,235,0.82)";

        ctx.font =
            "600 9px Segoe UI, sans-serif";

        ctx.fillText(
            valueText,
            x + width / 2,
            baseY + 42
        );

        ctx.restore();
    }

    function drawLogScale(
        calculation,
        panel
    ) {
        const data =
            calculation.data;

        drawPanel(
            panel.x,
            panel.y,
            panel.width,
            panel.height,
            "ESCALA LOGARÍTMICA EN dB",
            data.color
        );

        if (!calculation.valid) {
            drawCanvasError(
                panel,
                "Valores inválidos"
            );

            return;
        }

        const absoluteDb =
            Math.abs(
                calculation.db
            );

        const axisLimit =
            Math.max(
                30,
                Math.ceil(
                    absoluteDb /
                    10
                ) *
                10
            );

        const axisLeft =
            panel.x + 50;

        const axisRight =
            panel.x +
            panel.width -
            35;

        const axisWidth =
            axisRight -
            axisLeft;

        const centerX =
            (
                axisLeft +
                axisRight
            ) / 2;

        const axisY =
            panel.y +
            panel.height *
            0.55;

        ctx.save();

        ctx.strokeStyle =
            "rgba(186,230,253,0.55)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            axisLeft,
            axisY
        );

        ctx.lineTo(
            axisRight,
            axisY
        );

        ctx.stroke();

        const divisions = 6;

        for (
            let index = 0;
            index <= divisions;
            index++
        ) {
            const x =
                axisLeft +
                axisWidth *
                (
                    index /
                    divisions
                );

            const value =
                -axisLimit +
                (
                    axisLimit * 2
                ) *
                (
                    index /
                    divisions
                );

            ctx.strokeStyle =
                index === divisions / 2
                    ? "rgba(52,211,153,0.72)"
                    : "rgba(186,230,253,0.30)";

            ctx.lineWidth =
                index === divisions / 2
                    ? 2
                    : 1;

            ctx.beginPath();

            ctx.moveTo(
                x,
                axisY - 10
            );

            ctx.lineTo(
                x,
                axisY + 10
            );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(199,220,235,0.80)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                formatNumber(
                    value,
                    1
                ),
                x,
                axisY + 29
            );
        }

        const normalized =
            (
                calculation.db +
                axisLimit
            ) /
            (
                axisLimit * 2
            );

        const markerX =
            axisLeft +
            clamp(
                normalized,
                0,
                1
            ) *
            axisWidth;

        const pulse =
            1 +
            Math.sin(
                elapsedTime *
                4 *
                Number(
                    animationSpeed.value
                )
            ) *
            0.14;

        ctx.fillStyle =
            data.color;

        ctx.shadowBlur = 20;
        ctx.shadowColor =
            data.color;

        ctx.beginPath();

        ctx.arc(
            markerX,
            axisY,
            10 * pulse,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            markerX,
            axisY,
            3.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        const cardWidth =
            Math.min(
                260,
                panel.width - 50
            );

        const cardX =
            panel.x +
            (
                panel.width -
                cardWidth
            ) / 2;

        const cardY =
            panel.y + 67;

        roundedRectPath(
            cardX,
            cardY,
            cardWidth,
            92,
            10
        );

        ctx.fillStyle =
            "rgba(17,40,65,0.72)";

        ctx.fill();

        ctx.strokeStyle =
            hexToRgba(
                data.color,
                0.35
            );

        ctx.stroke();

        ctx.fillStyle =
            data.color;

        ctx.font =
            "700 21px Segoe UI, sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            formatSignedDb(
                calculation.db
            ),
            panel.x +
            panel.width / 2,
            cardY + 36
        );

        ctx.fillStyle =
            "rgba(199,220,235,0.86)";

        ctx.font =
            "600 10px Segoe UI, sans-serif";

        ctx.fillText(
            getInterpretation(
                calculation.db
            ),
            panel.x +
            panel.width / 2,
            cardY + 61
        );

        ctx.fillStyle =
            "rgba(159,181,202,0.76)";

        ctx.font =
            "500 9px Segoe UI, sans-serif";

        ctx.fillText(
            "log10(relación) = " +
            formatNumber(
                Math.log10(
                    calculation.ratio
                ),
                5
            ),
            panel.x +
            panel.width / 2,
            cardY + 79
        );

        ctx.fillStyle =
            "rgba(159,181,202,0.73)";

        ctx.font =
            "500 9px Segoe UI, sans-serif";

        ctx.fillText(
            "−" +
            axisLimit +
            " dB",
            axisLeft,
            panel.y +
            panel.height -
            29
        );

        ctx.fillText(
            "0 dB",
            centerX,
            panel.y +
            panel.height -
            29
        );

        ctx.fillText(
            "+" +
            axisLimit +
            " dB",
            axisRight,
            panel.y +
            panel.height -
            29
        );

        ctx.fillStyle =
            "rgba(110,231,183,0.82)";

        ctx.fillText(
            "0 dB = igualdad, no ausencia de señal",
            centerX,
            panel.y +
            panel.height -
            51
        );

        ctx.restore();
    }

    function drawGlowPoint(
        x,
        y,
        color,
        radius
    ) {
        const gradient =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                radius * 4
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.2,
            color
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius * 4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    function hexToRgba(
        hex,
        alpha
    ) {
        const normalized =
            hex.replace("#", "");

        const red =
            parseInt(
                normalized.substring(
                    0,
                    2
                ),
                16
            );

        const green =
            parseInt(
                normalized.substring(
                    2,
                    4
                ),
                16
            );

        const blue =
            parseInt(
                normalized.substring(
                    4,
                    6
                ),
                16
            );

        return (
            "rgba(" +
            red +
            "," +
            green +
            "," +
            blue +
            "," +
            alpha +
            ")"
        );
    }

    function drawCanvasError(
        panel,
        message
    ) {
        ctx.save();

        ctx.fillStyle =
            "rgba(251,113,133,0.92)";

        ctx.font =
            "700 14px Segoe UI, sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            message,
            panel.x +
            panel.width / 2,
            panel.y +
            panel.height / 2
        );

        ctx.fillStyle =
            "rgba(199,220,235,0.74)";

        ctx.font =
            "500 10px Segoe UI, sans-serif";

        ctx.fillText(
            "Los logaritmos requieren valores positivos.",
            panel.x +
            panel.width / 2,
            panel.y +
            panel.height / 2 +
            23
        );

        ctx.restore();
    }

    function drawHeaderInformation(
        calculation
    ) {
        ctx.save();

        ctx.fillStyle =
            "rgba(240,249,255,0.95)";

        ctx.font =
            "700 15px Segoe UI, sans-serif";

        ctx.textAlign = "left";

        ctx.fillText(
            calculation.data.title,
            24,
            32
        );

        ctx.fillStyle =
            "rgba(159,181,202,0.82)";

        ctx.font =
            "500 10px Segoe UI, sans-serif";

        ctx.fillText(
            "El dB expresa una relación logarítmica, no una magnitud física directa.",
            24,
            51
        );

        ctx.textAlign = "right";

        ctx.fillStyle =
            calculation.data.color;

        ctx.font =
            "700 10px Segoe UI, sans-serif";

        ctx.fillText(
            calculation.data.formula,
            viewWidth - 24,
            34
        );

        ctx.restore();
    }

    function drawMobileLayout(
        calculation
    ) {
        const margin = 16;
        const panelWidth =
            viewWidth -
            margin * 2;

        const firstPanel = {
            x: margin,
            y: 78,
            width: panelWidth,
            height: 335
        };

        const secondPanel = {
            x: margin,
            y: 430,
            width: panelWidth,
            height: 345
        };

        drawLinearScale(
            calculation,
            firstPanel
        );

        drawLogScale(
            calculation,
            secondPanel
        );
    }

    function drawDesktopLayout(
        calculation
    ) {
        const margin = 20;
        const gap = 18;

        const panelWidth =
            (
                viewWidth -
                margin * 2 -
                gap
            ) / 2;

        const panelHeight =
            viewHeight - 105;

        const firstPanel = {
            x: margin,
            y: 76,
            width: panelWidth,
            height: panelHeight
        };

        const secondPanel = {
            x:
                margin +
                panelWidth +
                gap,
            y: 76,
            width: panelWidth,
            height: panelHeight
        };

        drawLinearScale(
            calculation,
            firstPanel
        );

        drawLogScale(
            calculation,
            secondPanel
        );
    }

    function drawScene() {
        drawBackground();

        const calculation =
            getCalculation();

        drawHeaderInformation(
            calculation
        );

        if (viewWidth < 680) {
            drawMobileLayout(
                calculation
            );
        } else {
            drawDesktopLayout(
                calculation
            );
        }

        ctx.save();

        ctx.fillStyle =
            "rgba(159,181,202,0.66)";

        ctx.font =
            "500 9px Segoe UI, sans-serif";

        ctx.textAlign = "right";

        ctx.fillText(
            "La escala visual se adapta automáticamente y no representa dimensiones físicas.",
            viewWidth - 18,
            viewHeight - 14
        );

        ctx.restore();
    }

    function animate(currentTime) {
        const deltaTime =
            Math.min(
                (
                    currentTime -
                    lastFrameTime
                ) / 1000,
                0.05
            );

        lastFrameTime =
            currentTime;

        if (!isPaused) {
            elapsedTime +=
                deltaTime;

            if (elapsedTime > 10000) {
                elapsedTime = 0;
            }
        }

        drawScene();

        window.requestAnimationFrame(
            animate
        );
    }

    updateSpeedDisplay();
    setMode("power", true);
    updateConverter();
    resizeCanvas();

    window.requestAnimationFrame(
        function startAnimation(time) {
            lastFrameTime = time;
            animate(time);
        }
    );
