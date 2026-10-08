let pestanaActiva = "tiempo";

let ultimoResultadoAM = null;

let ultimoResultadoImpl = null;

let ultimoResultadoRuido = null;

let ultimoResultadoTiempoAlternativo = null;

let animacionFuenteId = null;
let fuenteAnimadaPausada = false;
let inicioFuenteAnimadaMs = 0;
let tiempoFuentePausada = 0;
let ultimoCuadroFuenteMs = 0;

let audioBufferModulante = null;
let audioPicoGlobal = 1;
let audioUrlObjeto = null;
let animacionAudioId = null;
let ultimoCuadroAudioMs = 0;
let nombreArchivoAudio = "";


/* ==========================================================
   UTILIDADES
   ========================================================== */

function valorEntrada(id) {

    return document
        .getElementById(id)
        .value
        .replace(",", ".");
}



function numeroEntrada(id) {

    const texto =
        valorEntrada(id)
            .trim();


    if (texto === "") {
        return NaN;
    }


    return Number(texto);
}


function numeroEntradaSeguro(
    id,
    valorDefecto
) {

    const valor =
        numeroEntrada(id);


    return Number.isFinite(valor)
        ? valor
        : valorDefecto;
}


function crearError(
    ids,
    principal,
    mensaje
) {

    return {
        ids: ids,
        principal: principal,
        mensaje: mensaje
    };
}


function limpiarErroresCampos(ids) {

    ids.forEach(
        function (id) {

            const campo =
                document
                    .getElementById(id);


            if (!campo) {
                return;
            }


            campo
                .classList
                .remove(
                    "campo-error"
                );


            campo
                .removeAttribute(
                    "aria-invalid"
                );


            const grupo =
                campo.closest(
                    ".campo, .campo-potencia"
                );


            if (grupo) {

                grupo
                    .classList
                    .remove(
                        "campo-con-error"
                    );


                const aviso =
                    grupo
                        .querySelector(
                            ".mensaje-campo-error"
                        );


                if (aviso) {
                    aviso.remove();
                }
            }
        }
    );
}


function limpiarErroresVisuales() {

    const ids =
        Array.from(
            document
                .querySelectorAll(
                    "input, select"
                )
        )
        .map(
            function (campo) {
                return campo.id;
            }
        )
        .filter(Boolean);


    limpiarErroresCampos(ids);
}


function marcarCampoError(
    id,
    mensaje,
    mostrarMensaje = true
) {

    const campo =
        document
            .getElementById(id);


    if (!campo) {
        return;
    }


    campo
        .classList
        .add(
            "campo-error"
        );


    campo
        .setAttribute(
            "aria-invalid",
            "true"
        );


    const grupo =
        campo.closest(
            ".campo, .campo-potencia"
        );


    if (!grupo) {
        return;
    }


    grupo
        .classList
        .add(
            "campo-con-error"
        );


    if (
        mostrarMensaje
        &&
        mensaje
    ) {

        let aviso =
            grupo
                .querySelector(
                    ".mensaje-campo-error"
                );


        if (!aviso) {

            aviso =
                document
                    .createElement(
                        "div"
                    );


            aviso.className =
                "mensaje-campo-error";


            grupo
                .appendChild(
                    aviso
                );
        }


        aviso.textContent =
            mensaje;
    }
}


function setMensaje(
    texto,
    esError = false
) {

    const mensaje =
        document
            .getElementById(
                "mensaje"
            );


    mensaje.textContent =
        texto;


    mensaje
        .classList
        .toggle(
            "mensaje-error",
            esError
        );
}


function limpiarErrorResultados(
    grupoId
) {

    const grupo =
        document
            .getElementById(
                grupoId
            );


    if (!grupo) {
        return;
    }


    const anterior =
        grupo
            .querySelector(
                ".resultado-error-general"
            );


    if (anterior) {
        anterior.remove();
    }
}


function limpiarValoresResultados(
    grupoId
) {

    const grupo =
        document
            .getElementById(
                grupoId
            );


    if (!grupo) {
        return;
    }


    grupo
        .querySelectorAll(
            ".resultado:not(.resultado-error-general) span"
        )
        .forEach(
            function (span) {
                span.textContent = "-";
            }
        );
}


function mostrarErrorResultados(
    grupoId,
    texto
) {

    const grupo =
        document
            .getElementById(
                grupoId
            );


    if (!grupo) {
        return;
    }


    limpiarErrorResultados(
        grupoId
    );


    limpiarValoresResultados(
        grupoId
    );


    const tarjeta =
        document
            .createElement(
                "div"
            );


    tarjeta.className =
        "resultado resultado-error-general";


    const titulo =
        document
            .createElement(
                "strong"
            );


    titulo.textContent =
        "Parámetros inválidos";


    const detalle =
        document
            .createElement(
                "span"
            );


    detalle.textContent =
        texto;


    tarjeta
        .appendChild(
            titulo
        );


    tarjeta
        .appendChild(
            detalle
        );


    grupo.prepend(
        tarjeta
    );
}


function mostrarErrores(
    errores,
    gruposResultados
) {

    errores.forEach(
        function (item) {

            item.ids.forEach(
                function (id) {

                    marcarCampoError(
                        id,
                        item.mensaje,
                        id === item.principal
                    );
                }
            );
        }
    );


    const detalle =
        errores
            .map(
                function (item) {
                    return "• " + item.mensaje;
                }
            )
            .join("\n");


    setMensaje(
        "ERROR DE PARÁMETROS\n"
        +
        detalle,
        true
    );


    const textoResultado =
        "Corrija los campos marcados en rojo.";


    gruposResultados.forEach(
        function (grupoId) {

            mostrarErrorResultados(
                grupoId,
                textoResultado
            );
        }
    );
}


function validarNumeroFinito(
    errores,
    id,
    nombre,
    unidad = ""
) {

    const valor =
        numeroEntrada(id);


    if (!Number.isFinite(valor)) {

        errores.push(
            crearError(
                [id],
                id,
                nombre
                +
                " está vacío o no contiene un número válido"
                +
                (
                    unidad
                    ?
                    " (" + unidad + ")."
                    :
                    "."
                )
            )
        );
    }


    return valor;
}


