        "use strict";

        /*
         * SIT-400 — Clase 16
         * Televisión digital e ISDB-Tb.
         *
         * Alcance:
         * - Cadena funcional de transmisión y recepción.
         * - Organización didáctica de 13 segmentos activos.
         * - One-Seg, Full-Seg y capas jerárquicas.
         * - SDTV, HDTV y UHDTV como resoluciones.
         * - Cobertura circular aproximada con radio conocido.
         * - Efecto umbral mediante índice relativo no calibrado.
         *
         * No se desarrolla MPEG, Transport Stream, intervalo de guarda,
         * IPTV, Web TV, satélite ni planificación profesional.
         */

        const canvas =
            document.getElementById("simulationCanvas");

        const canvasWrapper =
            document.getElementById("canvasWrapper");

        const ctx =
            canvas.getContext("2d");

        const moduleButtons =
            Array.from(
                document.querySelectorAll(".module-button")
            );

        const presetButtons =
            Array.from(
                document.querySelectorAll(".preset-button")
            );

        const simulationTitle =
            document.getElementById("simulationTitle");

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

        const metrics =
            document.getElementById("metrics");

        const assignmentTool =
            document.getElementById("assignmentTool");

        const serviceB =
            document.getElementById("serviceB");

        const serviceC =
            document.getElementById("serviceC");

        const signalLevel =
            document.getElementById("signalLevel");

        const signalLevelOutput =
            document.getElementById("signalLevelOutput");

        const receiverProfile =
            document.getElementById("receiverProfile");

        const coverageRadius =
            document.getElementById("coverageRadius");

        const receiverDistance =
            document.getElementById("receiverDistance");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedOutput =
            document.getElementById("animationSpeedOutput");

        const formulaSegments =
            document.getElementById("formulaSegments");

        const formulaWidth =
            document.getElementById("formulaWidth");

        const formulaPercentActive =
            document.getElementById("formulaPercentActive");

        const formulaPercentRf =
            document.getElementById("formulaPercentRf");

        const formulaCoverage =
            document.getElementById("formulaCoverage");

        const formulaThreshold =
            document.getElementById("formulaThreshold");

        const explanation =
            document.getElementById("explanation");

        const technicalNote =
            document.getElementById("technicalNote");

        const pauseButton =
            document.getElementById("pauseButton");

        const continueButton =
            document.getElementById("continueButton");

        const restartButton =
            document.getElementById("restartButton");

        const TWO_PI =
            2 * Math.PI;

        const CHANNEL_BANDWIDTH_HZ =
            6e6;

        const ACTIVE_SEGMENTS =
            13;

        const SEGMENT_DIVISOR =
            14;

        const SEGMENT_WIDTH_HZ =
            CHANNEL_BANDWIDTH_HZ /
            SEGMENT_DIVISOR;

        const moduleDefinitions = {
            chain: {
                color: "#38bdf8",
                rgb: "56, 189, 248",
                title: "Cadena digital completa",
                description:
                    "Los bloques muestran la función general desde las fuentes hasta la pantalla y parlantes.",
                tag: "BST-OFDM",
                simulationTitle:
                    "Audio/video/datos → procesamiento digital → BST-OFDM → RF → recepción"
            },

            segments: {
                color: "#c084fc",
                rgb: "192, 132, 252",
                title: "Organización de 13 segmentos",
                description:
                    "Seleccione una herramienta y toque un segmento para asignarlo a una capa o dejarlo libre.",
                tag: "13 activos",
                simulationTitle:
                    "Canal segmentado ISDB-Tb · capas A, B y C · One-Seg y Full-Seg"
            },

            coverage: {
                color: "#34d399",
                rgb: "52, 211, 153",
                title: "Cobertura y efecto umbral digital",
                description:
                    "El área circular usa un radio dado; la calidad se controla con un índice relativo independiente.",
                tag: "A = πr²",
                simulationTitle:
                    "Cobertura conceptual → nivel relativo → recepción, pixelado, congelamiento o pérdida"
            },

            comparison: {
                color: "#fb923c",
                rgb: "251, 146, 60",
                title: "TV analógica y TV digital",
                description:
                    "La analógica se degrada gradualmente; la digital mantiene calidad hasta aproximarse al umbral.",
                tag: "Comparación",
                simulationTitle:
                    "Degradación gradual analógica frente al efecto umbral digital"
            }
        };

        /*
         * Los límites siguientes solo crean una visualización cualitativa.
         * No representan valores normativos de campo, MER, BER o SNR.
         */
        const profileDefinitions = {
            oneSeg: {
                name: "One-Seg · configuración robusta",
                good: 52,
                pixel: 34,
                freeze: 18,
                color: "#34d399"
            },

            fullRobust: {
                name: "Full-Seg · capa robusta",
                good: 62,
                pixel: 42,
                freeze: 24,
                color: "#38bdf8"
            },

            fullCapacity: {
                name: "Full-Seg · mayor capacidad",
                good: 72,
                pixel: 50,
                freeze: 30,
                color: "#fb923c"
            }
        };

        let currentModule =
            "chain";

        let segmentAssignments =
            [
                "B",
                "B",
                "B",
                "B",
                "B",
                "B",
                "A",
                "C",
                "C",
                "C",
                "C",
                "C",
                "C"
            ];

        let selectedSegment =
            7;

        let segmentHitboxes =
            [];

        let elapsedTime =
            0;

        let lastFrameTime =
            performance.now();

        let isPaused =
            false;

        let thresholdSweepActive =
            false;

        let viewWidth =
            1000;

        let viewHeight =
            930;

        let pixelRatio =
            1;

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

            if (
                Math.abs(valueHz) >=
                1e6
            ) {
                return (
                    formatNumber(
                        valueHz /
                        1e6,
                        6
                    ) +
                    " MHz"
                );
            }

            if (
                Math.abs(valueHz) >=
                1e3
            ) {
                return (
                    formatNumber(
                        valueHz /
                        1e3,
                        6
                    ) +
                    " kHz"
                );
            }

            return (
                formatNumber(
                    valueHz,
                    6
                ) +
                " Hz"
            );
        }

        function renderMetrics(items) {
            metrics.innerHTML =
                items
                    .map(
                        function (item) {
                            return (
                                '<article class="metric">' +
                                    '<span class="metric-label">' +
                                        item[0] +
                                    '</span>' +
                                    '<span class="metric-value">' +
                                        item[1] +
                                    '</span>' +
                                '</article>'
                            );
                        }
                    )
                    .join("");
        }

        function setBanner(
            state,
            title,
            description,
            tag
        ) {
            stateBanner.className =
                "banner" +
                (
                    state
                        ? " " +
                            state
                        : ""
                );

            stateTitle.textContent =
                title;

            stateDescription.textContent =
                description;

            stateTag.textContent =
                tag;
        }

        function countLayer(layer) {
            return segmentAssignments.filter(
                function (assignment) {
                    return assignment === layer;
                }
            ).length;
        }

        function getUsedSegmentCount() {
            return segmentAssignments.filter(
                function (assignment) {
                    return assignment !== "none";
                }
            ).length;
        }

        function getQualityState(
            level,
            profileKey
        ) {
            const profile =
                profileDefinitions[profileKey];

            if (
                level >=
                profile.good
            ) {
                return {
                    key: "good",
                    title: "Buena recepción",
                    color: "#34d399",
                    description:
                        "La decodificación conceptual se mantiene estable."
                };
            }

            if (
                level >=
                profile.pixel
            ) {
                return {
                    key: "pixel",
                    title: "Pixelado",
                    color: "#fbbf24",
                    description:
                        "Aparecen bloques y errores visibles cerca del umbral."
                };
            }

            if (
                level >=
                profile.freeze
            ) {
                return {
                    key: "freeze",
                    title: "Congelamiento",
                    color: "#fb923c",
                    description:
                        "El receptor conserva cuadros mientras faltan datos útiles."
                };
            }

            return {
                key: "lost",
                title: "Pérdida del servicio",
                color: "#fb7185",
                description:
                    "El índice relativo está por debajo del umbral didáctico del perfil."
            };
        }

        function updateControlVisibility() {
            document
                .querySelectorAll(".segment-control")
                .forEach(
                    function (element) {
                        element.hidden =
                            currentModule !==
                            "segments";
                    }
                );

            document
                .querySelectorAll(".signal-control")
                .forEach(
                    function (element) {
                        element.hidden =
                            currentModule !==
                                "coverage" &&
                            currentModule !==
                                "comparison";
                    }
                );

            document
                .querySelectorAll(".coverage-control")
                .forEach(
                    function (element) {
                        element.hidden =
                            currentModule !==
                            "coverage";
                    }
                );
        }

        function updateInterface() {
            const definition =
                moduleDefinitions[currentModule];

            const used =
                getUsedSegmentCount();

            const remaining =
                ACTIVE_SEGMENTS -
                used;

            const layerA =
                countLayer("A");

            const layerB =
                countLayer("B");

            const layerC =
                countLayer("C");

            const signal =
                Number(
                    signalLevel.value
                );

            const radius =
                Number(
                    coverageRadius.value
                );

            const distance =
                Number(
                    receiverDistance.value
                );

            const area =
                Number.isFinite(radius) &&
                radius >= 0
                    ? Math.PI *
                        radius *
                        radius
                    : NaN;

            const profile =
                profileDefinitions[
                    receiverProfile.value
                ];

            const quality =
                getQualityState(
                    signal,
                    receiverProfile.value
                );

            signalLevelOutput.textContent =
                formatNumber(
                    signal,
                    0
                ) +
                " / 100";

            animationSpeedOutput.textContent =
                Number(
                    animationSpeed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            simulationTitle.textContent =
                definition.simulationTitle;

            updateControlVisibility();

            if (
                currentModule ===
                "segments"
            ) {
                if (
                    layerA === 1 &&
                    segmentAssignments[6] ===
                        "A"
                ) {
                    setBanner(
                        "",
                        "Distribución de capas válida",
                        "El segmento central está asignado a One-Seg. Full-Seg continúa significando recepción de la señal completa.",
                        used +
                            " / 13 usados"
                    );
                } else if (
                    layerA === 0
                ) {
                    setBanner(
                        "warning",
                        "One-Seg no asignado",
                        "Puede existir una distribución sin One-Seg, pero el ejemplo de esta clase usa normalmente el segmento central.",
                        remaining +
                            " libres"
                    );
                } else {
                    setBanner(
                        "warning",
                        "Revise la capa A",
                        "Para esta práctica didáctica, One-Seg se mantiene únicamente en el segmento central.",
                        "Capa A = " +
                            layerA
                    );
                }
            } else if (
                currentModule ===
                    "coverage" ||
                currentModule ===
                    "comparison"
            ) {
                const bannerState =
                    quality.key === "good"
                        ? ""
                        : quality.key ===
                            "pixel"
                            ? "warning"
                            : "danger";

                setBanner(
                    bannerState,
                    quality.title,
                    quality.description +
                        " La escala es relativa y no representa un umbral normativo.",
                    profile.name
                );
            } else {
                setBanner(
                    "",
                    definition.title,
                    definition.description,
                    definition.tag
                );
            }

            if (
                currentModule ===
                "chain"
            ) {
                renderMetrics(
                    [
                        [
                            "Fuentes",
                            "Audio · video · datos"
                        ],
                        [
                            "Representación",
                            "Información digital"
                        ],
                        [
                            "Organización RF",
                            "BST-OFDM segmentado"
                        ],
                        [
                            "Segmentos activos",
                            "13"
                        ],
                        [
                            "Canal didáctico",
                            "6 MHz"
                        ],
                        [
                            "Ancho por segmento",
                            formatFrequency(
                                SEGMENT_WIDTH_HZ
                            )
                        ],
                        [
                            "Recepción parcial",
                            "One-Seg"
                        ],
                        [
                            "Recepción completa",
                            "Full-Seg"
                        ]
                    ]
                );
            } else if (
                currentModule ===
                "segments"
            ) {
                renderMetrics(
                    [
                        [
                            "Segmentos usados",
                            used +
                                " de 13"
                        ],
                        [
                            "Sin asignar",
                            remaining
                        ],
                        [
                            "Capa A",
                            layerA +
                                " · One-Seg"
                        ],
                        [
                            "Capa B",
                            layerB +
                                " · " +
                                serviceB.value
                        ],
                        [
                            "Capa C",
                            layerC +
                                " · " +
                                serviceC.value
                        ],
                        [
                            "Segmento seleccionado",
                            selectedSegment
                        ],
                        [
                            "One-Seg central",
                            segmentAssignments[6] ===
                            "A"
                                ? "Activo"
                                : "No asignado"
                        ],
                        [
                            "Full-Seg",
                            "Recibe la señal completa"
                        ]
                    ]
                );
            } else if (
                currentModule ===
                "coverage"
            ) {
                renderMetrics(
                    [
                        [
                            "Estado recibido",
                            quality.title
                        ],
                        [
                            "Índice relativo",
                            signal +
                                " / 100"
                        ],
                        [
                            "Perfil",
                            profile.name
                        ],
                        [
                            "Radio dado",
                            formatNumber(
                                radius,
                                3
                            ) +
                                " km"
                        ],
                        [
                            "Área ideal",
                            formatNumber(
                                area,
                                2
                            ) +
                                " km²"
                        ],
                        [
                            "Distancia marcada",
                            formatNumber(
                                distance,
                                3
                            ) +
                                " km"
                        ],
                        [
                            "Posición circular",
                            distance <= radius
                                ? "Dentro"
                                : "Fuera"
                        ],
                        [
                            "Modelo",
                            "Conceptual · no propagación"
                        ]
                    ]
                );
            } else {
                renderMetrics(
                    [
                        [
                            "TV analógica",
                            "Degradación gradual"
                        ],
                        [
                            "TV digital",
                            quality.title
                        ],
                        [
                            "Índice relativo",
                            signal +
                                " / 100"
                        ],
                        [
                            "Perfil digital",
                            profile.name
                        ],
                        [
                            "Ruido analógico",
                            "Nieve · fantasmas"
                        ],
                        [
                            "Falla digital",
                            "Bloques · congelamiento · corte"
                        ],
                        [
                            "Servicios digitales",
                            "Audio · video · datos"
                        ],
                        [
                            "Recepción móvil",
                            "Puede existir"
                        ]
                    ]
                );
            }

            formulaSegments.textContent =
                "Usados = A + B + C = " +
                layerA +
                " + " +
                layerB +
                " + " +
                layerC +
                " = " +
                used +
                " segmentos";

            formulaWidth.textContent =
                "Bsegmento = 6 MHz / 14 = " +
                formatFrequency(
                    SEGMENT_WIDTH_HZ
                );

            formulaPercentActive.textContent =
                "One-Seg respecto de 13 activos = (1/13)×100 ≈ 7,7 %";

            formulaPercentRf.textContent =
                "428,6 kHz / 6000 kHz × 100 ≈ 7,14 % del canal RF";

            formulaCoverage.textContent =
                Number.isFinite(area)
                    ? (
                        "A = πr² = π·(" +
                        formatNumber(
                            radius,
                            3
                        ) +
                        " km)² ≈ " +
                        formatNumber(
                            area,
                            2
                        ) +
                        " km²"
                    )
                    : "Ingrese un radio válido para calcular A = πr²";

            formulaThreshold.textContent =
                "Perfil visual " +
                profile.name +
                ": buena ≥ " +
                profile.good +
                ", pixelado ≥ " +
                profile.pixel +
                ", congelamiento ≥ " +
                profile.freeze +
                " · escala relativa no normativa";

            const notes = [
                "El canal de 6 MHz se representa con 13 segmentos activos; el ancho aproximado de un segmento se obtiene dividiendo entre 14.",
                "Los segmentos se asignan a capas de transmisión y no directamente a programas fijos.",
                "La capacidad y la robustez son cualitativas; no representan tasas de bits ni parámetros normativos.",
                "El índice de señal de 0 a 100 es exclusivamente didáctico y no corresponde a una unidad de campo o relación señal-ruido.",
                "La cobertura circular no sustituye mediciones ni planificación profesional.",
                "Los marcadores animados muestran secuencia de procesamiento y no el recorrido físico de la energía.",
                "No se incluyen MPEG, Transport Stream, intervalo de guarda, IPTV, Web TV ni satélite."
            ];

            technicalNote.innerHTML =
                "<strong>Advertencias técnicas:</strong> " +
                notes.join(" ");

            if (
                currentModule ===
                "chain"
            ) {
                explanation.innerHTML =
                    "<strong>Cadena digital:</strong> digitalización representa audio, video y datos como información digital; compresión reduce la cantidad de datos; multiplexación organiza servicios; codificación de canal añade protección; BST-OFDM distribuye símbolos en subportadoras organizadas por segmentos; el receptor realiza las funciones inversas hasta recuperar audio y video.";
            } else if (
                currentModule ===
                "segments"
            ) {
                explanation.innerHTML =
                    "<strong>Segmentación ISDB-Tb:</strong> toque un bloque del Canvas para asignarlo con la herramienta seleccionada. La capa A se reserva didácticamente al segmento central para One-Seg. Las capas B y C pueden asociarse a servicios de distinta resolución, pero el simulador no afirma que una cantidad fija de segmentos equivalga siempre a un programa específico.";
            } else if (
                currentModule ===
                "coverage"
            ) {
                explanation.innerHTML =
                    "<strong>Cobertura y umbral:</strong> el círculo usa un radio dado para calcular A = πr². La distancia del receptor solo ubica un punto en ese dibujo. La calidad recibida se controla por separado con un índice relativo, porque no se dispone de datos suficientes para calcular propagación real.";
            } else {
                explanation.innerHTML =
                    "<strong>Comparación:</strong> la TV analógica muestra degradación progresiva cuando cae la calidad de la señal. La TV digital puede conservar una imagen estable hasta aproximarse al umbral; después aparecen pixelado, congelamiento y pérdida del servicio.";
            }
        }

        function setModule(nextModule) {
            currentModule =
                nextModule;

            thresholdSweepActive =
                false;

            elapsedTime =
                0;

            const definition =
                moduleDefinitions[nextModule];

            document.documentElement.style.setProperty(
                "--active",
                definition.color
            );

            document.documentElement.style.setProperty(
                "--active-rgb",
                definition.rgb
            );

            moduleButtons.forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.module ===
                        nextModule
                    );
                }
            );

            resizeCanvas();
            updateInterface();
        }

        function applyPreset(key) {
            thresholdSweepActive =
                false;

            if (
                key ===
                "chain"
            ) {
                setModule(
                    "chain"
                );

                return;
            }

            if (
                key ===
                "oneSixSix"
            ) {
                segmentAssignments =
                    [
                        "B",
                        "B",
                        "B",
                        "B",
                        "B",
                        "B",
                        "A",
                        "C",
                        "C",
                        "C",
                        "C",
                        "C",
                        "C"
                    ];

                serviceB.value =
                    "HDTV";

                serviceC.value =
                    "SDTV";

                selectedSegment =
                    7;

                setModule(
                    "segments"
                );

                return;
            }

            if (
                key ===
                "oneTwelve"
            ) {
                segmentAssignments =
                    [
                        "B",
                        "B",
                        "B",
                        "B",
                        "B",
                        "B",
                        "A",
                        "B",
                        "B",
                        "B",
                        "B",
                        "B",
                        "B"
                    ];

                serviceB.value =
                    "HDTV";

                serviceC.value =
                    "Audio y datos";

                selectedSegment =
                    7;

                setModule(
                    "segments"
                );

                return;
            }

            if (
                key ===
                "threshold"
            ) {
                signalLevel.value =
                    "100";

                receiverProfile.value =
                    "fullCapacity";

                setModule(
                    "coverage"
                );

                thresholdSweepActive =
                    true;

                updateInterface();

                return;
            }

            if (
                key ===
                "coverage12"
            ) {
                coverageRadius.value =
                    "12";

                receiverDistance.value =
                    "9";

                signalLevel.value =
                    "68";

                receiverProfile.value =
                    "fullRobust";

                setModule(
                    "coverage"
                );
            }
        }

        function pauseSimulation() {
            isPaused =
                true;

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
            isPaused =
                false;

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
            continueSimulation();

            segmentAssignments =
                [
                    "B",
                    "B",
                    "B",
                    "B",
                    "B",
                    "B",
                    "A",
                    "C",
                    "C",
                    "C",
                    "C",
                    "C",
                    "C"
                ];

            selectedSegment =
                7;

            assignmentTool.value =
                "B";

            serviceB.value =
                "HDTV";

            serviceC.value =
                "SDTV";

            signalLevel.value =
                "72";

            receiverProfile.value =
                "fullCapacity";

            coverageRadius.value =
                "10";

            receiverDistance.value =
                "7";

            animationSpeed.value =
                "1";

            thresholdSweepActive =
                false;

            elapsedTime =
                0;

            setModule(
                "chain"
            );
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasWrapper.clientWidth
                );

            viewHeight =
                viewWidth < 720
                    ? 1580
                    : 930;

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
                    width /
                    2,
                    height /
                    2
                );

            ctx.beginPath();

            ctx.moveTo(
                x +
                safeRadius,
                y
            );

            ctx.lineTo(
                x +
                width -
                safeRadius,
                y
            );

            ctx.quadraticCurveTo(
                x +
                width,
                y,
                x +
                width,
                y +
                safeRadius
            );

            ctx.lineTo(
                x +
                width,
                y +
                height -
                safeRadius
            );

            ctx.quadraticCurveTo(
                x +
                width,
                y +
                height,
                x +
                width -
                safeRadius,
                y +
                height
            );

            ctx.lineTo(
                x +
                safeRadius,
                y +
                height
            );

            ctx.quadraticCurveTo(
                x,
                y +
                height,
                x,
                y +
                height -
                safeRadius
            );

            ctx.lineTo(
                x,
                y +
                safeRadius
            );

            ctx.quadraticCurveTo(
                x,
                y,
                x +
                safeRadius,
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
                String(
                    text
                ).split(" ");

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

                    lineNumber +=
                        1;

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
                "700 15px Segoe UI, sans-serif";

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
                "500 10px Segoe UI, sans-serif";

            wrapText(
                subtitle,
                24,
                50,
                Math.max(
                    190,
                    viewWidth -
                    500
                ),
                14,
                2
            );

            if (
                viewWidth >=
                650
            ) {
                ctx.fillStyle =
                    color;

                ctx.font =
                    "700 10px Consolas, monospace";

                ctx.textAlign =
                    "right";

                ctx.fillText(
                    formula,
                    viewWidth -
                    24,
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

        function drawArrow(
            x1,
            y1,
            x2,
            y2,
            color
        ) {
            const angle =
                Math.atan2(
                    y2 -
                    y1,
                    x2 -
                    x1
                );

            ctx.save();

            ctx.strokeStyle =
                color;

            ctx.fillStyle =
                color;

            ctx.lineWidth =
                1.4;

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
                    angle -
                    Math.PI /
                    6
                ),
                y2 -
                8 *
                Math.sin(
                    angle -
                    Math.PI /
                    6
                )
            );

            ctx.lineTo(
                x2 -
                8 *
                Math.cos(
                    angle +
                    Math.PI /
                    6
                ),
                y2 -
                8 *
                Math.sin(
                    angle +
                    Math.PI /
                    6
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
                "700 8.5px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            wrapText(
                title,
                x +
                width /
                2,
                y +
                height /
                2 -
                10,
                width -
                14,
                10,
                2
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 7px Segoe UI, sans-serif";

            wrapText(
                subtitle,
                x +
                width /
                2,
                y +
                height /
                2 +
                16,
                width -
                14,
                10,
                2
            );

            ctx.restore();
        }

        function drawMovingMarker(
            points,
            color,
            speed,
            phaseOffset = 0
        ) {
            if (
                points.length <
                2
            ) {
                return;
            }

            const segments = [];

            let totalLength =
                0;

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
                    Math.hypot(
                        dx,
                        dy
                    );

                segments.push(
                    {
                        start:
                            points[index],

                        end:
                            points[index + 1],

                        length
                    }
                );

                totalLength +=
                    length;
            }

            let distance =
                (
                    (
                        elapsedTime *
                        speed +
                        phaseOffset
                    ) %
                    1
                ) *
                totalLength;

            let position =
                points[0];

            for (
                const segment of segments
            ) {
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

        function drawChainBlocks(
            panel,
            blocks,
            columns,
            markerColor
        ) {
            const mobile =
                viewWidth <
                720;

            const markerPoints = [];

            if (!mobile) {
                const rows =
                    Math.ceil(
                        blocks.length /
                        columns
                    );

                const gapX =
                    18;

                const gapY =
                    26;

                const availableWidth =
                    panel.width -
                    44;

                const blockWidth =
                    (
                        availableWidth -
                        (
                            columns -
                            1
                        ) *
                        gapX
                    ) /
                    columns;

                const blockHeight =
                    rows === 1
                        ? panel.height -
                            92
                        : 76;

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        const row =
                            Math.floor(
                                index /
                                columns
                            );

                        const column =
                            index %
                            columns;

                        const x =
                            panel.x +
                            22 +
                            column *
                            (
                                blockWidth +
                                gapX
                            );

                        const y =
                            panel.y +
                            52 +
                            row *
                            (
                                blockHeight +
                                gapY
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

                        markerPoints.push(
                            {
                                x:
                                    x +
                                    blockWidth /
                                    2,

                                y:
                                    y +
                                    blockHeight /
                                    2
                            }
                        );

                        const nextInRow =
                            column <
                                columns -
                                1 &&
                            index <
                                blocks.length -
                                1;

                        if (
                            nextInRow
                        ) {
                            drawArrow(
                                x +
                                blockWidth,
                                y +
                                blockHeight /
                                2,
                                x +
                                blockWidth +
                                gapX -
                                5,
                                y +
                                blockHeight /
                                2,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }

                        const nextRow =
                            column ===
                                columns -
                                1 &&
                            index <
                                blocks.length -
                                1;

                        if (
                            nextRow
                        ) {
                            const nextX =
                                panel.x +
                                22;

                            const nextY =
                                y +
                                blockHeight +
                                gapY;

                            drawArrow(
                                x +
                                blockWidth /
                                2,
                                y +
                                blockHeight,
                                x +
                                blockWidth /
                                2,
                                nextY -
                                5,
                                "rgba(186, 230, 253, 0.38)"
                            );

                            ctx.save();

                            ctx.strokeStyle =
                                "rgba(186, 230, 253, 0.28)";

                            ctx.setLineDash(
                                [
                                    4,
                                    4
                                ]
                            );

                            ctx.beginPath();

                            ctx.moveTo(
                                x +
                                blockWidth /
                                2,
                                nextY
                            );

                            ctx.lineTo(
                                nextX +
                                blockWidth /
                                2,
                                nextY
                            );

                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                );
            } else {
                const blockWidth =
                    panel.width -
                    70;

                const blockHeight =
                    58;

                const gap =
                    17;

                blocks.forEach(
                    function (
                        block,
                        index
                    ) {
                        const x =
                            panel.x +
                            35;

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

                        markerPoints.push(
                            {
                                x:
                                    x +
                                    blockWidth +
                                    13,

                                y:
                                    y +
                                    blockHeight /
                                    2
                            }
                        );

                        if (
                            index <
                            blocks.length -
                            1
                        ) {
                            drawArrow(
                                x +
                                blockWidth /
                                2,
                                y +
                                blockHeight,
                                x +
                                blockWidth /
                                2,
                                y +
                                blockHeight +
                                gap -
                                4,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );
            }

            drawMovingMarker(
                markerPoints,
                markerColor,
                0.07
            );

            drawMovingMarker(
                markerPoints,
                "#fbbf24",
                0.07,
                0.5
            );
        }

        function drawOfdmConcept(panel) {
            const plot = {
                x:
                    panel.x +
                    28,

                y:
                    panel.y +
                    58,

                width:
                    panel.width -
                    56,

                height:
                    panel.height -
                    96
            };

            const segmentGap =
                3;

            const segmentWidth =
                (
                    plot.width -
                    segmentGap *
                    (
                        ACTIVE_SEGMENTS -
                        1
                    )
                ) /
                ACTIVE_SEGMENTS;

            for (
                let segment = 0;
                segment < ACTIVE_SEGMENTS;
                segment += 1
            ) {
                const x =
                    plot.x +
                    segment *
                    (
                        segmentWidth +
                        segmentGap
                    );

                ctx.save();

                roundedRectanglePath(
                    x,
                    plot.y,
                    segmentWidth,
                    plot.height,
                    5
                );

                ctx.fillStyle =
                    segment === 6
                        ? "rgba(52, 211, 153, 0.14)"
                        : "rgba(56, 189, 248, 0.08)";

                ctx.fill();

                ctx.strokeStyle =
                    segment === 6
                        ? "rgba(52, 211, 153, 0.72)"
                        : "rgba(56, 189, 248, 0.32)";

                ctx.stroke();

                const bars =
                    viewWidth <
                    720
                        ? 3
                        : 7;

                for (
                    let bar = 0;
                    bar < bars;
                    bar += 1
                ) {
                    const phase =
                        elapsedTime *
                        2.4 +
                        segment *
                        0.6 +
                        bar *
                        0.9;

                    const height =
                        plot.height *
                        (
                            0.18 +
                            0.48 *
                            (
                                0.5 +
                                0.5 *
                                Math.sin(
                                    phase
                                )
                            )
                        );

                    const barX =
                        x +
                        3 +
                        bar *
                        (
                            segmentWidth -
                            6
                        ) /
                        bars;

                    ctx.strokeStyle =
                        segment === 6
                            ? "rgba(52, 211, 153, 0.78)"
                            : "rgba(125, 211, 252, 0.64)";

                    ctx.beginPath();

                    ctx.moveTo(
                        barX,
                        plot.y +
                        plot.height -
                        7
                    );

                    ctx.lineTo(
                        barX,
                        plot.y +
                        plot.height -
                        7 -
                        height
                    );

                    ctx.stroke();
                }

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.76)";

                ctx.font =
                    "600 7px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    String(
                        segment +
                        1
                    ),
                    x +
                    segmentWidth /
                    2,
                    plot.y +
                    plot.height -
                    2
                );

                ctx.restore();
            }

            ctx.save();

            ctx.fillStyle =
                "#34d399";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Segmento central orientable a One-Seg",
                plot.x +
                plot.width /
                2,
                panel.y +
                panel.height -
                14
            );

            ctx.restore();
        }

        function drawChainScene() {
            drawCanvasHeader(
                "Cadena funcional de televisión digital",
                "Los bloques representan funciones técnicas generales; no se desarrollan códecs ni Transport Stream.",
                "13 segmentos activos · canal didáctico de 6 MHz",
                "#38bdf8"
            );

            const mobile =
                viewWidth <
                720;

            let transmitPanel;
            let receivePanel;
            let ofdmPanel;

            if (mobile) {
                transmitPanel = {
                    x: 14,
                    y: 78,
                    width:
                        viewWidth -
                        28,
                    height: 640
                };

                receivePanel = {
                    x: 14,
                    y: 734,
                    width:
                        viewWidth -
                        28,
                    height: 490
                };

                ofdmPanel = {
                    x: 14,
                    y: 1240,
                    width:
                        viewWidth -
                        28,
                    height: 270
                };
            } else {
                transmitPanel = {
                    x: 20,
                    y: 78,
                    width:
                        viewWidth -
                        40,
                    height: 290
                };

                receivePanel = {
                    x: 20,
                    y: 384,
                    width:
                        viewWidth -
                        40,
                    height: 240
                };

                ofdmPanel = {
                    x: 20,
                    y: 640,
                    width:
                        viewWidth -
                        40,
                    height: 230
                };
            }

            drawPanel(
                transmitPanel,
                "TRANSMISIÓN",
                "#38bdf8",
                "de las fuentes a la antena"
            );

            drawPanel(
                receivePanel,
                "RECEPCIÓN",
                "#34d399",
                "de la antena al audio y video"
            );

            drawPanel(
                ofdmPanel,
                "BST-OFDM SEGMENTADO",
                "#c084fc",
                "muchas subportadoras organizadas en segmentos"
            );

            const transmitBlocks = [
                [
                    "Audio / video / datos",
                    "fuentes del servicio",
                    "#38bdf8"
                ],
                [
                    "Digitalización",
                    "representa información en bits",
                    "#60a5fa"
                ],
                [
                    "Compresión",
                    "reduce cantidad de datos",
                    "#c084fc"
                ],
                [
                    "Multiplexación",
                    "organiza servicios",
                    "#fbbf24"
                ],
                [
                    "Codificación de canal",
                    "protección frente a errores",
                    "#34d399"
                ],
                [
                    "BST-OFDM",
                    "símbolos en subportadoras",
                    "#fb923c"
                ],
                [
                    "Transmisor RF",
                    "adapta y amplifica",
                    "#fb7185"
                ],
                [
                    "Antena",
                    "radiación terrestre",
                    "#38bdf8"
                ]
            ];

            const receiveBlocks = [
                [
                    "Antena",
                    "captura la señal",
                    "#38bdf8"
                ],
                [
                    "Sintonizador",
                    "selecciona el canal",
                    "#60a5fa"
                ],
                [
                    "Demodulación OFDM",
                    "recupera símbolos",
                    "#c084fc"
                ],
                [
                    "Decodificación de canal",
                    "usa la protección",
                    "#fbbf24"
                ],
                [
                    "Demultiplexación",
                    "separa servicios",
                    "#34d399"
                ],
                [
                    "Audio / video",
                    "pantalla y parlantes",
                    "#fb923c"
                ]
            ];

            drawChainBlocks(
                transmitPanel,
                transmitBlocks,
                mobile
                    ? 1
                    : 4,
                "#38bdf8"
            );

            drawChainBlocks(
                receivePanel,
                receiveBlocks,
                mobile
                    ? 1
                    : 6,
                "#34d399"
            );

            drawOfdmConcept(
                ofdmPanel
            );
        }

        function assignmentColor(layer) {
            if (
                layer ===
                "A"
            ) {
                return "#34d399";
            }

            if (
                layer ===
                "B"
            ) {
                return "#38bdf8";
            }

            if (
                layer ===
                "C"
            ) {
                return "#c084fc";
            }

            return "#64748b";
        }

        function assignmentName(layer) {
            if (
                layer ===
                "A"
            ) {
                return "A";
            }

            if (
                layer ===
                "B"
            ) {
                return "B";
            }

            if (
                layer ===
                "C"
            ) {
                return "C";
            }

            return "—";
        }

        function drawSegmentStrip(panel) {
            segmentHitboxes =
                [];

            const mobile =
                viewWidth <
                720;

            const columns =
                mobile
                    ? 5
                    : ACTIVE_SEGMENTS;

            const gap =
                7;

            const outerX =
                panel.x +
                20;

            const outerY =
                panel.y +
                66;

            const availableWidth =
                panel.width -
                40;

            const segmentWidth =
                mobile
                    ? (
                        availableWidth -
                        gap *
                        (
                            columns -
                            1
                        )
                    ) /
                        columns
                    : (
                        availableWidth -
                        gap *
                        (
                            ACTIVE_SEGMENTS -
                            1
                        )
                    ) /
                        ACTIVE_SEGMENTS;

            const segmentHeight =
                mobile
                    ? 94
                    : 126;

            for (
                let index = 0;
                index < ACTIVE_SEGMENTS;
                index += 1
            ) {
                const row =
                    mobile
                        ? Math.floor(
                            index /
                            columns
                        )
                        : 0;

                const column =
                    mobile
                        ? index %
                            columns
                        : index;

                const x =
                    outerX +
                    column *
                    (
                        segmentWidth +
                        gap
                    );

                const y =
                    outerY +
                    row *
                    (
                        segmentHeight +
                        12
                    );

                const layer =
                    segmentAssignments[index];

                const color =
                    assignmentColor(
                        layer
                    );

                const selected =
                    selectedSegment ===
                    index +
                    1;

                segmentHitboxes.push(
                    {
                        x,
                        y,
                        width:
                            segmentWidth,
                        height:
                            segmentHeight,
                        index
                    }
                );

                ctx.save();

                roundedRectanglePath(
                    x,
                    y,
                    segmentWidth,
                    segmentHeight,
                    8
                );

                ctx.fillStyle =
                    layer === "none"
                        ? "rgba(71, 85, 105, 0.12)"
                        : color +
                            "22";

                ctx.fill();

                ctx.strokeStyle =
                    selected
                        ? "#fbbf24"
                        : color;

                ctx.lineWidth =
                    selected
                        ? 3
                        : 1.2;

                ctx.stroke();

                ctx.fillStyle =
                    selected
                        ? "#fde68a"
                        : "#f0f9ff";

                ctx.font =
                    "700 11px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    String(
                        index +
                        1
                    ),
                    x +
                    segmentWidth /
                    2,
                    y +
                    20
                );

                ctx.fillStyle =
                    color;

                ctx.font =
                    "800 16px Segoe UI, sans-serif";

                ctx.fillText(
                    assignmentName(
                        layer
                    ),
                    x +
                    segmentWidth /
                    2,
                    y +
                    segmentHeight /
                    2 +
                    5
                );

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.80)";

                ctx.font =
                    "600 7px Segoe UI, sans-serif";

                ctx.fillText(
                    index === 6
                        ? "CENTRAL"
                        : "SEGMENTO",
                    x +
                    segmentWidth /
                    2,
                    y +
                    segmentHeight -
                    11
                );

                if (
                    index ===
                    6
                ) {
                    ctx.strokeStyle =
                        "rgba(52, 211, 153, 0.65)";

                    ctx.setLineDash(
                        [
                            4,
                            4
                        ]
                    );

                    ctx.beginPath();

                    ctx.moveTo(
                        x +
                        5,
                        y +
                        29
                    );

                    ctx.lineTo(
                        x +
                        segmentWidth -
                        5,
                        y +
                        29
                    );

                    ctx.stroke();
                }

                ctx.restore();
            }

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.74)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            wrapText(
                "Toque o haga clic en un segmento para aplicar la herramienta seleccionada.",
                panel.x +
                20,
                panel.y +
                panel.height -
                24,
                panel.width -
                40,
                11,
                2
            );

            ctx.restore();
        }

        function drawLayerCard(
            x,
            y,
            width,
            height,
            layer,
            count,
            service,
            profileText
        ) {
            const color =
                assignmentColor(
                    layer
                );

            ctx.save();

            roundedRectanglePath(
                x,
                y,
                width,
                height,
                10
            );

            ctx.fillStyle =
                color +
                "16";

            ctx.fill();

            ctx.strokeStyle =
                color;

            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.font =
                "800 12px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            ctx.fillText(
                "CAPA " +
                layer,
                x +
                14,
                y +
                24
            );

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 11px Segoe UI, sans-serif";

            ctx.fillText(
                count +
                (
                    count === 1
                        ? " segmento"
                        : " segmentos"
                ),
                x +
                14,
                y +
                48
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.82)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            wrapText(
                service,
                x +
                14,
                y +
                70,
                width -
                28,
                12,
                2
            );

            ctx.fillStyle =
                color;

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            wrapText(
                profileText,
                x +
                14,
                y +
                height -
                30,
                width -
                28,
                11,
                2
            );

            ctx.restore();
        }

        function drawCapacityRobustness(panel) {
            const layerA =
                countLayer(
                    "A"
                );

            const layerB =
                countLayer(
                    "B"
                );

            const layerC =
                countLayer(
                    "C"
                );

            const mobile =
                viewWidth <
                720;

            if (mobile) {
                const cardWidth =
                    panel.width -
                    32;

                const cardHeight =
                    114;

                drawLayerCard(
                    panel.x +
                    16,
                    panel.y +
                    50,
                    cardWidth,
                    cardHeight,
                    "A",
                    layerA,
                    "One-Seg · recepción parcial",
                    "Orientación didáctica a mayor robustez"
                );

                drawLayerCard(
                    panel.x +
                    16,
                    panel.y +
                    176,
                    cardWidth,
                    cardHeight,
                    "B",
                    layerB,
                    serviceB.value,
                    "Capacidad y robustez dependen de la configuración"
                );

                drawLayerCard(
                    panel.x +
                    16,
                    panel.y +
                    302,
                    cardWidth,
                    cardHeight,
                    "C",
                    layerC,
                    serviceC.value,
                    "No existe equivalencia fija segmentos-programa"
                );
            } else {
                const gap =
                    14;

                const cardWidth =
                    (
                        panel.width -
                        40 -
                        2 *
                        gap
                    ) /
                    3;

                const cardHeight =
                    panel.height -
                    76;

                drawLayerCard(
                    panel.x +
                    20,
                    panel.y +
                    50,
                    cardWidth,
                    cardHeight,
                    "A",
                    layerA,
                    "One-Seg · recepción parcial",
                    "Orientación didáctica a mayor robustez"
                );

                drawLayerCard(
                    panel.x +
                    20 +
                    cardWidth +
                    gap,
                    panel.y +
                    50,
                    cardWidth,
                    cardHeight,
                    "B",
                    layerB,
                    serviceB.value,
                    "Capacidad y robustez dependen de la configuración"
                );

                drawLayerCard(
                    panel.x +
                    20 +
                    2 *
                    (
                        cardWidth +
                        gap
                    ),
                    panel.y +
                    50,
                    cardWidth,
                    cardHeight,
                    "C",
                    layerC,
                    serviceC.value,
                    "No existe equivalencia fija segmentos-programa"
                );
            }
        }

        function drawServiceReceiver(panel) {
            const oneSegActive =
                segmentAssignments[6] ===
                "A";

            const mobile =
                viewWidth <
                720;

            const cardWidth =
                mobile
                    ? panel.width -
                        32
                    : (
                        panel.width -
                        50
                    ) /
                        2;

            const cardHeight =
                mobile
                    ? 145
                    : panel.height -
                        78;

            const firstX =
                panel.x +
                16;

            const firstY =
                panel.y +
                52;

            const secondX =
                mobile
                    ? firstX
                    : firstX +
                        cardWidth +
                        18;

            const secondY =
                mobile
                    ? firstY +
                        cardHeight +
                        16
                    : firstY;

            function drawReceiverCard(
                x,
                y,
                title,
                subtitle,
                count,
                color,
                active
            ) {
                ctx.save();

                roundedRectanglePath(
                    x,
                    y,
                    cardWidth,
                    cardHeight,
                    10
                );

                ctx.fillStyle =
                    active
                        ? color +
                            "16"
                        : "rgba(71, 85, 105, 0.12)";

                ctx.fill();

                ctx.strokeStyle =
                    active
                        ? color
                        : "#64748b";

                ctx.stroke();

                ctx.fillStyle =
                    active
                        ? color
                        : "#94a3b8";

                ctx.font =
                    "800 12px Segoe UI, sans-serif";

                ctx.textAlign =
                    "left";

                ctx.fillText(
                    title,
                    x +
                    14,
                    y +
                    24
                );

                ctx.fillStyle =
                    "#f0f9ff";

                ctx.font =
                    "700 18px Segoe UI, sans-serif";

                ctx.fillText(
                    count,
                    x +
                    14,
                    y +
                    55
                );

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.82)";

                ctx.font =
                    "600 8px Segoe UI, sans-serif";

                wrapText(
                    subtitle,
                    x +
                    14,
                    y +
                    80,
                    cardWidth -
                    28,
                    13,
                    4
                );

                ctx.restore();
            }

            drawReceiverCard(
                firstX,
                firstY,
                "ONE-SEG",
                "Receptor parcial: utiliza el segmento destinado a recepción portátil o móvil.",
                oneSegActive
                    ? "1 segmento"
                    : "No asignado",
                "#34d399",
                oneSegActive
            );

            drawReceiverCard(
                secondX,
                secondY,
                "FULL-SEG",
                "Receptor de banda completa: recibe los 13 segmentos de la señal y no debe definirse como solamente 12 segmentos.",
                "13 segmentos",
                "#38bdf8",
                true
            );
        }

        function drawSegmentsScene() {
            drawCanvasHeader(
                "ISDB-Tb: segmentos, capas y servicios",
                "El canal completo se representa con 13 segmentos activos. La asignación es didáctica y editable.",
                "Bsegmento ≈ 6 MHz / 14 = 428,6 kHz",
                "#c084fc"
            );

            const mobile =
                viewWidth <
                720;

            let stripPanel;
            let layersPanel;
            let receiverPanel;

            if (mobile) {
                stripPanel = {
                    x: 14,
                    y: 78,
                    width:
                        viewWidth -
                        28,
                    height: 420
                };

                layersPanel = {
                    x: 14,
                    y: 514,
                    width:
                        viewWidth -
                        28,
                    height: 445
                };

                receiverPanel = {
                    x: 14,
                    y: 975,
                    width:
                        viewWidth -
                        28,
                    height: 430
                };
            } else {
                stripPanel = {
                    x: 20,
                    y: 78,
                    width:
                        viewWidth -
                        40,
                    height: 225
                };

                layersPanel = {
                    x: 20,
                    y: 319,
                    width:
                        viewWidth *
                        0.62 -
                        28,
                    height: 500
                };

                receiverPanel = {
                    x:
                        layersPanel.x +
                        layersPanel.width +
                        16,
                    y: 319,
                    width:
                        viewWidth -
                        layersPanel.width -
                        56,
                    height: 500
                };
            }

            drawPanel(
                stripPanel,
                "13 SEGMENTOS ACTIVOS",
                "#c084fc",
                "selección directa por clic o toque"
            );

            drawPanel(
                layersPanel,
                "CAPAS JERÁRQUICAS",
                "#38bdf8",
                "cantidad, servicio y uso conceptual"
            );

            drawPanel(
                receiverPanel,
                "ONE-SEG Y FULL-SEG",
                "#34d399",
                "recepción parcial frente a señal completa"
            );

            drawSegmentStrip(
                stripPanel
            );

            drawCapacityRobustness(
                layersPanel
            );

            drawServiceReceiver(
                receiverPanel
            );
        }

        function drawTower(
            x,
            y,
            height
        ) {
            ctx.save();

            ctx.strokeStyle =
                "#38bdf8";

            ctx.lineWidth =
                2;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - 14, y);
            ctx.lineTo(x, y - height);
            ctx.lineTo(x + 14, y);
            ctx.stroke();

            ctx.beginPath();

            ctx.arc(
                x,
                y -
                height,
                4,
                0,
                TWO_PI
            );

            ctx.fillStyle =
                "#fbbf24";

            ctx.fill();

            for (
                let ring = 1;
                ring <= 3;
                ring += 1
            ) {
                const radius =
                    13 +
                    ring *
                    9 +
                    2 *
                    Math.sin(
                        elapsedTime *
                        2.2 +
                        ring
                    );

                ctx.strokeStyle =
                    "rgba(56, 189, 248, " +
                    (
                        0.62 -
                        ring *
                        0.13
                    ) +
                    ")";

                ctx.beginPath();

                ctx.arc(
                    x,
                    y -
                    height,
                    radius,
                    -0.7,
                    0.7
                );

                ctx.stroke();

                ctx.beginPath();

                ctx.arc(
                    x,
                    y -
                    height,
                    radius,
                    Math.PI -
                    0.7,
                    Math.PI +
                    0.7
                );

                ctx.stroke();
            }

            ctx.restore();
        }

        function drawCoverageMap(
            panel,
            radius,
            distance
        ) {
            const centerX =
                panel.x +
                panel.width /
                2;

            const centerY =
                panel.y +
                panel.height /
                2 +
                22;

            const mapRadius =
                Math.min(
                    panel.width,
                    panel.height
                ) *
                0.31;

            ctx.save();

            const gradient =
                ctx.createRadialGradient(
                    centerX,
                    centerY,
                    10,
                    centerX,
                    centerY,
                    mapRadius
                );

            gradient.addColorStop(
                0,
                "rgba(52, 211, 153, 0.23)"
            );

            gradient.addColorStop(
                0.58,
                "rgba(56, 189, 248, 0.12)"
            );

            gradient.addColorStop(
                1,
                "rgba(251, 191, 36, 0.06)"
            );

            ctx.fillStyle =
                gradient;

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                mapRadius,
                0,
                TWO_PI
            );

            ctx.fill();

            ctx.strokeStyle =
                "rgba(52, 211, 153, 0.68)";

            ctx.lineWidth =
                2;

            ctx.setLineDash(
                [
                    7,
                    5
                ]
            );

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                mapRadius,
                0,
                TWO_PI
            );

            ctx.stroke();

            ctx.setLineDash([]);

            drawTower(
                centerX,
                centerY +
                24,
                58
            );

            const ratio =
                radius > 0
                    ? distance /
                        radius
                    : 0;

            const receiverRadius =
                Math.min(
                    mapRadius *
                    1.28,
                    mapRadius *
                    ratio
                );

            const angle =
                -0.45;

            const receiverX =
                centerX +
                receiverRadius *
                Math.cos(
                    angle
                );

            const receiverY =
                centerY +
                receiverRadius *
                Math.sin(
                    angle
                );

            ctx.strokeStyle =
                "rgba(251, 191, 36, 0.62)";

            ctx.lineWidth =
                1.2;

            ctx.setLineDash(
                [
                    4,
                    4
                ]
            );

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(receiverX, receiverY);
            ctx.stroke();

            ctx.setLineDash([]);

            ctx.fillStyle =
                distance <= radius
                    ? "#34d399"
                    : "#fb7185";

            ctx.shadowBlur =
                12;

            ctx.shadowColor =
                ctx.fillStyle;

            ctx.beginPath();

            ctx.arc(
                receiverX,
                receiverY,
                7,
                0,
                TWO_PI
            );

            ctx.fill();

            ctx.shadowBlur =
                0;

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Receptor",
                receiverX,
                receiverY -
                13
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.80)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.fillText(
                "r = " +
                formatNumber(
                    radius,
                    2
                ) +
                " km",
                centerX,
                centerY +
                mapRadius +
                25
            );

            ctx.fillText(
                "d = " +
                formatNumber(
                    distance,
                    2
                ) +
                " km",
                centerX,
                centerY +
                mapRadius +
                40
            );

            ctx.restore();
        }

        function deterministicNoise(
            index,
            seed
        ) {
            const value =
                Math.sin(
                    index *
                    12.9898 +
                    seed *
                    78.233
                ) *
                43758.5453;

            return (
                value -
                Math.floor(
                    value
                )
            );
        }

        function drawTvFrame(
            x,
            y,
            width,
            height,
            quality,
            analog = false
        ) {
            ctx.save();

            roundedRectanglePath(
                x,
                y,
                width,
                height,
                12
            );

            ctx.fillStyle =
                "rgba(4, 16, 31, 0.95)";

            ctx.fill();

            ctx.strokeStyle =
                analog
                    ? "#fb923c"
                    : quality.color;

            ctx.lineWidth =
                2;

            ctx.stroke();

            const screen = {
                x:
                    x +
                    14,

                y:
                    y +
                    16,

                width:
                    width -
                    28,

                height:
                    height -
                    48
            };

            ctx.save();

            roundedRectanglePath(
                screen.x,
                screen.y,
                screen.width,
                screen.height,
                7
            );

            ctx.clip();

            const sky =
                ctx.createLinearGradient(
                    screen.x,
                    screen.y,
                    screen.x,
                    screen.y +
                    screen.height
                );

            sky.addColorStop(
                0,
                "#164e63"
            );

            sky.addColorStop(
                0.55,
                "#0e7490"
            );

            sky.addColorStop(
                0.56,
                "#14532d"
            );

            sky.addColorStop(
                1,
                "#052e16"
            );

            ctx.fillStyle =
                sky;

            ctx.fillRect(
                screen.x,
                screen.y,
                screen.width,
                screen.height
            );

            ctx.fillStyle =
                "rgba(255, 255, 255, 0.84)";

            ctx.beginPath();

            ctx.arc(
                screen.x +
                screen.width *
                0.72,
                screen.y +
                screen.height *
                0.24,
                screen.height *
                0.09,
                0,
                TWO_PI
            );

            ctx.fill();

            ctx.fillStyle =
                "#0f172a";

            ctx.fillRect(
                screen.x +
                screen.width *
                0.20,
                screen.y +
                screen.height *
                0.52,
                screen.width *
                0.28,
                screen.height *
                0.28
            );

            ctx.fillStyle =
                "#fbbf24";

            ctx.fillRect(
                screen.x +
                screen.width *
                0.31,
                screen.y +
                screen.height *
                0.64,
                screen.width *
                0.08,
                screen.height *
                0.16
            );

            if (analog) {
                const degradation =
                    1 -
                    Number(
                        signalLevel.value
                    ) /
                    100;

                const lines =
                    Math.round(
                        20 +
                        degradation *
                        140
                    );

                const frameSeed =
                    Math.floor(
                        elapsedTime *
                        10
                    );

                for (
                    let index = 0;
                    index < lines;
                    index += 1
                ) {
                    const px =
                        screen.x +
                        deterministicNoise(
                            index,
                            frameSeed +
                            1
                        ) *
                        screen.width;

                    const py =
                        screen.y +
                        deterministicNoise(
                            index,
                            frameSeed +
                            7
                        ) *
                        screen.height;

                    const alpha =
                        0.08 +
                        degradation *
                        0.38;

                    ctx.fillStyle =
                        "rgba(255,255,255," +
                        alpha +
                        ")";

                    ctx.fillRect(
                        px,
                        py,
                        1 +
                        deterministicNoise(
                            index,
                            frameSeed +
                            12
                        ) *
                        3,
                        1 +
                        deterministicNoise(
                            index,
                            frameSeed +
                            16
                        ) *
                        2
                    );
                }

                if (
                    degradation >
                    0.25
                ) {
                    ctx.fillStyle =
                        "rgba(255,255,255," +
                        Math.min(
                            0.18,
                            degradation *
                            0.16
                        ) +
                        ")";

                    const offset =
                        degradation *
                        10;

                    ctx.fillRect(
                        screen.x +
                        offset,
                        screen.y +
                        screen.height *
                        0.50,
                        screen.width *
                        0.30,
                        3
                    );

                    ctx.fillRect(
                        screen.x +
                        offset *
                        0.5,
                        screen.y +
                        screen.height *
                        0.66,
                        screen.width *
                        0.42,
                        2
                    );
                }
            } else if (
                quality.key ===
                "pixel"
            ) {
                const columns =
                    9;

                const rows =
                    6;

                const cellWidth =
                    screen.width /
                    columns;

                const cellHeight =
                    screen.height /
                    rows;

                for (
                    let row = 0;
                    row < rows;
                    row += 1
                ) {
                    for (
                        let column = 0;
                        column < columns;
                        column += 1
                    ) {
                        const seed =
                            Math.sin(
                                row *
                                17 +
                                column *
                                31 +
                                Math.floor(
                                    elapsedTime *
                                    3
                                )
                            );

                        if (
                            seed >
                            0.28
                        ) {
                            ctx.fillStyle =
                                seed >
                                0.75
                                    ? "rgba(251, 191, 36, 0.38)"
                                    : "rgba(2, 10, 24, 0.44)";

                            ctx.fillRect(
                                screen.x +
                                column *
                                cellWidth,
                                screen.y +
                                row *
                                cellHeight,
                                cellWidth +
                                1,
                                cellHeight +
                                1
                            );
                        }
                    }
                }
            } else if (
                quality.key ===
                "freeze"
            ) {
                ctx.fillStyle =
                    "rgba(2, 10, 24, 0.18)";

                ctx.fillRect(
                    screen.x,
                    screen.y,
                    screen.width,
                    screen.height
                );

                ctx.fillStyle =
                    "rgba(251, 146, 60, 0.88)";

                ctx.font =
                    "800 13px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "CUADRO CONGELADO",
                    screen.x +
                    screen.width /
                    2,
                    screen.y +
                    screen.height /
                    2
                );
            } else if (
                quality.key ===
                "lost"
            ) {
                ctx.fillStyle =
                    "#020617";

                ctx.fillRect(
                    screen.x,
                    screen.y,
                    screen.width,
                    screen.height
                );

                ctx.fillStyle =
                    "#fb7185";

                ctx.font =
                    "800 14px Segoe UI, sans-serif";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "SIN SERVICIO",
                    screen.x +
                    screen.width /
                    2,
                    screen.y +
                    screen.height /
                    2 -
                    4
                );

                ctx.fillStyle =
                    "rgba(199, 220, 235, 0.75)";

                ctx.font =
                    "600 8px Segoe UI, sans-serif";

                ctx.fillText(
                    "No se recupera audio/video útil",
                    screen.x +
                    screen.width /
                    2,
                    screen.y +
                    screen.height /
                    2 +
                    16
                );
            }

            ctx.restore();

            ctx.fillStyle =
                analog
                    ? "#fb923c"
                    : quality.color;

            ctx.font =
                "800 9px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                analog
                    ? "TV ANALÓGICA"
                    : quality.title.toUpperCase(),
                x +
                width /
                2,
                y +
                height -
                14
            );

            ctx.restore();
        }

        function drawThresholdBar(
            panel,
            signal,
            profile,
            quality
        ) {
            const bar = {
                x:
                    panel.x +
                    34,

                y:
                    panel.y +
                    78,

                width:
                    panel.width -
                    68,

                height:
                    44
            };

            const sections = [
                {
                    start: 0,
                    end:
                        profile.freeze,
                    color:
                        "#fb7185",
                    label:
                        "Pérdida"
                },
                {
                    start:
                        profile.freeze,
                    end:
                        profile.pixel,
                    color:
                        "#fb923c",
                    label:
                        "Congelamiento"
                },
                {
                    start:
                        profile.pixel,
                    end:
                        profile.good,
                    color:
                        "#fbbf24",
                    label:
                        "Pixelado"
                },
                {
                    start:
                        profile.good,
                    end: 100,
                    color:
                        "#34d399",
                    label:
                        "Buena"
                }
            ];

            sections.forEach(
                function (section) {
                    const x =
                        bar.x +
                        bar.width *
                        section.start /
                        100;

                    const width =
                        bar.width *
                        (
                            section.end -
                            section.start
                        ) /
                        100;

                    ctx.fillStyle =
                        section.color +
                        "44";

                    ctx.fillRect(
                        x,
                        bar.y,
                        width,
                        bar.height
                    );

                    ctx.strokeStyle =
                        section.color;

                    ctx.strokeRect(
                        x,
                        bar.y,
                        width,
                        bar.height
                    );

                    ctx.fillStyle =
                        "rgba(240, 249, 255, 0.88)";

                    ctx.font =
                        "700 7px Segoe UI, sans-serif";

                    ctx.textAlign =
                        "center";

                    ctx.fillText(
                        section.label,
                        x +
                        width /
                        2,
                        bar.y +
                        bar.height /
                        2 +
                        3
                    );
                }
            );

            const markerX =
                bar.x +
                bar.width *
                signal /
                100;

            ctx.save();

            ctx.fillStyle =
                quality.color;

            ctx.shadowBlur =
                14;

            ctx.shadowColor =
                quality.color;

            ctx.beginPath();

            ctx.moveTo(
                markerX,
                bar.y -
                12
            );

            ctx.lineTo(
                markerX -
                7,
                bar.y -
                1
            );

            ctx.lineTo(
                markerX +
                7,
                bar.y -
                1
            );

            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur =
                0;

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                signal +
                " / 100",
                markerX,
                bar.y +
                bar.height +
                18
            );

            ctx.restore();

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "left";

            wrapText(
                "Escala didáctica no calibrada. Los límites cambian únicamente para comparar perfiles cualitativos de robustez y capacidad.",
                panel.x +
                22,
                panel.y +
                panel.height -
                62,
                panel.width -
                44,
                13,
                4
            );

            ctx.restore();
        }

        function drawCoverageScene() {
            const signal =
                Number(
                    signalLevel.value
                );

            const radius =
                Number(
                    coverageRadius.value
                );

            const distance =
                Number(
                    receiverDistance.value
                );

            const profile =
                profileDefinitions[
                    receiverProfile.value
                ];

            const quality =
                getQualityState(
                    signal,
                    receiverProfile.value
                );

            drawCanvasHeader(
                "Cobertura conceptual y efecto umbral",
                "El mapa usa un radio dado. La calidad digital se controla con un índice relativo independiente.",
                "A = πr² · índice de señal no normativo",
                "#34d399"
            );

            const mobile =
                viewWidth <
                720;

            let mapPanel;
            let screenPanel;
            let thresholdPanel;

            if (mobile) {
                mapPanel = {
                    x: 14,
                    y: 78,
                    width:
                        viewWidth -
                        28,
                    height: 500
                };

                screenPanel = {
                    x: 14,
                    y: 594,
                    width:
                        viewWidth -
                        28,
                    height: 430
                };

                thresholdPanel = {
                    x: 14,
                    y: 1040,
                    width:
                        viewWidth -
                        28,
                    height: 330
                };
            } else {
                mapPanel = {
                    x: 20,
                    y: 78,
                    width:
                        viewWidth *
                        0.48 -
                        28,
                    height: 560
                };

                screenPanel = {
                    x:
                        mapPanel.x +
                        mapPanel.width +
                        16,
                    y: 78,
                    width:
                        viewWidth -
                        mapPanel.width -
                        56,
                    height: 560
                };

                thresholdPanel = {
                    x: 20,
                    y: 654,
                    width:
                        viewWidth -
                        40,
                    height: 220
                };
            }

            drawPanel(
                mapPanel,
                "ÁREA CIRCULAR APROXIMADA",
                "#34d399",
                "no representa cobertura real exacta"
            );

            drawPanel(
                screenPanel,
                "CALIDAD RECIBIDA",
                quality.color,
                profile.name
            );

            drawPanel(
                thresholdPanel,
                "EFECTO UMBRAL DIGITAL",
                "#fbbf24",
                "estados conceptuales según índice relativo"
            );

            drawCoverageMap(
                mapPanel,
                radius,
                distance
            );

            const tvWidth =
                screenPanel.width -
                54;

            const tvHeight =
                screenPanel.height -
                112;

            drawTvFrame(
                screenPanel.x +
                27,
                screenPanel.y +
                62,
                tvWidth,
                tvHeight,
                quality,
                false
            );

            ctx.save();

            ctx.fillStyle =
                quality.color;

            ctx.font =
                "800 12px Segoe UI, sans-serif";

            ctx.textAlign =
                "center";

            ctx.fillText(
                quality.title,
                screenPanel.x +
                screenPanel.width /
                2,
                screenPanel.y +
                screenPanel.height -
                27
            );

            ctx.restore();

            drawThresholdBar(
                thresholdPanel,
                signal,
                profile,
                quality
            );
        }

        function drawQualityCurve(
            panel,
            digital,
            profile
        ) {
            const plot = {
                x:
                    panel.x +
                    56,

                y:
                    panel.y +
                    72,

                width:
                    panel.width -
                    84,

                height:
                    panel.height -
                    138
            };

            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

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
                "rgba(186, 230, 253, 0.42)";

            ctx.beginPath();

            ctx.moveTo(
                plot.x,
                plot.y +
                plot.height
            );

            ctx.lineTo(
                plot.x +
                plot.width,
                plot.y +
                plot.height
            );

            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(plot.x, plot.y);

            ctx.lineTo(
                plot.x,
                plot.y +
                plot.height
            );

            ctx.stroke();

            ctx.beginPath();

            const center =
                profile.pixel /
                100;

            for (
                let index = 0;
                index <= 300;
                index += 1
            ) {
                const level =
                    index /
                    300;

                let quality;

                if (digital) {
                    quality =
                        1 /
                        (
                            1 +
                            Math.exp(
                                -18 *
                                (
                                    level -
                                    center
                                )
                            )
                        );
                } else {
                    quality =
                        Math.pow(
                            level,
                            0.72
                        );
                }

                const x =
                    plot.x +
                    level *
                    plot.width;

                const y =
                    plot.y +
                    plot.height -
                    quality *
                    plot.height;

                if (
                    index ===
                    0
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
                digital
                    ? "#34d399"
                    : "#fb923c";

            ctx.lineWidth =
                2.4;

            ctx.shadowBlur =
                8;

            ctx.shadowColor =
                ctx.strokeStyle;

            ctx.stroke();

            ctx.shadowBlur =
                0;

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI, sans-serif";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "Calidad percibida",
                plot.x +
                plot.width,
                plot.y -
                10
            );

            ctx.fillText(
                "Nivel relativo de señal",
                plot.x +
                plot.width,
                plot.y +
                plot.height +
                28
            );

            ctx.restore();
        }

        function drawComparisonScene() {
            const signal =
                Number(
                    signalLevel.value
                );

            const profile =
                profileDefinitions[
                    receiverProfile.value
                ];

            const quality =
                getQualityState(
                    signal,
                    receiverProfile.value
                );

            drawCanvasHeader(
                "TV analógica frente a TV digital",
                "La comparación es conceptual y usa el mismo índice relativo de señal para ambas pantallas.",
                "Analógica: degradación gradual · Digital: efecto umbral",
                "#fb923c"
            );

            const mobile =
                viewWidth <
                720;

            let analogPanel;
            let digitalPanel;
            let curvePanel;

            if (mobile) {
                analogPanel = {
                    x: 14,
                    y: 78,
                    width:
                        viewWidth -
                        28,
                    height: 400
                };

                digitalPanel = {
                    x: 14,
                    y: 494,
                    width:
                        viewWidth -
                        28,
                    height: 400
                };

                curvePanel = {
                    x: 14,
                    y: 910,
                    width:
                        viewWidth -
                        28,
                    height: 430
                };
            } else {
                analogPanel = {
                    x: 20,
                    y: 78,
                    width:
                        (
                            viewWidth -
                            56
                        ) /
                        2,
                    height: 470
                };

                digitalPanel = {
                    x:
                        analogPanel.x +
                        analogPanel.width +
                        16,
                    y: 78,
                    width:
                        analogPanel.width,
                    height: 470
                };

                curvePanel = {
                    x: 20,
                    y: 564,
                    width:
                        viewWidth -
                        40,
                    height: 305
                };
            }

            drawPanel(
                analogPanel,
                "TV ANALÓGICA",
                "#fb923c",
                "ruido visible y degradación progresiva"
            );

            drawPanel(
                digitalPanel,
                "TV DIGITAL",
                quality.color,
                "buena imagen hasta aproximarse al umbral"
            );

            drawPanel(
                curvePanel,
                "CALIDAD NORMALIZADA FRENTE A NIVEL RELATIVO",
                "#fbbf24",
                "curvas conceptuales, no mediciones"
            );

            drawTvFrame(
                analogPanel.x +
                24,
                analogPanel.y +
                58,
                analogPanel.width -
                48,
                analogPanel.height -
                92,
                quality,
                true
            );

            drawTvFrame(
                digitalPanel.x +
                24,
                digitalPanel.y +
                58,
                digitalPanel.width -
                48,
                digitalPanel.height -
                92,
                quality,
                false
            );

            if (mobile) {
                const half =
                    (
                        curvePanel.height -
                        90
                    ) /
                    2;

                drawQualityCurve(
                    {
                        x:
                            curvePanel.x +
                            8,

                        y:
                            curvePanel.y +
                            34,

                        width:
                            curvePanel.width -
                            16,

                        height:
                            half
                    },
                    false,
                    profile
                );

                drawQualityCurve(
                    {
                        x:
                            curvePanel.x +
                            8,

                        y:
                            curvePanel.y +
                            44 +
                            half,

                        width:
                            curvePanel.width -
                            16,

                        height:
                            half
                    },
                    true,
                    profile
                );
            } else {
                const halfWidth =
                    (
                        curvePanel.width -
                        30
                    ) /
                    2;

                drawQualityCurve(
                    {
                        x:
                            curvePanel.x +
                            10,

                        y:
                            curvePanel.y +
                            30,

                        width:
                            halfWidth,

                        height:
                            curvePanel.height -
                            45
                    },
                    false,
                    profile
                );

                drawQualityCurve(
                    {
                        x:
                            curvePanel.x +
                            20 +
                            halfWidth,

                        y:
                            curvePanel.y +
                            30,

                        width:
                            halfWidth,

                        height:
                            curvePanel.height -
                            45
                    },
                    true,
                    profile
                );
            }
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
                "Revise los valores numéricos de cobertura y distancia.",
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
                "Modelo funcional didáctico · sin MPEG, Transport Stream, intervalo de guarda, IPTV, Web TV ni satélite.",
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
                currentModule ===
                "coverage"
            ) {
                const radius =
                    Number(
                        coverageRadius.value
                    );

                const distance =
                    Number(
                        receiverDistance.value
                    );

                if (
                    !Number.isFinite(
                        radius
                    ) ||
                    !Number.isFinite(
                        distance
                    ) ||
                    radius <= 0 ||
                    distance < 0
                ) {
                    drawInvalidMessage();
                    return;
                }
            }

            if (
                currentModule ===
                "chain"
            ) {
                drawChainScene();
            } else if (
                currentModule ===
                "segments"
            ) {
                drawSegmentsScene();
            } else if (
                currentModule ===
                "coverage"
            ) {
                drawCoverageScene();
            } else {
                drawComparisonScene();
            }

            drawFooter();
        }

        function handleSegmentInteraction(event) {
            if (
                currentModule !==
                "segments"
            ) {
                return;
            }

            const rectangle =
                canvas.getBoundingClientRect();

            const touch =
                event.touches &&
                event.touches.length
                    ? event.touches[0]
                    : null;

            const clientX =
                touch
                    ? touch.clientX
                    : event.clientX;

            const clientY =
                touch
                    ? touch.clientY
                    : event.clientY;

            const x =
                (
                    clientX -
                    rectangle.left
                ) *
                viewWidth /
                rectangle.width;

            const y =
                (
                    clientY -
                    rectangle.top
                ) *
                viewHeight /
                rectangle.height;

            const hit =
                segmentHitboxes.find(
                    function (box) {
                        return (
                            x >= box.x &&
                            x <=
                                box.x +
                                box.width &&
                            y >= box.y &&
                            y <=
                                box.y +
                                box.height
                        );
                    }
                );

            if (!hit) {
                return;
            }

            selectedSegment =
                hit.index +
                1;

            const tool =
                assignmentTool.value;

            if (
                tool === "A" &&
                hit.index !== 6
            ) {
                setBanner(
                    "warning",
                    "One-Seg se mantiene en el centro",
                    "En esta práctica didáctica, la capa A para One-Seg solo puede asignarse al segmento central número 7.",
                    "Segmento " +
                    selectedSegment
                );

                return;
            }

            segmentAssignments[hit.index] =
                tool;

            if (
                tool ===
                "A"
            ) {
                segmentAssignments =
                    segmentAssignments.map(
                        function (
                            value,
                            index
                        ) {
                            if (
                                index ===
                                6
                            ) {
                                return "A";
                            }

                            return value === "A"
                                ? "none"
                                : value;
                        }
                    );
            }

            updateInterface();
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

                if (
                    thresholdSweepActive
                ) {
                    const sweep =
                        50 +
                        50 *
                        Math.cos(
                            elapsedTime *
                            0.65
                        );

                    signalLevel.value =
                        String(
                            Math.round(
                                sweep
                            )
                        );

                    updateInterface();
                }

                if (
                    elapsedTime >
                    10000
                ) {
                    elapsedTime =
                        0;
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

        [
            assignmentTool,
            serviceB,
            serviceC,
            signalLevel,
            receiverProfile,
            coverageRadius,
            receiverDistance,
            animationSpeed
        ].forEach(
            function (element) {
                element.addEventListener(
                    "input",
                    function () {
                        if (
                            element ===
                            signalLevel
                        ) {
                            thresholdSweepActive =
                                false;
                        }

                        updateInterface();
                    }
                );

                element.addEventListener(
                    "change",
                    function () {
                        if (
                            element ===
                            signalLevel
                        ) {
                            thresholdSweepActive =
                                false;
                        }

                        updateInterface();
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

        canvas.addEventListener(
            "click",
            handleSegmentInteraction
        );

        canvas.addEventListener(
            "touchstart",
            function (event) {
                event.preventDefault();

                handleSegmentInteraction(
                    event
                );
            },
            {
                passive: false
            }
        );

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        resizeCanvas();
        updateInterface();

        requestAnimationFrame(
            function (time) {
                lastFrameTime =
                    time;

                animate(
                    time
                );
            }
        );
    
