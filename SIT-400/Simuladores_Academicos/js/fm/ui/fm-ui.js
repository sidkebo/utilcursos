    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    const contenidos =
        document.querySelectorAll(
            ".contenido-tab"
        );

    const seccionesParametros =
        document.querySelectorAll(
            ".seccion-parametros"
        );

    const datos = {
        base: null,
        espectro: null,
        generacionGlobal: null,
        vco: null,
        demod: null,
        ruido: null
    };

    const fuenteGlobal = {
        audioBuffer: null,
        audioElemento: new Audio(),
        audioUrl: null,
        archivoNombre: "",
        contextoAudio: null,
        temporizador: null,
        ultimoRedibujado: 0,
        ultimoFft: 0
    };

    fuenteGlobal.audioElemento.preload = "auto";

    function nombreFuente(valor = document.getElementById("fuenteModulante").value) {
        const nombres = {
            senoidal: "Senoidal",
            triangular: "Triangular",
            cuadrada: "Cuadrada",
            compuesta: "Señal compuesta",
            variable: "Señal variable",
            sensor: "Sensor simulado",
            audio: "Archivo de audio"
        };
        return nombres[valor] || valor;
    }

    function fuenteUsaFm(valor = document.getElementById("fuenteModulante").value) {
        return ["senoidal", "triangular", "cuadrada", "compuesta"].includes(valor);
    }

    function fuenteTieneFmUnica(valor = document.getElementById("fuenteModulante").value) {
        return valor === "senoidal";
    }

    function actualizarUiFuente() {
        const fuente = document.getElementById("fuenteModulante").value;
        document.getElementById("grupoArchivoAudio").classList.toggle("oculto", fuente !== "audio");
        document.querySelectorAll(".control-audio-global").forEach(control => {
            control.classList.toggle("oculto", fuente !== "audio");
        });
        document.getElementById("grupoFmBase").classList.toggle("oculto", !fuenteUsaFm(fuente));
        document.getElementById("notaFuenteCompleja").style.display = fuenteTieneFmUnica(fuente) ? "none" : "block";
    }

    function gaussNoUsado() {
        let u = 0;
        let v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function triangularNorm(t, fm) {
        return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * fm * t));
    }

    function cuadradaNorm(t, fm) {
        const s = Math.sin(2 * Math.PI * fm * t);
        return s >= 0 ? 1 : -1;
    }

    function compuestaNorm(t, fm) {
        const v = 0.58 * Math.cos(2 * Math.PI * fm * t)
            + 0.28 * Math.sin(2 * Math.PI * 2.2 * fm * t + 0.55)
            + 0.14 * Math.sin(2 * Math.PI * 3.7 * fm * t + 1.15);
        return Math.max(-1, Math.min(1, v));
    }

    function variableNorm(t) {
        const v = 0.52 * Math.sin(2 * Math.PI * 0.72 * t)
            + 0.30 * Math.sin(2 * Math.PI * 1.63 * t + 0.8)
            + 0.18 * Math.sin(2 * Math.PI * 3.1 * t + 1.7);
        return Math.max(-1, Math.min(1, v));
    }

    function sensorNorm(t) {
        const v = 0.68 * Math.sin(2 * Math.PI * 0.22 * t)
            + 0.20 * Math.sin(2 * Math.PI * 0.51 * t + 0.7)
            + 0.12 * Math.sin(2 * Math.PI * 0.09 * t + 2.0);
        return Math.max(-1, Math.min(1, v));
    }

    function muestraAudioNorm(tAbs) {
        const buffer = fuenteGlobal.audioBuffer;
        if (!buffer || buffer.length === 0) return 0;
        if (tAbs < 0 || tAbs >= buffer.duration) return 0;
        const pos = tAbs * buffer.sampleRate;
        const i0 = Math.max(0, Math.min(buffer.length - 1, Math.floor(pos)));
        const i1 = Math.max(0, Math.min(buffer.length - 1, i0 + 1));
        const frac = pos - i0;
        let suma = 0;
        const canales = Math.min(buffer.numberOfChannels, 2);
        for (let c = 0; c < canales; c++) {
            const datosCanal = buffer.getChannelData(c);
            suma += datosCanal[i0] * (1 - frac) + datosCanal[i1] * frac;
        }
        return Math.max(-1, Math.min(1, suma / Math.max(1, canales)));
    }

    function valorFuenteNorm(fuente, tRel, tAbs, fm) {
        switch (fuente) {
            case "senoidal": return Math.cos(2 * Math.PI * fm * tRel);
            case "triangular": return triangularNorm(tRel, fm);
            case "cuadrada": return cuadradaNorm(tRel, fm);
            case "compuesta": return compuestaNorm(tRel, fm);
            case "variable": return variableNorm(tAbs);
            case "sensor": return sensorNorm(tAbs);
            case "audio": return muestraAudioNorm(tAbs);
            default: return 0;
        }
    }

    function segundosTexto(segundos) {
        if (!Number.isFinite(segundos)) return "0:00";
        const s = Math.max(0, Math.floor(segundos));
        const min = Math.floor(s / 60);
        const rest = String(s % 60).padStart(2, "0");
        return `${min}:${rest}`;
    }

    function actualizarEstadoAudio() {
        const el = fuenteGlobal.audioElemento;
        const estados = document.querySelectorAll(".audio-estado-global");
        const progresos = document.querySelectorAll(".audio-progreso-global");

        if (!fuenteGlobal.audioBuffer) {
            estados.forEach(estado => {
                estado.textContent = "Cargue un archivo de audio.";
            });
            progresos.forEach(progreso => {
                progreso.max = 1;
                progreso.value = 0;
            });
            return;
        }

        const duracion = Math.max(0.01, fuenteGlobal.audioBuffer.duration);
        const posicion = Math.min(fuenteGlobal.audioBuffer.duration, el.currentTime || 0);
        const modo = el.ended ? "Finalizado" : (el.paused ? "Pausado" : "Reproduciendo");
        const texto = `${fuenteGlobal.archivoNombre} — ${segundosTexto(posicion)} / ${segundosTexto(fuenteGlobal.audioBuffer.duration)} — ${modo}`;

        estados.forEach(estado => {
            estado.textContent = texto;
        });

        progresos.forEach(progreso => {
            progreso.max = duracion;
            progreso.value = posicion;
        });
    }

    async function cargarAudioGlobal(archivo) {
        if (!archivo) return;
        try {
            setEstado("Cargando archivo de audio...");
            if (!fuenteGlobal.contextoAudio) {
                fuenteGlobal.contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
            }
            const bytes = await archivo.arrayBuffer();
            const buffer = await fuenteGlobal.contextoAudio.decodeAudioData(bytes.slice(0));
            if (fuenteGlobal.audioUrl) URL.revokeObjectURL(fuenteGlobal.audioUrl);
            fuenteGlobal.audioUrl = URL.createObjectURL(archivo);
            fuenteGlobal.audioElemento.src = fuenteGlobal.audioUrl;
            fuenteGlobal.audioElemento.currentTime = 0;
            fuenteGlobal.audioBuffer = buffer;
            fuenteGlobal.archivoNombre = archivo.name;
            document.getElementById("audioArchivoInfo").textContent = `${archivo.name} — ${segundosTexto(buffer.duration)} — ${Math.round(buffer.sampleRate)} Hz`;
            actualizarUiFuente();
            actualizarEstadoAudio();
            limpiarErroresVisuales();
            await simularBase();
            actualizarModoEspectro();
            await simularEspectroComplejo(false);
            actualizarGeneracionGlobal();
            await simularDemod(false);
            await simularRuido(false);
            setEstado("Archivo de audio cargado como señal modulante global.");
        } catch (error) {
            fuenteGlobal.audioBuffer = null;
            fuenteGlobal.archivoNombre = "";
            document.getElementById("audioArchivoInfo").textContent = "No se pudo decodificar el archivo.";
            marcarCampoError("archivoAudio", "No se pudo leer este archivo de audio.", true);
            setEstado(`ERROR DE AUDIO\n${error.message}`, true);
        }
    }

    function tiempoInicioFuente(fuente) {
        if (fuente === "audio") return fuenteGlobal.audioElemento.currentTime || 0;
        if (fuente === "variable" || fuente === "sensor") return performance.now() / 1000;
        return 0;
    }

    function construirBaseGlobal(ventanaId = "ventanaTiempo") {
        const fuente = document.getElementById("fuenteModulante").value;
        const Ac = numero("Ac");
        const fc = numero("fc");
        const fm = numero("fm");
        const Am = numero("Am");
        const deltaF = numero("delta_f");
        const deltaPhi = numero("delta_phi");
        const selectorVentana = document.getElementById(ventanaId);
        const ventanaMs = Number(selectorVentana ? selectorVentana.value : document.getElementById("ventanaTiempo").value);
        const duracion = ventanaMs / 1000;
        const n = 3000;
        const dt = duracion / Math.max(1, n - 1);
        const inicio = tiempoInicioFuente(fuente);
        const t = new Array(n);
        const modulante = new Array(n);
        const portadora = new Array(n);
        const senalFm = new Array(n);
        const senalPm = new Array(n);
        const fi = new Array(n);
        const xnorm = new Array(n);
        let faseFm = 0;
        for (let i = 0; i < n; i++) {
            const tr = i * dt;
            const ta = inicio + tr;
            const x = valorFuenteNorm(fuente, tr, ta, fm);
            xnorm[i] = x;
            t[i] = ta;
            modulante[i] = Am * x;
            portadora[i] = Ac * Math.cos(2 * Math.PI * fc * tr);
            fi[i] = fc + deltaF * x;
            if (i === 0) {
                faseFm = 0;
            } else {
                const fProm = 0.5 * (fi[i - 1] + fi[i]);
                faseFm += 2 * Math.PI * fProm * dt;
            }
            senalFm[i] = Ac * Math.cos(faseFm);
            senalPm[i] = Ac * Math.cos(2 * Math.PI * fc * tr + deltaPhi * x);
        }
        const beta = fm > 0 ? deltaF / fm : NaN;
        return {
            fuente,
            fuente_nombre: nombreFuente(fuente),
            ventana_ms: ventanaMs,
            t,
            modulante,
            portadora,
            senal_fm: senalFm,
            senal_pm: senalPm,
            frecuencia_instantanea: fi,
            Ac, fc, fm, Am,
            delta_f: deltaF,
            delta_phi: deltaPhi,
            f_min: fc - deltaF,
            f_max: fc + deltaF,
            fi_observada_min: Math.min(...fi),
            fi_observada_max: Math.max(...fi),
            beta,
            mp: deltaPhi,
            kf: deltaF / Am,
            kp: deltaPhi / Am
        };
    }

    function actualizarGraficasBaseGlobal(data) {
        dibujarSerie("grafModulante", data.t, data.modulante, {unidad:"V"});
        dibujarSerie("grafPortadora", data.t, data.portadora, {unidad:"V"});
        dibujarSerie("grafFM", data.t, data.senal_fm, {unidad:"V"});
        dibujarSerie("grafFi", data.t, data.frecuencia_instantanea, {unidad:"Hz", color:"#d32f2f"});
        dibujarSerie("grafPM", data.t, data.senal_pm, {unidad:"V"});
        document.getElementById("ventanaTiempoInfo").textContent = `${fmt(data.ventana_ms, 0)} ms`;
        document.getElementById("calcRango").textContent = `f_min = ${fmt(data.fc)} - ${fmt(data.delta_f)} = ${fmt(data.f_min)} Hz; f_max = ${fmt(data.fc)} + ${fmt(data.delta_f)} = ${fmt(data.f_max)} Hz.`;
        document.getElementById("calcBeta").textContent = fuenteTieneFmUnica(data.fuente)
            ? `beta = ${fmt(data.delta_f)} / ${fmt(data.fm)} = ${fmt(data.beta)}.`
            : "No se asigna un único beta a esta fuente, porque no está representada por una sola senoidal de frecuencia f_m.";
        document.getElementById("calcKf").textContent = `kf = ${fmt(data.delta_f)} / ${fmt(data.Am)} = ${fmt(data.kf)} Hz/V.`;
        document.getElementById("calcPm").textContent = `mp = ${fmt(data.mp)}; kp = ${fmt(data.delta_phi)} / ${fmt(data.Am)} = ${fmt(data.kp)} rad/V.`;
    }

    function siguientePotencia2(n) {
        let p = 1;
        while (p < n) p <<= 1;
        return p;
    }

    function fftCompleja(re, im) {
        const n = re.length;
        let j = 0;
        for (let i = 1; i < n; i++) {
            let bit = n >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) {
                [re[i], re[j]] = [re[j], re[i]];
                [im[i], im[j]] = [im[j], im[i]];
            }
        }
        for (let len = 2; len <= n; len <<= 1) {
            const ang = -2 * Math.PI / len;
            const wlenRe = Math.cos(ang);
            const wlenIm = Math.sin(ang);
            for (let i = 0; i < n; i += len) {
                let wr = 1;
                let wi = 0;
                for (let k = 0; k < len / 2; k++) {
                    const uRe = re[i + k];
                    const uIm = im[i + k];
                    const vRe = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
                    const vIm = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
                    re[i + k] = uRe + vRe;
                    im[i + k] = uIm + vIm;
                    re[i + k + len / 2] = uRe - vRe;
                    im[i + k + len / 2] = uIm - vIm;
                    const nwr = wr * wlenRe - wi * wlenIm;
                    wi = wr * wlenIm + wi * wlenRe;
                    wr = nwr;
                }
            }
        }
    }

    function calcularFftRelativa(muestras, fs) {
        const nRaw = muestras.length;
        const nfft = siguientePotencia2(Math.max(8, nRaw));
        const re = new Array(nfft).fill(0);
        const im = new Array(nfft).fill(0);
        let sumaVentana = 0;
        for (let i = 0; i < nRaw; i++) {
            const w = nRaw > 1 ? 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (nRaw - 1)) : 1;
            sumaVentana += w;
            re[i] = muestras[i] * w;
        }
        fftCompleja(re, im);
        const bins = Math.floor(nfft / 2) + 1;
        const f = new Array(bins);
        const mag = new Array(bins);
        let maxMag = 1e-15;
        for (let k = 0; k < bins; k++) {
            const m = Math.hypot(re[k], im[k]) / Math.max(1e-15, sumaVentana);
            f[k] = k * fs / nfft;
            mag[k] = m;
            if (m > maxMag) maxMag = m;
        }
        const db = mag.map(v => 20 * Math.log10(Math.max(1e-15, v) / maxMag));
        return {f, db, mag, nfft, nRaw, fs, bin: fs / nfft};
    }

    function analizarContenidoSignificativo(fft, umbralDb = -35, ignorarDc = true) {
        let fMax = 0;
        let fMin = Infinity;
        let picoIdx = 0;
        let picoDb = -Infinity;
        for (let i = ignorarDc ? 1 : 0; i < fft.db.length; i++) {
            if (fft.db[i] > picoDb) {
                picoDb = fft.db[i];
                picoIdx = i;
            }
            if (fft.db[i] >= umbralDb) {
                fMax = fft.f[i];
                if (fft.f[i] < fMin) fMin = fft.f[i];
            }
        }
        if (!Number.isFinite(fMin)) fMin = 0;
        return {fMin, fMax, picoF: fft.f[picoIdx], picoDb, umbralDb};
    }

    function dibujarFft(canvasId, fft, opciones = {}) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        const mi = 58, md = 16, ms = 14, mb = 28;
        const gw = w - mi - md, gh = h - ms - mb;
        const maxFData = fft.f[fft.f.length - 1] || 1;
        const fMin = Math.max(0, opciones.fMin ?? 0);
        const fMax = Math.max(fMin + 1e-9, Math.min(maxFData, opciones.fMax ?? maxFData));
        const dbMin = opciones.dbMin ?? -80;
        const dbMax = 0;
        const px = f => mi + (f - fMin) / (fMax - fMin) * gw;
        const py = d => ms + (dbMax - d) / (dbMax - dbMin) * gh;
        ctx.strokeStyle = "#d9dde2";
        ctx.lineWidth = 1;
        ctx.font = "10px Arial";
        ctx.fillStyle = "#555";
        for (let d = dbMin; d <= 0; d += 20) {
            const y = py(d);
            ctx.beginPath(); ctx.moveTo(mi, y); ctx.lineTo(w - md, y); ctx.stroke();
            ctx.fillText(`${d} dB`, 5, y + 3);
        }
        for (let g = 0; g <= 4; g++) {
            const f = fMin + (fMax - fMin) * g / 4;
            const x = px(f);
            ctx.beginPath(); ctx.moveTo(x, ms); ctx.lineTo(x, h - mb); ctx.stroke();
            const txt = f >= 1000 ? `${(f/1000).toFixed(2)} kHz` : `${f.toFixed(0)} Hz`;
            ctx.fillText(txt, Math.max(mi, Math.min(w-md-ctx.measureText(txt).width, x-ctx.measureText(txt).width/2)), h-7);
        }
        ctx.strokeStyle = opciones.color || "#0b73d1";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        let started = false;
        const paso = Math.max(1, Math.floor(fft.f.length / 6000));
        for (let i = 0; i < fft.f.length; i += paso) {
            const f = fft.f[i];
            if (f < fMin || f > fMax) continue;
            const d = Math.max(dbMin, Math.min(dbMax, fft.db[i]));
            const x = px(f), y = py(d);
            if (!started) {ctx.moveTo(x,y); started=true;} else ctx.lineTo(x,y);
        }
        ctx.stroke();
        if (Number.isFinite(opciones.markerF) && opciones.markerF >= fMin && opciones.markerF <= fMax) {
            const x = px(opciones.markerF);
            ctx.strokeStyle = "#c62828";
            ctx.setLineDash([5,4]);
            ctx.beginPath(); ctx.moveTo(x, ms); ctx.lineTo(x, h-mb); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#c62828";
            ctx.fillText(`fc ${(opciones.markerF/1000).toFixed(3)} kHz`, Math.min(w-150,x+5), ms+12);
        }
    }

    function construirMuestrasEspectroGlobal() {
        const fuente = document.getElementById("fuenteModulante").value;
        const fc = numero("fc");
        const deltaF = numero("delta_f");
        const fm = numero("fm");
        const Ac = numero("Ac");
        const ventanaMs = Number(document.getElementById("ventanaFFT").value);
        const T = ventanaMs / 1000;
        let fs = fuente === "audio" && fuenteGlobal.audioBuffer
            ? fuenteGlobal.audioBuffer.sampleRate
            : Math.max(48000, 12 * (fc + deltaF), fuenteUsaFm(fuente) ? 40 * fm : 48000);
        fs = Math.min(384000, Math.max(8000, fs));
        let nRaw = Math.max(64, Math.round(fs * T));
        if (nRaw > 65536) nRaw = 65536;
        const duracionReal = nRaw / fs;
        const inicio = tiempoInicioFuente(fuente);
        const mod = new Array(nRaw);
        const fmSig = new Array(nRaw);
        let fase = 0;
        let xPrev = 0;
        for (let i = 0; i < nRaw; i++) {
            const tr = i / fs;
            const ta = inicio + tr;
            const x = valorFuenteNorm(fuente, tr, ta, fm);
            mod[i] = x;
            const fi = fc + deltaF * x;
            if (i > 0) {
                const fiPrev = fc + deltaF * xPrev;
                fase += 2 * Math.PI * 0.5 * (fiPrev + fi) / fs;
            }
            fmSig[i] = Ac * Math.cos(fase);
            xPrev = x;
        }
        return {fuente, fc, deltaF, fm, Ac, ventanaMs, duracionReal, fs, nRaw, mod, fmSig};
    }

    function metaHtml(items) {
        return items.map(([a,b]) => `<div><span>${a}</span><strong>${b}</strong></div>`).join("");
    }

    async function simularEspectroComplejo(actualizarEstado = true) {
        const errores = validarBaseCampos();
        const fuente = document.getElementById("fuenteModulante").value;
        if (fuente === "audio" && !fuenteGlobal.audioBuffer) {
            errores.push(crearError(["fuenteModulante","archivoAudio"], "archivoAudio", "Seleccione primero un archivo de audio válido."));
        }
        if (errores.length) {
            mostrarErrores(errores);
            limpiarCanvas("grafFftModulante", "Parámetros inválidos");
            limpiarCanvas("grafFftFm", "Parámetros inválidos");
            return false;
        }
        try {
            const b = construirMuestrasEspectroGlobal();
            const fftMod = calcularFftRelativa(b.mod, b.fs);
            const fftFm = calcularFftRelativa(b.fmSig, b.fs);
            const sigMod = analizarContenidoSignificativo(fftMod, -35, true);
            const sigFm = analizarContenidoSignificativo(fftFm, -40, false);
            const fMaxMod = Math.max(1000, Math.min(b.fs/2, Math.max(sigMod.fMax*1.15, fuenteUsaFm(fuente) ? 5*b.fm : sigMod.fMax*1.15)));
            const spanFm = Math.max(2*(b.deltaF + Math.max(sigMod.fMax,1)), 0.25*b.fc, 1000);
            const fMinFm = Math.max(0, b.fc - spanFm/2);
            const fMaxFm = Math.min(b.fs/2, b.fc + spanFm/2);
            dibujarFft("grafFftModulante", fftMod, {fMin:0, fMax:fMaxMod, dbMin:-80});
            dibujarFft("grafFftFm", fftFm, {fMin:fMinFm, fMax:fMaxFm, dbMin:-80, markerF:b.fc});
            const deltaVentana = 1 / Math.max(1e-12, b.duracionReal);
            const rbw = 1.5 * deltaVentana;
            const bwCarsonCompleja = 2 * (b.deltaF + sigMod.fMax);
            const escalaSolapada = sigMod.fMax >= b.fc;
            const advertenciaEscala = document.getElementById("advertenciaEscalaEspectro");
            if (advertenciaEscala) {
                if (escalaSolapada) {
                    advertenciaEscala.style.display = "block";
                    advertenciaEscala.innerHTML = `<strong>Advertencia de escala didáctica:</strong> la frecuencia portadora fc (${b.fc.toFixed(1)} Hz) es menor o igual que la frecuencia máxima significativa estimada de la modulante (${sigMod.fMax.toFixed(1)} Hz). La FFT sigue siendo útil para observar el fenómeno, pero el espectro alrededor de fc presenta solapamiento y no representa una transmisión RF convencional. Para una representación espectral más clara, utilice una fc mayor que el contenido significativo de la modulante.`;
                } else {
                    advertenciaEscala.style.display = "none";
                    advertenciaEscala.textContent = "";
                }
            }
            document.getElementById("metaFftModulante").innerHTML = metaHtml([
                ["Fuente", nombreFuente(fuente)],
                ["Ventana", `${(b.duracionReal*1000).toFixed(1)} ms`],
                ["Muestras", `${b.nRaw}`],
                ["FFT", `${fftMod.nfft} pts`],
                ["BIN FFT", `${fftMod.bin.toFixed(2)} Hz`],
                ["Δf ventana", `${deltaVentana.toFixed(2)} Hz`],
                ["RBW Hann aprox.", `${rbw.toFixed(2)} Hz`],
                ["Contenido significativo", `hasta ≈ ${sigMod.fMax >= 1000 ? (sigMod.fMax/1000).toFixed(2)+" kHz" : sigMod.fMax.toFixed(1)+" Hz"}`]
            ]);
            document.getElementById("metaFftFm").innerHTML = metaHtml([
                ["fc", `${b.fc.toFixed(2)} Hz`],
                ["delta_f", `${b.deltaF.toFixed(2)} Hz`],
                ["f_m_max estimada", `${sigMod.fMax.toFixed(2)} Hz`],
                ["Ancho práctico por Carson", `${bwCarsonCompleja.toFixed(2)} Hz`],
                ["Contenido detectado por FFT en la zona de fc", `${sigFm.fMin.toFixed(1)} a ${sigFm.fMax.toFixed(1)} Hz`],
                ["Umbral modulante", `35 dB bajo el pico`],
                ["Umbral FM", `40 dB bajo el pico`],
                ["Escala", `dB relativos`]
            ]);
            datos.espectro = {
                tipo:"fft",
                fuente,
                fuente_nombre:nombreFuente(fuente),
                fm_max_sig:sigMod.fMax,
                bw_carson:bwCarsonCompleja,
                ventana_ms:b.duracionReal*1000,
                bin_fft:fftMod.bin,
                rbw,
                fc:b.fc,
                delta_f:b.deltaF,
                contenido_fm_min:sigFm.fMin,
                contenido_fm_max:sigFm.fMax,
                escala_solapada:escalaSolapada
            };
            if (document.querySelector(".tab.activo")?.dataset.tab === "espectro") actualizarResultados("espectro");
            if (actualizarEstado) setEstado("FFT de la fuente compleja y de la señal FM actualizada.");
            return true;
        } catch (error) {
            setEstado(`ERROR DE FFT\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
            return false;
        }
    }

    function actualizarGeneracionGlobal() {
        const fuente = document.getElementById("fuenteModulante").value;
        if (fuente === "audio" && !fuenteGlobal.audioBuffer) return;
        const d = construirBaseGlobal("ventanaGeneracion");
        datos.generacionGlobal = d;
        document.getElementById("ventanaGeneracionInfo").textContent = `${fmt(d.ventana_ms, 0)} ms`;
        document.getElementById("generacionGlobalTexto").textContent = `Fuente global: ${d.fuente_nombre}. La desviación instantánea sigue x_m(t) y la amplitud ideal de FM permanece constante.`;
        dibujarSerie("grafGenGlobalMod", d.t, d.modulante, {unidad:"V"});
        dibujarSerie("grafGenGlobalFi", d.t, d.frecuencia_instantanea, {unidad:"Hz", color:"#d32f2f"});
        dibujarSerie("grafGenGlobalFm", d.t, d.senal_fm, {unidad:"V"});
    }

    function construirSeriesVcoVentana(data) {
        const ventanaMs = Number(document.getElementById("ventanaGeneracion").value);
        const T = ventanaMs / 1000;
        const n = 3000;
        const dt = T / Math.max(1, n - 1);
        const t = new Array(n);
        const vControl = new Array(n);
        const fi = new Array(n);
        const fmSig = new Array(n);
        const beta = data.fm > 0 ? data.delta_f / data.fm : 0;
        for (let i = 0; i < n; i++) {
            const tr = i * dt;
            const angM = 2 * Math.PI * data.fm * tr;
            t[i] = tr;
            vControl[i] = data.Vbias + data.Vm * Math.cos(angM);
            fi[i] = data.fc + data.delta_f * Math.cos(angM);
            fmSig[i] = data.Ac * Math.cos(2 * Math.PI * data.fc * tr + beta * Math.sin(angM));
        }
        return {ventana_ms: ventanaMs, t, v_control: vControl, frecuencia_instantanea: fi, senal_fm: fmSig};
    }

    function redibujarVcoConVentana() {
        if (!datos.vco) return;
        const vis = construirSeriesVcoVentana(datos.vco);
        datos.vco.ventana_ms = vis.ventana_ms;
        document.getElementById("ventanaGeneracionInfo").textContent = `${fmt(vis.ventana_ms, 0)} ms`;
        dibujarSerie("grafVcontrol", vis.t, vis.v_control, {unidad:"V"});
        dibujarSerie("grafFiVco", vis.t, vis.frecuencia_instantanea, {unidad:"Hz"});
        dibujarSerie("grafVcoFm", vis.t, vis.senal_fm, {unidad:"V"});
    }

    function construirDemodGlobal() {
        const base = construirBaseGlobal("ventanaDemodFm");
        const Kd = numero("demod_Kd");
        const Kvco = numero("demod_Kvco");
        const Vdc = numero("demod_Vdc");
        const detector = base.frecuencia_instantanea.map(f => Kd * ((f - base.fc) / 1000));
        const control = base.frecuencia_instantanea.map(f => Vdc + (f - base.fc) / Kvco);
        return {
            ...base,
            Kd_v_por_khz:Kd,
            Kvco,
            Vdc,
            salida_detector:detector,
            tension_control:control,
            salida_detector_pico:Math.max(...detector.map(Math.abs)),
            delta_v_control:base.delta_f / Kvco
        };
    }

    function gauss() {
        let u=0,v=0;
        while (u===0) u=Math.random();
        while (v===0) v=Math.random();
        return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
    }

    function construirRuidoGlobal() {
        const fuente = document.getElementById("fuenteModulante").value;
        const Ac = numero("Ac");
        const fc = numero("fc");
        const fm = numero("fm");
        const deltaF = numero("delta_f");
        const ruidoAmp = numero("ruido_amp");
        const ruidoFase = numero("ruido_fase");
        const ventanaMs = Number(document.getElementById("ventanaRuidoFm").value);
        const T = ventanaMs/1000;
        const n=3000;
        const dt=T/(n-1);
        const inicio=tiempoInicioFuente(fuente);
        const t=new Array(n), limpia=new Array(n), ruidoA=new Array(n), limitada=new Array(n), ruidoP=new Array(n);
        let fase=0, xPrev=0, sumS=0, sumN=0;
        const tanh3=Math.tanh(3);
        for(let i=0;i<n;i++){
            const tr=i*dt, ta=inicio+tr;
            const x=valorFuenteNorm(fuente,tr,ta,fm);
            const fi=fc+deltaF*x;
            if(i>0){ const fiPrev=fc+deltaF*xPrev; fase += 2*Math.PI*0.5*(fiPrev+fi)*dt; }
            const sl=Ac*Math.cos(fase);
            const na=gauss()*ruidoAmp*Ac;
            const sa=sl+na;
            const sp=Ac*Math.cos(fase + gauss()*ruidoFase);
            limpia[i]=sl;
            ruidoA[i]=sa;
            limitada[i]=Ac*Math.tanh(3*sa/Math.max(Ac,1e-12))/tanh3;
            ruidoP[i]=sp;
            t[i]=ta;
            sumS+=sl*sl;
            sumN+=na*na;
            xPrev=x;
        }
        const rmsS=Math.sqrt(sumS/n), rmsN=Math.sqrt(sumN/n);
        return {fuente,fuente_nombre:nombreFuente(fuente),Ac,fc,fm,delta_f:deltaF,ruido_amplitud:ruidoAmp,ruido_fase:ruidoFase,ventana_ms:ventanaMs,t,senal_limpia:limpia,senal_ruido_amplitud:ruidoA,senal_limitada:limitada,senal_ruido_fase:ruidoP,rms_senal:rmsS,rms_ruido_amplitud:rmsN,snr_db:rmsN>0?20*Math.log10(rmsS/rmsN):Infinity};
    }

    function actualizarModoEspectro() {
        const complejo = !fuenteTieneFmUnica();
        document.getElementById("espectroComplejo").classList.toggle("oculto", !complejo);
        document.getElementById("espectroSenoidal").classList.toggle("oculto", complejo);
        document.getElementById("textoModoEspectro").textContent = complejo
            ? `Fuente ${nombreFuente()}: se usa FFT y, para una estimación de Carson, f_m_max significativa en lugar de una única f_m.`
            : "Con modulante senoidal se conserva el análisis analítico con beta, Bessel y Carson.";
    }

    function actualizarAvisoAudioRuido() {
        document.getElementById("avisoAudioRuidoFm").classList.toggle("oculto", document.getElementById("fuenteModulante").value !== "audio");
    }

    function iniciarActualizacionDinamica() {
        if (fuenteGlobal.temporizador) return;
        fuenteGlobal.temporizador = setInterval(() => {
            const fuente = document.getElementById("fuenteModulante").value;
            const tab = document.querySelector(".tab.activo")?.dataset.tab;
            actualizarEstadoAudio();
            const dinamica = (fuente === "audio" && !fuenteGlobal.audioElemento.paused) || fuente === "variable" || fuente === "sensor";
            if (!dinamica) return;
            const ahora = performance.now();
            if (tab === "espectro") {
                if (fuenteTieneFmUnica()) return;
                if (ahora - fuenteGlobal.ultimoFft < 900) return;
                fuenteGlobal.ultimoFft = ahora;
                simularEspectroComplejo(false);
                return;
            }
            if (ahora - fuenteGlobal.ultimoRedibujado < 140) return;
            fuenteGlobal.ultimoRedibujado = ahora;
            if (tab === "tiempo") simularBaseGlobal(false);
            else if (tab === "generacion") { actualizarGeneracionGlobal(); }
            else if (tab === "demodulacion") simularDemod(false);
            else if (tab === "ruido") simularRuido(false);
        }, 80);
    }


    function numero(id) {

        const campo =
            document.getElementById(
                id
            );

        const texto =
            campo.value.trim();

        if (
            texto === ""
        ) {

            return NaN;
        }

        return Number(
            texto
        );
    }


    function fmt(
        valor,
        decimales = 3
    ) {

        return Number(
            valor
        ).toFixed(
            decimales
        );
    }


    function setEstado(
        texto,
        error = false
    ) {

        const estado =
            document.getElementById(
                "estado"
            );

        estado.textContent =
            texto;

        estado.classList.toggle(
            "estado-error",
            error
        );
    }


    function limpiarErroresVisuales() {

        document.querySelectorAll(
            ".campo-error"
        ).forEach(
            campo => {

                campo.classList.remove(
                    "campo-error"
                );

                campo.removeAttribute(
                    "aria-invalid"
                );
            }
        );


        document.querySelectorAll(
            ".grupo-error"
        ).forEach(
            grupo => {

                grupo.classList.remove(
                    "grupo-error"
                );
            }
        );


        document.querySelectorAll(
            ".error-campo"
        ).forEach(
            aviso => {

                aviso.remove();
            }
        );
    }


    function marcarCampoError(
        id,
        mensaje,
        mostrarMensaje = true
    ) {

        const campo =
            document.getElementById(
                id
            );

        if (
            !campo
        ) {

            return;
        }


        campo.classList.add(
            "campo-error"
        );

        campo.setAttribute(
            "aria-invalid",
            "true"
        );


        const grupo =
            campo.closest(
                ".grupo"
            );


        if (
            !grupo
        ) {

            return;
        }


        grupo.classList.add(
            "grupo-error"
        );


        if (
            mostrarMensaje
        ) {

            let aviso =
                grupo.querySelector(
                    ".error-campo"
                );


            if (
                !aviso
            ) {

                aviso =
                    document.createElement(
                        "div"
                    );

                aviso.className =
                    "error-campo";

                grupo.appendChild(
                    aviso
                );
            }


            aviso.textContent =
                mensaje;
        }
    }


    function crearError(
        ids,
        principal,
        mensaje
    ) {

        return {
            ids,
            principal,
            mensaje
        };
    }


    function mostrarSinResultados(
        mensaje,
        error = false
    ) {

        document.getElementById(
            "resultadosContenido"
        ).innerHTML = `

            <div
                class="
                    resultado
                    ${error ? "resultado-error" : ""}
                "
            >

                <span>
                    Estado
                </span>

                <strong>
                    ${mensaje}
                </strong>

            </div>
        `;
    }


    function mostrarErrores(
        errores
    ) {

        limpiarErroresVisuales();


        errores.forEach(
            item => {

                item.ids.forEach(
                    id => {

                        marcarCampoError(
                            id,
                            item.mensaje,
                            id === item.principal
                        );
                    }
                );
            }
        );


        const detalle =
            errores
            .map(
                item =>
                    `• ${item.mensaje}`
            )
            .join(
                "\n"
            );


        setEstado(
            `ERROR DE PARÁMETROS\n${detalle}`,
            true
        );


        mostrarSinResultados(
            "Sin resultados: corrija los campos marcados en rojo.",
            true
        );
    }


    function validarNumeroFinito(
        errores,
        id,
        nombre,
        unidad = ""
    ) {

        const v =
            numero(
                id
            );


        if (
            !Number.isFinite(
                v
            )
        ) {

            errores.push(
                crearError(
                    [id],
                    id,
                    `${nombre} está vacío o no contiene un número válido${unidad ? ` (${unidad})` : ""}.`
                )
            );
        }


        return v;
    }


    function validarBaseCampos() {

        const errores = [];


        const Ac =
            validarNumeroFinito(
                errores,
                "Ac",
                "Ac",
                "V"
            );


        const fc =
            validarNumeroFinito(
                errores,
                "fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "fm",
                "fm",
                "Hz"
            );


        const Am =
            validarNumeroFinito(
                errores,
                "Am",
                "Am",
                "V"
            );


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const deltaPhi =
            validarNumeroFinito(
                errores,
                "delta_phi",
                "delta_phi",
                "rad"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                fm
            )
            && fc > 0
            && fm > 0
            && fm >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "fm"
                    ],
                    "fm",
                    `La relación no es válida: fm = ${fm} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Am
            )
            && Am <= 0
        ) {

            errores.push(
                crearError(
                    ["Am"],
                    "Am",
                    `Am = ${Am} V no es válido. Am debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaPhi
            )
            && deltaPhi < 0
        ) {

            errores.push(
                crearError(
                    ["delta_phi"],
                    "delta_phi",
                    `delta_phi = ${deltaPhi} rad no es válido. delta_phi no puede ser negativa.`
                )
            );
        }


        return errores;
    }


    function validarEspectroCampos() {

        const errores = [];


        const Ac =
            validarNumeroFinito(
                errores,
                "Ac",
                "Ac",
                "V"
            );


        const fc =
            validarNumeroFinito(
                errores,
                "fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "fm",
                "fm",
                "Hz"
            );


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const orden =
            validarNumeroFinito(
                errores,
                "ordenEspectro",
                "Pares laterales"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                fm
            )
            && fc > 0
            && fm > 0
            && fm >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "fm"
                    ],
                    "fm",
                    `La relación no es válida: fm = ${fm} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                orden
            )
            && (
                !Number.isInteger(
                    orden
                )
                || orden < 1
                || orden > 20
            )
        ) {

            errores.push(
                crearError(
                    ["ordenEspectro"],
                    "ordenEspectro",
                    `Pares laterales = ${orden} no es válido. Debe ser un número entero entre 1 y 20.`
                )
            );
        }


        return errores;
    }


    function validarVcoCampos() {

        const errores = [];


        const Ac =
            validarNumeroFinito(
                errores,
                "vco_Ac",
                "Ac",
                "V"
            );


        const fc =
            validarNumeroFinito(
                errores,
                "vco_fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "vco_fm",
                "fm",
                "Hz"
            );


        const Kvco =
            validarNumeroFinito(
                errores,
                "vco_K",
                "Kvco",
                "Hz/V"
            );


        const Vm =
            validarNumeroFinito(
                errores,
                "vco_Vm",
                "Vm",
                "V"
            );


        const N =
            validarNumeroFinito(
                errores,
                "vco_N",
                "Multiplicador N"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_Ac"],
                    "vco_Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_fc"],
                    "vco_fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_fm"],
                    "vco_fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kvco
            )
            && Kvco <= 0
        ) {

            errores.push(
                crearError(
                    ["vco_K"],
                    "vco_K",
                    `Kvco = ${Kvco} Hz/V no es válido. Kvco debe ser mayor que 0 Hz/V.`
                )
            );
        }


        if (
            Number.isFinite(
                Vm
            )
            && Vm < 0
        ) {

            errores.push(
                crearError(
                    ["vco_Vm"],
                    "vco_Vm",
                    `Vm = ${Vm} V no es válido. Vm no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                N
            )
            && (
                !Number.isInteger(
                    N
                )
                || N < 1
                || N > 20
            )
        ) {

            errores.push(
                crearError(
                    ["vco_N"],
                    "vco_N",
                    `N = ${N} no es válido. El multiplicador debe ser un entero entre 1 y 20.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                Kvco
            )
            && Number.isFinite(
                Vm
            )
            && fc > 0
            && Kvco > 0
            && Vm >= 0
        ) {

            const deltaF =
                Kvco
                * Vm;


            if (
                deltaF >= fc
            ) {

                errores.push(
                    crearError(
                        [
                            "vco_fc",
                            "vco_K",
                            "vco_Vm"
                        ],
                        "vco_Vm",
                        `La combinación no es válida: delta_f = Kvco x Vm = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                    )
                );
            }
        }


        return errores;
    }


    function validarDemodCampos() {

        const errores = [];


        const fc =
            validarNumeroFinito(
                errores,
                "fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "fm",
                "fm",
                "Hz"
            );


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const Kd =
            validarNumeroFinito(
                errores,
                "demod_Kd",
                "Kd",
                "V/kHz"
            );


        const Kvco =
            validarNumeroFinito(
                errores,
                "demod_Kvco",
                "Kvco",
                "Hz/V"
            );


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kd
            )
            && Kd <= 0
        ) {

            errores.push(
                crearError(
                    ["demod_Kd"],
                    "demod_Kd",
                    `Kd = ${Kd} V/kHz no es válido. Kd debe ser mayor que 0 V/kHz.`
                )
            );
        }


        if (
            Number.isFinite(
                Kvco
            )
            && Kvco <= 0
        ) {

            errores.push(
                crearError(
                    ["demod_Kvco"],
                    "demod_Kvco",
                    `Kvco = ${Kvco} Hz/V no es válido. Kvco debe ser mayor que 0 Hz/V.`
                )
            );
        }


        return errores;
    }


    function validarRuidoCampos() {

        const errores = [];


        const Ac =
            validarNumeroFinito(
                errores,
                "Ac",
                "Ac",
                "V"
            );


        const fc =
            validarNumeroFinito(
                errores,
                "fc",
                "fc",
                "Hz"
            );


        const fm =
            validarNumeroFinito(
                errores,
                "fm",
                "fm",
                "Hz"
            );


        const deltaF =
            validarNumeroFinito(
                errores,
                "delta_f",
                "delta_f",
                "Hz"
            );


        const ruidoAmp =
            validarNumeroFinito(
                errores,
                "ruido_amp",
                "Ruido relativo de amplitud"
            );


        const ruidoFase =
            validarNumeroFinito(
                errores,
                "ruido_fase",
                "Perturbación de fase",
                "rad"
            );


        if (
            Number.isFinite(
                Ac
            )
            && Ac <= 0
        ) {

            errores.push(
                crearError(
                    ["Ac"],
                    "Ac",
                    `Ac = ${Ac} V no es válido. Ac debe ser mayor que 0 V.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && fc <= 0
        ) {

            errores.push(
                crearError(
                    ["fc"],
                    "fc",
                    `fc = ${fc} Hz no es válido. fc debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                fm
            )
            && fm <= 0
        ) {

            errores.push(
                crearError(
                    ["fm"],
                    "fm",
                    `fm = ${fm} Hz no es válido. fm debe ser mayor que 0 Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                deltaF
            )
            && deltaF < 0
        ) {

            errores.push(
                crearError(
                    ["delta_f"],
                    "delta_f",
                    `delta_f = ${deltaF} Hz no es válido. delta_f no puede ser negativa.`
                )
            );
        }


        if (
            Number.isFinite(
                fc
            )
            && Number.isFinite(
                deltaF
            )
            && fc > 0
            && deltaF >= 0
            && deltaF >= fc
        ) {

            errores.push(
                crearError(
                    [
                        "fc",
                        "delta_f"
                    ],
                    "delta_f",
                    `La relación no es válida: delta_f = ${deltaF} Hz debe ser menor que fc = ${fc} Hz.`
                )
            );
        }


        if (
            Number.isFinite(
                ruidoAmp
            )
            && ruidoAmp < 0
        ) {

            errores.push(
                crearError(
                    ["ruido_amp"],
                    "ruido_amp",
                    `Ruido relativo de amplitud = ${ruidoAmp} no es válido. No puede ser negativo.`
                )
            );
        }


        if (
            Number.isFinite(
                ruidoFase
            )
            && ruidoFase < 0
        ) {

            errores.push(
                crearError(
                    ["ruido_fase"],
                    "ruido_fase",
                    `Perturbación de fase = ${ruidoFase} rad no es válida. No puede ser negativa.`
                )
            );
        }


        return errores;
    }


    function limpiarCanvas(
        canvasId,
        mensaje = "Sin datos"
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#777";


        ctx.font =
            "13px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            mensaje,
            canvas.width / 2,
            canvas.height / 2
        );


        ctx.textAlign =
            "start";


        ctx.textBaseline =
            "alphabetic";
    }


    function limpiarBase() {

        datos.base =
            null;


        [
            "grafModulante",
            "grafPortadora",
            "grafFM",
            "grafFi",
            "grafPM"
        ].forEach(
            id => {

                limpiarCanvas(
                    id,
                    "Parámetros inválidos"
                );
            }
        );


        document.getElementById(
            "calcRango"
        ).textContent =
            "—";


        document.getElementById(
            "calcBeta"
        ).textContent =
            "—";


        document.getElementById(
            "calcKf"
        ).textContent =
            "—";


        document.getElementById(
            "calcPm"
        ).textContent =
            "—";
    }


    function limpiarEspectro() {

        datos.espectro =
            null;


        limpiarCanvas(
            "grafEspectro",
            "Espectro no disponible"
        );


        document.getElementById(
            "calcCarson"
        ).textContent =
            "—";


        document.getElementById(
            "tablaEspectro"
        ).innerHTML =
            "";
    }


    function mensajeVista(
        tab
    ) {

        const mensajes = {

            tiempo:
                "Vista TIEMPO. Ajuste los parámetros y pulse ACTUALIZAR FM / PM.",

            calculos:
                "Vista CÁLCULOS. Los resultados usan los parámetros generales FM / PM.",

            espectro:
                "Vista ESPECTRO. Use ACTUALIZAR ESPECTRO o ACTUALIZAR FM / PM.",

            generacion:
                "Vista GENERACIÓN. Ajuste el modelo VCO y pulse SIMULAR VCO.",

            demodulacion:
                "Vista DEMODULACIÓN / PLL. Ajuste Kd, Kvco y Vdc y pulse SIMULAR DEMODULACIÓN.",

            ruido:
                "Vista RUIDO. Ajuste los niveles y pulse SIMULAR RUIDO."
        };


        return mensajes[
            tab
        ]
        || "Simulador preparado.";
    }


    function mostrarParametros(
        tab
    ) {

        seccionesParametros.forEach(
            seccion => {
                seccion.classList.remove("activa");
            }
        );

        document.getElementById("paramBase").classList.add("activa");

        if (tab === "generacion") {
            document.getElementById("paramGeneracion").classList.add("activa");
        } else if (tab === "demodulacion") {
            document.getElementById("paramDemod").classList.add("activa");
        } else if (tab === "ruido") {
            document.getElementById("paramRuido").classList.add("activa");
        }
    }


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        t => {

                            t.classList.remove(
                                "activo"
                            );
                        }
                    );


                    contenidos.forEach(
                        c => {

                            c.classList.remove(
                                "activo"
                            );
                        }
                    );


                    tab.classList.add(
                        "activo"
                    );


                    const nombre =
                        tab.dataset.tab;


                    document.getElementById(
                        nombre
                    ).classList.add(
                        "activo"
                    );


                    mostrarParametros(
                        nombre
                    );


                    actualizarResultados(
                        nombre
                    );


                    setEstado(
                        mensajeVista(
                            nombre
                        )
                    );

                    actualizarModoEspectro();
                    actualizarAvisoAudioRuido();
                    if (nombre === "generacion") { actualizarGeneracionGlobal(); redibujarVcoConVentana(); }
                    if (nombre === "demodulacion") simularDemod(false);
                    if (nombre === "ruido") simularRuido(false);
                    if (nombre === "espectro" && !fuenteTieneFmUnica()) simularEspectroComplejo(false);
                }
            );
        }
    );


    function dibujarSerie(
        canvasId,
        x,
        y,
        opciones = {}
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const w =
            canvas.width;


        const h =
            canvas.height;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        const mi = 45;
        const md = 14;
        const ms = 12;
        const mb = 24;


        const gw =
            w
            - mi
            - md;


        const gh =
            h
            - ms
            - mb;


        let ymin =
            Math.min(
                ...y
            );


        let ymax =
            Math.max(
                ...y
            );


        if (
            Math.abs(
                ymax - ymin
            )
            < 1e-12
        ) {

            ymin -=
                1;


            ymax +=
                1;
        }


        const extra =
            0.08
            * (
                ymax - ymin
            );


        ymin -=
            extra;


        ymax +=
            extra;


        const xmin =
            x[
                0
            ];


        const xmax =
            x[
                x.length - 1
            ];


        const px =
            v =>
                mi
                + (
                    v - xmin
                )
                / (
                    xmax - xmin
                )
                * gw;


        const py =
            v =>
                ms
                + (
                    ymax - v
                )
                / (
                    ymax - ymin
                )
                * gh;


        ctx.strokeStyle =
            "#dddddd";


        ctx.lineWidth =
            1;


        if (
            ymin <= 0
            && ymax >= 0
        ) {

            ctx.beginPath();


            ctx.moveTo(
                mi,
                py(
                    0
                )
            );


            ctx.lineTo(
                w - md,
                py(
                    0
                )
            );


            ctx.stroke();
        }


        ctx.strokeStyle =
            opciones.color
            || "#1485ff";


        ctx.lineWidth =
            1.35;


        ctx.beginPath();


        const paso =
            Math.max(
                1,
                Math.floor(
                    x.length
                    / 5000
                )
            );


        let primero =
            true;


        for (
            let i = 0;
            i < x.length;
            i += paso
        ) {

            const xx =
                px(
                    x[i]
                );


            const yy =
                py(
                    y[i]
                );


            if (
                primero
            ) {

                ctx.moveTo(
                    xx,
                    yy
                );


                primero =
                    false;

            } else {

                ctx.lineTo(
                    xx,
                    yy
                );
            }
        }


        ctx.stroke();


        ctx.fillStyle =
            "#555";


        ctx.font =
            "10px Arial";


        const textoIni =
            `${xmin.toFixed(5)} s`;


        const textoFin =
            `${xmax.toFixed(5)} s`;


        ctx.fillText(
            textoIni,
            mi,
            h - 6
        );


        ctx.fillText(
            textoFin,
            w
            - md
            - ctx.measureText(
                textoFin
            ).width,
            h - 6
        );


        if (
            opciones.unidad
        ) {

            ctx.fillText(
                opciones.unidad,
                8,
                ms + 5
            );
        }
    }


    function dibujarEspectro(
        canvasId,
        componentes,
        carsonInf,
        carsonSup
    ) {

        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const w =
            canvas.width;


        const h =
            canvas.height;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        const mi = 55;
        const md = 20;
        const ms = 16;
        const mb = 38;


        const frecuencias =
            componentes.map(
                c =>
                    c.frecuencia
            );


        const amplitudes =
            componentes.map(
                c =>
                    c.amplitud
            );


        let xmin =
            Math.min(
                ...frecuencias,
                carsonInf
            );


        let xmax =
            Math.max(
                ...frecuencias,
                carsonSup
            );


        const rango =
            Math.max(
                xmax - xmin,
                1
            );


        xmin -=
            0.05
            * rango;


        xmax +=
            0.05
            * rango;


        const ymax =
            Math.max(
                ...amplitudes,
                1e-6
            )
            * 1.15;


        const px =
            v =>
                mi
                + (
                    v - xmin
                )
                / (
                    xmax - xmin
                )
                * (
                    w - mi - md
                );


        const py =
            v =>
                ms
                + (
                    ymax - v
                )
                / ymax
                * (
                    h - ms - mb
                );


        ctx.fillStyle =
            "rgba(30, 103, 173, 0.08)";


        ctx.fillRect(
            px(
                carsonInf
            ),
            ms,
            px(
                carsonSup
            )
            - px(
                carsonInf
            ),
            h
            - ms
            - mb
        );


        ctx.strokeStyle =
            "#999";


        ctx.lineWidth =
            1;


        ctx.beginPath();


        ctx.moveTo(
            mi,
            h - mb
        );


        ctx.lineTo(
            w - md,
            h - mb
        );


        ctx.stroke();


        componentes.forEach(
            c => {

                const x =
                    px(
                        c.frecuencia
                    );


                ctx.strokeStyle =
                    c.orden === 0
                    ? "#cc2b2b"
                    : "#175ea8";


                ctx.lineWidth =
                    2;


                ctx.beginPath();


                ctx.moveTo(
                    x,
                    h - mb
                );


                ctx.lineTo(
                    x,
                    py(
                        c.amplitud
                    )
                );


                ctx.stroke();
            }
        );


        ctx.fillStyle =
            "#555";


        ctx.font =
            "10px Arial";


        ctx.fillText(
            `${fmt(carsonInf, 1)} Hz`,
            px(
                carsonInf
            )
            + 3,
            ms + 12
        );


        const textoSup =
            `${fmt(carsonSup, 1)} Hz`;


        ctx.fillText(
            textoSup,
            px(
                carsonSup
            )
            - ctx.measureText(
                textoSup
            ).width
            - 3,
            ms + 12
        );


        ctx.fillText(
            "Zona aproximada por Carson",
            mi + 6,
            h - 8
        );
    }


    function resultadosHtml(
        items
    ) {

        return items.map(
            item => `

                <div class="resultado">

                    <span>
                        ${item[0]}
                    </span>

                    <strong>
                        ${item[1]}
                    </strong>

                </div>
            `
        ).join(
            ""
        );
    }


    function actualizarResultados(
        tab
    ) {

        const cont =
            document.getElementById(
                "resultadosContenido"
            );


        if (
            tab === "tiempo"
            || tab === "calculos"
        ) {

            if (
                !datos.base
            ) {

                mostrarSinResultados(
                    "Sin resultados: revise los parámetros FM / PM."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Frecuencia mínima",
                        `${fmt(datos.base.f_min)} Hz`
                    ],
                    [
                        "Frecuencia máxima",
                        `${fmt(datos.base.f_max)} Hz`
                    ],
                    [
                        "f_i observada",
                        `${fmt(datos.base.fi_observada_min ?? datos.base.f_min)} a ${fmt(datos.base.fi_observada_max ?? datos.base.f_max)} Hz`
                    ],
                    [
                        "Fuente modulante",
                        datos.base.fuente_nombre || "Senoidal"
                    ],
                    [
                        "Ventana observada",
                        `${fmt(datos.base.ventana_ms || 0, 0)} ms`
                    ],
                    [
                        "Índice FM beta",
                        fuenteTieneFmUnica(datos.base.fuente || "senoidal")
                            ? fmt(datos.base.beta)
                            : "No único para esta fuente"
                    ],
                    [
                        "Índice PM mp",
                        fmt(
                            datos.base.mp
                        )
                    ],
                    [
                        "Sensibilidad FM kf",
                        `${fmt(datos.base.kf)} Hz/V`
                    ],
                    [
                        "Sensibilidad PM kp",
                        `${fmt(datos.base.kp)} rad/V`
                    ],
                    [
                        "Amplitud ideal",
                        `${fmt(datos.base.Ac)} V`
                    ]
                ]);


            return;
        }


        if (
            tab === "espectro"
        ) {

            if (
                !datos.espectro
            ) {

                mostrarSinResultados(
                    "Sin resultados de espectro: revise los parámetros."
                );

                return;
            }

            if (datos.espectro.tipo === "fft") {
                cont.innerHTML = resultadosHtml([
                    ["Fuente modulante", datos.espectro.fuente_nombre],
                    ["Ventana FFT", `${fmt(datos.espectro.ventana_ms, 1)} ms`],
                    ["f_m_max significativa", `${fmt(datos.espectro.fm_max_sig)} Hz`],
                    ["Ancho práctico por Carson", `${fmt(datos.espectro.bw_carson)} Hz`],
                    ["Zona FFT alrededor de fc", `${fmt(datos.espectro.contenido_fm_min, 1)} a ${fmt(datos.espectro.contenido_fm_max, 1)} Hz`],
                    ["Condición de escala", datos.espectro.escala_solapada ? "Solapamiento: fc ≤ f_m_max" : "Adecuada para observación espectral"],
                    ["BIN FFT", `${fmt(datos.espectro.bin_fft, 2)} Hz`],
                    ["RBW Hann aprox.", `${fmt(datos.espectro.rbw, 2)} Hz`],
                    ["Escala", "dB relativos"]
                ]);
                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Índice beta",
                        fmt(
                            datos.espectro.beta
                        )
                    ],
                    [
                        "Clasificación orientativa",
                        datos.espectro.clasificacion
                    ],
                    [
                        "BW por Carson",
                        `${fmt(datos.espectro.bw_carson)} Hz`
                    ],
                    [
                        "Extremo inferior",
                        `${fmt(datos.espectro.extremo_inferior)} Hz`
                    ],
                    [
                        "Extremo superior",
                        `${fmt(datos.espectro.extremo_superior)} Hz`
                    ]
                ]);


            return;
        }


        if (
            tab === "generacion"
        ) {

            if (
                !datos.vco
            ) {

                mostrarSinResultados(
                    "Sin resultados de generación VCO."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Modelo",
                        "VCO senoidal independiente"
                    ],
                    [
                        "Ventana observada",
                        `${fmt(datos.vco.ventana_ms || Number(document.getElementById("ventanaGeneracion").value), 0)} ms`
                    ],
                    [
                        "Desviación delta_f",
                        `${fmt(datos.vco.delta_f)} Hz`
                    ],
                    [
                        "Índice beta",
                        fmt(
                            datos.vco.beta
                        )
                    ],
                    [
                        "f mínima",
                        `${fmt(datos.vco.f_min)} Hz`
                    ],
                    [
                        "f máxima",
                        `${fmt(datos.vco.f_max)} Hz`
                    ],
                    [
                        "fc después de N",
                        `${fmt(datos.vco.fc_multiplicada)} Hz`
                    ],
                    [
                        "delta_f después de N",
                        `${fmt(datos.vco.delta_f_multiplicada)} Hz`
                    ],
                    [
                        "beta después de N",
                        fmt(
                            datos.vco.beta_multiplicada
                        )
                    ]
                ]);


            return;
        }


        if (
            tab === "demodulacion"
        ) {

            if (
                !datos.demod
            ) {

                mostrarSinResultados(
                    "Sin resultados de demodulación / PLL."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Fuente modulante",
                        datos.demod.fuente_nombre || nombreFuente()
                    ],
                    [
                        "Ventana observada",
                        `${fmt(datos.demod.ventana_ms || 0, 0)} ms`
                    ],
                    [
                        "Detector: salida pico",
                        `${fmt(datos.demod.salida_detector_pico)} V`
                    ],
                    [
                        "PLL: delta Vcontrol",
                        `${fmt(datos.demod.delta_v_control)} V pico`
                    ],
                    [
                        "Kd",
                        `${fmt(datos.demod.Kd_v_por_khz)} V/kHz`
                    ],
                    [
                        "Kvco",
                        `${fmt(datos.demod.Kvco)} Hz/V`
                    ],
                    [
                        "Modelo",
                        "PLL enganchado"
                    ]
                ]);


            return;
        }


        if (
            tab === "ruido"
        ) {

            if (
                !datos.ruido
            ) {

                mostrarSinResultados(
                    "Sin resultados de ruido."
                );

                return;
            }


            cont.innerHTML =
                resultadosHtml([
                    [
                        "Fuente modulante",
                        datos.ruido.fuente_nombre || nombreFuente()
                    ],
                    [
                        "Ventana observada",
                        `${fmt(datos.ruido.ventana_ms || 0, 0)} ms`
                    ],
                    [
                        "Ruido relativo de amplitud",
                        fmt(
                            datos.ruido.ruido_amplitud
                        )
                    ],
                    [
                        "Perturbación de fase",
                        `${fmt(datos.ruido.ruido_fase)} rad`
                    ],
                    [
                        "RMS señal limpia",
                        `${fmt(datos.ruido.rms_senal)} V`
                    ],
                    [
                        "RMS ruido de amplitud",
                        `${fmt(datos.ruido.rms_ruido_amplitud)} V`
                    ],
                    [
                        "SNR amplitud (referencia)",
                        Number.isFinite(datos.ruido.snr_db) ? `${fmt(datos.ruido.snr_db)} dB` : "∞"
                    ],
                    [
                        "Interpretación",
                        "Limitador: útil ante variación de amplitud; no elimina ruido de fase."
                    ]
                ]);
        }
    }


    async function pedirJson(
        url,
        params
    ) {

        const respuesta =
            await fetch(
                `${url}?${params.toString()}`
            );


        const data =
            await respuesta.json();


        if (
            !respuesta.ok
        ) {

            throw new Error(
                data.detail
                || "No se pudo completar la operación."
            );
        }


        return data;
    }


    async function simularBaseGlobal(actualizarEstado = true) {
        const errores = validarBaseCampos();
        const fuente = document.getElementById("fuenteModulante").value;
        if (fuente === "audio" && !fuenteGlobal.audioBuffer) {
            errores.push(crearError(["fuenteModulante", "archivoAudio"], "archivoAudio", "Seleccione primero un archivo de audio válido."));
        }
        if (errores.length > 0) {
            limpiarBase();
            limpiarCanvas("grafFi", "Parámetros inválidos");
            mostrarErrores(errores);
            return false;
        }
        limpiarErroresVisuales();
        try {
            const data = construirBaseGlobal();
            datos.base = data;
            actualizarGraficasBaseGlobal(data);
            if (!fuenteTieneFmUnica(fuente)) {
                datos.espectro = null;
                limpiarEspectro();
                document.getElementById("calcCarson").textContent = "Para esta fuente compleja no se aplica directamente el modelo de una sola f_m usado en el espectro senoidal.";
                document.getElementById("tablaEspectro").innerHTML = "";
                limpiarCanvas("grafEspectro", "Fuente compleja: el espectro requiere FFT");
            }
            actualizarResultados(document.querySelector(".tab.activo").dataset.tab);
            if (actualizarEstado) setEstado(`Simulación FM / PM actualizada con fuente ${data.fuente_nombre}.`);
            return true;
        } catch (error) {
            limpiarBase();
            limpiarCanvas("grafFi", "Sin datos");
            setEstado(`ERROR DE PARÁMETROS\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
            return false;
        }
    }

    async function simularBase() {
        return simularBaseGlobal(true);

        const errores =
            validarBaseCampos();


        if (
            errores.length > 0
        ) {

            limpiarBase();

            limpiarEspectro();

            mostrarErrores(
                errores
            );

            return false;
        }


        limpiarErroresVisuales();


        setEstado(
            "Calculando FM / PM..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "Ac"
                    ),

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                Am:
                    numero(
                        "Am"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                delta_phi:
                    numero(
                        "delta_phi"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-fm-pm",
                    params
                );


            datos.base =
                data;


            dibujarSerie(
                "grafModulante",
                data.t,
                data.modulante,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafPortadora",
                data.t,
                data.portadora,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafFM",
                data.t,
                data.senal_fm,
                {
                    unidad:
                        "V"
                }
            );


            dibujarSerie(
                "grafPM",
                data.t,
                data.senal_pm,
                {
                    unidad:
                        "V"
                }
            );


            document.getElementById(
                "calcRango"
            ).textContent =
                `f_min = ${fmt(data.fc)} - ${fmt(data.delta_f)} = ${fmt(data.f_min)} Hz; `
                + `f_max = ${fmt(data.fc)} + ${fmt(data.delta_f)} = ${fmt(data.f_max)} Hz.`;


            document.getElementById(
                "calcBeta"
            ).textContent =
                `beta = ${fmt(data.delta_f)} / ${fmt(data.fm)} = ${fmt(data.beta)}.`;


            document.getElementById(
                "calcKf"
            ).textContent =
                `kf = ${fmt(data.delta_f)} / ${fmt(data.Am)} = ${fmt(data.kf)} Hz/V.`;


            document.getElementById(
                "calcPm"
            ).textContent =
                `mp = ${fmt(data.mp)}; kp = ${fmt(data.delta_phi)} / ${fmt(data.Am)} = ${fmt(data.kp)} rad/V.`;


            actualizarResultados(
                document.querySelector(
                    ".tab.activo"
                ).dataset.tab
            );


            setEstado(
                "Simulación FM / PM completada."
            );


            return true;

        } catch (
            error
        ) {

            limpiarBase();

            limpiarEspectro();


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );


            return false;
        }
    }


    async function simularEspectro() {

        const fuenteActual = document.getElementById("fuenteModulante").value;

        if (!fuenteTieneFmUnica(fuenteActual)) {
            actualizarModoEspectro();
            return simularEspectroComplejo(true);
        }

        actualizarModoEspectro();

        const errores =
            validarEspectroCampos();


        if (
            errores.length > 0
        ) {

            limpiarEspectro();

            mostrarErrores(
                errores
            );

            return false;
        }


        limpiarErroresVisuales();


        setEstado(
            "Calculando espectro FM..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "Ac"
                    ),

                fc:
                    numero(
                        "fc"
                    ),

                fm:
                    numero(
                        "fm"
                    ),

                delta_f:
                    numero(
                        "delta_f"
                    ),

                orden:
                    numero(
                        "ordenEspectro"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-espectro-fm",
                    params
                );


            datos.espectro =
                data;


            dibujarEspectro(
                "grafEspectro",
                data.componentes,
                data.extremo_inferior,
                data.extremo_superior
            );


            document.getElementById(
                "calcCarson"
            ).textContent =
                `B_FM ≈ 2 x (${fmt(data.delta_f)} + ${fmt(data.fm)}) = ${fmt(data.bw_carson)} Hz.`;


            document.getElementById(
                "tablaEspectro"
            ).innerHTML =
                data.componentes.map(
                    c => `

                        <tr>

                            <td>
                                ${c.orden}
                            </td>

                            <td>
                                ${c.lado}
                            </td>

                            <td>
                                ${fmt(c.frecuencia)}
                            </td>

                            <td>
                                ${fmt(c.coeficiente, 5)}
                            </td>

                            <td>
                                ${fmt(c.amplitud, 5)}
                            </td>

                        </tr>
                    `
                ).join(
                    ""
                );


            if (
                document.querySelector(
                    ".tab.activo"
                ).dataset.tab
                === "espectro"
            ) {

                actualizarResultados(
                    "espectro"
                );
            }


            setEstado(
                "Espectro FM actualizado."
            );


            return true;

        } catch (
            error
        ) {

            limpiarEspectro();


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );


            return false;
        }
    }


    async function simularVco() {

        const errores =
            validarVcoCampos();


        if (
            errores.length > 0
        ) {

            datos.vco =
                null;


            limpiarCanvas(
                "grafVcontrol",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafFiVco",
                "Parámetros inválidos"
            );


            limpiarCanvas(
                "grafVcoFm",
                "Parámetros inválidos"
            );


            mostrarErrores(
                errores
            );


            return;
        }


        limpiarErroresVisuales();


        setEstado(
            "Simulando VCO..."
        );


        const params =
            new URLSearchParams({

                Ac:
                    numero(
                        "vco_Ac"
                    ),

                fc:
                    numero(
                        "vco_fc"
                    ),

                fm:
                    numero(
                        "vco_fm"
                    ),

                Kvco:
                    numero(
                        "vco_K"
                    ),

                Vbias:
                    numero(
                        "vco_bias"
                    ),

                Vm:
                    numero(
                        "vco_Vm"
                    ),

                multiplicador:
                    numero(
                        "vco_N"
                    )
            });


        try {

            const data =
                await pedirJson(
                    "/prueba-vco",
                    params
                );


            datos.vco = data;

            redibujarVcoConVentana();


            actualizarResultados(
                "generacion"
            );


            setEstado(
                "Simulación de VCO completada."
            );

        } catch (
            error
        ) {

            datos.vco =
                null;


            limpiarCanvas(
                "grafVcontrol",
                "Sin datos"
            );


            limpiarCanvas(
                "grafFiVco",
                "Sin datos"
            );


            limpiarCanvas(
                "grafVcoFm",
                "Sin datos"
            );


            setEstado(
                `ERROR DE PARÁMETROS\n${error.message}`,
                true
            );


            mostrarSinResultados(
                error.message,
                true
            );
        }
    }


    async function simularDemod(actualizarEstado = true) {

        const errores = validarDemodCampos();
        const fuente = document.getElementById("fuenteModulante").value;
        if (fuente === "audio" && !fuenteGlobal.audioBuffer) {
            errores.push(crearError(["fuenteModulante","archivoAudio"], "archivoAudio", "Seleccione primero un archivo de audio válido."));
        }

        if (errores.length > 0) {
            datos.demod = null;
            ["grafDemodModulante","grafDemodFi","grafDetector","grafPllControl"].forEach(id => limpiarCanvas(id,"Parámetros inválidos"));
            mostrarErrores(errores);
            return false;
        }

        limpiarErroresVisuales();
        if (actualizarEstado) setEstado("Simulando demodulación con la fuente global...");

        try {
            const data = construirDemodGlobal();
            datos.demod = data;
            document.getElementById("ventanaDemodInfo").textContent = `${fmt(data.ventana_ms, 0)} ms`;
            document.getElementById("demodFuenteTexto").textContent = `Fuente global: ${data.fuente_nombre}. El detector convierte f_i(t) - fc en tensión y el PLL enganchado se representa mediante su tensión de control.`;
            dibujarSerie("grafDemodModulante", data.t, data.modulante, {unidad:"V"});
            dibujarSerie("grafDemodFi", data.t, data.frecuencia_instantanea, {unidad:"Hz", color:"#d32f2f"});
            dibujarSerie("grafDetector", data.t, data.salida_detector, {unidad:"V"});
            dibujarSerie("grafPllControl", data.t, data.tension_control, {unidad:"V"});
            if (document.querySelector(".tab.activo")?.dataset.tab === "demodulacion") actualizarResultados("demodulacion");
            if (actualizarEstado) setEstado("Demodulación didáctica completada con la fuente global.");
            return true;
        } catch (error) {
            datos.demod = null;
            ["grafDemodModulante","grafDemodFi","grafDetector","grafPllControl"].forEach(id => limpiarCanvas(id,"Sin datos"));
            if (actualizarEstado) {
                setEstado(`ERROR DE PARÁMETROS\n${error.message}`, true);
                mostrarSinResultados(error.message,true);
            }
            return false;
        }
    }


    async function simularRuido(actualizarEstado = true) {
        const errores = validarRuidoCampos();
        const fuente = document.getElementById("fuenteModulante").value;
        if (fuente === "audio" && !fuenteGlobal.audioBuffer) {
            errores.push(crearError(["fuenteModulante","archivoAudio"], "archivoAudio", "Seleccione primero un archivo de audio válido."));
        }
        if (errores.length > 0) {
            datos.ruido = null;
            ["grafRuidoLimpia","grafRuidoAmp","grafLimitador","grafRuidoFase"].forEach(id=>limpiarCanvas(id,"Parámetros inválidos"));
            mostrarErrores(errores);
            return false;
        }
        limpiarErroresVisuales();
        if (actualizarEstado) setEstado("Simulando ruido en FM con la fuente global...");
        try {
            const data = construirRuidoGlobal();
            datos.ruido = data;
            document.getElementById("ventanaRuidoInfo").textContent = `${fmt(data.ventana_ms,0)} ms`;
            actualizarAvisoAudioRuido();
            dibujarSerie("grafRuidoLimpia", data.t, data.senal_limpia, {unidad:"V"});
            dibujarSerie("grafRuidoAmp", data.t, data.senal_ruido_amplitud, {unidad:"V"});
            dibujarSerie("grafLimitador", data.t, data.senal_limitada, {unidad:"V"});
            dibujarSerie("grafRuidoFase", data.t, data.senal_ruido_fase, {unidad:"V"});
            if (document.querySelector(".tab.activo")?.dataset.tab === "ruido") actualizarResultados("ruido");
            if (actualizarEstado) setEstado("Simulación cualitativa de ruido FM completada con la fuente global.");
            return true;
        } catch (error) {
            datos.ruido=null;
            ["grafRuidoLimpia","grafRuidoAmp","grafLimitador","grafRuidoFase"].forEach(id=>limpiarCanvas(id,"Sin datos"));
            if (actualizarEstado) {
                setEstado(`ERROR DE PARÁMETROS\n${error.message}`,true);
                mostrarSinResultados(error.message,true);
            }
            return false;
        }
    }


    document.getElementById("fuenteModulante").addEventListener("change", async () => {
        actualizarUiFuente();
        actualizarModoEspectro();
        actualizarAvisoAudioRuido();
        limpiarErroresVisuales();
        await simularBase();
        await simularEspectro();
        actualizarGeneracionGlobal();
        await simularDemod(false);
        await simularRuido(false);
        const tabActual = document.querySelector(".tab.activo")?.dataset.tab;
        if (tabActual) actualizarResultados(tabActual);
    });

    document.getElementById("ventanaTiempo").addEventListener("change", async () => {
        await simularBase();
    });

    document.getElementById("ventanaGeneracion").addEventListener("change", async () => {
        actualizarGeneracionGlobal();
        redibujarVcoConVentana();
        if (document.querySelector(".tab.activo")?.dataset.tab === "generacion") actualizarResultados("generacion");
    });

    document.getElementById("ventanaDemodFm").addEventListener("change", async () => {
        await simularDemod(true);
    });

    document.getElementById("ventanaFFT").addEventListener("change", async () => {
        if (!fuenteTieneFmUnica()) await simularEspectroComplejo(true);
    });

    document.getElementById("btnFftCompleja").addEventListener("click", async () => {
        if (fuenteTieneFmUnica()) {
            await simularEspectro();
        } else {
            await simularEspectroComplejo(true);
        }
    });

    document.getElementById("ventanaRuidoFm").addEventListener("change", async () => {
        await simularRuido(true);
    });

    document.getElementById("archivoAudio").addEventListener("change", async (evento) => {
        const archivo = evento.target.files && evento.target.files[0];
        if (archivo) await cargarAudioGlobal(archivo);
    });

    async function refrescarVistaAudioActual() {
        const tab = document.querySelector(".tab.activo")?.dataset.tab;
        if (tab === "tiempo") {
            await simularBaseGlobal(false);
        } else if (tab === "espectro") {
            if (!fuenteTieneFmUnica()) await simularEspectroComplejo(false);
        } else if (tab === "generacion") {
            actualizarGeneracionGlobal();
        } else if (tab === "demodulacion") {
            await simularDemod(false);
        } else if (tab === "ruido") {
            await simularRuido(false);
        }
    }

    async function ejecutarAccionAudio(accion) {
        if (!fuenteGlobal.audioBuffer) {
            marcarCampoError("archivoAudio", "Seleccione primero un archivo de audio válido.", true);
            return;
        }

        try {
            if (accion === "play") {
                if (fuenteGlobal.contextoAudio?.state === "suspended") {
                    await fuenteGlobal.contextoAudio.resume();
                }
                await fuenteGlobal.audioElemento.play();
            } else if (accion === "pause") {
                fuenteGlobal.audioElemento.pause();
            } else if (accion === "stop") {
                fuenteGlobal.audioElemento.pause();
                fuenteGlobal.audioElemento.currentTime = 0;
            } else if (accion === "restart") {
                fuenteGlobal.audioElemento.currentTime = 0;
                if (fuenteGlobal.contextoAudio?.state === "suspended") {
                    await fuenteGlobal.contextoAudio.resume();
                }
                await fuenteGlobal.audioElemento.play();
            }

            actualizarEstadoAudio();
            await refrescarVistaAudioActual();
        } catch (error) {
            setEstado(`No se pudo controlar la reproducción: ${error.message}`, true);
        }
    }

    document.querySelectorAll("[data-audio-action]").forEach(boton => {
        boton.addEventListener("click", async () => {
            await ejecutarAccionAudio(boton.dataset.audioAction);
        });
    });

    document.querySelectorAll(".audio-progreso-global").forEach(progreso => {
        progreso.addEventListener("input", async (evento) => {
            if (!fuenteGlobal.audioBuffer) return;
            fuenteGlobal.audioElemento.currentTime = Math.max(
                0,
                Math.min(fuenteGlobal.audioBuffer.duration, Number(evento.target.value))
            );
            actualizarEstadoAudio();
            await refrescarVistaAudioActual();
        });
    });

    fuenteGlobal.audioElemento.addEventListener("play", actualizarEstadoAudio);
    fuenteGlobal.audioElemento.addEventListener("pause", actualizarEstadoAudio);
    fuenteGlobal.audioElemento.addEventListener("timeupdate", actualizarEstadoAudio);
    fuenteGlobal.audioElemento.addEventListener("ended", async () => {
        actualizarEstadoAudio();
        await refrescarVistaAudioActual();
    });


    document.querySelectorAll(
        "input"
    ).forEach(
        campo => {

            campo.addEventListener(
                "input",
                () => {

                    if (
                        campo.classList.contains(
                            "campo-error"
                        )
                    ) {

                        campo.classList.remove(
                            "campo-error"
                        );


                        campo.removeAttribute(
                            "aria-invalid"
                        );


                        const grupo =
                            campo.closest(
                                ".grupo"
                            );


                        if (
                            grupo
                        ) {

                            grupo.classList.remove(
                                "grupo-error"
                            );


                            const aviso =
                                grupo.querySelector(
                                    ".error-campo"
                                );


                            if (
                                aviso
                            ) {

                                aviso.remove();
                            }
                        }
                    }


                    if (
                        document.getElementById(
                            "estado"
                        ).classList.contains(
                            "estado-error"
                        )
                    ) {

                        setEstado(
                            "Dato modificado. Pulse nuevamente el botón de simulación."
                        );
                    }
                }
            );
        }
    );


    document.getElementById(
        "btnBase"
    ).addEventListener(
        "click",
        async () => {

            const baseValida =
                await simularBase();


            if (
                baseValida
            ) {

                const espectroValido =
                    await simularEspectro();


                if (
                    espectroValido
                    && document.querySelector(
                        ".tab.activo"
                    ).dataset.tab
                    !== "espectro"
                ) {

                    setEstado(
                        "FM / PM y espectro actualizados."
                    );
                }
            }
        }
    );


    document.getElementById(
        "btnEspectro"
    ).addEventListener(
        "click",
        simularEspectro
    );


    document.getElementById(
        "btnVco"
    ).addEventListener(
        "click",
        simularVco
    );


    document.getElementById(
        "btnDemod"
    ).addEventListener(
        "click",
        simularDemod
    );


    document.getElementById(
        "btnRuido"
    ).addEventListener(
        "click",
        simularRuido
    );


    async function iniciar() {

        actualizarUiFuente();
        actualizarModoEspectro();
        actualizarAvisoAudioRuido();
        iniciarActualizacionDinamica();
        actualizarEstadoAudio();

        await simularBase();

        await simularEspectro();

        await simularVco();

        await simularDemod();

        await simularRuido();
        actualizarGeneracionGlobal();


        mostrarParametros(
            "tiempo"
        );


        actualizarResultados(
            "tiempo"
        );


        setEstado(
            "Simulador preparado."
        );
    }


    iniciar();
