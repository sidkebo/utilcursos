    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    const contenidos =
        document.querySelectorAll(
            ".contenido-tab"
        );

    const seccionesParametros =
        document.querySelectorAll(
            ".seccion-parametros"
        );

    const datos = {
        base: null,
        espectro: null,
        vco: null,
        demod: null,
        ruido: null
    };


    function numero(id) {

        const campo =
            document.getElementById(
                id
            );

        const texto =
            campo.value.trim();

        if (
            texto === ""
        ) {

            return NaN;
        }

        return Number(
            texto
        );
    }


    function fmt(
        valor,
        decimales = 3
    ) {

        return Number(
            valor
        ).toFixed(
            decimales
        );
    }


    function setEstado(
        texto,
        error = false
    ) {

        const estado =
            document.getElementById(
                "estado"
            );

        estado.textContent =
            texto;

        estado.classList.toggle(
            "estado-error",
            error
        );
    }


    function limpiarErroresVisuales() {

        document.querySelectorAll(
            ".campo-error"
        ).forEach(
            campo => {

                campo.classList.remove(
                    "campo-error"
                );

                campo.removeAttribute(
                    "aria-invalid"
                );
            }
        );


        document.querySelectorAll(
            ".grupo-error"
        ).forEach(
            grupo => {

                grupo.classList.remove(
                    "grupo-error"
                );
            }
        );


        document.querySelectorAll(
            ".error-campo"
        ).forEach(
            aviso => {

                aviso.remove();
            }
        );
    }


    function marcarCampoError(
        id,
        mensaje,
        mostrarMensaje = true
    ) {

        const campo =
            document.getElementById(
                id
            );

        if (
            !campo
        ) {

            return;
        }


        campo.classList.add(
            "campo-error"
        );

        campo.setAttribute(
            "aria-invalid",
            "true"
        );


        const grupo =
            campo.closest(
                ".grupo"
            );


        if (
            !grupo
        ) {

            return;
        }


        grupo.classList.add(
            "grupo-error"
        );


        if (
            mostrarMensaje
        ) {

            let aviso =
                grupo.querySelector(
                    ".error-campo"
                );


            if (
                !aviso
            ) {

                aviso =
                    document.createElement(
                        "div"
                    );

                aviso.className =
                    "error-campo";

                grupo.appendChild(
                    aviso
                );
            }


            aviso.textContent =
                mensaje;
        }
    }


    function crearError(
        ids,
        principal,
        mensaje
    ) {

        return {
            ids,
            principal,
            mensaje
        };
    }


    function mostrarSinResultados(
        mensaje,
        error = false
    ) {

        document.getElementById(
            "resultadosContenido"
        ).innerHTML = `

            <div
                class="
                    resultado
                    ${error ? "resultado-error" : ""}
                "
            >

                <span>
                    Estado
                </span>

                <strong>
                    ${mensaje}
                </strong>

            </div>
        `;
    }


    function mostrarErrores(
        errores
    ) {

        limpiarErroresVisuales();


        errores.forEach(
            item => {

                item.ids.forEach(
                    id => {

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
                item =>
                    `• ${item.mensaje}`
            )
            .join(
                "\n"
            );


        setEstado(
            `ERROR DE PARÁMETROS\n${detalle}`,
            true
        );


        mostrarSinResultados(
            "Sin resultados: corrija los campos marcados en rojo.",
            true
        );
    }


    function validarNumeroFinito(
        errores,
        id,
        nombre,
        unidad = ""
    ) {

        const v =
            numero(
                id
            );


        if (
            !Number.isFinite(
                v
            )
        ) {

            errores.push(
                crearError(
                    [id],
                    id,
                    `${nombre} está vacío o no contiene un número válido${unidad ? ` (${unidad})` : ""}.`
                )
            );
        }


        return v;
    }


    function validarBaseCampos() {

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


        const Am =
            validarNumeroFinito(
                errores,
                "Am",
                "Am",
                "V"
            );


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const deltaPhi =
            validarNumeroFinito(
                errores,
                "delta_phi",
                "delta_phi",
                "rad"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                fm
            )
            && fc > 0
            && fm > 0
            && fm >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "fm"
                    ],
                    "fm",
                    `La relación no es válida: fm = ${fm} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Am
            )
            && Am <= 0
        ) {

            errores.push(
                crearError(
                    ["Am"],
                    "Am",
                    `Am = ${Am} V no es válido. Am debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaPhi
            )
            && deltaPhi < 0
        ) {

            errores.push(
                crearError(
                    ["delta_phi"],
                    "delta_phi",
                    `delta_phi = ${deltaPhi} rad no es válido. delta_phi no puede ser negativa.`
                )
            );
        }


        return errores;
    }


    function validarEspectroCampos() {

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


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const orden =
            validarNumeroFinito(
                errores,
                "ordenEspectro",
                "Pares laterales"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                fm
            )
            && fc > 0
            && fm > 0
            && fm >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "fm"
                    ],
                    "fm",
                    `La relación no es válida: fm = ${fm} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                orden
            )
            && (
                !Number.isInteger(
                    orden
                )
                || orden < 1
                || orden > 20
            )
        ) {

            errores.push(
                crearError(
                    ["ordenEspectro"],
                    "ordenEspectro",
                    `Pares laterales = ${orden} no es válido. Debe ser un número entero entre 1 y 20.`
                )
            );
        }


        return errores;
    }


    function validarVcoCampos() {

        const errores = [];


        const Ac =
            validarNumeroFinito(
                errores,
                "vco_Ac",
                "Ac",
                "V"
            );


        const fc =
            validarNumeroFinito(
                errores,
                "vco_fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "vco_fm",
                "fm",
                "Hz"
            );


        const Kvco =
            validarNumeroFinito(
                errores,
                "vco_K",
                "Kvco",
                "Hz/V"
            );


        const Vm =
            validarNumeroFinito(
                errores,
                "vco_Vm",
                "Vm",
                "V"
            );


        const N =
            validarNumeroFinito(
                errores,
                "vco_N",
                "Multiplicador N"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_Ac"],
                    "vco_Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_fc"],
                    "vco_fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_fm"],
                    "vco_fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kvco
            )
            && Kvco <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_K"],
                    "vco_K",
                    `Kvco = ${Kvco} Hz/V no es válido. Kvco debe ser mayor que 0 Hz/V.`
                )
            );
        }


        if (
            Number.isFinite(
                Vm
            )
            && Vm < 0
        ) {

            errores.push(
                crearError(
                    ["vco_Vm"],
                    "vco_Vm",
                    `Vm = ${Vm} V no es válido. Vm no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                N
            )
            && (
                !Number.isInteger(
                    N
                )
                || N < 1
                || N > 20
            )
        ) {

            errores.push(
                crearError(
                    ["vco_N"],
                    "vco_N",
                    `N = ${N} no es válido. El multiplicador debe ser un entero entre 1 y 20.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                Kvco
            )
            && Number.isFinite(
                Vm
            )
            && fc > 0
            && Kvco > 0
            && Vm >= 0
        ) {

            const deltaF =
                Kvco
                * Vm;


            if (
                deltaF >= fc
            ) {

                errores.push(
                    crearError(
                        [
                            "vco_fc",
                            "vco_K",
                            "vco_Vm"
                        ],
                        "vco_Vm",
                        `La combinación no es válida: delta_f = Kvco x Vm = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                    )
                );
            }
        }


        return errores;
    }


    function validarDemodCampos() {

        const errores = [];


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


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const Kd =
            validarNumeroFinito(
                errores,
                "demod_Kd",
                "Kd",
                "V/kHz"
            );


        const Kvco =
            validarNumeroFinito(
                errores,
                "demod_Kvco",
                "Kvco",
                "Hz/V"
            );


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kd
            )
            && Kd <= 0
        ) {

            errores.push(
                crearError(
                    ["demod_Kd"],
                    "demod_Kd",
                    `Kd = ${Kd} V/kHz no es válido. Kd debe ser mayor que 0 V/kHz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kvco
            )
            && Kvco <= 0
        ) {

            errores.push(
                crearError(
                    ["demod_Kvco"],
                    "demod_Kvco",
                    `Kvco = ${Kvco} Hz/V no es válido. Kvco debe ser mayor que 0 Hz/V.`
                )
            );
        }


        return errores;
    }


    function validarRuidoCampos() {

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


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const ruidoAmp =
            validarNumeroFinito(
                errores,
                "ruido_amp",
                "Ruido relativo de amplitud"
            );


        const ruidoFase =
            validarNumeroFinito(
                errores,
                "ruido_fase",
                "Perturbación de fase",
                "rad"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                ruidoAmp
            )
            && ruidoAmp < 0
        ) {

            errores.push(
                crearError(
                    ["ruido_amp"],
                    "ruido_amp",
                    `Ruido relativo de amplitud = ${ruidoAmp} no es válido. No puede ser negativo.`
                )
            );
        }


        if (
            Number.isFinite(
                ruidoFase
            )
            && ruidoFase < 0
        ) {

            errores.push(
                crearError(
                    ["ruido_fase"],
                    "ruido_fase",
                    `Perturbación de fase = ${ruidoFase} rad no es válida. No puede ser negativa.`
                )
            );
        }


        return errores;
    }


    function limpiarCanvas(
        canvasId,
        mensaje = "Sin datos"
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#777";


        ctx.font =
            "13px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            mensaje,
            canvas.width / 2,
            canvas.height / 2
        );


        ctx.textAlign =
            "start";


        ctx.textBaseline =
            "alphabetic";
    }


    function limpiarBase() {

        datos.base =
            null;


        [
            "grafModulante",
            "grafPortadora",
            "grafFM",
            "grafPM"
        ].forEach(
            id => {

                limpiarCanvas(
                    id,
                    "Parámetros inválidos"
                );
            }
        );


        document.getElementById(
            "calcRango"
        ).textContent =
            "—";


        document.getElementById(
            "calcBeta"
        ).textContent =
            "—";


        document.getElementById(
            "calcKf"
        ).textContent =
            "—";


        document.getElementById(
            "calcPm"
        ).textContent =
            "—";
    }


    function limpiarEspectro() {

        datos.espectro =
            null;


        limpiarCanvas(
            "grafEspectro",
            "Espectro no disponible"
        );


        document.getElementById(
            "calcCarson"
        ).textContent =
            "—";


        document.getElementById(
            "tablaEspectro"
        ).innerHTML =
            "";
    }


    function mensajeVista(
        tab
    ) {

        const mensajes = {

            tiempo:
                "Vista TIEMPO. Ajuste los parámetros y pulse ACTUALIZAR FM / PM.",

            calculos:
                "Vista CÁLCULOS. Los resultados usan los parámetros generales FM / PM.",

            espectro:
                "Vista ESPECTRO. Use ACTUALIZAR ESPECTRO o ACTUALIZAR FM / PM.",

            generacion:
                "Vista GENERACIÓN. Ajuste el modelo VCO y pulse SIMULAR VCO.",

            demodulacion:
                "Vista DEMODULACIÓN / PLL. Ajuste Kd, Kvco y Vdc y pulse SIMULAR DEMODULACIÓN.",

            ruido:
                "Vista RUIDO. Ajuste los niveles y pulse SIMULAR RUIDO."
        };


        return mensajes[
            tab
        ]
        || "Simulador preparado.";
    }


    function mostrarParametros(
        tab
    ) {

        seccionesParametros.forEach(
            seccion => {

                seccion.classList.remove(
                    "activa"
                );
            }
        );


        let id =
            "paramBase";


        if (
            tab === "generacion"
        ) {

            id =
                "paramGeneracion";

        } else if (
            tab === "demodulacion"
        ) {

            id =
                "paramDemod";

        } else if (
            tab === "ruido"
        ) {

            id =
                "paramRuido";
        }


        document.getElementById(
            id
        ).classList.add(
            "activa"
        );
    }


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        t => {

                            t.classList.remove(
                                "activo"
                            );
                        }
                    );


                    contenidos.forEach(
                        c => {

                            c.classList.remove(
                                "activo"
                            );
                        }
                    );


                    tab.classList.add(
                        "activo"
                    );


                    const nombre =
                        tab.dataset.tab;


                    document.getElementById(
                        nombre
                    ).classList.add(
                        "activo"
                    );


                    mostrarParametros(
                        nombre
                    );


                    actualizarResultados(
                        nombre
                    );


                    setEstado(
                        mensajeVista(
                            nombre
                        )
                    );
                }
            );
        }
    );


    function dibujarSerie(
        canvasId,
        x,
        y,
        opciones = {}
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const w =
            canvas.width;


        const h =
            canvas.height;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        const mi = 45;
        const md = 14;
        const ms = 12;
        const mb = 24;


        const gw =
            w
            - mi
            - md;


        const gh =
            h
            - ms
            - mb;


        let ymin =
            Math.min(
                ...y
            );


        let ymax =
            Math.max(
                ...y
            );


        if (
            Math.abs(
                ymax - ymin
            )
            < 1e-12
        ) {

            ymin -=
                1;


            ymax +=
                1;
        }


        const extra =
            0.08
            * (
                ymax - ymin
            );


        ymin -=
            extra;


        ymax +=
            extra;


        const xmin =
            x[
                0
            ];


        const xmax =
            x[
                x.length - 1
            ];


        const px =
            v =>
                mi
                + (
                    v - xmin
                )
                / (
                    xmax - xmin
                )
                * gw;


        const py =
            v =>
                ms
                + (
                    ymax - v
                )
                / (
                    ymax - ymin
                )
                * gh;


        ctx.strokeStyle =
            "#dddddd";


        ctx.lineWidth =
            1;


        if (
            ymin <= 0
            && ymax >= 0
        ) {

            ctx.beginPath();


            ctx.moveTo(
                mi,
                py(
                    0
                )
            );


            ctx.lineTo(
                w - md,
                py(
                    0
                )
            );


            ctx.stroke();
        }


        ctx.strokeStyle =
            opciones.color
            || "#1485ff";


        ctx.lineWidth =
            1.35;


        ctx.beginPath();


        const paso =
            Math.max(
                1,
                Math.floor(
                    x.length
                    / 5000
                )
            );


        let primero =
            true;


        for (
            let i = 0;
            i < x.length;
            i += paso
        ) {

            const xx =
                px(
                    x[i]
                );


            const yy =
                py(
                    y[i]
                );


            if (
                primero
            ) {

                ctx.moveTo(
                    xx,
                    yy
                );


                primero =
                    false;

            } else {

                ctx.lineTo(
                    xx,
                    yy
                );
            }
        }


        ctx.stroke();


        ctx.fillStyle =
            "#555";


        ctx.font =
            "10px Arial";


        const textoIni =
            `${xmin.toFixed(5)} s`;


        const textoFin =
            `${xmax.toFixed(5)} s`;


        ctx.fillText(
            textoIni,
            mi,
            h - 6
        );


        ctx.fillText(
            textoFin,
            w
            - md
            - ctx.measureText(
                textoFin
            ).width,
            h - 6
        );


        if (
            opciones.unidad
        ) {

            ctx.fillText(
                opciones.unidad,
                8,
                ms + 5
            );
        }
    }


    function dibujarEspectro(
        canvasId,
        componentes,
        carsonInf,
        carsonSup
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const w =
            canvas.width;


        const h =
            canvas.height;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        const mi = 55;
        const md = 20;
        const ms = 16;
        const mb = 38;


        const frecuencias =
            componentes.map(
                c =>
                    c.frecuencia
            );


        const amplitudes =
            componentes.map(
                c =>
                    c.amplitud
            );


        let xmin =
            Math.min(
                ...frecuencias,
                carsonInf
            );


        let xmax =
            Math.max(
                ...frecuencias,
                carsonSup
            );


        const rango =
            Math.max(
                xmax - xmin,
                1
            );


        xmin -=
            0.05
            * rango;


        xmax +=
            0.05
            * rango;


        const ymax =
            Math.max(
                ...amplitudes,
                1e-6
            )
            * 1.15;


        const px =
            v =>
                mi
                + (
                    v - xmin
                )
                / (
                    xmax - xmin
                )
                * (
                    w - mi - md
                );


        const py =
            v =>
                ms
                + (
                    ymax - v
                )
                / ymax
                * (
                    h - ms - mb
                );


        ctx.fillStyle =
            "rgba(30, 103, 173, 0.08)";


        ctx.fillRect(
            px(
                carsonInf
            ),
            ms,
            px(
                carsonSup
            )
            - px(
                carsonInf
            ),
            h
            - ms
            - mb
        );


        ctx.strokeStyle =
            "#999";


        ctx.lineWidth =
            1;


        ctx.beginPath();


        ctx.moveTo(
            mi,
            h - mb
        );


        ctx.lineTo(
            w - md,
            h - mb
        );


        ctx.stroke();


        componentes.forEach(
            c => {

                const x =
                    px(
                        c.frecuencia
                    );


                ctx.strokeStyle =
                    c.orden === 0
                    ? "#cc2b2b"
                    : "#175ea8";


                ctx.lineWidth =
                    2;


                ctx.beginPath();


                ctx.moveTo(
                    x,
                    h - mb
                );


                ctx.lineTo(
                    x,
                    py(
                        c.amplitud
                    )
                );


                ctx.stroke();
            }
        );


        ctx.fillStyle =
            "#555";


        ctx.font =
            "10px Arial";


        ctx.fillText(
            `${fmt(carsonInf, 1)} Hz`,
            px(
                carsonInf
            )
            + 3,
            ms + 12
        );


        const textoSup =
            `${fmt(carsonSup, 1)} Hz`;


        ctx.fillText(
            textoSup,
            px(
                carsonSup
            )
            - ctx.measureText(
                textoSup
            ).width
            - 3,
            ms + 12
        );


        ctx.fillText(
            "Zona aproximada por Carson",
            mi + 6,
            h - 8
        );
    }


    function resultadosHtml(
        items
    ) {

        return items.map(
            item => `

                <div class="resultado">

                    <span>
                        ${item[0]}
                    </span>

                    <strong>
                        ${item[1]}
                    </strong>

                </div>
            `
        ).join(
            ""
        );
    }


    function actualizarResultados(
        tab
    ) {

        const cont =
            document.getElementById(
                "resultadosContenido"
            );


        if (
            tab === "tiempo"
            || tab === "calculos"
        ) {

            if (
                !datos.base
            ) {

                mostrarSinResultados(
                    "Sin resultados: revise los parámetros FM / PM."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Frecuencia mínima",
                        `${fmt(datos.base.f_min)} Hz`
                    ],
                    [
                        "Frecuencia máxima",
                        `${fmt(datos.base.f_max)} Hz`
                    ],
                    [
                        "Índice FM beta",
                        fmt(
                            datos.base.beta
                        )
                    ],
                    [
                        "Índice PM mp",
                        fmt(
                            datos.base.mp
                        )
                    ],
                    [
                        "Sensibilidad FM kf",
                        `${fmt(datos.base.kf)} Hz/V`
                    ],
                    [
                        "Sensibilidad PM kp",
                        `${fmt(datos.base.kp)} rad/V`
                    ],
                    [
                        "Amplitud ideal",
                        `${fmt(datos.base.Ac)} V`
                    ]
                ]);


            return;
        }


        if (
            tab === "espectro"
        ) {

            if (
                !datos.espectro
            ) {

                mostrarSinResultados(
                    "Sin resultados de espectro: revise los parámetros."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Índice beta",
                        fmt(
                            datos.espectro.beta
                        )
                    ],
                    [
                        "Clasificación orientativa",
                        datos.espectro.clasificacion
                    ],
                    [
                        "BW por Carson",
                        `${fmt(datos.espectro.bw_carson)} Hz`
                    ],
                    [
                        "Extremo inferior",
                        `${fmt(datos.espectro.extremo_inferior)} Hz`
                    ],
                    [
                        "Extremo superior",
                        `${fmt(datos.espectro.extremo_superior)} Hz`
                    ]
                ]);


            return;
        }


        if (
            tab === "generacion"
        ) {

            if (
                !datos.vco
            ) {

                mostrarSinResultados(
                    "Sin resultados de generación VCO."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Desviación delta_f",
                        `${fmt(datos.vco.delta_f)} Hz`
                    ],
                    [
                        "Índice beta",
                        fmt(
                            datos.vco.beta
                        )
                    ],
                    [
                        "f mínima",
                        `${fmt(datos.vco.f_min)} Hz`
                    ],
                    [
                        "f máxima",
                        `${fmt(datos.vco.f_max)} Hz`
                    ],
                    [
                        "fc después de N",
                        `${fmt(datos.vco.fc_multiplicada)} Hz`
                    ],
                    [
                        "delta_f después de N",
                        `${fmt(datos.vco.delta_f_multiplicada)} Hz`
                    ],
                    [
                        "beta después de N",
                        fmt(
                            datos.vco.beta_multiplicada
                        )
                    ]
                ]);


            return;
        }


        if (
            tab === "demodulacion"
        ) {

            if (
                !datos.demod
            ) {

                mostrarSinResultados(
                    "Sin resultados de demodulación / PLL."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Detector: salida pico",
                        `${fmt(datos.demod.salida_detector_pico)} V`
                    ],
                    [
                        "PLL: delta Vcontrol",
                        `${fmt(datos.demod.delta_v_control)} V pico`
                    ],
                    [
                        "Kd",
                        `${fmt(datos.demod.Kd_v_por_khz)} V/kHz`
                    ],
                    [
                        "Kvco",
                        `${fmt(datos.demod.Kvco)} Hz/V`
                    ],
                    [
                        "Modelo",
                        "PLL enganchado"
                    ]
                ]);


            return;
        }


        if (
            tab === "ruido"
        ) {

            if (
                !datos.ruido
            ) {

                mostrarSinResultados(
                    "Sin resultados de ruido."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Ruido relativo de amplitud",
                        fmt(
                            datos.ruido.ruido_amplitud
                        )
                    ],
                    [
                        "Perturbación de fase",
                        `${fmt(datos.ruido.ruido_fase)} rad`
                    ],
                    [
                        "RMS señal limpia",
                        `${fmt(datos.ruido.rms_senal)} V`
                    ],
                    [
                        "RMS ruido de amplitud",
                        `${fmt(datos.ruido.rms_ruido_amplitud)} V`
                    ],
                    [
                        "Interpretación",
                        "Limitador: útil ante variación de amplitud; no elimina ruido de fase."
                    ]
                ]);
        }
    }


    async function pedirJson(
        url,
        params
    ) {

        const respuesta =
            await fetch(
                `${url}?${params.toString()}`
            );


        const data =
            await respuesta.json();


        if (
            !respuesta.ok
        ) {

            throw new Error(
                data.detail
                || "No se pudo completar la operación."
            );
        }


        return data;
    }


    async function simularBase() {

        const errores =
            validarBaseCampos();


        if (
            errores.length > 0
        ) {

            limpiarBase();

            limpiarEspectro();

            mostrarErrores(
                errores
            );

            return false;
        }


        limpiarErroresVisuales();


        setEstado(
            "Calculando FM / PM..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "Ac"
                    ),

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                Am:
                    numero(
                        "Am"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                delta_phi:
                    numero(
                        "delta_phi"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-fm-pm",
                    params
                );


            datos.base =
                data;


            dibujarSerie(
                "grafModulante",
                data.t,
                data.modulante,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafPortadora",
                data.t,
                data.portadora,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafFM",
                data.t,
                data.senal_fm,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafPM",
                data.t,
                data.senal_pm,
                {
                    unidad:
                        "V"
                }
            );


            document.getElementById(
                "calcRango"
            ).textContent =
                `f_min = ${fmt(data.fc)} - ${fmt(data.delta_f)} = ${fmt(data.f_min)} Hz; `
                + `f_max = ${fmt(data.fc)} + ${fmt(data.delta_f)} = ${fmt(data.f_max)} Hz.`;


            document.getElementById(
                "calcBeta"
            ).textContent =
                `beta = ${fmt(data.delta_f)} / ${fmt(data.fm)} = ${fmt(data.beta)}.`;


            document.getElementById(
                "calcKf"
            ).textContent =
                `kf = ${fmt(data.delta_f)} / ${fmt(data.Am)} = ${fmt(data.kf)} Hz/V.`;


            document.getElementById(
                "calcPm"
            ).textContent =
                `mp = ${fmt(data.mp)}; kp = ${fmt(data.delta_phi)} / ${fmt(data.Am)} = ${fmt(data.kp)} rad/V.`;


            actualizarResultados(
                document.querySelector(
                    ".tab.activo"
                ).dataset.tab
            );


            setEstado(
                "Simulación FM / PM completada."
            );


            return true;

        } catch (
            error
        ) {

            limpiarBase();

            limpiarEspectro();


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );


            return false;
        }
    }


    async function simularEspectro() {

        const errores =
            validarEspectroCampos();


        if (
            errores.length > 0
        ) {

            limpiarEspectro();

            mostrarErrores(
                errores
            );

            return false;
        }


        limpiarErroresVisuales();


        setEstado(
            "Calculando espectro FM..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "Ac"
                    ),

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                orden:
                    numero(
                        "ordenEspectro"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-espectro-fm",
                    params
                );


            datos.espectro =
                data;


            dibujarEspectro(
                "grafEspectro",
                data.componentes,
                data.extremo_inferior,
                data.extremo_superior
            );


            document.getElementById(
                "calcCarson"
            ).textContent =
                `B_FM ≈ 2 x (${fmt(data.delta_f)} + ${fmt(data.fm)}) = ${fmt(data.bw_carson)} Hz.`;


            document.getElementById(
                "tablaEspectro"
            ).innerHTML =
                data.componentes.map(
                    c => `

                        <tr>

                            <td>
                                ${c.orden}
                            </td>

                            <td>
                                ${c.lado}
                            </td>

                            <td>
                                ${fmt(c.frecuencia)}
                            </td>

                            <td>
                                ${fmt(c.coeficiente, 5)}
                            </td>

                            <td>
                                ${fmt(c.amplitud, 5)}
                            </td>

                        </tr>
                    `
                ).join(
                    ""
                );


            if (
                document.querySelector(
                    ".tab.activo"
                ).dataset.tab
                === "espectro"
            ) {

                actualizarResultados(
                    "espectro"
                );
            }


            setEstado(
                "Espectro FM actualizado."
            );


            return true;

        } catch (
            error
        ) {

            limpiarEspectro();


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );


            return false;
        }
    }


    async function simularVco() {

        const errores =
            validarVcoCampos();


        if (
            errores.length > 0
        ) {

            datos.vco =
                null;


            limpiarCanvas(
                "grafVcontrol",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafFiVco",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafVcoFm",
                "Parámetros inválidos"
            );


            mostrarErrores(
                errores
            );


            return;
        }


        limpiarErroresVisuales();


        setEstado(
            "Simulando VCO..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "vco_Ac"
                    ),

                fc:
                    numero(
                        "vco_fc"
                    ),

                fm:
                    numero(
                        "vco_fm"
                    ),

                Kvco:
                    numero(
                        "vco_K"
                    ),

                Vbias:
                    numero(
                        "vco_bias"
                    ),

                Vm:
                    numero(
                        "vco_Vm"
                    ),

                multiplicador:
                    numero(
                        "vco_N"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-vco",
                    params
                );


            datos.vco =
                data;


            dibujarSerie(
                "grafVcontrol",
                data.t,
                data.v_control,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafFiVco",
                data.t,
                data.frecuencia_instantanea,
                {
                    unidad:
                        "Hz"
                }
            );


            dibujarSerie(
                "grafVcoFm",
                data.t,
                data.senal_fm,
                {
                    unidad:
                        "V"
                }
            );


            actualizarResultados(
                "generacion"
            );


            setEstado(
                "Simulación de VCO completada."
            );

        } catch (
            error
        ) {

            datos.vco =
                null;


            limpiarCanvas(
                "grafVcontrol",
                "Sin datos"
            );


            limpiarCanvas(
                "grafFiVco",
                "Sin datos"
            );


            limpiarCanvas(
                "grafVcoFm",
                "Sin datos"
            );


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );
        }
    }


    async function simularDemod() {

        const errores =
            validarDemodCampos();


        if (
            errores.length > 0
        ) {

            datos.demod =
                null;


            limpiarCanvas(
                "grafDemodFi",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafDetector",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafPllControl",
                "Parámetros inválidos"
            );


            mostrarErrores(
                errores
            );


            return;
        }


        limpiarErroresVisuales();


        setEstado(
            "Simulando demodulación..."
        );


        const params =
            new URLSearchParams({

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                Kd_v_por_khz:
                    numero(
                        "demod_Kd"
                    ),

                Kvco:
                    numero(
                        "demod_Kvco"
                    ),

                Vdc:
                    numero(
                        "demod_Vdc"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-demod-fm",
                    params
                );


            datos.demod =
                data;


            dibujarSerie(
                "grafDemodFi",
                data.t,
                data.frecuencia_instantanea,
                {
                    unidad:
                        "Hz"
                }
            );


            dibujarSerie(
                "grafDetector",
                data.t,
                data.salida_detector,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafPllControl",
                data.t,
                data.tension_control,
                {
                    unidad:
                        "V"
                }
            );


            actualizarResultados(
                "demodulacion"
            );


            setEstado(
                "Demodulación didáctica completada."
            );

        } catch (
            error
        ) {

            datos.demod =
                null;


            limpiarCanvas(
                "grafDemodFi",
                "Sin datos"
            );


            limpiarCanvas(
                "grafDetector",
                "Sin datos"
            );


            limpiarCanvas(
                "grafPllControl",
                "Sin datos"
            );


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );
        }
    }


    async function simularRuido() {

        const errores =
            validarRuidoCampos();


        if (
            errores.length > 0
        ) {

            datos.ruido =
                null;


            limpiarCanvas(
                "grafRuidoLimpia",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafRuidoAmp",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafLimitador",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafRuidoFase",
                "Parámetros inválidos"
            );


            mostrarErrores(
                errores
            );


            return;
        }


        limpiarErroresVisuales();


        setEstado(
            "Simulando ruido en FM..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "Ac"
                    ),

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                ruido_amplitud:
                    numero(
                        "ruido_amp"
                    ),

                ruido_fase:
                    numero(
                        "ruido_fase"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-ruido-fm",
                    params
                );


            datos.ruido =
                data;


            dibujarSerie(
                "grafRuidoLimpia",
                data.t,
                data.senal_limpia,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafRuidoAmp",
                data.t,
                data.senal_ruido_amplitud,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafLimitador",
                data.t,
                data.senal_limitada,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafRuidoFase",
                data.t,
                data.senal_ruido_fase,
                {
                    unidad:
                        "V"
                }
            );


            actualizarResultados(
                "ruido"
            );


            setEstado(
                "Simulación cualitativa de ruido completada."
            );

        } catch (
            error
        ) {

            datos.ruido =
                null;


            limpiarCanvas(
                "grafRuidoLimpia",
                "Sin datos"
            );


            limpiarCanvas(
                "grafRuidoAmp",
                "Sin datos"
            );


            limpiarCanvas(
                "grafLimitador",
                "Sin datos"
            );


            limpiarCanvas(
                "grafRuidoFase",
                "Sin datos"
            );


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );
        }
    }


    document.querySelectorAll(
        "input"
    ).forEach(
        campo => {

            campo.addEventListener(
                "input",
                () => {

                    if (
                        campo.classList.contains(
                            "campo-error"
                        )
                    ) {

                        campo.classList.remove(
                            "campo-error"
                        );


                        campo.removeAttribute(
                            "aria-invalid"
                        );


                        const grupo =
                            campo.closest(
                                ".grupo"
                            );


                        if (
                            grupo
                        ) {

                            grupo.classList.remove(
                                "grupo-error"
                            );


                            const aviso =
                                grupo.querySelector(
                                    ".error-campo"
                                );


                            if (
                                aviso
                            ) {

                                aviso.remove();
                            }
                        }
                    }


                    if (
                        document.getElementById(
                            "estado"
                        ).classList.contains(
                            "estado-error"
                        )
                    ) {

                        setEstado(
                            "Dato modificado. Pulse nuevamente el botón de simulación."
                        );
                    }
                }
            );
        }
    );


    document.getElementById(
        "btnBase"
    ).addEventListener(
        "click",
        async () => {

            const baseValida =
                await simularBase();


            if (
                baseValida
            ) {

                const espectroValido =
                    await simularEspectro();


                if (
                    espectroValido
                    && document.querySelector(
                        ".tab.activo"
                    ).dataset.tab
                    !== "espectro"
                ) {

                    setEstado(
                        "FM / PM y espectro actualizados."
                    );
                }
            }
        }
    );


    document.getElementById(
        "btnEspectro"
    ).addEventListener(
        "click",
        simularEspectro
    );


    document.getElementById(
        "btnVco"
    ).addEventListener(
        "click",
        simularVco
    );


    document.getElementById(
        "btnDemod"
    ).addEventListener(
        "click",
        simularDemod
    );


    document.getElementById(
        "btnRuido"
    ).addEventListener(
        "click",
        simularRuido
    );


    async function iniciar() {

        await simularBase();

        await simularEspectro();

        await simularVco();

        await simularDemod();

        await simularRuido();


        mostrarParametros(
            "tiempo"
        );


        actualizarResultados(
            "tiempo"
        );


        setEstado(
            "Simulador preparado."
        );
    }


    iniciar();
