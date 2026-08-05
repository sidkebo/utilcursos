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

const blockButtons =
    Array.from(
        document.querySelectorAll("[data-block]")
    );

let currentModule = "system";
let selectedBlock = "oscillator";
let paused = false;
let elapsedTime = 0;
let lastFrameTime = performance.now();
let canvasWidth = 1000;
let canvasHeight = 760;
let pixelRatio = 1;
let blockHitAreas = [];

const blockInformation = {
    oscillator: {
        name: "Oscilador",

        function:
            "Genera una señal periódica que funciona como portadora o referencia.",

        input:
            "Alimentación DC, realimentación positiva y red selectiva.",

        output:
            "Portadora periódica en fc.",

        waveform:
            "Senoidal de amplitud aproximadamente constante en el modelo funcional.",

        failure:
            "Falta de alimentación, tierra, realimentación o red resonante incorrecta.",

        expected:
            "Oscilación estable cerca de la frecuencia determinada por la red selectiva."
    },

    modulator: {
        name: "Modulador",

        function:
            "Hace que la información controle la amplitud de la portadora.",

        input:
            "Señal modulante y portadora.",

        output:
            "Señal AM con envolvente.",

        waveform:
            "Portadora rápida con amplitud variable; no es una suma simple.",

        failure:
            "Falta de una entrada, uso de un sumador o índice mayor que uno.",

        expected:
            "AM reconocible; para un índice menor o igual a uno la envolvente no se cruza."
    },

    resonant: {
        name: "Circuito resonante",

        function:
            "Determina o selecciona una frecuencia mediante una red LC.",

        input:
            "Señal con varias componentes o realimentación del oscilador.",

        output:
            "Respuesta principal alrededor de la frecuencia de resonancia.",

        waveform:
            "Componente periódica asociada a la frecuencia seleccionada.",

        failure:
            "L o C incorrectos, unidades mal convertidas, carga o conexión inadecuada.",

        expected:
            "Frecuencia estimada mediante la relación ideal de resonancia, sin predecir la amplitud real."
    },

    filter: {
        name: "Filtro",

        function:
            "Deja pasar la banda útil y atenúa componentes no deseadas.",

        input:
            "Señal modulada o salida con varios productos.",

        output:
            "Componentes ubicadas dentro de la banda de paso.",

        waveform:
            "Señal temporal asociada a las frecuencias conservadas.",

        failure:
            "Centro o ancho de banda incorrectos.",

        expected:
            "Conservar la señal útil sin generar frecuencias nuevas."
    },

    mixer: {
        name: "Mezclador",

        function:
            "Traslada una señal mediante producto o no linealidad.",

        input:
            "Señal de entrada y oscilador local.",

        output:
            "Productos de suma y diferencia.",

        waveform:
            "Producto temporal de dos señales.",

        failure:
            "Realizar una suma simple o perder el oscilador local.",

        expected:
            "Suma y diferencia calculables, seguidas de un filtro si se requiere."
    },

    output: {
        name: "Salida",

        function:
            "Entrega la señal seleccionada a la etapa siguiente.",

        input:
            "Señal ya modulada, filtrada o convertida.",

        output:
            "Señal útil del sistema funcional.",

        waveform:
            "Depende del producto seleccionado y de la banda de paso.",

        failure:
            "Nivel insuficiente, banda equivocada o componente no deseada.",

        expected:
            "Señal compatible con el objetivo del sistema didáctico."
    }
};

function frequencyFactor(unit) {
    if (unit === "MHz") {
        return 1e6;
    }

    if (unit === "kHz") {
        return 1e3;
    }

    return 1;
}

function inductanceFactor(unit) {
    if (unit === "H") {
        return 1;
    }

    if (unit === "mH") {
        return 1e-3;
    }

    return 1e-6;
}

function capacitanceFactor(unit) {
    if (unit === "µF") {
        return 1e-6;
    }

    if (unit === "nF") {
        return 1e-9;
    }

    return 1e-12;
}

function numberValue(id) {
    return Number($(id).value);
}

function clamp(value, minimum, maximum) {
    return Math.min(
        maximum,
        Math.max(minimum, value)
    );
}

