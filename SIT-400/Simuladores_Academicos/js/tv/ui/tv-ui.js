    const tabs = document.querySelectorAll(".tab");
    const contenidos = document.querySelectorAll(".contenido-tab");
    const seccionesParametros = document.querySelectorAll(".seccion-parametros");

    const datos = {
        isdb: null,
        segmentos: null,
        cobertura: null,
        tsA: null,
        tsB: null,
        guarda: null,
        medios: null
    };

    const estadoTs = {
        errorA: null,
        errorB: null
    };

    const fuenteAv = {
        tipo: "NINGUNA",
        archivoNombre: null,
        archivoUrl: null,
        youtubeId: null,
        youtubePlayer: null,
        youtubeListo: false,
        youtubeApiSolicitada: false
    };

    let temporizadorFuente = null;


    function formatearReloj(segundos) {
        const valor = Number(segundos);
        if (!Number.isFinite(valor) || valor < 0) return "—";
        const total = Math.floor(valor);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
        return `${m}:${String(s).padStart(2,"0")}`;
    }


    function relacionAspecto(ancho, alto) {
        function mcd(a, b) {
            a = Math.abs(a); b = Math.abs(b);
            while (b) [a, b] = [b, a % b];
            return a || 1;
        }
        if (!ancho || !alto) return "—";
        const d = mcd(ancho, alto);
        return `${ancho / d}:${alto / d}`;
    }



    function actualizarAnalisisVideoDigital() {
        const video = document.getElementById("videoLocal");
        const res = document.getElementById("videoResolucionActual");
        const pix = document.getElementById("videoPixelesActual");
        const asp = document.getElementById("videoAspectoActual");
        const texto = document.getElementById("videoAnalisisTexto");
        const tablaRes = document.getElementById("tablaVideoResolucion");
        const tablaPix = document.getElementById("tablaVideoPixeles");

        if (!res || !pix || !asp || !texto) return;

        if (fuenteAv.tipo === "LOCAL" && video && video.videoWidth && video.videoHeight) {
            const w = video.videoWidth;
            const h = video.videoHeight;
            const total = w * h;
            const totalFmt = total.toLocaleString("es-BO");
            res.textContent = `${w} x ${h}`;
            pix.textContent = totalFmt;
            asp.textContent = relacionAspecto(w, h);
            if (tablaRes) tablaRes.textContent = `${w} x ${h}`;
            if (tablaPix) tablaPix.textContent = totalFmt;
            texto.textContent = `El video cargado tiene una resolución de ${w} x ${h} píxeles, equivalente a ${totalFmt} píxeles por cuadro. Al aumentar la resolución aumenta la cantidad de píxeles que deben representarse en cada cuadro.`;
        } else if (fuenteAv.tipo === "YOUTUBE") {
            res.textContent = "No disponible";
            pix.textContent = "No disponible";
            asp.textContent = "No disponible";
            if (tablaRes) tablaRes.textContent = "No disponible";
            if (tablaPix) tablaPix.textContent = "No disponible";
            texto.textContent = "El reproductor de YouTube no entrega al simulador la resolución exacta del video, por lo que no se calculan píxeles por cuadro.";
        } else {
            res.textContent = "—";
            pix.textContent = "—";
            asp.textContent = "—";
            if (tablaRes) tablaRes.textContent = "—";
            if (tablaPix) tablaPix.textContent = "—";
            texto.textContent = fuenteAv.tipo === "NINGUNA"
                ? "No hay video cargado. La tabla de resoluciones puede consultarse sin una fuente audiovisual."
                : "El patrón de prueba sirve como fuente visual, pero no corresponde a un archivo del que se mida una resolución real.";
        }

        const activo = document.querySelector(".tab.activo");
        if (activo && activo.dataset.tab === "video") actualizarResultados("video");
    }


    function limpiarCapturaVideo(mensaje) {
        const canvas = document.getElementById("capturaVideo");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ddd";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText(mensaje, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "start";
    }


    function capturarCuadroActual() {
        const video = document.getElementById("videoLocal");
        const estado = document.getElementById("estadoCaptura");
        const canvas = document.getElementById("capturaVideo");
        const ctx = canvas.getContext("2d");

        if (fuenteAv.tipo === "PATRON") {
            const colores = [
                "#d7d7d7",
                "#d6d66a",
                "#61caca",
                "#63c36b",
                "#c46cc4",
                "#d26666",
                "#5f6fc8"
            ];
            const anchoBase = canvas.width / colores.length;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            colores.forEach((color, indice) => {
                const x0 = Math.round(indice * anchoBase);
                const x1 = Math.round((indice + 1) * anchoBase);
                ctx.fillStyle = color;
                ctx.fillRect(x0, 0, x1 - x0, canvas.height);
            });
            estado.textContent = "Cuadro capturado del patrón de barras de color.";
            return;
        }

        if (fuenteAv.tipo === "YOUTUBE") {
            limpiarCapturaVideo("Captura no disponible para YouTube");
            estado.textContent = "La captura de cuadro no está disponible para videos de YouTube.";
            return;
        }

        if (fuenteAv.tipo !== "LOCAL") {
            limpiarCapturaVideo("Seleccione una fuente visual");
            estado.textContent = "Seleccione el patrón de barras de color o un archivo de video local.";
            return;
        }

        if (!video.src || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
            limpiarCapturaVideo("Video local no disponible");
            estado.textContent = "Cargue un archivo local y espere a que el video esté listo.";
            return;
        }

        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const escala = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const dw = video.videoWidth * escala;
        const dh = video.videoHeight * escala;
        const dx = (canvas.width - dw) / 2;
        const dy = (canvas.height - dh) / 2;
        ctx.drawImage(video, dx, dy, dw, dh);
        estado.textContent = `Cuadro capturado en ${formatearReloj(video.currentTime)}. Resolución original del archivo: ${video.videoWidth} x ${video.videoHeight}.`;
    }


    function descripcionFuenteActual() {
        if (fuenteAv.tipo === "LOCAL") {
            return fuenteAv.archivoNombre ? `Archivo local: ${fuenteAv.archivoNombre}` : "Archivo local sin cargar";
        }
        if (fuenteAv.tipo === "YOUTUBE") {
            return fuenteAv.youtubeId ? `YouTube: ${fuenteAv.youtubeId}` : "YouTube sin cargar";
        }
        if (fuenteAv.tipo === "PATRON") return "Patrón de prueba";
        return "Sin fuente audiovisual";
    }


    function actualizarReferenciaFuenteEnTs() {
        const salida = document.getElementById("ventanaTsFuente");
        const resumen = document.getElementById("fuenteTsResumen");
        const video = document.getElementById("videoLocal");
        let texto;
        if (fuenteAv.tipo === "NINGUNA") {
            texto = "Sin fuente audiovisual cargada. Los cálculos y la representación de Transport Stream funcionan independientemente del video.";
        } else {
            texto = `Fuente audiovisual: ${descripcionFuenteActual()}.`;
            if (fuenteAv.tipo === "LOCAL" && video && video.videoWidth && video.videoHeight) {
                texto += ` Resolución detectada: ${video.videoWidth} x ${video.videoHeight}; ${(video.videoWidth * video.videoHeight).toLocaleString("es-BO")} píxeles por cuadro.`;
            }
        }
        if (salida) salida.textContent = texto;
        if (resumen) resumen.textContent = texto;
    }


    function actualizarMetadatosFuente() {
        const metaFuente = document.getElementById("metaFuente");
        const metaDuracion = document.getElementById("metaDuracion");
        const metaResolucion = document.getElementById("metaResolucion");
        const metaPosicion = document.getElementById("metaPosicion");
        const video = document.getElementById("videoLocal");

        if (fuenteAv.tipo === "LOCAL") {
            metaFuente.textContent = fuenteAv.archivoNombre || "Seleccione un archivo";
            if (video && Number.isFinite(video.duration)) {
                metaDuracion.textContent = formatearReloj(video.duration);
                metaPosicion.textContent = `${formatearReloj(video.currentTime)} / ${formatearReloj(video.duration)}`;
            } else {
                metaDuracion.textContent = "—";
                metaPosicion.textContent = "—";
            }
            if (video && video.videoWidth && video.videoHeight) {
                metaResolucion.textContent = `${video.videoWidth} x ${video.videoHeight} (${relacionAspecto(video.videoWidth, video.videoHeight)})`;
            } else {
                metaResolucion.textContent = "—";
            }
        } else if (fuenteAv.tipo === "YOUTUBE") {
            let titulo = fuenteAv.youtubeId ? `YouTube: ${fuenteAv.youtubeId}` : "Ingrese un enlace";
            let duracion = NaN;
            let posicion = NaN;
            if (fuenteAv.youtubePlayer && fuenteAv.youtubeListo) {
                try {
                    const datosVideo = fuenteAv.youtubePlayer.getVideoData ? fuenteAv.youtubePlayer.getVideoData() : null;
                    if (datosVideo && datosVideo.title) titulo = datosVideo.title;
                    duracion = fuenteAv.youtubePlayer.getDuration();
                    posicion = fuenteAv.youtubePlayer.getCurrentTime();
                } catch (_) {}
            }
            metaFuente.textContent = titulo;
            metaDuracion.textContent = Number.isFinite(duracion) && duracion > 0 ? formatearReloj(duracion) : "—";
            metaResolucion.textContent = "Gestionada por YouTube";
            metaPosicion.textContent = Number.isFinite(duracion) && duracion > 0
                ? `${formatearReloj(posicion)} / ${formatearReloj(duracion)}`
                : "—";
        } else if (fuenteAv.tipo === "PATRON") {
            metaFuente.textContent = "Patrón de prueba";
            metaDuracion.textContent = "Estática";
            metaResolucion.textContent = "—";
            metaPosicion.textContent = "—";
        } else {
            metaFuente.textContent = "Sin fuente audiovisual";
            metaDuracion.textContent = "—";
            metaResolucion.textContent = "—";
            metaPosicion.textContent = "—";
        }

        actualizarReferenciaFuenteEnTs();
        actualizarAnalisisVideoDigital();
    }


    function iniciarActualizacionFuente() {
        if (temporizadorFuente) clearInterval(temporizadorFuente);
        temporizadorFuente = setInterval(actualizarMetadatosFuente, 500);
    }


    function extraerYoutubeId(valor) {
        const texto = String(valor || "").trim();
        if (/^[A-Za-z0-9_-]{11}$/.test(texto)) return texto;
        try {
            const url = new URL(texto);
            const host = url.hostname.replace(/^www\./, "");
            if (host === "youtu.be") {
                const id = url.pathname.split("/").filter(Boolean)[0];
                return /^[A-Za-z0-9_-]{11}$/.test(id || "") ? id : null;
            }
            if (host.endsWith("youtube.com")) {
                const v = url.searchParams.get("v");
                if (/^[A-Za-z0-9_-]{11}$/.test(v || "")) return v;
                const partes = url.pathname.split("/").filter(Boolean);
                const pos = partes.findIndex(p => p === "shorts" || p === "embed" || p === "live");
                if (pos >= 0 && /^[A-Za-z0-9_-]{11}$/.test(partes[pos + 1] || "")) return partes[pos + 1];
            }
        } catch (_) {}
        return null;
    }


    function solicitarApiYoutube() {
        if (window.YT && window.YT.Player) {
            fuenteAv.youtubeApiSolicitada = true;
            return;
        }
        if (fuenteAv.youtubeApiSolicitada) return;
        fuenteAv.youtubeApiSolicitada = true;
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.onerror = () => {
            document.getElementById("estadoFuente").textContent = "No se pudo cargar la API de YouTube. Revise la conexión a Internet.";
        };
        document.head.appendChild(script);
    }


    window.onYouTubeIframeAPIReady = function() {
        if (fuenteAv.youtubeId) crearOCargarYoutube(fuenteAv.youtubeId);
    };


    function crearOCargarYoutube(id) {
        if (!(window.YT && window.YT.Player)) {
            fuenteAv.youtubeId = id;
            solicitarApiYoutube();
            document.getElementById("estadoFuente").textContent = "Cargando reproductor de YouTube...";
            return;
        }

        if (fuenteAv.youtubePlayer && fuenteAv.youtubeListo) {
            fuenteAv.youtubePlayer.cueVideoById(id);
            fuenteAv.youtubeId = id;
            document.getElementById("estadoFuente").textContent = "Video de YouTube cargado.";
            actualizarMetadatosFuente();
            return;
        }

        document.getElementById("youtubePlayer").innerHTML = "";
        const vars = { rel: 0, playsinline: 1 };
        if (location.protocol === "http:" || location.protocol === "https:") vars.origin = location.origin;

        fuenteAv.youtubePlayer = new YT.Player("youtubePlayer", {
            width: "100%",
            height: "238",
            videoId: id,
            playerVars: vars,
            events: {
                onReady: event => {
                    fuenteAv.youtubeListo = true;
                    fuenteAv.youtubeId = id;
                    event.target.cueVideoById(id);
                    document.getElementById("estadoFuente").textContent = "Video de YouTube cargado.";
                    actualizarMetadatosFuente();
                },
                onStateChange: () => actualizarMetadatosFuente(),
                onError: event => {
                    const codigo = event.data;
                    const detalle = (codigo === 101 || codigo === 150)
                        ? "El propietario del video no permite reproducción incrustada."
                        : `YouTube no pudo reproducir este video (código ${codigo}).`;
                    document.getElementById("estadoFuente").textContent = detalle;
                }
            }
        });
    }


    function cambiarFuenteAudiovisual() {
        const tipo = document.getElementById("tipoFuenteAv").value;
        const video = document.getElementById("videoLocal");
        fuenteAv.tipo = tipo;

        document.getElementById("panelFuenteLocal").classList.toggle("activo", tipo === "LOCAL");
        document.getElementById("panelFuenteYoutube").classList.toggle("activo", tipo === "YOUTUBE");
        document.getElementById("sinFuenteAv").classList.toggle("oculto", tipo !== "NINGUNA");
        document.getElementById("patronPrueba").classList.toggle("oculto", tipo !== "PATRON");
        video.classList.toggle("oculto", tipo !== "LOCAL");
        document.getElementById("youtubeWrap").classList.toggle("oculto", tipo !== "YOUTUBE");
        document.getElementById("controlesAudiovisuales").classList.toggle("oculto", tipo === "PATRON" || tipo === "NINGUNA");

        if (tipo !== "LOCAL") video.pause();
        if (tipo !== "YOUTUBE" && fuenteAv.youtubePlayer && fuenteAv.youtubeListo) {
            try { fuenteAv.youtubePlayer.pauseVideo(); } catch (_) {}
        }

        if (tipo === "NINGUNA") {
            document.getElementById("estadoFuente").textContent = "No se ha cargado una fuente audiovisual. El resto del simulador funciona normalmente.";
        } else if (tipo === "PATRON") {
            document.getElementById("estadoFuente").textContent = "Patrón de prueba activo.";
        } else if (tipo === "LOCAL") {
            document.getElementById("estadoFuente").textContent = fuenteAv.archivoNombre
                ? "Archivo local cargado."
                : "Seleccione un archivo de video local.";
        } else {
            solicitarApiYoutube();
            document.getElementById("estadoFuente").textContent = fuenteAv.youtubeId
                ? "Video de YouTube preparado."
                : "Ingrese un enlace de YouTube y pulse CARGAR VIDEO DE YOUTUBE.";
        }

        actualizarMetadatosFuente();

        if (tipo === "PATRON") {
            limpiarCapturaVideo("Aún no se capturó el patrón");
            document.getElementById("estadoCaptura").textContent = "Pulse CAPTURAR CUADRO ACTUAL para copiar el patrón de barras de color.";
        } else if (tipo === "LOCAL") {
            limpiarCapturaVideo("Aún no se capturó ningún cuadro");
            document.getElementById("estadoCaptura").textContent = fuenteAv.archivoNombre
                ? "Pulse CAPTURAR CUADRO ACTUAL para obtener el fotograma visible."
                : "Seleccione un archivo de video local.";
        } else if (tipo === "YOUTUBE") {
            limpiarCapturaVideo("Captura no disponible para YouTube");
            document.getElementById("estadoCaptura").textContent = "La captura de cuadro no está disponible para videos de YouTube.";
        } else {
            limpiarCapturaVideo("Seleccione una fuente visual");
            document.getElementById("estadoCaptura").textContent = "Seleccione el patrón de barras de color o un archivo de video local.";
        }
    }


    function cargarArchivoVideo(evento) {
        const archivo = evento.target.files && evento.target.files[0];
        if (!archivo) return;
        const video = document.getElementById("videoLocal");
        if (fuenteAv.archivoUrl) URL.revokeObjectURL(fuenteAv.archivoUrl);
        fuenteAv.archivoUrl = URL.createObjectURL(archivo);
        fuenteAv.archivoNombre = archivo.name;
        video.src = fuenteAv.archivoUrl;
        video.load();
        document.getElementById("estadoFuente").textContent = "Cargando metadatos del archivo local...";
    }


    function cargarYoutubeDesdeEntrada() {
        const id = extraerYoutubeId(document.getElementById("urlYoutube").value);
        if (!id) {
            document.getElementById("estadoFuente").textContent = "Enlace de YouTube no válido. Use un enlace watch, youtu.be, shorts, live o embed.";
            return;
        }
        fuenteAv.youtubeId = id;
        crearOCargarYoutube(id);
        actualizarMetadatosFuente();
    }


    function controlarFuente(accion) {
        const video = document.getElementById("videoLocal");
        if (fuenteAv.tipo === "LOCAL") {
            if (!video.src) {
                document.getElementById("estadoFuente").textContent = "Seleccione primero un archivo de video local.";
                return;
            }
            if (accion === "play") video.play().catch(() => {});
            if (accion === "pause") video.pause();
            if (accion === "stop") { video.pause(); video.currentTime = 0; }
            if (accion === "restart") { video.currentTime = 0; video.play().catch(() => {}); }
        } else if (fuenteAv.tipo === "YOUTUBE") {
            if (!(fuenteAv.youtubePlayer && fuenteAv.youtubeListo)) {
                document.getElementById("estadoFuente").textContent = "Cargue primero un video de YouTube.";
                return;
            }
            try {
                if (accion === "play") fuenteAv.youtubePlayer.playVideo();
                if (accion === "pause") fuenteAv.youtubePlayer.pauseVideo();
                if (accion === "stop") { fuenteAv.youtubePlayer.pauseVideo(); fuenteAv.youtubePlayer.seekTo(0, true); }
                if (accion === "restart") { fuenteAv.youtubePlayer.seekTo(0, true); fuenteAv.youtubePlayer.playVideo(); }
            } catch (_) {}
        }
        actualizarMetadatosFuente();
    }


    function actualizarVistaCanalIsdb() {
        const cantidad = Number(document.getElementById("ventanaIsdb").value);
        const cont = document.getElementById("vistaCanalIsdb");
        const info = document.getElementById("vistaCanalInfo");
        let indices;
        if (cantidad === 1) indices = [7];
        else indices = Array.from({length: 13}, (_, i) => i + 1);

        cont.style.gridTemplateColumns = `repeat(${indices.length}, minmax(44px, 1fr))`;
        cont.innerHTML = indices.map(n => `
            <div class="segmento-zoom ${n === 7 ? "central" : ""}">
                Segmento ${n}
                <small>${n === 7 ? "central / One-Seg" : "activo"}</small>
            </div>
        `).join("");

        const anchoSegmento = 6000 / 14;
        if (cantidad === 13) {
            info.textContent = `Canal RF de 6 MHz: se observan los 13 segmentos activos. Cada segmento ≈ ${anchoSegmento.toFixed(1)} kHz; zona activa representada ≈ ${(13 * anchoSegmento / 1000).toFixed(3)} MHz.`;
        } else {
            info.textContent = `One-Seg: segmento central ≈ ${anchoSegmento.toFixed(1)} kHz.`;
        }
    }


    function renderVentanaTs() {
        const cantidad = Number(document.getElementById("ventanaPaquetes").value);
        const cont = document.getElementById("ventanaTsVisual");
        const secuencia = [
            ["PAT", "Tabla de programas"],
            ["PMT", "Mapa del programa"],
            ["VIDEO", "PID video"],
            ["AUDIO", "PID audio"],
            ["VIDEO", "PID video"],
            ["DATOS", "PID datos"],
            ["VIDEO", "PID video"],
            ["AUDIO", "PID audio"]
        ];
        cont.innerHTML = Array.from({length: cantidad}, (_, i) => {
            const [tipo, detalle] = secuencia[i % secuencia.length];
            return `<div class="paquete-mini"><strong>TS ${i + 1}</strong><span>${tipo}</span><small>188 B · ${detalle}</small></div>`;
        }).join("");
        actualizarReferenciaFuenteEnTs();
    }


    function numero(id) {
        const campo = document.getElementById(id);
        const texto = campo.value.trim();

        if (texto === "") {
            return NaN;
        }

        return Number(texto);
    }


    function fmt(valor, decimales = 3) {
        return Number(valor).toFixed(decimales);
    }


    function fmtTiempoMs(valor) {
        const numeroTiempo = Number(valor);

        if (!Number.isFinite(numeroTiempo)) {
            return "—";
        }

        if (numeroTiempo === 0) {
            return "0";
        }

        const absoluto = Math.abs(numeroTiempo);

        if (absoluto >= 0.01) {
            return numeroTiempo.toFixed(3);
        }

        if (absoluto >= 0.000001) {
            return numeroTiempo
                .toFixed(6)
                .replace(/0+$/, "")
                .replace(/\.$/, "");
        }

        return numeroTiempo.toExponential(3);
    }


    function setEstado(texto, error = false) {
        const estado = document.getElementById("estado");
        estado.textContent = texto;
        estado.classList.toggle("estado-error", error);
    }


    function limpiarErroresVisuales() {
        document.querySelectorAll(".campo-error").forEach(campo => {
            campo.classList.remove("campo-error");
            campo.removeAttribute("aria-invalid");
        });

        document.querySelectorAll(".grupo-error").forEach(grupo => {
            grupo.classList.remove("grupo-error");
        });

        document.querySelectorAll(".error-campo").forEach(aviso => {
            aviso.remove();
        });
    }


    function crearError(ids, principal, mensaje) {
        return { ids, principal, mensaje };
    }


    function marcarCampoError(id, mensaje, mostrarMensaje = true) {
        const campo = document.getElementById(id);

        if (!campo) {
            return;
        }

        campo.classList.add("campo-error");
        campo.setAttribute("aria-invalid", "true");

        const grupo = campo.closest(".grupo");

        if (!grupo) {
            return;
        }

        grupo.classList.add("grupo-error");

        if (mostrarMensaje) {
            let aviso = grupo.querySelector(".error-campo");

            if (!aviso) {
                aviso = document.createElement("div");
                aviso.className = "error-campo";
                grupo.appendChild(aviso);
            }

            aviso.textContent = mensaje;
        }
    }


    function mostrarSinResultados(mensaje, error = false) {
        document.getElementById("resultadosContenido").innerHTML = `
            <div class="resultado ${error ? "resultado-error" : ""}">
                <span>Estado</span>
                <strong>${mensaje}</strong>
            </div>
        `;
    }


    function mostrarErrores(errores) {
        limpiarErroresVisuales();

        errores.forEach(item => {
            item.ids.forEach(id => {
                marcarCampoError(
                    id,
                    item.mensaje,
                    id === item.principal
                );
            });
        });

        const detalle = errores.map(item => `• ${item.mensaje}`).join("\n");

        setEstado(
            `ERROR DE PARÁMETROS\n${detalle}`,
            true
        );

        mostrarSinResultados(
            "Sin resultados: corrija los campos marcados en rojo.",
            true
        );
    }


    function resultadosHtml(items) {
        return items.map(item => `
            <div class="resultado">
                <span>${item[0]}</span>
                <strong>${item[1]}</strong>
            </div>
        `).join("");
    }


    async function pedirJson(url, params) {
        const respuesta = await fetch(`${url}?${params.toString()}`);
        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.detail || "No se pudo completar la operación.");
        }

        return data;
    }


    function validarNumeroFinito(errores, id, nombre, unidad = "") {
        const valor = numero(id);

        if (!Number.isFinite(valor)) {
            errores.push(
                crearError(
                    [id],
                    id,
                    `${nombre} está vacío o no contiene un número válido${unidad ? ` (${unidad})` : ""}.`
                )
            );
        }

        return valor;
    }


    function validarSegmentos() {
        const errores = [];
        const a = validarNumeroFinito(errores, "capaA", "Capa A");
        const b = validarNumeroFinito(errores, "capaB", "Capa B");
        const c = validarNumeroFinito(errores, "capaC", "Capa C");

        [
            ["capaA", "Capa A", a],
            ["capaB", "Capa B", b],
            ["capaC", "Capa C", c]
        ].forEach(item => {
            const [id, nombre, valor] = item;

            if (Number.isFinite(valor) && !Number.isInteger(valor)) {
                errores.push(
                    crearError([id], id, `${nombre} = ${valor} no es válido. Debe ser un número entero.`)
                );
            } else if (Number.isFinite(valor) && valor < 0) {
                errores.push(
                    crearError([id], id, `${nombre} = ${valor} no es válido. No puede ser negativo.`)
                );
            } else if (Number.isFinite(valor) && valor > 13) {
                errores.push(
                    crearError([id], id, `${nombre} = ${valor} no es válido. No puede superar 13 segmentos.`)
                );
            }
        });

        if (
            Number.isFinite(a) &&
            Number.isFinite(b) &&
            Number.isFinite(c) &&
            Number.isInteger(a) &&
            Number.isInteger(b) &&
            Number.isInteger(c) &&
            a >= 0 && b >= 0 && c >= 0 &&
            a + b + c > 13
        ) {
            errores.push(
                crearError(
                    ["capaA", "capaB", "capaC"],
                    "capaC",
                    `La distribución usa ${a + b + c} segmentos y supera los 13 segmentos activos.`
                )
            );
        }

        return errores;
    }


    function validarCobertura() {
        const errores = [];
        const radio = validarNumeroFinito(errores, "radioKm", "Radio", "km");

        if (Number.isFinite(radio) && radio <= 0) {
            errores.push(
                crearError(
                    ["radioKm"],
                    "radioKm",
                    `radio = ${radio} km no es válido. Debe ser mayor que 0 km.`
                )
            );
        }

        return errores;
    }


    function validarTsA() {
        const errores = [];
        const bitrate = validarNumeroFinito(
            errores,
            "bitrateTs",
            "Bitrate TS",
            "Mbps"
        );

        if (Number.isFinite(bitrate) && bitrate <= 0) {
            errores.push(
                crearError(
                    ["bitrateTs"],
                    "bitrateTs",
                    `Bitrate TS = ${bitrate} Mbps no es válido. Debe ser mayor que 0 Mbps.`
                )
            );
        }

        return errores;
    }


    function validarTsB() {
        const errores = [];
        const video = validarNumeroFinito(errores, "videoMbps", "Video", "Mbps");
        const audio = validarNumeroFinito(errores, "audioKbps", "Audio", "kbps");
        const datosV = validarNumeroFinito(errores, "datosKbps", "Datos", "kbps");

        [
            ["videoMbps", "Video", video, "Mbps"],
            ["audioKbps", "Audio", audio, "kbps"],
            ["datosKbps", "Datos", datosV, "kbps"]
        ].forEach(item => {
            const [id, nombre, valor, unidad] = item;

            if (Number.isFinite(valor) && valor < 0) {
                errores.push(
                    crearError(
                        [id],
                        id,
                        `${nombre} = ${valor} ${unidad} no es válido. No puede ser negativo.`
                    )
                );
            }
        });

        if (
            Number.isFinite(video) &&
            Number.isFinite(audio) &&
            Number.isFinite(datosV) &&
            video === 0 && audio === 0 && datosV === 0
        ) {
            errores.push(
                crearError(
                    ["videoMbps", "audioKbps", "datosKbps"],
                    "datosKbps",
                    "Video, audio y datos no pueden ser todos cero al mismo tiempo."
                )
            );
        }

        return errores;
    }


    function marcarErroresTs(erroresA, erroresB) {
        limpiarErroresVisuales();

        [...erroresA, ...erroresB].forEach(item => {
            item.ids.forEach(id => {
                marcarCampoError(
                    id,
                    item.mensaje,
                    id === item.principal
                );
            });
        });

        estadoTs.errorA = erroresA.length > 0
            ? erroresA.map(item => item.mensaje).join(" ")
            : null;

        estadoTs.errorB = erroresB.length > 0
            ? erroresB.map(item => item.mensaje).join(" ")
            : null;

        const todos = [...erroresA, ...erroresB];

        if (todos.length > 0) {
            const detalle = todos
                .map(item => `• ${item.mensaje}`)
                .join("\n");

            setEstado(
                `ERROR DE PARÁMETROS\n${detalle}`,
                true
            );
        } else {
            setEstado(
                "Cálculos de Transport Stream completados."
            );
        }
    }


    function validarGuarda() {
        const errores = [];
        const tu = validarNumeroFinito(errores, "tuMs", "Tu", "ms");
        const eco = validarNumeroFinito(errores, "ecoMs", "Retraso del eco", "ms");

        if (Number.isFinite(tu) && tu <= 0) {
            errores.push(
                crearError(
                    ["tuMs"],
                    "tuMs",
                    `Tu = ${tu} ms no es válido. Debe ser mayor que 0 ms.`
                )
            );
        }

        if (Number.isFinite(eco) && eco < 0) {
            errores.push(
                crearError(
                    ["ecoMs"],
                    "ecoMs",
                    `Retraso del eco = ${eco} ms no es válido. No puede ser negativo.`
                )
            );
        }

        return errores;
    }


    function mostrarParametros(tab) {
        seccionesParametros.forEach(seccion => {
            seccion.classList.remove("activa");
        });

        const mapa = {
            video: "paramVideo",
            isdb: "paramIsdb",
            segmentos: "paramSegmentos",
            cobertura: "paramCobertura",
            ts: "paramTs",
            guarda: "paramGuarda",
            medios: "paramMedios"
        };

        document.getElementById(mapa[tab]).classList.add("activa");
    }


    function actualizarVisibilidadFuente(tab) {
        // La fuente audiovisual está ubicada únicamente en VIDEO DIGITAL.
        // Su estado se conserva al cambiar de pestaña y se resume en Transport Stream.
    }


    function mensajeVista(tab) {
        const mensajes = {
            video: "Vista VIDEO DIGITAL. Analice la fuente audiovisual, su resolución y los píxeles por cuadro.",
            isdb: "Vista ISDB-Tb. Seleccione modulación y tipo de recepción.",
            segmentos: "Vista SEGMENTOS. Distribuya las capas dentro de los 13 segmentos activos.",
            cobertura: "Vista COBERTURA. El radio es un dato de entrada; se calcula solo el área ideal.",
            ts: "Vista TRANSPORT STREAM. Los cálculos A y B son independientes.",
            guarda: "Vista INTERVALO DE GUARDA. Calcule Tg, tiempo total y eficiencia.",
            medios: "Vista MEDIOS / DIAGNÓSTICO. Compare la cadena y fallas básicas de cada sistema."
        };

        return mensajes[tab] || "Simulador preparado.";
    }


    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("activo"));
            contenidos.forEach(c => c.classList.remove("activo"));

            tab.classList.add("activo");
            const nombre = tab.dataset.tab;
            document.getElementById(nombre).classList.add("activo");
            mostrarParametros(nombre);
            actualizarVisibilidadFuente(nombre);
            actualizarResultados(nombre);
            setEstado(mensajeVista(nombre));
        });
    });


    function actualizarResultados(tab) {
        const cont = document.getElementById("resultadosContenido");

        if (tab === "video") {
            const video = document.getElementById("videoLocal");
            if (fuenteAv.tipo === "LOCAL" && video && video.videoWidth && video.videoHeight) {
                const w = video.videoWidth;
                const h = video.videoHeight;
                const pix = w * h;
                cont.innerHTML = resultadosHtml([
                    ["Fuente", fuenteAv.archivoNombre || "Archivo local"],
                    ["Resolución", `${w} x ${h}`],
                    ["Relación de aspecto", relacionAspecto(w, h)],
                    ["Píxeles por cuadro", pix.toLocaleString("es-BO")]
                ]);
            } else if (fuenteAv.tipo === "NINGUNA") {
                cont.innerHTML = resultadosHtml([
                    ["Fuente", "Sin fuente audiovisual"],
                    ["Estado", "Video opcional; el resto del simulador funciona normalmente"]
                ]);
            } else if (fuenteAv.tipo === "YOUTUBE") {
                cont.innerHTML = resultadosHtml([
                    ["Fuente", descripcionFuenteActual()],
                    ["Resolución", "No disponible desde YouTube"],
                    ["Píxeles por cuadro", "No disponible"]
                ]);
            } else {
                cont.innerHTML = resultadosHtml([
                    ["Fuente", "Patrón de prueba"],
                    ["Resolución", "—"],
                    ["Análisis", "Seleccione un archivo local para medir su resolución"]
                ]);
            }
            return;
        }

        if (tab === "isdb") {
            if (!datos.isdb) {
                mostrarSinResultados("Sin resultados de ISDB-Tb.");
                return;
            }

            cont.innerHTML = resultadosHtml([
                ["Modulación", datos.isdb.modulacion],
                ["Capacidad relativa", datos.isdb.capacidad],
                ["Robustez relativa", datos.isdb.robustez],
                ["Recepción", datos.isdb.servicio],
                ["Segmentos activos", `${datos.isdb.segmentos_activos}`],
                ["Ancho por segmento", `${fmt(datos.isdb.ancho_segmento_khz, 1)} kHz`]
            ]);
            return;
        }

        if (tab === "segmentos") {
            if (!datos.segmentos) {
                mostrarSinResultados("Sin distribución válida de segmentos.");
                return;
            }

            cont.innerHTML = resultadosHtml([
                ["Capa A", `${datos.segmentos.capa_a} segmentos`],
                ["Capa B", `${datos.segmentos.capa_b} segmentos`],
                ["Capa C", `${datos.segmentos.capa_c} segmentos`],
                ["Total usado", `${datos.segmentos.total} / 13`],
                ["Sin asignar", `${datos.segmentos.restantes}`],
                ["Estado", "Distribución válida"]
            ]);
            return;
        }

        if (tab === "cobertura") {
            if (!datos.cobertura) {
                mostrarSinResultados("Sin cálculo de cobertura.");
                return;
            }

            cont.innerHTML = resultadosHtml([
                ["Radio dado", `${fmt(datos.cobertura.radio_km, 2)} km`],
                ["Área ideal aproximada", `${fmt(datos.cobertura.area_km2, 2)} km²`],
                ["Modelo", "Circular ideal"]
            ]);
            return;
        }

        if (tab === "ts") {
            let html = "";

            if (datos.tsA) {
                html += resultadosHtml([
                    ["Cálculo A — Paquete TS", `${datos.tsA.paquete_bytes} bytes`],
                    ["Cálculo A — Paquete TS", `${datos.tsA.paquete_bits} bits`],
                    ["Cálculo A — Bitrate TS", `${fmt(datos.tsA.bitrate_ts_mbps, 3)} Mbps`],
                    ["Cálculo A — Paquetes por segundo", `${fmt(datos.tsA.paquetes_por_segundo, 1)}`]
                ]);
            } else {
                html += `
                    <div class="resultado ${estadoTs.errorA ? "resultado-error" : ""}">
                        <span>Cálculo A — Estado</span>
                        <strong>${estadoTs.errorA || "Sin cálculo."}</strong>
                    </div>
                `;
            }

            if (datos.tsB) {
                html += resultadosHtml([
                    ["Cálculo B — Tasa de servicios", `${fmt(datos.tsB.tasa_servicios_mbps, 3)} Mbps`]
                ]);
            } else {
                html += `
                    <div class="resultado ${estadoTs.errorB ? "resultado-error" : ""}">
                        <span>Cálculo B — Estado</span>
                        <strong>${estadoTs.errorB || "Sin cálculo."}</strong>
                    </div>
                `;
            }

            cont.innerHTML = html;
            return;
        }

        if (tab === "guarda") {
            if (!datos.guarda) {
                mostrarSinResultados("Sin cálculo de intervalo de guarda.");
                return;
            }

            cont.innerHTML = resultadosHtml([
                ["Tu", `${fmtTiempoMs(datos.guarda.Tu_ms)} ms`],
                ["Fracción", datos.guarda.fraccion],
                ["Tg", `${fmtTiempoMs(datos.guarda.Tg_ms)} ms`],
                ["T total", `${fmtTiempoMs(datos.guarda.Ttotal_ms)} ms`],
                ["Eficiencia", `${fmt(datos.guarda.eficiencia_porcentaje, 1)} %`],
                ["Eco", datos.guarda.eco_dentro ? "Dentro de Tg" : "Supera Tg"]
            ]);
            return;
        }

        if (tab === "medios") {
            if (!datos.medios) {
                mostrarSinResultados("Sin análisis del medio seleccionado.");
                return;
            }

            cont.innerHTML = resultadosHtml([
                ["Sistema", datos.medios.nombre],
                ["Medio principal", datos.medios.medio],
                ["Equipo típico", datos.medios.equipo],
                ["Problema común", datos.medios.problema]
            ]);
        }
    }


    function dibujarSegmentos(data) {
        const cont = document.getElementById("mapaSegmentos");

        cont.innerHTML = data.mapa.map((capa, indice) => {
            let clase = "sin-asignar";

            if (capa === "A") clase = "capa-a";
            if (capa === "B") clase = "capa-b";
            if (capa === "C") clase = "capa-c";

            const etiqueta = capa === "SIN ASIGNAR" ? "—" : capa;

            return `
                <div class="segmento ${clase}">
                    ${indice + 1}
                    <small>${etiqueta}</small>
                </div>
            `;
        }).join("");
    }


    function limpiarSegmentos() {
        datos.segmentos = null;
        document.getElementById("mapaSegmentos").innerHTML = "";
        document.getElementById("segmentosResumen").textContent = "—";
        document.getElementById("segmentosAncho").textContent = "—";
    }


    function dibujarCobertura(data) {
        const canvas = document.getElementById("grafCobertura");
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const radioPx = Math.min(w, h) * 0.34;

        ctx.fillStyle = "rgba(30, 103, 173, 0.12)";
        ctx.strokeStyle = "#1e67ad";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radioPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + radioPx, cy);
        ctx.stroke();

        ctx.fillStyle = "#174d84";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`r = ${fmt(data.radio_km, 2)} km`, cx + radioPx / 2, cy - 8);
        ctx.fillText(`A ≈ ${fmt(data.area_km2, 2)} km²`, cx, cy + 24);

        ctx.fillStyle = "#666";
        ctx.font = "12px Arial";
        ctx.fillText("Representación circular ideal, no mapa real", cx, h - 18);
        ctx.textAlign = "start";
    }


    function limpiarCobertura() {
        datos.cobertura = null;
        document.getElementById("coberturaCalculo").textContent = "—";

        const canvas = document.getElementById("grafCobertura");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#777";
        ctx.font = "13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Parámetros inválidos", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "start";
    }


    function dibujarBarraGuarda(data) {
        const cont = document.getElementById("barraTiempo");
        const pGuarda = data.Tg_ms / data.Ttotal_ms * 100;
        const pUtil = data.Tu_ms / data.Ttotal_ms * 100;
        const cantidad = Number(document.getElementById("ventanaSimbolos").value);

        document.getElementById("ventanaSimbolosInfo").textContent =
            `Se observan ${cantidad} símbolo${cantidad === 1 ? "" : "s"} consecutivo${cantidad === 1 ? "" : "s"}. Cada símbolo: Ttotal = ${fmtTiempoMs(data.Ttotal_ms)} ms.`;

        cont.innerHTML = Array.from({length: cantidad}, (_, indice) => `
            <div class="simbolo-fila">
                <div class="simbolo-etiqueta">Símbolo ${indice + 1}</div>
                <div class="barra-tiempo">
                    <div class="barra-guarda" style="width:${pGuarda}%">
                        <strong>Tg</strong>
                        <span>${fmtTiempoMs(data.Tg_ms)} ms</span>
                    </div>
                    <div class="barra-util" style="width:${pUtil}%">
                        <strong>Tu</strong>
                        <span>${fmtTiempoMs(data.Tu_ms)} ms</span>
                    </div>
                </div>
            </div>
        `).join("");
    }


    function limpiarGuarda() {
        datos.guarda = null;
        document.getElementById("guardaCalculo").textContent = "—";
        document.getElementById("guardaEficiencia").textContent = "—";
        document.getElementById("guardaEco").textContent = "—";
        document.getElementById("ventanaSimbolosInfo").textContent = "—";
        document.getElementById("barraTiempo").innerHTML = "";
    }


    function dibujarCadenaMedio(data) {
        const cont = document.getElementById("cadenaMedio");

        cont.innerHTML = data.cadena.map((bloque, indice) => {
            const flecha = indice < data.cadena.length - 1
                ? '<div class="flecha">→</div>'
                : '';

            return `<div class="bloque-cadena">${bloque}</div>${flecha}`;
        }).join("");
    }


    async function simularIsdb() {
        limpiarErroresVisuales();
        setEstado("Analizando ISDB-Tb...");

        const params = new URLSearchParams({
            modulacion: document.getElementById("modulacion").value,
            servicio: document.getElementById("servicio").value
        });

        try {
            const data = await pedirJson("/prueba-tv-isdb", params);
            datos.isdb = data;

            document.getElementById("isdbCapacidad").textContent = data.capacidad;
            document.getElementById("isdbRobustez").textContent = data.robustez;
            document.getElementById("isdbDescripcionMod").textContent = data.descripcion_modulacion;
            document.getElementById("isdbServicio").textContent = `${data.servicio}: ${data.descripcion_servicio}`;

            actualizarVistaCanalIsdb();
            actualizarResultados("isdb");
            setEstado("Análisis ISDB-Tb completado.");
        } catch (error) {
            datos.isdb = null;
            setEstado(`ERROR\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
        }
    }


    async function simularSegmentos() {
        const errores = validarSegmentos();

        if (errores.length > 0) {
            limpiarSegmentos();
            mostrarErrores(errores);
            return;
        }

        limpiarErroresVisuales();
        setEstado("Distribuyendo segmentos...");

        const params = new URLSearchParams({
            capa_a: numero("capaA"),
            capa_b: numero("capaB"),
            capa_c: numero("capaC")
        });

        try {
            const data = await pedirJson("/prueba-tv-segmentos", params);
            datos.segmentos = data;
            dibujarSegmentos(data);

            document.getElementById("segmentosResumen").textContent =
                `Usados: ${data.total} de 13. Sin asignar: ${data.restantes}.`;

            document.getElementById("segmentosAncho").textContent =
                `6 MHz / 14 ≈ ${fmt(data.ancho_segmento_khz, 1)} kHz por segmento.`;

            actualizarResultados("segmentos");
            setEstado("Distribución de segmentos completada.");
        } catch (error) {
            limpiarSegmentos();
            setEstado(`ERROR DE PARÁMETROS\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
        }
    }


    async function simularCobertura() {
        const errores = validarCobertura();

        if (errores.length > 0) {
            limpiarCobertura();
            mostrarErrores(errores);
            return;
        }

        limpiarErroresVisuales();
        setEstado("Calculando área ideal...");

        const params = new URLSearchParams({
            radio_km: numero("radioKm")
        });

        try {
            const data = await pedirJson("/prueba-tv-cobertura", params);
            datos.cobertura = data;

            document.getElementById("coberturaCalculo").textContent =
                `A = pi x ${fmt(data.radio_km, 2)}² ≈ ${fmt(data.area_km2, 2)} km².`;

            dibujarCobertura(data);
            actualizarResultados("cobertura");
            setEstado("Cálculo de área completado.");
        } catch (error) {
            limpiarCobertura();
            setEstado(`ERROR DE PARÁMETROS\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
        }
    }


    async function simularTs() {
        const erroresA = validarTsA();
        const erroresB = validarTsB();

        datos.tsA = null;
        datos.tsB = null;

        document.getElementById("tsPaquetes").textContent = "—";
        document.getElementById("tsServicios").textContent = "—";

        marcarErroresTs(
            erroresA,
            erroresB
        );

        if (erroresA.length === 0) {
            const paramsA = new URLSearchParams({
                bitrate_ts_mbps: numero("bitrateTs"),
                video_mbps: 1,
                audio_kbps: 0,
                datos_kbps: 0
            });

            try {
                datos.tsA = await pedirJson(
                    "/prueba-tv-ts",
                    paramsA
                );

                document.getElementById("tsPaquetes").textContent =
                    `${fmt(datos.tsA.bitrate_ts_mbps, 3)} Mbps / 1504 bits ≈ ${fmt(datos.tsA.paquetes_por_segundo, 1)} paquetes/s.`;
            } catch (error) {
                datos.tsA = null;
                estadoTs.errorA = error.message;
            }
        }

        if (erroresB.length === 0) {
            const paramsB = new URLSearchParams({
                bitrate_ts_mbps: 1,
                video_mbps: numero("videoMbps"),
                audio_kbps: numero("audioKbps"),
                datos_kbps: numero("datosKbps")
            });

            try {
                datos.tsB = await pedirJson(
                    "/prueba-tv-ts",
                    paramsB
                );

                document.getElementById("tsServicios").textContent =
                    `${fmt(datos.tsB.video_mbps, 3)} Mbps + ${fmt(datos.tsB.audio_kbps, 0)} kbps + ${fmt(datos.tsB.datos_kbps, 0)} kbps = ${fmt(datos.tsB.tasa_servicios_mbps, 3)} Mbps.`;
            } catch (error) {
                datos.tsB = null;
                estadoTs.errorB = error.message;
            }
        }

        document.getElementById("tsNota").textContent =
            "Los cálculos A y B son independientes. El cálculo A usa el bitrate total TS para obtener paquetes por segundo. " +
            "El cálculo B suma video, audio y datos como un ejercicio separado. No se debe interpretar que el bitrate TS de A " +
            "contiene necesariamente las tasas introducidas en B.";

        renderVentanaTs();
        actualizarResultados("ts");

        if (erroresA.length === 0 && erroresB.length === 0 && datos.tsA && datos.tsB) {
            setEstado(
                "Cálculos de Transport Stream completados."
            );
        } else if (estadoTs.errorA || estadoTs.errorB) {
            const mensajes = [];

            if (estadoTs.errorA) {
                mensajes.push(`• Cálculo A: ${estadoTs.errorA}`);
            }

            if (estadoTs.errorB) {
                mensajes.push(`• Cálculo B: ${estadoTs.errorB}`);
            }

            setEstado(
                `ERROR DE PARÁMETROS\n${mensajes.join("\n")}`,
                true
            );
        }
    }


    async function simularGuarda() {
        const errores = validarGuarda();

        if (errores.length > 0) {
            limpiarGuarda();
            mostrarErrores(errores);
            return;
        }

        limpiarErroresVisuales();
        setEstado("Calculando intervalo de guarda...");

        const params = new URLSearchParams({
            Tu_ms: numero("tuMs"),
            fraccion: document.getElementById("fraccionGuarda").value,
            eco_ms: numero("ecoMs")
        });

        try {
            const data = await pedirJson("/prueba-tv-guarda", params);
            datos.guarda = data;

            document.getElementById("guardaCalculo").textContent =
                `Tg = ${fmtTiempoMs(data.Tg_ms)} ms; Ttotal = ${fmtTiempoMs(data.Ttotal_ms)} ms.`;

            document.getElementById("guardaEficiencia").textContent =
                `eficiencia = ${fmt(data.eficiencia_porcentaje, 1)} %.`;

            const interpretacionEco = String(data.interpretacion_eco || "")
                .replace(" del modelo didáctico", "")
                .replace(" del modelo didactico", "");

            document.getElementById("guardaEco").textContent =
                `Eco = ${fmtTiempoMs(data.eco_ms)} ms. ${interpretacionEco}`;

            dibujarBarraGuarda(data);
            actualizarResultados("guarda");
            setEstado("Cálculo de intervalo de guarda completado.");
        } catch (error) {
            limpiarGuarda();
            setEstado(`ERROR DE PARÁMETROS\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
        }
    }


    async function simularMedio() {
        limpiarErroresVisuales();
        setEstado("Analizando medio de televisión digital...");

        const params = new URLSearchParams({
            sistema: document.getElementById("sistemaMedio").value
        });

        try {
            const data = await pedirJson("/prueba-tv-medio", params);
            datos.medios = data;

            dibujarCadenaMedio(data);

            document.getElementById("medioDescripcion").textContent =
                `${data.nombre}: ${data.medio}. Equipo típico: ${data.equipo}.`;

            document.getElementById("medioDiagnostico").textContent =
                `${data.problema}. ${data.diagnostico}`;

            actualizarResultados("medios");
            setEstado("Análisis del sistema completado.");
        } catch (error) {
            datos.medios = null;
            document.getElementById("cadenaMedio").innerHTML = "";
            document.getElementById("medioDescripcion").textContent = "—";
            document.getElementById("medioDiagnostico").textContent = "—";
            setEstado(`ERROR\n${error.message}`, true);
            mostrarSinResultados(error.message, true);
        }
    }


    document.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", () => {
            if (campo.classList.contains("campo-error")) {
                campo.classList.remove("campo-error");
                campo.removeAttribute("aria-invalid");

                const grupo = campo.closest(".grupo");

                if (grupo) {
                    grupo.classList.remove("grupo-error");
                    const aviso = grupo.querySelector(".error-campo");
                    if (aviso) aviso.remove();
                }
            }

            if (document.getElementById("estado").classList.contains("estado-error")) {
                setEstado("Dato modificado. Pulse nuevamente el botón de cálculo.");
            }
        });
    });


    document.getElementById("tipoFuenteAv").addEventListener("change", cambiarFuenteAudiovisual);
    document.getElementById("archivoVideo").addEventListener("change", cargarArchivoVideo);
    document.getElementById("btnCargarYoutube").addEventListener("click", cargarYoutubeDesdeEntrada);
    document.getElementById("btnAvPlay").addEventListener("click", () => controlarFuente("play"));
    document.getElementById("btnAvPausa").addEventListener("click", () => controlarFuente("pause"));
    document.getElementById("btnAvStop").addEventListener("click", () => controlarFuente("stop"));
    document.getElementById("btnAvReinicio").addEventListener("click", () => controlarFuente("restart"));
    document.getElementById("btnCapturarCuadro").addEventListener("click", capturarCuadroActual);
    document.getElementById("btnActualizarVideo").addEventListener("click", () => {
        actualizarMetadatosFuente();
        actualizarAnalisisVideoDigital();
        actualizarResultados("video");
        setEstado("Análisis de video digital actualizado.");
    });

    document.getElementById("videoLocal").addEventListener("loadedmetadata", () => {
        document.getElementById("estadoFuente").textContent = "Archivo local cargado.";
        actualizarMetadatosFuente();
    });
    document.getElementById("videoLocal").addEventListener("timeupdate", actualizarMetadatosFuente);
    document.getElementById("videoLocal").addEventListener("ended", actualizarMetadatosFuente);

    document.getElementById("ventanaIsdb").addEventListener("change", actualizarVistaCanalIsdb);
    document.getElementById("ventanaPaquetes").addEventListener("change", renderVentanaTs);
    document.getElementById("ventanaSimbolos").addEventListener("change", () => {
        if (datos.guarda) dibujarBarraGuarda(datos.guarda);
    });

    document.getElementById("btnIsdb").addEventListener("click", simularIsdb);
    document.getElementById("btnSegmentos").addEventListener("click", simularSegmentos);
    document.getElementById("btnCobertura").addEventListener("click", simularCobertura);
    document.getElementById("btnTs").addEventListener("click", simularTs);
    document.getElementById("btnGuarda").addEventListener("click", simularGuarda);
    document.getElementById("btnMedio").addEventListener("click", simularMedio);


    async function iniciar() {
        await simularIsdb();
        await simularSegmentos();
        await simularCobertura();
        await simularTs();
        await simularGuarda();
        await simularMedio();

        cambiarFuenteAudiovisual();
        actualizarVistaCanalIsdb();
        renderVentanaTs();
        iniciarActualizacionFuente();
        limpiarCapturaVideo("No hay video local cargado");
        actualizarAnalisisVideoDigital();
        actualizarVisibilidadFuente("isdb");

        mostrarParametros("isdb");
        actualizarResultados("isdb");
        setEstado("Simulador preparado. El video es opcional.");
    }


    iniciar();