function validarParametrosAM() {

    const errores = [];


    const Ac =
        validarNumeroFinito(
            errores,
            "Ac",
            "Ac",
            "V"
        );


    const fc =
        validarNumeroFinito(
            errores,
            "fc",
            "fc",
            "Hz"
        );


    const fm =
        validarNumeroFinito(
            errores,
            "fm",
            "fm",
            "Hz"
        );


    const m =
        validarNumeroFinito(
            errores,
            "m",
            "m"
        );


    const sistema =
        document
            .getElementById(
                "sistema"
            )
            .value;


    if (
        Number.isFinite(Ac)
        &&
        Ac <= 0
    ) {

        errores.push(
            crearError(
                ["Ac"],
                "Ac",
                "Ac = "
                + Ac
                + " V no es válido. Ac debe ser mayor que 0 V."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        fc <= 0
    ) {

        errores.push(
            crearError(
                ["fc"],
                "fc",
                "fc = "
                + fc
                + " Hz no es válido. fc debe ser mayor que 0 Hz."
            )
        );
    }


    if (
        Number.isFinite(fm)
        &&
        fm <= 0
    ) {

        errores.push(
            crearError(
                ["fm"],
                "fm",
                "fm = "
                + fm
                + " Hz no es válido. fm debe ser mayor que 0 Hz."
            )
        );
    }


    if (
        Number.isFinite(m)
        &&
        m < 0
    ) {

        errores.push(
            crearError(
                ["m"],
                "m",
                "m = "
                + m
                + " no es válido. El índice de modulación no puede ser negativo."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        Number.isFinite(fm)
        &&
        fc > 0
        &&
        fm > 0
        &&
        fm >= fc
    ) {

        errores.push(
            crearError(
                [
                    "fc",
                    "fm"
                ],
                "fm",
                "La relación no es válida: fm = "
                + fm
                + " Hz debe ser menor que fc = "
                + fc
                + " Hz."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        Number.isFinite(fm)
        &&
        fc > 0
        &&
        fm > 0
        &&
        (
            fc + fm
        ) >= 25000
    ) {

        errores.push(
            crearError(
                [
                    "fc",
                    "fm"
                ],
                "fc",
                "Los valores exceden el límite interno de esta simulación: fc + fm = "
                + (
                    fc + fm
                )
                + " Hz debe ser menor que 25000 Hz."
            )
        );
    }


    if (
        sistema === "VSB"
    ) {

        const vestigio =
            validarNumeroFinito(
                errores,
                "vestigio",
                "Vestigio VSB",
                "Hz"
            );


        if (
            Number.isFinite(vestigio)
            &&
            vestigio <= 0
        ) {

            errores.push(
                crearError(
                    ["vestigio"],
                    "vestigio",
                    "Vestigio = "
                    + vestigio
                    + " Hz no es válido. Debe ser mayor que 0 Hz."
                )
            );
        }


        if (
            Number.isFinite(vestigio)
            &&
            Number.isFinite(fm)
            &&
            vestigio > fm
        ) {

            errores.push(
                crearError(
                    [
                        "fm",
                        "vestigio"
                    ],
                    "vestigio",
                    "El vestigio = "
                    + vestigio
                    + " Hz no puede ser mayor que fm = "
                    + fm
                    + " Hz."
                )
            );
        }
    }


    return errores;
}


function validarParametrosImplementacion() {

    const errores = [];


    const tipo =
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value;


    function mayorQueCero(
        id,
        nombre,
        unidad
    ) {

        const valor =
            validarNumeroFinito(
                errores,
                id,
                nombre,
                unidad
            );


        if (
            Number.isFinite(valor)
            &&
            valor <= 0
        ) {

            errores.push(
                crearError(
                    [id],
                    id,
                    nombre
                    + " = "
                    + valor
                    + " "
                    + unidad
                    + " no es válido. Debe ser mayor que 0 "
                    + unidad
                    + "."
                )
            );
        }
    }


    if (tipo === "MODULADOR") {

        return validarFuenteTiempo(
            obtenerFuenteModulante()
        );
    }


    if (tipo === "LC") {

        mayorQueCero(
            "L_mH",
            "L",
            "mH"
        );

        mayorQueCero(
            "C_nF",
            "C",
            "nF"
        );
    }


    else if (
        tipo === "COLPITTS"
    ) {

        mayorQueCero(
            "L_mH",
            "L",
            "mH"
        );

        mayorQueCero(
            "C1_nF",
            "C1",
            "nF"
        );

        mayorQueCero(
            "C2_nF",
            "C2",
            "nF"
        );
    }


    else if (
        tipo === "HARTLEY"
    ) {

        mayorQueCero(
            "L1_mH",
            "L1",
            "mH"
        );

        mayorQueCero(
            "L2_mH",
            "L2",
            "mH"
        );

        mayorQueCero(
            "C_nF",
            "C",
            "nF"
        );
    }


    else {

        mayorQueCero(
            "f1",
            "f1",
            "Hz"
        );

        mayorQueCero(
            "f2",
            "f2",
            "Hz"
        );
    }


    return errores;
}


function validarParametrosRuido() {

    const errores = [];


    const Ac =
        validarNumeroFinito(
            errores,
            "ruidoAc",
            "Ac",
            "V"
        );


    const fc =
        validarNumeroFinito(
            errores,
            "ruidoFc",
            "fc",
            "Hz"
        );


    const fm =
        validarNumeroFinito(
            errores,
            "ruidoFm",
            "fm",
            "Hz"
        );


    const m =
        validarNumeroFinito(
            errores,
            "ruidoM",
            "m"
        );


    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    if (
        Number.isFinite(Ac)
        &&
        Ac <= 0
    ) {

        errores.push(
            crearError(
                ["ruidoAc"],
                "ruidoAc",
                "Ac = "
                + Ac
                + " V no es válido. Ac debe ser mayor que 0 V."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        fc <= 0
    ) {

        errores.push(
            crearError(
                ["ruidoFc"],
                "ruidoFc",
                "fc = "
                + fc
                + " Hz no es válido. fc debe ser mayor que 0 Hz."
            )
        );
    }


    if (
        Number.isFinite(fm)
        &&
        fm <= 0
    ) {

        errores.push(
            crearError(
                ["ruidoFm"],
                "ruidoFm",
                "fm = "
                + fm
                + " Hz no es válido. fm debe ser mayor que 0 Hz."
            )
        );
    }


    if (
        Number.isFinite(m)
        &&
        m < 0
    ) {

        errores.push(
            crearError(
                ["ruidoM"],
                "ruidoM",
                "m = "
                + m
                + " no es válido. El índice de modulación no puede ser negativo."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        Number.isFinite(fm)
        &&
        fc > 0
        &&
        fm > 0
        &&
        fm >= fc
    ) {

        errores.push(
            crearError(
                [
                    "ruidoFc",
                    "ruidoFm"
                ],
                "ruidoFm",
                "La relación no es válida: fm = "
                + fm
                + " Hz debe ser menor que fc = "
                + fc
                + " Hz."
            )
        );
    }


    if (
        Number.isFinite(fc)
        &&
        Number.isFinite(fm)
        &&
        fc > 0
        &&
        fm > 0
        &&
        (
            fc + fm
        ) >= 25000
    ) {

        errores.push(
            crearError(
                [
                    "ruidoFc",
                    "ruidoFm"
                ],
                "ruidoFc",
                "Los valores exceden el límite interno de esta simulación: fc + fm = "
                + (
                    fc + fm
                )
                + " Hz debe ser menor que 25000 Hz."
            )
        );
    }


    if (
        nivel === "PERSONALIZADO"
    ) {

        const amplitudRuido =
            validarNumeroFinito(
                errores,
                "amplitudRuido",
                "Amplitud de ruido"
            );


        if (
            Number.isFinite(amplitudRuido)
            &&
            amplitudRuido < 0
        ) {

            errores.push(
                crearError(
                    ["amplitudRuido"],
                    "amplitudRuido",
                    "Amplitud de ruido = "
                    + amplitudRuido
                    + " no es válida. No puede ser negativa."
                )
            );
        }
    }


    return errores;
}


function limpiarCanvasConMensaje(
    id,
    texto
) {

    const canvas =
        document
            .getElementById(id);


    if (!canvas) {
        return;
    }


    const ancho =
        Math.max(
            canvas.clientWidth,
            300
        );


    const alto =
        Math.max(
            canvas.clientHeight,
            120
        );


    canvas.width = ancho;
    canvas.height = alto;


    const ctx =
        canvas
            .getContext("2d");


    ctx.clearRect(
        0,
        0,
        ancho,
        alto
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );


    ctx.fillStyle =
        "#777777";


    ctx.font =
        "13px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        texto,
        ancho / 2,
        alto / 2
    );


    ctx.textAlign =
        "start";


    ctx.textBaseline =
        "alphabetic";
}


function invalidarAM(
    errores
) {

    ultimoResultadoAM = null;


    [
        "graficaModulante",
        "graficaPortadora",
        "graficaAM",
        "graficaEspectro"
    ].forEach(
        function (id) {

            limpiarCanvasConMensaje(
                id,
                "Parámetros inválidos"
            );
        }
    );


    mostrarErrores(
        errores,
        [
            "resultadosTiempo",
            "resultadosEspectro"
        ]
    );
}


function invalidarImplementacion(
    errores
) {

    ultimoResultadoImpl = null;


    const tipo =
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value;


    if (tipo === "MODULADOR") {

        [
            "graficaImplModulante",
            "graficaImplPortadora",
            "graficaImplAM"
        ].forEach(
            function (id) {

                limpiarCanvasConMensaje(
                    id,
                    "Parámetros inválidos"
                );
            }
        );

    } else if (tipo === "MEZCLADOR") {

        [
            "graficaMixerEntrada",
            "graficaMixerSalida",
            "graficaMixerEspectro"
        ].forEach(
            function (id) {

                limpiarCanvasConMensaje(
                    id,
                    "Parámetros inválidos"
                );
            }
        );

    } else {

        limpiarCanvasConMensaje(
            "graficaImplTeorica",
            "Parámetros inválidos"
        );
    }


    mostrarErrores(
        errores,
        [
            "resultadosImplementacion"
        ]
    );
}


function invalidarRuido(
    errores
) {

    ultimoResultadoRuido = null;


    document
        .getElementById(
            "descripcionRuido"
        )
        .textContent =
        "Comparación entre AM limpia y AM con ruido aditivo.";


    document
        .getElementById(
            "tituloRuidoRuidosa"
        )
        .textContent =
        "Señal AM con ruido";


    [
        "graficaRuidoLimpia",
        "graficaRuidoRuidosa"
    ].forEach(
        function (id) {

            limpiarCanvasConMensaje(
                id,
                "Parámetros inválidos"
            );
        }
    );


    mostrarErrores(
        errores,
        [
            "resultadosRuido"
        ]
    );
}



/* ==========================================================
   FUENTES DE SEÑAL MODULANTE
   ========================================================== */

function obtenerFuenteModulante() {

    return document
        .getElementById(
            "fuenteModulante"
        )
        .value;
}


function fuenteUsaFm(tipo) {

    return [
        "SENOIDAL",
        "TRIANGULAR",
        "CUADRADA",
        "COMPUESTA"
    ].includes(tipo);
}


function fuenteEsAnimada(tipo) {

    return (
        tipo === "VARIABLE"
        ||
        tipo === "SENSOR"
    );
}


function descripcionDeFuente(tipo) {

    const descripciones = {
        SENOIDAL: [
            "Modulante senoidal",
            "Señal de prueba senoidal utilizada para el análisis básico de AM."
        ],
        TRIANGULAR: [
            "Modulante triangular",
            "Señal periódica con variación lineal. Permite observar cómo la envolvente sigue una forma distinta de la senoide."
        ],
        CUADRADA: [
            "Modulante cuadrada",
            "Señal periódica con cambios bruscos entre dos niveles. Se utiliza aquí como comparación temporal."
        ],
        COMPUESTA: [
            "Señal compuesta",
            "Combinación determinista de varias componentes. Su forma es más compleja que una senoide pero se repite exactamente."
        ],
        VARIABLE: [
            "Señal variable",
            "Patrón determinista de amplitud variable que simula una señal de información compleja. El patrón se repite continuamente."
        ],
        SENSOR: [
            "Sensor simulado",
            "Variación lenta e irregular normalizada que representa una magnitud analógica cambiante. El patrón se repite continuamente."
        ],
        AUDIO: [
            "Archivo de audio",
            "La forma de onda de un archivo real se utiliza como modulante. La visualización avanza sincronizada con la reproducción."
        ]
    };


    return descripciones[tipo]
        ||
        descripciones.SENOIDAL;
}


function actualizarResumenFuente() {

    const tipo =
        obtenerFuenteModulante();


    const descripcion =
        descripcionDeFuente(tipo);


    document
        .getElementById(
            "tituloFuenteTiempo"
        )
        .textContent =
        descripcion[0];


    document
        .getElementById(
            "descripcionFuenteTiempo"
        )
        .textContent =
        descripcion[1];
}


function detenerAnimacionFuente() {

    if (
        animacionFuenteId
        !==
        null
    ) {

        cancelAnimationFrame(
            animacionFuenteId
        );

        animacionFuenteId = null;
    }
}


function detenerAnimacionAudio() {

    if (
        animacionAudioId
        !==
        null
    ) {

        cancelAnimationFrame(
            animacionAudioId
        );

        animacionAudioId = null;
    }
}


function actualizarControlesFuente() {

    const tipo =
        obtenerFuenteModulante();


    const esTiempo =
        pestanaActiva === "tiempo";


    const esEspectro =
        pestanaActiva === "espectro";


    const esImplementacion =
        pestanaActiva === "implementacion";


    const esRuido =
        pestanaActiva === "ruido";


    const esImplementacionModulador =
        esImplementacion
        &&
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value
        ===
        "MODULADOR";


    const esVistaFuenteGlobal =
        esTiempo
        ||
        esEspectro
        ||
        esImplementacion
        ||
        esRuido;


    const esVistaFuenteRenderizada =
        esTiempo
        ||
        esEspectro
        ||
        esImplementacionModulador
        ||
        esRuido;


    document
        .getElementById(
            "resumenFuenteTiempo"
        )
        .style.display =
        (esTiempo && tipo !== "SENOIDAL")
        ?
        "block"
        :
        "none";


    document
        .getElementById(
            "notaFuentesNoSenoidales"
        )
        .style.display =
        (esTiempo && tipo !== "SENOIDAL")
        ?
        "block"
        :
        "none";


    document
        .getElementById(
            "campoFuenteModulante"
        )
        .style.display =
        esVistaFuenteGlobal
        ?
        "block"
        :
        "none";


    document
        .getElementById(
            "campoFm"
        )
        .style.display =
        (!esVistaFuenteGlobal || fuenteUsaFm(tipo))
        ?
        "block"
        :
        "none";


    document
        .getElementById(
            "panelFuenteAnimada"
        )
        .style.display =
        (esTiempo && fuenteEsAnimada(tipo))
        ?
        "block"
        :
        "none";


    document
        .getElementById(
            "panelAudioModulante"
        )
        .style.display =
        (esTiempo && tipo === "AUDIO")
        ?
        "block"
        :
        "none";


    const panelVentanaFFT =
        document
            .getElementById(
                "panelVentanaFFT"
            );


    if (panelVentanaFFT) {

        panelVentanaFFT.style.display =
            (esEspectro && tipo !== "SENOIDAL")
            ?
            "block"
            :
            "none";
    }


    const panelAudioEspectro =
        document
            .getElementById(
                "panelAudioEspectro"
            );


    if (panelAudioEspectro) {

        panelAudioEspectro.style.display =
            (esEspectro && tipo === "AUDIO")
            ?
            "block"
            :
            "none";
    }


    const panelAudioImplementacion =
        document
            .getElementById(
                "panelAudioImplementacion"
            );


    if (panelAudioImplementacion) {

        panelAudioImplementacion.style.display =
            (
                esImplementacionModulador
                &&
                tipo === "AUDIO"
            )
            ?
            "block"
            :
            "none";
    }


    const panelAudioRuido =
        document
            .getElementById(
                "panelAudioRuido"
            );


    if (panelAudioRuido) {

        panelAudioRuido.style.display =
            (
                esRuido
                &&
                tipo === "AUDIO"
            )
            ?
            "block"
            :
            "none";
    }


    const panelFuenteAnimadaRuido =
        document
            .getElementById(
                "panelFuenteAnimadaRuido"
            );


    if (panelFuenteAnimadaRuido) {

        panelFuenteAnimadaRuido.style.display =
            (
                esRuido
                &&
                fuenteEsAnimada(tipo)
            )
            ?
            "block"
            :
            "none";
    }


    actualizarResumenFuente();


    if (esImplementacionModulador) {
        actualizarResumenFuenteImplementacion();
    }


    if (esRuido) {
        actualizarResumenFuenteRuido();
        actualizarNotaVentanaRuido();
    }


    if (
        !esVistaFuenteGlobal
        ||
        !fuenteEsAnimada(tipo)
    ) {
        detenerAnimacionFuente();
    }


    if (
        !esVistaFuenteGlobal
        ||
        tipo !== "AUDIO"
    ) {

        const audio =
            document
                .getElementById(
                    "elementoAudio"
                );


        if (!audio.paused) {
            audio.pause();
        }


        detenerAnimacionAudio();
    } else if (audioBufferModulante) {

        const audio =
            document
                .getElementById(
                    "elementoAudio"
                );


        actualizarEstadoAudio(
            audio.paused
            ?
            "Pausado"
            :
            "Reproduciendo"
        );


        if (
            esVistaFuenteRenderizada
            &&
            !audio.paused
            &&
            !audio.ended
            &&
            animacionAudioId === null
        ) {

            animacionAudioId =
                requestAnimationFrame(
                    cuadroAudio
                );
        }
    }
}


function obtenerVentanaRuido() {

    const selector =
        document
            .getElementById(
                "ventanaRuido"
            );


    const valor =
        selector
        ?
        Number(selector.value)
        :
        0.10;


    return (
        Number.isFinite(valor)
        &&
        valor > 0
    )
    ?
    valor
    :
    0.10;
}


function actualizarNotaVentanaRuido() {

    const nota =
        document
            .getElementById(
                "notaVentanaRuido"
            );


    if (!nota) {
        return;
    }


    const ventana =
        obtenerVentanaRuido();


    const ms =
        ventana * 1000;


    nota.textContent =
        ms.toFixed(
            ms < 10 ? 1 : 0
        )
        +
        " ms — RMS y SNR calculados en esta ventana";
}


function actualizarResumenFuenteRuido() {

    const tipo =
        obtenerFuenteModulante();


    const descripcion =
        descripcionDeFuente(tipo);


    const titulo =
        document
            .getElementById(
                "tituloFuenteRuido"
            );


    const texto =
        document
            .getElementById(
                "descripcionFuenteRuido"
            );


    if (titulo) {
        titulo.textContent =
            descripcion[0]
            +
            " — análisis de ruido";
    }


    if (texto) {
        texto.textContent =
            "La misma fuente global se utiliza para comparar AM limpia y AM con ruido. "
            +
            descripcion[1];
    }
}


function actualizarResumenFuenteImplementacion() {

    const tipo =
        obtenerFuenteModulante();


    const descripcion =
        descripcionDeFuente(tipo);


    const titulo =
        document
            .getElementById(
                "tituloFuenteImplementacion"
            );


    const texto =
        document
            .getElementById(
                "descripcionFuenteImplementacion"
            );


    const datos =
        document
            .getElementById(
                "datosFuenteImplementacion"
            );


    if (!titulo || !texto || !datos) {
        return;
    }


    titulo.textContent =
        descripcion[0];


    texto.textContent =
        descripcion[1];


    const Ac = numeroEntradaSeguro("Ac", 0);
    const fc = numeroEntradaSeguro("fc", 0);
    const m = numeroEntradaSeguro("m", 0);


    let detalle =
        "Ac = "
        + Ac
        + " V   |   fc = "
        + fc
        + " Hz   |   m = "
        + m;


    if (fuenteUsaFm(tipo)) {

        detalle +=
            "   |   fm = "
            +
            numeroEntradaSeguro(
                "fm",
                0
            )
            +
            " Hz";
    }


    if (tipo === "AUDIO") {

        detalle +=
            "   |   Archivo: "
            +
            (
                nombreArchivoAudio
                ||
                "no cargado"
            );
    }


    datos.textContent = detalle;
}


function limitarUnidad(valor) {

    return Math.max(
        -1,
        Math.min(
            1,
            valor
        )
    );
}


function valorFuenteSimulada(
    tipo,
    t,
    fm
) {

    const dosPi =
        2 * Math.PI;


    if (tipo === "TRIANGULAR") {

        return (
            2 / Math.PI
        )
        *
        Math.asin(
            Math.sin(
                dosPi * fm * t
            )
        );
    }


    if (tipo === "CUADRADA") {

        return (
            Math.sin(
                dosPi * fm * t
            )
            >= 0
        )
        ?
        1
        :
        -1;
    }


    if (tipo === "COMPUESTA") {

        const valor =
            0.55
            *
            Math.cos(
                dosPi * fm * t
            )
            +
            0.30
            *
            Math.cos(
                dosPi * 2 * fm * t
                +
                0.65
            )
            +
            0.15
            *
            Math.cos(
                dosPi * 3 * fm * t
                +
                1.20
            );


        return limitarUnidad(
            valor
        );
    }


    if (tipo === "VARIABLE") {

        const periodo = 4.0;

        const tau =
            (
                (t % periodo)
                +
                periodo
            )
            %
            periodo;


        const envolvente =
            0.20
            +
            0.80
            *
            Math.pow(
                0.5
                +
                0.5
                *
                Math.sin(
                    dosPi
                    *
                    tau
                    /
                    periodo
                    -
                    Math.PI / 2
                ),
                1.3
            );


        const contenido =
            0.55
            *
            Math.sin(
                dosPi * 6.0 * t
            )
            +
            0.28
            *
            Math.sin(
                dosPi * 11.0 * t
                +
                0.80
            )
            +
            0.17
            *
            Math.sin(
                dosPi * 17.0 * t
                +
                1.55
            );


        const variacionLenta =
            0.12
            *
            Math.sin(
                dosPi * 1.1 * t
                +
                0.35
            );


        return limitarUnidad(
            envolvente
            *
            contenido
            +
            variacionLenta
        );
    }


    if (tipo === "SENSOR") {

        const periodo = 8.0;

        const tau =
            (
                (t % periodo)
                +
                periodo
            )
            %
            periodo;


        const valor =
            0.58
            *
            Math.sin(
                dosPi
                *
                tau
                /
                periodo
            )
            +
            0.24
            *
            Math.sin(
                2
                *
                dosPi
                *
                tau
                /
                periodo
                +
                0.80
            )
            +
            0.12
            *
            Math.sin(
                3
                *
                dosPi
                *
                tau
                /
                periodo
                +
                1.70
            );


        return limitarUnidad(
            valor / 0.94
        );
    }


    return Math.cos(
        dosPi * fm * t
    );
}


function estadoSegunIndice(m) {

    if (Math.abs(m) < 1e-12) {
        return "Sin modulacion";
    }


    if (m > 0 && m < 1) {
        return "Modulacion normal";
    }


    if (Math.abs(m - 1) < 1e-12) {
        return "Modulacion al 100%";
    }


    return "Sobremodulacion";
}


function crearDatosTiempoAlternativo(
    tiempo,
    modulante
) {

    const Ac =
        numeroEntrada("Ac");


    const fc =
        numeroEntrada("fc");


    const m =
        numeroEntrada("m");


    const portadora = [];

    const senalAM = [];

    const envolventeSuperior = [];

    const envolventeInferior = [];


    let maxEnvolvente =
        -Infinity;

    let minEnvolvente =
        Infinity;


    for (
        let i = 0;
        i < tiempo.length;
        i++
    ) {

        const t =
            tiempo[i];


        const x =
            limitarUnidad(
                modulante[i]
            );


        const port =
            Ac
            *
            Math.cos(
                2
                *
                Math.PI
                *
                fc
                *
                t
            );


        const env =
            Ac
            *
            (
                1
                +
                m * x
            );


        const am =
            env
            *
            Math.cos(
                2
                *
                Math.PI
                *
                fc
                *
                t
            );


        portadora.push(port);

        senalAM.push(am);

        envolventeSuperior.push(env);

        envolventeInferior.push(-env);


        maxEnvolvente =
            Math.max(
                maxEnvolvente,
                env
            );


        minEnvolvente =
            Math.min(
                minEnvolvente,
                env
            );
    }


    return {
        Ac: Ac,
        fc: fc,
        m: m,
        Amax_teorico: Ac * (1 + m),
        Amin_teorico: Ac * (1 - m),
        Amax_simulado: maxEnvolvente,
        Amin_simulado: minEnvolvente,
        m_simulado: m,
        estado: estadoSegunIndice(m),
        t: tiempo,
        modulante: modulante,
        portadora: portadora,
        senal_am: senalAM,
        envolvente_superior: envolventeSuperior,
        envolvente_inferior: envolventeInferior
    };
}


function actualizarVistaTiempoAlternativo(
    datos
) {

    ultimoResultadoTiempoAlternativo =
        datos;


    if (pestanaActiva === "espectro") {

        actualizarVistaEspectroFuenteAlternativa(
            datos
        );

        return;
    }


    if (
        pestanaActiva === "implementacion"
        &&
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value
        ===
        "MODULADOR"
    ) {

        actualizarVistaModuladorGlobal(
            datos
        );

        return;
    }


    if (pestanaActiva === "ruido") {

        actualizarVistaRuidoGlobal(
            datos
        );

        return;
    }


    document
        .getElementById(
            "AmaxTeorico"
        )
        .textContent =
        datos.Amax_teorico
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AminTeorico"
        )
        .textContent =
        datos.Amin_teorico
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AmaxSimulado"
        )
        .textContent =
        datos.Amax_simulado
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AminSimulado"
        )
        .textContent =
        datos.Amin_simulado
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "mConfigurado"
        )
        .textContent =
        datos.m
            .toFixed(3);


    document
        .getElementById(
            "mSimulado"
        )
        .textContent =
        datos.m_simulado
            .toFixed(3);


    document
        .getElementById(
            "estado"
        )
        .textContent =
        datos.estado;


    dibujarSenal(
        "graficaModulante",
        datos.t,
        datos.modulante
    );


    dibujarSenal(
        "graficaPortadora",
        datos.t,
        datos.portadora
    );


    dibujarAM(
        datos.t,
        datos.senal_am,
        datos.envolvente_superior,
        datos.envolvente_inferior
    );


    dibujarComparacionEnvolvente(
        datos.t,
        datos.modulante,
        datos.envolvente_superior,
        datos.Ac,
        datos.m
    );
}


function validarFuenteTiempo(
    tipo
) {

    const errores = [];


    const Ac =
        numeroEntrada("Ac");


    const fc =
        numeroEntrada("fc");


    const m =
        numeroEntrada("m");


    if (!Number.isFinite(Ac)) {

        errores.push(
            crearError(
                ["Ac"],
                "Ac",
                "Ac debe contener un número válido."
            )
        );

    } else if (Ac <= 0) {

        errores.push(
            crearError(
                ["Ac"],
                "Ac",
                "Ac = " + Ac + " V no es válido. Ac debe ser mayor que 0 V."
            )
        );
    }


    if (!Number.isFinite(fc)) {

        errores.push(
            crearError(
                ["fc"],
                "fc",
                "fc debe contener un número válido."
            )
        );

    } else if (fc <= 0) {

        errores.push(
            crearError(
                ["fc"],
                "fc",
                "fc = " + fc + " Hz no es válido. fc debe ser mayor que 0 Hz."
            )
        );
    }


    if (!Number.isFinite(m)) {

        errores.push(
            crearError(
                ["m"],
                "m",
                "m debe contener un número válido."
            )
        );

    } else if (m < 0) {

        errores.push(
            crearError(
                ["m"],
                "m",
                "m = " + m + " no es válido. El índice de modulación no puede ser negativo."
            )
        );
    }


    if (fuenteUsaFm(tipo)) {

        const fm =
            numeroEntrada("fm");


        if (!Number.isFinite(fm)) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    "fm debe contener un número válido."
                )
            );

        } else if (fm <= 0) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    "fm = " + fm + " Hz no es válido. fm debe ser mayor que 0 Hz."
                )
            );
        }


        if (
            Number.isFinite(fm)
            &&
            Number.isFinite(fc)
            &&
            fm > 0
            &&
            fc > 0
            &&
            fm >= fc
        ) {

            errores.push(
                crearError(
                    ["fc", "fm"],
                    "fm",
                    "La relación no es válida: fm = "
                    +
                    fm
                    +
                    " Hz debe ser menor que fc = "
                    +
                    fc
                    +
                    " Hz."
                )
            );
        }
    }


    return errores;
}


function invalidarFuenteTiempo(
    errores
) {

    ultimoResultadoTiempoAlternativo =
        null;


    [
        "graficaModulante",
        "graficaPortadora",
        "graficaAM"
    ].forEach(
        function (id) {

            limpiarCanvasConMensaje(
                id,
                "Parámetros inválidos"
            );
        }
    );


    mostrarErrores(
        errores,
        [
            "resultadosTiempo"
        ]
    );
}


function obtenerVentanaFFT() {

    const selector =
        document
            .getElementById(
                "ventanaFFT"
            );


    const valor =
        selector
        ?
        Number(selector.value)
        :
        0.10;


    return (
        Number.isFinite(valor)
        &&
        valor > 0
    )
    ?
    valor
    :
    0.10;
}


function actualizarNotaVentanaFFT() {

    const nota =
        document
            .getElementById(
                "notaVentanaFFT"
            );


    if (!nota) {
        return;
    }


    const ventana =
        obtenerVentanaFFT();


    const ms =
        ventana * 1000;


    const resolucionIdeal =
        1 / ventana;


    nota.textContent =
        "Ventana: "
        +
        ms.toFixed(
            ms < 10 ? 1 : 0
        )
        +
        " ms — Δf de la ventana ≈ "
        +
        formatearFrecuenciaAnalizador(
            resolucionIdeal
        )
        +
        ". El BIN FFT puede ser menor por relleno con ceros.";
}


function generarVentanaSimulada(
    tipo,
    tiempoCentral = 0
) {

    const fm =
        fuenteUsaFm(tipo)
        ?
        numeroEntrada("fm")
        :
        1;


    let duracion = 0.05;


    if (tipo === "VARIABLE") {
        duracion = 0.22;
    }


    if (tipo === "SENSOR") {
        duracion = 0.60;
    }


    if (
        pestanaActiva === "espectro"
        &&
        tipo !== "SENOIDAL"
    ) {
        duracion = obtenerVentanaFFT();
    }


    if (pestanaActiva === "ruido") {
        duracion = obtenerVentanaRuido();
    }


    const frecuenciaMuestreoObjetivo =
        50000;


    const usaMuestreoTemporalDetallado =
        pestanaActiva === "espectro"
        ||
        pestanaActiva === "ruido";


    const puntos =
        usaMuestreoTemporalDetallado
        ?
        Math.max(
            32,
            Math.min(
                65536,
                Math.round(
                    duracion
                    *
                    frecuenciaMuestreoObjetivo
                )
            )
        )
        :
        2200;


    let inicio = 0;


    if (fuenteEsAnimada(tipo)) {

        inicio =
            Math.max(
                0,
                tiempoCentral
                -
                duracion / 2
            );
    }


    const tiempo = [];

    const modulante = [];


    for (
        let i = 0;
        i < puntos;
        i++
    ) {

        const t =
            inicio
            +
            duracion
            *
            i
            /
            (
                puntos - 1
            );


        tiempo.push(t);


        modulante.push(
            valorFuenteSimulada(
                tipo,
                t,
                fm
            )
        );
    }


    return crearDatosTiempoAlternativo(
        tiempo,
        modulante
    );
}


function cuadroFuenteAnimada(
    marcaTiempo
) {

    const tipo =
        obtenerFuenteModulante();


    const esModuladorImplementacion =
        pestanaActiva === "implementacion"
        &&
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value
        ===
        "MODULADOR";


    if (
        (
            pestanaActiva !== "tiempo"
            &&
            pestanaActiva !== "espectro"
            &&
            pestanaActiva !== "ruido"
            &&
            !esModuladorImplementacion
        )
        ||
        !fuenteEsAnimada(tipo)
    ) {

        detenerAnimacionFuente();
        return;
    }


    if (fuenteAnimadaPausada) {

        animacionFuenteId =
            requestAnimationFrame(
                cuadroFuenteAnimada
            );

        return;
    }


    if (
        marcaTiempo
        -
        ultimoCuadroFuenteMs
        >=
        (
            (
                pestanaActiva === "espectro"
                ||
                pestanaActiva === "ruido"
            )
            ?
            100
            :
            33
        )
    ) {

        ultimoCuadroFuenteMs =
            marcaTiempo;


        const transcurrido =
            (
                marcaTiempo
                -
                inicioFuenteAnimadaMs
            )
            /
            1000;


        const datos =
            generarVentanaSimulada(
                tipo,
                transcurrido
            );


        actualizarVistaTiempoAlternativo(
            datos
        );
    }


    animacionFuenteId =
        requestAnimationFrame(
            cuadroFuenteAnimada
        );
}


function actualizarEstadoControlesFuenteAnimada(
    pausada
) {

    [
        "pausarFuenteAnimada",
        "pausarFuenteAnimadaRuido"
    ].forEach(
        function (id) {

            const boton =
                document.getElementById(id);


            if (boton) {
                boton.textContent =
                    pausada
                    ?
                    "REANUDAR"
                    :
                    "PAUSAR";
            }
        }
    );


    [
        "estadoFuenteAnimada",
        "estadoFuenteAnimadaRuido"
    ].forEach(
        function (id) {

            const estado =
                document.getElementById(id);


            if (estado) {
                estado.textContent =
                    pausada
                    ?
                    "Pausada"
                    :
                    "Ejecutándose — repetición continua";
            }
        }
    );
}