function formatNumber(value, decimals = 4) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    if (
        value !== 0 &&
        (
            Math.abs(value) >= 1e8 ||
            Math.abs(value) < 1e-5
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

    const absolute =
        Math.abs(value);

    const sign =
        value < 0
            ? "−"
            : "";

    if (absolute >= 1e6) {
        return (
            sign +
            formatNumber(
                absolute / 1e6,
                5
            ) +
            " MHz"
        );
    }

    if (absolute >= 1e3) {
        return (
            sign +
            formatNumber(
                absolute / 1e3,
                5
            ) +
            " kHz"
        );
    }

    return (
        sign +
        formatNumber(
            absolute,
            5
        ) +
        " Hz"
    );
}

function formatTime(value) {
    if (value >= 1) {
        return (
            formatNumber(value, 6) +
            " s"
        );
    }

    if (value >= 1e-3) {
        return (
            formatNumber(
                value * 1e3,
                6
            ) +
            " ms"
        );
    }

    if (value >= 1e-6) {
        return (
            formatNumber(
                value * 1e6,
                6
            ) +
            " µs"
        );
    }

    return (
        formatNumber(
            value * 1e9,
            6
        ) +
        " ns"
    );
}

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

function renderMetrics(items) {
    $("metrics").innerHTML =
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

function getSystemData() {
    const carrierFrequency =
        numberValue("fc") *
        frequencyFactor(
            $("fcU").value
        );

    const modulatingFrequency =
        numberValue("fm") *
        frequencyFactor(
            $("fmU").value
        );

    const modulationIndex =
        numberValue("m");

    const localOscillator =
        numberValue("lo") *
        frequencyFactor(
            $("loU").value
        );

    const inductance =
        numberValue("sysL") *
        inductanceFactor(
            $("sysLU").value
        );

    const capacitance =
        numberValue("sysC") *
        capacitanceFactor(
            $("sysCU").value
        );

    const filterCenter =
        numberValue("fCenter") *
        frequencyFactor(
            $("fCenterU").value
        );

    const filterBandwidth =
        numberValue("fBw") *
        frequencyFactor(
            $("fBwU").value
        );

    const valid =
        [
            carrierFrequency,
            modulatingFrequency,
            modulationIndex,
            localOscillator,
            inductance,
            capacitance,
            filterCenter,
            filterBandwidth
        ].every(Number.isFinite) &&
        carrierFrequency > 0 &&
        modulatingFrequency > 0 &&
        modulationIndex >= 0 &&
        localOscillator > 0 &&
        inductance > 0 &&
        capacitance > 0 &&
        filterCenter > 0 &&
        filterBandwidth > 0;

    if (!valid) {
        return {
            valid: false
        };
    }

    const resonanceFrequency =
        1 /
        (
            2 *
            Math.PI *
            Math.sqrt(
                inductance *
                capacitance
            )
        );

    const sumFrequency =
        carrierFrequency +
        localOscillator;

    const differenceFrequency =
        Math.abs(
            carrierFrequency -
            localOscillator
        );

    const amLowerFrequency =
        carrierFrequency -
        modulatingFrequency;

    const amUpperFrequency =
        carrierFrequency +
        modulatingFrequency;

    const filterLowerFrequency =
        filterCenter -
        filterBandwidth / 2;

    const filterUpperFrequency =
        filterCenter +
        filterBandwidth / 2;

    let filterCoverage;

    if (
        filterLowerFrequency <= amLowerFrequency &&
        filterUpperFrequency >= amUpperFrequency
    ) {
        filterCoverage = "full";
    } else if (
        filterUpperFrequency < amLowerFrequency ||
        filterLowerFrequency > amUpperFrequency
    ) {
        filterCoverage = "none";
    } else {
        filterCoverage = "partial";
    }

    return {
        valid: true,
        carrierFrequency,
        modulatingFrequency,
        modulationIndex,
        localOscillator,
        inductance,
        capacitance,
        resonanceFrequency,
        sumFrequency,
        differenceFrequency,
        amLowerFrequency,
        amUpperFrequency,
        filterCenter,
        filterBandwidth,
        filterLowerFrequency,
        filterUpperFrequency,
        filterCoverage,
        frequencyRatio:
            carrierFrequency /
            modulatingFrequency
    };
}

function getOscillatorData() {
    const isColpitts =
        currentModule === "colpitts";

    const valueA =
        numberValue("oscA");

    const valueB =
        numberValue("oscB");

    const valueC =
        numberValue("oscC");

    let inductance;
    let capacitance;
    let equivalentValue;

    if (isColpitts) {
        inductance =
            valueA *
            inductanceFactor(
                $("oscAU").value
            );

        const capacitor1 =
            valueB *
            capacitanceFactor(
                $("oscBU").value
            );

        const capacitor2 =
            valueC *
            capacitanceFactor(
                $("oscCU").value
            );

        equivalentValue =
            capacitor1 *
            capacitor2 /
            (
                capacitor1 +
                capacitor2
            );

        capacitance =
            equivalentValue;
    } else {
        const inductor1 =
            valueA *
            inductanceFactor(
                $("oscAU").value
            );

        const inductor2 =
            valueB *
            inductanceFactor(
                $("oscBU").value
            );

        inductance =
            inductor1 +
            inductor2;

        equivalentValue =
            inductance;

        capacitance =
            valueC *
            capacitanceFactor(
                $("oscCU").value
            );
    }

    const valid =
        [
            inductance,
            capacitance,
            equivalentValue
        ].every(Number.isFinite) &&
        inductance > 0 &&
        capacitance > 0;

    const working =
        $("supply").value === "ok" &&
        $("ground").value === "ok" &&
        $("feedback").value === "ok";

    return {
        valid,
        isColpitts,
        inductance,
        capacitance,
        equivalentValue,

        resonanceFrequency:
            valid
                ? 1 /
                    (
                        2 *
                        Math.PI *
                        Math.sqrt(
                            inductance *
                            capacitance
                        )
                    )
                : NaN,

        working
    };
}

function getMixerData() {
    const frequency1 =
        numberValue("f1") *
        frequencyFactor(
            $("f1U").value
        );

    const frequency2 =
        numberValue("f2") *
        frequencyFactor(
            $("f2U").value
        );

    const filterBandwidth =
        numberValue("mixBw") *
        frequencyFactor(
            $("mixBwU").value
        );

    const operation =
        $("operation").value;

    const selection =
        $("selection").value;

    const valid =
        [
            frequency1,
            frequency2,
            filterBandwidth
        ].every(Number.isFinite) &&
        frequency1 > 0 &&
        frequency2 > 0 &&
        filterBandwidth > 0;

    const sumFrequency =
        frequency1 +
        frequency2;

    const differenceFrequency =
        Math.abs(
            frequency1 -
            frequency2
        );

    let selectedFrequency =
        NaN;

    if (selection === "sum") {
        selectedFrequency =
            sumFrequency;
    } else if (selection === "difference") {
        selectedFrequency =
            differenceFrequency;
    }

    return {
        valid,
        frequency1,
        frequency2,
        filterBandwidth,
        operation,
        selection,
        sumFrequency,
        differenceFrequency,
        selectedFrequency,

        frequencyRatio:
            Math.max(
                frequency1,
                frequency2
            ) /
            Math.min(
                frequency1,
                frequency2
            )
    };
}

function updateBlockDetails() {
    const data =
        blockInformation[selectedBlock];

    $("detailTitle").textContent =
        "Bloque seleccionado: " +
        data.name;

    $("dFn").textContent =
        data.function;

    $("dIn").textContent =
        data.input;

    $("dOut").textContent =
        data.output;

    $("dWave").textContent =
        data.waveform;

    $("dFail").textContent =
        data.failure;

    $("dExpected").textContent =
        data.expected;

    blockButtons.forEach(
        button => {
            button.classList.toggle(
                "active",
                button.dataset.block === selectedBlock
            );
        }
    );
}

function updateSystemInterface() {
    setActiveColor(
        "#38bdf8",
        "56,189,248"
    );

    const data =
        getSystemData();

    $("mOut").textContent =
        formatNumber(
            numberValue("m"),
            2
        );

    $("sysSpeedOut").textContent =
        numberValue("sysSpeed")
            .toFixed(1)
            .replace(".", ",") +
        "×";

    if (!data.valid) {
        showBanner(
            "danger",
            "Datos no válidos",
            "Revise las frecuencias, la inductancia, la capacitancia y el filtro.",
            "Sin cálculo"
        );

        renderMetrics(
            Array(6).fill(
                [
                    "Valor",
                    "—"
                ]
            )
        );

        return;
    }

    let state = "";
    let description =
        "El filtro contiene toda la banda AM teórica.";

    if (
        data.filterCoverage === "partial"
    ) {
        state = "warning";

        description =
            "El filtro solo cubre una parte de la banda AM.";
    }

    if (
        data.filterCoverage === "none"
    ) {
        state = "danger";

        description =
            "La banda AM queda fuera del filtro.";
    }

    if (
        data.modulationIndex > 1
    ) {
        state = "danger";

        description =
            "Existe sobremodulación; además, " +
            description.toLowerCase();
    }

    showBanner(
        state,
        "Sistema funcional AM",
        description,
        blockInformation[selectedBlock].name
    );

    renderMetrics(
        [
            [
                "Portadora",
                formatFrequency(
                    data.carrierFrequency
                )
            ],
            [
                "Modulante",
                formatFrequency(
                    data.modulatingFrequency
                )
            ],
            [
                "Índice AM",
                formatNumber(
                    data.modulationIndex,
                    2
                )
            ],
            [
                "Resonancia LC",
                formatFrequency(
                    data.resonanceFrequency
                )
            ],
            [
                "Suma fc + fLO",
                formatFrequency(
                    data.sumFrequency
                )
            ],
            [
                "Diferencia |fc − fLO|",
                formatFrequency(
                    data.differenceFrequency
                )
            ]
        ]
    );

    $("sysF1").textContent =
        "f0 = 1 / (2π√LC) = " +
        formatFrequency(
            data.resonanceFrequency
        );

    $("sysF2").textContent =
        "AM: " +
        formatFrequency(
            data.amLowerFrequency
        ) +
        " a " +
        formatFrequency(
            data.amUpperFrequency
        ) +
        " · filtro: " +
        formatFrequency(
            data.filterLowerFrequency
        ) +
        " a " +
        formatFrequency(
            data.filterUpperFrequency
        );

    $("sysF3").textContent =
        "fΣ = " +
        formatFrequency(
            data.sumFrequency
        ) +
        " · fΔ = " +
        formatFrequency(
            data.differenceFrequency
        );

    updateBlockDetails();

    $("note").innerHTML =
        "<strong>Advertencia visual:</strong> " +
        (
            data.frequencyRatio > 50
                ? "la portadora se comprime en el Canvas para conservar legibilidad. "
                : ""
        ) +
        "Los marcadores indican secuencia funcional, no movimiento físico de energía. " +
        "Las curvas representan amplitud respecto al tiempo.";
}

function configureOscillatorControls() {
    const isColpitts =
        currentModule === "colpitts";

    setActiveColor(
        isColpitts
            ? "#c084fc"
            : "#34d399",

        isColpitts
            ? "192,132,252"
            : "52,211,153"
    );

    $("aLabel").textContent =
        isColpitts
            ? "Inductancia L"
            : "Inductancia L1";

    $("bLabel").textContent =
        isColpitts
            ? "Capacitancia C1"
            : "Inductancia L2";

    $("cLabel").textContent =
        isColpitts
            ? "Capacitancia C2"
            : "Capacitancia C";

    $("oscAU").innerHTML =
        '<option>µH</option>' +
        '<option selected>mH</option>' +
        '<option>H</option>';

    $("oscBU").innerHTML =
        isColpitts
            ? '<option>pF</option>' +
                '<option selected>nF</option>' +
                '<option>µF</option>'
            : '<option>µH</option>' +
                '<option selected>mH</option>' +
                '<option>H</option>';

    $("oscCU").innerHTML =
        '<option>pF</option>' +
        '<option selected>nF</option>' +
        '<option>µF</option>';

    $("eqLabel").textContent =
        isColpitts
            ? "Capacitancia equivalente"
            : "Inductancia total aproximada";

    $("oscPresetTitle").textContent =
        isColpitts
            ? "Casos rápidos de Colpitts"
            : "Casos rápidos de Hartley";
}

function updateOscillatorInterface() {
    const data =
        getOscillatorData();

    $("oscSpeedOut").textContent =
        numberValue("oscSpeed")
            .toFixed(1)
            .replace(".", ",") +
        "×";

    if (!data.valid) {
        showBanner(
            "danger",
            "Componentes no válidos",
            "Los valores deben ser positivos.",
            "Sin cálculo"
        );

        renderMetrics(
            Array(6).fill(
                [
                    "Valor",
                    "—"
                ]
            )
        );

        return;
    }

    let state = "";

    let title =
        data.isColpitts
            ? "Colpitts funcional"
            : "Hartley funcional";

    let description =
        data.isColpitts
            ? "Divisor capacitivo, red LC y realimentación positiva."
            : "Divisor inductivo, capacitor y realimentación positiva.";

    if (!data.working) {
        state = "danger";
        title = "No se representa oscilación";

        const faults = [];

        if (
            $("supply").value !== "ok"
        ) {
            faults.push("alimentación");
        }

        if (
            $("ground").value !== "ok"
        ) {
            faults.push("tierra común");
        }

        if (
            $("feedback").value !== "ok"
        ) {
            faults.push("realimentación");
        }

        description =
            "Diagnóstico: revisar " +
            faults.join(", ") +
            ". No se inventa una frecuencia observada.";
    }

    showBanner(
        state,
        title,
        description,
        formatFrequency(
            data.resonanceFrequency
        )
    );

    renderMetrics(
        [
            [
                data.isColpitts
                    ? "L"
                    : "L total",

                data.isColpitts
                    ? formatNumber(
                        data.inductance,
                        6
                    ) + " H"
                    : formatNumber(
                        data.equivalentValue,
                        6
                    ) + " H"
            ],
            [
                data.isColpitts
                    ? "C equivalente"
                    : "C",

                formatNumber(
                    data.capacitance,
                    7
                ) +
                " F"
            ],
            [
                "Frecuencia ideal",
                formatFrequency(
                    data.resonanceFrequency
                )
            ],
            [
                "Periodo ideal",
                formatTime(
                    1 /
                    data.resonanceFrequency
                )
            ],
            [
                "Alimentación",
                $("supply").value === "ok"
                    ? "Correcta"
                    : "Faltante"
            ],
            [
                "Estado",
                data.working
                    ? "Oscilando"
                    : "Diagnóstico"
            ]
        ]
    );

    $("oscF1").textContent =
        data.isColpitts
            ? "Ceq = C1C2 / (C1 + C2) = " +
                formatNumber(
                    data.equivalentValue,
                    8
                ) +
                " F"
            : "Ltotal ≈ L1 + L2 = " +
                formatNumber(
                    data.equivalentValue,
                    8
                ) +
                " H";

    $("oscF2").textContent =
        "f0 = 1 / (2π√LC) = " +
        formatFrequency(
            data.resonanceFrequency
        );

    $("oscF3").textContent =
        "T = 1 / f0 = " +
        formatTime(
            1 /
            data.resonanceFrequency
        );

    $("note").innerHTML =
        "<strong>Alcance:</strong> la frecuencia es una estimación ideal. " +
        (
            data.isColpitts
                ? "Colpitts usa realimentación capacitiva. "
                : "Hartley usa realimentación inductiva; no se inventa acoplamiento magnético. "
        ) +
        "No se calcula polarización avanzada.";
}

function updateMixerInterface() {
    setActiveColor(
        "#fb923c",
        "251,146,60"
    );

    const data =
        getMixerData();

    $("mixSpeedOut").textContent =
        numberValue("mixSpeed")
            .toFixed(1)
            .replace(".", ",") +
        "×";

    $("selection").disabled =
        data.operation === "sum";

    if (!data.valid) {
        showBanner(
            "danger",
            "Datos no válidos",
            "Las frecuencias y el ancho del filtro deben ser positivos.",
            "Sin cálculo"
        );

        renderMetrics(
            Array(6).fill(
                [
                    "Valor",
                    "—"
                ]
            )
        );

        return;
    }

    if (
        data.operation === "sum"
    ) {
        showBanner(
            "danger",
            "Suma simple",
            "Sumar dos senoidales no crea f1 + f2 ni |f1 − f2|.",
            "No es mezcla"
        );
    } else {
        showBanner(
            "",
            "Mezclador ideal",
            data.selection === "none"
                ? "La salida contiene suma y diferencia."
                : "El filtro conceptual conserva el producto seleccionado.",

            data.selection === "sum"
                ? "Suma"
                : data.selection === "difference"
                    ? "Diferencia"
                    : "Dos productos"
        );
    }

    renderMetrics(
        [
            [
                "Entrada 1",
                formatFrequency(
                    data.frequency1
                )
            ],
            [
                "Entrada 2",
                formatFrequency(
                    data.frequency2
                )
            ],
            [
                "Suma",
                formatFrequency(
                    data.sumFrequency
                )
            ],
            [
                "Diferencia",
                formatFrequency(
                    data.differenceFrequency
                )
            ],
            [
                "Filtro",
                formatFrequency(
                    data.filterBandwidth
                )
            ],
            [
                "Operación",
                data.operation === "product"
                    ? "Producto"
                    : "Suma simple"
            ]
        ]
    );

    $("mixF1").textContent =
        "fΣ = f1 + f2 = " +
        formatFrequency(
            data.sumFrequency
        );

    $("mixF2").textContent =
        "fΔ = |f1 − f2| = " +
        formatFrequency(
            data.differenceFrequency
        );

    if (
        data.operation === "sum"
    ) {
        $("mixF3").textContent =
            "x1 + x2 conserva f1 y f2; no aparecen productos nuevos.";
    } else if (
        data.selection === "none"
    ) {
        $("mixF3").textContent =
            "Salida: " +
            formatFrequency(
                data.differenceFrequency
            ) +
            " y " +
            formatFrequency(
                data.sumFrequency
            );
    } else {
        $("mixF3").textContent =
            "Filtro centrado conceptualmente en " +
            formatFrequency(
                data.selectedFrequency
            );
    }

    $("note").innerHTML =
        "<strong>Advertencia visual:</strong> " +
        (
            data.frequencyRatio > 40
                ? "las frecuencias temporales se comprimen para poder compararlas. "
                : ""
        ) +
        "El espectro es ideal y esquemático. El mezclador traslada frecuencias; " +
        "no cambia el mensaje por sí mismo.";
}

function updateInterface() {
    if (
        currentModule === "system"
    ) {
        updateSystemInterface();
    } else if (
        currentModule === "mixer"
    ) {
        updateMixerInterface();
    } else {
        updateOscillatorInterface();
    }
}

function setModule(nextModule) {
    currentModule =
        nextModule;

    elapsedTime = 0;

    tabs.forEach(
        button => {
            button.classList.toggle(
                "active",
                button.dataset.tab === nextModule
            );
        }
    );

    $("systemUI").hidden =
        nextModule !== "system";

    $("oscUI").hidden =
        nextModule !== "colpitts" &&
        nextModule !== "hartley";

    $("mixerUI").hidden =
        nextModule !== "mixer";

    if (
        nextModule === "system"
    ) {
        $("canvasTitle").textContent =
            "Cadena funcional de implementación AM";

        $("explain").innerHTML =
            "<strong>Sistema funcional:</strong> " +
            "el oscilador genera la portadora, el modulador coloca información, " +
            "la resonancia y el filtro seleccionan frecuencia, y el mezclador " +
            "traslada componentes.";
    } else if (
        nextModule === "mixer"
    ) {
        $("canvasTitle").textContent =
            "Mezclador básico y selección de frecuencia";

        $("explain").innerHTML =
            "<strong>Mezcla:</strong> " +
            "el producto de dos señales genera componentes en la suma y la " +
            "diferencia. Una suma eléctrica común no realiza esa conversión.";
    } else {
        configureOscillatorControls();
        loadOscillatorPreset("case1");

        $("canvasTitle").textContent =
            nextModule === "colpitts"
                ? "Oscilador Colpitts"
                : "Oscilador Hartley";

        $("explain").innerHTML =
            nextModule === "colpitts"
                ? "<strong>Colpitts:</strong> utiliza un inductor y dos capacitores; " +
                    "el divisor capacitivo proporciona realimentación."
                : "<strong>Hartley:</strong> utiliza un capacitor y una inductancia " +
                    "dividida; la realimentación es inductiva.";
    }

    resizeCanvas();
    updateInterface();
}

function selectBlock(blockKey) {
    selectedBlock =
        blockKey;

    updateBlockDetails();
    updateSystemInterface();
}

function loadOscillatorPreset(preset) {
    const isColpitts =
        currentModule === "colpitts";

    $("supply").value = "ok";
    $("ground").value = "ok";
    $("feedback").value = "ok";

    if (isColpitts) {
        if (preset === "case2") {
            $("oscA").value = 10;
            $("oscB").value = 4.7;
            $("oscC").value = 4.7;
        } else {
            $("oscA").value = 10;
            $("oscB").value = 10;
            $("oscC").value = 10;
        }
    } else {
        if (preset === "case2") {
            $("oscA").value = 3;
            $("oscB").value = 7;
            $("oscC").value = 10;
        } else {
            $("oscA").value = 5;
            $("oscB").value = 5;
            $("oscC").value = 10;
        }
    }

    if (
        preset === "supply"
    ) {
        $("supply").value =
            "bad";
    }

    if (
        preset === "ground"
    ) {
        $("ground").value =
            "bad";
    }

    if (
        preset === "feedback"
    ) {
        $("feedback").value =
            "bad";
    }

    elapsedTime = 0;
    updateOscillatorInterface();
}

function loadMixerPreset(preset) {
    const presets = {
        class: [
            10,
            3,
            "kHz"
        ],

        lesson: [
            100,
            20,
            "kHz"
        ],

        intermediate: [
            1000,
            545,
            "kHz"
        ],

        optional: [
            455,
            100,
            "kHz"
        ]
    };

    $("operation").value =
        preset === "simple"
            ? "sum"
            : "product";

    if (
        preset === "simple"
    ) {
        preset =
            "class";
    }

    const values =
        presets[preset];

    $("f1").value =
        values[0];

    $("f2").value =
        values[1];

    $("f1U").value =
        values[2];

    $("f2U").value =
        values[2];

    $("selection").value =
        "none";

    elapsedTime = 0;
    updateMixerInterface();
}

function pauseSimulation() {
    paused = true;

    $("pause").disabled = true;
    $("resume").disabled = false;

    $("status").textContent =
        "Simulación pausada";

    $("status").classList.add(
        "paused"
    );
}

function continueSimulation() {
    paused = false;

    lastFrameTime =
        performance.now();

    $("pause").disabled = false;
    $("resume").disabled = true;

    $("status").textContent =
        "Simulación activa";

    $("status").classList.remove(
        "paused"
    );
}

function resetSimulation() {
    continueSimulation();

    elapsedTime = 0;

    if (
        currentModule === "system"
    ) {
        $("fc").value = 100;
        $("fcU").value = "kHz";

        $("fm").value = 5;
        $("fmU").value = "kHz";

        $("m").value = 0.6;

        $("lo").value = 20;
        $("loU").value = "kHz";

        $("sysL").value = 0.2533;
        $("sysLU").value = "mH";

        $("sysC").value = 10;
        $("sysCU").value = "nF";

        $("fCenter").value = 100;
        $("fCenterU").value = "kHz";

        $("fBw").value = 12;
        $("fBwU").value = "kHz";

        selectedBlock =
            "oscillator";

        updateBlockDetails();
    } else if (
        currentModule === "mixer"
    ) {
        loadMixerPreset(
            "class"
        );
    } else {
        loadOscillatorPreset(
            "case1"
        );
    }

    updateInterface();
}

function resizeCanvas() {
    canvasWidth =
        Math.max(
            300,
            $("canvasWrap").clientWidth
        );

    if (
        canvasWidth < 720
    ) {
        if (
            currentModule === "system"
        ) {
            canvasHeight = 1110;
        } else if (
            currentModule === "mixer"
        ) {
            canvasHeight = 1040;
        } else {
            canvasHeight = 860;
        }
    } else {
        canvasHeight =
            currentModule === "system"
                ? 750
                : 650;
    }

    pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.round(
            canvasWidth *
            pixelRatio
        );

    canvas.height =
        Math.round(
            canvasHeight *
            pixelRatio
        );

    canvas.style.width =
        canvasWidth +
        "px";

    canvas.style.height =
        canvasHeight +
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

    let line = "";
    let lineNumber = 0;

    for (
        const word of words
    ) {
        const testLine =
            line
                ? line + " " + word
                : word;

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
                word;

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
            canvasWidth,
            canvasHeight
        );

    gradient.addColorStop(
        0,
        "#020817"
    );

    gradient.addColorStop(
        0.55,
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
        canvasWidth,
        canvasHeight
    );

    ctx.save();

    ctx.strokeStyle =
        "rgba(125,211,252,0.045)";

    for (
        let x = 0;
        x <= canvasWidth;
        x += 40
    ) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    for (
        let y = 0;
        y <= canvasHeight;
        y += 40
    ) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
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
        30
    );

    ctx.fillStyle =
        "rgba(159,181,202,0.83)";

    ctx.font =
        "500 10px Segoe UI";

    wrapText(
        subtitle,
        24,
        49,
        Math.max(
            180,
            canvasWidth - 390
        ),
        14,
        2
    );

    ctx.fillStyle =
        color;

    ctx.font =
        "700 10px Consolas";

    ctx.textAlign =
        "right";

    ctx.fillText(
        formula,
        canvasWidth - 24,
        32
    );

    ctx.restore();
}

function drawPanel(
    panel,
    title,
    color
) {
    roundedRectanglePath(
        panel.x,
        panel.y,
        panel.width,
        panel.height,
        13
    );

    ctx.fillStyle =
        "rgba(2,10,24,0.63)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(125,211,252,0.15)";

    ctx.stroke();

    ctx.fillStyle =
        color;

    ctx.font =
        "700 11px Segoe UI";

    ctx.textAlign =
        "left";

    ctx.fillText(
        title,
        panel.x + 15,
        panel.y + 24
    );
}

function drawGrid(
    plot,
    verticalLabel,
    horizontalLabel
) {
    ctx.save();

    ctx.strokeStyle =
        "rgba(125,211,252,0.08)";

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

    ctx.strokeStyle =
        "rgba(186,230,253,0.35)";

    ctx.beginPath();

    ctx.moveTo(
        plot.x,
        plot.y +
        plot.height / 2
    );

    ctx.lineTo(
        plot.x +
        plot.width,
        plot.y +
        plot.height / 2
    );

    ctx.stroke();

    ctx.fillStyle =
        "rgba(159,181,202,0.72)";

    ctx.font =
        "600 8px Segoe UI";

    ctx.textAlign =
        "left";

    ctx.fillText(
        verticalLabel,
        plot.x,
        plot.y - 9
    );

    ctx.textAlign =
        "right";

    ctx.fillText(
        horizontalLabel,
        plot.x +
        plot.width,
        plot.y +
        plot.height +
        18
    );

    ctx.restore();
}

function drawWave(
    plot,
    valueFunction,
    maximumValue,
    color,
    lineWidth = 2,
    dash = []
) {
    ctx.save();
    ctx.beginPath();

    for (
        let pixel = 0;
        pixel <= plot.width;
        pixel += 1
    ) {
        const normalizedTime =
            pixel /
            plot.width;

        const value =
            valueFunction(
                normalizedTime
            );

        const x =
            plot.x +
            pixel;

        const y =
            plot.y +
            plot.height / 2 -
            value /
            maximumValue *
            plot.height *
            0.42;

        if (
            pixel === 0
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
        dash
    );

    ctx.lineJoin =
        "round";

    ctx.shadowBlur =
        7;

    ctx.shadowColor =
        color;

    ctx.stroke();
    ctx.restore();
}

function drawSystemCanvas(data) {
    const mobile =
        canvasWidth < 720;

    const flowPanel =
        mobile
            ? {
                x: 14,
                y: 82,
                width: canvasWidth - 28,
                height: 690
            }
            : {
                x: 20,
                y: 78,
                width: canvasWidth - 40,
                height: 240
            };

    const previewPanel =
        mobile
            ? {
                x: 14,
                y: 790,
                width: canvasWidth - 28,
                height: 250
            }
            : {
                x: 20,
                y: 348,
                width: canvasWidth - 40,
                height: 360
            };

    drawPanel(
        flowPanel,
        "RECORRIDO FUNCIONAL · SELECCIONE UN BLOQUE",
        "#38bdf8"
    );

    drawPanel(
        previewPanel,
        "FORMA DE ONDA DEL BLOQUE SELECCIONADO",
        "#c084fc"
    );

    const names = [
        "Oscilador",
        "Modulador",
        "Circuito\nresonante",
        "Filtro",
        "Mezclador",
        "Salida"
    ];

    const keys = [
        "oscillator",
        "modulator",
        "resonant",
        "filter",
        "mixer",
        "output"
    ];

    const colors = [
        "#38bdf8",
        "#c084fc",
        "#34d399",
        "#fbbf24",
        "#fb923c",
        "#60a5fa"
    ];

    blockHitAreas = [];

    if (!mobile) {
        const gap = 18;

        const blockWidth =
            (
                flowPanel.width -
                50 -
                gap * 5
            ) /
            6;

        const blockY =
            flowPanel.y +
            72;

        const blockHeight =
            92;

        keys.forEach(
            (key, index) => {
                const x =
                    flowPanel.x +
                    25 +
                    index *
                    (
                        blockWidth +
                        gap
                    );

                const selected =
                    key ===
                    selectedBlock;

                roundedRectanglePath(
                    x,
                    blockY,
                    blockWidth,
                    blockHeight,
                    10
                );

                ctx.fillStyle =
                    selected
                        ? "rgba(56,189,248,0.20)"
                        : "rgba(17,40,65,0.70)";

                ctx.fill();

                ctx.strokeStyle =
                    selected
                        ? "#38bdf8"
                        : "rgba(125,211,252,0.20)";

                ctx.lineWidth =
                    selected
                        ? 2
                        : 1;

                ctx.stroke();

                ctx.fillStyle =
                    colors[index];

                ctx.font =
                    "700 10px Segoe UI";

                ctx.textAlign =
                    "center";

                names[index]
                    .split("\n")
                    .forEach(
                        (line, lineIndex) => {
                            ctx.fillText(
                                line,
                                x +
                                blockWidth /
                                2,
                                blockY +
                                41 +
                                lineIndex *
                                13
                            );
                        }
                    );

                blockHitAreas.push(
                    {
                        key,
                        x,
                        y: blockY,
                        width: blockWidth,
                        height: blockHeight
                    }
                );

                if (
                    index < 5
                ) {
                    ctx.strokeStyle =
                        "rgba(186,230,253,0.40)";

                    ctx.beginPath();

                    ctx.moveTo(
                        x +
                        blockWidth,
                        blockY +
                        blockHeight /
                        2
                    );

                    ctx.lineTo(
                        x +
                        blockWidth +
                        gap -
                        4,
                        blockY +
                        blockHeight /
                        2
                    );

                    ctx.stroke();

                    ctx.fillStyle =
                        "#bae6fd";

                    ctx.beginPath();

                    ctx.moveTo(
                        x +
                        blockWidth +
                        gap -
                        4,
                        blockY +
                        blockHeight /
                        2
                    );

                    ctx.lineTo(
                        x +
                        blockWidth +
                        gap -
                        10,
                        blockY +
                        blockHeight /
                        2 -
                        4
                    );

                    ctx.lineTo(
                        x +
                        blockWidth +
                        gap -
                        10,
                        blockY +
                        blockHeight /
                        2 +
                        4
                    );

                    ctx.fill();
                }
            }
        );

        const progress =
            (
                elapsedTime *
                0.11
            ) %
            1;

        const totalDistance =
            flowPanel.width -
            70;

        const markerX =
            flowPanel.x +
            35 +
            progress *
            totalDistance;

        ctx.fillStyle =
            "#fbbf24";

        ctx.shadowBlur =
            12;

        ctx.shadowColor =
            "#fbbf24";

        ctx.beginPath();

        ctx.arc(
            markerX,
            blockY +
            blockHeight +
            35,
            5,
            0,
            Math.PI *
            2
        );

        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        const blockWidth =
            flowPanel.width -
            70;

        const blockHeight =
            72;

        const gap =
            25;

        keys.forEach(
            (key, index) => {
                const x =
                    flowPanel.x +
                    35;

                const y =
                    flowPanel.y +
                    52 +
                    index *
                    (
                        blockHeight +
                        gap
                    );

                const selected =
                    key ===
                    selectedBlock;

                roundedRectanglePath(
                    x,
                    y,
                    blockWidth,
                    blockHeight,
                    10
                );

                ctx.fillStyle =
                    selected
                        ? "rgba(56,189,248,0.20)"
                        : "rgba(17,40,65,0.70)";

                ctx.fill();

                ctx.strokeStyle =
                    selected
                        ? "#38bdf8"
                        : "rgba(125,211,252,0.20)";

                ctx.lineWidth =
                    selected
                        ? 2
                        : 1;

                ctx.stroke();

                ctx.fillStyle =
                    colors[index];

                ctx.font =
                    "700 10px Segoe UI";

                ctx.textAlign =
                    "center";

                names[index]
                    .split("\n")
                    .forEach(
                        (line, lineIndex) => {
                            ctx.fillText(
                                line,
                                x +
                                blockWidth /
                                2,
                                y +
                                34 +
                                lineIndex *
                                13
                            );
                        }
                    );

                blockHitAreas.push(
                    {
                        key,
                        x,
                        y,
                        width: blockWidth,
                        height: blockHeight
                    }
                );

                if (
                    index < 5
                ) {
                    ctx.strokeStyle =
                        "rgba(186,230,253,0.40)";

                    ctx.beginPath();

                    ctx.moveTo(
                        x +
                        blockWidth /
                        2,
                        y +
                        blockHeight
                    );

                    ctx.lineTo(
                        x +
                        blockWidth /
                        2,
                        y +
                        blockHeight +
                        gap -
                        5
                    );

                    ctx.stroke();
                }
            }
        );
    }

    const plot = {
        x:
            previewPanel.x +
            52,

        y:
            previewPanel.y +
            70,

        width:
            previewPanel.width -
            78,

        height:
            previewPanel.height -
            112
    };

    drawGrid(
        plot,
        "Amplitud normalizada",
        "Tiempo visual"
    );

    const phase =
        elapsedTime *
        0.18;

    if (
        selectedBlock ===
        "oscillator"
    ) {
        drawWave(
            plot,
            time =>
                Math.cos(
                    2 *
                    Math.PI *
                    10 *
                    (
                        time -
                        phase
                    )
                ),
            1,
            "#38bdf8"
        );
    } else if (
        selectedBlock === "modulator" ||
        selectedBlock === "filter"
    ) {
        drawWave(
            plot,
            time =>
                (
                    1 +
                    data.modulationIndex *
                    Math.cos(
                        2 *
                        Math.PI *
                        2 *
                        (
                            time -
                            phase
                        )
                    )
                ) *
                Math.cos(
                    2 *
                    Math.PI *
                    18 *
                    (
                        time -
                        phase
                    )
                ),

            1 +
            data.modulationIndex,

            selectedBlock === "filter" &&
            data.filterCoverage === "none"
                ? "#fb7185"
                : "#f8fafc",

            1.8
        );

        drawWave(
            plot,
            time =>
                1 +
                data.modulationIndex *
                Math.cos(
                    2 *
                    Math.PI *
                    2 *
                    (
                        time -
                        phase
                    )
                ),

            1 +
            data.modulationIndex,

            "#34d399",
            1.7,
            [
                7,
                5
            ]
        );

        drawWave(
            plot,
            time =>
                -(
                    1 +
                    data.modulationIndex *
                    Math.cos(
                        2 *
                        Math.PI *
                        2 *
                        (
                            time -
                            phase
                        )
                    )
                ),

            1 +
            data.modulationIndex,

            "#34d399",
            1.7,
            [
                7,
                5
            ]
        );
    } else if (
        selectedBlock ===
        "resonant"
    ) {
        drawWave(
            plot,
            time =>
                Math.cos(
                    2 *
                    Math.PI *
                    9 *
                    (
                        time -
                        phase
                    )
                ),
            1,
            "#34d399"
        );
    } else if (
        selectedBlock ===
        "mixer"
    ) {
        drawWave(
            plot,
            time =>
                Math.cos(
                    2 *
                    Math.PI *
                    12 *
                    (
                        time -
                        phase
                    )
                ) *
                Math.cos(
                    2 *
                    Math.PI *
                    4 *
                    (
                        time -
                        phase
                    )
                ),
            1,
            "#fb923c"
        );
    } else {
        drawWave(
            plot,
            time =>
                Math.cos(
                    2 *
                    Math.PI *
                    8 *
                    (
                        time -
                        phase
                    )
                ),
            1,
            "#60a5fa"
        );
    }
}

function drawCapacitor(
    x,
    y1,
    y2,
    color,
    label
) {
    const middle =
        (
            y1 +
            y2
        ) /
        2;

    const gap =
        7;

    ctx.save();

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        2;

    ctx.beginPath();
    ctx.moveTo(x, y1);

    ctx.lineTo(
        x,
        middle -
        gap
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x - 11,
        middle -
        gap
    );

    ctx.lineTo(
        x + 11,
        middle -
        gap
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x - 11,
        middle +
        gap
    );

    ctx.lineTo(
        x + 11,
        middle +
        gap
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x,
        middle +
        gap
    );

    ctx.lineTo(
        x,
        y2
    );

    ctx.stroke();

    ctx.fillStyle =
        "#dceff8";

    ctx.font =
        "700 8px Segoe UI";

    ctx.fillText(
        label,
        x + 15,
        middle + 3
    );

    ctx.restore();
}

function drawInductor(
    x1,
    x2,
    y,
    color,
    label
) {
    const turns =
        5;

    const turnWidth =
        (
            x2 -
            x1
        ) /
        turns;

    ctx.save();

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        2;

    ctx.beginPath();
    ctx.moveTo(x1, y);

    for (
        let index = 0;
        index < turns;
        index += 1
    ) {
        ctx.arc(
            x1 +
            turnWidth *
            (
                index +
                0.5
            ),
            y,
            turnWidth / 2,
            Math.PI,
            0
        );
    }

    ctx.stroke();

    ctx.fillStyle =
        "#dceff8";

    ctx.font =
        "700 8px Segoe UI";

    ctx.textAlign =
        "center";

    ctx.fillText(
        label,
        (
            x1 +
            x2
        ) /
        2,
        y - 18
    );

    ctx.restore();
}

function drawGround(
    x,
    y,
    color
) {
    ctx.save();

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        1.8;

    const lines = [
        [
            0,
            0,
            0,
            8
        ],
        [
            -11,
            8,
            11,
            8
        ],
        [
            -7,
            13,
            7,
            13
        ],
        [
            -3,
            18,
            3,
            18
        ]
    ];

    lines.forEach(
        line => {
            ctx.beginPath();

            ctx.moveTo(
                x + line[0],
                y + line[1]
            );

            ctx.lineTo(
                x + line[2],
                y + line[3]
            );

            ctx.stroke();
        }
    );

    ctx.restore();
}

function drawOscillatorCanvas(data) {
    const mobile =
        canvasWidth < 720;

    const circuitPanel =
        mobile
            ? {
                x: 14,
                y: 82,
                width: canvasWidth - 28,
                height: 420
            }
            : {
                x: 20,
                y: 78,
                width: canvasWidth * 0.52 - 30,
                height: canvasHeight - 118
            };

    const outputPanel =
        mobile
            ? {
                x: 14,
                y: 520,
                width: canvasWidth - 28,
                height: 280
            }
            : {
                x:
                    circuitPanel.x +
                    circuitPanel.width +
                    16,

                y: 78,

                width:
                    canvasWidth -
                    circuitPanel.width -
                    56,

                height:
                    canvasHeight -
                    118
            };

    const color =
        data.isColpitts
            ? "#c084fc"
            : "#34d399";

    drawPanel(
        circuitPanel,
        data.isColpitts
            ? "COLPITTS · REALIMENTACIÓN CAPACITIVA"
            : "HARTLEY · REALIMENTACIÓN INDUCTIVA",
        color
    );

    drawPanel(
        outputPanel,
        "SALIDA FUNCIONAL",
        data.working
            ? "#34d399"
            : "#fb7185"
    );

    const centerX =
        circuitPanel.x +
        circuitPanel.width *
        0.62;

    const topY =
        circuitPanel.y +
        110;

    const bottomY =
        circuitPanel.y +
        circuitPanel.height -
        75;

    roundedRectanglePath(
        circuitPanel.x + 34,
        circuitPanel.y + 150,
        115,
        92,
        10
    );

    ctx.fillStyle =
        "rgba(17,40,65,0.72)";

    ctx.fill();

    ctx.strokeStyle =
        data.working
            ? color
            : "#fb7185";

    ctx.stroke();

    ctx.fillStyle =
        "#e7f7ff";

    ctx.font =
        "700 9px Segoe UI";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Amplificador",
        circuitPanel.x + 91,
        circuitPanel.y + 199
    );

    if (
        data.isColpitts
    ) {
        drawInductor(
            centerX - 78,
            centerX + 78,
            topY,
            "#38bdf8",
            "L"
        );

        drawCapacitor(
            centerX - 38,
            topY + 18,
            bottomY,
            "#fbbf24",
            "C1"
        );

        drawCapacitor(
            centerX + 38,
            topY + 18,
            bottomY,
            "#fbbf24",
            "C2"
        );
    } else {
        drawInductor(
            centerX - 110,
            centerX - 8,
            circuitPanel.y + 205,
            "#38bdf8",
            "L1"
        );

        drawInductor(
            centerX + 8,
            centerX + 110,
            circuitPanel.y + 205,
            "#60a5fa",
            "L2"
        );

        drawCapacitor(
            centerX,
            topY,
            bottomY,
            "#fbbf24",
            "C"
        );
    }

    ctx.strokeStyle =
        $("feedback").value === "ok"
            ? "#34d399"
            : "#fb7185";

    ctx.setLineDash(
        $("feedback").value === "ok"
            ? []
            : [
                6,
                5
            ]
    );

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        data.isColpitts
            ? (
                topY +
                bottomY
            ) /
            2
            : circuitPanel.y +
                205
    );

    ctx.lineTo(
        circuitPanel.x + 149,
        circuitPanel.y + 195
    );

    ctx.stroke();
    ctx.setLineDash([]);

    drawGround(
        centerX,
        bottomY + 6,

        $("ground").value === "ok"
            ? "#a7f3d0"
            : "#fb7185"
    );

    ctx.fillStyle =
        $("supply").value === "ok"
            ? "#a7f3d0"
            : "#fb7185";

    ctx.font =
        "700 9px Segoe UI";

    ctx.textAlign =
        "left";

    ctx.fillText(
        $("supply").value === "ok"
            ? "Vcc conectada"
            : "Vcc faltante",

        circuitPanel.x + 38,
        circuitPanel.y + 115
    );

    const plot = {
        x:
            outputPanel.x +
            48,

        y:
            outputPanel.y +
            70,

        width:
            outputPanel.width -
            72,

        height:
            outputPanel.height -
            110
    };

    drawGrid(
        plot,
        "Salida normalizada",
        "Tiempo visual"
    );

    if (
        data.working
    ) {
        drawWave(
            plot,

            time =>
                Math.cos(
                    2 *
                    Math.PI *
                    10 *
                    (
                        time -
                        elapsedTime *
                        0.18
                    )
                ),

            1,
            color,
            2.2
        );
    } else {
        drawWave(
            plot,
            () => 0,
            1,
            "#fb7185",
            2
        );

        ctx.fillStyle =
            "#fb7185";

        ctx.font =
            "700 11px Segoe UI";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Sin oscilación representada",
            plot.x +
            plot.width /
            2,
            plot.y +
            plot.height /
            2 -
            20
        );
    }
}

