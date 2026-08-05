"use strict";

/*
 * R2 SIT-400
 * Aplicaciones reales de frecuencias.
 *
 * La escala horizontal usa log10(f).
 * Los ciclos dibujados se comprimen para hacer posible la comparación.
 * No se representa ningún tipo de modulación.
 */

const C = 299792458;
const TAU = Math.PI * 2;
const MIN = 5;
const MAX = 15;

const $ = id =>
    document.getElementById(id);

const cv = $("cv");
const ctx = cv.getContext("2d");

const selA = $("a");
const selB = $("b");
const filter = $("filter");
const showAll = $("all");
const cycles = $("cycles");
const speed = $("speed");
const metrics = $("metrics");
const ref = $("ref");
const status = $("status");
const pause = $("pause");
const resume = $("resume");
const reset = $("reset");
const cyclesOut = $("cyclesOut");
const speedOut = $("speedOut");

const raw = [
    [
        "radio_am",
        "Radio AM",
        "AM",
        1e6,
        null,
        "1,0 MHz representativo",
        "Aire y espacio libre",
        "Onda electromagnética de radiofrecuencia",
        "Radiodifusión sonora de onda media",
        "radio",
        "#fbbf24"
    ],
    [
        "radio_fm",
        "Radio FM",
        "FM",
        100e6,
        null,
        "100 MHz representativo",
        "Aire y espacio libre",
        "Onda electromagnética VHF",
        "Radiodifusión sonora en VHF",
        "radio",
        "#34d399"
    ],
    [
        "tv",
        "Televisión terrestre",
        "TV",
        600e6,
        null,
        "600 MHz representativo",
        "Aire y espacio libre",
        "Onda electromagnética UHF",
        "Televisión digital terrestre",
        "radio",
        "#38bdf8"
    ],
    [
        "m700",
        "Telefonía 700 MHz",
        "700",
        700e6,
        null,
        "700 MHz",
        "Aire y espacio libre",
        "Onda electromagnética UHF",
        "Cobertura móvil de área amplia",
        "mobile",
        "#60a5fa"
    ],
    [
        "m900",
        "Telefonía 900 MHz",
        "900",
        900e6,
        null,
        "900 MHz",
        "Aire y espacio libre",
        "Onda electromagnética UHF",
        "Comunicación celular",
        "mobile",
        "#818cf8"
    ],
    [
        "gps",
        "GPS L1",
        "GPS",
        1575.42e6,
        null,
        "1575,42 MHz",
        "Espacio y atmósfera",
        "Onda electromagnética de microondas",
        "Navegación y sincronización",
        "network",
        "#22d3ee"
    ],
    [
        "m1800",
        "Telefonía 1800 MHz",
        "1800",
        1.8e9,
        null,
        "1800 MHz",
        "Aire y espacio libre",
        "Onda electromagnética UHF",
        "Comunicación celular",
        "mobile",
        "#a78bfa"
    ],
    [
        "wifi24",
        "Wi-Fi 2,4 GHz",
        "Wi-Fi 2,4",
        2.437e9,
        null,
        "2,437 GHz representativo",
        "Aire e interiores",
        "Onda electromagnética de microondas",
        "Red local inalámbrica",
        "network",
        "#38bdf8"
    ],
    [
        "bt",
        "Bluetooth",
        "BT",
        2.44e9,
        null,
        "2,44 GHz representativo",
        "Aire e interiores",
        "Onda electromagnética de microondas",
        "Enlace inalámbrico de corto alcance",
        "network",
        "#3b82f6"
    ],
    [
        "g35",
        "5G 3,5 GHz",
        "5G 3,5",
        3.5e9,
        null,
        "3,5 GHz",
        "Aire y espacio libre",
        "Onda electromagnética de microondas",
        "Acceso móvil de capacidad elevada",
        "mobile",
        "#c084fc"
    ],
    [
        "wifi5",
        "Wi-Fi 5 GHz",
        "Wi-Fi 5",
        5.5e9,
        null,
        "5,5 GHz representativo",
        "Aire e interiores",
        "Onda electromagnética de microondas",
        "Red local inalámbrica",
        "network",
        "#14b8a6"
    ],
    [
        "wifi6",
        "Wi-Fi 6 GHz",
        "Wi-Fi 6",
        6.5e9,
        null,
        "6,5 GHz representativo",
        "Aire e interiores",
        "Onda electromagnética de microondas",
        "Red local inalámbrica en 6 GHz",
        "network",
        "#10b981"
    ],
    [
        "sat",
        "Satélite",
        "SAT",
        12e9,
        null,
        "12 GHz representativo",
        "Espacio y atmósfera",
        "Onda electromagnética de microondas",
        "Distribución y enlaces satelitales",
        "microwave",
        "#fb7185"
    ],
    [
        "link",
        "Radioenlace",
        "Enlace",
        18e9,
        null,
        "18 GHz representativo",
        "Espacio libre con línea de vista",
        "Onda electromagnética de microondas",
        "Enlace punto a punto",
        "microwave",
        "#f97316"
    ],
    [
        "g26",
        "5G 26 GHz",
        "5G 26",
        26e9,
        null,
        "26 GHz",
        "Aire y espacio libre",
        "Onda electromagnética milimétrica",
        "Acceso móvil de alta capacidad y alcance limitado",
        "mobile",
        "#e879f9"
    ],
    [
        "f1550",
        "Fibra óptica 1550 nm",
        "1550 nm",
        null,
        1550e-9,
        "1550 nm",
        "Fibra de vidrio",
        "Radiación óptica infrarroja guiada",
        "Transmisión óptica de larga distancia",
        "optical",
        "#fb7185"
    ],
    [
        "f1310",
        "Fibra óptica 1310 nm",
        "1310 nm",
        null,
        1310e-9,
        "1310 nm",
        "Fibra de vidrio",
        "Radiación óptica infrarroja guiada",
        "Redes de acceso y enlaces ópticos",
        "optical",
        "#f472b6"
    ],
    [
        "f850",
        "Fibra óptica 850 nm",
        "850 nm",
        null,
        850e-9,
        "850 nm",
        "Fibra de vidrio",
        "Radiación óptica infrarroja guiada",
        "Enlaces ópticos de corta distancia",
        "optical",
        "#ef4444"
    ],
    [
        "lifi",
        "Li-Fi",
        "Li-Fi",
        null,
        600e-9,
        "600 nm representativo",
        "Aire e interior iluminado",
        "Luz visible",
        "Comunicación óptica inalámbrica",
        "optical",
        "#fde047"
    ]
];