function iniciarFuenteAnimada(
    reiniciar = false
) {

    detenerAnimacionFuente();


    if (reiniciar) {
        tiempoFuentePausada = 0;
    }


    fuenteAnimadaPausada = false;


    inicioFuenteAnimadaMs =
        performance.now()
        -
        tiempoFuentePausada
        *
        1000;


    actualizarEstadoControlesFuenteAnimada(
        false
    );


    animacionFuenteId =
        requestAnimationFrame(
            cuadroFuenteAnimada
        );
}


function alternarPausaFuenteAnimada() {

    if (
        !fuenteEsAnimada(
            obtenerFuenteModulante()
        )
    ) {
        return;
    }


    if (!fuenteAnimadaPausada) {

        fuenteAnimadaPausada = true;


        tiempoFuentePausada =
            (
                performance.now()
                -
                inicioFuenteAnimadaMs
            )
            /
            1000;


        actualizarEstadoControlesFuenteAnimada(
            true
        );

    } else {

        fuenteAnimadaPausada = false;


        inicioFuenteAnimadaMs =
            performance.now()
            -
            tiempoFuentePausada
            *
            1000;


        actualizarEstadoControlesFuenteAnimada(
            false
        );
    }
}


function formatearTiempoAudio(segundos) {

    if (!Number.isFinite(segundos)) {
        return "--:--";
    }


    const total =
        Math.max(
            0,
            Math.floor(segundos)
        );


    const minutos =
        Math.floor(
            total / 60
        );


    const resto =
        total % 60;


    return (
        String(minutos)
        +
        ":"
        +
        String(resto)
            .padStart(
                2,
                "0"
            )
    );
}


function actualizarEstadoAudio(
    textoAdicional = ""
) {

    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    const actual =
        formatearTiempoAudio(
            audio.currentTime
        );


    const duracion =
        formatearTiempoAudio(
            audio.duration
        );


    const nombre =
        nombreArchivoAudio
        ||
        "Ningún archivo cargado";


    const textoEstado =
        nombre
        +
        " — "
        +
        actual
        +
        " / "
        +
        duracion
        +
        (
            textoAdicional
            ?
            " — " + textoAdicional
            :
            ""
        );


    [
        "estadoAudio",
        "estadoAudioEspectro",
        "estadoAudioImplementacion",
        "estadoAudioRuido"
    ].forEach(
        function (id) {

            const elemento =
                document
                    .getElementById(id);


            if (elemento) {
                elemento.textContent =
                    textoEstado;
            }
        }
    );


    const porcentaje =
        (
            Number.isFinite(audio.duration)
            &&
            audio.duration > 0
        )
        ?
        Math.max(
            0,
            Math.min(
                100,
                100
                *
                audio.currentTime
                /
                audio.duration
            )
        )
        :
        0;


    [
        "progresoAudio",
        "progresoAudioEspectro",
        "progresoAudioImplementacion",
        "progresoAudioRuido"
    ].forEach(
        function (id) {

            const elemento =
                document
                    .getElementById(id);


            if (elemento) {

                elemento.style.width =
                    porcentaje.toFixed(2)
                    +
                    "%";
            }
        }
    );
}


function obtenerMuestraAudioOriginal(
    indice
) {

    if (!audioBufferModulante) {
        return 0;
    }


    const limite =
        audioBufferModulante.length
        -
        1;


    const i =
        Math.max(
            0,
            Math.min(
                limite,
                indice
            )
        );


    let suma = 0;


    for (
        let canal = 0;
        canal < audioBufferModulante.numberOfChannels;
        canal++
    ) {

        suma +=
            audioBufferModulante
                .getChannelData(canal)[i];
    }


    return (
        suma
        /
        audioBufferModulante.numberOfChannels
    );
}


function obtenerMuestraAudio(
    indice
) {

    return (
        obtenerMuestraAudioOriginal(
            indice
        )
        /
        audioPicoGlobal
    );
}

function crearVentanaAudio(
    tiempoCentro,
    silencio = false
) {

    const duracionVentana =
        pestanaActiva === "espectro"
        ?
        obtenerVentanaFFT()
        :
        (
            pestanaActiva === "ruido"
            ?
            obtenerVentanaRuido()
            :
            Number(
                document
                    .getElementById(
                        "ventanaAudio"
                    )
                    .value
            )
        );


    const ventana =
        Number.isFinite(duracionVentana)
        ?
        duracionVentana
        :
        0.10;


    const puntos =
        (
            pestanaActiva === "espectro"
            ||
            pestanaActiva === "ruido"
        )
        &&
        audioBufferModulante
        ?
        Math.max(
            32,
            Math.min(
                65536,
                Math.round(
                    ventana
                    *
                    audioBufferModulante.sampleRate
                )
            )
        )
        :
        2200;


    const mitad =
        ventana / 2;


    const inicio =
        Math.max(
            0,
            tiempoCentro
            -
            mitad
        );


    const tiempo = [];

    const modulante = [];

    const modulanteOriginal = [];


    for (
        let i = 0;
        i < puntos;
        i++
    ) {

        const t =
            inicio
            +
            ventana
            *
            i
            /
            (
                puntos - 1
            );


        tiempo.push(t);


        if (
            silencio
            ||
            !audioBufferModulante
            ||
            t >= audioBufferModulante.duration
        ) {

            modulante.push(0);
            modulanteOriginal.push(0);

        } else {

            const indice =
                Math.floor(
                    t
                    *
                    audioBufferModulante.sampleRate
                );


            const muestraOriginal =
                obtenerMuestraAudioOriginal(
                    indice
                );


            modulanteOriginal.push(
                muestraOriginal
            );


            modulante.push(
                limitarUnidad(
                    obtenerMuestraAudio(
                        indice
                    )
                )
            );
        }
    }


    const datos =
        crearDatosTiempoAlternativo(
            tiempo,
            modulante
        );


    datos.modulante_audio_original =
        modulanteOriginal;


    if (silencio) {

        datos.m_simulado = 0;
        datos.estado =
            "Sin modulacion (sin modulante)";
    }


    return datos;
}


function dibujarAudioEnInstante(
    tiempo,
    silencio = false
) {

    const datos =
        crearVentanaAudio(
            tiempo,
            silencio
        );


    actualizarVistaTiempoAlternativo(
        datos
    );
}


function cuadroAudio(
    marcaTiempo
) {

    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    const esModuladorImplementacion =
        pestanaActiva === "implementacion"
        &&
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value
        ===
        "MODULADOR";


    if (
        (
            pestanaActiva !== "tiempo"
            &&
            pestanaActiva !== "espectro"
            &&
            pestanaActiva !== "ruido"
            &&
            !esModuladorImplementacion
        )
        ||
        obtenerFuenteModulante()
        !==
        "AUDIO"
    ) {

        detenerAnimacionAudio();
        return;
    }


    if (
        marcaTiempo
        -
        ultimoCuadroAudioMs
        >=
        (
            (
                pestanaActiva === "espectro"
                ||
                pestanaActiva === "ruido"
            )
            ?
            100
            :
            33
        )
    ) {

        ultimoCuadroAudioMs =
            marcaTiempo;


        dibujarAudioEnInstante(
            audio.currentTime,
            false
        );


        actualizarEstadoAudio(
            audio.paused
            ?
            "Pausado"
            :
            "Reproduciendo"
        );
    }


    if (!audio.paused && !audio.ended) {

        animacionAudioId =
            requestAnimationFrame(
                cuadroAudio
            );

    } else {

        animacionAudioId = null;
    }
}


async function cargarArchivoAudio(
    archivo
) {

    if (!archivo) {
        return;
    }


    detenerAnimacionAudio();


    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    audio.pause();


    if (audioUrlObjeto) {

        URL.revokeObjectURL(
            audioUrlObjeto
        );
    }


    audioUrlObjeto =
        URL.createObjectURL(
            archivo
        );


    audio.src =
        audioUrlObjeto;


    nombreArchivoAudio =
        archivo.name;


    document
        .getElementById(
            "estadoAudio"
        )
        .textContent =
        archivo.name
        +
        " — decodificando audio...";


    try {

        const contexto =
            new (
                window.AudioContext
                ||
                window.webkitAudioContext
            )();


        const contenido =
            await archivo
                .arrayBuffer();


        audioBufferModulante =
            await contexto
                .decodeAudioData(
                    contenido.slice(0)
                );


        let pico = 0;


        const salto =
            Math.max(
                1,
                Math.floor(
                    audioBufferModulante.length
                    /
                    1500000
                )
            );


        for (
            let canal = 0;
            canal < audioBufferModulante.numberOfChannels;
            canal++
        ) {

            const datos =
                audioBufferModulante
                    .getChannelData(canal);


            for (
                let i = 0;
                i < datos.length;
                i += salto
            ) {

                pico =
                    Math.max(
                        pico,
                        Math.abs(
                            datos[i]
                        )
                    );
            }
        }


        audioPicoGlobal =
            pico > 1e-9
            ?
            pico
            :
            1;


        await contexto.close();


        audio.currentTime = 0;


        // El archivo ya fue decodificado correctamente.
        // Elimina cualquier validación visual anterior que hubiera
        // quedado en el selector de la fuente modulante.
        limpiarErroresCampos([
            "fuenteModulante"
        ]);


        actualizarEstadoAudio(
            "Listo"
        );


        dibujarAudioEnInstante(
            0,
            false
        );


        setMensaje(
            "Audio cargado. Puede reproducirlo y observar la modulación en tiempo real."
        );

    }

    catch (error) {

        audioBufferModulante = null;


        document
            .getElementById(
                "estadoAudio"
            )
            .textContent =
            archivo.name
            +
            " — no se pudo decodificar este archivo.";


        setMensaje(
            "ERROR\nNo se pudo decodificar el archivo de audio. Pruebe con MP3, WAV u OGG compatible con el navegador.",
            true
        );
    }
}


async function reproducirArchivoAudio(
    desdeInicio = false
) {

    if (!audioBufferModulante) {

        setMensaje(
            "Seleccione primero un archivo de audio.",
            true
        );

        return;
    }


    const errores =
        validarFuenteTiempo(
            "AUDIO"
        );


    if (errores.length > 0) {

        invalidarFuenteTiempo(
            errores
        );

        return;
    }


    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    if (
        desdeInicio
        ||
        audio.ended
        ||
        (
            Number.isFinite(audio.duration)
            &&
            audio.currentTime
            >=
            audio.duration - 0.02
        )
    ) {

        audio.currentTime = 0;
    }


    try {

        await audio.play();


        detenerAnimacionAudio();


        animacionAudioId =
            requestAnimationFrame(
                cuadroAudio
            );


        setMensaje(
            "Reproduciendo audio y actualizando la señal AM."
        );

    }

    catch (error) {

        setMensaje(
            "ERROR\nEl navegador no permitió iniciar la reproducción del audio.",
            true
        );
    }
}


function pausarArchivoAudio() {

    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    audio.pause();

    detenerAnimacionAudio();


    if (audioBufferModulante) {

        dibujarAudioEnInstante(
            audio.currentTime,
            false
        );

        actualizarEstadoAudio(
            "Pausado"
        );
    }
}


function detenerArchivoAudio() {

    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    audio.pause();

    audio.currentTime = 0;

    detenerAnimacionAudio();


    if (audioBufferModulante) {

        dibujarAudioEnInstante(
            0,
            true
        );

        actualizarEstadoAudio(
            "Detenido — modulante = 0; queda la portadora"
        );
    }
}


function finalizarArchivoAudio() {

    detenerAnimacionAudio();


    const audio =
        document
            .getElementById(
                "elementoAudio"
            );


    if (audioBufferModulante) {

        dibujarAudioEnInstante(
            audio.duration,
            true
        );

        actualizarEstadoAudio(
            "Finalizado — modulante = 0; queda la portadora"
        );


        setMensaje(
            "El audio terminó. La modulante es cero y permanece la portadora sin modular. Pulse REPRODUCIR o REINICIAR para comenzar nuevamente."
        );
    }
}


function simularFuenteAlternativa() {

    const tipo =
        obtenerFuenteModulante();


    const errores =
        validarFuenteTiempo(
            tipo
        );


    if (errores.length > 0) {

        invalidarFuenteTiempo(
            errores
        );

        return;
    }


    limpiarErroresCampos([
        "Ac",
        "fc",
        "fm",
        "m"
    ]);


    limpiarErrorResultados(
        "resultadosTiempo"
    );


    if (tipo === "AUDIO") {

        if (audioBufferModulante) {

            const audio =
                document
                    .getElementById(
                        "elementoAudio"
                    );


            dibujarAudioEnInstante(
                audio.currentTime,
                audio.ended
            );


            if (
                !audio.paused
                &&
                !audio.ended
            ) {

                detenerAnimacionAudio();

                animacionAudioId =
                    requestAnimationFrame(
                        cuadroAudio
                    );
            }


            setMensaje(
                pestanaActiva === "espectro"
                ?
                "Espectro actualizado con el instante actual del archivo de audio."
                :
                "Parámetros AM actualizados para el archivo de audio."
            );

        } else {

            [
                "graficaModulante",
                "graficaPortadora",
                "graficaAM"
            ].forEach(
                function (id) {

                    limpiarCanvasConMensaje(
                        id,
                        "Seleccione un archivo de audio"
                    );
                }
            );


            setMensaje(
                "Seleccione un archivo de audio para utilizarlo como señal modulante."
            );
        }


        return;
    }


    if (fuenteEsAnimada(tipo)) {

        tiempoFuentePausada = 0;

        iniciarFuenteAnimada(
            true
        );


        setMensaje(
            "Simulación temporal activa. El patrón se repite continuamente."
        );

        return;
    }


    detenerAnimacionFuente();


    const datos =
        generarVentanaSimulada(
            tipo,
            0
        );


    actualizarVistaTiempoAlternativo(
        datos
    );


    setMensaje(
        "Simulación temporal completada."
    );
}


/* ==========================================================
   PESTANAS
   ========================================================== */

function mostrarPestana(nombre) {

    pestanaActiva = nombre;


    const esTiempo =
        nombre === "tiempo";


    const esEspectro =
        nombre === "espectro";


    const esImplementacion =
        nombre === "implementacion";


    const esRuido =
        nombre === "ruido";


    document
        .getElementById("tabTiempo")
        .classList
        .toggle("activa", esTiempo);


    document
        .getElementById("tabEspectro")
        .classList
        .toggle("activa", esEspectro);


    document
        .getElementById("tabImplementacion")
        .classList
        .toggle(
            "activa",
            esImplementacion
        );


    document
        .getElementById("tabRuido")
        .classList
        .toggle("activa", esRuido);


    document
        .getElementById("contenidoTiempo")
        .classList
        .toggle("activo", esTiempo);


    document
        .getElementById("contenidoEspectro")
        .classList
        .toggle("activo", esEspectro);


    document
        .getElementById("contenidoImplementacion")
        .classList
        .toggle(
            "activo",
            esImplementacion
        );


    document
        .getElementById("contenidoRuido")
        .classList
        .toggle("activo", esRuido);


    document
        .getElementById("resultadosTiempo")
        .classList
        .toggle("activo", esTiempo);


    document
        .getElementById("resultadosEspectro")
        .classList
        .toggle("activo", esEspectro);


    document
        .getElementById("resultadosImplementacion")
        .classList
        .toggle(
            "activo",
            esImplementacion
        );


    document
        .getElementById("resultadosRuido")
        .classList
        .toggle("activo", esRuido);


    document
        .getElementById("parametrosAM")
        .classList
        .toggle(
            "activo",
            esTiempo || esEspectro || esRuido
        );


    document
        .getElementById("parametrosImplementacion")
        .classList
        .toggle(
            "activo",
            esImplementacion
        );


    document
        .getElementById("parametrosRuido")
        .classList
        .toggle(
            "activo",
            esRuido
        );


    document
        .getElementById("campoSistema")
        .style.display =
        (
            esEspectro
            &&
            obtenerFuenteModulante() === "SENOIDAL"
        )
        ?
        "block"
        :
        "none";


    actualizarControlesFuente();


    actualizarCampoVestigio();


    if (esImplementacion) {
        actualizarParametrosImplementacion();
    }


    if (esRuido) {
        actualizarCampoRuidoPersonalizado();
    }


    requestAnimationFrame(
        function () {

            if (esImplementacion) {

                const tipoActualImplementacion =
                    document
                        .getElementById(
                            "tipoImplementacion"
                        )
                        .value;


                if (
                    tipoActualImplementacion === "MODULADOR"
                ) {

                    simularImplementacion();

                } else if (
                    ultimoResultadoImpl
                    !==
                    null
                    &&
                    ultimoResultadoImpl.tipo
                    ===
                    tipoActualImplementacion
                ) {

                    actualizarVistaImplementacion(
                        ultimoResultadoImpl
                    );

                } else {

                    simularImplementacion();
                }

            }


            else if (esRuido) {

                simularRuido();

            }


            else if (
                esEspectro
                &&
                obtenerFuenteModulante()
                !==
                "SENOIDAL"
            ) {

                const tipo =
                    obtenerFuenteModulante();


                actualizarNotaVentanaFFT();


                if (
                    tipo === "AUDIO"
                    &&
                    audioBufferModulante
                ) {

                    const audio =
                        document
                            .getElementById(
                                "elementoAudio"
                            );


                    dibujarAudioEnInstante(
                        audio.currentTime,
                        audio.ended
                    );

                } else {

                    let tiempoCentro = 0;


                    if (
                        ultimoResultadoTiempoAlternativo
                        &&
                        ultimoResultadoTiempoAlternativo.t
                        &&
                        ultimoResultadoTiempoAlternativo.t.length > 0
                    ) {

                        const tiempos =
                            ultimoResultadoTiempoAlternativo.t;


                        tiempoCentro =
                            tiempos[
                                Math.floor(
                                    tiempos.length / 2
                                )
                            ];
                    }


                    const datos =
                        generarVentanaSimulada(
                            tipo,
                            tiempoCentro
                        );


                    actualizarVistaEspectroFuenteAlternativa(
                        datos
                    );
                }
            }


            else if (
                esTiempo
                &&
                obtenerFuenteModulante()
                !==
                "SENOIDAL"
            ) {

                simularFuenteAlternativa();
            }


            else {

                if (
                    ultimoResultadoAM
                    !==
                    null
                ) {

                    actualizarVistaAM(
                        ultimoResultadoAM
                    );

                } else {

                    simularAM();
                }
            }
        }
    );
}


/* ==========================================================
   VSB
   ========================================================== */

function actualizarCampoVestigio() {

    const campo =
        document
            .getElementById(
                "campoVestigio"
            );


    if (
        pestanaActiva
        !==
        "espectro"
        ||
        obtenerFuenteModulante()
        !==
        "SENOIDAL"
    ) {

        campo.style.display =
            "none";

        return;
    }


    const sistema =
        document
            .getElementById(
                "sistema"
            )
            .value;


    campo.style.display =
        sistema === "VSB"
        ?
        "block"
        :
        "none";
}


/* ==========================================================
   RUIDO PERSONALIZADO
   ========================================================== */

function actualizarCampoRuidoPersonalizado() {

    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    document
        .getElementById(
            "campoRuidoPersonalizado"
        )
        .style.display =
        nivel === "PERSONALIZADO"
        ?
        "block"
        :
        "none";
}


/* ==========================================================
   IMPLEMENTACION
   ========================================================== */

function ocultarParametrosImplementacion() {

    document
        .querySelectorAll(
            ".parametro-implementacion"
        )
        .forEach(
            function (elemento) {

                elemento
                    .classList
                    .remove("activo");
            }
        );
}


function activarParametro(id) {

    document
        .getElementById(id)
        .classList
        .add("activo");
}


function actualizarParametrosImplementacion() {

    ocultarParametrosImplementacion();


    const tipo =
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value;


    if (tipo === "LC") {

        activarParametro("implL");
        activarParametro("implC");

    }


    else if (
        tipo === "COLPITTS"
    ) {

        activarParametro("implL");
        activarParametro("implC1");
        activarParametro("implC2");

    }


    else if (
        tipo === "HARTLEY"
    ) {

        activarParametro("implL1");
        activarParametro("implL2");
        activarParametro("implC");

    }


    else if (
        tipo === "MODULADOR"
    ) {

        // Utiliza Ac, fc, m y la fuente global seleccionada en TIEMPO.

    }


    else {

        activarParametro("implF1");
        activarParametro("implF2");
    }


    actualizarControlesFuente();
}


