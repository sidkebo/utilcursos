(function (global) {
    "use strict";

    const fetchOriginal = typeof global.fetch === "function" ? global.fetch.bind(global) : null;

    function numero(params, nombre, valorDefecto) {
        const texto = params.get(nombre);
        if (texto === null || texto === "") return valorDefecto;
        return Number(texto);
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
        const motor = global.SimuladorFMPMEngine;

        try {
            if (url.pathname === "/prueba-fm-pm") {
                const datos = motor.generarFmPm({
                    Ac: numero(params, "Ac", 2.0),
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    Am: numero(params, "Am", 1.0),
                    delta_f: numero(params, "delta_f", 200.0),
                    delta_phi: numero(params, "delta_phi", 1.0)
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-espectro-fm") {
                const datos = motor.calcularEspectroFm({
                    Ac: numero(params, "Ac", 2.0),
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    delta_f: numero(params, "delta_f", 200.0),
                    orden: numero(params, "orden", 8)
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-vco") {
                const datos = motor.simularVco({
                    Ac: numero(params, "Ac", 1.0),
                    fc: numero(params, "fc", 20.0),
                    fm: numero(params, "fm", 1.0),
                    Kvco: numero(params, "Kvco", 5.0),
                    Vbias: numero(params, "Vbias", 2.0),
                    Vm: numero(params, "Vm", 1.0),
                    multiplicador: numero(params, "multiplicador", 1)
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-demod-fm") {
                const datos = motor.simularDemodulacion({
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    delta_f: numero(params, "delta_f", 200.0),
                    Kd_v_por_khz: numero(params, "Kd_v_por_khz", 0.2),
                    Kvco: numero(params, "Kvco", 200.0),
                    Vdc: numero(params, "Vdc", 2.0)
                });
                return respuesta(true, datos, 200);
            }

            if (url.pathname === "/prueba-ruido-fm") {
                const datos = motor.simularRuidoFm({
                    Ac: numero(params, "Ac", 1.0),
                    fc: numero(params, "fc", 1000.0),
                    fm: numero(params, "fm", 100.0),
                    delta_f: numero(params, "delta_f", 200.0),
                    ruido_amplitud: numero(params, "ruido_amplitud", 0.15),
                    ruido_fase: numero(params, "ruido_fase", 0.08)
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
