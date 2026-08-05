"use strict";

/*
 * PORTAL DE SIMULADORES TÉCNICOS
 * --------------------------------
 * Para agregar otra materia:
 * 1. Duplica un objeto dentro del arreglo subjects.
 * 2. Cambia id, code, name, icon, color y description.
 * 3. Agrega todos los recursos que necesites dentro de resources.
 *
 * No existe un límite fijo de materias o recursos.
 * Los enlaces provisionales se marcan visualmente para evitar confusiones.
 */

const subjects = [
    {
        id: "sit400",
        code: "SIT-400",
        name: "Sistemas de Telecomunicaciones",
        icon: "📡",
        color: "#38bdf8",
        description:
            "Simuladores y herramientas visuales de sistemas, señales, decibeles, muestreo, AM, FM y televisión digital.",
        resources: [
            resource("001", "Fundamentos de telecomunicaciones", "Conceptos iniciales, magnitudes y representación de señales.", "clases/001_fundamentos_telecomunicaciones.html"),
            resource("002", "Elementos del sistema y medios de transmisión", "Bloques funcionales, transmisor, canal, receptor y medios.", "clases/002_elementos_sistema_medios_transmision.html"),
            resource("003", "El decibel", "Conversión entre relaciones lineales y niveles expresados en dB.", "clases/003_decibel.html"),
            resource("004", "Ganancia, atenuación y cascadas", "Evaluación de etapas sucesivas y resultado total del sistema.", "clases/004_ganancia_atenuacion_cascadas.html"),
            resource("005", "Niveles de referencia", "Comparación de niveles absolutos y referencias técnicas.", "clases/005_niveles_referencia.html"),
            resource("006", "Nyquist, muestreo y aliasing", "Relación entre frecuencia de señal, muestreo y reconstrucción.", "clases/006_nyquist_muestreo_aliasing.html"),
            resource("007", "Digitalización y capacidad de Shannon", "Cuantificación, tasa de bits y capacidad conceptual del canal.", "clases/007_digitalizacion_capacidad_shannon.html"),
            resource("008", "Modulación AM básica", "Portadora, modulante, índice de modulación y envolvente.", "clases/008_modulacion_am_basica.html"),
            resource("009", "Espectro AM y bandas laterales", "Portadora, bandas laterales y ocupación espectral.", "clases/009_espectro_am_bandas_laterales.html"),
            resource("010", "Implementación AM", "Oscilador, modulador, circuitos resonantes, filtros y mezclador.", "clases/010_implementacion_am.html"),
            resource("011", "Ruido y SNR en AM", "Ruido, interferencia, saturación y efecto sobre la envolvente.", "clases/011_ruido_snr_am.html"),
            resource("012", "Comparador AM, FM y PM", "Diferencias entre amplitud, frecuencia y fase instantánea.", "clases/012_comparador_am_fm_pm.html"),
            resource("013", "NBFM, WBFM y regla de Carson", "Índice beta, clasificación y ancho de banda aproximado.", "clases/013_nbfm_wbfm_carson.html"),
            resource("014", "Generación FM y VCO", "Generación directa, tensión de control y frecuencia instantánea.", "clases/014_generacion_fm_vco.html"),
            resource("015", "Demodulación FM, PLL y ruido", "Detectores FM, lazo PLL, captura y recuperación de la modulante.", "clases/015_demodulacion_fm_pll_ruido_fm.html"),
            resource("016", "Televisión digital e ISDB-Tb", "Cadena digital, segmentos, One-Seg, Full-Seg y cobertura.", "clases/016_television_digital_isdb_tb.html"),
            resource("017", "Sistemas de TV digital avanzados", "MPEG, Transport Stream, guarda y medios de distribución.", "clases/017_tv_digital_avanzada.html"),
            resource("R02", "Aplicaciones reales de frecuencias", "Comparador de frecuencias, longitudes de onda y medios físicos.", "clases/r02_frecuencias_aplicaciones_reales.html", "Complementario")
        ]
    },

    /*
     * Las cinco materias siguientes funcionan como plantilla.
     * Sus enlaces apuntan provisionalmente a HTML ya existentes.
     * Cambia los nombres y las rutas cuando tengas los archivos definitivos.
     */
    {
        id: "fio600",
        code: "FIO-600",
        name: "Fibra Óptica",
        icon: "🔦",
        color: "#fb7185",
        description:
            "Plantilla para propagación óptica, pérdidas, ventanas de transmisión, enlaces y mediciones.",
        resources: [
            provisional("F01", "Introducción a la fibra óptica", "Estructura general y propagación óptica.", "clases/002_elementos_sistema_medios_transmision.html"),
            provisional("F02", "Pérdidas y presupuesto óptico", "Atenuación y evaluación conceptual de un enlace.", "clases/004_ganancia_atenuacion_cascadas.html"),
            provisional("F03", "Ventanas de 850, 1310 y 1550 nm", "Comparación de longitudes de onda usadas en fibra.", "clases/r02_frecuencias_aplicaciones_reales.html"),
            provisional("F04", "Digitalización y capacidad", "Relación provisional con tasa de datos y canal.", "clases/007_digitalizacion_capacidad_shannon.html")
        ]
    },
    {
        id: "lta300",
        code: "LTA-300",
        name: "Líneas de Transmisión y Antenas",
        icon: "📶",
        color: "#fbbf24",
        description:
            "Plantilla para líneas, impedancias, propagación, antenas y enlaces radioeléctricos.",
        resources: [
            provisional("L01", "Sistema y medio de transmisión", "Bloques básicos para contextualizar líneas y antenas.", "clases/002_elementos_sistema_medios_transmision.html"),
            provisional("L02", "Ganancia y atenuación", "Evaluación provisional de pérdidas y ganancias.", "clases/004_ganancia_atenuacion_cascadas.html"),
            provisional("L03", "Aplicaciones de radiofrecuencia", "Frecuencias empleadas en distintos servicios.", "clases/r02_frecuencias_aplicaciones_reales.html"),
            provisional("L04", "Niveles de referencia", "Lectura provisional de niveles técnicos.", "clases/005_niveles_referencia.html")
        ]
    },
    {
        id: "elc410",
        code: "ELC-410",
        name: "Electrónica de Comunicaciones",
        icon: "⚡",
        color: "#c084fc",
        description:
            "Plantilla para osciladores, moduladores, mezcladores, filtros y etapas de comunicaciones.",
        resources: [
            provisional("E01", "Modulación AM", "Base provisional para prácticas de modulación.", "clases/008_modulacion_am_basica.html"),
            provisional("E02", "Espectro y bandas laterales", "Representación provisional de componentes de frecuencia.", "clases/009_espectro_am_bandas_laterales.html"),
            provisional("E03", "Osciladores y mezcladores", "Referencia provisional de implementación AM.", "clases/010_implementacion_am.html"),
            provisional("E04", "Generación FM con VCO", "Referencia provisional para control de frecuencia.", "clases/014_generacion_fm_vco.html")
        ]
    },
    {
        id: "red420",
        code: "RED-420",
        name: "Redes y Protocolos",
        icon: "🌐",
        color: "#34d399",
        description:
            "Plantilla para modelos de red, medios, capacidad, transporte de datos y servicios digitales.",
        resources: [
            provisional("R01", "Elementos de una red", "Plantilla provisional basada en bloques de sistema.", "clases/002_elementos_sistema_medios_transmision.html"),
            provisional("R02", "Capacidad del canal", "Referencia provisional a Shannon y tasa de información.", "clases/007_digitalizacion_capacidad_shannon.html"),
            provisional("R03", "Medios de distribución digital", "Referencia provisional a TDT, cable, IPTV y Web TV.", "clases/017_tv_digital_avanzada.html"),
            provisional("R04", "Niveles y pérdidas", "Apoyo provisional para lectura de niveles.", "clases/005_niveles_referencia.html")
        ]
    },
    {
        id: "mic430",
        code: "MIC-430",
        name: "Microcontroladores y Sistemas Embebidos",
        icon: "🧩",
        color: "#fb923c",
        description:
            "Plantilla para adquisición, muestreo, conversión, control y aplicaciones embebidas.",
        resources: [
            provisional("M01", "Muestreo de señales", "Referencia provisional a Nyquist y aliasing.", "clases/006_nyquist_muestreo_aliasing.html"),
            provisional("M02", "Conversión y cuantificación", "Referencia provisional a digitalización.", "clases/007_digitalizacion_capacidad_shannon.html"),
            provisional("M03", "Comparación de señales", "Referencia provisional a AM, FM y PM.", "clases/012_comparador_am_fm_pm.html"),
            provisional("M04", "Control por tensión", "Referencia provisional a un VCO controlado.", "clases/014_generacion_fm_vco.html")
        ]
    }
];