const apps =
    raw
        .map(
            row => {
                const frequency =
                    row[3] ||
                    C / row[4];

                const wavelength =
                    row[4] ||
                    C / frequency;

                return {
                    id: row[0],
                    name: row[1],
                    short: row[2],
                    f: frequency,
                    l: wavelength,
                    ref: row[5],
                    medium: row[6],
                    physical: row[7],
                    use: row[8],
                    group: row[9],
                    color: row[10],
                    period: 1 / frequency
                };
            }
        )
        .sort(
            (first, second) =>
                first.f -
                second.f
        );

const map =
    new Map(
        apps.map(
            item => [
                item.id,
                item
            ]
        )
    );

let W = 1000;
let H = 940;
let DPR = 1;
let elapsed = 0;
let lastFrame = performance.now();
let paused = false;

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

function formatNumber(
    value,
    decimals = 5
) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    return new Intl.NumberFormat(
        "es-BO",
        {
            maximumFractionDigits: decimals
        }
    ).format(value);
}

function formatFrequency(value) {
    if (value >= 1e12) {
        return (
            formatNumber(
                value / 1e12,
                6
            ) +
            " THz"
        );
    }

    if (value >= 1e9) {
        return (
            formatNumber(
                value / 1e9,
                6
            ) +
            " GHz"
        );
    }

    if (value >= 1e6) {
        return (
            formatNumber(
                value / 1e6,
                6
            ) +
            " MHz"
        );
    }

    if (value >= 1e3) {
        return (
            formatNumber(
                value / 1e3,
                6
            ) +
            " kHz"
        );
    }

    return (
        formatNumber(
            value,
            6
        ) +
        " Hz"
    );
}

function formatWavelength(value) {
    if (value >= 1) {
        return (
            formatNumber(
                value,
                6
            ) +
            " m"
        );
    }

    if (value >= 1e-2) {
        return (
            formatNumber(
                value * 100,
                6
            ) +
            " cm"
        );
    }

    if (value >= 1e-3) {
        return (
            formatNumber(
                value * 1e3,
                6
            ) +
            " mm"
        );
    }

    if (value >= 1e-6) {
        return (
            formatNumber(
                value * 1e6,
                6
            ) +
            " µm"
        );
    }

    return (
        formatNumber(
            value * 1e9,
            6
        ) +
        " nm"
    );
}

