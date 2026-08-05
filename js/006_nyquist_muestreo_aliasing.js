"use strict";

/*
 * SIT-400 — Clase 6
 * Nyquist, muestreo y aliasing.
 * No incluye cuantificación, codificación ni resolución en bits.
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

const stateDetail =
    document.getElementById("stateDetail");

const stateValue =
    document.getElementById("stateValue");

const periodMetric =
    document.getElementById("periodMetric");

const sampleIntervalMetric =
    document.getElementById("sampleIntervalMetric");

const samplingMetric =
    document.getElementById("samplingMetric");

const minimumMetric =
    document.getElementById("minimumMetric");

const nyquistMetric =
    document.getElementById("nyquistMetric");

const samplesMetric =
    document.getElementById("samplesMetric");

const signalFrequency =
    document.getElementById("signalFrequency");

const signalFrequencyUnit =
    document.getElementById("signalFrequencyUnit");

const signalAmplitude =
    document.getElementById("signalAmplitude");

const samplingFrequency =
    document.getElementById("samplingFrequency");

const samplingFrequencyUnit =
    document.getElementById("samplingFrequencyUnit");

const initialPhase =
    document.getElementById("initialPhase");

const initialPhaseDisplay =
    document.getElementById("initialPhaseDisplay");

const animationSpeed =
    document.getElementById("animationSpeed");

const animationSpeedDisplay =
    document.getElementById("animationSpeedDisplay");

const antiAliasingFilter =
    document.getElementById("antiAliasingFilter");

const filterLabel =
    document.getElementById("filterLabel");

const formulaCriterion =
    document.getElementById("formulaCriterion");

const formulaSubstitution =
    document.getElementById("formulaSubstitution");

const formulaAlias =
    document.getElementById("formulaAlias");

const pauseButton =
    document.getElementById("pauseButton");

const continueButton =
    document.getElementById("continueButton");

const restartButton =
    document.getElementById("restartButton");

const technicalNote =
    document.getElementById("technicalNote");

const presetButtons =
    Array.from(
        document.querySelectorAll("[data-preset]")
    );

const presets = {
    comfortable: {
        signal: 1,
        signalUnit: "Hz",
        sampling: 10,
        samplingUnit: "Hz",
        phase: 0,
        filter: false
    },

    margin: {
        signal: 2,
        signalUnit: "Hz",
        sampling: 8,
        samplingUnit: "Hz",
        phase: 25,
        filter: false
    },

    limit: {
        signal: 1,
        signalUnit: "Hz",
        sampling: 2,
        samplingUnit: "Hz",
        phase: 0,
        filter: false
    },

    alias: {
        signal: 1,
        signalUnit: "Hz",
        sampling: 1.5,
        samplingUnit: "Hz",
        phase: 20,
        filter: false
    },

    exercise: {
        signal: 3,
        signalUnit: "kHz",
        sampling: 5,
        samplingUnit: "kHz",
        phase: 30,
        filter: false
    }
};

let elapsedTime = 0;
let lastFrameTime = performance.now();
let isPaused = false;

let viewWidth = 1000;
let viewHeight = 720;
let pixelRatio = 1;

[
    signalFrequency,
    signalFrequencyUnit,
    signalAmplitude,
    samplingFrequency,
    samplingFrequencyUnit,
    initialPhase,
    animationSpeed,
    antiAliasingFilter
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

function getFrequencyFactor(unit) {
    return unit === "kHz"
        ? 1000
        : 1;
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

function formatFrequency(valueHz) {
    if (!Number.isFinite(valueHz)) {
        return "—";
    }

    if (Math.abs(valueHz) >= 1000) {
        return (
            formatNumber(
                valueHz / 1000,
                5
            ) +
            " kHz"
        );
    }

    return (
        formatNumber(
            valueHz,
            5
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
                seconds * 1000,
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

function almostEqual(
    first,
    second
) {
    const scale =
        Math.max(
            1,
            Math.abs(first),
            Math.abs(second)
        );

    return (
        Math.abs(
            first - second
        ) <=
        scale * 1e-8
    );
}

function getFilterGain(
    signalHz,
    nyquistHz,
    enabled
) {
    if (!enabled) {
        return 1;
    }

    if (
        !Number.isFinite(nyquistHz) ||
        nyquistHz <= 0
    ) {
        return 0;
    }

    const normalized =
        signalHz /
        nyquistHz;

    if (normalized <= 0.80) {
        return 1;
    }

    if (normalized >= 1) {
        return 0.08;
    }

    const position =
        (
            normalized - 0.80
        ) /
        0.20;

    const smooth =
        0.5 -
        0.5 *
        Math.cos(
            Math.PI * position
        );

    return (
        1 -
        smooth * 0.92
    );
}

function getAliasData(
    signalHz,
    samplingHz,
    phaseRadians
) {
    const half =
        samplingHz / 2;

    let signed =
        (
            (
                signalHz + half
            ) %
            samplingHz +
            samplingHz
        ) %
        samplingHz -
        half;

    if (
        almostEqual(
            Math.abs(signed),
            half
        )
    ) {
        signed =
            half;
    }

    const frequency =
        Math.abs(signed);

    let apparentPhase =
        phaseRadians;

    if (signed < 0) {
        apparentPhase =
            Math.PI -
            phaseRadians;
    }

    return {
        signedFrequency: signed,
        frequency,
        phase: apparentPhase
    };
}

function getSimulationData() {
    const signalHz =
        Number(
            signalFrequency.value
        ) *
        getFrequencyFactor(
            signalFrequencyUnit.value
        );

    const samplingHz =
        Number(
            samplingFrequency.value
        ) *
        getFrequencyFactor(
            samplingFrequencyUnit.value
        );

    const amplitude =
        Number(
            signalAmplitude.value
        );

    const phaseDegrees =
        Number(
            initialPhase.value
        );

    const phaseRadians =
        phaseDegrees *
        Math.PI /
        180;

    const valid =
        Number.isFinite(signalHz) &&
        signalHz > 0 &&
        Number.isFinite(samplingHz) &&
        samplingHz > 0 &&
        Number.isFinite(amplitude) &&
        amplitude > 0;

    if (!valid) {
        return {
            valid: false,
            signalHz,
            samplingHz,
            amplitude,
            phaseDegrees,
            phaseRadians
        };
    }

    const period =
        1 /
        signalHz;

    const sampleInterval =
        1 /
        samplingHz;

    const minimumSampling =
        2 *
        signalHz;

    const nyquistFrequency =
        samplingHz /
        2;

    const samplesPerCycle =
        samplingHz /
        signalHz;

    let state;

    if (
        almostEqual(
            samplingHz,
            minimumSampling
        )
    ) {
        state = "limit";
    } else if (
        samplingHz >
        minimumSampling
    ) {
        state = "sufficient";
    } else {
        state = "insufficient";
    }

    const alias =
        getAliasData(
            signalHz,
            samplingHz,
            phaseRadians
        );

    const filterGain =
        getFilterGain(
            signalHz,
            nyquistFrequency,
            antiAliasingFilter.checked
        );

    const filteredAmplitude =
        amplitude *
        filterGain;

    let apparentFrequency =
        alias.frequency;

    let apparentPhase =
        alias.phase;

    let apparentAmplitude =
        filteredAmplitude;

    const phaseSensitiveNull =
        state === "limit" &&
        Math.abs(
            Math.sin(
                phaseRadians
            )
        ) < 0.02;

    if (phaseSensitiveNull) {
        apparentFrequency = 0;
        apparentPhase = 0;
        apparentAmplitude = 0;
    }

    return {
        valid: true,
        signalHz,
        samplingHz,
        amplitude,
        phaseDegrees,
        phaseRadians,
        period,
        sampleInterval,
        minimumSampling,
        nyquistFrequency,
        samplesPerCycle,
        state,
        alias,
        apparentFrequency,
        apparentPhase,
        apparentAmplitude,
        phaseSensitiveNull,
        filterGain,
        filteredAmplitude,
        filterEnabled:
            antiAliasingFilter.checked
    };
}

function updateInterface() {
    const data =
        getSimulationData();

    initialPhaseDisplay.textContent =
        formatNumber(
            Number(
                initialPhase.value
            ),
            0
        ) +
        "°";

    animationSpeedDisplay.textContent =
        Number(
            animationSpeed.value
        )
            .toFixed(1)
            .replace(".", ",") +
        "×";

    filterLabel.textContent =
        antiAliasingFilter.checked
            ? "Activado"
            : "Desactivado";

    if (!data.valid) {
        stateBanner.className =
            "state-banner insufficient";

        stateTitle.textContent =
            "Datos no válidos";

        stateDetail.textContent =
            "Las frecuencias y la amplitud deben ser positivas.";

        stateValue.textContent =
            "Revise los controles";

        [
            periodMetric,
            sampleIntervalMetric,
            samplingMetric,
            minimumMetric,
            nyquistMetric,
            samplesMetric
        ].forEach(
            function (metric) {
                metric.textContent =
                    "—";
            }
        );

        formulaSubstitution.textContent =
            "No es posible verificar Nyquist con valores inválidos.";

        formulaAlias.textContent =
            "Resultado no disponible.";

        return;
    }

    periodMetric.textContent =
        formatTime(
            data.period
        );

    sampleIntervalMetric.textContent =
        formatTime(
            data.sampleInterval
        );

    samplingMetric.textContent =
        formatFrequency(
            data.samplingHz
        );

    minimumMetric.textContent =
        formatFrequency(
            data.minimumSampling
        );

    nyquistMetric.textContent =
        formatFrequency(
            data.nyquistFrequency
        );

    samplesMetric.textContent =
        formatNumber(
            data.samplesPerCycle,
            5
        );

    formulaCriterion.textContent =
        "fs ≥ 2 × fmax  |  recomendado: fs > 2 × fmax";

    const comparisonSymbol =
        data.state === "sufficient"
            ? ">"
            : data.state === "limit"
                ? "="
                : "<";

    formulaSubstitution.textContent =
        formatFrequency(
            data.samplingHz
        ) +
        " " +
        comparisonSymbol +
        " 2 × " +
        formatFrequency(
            data.signalHz
        ) +
        " = " +
        formatFrequency(
            data.minimumSampling
        );

    if (
        data.state ===
        "sufficient"
    ) {
        stateBanner.className =
            "state-banner";

        stateTitle.textContent =
            "Muestreo suficiente con margen";

        stateDetail.textContent =
            "La frecuencia de muestreo es mayor que el doble de la frecuencia máxima de la señal.";

        stateValue.textContent =
            "fs > 2fmax";

        formulaAlias.textContent =
            "No aparece aliasing en el modelo ideal para esta componente.";
    } else if (
        data.state ===
        "limit"
    ) {
        stateBanner.className =
            "state-banner limit";

        stateTitle.textContent =
            "Muestreo en el límite teórico";

        stateDetail.textContent =
            "Hay dos muestras por ciclo. El resultado puede depender de la fase y no es una condición práctica recomendable.";

        stateValue.textContent =
            "fs = 2fmax";

        formulaAlias.textContent =
            data.phaseSensitiveNull
                ? "Con esta fase, las muestras caen cerca de cero; una reconstrucción aparente puede ser nula."
                : "Frecuencia en el límite: " +
                    formatFrequency(
                        data.apparentFrequency
                    ) +
                    ". La fase puede producir una representación ambigua.";
    } else {
        stateBanner.className =
            "state-banner insufficient";

        stateTitle.textContent =
            "Muestreo insuficiente: aparece aliasing";

        stateDetail.textContent =
            "Las muestras pueden ser compatibles con una señal aparente de menor frecuencia.";

        stateValue.textContent =
            "fs < 2fmax";

        formulaAlias.textContent =
            "Frecuencia aparente aproximada: " +
            formatFrequency(
                data.alias.frequency
            ) +
            ".";
    }

    if (data.filterEnabled) {
        technicalNote.innerHTML =
            "<strong>Filtro antialiasing conceptual:</strong> " +
            "el bloque se coloca antes del muestreador y atenúa la componente cuando se acerca o supera la frecuencia de Nyquist. " +
            "Ganancia aplicada: " +
            formatNumber(
                data.filterGain * 100,
                2
            ) +
            " %. Este comportamiento es didáctico y no corresponde al diseño de un filtro real.";
    } else {
        technicalNote.innerHTML =
            "<strong>Advertencia visual:</strong> el tiempo mostrado, la frecuencia de movimiento del cursor y el tamaño de las muestras están adaptados para enseñanza. " +
            "La onda representa amplitud respecto al tiempo, no la trayectoria seguida por la energía.";
    }
}

function applyPreset(key) {
    const preset =
        presets[key];

    if (!preset) {
        return;
    }

    signalFrequency.value =
        String(
            preset.signal
        );

    signalFrequencyUnit.value =
        preset.signalUnit;

    samplingFrequency.value =
        String(
            preset.sampling
        );

    samplingFrequencyUnit.value =
        preset.samplingUnit;

    initialPhase.value =
        String(
            preset.phase
        );

    antiAliasingFilter.checked =
        preset.filter;

    elapsedTime = 0;

    updateInterface();
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

    signalAmplitude.value =
        "1";

    animationSpeed.value =
        "1";

    applyPreset(
        "comfortable"
    );
}

function resizeCanvas() {
    viewWidth =
        Math.max(
            300,
            canvasContainer.clientWidth
        );

    viewHeight =
        viewWidth < 680
            ? 970
            : 720;

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
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
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

function drawHeader(data) {
    ctx.save();

    ctx.fillStyle =
        "rgba(240,249,255,0.95)";

    ctx.font =
        "700 15px Segoe UI, sans-serif";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "Muestreo de una señal senoidal",
        24,
        31
    );

    ctx.fillStyle =
        "rgba(159,181,202,0.82)";

    ctx.font =
        "500 10px Segoe UI, sans-serif";

    wrapText(
        "La frecuencia baja mostrada facilita la observación; el principio se conserva para valores en kHz.",
        24,
        50,
        Math.max(
            190,
            viewWidth - 340
        ),
        14,
        2
    );

    ctx.fillStyle =
        data.state === "sufficient"
            ? "#34d399"
            : data.state === "limit"
                ? "#fbbf24"
                : "#fb7185";

    ctx.font =
        "700 10px Consolas, monospace";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "fs = " +
        formatFrequency(
            data.samplingHz
        ) +
        " · fmax = " +
        formatFrequency(
            data.signalHz
        ),
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

function drawPlotGrid(
    plot,
    amplitude,
    duration
) {
    ctx.save();

    ctx.strokeStyle =
        "rgba(125,211,252,0.08)";

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
        ctx.moveTo(x, plot.y);
        ctx.lineTo(x, plot.y + plot.height);
        ctx.stroke();
    }

    for (
        let index = 0;
        index <= 6;
        index += 1
    ) {
        const y =
            plot.y +
            plot.height *
            index /
            6;

        ctx.beginPath();
        ctx.moveTo(plot.x, y);
        ctx.lineTo(plot.x + plot.width, y);
        ctx.stroke();
    }

    const centerY =
        plot.y +
        plot.height / 2;

    ctx.strokeStyle =
        "rgba(186,230,253,0.38)";

    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(plot.x, centerY);
    ctx.lineTo(plot.x + plot.width, centerY);
    ctx.stroke();

    ctx.fillStyle =
        "rgba(159,181,202,0.74)";

    ctx.font =
        "600 8px Segoe UI, sans-serif";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "+" +
        formatNumber(
            amplitude,
            3
        ) +
        " V",
        plot.x - 7,
        plot.y + 10
    );

    ctx.fillText(
        "0 V",
        plot.x - 7,
        centerY + 3
    );

    ctx.fillText(
        "−" +
        formatNumber(
            amplitude,
            3
        ) +
        " V",
        plot.x - 7,
        plot.y + plot.height
    );

    ctx.textAlign =
        "center";

    ctx.fillText(
        "0",
        plot.x,
        plot.y + plot.height + 18
    );

    ctx.fillText(
        formatTime(
            duration
        ),
        plot.x + plot.width,
        plot.y + plot.height + 18
    );

    ctx.restore();
}

function drawWave(
    plot,
    duration,
    frequency,
    amplitude,
    phase,
    color,
    lineWidth,
    dash = []
) {
    const scaleY =
        plot.height *
        0.42 /
        Math.max(
            plot.referenceAmplitude ||
            amplitude,
            1e-12
        );

    const centerY =
        plot.y +
        plot.height / 2;

    ctx.save();
    ctx.beginPath();

    for (
        let pixel = 0;
        pixel <= plot.width;
        pixel += 1.5
    ) {
        const t =
            duration *
            pixel /
            plot.width;

        const value =
            amplitude *
            Math.sin(
                2 *
                Math.PI *
                frequency *
                t +
                phase
            );

        const x =
            plot.x +
            pixel;

        const y =
            centerY -
            value *
            scaleY;

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
        dash
    );

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.shadowBlur =
        8;

    ctx.shadowColor =
        color;

    ctx.stroke();
    ctx.restore();
}

function drawSamples(
    plot,
    duration,
    data,
    color
) {
    const rawSampleCount =
        Math.floor(
            duration *
            data.samplingHz
        ) +
        1;

    const sampleStep =
        Math.max(
            1,
            Math.ceil(
                rawSampleCount /
                260
            )
        );

    const amplitudeScale =
        plot.height *
        0.42 /
        Math.max(
            data.amplitude,
            1e-12
        );

    const centerY =
        plot.y +
        plot.height / 2;

    ctx.save();

    for (
        let index = 0;
        index < rawSampleCount;
        index += sampleStep
    ) {
        const t =
            index /
            data.samplingHz;

        if (t > duration) {
            break;
        }

        const value =
            data.filteredAmplitude *
            Math.sin(
                2 *
                Math.PI *
                data.signalHz *
                t +
                data.phaseRadians
            );

        const x =
            plot.x +
            t /
            duration *
            plot.width;

        const y =
            centerY -
            value *
            amplitudeScale;

        ctx.strokeStyle =
            "rgba(251,191,36,0.42)";

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle =
            color;

        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(
            x,
            y,
            4.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.restore();
}

function drawLegendItem(
    x,
    y,
    color,
    text,
    dashed = false,
    point = false
) {
    ctx.save();

    if (point) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 7, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        ctx.setLineDash(
            dashed
                ? [7, 5]
                : []
        );

        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x + 18, y - 3);
        ctx.stroke();
    }

    ctx.fillStyle =
        "rgba(199,220,235,0.84)";

    ctx.font =
        "600 8.5px Segoe UI, sans-serif";

    ctx.textAlign =
        "left";

    ctx.fillText(
        text,
        x + 25,
        y
    );

    ctx.restore();
}

function drawSamplingCursor(
    plot,
    duration,
    color
) {
    const progress =
        (
            elapsedTime *
            0.22
        ) %
        1;

    const x =
        plot.x +
        plot.width *
        progress;

    ctx.save();

    ctx.strokeStyle =
        color;

    ctx.lineWidth = 1.3;

    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.height);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle =
        color;

    ctx.beginPath();
    ctx.arc(
        x,
        plot.y + 8,
        4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle =
        "rgba(199,220,235,0.80)";

    ctx.font =
        "600 8px Segoe UI, sans-serif";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "instante observado",
        x,
        plot.y - 7
    );

    ctx.restore();
}

function drawFilterBlock(
    panel,
    data
) {
    const blockWidth =
        Math.min(
            250,
            panel.width *
            0.36
        );

    const blockHeight = 58;

    const x =
        panel.x +
        panel.width -
        blockWidth -
        18;

    const y =
        panel.y + 10;

    ctx.save();

    roundedRectPath(
        x,
        y,
        blockWidth,
        blockHeight,
        10
    );

    ctx.fillStyle =
        data.filterEnabled
            ? "rgba(5,150,105,0.16)"
            : "rgba(51,65,85,0.40)";

    ctx.fill();

    ctx.strokeStyle =
        data.filterEnabled
            ? "rgba(52,211,153,0.58)"
            : "rgba(148,163,184,0.24)";

    ctx.stroke();

    ctx.fillStyle =
        data.filterEnabled
            ? "#6ee7b7"
            : "#94a3b8";

    ctx.font =
        "700 9px Segoe UI, sans-serif";

    ctx.textAlign =
        "left";

    ctx.fillText(
        data.filterEnabled
            ? "FILTRO ANTIALIASING ACTIVO"
            : "FILTRO ANTIALIASING INACTIVO",
        x + 12,
        y + 21
    );

    ctx.fillStyle =
        "rgba(199,220,235,0.78)";

    ctx.font =
        "600 8px Segoe UI, sans-serif";

    ctx.fillText(
        "Amplitud que llega al muestreador: " +
        formatNumber(
            data.filteredAmplitude,
            4
        ) +
        " V",
        x + 12,
        y + 41
    );

    ctx.restore();
}

function drawDesktop(data) {
    const topPanel = {
        x: 20,
        y: 78,
        width: viewWidth - 40,
        height: 286
    };

    const bottomPanel = {
        x: 20,
        y: 386,
        width: viewWidth - 40,
        height: 278
    };

    drawPanel(
        topPanel,
        "SEÑAL CONTINUA Y MUESTRAS",
        "#38bdf8"
    );

    drawPanel(
        bottomPanel,
        "COMPARACIÓN CON LA SEÑAL APARENTE",
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399"
    );

    const duration =
        3 /
        data.signalHz;

    const topPlot = {
        x: topPanel.x + 70,
        y: topPanel.y + 72,
        width: topPanel.width - 100,
        height: topPanel.height - 120,
        referenceAmplitude: data.amplitude
    };

    const bottomPlot = {
        x: bottomPanel.x + 70,
        y: bottomPanel.y + 70,
        width: bottomPanel.width - 100,
        height: bottomPanel.height - 116,
        referenceAmplitude: data.amplitude
    };

    drawPlotGrid(
        topPlot,
        data.amplitude,
        duration
    );

    drawWave(
        topPlot,
        duration,
        data.signalHz,
        data.amplitude,
        data.phaseRadians,
        "rgba(148,163,184,0.55)",
        1.5,
        [7, 5]
    );

    if (data.filterEnabled) {
        drawWave(
            topPlot,
            duration,
            data.signalHz,
            data.filteredAmplitude,
            data.phaseRadians,
            "#38bdf8",
            2.4
        );
    } else {
        drawWave(
            topPlot,
            duration,
            data.signalHz,
            data.amplitude,
            data.phaseRadians,
            "#38bdf8",
            2.4
        );
    }

    drawSamples(
        topPlot,
        duration,
        data,
        "#fbbf24"
    );

    drawSamplingCursor(
        topPlot,
        duration,
        "rgba(192,132,252,0.82)"
    );

    drawFilterBlock(
        topPanel,
        data
    );

    drawLegendItem(
        topPanel.x + 18,
        topPanel.y + 52,
        "#38bdf8",
        data.filterEnabled
            ? "Señal después del filtro"
            : "Señal analógica original"
    );

    if (data.filterEnabled) {
        drawLegendItem(
            topPanel.x + 190,
            topPanel.y + 52,
            "rgba(148,163,184,0.70)",
            "Señal antes del filtro",
            true
        );
    }

    drawLegendItem(
        topPanel.x + 365,
        topPanel.y + 52,
        "#fbbf24",
        "Muestras",
        false,
        true
    );

    drawPlotGrid(
        bottomPlot,
        data.amplitude,
        duration
    );

    drawWave(
        bottomPlot,
        duration,
        data.signalHz,
        data.amplitude,
        data.phaseRadians,
        "rgba(56,189,248,0.54)",
        1.6,
        [7, 5]
    );

    drawWave(
        bottomPlot,
        duration,
        data.apparentFrequency,
        data.apparentAmplitude,
        data.apparentPhase,
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399",
        2.5
    );

    drawSamples(
        bottomPlot,
        duration,
        data,
        "#fbbf24"
    );

    drawLegendItem(
        bottomPanel.x + 18,
        bottomPanel.y + 50,
        "rgba(56,189,248,0.72)",
        "Señal original",
        true
    );

    drawLegendItem(
        bottomPanel.x + 160,
        bottomPanel.y + 50,
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399",
        data.state === "insufficient"
            ? "Reconstrucción aparente (alias)"
            : data.state === "limit"
                ? "Reconstrucción en el límite"
                : "Reconstrucción compatible"
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199,220,235,0.82)";

    ctx.font =
        "600 9px Segoe UI, sans-serif";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "f aparente = " +
        formatFrequency(
            data.apparentFrequency
        ),
        bottomPanel.x +
        bottomPanel.width -
        20,
        bottomPanel.y + 50
    );

    ctx.restore();
}

function drawMobile(data) {
    const topPanel = {
        x: 14,
        y: 78,
        width: viewWidth - 28,
        height: 412
    };

    const bottomPanel = {
        x: 14,
        y: 512,
        width: viewWidth - 28,
        height: 405
    };

    drawPanel(
        topPanel,
        "SEÑAL CONTINUA Y MUESTRAS",
        "#38bdf8"
    );

    drawPanel(
        bottomPanel,
        "SEÑAL ORIGINAL Y APARENTE",
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399"
    );

    const duration =
        3 /
        data.signalHz;

    const topPlot = {
        x: topPanel.x + 55,
        y: topPanel.y + 122,
        width: topPanel.width - 75,
        height: 220,
        referenceAmplitude: data.amplitude
    };

    const bottomPlot = {
        x: bottomPanel.x + 55,
        y: bottomPanel.y + 112,
        width: bottomPanel.width - 75,
        height: 220,
        referenceAmplitude: data.amplitude
    };

    drawPlotGrid(
        topPlot,
        data.amplitude,
        duration
    );

    drawWave(
        topPlot,
        duration,
        data.signalHz,
        data.amplitude,
        data.phaseRadians,
        data.filterEnabled
            ? "rgba(148,163,184,0.55)"
            : "#38bdf8",
        data.filterEnabled
            ? 1.5
            : 2.4,
        data.filterEnabled
            ? [7, 5]
            : []
    );

    if (data.filterEnabled) {
        drawWave(
            topPlot,
            duration,
            data.signalHz,
            data.filteredAmplitude,
            data.phaseRadians,
            "#38bdf8",
            2.4
        );
    }

    drawSamples(
        topPlot,
        duration,
        data,
        "#fbbf24"
    );

    drawSamplingCursor(
        topPlot,
        duration,
        "rgba(192,132,252,0.82)"
    );

    drawLegendItem(
        topPanel.x + 18,
        topPanel.y + 52,
        "#38bdf8",
        "Señal"
    );

    drawLegendItem(
        topPanel.x + 120,
        topPanel.y + 52,
        "#fbbf24",
        "Muestras",
        false,
        true
    );

    ctx.save();

    ctx.fillStyle =
        data.filterEnabled
            ? "#6ee7b7"
            : "#94a3b8";

    ctx.font =
        "700 8px Segoe UI, sans-serif";

    ctx.textAlign =
        "left";

    ctx.fillText(
        data.filterEnabled
            ? "Filtro activo · amplitud al muestreador: " +
                formatNumber(
                    data.filteredAmplitude,
                    3
                ) +
                " V"
            : "Filtro antialiasing desactivado",
        topPanel.x + 18,
        topPanel.y + 82
    );

    ctx.restore();

    drawPlotGrid(
        bottomPlot,
        data.amplitude,
        duration
    );

    drawWave(
        bottomPlot,
        duration,
        data.signalHz,
        data.amplitude,
        data.phaseRadians,
        "rgba(56,189,248,0.54)",
        1.6,
        [7, 5]
    );

    drawWave(
        bottomPlot,
        duration,
        data.apparentFrequency,
        data.apparentAmplitude,
        data.apparentPhase,
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399",
        2.5
    );

    drawSamples(
        bottomPlot,
        duration,
        data,
        "#fbbf24"
    );

    drawLegendItem(
        bottomPanel.x + 18,
        bottomPanel.y + 52,
        "rgba(56,189,248,0.72)",
        "Original",
        true
    );

    drawLegendItem(
        bottomPanel.x + 120,
        bottomPanel.y + 52,
        data.state === "insufficient"
            ? "#fb7185"
            : data.state === "limit"
                ? "#fbbf24"
                : "#34d399",
        "Aparente"
    );

    ctx.save();

    ctx.fillStyle =
        "rgba(199,220,235,0.82)";

    ctx.font =
        "600 8.5px Segoe UI, sans-serif";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "f aparente = " +
        formatFrequency(
            data.apparentFrequency
        ),
        bottomPanel.x + 18,
        bottomPanel.y + 82
    );

    ctx.restore();
}

function drawInvalidMessage() {
    ctx.save();

    ctx.fillStyle =
        "#fb7185";

    ctx.font =
        "700 17px Segoe UI, sans-serif";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Las frecuencias y la amplitud deben ser positivas.",
        viewWidth / 2,
        viewHeight / 2
    );

    ctx.fillStyle =
        "rgba(199,220,235,0.74)";

    ctx.font =
        "500 10px Segoe UI, sans-serif";

    ctx.fillText(
        "Revise los valores introducidos en los controles.",
        viewWidth / 2,
        viewHeight / 2 + 26
    );

    ctx.restore();
}

function drawFooter() {
    ctx.save();

    ctx.fillStyle =
        "rgba(159,181,202,0.68)";

    ctx.font =
        "500 9px Segoe UI, sans-serif";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "Curvas: amplitud respecto al tiempo · representación didáctica, no trayectoria espacial.",
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

    if (viewWidth < 680) {
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

    lastFrameTime =
        currentTime;

    if (!isPaused) {
        elapsedTime +=
            deltaTime *
            Number(
                animationSpeed.value
            );

        if (elapsedTime > 10000) {
            elapsedTime = 0;
        }
    }

    drawScene();

    requestAnimationFrame(
        animate
    );
}

resizeCanvas();
updateInterface();

requestAnimationFrame(
    function startAnimation(time) {
        lastFrameTime = time;
        animate(time);
    }
);
