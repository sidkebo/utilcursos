(function (global) {
    "use strict";

    const fetchOriginal = typeof global.fetch === "function" ? global.fetch.bind(global) : null;

    function numero(params, nombre, valorDefecto) {
        const texto = params.get(nombre);
        if (texto === null || texto === "") return valorDefecto;
        return Number(texto);
    }

    function texto(params, nombre, valorDefecto) {
        const valor = params.get(nombre);
        return valor === null ? valorDefecto : valor;
    }

    function respuesta(ok, datos, status) {
        return {
            ok,
            status,
            async json() {
                return datos;
            }
        };
    }

    function errorRespuesta(error) {
        return respuesta(false, { detail: error.message }, 400);
    }

    async function apiLocal(input) {
        const entrada = typeof input === "string" ? input : input.url;
        const url = new URL(entrada, "http://simulador.local");
        const params = url.searchParams;

        try {
            if (url.pathname === "/prueba-am") {
                const datos = global.SimuladorAMEngine.generarAM({
                    Ac: numero(params, "Ac", 2.0),
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    m: numero(params, "m", 0.5),
                    sistema: texto(params, "sistema", "AM"),
                    vestigio: numero(params, "vestigio", 20.0),
                    fs: 50000.0,
                    duracion: 0.05
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-implementacion") {
                const datos = global.SimuladorImplementacionEngine.calcularImplementacion({
                    tipo: texto(params, "tipo", "LC"),
                    L_mH: numero(params, "L_mH", 10.0),
                    C_nF: numero(params, "C_nF", 10.0),
                    C1_nF: numero(params, "C1_nF", 10.0),
                    C2_nF: numero(params, "C2_nF", 10.0),
                    L1_mH: numero(params, "L1_mH", 5.0),
                    L2_mH: numero(params, "L2_mH", 5.0),
                    f1: numero(params, "f1", 10000.0),
                    f2: numero(params, "f2", 3000.0)
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-ruido") {
                const datos = global.SimuladorRuidoEngine.generarAMConRuido({
                    Ac: numero(params, "Ac", 1.0),
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    m: numero(params, "m", 0.5),
                    nivel: texto(params, "nivel", "BAJO"),
                    A_ruido: numero(params, "A_ruido", 0.05),
                    fs: 50000.0,
                    duracion: 0.05
                });
                return respuesta(true, datos, 200);
            }
        } catch (error) {
            return errorRespuesta(error);
        }

        if (fetchOriginal) return fetchOriginal(input);
        throw new Error("Recurso no disponible");
    }

    global.fetch = apiLocal;
})(window);