function formatPeriod(value) {
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

    if (value >= 1e-9) {
        return (
            formatNumber(
                value * 1e9,
                6
            ) +
            " ns"
        );
    }

    if (value >= 1e-12) {
        return (
            formatNumber(
                value * 1e12,
                6
            ) +
            " ps"
        );
    }

    return (
        formatNumber(
            value * 1e15,
            6
        ) +
        " fs"
    );
}

function selected() {
    return {
        first:
            map.get(
                selA.value
            ),

        second:
            map.get(
                selB.value
            )
    };
}

function populate() {
    const options =
        apps
            .map(
                item =>
                    '<option value="' +
                    item.id +
                    '">' +
                    item.name +
                    " · " +
                    item.ref +
                    "</option>"
            )
            .join("");

    selA.innerHTML = options;
    selB.innerHTML = options;

    selA.value = "radio_am";
    selB.value = "wifi5";

    ref.innerHTML =
        apps
            .map(
                item =>
                    "<tr>" +
                        "<td>" +
                            item.name +
                        "</td>" +
                        "<td>" +
                            item.ref +
                        "</td>" +
                        "<td>" +
                            item.medium +
                        "</td>" +
                        "<td>" +
                            item.physical +
                        "</td>" +
                        "<td>" +
                            item.use +
                        "</td>" +
                    "</tr>"
            )
            .join("");
}

function update() {
    const values =
        selected();

    const ratio =
        Math.max(
            values.first.f,
            values.second.f
        ) /
        Math.min(
            values.first.f,
            values.second.f
        );

    const decades =
        Math.abs(
            Math.log10(
                values.first.f
            ) -
            Math.log10(
                values.second.f
            )
        );

    cyclesOut.textContent =
        Number(
            cycles.value
        )
            .toFixed(1)
            .replace(".", ",") +
        "×";

    speedOut.textContent =
        Number(
            speed.value
        )
            .toFixed(1)
            .replace(".", ",") +
        "×";

    const metricValues = [
        [
            "Aplicación A",
            values.first.name
        ],
        [
            "Frecuencia A",
            formatFrequency(
                values.first.f
            )
        ],
        [
            "Longitud A",
            formatWavelength(
                values.first.l
            )
        ],
        [
            "Período A",
            formatPeriod(
                values.first.period
            )
        ],
        [
            "Aplicación B",
            values.second.name
        ],
        [
            "Frecuencia B",
            formatFrequency(
                values.second.f
            )
        ],
        [
            "Longitud B",
            formatWavelength(
                values.second.l
            )
        ],
        [
            "Relación",
            formatNumber(
                ratio,
                4
            ) +
            " : 1 · " +
            formatNumber(
                decades,
                3
            ) +
            " décadas"
        ]
    ];

    metrics.innerHTML =
        metricValues
            .map(
                item =>
                    '<article class="metric">' +
                        "<small>" +
                            item[0] +
                        "</small>" +
                        "<b>" +
                            item[1] +
                        "</b>" +
                    "</article>"
            )
            .join("");
}

function resize() {
    W =
        Math.max(
            300,
            cv.parentElement.clientWidth
        );

    H =
        W < 720
            ? 1390
            : 940;

    DPR =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    cv.width =
        Math.round(
            W * DPR
        );

    cv.height =
        Math.round(
            H * DPR
        );

    cv.style.height =
        H +
        "px";

    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );
}

function roundedRectangle(
    x,
    y,
    width,
    height,
    radius
) {
    radius =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function wrapText(
    text,
    x,
    y,
    maximumWidth,
    lineHeight = 12,
    maximumLines = 3,
    align = "left"
) {
    const words =
        String(text).split(" ");

    let line = "";
    let lineNumber = 0;

    ctx.textAlign = align;

    for (const word of words) {
        const testLine =
            line
                ? line + " " + word
                : word;

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

            line = word;
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
            W,
            H
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

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#7dd3fc0b";

    for (
        let x = 0;
        x <= W;
        x += 40
    ) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }

    for (
        let y = 0;
        y <= H;
        y += 40
    ) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }
}

