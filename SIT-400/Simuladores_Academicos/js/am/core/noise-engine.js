(function (global) {
    "use strict";

    const np = global.NumPyCompat;
    const ruidoBase = global.NOISE_SEED_12345;

    function generarAMConRuido({
        Ac = 1.0,
        fc = 1000.0,
        fm = 100.0,
        m = 0.5,
        nivel = "BAJO",
        A_ruido = 0.05,
        fs = 50000.0,
        duracion = 0.05
    } = {}) {
        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0");
        if (m < 0) throw new Error("m no puede ser negativo");
        if (fm >= fc) throw new Error("Se requiere que fc sea mayor que fm");
        if (fs <= 0) throw new Error("fs debe ser mayor que 0");
        if (duracion <= 0) throw new Error("La duracion debe ser mayor que 0");

        const nivelesValidos = ["LIMPIO", "BAJO", "MEDIO", "ALTO", "PERSONALIZADO"];
        if (!nivelesValidos.includes(nivel)) throw new Error("Nivel de ruido no valido");

        let A_ruido_usado;
        if (nivel === "LIMPIO") A_ruido_usado = 0.0;
        else if (nivel === "BAJO") A_ruido_usado = 0.05;
        else if (nivel === "MEDIO") A_ruido_usado = 0.15;
        else if (nivel === "ALTO") A_ruido_usado = 0.35;
        else {
            if (A_ruido < 0) throw new Error("A_ruido no puede ser negativo");
            A_ruido_usado = A_ruido;
        }

        const frecuenciaMaxima = fc + fm;
        if (fs <= 2 * frecuenciaMaxima) {
            throw new Error("La frecuencia de muestreo interna es insuficiente para estos valores");
        }

        const t = np.arange(0, duracion, 1 / fs);
        if (t.length !== ruidoBase.length) {
            throw new Error("Configuracion interna de ruido no compatible con la referencia original");
        }

        const modulante = new Array(t.length);
        const envolvente_superior = new Array(t.length);
        const envolvente_inferior = new Array(t.length);
        const senal_am_limpia = new Array(t.length);
        const ruido = new Array(t.length);
        const senal_am_ruidosa = new Array(t.length);

        for (let i = 0; i < t.length; i += 1) {
            const mod = Math.cos(2 * Math.PI * fm * t[i]);
            const env = Ac * (1 + m * mod);
            const limpia = env * Math.cos(2 * Math.PI * fc * t[i]);
            const r = A_ruido_usado === 0 ? 0.0 : A_ruido_usado * ruidoBase[i];

            modulante[i] = mod;
            envolvente_superior[i] = env;
            envolvente_inferior[i] = -env;
            senal_am_limpia[i] = limpia;
            ruido[i] = r;
            senal_am_ruidosa[i] = limpia + r;
        }

        const V_senal_RMS = Math.sqrt(np.meanSquares(senal_am_limpia));
        const V_ruido_RMS = Math.sqrt(np.meanSquares(ruido));
        let SNR_lineal = null;
        let SNR_dB = null;

        if (!np.isClose(V_ruido_RMS, 0.0)) {
            const relacionTension = V_senal_RMS / V_ruido_RMS;
            SNR_lineal = relacionTension ** 2;
            SNR_dB = 20 * Math.log10(relacionTension);
        }

        let interpretacion;
        if (nivel === "LIMPIO") interpretacion = "AM limpia: envolvente clara.";
        else if (nivel === "BAJO") interpretacion = "Ruido bajo: la envolvente todavia es reconocible.";
        else if (nivel === "MEDIO") interpretacion = "Ruido medio: la envolvente se vuelve mas irregular.";
        else if (nivel === "ALTO") interpretacion = "Ruido alto: el mensaje resulta mas dificil de reconocer.";
        else interpretacion = "Nivel de ruido personalizado.";

        return {
            Ac,
            fc,
            fm,
            m,
            nivel,
            A_ruido: A_ruido_usado,
            V_senal_RMS,
            V_ruido_RMS,
            SNR_lineal,
            SNR_dB,
            interpretacion,
            t,
            modulante,
            envolvente_superior,
            envolvente_inferior,
            senal_am_limpia,
            ruido,
            senal_am_ruidosa
        };
    }

    global.SimuladorRuidoEngine = Object.freeze({ generarAMConRuido });
})(window);
