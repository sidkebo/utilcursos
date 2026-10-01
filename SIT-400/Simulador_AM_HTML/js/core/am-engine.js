(function (global) {
    "use strict";

    const np = global.NumPyCompat;

    function generarAM({
        Ac = 2.0,
        fc = 1000.0,
        fm = 100.0,
        m = 0.5,
        fs = 50000.0,
        duracion = 0.05,
        sistema = "AM",
        vestigio = 20.0
    } = {}) {
        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0");
        if (m < 0) throw new Error("m no puede ser negativo");
        if (fs <= 0) throw new Error("fs debe ser mayor que 0");
        if (duracion <= 0) throw new Error("La duracion debe ser mayor que 0");
        if (fm >= fc) throw new Error("Se requiere que fc sea mayor que fm");

        const sistemasValidos = ["AM", "DSB-SC", "SSB-USB", "SSB-LSB", "VSB"];
        if (!sistemasValidos.includes(sistema)) throw new Error("Sistema espectral no valido");

        if (sistema === "VSB") {
            if (vestigio <= 0) throw new Error("El vestigio debe ser mayor que 0");
            if (vestigio > fm) throw new Error("El vestigio no puede ser mayor que fm");
        }

        const frecuenciaMaxima = fc + fm;
        if (fs <= 2 * frecuenciaMaxima) {
            throw new Error("La frecuencia de muestreo interna es insuficiente para estos valores");
        }

        const t = np.arange(0, duracion, 1 / fs);
        const modulante = new Array(t.length);
        const portadora = new Array(t.length);
        const senal_am = new Array(t.length);
        const envolvente_superior = new Array(t.length);
        const envolvente_inferior = new Array(t.length);

        for (let i = 0; i < t.length; i += 1) {
            const ti = t[i];
            const mod = Math.cos(2 * Math.PI * fm * ti);
            const cosPortadora = Math.cos(2 * Math.PI * fc * ti);
            const env = Ac * (1 + m * mod);

            modulante[i] = mod;
            portadora[i] = Ac * cosPortadora;
            senal_am[i] = env * cosPortadora;
            envolvente_superior[i] = env;
            envolvente_inferior[i] = -env;
        }

        const Amax_teorico = Ac * (1 + m);
        const Amin_teorico = Ac * (1 - m);
        const Amax_simulado = np.max(envolvente_superior);
        const Amin_simulado = np.min(envolvente_superior);
        const denominador = Amax_simulado + Amin_simulado;
        const m_simulado = np.isClose(denominador, 0.0)
            ? 0.0
            : (Amax_simulado - Amin_simulado) / denominador;

        let estado;
        if (np.isClose(m, 0.0)) estado = "Sin modulacion";
        else if (0 < m && m < 1) estado = "Modulacion normal";
        else if (np.isClose(m, 1.0)) estado = "Modulacion al 100%";
        else estado = "Sobremodulacion";

        const Bm = fm;
        const f_bli = fc - fm;
        const f_bls = fc + fm;
        const amplitud_portadora = Ac;
        const amplitud_banda = m * Ac / 2;

        let componentes_espectrales = [];
        let zonas_espectrales = [];
        let tipo_espectro = "lineas";
        let nombre_sistema;
        let componentes_texto;
        let extremo_inferior;
        let extremo_superior;
        let ancho_banda;
        let portadora_transmitida;

        if (sistema === "AM") {
            nombre_sistema = "AM convencional";
            componentes_texto = "Portadora + BLI + BLS";
            extremo_inferior = fc - Bm;
            extremo_superior = fc + Bm;
            ancho_banda = 2 * Bm;
            portadora_transmitida = true;
            componentes_espectrales = [
                { nombre: "BLI", frecuencia: f_bli, amplitud: amplitud_banda },
                { nombre: "fc", frecuencia: fc, amplitud: amplitud_portadora },
                { nombre: "BLS", frecuencia: f_bls, amplitud: amplitud_banda }
            ];
        } else if (sistema === "DSB-SC") {
            nombre_sistema = "DSB-SC";
            componentes_texto = "BLI + BLS";
            extremo_inferior = fc - Bm;
            extremo_superior = fc + Bm;
            ancho_banda = 2 * Bm;
            portadora_transmitida = false;
            componentes_espectrales = [
                { nombre: "BLI", frecuencia: f_bli, amplitud: amplitud_banda },
                { nombre: "BLS", frecuencia: f_bls, amplitud: amplitud_banda }
            ];
        } else if (sistema === "SSB-USB") {
            nombre_sistema = "SSB - Banda lateral superior";
            componentes_texto = "Solo BLS";
            extremo_inferior = fc;
            extremo_superior = fc + Bm;
            ancho_banda = Bm;
            portadora_transmitida = false;
            componentes_espectrales = [
                { nombre: "BLS", frecuencia: f_bls, amplitud: amplitud_banda }
            ];
        } else if (sistema === "SSB-LSB") {
            nombre_sistema = "SSB - Banda lateral inferior";
            componentes_texto = "Solo BLI";
            extremo_inferior = fc - Bm;
            extremo_superior = fc;
            ancho_banda = Bm;
            portadora_transmitida = false;
            componentes_espectrales = [
                { nombre: "BLI", frecuencia: f_bli, amplitud: amplitud_banda }
            ];
        } else {
            nombre_sistema = "VSB";
            componentes_texto = "Banda superior completa + vestigio inferior";
            extremo_inferior = fc - vestigio;
            extremo_superior = fc + Bm;
            ancho_banda = Bm + vestigio;
            portadora_transmitida = false;
            tipo_espectro = "bandas";
            zonas_espectrales = [
                { nombre: "Vestigio BLI", inicio: fc - vestigio, fin: fc },
                { nombre: "BLS completa", inicio: fc, fin: fc + Bm }
            ];
        }

        return {
            Ac, fc, fm, m,
            Amax_teorico,
            Amin_teorico,
            Amax_simulado,
            Amin_simulado,
            m_simulado,
            estado,
            Bm,
            f_bli,
            f_bls,
            amplitud_portadora,
            amplitud_banda,
            sistema,
            nombre_sistema,
            componentes_texto,
            extremo_inferior,
            extremo_superior,
            ancho_banda,
            vestigio,
            portadora_transmitida,
            tipo_espectro,
            componentes_espectrales,
            zonas_espectrales,
            t,
            modulante,
            portadora,
            senal_am,
            envolvente_superior,
            envolvente_inferior
        };
    }

    global.SimuladorAMEngine = Object.freeze({ generarAM });
})(window);