function drawPanel(
    panel,
    title,
    color,
    description
) {
    roundedRectangle(
        panel.x,
        panel.y,
        panel.width,
        panel.height,
        11
    );

    ctx.fillStyle = "#020a18a8";
    ctx.fill();

    ctx.strokeStyle = "#7dd3fc26";
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "700 10px Segoe UI";
    ctx.textAlign = "left";

    ctx.fillText(
        title,
        panel.x + 13,
        panel.y + 21
    );

    ctx.fillStyle = "#c7dcebba";
    ctx.font = "600 8px Segoe UI";

    if (panel.width < 600) {
        ctx.fillText(
            description,
            panel.x + 13,
            panel.y + 35
        );
    } else {
        ctx.textAlign = "right";

        ctx.fillText(
            description,
            panel.x +
            panel.width -
            13,
            panel.y + 21
        );
    }
}

function frequencyToX(
    frequency,
    plot
) {
    return (
        plot.x +
        (
            Math.log10(
                frequency
            ) -
            MIN
        ) /
        (
            MAX -
            MIN
        ) *
        plot.width
    );
}

function visibleApplications() {
    const values =
        selected();

    if (!showAll.checked) {
        return [
            values.first,
            values.second
        ];
    }

    if (
        filter.value ===
        "all"
    ) {
        return apps;
    }

    return apps.filter(
        item =>
            item.group ===
                filter.value ||
            item.id ===
                values.first.id ||
            item.id ===
                values.second.id
    );
}

function drawScale(plot) {
    const bands = [
        [
            1e5,
            3e8,
            "#38bdf812",
            "RADIOFRECUENCIA"
        ],
        [
            3e8,
            3e11,
            "#c084fc12",
            "UHF Y MICROONDAS"
        ],
        [
            3e11,
            4e14,
            "#fb718510",
            "INFRARROJO"
        ],
        [
            4e14,
            7.5e14,
            "#fde04712",
            "VISIBLE"
        ]
    ];

    for (const band of bands) {
        const firstX =
            frequencyToX(
                Math.max(
                    band[0],
                    1e5
                ),
                plot
            );

        const secondX =
            frequencyToX(
                Math.min(
                    band[1],
                    1e15
                ),
                plot
            );

        ctx.fillStyle = band[2];

        ctx.fillRect(
            firstX,
            plot.y,
            secondX - firstX,
            plot.height
        );

        if (
            secondX -
            firstX >
            75
        ) {
            ctx.fillStyle = "#c7dcebaa";
            ctx.font = "700 7px Segoe UI";
            ctx.textAlign = "center";

            ctx.fillText(
                band[3],
                (
                    firstX +
                    secondX
                ) /
                2,
                plot.y + 14
            );
        }
    }

    for (
        let exponent = MIN;
        exponent <= MAX;
        exponent += 1
    ) {
        const x =
            frequencyToX(
                10 ** exponent,
                plot
            );

        ctx.strokeStyle = "#bae6fd42";
        ctx.beginPath();
        ctx.moveTo(x, plot.y + 24);
        ctx.lineTo(x, plot.y + plot.height);
        ctx.stroke();

        ctx.fillStyle = "#c7dcebc0";
        ctx.font = "600 7px Segoe UI";
        ctx.textAlign = "center";

        ctx.fillText(
            "10^" + exponent,
            x,
            plot.y +
            plot.height -
            7
        );
    }

    const values =
        selected();

    visibleApplications().forEach(
        (item, index) => {
            const x =
                frequencyToX(
                    item.f,
                    plot
                );

            const isSelected =
                item.id ===
                    values.first.id ||
                item.id ===
                    values.second.id;

            const y =
                plot.y +
                42 +
                (
                    index %
                    3
                ) *
                28;

            ctx.strokeStyle = item.color;
            ctx.lineWidth =
                isSelected
                    ? 2.3
                    : 1;

            ctx.beginPath();
            ctx.moveTo(x, y + 8);
            ctx.lineTo(
                x,
                plot.y +
                plot.height -
                27
            );
            ctx.stroke();

            ctx.fillStyle = item.color;
            ctx.shadowBlur =
                isSelected
                    ? 10
                    : 3;
            ctx.shadowColor = item.color;

            ctx.beginPath();
            ctx.arc(
                x,
                y,
                isSelected
                    ? 6
                    : 4,
                0,
                TAU
            );
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle =
                isSelected
                    ? "#ffffff"
                    : "#c7dcebd0";

            ctx.font =
                isSelected
                    ? "800 8px Segoe UI"
                    : "600 7px Segoe UI";

            ctx.textAlign = "center";

            ctx.fillText(
                item.short,
                x,
                y - 9
            );

            if (isSelected) {
                ctx.fillStyle = item.color;
                ctx.font = "700 7px Consolas";

                ctx.fillText(
                    item.id ===
                    values.first.id
                        ? "A"
                        : "B",
                    x,
                    y + 3
                );
            }
        }
    );
}

