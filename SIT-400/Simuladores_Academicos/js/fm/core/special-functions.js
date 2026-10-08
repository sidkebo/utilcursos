(function (global) {
    "use strict";

    // Aproximaciones de Bessel J_n para orden entero, siguiendo el algoritmo
    // clásico de recurrencia estable usado en Numerical Recipes. El simulador
    // original usa scipy.special.jv(n, beta) con n entero de 0 a 20.

    function besselJ0(x) {
        const ax = Math.abs(x);
        let y;
        let ans1;
        let ans2;

        if (ax < 8.0) {
            y = x * x;
            ans1 = 57568490574.0
                + y * (-13362590354.0
                + y * (651619640.7
                + y * (-11214424.18
                + y * (77392.33017
                + y * (-184.9052456)))));
            ans2 = 57568490411.0
                + y * (1029532985.0
                + y * (9494680.718
                + y * (59272.64853
                + y * (267.8532712
                + y))));
            return ans1 / ans2;
        }

        const z = 8.0 / ax;
        y = z * z;
        const xx = ax - 0.785398164;
        ans1 = 1.0
            + y * (-0.1098628627e-2
            + y * (0.2734510407e-4
            + y * (-0.2073370639e-5
            + y * 0.2093887211e-6)));
        ans2 = -0.1562499995e-1
            + y * (0.1430488765e-3
            + y * (-0.6911147651e-5
            + y * (0.7621095161e-6
            - y * 0.934945152e-7)));
        return Math.sqrt(0.636619772 / ax)
            * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
    }

    function besselJ1(x) {
        const ax = Math.abs(x);
        let y;
        let ans1;
        let ans2;
        let ans;

        if (ax < 8.0) {
            y = x * x;
            ans1 = x
                * (72362614232.0
                + y * (-7895059235.0
                + y * (242396853.1
                + y * (-2972611.439
                + y * (15704.48260
                + y * (-30.16036606))))));
            ans2 = 144725228442.0
                + y * (2300535178.0
                + y * (18583304.74
                + y * (99447.43394
                + y * (376.9991397
                + y))));
            return ans1 / ans2;
        }

        const z = 8.0 / ax;
        y = z * z;
        const xx = ax - 2.356194491;
        ans1 = 1.0
            + y * (0.183105e-2
            + y * (-0.3516396496e-4
            + y * (0.2457520174e-5
            + y * (-0.240337019e-6))));
        ans2 = 0.04687499995
            + y * (-0.2002690873e-3
            + y * (0.8449199096e-5
            + y * (-0.88228987e-6
            + y * 0.105787412e-6)));
        ans = Math.sqrt(0.636619772 / ax)
            * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
        return x < 0.0 ? -ans : ans;
    }

    function besselJInteger(n, x) {
        const orden = Math.trunc(n);
        if (orden < 0) {
            const positivo = besselJInteger(-orden, x);
            return ((-orden) % 2 === 0) ? positivo : -positivo;
        }

        const ax = Math.abs(x);

        // En el intervalo que usa con mayor frecuencia el simulador, la serie
        // de potencias converge con precisión cercana a doble precisión y se
        // aproxima más a scipy.special.jv que las fórmulas racionales.
        if (ax <= 12.0) {
            if (ax === 0.0) return orden === 0 ? 1.0 : 0.0;

            let factorial = 1.0;
            for (let i = 2; i <= orden; i += 1) factorial *= i;

            let term = Math.pow(ax / 2.0, orden) / factorial;
            let suma = term;
            const factor = -(ax * ax / 4.0);

            for (let k = 0; k < 1000; k += 1) {
                term *= factor / ((k + 1.0) * (orden + k + 1.0));
                const nuevaSuma = suma + term;
                suma = nuevaSuma;
                if (Math.abs(term) <= 1e-16 * Math.max(1.0, Math.abs(suma))) break;
            }

            if (x < 0.0 && (orden % 2) === 1) suma = -suma;
            return suma;
        }

        if (orden === 0) return besselJ0(x);
        if (orden === 1) return besselJ1(x);
        if (x === 0.0) return 0.0;

        const tox = 2.0 / ax;
        let ans;

        if (ax > orden) {
            let bjm = besselJ0(ax);
            let bj = besselJ1(ax);
            for (let j = 1; j < orden; j += 1) {
                const bjp = j * tox * bj - bjm;
                bjm = bj;
                bj = bjp;
            }
            ans = bj;
        } else {
            const ACC = 40.0;
            const BIGNO = 1.0e10;
            const BIGNI = 1.0e-10;
            const raiz = Math.floor(Math.sqrt(ACC * orden));
            const m = 2 * Math.floor((orden + raiz) / 2);
            let jsum = false;
            let bjp = 0.0;
            let sum = 0.0;
            let bj = 1.0;
            ans = 0.0;

            for (let j = m; j > 0; j -= 1) {
                let bjm = j * tox * bj - bjp;
                bjp = bj;
                bj = bjm;

                if (Math.abs(bj) > BIGNO) {
                    bj *= BIGNI;
                    bjp *= BIGNI;
                    ans *= BIGNI;
                    sum *= BIGNI;
                }

                if (jsum) sum += bj;
                jsum = !jsum;
                if (j === orden) ans = bjp;
            }

            sum = 2.0 * sum - bj;
            ans /= sum;
        }

        if (x < 0.0 && (orden % 2) === 1) ans = -ans;
        return ans;
    }

    global.SpecialFunctions = Object.freeze({
        besselJInteger
    });
})(window);