function drawSpectrumAxes(
    plot,
    maximumFrequency
) {
    const baseline =
        plot.y +
        plot.height;

    ctx.save();

    ctx.strokeStyle =
        "rgba(125,211,252,0.08)";

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

        ctx.fillStyle =
            "rgba(159,181,202,0.72)";

        ctx.font =
            "600 7px Segoe UI";

        ctx.textAlign =
            "center";

        ctx.fillText(
            formatFrequency(
                maximumFrequency *
                index /
                6
            ),
            x,
            baseline + 19
        );
    }

    ctx.strokeStyle =
        "rgba(186,230,253,0.42)";

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
    ctx.restore();
}

function drawSpectrumLine(
    x,
    baseline,
    height,
    color,
    label,
    frequency,
    faded = false
) {
    ctx.save();

    ctx.globalAlpha =
        faded
            ? 0.25
            : 1;

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        faded
            ? 2
            : 4;

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
            : 12;

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
        height
    );

    ctx.stroke();

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    ctx.fillStyle =
        color;

    ctx.font =
        "700 8px Segoe UI";

    ctx.textAlign =
        "center";

    ctx.fillText(
        label,
        x,
        baseline -
        height -
        10
    );

    ctx.fillStyle =
        "#c7dceb";

    ctx.font =
        "600 7px Segoe UI";

    ctx.fillText(
        formatFrequency(
            frequency
        ),
        x,
        baseline + 32
    );

    ctx.restore();
}

