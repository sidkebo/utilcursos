(function (root) {
    "use strict";

    const MODULACIONES = {
        DQPSK: {
            capacidad: "No comparada",
            robustez: "No comparada",
            descripcion:
                "DQPSK es una de las modulaciones utilizadas en ISDB-Tb. " +
                "La comparación relativa de capacidad y robustez de este " +
                "simulador se realiza con QPSK, 16QAM y 64QAM."
        },
        QPSK: {
            capacidad: "Menor",
            robustez: "Mayor",
            descripcion:
                "QPSK ofrece menor capacidad relativa y mayor robustez " +
                "que modulaciones QAM de orden superior."
        },
        "16QAM": {
            capacidad: "Intermedia",
            robustez: "Intermedia",
            descripcion:
                "16QAM representa un compromiso didáctico entre capacidad " +
                "y robustez."
        },
        "64QAM": {
            capacidad: "Mayor",
            robustez: "Menor",
            descripcion:
                "64QAM ofrece mayor capacidad relativa, pero exige mejores " +
                "condiciones de recepción."
        }
    };

    const SERVICIOS = {
        ONESEG: {
            nombre: "One-Seg",
            segmentos_referencia: 1,
            descripcion:
                "Recepción parcial de un segmento, orientada a recepción " +
                "portátil o móvil."
        },
        FULLSEG: {
            nombre: "Full-Seg",
            segmentos_referencia: 13,
            descripcion:
                "Recepción de la señal completa. No debe definirse como " +
                "exactamente 12 segmentos."
        }
    };

    const MEDIOS = {
        TDT: {
            nombre: "TDT",
            medio: "Radio terrestre",
            equipo: "Antena UHF y receptor TDT",
            problema: "Cobertura, ecos o recepción insuficiente",
            diagnostico:
                "Revisar recepción de antena, nivel de señal disponible, " +
                "obstáculos e interferencias antes de atribuir la falla al televisor.",
            cadena: [
                "Estación terrestre",
                "Canal radioeléctrico",
                "Antena UHF",
                "Receptor TDT",
                "Pantalla"
            ]
        },
        CABLE: {
            nombre: "Cable digital",
            medio: "Coaxial o HFC",
            equipo: "Cable, receptor o TV compatible",
            problema: "Conectores, derivadores, nivel bajo o ruido",
            diagnostico:
                "Revisar continuidad del cableado, conectores, derivadores " +
                "y receptor antes de asumir una falla del servicio completo.",
            cadena: [
                "Cabecera",
                "Red coaxial / HFC",
                "Cable del abonado",
                "Receptor",
                "Pantalla"
            ]
        },
        IPTV: {
            nombre: "IPTV",
            medio: "Red IP gestionada",
            equipo: "Decodificador o aplicación del servicio",
            problema: "Red, configuración o servicio",
            diagnostico:
                "Revisar conectividad de la red gestionada, estado del " +
                "decodificador o aplicación y disponibilidad del servicio.",
            cadena: [
                "Proveedor",
                "Red IP gestionada",
                "Decodificador / app",
                "Pantalla"
            ]
        },
        WEBTV: {
            nombre: "Web TV",
            medio: "Internet abierto",
            equipo: "Aplicación o navegador",
            problema: "Buffering, congestión o conexión inestable",
            diagnostico:
                "Comprobar estabilidad y velocidad disponible, probar una " +
                "conexión cableada y revisar saturación por otros usuarios.",
            cadena: [
                "Plataforma online",
                "Internet abierto",
                "App / navegador",
                "Pantalla"
            ]
        },
        SATELITE: {
            nombre: "Televisión satelital",
            medio: "Enlace satelital",
            equipo: "Parabólica, LNB y receptor",
            problema: "Alineación, clima o cableado",
            diagnostico:
                "Revisar alineación de la antena, estado del LNB, cableado " +
                "coaxial y receptor.",
            cadena: [
                "Estación terrena",
                "Satélite / transpondedor",
                "Parabólica",
                "LNB",
                "Receptor",
                "Pantalla"
            ]
        }
    };

    function error(mensaje) {
        throw new Error(mensaje);
    }

    function numero(valor) {
        return Number(valor);
    }

    function textoClave(valor) {
        return String(valor).trim().toUpperCase();
    }

    function fmtG(valor) {
        const n = Number(valor);
        if (Object.is(n, -0)) return "-0";
        return String(n);
    }

    function analizarIsdb(modulacion = "QPSK", servicio = "ONESEG") {
        modulacion = textoClave(modulacion);
        servicio = textoClave(servicio);

        if (!Object.prototype.hasOwnProperty.call(MODULACIONES, modulacion)) {
            error("Modulación no válida. Use DQPSK, QPSK, 16QAM o 64QAM.");
        }

        if (!Object.prototype.hasOwnProperty.call(SERVICIOS, servicio)) {
            error("Servicio no válido. Use One-Seg o Full-Seg.");
        }

        const datosModulacion = MODULACIONES[modulacion];
        const datosServicio = SERVICIOS[servicio];

        return {
            modulacion,
            capacidad: datosModulacion.capacidad,
            robustez: datosModulacion.robustez,
            descripcion_modulacion: datosModulacion.descripcion,
            servicio: datosServicio.nombre,
            segmentos_referencia: datosServicio.segmentos_referencia,
            descripcion_servicio: datosServicio.descripcion,
            segmentos_activos: 13,
            canal_mhz: 6.0,
            ancho_segmento_khz: 6000.0 / 14.0
        };
    }

    function calcularSegmentos(capaA = 1, capaB = 6, capaC = 6) {
        const valores = {
            capa_a: numero(capaA),
            capa_b: numero(capaB),
            capa_c: numero(capaC)
        };

        for (const [nombre, valor] of Object.entries(valores)) {
            if (!Number.isInteger(valor)) {
                error(`${nombre} = ${valor} no es válido. Debe ser un número entero.`);
            }

            if (valor < 0) {
                error(`${nombre} = ${valor} no es válido. No puede ser negativo.`);
            }

            if (valor > 13) {
                error(`${nombre} = ${valor} no es válido. No puede superar 13 segmentos.`);
            }
        }

        const a = valores.capa_a;
        const b = valores.capa_b;
        const c = valores.capa_c;
        const total = a + b + c;

        if (total > 13) {
            error(`La distribución usa ${total} segmentos y supera los 13 segmentos activos.`);
        }

        const restantes = 13 - total;
        const mapa = [
            ...Array(a).fill("A"),
            ...Array(b).fill("B"),
            ...Array(c).fill("C"),
            ...Array(restantes).fill("SIN ASIGNAR")
        ];

        return {
            capa_a: a,
            capa_b: b,
            capa_c: c,
            total,
            restantes,
            valido: true,
            segmentos_activos: 13,
            ancho_segmento_khz: 6000.0 / 14.0,
            mapa
        };
    }

    function calcularCobertura(radioKm = 10.0) {
        const radio = numero(radioKm);

        if (!Number.isFinite(radio)) {
            error("El radio debe ser un número válido.");
        }

        if (radio <= 0) {
            error(`radio = ${fmtG(radio)} km no es válido. Debe ser mayor que 0 km.`);
        }

        const areaKm2 = Math.PI * (radio ** 2);

        return {
            radio_km: radio,
            area_km2: areaKm2,
            interpretacion:
                "Área circular ideal aproximada. " +
                "No representa una cobertura real exacta " +
                "ni un cálculo profesional de propagación."
        };
    }

    function calcularTransportStream(
        bitrateTsMbps = 3.0,
        videoMbps = 4.0,
        audioKbps = 256.0,
        datosKbps = 500.0
    ) {
        const valores = {
            bitrate_ts_mbps: numero(bitrateTsMbps),
            video_mbps: numero(videoMbps),
            audio_kbps: numero(audioKbps),
            datos_kbps: numero(datosKbps)
        };

        for (const [nombre, valor] of Object.entries(valores)) {
            if (!Number.isFinite(valor)) {
                error(`${nombre} debe ser un número válido.`);
            }
        }

        if (valores.bitrate_ts_mbps <= 0) {
            error("bitrate_ts_mbps debe ser mayor que 0 Mbps.");
        }

        if (valores.video_mbps < 0) {
            error("video_mbps no puede ser negativo.");
        }

        if (valores.audio_kbps < 0) {
            error("audio_kbps no puede ser negativo.");
        }

        if (valores.datos_kbps < 0) {
            error("datos_kbps no puede ser negativo.");
        }

        if (
            valores.video_mbps === 0 &&
            valores.audio_kbps === 0 &&
            valores.datos_kbps === 0
        ) {
            error("Video, audio y datos no pueden ser todos cero al mismo tiempo.");
        }

        const paqueteBytes = 188;
        const paqueteBits = paqueteBytes * 8;
        const bitrateTsBps = valores.bitrate_ts_mbps * 1_000_000.0;
        const paquetesS = bitrateTsBps / paqueteBits;
        const tasaServiciosKbps =
            valores.video_mbps * 1000.0 +
            valores.audio_kbps +
            valores.datos_kbps;
        const tasaServiciosMbps = tasaServiciosKbps / 1000.0;

        return {
            paquete_bytes: paqueteBytes,
            paquete_bits: paqueteBits,
            bitrate_ts_mbps: valores.bitrate_ts_mbps,
            paquetes_por_segundo: paquetesS,
            video_mbps: valores.video_mbps,
            audio_kbps: valores.audio_kbps,
            datos_kbps: valores.datos_kbps,
            tasa_servicios_kbps: tasaServiciosKbps,
            tasa_servicios_mbps: tasaServiciosMbps,
            nota:
                "La suma de tasas de servicios es un cálculo didáctico. " +
                "El Transport Stream real también contiene cabeceras " +
                "e información adicional."
        };
    }

    function calcularIntervaloGuarda(TuMs = 1.0, fraccion = "1/8", ecoMs = 0.10) {
        const tu = numero(TuMs);
        const eco = numero(ecoMs);
        const fr = String(fraccion).trim();

        if (!Number.isFinite(tu)) {
            error("Tu debe ser un número válido.");
        }

        if (tu <= 0) {
            error(`Tu = ${fmtG(tu)} ms no es válido. Debe ser mayor que 0 ms.`);
        }

        if (!["1/4", "1/8", "1/16", "1/32"].includes(fr)) {
            error("Fracción de guarda no válida. Use 1/4, 1/8, 1/16 o 1/32.");
        }

        if (!Number.isFinite(eco)) {
            error("El retraso del eco debe ser un número válido.");
        }

        if (eco < 0) {
            error(`eco = ${fmtG(eco)} ms no es válido. No puede ser negativo.`);
        }

        const denominador = Number(fr.split("/")[1]);
        const TgMs = tu / denominador;
        const TtotalMs = tu + TgMs;
        const eficiencia = tu / TtotalMs;
        const ecoDentro = eco <= TgMs;

        const interpretacionEco = ecoDentro
            ? "El retraso indicado queda dentro del intervalo de guarda del modelo didáctico."
            : "El retraso indicado supera el intervalo de guarda y puede degradar la recepción.";

        return {
            Tu_ms: tu,
            fraccion: fr,
            Tg_ms: TgMs,
            Ttotal_ms: TtotalMs,
            eficiencia,
            eficiencia_porcentaje: eficiencia * 100.0,
            eco_ms: eco,
            eco_dentro: ecoDentro,
            interpretacion_eco: interpretacionEco
        };
    }

    function describirMedio(sistema = "TDT") {
        sistema = textoClave(sistema);

        if (!Object.prototype.hasOwnProperty.call(MEDIOS, sistema)) {
            error("Sistema no válido. Use TDT, CABLE, IPTV, WEBTV o SATELITE.");
        }

        const datos = MEDIOS[sistema];

        return {
            codigo: sistema,
            nombre: datos.nombre,
            medio: datos.medio,
            equipo: datos.equipo,
            problema: datos.problema,
            diagnostico: datos.diagnostico,
            cadena: [...datos.cadena]
        };
    }

    const api = {
        MODULACIONES,
        SERVICIOS,
        MEDIOS,
        analizarIsdb,
        calcularSegmentos,
        calcularCobertura,
        calcularTransportStream,
        calcularIntervaloGuarda,
        describirMedio
    };

    root.TVEngine = api;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : window);
