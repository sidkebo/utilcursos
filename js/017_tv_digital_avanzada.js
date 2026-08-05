        "use strict";

        /*
         * SIT-400 — Clase 17
         * Sistemas de televisión digital avanzados.
         *
         * Alcance:
         * - Compresión espacial y temporal sin algoritmos matemáticos.
         * - ES, PES y TS sin sintaxis binaria completa.
         * - Paquete TS típico de 188 bytes.
         * - Byte de sincronismo típico 0x47.
         * - PID, PAT y PMT a nivel funcional.
         * - Intervalo de guarda conceptual.
         * - Medios de distribución y diagnóstico básico.
         *
         * No se implementa routing, VLAN, multicast avanzado, CDN,
         * diseño HFC profesional, presupuesto de enlace ni FFT.
         */

        const $ =
            function (id) {
                return document.getElementById(id);
            };

        const canvas =
            $("canvas");

        const wrap =
            $("canvasWrap");

        const ctx =
            canvas.getContext("2d");

        const tabs =
            Array.from(
                document.querySelectorAll(".tab")
            );

        const presets =
            Array.from(
                document.querySelectorAll(".preset")
            );

        const ui = {
            simTitle:
                $("simTitle"),

            status:
                $("status"),

            banner:
                $("banner"),

            bannerTitle:
                $("bannerTitle"),

            bannerText:
                $("bannerText"),

            bannerTag:
                $("bannerTag"),

            metrics:
                $("metrics"),

            video:
                $("videoMbps"),

            audio:
                $("audioKbps"),

            data:
                $("dataKbps"),

            spatial:
                $("spatial"),

            temporal:
                $("temporal"),

            spatialOut:
                $("spatialOut"),

            temporalOut:
                $("temporalOut"),

            ts:
                $("tsMbps"),

            packet:
                $("packetType"),

            tu:
                $("tu"),

            ratio:
                $("guardRatio"),

            echo:
                $("echo"),

            medium:
                $("medium"),

            capacity:
                $("capacity"),

            scenario:
                $("scenario"),

            diagnosis:
                $("diagnosis"),

            scenarioMirror:
                $("scenarioMirror"),

            diagnosisMirror:
                $("diagnosisMirror"),

            evalPanel:
                $("evalPanel"),

            feedback:
                $("feedback"),

            check:
                $("check"),

            speed:
                $("speed"),

            speedOut:
                $("speedOut"),

            fTotal:
                $("fTotal"),

            fPackets:
                $("fPackets"),

            fGuard:
                $("fGuard"),

            fEfficiency:
                $("fEfficiency"),

            fStreaming:
                $("fStreaming"),

            explain:
                $("explain"),

            note:
                $("note"),

            pause:
                $("pause"),

            resume:
                $("resume"),

            reset:
                $("reset")
        };

        const TWO_PI =
            Math.PI * 2;

        const PACKET_BITS =
            188 * 8;

        const modules = {
            chain: {
                color:
                    "#38bdf8",

                rgb:
                    "56, 189, 248",

                title:
                    "Cadena avanzada de televisión digital",

                text:
                    "La animación muestra cómo se reducen, organizan, transportan y recuperan los datos.",

                tag:
                    "Cadena general",

                chain:
                    "Audio/video/datos → MPEG → multiplexación → TS → medio → receptor → decodificación"
            },

            mpeg: {
                color:
                    "#c084fc",

                rgb:
                    "192, 132, 252",

                title:
                    "Compresión MPEG",

                text:
                    "La compresión espacial actúa dentro del cuadro y la temporal entre cuadros.",

                tag:
                    "Menos datos",

                chain:
                    "Cuadros → redundancia espacial y temporal → bitrate → calidad relativa"
            },

            ts: {
                color:
                    "#fbbf24",

                rgb:
                    "251, 191, 36",

                title:
                    "Transport Stream",

                text:
                    "ES se organiza en PES y varios PES se combinan en paquetes TS.",

                tag:
                    "188 bytes",

                chain:
                    "ES → PES → TS · PID · PAT · PMT · sincronización"
            },

            guard: {
                color:
                    "#34d399",

                rgb:
                    "52, 211, 153",

                title:
                    "Intervalo de guarda",

                text:
                    "El prefijo cíclico protege si el eco importante queda dentro de Tᵍ.",

                tag:
                    "Protección temporal",

                chain:
                    "Señal directa + eco → guarda → símbolo protegido o interferencia"
            },

            media: {
                color:
                    "#fb923c",

                rgb:
                    "251, 146, 60",

                title:
                    "Medios de distribución",

                text:
                    "TDT, cable, IPTV, Web TV y satélite usan infraestructuras distintas.",

                tag:
                    "Comparación",

                chain:
                    "Servicio digital → medio seleccionado → receptor → pantalla"
            },

            evaluation: {
                color:
                    "#fb7185",

                rgb:
                    "251, 113, 133",

                title:
                    "Evaluación integradora",

                text:
                    "Seleccione el bloque donde probablemente se origina cada falla.",

                tag:
                    "Diagnóstico",

                chain:
                    "Síntoma → bloque probable → diagnóstico técnico básico"
            }
        };

        const packets = {
            video: {
                name:
                    "VIDEO",

                pid:
                    "0x0101",

                color:
                    "#38bdf8"
            },

            audio: {
                name:
                    "AUDIO",

                pid:
                    "0x0102",

                color:
                    "#34d399"
            },

            data: {
                name:
                    "DATOS",

                pid:
                    "0x0103",

                color:
                    "#c084fc"
            },

            pat: {
                name:
                    "PAT",

                pid:
                    "0x0000",

                color:
                    "#fbbf24"
            },

            pmt: {
                name:
                    "PMT",

                pid:
                    "0x0100",

                color:
                    "#fb923c"
            }
        };

        const media = {
            tdt: {
                name:
                    "TDT",

                color:
                    "#38bdf8",

                transport:
                    "Radio terrestre digital",

                infra:
                    "Transmisor RF, estación terrestre, antena UHF y receptor",

                advantage:
                    "Difusión simultánea a muchos receptores",

                limitation:
                    "Cobertura, obstáculos, ecos e interferencias",

                receiver:
                    "Antena UHF + receptor",

                delay:
                    2,

                coverage:
                    4
            },

            cable: {
                name:
                    "Cable digital",

                color:
                    "#c084fc",

                transport:
                    "Red física guiada",

                infra:
                    "Cabecera, coaxial o HFC, derivadores y receptor",

                advantage:
                    "Servicio controlado dentro de una red cableada",

                limitation:
                    "Conectores, derivadores, ruido y nivel bajo",

                receiver:
                    "Coaxial + TV o receptor",

                delay:
                    2,

                coverage:
                    2
            },

            iptv: {
                name:
                    "IPTV",

                color:
                    "#34d399",

                transport:
                    "Paquetes IP en red gestionada",

                infra:
                    "Proveedor, red administrada, decodificador o aplicación",

                advantage:
                    "Mayor posibilidad de control del servicio",

                limitation:
                    "Configuración, capacidad y estabilidad de red",

                receiver:
                    "Decodificador o aplicación",

                delay:
                    3,

                coverage:
                    3
            },

            web: {
                name:
                    "Web TV",

                color:
                    "#fb923c",

                transport:
                    "Streaming por internet abierto",

                infra:
                    "Internet público, navegador o aplicación",

                advantage:
                    "Acceso flexible desde distintos dispositivos",

                limitation:
                    "Congestión, buffering y variación de conexión",

                receiver:
                    "Navegador o aplicación",

                delay:
                    4,

                coverage:
                    5
            },

            satellite: {
                name:
                    "Satélite",

                color:
                    "#fb7185",

                transport:
                    "Enlace ascendente y descendente",

                infra:
                    "Estación terrena, satélite, parabólica, LNB y receptor",

                advantage:
                    "Cobertura geográfica amplia",

                limitation:
                    "Alineación, clima, cableado y recepción",

                receiver:
                    "Parabólica + LNB + receptor",

                delay:
                    5,

                coverage:
                    5
            }
        };

        const scenarios = [
            {
                text:
                    "Web TV inicia, se congela cada pocos segundos y otros equipos también navegan lento.",

                answer:
                    "network",

                block:
                    "Red IP / capacidad",

                why:
                    "La aplicación abre y el televisor funciona; el síntoma apunta primero a la capacidad o estabilidad de la red."
            },

            {
                text:
                    "El video se reproduce correctamente, pero no aparece el audio correspondiente.",

                answer:
                    "ts",

                block:
                    "Transport Stream / PID",

                why:
                    "Audio y video viajan en paquetes separados; un PID de audio ausente o mal asociado puede dejar video sin audio."
            },

            {
                text:
                    "La recepción OFDM falla cuando un eco importante llega después del intervalo tolerado.",

                answer:
                    "guard",

                block:
                    "Intervalo de guarda",

                why:
                    "Si el retardo supera Tᵍ, el eco puede invadir otro símbolo y causar interferencia entre símbolos."
            },

            {
                text:
                    "La imagen presenta pérdida de detalle, bloques y artefactos con bitrate demasiado bajo.",

                answer:
                    "mpeg",

                block:
                    "Compresión MPEG / bitrate",

                why:
                    "Un bitrate insuficiente puede aumentar la pérdida de detalle y los artefactos de compresión."
            },

            {
                text:
                    "En cable digital la imagen aparece y desaparece al mover un conector coaxial.",

                answer:
                    "cable",

                block:
                    "Cableado coaxial",

                why:
                    "El comportamiento mecánico sugiere una falla local del conector, cable o derivación."
            },

            {
                text:
                    "El receptor satelital pierde el servicio después de que la parabólica cambió de posición.",

                answer:
                    "satellite",

                block:
                    "Recepción satelital",

                why:
                    "La causa probable es la alineación de la parabólica o un problema de recepción asociado."
            }
        ];

        let current =
            "chain";

        let elapsed =
            0;

        let last =
            performance.now();

        let paused =
            false;

        let W =
            1000;

        let H =
            1060;

        let DPR =
            1;

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

        function fmt(
            value,
            decimals = 4
        ) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            return new Intl.NumberFormat(
                "es-BO",
                {
                    maximumFractionDigits:
                        decimals
                }
            ).format(value);
        }

        function data() {
            const result = {
                video:
                    Number(
                        ui.video.value
                    ),

                audio:
                    Number(
                        ui.audio.value
                    ),

                extra:
                    Number(
                        ui.data.value
                    ),

                spatial:
                    Number(
                        ui.spatial.value
                    ),

                temporal:
                    Number(
                        ui.temporal.value
                    ),

                ts:
                    Number(
                        ui.ts.value
                    ),

                tu:
                    Number(
                        ui.tu.value
                    ),

                ratio:
                    Number(
                        ui.ratio.value
                    ),

                echo:
                    Number(
                        ui.echo.value
                    ),

                capacity:
                    Number(
                        ui.capacity.value
                    )
            };

            result.valid =
                Object
                    .values(result)
                    .every(Number.isFinite) &&
                result.video > 0 &&
                result.audio >= 0 &&
                result.extra >= 0 &&
                result.ts > 0 &&
                result.tu > 0 &&
                result.ratio > 0 &&
                result.echo >= 0 &&
                result.capacity > 0;

            if (!result.valid) {
                return result;
            }

            result.total =
                result.video +
                (
                    result.audio +
                    result.extra
                ) /
                1000;

            result.pps =
                result.ts *
                1e6 /
                PACKET_BITS;

            result.tg =
                result.tu *
                result.ratio;

            result.tt =
                result.tu +
                result.tg;

            result.eff =
                result.tu /
                result.tt;

            result.protected =
                result.echo <=
                result.tg;

            result.compression =
                (
                    result.spatial +
                    result.temporal
                ) /
                2;

            /*
             * Índice educativo relativo.
             * No representa la calidad de un códec MPEG específico.
             */
            result.quality =
                clamp(
                    100 -
                    result.compression *
                    0.42 +
                    Math.log10(
                        Math.max(
                            result.video,
                            0.1
                        )
                    ) *
                    12,
                    0,
                    100
                );

            result.streamBase =
                result.total;

            result.streamNeed =
                result.streamBase *
                1.20;

            result.streamOK =
                result.capacity >=
                result.streamNeed;

            return result;
        }

        function showMetrics(items) {
            ui.metrics.innerHTML =
                items
                    .map(
                        function (item) {
                            return (
                                '<article class="metric">' +
                                    "<small>" +
                                        item[0] +
                                    "</small>" +
                                    "<b>" +
                                        item[1] +
                                    "</b>" +
                                "</article>"
                            );
                        }
                    )
                    .join("");
        }

        function setBanner(
            kind,
            title,
            text,
            tag
        ) {
            ui.banner.className =
                "banner" +
                (
                    kind
                        ? " " + kind
                        : ""
                );

            ui.bannerTitle.textContent =
                title;

            ui.bannerText.textContent =
                text;

            ui.bannerTag.textContent =
                tag;
        }

        function group(
            name,
            visible
        ) {
            document
                .querySelectorAll(
                    "." + name
                )
                .forEach(
                    function (element) {
                        element.hidden =
                            !visible;
                    }
                );
        }

        function mirrors() {
            ui.scenarioMirror.innerHTML =
                "<option>" +
                ui.scenario.options[
                    ui.scenario.selectedIndex
                ].textContent +
                "</option>";

            ui.diagnosisMirror.innerHTML =
                "<option>" +
                ui.diagnosis.options[
                    ui.diagnosis.selectedIndex
                ].textContent +
                "</option>";
        }

        function update() {
            const values =
                data();

            const definition =
                modules[current];

            ui.spatialOut.textContent =
                ui.spatial.value +
                " %";

            ui.temporalOut.textContent =
                ui.temporal.value +
                " %";

            ui.speedOut.textContent =
                Number(
                    ui.speed.value
                )
                    .toFixed(1)
                    .replace(".", ",") +
                "×";

            ui.simTitle.textContent =
                definition.chain;

            group(
                "mpeg-c",
                current === "mpeg"
            );

            group(
                "ts-c",
                current === "ts"
            );

            group(
                "guard-c",
                current === "guard"
            );

            group(
                "media-c",
                current === "media"
            );

            group(
                "eval-c",
                current === "evaluation"
            );

            ui.evalPanel.hidden =
                current !== "evaluation";

            mirrors();

            if (!values.valid) {
                setBanner(
                    "danger",
                    "Datos no válidos",
                    "Revise bitrates, tiempos y capacidad.",
                    "Sin cálculo"
                );

                showMetrics(
                    Array(8).fill(
                        [
                            "Valor",
                            "—"
                        ]
                    )
                );

                return;
            }

            if (current === "mpeg") {
                const kind =
                    values.quality >= 70
                        ? ""
                        : values.quality >= 45
                            ? "warning"
                            : "danger";

                setBanner(
                    kind,
                    "Compresión MPEG conceptual",
                    "Más compresión reduce datos, pero un bitrate o detalle demasiado bajo puede producir artefactos.",
                    "Calidad " +
                        fmt(
                            values.quality,
                            0
                        ) +
                        "/100"
                );

                showMetrics(
                    [
                        [
                            "Video",
                            fmt(
                                values.video,
                                3
                            ) +
                            " Mbps"
                        ],
                        [
                            "Audio",
                            fmt(
                                values.audio,
                                0
                            ) +
                            " kbps"
                        ],
                        [
                            "Datos",
                            fmt(
                                values.extra,
                                0
                            ) +
                            " kbps"
                        ],
                        [
                            "Total",
                            fmt(
                                values.total,
                                3
                            ) +
                            " Mbps"
                        ],
                        [
                            "Espacial",
                            values.spatial +
                            " %"
                        ],
                        [
                            "Temporal",
                            values.temporal +
                            " %"
                        ],
                        [
                            "Redundancia reducida",
                            fmt(
                                values.compression,
                                0
                            ) +
                            " % relativo"
                        ],
                        [
                            "Calidad",
                            fmt(
                                values.quality,
                                0
                            ) +
                            " / 100 relativo"
                        ]
                    ]
                );
            } else if (current === "ts") {
                const packet =
                    packets[
                        ui.packet.value
                    ];

                setBanner(
                    "",
                    "Transport Stream",
                    "Sincronismo, PID e información de programa permiten separar audio, video y datos.",
                    fmt(
                        values.pps,
                        0
                    ) +
                    " paquetes/s"
                );

                showMetrics(
                    [
                        [
                            "Paquete típico",
                            "188 bytes"
                        ],
                        [
                            "Tamaño",
                            "1504 bits"
                        ],
                        [
                            "Bitrate TS",
                            fmt(
                                values.ts,
                                3
                            ) +
                            " Mbps"
                        ],
                        [
                            "Paquetes/s",
                            fmt(
                                values.pps,
                                0
                            )
                        ],
                        [
                            "Sincronismo",
                            "0x47"
                        ],
                        [
                            "Destacado",
                            packet.name
                        ],
                        [
                            "PID mostrado",
                            packet.pid
                        ],
                        [
                            "Secuencia",
                            "ES → PES → TS"
                        ]
                    ]
                );
            } else if (current === "guard") {
                setBanner(
                    values.protected
                        ? ""
                        : "danger",

                    values.protected
                        ? "Eco dentro de la guarda"
                        : "Eco fuera de la guarda",

                    values.protected
                        ? "El retardo importante permanece dentro del margen temporal."
                        : "El eco supera Tᵍ y puede causar interferencia entre símbolos.",

                    values.protected
                        ? "Protegido"
                        : "Posible ISI"
                );

                showMetrics(
                    [
                        [
                            "Tᵤ",
                            fmt(
                                values.tu,
                                4
                            ) +
                            " ms"
                        ],
                        [
                            "Fracción",
                            ui.ratio.options[
                                ui.ratio.selectedIndex
                            ].textContent
                        ],
                        [
                            "Tᵍ",
                            fmt(
                                values.tg,
                                4
                            ) +
                            " ms"
                        ],
                        [
                            "T total",
                            fmt(
                                values.tt,
                                4
                            ) +
                            " ms"
                        ],
                        [
                            "Eficiencia",
                            fmt(
                                values.eff *
                                100,
                                2
                            ) +
                            " %"
                        ],
                        [
                            "Eco",
                            fmt(
                                values.echo,
                                4
                            ) +
                            " ms"
                        ],
                        [
                            "Condición",
                            values.protected
                                ? "Eco ≤ Tᵍ"
                                : "Eco > Tᵍ"
                        ],
                        [
                            "Resultado",
                            values.protected
                                ? "Protección suficiente"
                                : "Posible interferencia"
                        ]
                    ]
                );
            } else if (current === "media") {
                const selectedMedium =
                    media[
                        ui.medium.value
                    ];

                setBanner(
                    ui.medium.value === "web" &&
                    !values.streamOK
                        ? "warning"
                        : "",

                    selectedMedium.name,
                    selectedMedium.limitation,
                    selectedMedium.transport
                );

                showMetrics(
                    [
                        [
                            "Medio",
                            selectedMedium.name
                        ],
                        [
                            "Transporte",
                            selectedMedium.transport
                        ],
                        [
                            "Receptor",
                            selectedMedium.receiver
                        ],
                        [
                            "Ventaja",
                            selectedMedium.advantage
                        ],
                        [
                            "Limitación",
                            selectedMedium.limitation
                        ],
                        [
                            "Retardo relativo",
                            selectedMedium.delay +
                            " / 5"
                        ],
                        [
                            "Cobertura relativa",
                            selectedMedium.coverage +
                            " / 5"
                        ],
                        [
                            "Capacidad",
                            fmt(
                                values.capacity,
                                2
                            ) +
                            " Mbps"
                        ]
                    ]
                );
            } else if (current === "evaluation") {
                const selectedScenario =
                    scenarios[
                        Number(
                            ui.scenario.value
                        )
                    ];

                setBanner(
                    "neutral",
                    "Diagnóstico técnico básico",
                    selectedScenario.text,
                    "Caso " +
                    (
                        Number(
                            ui.scenario.value
                        ) +
                        1
                    )
                );

                showMetrics(
                    [
                        [
                            "Caso",
                            String(
                                Number(
                                    ui.scenario.value
                                ) +
                                1
                            )
                        ],
                        [
                            "Síntoma",
                            selectedScenario.text
                        ],
                        [
                            "Respuesta elegida",
                            ui.diagnosis.options[
                                ui.diagnosis.selectedIndex
                            ].textContent
                        ],
                        [
                            "Bloque esperado",
                            "Oculto hasta verificar"
                        ],
                        [
                            "MPEG",
                            "Compresión y bitrate"
                        ],
                        [
                            "TS",
                            "PID y multiplexación"
                        ],
                        [
                            "Medio",
                            "IP, cable o satélite"
                        ],
                        [
                            "Objetivo",
                            "Ubicar origen probable"
                        ]
                    ]
                );
            } else {
                setBanner(
                    "",
                    definition.title,
                    definition.text,
                    definition.tag
                );

                showMetrics(
                    [
                        [
                            "Reducción",
                            "MPEG"
                        ],
                        [
                            "Organización",
                            "ES → PES → TS"
                        ],
                        [
                            "Paquete TS",
                            "188 bytes"
                        ],
                        [
                            "Protección OFDM",
                            "Intervalo de guarda"
                        ],
                        [
                            "Medios",
                            "TDT · cable · IP · satélite"
                        ],
                        [
                            "Identificación",
                            "PID · PAT · PMT"
                        ],
                        [
                            "Recepción",
                            "Separar y decodificar"
                        ],
                        [
                            "Diagnóstico",
                            "Ubicar bloque y medio"
                        ]
                    ]
                );
            }

            ui.fTotal.textContent =
                fmt(
                    values.video,
                    3
                ) +
                " Mbps + " +
                fmt(
                    values.audio,
                    0
                ) +
                " kbps + " +
                fmt(
                    values.extra,
                    0
                ) +
                " kbps = " +
                fmt(
                    values.total,
                    3
                ) +
                " Mbps";

            ui.fPackets.textContent =
                fmt(
                    values.ts,
                    3
                ) +
                "×10⁶ / 1504 ≈ " +
                fmt(
                    values.pps,
                    0
                ) +
                " paquetes/s";

            ui.fGuard.textContent =
                "Ttotal = " +
                fmt(
                    values.tu,
                    4
                ) +
                " + " +
                fmt(
                    values.tg,
                    4
                ) +
                " = " +
                fmt(
                    values.tt,
                    4
                ) +
                " ms";

            ui.fEfficiency.textContent =
                "η = Tᵤ/Ttotal = " +
                fmt(
                    values.eff *
                    100,
                    2
                ) +
                " %";

            ui.fStreaming.textContent =
                "(" +
                fmt(
                    values.streamBase,
                    3
                ) +
                " Mbps) × 1,20 = " +
                fmt(
                    values.streamNeed,
                    3
                ) +
                " Mbps";

            const commonNotes = [
                "Los marcadores animados indican orden lógico y no trayectoria física de la energía.",
                "Calidad, redundancia, retardo y cobertura son escalas educativas.",
                "Los PID de video, audio, datos y PMT son ejemplos; PAT usa PID 0x0000.",
                "No se representa la sintaxis binaria completa ni se diseñan redes profesionales."
            ];

            ui.note.innerHTML =
                "<strong>Advertencias técnicas:</strong> " +
                commonNotes.join(" ");

            const texts = {
                chain:
                    "<strong>Cadena general:</strong> MPEG reduce datos; la multiplexación combina flujos; el TS organiza paquetes; el medio entrega el servicio; el receptor separa, sincroniza y decodifica.",

                mpeg:
                    "<strong>Compresión MPEG:</strong> espacial significa dentro de una imagen y temporal entre cuadros. Los índices mostrados no predicen un códec real ni equivalen a una métrica profesional.",

                ts:
                    "<strong>Transport Stream:</strong> ES es flujo elemental, PES lo empaqueta y TS combina varios PES. El byte 0x47 ayuda a sincronizar; PID, PAT y PMT permiten identificar servicios.",

                guard:
                    "<strong>Intervalo de guarda:</strong> protege frente a ecos si el retardo importante queda dentro de Tᵍ. Una guarda mayor tolera más retardo, pero reduce eficiencia.",

                media:
                    "<strong>Medios:</strong> TDT usa radio terrestre; cable usa coaxial o HFC; IPTV usa red gestionada; Web TV usa internet abierto; satélite usa parabólica, LNB y receptor.",

                evaluation:
                    "<strong>Evaluación:</strong> parta del síntoma y diferencie compresión, TS, multitrayectoria, red IP, cableado, recepción satelital y receptor final."
            };

            ui.explain.innerHTML =
                texts[current];
        }

        function setModule(name) {
            current =
                name;

            elapsed =
                0;

            const definition =
                modules[name];

            document.documentElement.style.setProperty(
                "--active",
                definition.color
            );

            document.documentElement.style.setProperty(
                "--active-rgb",
                definition.rgb
            );

            tabs.forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.module ===
                        name
                    );
                }
            );

            resize();
            update();
        }

        function preset(name) {
            if (name === "bitrate") {
                ui.video.value =
                    "6";

                ui.audio.value =
                    "192";

                ui.data.value =
                    "300";

                setModule("mpeg");
                return;
            }

            if (name === "packets") {
                ui.ts.value =
                    "3";

                ui.packet.value =
                    "video";

                setModule("ts");
                return;
            }

            if (name === "guard-ok") {
                ui.tu.value =
                    "1";

                ui.ratio.value =
                    "0.125";

                ui.echo.value =
                    "0.09";

                setModule("guard");
                return;
            }

            if (name === "guard-bad") {
                ui.tu.value =
                    "1";

                ui.ratio.value =
                    "0.125";

                ui.echo.value =
                    "0.18";

                setModule("guard");
                return;
            }

            ui.video.value =
                "6";

            ui.audio.value =
                "300";

            ui.data.value =
                "200";

            ui.capacity.value =
                "7.8";

            ui.medium.value =
                "web";

            setModule("media");
        }

        function verify() {
            const selectedScenario =
                scenarios[
                    Number(
                        ui.scenario.value
                    )
                ];

            const correct =
                ui.diagnosis.value ===
                selectedScenario.answer;

            ui.feedback.className =
                "feedback " +
                (
                    correct
                        ? "ok"
                        : "bad"
                );

            ui.feedback.innerHTML =
                (
                    correct
                        ? "<strong>Respuesta correcta.</strong> "
                        : "<strong>Respuesta incorrecta.</strong> "
                ) +
                "Bloque probable: " +
                selectedScenario.block +
                ". " +
                selectedScenario.why;
        }

        function pauseSimulation() {
            paused =
                true;

            ui.pause.disabled =
                true;

            ui.resume.disabled =
                false;

            ui.status.textContent =
                "Simulación pausada";

            ui.status.classList.add(
                "paused"
            );
        }

        function resumeSimulation() {
            paused =
                false;

            last =
                performance.now();

            ui.pause.disabled =
                false;

            ui.resume.disabled =
                true;

            ui.status.textContent =
                "Simulación activa";

            ui.status.classList.remove(
                "paused"
            );
        }

        function resetSimulation() {
            resumeSimulation();

            ui.video.value =
                "6";

            ui.audio.value =
                "192";

            ui.data.value =
                "300";

            ui.spatial.value =
                "55";

            ui.temporal.value =
                "60";

            ui.ts.value =
                "3";

            ui.packet.value =
                "video";

            ui.tu.value =
                "1";

            ui.ratio.value =
                "0.125";

            ui.echo.value =
                "0.09";

            ui.medium.value =
                "web";

            ui.capacity.value =
                "8";

            ui.scenario.value =
                "0";

            ui.diagnosis.value =
                "mpeg";

            ui.speed.value =
                "1";

            elapsed =
                0;

            ui.feedback.className =
                "feedback";

            ui.feedback.textContent =
                "Seleccione el caso y el origen probable; luego pulse “Verificar respuesta”.";

            setModule("chain");
        }

        function resize() {
            W =
                Math.max(
                    300,
                    wrap.clientWidth
                );

            H =
                W < 720
                    ? 1510
                    : 1060;

            DPR =
                Math.min(
                    window.devicePixelRatio ||
                    1,
                    2
                );

            canvas.width =
                Math.round(
                    W *
                    DPR
                );

            canvas.height =
                Math.round(
                    H *
                    DPR
                );

            canvas.style.width =
                W +
                "px";

            canvas.style.height =
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

        function textWrap(
            text,
            x,
            y,
            maximumWidth,
            lineHeight,
            maximumLines = 3,
            align = "left"
        ) {
            const words =
                String(text).split(" ");

            let line =
                "";

            let lineNumber =
                0;

            ctx.textAlign =
                align;

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
                    W,
                    H
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
                W,
                H
            );

            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.045)";

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

            ctx.restore();
        }

        function drawHeader(
            title,
            subtitle,
            formula,
            color
        ) {
            ctx.save();

            ctx.textAlign =
                "left";

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 15px Segoe UI";

            ctx.fillText(
                title,
                24,
                31
            );

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.83)";

            ctx.font =
                "500 10px Segoe UI";

            textWrap(
                subtitle,
                24,
                50,
                Math.max(
                    190,
                    W -
                    500
                ),
                14,
                2
            );

            if (W >= 650) {
                ctx.textAlign =
                    "right";

                ctx.fillStyle =
                    color;

                ctx.font =
                    "700 10px Consolas";

                ctx.fillText(
                    formula,
                    W -
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

            roundedRectPath(
                panel.x,
                panel.y,
                panel.w,
                panel.h,
                12
            );

            ctx.fillStyle =
                "rgba(2, 10, 24, 0.63)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.15)";

            ctx.stroke();

            ctx.textAlign =
                "left";

            ctx.fillStyle =
                color;

            ctx.font =
                "700 10.5px Segoe UI";

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
                "600 8px Segoe UI";

            if (panel.w < 600) {
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
                    panel.w -
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

            ctx.moveTo(
                x1,
                y1
            );

            ctx.lineTo(
                x2,
                y2
            );

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

            roundedRectPath(
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
                "700 8.5px Segoe UI";

            textWrap(
                title,
                x +
                width /
                2,
                y +
                height /
                2 -
                9,
                width -
                14,
                10,
                2,
                "center"
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 7px Segoe UI";

            textWrap(
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
                2,
                "center"
            );

            ctx.restore();
        }

        function drawMarker(
            points,
            color,
            speed,
            offset = 0
        ) {
            if (points.length < 2) {
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
                const length =
                    Math.hypot(
                        points[index + 1].x -
                        points[index].x,
                        points[index + 1].y -
                        points[index].y
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
                        elapsed *
                        speed +
                        offset
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
                        segment.length
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

        function drawLinearBlocks(
            panel,
            items,
            color
        ) {
            const mobile =
                W < 720;

            const points = [];

            if (mobile) {
                const blockWidth =
                    panel.w -
                    70;

                const blockHeight =
                    58;

                const gap =
                    17;

                items.forEach(
                    function (item, index) {
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
                            item[0],
                            item[1],
                            item[2]
                        );

                        points.push(
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
                            items.length -
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
            } else {
                const gap =
                    18;

                const blockWidth =
                    (
                        panel.w -
                        44 -
                        gap *
                        (
                            items.length -
                            1
                        )
                    ) /
                    items.length;

                const blockHeight =
                    panel.h -
                    92;

                const y =
                    panel.y +
                    52;

                items.forEach(
                    function (item, index) {
                        const x =
                            panel.x +
                            22 +
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
                            item[0],
                            item[1],
                            item[2]
                        );

                        points.push(
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

                        if (
                            index <
                            items.length -
                            1
                        ) {
                            drawArrow(
                                x +
                                blockWidth,
                                y +
                                blockHeight /
                                2,
                                x +
                                blockWidth +
                                gap -
                                5,
                                y +
                                blockHeight /
                                2,
                                "rgba(186, 230, 253, 0.55)"
                            );
                        }
                    }
                );
            }

            drawMarker(
                points,
                color,
                0.07
            );

            drawMarker(
                points,
                "#fbbf24",
                0.07,
                0.5
            );
        }

        function drawCards(
            panel,
            items
        ) {
            const mobile =
                W < 720;

            const columns =
                mobile
                    ? 1
                    : 2;

            const gap =
                16;

            const rows =
                Math.ceil(
                    items.length /
                    columns
                );

            const cardWidth =
                (
                    panel.w -
                    40 -
                    gap *
                    (
                        columns -
                        1
                    )
                ) /
                columns;

            const cardHeight =
                (
                    panel.h -
                    76 -
                    gap *
                    (
                        rows -
                        1
                    )
                ) /
                rows;

            items.forEach(
                function (card, index) {
                    const column =
                        index %
                        columns;

                    const row =
                        Math.floor(
                            index /
                            columns
                        );

                    const x =
                        panel.x +
                        20 +
                        column *
                        (
                            cardWidth +
                            gap
                        );

                    const y =
                        panel.y +
                        50 +
                        row *
                        (
                            cardHeight +
                            gap
                        );

                    ctx.save();

                    roundedRectPath(
                        x,
                        y,
                        cardWidth,
                        cardHeight,
                        10
                    );

                    ctx.fillStyle =
                        card.color +
                        "18";

                    ctx.fill();

                    ctx.strokeStyle =
                        card.color;

                    ctx.stroke();

                    ctx.textAlign =
                        "left";

                    ctx.fillStyle =
                        card.color;

                    ctx.font =
                        "800 12px Segoe UI";

                    ctx.fillText(
                        card.title,
                        x +
                        14,
                        y +
                        25
                    );

                    ctx.fillStyle =
                        "#f0f9ff";

                    ctx.font =
                        "700 16px Segoe UI";

                    ctx.fillText(
                        card.subtitle,
                        x +
                        14,
                        y +
                        52
                    );

                    ctx.fillStyle =
                        "rgba(199, 220, 235, 0.82)";

                    ctx.font =
                        "600 9px Segoe UI";

                    textWrap(
                        card.body,
                        x +
                        14,
                        y +
                        78,
                        cardWidth -
                        28,
                        14,
                        5
                    );

                    ctx.restore();
                }
            );
        }

        function drawChainScene() {
            drawHeader(
                "Cadena general de TV digital avanzada",
                "El flujo se reduce, organiza, transporta y finalmente se recupera.",
                "MPEG ≠ TS · el medio cambia",
                "#38bdf8"
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 690
                        : 240
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 560
                        : 510
            };

            drawPanel(
                firstPanel,
                "CADENA FUNCIONAL",
                "#38bdf8",
                "del contenido a la pantalla"
            );

            drawPanel(
                secondPanel,
                "FUNCIONES CLAVE",
                "#c084fc",
                "reducir, organizar, proteger y entregar"
            );

            drawLinearBlocks(
                firstPanel,
                [
                    [
                        "Audio/video/datos",
                        "fuentes digitales",
                        "#38bdf8"
                    ],
                    [
                        "Compresión MPEG",
                        "reduce redundancia",
                        "#c084fc"
                    ],
                    [
                        "Multiplexación",
                        "combina flujos",
                        "#fbbf24"
                    ],
                    [
                        "Transport Stream",
                        "paquetes y PID",
                        "#fb923c"
                    ],
                    [
                        "Medio",
                        "TDT, cable, IP o satélite",
                        "#34d399"
                    ],
                    [
                        "Receptor",
                        "separa y sincroniza",
                        "#60a5fa"
                    ],
                    [
                        "Decodificación",
                        "recupera audio y video",
                        "#fb7185"
                    ]
                ],
                "#38bdf8"
            );

            drawCards(
                secondPanel,
                [
                    {
                        title:
                            "REDUCIR",

                        subtitle:
                            "MPEG",

                        body:
                            "Reduce redundancia espacial y temporal para disminuir datos.",

                        color:
                            "#c084fc"
                    },
                    {
                        title:
                            "ORGANIZAR",

                        subtitle:
                            "ES → PES → TS",

                        body:
                            "Audio, video y datos se empaquetan e identifican con PID.",

                        color:
                            "#fbbf24"
                    },
                    {
                        title:
                            "PROTEGER",

                        subtitle:
                            "Intervalo de guarda",

                        body:
                            "Da margen frente a ecos, aunque reduce eficiencia temporal.",

                        color:
                            "#34d399"
                    },
                    {
                        title:
                            "ENTREGAR",

                        subtitle:
                            "Cinco medios",

                        body:
                            "TDT, cable, IPTV, Web TV y satélite presentan fallas distintas.",

                        color:
                            "#fb923c"
                    }
                ]
            );
        }

        function drawFrameGrid(
            panel,
            values
        ) {
            const count =
                W < 720
                    ? 3
                    : 5;

            const gap =
                12;

            const frameWidth =
                (
                    panel.w -
                    44 -
                    gap *
                    (
                        count -
                        1
                    )
                ) /
                count;

            const frameHeight =
                panel.h -
                94;

            for (
                let index = 0;
                index < count;
                index += 1
            ) {
                const x =
                    panel.x +
                    22 +
                    index *
                    (
                        frameWidth +
                        gap
                    );

                const y =
                    panel.y +
                    58;

                ctx.save();

                roundedRectPath(
                    x,
                    y,
                    frameWidth,
                    frameHeight,
                    8
                );

                ctx.fillStyle =
                    "rgba(14, 116, 144, 0.18)";

                ctx.fill();

                ctx.strokeStyle =
                    index === 0
                        ? "#38bdf8"
                        : "rgba(125, 211, 252, 0.34)";

                ctx.stroke();

                const columns =
                    7;

                const rows =
                    5;

                const cellWidth =
                    (
                        frameWidth -
                        18
                    ) /
                    columns;

                const cellHeight =
                    (
                        frameHeight -
                        46
                    ) /
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
                        const repeated =
                            (
                                column +
                                row +
                                index
                            ) %
                            4 !==
                            0;

                        const removed =
                            (
                                repeated &&
                                values.spatial >
                                45
                            ) ||
                            (
                                index > 0 &&
                                values.temporal >
                                50 &&
                                row < 3
                            );

                        const alpha =
                            removed
                                ? 0.18
                                : 0.78;

                        ctx.fillStyle =
                            "hsla(" +
                            (
                                185 +
                                column *
                                5 +
                                row *
                                3
                            ) +
                            ", 80%, 60%, " +
                            alpha +
                            ")";

                        ctx.fillRect(
                            x +
                            9 +
                            column *
                            cellWidth,
                            y +
                            12 +
                            row *
                            cellHeight,
                            cellWidth -
                            2,
                            cellHeight -
                            2
                        );
                    }
                }

                ctx.fillStyle =
                    "rgba(240, 249, 255, 0.88)";

                ctx.font =
                    "700 8px Segoe UI";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "CUADRO " +
                    (
                        index +
                        1
                    ),
                    x +
                    frameWidth /
                    2,
                    y +
                    frameHeight -
                    16
                );

                if (values.quality < 50) {
                    ctx.fillStyle =
                        "rgba(251, 113, 133, 0.32)";

                    for (
                        let artifact = 0;
                        artifact < 5;
                        artifact += 1
                    ) {
                        ctx.fillRect(
                            x +
                            10 +
                            (
                                artifact *
                                31 +
                                index *
                                17
                            ) %
                            Math.max(
                                12,
                                frameWidth -
                                30
                            ),
                            y +
                            12 +
                            (
                                artifact *
                                19 +
                                index *
                                11
                            ) %
                            Math.max(
                                12,
                                frameHeight -
                                50
                            ),
                            14,
                            10
                        );
                    }
                }

                ctx.restore();
            }
        }

        function drawMeters(
            panel,
            values
        ) {
            const meters = [
                [
                    "Redundancia espacial reducida",
                    values.spatial,
                    "#c084fc"
                ],
                [
                    "Redundancia temporal reducida",
                    values.temporal,
                    "#38bdf8"
                ],
                [
                    "Calidad relativa",
                    values.quality,
                    values.quality >= 70
                        ? "#34d399"
                        : values.quality >= 45
                            ? "#fbbf24"
                            : "#fb7185"
                ]
            ];

            const x =
                panel.x +
                34;

            const width =
                panel.w -
                68;

            meters.forEach(
                function (meter, index) {
                    const y =
                        panel.y +
                        70 +
                        index *
                        82;

                    ctx.save();

                    ctx.fillStyle =
                        "rgba(148, 163, 184, 0.16)";

                    roundedRectPath(
                        x,
                        y,
                        width,
                        24,
                        12
                    );

                    ctx.fill();

                    ctx.fillStyle =
                        meter[2] +
                        "88";

                    roundedRectPath(
                        x,
                        y,
                        width *
                        meter[1] /
                        100,
                        24,
                        12
                    );

                    ctx.fill();

                    ctx.fillStyle =
                        "rgba(240, 249, 255, 0.90)";

                    ctx.font =
                        "700 9px Segoe UI";

                    ctx.textAlign =
                        "left";

                    ctx.fillText(
                        meter[0],
                        x,
                        y -
                        10
                    );

                    ctx.textAlign =
                        "right";

                    ctx.fillText(
                        fmt(
                            meter[1],
                            0
                        ) +
                        " %",
                        x +
                        width,
                        y -
                        10
                    );

                    ctx.restore();
                }
            );

            ctx.save();

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI";

            textWrap(
                "Los porcentajes son índices didácticos y no el rendimiento de un códec real.",
                panel.x +
                24,
                panel.y +
                panel.h -
                50,
                panel.w -
                48,
                13,
                3
            );

            ctx.restore();
        }

        function drawMpegScene(values) {
            drawHeader(
                "Compresión MPEG: redundancia, bitrate y calidad",
                "Espacial actúa dentro del cuadro; temporal entre cuadros consecutivos.",
                "Bitrate total = " +
                fmt(
                    values.total,
                    3
                ) +
                " Mbps",
                "#c084fc"
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 390
                        : 350
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 430
                        : 390
            };

            const thirdPanel = {
                x:
                    14,

                y:
                    secondPanel.y +
                    secondPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 430
                        : 150
            };

            drawPanel(
                firstPanel,
                "CUADROS DE VIDEO",
                "#38bdf8",
                "zonas repetidas y cambios"
            );

            drawPanel(
                secondPanel,
                "COMPRESIÓN Y CALIDAD",
                "#c084fc",
                "modelo educativo normalizado"
            );

            drawPanel(
                thirdPanel,
                "FLUJO FUNCIONAL",
                "#fbbf24",
                "sin transformadas matemáticas"
            );

            drawFrameGrid(
                firstPanel,
                values
            );

            drawMeters(
                secondPanel,
                values
            );

            drawLinearBlocks(
                thirdPanel,
                [
                    [
                        "Video sin comprimir",
                        "demasiados datos",
                        "#38bdf8"
                    ],
                    [
                        "Compresión espacial",
                        "dentro del cuadro",
                        "#c084fc"
                    ],
                    [
                        "Compresión temporal",
                        "entre cuadros",
                        "#60a5fa"
                    ],
                    [
                        "Bitrate",
                        "bits por segundo",
                        "#fbbf24"
                    ],
                    [
                        "Calidad",
                        "detalle o artefactos",
                        "#34d399"
                    ]
                ],
                "#c084fc"
            );
        }

        function drawPacketBox(
            x,
            y,
            width,
            height,
            key,
            focused,
            continuity
        ) {
            const packet =
                packets[key];

            ctx.save();

            roundedRectPath(
                x,
                y,
                width,
                height,
                8
            );

            ctx.fillStyle =
                packet.color +
                (
                    focused
                        ? "33"
                        : "18"
                );

            ctx.fill();

            ctx.strokeStyle =
                focused
                    ? "#fbbf24"
                    : packet.color;

            ctx.lineWidth =
                focused
                    ? 2.4
                    : 1.1;

            ctx.stroke();

            const headerWidth =
                width *
                0.30;

            ctx.fillStyle =
                "rgba(2, 10, 24, 0.62)";

            ctx.fillRect(
                x +
                2,
                y +
                2,
                headerWidth,
                height -
                4
            );

            ctx.textAlign =
                "left";

            ctx.fillStyle =
                packet.color;

            ctx.font =
                "800 8px Segoe UI";

            ctx.fillText(
                packet.name,
                x +
                8,
                y +
                18
            );

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.88)";

            ctx.font =
                "700 7px Consolas";

            ctx.fillText(
                "0x47",
                x +
                8,
                y +
                34
            );

            ctx.fillText(
                packet.pid,
                x +
                8,
                y +
                49
            );

            ctx.fillStyle =
                packet.color +
                "66";

            ctx.fillRect(
                x +
                headerWidth +
                6,
                y +
                10,
                width -
                headerWidth -
                14,
                height -
                20
            );

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.88)";

            ctx.font =
                "700 7px Segoe UI";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "CARGA ÚTIL",
                x +
                headerWidth +
                (
                    width -
                    headerWidth
                ) /
                2,
                y +
                height /
                2 +
                3
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.76)";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "CC " +
                continuity,
                x +
                width -
                7,
                y +
                height -
                7
            );

            ctx.restore();
        }

        function drawTsGrid(panel) {
            const sequence = [
                "pat",
                "pmt",
                "video",
                "audio",
                "video",
                "data",
                "video",
                "audio",
                "video",
                "data"
            ];

            const columns =
                W < 720
                    ? 2
                    : 5;

            const rows =
                Math.ceil(
                    sequence.length /
                    columns
                );

            const gap =
                12;

            const packetWidth =
                (
                    panel.w -
                    40 -
                    gap *
                    (
                        columns -
                        1
                    )
                ) /
                columns;

            const packetHeight =
                (
                    panel.h -
                    84 -
                    gap *
                    (
                        rows -
                        1
                    )
                ) /
                rows;

            sequence.forEach(
                function (key, index) {
                    const column =
                        index %
                        columns;

                    const row =
                        Math.floor(
                            index /
                            columns
                        );

                    const x =
                        panel.x +
                        20 +
                        column *
                        (
                            packetWidth +
                            gap
                        );

                    const y =
                        panel.y +
                        52 +
                        row *
                        (
                            packetHeight +
                            gap
                        );

                    drawPacketBox(
                        x,
                        y,
                        packetWidth,
                        packetHeight,
                        key,
                        key ===
                            ui.packet.value,
                        index %
                        16
                    );
                }
            );

            const markerX =
                panel.x +
                20 +
                (
                    panel.w -
                    40
                ) *
                (
                    elapsed *
                    0.16 %
                    1
                );

            ctx.save();

            ctx.strokeStyle =
                "rgba(251, 191, 36, 0.72)";

            ctx.setLineDash(
                [
                    5,
                    5
                ]
            );

            ctx.beginPath();

            ctx.moveTo(
                markerX,
                panel.y +
                45
            );

            ctx.lineTo(
                markerX,
                panel.y +
                panel.h -
                20
            );

            ctx.stroke();
            ctx.restore();
        }

        function drawTsScene(values) {
            const packet =
                packets[
                    ui.packet.value
                ];

            drawHeader(
                "Transport Stream: paquetes, PID y multiplexación",
                "Cada paquete tiene cabecera funcional y carga útil simplificada.",
                "188 bytes = 1504 bits · " +
                fmt(
                    values.pps,
                    0
                ) +
                " paquetes/s",
                "#fbbf24"
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 700
                        : 520
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 430
                        : 190
            };

            drawPanel(
                firstPanel,
                "PAQUETES TS MULTIPLEXADOS",
                packet.color,
                "cabecera, PID y carga útil"
            );

            drawPanel(
                secondPanel,
                "ORGANIZACIÓN FUNCIONAL",
                "#c084fc",
                "ES → PES → TS"
            );

            drawTsGrid(
                firstPanel
            );

            drawLinearBlocks(
                secondPanel,
                [
                    [
                        "ES",
                        "audio o video comprimido",
                        "#38bdf8"
                    ],
                    [
                        "PES",
                        "flujo elemental empaquetado",
                        "#c084fc"
                    ],
                    [
                        "TS",
                        "combina varios PES",
                        "#fbbf24"
                    ],
                    [
                        "PAT / PMT",
                        "ubican programas y PID",
                        "#fb923c"
                    ],
                    [
                        "Receptor",
                        "demultiplexa y sincroniza",
                        "#34d399"
                    ]
                ],
                "#fbbf24"
            );
        }

        function drawTimeline(
            panel,
            values
        ) {
            const x =
                panel.x +
                42;

            const y =
                panel.y +
                110;

            const width =
                panel.w -
                84;

            const height =
                86;

            const guardWidth =
                width *
                values.tg /
                values.tt;

            const usefulWidth =
                width -
                guardWidth;

            ctx.save();

            ctx.fillStyle =
                "rgba(52, 211, 153, 0.24)";

            ctx.fillRect(
                x,
                y,
                guardWidth,
                height
            );

            ctx.fillStyle =
                "rgba(56, 189, 248, 0.24)";

            ctx.fillRect(
                x +
                guardWidth,
                y,
                usefulWidth,
                height
            );

            ctx.strokeStyle =
                "#34d399";

            ctx.strokeRect(
                x,
                y,
                guardWidth,
                height
            );

            ctx.strokeStyle =
                "#38bdf8";

            ctx.strokeRect(
                x +
                guardWidth,
                y,
                usefulWidth,
                height
            );

            ctx.textAlign =
                "center";

            ctx.fillStyle =
                "#a7f3d0";

            ctx.font =
                "800 9px Segoe UI";

            ctx.fillText(
                "GUARDA",
                x +
                guardWidth /
                2,
                y +
                height /
                2 -
                5
            );

            ctx.font =
                "700 8px Segoe UI";

            ctx.fillText(
                fmt(
                    values.tg,
                    4
                ) +
                " ms",
                x +
                guardWidth /
                2,
                y +
                height /
                2 +
                13
            );

            ctx.fillStyle =
                "#bae6fd";

            ctx.font =
                "800 9px Segoe UI";

            ctx.fillText(
                "SÍMBOLO ÚTIL",
                x +
                guardWidth +
                usefulWidth /
                2,
                y +
                height /
                2 -
                5
            );

            ctx.font =
                "700 8px Segoe UI";

            ctx.fillText(
                fmt(
                    values.tu,
                    4
                ) +
                " ms",
                x +
                guardWidth +
                usefulWidth /
                2,
                y +
                height /
                2 +
                13
            );

            const echoX =
                x +
                width *
                values.echo /
                values.tt;

            ctx.strokeStyle =
                values.protected
                    ? "#34d399"
                    : "#fb7185";

            ctx.lineWidth =
                2.2;

            ctx.beginPath();

            ctx.moveTo(
                echoX,
                y -
                35
            );

            ctx.lineTo(
                echoX,
                y +
                height +
                28
            );

            ctx.stroke();

            ctx.fillStyle =
                values.protected
                    ? "#a7f3d0"
                    : "#fda4af";

            ctx.font =
                "800 9px Segoe UI";

            ctx.fillText(
                "ECO " +
                fmt(
                    values.echo,
                    4
                ) +
                " ms",
                echoX,
                y -
                45
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 8px Segoe UI";

            ctx.fillText(
                "Ttotal = " +
                fmt(
                    values.tt,
                    4
                ) +
                " ms",
                x +
                width /
                2,
                y +
                height +
                48
            );

            ctx.restore();
        }

        function drawEchoWaves(
            panel,
            values
        ) {
            const plot = {
                x:
                    panel.x +
                    52,

                y:
                    panel.y +
                    70,

                w:
                    panel.w -
                    76,

                h:
                    panel.h -
                    126
            };

            ctx.save();

            ctx.strokeStyle =
                "rgba(125, 211, 252, 0.08)";

            for (
                let index = 0;
                index <= 8;
                index += 1
            ) {
                const x =
                    plot.x +
                    plot.w *
                    index /
                    8;

                ctx.beginPath();
                ctx.moveTo(x, plot.y);
                ctx.lineTo(x, plot.y + plot.h);
                ctx.stroke();
            }

            for (
                let index = 0;
                index <= 4;
                index += 1
            ) {
                const y =
                    plot.y +
                    plot.h *
                    index /
                    4;

                ctx.beginPath();
                ctx.moveTo(plot.x, y);
                ctx.lineTo(plot.x + plot.w, y);
                ctx.stroke();
            }

            function drawWave(
                offset,
                amplitude,
                color
            ) {
                ctx.beginPath();

                for (
                    let index = 0;
                    index <= 500;
                    index += 1
                ) {
                    const ratio =
                        index /
                        500;

                    const x =
                        plot.x +
                        ratio *
                        plot.w;

                    const shifted =
                        ratio -
                        offset;

                    const enabled =
                        shifted >= 0 &&
                        shifted <= 1
                            ? 1
                            : 0;

                    const y =
                        plot.y +
                        plot.h /
                        2 -
                        Math.sin(
                            TWO_PI *
                            9 *
                            shifted +
                            elapsed *
                            1.5
                        ) *
                        amplitude *
                        enabled;

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.strokeStyle =
                    color;

                ctx.lineWidth =
                    1.8;

                ctx.stroke();
            }

            drawWave(
                0,
                plot.h *
                0.28,
                "#38bdf8"
            );

            drawWave(
                clamp(
                    values.echo /
                    Math.max(
                        values.tt,
                        0.001
                    ),
                    0,
                    0.95
                ),
                plot.h *
                0.17,
                values.protected
                    ? "#34d399"
                    : "#fb7185"
            );

            ctx.font =
                "700 8px Segoe UI";

            ctx.textAlign =
                "left";

            ctx.fillStyle =
                "#38bdf8";

            ctx.fillText(
                "Señal directa",
                plot.x,
                plot.y -
                14
            );

            ctx.fillStyle =
                values.protected
                    ? "#34d399"
                    : "#fb7185";

            ctx.fillText(
                "Eco o reflexión",
                plot.x +
                110,
                plot.y -
                14
            );

            ctx.restore();
        }

        function drawGuardScene(values) {
            drawHeader(
                "Intervalo de guarda y multitrayectoria",
                "Las ondas representan valores instantáneos respecto al tiempo.",
                "η = " +
                fmt(
                    values.eff *
                    100,
                    2
                ) +
                " %",
                "#34d399"
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 380
                        : 330
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 470
                        : 400
            };

            const thirdPanel = {
                x:
                    14,

                y:
                    secondPanel.y +
                    secondPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 300
                        : 220
            };

            drawPanel(
                firstPanel,
                "SÍMBOLO OFDM",
                "#34d399",
                "Ttotal = Tᵤ + Tᵍ"
            );

            drawPanel(
                secondPanel,
                "SEÑAL DIRECTA Y ECO",
                values.protected
                    ? "#38bdf8"
                    : "#fb7185",
                "comparación temporal"
            );

            drawPanel(
                thirdPanel,
                "RESULTADO",
                values.protected
                    ? "#34d399"
                    : "#fb7185",
                "protección o posible interferencia"
            );

            drawTimeline(
                firstPanel,
                values
            );

            drawEchoWaves(
                secondPanel,
                values
            );

            drawCards(
                thirdPanel,
                [
                    {
                        title:
                            values.protected
                                ? "ECO TOLERADO"
                                : "ECO EXCESIVO",

                        subtitle:
                            values.protected
                                ? "Retardo ≤ Tᵍ"
                                : "Retardo > Tᵍ",

                        body:
                            values.protected
                                ? "El eco permanece dentro del margen de guarda."
                                : "El eco puede invadir otro símbolo.",

                        color:
                            values.protected
                                ? "#34d399"
                                : "#fb7185"
                    },
                    {
                        title:
                            "COMPROMISO",

                        subtitle:
                            fmt(
                                values.eff *
                                100,
                                2
                            ) +
                            " % útil",

                        body:
                            "Una guarda mayor protege más, pero reduce eficiencia temporal.",

                        color:
                            "#fbbf24"
                    }
                ]
            );
        }

        function drawRelativeBar(
            x,
            y,
            width,
            label,
            value,
            color
        ) {
            ctx.save();

            ctx.fillStyle =
                "rgba(148, 163, 184, 0.16)";

            roundedRectPath(
                x,
                y,
                width,
                20,
                10
            );

            ctx.fill();

            ctx.fillStyle =
                color +
                "88";

            roundedRectPath(
                x,
                y,
                width *
                value /
                5,
                20,
                10
            );

            ctx.fill();

            ctx.fillStyle =
                "rgba(240, 249, 255, 0.90)";

            ctx.font =
                "700 8px Segoe UI";

            ctx.textAlign =
                "left";

            ctx.fillText(
                label,
                x,
                y -
                9
            );

            ctx.textAlign =
                "right";

            ctx.fillText(
                value +
                " / 5",
                x +
                width,
                y -
                9
            );

            ctx.restore();
        }

        function drawMediaScene(values) {
            const selectedMedium =
                media[
                    ui.medium.value
                ];

            drawHeader(
                "Medios de distribución de televisión digital",
                "La selección manual permanece fija hasta que el estudiante cambie el medio.",
                selectedMedium.name +
                " · retardo " +
                selectedMedium.delay +
                "/5 · cobertura " +
                selectedMedium.coverage +
                "/5",
                selectedMedium.color
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 430
                        : 230
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 610
                        : 460
            };

            const thirdPanel = {
                x:
                    14,

                y:
                    secondPanel.y +
                    secondPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 230
                        : 170
            };

            drawPanel(
                firstPanel,
                "CADENA DEL MEDIO",
                selectedMedium.color,
                selectedMedium.transport
            );

            drawPanel(
                secondPanel,
                "COMPARACIÓN FUNCIONAL",
                "#c084fc",
                "infraestructura, ventaja y limitación"
            );

            drawPanel(
                thirdPanel,
                "RETARDO Y COBERTURA",
                "#fbbf24",
                "escala cualitativa"
            );

            drawLinearBlocks(
                firstPanel,
                [
                    [
                        "Servicio digital",
                        "audio, video y datos",
                        "#38bdf8"
                    ],
                    [
                        selectedMedium.name,
                        selectedMedium.transport,
                        selectedMedium.color
                    ],
                    [
                        selectedMedium.receiver,
                        "equipo de recepción",
                        "#fbbf24"
                    ],
                    [
                        "Pantalla y audio",
                        "servicio recuperado",
                        "#34d399"
                    ]
                ],
                selectedMedium.color
            );

            drawCards(
                secondPanel,
                [
                    {
                        title:
                            "INFRAESTRUCTURA",

                        subtitle:
                            selectedMedium.name,

                        body:
                            selectedMedium.infra,

                        color:
                            selectedMedium.color
                    },
                    {
                        title:
                            "VENTAJA",

                        subtitle:
                            "Función principal",

                        body:
                            selectedMedium.advantage,

                        color:
                            "#34d399"
                    },
                    {
                        title:
                            "LIMITACIÓN",

                        subtitle:
                            "Falla típica",

                        body:
                            selectedMedium.limitation,

                        color:
                            "#fb7185"
                    },
                    {
                        title:
                            "CAPACIDAD",

                        subtitle:
                            fmt(
                                values.capacity,
                                2
                            ) +
                            " Mbps disponibles",

                        body:
                            selectedMedium.name === "Web TV"
                                ? (
                                    values.streamOK
                                        ? "Supera el requerimiento con margen."
                                        : "Es menor al requerimiento y puede aparecer buffering."
                                )
                                : "Referencia educativa, no diseño profesional.",

                        color:
                            values.streamOK
                                ? "#38bdf8"
                                : "#fbbf24"
                    }
                ]
            );

            drawRelativeBar(
                thirdPanel.x +
                34,
                thirdPanel.y +
                70,
                thirdPanel.w -
                68,
                "Retardo cualitativo",
                selectedMedium.delay,
                selectedMedium.color
            );

            drawRelativeBar(
                thirdPanel.x +
                34,
                thirdPanel.y +
                122,
                thirdPanel.w -
                68,
                "Cobertura o alcance cualitativo",
                selectedMedium.coverage,
                "#34d399"
            );
        }

        function drawEvaluationScene() {
            const selectedScenario =
                scenarios[
                    Number(
                        ui.scenario.value
                    )
                ];

            drawHeader(
                "Evaluación integradora de diagnóstico",
                "El caso seleccionado permanece fijo hasta que el estudiante lo cambie.",
                "Caso " +
                (
                    Number(
                        ui.scenario.value
                    ) +
                    1
                ) +
                " de " +
                scenarios.length,
                "#fb7185"
            );

            const mobile =
                W < 720;

            const firstPanel = {
                x:
                    14,

                y:
                    78,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 420
                        : 300
            };

            const secondPanel = {
                x:
                    14,

                y:
                    firstPanel.y +
                    firstPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 490
                        : 230
            };

            const thirdPanel = {
                x:
                    14,

                y:
                    secondPanel.y +
                    secondPanel.h +
                    16,

                w:
                    W -
                    28,

                h:
                    mobile
                        ? 320
                        : 230
            };

            drawPanel(
                firstPanel,
                "CASO SELECCIONADO",
                "#fb7185",
                "analice el síntoma"
            );

            drawPanel(
                secondPanel,
                "MAPA DE BLOQUES",
                "#38bdf8",
                "posibles ubicaciones de la falla"
            );

            drawPanel(
                thirdPanel,
                "CRITERIO DE DIAGNÓSTICO",
                "#fbbf24",
                "observar, ubicar y verificar"
            );

            ctx.save();

            ctx.textAlign =
                "left";

            ctx.fillStyle =
                "#fb7185";

            ctx.font =
                "800 12px Segoe UI";

            ctx.fillText(
                "SÍNTOMA",
                firstPanel.x +
                24,
                firstPanel.y +
                70
            );

            ctx.fillStyle =
                "#f0f9ff";

            ctx.font =
                "700 17px Segoe UI";

            textWrap(
                selectedScenario.text,
                firstPanel.x +
                24,
                firstPanel.y +
                104,
                firstPanel.w -
                48,
                25,
                7
            );

            ctx.fillStyle =
                "rgba(199, 220, 235, 0.78)";

            ctx.font =
                "600 9px Segoe UI";

            textWrap(
                "El bloque correcto se revela únicamente después de verificar la respuesta.",
                firstPanel.x +
                24,
                firstPanel.y +
                firstPanel.h -
                70,
                firstPanel.w -
                48,
                14,
                4
            );

            ctx.restore();

            drawLinearBlocks(
                secondPanel,
                [
                    [
                        "MPEG",
                        "compresión y bitrate",
                        "#c084fc"
                    ],
                    [
                        "TS",
                        "PID y multiplexación",
                        "#fbbf24"
                    ],
                    [
                        "Guarda",
                        "eco y multitrayectoria",
                        "#34d399"
                    ],
                    [
                        "Medio",
                        "IP, cable o satélite",
                        "#38bdf8"
                    ],
                    [
                        "Receptor",
                        "demultiplexa y decodifica",
                        "#60a5fa"
                    ]
                ],
                "#fb7185"
            );

            drawCards(
                thirdPanel,
                [
                    {
                        title:
                            "1. OBSERVAR",

                        subtitle:
                            "Qué funciona",

                        body:
                            "Aplicación, video, audio y otros equipos.",

                        color:
                            "#38bdf8"
                    },
                    {
                        title:
                            "2. UBICAR",

                        subtitle:
                            "Bloque probable",

                        body:
                            "Artefactos, PID, eco, buffering, conector o alineación.",

                        color:
                            "#fbbf24"
                    },
                    {
                        title:
                            "3. VERIFICAR",

                        subtitle:
                            "Prueba básica",

                        body:
                            "Revisar bitrate, continuidad, red, cableado o recepción.",

                        color:
                            "#34d399"
                    }
                ]
            );
        }

        function drawFooter() {
            ctx.save();

            ctx.fillStyle =
                "rgba(159, 181, 202, 0.68)";

            ctx.font =
                "500 9px Segoe UI";

            ctx.textAlign =
                "right";

            ctx.fillText(
                "Modelo didáctico · sin sintaxis completa, routing avanzado, HFC profesional, CDN o presupuesto satelital.",
                W -
                18,
                H -
                14
            );

            ctx.restore();
        }

        function draw() {
            drawBackground();

            const values =
                data();

            if (!values.valid) {
                ctx.fillStyle =
                    "#fb7185";

                ctx.font =
                    "700 17px Segoe UI";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "Revise los bitrates, tiempos y capacidad.",
                    W /
                    2,
                    H /
                    2
                );

                return;
            }

            if (current === "chain") {
                drawChainScene();
            } else if (current === "mpeg") {
                drawMpegScene(values);
            } else if (current === "ts") {
                drawTsScene(values);
            } else if (current === "guard") {
                drawGuardScene(values);
            } else if (current === "media") {
                drawMediaScene(values);
            } else {
                drawEvaluationScene();
            }

            drawFooter();
        }

        function animate(now) {
            const deltaTime =
                Math.min(
                    (
                        now -
                        last
                    ) /
                    1000,
                    0.05
                );

            last =
                now;

            if (!paused) {
                elapsed +=
                    deltaTime *
                    Number(
                        ui.speed.value
                    );

                if (elapsed > 10000) {
                    elapsed =
                        0;
                }
            }

            draw();

            requestAnimationFrame(
                animate
            );
        }

        tabs.forEach(
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

        presets.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        preset(
                            button.dataset.preset
                        );
                    }
                );
            }
        );

        [
            ui.video,
            ui.audio,
            ui.data,
            ui.spatial,
            ui.temporal,
            ui.ts,
            ui.packet,
            ui.tu,
            ui.ratio,
            ui.echo,
            ui.medium,
            ui.capacity,
            ui.scenario,
            ui.diagnosis,
            ui.speed
        ].forEach(
            function (element) {
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

        ui.scenario.addEventListener(
            "change",
            function () {
                ui.feedback.className =
                    "feedback";

                ui.feedback.textContent =
                    "Seleccione el origen probable y pulse “Verificar respuesta”.";
            }
        );

        ui.diagnosis.addEventListener(
            "change",
            function () {
                ui.feedback.className =
                    "feedback";

                ui.feedback.textContent =
                    "Pulse “Verificar respuesta” para comprobar el diagnóstico.";
            }
        );

        ui.check.addEventListener(
            "click",
            verify
        );

        ui.pause.addEventListener(
            "click",
            pauseSimulation
        );

        ui.resume.addEventListener(
            "click",
            resumeSimulation
        );

        ui.reset.addEventListener(
            "click",
            resetSimulation
        );

        window.addEventListener(
            "resize",
            resize
        );

        resize();
        update();

        requestAnimationFrame(
            function (time) {
                last =
                    time;

                animate(time);
            }
        );
    