function drawMixerCanvas(data) {
    const mobile =
        canvasWidth < 720;

    const timePanel =
        mobile
            ? {
                x: 14,
                y: 82,
                width: canvasWidth - 28,
                height: 570
            }
            : {
                x: 20,
                y: 78,
                width: canvasWidth * 0.56 - 28,
                height: canvasHeight - 118
            };

    const spectrumPanel =
        mobile
            ? {
                x: 14,
                y: 670,
                width: canvasWidth - 28,
                height: 310
            }
            : {
                x:
                    timePanel.x +
                    timePanel.width +
                    16,

                y: 78,

                width:
                    canvasWidth -
                    timePanel.width -
                    56,

                height:
                    canvasHeight -
                    118
            };

    drawPanel(
        timePanel,

        data.operation === "product"
            ? "DOMINIO DEL TIEMPO · PRODUCTO"
            : "DOMINIO DEL TIEMPO · SUMA SIMPLE",

        "#fb923c"
    );

    drawPanel(
        spectrumPanel,
        "COMPONENTES Y SELECCIÓN",
        "#fbbf24"
    );

    const ratio =
        clamp(
            data.frequencyRatio,
            1,
            40
        );

    const lowVisualFrequency =
        4;

    const highVisualFrequency =
        4 *
        ratio;

    const phase =
        elapsedTime *
        0.18;

    const visualFrequency1 =
        data.frequency1 >=
        data.frequency2
            ? highVisualFrequency
            : lowVisualFrequency;

    const visualFrequency2 =
        data.frequency2 >=
        data.frequency1
            ? highVisualFrequency
            : lowVisualFrequency;

    const plotHeight =
        mobile
            ? 105
            : 112;

    const gap =
        mobile
            ? 45
            : 40;

    const inputPlot1 = {
        x:
            timePanel.x +
            50,

        y:
            timePanel.y +
            65,

        width:
            timePanel.width -
            74,

        height:
            plotHeight
    };

    const inputPlot2 = {
        x:
            timePanel.x +
            50,

        y:
            timePanel.y +
            65 +
            plotHeight +
            gap,

        width:
            timePanel.width -
            74,

        height:
            plotHeight
    };

    const outputPlot = {
        x:
            timePanel.x +
            50,

        y:
            timePanel.y +
            65 +
            2 *
            (
                plotHeight +
                gap
            ),

        width:
            timePanel.width -
            74,

        height:
            mobile
                ? 140
                : timePanel.height -
                    380
    };

    drawGrid(
        inputPlot1,
        "Entrada 1 · " +
        formatFrequency(
            data.frequency1
        ),
        "Tiempo visual"
    );

    drawGrid(
        inputPlot2,
        "Entrada 2 · " +
        formatFrequency(
            data.frequency2
        ),
        "Tiempo visual"
    );

    drawGrid(
        outputPlot,

        data.operation === "product"
            ? "Salida x1 · x2"
            : "Salida x1 + x2",

        "Tiempo visual"
    );

    drawWave(
        inputPlot1,

        time =>
            Math.cos(
                2 *
                Math.PI *
                visualFrequency1 *
                (
                    time -
                    phase
                )
            ),

        1,
        "#38bdf8"
    );

    drawWave(
        inputPlot2,

        time =>
            Math.cos(
                2 *
                Math.PI *
                visualFrequency2 *
                (
                    time -
                    phase
                )
            ),

        1,
        "#c084fc"
    );

    drawWave(
        outputPlot,

        time => {
            const value1 =
                Math.cos(
                    2 *
                    Math.PI *
                    visualFrequency1 *
                    (
                        time -
                        phase
                    )
                );

            const value2 =
                Math.cos(
                    2 *
                    Math.PI *
                    visualFrequency2 *
                    (
                        time -
                        phase
                    )
                );

            return data.operation === "product"
                ? value1 *
                    value2
                : value1 +
                    value2;
        },

        data.operation === "product"
            ? 1
            : 2,

        "#fb923c"
    );

    const maximumFrequency =
        Math.max(
            data.sumFrequency,
            data.frequency1,
            data.frequency2
        ) *
        1.12;

    const spectrumPlot = {
        x:
            spectrumPanel.x +
            28,

        y:
            spectrumPanel.y +
            78,

        width:
            spectrumPanel.width -
            56,

        height:
            spectrumPanel.height -
            175
    };

    drawSpectrumAxes(
        spectrumPlot,
        maximumFrequency
    );

    const baseline =
        spectrumPlot.y +
        spectrumPlot.height;

    const frequencyToX =
        frequency =>
            spectrumPlot.x +
            frequency /
            maximumFrequency *
            spectrumPlot.width;

    const lineHeight =
        spectrumPlot.height *
        0.68;

    if (
        data.operation === "product"
    ) {
        drawSpectrumLine(
            frequencyToX(
                data.differenceFrequency
            ),
            baseline,
            lineHeight,
            "#34d399",
            "Diferencia",
            data.differenceFrequency,
            data.selection === "sum"
        );

        drawSpectrumLine(
            frequencyToX(
                data.sumFrequency
            ),
            baseline,
            lineHeight,
            "#fb923c",
            "Suma",
            data.sumFrequency,
            data.selection === "difference"
        );

        if (
            data.selection !== "none"
        ) {
            const left =
                frequencyToX(
                    Math.max(
                        0,
                        data.selectedFrequency -
                        data.filterBandwidth /
                        2
                    )
                );

            const right =
                frequencyToX(
                    data.selectedFrequency +
                    data.filterBandwidth /
                    2
                );

            ctx.fillStyle =
                "rgba(251,191,36,0.12)";

            ctx.strokeStyle =
                "#fbbf24";

            ctx.setLineDash(
                [
                    6,
                    4
                ]
            );

            ctx.fillRect(
                left,
                spectrumPlot.y,
                right - left,
                spectrumPlot.height
            );

            ctx.strokeRect(
                left,
                spectrumPlot.y,
                right - left,
                spectrumPlot.height
            );

            ctx.setLineDash([]);
        }
    } else {
        drawSpectrumLine(
            frequencyToX(
                data.frequency1
            ),
            baseline,
            lineHeight,
            "#38bdf8",
            "f1",
            data.frequency1
        );

        drawSpectrumLine(
            frequencyToX(
                data.frequency2
            ),
            baseline,
            lineHeight,
            "#c084fc",
            "f2",
            data.frequency2
        );

        ctx.fillStyle =
            "#fb7185";

        ctx.font =
            "700 8px Segoe UI";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "No aparecen f1 + f2 ni |f1 − f2|",
            spectrumPlot.x +
            spectrumPlot.width /
            2,
            spectrumPlot.y +
            25
        );
    }
}

