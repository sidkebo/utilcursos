"use strict";

const $ =
    id => document.getElementById(id);

const canvas =
    $("canvas");

const ctx =
    canvas.getContext("2d");

const tabs =
    Array.from(
        document.querySelectorAll(".tab")
    );

const metrics =
    $("metrics");

const formulaLabels =
    [1, 2, 3, 4, 5, 6].map(
        number => $("fl" + number)
    );

const formulaValues =
    [1, 2, 3, 4, 5, 6].map(
        number => $("f" + number)
    );

const TWO_PI =
    2 * Math.PI;

const CARRIER_AMPLITUDE =
    1;

const MAXIMUM_VISUAL_RATIO =
    55;

const MAXIMUM_VISUAL_BETA =
    14;

let mode =
    "direct";

let currentData =
    null;

let elapsedTime =
    0;

let lastFrameTime =
    performance.now();

let paused =
    false;

let viewWidth =
    1000;

let viewHeight =
    850;

let pixelRatio =
    1;

const directPresets = {
    practice: [
        20,
        "Hz",
        5,
        "Hz/V",
        1,
        1,
        "Hz",
        2
    ],

    example: [
        100,
        "kHz",
        3,
        "kHz/V",
        2,
        1,
        "kHz",
        2
    ],

    higher: [
        100,
        "kHz",
        3,
        "kHz/V",
        3,
        1,
        "kHz",
        2
    ],

    curve: [
        110,
        "kHz",
        20,
        "kHz/V",
        1.5,
        2,
        "kHz",
        2.5
    ],

    small: [
        100,
        "kHz",
        0.5,
        "kHz/V",
        0.5,
        5,
        "kHz",
        2
    ]
};

const indirectPresets = {
    mandatory: [
        100,
        "kHz",
        1,
        "kHz",
        1,
        "kHz",
        5,
        0,
        "kHz",
        "none"
    ],

    optional: [
        200,
        "kHz",
        2,
        "kHz",
        1,
        "kHz",
        4,
        0,
        "kHz",
        "none"
    ],

    sum: [
        100,
        "kHz",
        1,
        "kHz",
        1,
        "kHz",
        5,
        200,
        "kHz",
        "sum"
    ],

    difference: [
        200,
        "kHz",
        2,
        "kHz",
        1,
        "kHz",
        4,
        300,
        "kHz",
        "difference"
    ],

    diagnostic: [
        100,
        "kHz",
        5,
        "kHz",
        2,
        "kHz",
        3,
        0,
        "kHz",
        "none"
    ]
};

function frequencyFactor(unit) {
    if (unit.startsWith("MHz")) {
        return 1e6;
    }

    if (unit.startsWith("kHz")) {
        return 1e3;
    }

    return 1;
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

function formatFrequency(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    const sign =
        value < 0
            ? "−"
            : "";

    const absolute =
        Math.abs(value);

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

function showBanner(
    state,
    title,
    text,
    tag
) {
    $("banner").className =
        "banner" +
        (
            state
                ? " " + state
                : ""
        );

    $("bannerTitle").textContent =
        title;

    $("bannerText").textContent =
        text;

    $("bannerTag").textContent =
        tag;
}

function renderMetrics(items) {
    metrics.innerHTML =
        items
            .map(
                item =>
                    '<article class="metric">' +
                        "<b>" +
                            item[0] +
                        "</b>" +
                        "<span>" +
                            item[1] +
                        "</span>" +
                    "</article>"
            )
            .join("");
}

function getDirectData() {
    const centralFrequency =
        Number(
            $("dFc").value
        ) *
        frequencyFactor(
            $("dFcU").value
        );

    const sensitivity =
        Number(
            $("kvco").value
        ) *
        frequencyFactor(
            $("kvcoU").value
        );

    const modulatingVoltage =
        Number(
            $("vm").value
        );

    const modulatingFrequency =
        Number(
            $("dFm").value
        ) *
        frequencyFactor(
            $("dFmU").value
        );

    const biasVoltage =
        Number(
            $("bias").value
        );

    const valid =
        [
            centralFrequency,
            sensitivity,
            modulatingVoltage,
            modulatingFrequency,
            biasVoltage
        ].every(Number.isFinite) &&
        centralFrequency > 0 &&
        sensitivity >= 0 &&
        modulatingVoltage >= 0 &&
        modulatingFrequency > 0;

    if (!valid) {
        return {
            valid: false
        };
    }

    const deviation =
        sensitivity *
        modulatingVoltage;

    const beta =
        deviation /
        modulatingFrequency;

    const minimumFrequency =
        centralFrequency -
        deviation;

    const maximumFrequency =
        centralFrequency +
        deviation;

    const minimumControl =
        biasVoltage -
        modulatingVoltage;

    const maximumControl =
        biasVoltage +
        modulatingVoltage;

    const carrierRatio =
        centralFrequency /
        modulatingFrequency;

    return {
        valid: true,
        centralFrequency,
        sensitivity,
        modulatingVoltage,
        modulatingFrequency,
        biasVoltage,
        deviation,
        beta,
        minimumFrequency,
        maximumFrequency,
        minimumControl,
        maximumControl,

        duration:
            3 /
            modulatingFrequency,

        visualCarrierFrequency:
            Math.min(
                carrierRatio,
                MAXIMUM_VISUAL_RATIO
            ) *
            modulatingFrequency,

        visualBeta:
            Math.min(
                beta,
                MAXIMUM_VISUAL_BETA
            ),

        carrierCompressed:
            carrierRatio >
            MAXIMUM_VISUAL_RATIO,

        betaCompressed:
            beta >
            MAXIMUM_VISUAL_BETA
    };
}

function classifyInitialBeta(beta) {
    if (beta < 0.3) {
        return {
            title: "NBFM inicial clara",
            state: "",
            description:
                "La señal angular inicial tiene desviación pequeña respecto de fₘ."
        };
    }

    if (beta < 1) {
        return {
            title: "Entrada angular moderada",
            state: "neutral",
            description:
                "La señal inicial no es extremadamente angosta, aunque β es menor que uno."
        };
    }

    return {
        title: "Entrada no angosta",
        state: "warning",
        description:
            "El método indirecto clásico suele partir de NBFM; revise Δf₀ o fₘ."
    };
}

function getIndirectData() {
    const initialCentralFrequency =
        Number(
            $("iFc").value
        ) *
        frequencyFactor(
            $("iFcU").value
        );

    const initialDeviation =
        Number(
            $("iDf").value
        ) *
        frequencyFactor(
            $("iDfU").value
        );

    const modulatingFrequency =
        Number(
            $("iFm").value
        ) *
        frequencyFactor(
            $("iFmU").value
        );

    const multiplier =
        Math.round(
            Number(
                $("mult").value
            )
        );

    const localOscillator =
        Number(
            $("lo").value
        ) *
        frequencyFactor(
            $("loU").value
        );

    const mixingMode =
        $("mixMode").value;

    const valid =
        [
            initialCentralFrequency,
            initialDeviation,
            modulatingFrequency,
            multiplier,
            localOscillator
        ].every(Number.isFinite) &&
        initialCentralFrequency > 0 &&
        initialDeviation >= 0 &&
        modulatingFrequency > 0 &&
        multiplier >= 1 &&
        multiplier <= 20 &&
        localOscillator >= 0;

    if (!valid) {
        return {
            valid: false
        };
    }

    const initialBeta =
        initialDeviation /
        modulatingFrequency;

    const multipliedCentralFrequency =
        multiplier *
        initialCentralFrequency;

    const multipliedDeviation =
        multiplier *
        initialDeviation;

    const finalBeta =
        multipliedDeviation /
        modulatingFrequency;

    let outputCentralFrequency =
        multipliedCentralFrequency;

    if (mixingMode === "sum") {
        outputCentralFrequency =
            multipliedCentralFrequency +
            localOscillator;
    } else if (
        mixingMode === "difference"
    ) {
        outputCentralFrequency =
            Math.abs(
                multipliedCentralFrequency -
                localOscillator
            );
    }

    const minimumFrequency =
        outputCentralFrequency -
        multipliedDeviation;

    const maximumFrequency =
        outputCentralFrequency +
        multipliedDeviation;

    const initialRatio =
        initialCentralFrequency /
        modulatingFrequency;

    const outputRatio =
        outputCentralFrequency /
        modulatingFrequency;

    return {
        valid: true,
        initialCentralFrequency,
        initialDeviation,
        modulatingFrequency,
        multiplier,
        localOscillator,
        mixingMode,
        initialBeta,
        multipliedCentralFrequency,
        multipliedDeviation,
        finalBeta,
        outputCentralFrequency,
        minimumFrequency,
        maximumFrequency,

        classification:
            classifyInitialBeta(
                initialBeta
            ),

        duration:
            3 /
            modulatingFrequency,

        visualInitialCarrier:
            Math.min(
                initialRatio,
                MAXIMUM_VISUAL_RATIO
            ) *
            modulatingFrequency,

        visualOutputCarrier:
            Math.min(
                outputRatio,
                MAXIMUM_VISUAL_RATIO
            ) *
            modulatingFrequency,

        visualInitialBeta:
            Math.min(
                initialBeta,
                MAXIMUM_VISUAL_BETA
            ),

        visualFinalBeta:
            Math.min(
                finalBeta,
                MAXIMUM_VISUAL_BETA
            ),

        carrierCompressed:
            initialRatio >
                MAXIMUM_VISUAL_RATIO ||
            outputRatio >
                MAXIMUM_VISUAL_RATIO,

        betaCompressed:
            finalBeta >
            MAXIMUM_VISUAL_BETA
    };
}

function getDirectInstant(data) {
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
            TWO_PI *
            data.modulatingFrequency *
            time
        );

    return {
        progress,
        time,
        message,

        controlVoltage:
            data.biasVoltage +
            data.modulatingVoltage *
            message,

        instantaneousFrequency:
            data.centralFrequency +
            data.deviation *
            message
    };
}

function getIndirectInstant(data) {
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
            TWO_PI *
            data.modulatingFrequency *
            time
        );

    return {
        progress,
        time,
        message,

        initialFrequency:
            data.initialCentralFrequency +
            data.initialDeviation *
            message,

        outputFrequency:
            data.outputCentralFrequency +
            data.multipliedDeviation *
            message
    };
}