/* ==========================================================
   CANVAS
   ========================================================== */

function prepararCanvas(
    canvas,
    alto
) {

    const ancho =
        canvas.clientWidth;


    canvas.width =
        ancho;


    canvas.height =
        alto;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        ancho,
        alto
    );


    return {
        ctx,
        ancho,
        alto
    };
}


/* ==========================================================
   EJES TIEMPO
   ========================================================== */

function dibujarEjesTiempo(
    ctx,
    ancho,
    alto
) {

    const izquierda = 42;

    const derecha =
        ancho - 12;

    const centroY =
        alto / 2;


    ctx.strokeStyle =
        "#c4c4c4";


    ctx.lineWidth =
        1;


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        centroY
    );


    ctx.lineTo(
        derecha,
        centroY
    );


    ctx.moveTo(
        izquierda,
        10
    );


    ctx.lineTo(
        izquierda,
        alto - 22
    );


    ctx.stroke();


    ctx.fillStyle =
        "#444";


    ctx.font =
        "10px Arial";


    ctx.fillText(
        "V",
        27,
        15
    );


    ctx.fillText(
        "t",
        derecha - 3,
        centroY - 5
    );
}


/* ==========================================================
   GRAFICA TEMPORAL
   ========================================================== */

function dibujarSenal(
    canvasId,
    tiempo,
    senal
) {

    const canvas =
        document
            .getElementById(
                canvasId
            );


    const datos =
        prepararCanvas(
            canvas,
            180
        );


    const ctx =
        datos.ctx;


    const ancho =
        datos.ancho;


    const alto =
        datos.alto;


    dibujarEjesTiempo(
        ctx,
        ancho,
        alto
    );


    let maximo = 0;


    for (
        const valor
        of senal
    ) {

        maximo =
            Math.max(
                maximo,
                Math.abs(valor)
            );
    }


    if (maximo === 0) {
        maximo = 1;
    }


    const izquierda = 42;

    const derecha =
        ancho - 12;

    const superior = 10;

    const inferior =
        alto - 22;


    const anchoUtil =
        derecha - izquierda;


    const altoUtil =
        inferior - superior;


    ctx.strokeStyle =
        "#087ef5";


    ctx.lineWidth =
        1.2;


    ctx.beginPath();


    for (
        let i = 0;
        i < senal.length;
        i++
    ) {

        const x =
            izquierda
            +
            (
                i
                /
                (
                    senal.length
                    -
                    1
                )
            )
            *
            anchoUtil;


        const y =
            superior
            +
            altoUtil / 2
            -
            (
                senal[i]
                /
                maximo
            )
            *
            (
                altoUtil
                *
                0.43
            );


        if (i === 0) {

            ctx.moveTo(x, y);

        } else {

            ctx.lineTo(x, y);
        }
    }


    ctx.stroke();


    ctx.fillStyle =
        "#444";


    ctx.font =
        "9px Arial";


    ctx.fillText(
        tiempo[0].toFixed(4)
        +
        " s",
        izquierda,
        alto - 5
    );


    ctx.fillText(
        tiempo[
            tiempo.length - 1
        ].toFixed(4)
        +
        " s",
        derecha - 48,
        alto - 5
    );
}


/* ==========================================================
   AM Y ENVOLVENTE
   ========================================================== */

function dibujarAM(
    tiempo,
    am,
    superior,
    inferior
) {

    const canvas =
        document
            .getElementById(
                "graficaAM"
            );


    const datos =
        prepararCanvas(
            canvas,
            180
        );


    const ctx =
        datos.ctx;


    const ancho =
        datos.ancho;


    const alto =
        datos.alto;


    dibujarEjesTiempo(
        ctx,
        ancho,
        alto
    );


    let maximo = 0;


    const todas = [
        ...am,
        ...superior,
        ...inferior
    ];


    for (
        const valor
        of todas
    ) {

        maximo =
            Math.max(
                maximo,
                Math.abs(valor)
            );
    }


    if (maximo === 0) {
        maximo = 1;
    }


    const izquierda = 42;

    const derecha =
        ancho - 12;

    const arriba = 10;

    const abajo =
        alto - 22;


    const anchoUtil =
        derecha
        -
        izquierda;


    const altoUtil =
        abajo
        -
        arriba;


    function vector(
        datosVector,
        color,
        grosor
    ) {

        ctx.strokeStyle =
            color;


        ctx.lineWidth =
            grosor;


        ctx.beginPath();


        for (
            let i = 0;
            i < datosVector.length;
            i++
        ) {

            const x =
                izquierda
                +
                (
                    i
                    /
                    (
                        datosVector.length
                        -
                        1
                    )
                )
                *
                anchoUtil;


            const y =
                arriba
                +
                altoUtil / 2
                -
                (
                    datosVector[i]
                    /
                    maximo
                )
                *
                (
                    altoUtil
                    *
                    0.43
                );


            if (i === 0) {

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


        ctx.stroke();
    }


    vector(
        am,
        "#1686ff",
        1
    );


    vector(
        superior,
        "#d00000",
        1.8
    );


    vector(
        inferior,
        "#d00000",
        1.8
    );
}


/* ==========================================================
   COMPARACION MODULANTE / ENVOLVENTE NORMALIZADA
   ========================================================== */

function dibujarComparacionEnvolvente(
    tiempo,
    modulante,
    envolventeSuperior,
    Ac,
    m
) {

    const zona =
        document
            .getElementById(
                "zonaComparacionEnvolvente"
            );


    const control =
        document
            .getElementById(
                "mostrarComparacionEnvolvente"
            );


    const nota =
        document
            .getElementById(
                "notaComparacionEnvolvente"
            );


    const bloqueModulante =
        document
            .getElementById(
                "bloqueComparacionModulante"
            );


    const bloqueEnvolvente =
        document
            .getElementById(
                "bloqueComparacionEnvolvente"
            );


    if (
        !zona
        ||
        !control
        ||
        !bloqueModulante
        ||
        !bloqueEnvolvente
    ) {
        return;
    }


    if (!control.checked) {

        bloqueModulante.style.display = "none";
        bloqueEnvolvente.style.display = "none";
        nota.style.display = "none";

        return;
    }


    bloqueModulante.style.display = "block";
    bloqueEnvolvente.style.display = "block";
    nota.style.display = "block";


    const canvasModulante =
        document
            .getElementById(
                "graficaComparacionModulante"
            );


    const canvasEnvolvente =
        document
            .getElementById(
                "graficaComparacionEnvolvente"
            );


    function dibujarCurvaSeparada(
        canvas,
        vector,
        color,
        mensaje
    ) {

        const cd =
            prepararCanvas(
                canvas,
                150
            );


        const ctx = cd.ctx;
        const ancho = cd.ancho;
        const alto = cd.alto;


        const izquierda = 42;
        const derecha = ancho - 12;
        const arriba = 15;
        const abajo = alto - 24;


        const anchoUtil =
            derecha - izquierda;


        const altoUtil =
            abajo - arriba;


        const centro =
            arriba + altoUtil / 2;


        const escala = 1.08;


        function yValor(valor) {

            return (
                centro
                -
                (
                    valor / escala
                )
                *
                (
                    altoUtil * 0.46
                )
            );
        }


        ctx.strokeStyle = "#d0d0d0";
        ctx.lineWidth = 1;


        [1, 0, -1].forEach(
            function(valor) {

                const y =
                    yValor(valor);


                ctx.beginPath();
                ctx.moveTo(izquierda, y);
                ctx.lineTo(derecha, y);
                ctx.stroke();
            }
        );


        ctx.fillStyle = "#444";
        ctx.font = "9px Arial";


        ctx.fillText(
            "+1",
            18,
            yValor(1) + 3
        );


        ctx.fillText(
            "0",
            24,
            centro + 3
        );


        ctx.fillText(
            "-1",
            18,
            yValor(-1) + 3
        );


        if (mensaje) {

            ctx.fillStyle = "#555";
            ctx.font = "12px Arial";
            ctx.fillText(
                mensaje,
                izquierda + 10,
                centro - 8
            );

        } else {

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.7;
            ctx.setLineDash([]);
            ctx.beginPath();


            for (
                let i = 0;
                i < vector.length;
                i++
            ) {

                const x =
                    izquierda
                    +
                    (
                        i
                        /
                        Math.max(
                            vector.length - 1,
                            1
                        )
                    )
                    *
                    anchoUtil;


                const y =
                    yValor(
                        vector[i]
                    );


                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }


            ctx.stroke();
        }


        if (
            tiempo
            &&
            tiempo.length > 0
        ) {

            ctx.fillStyle = "#444";
            ctx.font = "9px Arial";


            ctx.fillText(
                tiempo[0].toFixed(4) + " s",
                izquierda,
                alto - 5
            );


            ctx.fillText(
                tiempo[
                    tiempo.length - 1
                ].toFixed(4)
                +
                " s",
                derecha - 48,
                alto - 5
            );
        }
    }


    dibujarCurvaSeparada(
        canvasModulante,
        modulante,
        "#1686ff",
        ""
    );


    if (
        !Number.isFinite(Ac)
        ||
        Math.abs(Ac) < 1e-12
        ||
        !Number.isFinite(m)
        ||
        Math.abs(m) < 1e-12
    ) {

        nota.textContent =
            "La modulante se muestra arriba con escala normalizada. Con m = 0 no existe variación de envolvente que permita recuperar su forma en la gráfica inferior.";


        dibujarCurvaSeparada(
            canvasEnvolvente,
            [],
            "#d00000",
            "Envolvente normalizada no disponible con m = 0."
        );

        return;
    }


    const envolventeNormalizada = [];
    let diferenciaMaxima = 0;


    for (
        let i = 0;
        i < envolventeSuperior.length;
        i++
    ) {

        const valor =
            (
                envolventeSuperior[i] / Ac
                -
                1
            )
            /
            m;


        envolventeNormalizada.push(valor);


        diferenciaMaxima =
            Math.max(
                diferenciaMaxima,
                Math.abs(
                    valor
                    -
                    modulante[i]
                )
            );
    }


    nota.textContent =
        "Las dos gráficas usan la misma escala vertical (-1 a +1) y el mismo intervalo de tiempo. "
        +
        "Arriba se muestra la modulante y abajo la envolvente normalizada, para comparar visualmente su forma. "
        +
        "Diferencia máxima = "
        +
        diferenciaMaxima.toExponential(2)
        +
        ".";


    dibujarCurvaSeparada(
        canvasEnvolvente,
        envolventeNormalizada,
        "#d00000",
        ""
    );
}


function actualizarComparacionEnvolvente() {

    const tipo =
        obtenerFuenteModulante();


    if (
        tipo !== "SENOIDAL"
        &&
        ultimoResultadoTiempoAlternativo
        !==
        null
    ) {

        dibujarComparacionEnvolvente(
            ultimoResultadoTiempoAlternativo.t,
            ultimoResultadoTiempoAlternativo.modulante,
            ultimoResultadoTiempoAlternativo.envolvente_superior,
            ultimoResultadoTiempoAlternativo.Ac,
            ultimoResultadoTiempoAlternativo.m
        );

        return;
    }


    if (
        ultimoResultadoAM
        !==
        null
    ) {

        dibujarComparacionEnvolvente(
            ultimoResultadoAM.t,
            ultimoResultadoAM.modulante,
            ultimoResultadoAM.envolvente_superior,
            ultimoResultadoAM.Ac,
            ultimoResultadoAM.m
        );
    }
}


/* ==========================================================
   ESPECTRO
   ========================================================== */


function siguientePotenciaDosSuperior(valor) {

    let potencia = 1;

    while (
        potencia < valor
        &&
        potencia < 65536
    ) {
        potencia *= 2;
    }

    return Math.min(
        potencia,
        65536
    );
}


function fftRadix2(
    real,
    imag
) {

    const n = real.length;

    let j = 0;

    for (
        let i = 1;
        i < n;
        i++
    ) {

        let bit = n >> 1;

        while (j & bit) {
            j ^= bit;
            bit >>= 1;
        }

        j ^= bit;

        if (i < j) {

            const tr = real[i];
            real[i] = real[j];
            real[j] = tr;

            const ti = imag[i];
            imag[i] = imag[j];
            imag[j] = ti;
        }
    }


    for (
        let longitud = 2;
        longitud <= n;
        longitud <<= 1
    ) {

        const angulo =
            -2
            *
            Math.PI
            /
            longitud;

        const wLongReal =
            Math.cos(angulo);

        const wLongImag =
            Math.sin(angulo);


        for (
            let i = 0;
            i < n;
            i += longitud
        ) {

            let wReal = 1;
            let wImag = 0;


            for (
                let k = 0;
                k < longitud / 2;
                k++
            ) {

                const par = i + k;
                const impar = par + longitud / 2;

                const tReal =
                    wReal * real[impar]
                    -
                    wImag * imag[impar];

                const tImag =
                    wReal * imag[impar]
                    +
                    wImag * real[impar];

                const uReal = real[par];
                const uImag = imag[par];

                real[par] = uReal + tReal;
                imag[par] = uImag + tImag;

                real[impar] = uReal - tReal;
                imag[impar] = uImag - tImag;

                const siguienteWReal =
                    wReal * wLongReal
                    -
                    wImag * wLongImag;

                wImag =
                    wReal * wLongImag
                    +
                    wImag * wLongReal;

                wReal = siguienteWReal;
            }
        }
    }
}


function calcularEspectroFFT(
    tiempo,
    senal,
    opciones = {}
) {

    if (
        !tiempo
        ||
        !senal
        ||
        tiempo.length < 16
        ||
        senal.length < 16
    ) {
        return null;
    }


    const modo =
        opciones.modo
        ||
        "RELATIVO";


    /*
       Se utilizan TODAS las muestras disponibles de la ventana
       seleccionada. La FFT se rellena con ceros hasta la siguiente
       potencia de dos. Esto evita recortar, por ejemplo, una ventana
       de 20 ms a solo 512 muestras.
    */
    const muestrasUtiles =
        Math.min(
            tiempo.length,
            senal.length,
            65536
        );


    const n =
        siguientePotenciaDosSuperior(
            muestrasUtiles
        );


    if (
        muestrasUtiles < 16
        ||
        n < 16
    ) {
        return null;
    }


    const inicio =
        Math.max(
            0,
            senal.length - muestrasUtiles
        );


    const dt =
        tiempo[inicio + 1]
        -
        tiempo[inicio];


    if (
        !Number.isFinite(dt)
        ||
        dt <= 0
    ) {
        return null;
    }


    const fs = 1 / dt;

    const real =
        new Array(n).fill(0);

    const imag =
        new Array(n).fill(0);


    let promedio = 0;

    for (
        let i = 0;
        i < muestrasUtiles;
        i++
    ) {
        promedio += senal[inicio + i];
    }

    promedio /= muestrasUtiles;


    let sumaVentana = 0;


    for (
        let i = 0;
        i < muestrasUtiles;
        i++
    ) {

        const ventana =
            0.5
            -
            0.5
            *
            Math.cos(
                2
                *
                Math.PI
                *
                i
                /
                Math.max(
                    muestrasUtiles - 1,
                    1
                )
            );


        sumaVentana += ventana;


        real[i] =
            (
                senal[inicio + i]
                -
                promedio
            )
            *
            ventana;
    }


    /*
       Las posiciones desde muestrasUtiles hasta n - 1 permanecen
       en cero: es zero-padding. Mejora la lectura/interpolación de
       la traza, pero no se presenta como aumento de la resolución
       física de la ventana temporal.
    */
    fftRadix2(
        real,
        imag
    );


    const frecuencias = [];
    const amplitudesPico = [];


    for (
        let k = 0;
        k <= n / 2;
        k++
    ) {

        const magnitud =
            Math.sqrt(
                real[k] * real[k]
                +
                imag[k] * imag[k]
            );


        const extremo =
            k === 0
            ||
            k === n / 2;


        const factorUnilateral =
            extremo
            ?
            1
            :
            2;


        const amplitudPico =
            factorUnilateral
            *
            magnitud
            /
            Math.max(
                sumaVentana,
                1e-15
            );


        frecuencias.push(
            k * fs / n
        );


        amplitudesPico.push(
            amplitudPico
        );
    }


    let magnitudesDB = [];
    let unidad = "dB";
    let refDB = 0;


    if (modo === "DBFS") {

        unidad = "dBFS";
        refDB = 0;


        magnitudesDB =
            amplitudesPico.map(
                function (amplitud) {

                    return 20
                    *
                    Math.log10(
                        Math.max(
                            amplitud,
                            1e-12
                        )
                    );
                }
            );

    } else if (modo === "DBV") {

        unidad = "dBV";


        magnitudesDB =
            amplitudesPico.map(
                function (amplitud, indice) {

                    const valorRMS =
                        indice === 0
                        ?
                        amplitud
                        :
                        amplitud
                        /
                        Math.sqrt(2);


                    return 20
                    *
                    Math.log10(
                        Math.max(
                            valorRMS,
                            1e-12
                        )
                    );
                }
            );


        const maximo =
            Math.max(
                ...magnitudesDB.filter(
                    Number.isFinite
                )
            );


        refDB =
            Math.max(
                0,
                Math.ceil(
                    maximo / 10
                )
                *
                10
            );

    } else {

        const maxAmplitud =
            Math.max(
                ...amplitudesPico,
                1e-15
            );


        magnitudesDB =
            amplitudesPico.map(
                function (amplitud) {

                    return 20
                    *
                    Math.log10(
                        Math.max(
                            amplitud
                            /
                            maxAmplitud,
                            1e-12
                        )
                    );
                }
            );
    }


    const separacionBins =
        fs / n;


    const resolucionVentana =
        fs / muestrasUtiles;


    /*
       Para Hann, el ancho de banda equivalente de ruido (ENBW) es
       aproximadamente 1.5 bins de la ventana REAL, no de la FFT
       rellenada con ceros.
    */
    const rbwAprox =
        1.5
        *
        resolucionVentana;


    return {
        frecuencias: frecuencias,
        magnitudesDB: magnitudesDB,
        amplitudesPico: amplitudesPico,
        fs: fs,
        n: n,
        muestrasUtiles: muestrasUtiles,
        separacionBins: separacionBins,
        resolucion: resolucionVentana,
        rbwAprox: rbwAprox,
        fNyquist: fs / 2,
        modo: modo,
        unidad: unidad,
        refDB: refDB,
        pisoDB: refDB - 80
    };
}

function formatearFrecuenciaAnalizador(
    frecuencia
) {

    const f =
        Math.max(
            0,
            Number(frecuencia) || 0
        );


    if (f >= 1000000) {
        return (f / 1000000).toFixed(3) + " MHz";
    }


    if (f >= 1000) {
        return (f / 1000).toFixed(3) + " kHz";
    }


    return f.toFixed(1) + " Hz";
}


function encontrarPicoEspectro(
    espectro,
    fInicio = 0,
    fFin = Infinity
) {

    if (!espectro) {
        return null;
    }


    let indicePico = -1;
    let nivelPico = -Infinity;


    for (
        let i = 0;
        i < espectro.frecuencias.length;
        i++
    ) {

        const f = espectro.frecuencias[i];


        if (
            f < fInicio
            ||
            f > fFin
        ) {
            continue;
        }


        const nivel =
            espectro.magnitudesDB[i];


        if (nivel > nivelPico) {
            nivelPico = nivel;
            indicePico = i;
        }
    }


    if (indicePico < 0) {
        return null;
    }


    return {
        frecuencia:
            espectro.frecuencias[indicePico],
        nivel:
            espectro.magnitudesDB[indicePico],
        indice:
            indicePico
    };
}


function frecuenciaSignificativaMaxima(
    espectro,
    descensoDesdePicoDB = 35
) {

    if (!espectro) {
        return 0;
    }


    const pico =
        Math.max(
            ...espectro.magnitudesDB.filter(
                Number.isFinite
            )
        );


    const umbral =
        pico
        -
        Math.abs(
            descensoDesdePicoDB
        );


    let maxima = 0;


    for (
        let i = 1;
        i < espectro.frecuencias.length;
        i++
    ) {

        if (
            espectro.magnitudesDB[i]
            >=
            umbral
        ) {
            maxima =
                espectro.frecuencias[i];
        }
    }


    return maxima;
}

function actualizarInfoAnalizador(
    id,
    espectro,
    opciones = {}
) {

    const panel =
        document.getElementById(id);


    if (
        !panel
        ||
        !espectro
    ) {
        return;
    }


    const fInicio =
        Number.isFinite(opciones.fInicio)
        ?
        opciones.fInicio
        :
        0;

    const fFin =
        Number.isFinite(opciones.fFin)
        ?
        opciones.fFin
        :
        espectro.fNyquist;

    const centro =
        (fInicio + fFin) / 2;

    const span =
        Math.max(
            fFin - fInicio,
            0
        );

    const pico =
        encontrarPicoEspectro(
            espectro,
            fInicio,
            fFin
        );


    const unidad =
        espectro.unidad
        ||
        "dB";


    let marcador =
        pico
        ?
        (
            formatearFrecuenciaAnalizador(
                pico.frecuencia
            )
            +
            " / "
            +
            pico.nivel.toFixed(1)
            +
            " "
            +
            unidad
        )
        :
        "--";


    if (
        Number.isFinite(
            opciones.marcadorFrecuencia
        )
    ) {

        const objetivo =
            opciones.marcadorFrecuencia;

        let mejorIndice = 0;
        let mejorError = Infinity;


        for (
            let i = 0;
            i < espectro.frecuencias.length;
            i++
        ) {

            const error =
                Math.abs(
                    espectro.frecuencias[i]
                    -
                    objetivo
                );


            if (error < mejorError) {
                mejorError = error;
                mejorIndice = i;
            }
        }


        marcador =
            "Fc "
            +
            formatearFrecuenciaAnalizador(
                espectro.frecuencias[mejorIndice]
            )
            +
            " / "
            +
            espectro.magnitudesDB[mejorIndice]
                .toFixed(1)
            +
            " "
            +
            unidad;
    }


    panel.innerHTML =
        '<div class="dato"><span class="etiqueta">REF</span>'
        +
        espectro.refDB.toFixed(0)
        +
        ' '
        +
        unidad
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">ESCALA</span>10 dB/div</div>'
        +
        '<div class="dato"><span class="etiqueta">CENTER</span>'
        +
        formatearFrecuenciaAnalizador(centro)
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">SPAN</span>'
        +
        formatearFrecuenciaAnalizador(span)
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">RBW Hann aprox.</span>'
        +
        formatearFrecuenciaAnalizador(
            espectro.rbwAprox
            ||
            espectro.resolucion
        )
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">START</span>'
        +
        formatearFrecuenciaAnalizador(fInicio)
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">STOP</span>'
        +
        formatearFrecuenciaAnalizador(fFin)
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">BIN FFT</span>'
        +
        formatearFrecuenciaAnalizador(
            espectro.separacionBins
            ||
            espectro.resolucion
        )
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">Δf ventana</span>'
        +
        formatearFrecuenciaAnalizador(
            espectro.resolucion
        )
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">MUESTRAS</span>'
        +
        (
            espectro.muestrasUtiles
            ||
            espectro.n
        )
        +
        '</div>'
        +
        '<div class="dato"><span class="etiqueta">FFT</span>'
        +
        espectro.n
        +
        ' pts</div>'
        +
        '<div class="dato"><span class="etiqueta">MARKER</span>'
        +
        marcador
        +
        '</div>';


    if (
        opciones.nivelesAudio
    ) {

        panel.innerHTML +=
            '<div class="dato"><span class="etiqueta">PICO AUDIO</span>'
            +
            opciones.nivelesAudio.picoDBFS.toFixed(1)
            +
            ' dBFS</div>'
            +
            '<div class="dato"><span class="etiqueta">RMS AUDIO</span>'
            +
            opciones.nivelesAudio.rmsDBFS.toFixed(1)
            +
            ' dBFS</div>';
    }


    panel.classList.add("activo");
}



function calcularNivelesAudioDBFS(
    muestras
) {

    if (
        !muestras
        ||
        muestras.length === 0
    ) {
        return {
            picoDBFS: -120,
            rmsDBFS: -120
        };
    }


    let pico = 0;
    let sumaCuadrados = 0;


    for (
        let i = 0;
        i < muestras.length;
        i++
    ) {

        const valor =
            Number(muestras[i])
            ||
            0;


        pico =
            Math.max(
                pico,
                Math.abs(valor)
            );


        sumaCuadrados +=
            valor * valor;
    }


    const rms =
        Math.sqrt(
            sumaCuadrados
            /
            muestras.length
        );


    return {
        picoDBFS:
            20
            *
            Math.log10(
                Math.max(
                    pico,
                    1e-12
                )
            ),
        rmsDBFS:
            20
            *
            Math.log10(
                Math.max(
                    rms,
                    1e-12
                )
            )
    };
}

function dibujarEspectroFFT(
    idCanvas,
    espectro,
    opciones = {}
) {

    const canvas =
        document
            .getElementById(
                idCanvas
            );


    if (!espectro) {

        limpiarCanvasConMensaje(
            idCanvas,
            "Espectro no disponible"
        );

        return;
    }


    const altura =
        opciones.altura
        ||
        (
            idCanvas === "graficaEspectro"
            ?
            390
            :
            330
        );


    const cd =
        prepararCanvas(
            canvas,
            altura
        );


    const ctx = cd.ctx;
    const ancho = cd.ancho;
    const alto = cd.alto;


    const izquierda = 74;
    const derecha = ancho - 18;
    const superior = 24;
    const inferior = alto - 48;


    const anchoUtil =
        derecha - izquierda;

    const altoUtil =
        inferior - superior;


    const fInicio =
        Math.max(
            0,
            Number.isFinite(opciones.fInicio)
            ?
            opciones.fInicio
            :
            0
        );

    const fFin =
        Math.max(
            fInicio + 1e-9,
            Math.min(
                espectro.fNyquist,
                Number.isFinite(opciones.fFin)
                ?
                opciones.fFin
                :
                espectro.fNyquist
            )
        );


    const refDB =
        Number.isFinite(espectro.refDB)
        ?
        espectro.refDB
        :
        0;


    const pisoDB =
        Number.isFinite(espectro.pisoDB)
        ?
        espectro.pisoDB
        :
        refDB - 80;


    const unidad =
        espectro.unidad
        ||
        "dB";


    function xFrecuencia(frecuencia) {

        return (
            izquierda
            +
            (
                frecuencia - fInicio
            )
            /
            (
                fFin - fInicio
            )
            *
            anchoUtil
        );
    }


    function yDB(valor) {

        const limitado =
            Math.max(
                pisoDB,
                Math.min(
                    refDB,
                    valor
                )
            );


        return (
            superior
            +
            (
                refDB - limitado
            )
            /
            (
                refDB - pisoDB
            )
            *
            altoUtil
        );
    }


    /* Fondo claro para aula y proyección */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );


    /* Retícula horizontal: 10 dB/div */
    const divisionesDB =
        Math.round(
            (refDB - pisoDB) / 10
        );


    for (
        let division = 0;
        division <= divisionesDB;
        division++
    ) {

        const nivel =
            refDB
            -
            10 * division;

        const y = yDB(nivel);


        ctx.strokeStyle =
            division === 0
            ?
            "#9aa7b2"
            :
            "#dfe5ea";

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(izquierda, y);
        ctx.lineTo(derecha, y);
        ctx.stroke();


        ctx.fillStyle = "#4d5963";
        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "right";
        ctx.fillText(
            nivel.toFixed(0)
            +
            " "
            +
            unidad,
            izquierda - 8,
            y + 3
        );
    }


    /* Retícula vertical: 10 divisiones */
    for (
        let division = 0;
        division <= 10;
        division++
    ) {

        const proporcion =
            division / 10;

        const x =
            izquierda
            +
            proporcion * anchoUtil;

        const frecuencia =
            fInicio
            +
            proporcion
            *
            (
                fFin - fInicio
            );


        ctx.strokeStyle = "#e4e9ee";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, superior);
        ctx.lineTo(x, inferior);
        ctx.stroke();


        if (
            division % 2 === 0
            ||
            division === 10
        ) {

            ctx.fillStyle = "#4d5963";
            ctx.font = "9px Consolas, monospace";
            ctx.textAlign =
                division === 0
                ?
                "left"
                :
                (
                    division === 10
                    ?
                    "right"
                    :
                    "center"
                );

            ctx.fillText(
                formatearFrecuenciaAnalizador(
                    frecuencia
                ),
                x,
                alto - 18
            );
        }
    }


    /* Traza */
    ctx.strokeStyle = "#0878c9";
    ctx.lineWidth = 1.45;
    ctx.beginPath();


    let comenzo = false;


    for (
        let i = 0;
        i < espectro.frecuencias.length;
        i++
    ) {

        const f =
            espectro.frecuencias[i];


        if (
            f < fInicio
            ||
            f > fFin
        ) {
            continue;
        }


        const x =
            xFrecuencia(f);

        const y =
            yDB(
                espectro.magnitudesDB[i]
            );


        if (!comenzo) {
            ctx.moveTo(x, y);
            comenzo = true;
        } else {
            ctx.lineTo(x, y);
        }
    }


    if (comenzo) {
        ctx.stroke();
    }


    /* Marcador de pico */
    const pico =
        encontrarPicoEspectro(
            espectro,
            fInicio,
            fFin
        );


    if (pico) {

        const x =
            xFrecuencia(
                pico.frecuencia
            );

        const y =
            yDB(
                pico.nivel
            );


        ctx.fillStyle = "#d98a00";
        ctx.beginPath();
        ctx.moveTo(x, Math.max(superior, y - 12));
        ctx.lineTo(x - 5, Math.max(superior, y - 20));
        ctx.lineTo(x + 5, Math.max(superior, y - 20));
        ctx.closePath();
        ctx.fill();


        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = "#8a5700";
        ctx.fillText(
            "M1 "
            +
            formatearFrecuenciaAnalizador(
                pico.frecuencia
            )
            +
            "  "
            +
            pico.nivel.toFixed(1)
            +
            " "
            +
            unidad,
            Math.min(
                x + 7,
                derecha - 175
            ),
            Math.max(
                superior + 12,
                y - 8
            )
        );
    }


    /* Referencia de portadora en el espectro AM */
    if (
        Number.isFinite(
            opciones.marcadorFrecuencia
        )
        &&
        opciones.marcadorFrecuencia >= fInicio
        &&
        opciones.marcadorFrecuencia <= fFin
    ) {

        const xFc =
            xFrecuencia(
                opciones.marcadorFrecuencia
            );


        ctx.save();
        ctx.strokeStyle = "#d56b00";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(xFc, superior);
        ctx.lineTo(xFc, inferior);
        ctx.stroke();
        ctx.restore();


        ctx.fillStyle = "#a95100";
        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            "Fc "
            +
            formatearFrecuenciaAnalizador(
                opciones.marcadorFrecuencia
            ),
            xFc,
            superior + 12
        );
    }


    /* Marco */
    ctx.strokeStyle = "#9aa7b2";
    ctx.lineWidth = 1;
    ctx.strokeRect(
        izquierda,
        superior,
        anchoUtil,
        altoUtil
    );
}

