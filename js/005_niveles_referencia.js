        "use strict";

        /*
         * SIT-400 — Clase 5
         * Niveles de referencia: dBm, dBW, dBV, dBu y dBmV.
         * Archivo autónomo sin bibliotecas externas.
         */

        const canvas =
            document.getElementById(
                "simulationCanvas"
            );

        const canvasContainer =
            document.getElementById(
                "canvasContainer"
            );

        const ctx =
            canvas.getContext("2d");

        const modeButtons =
            Array.from(
                document.querySelectorAll(
                    ".mode-button"
                )
            );

        const exampleButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-example]"
                )
            );

        const conversionPresetButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-conversion]"
                )
            );

        const canvasTitle =
            document.getElementById(
                "canvasTitle"
            );

        const simulationStatus =
            document.getElementById(
                "simulationStatus"
            );

        const metricLabels = [
            document.getElementById(
                "metricLabel1"
            ),
            document.getElementById(
                "metricLabel2"
            ),
            document.getElementById(
                "metricLabel3"
            ),
            document.getElementById(
                "metricLabel4"
            ),
            document.getElementById(
                "metricLabel5"
            ),
            document.getElementById(
                "metricLabel6"
            )
        ];

        const metricValues = [
            document.getElementById(
                "metricValue1"
            ),
            document.getElementById(
                "metricValue2"
            ),
            document.getElementById(
                "metricValue3"
            ),
            document.getElementById(
                "metricValue4"
            ),
            document.getElementById(
                "metricValue5"
            ),
            document.getElementById(
                "metricValue6"
            )
        ];

        const calculatorControls =
            document.getElementById(
                "calculatorControls"
            );

        const conversionControls =
            document.getElementById(
                "conversionControls"
            );

        const referenceControls =
            document.getElementById(
                "referenceControls"
            );

        const calculatorUnit =
            document.getElementById(
                "calculatorUnit"
            );

        const calculatorDirection =
            document.getElementById(
                "calculatorDirection"
            );

        const calculatorInput =
            document.getElementById(
                "calculatorInput"
            );

        const calculatorInputLabel =
            document.getElementById(
                "calculatorInputLabel"
            );

        const calculatorPhysicalUnit =
            document.getElementById(
                "calculatorPhysicalUnit"
            );

        const calculatorPhysicalUnitLabel =
            document.getElementById(
                "calculatorPhysicalUnitLabel"
            );

        const sourceLevelUnit =
            document.getElementById(
                "sourceLevelUnit"
            );

        const sourceLevelValue =
            document.getElementById(
                "sourceLevelValue"
            );

        const targetLevelUnit =
            document.getElementById(
                "targetLevelUnit"
            );

        const impedanceGroup =
            document.getElementById(
                "impedanceGroup"
            );

        const conversionImpedance =
            document.getElementById(
                "conversionImpedance"
            );

        const conversionAlert =
            document.getElementById(
                "conversionAlert"
            );

        const highlightReference =
            document.getElementById(
                "highlightReference"
            );

        const animationSpeed =
            document.getElementById(
                "animationSpeed"
            );

        const animationSpeedDisplay =
            document.getElementById(
                "animationSpeedDisplay"
            );

        const formulaPanelTitle =
            document.getElementById(
                "formulaPanelTitle"
            );

        const formulaPrimary =
            document.getElementById(
                "formulaPrimary"
            );

        const formulaOperation =
            document.getElementById(
                "formulaOperation"
            );

        const formulaResult =
            document.getElementById(
                "formulaResult"
            );

        const pauseButton =
            document.getElementById(
                "pauseButton"
            );

        const continueButton =
            document.getElementById(
                "continueButton"
            );

        const restartButton =
            document.getElementById(
                "restartButton"
            );

        const explanation =
            document.getElementById(
                "explanation"
            );

        const technicalNote =
            document.getElementById(
                "technicalNote"
            );

        const referenceUnits = {
            dBm: {
                key: "dBm",
                quantity: "power",
                quantityLabel: "Potencia",
                referenceBase: 1e-3,
                referenceLabel: "1 mW",
                factor: 10,
                color: "#38bdf8",
                rgb: "56, 189, 248",
                zeroMeaning:
                    "0 dBm = 1 mW",
                directFormula:
                    "dBm = 10 × log10(P / 1 mW)",
                inverseFormula:
                    "P = 1 mW × 10^(dBm / 10)",
                physicalUnits: [
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
                ]
            },

            dBW: {
                key: "dBW",
                quantity: "power",
                quantityLabel: "Potencia",
                referenceBase: 1,
                referenceLabel: "1 W",
                factor: 10,
                color: "#34d399",
                rgb: "52, 211, 153",
                zeroMeaning:
                    "0 dBW = 1 W",
                directFormula:
                    "dBW = 10 × log10(P / 1 W)",
                inverseFormula:
                    "P = 1 W × 10^(dBW / 10)",
                physicalUnits: [
                    {
                        label: "W",
                        factor: 1
                    },
                    {
                        label: "mW",
                        factor: 1e-3
                    },
                    {
                        label: "kW",
                        factor: 1e3
                    }
                ]
            },

            dBV: {
                key: "dBV",
                quantity: "voltage",
                quantityLabel: "Tensión RMS",
                referenceBase: 1,
                referenceLabel:
                    "1 V RMS",
                factor: 20,
                color: "#c084fc",
                rgb: "192, 132, 252",
                zeroMeaning:
                    "0 dBV = 1 V RMS",
                directFormula:
                    "dBV = 20 × log10(V RMS / 1 V RMS)",
                inverseFormula:
                    "V RMS = 1 V × 10^(dBV / 20)",
                physicalUnits: [
                    {
                        label: "V RMS",
                        factor: 1
                    },
                    {
                        label: "mV RMS",
                        factor: 1e-3
                    },
                    {
                        label: "µV RMS",
                        factor: 1e-6
                    }
                ]
            },

            dBu: {
                key: "dBu",
                quantity: "voltage",
                quantityLabel: "Tensión RMS",
                referenceBase: 0.775,
                referenceLabel:
                    "0,775 V RMS",
                factor: 20,
                color: "#fbbf24",
                rgb: "251, 191, 36",
                zeroMeaning:
                    "0 dBu = 0,775 V RMS",
                directFormula:
                    "dBu = 20 × log10(V RMS / 0,775 V RMS)",
                inverseFormula:
                    "V RMS = 0,775 V × 10^(dBu / 20)",
                physicalUnits: [
                    {
                        label: "V RMS",
                        factor: 1
                    },
                    {
                        label: "mV RMS",
                        factor: 1e-3
                    },
                    {
                        label: "µV RMS",
                        factor: 1e-6
                    }
                ]
            },

            dBmV: {
                key: "dBmV",
                quantity: "voltage",
                quantityLabel: "Tensión RMS",
                referenceBase: 1e-3,
                referenceLabel:
                    "1 mV RMS",
                factor: 20,
                color: "#fb923c",
                rgb: "251, 146, 60",
                zeroMeaning:
                    "0 dBmV = 1 mV RMS",
                directFormula:
                    "dBmV = 20 × log10(V RMS / 1 mV RMS)",
                inverseFormula:
                    "V RMS = 1 mV × 10^(dBmV / 20)",
                physicalUnits: [
                    {
                        label: "V RMS",
                        factor: 1
                    },
                    {
                        label: "mV RMS",
                        factor: 1e-3
                    },
                    {
                        label: "µV RMS",
                        factor: 1e-6
                    }
                ]
            }
        };

        const calculatorExamples = {
            "10mWToDbm": {
                unit: "dBm",
                direction:
                    "linearToLevel",
                value: 10,
                physicalUnit: "mW"
            },

            minus10DbmToMw: {
                unit: "dBm",
                direction:
                    "levelToLinear",
                value: -10,
                physicalUnit: "mW"
            },

            "100WToDbw": {
                unit: "dBW",
                direction:
                    "linearToLevel",
                value: 100,
                physicalUnit: "W"
            },

            "2VToDbv": {
                unit: "dBV",
                direction:
                    "linearToLevel",
                value: 2,
                physicalUnit: "V RMS"
            },

            "0775VToDbu": {
                unit: "dBu",
                direction:
                    "linearToLevel",
                value: 0.775,
                physicalUnit: "V RMS"
            },

            "100mVToDbmv": {
                unit: "dBmV",
                direction:
                    "linearToLevel",
                value: 100,
                physicalUnit: "mV RMS"
            },

            "20DbmvToMv": {
                unit: "dBmV",
                direction:
                    "levelToLinear",
                value: 20,
                physicalUnit: "mV RMS"
            },

            zeroDbv: {
                unit: "dBV",
                direction:
                    "levelToLinear",
                value: 0,
                physicalUnit: "V RMS"
            }
        };

        const conversionExamples = {
            "20DbwToDbm": {
                sourceUnit: "dBW",
                sourceValue: 20,
                targetUnit: "dBm",
                impedance: 100
            },

            zeroDbvToDbu: {
                sourceUnit: "dBV",
                sourceValue: 0,
                targetUnit: "dBu",
                impedance: 100
            },

            zeroDbvToDbmv: {
                sourceUnit: "dBV",
                sourceValue: 0,
                targetUnit: "dBmV",
                impedance: 100
            },

            zeroDbuToDbmv: {
                sourceUnit: "dBu",
                sourceValue: 0,
                targetUnit: "dBmV",
                impedance: 100
            },

            zeroDbvToDbm: {
                sourceUnit: "dBV",
                sourceValue: 0,
                targetUnit: "dBm",
                impedance: 100
            },

            zeroDbmToDbv: {
                sourceUnit: "dBm",
                sourceValue: 0,
                targetUnit: "dBV",
                impedance: 100
            },

            fortyDbmvToDbv: {
                sourceUnit: "dBmV",
                sourceValue: 40,
                targetUnit: "dBV",
                impedance: 100
            },

            tenDbmToDbw: {
                sourceUnit: "dBm",
                sourceValue: 10,
                targetUnit: "dBW",
                impedance: 100
            }
        };

        let currentMode =
            "calculator";

        let elapsedTime = 0;

        let lastFrameTime =
            performance.now();

        let isPaused = false;

        let viewWidth = 1000;
        let viewHeight = 610;
        let pixelRatio = 1;

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
            calculatorUnit,
            calculatorDirection,
            calculatorInput,
            calculatorPhysicalUnit
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

        calculatorUnit.addEventListener(
            "change",
            function () {
                configureCalculatorUnit(
                    true
                );
            }
        );

        calculatorDirection.addEventListener(
            "change",
            function () {
                configureCalculatorDirection(
                    true
                );
            }
        );

        exampleButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyCalculatorExample(
                            button.dataset.example
                        );
                    }
                );
            }
        );

        [
            sourceLevelUnit,
            sourceLevelValue,
            targetLevelUnit,
            conversionImpedance
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

        conversionPresetButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        applyConversionExample(
                            button.dataset.conversion
                        );
                    }
                );
            }
        );

        highlightReference.addEventListener(
            "change",
            updateInterface
        );

        animationSpeed.addEventListener(
            "input",
            function () {
                updateSpeedDisplay();
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

        function formatNumber(
            value,
            maximumDecimals = 4
        ) {
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
                    maximumFractionDigits:
                        maximumDecimals
                }
            ).format(value);
        }

        function formatSignedLevel(
            value,
            unit
        ) {
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
                " " +
                unit
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

        function getPhysicalUnitFactor(
            reference,
            label
        ) {
            const unit =
                reference.physicalUnits.find(
                    function (item) {
                        return (
                            item.label ===
                            label
                        );
                    }
                );

            return unit
                ? unit.factor
                : 1;
        }

        function setPhysicalUnitOptions(
            reference,
            selectedLabel
        ) {
            calculatorPhysicalUnit.innerHTML =
                "";

            reference.physicalUnits.forEach(
                function (unit) {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        unit.label;

                    option.textContent =
                        unit.label;

                    calculatorPhysicalUnit
                        .appendChild(
                            option
                        );
                }
            );

            const exists =
                reference.physicalUnits.some(
                    function (unit) {
                        return (
                            unit.label ===
                            selectedLabel
                        );
                    }
                );

            calculatorPhysicalUnit.value =
                exists
                    ? selectedLabel
                    : reference
                        .physicalUnits[0]
                        .label;
        }

        function setMode(mode) {
            currentMode = mode;
            elapsedTime = 0;

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

            calculatorControls.hidden =
                mode !== "calculator";

            conversionControls.hidden =
                mode !== "conversion";

            referenceControls.hidden =
                mode !== "references";

            if (mode === "calculator") {
                const reference =
                    referenceUnits[
                        calculatorUnit.value
                    ];

                setActiveColor(
                    reference.color,
                    reference.rgb
                );

                canvasTitle.textContent =
                    "Comparación entre una magnitud y su referencia fija";

                explanation.innerHTML =
                    "<strong>Nivel referido:</strong> " +
                    "compara una magnitud física con una referencia fija. " +
                    "Un nivel positivo está por encima de la referencia; " +
                    "cero coincide con ella; y un nivel negativo está por debajo.";

                technicalNote.innerHTML =
                    "<strong>Representación visual:</strong> " +
                    "las barras y la escala logarítmica están comprimidas " +
                    "para mostrar relaciones muy grandes o pequeñas. " +
                    "No representan tamaños físicos ni trayectorias de energía.";
            }

            if (mode === "conversion") {
                const source =
                    referenceUnits[
                        sourceLevelUnit.value
                    ];

                setActiveColor(
                    source.color,
                    source.rgb
                );

                canvasTitle.textContent =
                    "Conversión entre referencias de potencia o tensión";

                explanation.innerHTML =
                    "<strong>Conversión de niveles:</strong> " +
                    "cuando origen y destino representan la misma magnitud, " +
                    "la conversión es directa. Para pasar entre tensión y " +
                    "potencia debe conocerse la carga.";

                technicalNote.innerHTML =
                    "<strong>Modelo tensión ↔ potencia:</strong> " +
                    "se utiliza P = V RMS²/R o V RMS = √(P·R), suponiendo " +
                    "una carga resistiva equivalente. No se modelan " +
                    "impedancias complejas ni factor de potencia.";
            }

            if (mode === "references") {
                const reference =
                    referenceUnits[
                        highlightReference.value
                    ];

                setActiveColor(
                    reference.color,
                    reference.rgb
                );

                canvasTitle.textContent =
                    "Mapa separado de referencias de potencia y tensión";

                explanation.innerHTML =
                    "<strong>Mapa de referencias:</strong> " +
                    "la línea superior compara referencias de potencia; " +
                    "la inferior compara referencias de tensión RMS. " +
                    "Las dos líneas no deben mezclarse sin una relación " +
                    "física adicional.";

                technicalNote.innerHTML =
                    "<strong>Lectura:</strong> " +
                    "0 dBm, 0 dBW, 0 dBV, 0 dBu y 0 dBmV no representan " +
                    "ausencia de señal. Cada cero coincide con su propia " +
                    "referencia fija.";
            }

            resizeCanvas();
            updateInterface();
        }

        function configureCalculatorUnit(
            resetValues
        ) {
            const reference =
                referenceUnits[
                    calculatorUnit.value
                ];

            const previousUnit =
                calculatorPhysicalUnit.value;

            setPhysicalUnitOptions(
                reference,
                previousUnit
            );

            setActiveColor(
                reference.color,
                reference.rgb
            );

            if (resetValues) {
                if (
                    reference.key ===
                    "dBm"
                ) {
                    calculatorDirection.value =
                        "linearToLevel";

                    calculatorInput.value =
                        "10";

                    calculatorPhysicalUnit.value =
                        "mW";
                } else if (
                    reference.key ===
                    "dBW"
                ) {
                    calculatorDirection.value =
                        "linearToLevel";

                    calculatorInput.value =
                        "100";

                    calculatorPhysicalUnit.value =
                        "W";
                } else if (
                    reference.key ===
                    "dBV"
                ) {
                    calculatorDirection.value =
                        "linearToLevel";

                    calculatorInput.value =
                        "2";

                    calculatorPhysicalUnit.value =
                        "V RMS";
                } else if (
                    reference.key ===
                    "dBu"
                ) {
                    calculatorDirection.value =
                        "linearToLevel";

                    calculatorInput.value =
                        "0.775";

                    calculatorPhysicalUnit.value =
                        "V RMS";
                } else {
                    calculatorDirection.value =
                        "linearToLevel";

                    calculatorInput.value =
                        "100";

                    calculatorPhysicalUnit.value =
                        "mV RMS";
                }
            }

            configureCalculatorDirection(
                false
            );
        }

        function configureCalculatorDirection(
            resetValue
        ) {
            const reference =
                referenceUnits[
                    calculatorUnit.value
                ];

            const direction =
                calculatorDirection.value;

            if (
                direction ===
                "linearToLevel"
            ) {
                calculatorInputLabel.textContent =
                    reference.quantityLabel;

                calculatorPhysicalUnitLabel.textContent =
                    "Unidad de entrada";

                if (resetValue) {
                    calculatorInput.value =
                        "1";
                }
            } else {
                calculatorInputLabel.textContent =
                    "Nivel en " +
                    reference.key;

                calculatorPhysicalUnitLabel.textContent =
                    "Unidad física de salida";

                if (resetValue) {
                    calculatorInput.value =
                        "0";
                }
            }

            updateInterface();
        }

        function getCalculatorResult() {
            const reference =
                referenceUnits[
                    calculatorUnit.value
                ];

            const direction =
                calculatorDirection.value;

            const input =
                Number(
                    calculatorInput.value
                );

            const unitFactor =
                getPhysicalUnitFactor(
                    reference,
                    calculatorPhysicalUnit.value
                );

            if (!Number.isFinite(input)) {
                return {
                    valid: false,
                    reference,
                    direction
                };
            }

            if (
                direction ===
                "linearToLevel"
            ) {
                const physicalBase =
                    input *
                    unitFactor;

                const valid =
                    physicalBase > 0;

                const ratio =
                    valid
                        ? physicalBase /
                            reference.referenceBase
                        : NaN;

                const level =
                    valid
                        ? reference.factor *
                            Math.log10(
                                ratio
                            )
                        : NaN;

                return {
                    valid,
                    reference,
                    direction,
                    input,
                    physicalBase,
                    physicalDisplay:
                        input,
                    ratio,
                    level
                };
            }

            const level =
                input;

            const ratio =
                Math.pow(
                    10,
                    level /
                    reference.factor
                );

            const physicalBase =
                reference.referenceBase *
                ratio;

            const physicalDisplay =
                physicalBase /
                unitFactor;

            return {
                valid:
                    Number.isFinite(
                        physicalBase
                    ) &&
                    physicalBase > 0,
                reference,
                direction,
                input,
                physicalBase,
                physicalDisplay,
                ratio,
                level
            };
        }

        function getReferenceInterpretation(
            level
        ) {
            if (!Number.isFinite(level)) {
                return "Valor no válido";
            }

            if (
                Math.abs(level) <
                0.0005
            ) {
                return "Igual a la referencia";
            }

            return level > 0
                ? "Sobre la referencia"
                : "Bajo la referencia";
        }

        function formatPhysicalBase(
            value,
            quantity
        ) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            if (quantity === "power") {
                if (value >= 1000) {
                    return (
                        formatNumber(
                            value / 1000,
                            6
                        ) +
                        " kW"
                    );
                }

                if (value >= 1) {
                    return (
                        formatNumber(
                            value,
                            6
                        ) +
                        " W"
                    );
                }

                if (value >= 1e-3) {
                    return (
                        formatNumber(
                            value * 1e3,
                            6
                        ) +
                        " mW"
                    );
                }

                if (value >= 1e-6) {
                    return (
                        formatNumber(
                            value * 1e6,
                            6
                        ) +
                        " µW"
                    );
                }

                return (
                    formatNumber(
                        value * 1e9,
                        6
                    ) +
                    " nW"
                );
            }

            if (value >= 1) {
                return (
                    formatNumber(
                        value,
                        6
                    ) +
                    " V RMS"
                );
            }

            if (value >= 1e-3) {
                return (
                    formatNumber(
                        value * 1e3,
                        6
                    ) +
                    " mV RMS"
                );
            }

            return (
                formatNumber(
                    value * 1e6,
                    6
                ) +
                " µV RMS"
            );
        }

        function updateCalculatorInterface() {
            const result =
                getCalculatorResult();

            const reference =
                result.reference;

            setActiveColor(
                reference.color,
                reference.rgb
            );

            if (!result.valid) {
                setMetric(
                    0,
                    "Magnitud",
                    reference.quantityLabel
                );

                setMetric(
                    1,
                    "Referencia",
                    reference.referenceLabel
                );

                setMetric(
                    2,
                    "Valor lineal",
                    "—"
                );

                setMetric(
                    3,
                    "Nivel referido",
                    "—"
                );

                setMetric(
                    4,
                    "Relación",
                    "—"
                );

                setMetric(
                    5,
                    "Interpretación",
                    "Entrada inválida"
                );

                formulaPanelTitle.textContent =
                    "Cálculo del nivel referido";

                formulaPrimary.textContent =
                    reference.directFormula;

                formulaOperation.textContent =
                    "La magnitud física debe ser positiva y mayor que cero.";

                formulaResult.textContent =
                    "Revise el valor introducido.";

                return;
            }

            setMetric(
                0,
                "Magnitud",
                reference.quantityLabel
            );

            setMetric(
                1,
                "Referencia",
                reference.referenceLabel
            );

            setMetric(
                2,
                "Valor lineal",
                formatPhysicalBase(
                    result.physicalBase,
                    reference.quantity
                )
            );

            setMetric(
                3,
                "Nivel referido",
                formatSignedLevel(
                    result.level,
                    reference.key
                )
            );

            setMetric(
                4,
                "Relación con referencia",
                formatNumber(
                    result.ratio,
                    7
                ) +
                "×"
            );

            setMetric(
                5,
                "Interpretación",
                getReferenceInterpretation(
                    result.level
                )
            );

            formulaPanelTitle.textContent =
                "Cálculo de " +
                reference.key;

            if (
                result.direction ===
                "linearToLevel"
            ) {
                formulaPrimary.textContent =
                    reference.directFormula;

                formulaOperation.textContent =
                    reference.key +
                    " = " +
                    reference.factor +
                    " × log10(" +
                    formatPhysicalBase(
                        result.physicalBase,
                        reference.quantity
                    ) +
                    " / " +
                    reference.referenceLabel +
                    ")";

                formulaResult.textContent =
                    formatPhysicalBase(
                        result.physicalBase,
                        reference.quantity
                    ) +
                    " = " +
                    formatSignedLevel(
                        result.level,
                        reference.key
                    ) +
                    " · " +
                    getReferenceInterpretation(
                        result.level
                    ).toLowerCase();
            } else {
                formulaPrimary.textContent =
                    reference.inverseFormula;

                formulaOperation.textContent =
                    "Relación = 10^(" +
                    formatNumber(
                        result.level,
                        5
                    ) +
                    " / " +
                    reference.factor +
                    ") = " +
                    formatNumber(
                        result.ratio,
                        8
                    );

                formulaResult.textContent =
                    formatSignedLevel(
                        result.level,
                        reference.key
                    ) +
                    " = " +
                    formatNumber(
                        result.physicalDisplay,
                        8
                    ) +
                    " " +
                    calculatorPhysicalUnit.value;
            }
        }

        function applyCalculatorExample(key) {
            const example =
                calculatorExamples[key];

            if (!example) {
                return;
            }

            calculatorUnit.value =
                example.unit;

            configureCalculatorUnit(
                false
            );

            calculatorDirection.value =
                example.direction;

            calculatorInput.value =
                String(
                    example.value
                );

            calculatorPhysicalUnit.value =
                example.physicalUnit;

            configureCalculatorDirection(
                false
            );

            elapsedTime = 0;
            updateInterface();
        }

        function getConversionResult() {
            const source =
                referenceUnits[
                    sourceLevelUnit.value
                ];

            const target =
                referenceUnits[
                    targetLevelUnit.value
                ];

            const sourceLevel =
                Number(
                    sourceLevelValue.value
                );

            const resistance =
                Number(
                    conversionImpedance.value
                );

            if (
                !Number.isFinite(
                    sourceLevel
                )
            ) {
                return {
                    valid: false,
                    source,
                    target,
                    reason:
                        "Nivel de origen inválido"
                };
            }

            const sourcePhysical =
                source.referenceBase *
                Math.pow(
                    10,
                    sourceLevel /
                    source.factor
                );

            const sameQuantity =
                source.quantity ===
                target.quantity;

            let targetPhysical =
                sourcePhysical;

            let crossFormula =
                "Conversión directa dentro de la misma magnitud";

            if (!sameQuantity) {
                if (
                    !Number.isFinite(
                        resistance
                    ) ||
                    resistance <= 0
                ) {
                    return {
                        valid: false,
                        source,
                        target,
                        sourceLevel,
                        sourcePhysical,
                        sameQuantity,
                        reason:
                            "Se requiere una carga resistiva positiva"
                    };
                }

                if (
                    source.quantity ===
                        "voltage" &&
                    target.quantity ===
                        "power"
                ) {
                    targetPhysical =
                        Math.pow(
                            sourcePhysical,
                            2
                        ) /
                        resistance;

                    crossFormula =
                        "P = V RMS² / R";
                } else {
                    targetPhysical =
                        Math.sqrt(
                            sourcePhysical *
                            resistance
                        );

                    crossFormula =
                        "V RMS = √(P × R)";
                }
            }

            const targetLevel =
                target.factor *
                Math.log10(
                    targetPhysical /
                    target.referenceBase
                );

            return {
                valid:
                    Number.isFinite(
                        sourcePhysical
                    ) &&
                    sourcePhysical > 0 &&
                    Number.isFinite(
                        targetPhysical
                    ) &&
                    targetPhysical > 0 &&
                    Number.isFinite(
                        targetLevel
                    ),
                source,
                target,
                sourceLevel,
                sourcePhysical,
                targetPhysical,
                targetLevel,
                sameQuantity,
                resistance,
                crossFormula
            };
        }

        function updateConversionInterface() {
            const source =
                referenceUnits[
                    sourceLevelUnit.value
                ];

            const target =
                referenceUnits[
                    targetLevelUnit.value
                ];

            const sameQuantity =
                source.quantity ===
                target.quantity;

            impedanceGroup.hidden =
                sameQuantity;

            setActiveColor(
                source.color,
                source.rgb
            );

            const result =
                getConversionResult();

            if (!result.valid) {
                setMetric(
                    0,
                    "Origen",
                    source.key
                );

                setMetric(
                    1,
                    "Magnitud origen",
                    source.quantityLabel
                );

                setMetric(
                    2,
                    "Valor físico origen",
                    "—"
                );

                setMetric(
                    3,
                    "Destino",
                    target.key
                );

                setMetric(
                    4,
                    "Valor físico destino",
                    "—"
                );

                setMetric(
                    5,
                    "Resultado",
                    "—"
                );

                conversionAlert.className =
                    "alert-box danger";

                conversionAlert.textContent =
                    result.reason ||
                    "No es posible convertir.";

                formulaPanelTitle.textContent =
                    "Conversión entre unidades";

                formulaPrimary.textContent =
                    "Revise los datos de entrada.";

                formulaOperation.textContent =
                    "La conversión entre tensión y potencia requiere conocer la carga.";

                formulaResult.textContent =
                    "Resultado no disponible.";

                return;
            }

            setMetric(
                0,
                "Nivel de origen",
                formatSignedLevel(
                    result.sourceLevel,
                    source.key
                )
            );

            setMetric(
                1,
                "Referencia origen",
                source.referenceLabel
            );

            setMetric(
                2,
                "Magnitud física origen",
                formatPhysicalBase(
                    result.sourcePhysical,
                    source.quantity
                )
            );

            setMetric(
                3,
                "Referencia destino",
                target.referenceLabel
            );

            setMetric(
                4,
                "Magnitud física destino",
                formatPhysicalBase(
                    result.targetPhysical,
                    target.quantity
                )
            );

            setMetric(
                5,
                "Nivel de destino",
                formatSignedLevel(
                    result.targetLevel,
                    target.key
                )
            );

            if (sameQuantity) {
                conversionAlert.className =
                    "alert-box success";

                conversionAlert.textContent =
                    "Conversión directa: ambas unidades representan " +
                    source.quantityLabel
                        .toLowerCase() +
                    ". Solo cambia la referencia fija.";
            } else {
                conversionAlert.className =
                    "alert-box warning";

                conversionAlert.innerHTML =
                    "<strong>Conversión con carga:</strong> " +
                    "origen y destino representan magnitudes diferentes. " +
                    "Se usa R = " +
                    formatNumber(
                        result.resistance,
                        5
                    ) +
                    " Ω y se supone una carga resistiva equivalente.";
            }

            formulaPanelTitle.textContent =
                "Cadena de conversión";

            formulaPrimary.textContent =
                source.directFormula +
                "  |  " +
                target.directFormula;

            if (sameQuantity) {
                formulaOperation.textContent =
                    formatSignedLevel(
                        result.sourceLevel,
                        source.key
                    ) +
                    " → " +
                    formatPhysicalBase(
                        result.sourcePhysical,
                        source.quantity
                    ) +
                    " → " +
                    target.key;
            } else {
                formulaOperation.textContent =
                    formatSignedLevel(
                        result.sourceLevel,
                        source.key
                    ) +
                    " → " +
                    formatPhysicalBase(
                        result.sourcePhysical,
                        source.quantity
                    ) +
                    " → " +
                    result.crossFormula +
                    " → " +
                    formatPhysicalBase(
                        result.targetPhysical,
                        target.quantity
                    );
            }

            formulaResult.textContent =
                formatSignedLevel(
                    result.sourceLevel,
                    source.key
                ) +
                " = " +
                formatSignedLevel(
                    result.targetLevel,
                    target.key
                );
        }

        function applyConversionExample(key) {
            const example =
                conversionExamples[key];

            if (!example) {
                return;
            }

            sourceLevelUnit.value =
                example.sourceUnit;

            sourceLevelValue.value =
                String(
                    example.sourceValue
                );

            targetLevelUnit.value =
                example.targetUnit;

            conversionImpedance.value =
                String(
                    example.impedance
                );

            elapsedTime = 0;
            updateInterface();
        }

        function updateReferenceInterface() {
            const reference =
                referenceUnits[
                    highlightReference.value
                ];

            setActiveColor(
                reference.color,
                reference.rgb
            );

            setMetric(
                0,
                "Unidad",
                reference.key
            );

            setMetric(
                1,
                "Magnitud",
                reference.quantityLabel
            );

            setMetric(
                2,
                "Referencia",
                reference.referenceLabel
            );

            setMetric(
                3,
                "Factor logarítmico",
                String(
                    reference.factor
                )
            );

            setMetric(
                4,
                "Nivel cero",
                reference.zeroMeaning
            );

            let equivalent;

            if (
                reference.key ===
                "dBm"
            ) {
                equivalent =
                    "−30 dBW";
            } else if (
                reference.key ===
                "dBW"
            ) {
                equivalent =
                    "+30 dBm";
            } else if (
                reference.key ===
                "dBV"
            ) {
                equivalent =
                    "+60 dBmV";
            } else if (
                reference.key ===
                "dBu"
            ) {
                equivalent =
                    "+57,8 dBmV";
            } else {
                equivalent =
                    "−60 dBV";
            }

            setMetric(
                5,
                "Equivalencia clave",
                equivalent
            );

            formulaPanelTitle.textContent =
                "Referencia seleccionada";

            formulaPrimary.textContent =
                reference.directFormula;

            formulaOperation.textContent =
                reference.zeroMeaning;

            formulaResult.textContent =
                "Un valor positivo está sobre " +
                reference.referenceLabel +
                "; uno negativo está por debajo.";
        }

        function updateInterface() {
            if (
                currentMode ===
                "calculator"
            ) {
                updateCalculatorInterface();
            } else if (
                currentMode ===
                "conversion"
            ) {
                updateConversionInterface();
            } else {
                updateReferenceInterface();
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

        function pauseSimulation() {
            isPaused = true;

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
            isPaused = false;

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
            elapsedTime = 0;
            isPaused = false;

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

            if (
                currentMode ===
                "calculator"
            ) {
                applyCalculatorExample(
                    "10mWToDbm"
                );
            } else if (
                currentMode ===
                "conversion"
            ) {
                applyConversionExample(
                    "20DbwToDbm"
                );
            } else {
                highlightReference.value =
                    "dBm";

                updateInterface();
            }
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            viewHeight =
                viewWidth < 680
                    ? 860
                    : 610;

            pixelRatio =
                Math.min(
                    window.devicePixelRatio ||
                    1,
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
                    viewWidth - 300
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

            ctx.fillStyle =
                color;

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                title,
                x + 15,
                y + 24
            );

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

        function drawArrow(
            fromX,
            fromY,
            toX,
            toY,
            color
        ) {
            const arrowColor =
                color ||
                "rgba(186,230,253,0.58)";

            const angle =
                Math.atan2(
                    toY - fromY,
                    toX - fromX
                );

            const head = 8;

            ctx.save();

            ctx.strokeStyle =
                arrowColor;

            ctx.fillStyle =
                arrowColor;

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

        function drawComparisonBar(
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
                baseY + 23
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.82)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            wrapText(
                value,
                x + width / 2,
                baseY + 42,
                width + 45,
                12,
                2
            );

            ctx.restore();
        }

        function drawLogScale(
            panel,
            level,
            unit,
            color
        ) {
            const absolute =
                Math.abs(level);

            const limit =
                Math.max(
                    20,
                    Math.ceil(
                        absolute / 10
                    ) *
                    10,
                    60
                );

            const left =
                panel.x + 35;

            const right =
                panel.x +
                panel.width -
                35;

            const axisY =
                panel.y +
                panel.height *
                0.62;

            const width =
                right - left;

            ctx.save();

            ctx.strokeStyle =
                "rgba(186,230,253,0.50)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                left,
                axisY
            );

            ctx.lineTo(
                right,
                axisY
            );

            ctx.stroke();

            const divisions = 6;

            for (
                let index = 0;
                index <= divisions;
                index += 1
            ) {
                const x =
                    left +
                    width *
                    (
                        index /
                        divisions
                    );

                const value =
                    -limit +
                    2 *
                    limit *
                    (
                        index /
                        divisions
                    );

                ctx.strokeStyle =
                    index ===
                    divisions / 2
                        ? "rgba(52,211,153,0.75)"
                        : "rgba(186,230,253,0.28)";

                ctx.lineWidth =
                    index ===
                    divisions / 2
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
                    "rgba(199,220,235,0.78)";

                ctx.font =
                    "600 8px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    formatNumber(
                        value,
                        1
                    ),
                    x,
                    axisY + 28
                );
            }

            const normalized =
                clamp(
                    (
                        level +
                        limit
                    ) /
                    (
                        2 *
                        limit
                    ),
                    0,
                    1
                );

            const markerX =
                left +
                normalized *
                width;

            const pulse =
                1 +
                Math.sin(
                    elapsedTime *
                    4
                ) *
                0.14;

            ctx.fillStyle =
                color;

            ctx.shadowBlur = 20;
            ctx.shadowColor = color;

            ctx.beginPath();

            ctx.arc(
                markerX,
                axisY,
                9 * pulse,
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

            ctx.fillStyle =
                color;

            ctx.font =
                "700 20px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                formatSignedLevel(
                    level,
                    unit
                ),
                panel.x +
                panel.width / 2,
                panel.y + 78
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.78)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.fillText(
                "0 " +
                unit +
                " coincide con la referencia",
                panel.x +
                panel.width / 2,
                panel.y + 101
            );

            ctx.restore();
        }

        function drawCalculatorMode() {
            const result =
                getCalculatorResult();

            const reference =
                result.reference;

            drawHeader(
                reference.key +
                ": nivel referido de " +
                reference.quantityLabel
                    .toLowerCase(),
                "La magnitud se compara con una referencia fija; " +
                "la escala visual es logarítmica y comprimida.",
                result.direction ===
                    "linearToLevel"
                    ? reference.directFormula
                    : reference.inverseFormula,
                reference.color
            );

            if (!result.valid) {
                drawCanvasMessage(
                    "La magnitud física debe ser positiva.",
                    reference.color
                );

                return;
            }

            if (viewWidth < 680) {
                drawCalculatorMobile(
                    result
                );
            } else {
                drawCalculatorDesktop(
                    result
                );
            }

            drawCanvasFooter(
                "La animación muestra el proceso de comparación matemática; " +
                "no representa propagación física."
            );
        }

        function drawCalculatorDesktop(
            result
        ) {
            const reference =
                result.reference;

            const leftPanel = {
                x: 20,
                y: 80,
                width:
                    viewWidth *
                    0.46,
                height:
                    viewHeight -
                    125
            };

            const rightPanel = {
                x:
                    leftPanel.x +
                    leftPanel.width +
                    18,
                y: 80,
                width:
                    viewWidth -
                    leftPanel.width -
                    58,
                height:
                    viewHeight -
                    125
            };

            drawPanel(
                leftPanel.x,
                leftPanel.y,
                leftPanel.width,
                leftPanel.height,
                "MAGNITUD FÍSICA VS. REFERENCIA",
                reference.color
            );

            const baseY =
                leftPanel.y +
                leftPanel.height -
                90;

            const referenceHeight =
                150;

            const levelOffset =
                clamp(
                    result.level,
                    -45,
                    45
                ) *
                2.8;

            const physicalHeight =
                clamp(
                    referenceHeight +
                    levelOffset,
                    24,
                    285
                );

            const barWidth =
                92;

            const firstX =
                leftPanel.x +
                leftPanel.width *
                0.28 -
                barWidth / 2;

            const secondX =
                leftPanel.x +
                leftPanel.width *
                0.72 -
                barWidth / 2;

            drawComparisonBar(
                firstX,
                baseY,
                barWidth,
                referenceHeight,
                "#64748b",
                "Referencia",
                reference.referenceLabel
            );

            drawComparisonBar(
                secondX,
                baseY,
                barWidth,
                physicalHeight,
                reference.color,
                "Valor",
                formatPhysicalBase(
                    result.physicalBase,
                    reference.quantity
                )
            );

            drawArrow(
                firstX +
                barWidth +
                15,
                leftPanel.y +
                leftPanel.height *
                0.45,
                secondX - 15,
                leftPanel.y +
                leftPanel.height *
                0.45,
                hexToRgba(
                    reference.color,
                    0.65
                )
            );

            const progress =
                (
                    elapsedTime *
                    0.32
                ) % 1;

            const pointX =
                firstX +
                barWidth +
                15 +
                (
                    secondX -
                    15 -
                    (
                        firstX +
                        barWidth +
                        15
                    )
                ) *
                progress;

            drawGlowPoint(
                pointX,
                leftPanel.y +
                leftPanel.height *
                0.45,
                reference.color,
                4
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(159,181,202,0.76)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Relación = " +
                formatNumber(
                    result.ratio,
                    7
                ) +
                "×",
                leftPanel.x +
                leftPanel.width / 2,
                leftPanel.y + 55
            );

            if (
                Math.abs(
                    result.level
                ) >
                45
            ) {
                ctx.fillStyle =
                    "rgba(251,191,36,0.90)";

                ctx.fillText(
                    "Altura comprimida: consulte las etiquetas numéricas",
                    leftPanel.x +
                    leftPanel.width / 2,
                    leftPanel.y +
                    leftPanel.height -
                    28
                );
            }

            ctx.restore();

            drawPanel(
                rightPanel.x,
                rightPanel.y,
                rightPanel.width,
                rightPanel.height,
                "ESCALA LOGARÍTMICA",
                reference.color
            );

            drawLogScale(
                rightPanel,
                result.level,
                reference.key,
                reference.color
            );
        }

        function drawCalculatorMobile(
            result
        ) {
            const reference =
                result.reference;

            const topPanel = {
                x: 16,
                y: 80,
                width:
                    viewWidth - 32,
                height: 355
            };

            const bottomPanel = {
                x: 16,
                y: 455,
                width:
                    viewWidth - 32,
                height: 350
            };

            drawPanel(
                topPanel.x,
                topPanel.y,
                topPanel.width,
                topPanel.height,
                "MAGNITUD FÍSICA VS. REFERENCIA",
                reference.color
            );

            const baseY =
                topPanel.y +
                topPanel.height -
                78;

            const referenceHeight =
                120;

            const physicalHeight =
                clamp(
                    referenceHeight +
                    clamp(
                        result.level,
                        -40,
                        40
                    ) *
                    2.2,
                    22,
                    215
                );

            const barWidth =
                78;

            const firstX =
                topPanel.x +
                topPanel.width *
                0.29 -
                barWidth / 2;

            const secondX =
                topPanel.x +
                topPanel.width *
                0.71 -
                barWidth / 2;

            drawComparisonBar(
                firstX,
                baseY,
                barWidth,
                referenceHeight,
                "#64748b",
                "Referencia",
                reference.referenceLabel
            );

            drawComparisonBar(
                secondX,
                baseY,
                barWidth,
                physicalHeight,
                reference.color,
                "Valor",
                formatPhysicalBase(
                    result.physicalBase,
                    reference.quantity
                )
            );

            drawPanel(
                bottomPanel.x,
                bottomPanel.y,
                bottomPanel.width,
                bottomPanel.height,
                "ESCALA LOGARÍTMICA",
                reference.color
            );

            drawLogScale(
                bottomPanel,
                result.level,
                reference.key,
                reference.color
            );
        }

        function drawConversionMode() {
            const result =
                getConversionResult();

            const source =
                result.source;

            const target =
                result.target;

            drawHeader(
                source.key +
                " → " +
                target.key,
                "La conversión pasa por la magnitud física. " +
                "Si cambia entre tensión y potencia, necesita una carga.",
                result.valid
                    ? result.crossFormula
                    : "Conversión no disponible",
                source.color
            );

            if (!result.valid) {
                drawCanvasMessage(
                    result.reason ||
                    "Revise los datos de conversión.",
                    "#fb7185"
                );

                return;
            }

            if (viewWidth < 680) {
                drawConversionMobile(
                    result
                );
            } else {
                drawConversionDesktop(
                    result
                );
            }

            drawCanvasFooter(
                "Los nodos representan pasos de cálculo; el punto animado " +
                "no es una partícula ni una señal propagándose."
            );
        }

        function drawConversionNode(
            x,
            y,
            width,
            height,
            title,
            main,
            detail,
            color
        ) {
            ctx.save();

            ctx.shadowBlur = 16;
            ctx.shadowColor = color;

            roundedRectPath(
                x,
                y,
                width,
                height,
                13
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.96)";

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                color;

            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.font =
                "700 10px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                title,
                x + width / 2,
                y + 26
            );

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 17px Segoe UI, sans-serif";

            wrapText(
                main,
                x + width / 2,
                y + 58,
                width - 20,
                20,
                2
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.80)";

            ctx.font =
                "600 8.5px Segoe UI, sans-serif";

            wrapText(
                detail,
                x + width / 2,
                y + height - 34,
                width - 18,
                12,
                2
            );

            ctx.restore();
        }

        function drawConversionDesktop(
            result
        ) {
            const margin = 28;
            const gap = 30;

            const nodeWidth =
                (
                    viewWidth -
                    margin * 2 -
                    gap * 2
                ) /
                3;

            const nodeHeight =
                235;

            const y = 180;

            const sourceX =
                margin;

            const physicalX =
                margin +
                nodeWidth +
                gap;

            const targetX =
                margin +
                (
                    nodeWidth +
                    gap
                ) *
                2;

            drawConversionNode(
                sourceX,
                y,
                nodeWidth,
                nodeHeight,
                "NIVEL DE ORIGEN",
                formatSignedLevel(
                    result.sourceLevel,
                    result.source.key
                ),
                result.source.referenceLabel,
                result.source.color
            );

            const physicalMain =
                result.sameQuantity
                    ? formatPhysicalBase(
                        result.sourcePhysical,
                        result.source.quantity
                    )
                    : formatPhysicalBase(
                        result.sourcePhysical,
                        result.source.quantity
                    ) +
                    " → " +
                    formatPhysicalBase(
                        result.targetPhysical,
                        result.target.quantity
                    );

            const physicalDetail =
                result.sameQuantity
                    ? "Misma magnitud física; solo cambia la referencia"
                    : result.crossFormula +
                    " con R = " +
                    formatNumber(
                        result.resistance,
                        5
                    ) +
                    " Ω";

            drawConversionNode(
                physicalX,
                y,
                nodeWidth,
                nodeHeight,
                result.sameQuantity
                    ? "MAGNITUD FÍSICA"
                    : "CONVERSIÓN FÍSICA",
                physicalMain,
                physicalDetail,
                "#fbbf24"
            );

            drawConversionNode(
                targetX,
                y,
                nodeWidth,
                nodeHeight,
                "NIVEL DE DESTINO",
                formatSignedLevel(
                    result.targetLevel,
                    result.target.key
                ),
                result.target.referenceLabel,
                result.target.color
            );

            drawArrow(
                sourceX +
                nodeWidth +
                7,
                y +
                nodeHeight / 2,
                physicalX - 7,
                y +
                nodeHeight / 2
            );

            drawArrow(
                physicalX +
                nodeWidth +
                7,
                y +
                nodeHeight / 2,
                targetX - 7,
                y +
                nodeHeight / 2
            );

            drawConversionParticle(
                [
                    {
                        x:
                            sourceX +
                            nodeWidth / 2,
                        y:
                            y +
                            nodeHeight / 2
                    },
                    {
                        x:
                            physicalX +
                            nodeWidth / 2,
                        y:
                            y +
                            nodeHeight / 2
                    },
                    {
                        x:
                            targetX +
                            nodeWidth / 2,
                        y:
                            y +
                            nodeHeight / 2
                    }
                ],
                result.source.color
            );
        }

        function drawConversionMobile(
            result
        ) {
            const x = 18;

            const width =
                viewWidth - 36;

            const height = 185;

            const firstY = 95;
            const secondY = 325;
            const thirdY = 555;

            drawConversionNode(
                x,
                firstY,
                width,
                height,
                "NIVEL DE ORIGEN",
                formatSignedLevel(
                    result.sourceLevel,
                    result.source.key
                ),
                result.source.referenceLabel,
                result.source.color
            );

            drawConversionNode(
                x,
                secondY,
                width,
                height,
                result.sameQuantity
                    ? "MAGNITUD FÍSICA"
                    : "CONVERSIÓN FÍSICA",
                result.sameQuantity
                    ? formatPhysicalBase(
                        result.sourcePhysical,
                        result.source.quantity
                    )
                    : formatPhysicalBase(
                        result.sourcePhysical,
                        result.source.quantity
                    ) +
                    " → " +
                    formatPhysicalBase(
                        result.targetPhysical,
                        result.target.quantity
                    ),
                result.sameQuantity
                    ? "Misma magnitud; cambia la referencia"
                    : result.crossFormula +
                    " · R = " +
                    formatNumber(
                        result.resistance,
                        5
                    ) +
                    " Ω",
                "#fbbf24"
            );

            drawConversionNode(
                x,
                thirdY,
                width,
                height,
                "NIVEL DE DESTINO",
                formatSignedLevel(
                    result.targetLevel,
                    result.target.key
                ),
                result.target.referenceLabel,
                result.target.color
            );

            drawArrow(
                viewWidth / 2,
                firstY +
                height +
                8,
                viewWidth / 2,
                secondY - 8
            );

            drawArrow(
                viewWidth / 2,
                secondY +
                height +
                8,
                viewWidth / 2,
                thirdY - 8
            );

            drawConversionParticle(
                [
                    {
                        x:
                            viewWidth / 2,
                        y:
                            firstY +
                            height / 2
                    },
                    {
                        x:
                            viewWidth / 2,
                        y:
                            secondY +
                            height / 2
                    },
                    {
                        x:
                            viewWidth / 2,
                        y:
                            thirdY +
                            height / 2
                    }
                ],
                result.source.color
            );
        }

        function drawConversionParticle(
            points,
            color
        ) {
            const progress =
                (
                    elapsedTime *
                    0.28
                ) % 1;

            const scaled =
                progress *
                (
                    points.length -
                    1
                );

            const index =
                Math.min(
                    points.length -
                    2,
                    Math.floor(
                        scaled
                    )
                );

            const local =
                scaled - index;

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

            drawGlowPoint(
                x,
                y,
                color,
                4
            );
        }

        function drawReferenceMode() {
            const highlighted =
                referenceUnits[
                    highlightReference.value
                ];

            drawHeader(
                "Mapa de referencias fijas",
                "Potencia y tensión se muestran en escalas separadas " +
                "para evitar comparaciones incorrectas.",
                highlighted.zeroMeaning,
                highlighted.color
            );

            if (viewWidth < 680) {
                drawReferenceMobile(
                    highlighted
                );
            } else {
                drawReferenceDesktop(
                    highlighted
                );
            }

            drawCanvasFooter(
                "Las posiciones son logarítmicas dentro de cada magnitud " +
                "y no permiten comparar potencia con tensión."
            );
        }

        function drawReferenceDesktop(
            highlighted
        ) {
            const powerPanel = {
                x: 22,
                y: 92,
                width:
                    viewWidth - 44,
                height: 205
            };

            const voltagePanel = {
                x: 22,
                y: 325,
                width:
                    viewWidth - 44,
                height: 220
            };

            drawPanel(
                powerPanel.x,
                powerPanel.y,
                powerPanel.width,
                powerPanel.height,
                "REFERENCIAS DE POTENCIA",
                "#38bdf8"
            );

            drawPowerReferenceLane(
                powerPanel,
                highlighted
            );

            drawPanel(
                voltagePanel.x,
                voltagePanel.y,
                voltagePanel.width,
                voltagePanel.height,
                "REFERENCIAS DE TENSIÓN RMS",
                "#c084fc"
            );

            drawVoltageReferenceLane(
                voltagePanel,
                highlighted
            );
        }

        function drawReferenceMobile(
            highlighted
        ) {
            const powerPanel = {
                x: 16,
                y: 88,
                width:
                    viewWidth - 32,
                height: 300
            };

            const voltagePanel = {
                x: 16,
                y: 415,
                width:
                    viewWidth - 32,
                height: 370
            };

            drawPanel(
                powerPanel.x,
                powerPanel.y,
                powerPanel.width,
                powerPanel.height,
                "REFERENCIAS DE POTENCIA",
                "#38bdf8"
            );

            drawPowerReferenceLane(
                powerPanel,
                highlighted,
                true
            );

            drawPanel(
                voltagePanel.x,
                voltagePanel.y,
                voltagePanel.width,
                voltagePanel.height,
                "REFERENCIAS DE TENSIÓN RMS",
                "#c084fc"
            );

            drawVoltageReferenceLane(
                voltagePanel,
                highlighted,
                true
            );
        }

        function drawPowerReferenceLane(
            panel,
            highlighted,
            mobile = false
        ) {
            const left =
                panel.x + 45;

            const right =
                panel.x +
                panel.width -
                45;

            const axisY =
                mobile
                    ? panel.y + 165
                    : panel.y + 105;

            ctx.save();

            ctx.strokeStyle =
                "rgba(186,230,253,0.46)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                left,
                axisY
            );

            ctx.lineTo(
                right,
                axisY
            );

            ctx.stroke();

            const nodes = [
                {
                    unit: "dBm",
                    position: 0,
                    label: "1 mW",
                    scale: "0 dBm"
                },
                {
                    unit: "dBW",
                    position: 30,
                    label: "1 W",
                    scale:
                        "0 dBW = 30 dBm"
                }
            ];

            nodes.forEach(
                function (node) {
                    const x =
                        left +
                        (
                            node.position /
                            30
                        ) *
                        (
                            right -
                            left
                        );

                    drawReferenceNode(
                        x,
                        axisY,
                        node,
                        highlighted
                    );
                }
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.78)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Diferencia entre referencias: 30 dB",
                panel.x +
                panel.width / 2,
                axisY + 75
            );

            ctx.fillText(
                "1 W = 1000 mW",
                panel.x +
                panel.width / 2,
                axisY + 94
            );

            ctx.restore();
        }

        function drawVoltageReferenceLane(
            panel,
            highlighted,
            mobile = false
        ) {
            const left =
                panel.x + 45;

            const right =
                panel.x +
                panel.width -
                45;

            const axisY =
                mobile
                    ? panel.y + 190
                    : panel.y + 112;

            ctx.save();

            ctx.strokeStyle =
                "rgba(186,230,253,0.46)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                left,
                axisY
            );

            ctx.lineTo(
                right,
                axisY
            );

            ctx.stroke();

            const nodes = [
                {
                    unit: "dBmV",
                    position: 0,
                    label: "1 mV RMS",
                    scale: "0 dBmV"
                },
                {
                    unit: "dBu",
                    position: 57.79,
                    label: "0,775 V RMS",
                    scale:
                        "0 dBu ≈ 57,8 dBmV"
                },
                {
                    unit: "dBV",
                    position: 60,
                    label: "1 V RMS",
                    scale:
                        "0 dBV = 60 dBmV"
                }
            ];

            nodes.forEach(
                function (node) {
                    const x =
                        left +
                        (
                            node.position /
                            60
                        ) *
                        (
                            right -
                            left
                        );

                    drawReferenceNode(
                        x,
                        axisY,
                        node,
                        highlighted
                    );
                }
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.78)";

            ctx.font =
                "600 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Escala común de apoyo: dBmV",
                panel.x +
                panel.width / 2,
                axisY + 78
            );

            ctx.fillText(
                "1 V RMS = 1000 mV RMS",
                panel.x +
                panel.width / 2,
                axisY + 97
            );

            ctx.restore();
        }

        function drawReferenceNode(
            x,
            y,
            node,
            highlighted
        ) {
            const data =
                referenceUnits[
                    node.unit
                ];

            const selected =
                highlighted.key ===
                node.unit;

            const pulse =
                selected
                    ? 1 +
                        Math.sin(
                            elapsedTime *
                            4
                        ) *
                        0.12
                    : 1;

            ctx.save();

            ctx.fillStyle =
                data.color;

            ctx.shadowBlur =
                selected
                    ? 24
                    : 10;

            ctx.shadowColor =
                data.color;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                (
                    selected
                        ? 12
                        : 8
                ) *
                pulse,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                node.unit,
                x,
                y - 28
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.84)";

            ctx.font =
                "600 8.5px Segoe UI, sans-serif";

            wrapText(
                node.label,
                x,
                y + 30,
                105,
                12,
                2
            );

            wrapText(
                node.scale,
                x,
                y + 54,
                125,
                12,
                2
            );

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

            wrapText(
                message,
                viewWidth / 2,
                viewHeight / 2,
                viewWidth - 70,
                22,
                3
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.74)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            ctx.fillText(
                "Los logaritmos requieren magnitudes físicas positivas.",
                viewWidth / 2,
                viewHeight / 2 + 52
            );

            ctx.restore();
        }

        function drawCanvasFooter(text) {
            ctx.save();

            ctx.fillStyle =
                "rgba(159,181,202,0.68)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                text,
                viewWidth - 18,
                viewHeight - 15
            );

            ctx.restore();
        }

        function drawScene() {
            drawBackground();

            if (
                currentMode ===
                "calculator"
            ) {
                drawCalculatorMode();
            } else if (
                currentMode ===
                "conversion"
            ) {
                drawConversionMode();
            } else {
                drawReferenceMode();
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
                    deltaTime *
                    Number(
                        animationSpeed.value ||
                        1
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

        updateSpeedDisplay();
        configureCalculatorUnit(true);
        setMode("calculator");

        requestAnimationFrame(
            function startAnimation(time) {
                lastFrameTime = time;
                animate(time);
            }
        );
    