function drawInvalidMessage(text) {
    ctx.fillStyle =
        "#fb7185";

    ctx.font =
        "700 17px Segoe UI";

    ctx.textAlign =
        "center";

    wrapText(
        text,
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth - 70,
        23,
        3
    );
}

function drawScene() {
    drawBackground();

    if (
        currentModule === "system"
    ) {
        const data =
            getSystemData();

        if (!data.valid) {
            drawInvalidMessage(
                "Revise las frecuencias, el índice, la inductancia, la capacitancia y el filtro."
            );

            return;
        }

        drawCanvasHeader(
            "Implementación funcional AM",
            "Seleccione manualmente un bloque. La animación indica una secuencia funcional.",
            "f0 = 1 / (2π√LC)",
            "#38bdf8"
        );

        drawSystemCanvas(
            data
        );
    } else if (
        currentModule === "mixer"
    ) {
        const data =
            getMixerData();

        if (!data.valid) {
            drawInvalidMessage(
                "Las frecuencias y el ancho del filtro deben ser positivos."
            );

            return;
        }

        drawCanvasHeader(
            "Mezclador básico y selección",
            "Compare el producto con la suma simple. Solo la mezcla genera productos nuevos.",
            "fΣ = f1 + f2 · fΔ = |f1 − f2|",
            "#fb923c"
        );

        drawMixerCanvas(
            data
        );
    } else {
        const data =
            getOscillatorData();

        if (!data.valid) {
            drawInvalidMessage(
                "Los componentes del oscilador deben ser positivos."
            );

            return;
        }

        drawCanvasHeader(
            currentModule === "colpitts"
                ? "Oscilador Colpitts"
                : "Oscilador Hartley",

            currentModule === "colpitts"
                ? "Divisor capacitivo y frecuencia ideal."
                : "Divisor inductivo y frecuencia aproximada.",

            currentModule === "colpitts"
                ? "Ceq = C1C2 / (C1 + C2)"
                : "Ltotal ≈ L1 + L2",

            currentModule === "colpitts"
                ? "#c084fc"
                : "#34d399"
        );

        drawOscillatorCanvas(
            data
        );
    }

    ctx.fillStyle =
        "rgba(159,181,202,0.68)";

    ctx.font =
        "500 9px Segoe UI";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "Modelo funcional didáctico · amplitud respecto al tiempo · escalas comprimidas.",
        canvasWidth - 18,
        canvasHeight - 14
    );
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
        let speed;

        if (
            currentModule === "system"
        ) {
            speed =
                numberValue(
                    "sysSpeed"
                );
        } else if (
            currentModule === "mixer"
        ) {
            speed =
                numberValue(
                    "mixSpeed"
                );
        } else {
            speed =
                numberValue(
                    "oscSpeed"
                );
        }

        elapsedTime +=
            deltaTime *
            speed;

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