function actualizarVistaEspectroFuenteAlternativa(
    datos
) {

    if (!datos) {
        return;
    }


    const tipo =
        obtenerFuenteModulante();


    const descripcion =
        descripcionDeFuente(tipo);


    document
        .getElementById(
            "tituloFuenteEspectro"
        )
        .textContent =
        descripcion[0];


    document
        .getElementById(
            "descripcionFuenteEspectro"
        )
        .textContent =
        tipo === "AUDIO"
        ?
        (
            (nombreArchivoAudio || "Archivo de audio")
            +
            " — se analiza el mismo instante que está reproduciéndose o pausado."
        )
        :
        descripcion[1];


    document
        .getElementById(
            "notaEspectroFuente"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "notaEspectroFuente"
        )
        .textContent =
        tipo === "AUDIO"
        ?
        "Archivo de audio: FFT de la modulante en dBFS (referida al máximo digital) y FFT de la AM en dBV simulados. No es una medición RF física calibrada."
        :
        "Vista tipo analizador para observación didáctica: modulante en dB relativos y señal AM en dBV simulados. No sustituye un analizador RF calibrado.";


    const zonaModulante =
        document.getElementById(
            "zonaEspectroModulante"
        );


    zonaModulante.style.display =
        "block";

    zonaModulante.classList.add(
        "modo-analizador"
    );


    const canvasAM =
        document.getElementById(
            "graficaEspectro"
        );

    const graficaAM =
        canvasAM.closest(
            ".grafica"
        );


    if (graficaAM) {
        graficaAM.classList.add(
            "modo-analizador"
        );
    }


    canvasAM.classList.add(
        "modo-analizador-canvas"
    );


    document
        .getElementById(
            "tituloGraficaEspectroAM"
        )
        .textContent =
        "Analizador — señal AM";


    document
        .getElementById(
            "descripcionEspectro"
        )
        .textContent =
        tipo === "AUDIO"
        ?
        "FFT del archivo de audio en dBFS y de la señal AM simulada en dBV. El audio usado para modular se normaliza, pero la FFT superior conserva el nivel digital original del archivo."
        :
        "Vista instrumental de la FFT de la fuente seleccionada y de la señal AM en la ventana actual. La modulante usa magnitud relativa y la AM usa dBV simulados.";


    const muestrasModulanteEspectro =
        tipo === "AUDIO"
        &&
        datos.modulante_audio_original
        ?
        datos.modulante_audio_original
        :
        datos.modulante;


    const espectroModulante =
        calcularEspectroFFT(
            datos.t,
            muestrasModulanteEspectro,
            {
                modo:
                    tipo === "AUDIO"
                    ?
                    "DBFS"
                    :
                    "RELATIVO"
            }
        );


    const espectroAM =
        calcularEspectroFFT(
            datos.t,
            datos.senal_am,
            {
                modo: "DBV"
            }
        );


    if (
        !espectroModulante
        ||
        !espectroAM
    ) {

        dibujarEspectroFFT(
            "graficaEspectroModulante",
            espectroModulante
        );

        dibujarEspectroFFT(
            "graficaEspectro",
            espectroAM
        );

        return;
    }


    const fInicioMod = 0;
    const fFinMod =
        espectroModulante.fNyquist;

    const fInicioAM = 0;
    const fFinAM =
        espectroAM.fNyquist;


    dibujarEspectroFFT(
        "graficaEspectroModulante",
        espectroModulante,
        {
            fInicio: fInicioMod,
            fFin: fFinMod,
            altura: 330
        }
    );


    dibujarEspectroFFT(
        "graficaEspectro",
        espectroAM,
        {
            fInicio: fInicioAM,
            fFin: fFinAM,
            marcadorFrecuencia:
                Number(datos.fc),
            altura: 390
        }
    );


    actualizarInfoAnalizador(
        "infoAnalizadorModulante",
        espectroModulante,
        {
            fInicio: fInicioMod,
            fFin: fFinMod,
            nivelesAudio:
                tipo === "AUDIO"
                ?
                calcularNivelesAudioDBFS(
                    muestrasModulanteEspectro
                )
                :
                null
        }
    );


    actualizarInfoAnalizador(
        "infoAnalizadorAM",
        espectroAM,
        {
            fInicio: fInicioAM,
            fFin: fFinAM,
            marcadorFrecuencia:
                Number(datos.fc)
        }
    );


    const bmVisible =
        frecuenciaSignificativaMaxima(
            espectroModulante,
            35
        );


    const advertencia =
        document.getElementById(
            "advertenciaEspectroComplejo"
        );


    if (
        Number.isFinite(datos.fc)
        &&
        bmVisible > 0
        &&
        datos.fc <= bmVisible
    ) {

        advertencia.textContent =
            "Advertencia didáctica: fc = "
            +
            formatearFrecuenciaAnalizador(
                datos.fc
            )
            +
            " es menor o igual que la frecuencia significativa máxima observada de la modulante (≈ "
            +
            formatearFrecuenciaAnalizador(
                bmVisible
            )
            +
            "). Las componentes AM pueden superponerse alrededor de bajas frecuencias. Para una separación espectral más clara, aumente fc o utilice una modulante de menor ancho de banda.";

        advertencia.classList.add(
            "visible"
        );

    } else {

        advertencia.textContent = "";
        advertencia.classList.remove(
            "visible"
        );
    }


    document
        .getElementById(
            "sistemaResultado"
        )
        .textContent =
        tipo === "AUDIO"
        ?
        "AM convencional — FFT dBFS / dBV"
        :
        "AM convencional — analizador FFT";


    document
        .getElementById(
            "componentes"
        )
        .textContent =
        "Múltiples componentes de la fuente actual";


    document
        .getElementById(
            "BLI"
        )
        .textContent =
        "Distribuida — ver traza";


    document
        .getElementById(
            "Portadora"
        )
        .textContent =
        Number(datos.fc)
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "BLS"
        )
        .textContent =
        "Distribuida — ver traza";


    document
        .getElementById(
            "extremoInferior"
        )
        .textContent =
        "START "
        +
        formatearFrecuenciaAnalizador(
            fInicioAM
        );


    document
        .getElementById(
            "extremoSuperior"
        )
        .textContent =
        "STOP "
        +
        formatearFrecuenciaAnalizador(
            fFinAM
        );


    document
        .getElementById(
            "anchoBanda"
        )
        .textContent =
        bmVisible > 0
        ?
        (
            "Hasta ≈ "
            +
            formatearFrecuenciaAnalizador(
                bmVisible
            )
            +
            " (umbral: 35 dB bajo el pico)"
        )
        :
        "No estimado";


    limpiarErrorResultados(
        "resultadosEspectro"
    );


    setMensaje(
        tipo === "AUDIO"
        ?
        "ESPECTRO actualizado con el mismo instante del audio. Modulante en dBFS y señal AM en dBV simulados."
        :
        "ESPECTRO actualizado con la fuente modulante global. Modulante relativa y señal AM en dBV simulados."
    );
}


function prepararVistaEspectroSenoidal() {

    document
        .getElementById(
            "tituloFuenteEspectro"
        )
        .textContent =
        "Modulante senoidal";


    document
        .getElementById(
            "descripcionFuenteEspectro"
        )
        .textContent =
        "La modulante senoidal conserva el análisis espectral teórico original del simulador.";


    document
        .getElementById(
            "notaEspectroFuente"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "zonaEspectroModulante"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "tituloGraficaEspectroAM"
        )
        .textContent =
        "Representación espectral";


    [
        "infoAnalizadorModulante",
        "infoAnalizadorAM"
    ].forEach(
        function (id) {

            const panel =
                document.getElementById(id);


            if (panel) {
                panel.classList.remove("activo");
                panel.innerHTML = "";
            }
        }
    );


    const zonaModulante =
        document.getElementById(
            "zonaEspectroModulante"
        );


    if (zonaModulante) {
        zonaModulante.classList.remove(
            "modo-analizador"
        );
    }


    const canvasAM =
        document.getElementById(
            "graficaEspectro"
        );


    if (canvasAM) {
        canvasAM.classList.remove(
            "modo-analizador-canvas"
        );

        const graficaAM =
            canvasAM.closest(
                ".grafica"
            );


        if (graficaAM) {
            graficaAM.classList.remove(
                "modo-analizador"
            );
        }
    }


    const advertencia =
        document.getElementById(
            "advertenciaEspectroComplejo"
        );


    if (advertencia) {
        advertencia.textContent = "";
        advertencia.classList.remove(
            "visible"
        );
    }
}


