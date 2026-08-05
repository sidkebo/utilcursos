        "use strict";

        /*
         * SIT-400 — Clase 1
         * Fundamentos de telecomunicaciones.
         * Todo el simulador funciona sin librerías externas.
         */

        const canvas = document.getElementById("simulationCanvas");
        const canvasContainer = document.getElementById("canvasContainer");
        const ctx = canvas.getContext("2d");

        const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
        const canvasTitle = document.getElementById("canvasTitle");
        const simulationStatus = document.getElementById("simulationStatus");

        const metricLabel1 = document.getElementById("metricLabel1");
        const metricLabel2 = document.getElementById("metricLabel2");
        const metricLabel3 = document.getElementById("metricLabel3");
        const metricLabel4 = document.getElementById("metricLabel4");
        const metricValue1 = document.getElementById("metricValue1");
        const metricValue2 = document.getElementById("metricValue2");
        const metricValue3 = document.getElementById("metricValue3");
        const metricValue4 = document.getElementById("metricValue4");

        const informationControls = document.getElementById("informationControls");
        const comparisonControls = document.getElementById("comparisonControls");
        const mixedControls = document.getElementById("mixedControls");

        const exampleSelect = document.getElementById("exampleSelect");
        const informationSpeed = document.getElementById("informationSpeed");
        const informationSpeedDisplay = document.getElementById("informationSpeedDisplay");

        const analogAmplitude = document.getElementById("analogAmplitude");
        const analogAmplitudeDisplay = document.getElementById("analogAmplitudeDisplay");
        const analogFrequency = document.getElementById("analogFrequency");
        const analogFrequencyDisplay = document.getElementById("analogFrequencyDisplay");
        const bitRate = document.getElementById("bitRate");
        const bitRateDisplay = document.getElementById("bitRateDisplay");
        const logicHigh = document.getElementById("logicHigh");
        const logicHighDisplay = document.getElementById("logicHighDisplay");
        const physicalDigital = document.getElementById("physicalDigital");

        const mixedStageSelect = document.getElementById("mixedStageSelect");
        const mixedAutomatic = document.getElementById("mixedAutomatic");
        const mixedSpeed = document.getElementById("mixedSpeed");
        const mixedSpeedDisplay = document.getElementById("mixedSpeedDisplay");

        const pauseButton = document.getElementById("pauseButton");
        const continueButton = document.getElementById("continueButton");
        const restartButton = document.getElementById("restartButton");
        const explanation = document.getElementById("explanation");
        const technicalNote = document.getElementById("technicalNote");

        const digitalBits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];

        const examples = {
            command: {
                title: "Orden de control",
                information: "La bomba debe activarse",
                message: "Encender bomba 1",
                signal: "Pulso eléctrico o dato",
                medium: "Cable o enlace local",
                reception: "Controlador",
                recovered: "Orden reconocida",
                fault: "Conexión abierta",
                symptom: "La bomba no recibe la orden",
                color: "#38bdf8"
            },
            voice: {
                title: "Conversación de voz",
                information: "Contenido de la conversación",
                message: "Palabras pronunciadas",
                signal: "Señal acústica, eléctrica o de radio",
                medium: "Aire, cable o espacio",
                reception: "Equipo receptor",
                recovered: "Voz recuperada",
                fault: "Micrófono desconectado",
                symptom: "No se transmite la voz",
                color: "#34d399"
            },
            photo: {
                title: "Envío de una fotografía",
                information: "Imagen de una escena",
                message: "Fotografía representada como datos",
                signal: "Eléctrica, óptica o electromagnética",
                medium: "Cable, fibra o espacio",
                reception: "Equipo receptor",
                recovered: "Fotografía mostrada",
                fault: "Enlace interrumpido",
                symptom: "La imagen no llega",
                color: "#c084fc"
            },
            measurement: {
                title: "Medición de temperatura",
                information: "Temperatura observada",
                message: "Valor de temperatura",
                signal: "Tensión, corriente o dato",
                medium: "Cable o enlace inalámbrico",
                reception: "Sistema de supervisión",
                recovered: "Valor presentado",
                fault: "Sensor defectuoso",
                symptom: "Lectura incorrecta o ausente",
                color: "#fbbf24"
            },
            radio: {
                title: "Radio FM",
                information: "Música o voz",
                message: "Programa de audio",
                signal: "Onda electromagnética",
                medium: "Espacio",
                reception: "Radio receptor",
                recovered: "Sonido para el oyente",
                fault: "Antena desconectada",
                symptom: "Audio débil, con ruido o ausente",
                color: "#22d3ee"
            },
            cellular: {
                title: "Telefonía celular",
                information: "Voz, texto, imagen o datos",
                message: "Conversación, mensaje o archivo",
                signal: "Onda electromagnética en el tramo radio",
                medium: "Espacio y red del operador",
                reception: "Estación base y teléfono destino",
                recovered: "Contenido para el usuario",
                fault: "Fuera de cobertura",
                symptom: "No establece llamada o pierde datos",
                color: "#a78bfa"
            },
            wifi: {
                title: "Internet mediante Wi-Fi",
                information: "Datos solicitados o enviados",
                message: "Página, video, archivo o correo",
                signal: "Onda electromagnética Wi-Fi",
                medium: "Aire en el tramo local",
                reception: "Router o dispositivo",
                recovered: "Datos recibidos",
                fault: "Wi-Fi activo sin proveedor",
                symptom: "Conecta al router, pero no hay Internet",
                color: "#34d399"
            },
            fiber: {
                title: "Enlace de fibra óptica",
                information: "Datos",
                message: "Archivo, video, voz o servicio",
                signal: "Variación de luz",
                medium: "Fibra óptica",
                reception: "Detector óptico",
                recovered: "Datos eléctricos recuperados",
                fault: "Fibra doblada o dañada",
                symptom: "Señal débil, errores o pérdida de enlace",
                color: "#fb923c"
            }
        };

        const mixedStages = [
            {
                title: "Voz acústica",
                type: "Analógica",
                description: "La persona produce variaciones de presión en el aire.",
                color: "#38bdf8",
                icon: "sound"
            },
            {
                title: "Micrófono y señal eléctrica",
                type: "Transducción",
                description: "El micrófono convierte sonido en una señal eléctrica.",
                color: "#22d3ee",
                icon: "microphone"
            },
            {
                title: "Procesamiento del teléfono A",
                type: "Digital",
                description: "El teléfono procesa la información internamente como datos.",
                color: "#34d399",
                icon: "bits"
            },
            {
                title: "Enlace de radio",
                type: "Electromagnética",
                description: "La onda electromagnética viaja entre teléfono y estación base.",
                color: "#c084fc",
                icon: "antenna"
            },
            {
                title: "Estación base y red",
                type: "Sistema",
                description: "La red del operador transporta la comunicación hacia el destino.",
                color: "#fbbf24",
                icon: "network"
            },
            {
                title: "Teléfono B y recepción",
                type: "Mixto",
                description: "El teléfono destino recibe, procesa y prepara la información.",
                color: "#a78bfa",
                icon: "receiver"
            },
            {
                title: "Altavoz y sonido recuperado",
                type: "Analógica",
                description: "El altavoz vuelve a producir una señal acústica.",
                color: "#fb7185",
                icon: "speaker"
            }
        ];

        let currentMode = "information";
        let elapsedTime = 0;
        let lastFrameTime = performance.now();
        let isPaused = false;
        let viewWidth = 1000;
        let viewHeight = 560;
        let devicePixelRatioValue = 1;

        modeButtons.forEach((button) => {
            button.addEventListener("click", () => setMode(button.dataset.mode));
        });

        exampleSelect.addEventListener("change", restartSimulation);
        informationSpeed.addEventListener("input", updateControlDisplays);
        analogAmplitude.addEventListener("input", updateControlDisplays);
        analogFrequency.addEventListener("input", updateControlDisplays);
        bitRate.addEventListener("input", updateControlDisplays);
        logicHigh.addEventListener("input", updateControlDisplays);
        physicalDigital.addEventListener("change", updateControlDisplays);
        mixedStageSelect.addEventListener("change", () => {
            elapsedTime = 0;
            updateMetrics();
        });
        mixedAutomatic.addEventListener("change", () => {
            elapsedTime = 0;
            updateMixedControlState();
            updateMetrics();
        });
        mixedSpeed.addEventListener("input", updateControlDisplays);
        pauseButton.addEventListener("click", pauseSimulation);
        continueButton.addEventListener("click", continueSimulation);
        restartButton.addEventListener("click", restartSimulation);
        window.addEventListener("resize", resizeCanvas);

        function formatNumber(value, decimals = 1) {
            return Number(value).toFixed(decimals).replace(".", ",");
        }

        function clamp(value, minimum, maximum) {
            return Math.min(maximum, Math.max(minimum, value));
        }

        function smoothStep(value) {
            const normalized = clamp(value, 0, 1);
            return normalized * normalized * (3 - 2 * normalized);
        }

        function resizeCanvas() {
            viewWidth = Math.max(300, canvasContainer.clientWidth);

            if (viewWidth < 680) {
                viewHeight = currentMode === "compare" ? 720 : 770;
            } else {
                viewHeight = currentMode === "compare" ? 620 : 560;
            }

            devicePixelRatioValue = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(viewWidth * devicePixelRatioValue);
            canvas.height = Math.round(viewHeight * devicePixelRatioValue);
            canvas.style.width = `${viewWidth}px`;
            canvas.style.height = `${viewHeight}px`;

            ctx.setTransform(
                devicePixelRatioValue,
                0,
                0,
                devicePixelRatioValue,
                0,
                0
            );
        }

        function setMode(mode) {
            currentMode = mode;
            elapsedTime = 0;

            modeButtons.forEach((button) => {
                const active = button.dataset.mode === mode;
                button.classList.toggle("active", active);
                button.setAttribute("aria-selected", String(active));
            });

            informationControls.hidden = mode !== "information";
            comparisonControls.hidden = mode !== "compare";
            mixedControls.hidden = mode !== "mixed";

            explanation.classList.remove("digital-mode", "mixed-mode");

            if (mode === "information") {
                canvasTitle.textContent = "Recorrido de la información y análisis de sistemas reales";
                explanation.innerHTML =
                    "<strong>Información, mensaje, señal y medio:</strong> " +
                    "la información es el contenido útil; el mensaje es la forma concreta de expresarlo; " +
                    "la señal es una magnitud física medible que lo representa; y el medio es el camino por donde se propaga.";
                technicalNote.innerHTML =
                    "<strong>Telecomunicación:</strong> comunicación de información a distancia mediante señales. " +
                    "No confundas señal con medio: en fibra, la señal es luz y el medio es la fibra; en Wi-Fi, " +
                    "la señal es electromagnética y el medio local es el aire o espacio.";
            } else if (mode === "compare") {
                canvasTitle.textContent = "Comparación entre señal analógica y señal digital";
                explanation.classList.add("digital-mode");
                explanation.innerHTML =
                    "<strong>Analógico vs. digital:</strong> una señal analógica varía continuamente y puede adoptar valores intermedios. " +
                    "Una señal digital se interpreta mediante niveles o símbolos definidos. La secuencia digital mostrada proviene de bits reales del simulador, " +
                    "no de recortar una señal senoidal.";
                technicalNote.innerHTML =
                    "<strong>Dirección corregida:</strong> ambas señales avanzan visualmente de izquierda a derecha. " +
                    "La señal digital real puede presentar ruido, bordes no ideales y deformación. No toda onda cuadrada contiene datos y una señal digital no se corrige automáticamente.";
            } else {
                canvasTitle.textContent = "Telefonía celular como sistema mixto";
                explanation.classList.add("mixed-mode");
                explanation.innerHTML =
                    "<strong>Sistema mixto:</strong> la telefonía celular combina voz acústica, señal eléctrica, procesamiento digital, " +
                    "enlace electromagnético, estación base, red del operador, recepción y sonido recuperado. " +
                    "La etapa permanece fija hasta que el docente seleccione otra o active el recorrido automático.";
                technicalNote.innerHTML =
                    "<strong>Alcance de la Clase 1:</strong> el recorrido es funcional y simplificado. " +
                    "No desarrolla 4G, 5G, modulación, protocolos, muestreo, cuantificación ni diseño de antenas. " +
                    "Los arcos de radio indican propagación; no representan una trayectoria ondulada seguida por la energía.";
            }

            resizeCanvas();
            updateMetrics();
        }

        function updateControlDisplays() {
            informationSpeedDisplay.textContent = `${formatNumber(informationSpeed.value)}×`;
            analogAmplitudeDisplay.textContent = `${formatNumber(analogAmplitude.value)} V`;
            analogFrequencyDisplay.textContent = `${formatNumber(analogFrequency.value)} Hz`;
            bitRateDisplay.textContent = `${formatNumber(bitRate.value)} bit/s`;
            logicHighDisplay.textContent = `${formatNumber(logicHigh.value)} V`;
            mixedSpeedDisplay.textContent = `${formatNumber(mixedSpeed.value)}×`;
            updateMixedControlState();
        }

        function updateMixedControlState() {
            mixedSpeed.disabled = !mixedAutomatic.checked;
        }

        function getMixedStageState() {
            if (!mixedAutomatic.checked) {
                return {
                    currentStage: Number(mixedStageSelect.value),
                    localProgress: 0,
                    normalizedCycle: Number(mixedStageSelect.value) / mixedStages.length
                };
            }

            const speed = Number(mixedSpeed.value);
            const cycleDuration = 10 / speed;
            const normalizedCycle = (elapsedTime % cycleDuration) / cycleDuration;
            const stageProgress = normalizedCycle * mixedStages.length;
            const currentStage = Math.min(mixedStages.length - 1, Math.floor(stageProgress));

            return {
                currentStage,
                localProgress: stageProgress - currentStage,
                normalizedCycle
            };
        }

        function pauseSimulation() {
            isPaused = true;
            pauseButton.disabled = true;
            continueButton.disabled = false;
            simulationStatus.textContent = "Simulación pausada";
            simulationStatus.classList.add("paused");
        }

        function continueSimulation() {
            isPaused = false;
            lastFrameTime = performance.now();
            pauseButton.disabled = false;
            continueButton.disabled = true;
            simulationStatus.textContent = "Simulación activa";
            simulationStatus.classList.remove("paused");
        }

        function restartSimulation() {
            elapsedTime = 0;
            isPaused = false;
            lastFrameTime = performance.now();
            pauseButton.disabled = false;
            continueButton.disabled = true;
            simulationStatus.textContent = "Simulación activa";
            simulationStatus.classList.remove("paused");
            updateMetrics();
        }

        function drawBackground() {
            const gradient = ctx.createLinearGradient(0, 0, viewWidth, viewHeight);
            gradient.addColorStop(0, "#020817");
            gradient.addColorStop(0.56, "#071426");
            gradient.addColorStop(1, "#081a2e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, viewWidth, viewHeight);

            ctx.save();
            ctx.strokeStyle = "rgba(125, 211, 252, 0.045)";
            ctx.lineWidth = 1;

            for (let x = 0; x <= viewWidth; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, viewHeight);
                ctx.stroke();
            }

            for (let y = 0; y <= viewHeight; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(viewWidth, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        function roundedRectanglePath(x, y, width, height, radius) {
            const r = Math.min(radius, width / 2, height / 2);
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + width - r, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + r);
            ctx.lineTo(x + width, y + height - r);
            ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
            ctx.lineTo(x + r, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }

        function wrapText(text, x, y, maxWidth, lineHeight, maxLines = 3) {
            const words = String(text).split(" ");
            const lines = [];
            let line = "";

            for (const word of words) {
                const test = line ? `${line} ${word}` : word;
                if (ctx.measureText(test).width > maxWidth && line) {
                    lines.push(line);
                    line = word;
                    if (lines.length === maxLines - 1) {
                        break;
                    }
                } else {
                    line = test;
                }
            }

            if (line && lines.length < maxLines) {
                lines.push(line);
            }

            lines.forEach((currentLine, index) => {
                ctx.fillText(currentLine, x, y + index * lineHeight);
            });
        }

        function drawArrow(fromX, fromY, toX, toY, color = "rgba(186,230,253,0.58)", width = 1.4) {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const head = 8;

            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(
                toX - head * Math.cos(angle - Math.PI / 6),
                toY - head * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                toX - head * Math.cos(angle + Math.PI / 6),
                toY - head * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function drawGlowPoint(x, y, color, radius = 5) {
            const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
            glow.addColorStop(0, "rgba(255,255,255,1)");
            glow.addColorStop(0.20, color);
            glow.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawInformationCard(card, x, y, width, height, active) {
            ctx.save();

            if (active) {
                ctx.shadowBlur = 23;
                ctx.shadowColor = card.color;
            }

            const gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, active ? "rgba(20, 53, 83, 0.97)" : "rgba(10, 29, 49, 0.92)");
            gradient.addColorStop(1, "rgba(3, 13, 28, 0.96)");

            roundedRectanglePath(x, y, width, height, 12);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = active ? card.color : "rgba(125,211,252,0.18)";
            ctx.lineWidth = active ? 2 : 1;
            ctx.stroke();

            ctx.fillStyle = card.color;
            roundedRectanglePath(x + 12, y + 12, Math.max(42, width - 24), 5, 3);
            ctx.fill();

            ctx.fillStyle = "rgba(186, 230, 253, 0.82)";
            ctx.font = "700 9px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(card.label, x + width / 2, y + 39);

            ctx.fillStyle = active ? "#f5fcff" : "rgba(226,242,255,0.91)";
            ctx.font = active ? "700 13px Segoe UI, sans-serif" : "600 12px Segoe UI, sans-serif";
            wrapText(card.value, x + width / 2, y + 72, width - 24, 18, height < 110 ? 2 : 5);
            ctx.restore();
        }

        function drawInformationMode() {
            const example = examples[exampleSelect.value];
            const speed = Number(informationSpeed.value);
            const cycleDuration = 8 / speed;
            const normalizedCycle = (elapsedTime % cycleDuration) / cycleDuration;
            const stageProgress = normalizedCycle * 6;
            const currentStage = Math.min(5, Math.floor(stageProgress));
            const localProgress = stageProgress - currentStage;

            const cards = [
                { label: "INFORMACIÓN", value: example.information, color: "#38bdf8" },
                { label: "MENSAJE", value: example.message, color: "#22d3ee" },
                { label: "SEÑAL", value: example.signal, color: "#34d399" },
                { label: "MEDIO", value: example.medium, color: "#fbbf24" },
                { label: "RECEPCIÓN", value: example.reception, color: "#c084fc" },
                { label: "MENSAJE RECUPERADO", value: example.recovered, color: "#fb7185" }
            ];

            ctx.save();
            ctx.fillStyle = "rgba(240,249,255,0.94)";
            ctx.font = "700 16px Segoe UI, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(example.title, 26, 33);

            ctx.fillStyle = "rgba(159,181,202,0.84)";
            ctx.font = "600 10px Segoe UI, sans-serif";
            ctx.fillText("tele = a distancia · telecomunicación = información a distancia mediante señales", 26, 52);

            const isMobile = viewWidth < 680;
            const positions = [];

            if (!isMobile) {
                const marginX = 24;
                const gap = 15;
                const cardWidth = (viewWidth - marginX * 2 - gap * 5) / 6;
                const cardHeight = 198;
                const cardY = 92;

                cards.forEach((card, index) => {
                    const cardX = marginX + index * (cardWidth + gap);
                    drawInformationCard(card, cardX, cardY, cardWidth, cardHeight, index === currentStage);
                    positions.push({ x: cardX, y: cardY, width: cardWidth, height: cardHeight });

                    if (index < cards.length - 1) {
                        drawArrow(
                            cardX + cardWidth + 3,
                            cardY + cardHeight / 2,
                            cardX + cardWidth + gap - 3,
                            cardY + cardHeight / 2
                        );
                    }
                });

                drawFaultPanel(example, 24, 330, viewWidth - 48, 130);
            } else {
                const marginX = 18;
                const cardWidth = viewWidth - marginX * 2;
                const cardHeight = 83;
                const gap = 13;
                const startY = 70;

                cards.forEach((card, index) => {
                    const cardY = startY + index * (cardHeight + gap);
                    drawInformationCard(card, marginX, cardY, cardWidth, cardHeight, index === currentStage);
                    positions.push({ x: marginX, y: cardY, width: cardWidth, height: cardHeight });

                    if (index < cards.length - 1) {
                        drawArrow(
                            viewWidth / 2,
                            cardY + cardHeight + 1,
                            viewWidth / 2,
                            cardY + cardHeight + gap - 1
                        );
                    }
                });

                drawFaultPanel(example, 18, 655, viewWidth - 36, 86);
            }

            if (currentStage < positions.length - 1) {
                const current = positions[currentStage];
                const next = positions[currentStage + 1];
                let pointX;
                let pointY;

                if (!isMobile) {
                    pointX = current.x + current.width + (next.x - current.x - current.width) * localProgress;
                    pointY = current.y + current.height / 2;
                } else {
                    pointX = viewWidth / 2;
                    pointY = current.y + current.height + (next.y - current.y - current.height) * localProgress;
                }

                drawGlowPoint(pointX, pointY, example.color, 4);
            }

            ctx.fillStyle = "rgba(159,181,202,0.70)";
            ctx.font = "500 10px Segoe UI, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("Secuencia funcional simplificada · no representa tiempos reales", viewWidth - 22, viewHeight - 17);
            ctx.restore();
        }

        function drawFaultPanel(example, x, y, width, height) {
            ctx.save();
            roundedRectanglePath(x, y, width, height, 12);
            ctx.fillStyle = "rgba(5, 15, 31, 0.82)";
            ctx.fill();
            ctx.strokeStyle = "rgba(251, 113, 133, 0.23)";
            ctx.stroke();

            const centerX = x + width / 2;
            ctx.fillStyle = "#fb7185";
            ctx.font = "700 10px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("DIAGNÓSTICO BÁSICO POR BLOQUES", centerX, y + 24);

            ctx.fillStyle = "rgba(226,242,255,0.92)";
            ctx.font = "700 12px Segoe UI, sans-serif";
            ctx.fillText(`Falla posible: ${example.fault}`, centerX, y + 52);

            ctx.fillStyle = "rgba(183,203,220,0.82)";
            ctx.font = "600 11px Segoe UI, sans-serif";
            ctx.fillText(`Síntoma esperado: ${example.symptom}`, centerX, y + 77);

            if (height > 100) {
                ctx.fillStyle = "rgba(159,181,202,0.70)";
                ctx.font = "500 10px Segoe UI, sans-serif";
                ctx.fillText("Pregunta técnica: ¿en qué bloque se origina la falla y qué señal debería comprobarse?", centerX, y + 105);
            }
            ctx.restore();
        }

        function drawPlotFrame(plot, title, color) {
            ctx.save();
            roundedRectanglePath(plot.x, plot.y, plot.width, plot.height, 11);
            ctx.fillStyle = "rgba(2, 10, 24, 0.58)";
            ctx.fill();
            ctx.strokeStyle = "rgba(125, 211, 252, 0.15)";
            ctx.stroke();

            ctx.save();
            roundedRectanglePath(plot.x, plot.y, plot.width, plot.height, 11);
            ctx.clip();
            ctx.strokeStyle = "rgba(125,211,252,0.06)";

            for (let x = plot.x; x <= plot.x + plot.width; x += Math.max(35, plot.width / 12)) {
                ctx.beginPath();
                ctx.moveTo(x, plot.y);
                ctx.lineTo(x, plot.y + plot.height);
                ctx.stroke();
            }

            for (let y = plot.y; y <= plot.y + plot.height; y += Math.max(32, plot.height / 5)) {
                ctx.beginPath();
                ctx.moveTo(plot.x, y);
                ctx.lineTo(plot.x + plot.width, y);
                ctx.stroke();
            }
            ctx.restore();

            ctx.fillStyle = color;
            ctx.font = "700 10px Segoe UI, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(title, plot.x + 12, plot.y - 13);

            ctx.fillStyle = "rgba(186,230,253,0.67)";
            ctx.font = "600 9px Segoe UI, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("TIEMPO Y PROPAGACIÓN VISUAL →", plot.x + plot.width, plot.y + plot.height + 17);
            ctx.restore();
        }

        function drawComparisonMode() {
            const amplitudeValue = Number(analogAmplitude.value);
            const frequencyValue = Number(analogFrequency.value);
            const bitRateValue = Number(bitRate.value);
            const logicHighValue = Number(logicHigh.value);

            const marginLeft = viewWidth < 680 ? 56 : 74;
            const marginRight = 24;
            const topMargin = 54;
            const bottomMargin = 72;
            const sectionGap = 56;
            const availableHeight = viewHeight - topMargin - bottomMargin - sectionGap;
            const plotHeight = availableHeight / 2;
            const plotWidth = viewWidth - marginLeft - marginRight;

            const analogPlot = { x: marginLeft, y: topMargin, width: plotWidth, height: plotHeight };
            const digitalPlot = {
                x: marginLeft,
                y: topMargin + plotHeight + sectionGap,
                width: plotWidth,
                height: plotHeight
            };

            drawPlotFrame(analogPlot, "SEÑAL ANALÓGICA CONTINUA", "#38bdf8");
            drawPlotFrame(digitalPlot, "SEÑAL DIGITAL BINARIA POR NIVELES", "#34d399");
            drawAnalogWave(analogPlot, amplitudeValue, frequencyValue);
            drawDigitalWave(digitalPlot, bitRateValue, logicHighValue, physicalDigital.checked);

            ctx.save();
            ctx.fillStyle = "rgba(159,181,202,0.72)";
            ctx.font = "500 10px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
                "Naturaleza física: eléctrica, óptica, electromagnética o acústica · Representación: analógica o digital · Condición: limpia, atenuada, ruidosa o distorsionada",
                viewWidth / 2,
                viewHeight - 24
            );
            ctx.restore();
        }

        function drawAnalogWave(plot, amplitudeValue, frequencyValue) {
            const centerY = plot.y + plot.height / 2;
            const amplitudePixels = Math.min(
                plot.height * 0.37,
                35 + ((amplitudeValue - 1) / 4) * plot.height * 0.24
            );
            const viewTime = 3;

            ctx.save();
            ctx.strokeStyle = "rgba(186,230,253,0.24)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([6, 7]);
            ctx.beginPath();
            ctx.moveTo(plot.x, centerY);
            ctx.lineTo(plot.x + plot.width, centerY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(186,230,253,0.78)";
            ctx.font = "700 9px Segoe UI, sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(`+${formatNumber(amplitudeValue)} V`, plot.x - 8, plot.y + 18);
            ctx.fillText("0 V", plot.x - 8, centerY);
            ctx.fillText(`−${formatNumber(amplitudeValue)} V`, plot.x - 8, plot.y + plot.height - 18);

            drawAnalogWavePass(plot, centerY, amplitudePixels, frequencyValue, viewTime, 12, "rgba(56,189,248,0.15)", 22);
            drawAnalogWavePass(plot, centerY, amplitudePixels, frequencyValue, viewTime, 4.5, "rgba(56,189,248,0.65)", 13);
            drawAnalogWavePass(plot, centerY, amplitudePixels, frequencyValue, viewTime, 1.7, "rgba(232,251,255,0.96)", 5);
            ctx.restore();
        }

        function drawAnalogWavePass(plot, centerY, amplitudePixels, frequencyValue, viewTime, lineWidth, strokeStyle, shadowBlur) {
            ctx.beginPath();

            for (let x = plot.x; x <= plot.x + plot.width; x += 2) {
                const normalizedX = (x - plot.x) / plot.width;
                const displayedTime = normalizedX * viewTime;

                /* displayedTime - elapsedTime produce desplazamiento visual hacia la derecha. */
                const phase = Math.PI * 2 * frequencyValue * (displayedTime - elapsedTime);
                const y = centerY - Math.sin(phase) * amplitudePixels;

                if (x === plot.x) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = "#38bdf8";
            ctx.stroke();
        }

        function getDigitalBit(rawIndex) {
            const normalizedIndex = ((rawIndex % digitalBits.length) + digitalBits.length) % digitalBits.length;
            return digitalBits[normalizedIndex];
        }

        function drawDigitalWave(plot, bitRateValue, logicHighValue, showPhysical) {
            const highY = plot.y + plot.height * 0.28;
            const lowY = plot.y + plot.height * 0.74;
            const viewTime = 5;

            ctx.save();
            ctx.strokeStyle = "rgba(186,230,253,0.18)";
            ctx.setLineDash([6, 7]);
            ctx.beginPath();
            ctx.moveTo(plot.x, highY);
            ctx.lineTo(plot.x + plot.width, highY);
            ctx.moveTo(plot.x, lowY);
            ctx.lineTo(plot.x + plot.width, lowY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(186,230,253,0.78)";
            ctx.font = "700 9px Segoe UI, sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(`${formatNumber(logicHighValue)} V`, plot.x - 8, highY);
            ctx.fillText("0 V", plot.x - 8, lowY);

            ctx.fillStyle = "rgba(110,231,183,0.88)";
            ctx.textAlign = "left";
            ctx.fillText("BIT 1 · NIVEL ALTO", plot.x + 12, highY - 18);
            ctx.fillStyle = "rgba(167,243,208,0.72)";
            ctx.fillText("BIT 0 · NIVEL BAJO", plot.x + 12, lowY + 18);

            if (showPhysical) {
                drawIdealDigitalReference(plot, bitRateValue, highY, lowY, viewTime);
            }

            drawDigitalWavePass(plot, bitRateValue, highY, lowY, viewTime, showPhysical, 12, "rgba(52,211,153,0.15)", 21);
            drawDigitalWavePass(plot, bitRateValue, highY, lowY, viewTime, showPhysical, 4.5, "rgba(52,211,153,0.67)", 13);
            drawDigitalWavePass(plot, bitRateValue, highY, lowY, viewTime, showPhysical, 1.8, "rgba(232,255,244,0.96)", 5);
            drawBitLabels(plot, bitRateValue, highY, lowY, viewTime);
            ctx.restore();
        }

        function drawIdealDigitalReference(plot, bitRateValue, highY, lowY, viewTime) {
            let previousBit = null;
            let previousY = lowY;

            ctx.save();
            ctx.beginPath();

            for (let x = plot.x; x <= plot.x + plot.width; x += 1) {
                const normalizedX = (x - plot.x) / plot.width;

                /*
                 * Corrección de dirección:
                 * normalizedX * viewTime - elapsedTime hace que los bits
                 * se desplacen visualmente de izquierda a derecha.
                 */
                const signalTime = normalizedX * viewTime - elapsedTime;
                const rawIndex = Math.floor(signalTime * bitRateValue);
                const bit = getDigitalBit(rawIndex);
                const currentY = bit === 1 ? highY : lowY;

                if (x === plot.x) {
                    ctx.moveTo(x, currentY);
                } else if (previousBit !== null && bit !== previousBit) {
                    ctx.lineTo(x, previousY);
                    ctx.lineTo(x, currentY);
                } else {
                    ctx.lineTo(x, currentY);
                }

                previousBit = bit;
                previousY = currentY;
            }

            ctx.strokeStyle = "rgba(226,242,254,0.20)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        function drawDigitalWavePass(plot, bitRateValue, highY, lowY, viewTime, showPhysical, lineWidth, strokeStyle, shadowBlur) {
            ctx.beginPath();

            for (let x = plot.x; x <= plot.x + plot.width; x += 1) {
                const normalizedX = (x - plot.x) / plot.width;
                const signalTime = normalizedX * viewTime - elapsedTime;
                const bitPosition = signalTime * bitRateValue;
                const rawIndex = Math.floor(bitPosition);
                const fraction = bitPosition - rawIndex;
                const currentBit = getDigitalBit(rawIndex);
                const previousBit = getDigitalBit(rawIndex - 1);

                let normalizedLevel = currentBit;

                if (showPhysical && currentBit !== previousBit) {
                    const transitionFraction = 0.13;
                    const transitionProgress = smoothStep(fraction / transitionFraction);
                    normalizedLevel = previousBit + (currentBit - previousBit) * transitionProgress;
                }

                let y = lowY - normalizedLevel * (lowY - highY);

                if (showPhysical) {
                    y += Math.sin(signalTime * 31) * 0.8;
                }

                if (x === plot.x) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = "#34d399";
            ctx.stroke();
        }

        function drawBitLabels(plot, bitRateValue, highY, lowY, viewTime) {
            const bitDuration = 1 / bitRateValue;
            const firstIndex = Math.floor((-elapsedTime) / bitDuration) - 1;
            const lastIndex = Math.ceil((viewTime - elapsedTime) / bitDuration) + 1;

            ctx.save();
            ctx.font = "700 10px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let rawIndex = firstIndex; rawIndex <= lastIndex; rawIndex++) {
                const bitCenterTime = (rawIndex + 0.5) * bitDuration;

                /* signalTime = screenTime - elapsedTime; por tanto screenTime = bitCenterTime + elapsedTime. */
                const screenTime = bitCenterTime + elapsedTime;
                const x = plot.x + (screenTime / viewTime) * plot.width;

                if (x < plot.x || x > plot.x + plot.width) {
                    continue;
                }

                const bit = getDigitalBit(rawIndex);
                ctx.fillStyle = bit === 1 ? "rgba(232,255,244,0.92)" : "rgba(167,243,208,0.70)";
                ctx.fillText(String(bit), x, bit === 1 ? highY - 31 : lowY + 31);
            }
            ctx.restore();
        }

        function drawMixedMode() {
            const mixedState = getMixedStageState();
            const currentStage = mixedState.currentStage;
            const localProgress = mixedState.localProgress;
            const isMobile = viewWidth < 680;
            const positions = [];

            ctx.save();
            ctx.fillStyle = "rgba(240,249,255,0.94)";
            ctx.font = "700 16px Segoe UI, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("Telefonía celular: sistema mixto y recorrido real simplificado", 24, 34);

            ctx.fillStyle = "rgba(159,181,202,0.82)";
            ctx.font = "500 10px Segoe UI, sans-serif";
            ctx.fillText("Los teléfonos normalmente se comunican mediante estación base y red del operador", 24, 52);

            if (!isMobile) {
                const marginX = 22;
                const gap = 11;
                const cardWidth = (viewWidth - marginX * 2 - gap * (mixedStages.length - 1)) / mixedStages.length;
                const cardHeight = 238;
                const cardY = 110;

                mixedStages.forEach((stage, index) => {
                    const cardX = marginX + index * (cardWidth + gap);
                    drawMixedStageCard(stage, cardX, cardY, cardWidth, cardHeight, index === currentStage);
                    positions.push({ x: cardX, y: cardY, width: cardWidth, height: cardHeight });

                    if (index < mixedStages.length - 1) {
                        drawArrow(
                            cardX + cardWidth + 2,
                            cardY + cardHeight / 2,
                            cardX + cardWidth + gap - 2,
                            cardY + cardHeight / 2,
                            "rgba(216,180,254,0.55)"
                        );
                    }
                });
            } else {
                const marginX = 17;
                const gap = 12;
                const cardWidth = viewWidth - marginX * 2;
                const cardHeight = 82;
                const startY = 70;

                mixedStages.forEach((stage, index) => {
                    const cardY = startY + index * (cardHeight + gap);
                    drawMixedStageCard(stage, marginX, cardY, cardWidth, cardHeight, index === currentStage);
                    positions.push({ x: marginX, y: cardY, width: cardWidth, height: cardHeight });

                    if (index < mixedStages.length - 1) {
                        drawArrow(
                            viewWidth / 2,
                            cardY + cardHeight + 1,
                            viewWidth / 2,
                            cardY + cardHeight + gap - 1,
                            "rgba(216,180,254,0.55)"
                        );
                    }
                });
            }

            if (mixedAutomatic.checked && currentStage < positions.length - 1) {
                const current = positions[currentStage];
                const next = positions[currentStage + 1];
                let pointX;
                let pointY;

                if (!isMobile) {
                    pointX = current.x + current.width + (next.x - current.x - current.width) * localProgress;
                    pointY = current.y + current.height / 2;
                } else {
                    pointX = viewWidth / 2;
                    pointY = current.y + current.height + (next.y - current.y - current.height) * localProgress;
                }

                drawGlowPoint(pointX, pointY, mixedStages[currentStage].color, 4);
            }

            const activeStage = mixedStages[currentStage];
            ctx.fillStyle = "rgba(226,242,254,0.92)";
            ctx.font = "700 11px Segoe UI, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`Etapa activa: ${activeStage.title}`, 24, viewHeight - 34);

            ctx.fillStyle = "rgba(159,181,202,0.72)";
            ctx.font = "500 9px Segoe UI, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("Recorrido funcional simplificado · no representa tiempos reales", viewWidth - 22, viewHeight - 17);
            ctx.restore();
        }

        function drawMixedStageCard(stage, x, y, width, height, active) {
            ctx.save();

            if (active) {
                ctx.shadowBlur = 24;
                ctx.shadowColor = stage.color;
            }

            const gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, active ? "rgba(40, 28, 73, 0.97)" : "rgba(15, 27, 50, 0.94)");
            gradient.addColorStop(1, "rgba(3, 13, 28, 0.97)");

            roundedRectanglePath(x, y, width, height, 12);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = active ? stage.color : "rgba(192,132,252,0.18)";
            ctx.lineWidth = active ? 2 : 1;
            ctx.stroke();

            const compact = height < 100;
            const iconX = compact ? x + 39 : x + width / 2;
            const iconY = compact ? y + height / 2 : y + 58;
            drawStageIcon(stage.icon, iconX, iconY, stage.color, compact ? 22 : 28);

            if (compact) {
                ctx.textAlign = "left";
                ctx.fillStyle = active ? "#f6f0ff" : "rgba(237,232,255,0.91)";
                ctx.font = "700 12px Segoe UI, sans-serif";
                ctx.fillText(stage.title, x + 78, y + 27);
                ctx.fillStyle = stage.color;
                ctx.font = "700 8px Segoe UI, sans-serif";
                ctx.fillText(stage.type.toUpperCase(), x + 78, y + 43);
                ctx.fillStyle = "rgba(184,202,220,0.77)";
                ctx.font = "500 9px Segoe UI, sans-serif";
                wrapText(stage.description, x + 78, y + 59, width - 92, 13, 2);
            } else {
                ctx.textAlign = "center";
                ctx.fillStyle = active ? "#f6f0ff" : "rgba(237,232,255,0.91)";
                ctx.font = "700 11px Segoe UI, sans-serif";
                wrapText(stage.title, x + width / 2, y + 103, width - 18, 15, 3);
                ctx.fillStyle = stage.color;
                ctx.font = "700 8px Segoe UI, sans-serif";
                ctx.fillText(stage.type.toUpperCase(), x + width / 2, y + 151);
                ctx.fillStyle = "rgba(184,202,220,0.75)";
                ctx.font = "500 8.5px Segoe UI, sans-serif";
                wrapText(stage.description, x + width / 2, y + 176, width - 18, 13, 4);
            }
            ctx.restore();
        }

        function drawStageIcon(icon, x, y, color, size) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            if (icon === "sound" || icon === "speaker") {
                ctx.beginPath();
                ctx.moveTo(x - size * 0.70, y - size * 0.25);
                ctx.lineTo(x - size * 0.35, y - size * 0.25);
                ctx.lineTo(x, y - size * 0.62);
                ctx.lineTo(x, y + size * 0.62);
                ctx.lineTo(x - size * 0.35, y + size * 0.25);
                ctx.lineTo(x - size * 0.70, y + size * 0.25);
                ctx.closePath();
                ctx.stroke();

                for (let index = 1; index <= 2; index++) {
                    ctx.beginPath();
                    ctx.arc(x, y, size * (0.38 + index * 0.25), -Math.PI / 3, Math.PI / 3);
                    ctx.stroke();
                }
            } else if (icon === "microphone") {
                roundedRectanglePath(x - size * 0.32, y - size * 0.70, size * 0.64, size * 0.95, size * 0.28);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, size * 0.58, 0, Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y + size * 0.58);
                ctx.lineTo(x, y + size * 0.85);
                ctx.moveTo(x - size * 0.35, y + size * 0.85);
                ctx.lineTo(x + size * 0.35, y + size * 0.85);
                ctx.stroke();
            } else if (icon === "bits") {
                ctx.font = `700 ${Math.max(14, size * 0.75)}px Consolas, monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("1010", x, y);
            } else if (icon === "antenna") {
                ctx.beginPath();
                ctx.moveTo(x, y - size * 0.72);
                ctx.lineTo(x, y + size * 0.65);
                ctx.moveTo(x - size * 0.42, y + size * 0.65);
                ctx.lineTo(x + size * 0.42, y + size * 0.65);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y - size * 0.32, size * 0.45, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y - size * 0.32, size * 0.82, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();
            } else if (icon === "network") {
                const nodes = [
                    [x, y - size * 0.55],
                    [x - size * 0.55, y + size * 0.42],
                    [x + size * 0.55, y + size * 0.42]
                ];
                ctx.beginPath();
                ctx.moveTo(nodes[0][0], nodes[0][1]);
                ctx.lineTo(nodes[1][0], nodes[1][1]);
                ctx.moveTo(nodes[0][0], nodes[0][1]);
                ctx.lineTo(nodes[2][0], nodes[2][1]);
                ctx.moveTo(nodes[1][0], nodes[1][1]);
                ctx.lineTo(nodes[2][0], nodes[2][1]);
                ctx.stroke();
                nodes.forEach(([nodeX, nodeY]) => {
                    ctx.beginPath();
                    ctx.arc(nodeX, nodeY, size * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (icon === "receiver") {
                roundedRectanglePath(x - size * 0.55, y - size * 0.80, size * 1.10, size * 1.60, size * 0.15);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - size * 0.30, y - size * 0.52);
                ctx.lineTo(x + size * 0.30, y - size * 0.52);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y + size * 0.50, size * 0.08, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        function updateMetrics() {
            if (currentMode === "information") {
                const example = examples[exampleSelect.value];
                metricLabel1.textContent = "Ejemplo";
                metricLabel2.textContent = "Señal transmitida";
                metricLabel3.textContent = "Medio";
                metricLabel4.textContent = "Falla posible";
                metricValue1.textContent = example.title;
                metricValue2.textContent = example.signal;
                metricValue3.textContent = example.medium;
                metricValue4.textContent = example.fault;
            } else if (currentMode === "compare") {
                const frequencyValue = Number(analogFrequency.value);
                const bitRateValue = Number(bitRate.value);
                const sourceBitIndex = Math.floor((-elapsedTime) * bitRateValue);

                metricLabel1.textContent = "Frecuencia analógica";
                metricLabel2.textContent = "Periodo analógico";
                metricLabel3.textContent = "Velocidad binaria";
                metricLabel4.textContent = "Bit en el origen";
                metricValue1.textContent = `${formatNumber(frequencyValue)} Hz`;
                metricValue2.textContent = `${formatNumber(1 / frequencyValue, 2)} s`;
                metricValue3.textContent = `${formatNumber(bitRateValue)} bit/s`;
                metricValue4.textContent = String(getDigitalBit(sourceBitIndex));
            } else {
                const mixedState = getMixedStageState();
                const currentStage = mixedState.currentStage;
                const stage = mixedStages[currentStage];

                metricLabel1.textContent = "Etapa";
                metricLabel2.textContent = "Dominio";
                metricLabel3.textContent = "Bloque seleccionado";
                metricLabel4.textContent = "Modo";
                metricValue1.textContent = `${currentStage + 1} de ${mixedStages.length}`;
                metricValue2.textContent = stage.type;
                metricValue3.textContent = stage.title;
                metricValue4.textContent = mixedAutomatic.checked ? "Automático" : "Manual";
            }
        }

        function drawScene() {
            drawBackground();

            if (currentMode === "information") {
                drawInformationMode();
            } else if (currentMode === "compare") {
                drawComparisonMode();
            } else {
                drawMixedMode();
            }
        }

        function animate(currentTime) {
            const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
            lastFrameTime = currentTime;

            if (!isPaused) {
                elapsedTime += deltaTime;
                if (elapsedTime > 10000) {
                    elapsedTime = 0;
                }
            }

            drawScene();
            updateMetrics();
            window.requestAnimationFrame(animate);
        }

        updateControlDisplays();
        setMode("information");
        resizeCanvas();

        window.requestAnimationFrame((time) => {
            lastFrameTime = time;
            animate(time);
        });
    