function handleCanvasSelection(event) {
    if (
        currentModule !== "system"
    ) {
        return;
    }

    const rectangle =
        canvas.getBoundingClientRect();

    const x =
        (
            event.clientX -
            rectangle.left
        ) *
        canvasWidth /
        rectangle.width;

    const y =
        (
            event.clientY -
            rectangle.top
        ) *
        canvasHeight /
        rectangle.height;

    const selectedArea =
        blockHitAreas.find(
            area =>
                x >= area.x &&
                x <= area.x + area.width &&
                y >= area.y &&
                y <= area.y + area.height
        );

    if (
        selectedArea
    ) {
        selectBlock(
            selectedArea.key
        );
    }
}

tabs.forEach(
    button => {
        button.addEventListener(
            "click",
            () => {
                setModule(
                    button.dataset.tab
                );
            }
        );
    }
);

blockButtons.forEach(
    button => {
        button.addEventListener(
            "click",
            () => {
                selectBlock(
                    button.dataset.block
                );
            }
        );
    }
);

document
    .querySelectorAll(".oscPreset")
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    loadOscillatorPreset(
                        button.dataset.preset
                    );
                }
            );
        }
    );

document
    .querySelectorAll(".mixPreset")
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    const preset =
                        button.dataset.mix === "if"
                            ? "intermediate"
                            : button.dataset.mix;

                    loadMixerPreset(
                        preset
                    );
                }
            );
        }
    );

[
    "fc",
    "fcU",
    "fm",
    "fmU",
    "m",
    "lo",
    "loU",
    "sysL",
    "sysLU",
    "sysC",
    "sysCU",
    "fCenter",
    "fCenterU",
    "fBw",
    "fBwU",
    "sysSpeed",
    "oscA",
    "oscAU",
    "oscB",
    "oscBU",
    "oscC",
    "oscCU",
    "supply",
    "ground",
    "feedback",
    "oscSpeed",
    "f1",
    "f1U",
    "f2",
    "f2U",
    "operation",
    "selection",
    "mixBw",
    "mixBwU",
    "mixSpeed"
].forEach(
    id => {
        $(id).addEventListener(
            "input",
            updateInterface
        );

        $(id).addEventListener(
            "change",
            updateInterface
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
    resetSimulation
);

canvas.addEventListener(
    "pointerdown",
    handleCanvasSelection
);

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();
updateBlockDetails();
updateInterface();

requestAnimationFrame(
    currentTime => {
        lastFrameTime =
            currentTime;

        animate(
            currentTime
        );
    }
);