function updateDirectInterface(data) {
    $("dSpeedOut").textContent =
        Number(
            $("dSpeed").value
        )
            .toFixed(1)
            .replace(".", ",") +
        "×";

    if (!data.valid) {
        showBanner(
            "danger",
            "Datos no válidos",
            "fᶜ y fₘ deben ser positivas; Kᵥ꜀ₒ y Vₘ no pueden ser negativas.",
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
        data.minimumFrequency <=
        0
    ) {
        warnings.push(
            "La frecuencia instantánea alcanza cero o valores negativos."
        );
    }

    if (
        data.minimumControl <
        0
    ) {
        warnings.push(
            "La tensión de control cae por debajo de 0 V; un VCO real puede no admitir ese intervalo."
        );
    }

    if (
        data.sensitivity ===
        0
    ) {
        warnings.push(
            "Con Kᵥ꜀ₒ = 0 no existe desviación."
        );
    }

    if (warnings.length > 0) {
        showBanner(
            "warning",
            "Revise el intervalo de control",
            warnings.join(" "),
            "Modelo lineal"
        );
    } else {
        showBanner(
            "",
            "VCO en modelo lineal",
            "La tensión modulante hace variar la frecuencia alrededor del punto fijado por Vbias.",
            "Δf = " +
            formatFrequency(
                data.deviation
            )
        );
    }

    const instant =
        getDirectInstant(
            data
        );

    renderMetrics(
        [
            [
                "Tensión de control actual",
                formatNumber(
                    instant.controlVoltage
                ) +
                " V"
            ],
            [
                "Frecuencia instantánea",
                formatFrequency(
                    instant.instantaneousFrequency
                )
            ],
            [
                "Desviación máxima Δf",
                formatFrequency(
                    data.deviation
                )
            ],
            [
                "Índice FM β",
                formatNumber(
                    data.beta,
                    7
                )
            ],
            [
                "Frecuencia mínima",
                formatFrequency(
                    data.minimumFrequency
                )
            ],
            [
                "Frecuencia máxima",
                formatFrequency(
                    data.maximumFrequency
                )
            ],
            [
                "Control mínimo",
                formatNumber(
                    data.minimumControl
                ) +
                " V"
            ],
            [
                "Control máximo",
                formatNumber(
                    data.maximumControl
                ) +
                " V"
            ]
        ]
    );

    $("formulaTitle").textContent =
        "Relaciones del VCO";

    [
        "Tensión de control",
        "Frecuencia instantánea",
        "Desviación máxima",
        "Índice FM",
        "Frecuencias límite",
        "Modelo de señal FM"
    ].forEach(
        (text, index) => {
            formulaLabels[index].textContent =
                text;
        }
    );

    formulaValues[0].textContent =
        "vcontrol(t) = " +
        formatNumber(
            data.biasVoltage
        ) +
        " + " +
        formatNumber(
            data.modulatingVoltage
        ) +
        "·cos(2π·" +
        formatFrequency(
            data.modulatingFrequency
        ) +
        "·t) V";

    formulaValues[1].textContent =
        "fi(t) = fᶜ + Kᵥ꜀ₒ[vcontrol(t) − Vbias]";

    formulaValues[2].textContent =
        "Δf = Kᵥ꜀ₒ·Vₘ = " +
        formatFrequency(
            data.sensitivity
        ) +
        "/V · " +
        formatNumber(
            data.modulatingVoltage
        ) +
        " V = " +
        formatFrequency(
            data.deviation
        );

    formulaValues[3].textContent =
        "β = Δf/fₘ = " +
        formatNumber(
            data.beta,
            7
        );

    formulaValues[4].textContent =
        "fmin = " +
        formatFrequency(
            data.minimumFrequency
        ) +
        " · fmax = " +
        formatFrequency(
            data.maximumFrequency
        );

    formulaValues[5].textContent =
        "sFM(t) = Aᶜ cos[2πfᶜt + β sin(2πfₘt)]";

    const notes = [
        "La curva tensión-frecuencia es una aproximación lineal local alrededor de Vbias.",
        "Vbias fija el punto central; Δf depende de Kᵥ꜀ₒ y del valor pico Vₘ."
    ];

    if (data.carrierCompressed) {
        notes.push(
            "La portadora temporal se comprimió visualmente; los cálculos conservan fᶜ real."
        );
    }

    if (data.betaCompressed) {
        notes.push(
            "La variación angular visual se limitó para evitar una curva ilegible."
        );
    }

    notes.push(
        "El varactor se representa funcionalmente: en inversa cambia su capacitancia y con ello la frecuencia del tanque."
    );

    notes.push(
        "Las curvas muestran valores instantáneos respecto al tiempo, no el recorrido físico de la energía."
    );

    $("note").innerHTML =
        "<strong>Advertencias técnicas:</strong> " +
        notes.join(" ");

    $("explain").innerHTML =
        "<strong>Modo directo:</strong> la modulante se suma a Vbias. El VCO transforma esa variación en frecuencia instantánea. Cuando fi aumenta, los ciclos se juntan; cuando fi disminuye, se separan.";
}

function updateIndirectInterface(data) {
    $("iSpeedOut").textContent =
        Number(
            $("iSpeed").value
        )
            .toFixed(1)
            .replace(".", ",") +
        "×";

    if (!data.valid) {
        showBanner(
            "danger",
            "Datos no válidos",
            "Las frecuencias deben ser positivas, Δf₀ no puede ser negativa y N debe estar entre 1 y 20.",
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
        data.outputCentralFrequency ===
        0
    ) {
        warnings.push(
            "La diferencia seleccionada produce frecuencia central nula."
        );
    }

    if (
        data.minimumFrequency <=
        0
    ) {
        warnings.push(
            "La frecuencia instantánea final alcanza cero o valores negativos."
        );
    }

    if (
        data.mixingMode !==
            "none" &&
        data.localOscillator ===
            0
    ) {
        warnings.push(
            "Se seleccionó mezclador, pero el oscilador local es 0 Hz."
        );
    }

    if (warnings.length > 0) {
        showBanner(
            "warning",
            "Revise la traslación de frecuencia",
            warnings.join(" "),
            data.classification.title
        );
    } else {
        showBanner(
            data.classification.state,
            data.classification.title,
            data.classification.description,
            "N = " +
            data.multiplier
        );
    }

    const instant =
        getIndirectInstant(
            data
        );

    renderMetrics(
        [
            [
                "β inicial",
                formatNumber(
                    data.initialBeta,
                    7
                )
            ],
            [
                "fᶜ tras multiplicador",
                formatFrequency(
                    data.multipliedCentralFrequency
                )
            ],
            [
                "Δf tras multiplicador",
                formatFrequency(
                    data.multipliedDeviation
                )
            ],
            [
                "β final",
                formatNumber(
                    data.finalBeta,
                    7
                )
            ],
            [
                "Frecuencia central final",
                formatFrequency(
                    data.outputCentralFrequency
                )
            ],
            [
                "Frecuencia instantánea final",
                formatFrequency(
                    instant.outputFrequency
                )
            ],
            [
                "Frecuencia mínima final",
                formatFrequency(
                    data.minimumFrequency
                )
            ],
            [
                "Frecuencia máxima final",
                formatFrequency(
                    data.maximumFrequency
                )
            ]
        ]
    );

    $("formulaTitle").textContent =
        "Relaciones del método indirecto";

    [
        "Señal angular inicial",
        "Multiplicación de frecuencia",
        "Multiplicación de desviación",
        "Índice después de N",
        "Traslación con mezclador",
        "Salida FM ideal"
    ].forEach(
        (text, index) => {
            formulaLabels[index].textContent =
                text;
        }
    );

    formulaValues[0].textContent =
        "β₀ = Δf₀/fₘ = " +
        formatNumber(
            data.initialBeta,
            7
        );

    formulaValues[1].textContent =
        "fᶜ,N = N·fᶜ,0 = " +
        data.multiplier +
        "·" +
        formatFrequency(
            data.initialCentralFrequency
        ) +
        " = " +
        formatFrequency(
            data.multipliedCentralFrequency
        );

    formulaValues[2].textContent =
        "ΔfN = N·Δf₀ = " +
        formatFrequency(
            data.multipliedDeviation
        );

    formulaValues[3].textContent =
        "βN = N·β₀ = " +
        formatNumber(
            data.finalBeta,
            7
        );

    if (
        data.mixingMode ===
        "sum"
    ) {
        formulaValues[4].textContent =
            "fᶜ,salida = fᶜ,N + fLO = " +
            formatFrequency(
                data.outputCentralFrequency
            ) +
            " · Δf se conserva idealmente";
    } else if (
        data.mixingMode ===
        "difference"
    ) {
        formulaValues[4].textContent =
            "fᶜ,salida = |fᶜ,N − fLO| = " +
            formatFrequency(
                data.outputCentralFrequency
            ) +
            " · Δf se conserva idealmente";
    } else {
        formulaValues[4].textContent =
            "Sin mezclador: fᶜ,salida = fᶜ,N";
    }

    formulaValues[5].textContent =
        "sFM(t) = Aᶜ cos[2πfᶜ,salida·t + βN sin(2πfₘt)]";

    const notes = [
        "El integrador y el modulador de fase se muestran como bloques funcionales; no se desarrolla una demostración con integrales.",
        "El multiplicador por N aumenta fᶜ y Δf; fₘ permanece igual, por lo que β también se multiplica por N."
    ];

    if (
        data.mixingMode !==
        "none"
    ) {
        notes.push(
            "El mezclador traslada el centro mediante suma o diferencia y no actúa como multiplicador armónico."
        );
    }

    if (data.carrierCompressed) {
        notes.push(
            "Una o ambas portadoras temporales se comprimieron visualmente."
        );
    }

    if (data.betaCompressed) {
        notes.push(
            "La variación angular final se limitó visualmente para mantener legibilidad."
        );
    }

    notes.push(
        "Los filtros se representan como selección funcional; no se diseñan filtros RF profesionales."
    );

    notes.push(
        "Las ondas muestran amplitud instantánea respecto al tiempo, no el recorrido físico de la energía."
    );

    $("note").innerHTML =
        "<strong>Advertencias técnicas:</strong> " +
        notes.join(" ");

    $("explain").innerHTML =
        "<strong>Modo indirecto:</strong> la modulante pasa por un integrador antes del modulador de fase para obtener FM angular inicial. El multiplicador aumenta fᶜ y Δf; el filtro selecciona el armónico útil y el mezclador traslada la frecuencia central.";
}

function updateInterface() {
    currentData =
        mode === "direct"
            ? getDirectData()
            : getIndirectData();

    if (mode === "direct") {
        updateDirectInterface(
            currentData
        );
    } else {
        updateIndirectInterface(
            currentData
        );
    }
}

function setMode(nextMode) {
    mode =
        nextMode;

    elapsedTime =
        0;

    tabs.forEach(
        button => {
            button.classList.toggle(
                "active",
                button.dataset.mode ===
                nextMode
            );
        }
    );

    $("directUI").hidden =
        nextMode !==
        "direct";

    $("indirectUI").hidden =
        nextMode !==
        "indirect";

    document.documentElement.style.setProperty(
        "--active",
        nextMode === "direct"
            ? "#38bdf8"
            : "#fb923c"
    );

    document.documentElement.style.setProperty(
        "--active-rgb",
        nextMode === "direct"
            ? "56, 189, 248"
            : "251, 146, 60"
    );

    $("simTitle").textContent =
        nextMode === "direct"
            ? "Modulante → tensión de control → VCO → señal FM"
            : "Integrador → modulador de fase/NBFM → multiplicador → filtro → mezclador → salida FM";

    resizeCanvas();
    updateInterface();
}

function applyDirectPreset(key) {
    const preset =
        directPresets[key];

    if (!preset) {
        return;
    }

    $("dFc").value =
        preset[0];

    $("dFcU").value =
        preset[1];

    $("kvco").value =
        preset[2];

    $("kvcoU").value =
        preset[3];

    $("vm").value =
        preset[4];

    $("dFm").value =
        preset[5];

    $("dFmU").value =
        preset[6];

    $("bias").value =
        preset[7];

    elapsedTime =
        0;

    updateInterface();
}

function applyIndirectPreset(key) {
    const preset =
        indirectPresets[key];

    if (!preset) {
        return;
    }

    $("iFc").value =
        preset[0];

    $("iFcU").value =
        preset[1];

    $("iDf").value =
        preset[2];

    $("iDfU").value =
        preset[3];

    $("iFm").value =
        preset[4];

    $("iFmU").value =
        preset[5];

    $("mult").value =
        preset[6];

    $("lo").value =
        preset[7];

    $("loU").value =
        preset[8];

    $("mixMode").value =
        preset[9];

    elapsedTime =
        0;

    updateInterface();
}

function pauseSimulation() {
    paused =
        true;

    $("pause").disabled =
        true;

    $("resume").disabled =
        false;

    $("status").textContent =
        "Simulación pausada";

    $("status").classList.add(
        "paused"
    );
}

function continueSimulation() {
    paused =
        false;

    lastFrameTime =
        performance.now();

    $("pause").disabled =
        false;

    $("resume").disabled =
        true;

    $("status").textContent =
        "Simulación activa";

    $("status").classList.remove(
        "paused"
    );
}

function restartSimulation() {
    continueSimulation();

    elapsedTime =
        0;

    if (mode === "direct") {
        applyDirectPreset(
            "example"
        );
    } else {
        applyIndirectPreset(
            "mandatory"
        );
    }
}

function resizeCanvas() {
    viewWidth =
        Math.max(
            300,
            $("canvasWrap").clientWidth
        );

    if (viewWidth < 720) {
        viewHeight =
            mode === "direct"
                ? 1460
                : 1510;
    } else {
        viewHeight =
            mode === "direct"
                ? 850
                : 880;
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

            line =
                words[index];

            lineNumber +=
                1;

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

function drawCanvasHeader(
    title,
    subtitle,
    formula,
    color
) {
    ctx.save();

    ctx.fillStyle =
        "#f0f9ff";

    ctx.font =
        "700 15px Segoe UI";

    ctx.textAlign =
        "left";

    ctx.fillText(
        title,
        24,
        31
    );

    ctx.fillStyle =
        "rgba(159, 181, 202, 0.83)";

    ctx.font =
        "500 10px Segoe UI";

    wrapText(
        subtitle,
        24,
        50,
        Math.max(
            190,
            viewWidth - 470
        ),
        14,
        2
    );

    if (viewWidth >= 600) {
        ctx.fillStyle =
            color;

        ctx.font =
            "700 10px Consolas";

        ctx.textAlign =
            "right";

        ctx.fillText(
            formula,
            viewWidth - 24,
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
        "700 10.5px Segoe UI";

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
        "600 8px Segoe UI";

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
            panel.x + panel.width - 14,
            panel.y + 22
        );
    }

    ctx.restore();
}

function drawGrid(
    plot,
    maximum,
    duration,
    unit
) {
    ctx.save();

    ctx.strokeStyle =
        "rgba(125, 211, 252, 0.08)";

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
        "rgba(186, 230, 253, 0.36)";

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
        "600 8px Segoe UI";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "+" +
        formatNumber(
            maximum,
            4
        ) +
        " " +
        unit,
        plot.x - 7,
        plot.y + 8
    );

    ctx.fillText(
        "0 " + unit,
        plot.x - 7,
        centerY + 3
    );

    ctx.fillText(
        "−" +
        formatNumber(
            maximum,
            4
        ) +
        " " +
        unit,
        plot.x - 7,
        plot.y + plot.height
    );

    ctx.textAlign =
        "center";

    ctx.fillText(
        "0",
        plot.x,
        plot.y + plot.height + 16
    );

    ctx.fillText(
        formatTime(
            duration
        ),
        plot.x + plot.width,
        plot.y + plot.height + 16
    );

    ctx.restore();
}

function mapValueToY(
    value,
    plot,
    maximum
) {
    return (
        plot.y +
        plot.height / 2 -
        value /
        Math.max(
            maximum,
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
    maximum,
    color,
    lineWidth = 2,
    dashed = false
) {
    ctx.save();
    ctx.beginPath();

    const step =
        Math.max(
            0.7,
            plot.width / 1500
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
            mapValueToY(
                value,
                plot,
                maximum
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
            ? [7, 5]
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

function drawArrow(
    x1,
    y1,
    x2,
    y2,
    color
) {
    const angle =
        Math.atan2(
            y2 - y1,
            x2 - x1
        );

    ctx.save();

    ctx.strokeStyle =
        color;

    ctx.fillStyle =
        color;

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
            angle - Math.PI / 6
        ),
        y2 -
        8 *
        Math.sin(
            angle - Math.PI / 6
        )
    );

    ctx.lineTo(
        x2 -
        8 *
        Math.cos(
            angle + Math.PI / 6
        ),
        y2 -
        8 *
        Math.sin(
            angle + Math.PI / 6
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
        "700 9px Segoe UI";

    ctx.textAlign =
        "center";

    ctx.fillText(
        title,
        x + width / 2,
        y + height / 2 - 4
    );

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.78)";

    ctx.font =
        "600 7px Segoe UI";

    wrapText(
        subtitle,
        x + width / 2,
        y + height / 2 + 12,
        width - 14,
        10,
        2
    );

    ctx.restore();
}

function drawMarker(
    points,
    color,
    speed
) {
    const segments = [];
    let totalLength = 0;

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
            Math.hypot(dx, dy);

        segments.push({
            start: points[index],
            end: points[index + 1],
            length
        });

        totalLength +=
            length;
    }

    let distance =
        (
            elapsedTime *
            speed %
            1
        ) *
        totalLength;

    let position =
        points[0];

    for (const segment of segments) {
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

function drawCursor(
    plot,
    x,
    y
) {
    ctx.save();

    ctx.strokeStyle =
        "rgba(251, 191, 36, 0.82)";

    ctx.setLineDash(
        [5, 5]
    );

    ctx.beginPath();
    ctx.moveTo(x, plot.y);

    ctx.lineTo(
        x,
        plot.y + plot.height
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

function drawDirectFlow(panel) {
    const mobile =
        viewWidth < 720;

    const blocks = [
        [
            "Modulante",
            "Vₘ cos(2πfₘt)",
            "#38bdf8"
        ],
        [
            "Tensión de control",
            "Vbias + modulante",
            "#fbbf24"
        ],
        [
            "VCO",
            "frecuencia controlada",
            "#c084fc"
        ],
        [
            "Señal FM",
            "amplitud ideal constante",
            "#34d399"
        ]
    ];

    const markerPoints = [];

    if (!mobile) {
        const gap =
            26;

        const blockWidth =
            (
                panel.width -
                54 -
                3 * gap
            ) /
            4;

        const blockHeight =
            82;

        const y =
            panel.y + 63;

        blocks.forEach(
            (block, index) => {
                const x =
                    panel.x +
                    27 +
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

                markerPoints.push({
                    x:
                        x +
                        blockWidth / 2,
                    y:
                        y +
                        blockHeight +
                        25
                });

                if (index < 3) {
                    drawArrow(
                        x + blockWidth,
                        y + blockHeight / 2,
                        x +
                            blockWidth +
                            gap -
                            6,
                        y + blockHeight / 2,
                        "rgba(186, 230, 253, 0.55)"
                    );
                }
            }
        );
    } else {
        const blockWidth =
            panel.width - 70;

        const blockHeight =
            64;

        const gap =
            22;

        blocks.forEach(
            (block, index) => {
                const x =
                    panel.x + 35;

                const y =
                    panel.y +
                    50 +
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

                markerPoints.push({
                    x:
                        x +
                        blockWidth +
                        13,
                    y:
                        y +
                        blockHeight / 2
                });

                if (index < 3) {
                    drawArrow(
                        x + blockWidth / 2,
                        y + blockHeight,
                        x + blockWidth / 2,
                        y +
                            blockHeight +
                            gap -
                            5,
                        "rgba(186, 230, 253, 0.55)"
                    );
                }
            }
        );
    }

    drawMarker(
        markerPoints,
        "#fbbf24",
        0.09
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.72)";

    ctx.font =
        "600 8px Segoe UI";

    ctx.textAlign =
        "left";

    wrapText(
        "El marcador indica secuencia funcional; no representa el recorrido espacial de la energía.",
        panel.x + 15,
        panel.y + panel.height - 25,
        panel.width - 30,
        10,
        2
    );

    ctx.restore();
}

function drawDirectTimePanel(
    panel,
    data
) {
    const controlPlot = {
        x:
            panel.x + 62,
        y:
            panel.y + 62,
        width:
            panel.width - 84,
        height:
            panel.height * 0.20
    };

    const frequencyPlot = {
        x:
            panel.x + 62,
        y:
            panel.y +
            62 +
            panel.height * 0.20 +
            43,
        width:
            panel.width - 84,
        height:
            panel.height * 0.20
    };

    const fmPlot = {
        x:
            panel.x + 62,
        y:
            panel.y +
            62 +
            panel.height * 0.40 +
            88,
        width:
            panel.width - 84,
        height:
            panel.height -
            panel.height * 0.40 -
            183
    };

    const controlMaximum =
        Math.max(
            Math.abs(
                data.minimumControl
            ),
            Math.abs(
                data.maximumControl
            ),
            0.1
        );

    const deviationMaximum =
        Math.max(
            data.deviation,
            data.modulatingFrequency * 0.05,
            1e-12
        );

    drawGrid(
        controlPlot,
        controlMaximum,
        data.duration,
        "V"
    );

    drawGrid(
        frequencyPlot,
        deviationMaximum,
        data.duration,
        "Hz Δ"
    );

    drawGrid(
        fmPlot,
        CARRIER_AMPLITUDE,
        data.duration,
        "V"
    );

    drawWave(
        controlPlot,
        data.duration,
        time =>
            data.biasVoltage +
            data.modulatingVoltage *
            Math.cos(
                TWO_PI *
                data.modulatingFrequency *
                time
            ),
        controlMaximum,
        "#fbbf24",
        2.2
    );

    drawWave(
        controlPlot,
        data.duration,
        () =>
            data.biasVoltage,
        controlMaximum,
        "rgba(96, 165, 250, 0.78)",
        1.3,
        true
    );

    drawWave(
        frequencyPlot,
        data.duration,
        time =>
            data.deviation *
            Math.cos(
                TWO_PI *
                data.modulatingFrequency *
                time
            ),
        deviationMaximum,
        "#c084fc",
        2
    );

    drawWave(
        fmPlot,
        data.duration,
        time =>
            CARRIER_AMPLITUDE *
            Math.cos(
                TWO_PI *
                data.visualCarrierFrequency *
                time +
                data.visualBeta *
                Math.sin(
                    TWO_PI *
                    data.modulatingFrequency *
                    time
                )
            ),
        CARRIER_AMPLITUDE,
        "#34d399",
        1.8
    );

    drawWave(
        fmPlot,
        data.duration,
        () =>
            CARRIER_AMPLITUDE,
        CARRIER_AMPLITUDE,
        "rgba(56, 189, 248, 0.62)",
        1.2,
        true
    );

    drawWave(
        fmPlot,
        data.duration,
        () =>
            -CARRIER_AMPLITUDE,
        CARRIER_AMPLITUDE,
        "rgba(56, 189, 248, 0.62)",
        1.2,
        true
    );

    const instant =
        getDirectInstant(
            data
        );

    const controlX =
        controlPlot.x +
        controlPlot.width *
        instant.progress;

    const frequencyX =
        frequencyPlot.x +
        frequencyPlot.width *
        instant.progress;

    const fmX =
        fmPlot.x +
        fmPlot.width *
        instant.progress;

    const fmValue =
        CARRIER_AMPLITUDE *
        Math.cos(
            TWO_PI *
            data.visualCarrierFrequency *
            instant.time +
            data.visualBeta *
            Math.sin(
                TWO_PI *
                data.modulatingFrequency *
                instant.time
            )
        );

    drawCursor(
        controlPlot,
        controlX,
        mapValueToY(
            instant.controlVoltage,
            controlPlot,
            controlMaximum
        )
    );

    drawCursor(
        frequencyPlot,
        frequencyX,
        mapValueToY(
            instant.instantaneousFrequency -
                data.centralFrequency,
            frequencyPlot,
            deviationMaximum
        )
    );

    drawCursor(
        fmPlot,
        fmX,
        mapValueToY(
            fmValue,
            fmPlot,
            CARRIER_AMPLITUDE
        )
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.80)";

    ctx.font =
        "700 8px Segoe UI";

    ctx.fillText(
        "TENSIÓN DE CONTROL",
        controlPlot.x,
        controlPlot.y - 10
    );

    ctx.fillText(
        "DESVIACIÓN INSTANTÁNEA fi − fᶜ",
        frequencyPlot.x,
        frequencyPlot.y - 10
    );

    ctx.fillText(
        "SEÑAL FM RESULTANTE",
        fmPlot.x,
        fmPlot.y - 10
    );

    ctx.restore();
}

function drawTransferGrid(
    plot,
    xMinimum,
    xMaximum,
    yMinimum,
    yMaximum
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
            plot.y + plot.height
        );

        ctx.stroke();

        const value =
            xMinimum +
            (
                xMaximum -
                xMinimum
            ) *
            index /
            6;

        ctx.fillStyle =
            "rgba(159, 181, 202, 0.72)";

        ctx.font =
            "600 7px Segoe UI";

        ctx.textAlign =
            "center";

        ctx.fillText(
            formatNumber(
                value,
                3
            ) +
            " V",
            x,
            plot.y + plot.height + 18
        );
    }

    for (
        let index = 0;
        index <= 5;
        index += 1
    ) {
        const y =
            plot.y +
            plot.height *
            index /
            5;

        ctx.beginPath();
        ctx.moveTo(plot.x, y);

        ctx.lineTo(
            plot.x + plot.width,
            y
        );

        ctx.stroke();

        const value =
            yMaximum -
            (
                yMaximum -
                yMinimum
            ) *
            index /
            5;

        ctx.fillStyle =
            "rgba(159, 181, 202, 0.72)";

        ctx.textAlign =
            "right";

        ctx.fillText(
            formatFrequency(
                value
            ),
            plot.x - 7,
            y + 3
        );
    }

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.78)";

    ctx.font =
        "600 8px Segoe UI";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "Tensión de control",
        plot.x + plot.width,
        plot.y + plot.height + 38
    );

    ctx.textAlign =
        "left";

    ctx.fillText(
        "Frecuencia de salida",
        plot.x,
        plot.y - 12
    );

    ctx.restore();
}

function transferX(
    value,
    plot,
    minimum,
    maximum
) {
    return (
        plot.x +
        (
            value -
            minimum
        ) /
        (
            maximum -
            minimum
        ) *
        plot.width
    );
}

function transferY(
    value,
    plot,
    minimum,
    maximum
) {
    return (
        plot.y +
        plot.height -
        (
            value -
            minimum
        ) /
        (
            maximum -
            minimum
        ) *
        plot.height
    );
}

function drawTransferPanel(
    panel,
    data
) {
    const voltageMargin =
        Math.max(
            data.modulatingVoltage * 0.35,
            0.5
        );

    const xMinimum =
        Math.min(
            0,
            data.minimumControl -
            voltageMargin
        );

    const xMaximum =
        Math.max(
            data.maximumControl +
            voltageMargin,
            data.biasVoltage + 1
        );

    const frequencyMargin =
        Math.max(
            data.deviation * 0.35,
            data.centralFrequency * 0.03,
            1
        );

    const yMinimum =
        data.minimumFrequency -
        frequencyMargin;

    const yMaximum =
        data.maximumFrequency +
        frequencyMargin;

    const plot = {
        x:
            panel.x + 76,
        y:
            panel.y + 72,
        width:
            panel.width - 102,
        height:
            panel.height - 190
    };

    drawTransferGrid(
        plot,
        xMinimum,
        xMaximum,
        yMinimum,
        yMaximum
    );

    ctx.save();

    ctx.strokeStyle =
        "#38bdf8";

    ctx.lineWidth =
        2.2;

    ctx.beginPath();

    ctx.moveTo(
        transferX(
            xMinimum,
            plot,
            xMinimum,
            xMaximum
        ),
        transferY(
            data.centralFrequency +
            data.sensitivity *
            (
                xMinimum -
                data.biasVoltage
            ),
            plot,
            yMinimum,
            yMaximum
        )
    );

    ctx.lineTo(
        transferX(
            xMaximum,
            plot,
            xMinimum,
            xMaximum
        ),
        transferY(
            data.centralFrequency +
            data.sensitivity *
            (
                xMaximum -
                data.biasVoltage
            ),
            plot,
            yMinimum,
            yMaximum
        )
    );

    ctx.stroke();

    const biasX =
        transferX(
            data.biasVoltage,
            plot,
            xMinimum,
            xMaximum
        );

    const biasY =
        transferY(
            data.centralFrequency,
            plot,
            yMinimum,
            yMaximum
        );

    ctx.strokeStyle =
        "rgba(96, 165, 250, 0.72)";

    ctx.setLineDash(
        [5, 5]
    );

    ctx.beginPath();
    ctx.moveTo(biasX, plot.y);

    ctx.lineTo(
        biasX,
        plot.y + plot.height
    );

    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(plot.x, biasY);

    ctx.lineTo(
        plot.x + plot.width,
        biasY
    );

    ctx.stroke();

    ctx.setLineDash([]);

    const rangeStartX =
        transferX(
            data.minimumControl,
            plot,
            xMinimum,
            xMaximum
        );

    const rangeEndX =
        transferX(
            data.maximumControl,
            plot,
            xMinimum,
            xMaximum
        );

    ctx.fillStyle =
        "rgba(251, 191, 36, 0.12)";

    ctx.strokeStyle =
        "rgba(251, 191, 36, 0.75)";

    ctx.fillRect(
        rangeStartX,
        plot.y,
        rangeEndX - rangeStartX,
        plot.height
    );

    ctx.strokeRect(
        rangeStartX,
        plot.y,
        rangeEndX - rangeStartX,
        plot.height
    );

    const instant =
        getDirectInstant(
            data
        );

    const currentX =
        transferX(
            instant.controlVoltage,
            plot,
            xMinimum,
            xMaximum
        );

    const currentY =
        transferY(
            instant.instantaneousFrequency,
            plot,
            yMinimum,
            yMaximum
        );

    ctx.fillStyle =
        "#fbbf24";

    ctx.shadowBlur =
        13;

    ctx.shadowColor =
        "#fbbf24";

    ctx.beginPath();

    ctx.arc(
        currentX,
        currentY,
        5,
        0,
        TWO_PI
    );

    ctx.fill();

    ctx.shadowBlur =
        0;

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.82)";

    ctx.font =
        "700 8px Segoe UI";

    ctx.fillText(
        "Punto de polarización: " +
        formatNumber(
            data.biasVoltage
        ) +
        " V → " +
        formatFrequency(
            data.centralFrequency
        ),
        plot.x,
        panel.y + panel.height - 95
    );

    ctx.fillText(
        "Pendiente Kᵥ꜀ₒ = " +
        formatFrequency(
            data.sensitivity
        ) +
        "/V",
        plot.x,
        panel.y + panel.height - 79
    );

    ctx.restore();

    const conceptY =
        panel.y +
        panel.height -
        74;

    ctx.save();

    roundedRectanglePath(
        panel.x + 14,
        conceptY,
        panel.width - 28,
        54,
        9
    );

    ctx.fillStyle =
        "rgba(17, 40, 65, 0.54)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(125, 211, 252, 0.12)";

    ctx.stroke();

    ctx.fillStyle =
        "#fbbf24";

    ctx.font =
        "700 8px Segoe UI";

    ctx.fillText(
        "VARACTOR EN INVERSA",
        panel.x + 25,
        conceptY + 19
    );

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.80)";

    ctx.font =
        "600 7px Segoe UI";

    ctx.fillText(
        "V inversa ↑ → Cj ↓ → Ctotal ↓ → f0 ↑",
        panel.x + 25,
        conceptY + 36
    );

    ctx.textAlign =
        "right";

    ctx.fillText(
        "Relación funcional; no se usa una ley C(V) específica.",
        panel.x + panel.width - 25,
        conceptY + 36
    );

    ctx.restore();
}

function drawDirectScene(data) {
    const mobile =
        viewWidth < 720;

    let flowPanel;
    let timePanel;
    let transferPanel;

    if (mobile) {
        flowPanel = {
            x: 14,
            y: 78,
            width:
                viewWidth - 28,
            height: 410
        };

        timePanel = {
            x: 14,
            y: 504,
            width:
                viewWidth - 28,
            height: 590
        };

        transferPanel = {
            x: 14,
            y: 1110,
            width:
                viewWidth - 28,
            height: 300
        };
    } else {
        flowPanel = {
            x: 20,
            y: 78,
            width:
                viewWidth - 40,
            height: 185
        };

        timePanel = {
            x: 20,
            y: 279,
            width:
                viewWidth * 0.60 - 28,
            height: 520
        };

        transferPanel = {
            x:
                timePanel.x +
                timePanel.width +
                16,
            y: 279,
            width:
                viewWidth -
                timePanel.width -
                56,
            height: 520
        };
    }

    drawPanel(
        flowPanel,
        "GENERACIÓN DIRECTA POR VCO",
        "#38bdf8",
        "la modulante controla directamente la frecuencia"
    );

    drawPanel(
        timePanel,
        "SEÑALES SINCRONIZADAS",
        "#34d399",
        "vcontrol(t), fi(t) y sFM(t)"
    );

    drawPanel(
        transferPanel,
        "TRANSFERENCIA TENSIÓN–FRECUENCIA",
        "#fbbf24",
        "modelo lineal local"
    );

    drawDirectFlow(
        flowPanel
    );

    drawDirectTimePanel(
        timePanel,
        data
    );

    drawTransferPanel(
        transferPanel,
        data
    );
}

function drawIndirectFlow(
    panel,
    data
) {
    const mobile =
        viewWidth < 720;

    const blocks = [
        [
            "Modulante",
            "señal de información",
            "#38bdf8"
        ],
        [
            "Integrador",
            "prepara la fase",
            "#60a5fa"
        ],
        [
            "Modulador de fase",
            "genera NBFM inicial",
            "#c084fc"
        ],
        [
            "Multiplicador ×" +
                data.multiplier,
            "multiplica fᶜ y Δf",
            "#fb923c"
        ],
        [
            "Filtro",
            "selecciona armónico útil",
            "#34d399"
        ],
        [
            data.mixingMode === "none"
                ? "Salida FM"
                : "Mezclador + salida",

            data.mixingMode === "none"
                ? "frecuencia multiplicada"
                : "traslada fᶜ",

            "#fbbf24"
        ]
    ];

    const markerPoints = [];

    if (!mobile) {
        const gap =
            17;

        const blockWidth =
            (
                panel.width -
                50 -
                5 * gap
            ) /
            6;

        const blockHeight =
            82;

        const y =
            panel.y + 62;

        blocks.forEach(
            (block, index) => {
                const x =
                    panel.x +
                    25 +
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

                markerPoints.push({
                    x:
                        x +
                        blockWidth / 2,
                    y:
                        y +
                        blockHeight +
                        25
                });

                if (index < 5) {
                    drawArrow(
                        x + blockWidth,
                        y + blockHeight / 2,
                        x +
                            blockWidth +
                            gap -
                            5,
                        y + blockHeight / 2,
                        "rgba(186, 230, 253, 0.55)"
                    );
                }
            }
        );
    } else {
        const blockWidth =
            panel.width - 70;

        const blockHeight =
            62;

        const gap =
            20;

        blocks.forEach(
            (block, index) => {
                const x =
                    panel.x + 35;

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

                markerPoints.push({
                    x:
                        x +
                        blockWidth +
                        13,
                    y:
                        y +
                        blockHeight / 2
                });

                if (index < 5) {
                    drawArrow(
                        x + blockWidth / 2,
                        y + blockHeight,
                        x + blockWidth / 2,
                        y +
                            blockHeight +
                            gap -
                            5,
                        "rgba(186, 230, 253, 0.55)"
                    );
                }
            }
        );
    }

    drawMarker(
        markerPoints,
        "#fb923c",
        0.075
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.72)";

    ctx.font =
        "600 8px Segoe UI";

    ctx.textAlign =
        "left";

    wrapText(
        "El marcador indica secuencia funcional; no representa el recorrido espacial de la energía.",
        panel.x + 15,
        panel.y + panel.height - 25,
        panel.width - 30,
        10,
        2
    );

    ctx.restore();
}

function drawIndirectWavePanel(
    panel,
    data,
    output
) {
    const plot = {
        x:
            panel.x + 62,
        y:
            panel.y + 72,
        width:
            panel.width - 84,
        height:
            panel.height - 122
    };

    drawGrid(
        plot,
        CARRIER_AMPLITUDE,
        data.duration,
        "V"
    );

    const visualCarrier =
        output
            ? data.visualOutputCarrier
            : data.visualInitialCarrier;

    const visualBeta =
        output
            ? data.visualFinalBeta
            : data.visualInitialBeta;

    drawWave(
        plot,
        data.duration,
        time =>
            CARRIER_AMPLITUDE *
            Math.cos(
                TWO_PI *
                visualCarrier *
                time +
                visualBeta *
                Math.sin(
                    TWO_PI *
                    data.modulatingFrequency *
                    time
                )
            ),
        CARRIER_AMPLITUDE,
        output
            ? "#fb923c"
            : "#c084fc",
        1.9
    );

    drawWave(
        plot,
        data.duration,
        () =>
            CARRIER_AMPLITUDE,
        CARRIER_AMPLITUDE,
        "rgba(52, 211, 153, 0.64)",
        1.2,
        true
    );

    drawWave(
        plot,
        data.duration,
        () =>
            -CARRIER_AMPLITUDE,
        CARRIER_AMPLITUDE,
        "rgba(52, 211, 153, 0.64)",
        1.2,
        true
    );

    const instant =
        getIndirectInstant(
            data
        );

    const cursorX =
        plot.x +
        plot.width *
        instant.progress;

    const sample =
        CARRIER_AMPLITUDE *
        Math.cos(
            TWO_PI *
            visualCarrier *
            instant.time +
            visualBeta *
            Math.sin(
                TWO_PI *
                data.modulatingFrequency *
                instant.time
            )
        );

    drawCursor(
        plot,
        cursorX,
        mapValueToY(
            sample,
            plot,
            CARRIER_AMPLITUDE
        )
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199, 220, 235, 0.80)";

    ctx.font =
        "700 8px Segoe UI";

    ctx.fillText(
        output
            ? "fᶜ = " +
                formatFrequency(
                    data.outputCentralFrequency
                ) +
                " · Δf = " +
                formatFrequency(
                    data.multipliedDeviation
                ) +
                " · β = " +
                formatNumber(
                    data.finalBeta,
                    4
                )
            : "fᶜ,0 = " +
                formatFrequency(
                    data.initialCentralFrequency
                ) +
                " · Δf₀ = " +
                formatFrequency(
                    data.initialDeviation
                ) +
                " · β₀ = " +
                formatNumber(
                    data.initialBeta,
                    4
                ),
        plot.x,
        panel.y + panel.height - 18
    );

    ctx.restore();
}

function drawParameterEvolution(
    panel,
    data
) {
    const stages = [
        [
            "Angular inicial",
            data.initialCentralFrequency,
            data.initialDeviation,
            data.initialBeta,
            "#c084fc"
        ],
        [
            "Después de ×" +
                data.multiplier,
            data.multipliedCentralFrequency,
            data.multipliedDeviation,
            data.finalBeta,
            "#fb923c"
        ],
        [
            data.mixingMode === "none"
                ? "Salida filtrada"
                : "Después del mezclador",
            data.outputCentralFrequency,
            data.multipliedDeviation,
            data.finalBeta,
            "#34d399"
        ]
    ];

    const mobile =
        viewWidth < 720;

    const gap =
        12;

    if (!mobile) {
        const cardWidth =
            (
                panel.width -
                40 -
                2 * gap
            ) /
            3;

        stages.forEach(
            (stage, index) => {
                const x =
                    panel.x +
                    20 +
                    index *
                    (
                        cardWidth +
                        gap
                    );

                const y =
                    panel.y + 52;

                ctx.save();

                roundedRectanglePath(
                    x,
                    y,
                    cardWidth,
                    panel.height - 72,
                    9
                );

                ctx.fillStyle =
                    "rgba(17, 40, 65, 0.58)";

                ctx.fill();

                ctx.strokeStyle =
                    stage[4];

                ctx.stroke();

                ctx.fillStyle =
                    stage[4];

                ctx.font =
                    "700 9px Segoe UI";

                ctx.fillText(
                    stage[0],
                    x + 12,
                    y + 20
                );

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.82)";

                ctx.font =
                    "600 8px Segoe UI";

                ctx.fillText(
                    "fᶜ = " +
                    formatFrequency(
                        stage[1]
                    ),
                    x + 12,
                    y + 43
                );

                ctx.fillText(
                    "Δf = " +
                    formatFrequency(
                        stage[2]
                    ),
                    x + 12,
                    y + 61
                );

                ctx.fillText(
                    "β = " +
                    formatNumber(
                        stage[3],
                        5
                    ),
                    x + 12,
                    y + 79
                );

                ctx.restore();
            }
        );
    } else {
        const cardWidth =
            panel.width - 32;

        const cardHeight =
            (
                panel.height -
                72 -
                2 * gap
            ) /
            3;

        stages.forEach(
            (stage, index) => {
                const x =
                    panel.x + 16;

                const y =
                    panel.y +
                    48 +
                    index *
                    (
                        cardHeight +
                        gap
                    );

                ctx.save();

                roundedRectanglePath(
                    x,
                    y,
                    cardWidth,
                    cardHeight,
                    9
                );

                ctx.fillStyle =
                    "rgba(17, 40, 65, 0.58)";

                ctx.fill();

                ctx.strokeStyle =
                    stage[4];

                ctx.stroke();

                ctx.fillStyle =
                    stage[4];

                ctx.font =
                    "700 8px Segoe UI";

                ctx.fillText(
                    stage[0],
                    x + 10,
                    y + 18
                );

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.82)";

                ctx.font =
                    "600 7px Segoe UI";

                ctx.fillText(
                    "fᶜ = " +
                    formatFrequency(
                        stage[1]
                    ) +
                    " · Δf = " +
                    formatFrequency(
                        stage[2]
                    ) +
                    " · β = " +
                    formatNumber(
                        stage[3],
                        4
                    ),
                    x + 10,
                    y + 38
                );

                ctx.restore();
            }
        );
    }
}

function drawIndirectScene(data) {
    const mobile =
        viewWidth < 720;

    let flowPanel;
    let initialPanel;
    let outputPanel;
    let parameterPanel;

    if (mobile) {
        flowPanel = {
            x: 14,
            y: 78,
            width:
                viewWidth - 28,
            height: 560
        };

        initialPanel = {
            x: 14,
            y: 654,
            width:
                viewWidth - 28,
            height: 270
        };

        outputPanel = {
            x: 14,
            y: 940,
            width:
                viewWidth - 28,
            height: 270
        };

        parameterPanel = {
            x: 14,
            y: 1226,
            width:
                viewWidth - 28,
            height: 230
        };
    } else {
        flowPanel = {
            x: 20,
            y: 78,
            width:
                viewWidth - 40,
            height: 190
        };

        initialPanel = {
            x: 20,
            y: 284,
            width:
                (
                    viewWidth - 56
                ) /
                2,
            height: 330
        };

        outputPanel = {
            x:
                initialPanel.x +
                initialPanel.width +
                16,
            y: 284,
            width:
                initialPanel.width,
            height: 330
        };

        parameterPanel = {
            x: 20,
            y: 630,
            width:
                viewWidth - 40,
            height: 190
        };
    }

    drawPanel(
        flowPanel,
        "GENERACIÓN INDIRECTA",
        "#fb923c",
        "FM mediante procesamiento angular, multiplicación y selección"
    );

    drawPanel(
        initialPanel,
        "SEÑAL ANGULAR INICIAL",
        "#c084fc",
        "normalmente NBFM"
    );

    drawPanel(
        outputPanel,
        "SALIDA FM PROCESADA",
        "#34d399",
        "después de multiplicar y trasladar"
    );

    drawPanel(
        parameterPanel,
        "EVOLUCIÓN DE fᶜ, Δf Y β",
        "#fbbf24",
        "el filtro ideal no modifica los valores seleccionados"
    );

    drawIndirectFlow(
        flowPanel,
        data
    );

    drawIndirectWavePanel(
        initialPanel,
        data,
        false
    );

    drawIndirectWavePanel(
        outputPanel,
        data,
        true
    );

    drawParameterEvolution(
        parameterPanel,
        data
    );
}

function drawScene() {
    drawBackground();

    if (
        !currentData ||
        !currentData.valid
    ) {
        ctx.save();

        ctx.fillStyle =
            "#fb7185";

        ctx.font =
            "700 17px Segoe UI";

        ctx.textAlign =
            "center";

        wrapText(
            "Revise las frecuencias, la sensibilidad, las tensiones y el factor de multiplicación.",
            viewWidth / 2,
            viewHeight / 2,
            viewWidth - 70,
            23,
            3
        );

        ctx.restore();
        return;
    }

    if (mode === "direct") {
        drawCanvasHeader(
            "Generación FM directa mediante VCO",
            "La tensión modulante se superpone a Vbias y controla la frecuencia instantánea.",
            "Δf = Kᵥ꜀ₒ·Vₘ",
            "#38bdf8"
        );

        drawDirectScene(
            currentData
        );
    } else {
        drawCanvasHeader(
            "Generación FM indirecta",
            "El multiplicador cambia fᶜ y Δf; el mezclador traslada la frecuencia central.",
            "fᶜ,N = Nfᶜ,0 · ΔfN = NΔf₀",
            "#fb923c"
        );

        drawIndirectScene(
            currentData
        );
    }

    ctx.save();

    ctx.fillStyle =
        "rgba(159, 181, 202, 0.68)";

    ctx.font =
        "500 9px Segoe UI";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "Modelo funcional didáctico · amplitud respecto al tiempo · sin demodulación ni PLL.",
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
            ) /
            1000,
            0.05
        );

    lastFrameTime =
        currentTime;

    if (!paused) {
        elapsedTime +=
            deltaTime *
            (
                mode === "direct"
                    ? Number(
                        $("dSpeed").value
                    )
                    : Number(
                        $("iSpeed").value
                    )
            );

        if (
            elapsedTime >
            10000
        ) {
            elapsedTime =
                0;
        }
    }

    if (
        currentData &&
        currentData.valid
    ) {
        const values =
            metrics.querySelectorAll(
                ".metric span"
            );

        if (
            mode === "direct" &&
            values.length >= 2
        ) {
            const instant =
                getDirectInstant(
                    currentData
                );

            values[0].textContent =
                formatNumber(
                    instant.controlVoltage
                ) +
                " V";

            values[1].textContent =
                formatFrequency(
                    instant.instantaneousFrequency
                );
        } else if (
            mode === "indirect" &&
            values.length >= 6
        ) {
            values[5].textContent =
                formatFrequency(
                    getIndirectInstant(
                        currentData
                    ).outputFrequency
                );
        }
    }

    drawScene();

    requestAnimationFrame(
        animate
    );
}

tabs.forEach(
    button => {
        button.addEventListener(
            "click",
            () => {
                setMode(
                    button.dataset.mode
                );
            }
        );
    }
);

[
    "dFc",
    "dFcU",
    "kvco",
    "kvcoU",
    "vm",
    "dFm",
    "dFmU",
    "bias",
    "dSpeed",
    "iFc",
    "iFcU",
    "iDf",
    "iDfU",
    "iFm",
    "iFmU",
    "mult",
    "lo",
    "loU",
    "mixMode",
    "iSpeed"
].forEach(
    id => {
        const element =
            $(id);

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

document
    .querySelectorAll(".dp")
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    applyDirectPreset(
                        button.dataset.preset
                    );
                }
            );
        }
    );

document
    .querySelectorAll(".ip")
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    applyIndirectPreset(
                        button.dataset.preset
                    );
                }
            );
        }
    );

$("pause").addEventListener(
    "click",
    pauseSimulation
);

$("resume").addEventListener(
    "click",
    continueSimulation
);

$("reset").addEventListener(
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
    time => {
        lastFrameTime =
            time;

        animate(
            time
        );
    }
);
