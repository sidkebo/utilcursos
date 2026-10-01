(function (global) {
    "use strict";

    const np = global.NumPyCompat;

    function calcularImplementacion({
        tipo = "LC",
        L_mH = 10.0,
        C_nF = 10.0,
        C1_nF = 10.0,
        C2_nF = 10.0,
        L1_mH = 5.0,
        L2_mH = 5.0,
        f1 = 10000.0,
        f2 = 3000.0
    } = {}) {
        const tiposValidos = ["LC", "COLPITTS", "HARTLEY", "MEZCLADOR"];
        if (!tiposValidos.includes(tipo)) throw new Error("Tipo de implementacion no valido");

        if (tipo === "LC") {
            if (L_mH <= 0) throw new Error("L debe ser mayor que 0");
            if (C_nF <= 0) throw new Error("C debe ser mayor que 0");
            const L = L_mH * 1e-3;
            const C = C_nF * 1e-9;
            const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
            return {
                tipo,
                nombre: "Circuito resonante LC",
                L_mH,
                C_nF,
                f0,
                descripcion: "Frecuencia de resonancia teorica del circuito LC.",
                validacion: "El resultado corresponde al modelo teorico ideal."
            };
        }

        if (tipo === "COLPITTS") {
            if (L_mH <= 0) throw new Error("L debe ser mayor que 0");
            if (C1_nF <= 0) throw new Error("C1 debe ser mayor que 0");
            if (C2_nF <= 0) throw new Error("C2 debe ser mayor que 0");
            const L = L_mH * 1e-3;
            const C1 = C1_nF * 1e-9;
            const C2 = C2_nF * 1e-9;
            const Ceq = (C1 * C2) / (C1 + C2);
            const f0 = 1 / (2 * Math.PI * Math.sqrt(L * Ceq));
            return {
                tipo,
                nombre: "Oscilador Colpitts",
                L_mH,
                C1_nF,
                C2_nF,
                Ceq_nF: Ceq * 1e9,
                f0,
                descripcion: "Colpitts utiliza realimentacion capacitiva mediante C1 y C2.",
                validacion: "La frecuencia calculada es teorica. La oscilacion real debe verificarse en Proteus."
            };
        }

        if (tipo === "HARTLEY") {
            if (L1_mH <= 0) throw new Error("L1 debe ser mayor que 0");
            if (L2_mH <= 0) throw new Error("L2 debe ser mayor que 0");
            if (C_nF <= 0) throw new Error("C debe ser mayor que 0");
            const L1 = L1_mH * 1e-3;
            const L2 = L2_mH * 1e-3;
            const C = C_nF * 1e-9;
            const Ltotal = L1 + L2;
            const f0 = 1 / (2 * Math.PI * Math.sqrt(Ltotal * C));
            return {
                tipo,
                nombre: "Oscilador Hartley",
                L1_mH,
                L2_mH,
                Ltotal_mH: Ltotal * 1e3,
                C_nF,
                f0,
                descripcion: "Hartley utiliza realimentacion inductiva mediante L1 y L2.",
                validacion: "Se utiliza el modelo aproximado Ltotal = L1 + L2. La oscilacion real debe verificarse en Proteus."
            };
        }

        if (f1 <= 0) throw new Error("f1 debe ser mayor que 0");
        if (f2 <= 0) throw new Error("f2 debe ser mayor que 0");

        const f_suma = f1 + f2;
        const f_diferencia = Math.abs(f1 - f2);
        const frecuenciaMenor = Math.min(f1, f2);
        const duracion = 5 / frecuenciaMenor;
        const cantidadMuestras = 4000;
        const t = np.linspace(0, duracion, cantidadMuestras, false);
        const x1 = new Array(cantidadMuestras);
        const x2 = new Array(cantidadMuestras);
        const salida = new Array(cantidadMuestras);

        for (let i = 0; i < cantidadMuestras; i += 1) {
            x1[i] = Math.cos(2 * Math.PI * f1 * t[i]);
            x2[i] = Math.cos(2 * Math.PI * f2 * t[i]);
            salida[i] = x1[i] * x2[i];
        }

        return {
            tipo,
            nombre: "Mezclador basico",
            f1,
            f2,
            f_suma,
            f_diferencia,
            amplitud_relativa_suma: 0.5,
            amplitud_relativa_diferencia: 0.5,
            descripcion: "Modelo ideal basado en el producto de dos senales.",
            validacion: "Deben aparecer componentes de suma y diferencia.",
            t,
            x1,
            x2,
            salida
        };
    }

    global.SimuladorImplementacionEngine = Object.freeze({ calcularImplementacion });
})(window);
