(function (root) {
    "use strict";

    const rutasTv = new Set([
        "/prueba-tv-isdb",
        "/prueba-tv-segmentos",
        "/prueba-tv-cobertura",
        "/prueba-tv-ts",
        "/prueba-tv-guarda",
        "/prueba-tv-medio"
    ]);

    const fetchOriginal = typeof root.fetch === "function"
        ? root.fetch.bind(root)
        : null;

    function respuestaJson(cuerpo, estado = 200) {
        return {
            ok: estado >= 200 && estado < 300,
            status: estado,
            statusText: estado === 200 ? "OK" : "Bad Request",
            headers: new Headers({ "Content-Type": "application/json; charset=utf-8" }),
            async json() {
                return cuerpo;
            },
            async text() {
                return JSON.stringify(cuerpo);
            }
        };
    }

    function parametroNumero(params, nombre, valorDefecto) {
        const valor = params.get(nombre);
        return valor === null ? valorDefecto : Number(valor);
    }

    function ejecutarRuta(pathname, params) {
        const motor = root.TVEngine;

        switch (pathname) {
            case "/prueba-tv-isdb":
                return motor.analizarIsdb(
                    params.get("modulacion") ?? "QPSK",
                    params.get("servicio") ?? "ONESEG"
                );

            case "/prueba-tv-segmentos":
                return motor.calcularSegmentos(
                    parametroNumero(params, "capa_a", 1.0),
                    parametroNumero(params, "capa_b", 6.0),
                    parametroNumero(params, "capa_c", 6.0)
                );

            case "/prueba-tv-cobertura":
                return motor.calcularCobertura(
                    parametroNumero(params, "radio_km", 10.0)
                );

            case "/prueba-tv-ts":
                return motor.calcularTransportStream(
                    parametroNumero(params, "bitrate_ts_mbps", 3.0),
                    parametroNumero(params, "video_mbps", 4.0),
                    parametroNumero(params, "audio_kbps", 256.0),
                    parametroNumero(params, "datos_kbps", 500.0)
                );

            case "/prueba-tv-guarda":
                return motor.calcularIntervaloGuarda(
                    parametroNumero(params, "Tu_ms", 1.0),
                    params.get("fraccion") ?? "1/8",
                    parametroNumero(params, "eco_ms", 0.10)
                );

            case "/prueba-tv-medio":
                return motor.describirMedio(
                    params.get("sistema") ?? "TDT"
                );

            default:
                throw new Error("Ruta local no implementada.");
        }
    }

    root.fetch = async function (input, init) {
        const textoUrl = typeof input === "string"
            ? input
            : input && input.url
                ? input.url
                : String(input);

        let url;

        try {
            url = new URL(textoUrl, "http://simulador.local");
        } catch (error) {
            if (fetchOriginal) {
                return fetchOriginal(input, init);
            }
            throw error;
        }

        if (!rutasTv.has(url.pathname)) {
            if (fetchOriginal) {
                return fetchOriginal(input, init);
            }
            throw new Error(`No existe un manejador local para ${url.pathname}.`);
        }

        try {
            const resultado = ejecutarRuta(url.pathname, url.searchParams);
            return respuestaJson(resultado, 200);
        } catch (error) {
            return respuestaJson({ detail: error.message }, 400);
        }
    };
})(typeof globalThis !== "undefined" ? globalThis : window);