function resource(number, title, description, href, type = "Simulador") {
    return {
        number,
        title,
        description,
        href,
        type,
        provisional: false
    };
}

function provisional(number, title, description, href) {
    return {
        number,
        title,
        description,
        href,
        type: "Plantilla",
        provisional: true
    };
}

const subjectGrid = document.getElementById("subjectGrid");
const resourceGrid = document.getElementById("resourceGrid");
const subjectSelect = document.getElementById("subjectSelect");
const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearchButton");
const emptyState = document.getElementById("emptyState");

const activeSubjectIcon = document.getElementById("activeSubjectIcon");
const activeSubjectCode = document.getElementById("activeSubjectCode");
const activeSubjectTitle = document.getElementById("activeSubjectTitle");
const activeSubjectDescription = document.getElementById("activeSubjectDescription");
const visibleResourceCount = document.getElementById("visibleResourceCount");
const subjectCount = document.getElementById("subjectCount");
const resourceCount = document.getElementById("resourceCount");
const currentYear = document.getElementById("currentYear");

let activeSubjectId = loadSavedSubject();

function loadSavedSubject() {
    try {
        const saved = localStorage.getItem("portal_active_subject");
        return subjects.some(subject => subject.id === saved)
            ? saved
            : subjects[0].id;
    } catch (error) {
        return subjects[0].id;
    }
}

