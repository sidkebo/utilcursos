        "use strict";

        /*
         * SIT-400 — Clase 4
         * Ganancia, atenuación y cascadas.
         * Archivo autónomo: CSS y JavaScript incluidos.
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

        const stageExampleButtons =
            Array.from(
                document.querySelectorAll("[data-stage-example]")
            );

        const cascadePresetButtons =
            Array.from(
                document.querySelectorAll("[data-cascade-preset]")
            );

        const dividerPresetButtons =
            Array.from(
                document.querySelectorAll("[data-divider-preset]")
            );

        const canvasTitle =
            document.getElementById("canvasTitle");

        const simulationStatus =
            document.getElementById("simulationStatus");

        const metricLabels = [
            document.getElementById("metricLabel1"),
            document.getElementById("metricLabel2"),
            document.getElementById("metricLabel3"),
            document.getElementById("metricLabel4"),
            document.getElementById("metricLabel5"),
            document.getElementById("metricLabel6")
        ];

        const metricValues = [
            document.getElementById("metricValue1"),
            document.getElementById("metricValue2"),
            document.getElementById("metricValue3"),
            document.getElementById("metricValue4"),
            document.getElementById("metricValue5"),
            document.getElementById("metricValue6")
        ];

        const stageControls =
            document.getElementById("stageControls");

        const cascadeControls =
            document.getElementById("cascadeControls");

        const dividerControls =
            document.getElementById("dividerControls");

        const stageQuantity =
            document.getElementById("stageQuantity");

        const stageView =
            document.getElementById("stageView");

        const stageInputValue =
            document.getElementById("stageInputValue");

        const stageOutputValue =
            document.getElementById("stageOutputValue");

        const stageInputUnit =
            document.getElementById("stageInputUnit");

        const stageOutputUnit =
            document.getElementById("stageOutputUnit");

        const stageInputLabel =
            document.getElementById("stageInputLabel");

        const stageOutputLabel =
            document.getElementById("stageOutputLabel");

        const stageConditions =
            document.getElementById("stageConditions");

        const stageMeasurement =
            document.getElementById("stageMeasurement");

        const stageImpedance =
            document.getElementById("stageImpedance");

        const stageCount =
            document.getElementById("stageCount");

        const stageCountDisplay =
            document.getElementById("stageCountDisplay");

        const initialPower =
            document.getElementById("initialPower");

        const initialPowerUnit =
            document.getElementById("initialPowerUnit");

        const saturationThreshold =
            document.getElementById("saturationThreshold");

        const saturationUnit =
            document.getElementById("saturationUnit");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedDisplay =
            document.getElementById("animationSpeedDisplay");

        const stageSelector =
            document.getElementById("stageSelector");

        const selectedStageTitle =
            document.getElementById("selectedStageTitle");

        const selectedStageType =
            document.getElementById("selectedStageType");

        const selectedStageMagnitude =
            document.getElementById("selectedStageMagnitude");

        const selectedStageSignedValue =
            document.getElementById("selectedStageSignedValue");

        const cascadeAlert =
            document.getElementById("cascadeAlert");

        const cascadeTableBody =
            document.getElementById("cascadeTableBody");

        const dividerInputVoltage =
            document.getElementById("dividerInputVoltage");

        const dividerFrequency =
            document.getElementById("dividerFrequency");

        const dividerR1 =
            document.getElementById("dividerR1");

        const dividerR2 =
            document.getElementById("dividerR2");

        const dividerPauseHint =
            document.getElementById("dividerPauseHint");

        const formulaPanelTitle =
            document.getElementById("formulaPanelTitle");

        const formulaPrimary =
            document.getElementById("formulaPrimary");

        const formulaOperation =
            document.getElementById("formulaOperation");

        const formulaResult =
            document.getElementById("formulaResult");

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

        const quantityData = {
            power: {
                title: "Potencia",
                symbol: "P",
                factor: 10,
                baseUnit: "W",
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
                    }
                ]
            },

            voltage: {
                title: "Tensión",
                symbol: "V",
                factor: 20,
                baseUnit: "V",
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
                ]
            },

            current: {
                title: "Corriente",
                symbol: "I",
                factor: 20,
                baseUnit: "A",
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
                ]
            }
        };

        const blockTypes = {
            amplifier: {
                title: "Amplificador",
                short: "AMP",
                sign: 1,
                defaultMagnitude: 20,
                color: "#34d399",
                description:
                    "Etapa activa que aumenta el nivel relativo de la señal."
            },

            cable: {
                title: "Cable",
                short: "CBL",
                sign: -1,
                defaultMagnitude: 3,
                color: "#fbbf24",
                description:
                    "Medio pasivo que introduce una pérdida de nivel."
            },

            connector: {
                title: "Conector",
                short: "CON",
                sign: -1,
                defaultMagnitude: 1,
                color: "#fb923c",
                description:
                    "Unión física que puede introducir una pequeña pérdida."
            },

            filter: {
                title: "Filtro",
                short: "FIL",
                sign: -1,
                defaultMagnitude: 2,
                color: "#38bdf8",
                description:
                    "Bloque selectivo que puede presentar pérdida de inserción."
            },

            attenuator: {
                title: "Atenuador",
                short: "ATN",
                sign: -1,
                defaultMagnitude: 6,
                color: "#fb7185",
                description:
                    "Reduce el nivel de manera intencional y controlada."
            },

            repeater: {
                title: "Repetidor",
                short: "REP",
                sign: 1,
                defaultMagnitude: 12,
                color: "#c084fc",
                description:
                    "Etapa activa intermedia que recupera o aumenta el nivel."
            }
        };

        const stageExamples = {
            powerGain: {
                quantity: "power",
                view: "gain",
                input: 2,
                output: 20,
                inputUnit: "W",
                outputUnit: "W"
            },

            voltageGain: {
                quantity: "voltage",
                view: "gain",
                input: 0.5,
                output: 1,
                inputUnit: "V",
                outputUnit: "V"
            },

            currentLoss: {
                quantity: "current",
                view: "attenuation",
                input: 20,
                output: 2,
                inputUnit: "mA",
                outputUnit: "mA"
            },

            powerLoss: {
                quantity: "power",
                view: "attenuation",
                input: 10,
                output: 1,
                inputUnit: "W",
                outputUnit: "W"
            },

            voltageLoss: {
                quantity: "voltage",
                view: "attenuation",
                input: 2,
                output: 1,
                inputUnit: "V",
                outputUnit: "V"
            }
        };

        const stages = [
            {
                type: "amplifier",
                magnitude: 20
            },
            {
                type: "cable",
                magnitude: 3
            },
            {
                type: "filter",
                magnitude: 2
            },
            {
                type: "connector",
                magnitude: 1
            },
            {
                type: "attenuator",
                magnitude: 6
            },
            {
                type: "repeater",
                magnitude: 12
            }
        ];

        let currentMode = "stage";
        let selectedStageIndex = 0;
        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 590;
        let pixelRatio = 1;
        let cascadeHitAreas = [];

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

        [
            stageQuantity,
            stageView,
            stageInputValue,
            stageOutputValue,
            stageInputUnit,
            stageOutputUnit,
            stageMeasurement,
            stageImpedance
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

        stageQuantity.addEventListener(
            "change",
            function () {
                configureStageQuantity(
                    true
                );
            }
        );

        stageExampleButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyStageExample(
                            button.dataset.stageExample
                        );
                    }
                );
            }
        );

        stageCount.addEventListener(
            "input",
            function () {
                const count =
                    Number(
                        stageCount.value
                    );

                selectedStageIndex =
                    Math.min(
                        selectedStageIndex,
                        count - 1
                    );

                updateInterface();
            }
        );

        [
            initialPower,
            initialPowerUnit,
            saturationThreshold,
            saturationUnit,
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

        selectedStageType.addEventListener(
            "change",
            function () {
                const selectedType =
                    blockTypes[
                        selectedStageType.value
                    ];

                stages[selectedStageIndex].type =
                    selectedStageType.value;

                stages[selectedStageIndex].magnitude =
                    selectedType.defaultMagnitude;

                selectedStageMagnitude.value =
                    String(
                        selectedType.defaultMagnitude
                    );

                updateInterface();
            }
        );

        selectedStageMagnitude.addEventListener(
            "input",
            function () {
                const value =
                    Math.max(
                        0,
                        Number(
                            selectedStageMagnitude.value
                        ) || 0
                    );

                stages[selectedStageIndex].magnitude =
                    value;

                updateInterface();
            }
        );

        cascadePresetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyCascadePreset(
                            button.dataset.cascadePreset
                        );
                    }
                );
            }
        );

        [
            dividerInputVoltage,
            dividerFrequency,
            dividerR1,
            dividerR2
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

        dividerPresetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyDividerPreset(
                            button.dataset.dividerPreset
                        );
                    }
                );
            }
        );

        dividerPauseHint.addEventListener(
            "click",
            function () {
                technicalNote.innerHTML =
                    "<strong>Medición de alta impedancia:</strong> " +
                    "el osciloscopio virtual se considera suficientemente " +
                    "resistivo para no modificar apreciablemente el divisor. " +
                    "Una carga de baja impedancia quedaría en paralelo con R2 " +
                    "y cambiaría la tensión de salida.";
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

        canvas.addEventListener(
            "pointerdown",
            selectCascadeStageFromCanvas
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

        function formatPowerWatts(value) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            if (Math.abs(value) >= 1) {
                return (
                    formatNumber(
                        value,
                        5
                    ) +
                    " W"
                );
            }

            if (Math.abs(value) >= 1e-3) {
                return (
                    formatNumber(
                        value * 1e3,
                        5
                    ) +
                    " mW"
                );
            }

            if (Math.abs(value) >= 1e-6) {
                return (
                    formatNumber(
                        value * 1e6,
                        5
                    ) +
                    " µW"
                );
            }

            return (
                formatNumber(
                    value,
                    8
                ) +
                " W"
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

        function setMetric(
            index,
            label,
            value
        ) {
            metricLabels[index].textContent =
                label;

            metricValues[index].textContent =
                value;
        }

        function setActiveColor(
            color,
            rgb
        ) {
            document.documentElement
                .style
                .setProperty(
                    "--active",
                    color
                );

            document.documentElement
                .style
                .setProperty(
                    "--active-rgb",
                    rgb
                );
        }

        function setMode(mode) {
            currentMode = mode;
            elapsedTime = 0;

            modeButtons.forEach(
                function (button) {
                    const active =
                        button.dataset.mode === mode;

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

            stageControls.hidden =
                mode !== "stage";

            cascadeControls.hidden =
                mode !== "cascade";

            dividerControls.hidden =
                mode !== "divider";

            if (mode === "stage") {
                const quantity =
                    quantityData[
                        stageQuantity.value
                    ];

                setActiveColor(
                    quantity.color,
                    quantity.rgb
                );

                canvasTitle.textContent =
                    "Ganancia y atenuación de una etapa";

                explanation.innerHTML =
                    "<strong>Una etapa:</strong> la ganancia con signo se " +
                    "calcula comparando salida con entrada. Si la señal " +
                    "disminuye, la misma reducción puede expresarse como " +
                    "ganancia negativa o como atenuación positiva.";

                technicalNote.innerHTML =
                    "<strong>Alcance:</strong> potencia utiliza factor 10; " +
                    "tensión y corriente utilizan factor 20. No se introducen " +
                    "dBm, dBW, dBV, dBu ni dBmV como tema principal.";
            }

            if (mode === "cascade") {
                setActiveColor(
                    "#c084fc",
                    "192, 132, 252"
                );

                canvasTitle.textContent =
                    "Nivel de potencia a través de una cascada";

                explanation.innerHTML =
                    "<strong>Cascadas:</strong> en escala lineal los factores " +
                    "se multiplican; en dB las ganancias y pérdidas se suman " +
                    "algebraicamente. Las pérdidas se escriben con signo " +
                    "negativo dentro del balance.";

                technicalNote.innerHTML =
                    "<strong>Umbral de saturación:</strong> es un valor " +
                    "didáctico ajustable, no una especificación real de un " +
                    "equipo. La saturación verdadera depende del dispositivo " +
                    "y de sus límites eléctricos.";
            }

            if (mode === "divider") {
                setActiveColor(
                    "#fbbf24",
                    "251, 191, 36"
                );

                canvasTitle.textContent =
                    "Divisor resistivo como atenuador didáctico";

                explanation.innerHTML =
                    "<strong>Atenuador resistivo:</strong> la tensión de " +
                    "salida se toma sobre R2. Al aumentar R1 y mantener R2, " +
                    "la salida disminuye y la atenuación de tensión aumenta.";

                technicalNote.innerHTML =
                    "<strong>Suposición:</strong> entrada y salida se comparan " +
                    "en Vpp con el mismo criterio. El osciloscopio virtual " +
                    "tiene alta impedancia y no carga significativamente el " +
                    "divisor.";
            }

            resizeCanvas();
            updateInterface();
        }

        function configureStageQuantity(
            resetValues
        ) {
            const quantity =
                quantityData[
                    stageQuantity.value
                ];

            setActiveColor(
                quantity.color,
                quantity.rgb
            );

            stageInputLabel.textContent =
                quantity.title +
                " de entrada";

            stageOutputLabel.textContent =
                quantity.title +
                " de salida";

            stageConditions.hidden =
                stageQuantity.value === "power";

            setUnitOptions(
                stageInputUnit,
                quantity.units,
                quantity.units[0].label
            );

            setUnitOptions(
                stageOutputUnit,
                quantity.units,
                quantity.units[0].label
            );

            if (resetValues) {
                if (
                    stageQuantity.value ===
                    "power"
                ) {
                    stageInputValue.value = "2";
                    stageOutputValue.value = "20";
                    stageInputUnit.value = "W";
                    stageOutputUnit.value = "W";
                }

                if (
                    stageQuantity.value ===
                    "voltage"
                ) {
                    stageInputValue.value = "0.5";
                    stageOutputValue.value = "1";
                    stageInputUnit.value = "V";
                    stageOutputUnit.value = "V";
                }

                if (
                    stageQuantity.value ===
                    "current"
                ) {
                    stageInputValue.value = "20";
                    stageOutputValue.value = "2";
                    stageInputUnit.value = "mA";
                    stageOutputUnit.value = "mA";
                }
            }

            updateInterface();
        }

        function setUnitOptions(
            select,
            units,
            selectedValue
        ) {
            select.innerHTML = "";

            units.forEach(
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

            select.value =
                selectedValue;
        }

        function getQuantityUnitFactor(
            quantityKey,
            unitLabel
        ) {
            const unit =
                quantityData[
                    quantityKey
                ].units.find(
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

        function getStageCalculation() {
            const quantity =
                quantityData[
                    stageQuantity.value
                ];

            const rawInput =
                Number(
                    stageInputValue.value
                );

            const rawOutput =
                Number(
                    stageOutputValue.value
                );

            const baseInput =
                rawInput *
                getQuantityUnitFactor(
                    stageQuantity.value,
                    stageInputUnit.value
                );

            const baseOutput =
                rawOutput *
                getQuantityUnitFactor(
                    stageQuantity.value,
                    stageOutputUnit.value
                );

            const valid =
                Number.isFinite(
                    baseInput
                ) &&
                Number.isFinite(
                    baseOutput
                ) &&
                baseInput > 0 &&
                baseOutput > 0;

            if (!valid) {
                return {
                    valid: false,
                    quantity,
                    rawInput,
                    rawOutput,
                    baseInput,
                    baseOutput,
                    ratio: NaN,
                    gainDb: NaN,
                    attenuationDb: NaN
                };
            }

            const ratio =
                baseOutput /
                baseInput;

            const gainDb =
                quantity.factor *
                Math.log10(
                    ratio
                );

            const attenuationDb =
                -gainDb;

            return {
                valid: true,
                quantity,
                rawInput,
                rawOutput,
                baseInput,
                baseOutput,
                ratio,
                gainDb,
                attenuationDb
            };
        }

        function getStageInterpretation(
            calculation
        ) {
            if (!calculation.valid) {
                return "Valores inválidos";
            }

            if (
                Math.abs(
                    calculation.gainDb
                ) <
                0.0005
            ) {
                return "Nivel sin cambio";
            }

            return calculation.gainDb > 0
                ? "Aumento de nivel"
                : "Reducción de nivel";
        }

        function updateStageInterface() {
            const calculation =
                getStageCalculation();

            const quantity =
                calculation.quantity;

            setActiveColor(
                quantity.color,
                quantity.rgb
            );

            setMetric(
                0,
                "Entrada",
                calculation.valid
                    ? formatNumber(
                        calculation.rawInput,
                        5
                    ) +
                    " " +
                    stageInputUnit.value
                    : "—"
            );

            setMetric(
                1,
                "Salida",
                calculation.valid
                    ? formatNumber(
                        calculation.rawOutput,
                        5
                    ) +
                    " " +
                    stageOutputUnit.value
                    : "—"
            );

            setMetric(
                2,
                "Relación salida/entrada",
                calculation.valid
                    ? formatNumber(
                        calculation.ratio,
                        5
                    ) +
                    " veces"
                    : "—"
            );

            setMetric(
                3,
                "Ganancia con signo",
                calculation.valid
                    ? formatSignedDb(
                        calculation.gainDb
                    )
                    : "—"
            );

            setMetric(
                4,
                "Atenuación equivalente",
                calculation.valid
                    ? formatSignedDb(
                        calculation.attenuationDb
                    )
                    : "—"
            );

            setMetric(
                5,
                "Interpretación",
                getStageInterpretation(
                    calculation
                )
            );

            formulaPanelTitle.textContent =
                "Cálculo de una etapa";

            if (!calculation.valid) {
                formulaPrimary.textContent =
                    "Los valores deben ser positivos y mayores que cero.";

                formulaOperation.textContent =
                    "No es posible calcular el logaritmo.";

                formulaResult.textContent =
                    "Revise entrada, salida y unidades.";

                return;
            }

            const symbol =
                quantity.symbol;

            const gainFormula =
                "GdB = " +
                quantity.factor +
                " × log10(" +
                symbol +
                "salida / " +
                symbol +
                "entrada)";

            const attenuationFormula =
                "AdB = " +
                quantity.factor +
                " × log10(" +
                symbol +
                "entrada / " +
                symbol +
                "salida)";

            const selectedView =
                stageView.value;

            if (selectedView === "gain") {
                formulaPrimary.textContent =
                    gainFormula;

                formulaOperation.textContent =
                    "GdB = " +
                    quantity.factor +
                    " × log10(" +
                    formatNumber(
                        calculation.baseOutput,
                        7
                    ) +
                    " / " +
                    formatNumber(
                        calculation.baseInput,
                        7
                    ) +
                    ")";

                formulaResult.textContent =
                    formatSignedDb(
                        calculation.gainDb
                    ) +
                    " · " +
                    getStageInterpretation(
                        calculation
                    ).toLowerCase();
            } else {
                formulaPrimary.textContent =
                    attenuationFormula;

                formulaOperation.textContent =
                    "AdB = " +
                    quantity.factor +
                    " × log10(" +
                    formatNumber(
                        calculation.baseInput,
                        7
                    ) +
                    " / " +
                    formatNumber(
                        calculation.baseOutput,
                        7
                    ) +
                    ")";

                formulaResult.textContent =
                    formatSignedDb(
                        calculation.attenuationDb
                    ) +
                    (
                        calculation.attenuationDb >= 0
                            ? " · pérdida expresada como valor positivo"
                            : " · el bloque realmente presenta aumento"
                    );
            }

            if (
                stageQuantity.value !==
                "power"
            ) {
                const measurementText =
                    stageMeasurement.options[
                        stageMeasurement.selectedIndex
                    ].text;

                const impedance =
                    stageImpedance.value;

                if (impedance === "equal") {
                    technicalNote.innerHTML =
                        "<strong>Medición:</strong> " +
                        measurementText +
                        ". Las impedancias se consideran iguales; bajo esa " +
                        "condición puede relacionarse el resultado con un " +
                        "cambio equivalente de potencia.";
                } else {
                    technicalNote.innerHTML =
                        "<strong>Precaución:</strong> " +
                        measurementText +
                        ". La relación de " +
                        quantity.title.toLowerCase() +
                        " es válida, pero no debe interpretarse directamente " +
                        "como relación de potencia porque las impedancias no " +
                        "son iguales o no se conocen.";
                }
            }
        }

        function applyStageExample(key) {
            const example =
                stageExamples[key];

            if (!example) {
                return;
            }

            stageQuantity.value =
                example.quantity;

            configureStageQuantity(
                false
            );

            stageView.value =
                example.view;

            stageInputValue.value =
                String(
                    example.input
                );

            stageOutputValue.value =
                String(
                    example.output
                );

            stageInputUnit.value =
                example.inputUnit;

            stageOutputUnit.value =
                example.outputUnit;

            elapsedTime = 0;

            updateInterface();
        }

        function createStageSelectors() {
            stageSelector.innerHTML = "";
            selectedStageType.innerHTML = "";

            Object.entries(
                blockTypes
            ).forEach(
                function ([key, item]) {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value = key;
                    option.textContent =
                        item.title;

                    selectedStageType.appendChild(
                        option
                    );
                }
            );

            stages.forEach(
                function (stage, index) {
                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type = "button";
                    button.className =
                        "stage-button";

                    button.dataset.stageIndex =
                        String(index);

                    button.addEventListener(
                        "click",
                        function () {
                            selectedStageIndex =
                                index;

                            updateInterface();
                        }
                    );

                    stageSelector.appendChild(
                        button
                    );
                }
            );
        }

        function getSignedStageDb(stage) {
            const type =
                blockTypes[
                    stage.type
                ];

            return (
                type.sign *
                Math.abs(
                    Number(
                        stage.magnitude
                    ) || 0
                )
            );
        }

        function getPowerUnitFactor(unit) {
            return unit === "mW"
                ? 1e-3
                : 1;
        }

        function getCascadeCalculation() {
            const count =
                Number(
                    stageCount.value
                );

            const inputPowerWatts =
                Number(
                    initialPower.value
                ) *
                getPowerUnitFactor(
                    initialPowerUnit.value
                );

            const thresholdWatts =
                Number(
                    saturationThreshold.value
                ) *
                getPowerUnitFactor(
                    saturationUnit.value
                );

            const valid =
                Number.isFinite(
                    inputPowerWatts
                ) &&
                inputPowerWatts > 0 &&
                Number.isFinite(
                    thresholdWatts
                ) &&
                thresholdWatts > 0;

            const rows = [];

            let runningPower =
                inputPowerWatts;

            let totalDb = 0;
            let totalGainDb = 0;
            let totalLossDb = 0;
            let firstSaturationIndex = -1;
            let largestLossIndex = -1;
            let largestLossMagnitude = -1;

            if (valid) {
                for (
                    let index = 0;
                    index < count;
                    index += 1
                ) {
                    const stage =
                        stages[index];

                    const signedDb =
                        getSignedStageDb(
                            stage
                        );

                    const factor =
                        Math.pow(
                            10,
                            signedDb / 10
                        );

                    runningPower *=
                        factor;

                    totalDb +=
                        signedDb;

                    if (signedDb >= 0) {
                        totalGainDb +=
                            signedDb;
                    } else {
                        totalLossDb +=
                            Math.abs(
                                signedDb
                            );

                        if (
                            Math.abs(
                                signedDb
                            ) >
                            largestLossMagnitude
                        ) {
                            largestLossMagnitude =
                                Math.abs(
                                    signedDb
                                );

                            largestLossIndex =
                                index;
                        }
                    }

                    if (
                        firstSaturationIndex ===
                        -1 &&
                        runningPower >
                        thresholdWatts
                    ) {
                        firstSaturationIndex =
                            index;
                    }

                    rows.push({
                        index,
                        stage,
                        type:
                            blockTypes[
                                stage.type
                            ],
                        signedDb,
                        factor,
                        outputPower:
                            runningPower,
                        exceedsThreshold:
                            runningPower >
                            thresholdWatts
                    });
                }
            }

            const totalFactor =
                valid
                    ? Math.pow(
                        10,
                        totalDb / 10
                    )
                    : NaN;

            const finalPower =
                valid
                    ? inputPowerWatts *
                    totalFactor
                    : NaN;

            return {
                valid,
                count,
                inputPowerWatts,
                thresholdWatts,
                rows,
                totalDb,
                totalGainDb,
                totalLossDb,
                totalFactor,
                finalPower,
                firstSaturationIndex,
                largestLossIndex
            };
        }

        function updateCascadeInterface() {
            const calculation =
                getCascadeCalculation();

            const count =
                calculation.count;

            stageCountDisplay.textContent =
                String(count);

            animationSpeedDisplay.textContent =
                Number(
                    animationSpeed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            Array.from(
                stageSelector.children
            ).forEach(
                function (button, index) {
                    const visible =
                        index < count;

                    button.hidden =
                        !visible;

                    if (visible) {
                        const stage =
                            stages[index];

                        const type =
                            blockTypes[
                                stage.type
                            ];

                        button.textContent =
                            (
                                index + 1
                            ) +
                            ". " +
                            type.short +
                            " " +
                            formatSignedDb(
                                getSignedStageDb(
                                    stage
                                )
                            );

                        button.classList.toggle(
                            "active",
                            index ===
                            selectedStageIndex
                        );
                    }
                }
            );

            const selectedStage =
                stages[
                    selectedStageIndex
                ];

            const selectedType =
                blockTypes[
                    selectedStage.type
                ];

            selectedStageTitle.textContent =
                "Bloque " +
                (
                    selectedStageIndex +
                    1
                ) +
                ": " +
                selectedType.title;

            selectedStageType.value =
                selectedStage.type;

            selectedStageMagnitude.value =
                String(
                    selectedStage.magnitude
                );

            selectedStageSignedValue.textContent =
                formatSignedDb(
                    getSignedStageDb(
                        selectedStage
                    )
                );

            if (!calculation.valid) {
                setMetric(
                    0,
                    "Potencia inicial",
                    "—"
                );

                setMetric(
                    1,
                    "Ganancias",
                    "—"
                );

                setMetric(
                    2,
                    "Pérdidas",
                    "—"
                );

                setMetric(
                    3,
                    "Resultado neto",
                    "—"
                );

                setMetric(
                    4,
                    "Factor total",
                    "—"
                );

                setMetric(
                    5,
                    "Potencia final",
                    "—"
                );

                cascadeAlert.className =
                    "alert-box danger";

                cascadeAlert.textContent =
                    "La potencia inicial y el umbral deben ser positivos.";

                cascadeTableBody.innerHTML =
                    "";

                return;
            }

            setMetric(
                0,
                "Potencia inicial",
                formatPowerWatts(
                    calculation.inputPowerWatts
                )
            );

            setMetric(
                1,
                "Ganancias acumuladas",
                "+" +
                formatNumber(
                    calculation.totalGainDb,
                    2
                ) +
                " dB"
            );

            setMetric(
                2,
                "Pérdidas acumuladas",
                "−" +
                formatNumber(
                    calculation.totalLossDb,
                    2
                ) +
                " dB"
            );

            setMetric(
                3,
                "Resultado neto",
                formatSignedDb(
                    calculation.totalDb
                )
            );

            setMetric(
                4,
                "Factor lineal total",
                formatNumber(
                    calculation.totalFactor,
                    6
                ) +
                "×"
            );

            setMetric(
                5,
                "Potencia final",
                formatPowerWatts(
                    calculation.finalPower
                )
            );

            if (
                calculation.firstSaturationIndex >=
                0
            ) {
                const criticalRow =
                    calculation.rows[
                        calculation.firstSaturationIndex
                    ];

                cascadeAlert.className =
                    "alert-box danger";

                cascadeAlert.innerHTML =
                    "<strong>Posible saturación conceptual:</strong> " +
                    "el nivel supera el umbral didáctico después del bloque " +
                    (
                        criticalRow.index +
                        1
                    ) +
                    " (" +
                    criticalRow.type.title +
                    "). Ajuste el umbral según el límite real del equipo " +
                    "que se quiera representar.";
            } else if (
                calculation.largestLossIndex >=
                0
            ) {
                const criticalLoss =
                    calculation.rows[
                        calculation.largestLossIndex
                    ];

                cascadeAlert.className =
                    "alert-box warning";

                cascadeAlert.innerHTML =
                    "<strong>Etapa crítica por pérdida:</strong> el bloque " +
                    (
                        criticalLoss.index +
                        1
                    ) +
                    " (" +
                    criticalLoss.type.title +
                    ") presenta la mayor reducción individual: " +
                    formatSignedDb(
                        criticalLoss.signedDb
                    ) +
                    ".";
            } else {
                cascadeAlert.className =
                    "alert-box success";

                cascadeAlert.textContent =
                    "No hay pérdidas configuradas y ningún nivel supera " +
                    "el umbral didáctico seleccionado.";
            }

            cascadeTableBody.innerHTML =
                calculation.rows.map(
                    function (row) {
                        return (
                            "<tr>" +
                                "<td>" +
                                    (
                                        row.index +
                                        1
                                    ) +
                                "</td>" +
                                "<td>" +
                                    row.type.title +
                                "</td>" +
                                "<td>" +
                                    formatSignedDb(
                                        row.signedDb
                                    ) +
                                "</td>" +
                                "<td>" +
                                    formatNumber(
                                        row.factor,
                                        6
                                    ) +
                                    "×" +
                                "</td>" +
                                "<td>" +
                                    formatPowerWatts(
                                        row.outputPower
                                    ) +
                                    (
                                        row.exceedsThreshold
                                            ? " · sobre umbral"
                                            : ""
                                    ) +
                                "</td>" +
                            "</tr>"
                        );
                    }
                ).join("");

            formulaPanelTitle.textContent =
                "Cálculo de la cascada";

            formulaPrimary.textContent =
                "Gtotal,dB = G1,dB + G2,dB + ... + Gn,dB";

            formulaOperation.textContent =
                calculation.rows
                    .map(
                        function (row) {
                            return formatSignedDb(
                                row.signedDb
                            ).replace(
                                " dB",
                                ""
                            );
                        }
                    )
                    .join(" + ") +
                " = " +
                formatSignedDb(
                    calculation.totalDb
                );

            formulaResult.textContent =
                "Factor total = 10^(" +
                formatNumber(
                    calculation.totalDb,
                    4
                ) +
                "/10) = " +
                formatNumber(
                    calculation.totalFactor,
                    6
                ) +
                " · Pout = " +
                formatPowerWatts(
                    calculation.finalPower
                );
        }

        function applyCascadePreset(key) {
            if (key === "mandatory") {
                stageCount.value = "3";

                stages[0] = {
                    type: "amplifier",
                    magnitude: 20
                };

                stages[1] = {
                    type: "cable",
                    magnitude: 3
                };

                stages[2] = {
                    type: "filter",
                    magnitude: 2
                };

                initialPower.value = "1";
                initialPowerUnit.value = "W";
            }

            if (key === "balanced") {
                stageCount.value = "2";

                stages[0] = {
                    type: "amplifier",
                    magnitude: 10
                };

                stages[1] = {
                    type: "attenuator",
                    magnitude: 10
                };

                initialPower.value = "1";
                initialPowerUnit.value = "W";
            }

            if (key === "negative") {
                stageCount.value = "4";

                stages[0] = {
                    type: "cable",
                    magnitude: 6
                };

                stages[1] = {
                    type: "connector",
                    magnitude: 1
                };

                stages[2] = {
                    type: "attenuator",
                    magnitude: 10
                };

                stages[3] = {
                    type: "repeater",
                    magnitude: 12
                };

                initialPower.value = "10";
                initialPowerUnit.value = "W";
            }

            if (key === "sixBlocks") {
                stageCount.value = "6";

                stages[0] = {
                    type: "amplifier",
                    magnitude: 15
                };

                stages[1] = {
                    type: "cable",
                    magnitude: 4
                };

                stages[2] = {
                    type: "connector",
                    magnitude: 1
                };

                stages[3] = {
                    type: "filter",
                    magnitude: 2
                };

                stages[4] = {
                    type: "attenuator",
                    magnitude: 6
                };

                stages[5] = {
                    type: "repeater",
                    magnitude: 8
                };

                initialPower.value = "1";
                initialPowerUnit.value = "W";
            }

            if (key === "clear") {
                stageCount.value = "3";

                stages[0] = {
                    type: "amplifier",
                    magnitude: 20
                };

                stages[1] = {
                    type: "cable",
                    magnitude: 3
                };

                stages[2] = {
                    type: "filter",
                    magnitude: 2
                };

                initialPower.value = "1";
                initialPowerUnit.value = "W";

                saturationThreshold.value =
                    "100";

                saturationUnit.value =
                    "W";
            }

            selectedStageIndex = 0;
            elapsedTime = 0;

            updateInterface();
        }

        function getDividerCalculation() {
            const inputVpp =
                Number(
                    dividerInputVoltage.value
                );

            const frequencyHz =
                Number(
                    dividerFrequency.value
                );

            const r1Kohm =
                Number(
                    dividerR1.value
                );

            const r2Kohm =
                Number(
                    dividerR2.value
                );

            const valid =
                Number.isFinite(
                    inputVpp
                ) &&
                inputVpp > 0 &&
                Number.isFinite(
                    frequencyHz
                ) &&
                frequencyHz > 0 &&
                Number.isFinite(
                    r1Kohm
                ) &&
                r1Kohm > 0 &&
                Number.isFinite(
                    r2Kohm
                ) &&
                r2Kohm > 0;

            if (!valid) {
                return {
                    valid: false,
                    inputVpp,
                    outputVpp: NaN,
                    frequencyHz,
                    r1Kohm,
                    r2Kohm,
                    voltageRatio: NaN,
                    attenuationRatio: NaN,
                    attenuationDb: NaN
                };
            }

            const voltageRatio =
                r2Kohm /
                (
                    r1Kohm +
                    r2Kohm
                );

            const outputVpp =
                inputVpp *
                voltageRatio;

            const attenuationRatio =
                inputVpp /
                outputVpp;

            const attenuationDb =
                20 *
                Math.log10(
                    attenuationRatio
                );

            return {
                valid: true,
                inputVpp,
                outputVpp,
                frequencyHz,
                r1Kohm,
                r2Kohm,
                voltageRatio,
                attenuationRatio,
                attenuationDb
            };
        }

        function updateDividerInterface() {
            const calculation =
                getDividerCalculation();

            if (!calculation.valid) {
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

                formulaPanelTitle.textContent =
                    "Divisor resistivo ideal";

                formulaPrimary.textContent =
                    "Todos los valores deben ser positivos.";

                formulaOperation.textContent =
                    "No es posible calcular Vsalida.";

                formulaResult.textContent =
                    "Revise tensión, frecuencia y resistencias.";

                return;
            }

            setMetric(
                0,
                "Entrada",
                formatNumber(
                    calculation.inputVpp,
                    4
                ) +
                " Vpp"
            );

            setMetric(
                1,
                "Salida",
                formatNumber(
                    calculation.outputVpp,
                    5
                ) +
                " Vpp"
            );

            setMetric(
                2,
                "R1",
                formatNumber(
                    calculation.r1Kohm,
                    4
                ) +
                " kΩ"
            );

            setMetric(
                3,
                "R2",
                formatNumber(
                    calculation.r2Kohm,
                    4
                ) +
                " kΩ"
            );

            setMetric(
                4,
                "Relación Vin/Vout",
                formatNumber(
                    calculation.attenuationRatio,
                    5
                )
            );

            setMetric(
                5,
                "Atenuación",
                formatNumber(
                    calculation.attenuationDb,
                    3
                ) +
                " dB"
            );

            formulaPanelTitle.textContent =
                "Divisor resistivo ideal";

            formulaPrimary.textContent =
                "Vsalida = Ventrada × R2 / (R1 + R2)";

            formulaOperation.textContent =
                "Vsalida = " +
                formatNumber(
                    calculation.inputVpp,
                    5
                ) +
                " × " +
                formatNumber(
                    calculation.r2Kohm,
                    5
                ) +
                " / (" +
                formatNumber(
                    calculation.r1Kohm,
                    5
                ) +
                " + " +
                formatNumber(
                    calculation.r2Kohm,
                    5
                ) +
                ") = " +
                formatNumber(
                    calculation.outputVpp,
                    5
                ) +
                " Vpp";

            formulaResult.textContent =
                "AdB = 20 × log10(" +
                formatNumber(
                    calculation.inputVpp,
                    5
                ) +
                " / " +
                formatNumber(
                    calculation.outputVpp,
                    5
                ) +
                ") = " +
                formatNumber(
                    calculation.attenuationDb,
                    3
                ) +
                " dB";
        }

        function applyDividerPreset(key) {
            dividerInputVoltage.value =
                "2";

            dividerFrequency.value =
                "1000";

            if (
                key === "half" ||
                key === "reset"
            ) {
                dividerR1.value = "1";
                dividerR2.value = "1";
            }

            if (key === "quarter") {
                dividerR1.value = "3";
                dividerR2.value = "1";
            }

            if (key === "tenth") {
                dividerR1.value = "9";
                dividerR2.value = "1";
            }

            elapsedTime = 0;

            updateInterface();
        }

        function updateInterface() {
            if (currentMode === "stage") {
                updateStageInterface();
            }

            if (currentMode === "cascade") {
                updateCascadeInterface();
            }

            if (currentMode === "divider") {
                updateDividerInterface();
            }
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

            if (currentMode === "stage") {
                applyStageExample(
                    "powerGain"
                );
            }

            if (currentMode === "cascade") {
                applyCascadePreset(
                    "mandatory"
                );
            }

            if (currentMode === "divider") {
                applyDividerPreset(
                    "reset"
                );
            }
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            if (viewWidth < 680) {
                if (currentMode === "stage") {
                    viewHeight = 760;
                } else if (
                    currentMode ===
                    "cascade"
                ) {
                    viewHeight = 980;
                } else {
                    viewHeight = 900;
                }
            } else {
                viewHeight =
                    currentMode ===
                    "cascade"
                        ? 640
                        : 600;
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
            maxWidth,
            lineHeight,
            maxLines = 3
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
                    maxWidth &&
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
                        maxLines - 1
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
                maxLines
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

        function drawArrow(
            fromX,
            fromY,
            toX,
            toY,
            color =
                "rgba(186,230,253,0.58)"
        ) {
            const angle =
                Math.atan2(
                    toY - fromY,
                    toX - fromX
                );

            const head = 8;

            ctx.save();

            ctx.strokeStyle =
                color;

            ctx.fillStyle =
                color;

            ctx.lineWidth = 1.5;

            ctx.beginPath();

            ctx.moveTo(
                fromX,
                fromY
            );

            ctx.lineTo(
                toX,
                toY
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(
                toX,
                toY
            );

            ctx.lineTo(
                toX -
                head *
                Math.cos(
                    angle -
                    Math.PI / 6
                ),
                toY -
                head *
                Math.sin(
                    angle -
                    Math.PI / 6
                )
            );

            ctx.lineTo(
                toX -
                head *
                Math.cos(
                    angle +
                    Math.PI / 6
                ),
                toY -
                head *
                Math.sin(
                    angle +
                    Math.PI / 6
                )
            );

            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        function drawGlowPoint(
            x,
            y,
            color,
            radius = 5
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

            ctx.fillStyle =
                gradient;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius * 4,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#ffffff";

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

        function drawHeader(
            title,
            subtitle,
            formulaText,
            color
        ) {
            ctx.save();

            ctx.fillStyle =
                "rgba(240,249,255,0.95)";

            ctx.font =
                "700 15px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                title,
                24,
                32
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                subtitle,
                24,
                51,
                Math.max(
                    180,
                    viewWidth - 280
                ),
                14,
                2
            );

            ctx.fillStyle =
                color;

            ctx.font =
                "700 10px Consolas, monospace";

            ctx.textAlign =
                "right";

            ctx.fillText(
                formulaText,
                viewWidth - 24,
                34
            );

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
                "rgba(255,255,255,0.90)"
            );

            gradient.addColorStop(
                0.18,
                color
            );

            gradient.addColorStop(
                1,
                hexToRgba(
                    color,
                    0.26
                )
            );

            roundedRectPath(
                x,
                baseY - height,
                width,
                height,
                8
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    color,
                    0.78
                );

            ctx.lineWidth =
                1.5;

            ctx.stroke();

            ctx.fillStyle =
                "rgba(240,249,255,0.95)";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                label,
                x + width / 2,
                baseY + 22
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.82)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            wrapText(
                valueText,
                x + width / 2,
                baseY + 41,
                width + 35,
                12,
                2
            );

            ctx.restore();
        }

        function drawStageMode() {
            const calculation =
                getStageCalculation();

            const quantity =
                calculation.quantity;

            const mobile =
                viewWidth < 680;

            drawHeader(
                quantity.title +
                ": entrada y salida de una etapa",
                "Las barras representan magnitudes relativas; no son " +
                "dimensiones físicas de una señal.",
                stageView.value === "gain"
                    ? "GdB = " +
                    quantity.factor +
                    " log10(salida/entrada)"
                    : "AdB = " +
                    quantity.factor +
                    " log10(entrada/salida)",
                quantity.color
            );

            if (!calculation.valid) {
                drawCanvasMessage(
                    "Los valores deben ser positivos.",
                    quantity.color
                );

                return;
            }

            if (!mobile) {
                drawStageDesktop(
                    calculation
                );
            } else {
                drawStageMobile(
                    calculation
                );
            }

            ctx.save();

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "El punto animado muestra el orden del proceso, no una " +
                "trayectoria ondulada de la energía.",
                viewWidth - 20,
                viewHeight - 17
            );

            ctx.restore();
        }

        function drawStageDesktop(
            calculation
        ) {
            const centerY =
                viewHeight / 2 + 25;

            const leftX =
                viewWidth * 0.20;

            const rightX =
                viewWidth * 0.80;

            const blockX =
                viewWidth / 2;

            const baseY =
                centerY + 155;

            const maxBarHeight =
                240;

            const maxValue =
                Math.max(
                    calculation.baseInput,
                    calculation.baseOutput
                );

            const inputHeight =
                Math.max(
                    8,
                    maxBarHeight *
                    calculation.baseInput /
                    maxValue
                );

            const outputHeight =
                Math.max(
                    8,
                    maxBarHeight *
                    calculation.baseOutput /
                    maxValue
                );

            const barWidth =
                95;

            drawLevelBar(
                leftX - barWidth / 2,
                baseY,
                barWidth,
                inputHeight,
                calculation.quantity.color,
                calculation.quantity.symbol +
                "entrada",
                formatNumber(
                    calculation.rawInput,
                    5
                ) +
                " " +
                stageInputUnit.value
            );

            drawLevelBar(
                rightX - barWidth / 2,
                baseY,
                barWidth,
                outputHeight,
                calculation.gainDb >= 0
                    ? "#34d399"
                    : "#fb7185",
                calculation.quantity.symbol +
                "salida",
                formatNumber(
                    calculation.rawOutput,
                    5
                ) +
                " " +
                stageOutputUnit.value
            );

            drawArrow(
                leftX + 65,
                centerY,
                blockX - 82,
                centerY
            );

            drawArrow(
                blockX + 82,
                centerY,
                rightX - 65,
                centerY
            );

            drawStageBlock(
                blockX,
                centerY,
                calculation
            );

            const progress =
                (
                    elapsedTime *
                    Number(
                        animationSpeed.value
                    ) /
                    3
                ) % 1;

            let pointX;

            if (progress < 0.5) {
                pointX =
                    leftX +
                    65 +
                    (
                        blockX -
                        82 -
                        (
                            leftX +
                            65
                        )
                    ) *
                    (
                        progress /
                        0.5
                    );
            } else {
                pointX =
                    blockX +
                    82 +
                    (
                        rightX -
                        65 -
                        (
                            blockX +
                            82
                        )
                    ) *
                    (
                        (
                            progress -
                            0.5
                        ) /
                        0.5
                    );
            }

            drawGlowPoint(
                pointX,
                centerY,
                calculation.quantity.color,
                4
            );
        }

        function drawStageMobile(
            calculation
        ) {
            const centerX =
                viewWidth / 2;

            const topY =
                145;

            const blockY =
                370;

            const bottomY =
                610;

            const barWidth =
                94;

            const maxBarHeight =
                120;

            const maxValue =
                Math.max(
                    calculation.baseInput,
                    calculation.baseOutput
                );

            const inputHeight =
                Math.max(
                    8,
                    maxBarHeight *
                    calculation.baseInput /
                    maxValue
                );

            const outputHeight =
                Math.max(
                    8,
                    maxBarHeight *
                    calculation.baseOutput /
                    maxValue
                );

            drawLevelBar(
                centerX - barWidth / 2,
                topY + 120,
                barWidth,
                inputHeight,
                calculation.quantity.color,
                calculation.quantity.symbol +
                "entrada",
                formatNumber(
                    calculation.rawInput,
                    5
                ) +
                " " +
                stageInputUnit.value
            );

            drawStageBlock(
                centerX,
                blockY,
                calculation
            );

            drawLevelBar(
                centerX - barWidth / 2,
                bottomY + 100,
                barWidth,
                outputHeight,
                calculation.gainDb >= 0
                    ? "#34d399"
                    : "#fb7185",
                calculation.quantity.symbol +
                "salida",
                formatNumber(
                    calculation.rawOutput,
                    5
                ) +
                " " +
                stageOutputUnit.value
            );

            drawArrow(
                centerX,
                topY + 145,
                centerX,
                blockY - 68
            );

            drawArrow(
                centerX,
                blockY + 68,
                centerX,
                bottomY - 30
            );

            const progress =
                (
                    elapsedTime *
                    Number(
                        animationSpeed.value
                    ) /
                    3
                ) % 1;

            let pointY;

            if (progress < 0.5) {
                pointY =
                    topY +
                    145 +
                    (
                        blockY -
                        68 -
                        (
                            topY +
                            145
                        )
                    ) *
                    (
                        progress /
                        0.5
                    );
            } else {
                pointY =
                    blockY +
                    68 +
                    (
                        bottomY -
                        30 -
                        (
                            blockY +
                            68
                        )
                    ) *
                    (
                        (
                            progress -
                            0.5
                        ) /
                        0.5
                    );
            }

            drawGlowPoint(
                centerX,
                pointY,
                calculation.quantity.color,
                4
            );
        }

        function drawStageBlock(
            x,
            y,
            calculation
        ) {
            ctx.save();

            const color =
                calculation.gainDb >= 0
                    ? "#34d399"
                    : "#fb7185";

            ctx.shadowBlur =
                20;

            ctx.shadowColor =
                color;

            roundedRectPath(
                x - 72,
                y - 58,
                144,
                116,
                13
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.96)";

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                color;

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                calculation.gainDb >= 0
                    ? "AUMENTO"
                    : "REDUCCIÓN",
                x,
                y - 25
            );

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 20px Segoe UI, sans-serif";

            ctx.fillText(
                formatSignedDb(
                    calculation.gainDb
                ),
                x,
                y + 5
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.80)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.fillText(
                stageView.value === "gain"
                    ? "ganancia con signo"
                    : "AdB = " +
                    formatSignedDb(
                        calculation.attenuationDb
                    ),
                x,
                y + 31
            );

            ctx.restore();
        }

        function drawCascadeMode() {
            const calculation =
                getCascadeCalculation();

            drawHeader(
                "Cascada de " +
                calculation.count +
                " bloque" +
                (
                    calculation.count === 1
                        ? ""
                        : "s"
                ),
                "La altura de las barras está comprimida logarítmicamente; " +
                "las etiquetas muestran la potencia calculada.",
                "Gtotal,dB = Σ Gi,dB",
                "#c084fc"
            );

            cascadeHitAreas = [];

            if (!calculation.valid) {
                drawCanvasMessage(
                    "Revise la potencia inicial y el umbral.",
                    "#fb7185"
                );

                return;
            }

            if (viewWidth < 680) {
                drawCascadeMobile(
                    calculation
                );
            } else {
                drawCascadeDesktop(
                    calculation
                );
            }

            ctx.save();

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "El movimiento indica secuencia de etapas; no representa " +
                "la velocidad física de propagación.",
                viewWidth - 20,
                viewHeight - 17
            );

            ctx.restore();
        }

        function getCascadeLevelNormalizer(
            calculation
        ) {
            const powers = [
                calculation.inputPowerWatts
            ].concat(
                calculation.rows.map(
                    function (row) {
                        return row.outputPower;
                    }
                )
            );

            const logs =
                powers.map(
                    function (power) {
                        return Math.log10(
                            Math.max(
                                power,
                                1e-30
                            )
                        );
                    }
                );

            const minimum =
                Math.min.apply(
                    null,
                    logs
                );

            const maximum =
                Math.max.apply(
                    null,
                    logs
                );

            const span =
                Math.max(
                    1,
                    maximum - minimum
                );

            return function (
                power,
                minimumHeight,
                maximumHeight
            ) {
                const normalized =
                    (
                        Math.log10(
                            Math.max(
                                power,
                                1e-30
                            )
                        ) -
                        minimum
                    ) /
                    span;

                return (
                    minimumHeight +
                    normalized *
                    (
                        maximumHeight -
                        minimumHeight
                    )
                );
            };
        }

        function drawCascadeDesktop(
            calculation
        ) {
            const count =
                calculation.count;

            const margin =
                24;

            const gap =
                12;

            const cardWidth =
                (
                    viewWidth -
                    margin * 2 -
                    gap *
                    (
                        count - 1
                    )
                ) /
                count;

            const cardHeight =
                205;

            const cardY =
                205;

            const levelBaseY =
                545;

            const levelHeight =
                getCascadeLevelNormalizer(
                    calculation
                );

            const points = [];

            calculation.rows.forEach(
                function (row, index) {
                    const cardX =
                        margin +
                        index *
                        (
                            cardWidth +
                            gap
                        );

                    const centerX =
                        cardX +
                        cardWidth / 2;

                    const selected =
                        index ===
                        selectedStageIndex;

                    const critical =
                        row.exceedsThreshold;

                    drawCascadeCard(
                        row,
                        cardX,
                        cardY,
                        cardWidth,
                        cardHeight,
                        selected,
                        critical,
                        false
                    );

                    cascadeHitAreas.push({
                        x: cardX,
                        y: cardY,
                        width: cardWidth,
                        height: cardHeight,
                        index
                    });

                    points.push({
                        x: centerX,
                        y:
                            cardY +
                            cardHeight / 2
                    });

                    if (
                        index <
                        count - 1
                    ) {
                        drawArrow(
                            cardX +
                            cardWidth +
                            2,
                            cardY +
                            cardHeight / 2,
                            cardX +
                            cardWidth +
                            gap -
                            2,
                            cardY +
                            cardHeight / 2
                        );
                    }

                    const barHeight =
                        levelHeight(
                            row.outputPower,
                            16,
                            100
                        );

                    drawMiniLevelBar(
                        centerX,
                        levelBaseY,
                        Math.min(
                            54,
                            cardWidth * 0.55
                        ),
                        barHeight,
                        critical
                            ? "#fb7185"
                            : row.type.color,
                        formatPowerWatts(
                            row.outputPower
                        )
                    );
                }
            );

            drawInputPowerLabel(
                margin,
                cardY +
                cardHeight / 2,
                calculation.inputPowerWatts
            );

            drawCascadeParticle(
                points,
                calculation
            );
        }

        function drawCascadeMobile(
            calculation
        ) {
            const margin =
                16;

            const gap =
                14;

            const cardHeight =
                108;

            const startY =
                92;

            const cardWidth =
                viewWidth -
                margin * 2;

            const points = [];

            calculation.rows.forEach(
                function (row, index) {
                    const cardY =
                        startY +
                        index *
                        (
                            cardHeight +
                            gap
                        );

                    const selected =
                        index ===
                        selectedStageIndex;

                    const critical =
                        row.exceedsThreshold;

                    drawCascadeCard(
                        row,
                        margin,
                        cardY,
                        cardWidth,
                        cardHeight,
                        selected,
                        critical,
                        true
                    );

                    cascadeHitAreas.push({
                        x: margin,
                        y: cardY,
                        width: cardWidth,
                        height: cardHeight,
                        index
                    });

                    points.push({
                        x: viewWidth / 2,
                        y:
                            cardY +
                            cardHeight / 2
                    });

                    if (
                        index <
                        calculation.count - 1
                    ) {
                        drawArrow(
                            viewWidth / 2,
                            cardY +
                            cardHeight +
                            2,
                            viewWidth / 2,
                            cardY +
                            cardHeight +
                            gap -
                            2
                        );
                    }
                }
            );

            drawCascadeParticle(
                points,
                calculation
            );
        }

        function drawCascadeCard(
            row,
            x,
            y,
            width,
            height,
            selected,
            critical,
            compact
        ) {
            ctx.save();

            if (
                selected ||
                critical
            ) {
                ctx.shadowBlur =
                    20;

                ctx.shadowColor =
                    critical
                        ? "#fb7185"
                        : row.type.color;
            }

            roundedRectPath(
                x,
                y,
                width,
                height,
                12
            );

            ctx.fillStyle =
                selected
                    ? "rgba(30,41,72,0.97)"
                    : "rgba(10,29,49,0.94)";

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                critical
                    ? "#fb7185"
                    : (
                        selected
                            ? row.type.color
                            : "rgba(125,211,252,0.18)"
                    );

            ctx.lineWidth =
                selected ||
                critical
                    ? 2
                    : 1;

            ctx.stroke();

            if (compact) {
                ctx.fillStyle =
                    row.type.color;

                ctx.beginPath();

                ctx.arc(
                    x + 38,
                    y + height / 2,
                    22,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.fillStyle =
                    "#03111f";

                ctx.font =
                    "800 10px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";

                ctx.fillText(
                    row.type.short,
                    x + 38,
                    y + height / 2
                );

                ctx.textBaseline =
                    "alphabetic";

                ctx.textAlign =
                    "left";

                ctx.fillStyle =
                    "#f0f9ff";

                ctx.font =
                    "700 12px Segoe UI, sans-serif";

                ctx.fillText(
                    (
                        row.index +
                        1
                    ) +
                    ". " +
                    row.type.title,
                    x + 75,
                    y + 28
                );

                ctx.fillStyle =
                    row.signedDb >= 0
                        ? "#6ee7b7"
                        : "#fda4af";

                ctx.font =
                    "700 15px Segoe UI, sans-serif";

                ctx.fillText(
                    formatSignedDb(
                        row.signedDb
                    ),
                    x + 75,
                    y + 52
                );

                ctx.fillStyle =
                    "rgba(199,220,235,0.80)";

                ctx.font =
                    "600 9px Segoe UI, sans-serif";

                ctx.fillText(
                    "Factor: " +
                    formatNumber(
                        row.factor,
                        5
                    ) +
                    "×",
                    x + 75,
                    y + 72
                );

                ctx.fillText(
                    "Salida: " +
                    formatPowerWatts(
                        row.outputPower
                    ),
                    x + 75,
                    y + 89
                );

                if (critical) {
                    ctx.fillStyle =
                        "#fb7185";

                    ctx.font =
                        "700 8px Segoe UI, sans-serif";

                    ctx.textAlign =
                        "right";

                    ctx.fillText(
                        "SOBRE UMBRAL",
                        x + width - 12,
                        y + 21
                    );
                }
            } else {
                ctx.fillStyle =
                    row.type.color;

                ctx.beginPath();

                ctx.arc(
                    x + width / 2,
                    y + 42,
                    23,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.fillStyle =
                    "#03111f";

                ctx.font =
                    "800 10px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";

                ctx.fillText(
                    row.type.short,
                    x + width / 2,
                    y + 42
                );

                ctx.textBaseline =
                    "alphabetic";

                ctx.fillStyle =
                    "#f0f9ff";

                ctx.font =
                    "700 10px Segoe UI, sans-serif";

                wrapText(
                    (
                        row.index +
                        1
                    ) +
                    ". " +
                    row.type.title,
                    x + width / 2,
                    y + 82,
                    width - 14,
                    14,
                    2
                );

                ctx.fillStyle =
                    row.signedDb >= 0
                        ? "#6ee7b7"
                        : "#fda4af";

                ctx.font =
                    "700 16px Segoe UI, sans-serif";

                ctx.fillText(
                    formatSignedDb(
                        row.signedDb
                    ),
                    x + width / 2,
                    y + 122
                );

                ctx.fillStyle =
                    "rgba(199,220,235,0.80)";

                ctx.font =
                    "600 8.5px Segoe UI, sans-serif";

                ctx.fillText(
                    "Factor " +
                    formatNumber(
                        row.factor,
                        5
                    ) +
                    "×",
                    x + width / 2,
                    y + 145
                );

                wrapText(
                    formatPowerWatts(
                        row.outputPower
                    ),
                    x + width / 2,
                    y + 168,
                    width - 14,
                    12,
                    2
                );

                if (critical) {
                    ctx.fillStyle =
                        "#fb7185";

                    ctx.font =
                        "700 7.5px Segoe UI, sans-serif";

                    ctx.fillText(
                        "SOBRE UMBRAL",
                        x + width / 2,
                        y + 194
                    );
                }
            }

            ctx.restore();
        }

        function drawMiniLevelBar(
            centerX,
            baseY,
            width,
            height,
            color,
            label
        ) {
            ctx.save();

            roundedRectPath(
                centerX -
                width / 2,
                baseY -
                height,
                width,
                height,
                6
            );

            ctx.fillStyle =
                hexToRgba(
                    color,
                    0.56
                );

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    color,
                    0.90
                );

            ctx.stroke();

            ctx.fillStyle =
                "rgba(199,220,235,0.78)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            wrapText(
                label,
                centerX,
                baseY + 16,
                Math.max(
                    68,
                    width + 30
                ),
                11,
                2
            );

            ctx.restore();
        }

        function drawInputPowerLabel(
            x,
            y,
            power
        ) {
            ctx.save();

            ctx.fillStyle =
                "rgba(186,230,253,0.76)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "ENTRADA",
                x,
                y - 28
            );

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.fillText(
                formatPowerWatts(
                    power
                ),
                x,
                y - 10
            );

            ctx.restore();
        }

        function drawCascadeParticle(
            points,
            calculation
        ) {
            if (
                points.length ===
                0
            ) {
                return;
            }

            if (
                points.length ===
                1
            ) {
                drawGlowPoint(
                    points[0].x,
                    points[0].y,
                    "#c084fc",
                    4
                );

                return;
            }

            const progress =
                (
                    elapsedTime *
                    Number(
                        animationSpeed.value
                    ) /
                    4
                ) % 1;

            const scaled =
                progress *
                (
                    points.length -
                    1
                );

            const index =
                Math.min(
                    points.length - 2,
                    Math.floor(
                        scaled
                    )
                );

            const local =
                scaled -
                index;

            const current =
                points[index];

            const next =
                points[
                    index + 1
                ];

            const x =
                current.x +
                (
                    next.x -
                    current.x
                ) *
                local;

            const y =
                current.y +
                (
                    next.y -
                    current.y
                ) *
                local;

            const color =
                calculation.rows[
                    Math.min(
                        index,
                        calculation.rows.length -
                        1
                    )
                ].type.color;

            drawGlowPoint(
                x,
                y,
                color,
                4
            );
        }

        function drawDividerMode() {
            const calculation =
                getDividerCalculation();

            drawHeader(
                "Atenuador resistivo didáctico",
                "Entrada y salida se miden en Vpp con el mismo criterio. " +
                "La frecuencia visual está comprimida.",
                "Vout = Vin × R2/(R1+R2)",
                "#fbbf24"
            );

            if (!calculation.valid) {
                drawCanvasMessage(
                    "Revise tensión, frecuencia y resistencias.",
                    "#fb7185"
                );

                return;
            }

            if (viewWidth < 680) {
                drawDividerMobile(
                    calculation
                );
            } else {
                drawDividerDesktop(
                    calculation
                );
            }

            ctx.save();

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "Las senoidales representan tensión respecto al tiempo, " +
                "no trayectorias espaciales de energía.",
                viewWidth - 20,
                viewHeight - 17
            );

            ctx.restore();
        }

        function drawDividerDesktop(
            calculation
        ) {
            const leftPanel = {
                x: 20,
                y: 78,
                width:
                    viewWidth *
                    0.38,
                height:
                    viewHeight -
                    125
            };

            const rightPanel = {
                x:
                    leftPanel.x +
                    leftPanel.width +
                    18,
                y: 78,
                width:
                    viewWidth -
                    (
                        leftPanel.x +
                        leftPanel.width +
                        18
                    ) -
                    20,
                height:
                    viewHeight -
                    125
            };

            drawDividerCircuit(
                calculation,
                leftPanel
            );

            drawOscilloscope(
                calculation,
                rightPanel
            );
        }

        function drawDividerMobile(
            calculation
        ) {
            const panelWidth =
                viewWidth - 32;

            drawDividerCircuit(
                calculation,
                {
                    x: 16,
                    y: 80,
                    width:
                        panelWidth,
                    height: 330
                }
            );

            drawOscilloscope(
                calculation,
                {
                    x: 16,
                    y: 430,
                    width:
                        panelWidth,
                    height: 410
                }
            );
        }

        function drawDividerCircuit(
            calculation,
            panel
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
                "rgba(2,10,24,0.62)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(125,211,252,0.15)";

            ctx.stroke();

            ctx.fillStyle =
                "#fbbf24";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "CIRCUITO EQUIVALENTE",
                panel.x + 15,
                panel.y + 24
            );

            const centerX =
                panel.x +
                panel.width / 2;

            const startY =
                panel.y + 70;

            const resistorWidth =
                Math.min(
                    140,
                    panel.width * 0.46
                );

            drawSourceSymbol(
                centerX -
                resistorWidth *
                0.85,
                startY + 92,
                calculation.inputVpp
            );

            drawResistorHorizontal(
                centerX -
                resistorWidth / 2,
                startY + 55,
                resistorWidth,
                "R1",
                calculation.r1Kohm +
                " kΩ"
            );

            drawResistorVertical(
                centerX +
                resistorWidth / 2,
                startY + 82,
                105,
                "R2",
                calculation.r2Kohm +
                " kΩ"
            );

            ctx.strokeStyle =
                "rgba(186,230,253,0.70)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                centerX -
                resistorWidth *
                0.85,
                startY + 57
            );

            ctx.lineTo(
                centerX -
                resistorWidth / 2,
                startY + 57
            );

            ctx.moveTo(
                centerX +
                resistorWidth / 2,
                startY + 57
            );

            ctx.lineTo(
                centerX +
                resistorWidth / 2,
                startY + 82
            );

            ctx.moveTo(
                centerX +
                resistorWidth / 2,
                startY + 187
            );

            ctx.lineTo(
                centerX -
                resistorWidth *
                0.85,
                startY + 187
            );

            ctx.lineTo(
                centerX -
                resistorWidth *
                0.85,
                startY + 127
            );

            ctx.stroke();

            drawGround(
                centerX +
                resistorWidth / 2,
                startY + 207
            );

            ctx.fillStyle =
                "#34d399";

            ctx.beginPath();

            ctx.arc(
                centerX +
                resistorWidth / 2,
                startY + 57,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "rgba(110,231,183,0.92)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "Vsalida",
                centerX +
                resistorWidth / 2 +
                10,
                startY + 50
            );

            const particleProgress =
                (
                    elapsedTime *
                    Number(
                        animationSpeed.value
                    ) /
                    3
                ) % 1;

            let particleX;
            let particleY;

            if (
                particleProgress <
                0.5
            ) {
                particleX =
                    centerX -
                    resistorWidth / 2 +
                    resistorWidth *
                    (
                        particleProgress /
                        0.5
                    );

                particleY =
                    startY + 57;
            } else {
                particleX =
                    centerX +
                    resistorWidth / 2;

                particleY =
                    startY +
                    82 +
                    105 *
                    (
                        (
                            particleProgress -
                            0.5
                        ) /
                        0.5
                    );
            }

            drawGlowPoint(
                particleX,
                particleY,
                "#fbbf24",
                4
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.82)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Vin = " +
                formatNumber(
                    calculation.inputVpp,
                    4
                ) +
                " Vpp",
                centerX,
                panel.y +
                panel.height -
                54
            );

            ctx.fillText(
                "Vout = " +
                formatNumber(
                    calculation.outputVpp,
                    5
                ) +
                " Vpp",
                centerX,
                panel.y +
                panel.height -
                36
            );

            ctx.fillText(
                "Alta impedancia de medición",
                centerX,
                panel.y +
                panel.height -
                18
            );

            ctx.restore();
        }

        function drawSourceSymbol(
            x,
            y,
            inputVpp
        ) {
            ctx.save();

            ctx.strokeStyle =
                "#38bdf8";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                35,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            ctx.beginPath();

            for (
                let offset = -23;
                offset <= 23;
                offset += 1
            ) {
                const waveY =
                    y +
                    Math.sin(
                        offset /
                        23 *
                        Math.PI *
                        2
                    ) *
                    10;

                if (offset === -23) {
                    ctx.moveTo(
                        x + offset,
                        waveY
                    );
                } else {
                    ctx.lineTo(
                        x + offset,
                        waveY
                    );
                }
            }

            ctx.stroke();

            ctx.fillStyle =
                "rgba(186,230,253,0.84)";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                formatNumber(
                    inputVpp,
                    4
                ) +
                " Vpp",
                x,
                y + 52
            );

            ctx.restore();
        }

        function drawResistorHorizontal(
            x,
            y,
            width,
            label,
            value
        ) {
            ctx.save();

            ctx.strokeStyle =
                "#fbbf24";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                x,
                y
            );

            const segments =
                8;

            const segmentWidth =
                width /
                segments;

            for (
                let index = 0;
                index <= segments;
                index += 1
            ) {
                const px =
                    x +
                    index *
                    segmentWidth;

                const py =
                    index === 0 ||
                    index === segments
                        ? y
                        : y +
                        (
                            index % 2 === 0
                                ? -12
                                : 12
                        );

                ctx.lineTo(
                    px,
                    py
                );
            }

            ctx.stroke();

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                label +
                " = " +
                value,
                x + width / 2,
                y - 23
            );

            ctx.restore();
        }

        function drawResistorVertical(
            x,
            y,
            height,
            label,
            value
        ) {
            ctx.save();

            ctx.strokeStyle =
                "#fbbf24";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                x,
                y
            );

            const segments =
                8;

            const segmentHeight =
                height /
                segments;

            for (
                let index = 0;
                index <= segments;
                index += 1
            ) {
                const py =
                    y +
                    index *
                    segmentHeight;

                const px =
                    index === 0 ||
                    index === segments
                        ? x
                        : x +
                        (
                            index % 2 === 0
                                ? -12
                                : 12
                        );

                ctx.lineTo(
                    px,
                    py
                );
            }

            ctx.stroke();

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                label +
                " = " +
                value,
                x + 20,
                y +
                height / 2 +
                3
            );

            ctx.restore();
        }

        function drawGround(
            x,
            y
        ) {
            ctx.save();

            ctx.strokeStyle =
                "rgba(186,230,253,0.72)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                x,
                y - 20
            );

            ctx.lineTo(
                x,
                y
            );

            ctx.moveTo(
                x - 16,
                y
            );

            ctx.lineTo(
                x + 16,
                y
            );

            ctx.moveTo(
                x - 11,
                y + 6
            );

            ctx.lineTo(
                x + 11,
                y + 6
            );

            ctx.moveTo(
                x - 6,
                y + 12
            );

            ctx.lineTo(
                x + 6,
                y + 12
            );

            ctx.stroke();

            ctx.restore();
        }

        function drawOscilloscope(
            calculation,
            panel
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
                "rgba(2,10,24,0.62)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(125,211,252,0.15)";

            ctx.stroke();

            ctx.fillStyle =
                "#fbbf24";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "OSCILOSCOPIO VIRTUAL",
                panel.x + 15,
                panel.y + 24
            );

            const plot = {
                x:
                    panel.x +
                    45,
                y:
                    panel.y +
                    55,
                width:
                    panel.width -
                    70,
                height:
                    panel.height -
                    115
            };

            ctx.strokeStyle =
                "rgba(125,211,252,0.08)";

            ctx.lineWidth = 1;

            for (
                let x = plot.x;
                x <=
                plot.x +
                plot.width;
                x +=
                Math.max(
                    30,
                    plot.width / 10
                )
            ) {
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
                let y = plot.y;
                y <=
                plot.y +
                plot.height;
                y +=
                Math.max(
                    28,
                    plot.height / 8
                )
            ) {
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

            const centerY =
                plot.y +
                plot.height / 2;

            ctx.strokeStyle =
                "rgba(186,230,253,0.35)";

            ctx.beginPath();

            ctx.moveTo(
                plot.x,
                centerY
            );

            ctx.lineTo(
                plot.x +
                plot.width,
                centerY
            );

            ctx.stroke();

            const inputPeak =
                calculation.inputVpp /
                2;

            const outputPeak =
                calculation.outputVpp /
                2;

            const scale =
                plot.height *
                0.38 /
                Math.max(
                    inputPeak,
                    1e-9
                );

            const inputAmplitude =
                inputPeak *
                scale;

            const outputAmplitude =
                outputPeak *
                scale;

            const visualCycles =
                clamp(
                    3 +
                    Math.log10(
                        Math.max(
                            calculation.frequencyHz,
                            1
                        )
                    ) *
                    0.65,
                    3,
                    7
                );

            const visualPhase =
                elapsedTime *
                Math.PI *
                2 *
                0.45 *
                Number(
                    animationSpeed.value
                );

            drawOscilloscopeWave(
                plot,
                centerY,
                inputAmplitude,
                visualCycles,
                visualPhase,
                "#38bdf8",
                2.2
            );

            drawOscilloscopeWave(
                plot,
                centerY,
                outputAmplitude,
                visualCycles,
                visualPhase,
                "#34d399",
                2.2
            );

            ctx.fillStyle =
                "#38bdf8";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "CANAL A · Entrada " +
                formatNumber(
                    calculation.inputVpp,
                    4
                ) +
                " Vpp",
                plot.x,
                panel.y +
                panel.height -
                40
            );

            ctx.fillStyle =
                "#34d399";

            ctx.fillText(
                "CANAL B · Salida " +
                formatNumber(
                    calculation.outputVpp,
                    5
                ) +
                " Vpp",
                plot.x,
                panel.y +
                panel.height -
                22
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.75)";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "f = " +
                formatNumber(
                    calculation.frequencyHz,
                    4
                ) +
                " Hz · visual comprimida",
                plot.x +
                plot.width,
                panel.y +
                panel.height -
                22
            );

            ctx.restore();
        }

        function drawOscilloscopeWave(
            plot,
            centerY,
            amplitude,
            cycles,
            phase,
            color,
            width
        ) {
            ctx.save();

            ctx.beginPath();

            for (
                let x = plot.x;
                x <=
                plot.x +
                plot.width;
                x += 2
            ) {
                const normalized =
                    (
                        x -
                        plot.x
                    ) /
                    plot.width;

                const y =
                    centerY -
                    Math.sin(
                        normalized *
                        Math.PI *
                        2 *
                        cycles -
                        phase
                    ) *
                    amplitude;

                if (x === plot.x) {
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
                width;

            ctx.shadowBlur =
                10;

            ctx.shadowColor =
                color;

            ctx.lineCap =
                "round";

            ctx.lineJoin =
                "round";

            ctx.stroke();

            ctx.restore();
        }

        function drawCanvasMessage(
            message,
            color
        ) {
            ctx.save();

            ctx.fillStyle =
                color;

            ctx.font =
                "700 16px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                message,
                viewWidth / 2,
                viewHeight / 2
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.74)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            ctx.fillText(
                "Los cálculos logarítmicos requieren valores positivos.",
                viewWidth / 2,
                viewHeight / 2 +
                24
            );

            ctx.restore();
        }

        function selectCascadeStageFromCanvas(
            event
        ) {
            if (
                currentMode !==
                "cascade"
            ) {
                return;
            }

            const rect =
                canvas.getBoundingClientRect();

            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;

            const hit =
                cascadeHitAreas.find(
                    function (area) {
                        return (
                            x >= area.x &&
                            x <=
                            area.x +
                            area.width &&
                            y >= area.y &&
                            y <=
                            area.y +
                            area.height
                        );
                    }
                );

            if (hit) {
                selectedStageIndex =
                    hit.index;

                updateInterface();
            }
        }

        function drawScene() {
            drawBackground();

            if (
                currentMode ===
                "stage"
            ) {
                drawStageMode();
            }

            if (
                currentMode ===
                "cascade"
            ) {
                drawCascadeMode();
            }

            if (
                currentMode ===
                "divider"
            ) {
                drawDividerMode();
            }
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
                    deltaTime;

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

        createStageSelectors();
        configureStageQuantity(true);
        setMode("stage");

        requestAnimationFrame(
            function startAnimation(time) {
                lastFrameTime = time;
                animate(time);
            }
        );
    