function visualCycles(frequency) {
    const normalized =
        clamp(
            (
                Math.log10(
                    frequency
                ) -
                MIN
            ) /
            (
                MAX -
                MIN
            ),
            0,
            1
        );

    return (
        2.5 +
        normalized *
        12.5 *
        Number(
            cycles.value
        )
    );
}

function drawWave(
    plot,
    item,
    label
) {
    const cycleCount =
        visualCycles(
            item.f
        );

    const centerY =
        plot.y +
        plot.height /
        2;

    const amplitude =
        plot.height *
        0.28;

    ctx.strokeStyle = "#7dd3fc14";

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

    ctx.strokeStyle = "#bae6fd55";
    ctx.beginPath();
    ctx.moveTo(plot.x, centerY);
    ctx.lineTo(
        plot.x +
        plot.width,
        centerY
    );
    ctx.stroke();

    ctx.beginPath();

    for (
        let index = 0;
        index <= 600;
        index += 1
    ) {
        const ratio =
            index /
            600;

        const x =
            plot.x +
            ratio *
            plot.width;

        const y =
            centerY -
            Math.sin(
                TAU *
                cycleCount *
                ratio -
                elapsed *
                2.2
            ) *
            amplitude;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = item.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = item.color;
    ctx.font = "800 9px Segoe UI";
    ctx.textAlign = "left";

    ctx.fillText(
        label +
        " · " +
        item.name,
        plot.x,
        plot.y - 11
    );

    ctx.fillStyle = "#c7dcebc9";
    ctx.font = "600 7px Segoe UI";
    ctx.textAlign = "right";

    ctx.fillText(
        formatNumber(
            cycleCount,
            2
        ) +
        " ciclos visuales comprimidos",
        plot.x +
        plot.width,
        plot.y - 11
    );

    ctx.textAlign = "left";

    ctx.fillText(
        "Amplitud normalizada",
        plot.x,
        plot.y +
        plot.height +
        15
    );

    ctx.textAlign = "right";

    ctx.fillText(
        "Tiempo visual comprimido",
        plot.x +
        plot.width,
        plot.y +
        plot.height +
        15
    );
}

function drawInfo(
    panel,
    item,
    label
) {
    roundedRectangle(
        panel.x,
        panel.y,
        panel.width,
        panel.height,
        10
    );

    ctx.fillStyle =
        item.color +
        "12";

    ctx.fill();

    ctx.strokeStyle = item.color;
    ctx.stroke();

    ctx.fillStyle = item.color;
    ctx.font = "800 11px Segoe UI";
    ctx.textAlign = "left";

    ctx.fillText(
        label +
        " · " +
        item.name,
        panel.x + 14,
        panel.y + 24
    );

    const rows = [
        [
            "Referencia",
            item.ref
        ],
        [
            "Frecuencia",
            formatFrequency(
                item.f
            )
        ],
        [
            "Longitud",
            formatWavelength(
                item.l
            )
        ],
        [
            "Medio",
            item.medium
        ],
        [
            "Señal física",
            item.physical
        ],
        [
            "Aplicación",
            item.use
        ]
    ];

    rows.forEach(
        (row, index) => {
            const y =
                panel.y +
                49 +
                index *
                27;

            ctx.fillStyle = "#9fb7cacc";
            ctx.font = "700 7px Segoe UI";

            ctx.fillText(
                row[0].toUpperCase(),
                panel.x + 14,
                y
            );

            ctx.fillStyle = "#f0f9ffea";
            ctx.font = "600 8px Segoe UI";

            wrapText(
                row[1],
                panel.x + 14,
                y + 12,
                panel.width - 28,
                10,
                2
            );
        }
    );
}

function drawMedium(
    panel,
    item
) {
    const centerX =
        panel.x +
        panel.width /
        2;

    const centerY =
        panel.y +
        panel.height /
        2;

    ctx.save();

    if (
        item.group ===
            "optical" &&
        item.id !==
            "lifi"
    ) {
        ctx.fillStyle = "#38bdf818";

        ctx.fillRect(
            panel.x + 20,
            centerY - 32,
            panel.width - 40,
            64
        );

        ctx.fillStyle = "#fb718532";

        ctx.fillRect(
            panel.x + 20,
            centerY - 16,
            panel.width - 40,
            32
        );

        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (
            let index = 0;
            index <= 400;
            index += 1
        ) {
            const ratio =
                index /
                400;

            const x =
                panel.x +
                25 +
                ratio *
                (
                    panel.width -
                    50
                );

            const y =
                centerY +
                Math.sin(
                    ratio *
                    TAU *
                    5 -
                    elapsed *
                    2
                ) *
                9;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        ctx.fillStyle = item.color;
        ctx.font = "800 8px Segoe UI";
        ctx.textAlign = "center";

        ctx.fillText(
            "SEÑAL ÓPTICA GUIADA",
            centerX,
            panel.y + 21
        );
    } else {
        const transmitterX =
            panel.x +
            40;

        const receiverX =
            panel.x +
            panel.width -
            40;

        ctx.strokeStyle = "#c7dceb88";
        ctx.lineWidth = 2;

        for (
            const x of [
                transmitterX,
                receiverX
            ]
        ) {
            ctx.beginPath();
            ctx.moveTo(
                x,
                centerY + 30
            );
            ctx.lineTo(
                x,
                centerY - 30
            );
            ctx.stroke();
        }

        const waveX =
            transmitterX +
            (
                elapsed *
                0.22 %
                1
            ) *
            (
                receiverX -
                transmitterX
            );

        for (
            let ring = 1;
            ring <= 3;
            ring += 1
        ) {
            ctx.strokeStyle =
                item.color +
                (
                    ring === 1
                        ? "cc"
                        : ring === 2
                            ? "88"
                            : "55"
                );

            ctx.beginPath();

            ctx.arc(
                waveX,
                centerY,
                ring * 11,
                -0.85,
                0.85
            );

            ctx.stroke();
        }

        ctx.fillStyle = item.color;
        ctx.font = "800 8px Segoe UI";
        ctx.textAlign = "center";

        ctx.fillText(
            item.id === "lifi"
                ? "LUZ VISIBLE EN ESPACIO LIBRE"
                : "ONDA ELECTROMAGNÉTICA EN EL MEDIO",
            centerX,
            panel.y + 21
        );
    }

    ctx.fillStyle = "#c7dcebc0";
    ctx.font = "600 7px Segoe UI";
    ctx.textAlign = "center";

    ctx.fillText(
        item.medium,
        centerX,
        panel.y +
        panel.height -
        12
    );

    ctx.restore();
}

function getCssColor(variable) {
    return getComputedStyle(
        document.documentElement
    )
        .getPropertyValue(variable)
        .trim();
}

function draw() {
    const values =
        selected();

    drawBackground();

    ctx.fillStyle = "#f0f9ff";
    ctx.font = "700 15px Segoe UI";
    ctx.textAlign = "left";

    ctx.fillText(
        "Comparador logarítmico de aplicaciones reales",
        22,
        30
    );

    ctx.fillStyle = "#9fb7cad4";
    ctx.font = "500 10px Segoe UI";

    wrapText(
        "La posición usa log10(f). Las ondas están normalizadas y comprimidas.",
        22,
        49,
        Math.max(
            190,
            W - 460
        ),
        13,
        2
    );

    if (W >= 660) {
        ctx.fillStyle =
            getCssColor(
                "--c"
            );

        ctx.font =
            "700 10px Consolas";

        ctx.textAlign =
            "right";

        ctx.fillText(
            values.first.short +
            " ↔ " +
            values.second.short +
            " · λ = c/f",
            W - 22,
            32
        );
    }

    const mobile =
        W < 720;

    let scalePanel;
    let wavePanel;
    let firstInfo;
    let secondInfo;
    let firstMedium;
    let secondMedium;

    if (mobile) {
        scalePanel = {
            x: 13,
            y: 76,
            width: W - 26,
            height: 340
        };

        wavePanel = {
            x: 13,
            y: 432,
            width: W - 26,
            height: 400
        };

        firstInfo = {
            x: 13,
            y: 848,
            width: W - 26,
            height: 238
        };

        secondInfo = {
            x: 13,
            y: 1102,
            width: W - 26,
            height: 238
        };
    } else {
        scalePanel = {
            x: 18,
            y: 76,
            width: W - 36,
            height: 300
        };

        wavePanel = {
            x: 18,
            y: 392,
            width: W * 0.61 - 26,
            height: 480
        };

        firstInfo = {
            x:
                wavePanel.x +
                wavePanel.width +
                14,
            y: 392,
            width:
                W -
                wavePanel.width -
                50,
            height: 230
        };

        secondInfo = {
            x: firstInfo.x,
            y: 638,
            width: firstInfo.width,
            height: 234
        };

        firstMedium = {
            x:
                wavePanel.x +
                20,
            y:
                wavePanel.y +
                315,
            width:
                (
                    wavePanel.width -
                    52
                ) /
                2,
            height: 125
        };

        secondMedium = {
            x:
                firstMedium.x +
                firstMedium.width +
                12,
            y: firstMedium.y,
            width: firstMedium.width,
            height: 125
        };
    }

    drawPanel(
        scalePanel,
        "ESCALA LOGARÍTMICA DE FRECUENCIA",
        getCssColor("--c"),
        "10⁵ Hz a 10¹⁵ Hz"
    );

    drawPanel(
        wavePanel,
        "ONDAS SINUSOIDALES COMPARATIVAS",
        getCssColor("--v"),
        "ciclos comprimidos, no literales"
    );

    drawScale(
        {
            x:
                scalePanel.x +
                32,
            y:
                scalePanel.y +
                47,
            width:
                scalePanel.width -
                64,
            height:
                scalePanel.height -
                69
        }
    );

    const firstWave = {
        x:
            wavePanel.x +
            31,
        y:
            wavePanel.y +
            72,
        width:
            wavePanel.width -
            62,
        height:
            mobile
                ? 112
                : 98
    };

    const secondWave = {
        x:
            wavePanel.x +
            31,
        y:
            firstWave.y +
            firstWave.height +
            64,
        width:
            wavePanel.width -
            62,
        height:
            mobile
                ? 112
                : 98
    };

    drawWave(
        firstWave,
        values.first,
        "A"
    );

    drawWave(
        secondWave,
        values.second,
        "B"
    );

    drawInfo(
        firstInfo,
        values.first,
        "A"
    );

    drawInfo(
        secondInfo,
        values.second,
        "B"
    );

    if (!mobile) {
        drawMedium(
            firstMedium,
            values.first
        );

        drawMedium(
            secondMedium,
            values.second
        );
    }

    ctx.fillStyle = "#9fb7caae";
    ctx.font = "500 8px Segoe UI";
    ctx.textAlign = "right";

    ctx.fillText(
        "Representación didáctica · sin modulación · amplitudes normalizadas.",
        W - 16,
        H - 12
    );
}

function pauseSimulation() {
    paused = true;
    pause.disabled = true;
    resume.disabled = false;

    status.textContent =
        "Simulación pausada";

    status.classList.add(
        "paused"
    );
}

function resumeSimulation() {
    paused = false;
    lastFrame = performance.now();
    pause.disabled = false;
    resume.disabled = true;

    status.textContent =
        "Simulación activa";

    status.classList.remove(
        "paused"
    );
}

function restartSimulation() {
    resumeSimulation();

    selA.value =
        "radio_am";

    selB.value =
        "wifi5";

    filter.value =
        "all";

    showAll.checked =
        true;

    cycles.value =
        "1";

    speed.value =
        "1";

    elapsed = 0;

    update();
}

function animate(now) {
    const deltaTime =
        Math.min(
            (
                now -
                lastFrame
            ) /
            1000,
            0.05
        );

    lastFrame = now;

    if (!paused) {
        elapsed +=
            deltaTime *
            Number(
                speed.value
            );

        if (elapsed > 10000) {
            elapsed = 0;
        }
    }

    draw();

    requestAnimationFrame(
        animate
    );
}

[
    selA,
    selB,
    filter,
    showAll,
    cycles,
    speed
].forEach(
    element => {
        element.addEventListener(
            "input",
            update
        );

        element.addEventListener(
            "change",
            update
        );
    }
);

pause.addEventListener(
    "click",
    pauseSimulation
);

resume.addEventListener(
    "click",
    resumeSimulation
);

reset.addEventListener(
    "click",
    restartSimulation
);

window.addEventListener(
    "resize",
    resize
);

populate();
resize();
update();

requestAnimationFrame(
    now => {
        lastFrame = now;
        animate(now);
    }
);
