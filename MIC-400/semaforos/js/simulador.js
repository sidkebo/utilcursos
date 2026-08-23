/*
 * LÓGICA DEL SIMULADOR
 *
 * Este archivo controla:
 * - botones;
 * - temporizador;
 * - encendido de luces;
 * - barras de progreso;
 * - seguimiento independiente;
 * - aplicación automática de calibración relativa.
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const config = window.CONFIGURACION_SEMAFOROS;

  if (!config) {
    console.error("No se encontró CONFIGURACION_SEMAFOROS.");
    return;
  }

  const elementos = {
    btnIniciar: document.getElementById("btnIniciar"),
    btnPausar: document.getElementById("btnPausar"),
    btnSiguiente: document.getElementById("btnSiguiente"),
    btnReiniciar: document.getElementById("btnReiniciar"),

    tiempoVerde: document.getElementById("tiempoVerde"),
    tiempoAmarillo: document.getElementById("tiempoAmarillo"),
    tiempoRojoCalculado: document.getElementById("tiempoRojoCalculado"),

    textoEjecucion: document.getElementById("textoEjecucion"),
    puntoEjecucion: document.getElementById("puntoEjecucion"),

    nombreFase: document.getElementById("nombreFase"),
    mensaje: document.getElementById("mensaje"),

    estadoA: document.getElementById("estadoA"),
    tiempoA: document.getElementById("tiempoA"),
    duracionA: document.getElementById("duracionA"),
    indicadorA: document.getElementById("indicadorA"),
    progresoA: document.getElementById("progresoA"),

    estadoB: document.getElementById("estadoB"),
    tiempoB: document.getElementById("tiempoB"),
    duracionB: document.getElementById("duracionB"),
    indicadorB: document.getElementById("indicadorB"),
    progresoB: document.getElementById("progresoB"),

    estadoPedLeft: document.getElementById("estadoPedLeft"),
    tiempoPedLeft: document.getElementById("tiempoPedLeft"),
    duracionPedLeft: document.getElementById("duracionPedLeft"),
    indicadorPedLeft: document.getElementById("indicadorPedLeft"),
    progresoPedLeft: document.getElementById("progresoPedLeft"),

    estadoPedRight: document.getElementById("estadoPedRight"),
    tiempoPedRight: document.getElementById("tiempoPedRight"),
    duracionPedRight: document.getElementById("duracionPedRight"),
    indicadorPedRight: document.getElementById("indicadorPedRight"),
    progresoPedRight: document.getElementById("progresoPedRight"),

    imagenCruce: document.getElementById("imagenCruce"),
    capaLuces: document.getElementById("capaLuces")
  };

  let intervalo = null;
  let indiceFase = 0;
  let segundosRestantes = 0;

  configurarValoresIniciales();
  registrarEventos();
  prepararCalibracionVisual();
  ejecutarFase(0);

  function configurarValoresIniciales() {
    elementos.tiempoVerde.value = config.tiempos.verdeInicial;
    elementos.tiempoAmarillo.value = config.tiempos.amarilloInicial;

    elementos.tiempoVerde.min = config.tiempos.verdeMinimo;
    elementos.tiempoVerde.max = config.tiempos.verdeMaximo;

    elementos.tiempoAmarillo.min = config.tiempos.amarilloMinimo;
    elementos.tiempoAmarillo.max = config.tiempos.amarilloMaximo;

    actualizarRojoCalculado();
  }

  function registrarEventos() {
    elementos.btnIniciar.addEventListener("click", iniciar);
    elementos.btnPausar.addEventListener("click", pausar);
    elementos.btnSiguiente.addEventListener("click", avanzarFase);
    elementos.btnReiniciar.addEventListener("click", reiniciar);

    [elementos.tiempoVerde, elementos.tiempoAmarillo].forEach(function (campo) {
      campo.addEventListener("input", function () {
        actualizarRojoCalculado();
        actualizarPaneles();
      });

      campo.addEventListener("change", function () {
        actualizarRojoCalculado();
        ejecutarFase(indiceFase);
      });
    });

    if (elementos.imagenCruce) {
      elementos.imagenCruce.addEventListener("load", aplicarCalibracionVisual);
    }

    window.addEventListener("resize", aplicarCalibracionVisual);
  }

  function prepararCalibracionVisual() {
    if (elementos.imagenCruce && elementos.imagenCruce.complete) {
      aplicarCalibracionVisual();
    }
  }

  function aplicarCalibracionVisual() {
    if (!elementos.imagenCruce || !elementos.capaLuces) {
      return;
    }

    const anchoBase = elementos.imagenCruce.naturalWidth || config.calibracion.imagen.ancho;
    const altoBase = elementos.imagenCruce.naturalHeight || config.calibracion.imagen.alto;

    elementos.capaLuces.setAttribute("viewBox", "0 0 " + anchoBase + " " + altoBase);

    const radioVehicular = anchoBase * config.calibracion.radiosRelativos.vehicular;
    const radioPeatonal = anchoBase * config.calibracion.radiosRelativos.peatonal;

    Object.keys(config.calibracion.posicionesRelativas).forEach(function (id) {
      const foco = document.getElementById(id);
      const posicion = config.calibracion.posicionesRelativas[id];

      if (!foco || !posicion) {
        return;
      }

      foco.setAttribute("cx", (posicion.x * anchoBase).toFixed(2));
      foco.setAttribute("cy", (posicion.y * altoBase).toFixed(2));
      foco.setAttribute("r", esPeatonal(id) ? radioPeatonal.toFixed(2) : radioVehicular.toFixed(2));
    });
  }

  function esPeatonal(id) {
    return id.indexOf("ped") === 0;
  }

  function limitarNumero(valor, minimo, maximo, defecto) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return defecto;
    }

    return Math.min(maximo, Math.max(minimo, Math.round(numero)));
  }

  function leerTiempos() {
    const verde = limitarNumero(
      elementos.tiempoVerde.value,
      config.tiempos.verdeMinimo,
      config.tiempos.verdeMaximo,
      config.tiempos.verdeInicial
    );

    const amarillo = limitarNumero(
      elementos.tiempoAmarillo.value,
      config.tiempos.amarilloMinimo,
      config.tiempos.amarilloMaximo,
      config.tiempos.amarilloInicial
    );

    return {
      verde: verde,
      amarillo: amarillo,
      rojo: verde + amarillo
    };
  }

  function actualizarRojoCalculado() {
    const tiempos = leerTiempos();
    elementos.tiempoRojoCalculado.value = tiempos.rojo;
  }

  function obtenerFases() {
    const tiempos = leerTiempos();

    return config.crearFases(tiempos.verde, tiempos.amarillo);
  }

  function apagarTodasLasLuces() {
    document.querySelectorAll(".foco").forEach(function (foco) {
      foco.classList.remove("foco--encendido");
    });
  }

  function encenderLuz(id) {
    const foco = document.getElementById(id);

    if (foco) {
      foco.classList.add("foco--encendido");
    }
  }

  function ejecutarFase(nuevoIndice) {
    const fases = obtenerFases();

    indiceFase = ((nuevoIndice % fases.length) + fases.length) % fases.length;

    const fase = fases[indiceFase];

    apagarTodasLasLuces();
    fase.luces.forEach(encenderLuz);

    segundosRestantes = fase.duracion;

    elementos.nombreFase.textContent = fase.nombre;
    elementos.mensaje.textContent = fase.descripcion;

    actualizarPaneles();
  }

  function avanzarFase() {
    const fases = obtenerFases();
    indiceFase = (indiceFase + 1) % fases.length;
    ejecutarFase(indiceFase);
  }

  function iniciar() {
    if (intervalo !== null) {
      return;
    }

    establecerEstadoEjecucion(true);

    intervalo = window.setInterval(function () {
      segundosRestantes -= 1;

      if (segundosRestantes <= 0) {
        avanzarFase();
        return;
      }

      actualizarPaneles();
    }, 1000);
  }

  function pausar() {
    if (intervalo !== null) {
      window.clearInterval(intervalo);
      intervalo = null;
    }

    establecerEstadoEjecucion(false, "Pausado");
  }

  function reiniciar() {
    if (intervalo !== null) {
      window.clearInterval(intervalo);
      intervalo = null;
    }

    indiceFase = 0;
    ejecutarFase(0);
    establecerEstadoEjecucion(false, "Detenido");
  }

  function establecerEstadoEjecucion(activo, texto) {
    elementos.btnIniciar.disabled = activo;

    elementos.textoEjecucion.textContent = texto || (activo ? "En ejecución" : "Detenido");

    elementos.puntoEjecucion.classList.toggle("estado-ejecucion__punto--activo", activo);
  }

  function porcentaje(restante, total) {
    if (total <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (restante / total) * 100));
  }

  function obtenerEstados() {
    const tiempos = leerTiempos();

    let semA;
    let semB;
    let pedLeft;
    let pedRight;

    switch (indiceFase) {
      case 0:
        semA = estado("Verde", segundosRestantes, tiempos.verde);
        semB = estado("Rojo", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        pedLeft = estado("Verde", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        pedRight = estado("Rojo", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        break;

      case 1:
        semA = estado("Amarillo", segundosRestantes, tiempos.amarillo);
        semB = estado("Rojo", segundosRestantes, tiempos.rojo);
        pedLeft = estado("Verde", segundosRestantes, tiempos.rojo);
        pedRight = estado("Rojo", segundosRestantes, tiempos.rojo);
        break;

      case 2:
        semA = estado("Rojo", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        semB = estado("Verde", segundosRestantes, tiempos.verde);
        pedLeft = estado("Rojo", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        pedRight = estado("Verde", segundosRestantes + tiempos.amarillo, tiempos.rojo);
        break;

      case 3:
        semA = estado("Rojo", segundosRestantes, tiempos.rojo);
        semB = estado("Amarillo", segundosRestantes, tiempos.amarillo);
        pedLeft = estado("Rojo", segundosRestantes, tiempos.rojo);
        pedRight = estado("Verde", segundosRestantes, tiempos.rojo);
        break;

      default:
        semA = estado("Rojo", 0, tiempos.rojo);
        semB = estado("Rojo", 0, tiempos.rojo);
        pedLeft = estado("Rojo", 0, tiempos.rojo);
        pedRight = estado("Rojo", 0, tiempos.rojo);
    }

    return {
      semA: semA,
      semB: semB,
      pedLeft: pedLeft,
      pedRight: pedRight
    };
  }

  function estado(nombre, restante, total) {
    return {
      nombre: nombre,
      restante: Math.max(0, restante),
      total: total
    };
  }

  function actualizarPaneles() {
    const datos = obtenerEstados();

    actualizarPanel(
      elementos.estadoA,
      elementos.tiempoA,
      elementos.duracionA,
      elementos.indicadorA,
      elementos.progresoA,
      datos.semA
    );

    actualizarPanel(
      elementos.estadoB,
      elementos.tiempoB,
      elementos.duracionB,
      elementos.indicadorB,
      elementos.progresoB,
      datos.semB
    );

    actualizarPanel(
      elementos.estadoPedLeft,
      elementos.tiempoPedLeft,
      elementos.duracionPedLeft,
      elementos.indicadorPedLeft,
      elementos.progresoPedLeft,
      datos.pedLeft
    );

    actualizarPanel(
      elementos.estadoPedRight,
      elementos.tiempoPedRight,
      elementos.duracionPedRight,
      elementos.indicadorPedRight,
      elementos.progresoPedRight,
      datos.pedRight
    );
  }

  function actualizarPanel(
    estadoTexto,
    tiempoTexto,
    duracionTexto,
    indicador,
    barra,
    datos
  ) {
    estadoTexto.textContent = datos.nombre;
    tiempoTexto.textContent = datos.restante + " s";
    duracionTexto.textContent = datos.total + " s";

    indicador.className = "luz-panel luz-panel--" + datos.nombre.toLowerCase();

    barra.style.width = porcentaje(datos.restante, datos.total) + "%";
  }
});
