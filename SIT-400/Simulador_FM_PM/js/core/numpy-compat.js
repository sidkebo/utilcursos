(function (global) {
    "use strict";

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

    function meanSquares(valores) {
        let suma = 0.0;
        for (let i = 0; i < valores.length; i += 1) {
            const v = valores[i];
            suma += v * v;
        }
        return suma / valores.length;
    }

    global.NumPyCompat = Object.freeze({
        linspace,
        meanSquares
    });
})(window);
