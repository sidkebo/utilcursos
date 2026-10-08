(function (global) {
    "use strict";

    const np = global.NumPyCompat;
    const especiales = global.SpecialFunctions;
    const ruidoBase = global.NOISE_SEED_12345_FM;

    function validarBase(Ac, fc, fm, Am, deltaF) {
        Ac = Number(Ac);
        fc = Number(fc);
        fm = Number(fm);
        Am = Number(Am);
        deltaF = Number(deltaF);

        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0.");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0.");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0.");
        if (fm >= fc) throw new Error("Para esta simulacion didactica se requiere fm < fc.");
        if (Am <= 0) throw new Error("Am debe ser mayor que 0.");
        if (deltaF < 0) throw new Error("delta_f no puede ser negativa.");
        if (deltaF >= fc) {
            throw new Error("Para esta simulacion se requiere delta_f < fc para mantener frecuencia instantanea positiva.");
        }

        return { Ac, fc, fm, Am, deltaF };
    }

    function crearTiempo(fc, fm, deltaF, ciclosModulante = 5, maxMuestras = 20000) {
        const duracion = Number(ciclosModulante) / fm;
        const fMaxVisual = fc + deltaF;
        const fsObjetivo = Math.max(40.0 * fMaxVisual, 200.0 * fm);
        const muestrasNecesarias = Math.ceil(duracion * fsObjetivo) + 1;
        const n = Math.min(Math.max(muestrasNecesarias, 3000), Math.trunc(maxMuestras));
        const t = np.linspace(0.0, duracion, n, false);
        return { t, duracion, n };
    }

    function generarFmPm({
        Ac = 2.0,
        fc = 1000.0,
        fm = 100.0,
        Am = 1.0,
        delta_f = 200.0,
        delta_phi = 1.0,
        max_muestras = 20000
    } = {}) {
        const base = validarBase(Ac, fc, fm, Am, delta_f);
        Ac = base.Ac;
        fc = base.fc;
        fm = base.fm;
        Am = base.Am;
        delta_f = base.deltaF;
        delta_phi = Number(delta_phi);

        if (delta_phi < 0) throw new Error("delta_phi no puede ser negativa.");

        const { t, duracion, n } = crearTiempo(fc, fm, delta_f, 5, max_muestras);
        const wm = 2.0 * Math.PI * fm;
        const wc = 2.0 * Math.PI * fc;
        const beta = delta_f / fm;

        const modulante = new Array(n);
        const portadora = new Array(n);
        const senal_fm = new Array(n);
        const senal_pm = new Array(n);
        const frecuencia_instantanea = new Array(n);
        const fase_extra_pm = new Array(n);

        for (let i = 0; i < n; i += 1) {
            const ti = t[i];
            const wmT = wm * ti;
            const wcT = wc * ti;
            const cosWm = Math.cos(wmT);
            const sinWm = Math.sin(wmT);
            const fasePm = delta_phi * cosWm;

            modulante[i] = Am * cosWm;
            portadora[i] = Ac * Math.cos(wcT);
            senal_fm[i] = Ac * Math.cos(wcT + beta * sinWm);
            frecuencia_instantanea[i] = fc + delta_f * cosWm;
            fase_extra_pm[i] = fasePm;
            senal_pm[i] = Ac * Math.cos(wcT + fasePm);
        }

        const f_min = fc - delta_f;
        const f_max = fc + delta_f;
        const kf = delta_f / Am;
        const kp = delta_phi / Am;
        const mp = delta_phi;

        return {
            Ac,
            fc,
            fm,
            Am,
            delta_f,
            delta_phi,
            f_min,
            f_max,
            beta,
            kf,
            kp,
            mp,
            duracion,
            muestras: n,
            t,
            modulante,
            portadora,
            senal_fm,
            senal_pm,
            frecuencia_instantanea,
            fase_extra_pm
        };
    }

    function calcularEspectroFm({
        Ac = 2.0,
        fc = 1000.0,
        fm = 100.0,
        delta_f = 200.0,
        orden = 8
    } = {}) {
        Ac = Number(Ac);
        fc = Number(fc);
        fm = Number(fm);
        delta_f = Number(delta_f);
        orden = Math.trunc(Number(orden));

        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0.");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0.");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0.");
        if (fm >= fc) throw new Error("Para esta simulacion didactica se requiere fm < fc.");
        if (delta_f < 0) throw new Error("delta_f no puede ser negativa.");
        if (delta_f >= fc) {
            throw new Error("Para esta simulacion se requiere delta_f < fc para mantener frecuencia instantanea positiva.");
        }
        if (orden < 1 || orden > 20) throw new Error("El orden mostrado debe estar entre 1 y 20.");

        const beta = delta_f / fm;
        let clasificacion;
        if (beta < 1.0) {
            clasificacion = "Tendencia NBFM: beta < 1. La frontera beta = 1 es solo orientativa.";
        } else if (beta > 1.0) {
            clasificacion = "Tendencia WBFM: beta > 1. La frontera beta = 1 es solo orientativa.";
        } else {
            clasificacion = "beta = 1: zona de referencia entre NBFM y WBFM; no es una frontera universal exacta.";
        }

        const bw_carson = 2.0 * (delta_f + fm);
        const extremo_inferior = fc - bw_carson / 2.0;
        const extremo_superior = fc + bw_carson / 2.0;
        const componentes = [];

        for (let n = 0; n <= orden; n += 1) {
            const coef = especiales.besselJInteger(n, beta);
            const amplitud = Math.abs(Ac * coef);

            if (n === 0) {
                componentes.push({
                    orden: 0,
                    lado: "CENTRAL",
                    frecuencia: fc,
                    coeficiente: coef,
                    amplitud
                });
            } else {
                componentes.push({
                    orden: n,
                    lado: "INFERIOR",
                    frecuencia: fc - n * fm,
                    coeficiente: coef,
                    amplitud
                });
                componentes.push({
                    orden: n,
                    lado: "SUPERIOR",
                    frecuencia: fc + n * fm,
                    coeficiente: coef,
                    amplitud
                });
            }
        }

        componentes.sort((a, b) => a.frecuencia - b.frecuencia);

        return {
            Ac,
            fc,
            fm,
            delta_f,
            beta,
            clasificacion,
            bw_carson,
            extremo_inferior,
            extremo_superior,
            orden,
            componentes
        };
    }

    function simularVco({
        Ac = 1.0,
        fc = 20.0,
        fm = 1.0,
        Kvco = 5.0,
        Vbias = 2.0,
        Vm = 1.0,
        multiplicador = 1,
        max_muestras = 12000
    } = {}) {
        Ac = Number(Ac);
        fc = Number(fc);
        fm = Number(fm);
        Kvco = Number(Kvco);
        Vbias = Number(Vbias);
        Vm = Number(Vm);
        multiplicador = Math.trunc(Number(multiplicador));

        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0.");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0.");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0.");
        if (Kvco <= 0) throw new Error("Kvco debe ser mayor que 0.");
        if (Vm < 0) throw new Error("Vm no puede ser negativa.");
        if (multiplicador < 1 || multiplicador > 20) {
            throw new Error("El multiplicador N debe estar entre 1 y 20.");
        }

        const delta_f = Kvco * Vm;
        if (delta_f >= fc) {
            throw new Error("Se requiere delta_f < fc para mantener frecuencia instantanea positiva.");
        }

        const beta = delta_f / fm;
        const f_min = fc - delta_f;
        const f_max = fc + delta_f;
        const { t, duracion, n } = crearTiempo(fc, fm, delta_f, 3, max_muestras);
        const wm = 2.0 * Math.PI * fm;
        const wc = 2.0 * Math.PI * fc;
        const v_control = new Array(n);
        const frecuencia_instantanea = new Array(n);
        const senal_fm = new Array(n);

        for (let i = 0; i < n; i += 1) {
            const ti = t[i];
            const wmT = wm * ti;
            const cosWm = Math.cos(wmT);
            v_control[i] = Vbias + Vm * cosWm;
            frecuencia_instantanea[i] = fc + delta_f * cosWm;
            senal_fm[i] = Ac * Math.cos(wc * ti + beta * Math.sin(wmT));
        }

        const fc_multiplicada = fc * multiplicador;
        const delta_f_multiplicada = delta_f * multiplicador;
        const beta_multiplicada = delta_f_multiplicada / fm;

        return {
            Ac,
            fc,
            fm,
            Kvco,
            Vbias,
            Vm,
            delta_f,
            beta,
            f_min,
            f_max,
            multiplicador,
            fc_multiplicada,
            delta_f_multiplicada,
            beta_multiplicada,
            duracion,
            muestras: n,
            t,
            v_control,
            frecuencia_instantanea,
            senal_fm
        };
    }

    function simularDemodulacion({
        fc = 1000.0,
        fm = 100.0,
        delta_f = 200.0,
        Kd_v_por_khz = 0.2,
        Kvco = 200.0,
        Vdc = 2.0,
        max_muestras = 12000
    } = {}) {
        fc = Number(fc);
        fm = Number(fm);
        delta_f = Number(delta_f);
        Kd_v_por_khz = Number(Kd_v_por_khz);
        Kvco = Number(Kvco);
        Vdc = Number(Vdc);

        if (fc <= 0) throw new Error("fc debe ser mayor que 0.");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0.");
        if (delta_f < 0) throw new Error("delta_f no puede ser negativa.");
        if (delta_f >= fc) {
            throw new Error("Se requiere delta_f < fc para mantener frecuencia instantanea positiva.");
        }
        if (Kd_v_por_khz <= 0) throw new Error("Kd debe ser mayor que 0.");
        if (Kvco <= 0) throw new Error("Kvco debe ser mayor que 0.");

        const { t, duracion, n } = crearTiempo(fc, fm, delta_f, 5, max_muestras);
        const wm = 2.0 * Math.PI * fm;
        const frecuencia_instantanea = new Array(n);
        const salida_detector = new Array(n);
        const variacion_control = new Array(n);
        const tension_control = new Array(n);

        for (let i = 0; i < n; i += 1) {
            const desviacionInstantanea = delta_f * Math.cos(wm * t[i]);
            frecuencia_instantanea[i] = fc + desviacionInstantanea;
            salida_detector[i] = Kd_v_por_khz * (desviacionInstantanea / 1000.0);
            variacion_control[i] = desviacionInstantanea / Kvco;
            tension_control[i] = Vdc + variacion_control[i];
        }

        const delta_v_control = delta_f / Kvco;
        const salida_detector_pico = Kd_v_por_khz * (delta_f / 1000.0);

        return {
            fc,
            fm,
            delta_f,
            Kd_v_por_khz,
            Kvco,
            Vdc,
            delta_v_control,
            salida_detector_pico,
            duracion,
            muestras: n,
            t,
            frecuencia_instantanea,
            salida_detector,
            variacion_control,
            tension_control
        };
    }

    function simularRuidoFm({
        Ac = 1.0,
        fc = 1000.0,
        fm = 100.0,
        delta_f = 200.0,
        ruido_amplitud = 0.15,
        ruido_fase = 0.08,
        max_muestras = 12000
    } = {}) {
        Ac = Number(Ac);
        fc = Number(fc);
        fm = Number(fm);
        delta_f = Number(delta_f);
        ruido_amplitud = Number(ruido_amplitud);
        ruido_fase = Number(ruido_fase);

        if (Ac <= 0) throw new Error("Ac debe ser mayor que 0.");
        if (fc <= 0) throw new Error("fc debe ser mayor que 0.");
        if (fm <= 0) throw new Error("fm debe ser mayor que 0.");
        if (delta_f < 0) throw new Error("delta_f no puede ser negativa.");
        if (delta_f >= fc) {
            throw new Error("Se requiere delta_f < fc para mantener frecuencia instantanea positiva.");
        }
        if (ruido_amplitud < 0) {
            throw new Error("El nivel relativo de ruido de amplitud no puede ser negativo.");
        }
        if (ruido_fase < 0) throw new Error("La perturbacion de fase no puede ser negativa.");

        const { t, duracion, n } = crearTiempo(fc, fm, delta_f, 5, max_muestras);
        if (ruidoBase.length < 2 * n) {
            throw new Error("Configuracion interna de ruido no compatible con la referencia original");
        }

        const wm = 2.0 * Math.PI * fm;
        const wc = 2.0 * Math.PI * fc;
        const beta = delta_f / fm;
        const escala = Math.max(Ac, 1e-12);
        const tanh3 = Math.tanh(3.0);

        const senal_limpia = new Array(n);
        const senal_ruido_amplitud = new Array(n);
        const senal_limitada = new Array(n);
        const senal_ruido_fase = new Array(n);
        const ruidoA = new Array(n);

        let sumaCuadradosSenal = 0.0;
        let sumaCuadradosRuido = 0.0;

        for (let i = 0; i < n; i += 1) {
            const ti = t[i];
            const faseLimpia = wc * ti + beta * Math.sin(wm * ti);
            const limpia = Ac * Math.cos(faseLimpia);
            const ruidoAmp = ruido_amplitud * Ac * ruidoBase[i];
            const conRuidoAmp = limpia + ruidoAmp;
            const ruidoPhi = ruido_fase * ruidoBase[n + i];

            senal_limpia[i] = limpia;
            ruidoA[i] = ruidoAmp;
            senal_ruido_amplitud[i] = conRuidoAmp;
            senal_limitada[i] = Ac * Math.tanh(3.0 * conRuidoAmp / escala) / tanh3;
            senal_ruido_fase[i] = Ac * Math.cos(faseLimpia + ruidoPhi);

            sumaCuadradosSenal += limpia * limpia;
            sumaCuadradosRuido += ruidoAmp * ruidoAmp;
        }

        const rms_ruido_amplitud = Math.sqrt(sumaCuadradosRuido / n);
        const rms_senal = Math.sqrt(sumaCuadradosSenal / n);

        return {
            Ac,
            fc,
            fm,
            delta_f,
            beta,
            ruido_amplitud,
            ruido_fase,
            rms_senal,
            rms_ruido_amplitud,
            duracion,
            muestras: n,
            t,
            senal_limpia,
            senal_ruido_amplitud,
            senal_limitada,
            senal_ruido_fase
        };
    }

    global.SimuladorFMPMEngine = Object.freeze({
        generarFmPm,
        calcularEspectroFm,
        simularVco,
        simularDemodulacion,
        simularRuidoFm
    });
})(window);
