        "use strict";

        /*
         * Archivo sugerido:
         * 02_sistema_medios_transmision.html
         *
         * SIT-400 — Clase 2
         * Elementos del sistema y medios de transmisión.
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

        const canvasTitle =
            document.getElementById("canvasTitle");

        const simulationStatus =
            document.getElementById("simulationStatus");

        const blocksControls =
            document.getElementById("blocksControls");

        const mediaControls =
            document.getElementById("mediaControls");

        const caseControls =
            document.getElementById("caseControls");

        const systemSelect =
            document.getElementById("systemSelect");

        const channelEffect =
            document.getElementById("channelEffect");

        const animationSpeed =
            document.getElementById("animationSpeed");

        const animationSpeedDisplay =
            document.getElementById("animationSpeedDisplay");

        const mediumSpeed =
            document.getElementById("mediumSpeed");

        const mediumSpeedDisplay =
            document.getElementById("mediumSpeedDisplay");

        const blockSelector =
            document.getElementById("blockSelector");

        const mediumSelector =
            document.getElementById("mediumSelector");

        const caseSelect =
            document.getElementById("caseSelect");

        const caseMediumSelect =
            document.getElementById("caseMediumSelect");

        const evaluateButton =
            document.getElementById("evaluateButton");

        const pauseButton =
            document.getElementById("pauseButton");

        const continueButton =
            document.getElementById("continueButton");

        const restartButton =
            document.getElementById("restartButton");

        const detailPanel =
            document.getElementById("detailPanel");

        const detailTitle =
            document.getElementById("detailTitle");

        const detailGrid =
            document.getElementById("detailGrid");

        const mediaDetailPanel =
            document.getElementById("mediaDetailPanel");

        const mediaDetailTitle =
            document.getElementById("mediaDetailTitle");

        const mediaDetailGrid =
            document.getElementById("mediaDetailGrid");

        const caseDetailPanel =
            document.getElementById("caseDetailPanel");

        const caseDetailTitle =
            document.getElementById("caseDetailTitle");

        const caseDetailGrid =
            document.getElementById("caseDetailGrid");

        const caseResult =
            document.getElementById("caseResult");

        const explanation =
            document.getElementById("explanation");

        const technicalNote =
            document.getElementById("technicalNote");

        const metricLabels = [
            document.getElementById("metricLabel1"),
            document.getElementById("metricLabel2"),
            document.getElementById("metricLabel3"),
            document.getElementById("metricLabel4")
        ];

        const metricValues = [
            document.getElementById("metricValue1"),
            document.getElementById("metricValue2"),
            document.getElementById("metricValue3"),
            document.getElementById("metricValue4")
        ];

        const blocks = [
            {
                key: "source",
                abbreviation: "F",
                shortTitle: "Fuente",
                title: "Fuente de información",
                color: "#38bdf8",
                function:
                    "Origina la información que se desea comunicar.",
                input:
                    "Un hecho, una persona, una escena, una magnitud física o una orden.",
                output:
                    "Información que todavía puede no estar en una forma adecuada para transmitirse.",
                failure:
                    "La fuente no genera información válida o el proceso que se observa no existe.",
                symptom:
                    "No hay contenido útil para transmitir o el dato original es incorrecto."
            },
            {
                key: "inputTransducer",
                abbreviation: "TE",
                shortTitle: "Transductor entrada",
                title: "Transductor de entrada",
                color: "#22d3ee",
                function:
                    "Convierte una magnitud física en una señal eléctrica o en datos utilizables.",
                input:
                    "Sonido, luz, temperatura, presión u otra magnitud física.",
                output:
                    "Tensión, corriente, señal eléctrica o datos que representan la magnitud.",
                failure:
                    "El transductor está desconectado, dañado o no responde a la magnitud física.",
                symptom:
                    "La señal de entrada es nula, incorrecta o no cambia aunque la fuente sí cambie."
            },
            {
                key: "transmitter",
                abbreviation: "TX",
                shortTitle: "Transmisor",
                title: "Transmisor",
                color: "#34d399",
                function:
                    "Prepara, acondiciona y adapta la señal para enviarla por el medio.",
                input:
                    "Señal eléctrica o datos que contienen la información.",
                output:
                    "Señal apta para el canal: eléctrica, óptica o electromagnética.",
                failure:
                    "No entrega señal, entrega una señal débil o no la adapta correctamente al medio.",
                symptom:
                    "El receptor no recibe o recibe una señal que no puede procesar."
            },
            {
                key: "channel",
                abbreviation: "M",
                shortTitle: "Canal o medio",
                title: "Canal o medio de transmisión",
                color: "#fbbf24",
                function:
                    "Proporciona el recorrido por donde se propaga la señal.",
                input:
                    "Señal transmitida adecuada al medio.",
                output:
                    "Señal recibida, posiblemente atenuada, ruidosa, interferida, distorsionada o retardada.",
                failure:
                    "Cable dañado, fibra doblada, obstrucción, interferencia, distancia excesiva o pérdida del enlace.",
                symptom:
                    "Señal débil, ruido, errores, cortes o pérdida total de comunicación."
            },
            {
                key: "receiver",
                abbreviation: "RX",
                shortTitle: "Receptor",
                title: "Receptor",
                color: "#c084fc",
                function:
                    "Capta, selecciona y procesa la señal para recuperar el mensaje.",
                input:
                    "Señal recibida desde el canal o desde la antena receptora.",
                output:
                    "Señal eléctrica o datos recuperados para la etapa de salida.",
                failure:
                    "No selecciona, no amplifica, no convierte o no procesa correctamente.",
                symptom:
                    "La señal puede estar presente, pero el mensaje no se recupera."
            },
            {
                key: "outputTransducer",
                abbreviation: "TS",
                shortTitle: "Transductor salida",
                title: "Transductor de salida",
                color: "#a78bfa",
                function:
                    "Convierte la señal recuperada en sonido, imagen, luz, movimiento u otra forma útil.",
                input:
                    "Señal eléctrica o datos recuperados por el receptor.",
                output:
                    "Sonido, imagen, luz o acción física.",
                failure:
                    "Altavoz, pantalla, LED o actuador desconectado o dañado.",
                symptom:
                    "El receptor funciona, pero no aparece sonido, imagen, luz o movimiento."
            },
            {
                key: "destination",
                abbreviation: "D",
                shortTitle: "Destino",
                title: "Destino",
                color: "#fb7185",
                function:
                    "Interpreta o utiliza la información recuperada.",
                input:
                    "Mensaje recuperado o resultado físico entregado por la salida.",
                output:
                    "Comprensión, decisión, registro, supervisión o acción.",
                failure:
                    "El usuario o sistema no interpreta, registra o utiliza el mensaje.",
                symptom:
                    "La señal llega, pero no produce la respuesta esperada."
            }
        ];

        const systems = {
            radioFm: {
                title: "Radio FM",
                subtitle:
                    "La voz o música se convierte, se transmite por el espacio y vuelve a convertirse en sonido.",
                signalSequence:
                    "Acústica → eléctrica → electromagnética → eléctrica → acústica",
                medium:
                    "Espacio libre",
                examples: [
                    "Locutor, voz o música",
                    "Micrófono",
                    "Equipo transmisor de radio",
                    "Espacio entre antenas",
                    "Radio FM",
                    "Altavoz",
                    "Oyente"
                ]
            },

            camera: {
                title: "Cámara remota por radio",
                subtitle:
                    "Una escena se convierte en señal o datos de imagen y se transmite mediante un enlace inalámbrico.",
                signalSequence:
                    "Óptica → eléctrica/digital → electromagnética → eléctrica/digital → óptica",
                medium:
                    "Aire o espacio libre",
                examples: [
                    "Escena observada",
                    "Cámara",
                    "Equipo de envío inalámbrico",
                    "Aire o espacio libre",
                    "Equipo receptor",
                    "Pantalla",
                    "Operador"
                ]
            },

            temperature: {
                title: "Telemetría de temperatura por cable",
                subtitle:
                    "La temperatura se convierte en una señal eléctrica que se transporta mediante conductores.",
                signalSequence:
                    "Térmica → eléctrica → eléctrica → visual",
                medium:
                    "Cable metálico",
                examples: [
                    "Temperatura del proceso",
                    "Sensor de temperatura",
                    "Equipo transmisor",
                    "Par trenzado o cable metálico",
                    "Módulo receptor",
                    "Pantalla o indicador",
                    "Operador o sistema de control"
                ]
            },

            fiberLink: {
                title: "Enlace de datos por fibra óptica",
                subtitle:
                    "Los datos eléctricos se convierten en luz, se guían por la fibra y vuelven a convertirse en datos eléctricos.",
                signalSequence:
                    "Eléctrica/digital → óptica → eléctrica/digital",
                medium:
                    "Fibra óptica",
                examples: [
                    "Sistema que genera datos",
                    "Interfaz de entrada",
                    "Emisor óptico",
                    "Fibra óptica",
                    "Detector y receptor óptico",
                    "Interfaz o pantalla",
                    "Usuario o sistema destino"
                ]
            }
        };

        const channelEffects = {
            none: {
                title: "Sin perturbación",
                description:
                    "La señal se muestra sin alteraciones para observar el recorrido funcional.",
                color: "#34d399"
            },

            attenuation: {
                title: "Atenuación",
                description:
                    "La señal llega con menor nivel después de recorrer el canal.",
                color: "#fbbf24"
            },

            noise: {
                title: "Ruido",
                description:
                    "Se agregan variaciones no deseadas a la señal útil.",
                color: "#fb7185"
            },

            interference: {
                title: "Interferencia",
                description:
                    "Una fuente externa identificable afecta la señal.",
                color: "#f97316"
            },

            distortion: {
                title: "Distorsión",
                description:
                    "La forma original de la señal cambia durante el recorrido.",
                color: "#c084fc"
            },

            delay: {
                title: "Retardo",
                description:
                    "La señal necesita más tiempo para llegar al receptor.",
                color: "#60a5fa"
            }
        };

        const media = {
            twistedPair: {
                title: "Par trenzado",
                shortTitle: "Par trenzado",
                classification: "Medio guiado",
                physicalMedium:
                    "Conductores de cobre aislados y trenzados",
                signal:
                    "Señal eléctrica",
                distance:
                    "Distancias internas o limitadas según la aplicación",
                interference:
                    "Puede ser sensible si la instalación es deficiente; el trenzado ayuda a reducir perturbaciones",
                advantage:
                    "Bajo costo, flexibilidad y facilidad de instalación",
                limitation:
                    "Distancia limitada y susceptibilidad a interferencia",
                application:
                    "Redes locales y telefonía",
                infrastructure:
                    "Cableado físico entre los extremos",
                color: "#38bdf8"
            },

            coaxial: {
                title: "Cable coaxial",
                shortTitle: "Coaxial",
                classification: "Medio guiado",
                physicalMedium:
                    "Conductor central, dieléctrico, blindaje y cubierta",
                signal:
                    "Señal eléctrica o de radiofrecuencia",
                distance:
                    "Distancia corta o media según la aplicación",
                interference:
                    "Buen blindaje frente a perturbaciones externas",
                advantage:
                    "Blindaje y comportamiento más controlado",
                limitation:
                    "Mayor rigidez, pérdidas y necesidad de conectores adecuados",
                application:
                    "Video, radiofrecuencia y distribución de señales",
                infrastructure:
                    "Cable físico con blindaje conductor",
                color: "#fbbf24"
            },

            fiber: {
                title: "Fibra óptica",
                shortTitle: "Fibra óptica",
                classification: "Medio guiado",
                physicalMedium:
                    "Fibra de material transparente",
                signal:
                    "Señal óptica: variación de luz",
                distance:
                    "Adecuada para distancias medias y largas",
                interference:
                    "Inmune a interferencia electromagnética",
                advantage:
                    "Alta capacidad, baja atenuación y aislamiento eléctrico",
                limitation:
                    "Instalación delicada y conversión eléctrica-óptica",
                application:
                    "Enlaces de datos, troncales y ambientes industriales",
                infrastructure:
                    "Emisor óptico, fibra y detector óptico",
                color: "#34d399"
            },

            radio: {
                title: "Enlace de radio",
                shortTitle: "Radio",
                classification: "Transmisión no guiada",
                physicalMedium:
                    "Aire o espacio libre",
                signal:
                    "Onda electromagnética",
                distance:
                    "Cobertura local o amplia según el sistema y el entorno",
                interference:
                    "Puede sufrir interferencias, obstáculos y variaciones de cobertura",
                advantage:
                    "Movilidad y comunicación sin cable físico permanente",
                limitation:
                    "Depende de antenas, infraestructura, obstáculos e interferencias",
                application:
                    "Wi-Fi, Bluetooth, telefonía móvil y radioenlaces",
                infrastructure:
                    "Transmisor, antenas, receptor y alimentación",
                color: "#c084fc"
            },

            satellite: {
                title: "Enlace satelital",
                shortTitle: "Satelital",
                classification:
                    "Tecnología de transmisión no guiada",
                physicalMedium:
                    "Atmósfera y espacio libre",
                signal:
                    "Onda electromagnética",
                distance:
                    "Gran cobertura geográfica",
                interference:
                    "Requiere condiciones de enlace, antenas y equipos especializados",
                advantage:
                    "Cobertura en zonas alejadas y áreas extensas",
                limitation:
                    "Mayor costo y retardo que otras alternativas",
                application:
                    "Comunidades remotas, puestos aislados y cobertura amplia",
                infrastructure:
                    "Estaciones terrestres, antenas y satélite retransmisor",
                color: "#fb7185"
            }
        };

        const cases = {
            classroom: {
                title: "Aula o laboratorio",
                need:
                    "Equipos fijos, distancia corta, bajo costo e instalación sencilla.",
                criteria:
                    "Costo, facilidad de instalación y distancia interna.",
                recommended:
                    "twistedPair",
                reason:
                    "El par trenzado es económico, fácil de conseguir y apropiado para redes locales en distancias internas.",
                caution:
                    "No sería la primera opción con alta interferencia, gran distancia o necesidad de aislamiento eléctrico."
            },

            industrial: {
                title: "Ambiente industrial con motores",
                need:
                    "Comunicación estable, motores eléctricos, distancia media o alta y necesidad de aislamiento.",
                criteria:
                    "Inmunidad electromagnética, aislamiento eléctrico y capacidad.",
                recommended:
                    "fiber",
                reason:
                    "La fibra transporta luz y no capta interferencia electromagnética como un conductor metálico.",
                caution:
                    "Requiere conversión eléctrica-óptica y una instalación cuidadosa."
            },

            mobile: {
                title: "Equipos móviles",
                need:
                    "Movimiento del usuario y ausencia de conexión física permanente.",
                criteria:
                    "Movilidad y cobertura dentro de un área.",
                recommended:
                    "radio",
                reason:
                    "La radio permite comunicación sin un cable permanente y es apropiada para equipos móviles.",
                caution:
                    "Puede sufrir interferencias, obstáculos y variaciones de cobertura; también necesita infraestructura."
            },

            remote: {
                title: "Zona rural aislada",
                need:
                    "Gran distancia, difícil acceso a cableado y ausencia de infraestructura terrestre cercana.",
                criteria:
                    "Cobertura geográfica y disponibilidad en un lugar aislado.",
                recommended:
                    "satellite",
                reason:
                    "El enlace satelital puede operar donde no existe una red terrestre y evita extender cable durante todo el recorrido.",
                caution:
                    "Requiere equipos especializados, puede tener mayor costo y presentar más retardo."
            },

            longDistance: {
                title: "Enlace terrestre de larga distancia",
                need:
                    "Dos sedes fijas, alta capacidad, estabilidad y posibilidad de tender una ruta terrestre.",
                criteria:
                    "Distancia, capacidad, estabilidad e inmunidad a interferencias.",
                recommended:
                    "fiber",
                reason:
                    "Cuando existe una ruta terrestre disponible, la fibra es adecuada para largas distancias y alta capacidad.",
                caution:
                    "Si no fuera posible tender fibra, podría considerarse radio según el entorno y la infraestructura."
            }
        };

        let currentMode = "blocks";
        let selectedBlockIndex = 0;
        let selectedMediumKey = "twistedPair";
        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;
        let caseWasEvaluated = false;

        let viewWidth = 1000;
        let viewHeight = 560;
        let pixelRatio = 1;
        let blockHitAreas = [];

        modeButtons.forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        setMode(button.dataset.mode);
                    }
                );
            }
        );

        systemSelect.addEventListener(
            "change",
            function () {
                elapsedTime = 0;
                updateInterface();
            }
        );

        channelEffect.addEventListener(
            "change",
            updateInterface
        );

        animationSpeed.addEventListener(
            "input",
            updateControlDisplays
        );

        mediumSpeed.addEventListener(
            "input",
            updateControlDisplays
        );

        caseSelect.addEventListener(
            "change",
            resetCaseEvaluation
        );

        caseMediumSelect.addEventListener(
            "change",
            resetCaseEvaluation
        );

        evaluateButton.addEventListener(
            "click",
            evaluateCase
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
            selectBlockFromCanvas
        );

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        function formatNumber(value, decimals = 1) {
            return Number(value)
                .toFixed(decimals)
                .replace(".", ",");
        }

        function clamp(value, minimum, maximum) {
            return Math.min(
                maximum,
                Math.max(minimum, value)
            );
        }

        function hexToRgba(hex, alpha) {
            const normalized =
                hex.replace("#", "");

            const red =
                parseInt(
                    normalized.substring(0, 2),
                    16
                );

            const green =
                parseInt(
                    normalized.substring(2, 4),
                    16
                );

            const blue =
                parseInt(
                    normalized.substring(4, 6),
                    16
                );

            return (
                "rgba(" +
                red + "," +
                green + "," +
                blue + "," +
                alpha +
                ")"
            );
        }

        function resizeCanvas() {
            viewWidth =
                Math.max(
                    300,
                    canvasContainer.clientWidth
                );

            if (viewWidth < 680) {
                if (currentMode === "blocks") {
                    viewHeight = 930;
                } else if (currentMode === "media") {
                    viewHeight = 700;
                } else {
                    viewHeight = 760;
                }
            } else {
                viewHeight = 560;
            }

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

            blocksControls.hidden =
                mode !== "blocks";

            mediaControls.hidden =
                mode !== "media";

            caseControls.hidden =
                mode !== "cases";

            detailPanel.hidden =
                mode !== "blocks";

            mediaDetailPanel.hidden =
                mode !== "media";

            caseDetailPanel.hidden =
                mode !== "cases";

            explanation.classList.remove(
                "media-mode",
                "case-mode"
            );

            if (mode === "blocks") {
                canvasTitle.textContent =
                    "Recorrido funcional de la señal";

                explanation.innerHTML =
                    "<strong>Recorrido funcional:</strong> " +
                    "la fuente origina la información, el transductor de " +
                    "entrada la convierte en una señal utilizable, el " +
                    "transmisor la adapta, el canal la transporta, el " +
                    "receptor permite recuperar el mensaje y el transductor " +
                    "de salida entrega una forma útil.";

                technicalNote.innerHTML =
                    "<strong>Nota didáctica:</strong> los bloques pueden estar " +
                    "integrados dentro de un mismo equipo. La antena receptora " +
                    "pertenece a la entrada del receptor y no es el transductor " +
                    "de entrada de la fuente.";
            }

            if (mode === "media") {
                canvasTitle.textContent =
                    "Comparación de medios guiados y no guiados";

                explanation.classList.add(
                    "media-mode"
                );

                explanation.innerHTML =
                    "<strong>Medio y señal son conceptos diferentes:</strong> " +
                    "en cobre la señal principal es eléctrica, en fibra es " +
                    "óptica y en radio o satélite es electromagnética. El " +
                    "satélite es un equipo retransmisor; el medio es la " +
                    "atmósfera y el espacio libre.";

                technicalNote.innerHTML =
                    "<strong>Representación simplificada:</strong> tamaños, " +
                    "distancias y velocidades no están a escala. Los frentes " +
                    "dibujados en radio indican propagación y no una trayectoria " +
                    "ondulada recorrida por la energía.";
            }

            if (mode === "cases") {
                canvasTitle.textContent =
                    "Selección técnica del medio";

                explanation.classList.add(
                    "case-mode"
                );

                explanation.innerHTML =
                    "<strong>Selección del medio:</strong> no existe un medio " +
                    "universalmente superior. La decisión depende de distancia, " +
                    "interferencia, movilidad, costo, capacidad, instalación, " +
                    "mantenimiento y condiciones del entorno.";

                technicalNote.innerHTML =
                    "<strong>Alcance:</strong> las respuestas corresponden a los " +
                    "casos didácticos planteados. No representan el diseño " +
                    "profesional de una red, radioenlace, estación satelital o " +
                    "presupuesto óptico.";
            }

            resizeCanvas();
            updateInterface();
        }

        function updateControlDisplays() {
            animationSpeedDisplay.textContent =
                formatNumber(
                    animationSpeed.value
                ) + "×";

            mediumSpeedDisplay.textContent =
                formatNumber(
                    mediumSpeed.value
                ) + "×";
        }

        function createSelectors() {
            blockSelector.innerHTML = "";

            blocks.forEach(
                function (block, index) {
                    const button =
                        document.createElement("button");

                    button.type = "button";
                    button.className = "block-button";
                    button.textContent = block.shortTitle;

                    button.addEventListener(
                        "click",
                        function () {
                            selectedBlockIndex = index;
                            updateInterface();
                        }
                    );

                    blockSelector.appendChild(button);
                }
            );

            mediumSelector.innerHTML = "";

            Object.entries(media).forEach(
                function ([key, item]) {
                    const button =
                        document.createElement("button");

                    button.type = "button";
                    button.className = "medium-button";
                    button.textContent = item.shortTitle;
                    button.dataset.medium = key;

                    button.addEventListener(
                        "click",
                        function () {
                            selectedMediumKey = key;
                            elapsedTime = 0;
                            updateInterface();
                        }
                    );

                    mediumSelector.appendChild(button);
                }
            );
        }

        function updateInterface() {
            updateControlDisplays();
            updateSelectorStates();
            updateMetrics();

            if (currentMode === "blocks") {
                updateBlockDetails();
            }

            if (currentMode === "media") {
                updateMediumDetails();
            }

            if (currentMode === "cases") {
                updateCaseDetails();
            }
        }

        function updateSelectorStates() {
            Array.from(
                blockSelector.children
            ).forEach(
                function (button, index) {
                    button.classList.toggle(
                        "active",
                        index === selectedBlockIndex
                    );
                }
            );

            Array.from(
                mediumSelector.children
            ).forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.medium ===
                        selectedMediumKey
                    );
                }
            );
        }

        function makeDetailItem(label, value) {
            return (
                '<div class="detail-item">' +
                    "<strong>" +
                        label +
                    "</strong>" +
                    "<span>" +
                        value +
                    "</span>" +
                "</div>"
            );
        }

        function updateBlockDetails() {
            const block =
                blocks[selectedBlockIndex];

            const system =
                systems[systemSelect.value];

            detailTitle.textContent =
                block.title;

            detailGrid.innerHTML = [
                makeDetailItem(
                    "Función",
                    block.function
                ),
                makeDetailItem(
                    "Entrada",
                    block.input
                ),
                makeDetailItem(
                    "Salida",
                    block.output
                ),
                makeDetailItem(
                    "Ejemplo en " + system.title,
                    system.examples[
                        selectedBlockIndex
                    ]
                ),
                makeDetailItem(
                    "Falla posible",
                    block.failure
                ),
                makeDetailItem(
                    "Síntoma",
                    block.symptom
                )
            ].join("");
        }

        function updateMediumDetails() {
            const item =
                media[selectedMediumKey];

            mediaDetailTitle.textContent =
                item.title;

            mediaDetailGrid.innerHTML = [
                makeDetailItem(
                    "Clasificación",
                    item.classification
                ),
                makeDetailItem(
                    "Medio físico",
                    item.physicalMedium
                ),
                makeDetailItem(
                    "Señal principal",
                    item.signal
                ),
                makeDetailItem(
                    "Distancia o cobertura",
                    item.distance
                ),
                makeDetailItem(
                    "Interferencias",
                    item.interference
                ),
                makeDetailItem(
                    "Ventaja",
                    item.advantage
                ),
                makeDetailItem(
                    "Limitación",
                    item.limitation
                ),
                makeDetailItem(
                    "Aplicación típica",
                    item.application
                ),
                makeDetailItem(
                    "Infraestructura",
                    item.infrastructure
                )
            ].join("");
        }

        function updateCaseDetails() {
            const currentCase =
                cases[caseSelect.value];

            const selected =
                media[caseMediumSelect.value];

            caseDetailTitle.textContent =
                currentCase.title;

            caseDetailGrid.innerHTML = [
                makeDetailItem(
                    "Necesidad",
                    currentCase.need
                ),
                makeDetailItem(
                    "Criterios principales",
                    currentCase.criteria
                ),
                makeDetailItem(
                    "Medio elegido",
                    selected.title
                )
            ].join("");
        }

        function resetCaseEvaluation() {
            caseWasEvaluated = false;
            caseResult.className =
                "result-box";

            caseResult.textContent =
                "Selecciona un medio y presiona “Evaluar elección”.";

            updateInterface();
        }

        function evaluateCase() {
            const currentCase =
                cases[caseSelect.value];

            const chosenKey =
                caseMediumSelect.value;

            const chosen =
                media[chosenKey];

            const recommended =
                media[currentCase.recommended];

            caseWasEvaluated = true;

            if (
                chosenKey ===
                currentCase.recommended
            ) {
                caseResult.className =
                    "result-box correct";

                caseResult.innerHTML =
                    "<strong>Elección adecuada para el caso:</strong> " +
                    chosen.title +
                    ". " +
                    currentCase.reason +
                    " <strong>Limitación a considerar:</strong> " +
                    currentCase.caution;
            } else {
                caseResult.className =
                    "result-box review";

                caseResult.innerHTML =
                    "<strong>Revisar la elección:</strong> " +
                    chosen.title +
                    " no es la alternativa recomendada para las condiciones " +
                    "definidas. En este caso se recomienda <strong>" +
                    recommended.title +
                    "</strong>. " +
                    currentCase.reason +
                    " <strong>Observación:</strong> " +
                    currentCase.caution;
            }

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

            updateInterface();
        }

        function getProgress(speed, delayFactor = 1) {
            const cycleDuration =
                8 /
                speed *
                delayFactor;

            return (
                elapsedTime %
                cycleDuration
            ) /
            cycleDuration;
        }

        function setMetric(index, label, value) {
            metricLabels[index].textContent =
                label;

            metricValues[index].textContent =
                value;
        }

        function updateMetrics() {
            if (currentMode === "blocks") {
                const system =
                    systems[systemSelect.value];

                const block =
                    blocks[selectedBlockIndex];

                const effect =
                    channelEffects[
                        channelEffect.value
                    ];

                const delayFactor =
                    channelEffect.value === "delay"
                        ? 1.55
                        : 1;

                const progress =
                    getProgress(
                        Number(
                            animationSpeed.value
                        ),
                        delayFactor
                    );

                setMetric(
                    0,
                    "Sistema",
                    system.title
                );

                setMetric(
                    1,
                    "Bloque seleccionado",
                    block.shortTitle
                );

                setMetric(
                    2,
                    "Progreso visual",
                    Math.round(
                        progress * 100
                    ) + " %"
                );

                setMetric(
                    3,
                    "Condición del canal",
                    effect.title
                );
            }

            if (currentMode === "media") {
                const item =
                    media[selectedMediumKey];

                setMetric(
                    0,
                    "Selección",
                    item.title
                );

                setMetric(
                    1,
                    "Clasificación",
                    item.classification
                );

                setMetric(
                    2,
                    "Señal principal",
                    item.signal
                );

                setMetric(
                    3,
                    "Comparación",
                    "3 guiados · 2 no guiados"
                );
            }

            if (currentMode === "cases") {
                const currentCase =
                    cases[caseSelect.value];

                const chosen =
                    media[caseMediumSelect.value];

                const recommended =
                    media[currentCase.recommended];

                setMetric(
                    0,
                    "Caso",
                    currentCase.title
                );

                setMetric(
                    1,
                    "Medio elegido",
                    chosen.title
                );

                setMetric(
                    2,
                    "Estado",
                    caseWasEvaluated
                        ? "Evaluado"
                        : "Pendiente"
                );

                setMetric(
                    3,
                    "Recomendación",
                    caseWasEvaluated
                        ? recommended.title
                        : "Oculta"
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
                index++
            ) {
                const testLine =
                    line
                        ? line + " " + words[index]
                        : words[index];

                if (
                    ctx.measureText(testLine).width >
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

                    lineNumber++;

                    if (
                        lineNumber >=
                        maxLines - 1
                    ) {
                        break;
                    }
                } else {
                    line = testLine;
                }
            }

            if (lineNumber < maxLines) {
                ctx.fillText(
                    line,
                    x,
                    y +
                    lineNumber *
                    lineHeight
                );
            }
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

            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(toX, toY);

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
            radius = 5,
            opacity = 1
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
                "rgba(255,255,255," +
                opacity +
                ")"
            );

            gradient.addColorStop(
                0.22,
                hexToRgba(
                    color,
                    opacity
                )
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

            ctx.fillStyle =
                "rgba(255,255,255," +
                opacity +
                ")";

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

        function drawBlockSymbol(
            x,
            y,
            radius,
            abbreviation,
            color
        ) {
            ctx.save();

            const gradient =
                ctx.createRadialGradient(
                    x - radius * 0.3,
                    y - radius * 0.3,
                    radius * 0.1,
                    x,
                    y,
                    radius
                );

            gradient.addColorStop(
                0,
                "rgba(255,255,255,0.28)"
            );

            gradient.addColorStop(
                1,
                hexToRgba(
                    color,
                    0.26
                )
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "#f5fcff";
            ctx.font =
                "700 " +
                Math.max(
                    10,
                    radius * 0.62
                ) +
                "px Segoe UI, sans-serif";

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                abbreviation,
                x,
                y
            );

            ctx.restore();
        }

        function drawBlocksMode() {
            const system =
                systems[systemSelect.value];

            const effect =
                channelEffects[
                    channelEffect.value
                ];

            const delayFactor =
                channelEffect.value === "delay"
                    ? 1.55
                    : 1;

            const progress =
                getProgress(
                    Number(
                        animationSpeed.value
                    ),
                    delayFactor
                );

            const mobile =
                viewWidth < 680;

            blockHitAreas = [];

            ctx.save();

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 16px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                system.title,
                24,
                34
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                system.subtitle,
                24,
                52,
                viewWidth - 48,
                14,
                2
            );

            const positions = [];

            if (!mobile) {
                const margin = 20;
                const gap = 11;

                const cardWidth =
                    (
                        viewWidth -
                        margin * 2 -
                        gap *
                        (
                            blocks.length - 1
                        )
                    ) /
                    blocks.length;

                const cardHeight = 246;
                const cardY = 125;

                blocks.forEach(
                    function (block, index) {
                        const cardX =
                            margin +
                            index *
                            (
                                cardWidth +
                                gap
                            );

                        drawBlockCard(
                            block,
                            system.examples[index],
                            cardX,
                            cardY,
                            cardWidth,
                            cardHeight,
                            index === selectedBlockIndex,
                            false
                        );

                        positions.push({
                            x:
                                cardX +
                                cardWidth / 2,
                            y:
                                cardY +
                                cardHeight / 2
                        });

                        blockHitAreas.push({
                            x: cardX,
                            y: cardY,
                            width: cardWidth,
                            height: cardHeight,
                            index
                        });

                        if (
                            index <
                            blocks.length - 1
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
                    }
                );
            } else {
                const margin = 16;
                const gap = 13;
                const cardHeight = 84;
                const startY = 82;

                blocks.forEach(
                    function (block, index) {
                        const cardY =
                            startY +
                            index *
                            (
                                cardHeight +
                                gap
                            );

                        drawBlockCard(
                            block,
                            system.examples[index],
                            margin,
                            cardY,
                            viewWidth -
                            margin * 2,
                            cardHeight,
                            index === selectedBlockIndex,
                            true
                        );

                        positions.push({
                            x: viewWidth / 2,
                            y:
                                cardY +
                                cardHeight / 2
                        });

                        blockHitAreas.push({
                            x: margin,
                            y: cardY,
                            width:
                                viewWidth -
                                margin * 2,
                            height: cardHeight,
                            index
                        });

                        if (
                            index <
                            blocks.length - 1
                        ) {
                            drawArrow(
                                viewWidth / 2,
                                cardY +
                                cardHeight +
                                1,
                                viewWidth / 2,
                                cardY +
                                cardHeight +
                                gap -
                                1
                            );
                        }
                    }
                );
            }

            drawMovingSignal(
                positions,
                progress,
                effect,
                mobile
            );

            drawEffectLegend(effect);

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "El bloque seleccionado permanece fijo hasta que el usuario elija otro",
                viewWidth - 20,
                viewHeight - 18
            );

            ctx.restore();
        }

        function drawBlockCard(
            block,
            example,
            x,
            y,
            width,
            height,
            active,
            compact
        ) {
            ctx.save();

            if (active) {
                ctx.shadowBlur = 22;
                ctx.shadowColor = block.color;
            }

            const gradient =
                ctx.createLinearGradient(
                    x,
                    y,
                    x,
                    y + height
                );

            gradient.addColorStop(
                0,
                active
                    ? "rgba(20,53,83,0.97)"
                    : "rgba(10,29,49,0.93)"
            );

            gradient.addColorStop(
                1,
                "rgba(3,13,28,0.97)"
            );

            roundedRectPath(
                x,
                y,
                width,
                height,
                12
            );

            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                active
                    ? block.color
                    : "rgba(125,211,252,0.18)";

            ctx.lineWidth =
                active ? 2 : 1;

            ctx.stroke();

            if (compact) {
                drawBlockSymbol(
                    x + 39,
                    y + height / 2,
                    22,
                    block.abbreviation,
                    block.color
                );

                ctx.textAlign = "left";

                ctx.fillStyle =
                    active
                        ? "#f5fcff"
                        : "rgba(226,242,255,0.91)";

                ctx.font =
                    "700 12px Segoe UI, sans-serif";

                ctx.fillText(
                    block.shortTitle,
                    x + 78,
                    y + 27
                );

                ctx.fillStyle =
                    block.color;

                ctx.font =
                    "700 8px Segoe UI, sans-serif";

                ctx.fillText(
                    example.toUpperCase(),
                    x + 78,
                    y + 44
                );

                ctx.fillStyle =
                    "rgba(184,202,220,0.76)";

                ctx.font =
                    "500 9px Segoe UI, sans-serif";

                wrapText(
                    block.function,
                    x + 78,
                    y + 60,
                    width - 94,
                    12,
                    2
                );
            } else {
                drawBlockSymbol(
                    x + width / 2,
                    y + 53,
                    27,
                    block.abbreviation,
                    block.color
                );

                ctx.textAlign = "center";

                ctx.fillStyle =
                    active
                        ? "#f5fcff"
                        : "rgba(226,242,255,0.91)";

                ctx.font =
                    "700 10px Segoe UI, sans-serif";

                wrapText(
                    block.shortTitle,
                    x + width / 2,
                    y + 93,
                    width - 14,
                    14,
                    3
                );

                ctx.fillStyle =
                    block.color;

                ctx.font =
                    "700 7.5px Segoe UI, sans-serif";

                wrapText(
                    example.toUpperCase(),
                    x + width / 2,
                    y + 140,
                    width - 14,
                    12,
                    3
                );

                ctx.fillStyle =
                    "rgba(184,202,220,0.74)";

                ctx.font =
                    "500 8px Segoe UI, sans-serif";

                wrapText(
                    block.function,
                    x + width / 2,
                    y + 183,
                    width - 14,
                    12,
                    4
                );
            }

            ctx.restore();
        }

        function drawMovingSignal(
            positions,
            progress,
            effect,
            mobile
        ) {
            const segments =
                positions.length - 1;

            const scaled =
                progress * segments;

            const index =
                Math.min(
                    segments - 1,
                    Math.floor(scaled)
                );

            const local =
                scaled - index;

            const current =
                positions[index];

            const next =
                positions[index + 1];

            const x =
                current.x +
                (
                    next.x - current.x
                ) *
                local;

            const y =
                current.y +
                (
                    next.y - current.y
                ) *
                local;

            const channelIndex = 3;

            const afterChannel =
                scaled >= channelIndex;

            let opacity = 1;
            let radius = 5;

            if (
                channelEffect.value ===
                "attenuation" &&
                afterChannel
            ) {
                opacity = 0.44;
                radius = 3.2;
            }

            drawGlowPoint(
                x,
                y,
                effect.color,
                radius,
                opacity
            );

            if (
                channelEffect.value ===
                "noise" &&
                afterChannel
            ) {
                drawNoise(x, y, effect.color);
            }

            if (
                channelEffect.value ===
                "interference" &&
                afterChannel
            ) {
                drawInterference(
                    x,
                    y,
                    effect.color
                );
            }

            if (
                channelEffect.value ===
                "distortion" &&
                afterChannel
            ) {
                drawDistortion(
                    x,
                    y,
                    effect.color,
                    mobile
                );
            }

            if (
                channelEffect.value ===
                "delay" &&
                afterChannel
            ) {
                drawDelayTrail(
                    x,
                    y,
                    effect.color,
                    mobile
                );
            }
        }

        function drawNoise(x, y, color) {
            ctx.save();
            ctx.fillStyle = color;

            for (
                let index = 0;
                index < 9;
                index++
            ) {
                const angle =
                    index *
                    Math.PI * 2 /
                    9 +
                    elapsedTime * 2;

                const distance =
                    8 +
                    (
                        index % 3
                    ) *
                    4;

                ctx.globalAlpha =
                    0.35 +
                    (
                        index % 2
                    ) *
                    0.25;

                ctx.beginPath();

                ctx.arc(
                    x +
                    Math.cos(angle) *
                    distance,
                    y +
                    Math.sin(angle) *
                    distance,
                    1.4,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.restore();
        }

        function drawInterference(x, y, color) {
            ctx.save();

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.4;
            ctx.globalAlpha = 0.7;

            for (
                let index = 1;
                index <= 3;
                index++
            ) {
                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    index * 7 +
                    Math.sin(
                        elapsedTime * 3
                    ) *
                    2,
                    0,
                    Math.PI * 2
                );

                ctx.stroke();
            }

            ctx.restore();
        }

        function drawDistortion(
            x,
            y,
            color,
            vertical
        ) {
            ctx.save();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.72;

            ctx.beginPath();

            for (
                let index = 0;
                index <= 24;
                index++
            ) {
                const offset =
                    index - 12;

                const wobble =
                    Math.sin(
                        index * 0.7 +
                        elapsedTime * 5
                    ) *
                    4;

                const pointX =
                    vertical
                        ? x + wobble
                        : x + offset;

                const pointY =
                    vertical
                        ? y + offset
                        : y + wobble;

                if (index === 0) {
                    ctx.moveTo(
                        pointX,
                        pointY
                    );
                } else {
                    ctx.lineTo(
                        pointX,
                        pointY
                    );
                }
            }

            ctx.stroke();
            ctx.restore();
        }

        function drawDelayTrail(
            x,
            y,
            color,
            vertical
        ) {
            ctx.save();

            ctx.fillStyle = color;

            for (
                let index = 1;
                index <= 4;
                index++
            ) {
                ctx.globalAlpha =
                    0.15 *
                    (
                        5 - index
                    );

                ctx.beginPath();

                ctx.arc(
                    vertical
                        ? x
                        : x - index * 8,
                    vertical
                        ? y - index * 8
                        : y,
                    3,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.restore();
        }

        function drawEffectLegend(effect) {
            const width =
                Math.min(
                    360,
                    viewWidth - 40
                );

            const height = 74;
            const x = 20;
            const y =
                viewHeight -
                height -
                38;

            ctx.save();

            roundedRectPath(
                x,
                y,
                width,
                height,
                10
            );

            ctx.fillStyle =
                "rgba(2,10,24,0.78)";

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    effect.color,
                    0.42
                );

            ctx.stroke();

            ctx.fillStyle =
                effect.color;

            ctx.font =
                "700 10px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                "CONDICIÓN DEL CANAL: " +
                effect.title.toUpperCase(),
                x + 13,
                y + 23
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.82)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            wrapText(
                effect.description,
                x + 13,
                y + 43,
                width - 26,
                13,
                2
            );

            ctx.restore();
        }

        function drawMediaMode() {
            const item =
                media[selectedMediumKey];

            const progress =
                getProgress(
                    Number(
                        mediumSpeed.value
                    )
                );

            ctx.save();

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 16px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                item.title,
                24,
                34
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            ctx.fillText(
                item.classification +
                " · " +
                item.signal,
                24,
                53
            );

            if (
                selectedMediumKey ===
                "twistedPair"
            ) {
                drawTwistedPair(
                    progress,
                    item
                );
            }

            if (
                selectedMediumKey ===
                "coaxial"
            ) {
                drawCoaxial(
                    progress,
                    item
                );
            }

            if (
                selectedMediumKey ===
                "fiber"
            ) {
                drawFiber(
                    progress,
                    item
                );
            }

            if (
                selectedMediumKey ===
                "radio"
            ) {
                drawRadio(
                    progress,
                    item
                );
            }

            if (
                selectedMediumKey ===
                "satellite"
            ) {
                drawSatellite(
                    progress,
                    item
                );
            }

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "Representación educativa · dimensiones, distancias y velocidades no están a escala",
                viewWidth - 20,
                viewHeight - 18
            );

            ctx.restore();
        }

        function drawDevice(
            x,
            y,
            title,
            color
        ) {
            ctx.save();

            roundedRectPath(
                x - 34,
                y - 35,
                68,
                70,
                10
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.95)";

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    color,
                    0.45
                );

            ctx.stroke();

            ctx.fillStyle = color;

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            wrapText(
                title,
                x,
                y - 3,
                58,
                11,
                3
            );

            ctx.restore();
        }

        function drawMediaCaption(
            item,
            firstLine,
            secondLine
        ) {
            const width =
                Math.min(
                    520,
                    viewWidth - 40
                );

            const x =
                (
                    viewWidth - width
                ) / 2;

            const y =
                viewHeight - 130;

            ctx.save();

            roundedRectPath(
                x,
                y,
                width,
                80,
                10
            );

            ctx.fillStyle =
                "rgba(2,10,24,0.78)";

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    item.color,
                    0.38
                );

            ctx.stroke();

            ctx.fillStyle =
                item.color;

            ctx.font =
                "700 10px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                firstLine.toUpperCase(),
                viewWidth / 2,
                y + 24
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.84)";

            ctx.font =
                "600 10px Segoe UI, sans-serif";

            ctx.fillText(
                secondLine,
                viewWidth / 2,
                y + 47
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.72)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.fillText(
                item.application,
                viewWidth / 2,
                y + 67
            );

            ctx.restore();
        }

        function drawTwistedPair(
            progress,
            item
        ) {
            const mobile =
                viewWidth < 680;

            const left =
                mobile ? 58 : 100;

            const right =
                viewWidth -
                left;

            const centerY =
                viewHeight / 2 - 10;

            const length =
                right - left;

            drawDevice(
                left - 28,
                centerY,
                "TX",
                item.color
            );

            drawDevice(
                right + 28,
                centerY,
                "RX",
                item.color
            );

            ctx.save();

            ctx.lineWidth =
                mobile ? 3 : 4;

            ctx.lineCap =
                "round";

            for (
                let pair = 0;
                pair < 2;
                pair++
            ) {
                ctx.beginPath();

                for (
                    let x = left;
                    x <= right;
                    x += 2
                ) {
                    const normalized =
                        (
                            x - left
                        ) /
                        length;

                    const y =
                        centerY +
                        Math.sin(
                            normalized *
                            Math.PI *
                            14 +
                            pair *
                            Math.PI
                        ) *
                        (
                            mobile
                                ? 15
                                : 22
                        );

                    if (x === left) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.strokeStyle =
                    pair === 0
                        ? "rgba(56,189,248,0.92)"
                        : "rgba(34,211,238,0.92)";

                ctx.stroke();
            }

            ctx.restore();

            drawGlowPoint(
                left +
                progress *
                length,
                centerY,
                item.color,
                5
            );

            drawMediaCaption(
                item,
                "Conductores de cobre trenzados",
                "La señal principal es eléctrica"
            );
        }

        function drawCoaxial(
            progress,
            item
        ) {
            const mobile =
                viewWidth < 680;

            const left =
                mobile ? 58 : 100;

            const right =
                viewWidth - left;

            const centerY =
                viewHeight / 2 - 10;

            const length =
                right - left;

            drawDevice(
                left - 28,
                centerY,
                "TX",
                item.color
            );

            drawDevice(
                right + 28,
                centerY,
                "RX",
                item.color
            );

            ctx.save();

            roundedRectPath(
                left,
                centerY - 39,
                length,
                78,
                32
            );

            ctx.fillStyle =
                "rgba(148,163,184,0.18)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(226,232,240,0.45)";

            ctx.lineWidth = 2;
            ctx.stroke();

            roundedRectPath(
                left + 8,
                centerY - 24,
                length - 16,
                48,
                20
            );

            ctx.fillStyle =
                "rgba(71,85,105,0.75)";

            ctx.fill();

            roundedRectPath(
                left + 16,
                centerY - 14,
                length - 32,
                28,
                14
            );

            ctx.fillStyle =
                "rgba(250,204,21,0.16)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(250,204,21,0.95)";

            ctx.lineWidth = 6;

            ctx.beginPath();

            ctx.moveTo(
                left + 20,
                centerY
            );

            ctx.lineTo(
                right - 20,
                centerY
            );

            ctx.stroke();

            ctx.restore();

            drawGlowPoint(
                left +
                20 +
                progress *
                (
                    length - 40
                ),
                centerY,
                item.color,
                5
            );

            drawMediaCaption(
                item,
                "Conductor central, dieléctrico y blindaje",
                "Transporta señal eléctrica o de radiofrecuencia"
            );
        }

        function drawFiber(
            progress,
            item
        ) {
            const stages = [
                "Señal eléctrica",
                "Emisor óptico",
                "Luz",
                "Fibra",
                "Fotodetector",
                "Señal eléctrica"
            ];

            const mobile =
                viewWidth < 680;

            const positions = [];

            if (!mobile) {
                const margin = 28;
                const gap = 12;

                const width =
                    (
                        viewWidth -
                        margin * 2 -
                        gap *
                        (
                            stages.length - 1
                        )
                    ) /
                    stages.length;

                const height = 106;
                const y =
                    viewHeight / 2 -
                    height / 2 -
                    15;

                stages.forEach(
                    function (stage, index) {
                        const x =
                            margin +
                            index *
                            (
                                width +
                                gap
                            );

                        drawStageBox(
                            x,
                            y,
                            width,
                            height,
                            stage,
                            index >= 2 &&
                            index <= 3
                                ? item.color
                                : "#38bdf8"
                        );

                        positions.push({
                            x:
                                x +
                                width / 2,
                            y:
                                y +
                                height / 2
                        });

                        if (
                            index <
                            stages.length - 1
                        ) {
                            drawArrow(
                                x + width + 2,
                                y + height / 2,
                                x + width + gap - 2,
                                y + height / 2,
                                "rgba(110,231,183,0.58)"
                            );
                        }
                    }
                );
            } else {
                const x = 30;
                const width =
                    viewWidth - 60;

                const height = 62;
                const gap = 11;
                const startY = 82;

                stages.forEach(
                    function (stage, index) {
                        const y =
                            startY +
                            index *
                            (
                                height +
                                gap
                            );

                        drawStageBox(
                            x,
                            y,
                            width,
                            height,
                            stage,
                            index >= 2 &&
                            index <= 3
                                ? item.color
                                : "#38bdf8"
                        );

                        positions.push({
                            x:
                                x +
                                width / 2,
                            y:
                                y +
                                height / 2
                        });

                        if (
                            index <
                            stages.length - 1
                        ) {
                            drawArrow(
                                x + width / 2,
                                y + height + 1,
                                x + width / 2,
                                y + height + gap - 1,
                                "rgba(110,231,183,0.58)"
                            );
                        }
                    }
                );
            }

            drawPointOnPath(
                positions,
                progress,
                item.color
            );

            drawMediaCaption(
                item,
                "La fibra es el medio",
                "La luz variable es la señal"
            );
        }

        function drawStageBox(
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
                10
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.93)";

            ctx.fill();

            ctx.strokeStyle =
                hexToRgba(
                    color,
                    0.40
                );

            ctx.stroke();

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                x +
                (
                    width < 100
                        ? width / 2
                        : 30
                ),
                y +
                height / 2,
                8,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "rgba(226,242,255,0.92)";

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign =
                width < 100
                    ? "center"
                    : "left";

            const textX =
                width < 100
                    ? x + width / 2
                    : x + 49;

            const textY =
                width < 100
                    ? y + height - 20
                    : y + height / 2 + 3;

            wrapText(
                title,
                textX,
                textY,
                width < 100
                    ? width - 10
                    : width - 58,
                12,
                2
            );

            ctx.restore();
        }

        function drawPointOnPath(
            positions,
            progress,
            color
        ) {
            const segments =
                positions.length - 1;

            const scaled =
                progress * segments;

            const index =
                Math.min(
                    segments - 1,
                    Math.floor(scaled)
                );

            const local =
                scaled - index;

            const current =
                positions[index];

            const next =
                positions[index + 1];

            drawGlowPoint(
                current.x +
                (
                    next.x - current.x
                ) *
                local,
                current.y +
                (
                    next.y - current.y
                ) *
                local,
                color,
                5
            );
        }

        function drawAntenna(
            x,
            y,
            color,
            title
        ) {
            ctx.save();

            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            ctx.beginPath();

            ctx.moveTo(
                x,
                y - 72
            );

            ctx.lineTo(
                x,
                y + 36
            );

            ctx.moveTo(
                x - 28,
                y + 36
            );

            ctx.lineTo(
                x + 28,
                y + 36
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(
                x,
                y - 45,
                25,
                -Math.PI / 3,
                Math.PI / 3
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(
                x,
                y - 45,
                44,
                -Math.PI / 3,
                Math.PI / 3
            );

            ctx.stroke();

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                title,
                x,
                y + 58
            );

            ctx.restore();
        }

        function drawRadio(
            progress,
            item
        ) {
            const mobile =
                viewWidth < 680;

            const leftX =
                mobile
                    ? 82
                    : 180;

            const rightX =
                mobile
                    ? viewWidth - 82
                    : viewWidth - 180;

            const centerY =
                viewHeight / 2 + 10;

            drawAntenna(
                leftX,
                centerY,
                item.color,
                "ANTENA TX"
            );

            drawAntenna(
                rightX,
                centerY,
                item.color,
                "ANTENA RX"
            );

            const signalX =
                leftX +
                progress *
                (
                    rightX - leftX
                );

            const radius =
                18 +
                progress *
                (
                    mobile
                        ? 32
                        : 80
                );

            ctx.save();

            ctx.strokeStyle =
                hexToRgba(
                    item.color,
                    0.48
                );

            ctx.lineWidth = 2;

            for (
                let index = 0;
                index < 3;
                index++
            ) {
                ctx.beginPath();

                ctx.arc(
                    signalX,
                    centerY - 28,
                    radius *
                    (
                        0.42 +
                        index * 0.21
                    ),
                    -Math.PI / 3,
                    Math.PI / 3
                );

                ctx.stroke();
            }

            ctx.restore();

            drawGlowPoint(
                signalX,
                centerY - 28,
                item.color,
                4
            );

            drawMediaCaption(
                item,
                "El medio es aire o espacio libre",
                "La señal es una onda electromagnética"
            );
        }

        function drawGroundStation(
            x,
            y,
            color,
            title
        ) {
            ctx.save();

            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                x,
                y - 25,
                28,
                Math.PI,
                Math.PI * 2
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(
                x,
                y - 25
            );

            ctx.lineTo(
                x,
                y + 12
            );

            ctx.moveTo(
                x - 22,
                y + 12
            );

            ctx.lineTo(
                x + 22,
                y + 12
            );

            ctx.stroke();

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                title,
                x,
                y + 36
            );

            ctx.restore();
        }

        function drawSatelliteIcon(
            x,
            y,
            color
        ) {
            ctx.save();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            roundedRectPath(
                x - 27,
                y - 14,
                54,
                28,
                6
            );

            ctx.fillStyle =
                hexToRgba(
                    color,
                    0.20
                );

            ctx.fill();
            ctx.stroke();

            ctx.fillRect(
                x - 70,
                y - 12,
                36,
                24
            );

            ctx.strokeRect(
                x - 70,
                y - 12,
                36,
                24
            );

            ctx.fillRect(
                x + 34,
                y - 12,
                36,
                24
            );

            ctx.strokeRect(
                x + 34,
                y - 12,
                36,
                24
            );

            ctx.beginPath();

            ctx.moveTo(
                x,
                y - 14
            );

            ctx.lineTo(
                x,
                y - 39
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(
                x,
                y - 42,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = color;
            ctx.fill();

            ctx.font =
                "700 9px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                "SATÉLITE RETRANSMISOR",
                x,
                y + 38
            );

            ctx.restore();
        }

        function drawSatellite(
            progress,
            item
        ) {
            const mobile =
                viewWidth < 680;

            const groundY =
                viewHeight - 175;

            const leftX =
                mobile
                    ? 72
                    : 155;

            const rightX =
                mobile
                    ? viewWidth - 72
                    : viewWidth - 155;

            const satelliteX =
                viewWidth / 2;

            const satelliteY =
                mobile
                    ? 135
                    : 128;

            drawGroundStation(
                leftX,
                groundY,
                item.color,
                "ESTACIÓN TX"
            );

            drawGroundStation(
                rightX,
                groundY,
                item.color,
                "ESTACIÓN RX"
            );

            drawSatelliteIcon(
                satelliteX,
                satelliteY,
                item.color
            );

            ctx.save();

            ctx.strokeStyle =
                hexToRgba(
                    item.color,
                    0.44
                );

            ctx.lineWidth = 2;
            ctx.setLineDash([7, 7]);

            ctx.beginPath();

            ctx.moveTo(
                leftX,
                groundY - 42
            );

            ctx.lineTo(
                satelliteX,
                satelliteY + 10
            );

            ctx.lineTo(
                rightX,
                groundY - 42
            );

            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();

            let x;
            let y;
            let label;

            if (progress < 0.5) {
                const local =
                    progress / 0.5;

                x =
                    leftX +
                    (
                        satelliteX - leftX
                    ) *
                    local;

                y =
                    groundY - 42 +
                    (
                        satelliteY + 10 -
                        (
                            groundY - 42
                        )
                    ) *
                    local;

                label =
                    "ENLACE ASCENDENTE";
            } else {
                const local =
                    (
                        progress - 0.5
                    ) /
                    0.5;

                x =
                    satelliteX +
                    (
                        rightX - satelliteX
                    ) *
                    local;

                y =
                    satelliteY + 10 +
                    (
                        groundY - 42 -
                        (
                            satelliteY + 10
                        )
                    ) *
                    local;

                label =
                    "ENLACE DESCENDENTE";
            }

            drawGlowPoint(
                x,
                y,
                item.color,
                5
            );

            ctx.save();

            ctx.fillStyle =
                item.color;

            ctx.font =
                "700 10px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                viewWidth / 2,
                72
            );

            ctx.restore();

            drawMediaCaption(
                item,
                "El satélite es un equipo retransmisor",
                "El medio es la atmósfera y el espacio libre"
            );
        }

        function drawCasesMode() {
            const currentCase =
                cases[caseSelect.value];

            const chosen =
                media[caseMediumSelect.value];

            const recommended =
                media[currentCase.recommended];

            ctx.save();

            ctx.fillStyle =
                "rgba(240,249,255,0.94)";

            ctx.font =
                "700 16px Segoe UI, sans-serif";

            ctx.textAlign = "left";

            ctx.fillText(
                currentCase.title,
                24,
                34
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                currentCase.need,
                24,
                52,
                viewWidth - 48,
                14,
                3
            );

            drawCaseScene(
                currentCase,
                chosen,
                recommended
            );

            ctx.fillStyle =
                "rgba(159,181,202,0.70)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            ctx.textAlign = "right";

            ctx.fillText(
                "La recomendación depende de las condiciones definidas en el caso",
                viewWidth - 20,
                viewHeight - 18
            );

            ctx.restore();
        }

        function drawCaseScene(
            currentCase,
            chosen,
            recommended
        ) {
            const mobile =
                viewWidth < 680;

            const centerX =
                viewWidth / 2;

            const panelWidth =
                Math.min(
                    610,
                    viewWidth - 44
                );

            const panelX =
                (
                    viewWidth -
                    panelWidth
                ) / 2;

            const panelY =
                mobile
                    ? 105
                    : 105;

            roundedRectPath(
                panelX,
                panelY,
                panelWidth,
                mobile ? 170 : 145,
                14
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.90)";

            ctx.fill();

            ctx.strokeStyle =
                "rgba(192,132,252,0.35)";

            ctx.stroke();

            ctx.fillStyle =
                "#c084fc";

            ctx.beginPath();

            ctx.arc(
                centerX,
                panelY + 36,
                17,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "rgba(240,249,255,0.95)";

            ctx.font =
                "700 13px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                currentCase.title,
                centerX,
                panelY + 72
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.82)";

            ctx.font =
                "500 10px Segoe UI, sans-serif";

            wrapText(
                currentCase.criteria,
                centerX,
                panelY + 98,
                panelWidth - 40,
                15,
                4
            );

            if (!mobile) {
                const cardWidth =
                    Math.min(
                        320,
                        viewWidth * 0.38
                    );

                const cardHeight = 116;
                const leftX = 34;
                const rightX =
                    viewWidth -
                    cardWidth -
                    34;

                const y =
                    viewHeight -
                    cardHeight -
                    80;

                drawChoiceCard(
                    "ELECCIÓN DEL ESTUDIANTE",
                    chosen,
                    leftX,
                    y,
                    cardWidth,
                    cardHeight,
                    caseWasEvaluated &&
                    caseMediumSelect.value ===
                    currentCase.recommended
                );

                drawChoiceCard(
                    "RECOMENDACIÓN DIDÁCTICA",
                    recommended,
                    rightX,
                    y,
                    cardWidth,
                    cardHeight,
                    caseWasEvaluated
                );

                drawArrow(
                    leftX + cardWidth,
                    y + cardHeight / 2,
                    rightX,
                    y + cardHeight / 2,
                    caseWasEvaluated
                        ? "rgba(216,180,254,0.62)"
                        : "rgba(148,163,184,0.30)"
                );
            } else {
                const cardWidth =
                    viewWidth - 42;

                const cardHeight = 108;
                const x = 21;
                const firstY = 330;
                const secondY = 485;

                drawChoiceCard(
                    "ELECCIÓN DEL ESTUDIANTE",
                    chosen,
                    x,
                    firstY,
                    cardWidth,
                    cardHeight,
                    caseWasEvaluated &&
                    caseMediumSelect.value ===
                    currentCase.recommended
                );

                drawArrow(
                    viewWidth / 2,
                    firstY + cardHeight + 8,
                    viewWidth / 2,
                    secondY - 8,
                    caseWasEvaluated
                        ? "rgba(216,180,254,0.62)"
                        : "rgba(148,163,184,0.30)"
                );

                drawChoiceCard(
                    "RECOMENDACIÓN DIDÁCTICA",
                    recommended,
                    x,
                    secondY,
                    cardWidth,
                    cardHeight,
                    caseWasEvaluated
                );
            }
        }

        function drawChoiceCard(
            label,
            item,
            x,
            y,
            width,
            height,
            highlighted
        ) {
            ctx.save();

            if (highlighted) {
                ctx.shadowBlur = 22;
                ctx.shadowColor =
                    item.color;
            }

            roundedRectPath(
                x,
                y,
                width,
                height,
                11
            );

            ctx.fillStyle =
                "rgba(10,29,49,0.94)";

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                highlighted
                    ? item.color
                    : "rgba(125,211,252,0.17)";

            ctx.lineWidth =
                highlighted ? 2 : 1;

            ctx.stroke();

            ctx.fillStyle =
                highlighted
                    ? item.color
                    : "rgba(159,181,202,0.80)";

            ctx.font =
                "700 8px Segoe UI, sans-serif";

            ctx.textAlign = "center";

            ctx.fillText(
                label,
                x + width / 2,
                y + 22
            );

            ctx.fillStyle =
                "rgba(240,249,255,0.95)";

            ctx.font =
                "700 13px Segoe UI, sans-serif";

            ctx.fillText(
                item.title,
                x + width / 2,
                y + 53
            );

            ctx.fillStyle =
                "rgba(199,220,235,0.77)";

            ctx.font =
                "500 9px Segoe UI, sans-serif";

            wrapText(
                item.classification,
                x + width / 2,
                y + 76,
                width - 20,
                13,
                3
            );

            ctx.restore();
        }

        function selectBlockFromCanvas(event) {
            if (currentMode !== "blocks") {
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

            const selectedArea =
                blockHitAreas.find(
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

            if (selectedArea) {
                selectedBlockIndex =
                    selectedArea.index;

                updateInterface();
            }
        }

        function drawScene() {
            drawBackground();

            if (currentMode === "blocks") {
                drawBlocksMode();
            }

            if (currentMode === "media") {
                drawMediaMode();
            }

            if (currentMode === "cases") {
                drawCasesMode();
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

                if (elapsedTime > 10000) {
                    elapsedTime = 0;
                }
            }

            drawScene();
            updateMetrics();

            window.requestAnimationFrame(
                animate
            );
        }

        createSelectors();
        updateControlDisplays();
        setMode("blocks");

        window.requestAnimationFrame(
            function startAnimation(time) {
                lastFrameTime = time;
                animate(time);
            }
        );
    
