(function (global) {
    "use strict";

    function isClose(a, b, rtol = 1e-5, atol = 1e-8) {
        return Math.abs(a - b) <= (atol + rtol * Math.abs(b));
    }

    function arange(start, stop, step) {
        if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step) || step === 0) {
            throw new Error("Parametros invalidos para arange");
        }

        const valores = [];
        let i = 0;

        if (step > 0) {
            while (true) {
                const valor = start + i * step;
                if (!(valor < stop)) break;
                valores.push(valor);
                i += 1;
            }
        } else {
            while (true) {
                const valor = start + i * step;
                if (!(valor > stop)) break;
                valores.push(valor);
                i += 1;
            }
        }

        return valores;
    }

    function linspace(start, stop, cantidad, endpoint = true) {
        const n = Math.trunc(cantidad);
        if (n <= 0) return [];
        if (n === 1) return [start];

        const divisor = endpoint ? (n - 1) : n;
        const paso = (stop - start) / divisor;
        const valores = new Array(n);

        for (let i = 0; i < n; i += 1) {
            valores[i] = start + paso * i;
        }

        if (endpoint) valores[n - 1] = stop;
        return valores;
    }

    function max(valores) {
        let resultado = -Infinity;
        for (let i = 0; i < valores.length; i += 1) {
            if (valores[i] > resultado) resultado = valores[i];
        }
        return resultado;
    }

    function min(valores) {
        let resultado = Infinity;
        for (let i = 0; i < valores.length; i += 1) {
            if (valores[i] < resultado) resultado = valores[i];
        }
        return resultado;
    }

    function meanSquares(valores) {
        let suma = 0.0;
        for (let i = 0; i < valores.length; i += 1) {
            const v = valores[i];
            suma += v * v;
        }
        return suma / valores.length;
    }

    global.NumPyCompat = Object.freeze({
        isClose,
        arange,
        linspace,
        max,
        min,
        meanSquares
    });
})(window);