function dibujarEspectro(datos) {

    const canvas =
        document
            .getElementById(
                "graficaEspectro"
            );


    const cd =
        prepararCanvas(
            canvas,
            390
        );


    const ctx =
        cd.ctx;


    const ancho =
        cd.ancho;


    const alto =
        cd.alto;


    const izquierda = 65;

    const derecha =
        ancho - 30;

    const superior = 35;

    const inferior =
        alto - 65;


    const anchoUtil =
        derecha
        -
        izquierda;


    const altoUtil =
        inferior
        -
        superior;


    const margen =
        Math.max(
            datos.fm * 0.45,
            10
        );


    let fMin =
        Math.max(
            0,
            datos.extremo_inferior
            -
            margen
        );


    let fMax =
        datos.extremo_superior
        +
        margen;


    function xFrecuencia(f) {

        return (
            izquierda
            +
            (
                (f - fMin)
                /
                (fMax - fMin)
            )
            *
            anchoUtil
        );
    }


    ctx.strokeStyle =
        "#999";


    ctx.lineWidth =
        1;


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        inferior
    );


    ctx.lineTo(
        derecha,
        inferior
    );


    ctx.moveTo(
        izquierda,
        superior
    );


    ctx.lineTo(
        izquierda,
        inferior
    );


    ctx.stroke();


    const xFc =
        xFrecuencia(
            datos.fc
        );


    if (
        !datos
            .portadora_transmitida
    ) {

        ctx.save();


        ctx.setLineDash(
            [6, 5]
        );


        ctx.strokeStyle =
            "#777";


        ctx.beginPath();


        ctx.moveTo(
            xFc,
            superior
        );


        ctx.lineTo(
            xFc,
            inferior
        );


        ctx.stroke();


        ctx.restore();


        ctx.fillStyle =
            "#666";


        ctx.font =
            "11px Arial";


        ctx.fillText(
            "fc (referencia)",
            xFc - 38,
            superior - 8
        );
    }


    if (
        datos.tipo_espectro
        ===
        "lineas"
    ) {

        let amplitudMaxima = 0;


        for (
            const componente
            of datos
                .componentes_espectrales
        ) {

            amplitudMaxima =
                Math.max(
                    amplitudMaxima,
                    componente
                        .amplitud
                );
        }


        if (
            amplitudMaxima
            <=
            0
        ) {

            amplitudMaxima = 1;
        }


        for (
            const componente
            of datos
                .componentes_espectrales
        ) {

            const x =
                xFrecuencia(
                    componente
                        .frecuencia
                );


            const altura =
                (
                    componente.amplitud
                    /
                    amplitudMaxima
                )
                *
                (
                    altoUtil
                    *
                    0.78
                );


            const color =
                componente.nombre
                ===
                "fc"
                ?
                "#16803c"
                :
                "#d00000";


            ctx.strokeStyle =
                color;


            ctx.lineWidth = 3;


            ctx.beginPath();


            ctx.moveTo(
                x,
                inferior
            );


            ctx.lineTo(
                x,
                inferior
                -
                altura
            );


            ctx.stroke();


            ctx.fillStyle =
                color;


            ctx.font =
                "12px Arial";


            ctx.fillText(
                componente.nombre,
                x - 13,
                inferior
                -
                altura
                -
                10
            );


            if (
                componente.nombre
                ===
                "fc"
            ) {

                ctx.fillStyle =
                    "#333";


                ctx.font =
                    "10px Arial";


                ctx.fillText(
                    componente
                        .frecuencia
                        .toFixed(0)
                    +
                    " Hz",
                    x - 24,
                    inferior + 22
                );
            }
        }

    } else {

        const alturaBanda =
            altoUtil
            *
            0.62;


        for (
            const zona
            of datos
                .zonas_espectrales
        ) {

            const x1 =
                xFrecuencia(
                    zona.inicio
                );


            const x2 =
                xFrecuencia(
                    zona.fin
                );


            const esVestigio =
                zona.nombre
                    .includes(
                        "Vestigio"
                    );


            ctx.fillStyle =
                esVestigio
                ?
                "rgba(208,0,0,0.35)"
                :
                "rgba(22,134,255,0.35)";


            ctx.fillRect(
                x1,
                inferior
                -
                alturaBanda,
                x2 - x1,
                alturaBanda
            );


            ctx.strokeStyle =
                "#555";


            ctx.strokeRect(
                x1,
                inferior
                -
                alturaBanda,
                x2 - x1,
                alturaBanda
            );


            ctx.fillStyle =
                "#222";


            ctx.font =
                "11px Arial";


            ctx.fillText(
                zona.nombre,
                x1 + 5,
                inferior
                -
                alturaBanda
                -
                10
            );
        }
    }


    const xInferior =
        xFrecuencia(
            datos
                .extremo_inferior
        );


    const xSuperior =
        xFrecuencia(
            datos
                .extremo_superior
        );


    ctx.fillStyle =
        "#333";


    ctx.font =
        "10px Arial";


    ctx.fillText(
        datos
            .extremo_inferior
            .toFixed(0)
        +
        " Hz",
        xInferior - 25,
        inferior + 42
    );


    ctx.fillText(
        datos
            .extremo_superior
            .toFixed(0)
        +
        " Hz",
        xSuperior - 25,
        inferior + 42
    );


    ctx.fillStyle =
        "#173d68";


    ctx.font =
        "bold 12px Arial";


    ctx.fillText(
        "BW = "
        +
        datos
            .ancho_banda
            .toFixed(0)
        +
        " Hz",
        izquierda + 10,
        superior + 15
    );
}


/* ==========================================================
   FRECUENCIA TEORICA
   ========================================================== */

function dibujarFrecuenciaTeorica(
    frecuencia
) {

    const canvas =
        document
            .getElementById(
                "graficaImplTeorica"
            );


    const datos =
        prepararCanvas(
            canvas,
            300
        );


    const ctx =
        datos.ctx;


    const ancho =
        datos.ancho;


    const alto =
        datos.alto;


    const izquierda = 70;

    const derecha =
        ancho - 50;

    const superior = 40;

    const inferior =
        alto - 55;


    const fMax =
        frecuencia
        *
        1.5;


    function xF(f) {

        return (
            izquierda
            +
            (
                f / fMax
            )
            *
            (
                derecha
                -
                izquierda
            )
        );
    }


    ctx.strokeStyle =
        "#999";


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        inferior
    );


    ctx.lineTo(
        derecha,
        inferior
    );


    ctx.stroke();


    const x =
        xF(
            frecuencia
        );


    ctx.strokeStyle =
        "#175ea8";


    ctx.lineWidth = 4;


    ctx.beginPath();


    ctx.moveTo(
        x,
        inferior
    );


    ctx.lineTo(
        x,
        superior + 45
    );


    ctx.stroke();


    ctx.fillStyle =
        "#173d68";


    ctx.font =
        "bold 14px Arial";


    ctx.fillText(
        "f0",
        x - 8,
        superior + 30
    );


    ctx.font =
        "13px Arial";


    ctx.fillText(
        frecuencia
            .toFixed(2)
        +
        " Hz",
        x - 40,
        inferior + 30
    );


    ctx.fillStyle =
        "#555";


    ctx.font =
        "11px Arial";


    ctx.fillText(
        "Referencia teórica",
        izquierda,
        superior
    );
}


/* ==========================================================
   MEZCLADOR
   ========================================================== */

function dibujarMixerEntradas(
    tiempo,
    x1,
    x2
) {

    const canvas =
        document
            .getElementById(
                "graficaMixerEntrada"
            );


    const d =
        prepararCanvas(
            canvas,
            175
        );


    const ctx = d.ctx;

    const ancho = d.ancho;

    const alto = d.alto;

    const izquierda = 45;

    const derecha =
        ancho - 15;

    const centro =
        alto / 2;

    const anchoUtil =
        derecha - izquierda;


    ctx.strokeStyle =
        "#ccc";


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        centro
    );


    ctx.lineTo(
        derecha,
        centro
    );


    ctx.stroke();


    function trazar(
        vector,
        color
    ) {

        ctx.strokeStyle =
            color;


        ctx.lineWidth =
            1.2;


        ctx.beginPath();


        for (
            let i = 0;
            i < vector.length;
            i++
        ) {

            const x =
                izquierda
                +
                (
                    i
                    /
                    (
                        vector.length
                        -
                        1
                    )
                )
                *
                anchoUtil;


            const y =
                centro
                -
                vector[i]
                *
                55;


            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }


        ctx.stroke();
    }


    trazar(
        x1,
        "#087ef5"
    );


    trazar(
        x2,
        "#d00000"
    );


    ctx.fillStyle =
        "#087ef5";


    ctx.font =
        "11px Arial";


    ctx.fillText(
        "f1",
        izquierda + 5,
        16
    );


    ctx.fillStyle =
        "#d00000";


    ctx.fillText(
        "f2",
        izquierda + 35,
        16
    );
}


function dibujarMixerSalida(
    salida
) {

    const canvas =
        document
            .getElementById(
                "graficaMixerSalida"
            );


    const d =
        prepararCanvas(
            canvas,
            175
        );


    const ctx = d.ctx;

    const ancho = d.ancho;

    const alto = d.alto;

    const izquierda = 45;

    const derecha =
        ancho - 15;

    const centro =
        alto / 2;

    const anchoUtil =
        derecha
        -
        izquierda;


    ctx.strokeStyle =
        "#ccc";


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        centro
    );


    ctx.lineTo(
        derecha,
        centro
    );


    ctx.stroke();


    ctx.strokeStyle =
        "#175ea8";


    ctx.lineWidth =
        1.2;


    ctx.beginPath();


    for (
        let i = 0;
        i < salida.length;
        i++
    ) {

        const x =
            izquierda
            +
            (
                i
                /
                (
                    salida.length
                    -
                    1
                )
            )
            *
            anchoUtil;


        const y =
            centro
            -
            salida[i]
            *
            60;


        if (i === 0) {

            ctx.moveTo(x, y);

        } else {

            ctx.lineTo(x, y);
        }
    }


    ctx.stroke();
}


function dibujarMixerEspectro(
    fdiferencia,
    fsuma
) {

    const canvas =
        document
            .getElementById(
                "graficaMixerEspectro"
            );


    const d =
        prepararCanvas(
            canvas,
            220
        );


    const ctx = d.ctx;

    const ancho = d.ancho;

    const alto = d.alto;

    const izquierda = 65;

    const derecha =
        ancho - 35;

    const superior = 30;

    const inferior =
        alto - 45;


    const fMax =
        fsuma
        *
        1.18;


    function xF(f) {

        return (
            izquierda
            +
            (
                f / fMax
            )
            *
            (
                derecha
                -
                izquierda
            )
        );
    }


    ctx.strokeStyle =
        "#999";


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        inferior
    );


    ctx.lineTo(
        derecha,
        inferior
    );


    ctx.stroke();


    function linea(
        frecuencia,
        texto
    ) {

        const x =
            xF(
                frecuencia
            );


        ctx.strokeStyle =
            "#d00000";


        ctx.lineWidth = 3;


        ctx.beginPath();


        ctx.moveTo(
            x,
            inferior
        );


        ctx.lineTo(
            x,
            superior + 35
        );


        ctx.stroke();


        ctx.fillStyle =
            "#d00000";


        ctx.font =
            "11px Arial";


        ctx.fillText(
            texto,
            x - 35,
            superior + 20
        );


        ctx.fillStyle =
            "#333";


        ctx.font =
            "10px Arial";


        ctx.fillText(
            frecuencia
                .toFixed(0)
            +
            " Hz",
            x - 25,
            inferior + 22
        );
    }


    linea(
        fdiferencia,
        "Diferencia"
    );


    linea(
        fsuma,
        "Suma"
    );
}


/* ==========================================================
   RUIDO
   ========================================================== */

function dibujarSenalRuido(
    canvasId,
    tiempo,
    senal,
    envolventeSuperior,
    envolventeInferior
) {

    const canvas =
        document
            .getElementById(
                canvasId
            );


    const datos =
        prepararCanvas(
            canvas,
            205
        );


    const ctx =
        datos.ctx;


    const ancho =
        datos.ancho;


    const alto =
        datos.alto;


    const izquierda = 45;

    const derecha =
        ancho - 15;

    const superior = 12;

    const inferior =
        alto - 27;


    const anchoUtil =
        derecha
        -
        izquierda;


    const altoUtil =
        inferior
        -
        superior;


    const centro =
        superior
        +
        altoUtil / 2;


    let maximo = 0;


    for (
        let i = 0;
        i < senal.length;
        i++
    ) {

        maximo =
            Math.max(
                maximo,
                Math.abs(
                    senal[i]
                ),
                Math.abs(
                    envolventeSuperior[i]
                ),
                Math.abs(
                    envolventeInferior[i]
                )
            );
    }


    if (maximo <= 0) {
        maximo = 1;
    }


    ctx.strokeStyle =
        "#d0d0d0";


    ctx.lineWidth = 1;


    ctx.beginPath();


    ctx.moveTo(
        izquierda,
        centro
    );


    ctx.lineTo(
        derecha,
        centro
    );


    ctx.stroke();


    function trazar(
        vector,
        color,
        grosor
    ) {

        ctx.strokeStyle =
            color;


        ctx.lineWidth =
            grosor;


        ctx.beginPath();


        for (
            let i = 0;
            i < vector.length;
            i++
        ) {

            const x =
                izquierda
                +
                (
                    i
                    /
                    (
                        vector.length
                        -
                        1
                    )
                )
                *
                anchoUtil;


            const y =
                centro
                -
                (
                    vector[i]
                    /
                    maximo
                )
                *
                (
                    altoUtil
                    *
                    0.44
                );


            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }


        ctx.stroke();
    }


    trazar(
        senal,
        "#1686ff",
        1
    );


    trazar(
        envolventeSuperior,
        "#d00000",
        1.5
    );


    trazar(
        envolventeInferior,
        "#d00000",
        1.5
    );


    ctx.fillStyle =
        "#444";


    ctx.font =
        "9px Arial";


    ctx.fillText(
        tiempo[0]
            .toFixed(4)
        +
        " s",
        izquierda,
        alto - 6
    );


    ctx.fillText(
        tiempo[
            tiempo.length - 1
        ]
            .toFixed(4)
        +
        " s",
        derecha - 48,
        alto - 6
    );
}


/* ==========================================================
   ACTUALIZAR AM
   ========================================================== */

function actualizarVistaAM(datos) {

    document
        .getElementById(
            "AmaxTeorico"
        )
        .textContent =
        datos.Amax_teorico
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AminTeorico"
        )
        .textContent =
        datos.Amin_teorico
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AmaxSimulado"
        )
        .textContent =
        datos.Amax_simulado
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "AminSimulado"
        )
        .textContent =
        datos.Amin_simulado
            .toFixed(3)
        +
        " V";


    document
        .getElementById(
            "mConfigurado"
        )
        .textContent =
        Number(
            datos.m
        )
            .toFixed(3);


    document
        .getElementById(
            "mSimulado"
        )
        .textContent =
        datos.m_simulado
            .toFixed(3);


    document
        .getElementById(
            "estado"
        )
        .textContent =
        datos.estado;


    document
        .getElementById(
            "sistemaResultado"
        )
        .textContent =
        datos.nombre_sistema;


    document
        .getElementById(
            "componentes"
        )
        .textContent =
        datos.componentes_texto;


    document
        .getElementById(
            "BLI"
        )
        .textContent =
        datos.f_bli
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "Portadora"
        )
        .textContent =
        datos.fc
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "BLS"
        )
        .textContent =
        datos.f_bls
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "extremoInferior"
        )
        .textContent =
        datos.extremo_inferior
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "extremoSuperior"
        )
        .textContent =
        datos.extremo_superior
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "anchoBanda"
        )
        .textContent =
        datos.ancho_banda
            .toFixed(3)
        +
        " Hz";


    document
        .getElementById(
            "descripcionEspectro"
        )
        .textContent =
        datos.nombre_sistema
        +
        " — "
        +
        datos.componentes_texto;


    if (
        pestanaActiva
        ===
        "tiempo"
    ) {

        dibujarSenal(
            "graficaModulante",
            datos.t,
            datos.modulante
        );


        dibujarSenal(
            "graficaPortadora",
            datos.t,
            datos.portadora
        );


        dibujarAM(
            datos.t,
            datos.senal_am,
            datos
                .envolvente_superior,
            datos
                .envolvente_inferior
        );


        dibujarComparacionEnvolvente(
            datos.t,
            datos.modulante,
            datos.envolvente_superior,
            datos.Ac,
            datos.m
        );

    }


    else if (
        pestanaActiva
        ===
        "espectro"
    ) {

        prepararVistaEspectroSenoidal();


        dibujarEspectro(
            datos
        );
    }
}


/* ==========================================================
   ACTUALIZAR IMPLEMENTACION
   ========================================================== */

function crearResultadoModuladorGlobal(
    datosTiempo
) {

    const tipoFuente =
        obtenerFuenteModulante();


    const descripcionFuente =
        descripcionDeFuente(
            tipoFuente
        );


    return {
        tipo: "MODULADOR",
        nombre: "Modulador AM",
        descripcion:
            "Modulador AM alimentado por la fuente global: "
            +
            descripcionFuente[0]
            +
            ".",
        validacion:
            "La salida AM conserva la portadora y su amplitud sigue la forma de la modulante seleccionada.",
        fuente: tipoFuente,
        datosTiempo: datosTiempo
    };
}


function actualizarVistaModuladorGlobal(
    datosTiempo
) {

    const resultado =
        crearResultadoModuladorGlobal(
            datosTiempo
        );


    ultimoResultadoImpl =
        resultado;


    actualizarVistaImplementacion(
        resultado
    );
}


function actualizarVistaImplementacion(
    datos
) {

    document
        .getElementById(
            "implNombre"
        )
        .textContent =
        datos.nombre;


    document
        .getElementById(
            "descripcionImplementacion"
        )
        .textContent =
        datos.descripcion;


    document
        .getElementById(
            "implValidacion"
        )
        .textContent =
        datos.validacion;


    document
        .getElementById(
            "resultadoFuenteImpl"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoParametrosAMImpl"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoCeq"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoLtotal"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoF0"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoFSuma"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultadoFDiferencia"
        )
        .style.display =
        "none";


    const tipo =
        datos.tipo;


    document
        .getElementById(
            "zonaModulador"
        )
        .style.display =
        "none";


    if (tipo === "MODULADOR") {

        const datosTiempo =
            datos.datosTiempo;


        document
            .getElementById(
                "formulaImplementacion"
            )
            .textContent =
            "s_AM(t) = Ac x [1 + m x x_m(t)] x cos(2 x pi x fc x t)";


        document
            .getElementById(
                "resultadoFuenteImpl"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "resultadoParametrosAMImpl"
            )
            .style.display =
            "block";


        const descripcionFuente =
            descripcionDeFuente(
                datos.fuente
            );


        document
            .getElementById(
                "implFuenteGlobal"
            )
            .textContent =
            descripcionFuente[0];


        document
            .getElementById(
                "implParametrosAM"
            )
            .textContent =
            "Ac = "
            +
            datosTiempo.Ac.toFixed(3)
            +
            " V | fc = "
            +
            datosTiempo.fc.toFixed(3)
            +
            " Hz | m = "
            +
            datosTiempo.m.toFixed(3);


        document
            .getElementById(
                "zonaModulador"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "zonaOscilador"
            )
            .style.display =
            "none";


        document
            .getElementById(
                "zonaMixer"
            )
            .style.display =
            "none";


        actualizarResumenFuenteImplementacion();


        dibujarSenal(
            "graficaImplModulante",
            datosTiempo.t,
            datosTiempo.modulante
        );


        dibujarSenal(
            "graficaImplPortadora",
            datosTiempo.t,
            datosTiempo.portadora
        );


        dibujarSenalRuido(
            "graficaImplAM",
            datosTiempo.t,
            datosTiempo.senal_am,
            datosTiempo.envolvente_superior,
            datosTiempo.envolvente_inferior
        );


        return;
    }


    if (tipo === "LC") {

        document
            .getElementById(
                "formulaImplementacion"
            )
            .textContent =
            "f0 = 1 / (2 x pi x raíz(L x C))";


        document
            .getElementById(
                "resultadoF0"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "implF0"
            )
            .textContent =
            datos.f0
                .toFixed(3)
            +
            " Hz";


        document
            .getElementById(
                "zonaOscilador"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "zonaMixer"
            )
            .style.display =
            "none";


        dibujarFrecuenciaTeorica(
            datos.f0
        );
    }


    else if (
        tipo === "COLPITTS"
    ) {

        document
            .getElementById(
                "formulaImplementacion"
            )
            .textContent =
            "Ceq = (C1 x C2) / (C1 + C2)    |    "
            +
            "f0 = 1 / (2 x pi x raíz(L x Ceq))";


        document
            .getElementById(
                "resultadoCeq"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "resultadoF0"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "implCeq"
            )
            .textContent =
            datos.Ceq_nF
                .toFixed(3)
            +
            " nF";


        document
            .getElementById(
                "implF0"
            )
            .textContent =
            datos.f0
                .toFixed(3)
            +
            " Hz";


        document
            .getElementById(
                "zonaOscilador"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "zonaMixer"
            )
            .style.display =
            "none";


        dibujarFrecuenciaTeorica(
            datos.f0
        );
    }


    else if (
        tipo === "HARTLEY"
    ) {

        document
            .getElementById(
                "formulaImplementacion"
            )
            .textContent =
            "Ltotal = L1 + L2    |    "
            +
            "f0 = 1 / (2 x pi x raíz(Ltotal x C))";


        document
            .getElementById(
                "resultadoLtotal"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "resultadoF0"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "implLtotal"
            )
            .textContent =
            datos.Ltotal_mH
                .toFixed(3)
            +
            " mH";


        document
            .getElementById(
                "implF0"
            )
            .textContent =
            datos.f0
                .toFixed(3)
            +
            " Hz";


        document
            .getElementById(
                "zonaOscilador"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "zonaMixer"
            )
            .style.display =
            "none";


        dibujarFrecuenciaTeorica(
            datos.f0
        );
    }


    else {

        document
            .getElementById(
                "formulaImplementacion"
            )
            .textContent =
            "y(t) = x1(t) x x2(t)    |    "
            +
            "f suma = f1 + f2    |    "
            +
            "f diferencia = |f1 - f2|";


        document
            .getElementById(
                "resultadoFSuma"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "resultadoFDiferencia"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "implFSuma"
            )
            .textContent =
            datos.f_suma
                .toFixed(3)
            +
            " Hz";


        document
            .getElementById(
                "implFDiferencia"
            )
            .textContent =
            datos.f_diferencia
                .toFixed(3)
            +
            " Hz";


        document
            .getElementById(
                "zonaOscilador"
            )
            .style.display =
            "none";


        document
            .getElementById(
                "zonaMixer"
            )
            .style.display =
            "block";


        dibujarMixerEntradas(
            datos.t,
            datos.x1,
            datos.x2
        );


        dibujarMixerSalida(
            datos.salida
        );


        dibujarMixerEspectro(
            datos.f_diferencia,
            datos.f_suma
        );
    }
}


