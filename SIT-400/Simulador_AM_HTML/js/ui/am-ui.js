let pestanaActiva = "tiempo";

let ultimoResultadoAM = null;

let ultimoResultadoImpl = null;

let ultimoResultadoRuido = null;


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


    if (tipo === "MEZCLADOR") {

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
            esTiempo || esEspectro
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
        esEspectro
        ?
        "block"
        :
        "none";


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

                if (
                    ultimoResultadoImpl
                    !==
                    null
                ) {

                    actualizarVistaImplementacion(
                        ultimoResultadoImpl
                    );

                } else {

                    simularImplementacion();
                }

            }


            else if (esRuido) {

                if (
                    ultimoResultadoRuido
                    !==
                    null
                ) {

                    actualizarVistaRuido(
                        ultimoResultadoRuido
                    );

                } else {

                    simularRuido();
                }

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


    else {

        activarParametro("implF1");
        activarParametro("implF2");
    }
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
   ESPECTRO
   ========================================================== */

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

    }


    else if (
        pestanaActiva
        ===
        "espectro"
    ) {

        dibujarEspectro(
            datos
        );
    }
}


/* ==========================================================
   ACTUALIZAR IMPLEMENTACION
   ========================================================== */

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
        "Ruido aditivo gaussiano — nivel "
        +
        (
            nombresNivel[
                datos.nivel
            ]
            ||
            datos.nivel
        );


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
            "Señal AM con ruido";


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
            .envolvente_superior,
        datos
            .envolvente_inferior
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

    const errores =
        validarParametrosRuido();


    if (
        errores.length > 0
    ) {

        invalidarRuido(
            errores
        );

        return;
    }


    limpiarErroresCampos([
        "ruidoAc",
        "ruidoFc",
        "ruidoFm",
        "ruidoM",
        "amplitudRuido"
    ]);


    limpiarErrorResultados(
        "resultadosRuido"
    );


    const Ac =
        numeroEntrada(
            "ruidoAc"
        );


    const fc =
        numeroEntrada(
            "ruidoFc"
        );


    const fm =
        numeroEntrada(
            "ruidoFm"
        );


    const m =
        numeroEntrada(
            "ruidoM"
        );


    const nivel =
        document
            .getElementById(
                "nivelRuido"
            )
            .value;


    let A_ruido =
        numeroEntrada(
            "amplitudRuido"
        );


    if (
        nivel !== "PERSONALIZADO"
        &&
        !Number.isFinite(A_ruido)
    ) {
        A_ruido = 0.05;
    }


    setMensaje(
        "Calculando ruido y SNR..."
    );


    const url =
        `/prueba-ruido`
        +
        `?Ac=${Ac}`
        +
        `&fc=${fc}`
        +
        `&fm=${fm}`
        +
        `&m=${m}`
        +
        `&nivel=${encodeURIComponent(
            nivel
        )}`
        +
        `&A_ruido=${A_ruido}`;


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
                "No se pudo realizar la simulación de ruido."
            );
        }


        const datos =
            await respuesta
                .json();


        ultimoResultadoRuido =
            datos;


        actualizarVistaRuido(
            datos
        );


        setMensaje(
            "Simulación completada."
        );

    }

    catch (error) {

        ultimoResultadoRuido = null;


        [
            "graficaRuidoLimpia",
            "graficaRuidoRuidosa"
        ].forEach(
            function (id) {

                limpiarCanvasConMensaje(
                    id,
                    "Simulación no disponible"
                );
            }
        );


        mostrarErrorResultados(
            "resultadosRuido",
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


                    else {

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