function saveActiveSubject() {
    try {
        localStorage.setItem("portal_active_subject", activeSubjectId);
    } catch (error) {
        /* El portal sigue funcionando aunque localStorage no esté disponible. */
    }
}

function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getActiveSubject() {
    return subjects.find(subject => subject.id === activeSubjectId) || subjects[0];
}

function renderSubjectSelector() {
    subjectSelect.innerHTML = subjects
        .map(subject => (
            `<option value="${subject.id}">${subject.code} · ${subject.name}</option>`
        ))
        .join("");

    subjectSelect.value = activeSubjectId;
}

function renderSubjectCards() {
    subjectGrid.innerHTML = subjects
        .map(subject => {
            const activeClass = subject.id === activeSubjectId ? " active" : "";

            return `
                <button
                    type="button"
                    class="subject-card${activeClass}"
                    data-subject-id="${subject.id}"
                    style="--subject-color:${subject.color}"
                    aria-pressed="${subject.id === activeSubjectId}"
                >
                    <span class="subject-icon" aria-hidden="true">${subject.icon}</span>
                    <span>
                        <small>${subject.code}</small>
                        <strong>${subject.name}</strong>
                        <p>${subject.description}</p>
                    </span>
                    <span class="subject-resource-count">${subject.resources.length} recursos</span>
                </button>
            `;
        })
        .join("");
}

function renderResources() {
    const subject = getActiveSubject();
    const query = normalizeText(searchInput.value);

    const visibleResources = subject.resources.filter(item => {
        if (!query) {
            return true;
        }

        return normalizeText([
            item.number,
            item.title,
            item.description,
            item.type
        ].join(" ")).includes(query);
    });

    activeSubjectIcon.textContent = subject.icon;
    activeSubjectIcon.style.setProperty("--subject-color", subject.color);
    activeSubjectCode.textContent = subject.code;
    activeSubjectCode.style.color = subject.color;
    activeSubjectTitle.textContent = subject.name;
    activeSubjectDescription.textContent = subject.description;
    visibleResourceCount.textContent = String(visibleResources.length);

    resourceGrid.innerHTML = visibleResources
        .map(item => `
            <a
                class="resource-card"
                href="${item.href}"
                style="--subject-color:${subject.color}"
                title="Abrir ${item.title}"
            >
                <div class="resource-card-top">
                    <span class="resource-number">${item.number}</span>
                    ${
                        item.provisional
                            ? '<span class="provisional-badge">Enlace provisional</span>'
                            : `<span class="resource-type">${item.type}</span>`
                    }
                </div>

                <h3>${item.title}</h3>
                <p>${item.description}</p>

                <div class="resource-card-footer">
                    <span>${item.provisional ? "Modificar en js/index.js" : item.type}</span>
                    <span class="open-label">Abrir →</span>
                </div>
            </a>
        `)
        .join("");

    emptyState.hidden = visibleResources.length !== 0;
}

function updatePortalStats() {
    const totalResources = subjects.reduce(
        (total, subject) => total + subject.resources.length,
        0
    );

    subjectCount.textContent = String(subjects.length);
    resourceCount.textContent = String(totalResources);
}

function selectSubject(subjectId) {
    if (!subjects.some(subject => subject.id === subjectId)) {
        return;
    }

    activeSubjectId = subjectId;
    subjectSelect.value = subjectId;
    searchInput.value = "";
    saveActiveSubject();
    renderSubjectCards();
    renderResources();

    document.querySelector(".resources-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

subjectGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-subject-id]");

    if (button) {
        selectSubject(button.dataset.subjectId);
    }
});

subjectSelect.addEventListener("change", () => {
    selectSubject(subjectSelect.value);
});

searchInput.addEventListener("input", renderResources);

clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    renderResources();
});

currentYear.textContent = String(new Date().getFullYear());

renderSubjectSelector();
renderSubjectCards();
renderResources();
updatePortalStats();