/* ==========================================================
   RUIDO CON FUENTE MODULANTE GLOBAL
   ========================================================== */

function amplitudRuidoSeleccionada() {

    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    if (nivel === "LIMPIO") {
        return 0;
    }


    if (nivel === "BAJO") {
        return 0.05;
    }


    if (nivel === "MEDIO") {
        return 0.15;
    }


    if (nivel === "ALTO") {
        return 0.35;
    }


    return numeroEntrada(
        "amplitudRuido"
    );
}


function crearGeneradorPseudoaleatorio(
    semilla
) {

    let estado =
        semilla >>> 0;


    return function () {

        estado =
            (
                1664525 * estado
                +
                1013904223
            ) >>> 0;


        return estado / 4294967296;
    };
}


function generarRuidoGaussianoDeterminista(
    cantidad,
    amplitud,
    semilla
) {

    const salida =
        new Array(cantidad);


    if (
        !Number.isFinite(amplitud)
        ||
        amplitud <= 0
    ) {

        salida.fill(0);
        return salida;
    }


    const aleatorio =
        crearGeneradorPseudoaleatorio(
            semilla
        );


    let i = 0;


    while (i < cantidad) {

        let u1 = aleatorio();
        let u2 = aleatorio();


        if (u1 < 1e-12) {
            u1 = 1e-12;
        }


        const magnitud =
            Math.sqrt(
                -2 * Math.log(u1)
            );


        const angulo =
            2 * Math.PI * u2;


        salida[i] =
            amplitud
            *
            magnitud
            *
            Math.cos(angulo);


        i++;


        if (i < cantidad) {

            salida[i] =
                amplitud
                *
                magnitud
                *
                Math.sin(angulo);


            i++;
        }
    }


    return salida;
}


function estimarEnvolventeRuidosa(
    tiempo,
    senal,
    fc
) {

    const cantidad =
        senal
        ?
        senal.length
        :
        0;


    const superior =
        new Array(cantidad);


    const inferior =
        new Array(cantidad);


    if (cantidad === 0) {

        return {
            superior: superior,
            inferior: inferior
        };
    }


    let dt = 0;


    if (
        tiempo
        &&
        tiempo.length > 1
    ) {

        dt =
            tiempo[1]
            -
            tiempo[0];
    }


    const fs =
        dt > 0
        ?
        1 / dt
        :
        48000;


    const frecuenciaPortadora =
        Number.isFinite(fc)
        &&
        fc > 0
        ?
        fc
        :
        1000;


    /*
       Estimación didáctica de la envolvente recibida:
       se calcula el valor RMS local de la AM con ruido
       durante aproximadamente medio período de portadora
       y se convierte a amplitud pico con sqrt(2).

       En una senoide limpia, A_pico = sqrt(2) x V_RMS.
       Cuando existe ruido, la estimación se vuelve irregular,
       haciendo visible la deformación de la envolvente.
    */

    const muestrasVentana =
        Math.max(
            3,
            Math.min(
                401,
                Math.round(
                    fs
                    /
                    (2 * frecuenciaPortadora)
                )
            )
        );


    const mitad =
        Math.floor(
            muestrasVentana / 2
        );


    const cuadradosAcumulados =
        new Array(cantidad + 1);


    cuadradosAcumulados[0] = 0;


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const valor =
            Number.isFinite(senal[i])
            ?
            senal[i]
            :
            0;


        cuadradosAcumulados[i + 1] =
            cuadradosAcumulados[i]
            +
            valor * valor;
    }


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const inicio =
            Math.max(
                0,
                i - mitad
            );


        const fin =
            Math.min(
                cantidad,
                i + mitad + 1
            );


        const n =
            Math.max(
                1,
                fin - inicio
            );


        const promedioCuadratico =
            (
                cuadradosAcumulados[fin]
                -
                cuadradosAcumulados[inicio]
            )
            /
            n;


        const amplitudEstimada =
            Math.sqrt(
                Math.max(
                    0,
                    2 * promedioCuadratico
                )
            );


        superior[i] =
            amplitudEstimada;


        inferior[i] =
            -amplitudEstimada;
    }


    return {
        superior: superior,
        inferior: inferior
    };
}


function rmsVector(vector) {

    if (!vector || vector.length === 0) {
        return 0;
    }


    let suma = 0;


    for (
        let i = 0;
        i < vector.length;
        i++
    ) {

        suma +=
            vector[i]
            *
            vector[i];
    }


    return Math.sqrt(
        suma / vector.length
    );
}


function interpretacionRuidoNivel(
    nivel
) {

    if (nivel === "LIMPIO") {
        return "AM limpia: envolvente clara.";
    }


    if (nivel === "BAJO") {
        return "Ruido bajo: la envolvente todavía es reconocible.";
    }


    if (nivel === "MEDIO") {
        return "En la simulación, el ruido medio vuelve más irregular la envolvente y dificulta la recuperación del mensaje.";
    }


    if (nivel === "ALTO") {
        return "En la simulación, el nivel de ruido alto deteriora la señal AM y dificulta la recuperación del mensaje.";
    }


    return "Nivel de ruido personalizado.";
}


function crearDatosRuidoGlobal(
    datosBase
) {

    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    const A_ruido =
        amplitudRuidoSeleccionada();


    const inicioTiempo =
        datosBase.t
        &&
        datosBase.t.length > 0
        ?
        datosBase.t[0]
        :
        0;


    const semilla =
        (
            12345
            +
            Math.floor(
                inicioTiempo * 1000
            )
        ) >>> 0;


    const ruido =
        generarRuidoGaussianoDeterminista(
            datosBase.senal_am.length,
            A_ruido,
            semilla
        );


    const senalRuidosa =
        new Array(
            datosBase.senal_am.length
        );


    for (
        let i = 0;
        i < senalRuidosa.length;
        i++
    ) {

        senalRuidosa[i] =
            datosBase.senal_am[i]
            +
            ruido[i];
    }


    let envolventeRuidosa;


    if (A_ruido <= 0) {

        envolventeRuidosa = {
            superior:
                datosBase.envolvente_superior.slice(),
            inferior:
                datosBase.envolvente_inferior.slice()
        };

    } else {

        envolventeRuidosa =
            estimarEnvolventeRuidosa(
                datosBase.t,
                senalRuidosa,
                datosBase.fc
                ||
                numeroEntrada("fc")
            );
    }


    const V_senal_RMS =
        rmsVector(
            datosBase.senal_am
        );


    const V_ruido_RMS =
        rmsVector(
            ruido
        );


    let SNR_lineal = null;
    let SNR_dB = null;


    if (V_ruido_RMS > 1e-15) {

        const relacion =
            V_senal_RMS
            /
            V_ruido_RMS;


        SNR_lineal =
            relacion * relacion;


        SNR_dB =
            20
            *
            Math.log10(
                relacion
            );
    }


    return {
        nivel: nivel,
        A_ruido: A_ruido,
        V_senal_RMS: V_senal_RMS,
        V_ruido_RMS: V_ruido_RMS,
        SNR_lineal: SNR_lineal,
        SNR_dB: SNR_dB,
        interpretacion:
            interpretacionRuidoNivel(
                nivel
            ),
        t: datosBase.t,
        modulante: datosBase.modulante,
        envolvente_superior:
            datosBase.envolvente_superior,
        envolvente_inferior:
            datosBase.envolvente_inferior,
        envolvente_ruidosa_superior:
            envolventeRuidosa.superior,
        envolvente_ruidosa_inferior:
            envolventeRuidosa.inferior,
        senal_am_limpia:
            datosBase.senal_am,
        ruido: ruido,
        senal_am_ruidosa:
            senalRuidosa,
        fuente:
            obtenerFuenteModulante(),
        ventana:
            obtenerVentanaRuido()
    };
}


function actualizarVistaRuidoGlobal(
    datosBase
) {

    // Si el audio global ya está cargado, no debe permanecer visible
    // un error anterior de "archivo no seleccionado" en RUIDO.
    if (
        obtenerFuenteModulante() === "AUDIO"
        &&
        audioBufferModulante
    ) {

        limpiarErroresCampos([
            "fuenteModulante"
        ]);
    }


    const datos =
        crearDatosRuidoGlobal(
            datosBase
        );


    ultimoResultadoRuido =
        datos;


    actualizarVistaRuido(
        datos
    );
}


/* ==========================================================
   ACTUALIZAR RUIDO
   ========================================================== */

function actualizarVistaRuido(
    datos
) {

    const nombresNivel = {

        "LIMPIO":
            "Sin ruido",

        "BAJO":
            "Bajo",

        "MEDIO":
            "Medio",

        "ALTO":
            "Alto",

        "PERSONALIZADO":
            "Personalizado"
    };


    const descripcionFuente =
        descripcionDeFuente(
            datos.fuente
            ||
            obtenerFuenteModulante()
        );


    const fuenteResultado =
        document
            .getElementById(
                "ruidoFuenteResultado"
            );


    if (fuenteResultado) {
        fuenteResultado.textContent =
            descripcionFuente[0];
    }


    const ventanaResultado =
        document
            .getElementById(
                "ruidoVentanaResultado"
            );


    if (ventanaResultado) {
        ventanaResultado.textContent =
            (
                1000
                *
                (
                    datos.ventana
                    ||
                    obtenerVentanaRuido()
                )
            ).toFixed(1)
            +
            " ms";
    }


    document
        .getElementById(
            "ruidoNivelResultado"
        )
        .textContent =
        nombresNivel[
            datos.nivel
        ]
        ||
        datos.nivel;


    document
        .getElementById(
            "ruidoAmplitudResultado"
        )
        .textContent =
        datos.A_ruido
            .toFixed(3);


    document
        .getElementById(
            "ruidoVsenal"
        )
        .textContent =
        datos.V_senal_RMS
            .toFixed(4)
        +
        " V";


    document
        .getElementById(
            "ruidoVruido"
        )
        .textContent =
        datos.V_ruido_RMS
            .toFixed(4)
        +
        " V";


    if (
        datos.SNR_lineal
        ===
        null
    ) {

        document
            .getElementById(
                "ruidoSNRlineal"
            )
            .textContent =
            "∞ (ideal)";

    } else {

        document
            .getElementById(
                "ruidoSNRlineal"
            )
            .textContent =
            datos.SNR_lineal
                .toFixed(3);
    }


    if (
        datos.SNR_dB
        ===
        null
    ) {

        document
            .getElementById(
                "ruidoSNRdB"
            )
            .textContent =
            "∞ dB (ideal)";

    } else {

        document
            .getElementById(
                "ruidoSNRdB"
            )
            .textContent =
            datos.SNR_dB
                .toFixed(3)
            +
            " dB";
    }


    document
        .getElementById(
            "ruidoInterpretacion"
        )
        .textContent =
        datos.interpretacion;


    document
        .getElementById(
            "descripcionRuido"
        )
        .textContent =
        "Ruido aditivo gaussiano sobre "
        +
        descripcionFuente[0]
        +
        " — nivel "
        +
        (
            nombresNivel[
                datos.nivel
            ]
            ||
            datos.nivel
        )
        +
        " — ventana "
        +
        (
            1000
            *
            (
                datos.ventana
                ||
                obtenerVentanaRuido()
            )
        ).toFixed(1)
        +
        " ms";


    let textoTitulo;


    if (
        datos.nivel
        ===
        "LIMPIO"
    ) {

        textoTitulo =
            "Señal AM sin ruido — comparación";

    } else {

        textoTitulo =
            "Señal AM con ruido y envolvente estimada";


        if (
            datos.SNR_dB
            !==
            null
        ) {

            textoTitulo +=
                " — SNR = "
                +
                datos.SNR_dB
                    .toFixed(2)
                +
                " dB";
        }
    }


    document
        .getElementById(
            "tituloRuidoRuidosa"
        )
        .textContent =
        textoTitulo;


    dibujarSenalRuido(
        "graficaRuidoLimpia",
        datos.t,
        datos.senal_am_limpia,
        datos
            .envolvente_superior,
        datos
            .envolvente_inferior
    );


    dibujarSenalRuido(
        "graficaRuidoRuidosa",
        datos.t,
        datos.senal_am_ruidosa,
        datos
            .envolvente_ruidosa_superior,
        datos
            .envolvente_ruidosa_inferior
    );
}


/* ==========================================================
   SNR POR POTENCIAS
   ========================================================== */

function calcularSNRPotencia() {

    const Psenal =
        numeroEntrada(
            "potenciaSenal"
        );


    const Pruido =
        numeroEntrada(
            "potenciaRuido"
        );


    const errores = [];


    if (
        !Number.isFinite(Psenal)
    ) {

        errores.push(
            crearError(
                ["potenciaSenal"],
                "potenciaSenal",
                "La potencia de señal está vacía o no contiene un número válido."
            )
        );

    } else if (
        Psenal <= 0
    ) {

        errores.push(
            crearError(
                ["potenciaSenal"],
                "potenciaSenal",
                "Potencia de señal = "
                + Psenal
                + " mW no es válida. Debe ser mayor que 0 mW."
            )
        );
    }


    if (
        !Number.isFinite(Pruido)
    ) {

        errores.push(
            crearError(
                ["potenciaRuido"],
                "potenciaRuido",
                "La potencia de ruido está vacía o no contiene un número válido."
            )
        );

    } else if (
        Pruido <= 0
    ) {

        errores.push(
            crearError(
                ["potenciaRuido"],
                "potenciaRuido",
                "Potencia de ruido = "
                + Pruido
                + " mW no es válida. Debe ser mayor que 0 mW."
            )
        );
    }


    const mensaje =
        document
            .getElementById(
                "mensajePotencia"
            );


    if (
        errores.length > 0
    ) {

        errores.forEach(
            function (item) {

                item.ids.forEach(
                    function (id) {

                        marcarCampoError(
                            id,
                            item.mensaje,
                            true
                        );
                    }
                );
            }
        );


        document
            .getElementById(
                "snrPotenciaLineal"
            )
            .textContent =
            "-";


        document
            .getElementById(
                "snrPotenciaDB"
            )
            .textContent =
            "-";


        mensaje
            .classList
            .add(
                "mensaje-error"
            );


        mensaje.textContent =
            "ERROR DE PARÁMETROS\n"
            +
            errores
                .map(
                    function (item) {
                        return "• " + item.mensaje;
                    }
                )
                .join("\n");


        return;
    }


    [
        "potenciaSenal",
        "potenciaRuido"
    ].forEach(
        function (id) {

            const campo =
                document
                    .getElementById(id);


            campo
                .classList
                .remove(
                    "campo-error"
                );


            const grupo =
                campo.closest(
                    ".campo-potencia"
                );


            if (grupo) {

                grupo
                    .classList
                    .remove(
                        "campo-con-error"
                    );


                const aviso =
                    grupo
                        .querySelector(
                            ".mensaje-campo-error"
                        );


                if (aviso) {
                    aviso.remove();
                }
            }
        }
    );


    mensaje
        .classList
        .remove(
            "mensaje-error"
        );


    const snrLineal =
        Psenal
        /
        Pruido;


    const snrDB =
        10
        *
        Math.log10(
            snrLineal
        );


    document
        .getElementById(
            "snrPotenciaLineal"
        )
        .textContent =
        snrLineal
            .toFixed(3);


    document
        .getElementById(
            "snrPotenciaDB"
        )
        .textContent =
        snrDB
            .toFixed(3)
        +
        " dB";


    mensaje.textContent =
        "Resultado calculado con relación de potencias.";
}


/* ==========================================================
   SIMULAR AM
   ========================================================== */

async function simularAM() {

    if (
        (
            pestanaActiva === "tiempo"
            ||
            pestanaActiva === "espectro"
        )
        &&
        obtenerFuenteModulante() !== "SENOIDAL"
    ) {

        simularFuenteAlternativa();
        return;
    }


    const errores =
        validarParametrosAM();


    if (
        errores.length > 0
    ) {

        invalidarAM(
            errores
        );

        return;
    }


    limpiarErroresCampos([
        "Ac",
        "fc",
        "fm",
        "m",
        "vestigio"
    ]);


    limpiarErrorResultados(
        "resultadosTiempo"
    );


    limpiarErrorResultados(
        "resultadosEspectro"
    );


    const Ac =
        numeroEntrada("Ac");


    const fc =
        numeroEntrada("fc");


    const fm =
        numeroEntrada("fm");


    const m =
        numeroEntrada("m");


    const sistema =
        document
            .getElementById(
                "sistema"
            )
            .value;


    let vestigio =
        numeroEntrada(
            "vestigio"
        );


    if (
        sistema !== "VSB"
        &&
        !Number.isFinite(vestigio)
    ) {
        vestigio = 20;
    }


    setMensaje(
        "Calculando simulación..."
    );


    const url =
        `/prueba-am?Ac=${Ac}`
        +
        `&fc=${fc}`
        +
        `&fm=${fm}`
        +
        `&m=${m}`
        +
        `&sistema=${encodeURIComponent(
            sistema
        )}`
        +
        `&vestigio=${vestigio}`;


    try {

        const respuesta =
            await fetch(
                url
            );


        if (!respuesta.ok) {

            const error =
                await respuesta
                    .json();


            throw new Error(
                error.detail
                ||
                "No se pudo realizar la simulación."
            );
        }


        const datos =
            await respuesta
                .json();


        ultimoResultadoAM =
            datos;


        actualizarVistaAM(
            datos
        );


        setMensaje(
            "Simulación completada."
        );

    }

    catch (error) {

        ultimoResultadoAM = null;


        [
            "graficaModulante",
            "graficaPortadora",
            "graficaAM",
            "graficaEspectro"
        ].forEach(
            function (id) {

                limpiarCanvasConMensaje(
                    id,
                    "Simulación no disponible"
                );
            }
        );


        mostrarErrorResultados(
            "resultadosTiempo",
            error.message
        );


        mostrarErrorResultados(
            "resultadosEspectro",
            error.message
        );


        setMensaje(
            "ERROR\n"
            +
            error.message,
            true
        );
    }
}


/* ==========================================================
   SIMULAR IMPLEMENTACION
   ========================================================== */

async function simularImplementacion() {

    const errores =
        validarParametrosImplementacion();


    if (
        errores.length > 0
    ) {

        invalidarImplementacion(
            errores
        );

        return;
    }


    limpiarErroresCampos([
        "L_mH",
        "C_nF",
        "C1_nF",
        "C2_nF",
        "L1_mH",
        "L2_mH",
        "f1",
        "f2"
    ]);


    limpiarErrorResultados(
        "resultadosImplementacion"
    );


    const tipo =
        document
            .getElementById(
                "tipoImplementacion"
            )
            .value;


    if (tipo === "MODULADOR") {

        limpiarErroresCampos([
            "Ac",
            "fc",
            "fm",
            "m"
        ]);

        const tipoFuente =
            obtenerFuenteModulante();


        if (tipoFuente === "AUDIO") {

            if (!audioBufferModulante) {

                [
                    "graficaImplModulante",
                    "graficaImplPortadora",
                    "graficaImplAM"
                ].forEach(
                    function (id) {

                        limpiarCanvasConMensaje(
                            id,
                            "Seleccione un archivo de audio en TIEMPO"
                        );
                    }
                );


                document
                    .getElementById(
                        "implNombre"
                    )
                    .textContent =
                    "Modulador AM";


                document
                    .getElementById(
                        "implValidacion"
                    )
                    .textContent =
                    "Seleccione primero un archivo de audio en la pestaña TIEMPO.";


                document
                    .getElementById(
                        "zonaModulador"
                    )
                    .style.display =
                    "block";


                document
                    .getElementById(
                        "zonaOscilador"
                    )
                    .style.display =
                    "none";


                document
                    .getElementById(
                        "zonaMixer"
                    )
                    .style.display =
                    "none";


                actualizarResumenFuenteImplementacion();


                setMensaje(
                    "Seleccione un archivo de audio en TIEMPO para alimentar el modulador."
                );

                return;
            }


            const audio =
                document
                    .getElementById(
                        "elementoAudio"
                    );


            const datosTiempo =
                crearVentanaAudio(
                    audio.currentTime,
                    audio.ended
                );


            actualizarVistaModuladorGlobal(
                datosTiempo
            );


            if (
                !audio.paused
                &&
                !audio.ended
            ) {

                detenerAnimacionAudio();

                animacionAudioId =
                    requestAnimationFrame(
                        cuadroAudio
                    );
            }


            setMensaje(
                "Modulador AM actualizado con el instante actual del archivo de audio."
            );

            return;
        }


        let tiempoCentro = 0;


        if (fuenteEsAnimada(tipoFuente)) {

            if (fuenteAnimadaPausada) {

                tiempoCentro =
                    tiempoFuentePausada;

            } else if (inicioFuenteAnimadaMs > 0) {

                tiempoCentro =
                    (
                        performance.now()
                        -
                        inicioFuenteAnimadaMs
                    )
                    /
                    1000;
            }
        }


        const datosTiempo =
            generarVentanaSimulada(
                tipoFuente,
                tiempoCentro
            );


        actualizarVistaModuladorGlobal(
            datosTiempo
        );


        if (fuenteEsAnimada(tipoFuente)) {

            if (animacionFuenteId === null) {
                iniciarFuenteAnimada(false);
            }
        } else {
            detenerAnimacionFuente();
        }


        setMensaje(
            "Modulador AM actualizado con la fuente modulante global."
        );

        return;
    }


    setMensaje(
        "Calculando implementación..."
    );


    const url =
        `/prueba-implementacion`
        +
        `?tipo=${encodeURIComponent(
            tipo
        )}`
        +
        `&L_mH=${numeroEntradaSeguro(
            "L_mH",
            10
        )}`
        +
        `&C_nF=${numeroEntradaSeguro(
            "C_nF",
            10
        )}`
        +
        `&C1_nF=${numeroEntradaSeguro(
            "C1_nF",
            10
        )}`
        +
        `&C2_nF=${numeroEntradaSeguro(
            "C2_nF",
            10
        )}`
        +
        `&L1_mH=${numeroEntradaSeguro(
            "L1_mH",
            5
        )}`
        +
        `&L2_mH=${numeroEntradaSeguro(
            "L2_mH",
            5
        )}`
        +
        `&f1=${numeroEntradaSeguro(
            "f1",
            10000
        )}`
        +
        `&f2=${numeroEntradaSeguro(
            "f2",
            3000
        )}`;


    try {

        const respuesta =
            await fetch(
                url
            );


        if (!respuesta.ok) {

            const error =
                await respuesta
                    .json();


            throw new Error(
                error.detail
                ||
                "No se pudo realizar el cálculo."
            );
        }


        const datos =
            await respuesta
                .json();


        ultimoResultadoImpl =
            datos;


        actualizarVistaImplementacion(
            datos
        );


        setMensaje(
            "Cálculo completado."
        );

    }

    catch (error) {

        ultimoResultadoImpl = null;


        if (
            tipo === "MEZCLADOR"
        ) {

            [
                "graficaMixerEntrada",
                "graficaMixerSalida",
                "graficaMixerEspectro"
            ].forEach(
                function (id) {

                    limpiarCanvasConMensaje(
                        id,
                        "Cálculo no disponible"
                    );
                }
            );

        } else {

            limpiarCanvasConMensaje(
                "graficaImplTeorica",
                "Cálculo no disponible"
            );
        }


        mostrarErrorResultados(
            "resultadosImplementacion",
            error.message
        );


        setMensaje(
            "ERROR\n"
            +
            error.message,
            true
        );
    }
}


/* ==========================================================
   SIMULAR RUIDO
   ========================================================== */

async function simularRuido() {

    const tipo =
        obtenerFuenteModulante();


    const errores =
        validarFuenteTiempo(
            tipo
        );


    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    const A_ruido =
        amplitudRuidoSeleccionada();


    if (
        nivel === "PERSONALIZADO"
        &&
        !Number.isFinite(A_ruido)
    ) {

        errores.push(
            crearError(
                ["amplitudRuido"],
                "amplitudRuido",
                "La amplitud de ruido debe contener un número válido."
            )
        );

    } else if (
        nivel === "PERSONALIZADO"
        &&
        A_ruido < 0
    ) {

        errores.push(
            crearError(
                ["amplitudRuido"],
                "amplitudRuido",
                "La amplitud de ruido no puede ser negativa."
            )
        );
    }


    if (
        tipo === "AUDIO"
        &&
        !audioBufferModulante
    ) {

        errores.push(
            crearError(
                ["fuenteModulante"],
                "fuenteModulante",
                "Seleccione primero un archivo de audio en la pestaña TIEMPO."
            )
        );
    }


    if (errores.length > 0) {

        ultimoResultadoRuido = null;


        [
            "graficaRuidoLimpia",
            "graficaRuidoRuidosa"
        ].forEach(
            function (id) {

                limpiarCanvasConMensaje(
                    id,
                    "Parámetros inválidos"
                );
            }
        );


        mostrarErrores(
            errores,
            [
                "resultadosRuido"
            ]
        );


        setMensaje(
            "ERROR\n"
            +
            errores[0].mensaje,
            true
        );


        return;
    }


    limpiarErroresCampos([
        "Ac",
        "fc",
        "fm",
        "m",
        "amplitudRuido"
    ]);


    limpiarErrorResultados(
        "resultadosRuido"
    );


    actualizarResumenFuenteRuido();
    actualizarNotaVentanaRuido();


    let datosBase;


    if (tipo === "AUDIO") {

        const audio =
            document
                .getElementById(
                    "elementoAudio"
                );


        datosBase =
            crearVentanaAudio(
                audio.currentTime,
                audio.ended
            );

    } else {

        let tiempoCentro = 0;


        if (fuenteEsAnimada(tipo)) {

            tiempoCentro =
                fuenteAnimadaPausada
                ?
                tiempoFuentePausada
                :
                Math.max(
                    0,
                    (
                        performance.now()
                        -
                        inicioFuenteAnimadaMs
                    )
                    /
                    1000
                );
        }


        datosBase =
            generarVentanaSimulada(
                tipo,
                tiempoCentro
            );
    }


    actualizarVistaRuidoGlobal(
        datosBase
    );


    if (
        fuenteEsAnimada(tipo)
        &&
        !fuenteAnimadaPausada
        &&
        animacionFuenteId === null
    ) {

        iniciarFuenteAnimada(
            false
        );
    }


    if (
        tipo === "AUDIO"
        &&
        audioBufferModulante
    ) {

        const audio =
            document
                .getElementById(
                    "elementoAudio"
                );


        if (
            !audio.paused
            &&
            !audio.ended
            &&
            animacionAudioId === null
        ) {

            animacionAudioId =
                requestAnimationFrame(
                    cuadroAudio
                );
        }
    }


    setMensaje(
        "RUIDO actualizado con la fuente modulante global."
    );
}


/* ==========================================================
   SIMULAR SEGUN PESTANA
   ========================================================== */

function simularActual() {

    if (
        pestanaActiva
        ===
        "implementacion"
    ) {

        simularImplementacion();
    }


    else if (
        pestanaActiva
        ===
        "ruido"
    ) {

        simularRuido();
    }


    else {

        simularAM();
    }
}


/* ==========================================================
   EVENTOS
   ========================================================== */

document
    .querySelectorAll(
        "input"
    )
    .forEach(
        function (campo) {

            campo
                .addEventListener(
                    "input",
                    function () {

                        if (
                            campo
                                .classList
                                .contains(
                                    "campo-error"
                                )
                        ) {

                            campo
                                .classList
                                .remove(
                                    "campo-error"
                                );


                            campo
                                .removeAttribute(
                                    "aria-invalid"
                                );


                            const grupo =
                                campo.closest(
                                    ".campo, .campo-potencia"
                                );


                            if (grupo) {

                                grupo
                                    .classList
                                    .remove(
                                        "campo-con-error"
                                    );


                                const aviso =
                                    grupo
                                        .querySelector(
                                            ".mensaje-campo-error"
                                        );


                                if (aviso) {
                                    aviso.remove();
                                }
                            }
                        }


                        const mensaje =
                            document
                                .getElementById(
                                    "mensaje"
                                );


                        if (
                            mensaje
                                .classList
                                .contains(
                                    "mensaje-error"
                                )
                        ) {

                            setMensaje(
                                "Dato modificado. Pulse nuevamente SIMULAR."
                            );
                        }


                        if (
                            campo.id === "potenciaSenal"
                            ||
                            campo.id === "potenciaRuido"
                        ) {

                            const mensajePotencia =
                                document
                                    .getElementById(
                                        "mensajePotencia"
                                    );


                            if (
                                mensajePotencia
                                    .classList
                                    .contains(
                                        "mensaje-error"
                                    )
                            ) {

                                mensajePotencia
                                    .classList
                                    .remove(
                                        "mensaje-error"
                                    );


                                mensajePotencia.textContent =
                                    "Dato modificado. Pulse CALCULAR.";
                            }
                        }
                    }
                );
        }
    );


document
    .getElementById(
        "tabTiempo"
    )
    .addEventListener(
        "click",
        function () {

            mostrarPestana(
                "tiempo"
            );
        }
    );


document
    .getElementById(
        "tabEspectro"
    )
    .addEventListener(
        "click",
        function () {

            mostrarPestana(
                "espectro"
            );
        }
    );


document
    .getElementById(
        "tabImplementacion"
    )
    .addEventListener(
        "click",
        function () {

            mostrarPestana(
                "implementacion"
            );
        }
    );


document
    .getElementById(
        "tabRuido"
    )
    .addEventListener(
        "click",
        function () {

            mostrarPestana(
                "ruido"
            );
        }
    );



document
    .getElementById(
        "fuenteModulante"
    )
    .addEventListener(
        "change",
        function () {

            const tipo =
                obtenerFuenteModulante();


            detenerAnimacionFuente();


            if (tipo !== "AUDIO") {
                detenerAnimacionAudio();
            }


            tiempoFuentePausada = 0;

            fuenteAnimadaPausada = false;


            actualizarControlesFuente();


            document
                .getElementById("campoSistema")
                .style.display =
                (
                    pestanaActiva === "espectro"
                    &&
                    tipo === "SENOIDAL"
                )
                ?
                "block"
                :
                "none";


            actualizarCampoVestigio();


            if (
                pestanaActiva === "tiempo"
                ||
                pestanaActiva === "espectro"
            ) {
                simularAM();

            } else if (
                pestanaActiva === "ruido"
            ) {

                simularRuido();
            }
        }
    );


document
    .getElementById(
        "pausarFuenteAnimada"
    )
    .addEventListener(
        "click",
        alternarPausaFuenteAnimada
    );


document
    .getElementById(
        "reiniciarFuenteAnimada"
    )
    .addEventListener(
        "click",
        function () {

            tiempoFuentePausada = 0;

            iniciarFuenteAnimada(
                true
            );
        }
    );


document
    .getElementById(
        "archivoAudio"
    )
    .addEventListener(
        "change",
        function (evento) {

            const archivo =
                evento.target.files[0];


            cargarArchivoAudio(
                archivo
            );
        }
    );


document
    .getElementById(
        "reproducirAudio"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(false);
        }
    );


document
    .getElementById(
        "pausarAudio"
    )
    .addEventListener(
        "click",
        pausarArchivoAudio
    );


document
    .getElementById(
        "detenerAudio"
    )
    .addEventListener(
        "click",
        detenerArchivoAudio
    );


document
    .getElementById(
        "reiniciarAudio"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(true);
        }
    );


document
    .getElementById(
        "reproducirAudioEspectro"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(false);
        }
    );


document
    .getElementById(
        "pausarAudioEspectro"
    )
    .addEventListener(
        "click",
        pausarArchivoAudio
    );


document
    .getElementById(
        "detenerAudioEspectro"
    )
    .addEventListener(
        "click",
        detenerArchivoAudio
    );


document
    .getElementById(
        "reiniciarAudioEspectro"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(true);
        }
    );


document
    .getElementById(
        "ventanaFFT"
    )
    .addEventListener(
        "change",
        function () {

            actualizarNotaVentanaFFT();


            if (pestanaActiva !== "espectro") {
                return;
            }


            const tipo =
                obtenerFuenteModulante();


            if (tipo === "SENOIDAL") {
                return;
            }


            if (
                tipo === "AUDIO"
                &&
                audioBufferModulante
            ) {

                const audio =
                    document
                        .getElementById(
                            "elementoAudio"
                        );


                dibujarAudioEnInstante(
                    audio.currentTime,
                    audio.ended
                );

                return;
            }


            let tiempoCentro = 0;


            if (
                ultimoResultadoTiempoAlternativo
                &&
                ultimoResultadoTiempoAlternativo.t
                &&
                ultimoResultadoTiempoAlternativo.t.length > 0
            ) {

                const tiempos =
                    ultimoResultadoTiempoAlternativo.t;


                tiempoCentro =
                    tiempos[
                        Math.floor(
                            tiempos.length / 2
                        )
                    ];
            }


            actualizarVistaEspectroFuenteAlternativa(
                generarVentanaSimulada(
                    tipo,
                    tiempoCentro
                )
            );
        }
    );


document
    .getElementById(
        "ventanaAudio"
    )
    .addEventListener(
        "change",
        function () {

            const audio =
                document
                    .getElementById(
                        "elementoAudio"
                    );


            if (audioBufferModulante) {

                dibujarAudioEnInstante(
                    audio.currentTime,
                    audio.ended
                );
            }
        }
    );


document
    .getElementById(
        "elementoAudio"
    )
    .addEventListener(
        "ended",
        finalizarArchivoAudio
    );


document
    .getElementById(
        "elementoAudio"
    )
    .addEventListener(
        "loadedmetadata",
        function () {
            actualizarEstadoAudio("Listo");
        }
    );


document
    .getElementById(
        "reproducirAudioImplementacion"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(false);
        }
    );


document
    .getElementById(
        "pausarAudioImplementacion"
    )
    .addEventListener(
        "click",
        pausarArchivoAudio
    );


document
    .getElementById(
        "detenerAudioImplementacion"
    )
    .addEventListener(
        "click",
        detenerArchivoAudio
    );


document
    .getElementById(
        "reiniciarAudioImplementacion"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(true);
        }
    );


document
    .getElementById(
        "ventanaRuido"
    )
    .addEventListener(
        "change",
        function () {

            actualizarNotaVentanaRuido();
            simularRuido();
        }
    );


document
    .getElementById(
        "reproducirAudioRuido"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(false);
        }
    );


document
    .getElementById(
        "pausarAudioRuido"
    )
    .addEventListener(
        "click",
        pausarArchivoAudio
    );


document
    .getElementById(
        "detenerAudioRuido"
    )
    .addEventListener(
        "click",
        detenerArchivoAudio
    );


document
    .getElementById(
        "reiniciarAudioRuido"
    )
    .addEventListener(
        "click",
        function () {
            reproducirArchivoAudio(true);
        }
    );


document
    .getElementById(
        "pausarFuenteAnimadaRuido"
    )
    .addEventListener(
        "click",
        alternarPausaFuenteAnimada
    );


document
    .getElementById(
        "reiniciarFuenteAnimadaRuido"
    )
    .addEventListener(
        "click",
        function () {

            tiempoFuentePausada = 0;
            iniciarFuenteAnimada(true);
        }
    );


document
    .getElementById(
        "sistema"
    )
    .addEventListener(
        "change",
        function () {

            actualizarCampoVestigio();

            simularAM();
        }
    );


document
    .getElementById(
        "tipoImplementacion"
    )
    .addEventListener(
        "change",
        function () {

            actualizarParametrosImplementacion();

            actualizarControlesFuente();

            simularImplementacion();
        }
    );


document
    .getElementById(
        "nivelRuido"
    )
    .addEventListener(
        "change",
        function () {

            actualizarCampoRuidoPersonalizado();

            simularRuido();
        }
    );


document
    .getElementById(
        "simular"
    )
    .addEventListener(
        "click",
        simularActual
    );


document
    .getElementById(
        "calcularPotencia"
    )
    .addEventListener(
        "click",
        calcularSNRPotencia
    );


window
    .addEventListener(
        "load",
        function () {

            calcularSNRPotencia();

            actualizarControlesFuente();

            mostrarPestana(
                "tiempo"
            );
        }
    );


window
    .addEventListener(
        "resize",
        function () {

            requestAnimationFrame(
                function () {

                    if (
                        pestanaActiva
                        ===
                        "implementacion"
                    ) {

                        if (
                            ultimoResultadoImpl
                            !==
                            null
                        ) {

                            actualizarVistaImplementacion(
                                ultimoResultadoImpl
                            );
                        }

                    }


                    else if (
                        pestanaActiva
                        ===
                        "ruido"
                    ) {

                        if (
                            ultimoResultadoRuido
                            !==
                            null
                        ) {

                            actualizarVistaRuido(
                                ultimoResultadoRuido
                            );
                        }

                    }


                    else if (
                        pestanaActiva === "tiempo"
                        &&
                        obtenerFuenteModulante() !== "SENOIDAL"
                    ) {

                        const tipo =
                            obtenerFuenteModulante();


                        if (tipo === "AUDIO") {

                            const audio =
                                document
                                    .getElementById(
                                        "elementoAudio"
                                    );


                            if (audioBufferModulante) {

                                dibujarAudioEnInstante(
                                    audio.currentTime,
                                    audio.ended
                                );
                            }

                        } else if (
                            ultimoResultadoTiempoAlternativo
                            !==
                            null
                        ) {

                            actualizarVistaTiempoAlternativo(
                                ultimoResultadoTiempoAlternativo
                            );
                        }

                    } else {

                        if (
                            ultimoResultadoAM
                            !==
                            null
                        ) {

                            actualizarVistaAM(
                                ultimoResultadoAM
                            );
                        }
                    }
                }
            );
        }
    );


document
    .getElementById(
        "mostrarComparacionEnvolvente"
    )
    .addEventListener(
        "change",
        actualizarComparacionEnvolvente
    );
