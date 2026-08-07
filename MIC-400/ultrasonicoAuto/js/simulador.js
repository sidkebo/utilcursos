"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const DISTANCIA_MINIMA = 10;
  const LIMITE_15 = 30;
  const DISTANCIA_MAXIMA = 70;
  const PAUSA_EXTREMOS = 1.5;

  const VELOCIDAD_MAXIMA_SIMULADA = 30;
  const PWM_MAXIMO = 255;

  const X_PARED = 154;
  const DISTANCIA_MAXIMA_REGLA = 120;
  const ESCALA_HASTA_120 = 7.3;
  const X_120_CM = X_PARED + DISTANCIA_MAXIMA_REGLA * ESCALA_HASTA_120;
  const ESCALA_120_A_200 = 0.9;
  const MARGEN_TRANSPARENTE_FRONTAL = 18.214286;

  const estados = {
    HACIA_MINIMO: "hacia_minimo",
    PAUSA_MINIMO: "pausa_minimo",
    HACIA_MAXIMO: "hacia_maximo",
    PAUSA_MAXIMO: "pausa_maximo"
  };

  const elementos = {
    btnIniciar: document.getElementById("btnIniciar"),
    btnPausar: document.getElementById("btnPausar"),
    btnReiniciar: document.getElementById("btnReiniciar"),
    btnTema: document.getElementById("btnTema"),
    iconoTema: document.getElementById("iconoTema"),
    textoTema: document.getElementById("textoTema"),

    distanciaInicial: document.getElementById("distanciaInicial"),
    pwmControl: document.getElementById("pwmControl"),
    pruebas: document.querySelectorAll("[data-distancia]"),

    escenaSVG: document.getElementById("escenaSVG"),
    arrastreAuto: document.getElementById("arrastreAuto"),
    auto: document.getElementById("auto"),
    sombraAutoSuelo: document.getElementById("sombraAutoSuelo"),
    sensorAutoCuerpo: document.getElementById("sensorAutoCuerpo"),
    sensorAutoLente1: document.getElementById("sensorAutoLente1"),
    sensorAutoLente2: document.getElementById("sensorAutoLente2"),
    ondaSensor1: document.getElementById("ondaSensor1"),
    ondaSensor2: document.getElementById("ondaSensor2"),
    ondaSensor3: document.getElementById("ondaSensor3"),
    conoSensor: document.getElementById("conoSensor"),
    rayoSensor: document.getElementById("rayoSensor"),
    flechaMovimiento: document.getElementById("flechaMovimiento"),
    textoDireccionEscena: document.getElementById("textoDireccionEscena"),
    badgePunto: document.getElementById("badgePunto"),
    etiquetaAutoFondo: document.getElementById("etiquetaAutoFondo"),
    etiquetaAutoTexto: document.getElementById("etiquetaAutoTexto"),
    etiquetaAutoVelocidad: document.getElementById("etiquetaAutoVelocidad"),

    marcadorRecorrido: document.getElementById("marcadorRecorrido"),
    distanciaActual: document.getElementById("distanciaActual"),
    barraDistancia: document.getElementById("barraDistancia"),
    velocidadMotor: document.getElementById("velocidadMotor"),
    barraPWM: document.getElementById("barraPWM"),
    detallePWM: document.getElementById("detallePWM"),
    estadoActual: document.getElementById("estadoActual"),
    descripcionEstado: document.getElementById("descripcionEstado"),
    puntoEstado: document.getElementById("puntoEstado"),
    direccionActual: document.getElementById("direccionActual"),
    pausaRestante: document.getElementById("pausaRestante"),
    ciclosCompletados: document.getElementById("ciclosCompletados"),

    reglaParada: document.getElementById("reglaParada"),
    regla15: document.getElementById("regla15"),
    regla50: document.getElementById("regla50"),
    regla100: document.getElementById("regla100")
  };

  let distancia = 70;
  let estado = estados.HACIA_MINIMO;
  let pausaRestante = 0;
  let ciclos = 0;
  let pasoPorMinimo = false;

  let ejecutando = false;
  let frameId = null;
  let tiempoAnterior = null;

  let arrastrando = false;
  let desplazamientoArrastreX = 0;

  configurarTema();
  registrarEventos();
  reiniciar();

  function registrarEventos() {
    elementos.btnIniciar.addEventListener("click", iniciar);
    elementos.btnPausar.addEventListener("click", pausar);
    elementos.btnReiniciar.addEventListener("click", reiniciar);
    elementos.btnTema.addEventListener("click", alternarTema);

    elementos.arrastreAuto.addEventListener(
      "pointerdown",
      iniciarArrastre
    );

    elementos.arrastreAuto.addEventListener(
      "pointermove",
      moverArrastre
    );

    elementos.arrastreAuto.addEventListener(
      "pointerup",
      finalizarArrastre
    );

    elementos.arrastreAuto.addEventListener(
      "pointercancel",
      finalizarArrastre
    );

    elementos.arrastreAuto.addEventListener(
      "keydown",
      moverConTeclado
    );

    elementos.distanciaInicial.addEventListener("change", function () {
      normalizarDistanciaInicial();

      if (!ejecutando) {
        reiniciar();
      }
    });

    elementos.pruebas.forEach(function (boton) {
      boton.addEventListener("click", function () {
        elementos.distanciaInicial.value = boton.dataset.distancia;
        reiniciar();
      });
    });
  }

  function iniciar() {
    if (ejecutando) {
      return;
    }

    ejecutando = true;
    tiempoAnterior = null;
    elementos.btnIniciar.disabled = true;
    frameId = requestAnimationFrame(animar);
  }

  function pausar() {
    ejecutando = false;
    elementos.btnIniciar.disabled = false;

    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    actualizarInterfaz("pausado");
  }

  function reiniciar() {
    ejecutando = false;

    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    normalizarDistanciaInicial();

    distancia = Number(elementos.distanciaInicial.value);
    tiempoAnterior = null;

    prepararEstadoDesdeDistancia(true);

    elementos.btnIniciar.disabled = false;
    actualizarInterfaz("listo");
  }

  function prepararEstadoDesdeDistancia(reiniciarConteo) {
    pausaRestante = 0;

    if (reiniciarConteo) {
      ciclos = 0;
      pasoPorMinimo = false;
    }

    const tolerancia = 0.05;

    if (distancia < DISTANCIA_MINIMA - tolerancia) {
      estado = estados.HACIA_MAXIMO;
      return;
    }

    if (
      Math.abs(distancia - DISTANCIA_MINIMA) <= tolerancia
    ) {
      distancia = DISTANCIA_MINIMA;
      estado = estados.PAUSA_MINIMO;
      pausaRestante = PAUSA_EXTREMOS;
      pasoPorMinimo = true;
      return;
    }

    if (
      Math.abs(distancia - DISTANCIA_MAXIMA) <= tolerancia
    ) {
      distancia = DISTANCIA_MAXIMA;
      estado = estados.PAUSA_MAXIMO;
      pausaRestante = PAUSA_EXTREMOS;
      return;
    }

    estado = estados.HACIA_MINIMO;
  }

  function iniciarArrastre(evento) {
    if (evento.button !== undefined && evento.button !== 0) {
      return;
    }

    detenerAnimacionParaArrastre();

    const punto = obtenerPuntoSVG(evento);

    if (!punto) {
      return;
    }

    const frenteActual =
      convertirDistanciaAPosicionX(distancia);

    desplazamientoArrastreX =
      punto.x - frenteActual;

    arrastrando = true;

    elementos.arrastreAuto.classList.add(
      "arrastre-auto--activo"
    );

    elementos.arrastreAuto.setPointerCapture(
      evento.pointerId
    );

    evento.preventDefault();
  }

  function moverArrastre(evento) {
    if (!arrastrando) {
      return;
    }

    const punto = obtenerPuntoSVG(evento);

    if (!punto) {
      return;
    }

    const nuevaPosicionFrontal =
      punto.x - desplazamientoArrastreX;

    distancia =
      convertirPosicionXADistancia(
        nuevaPosicionFrontal
      );

    distancia =
      Math.round(distancia * 10) / 10;

    elementos.distanciaInicial.value =
      distancia.toFixed(1);

    prepararEstadoDesdeDistancia(true);
    actualizarInterfaz("arrastrando");

    evento.preventDefault();
  }

  function finalizarArrastre(evento) {
    if (!arrastrando) {
      return;
    }

    arrastrando = false;

    elementos.arrastreAuto.classList.remove(
      "arrastre-auto--activo"
    );

    if (
      elementos.arrastreAuto.hasPointerCapture &&
      elementos.arrastreAuto.hasPointerCapture(
        evento.pointerId
      )
    ) {
      elementos.arrastreAuto.releasePointerCapture(
        evento.pointerId
      );
    }

    elementos.distanciaInicial.value =
      distancia.toFixed(1);

    actualizarInterfaz("listo");
    evento.preventDefault();
  }

  function moverConTeclado(evento) {
    const teclasPermitidas = [
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End"
    ];

    if (!teclasPermitidas.includes(evento.key)) {
      return;
    }

    detenerAnimacionParaArrastre();

    if (evento.key === "ArrowLeft") {
      distancia -= evento.shiftKey ? 5 : 1;
    }

    if (evento.key === "ArrowRight") {
      distancia += evento.shiftKey ? 5 : 1;
    }

    if (evento.key === "Home") {
      distancia = 0;
    }

    if (evento.key === "End") {
      distancia = DISTANCIA_MAXIMA_REGLA;
    }

    distancia = Math.max(
      0,
      Math.min(DISTANCIA_MAXIMA_REGLA, distancia)
    );

    distancia =
      Math.round(distancia * 10) / 10;

    elementos.distanciaInicial.value =
      distancia.toFixed(1);

    prepararEstadoDesdeDistancia(true);
    actualizarInterfaz("listo");

    evento.preventDefault();
  }

  function detenerAnimacionParaArrastre() {
    ejecutando = false;
    elementos.btnIniciar.disabled = false;
    tiempoAnterior = null;

    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function obtenerPuntoSVG(evento) {
    const matriz =
      elementos.escenaSVG.getScreenCTM();

    if (!matriz) {
      return null;
    }

    const punto =
      elementos.escenaSVG.createSVGPoint();

    punto.x = evento.clientX;
    punto.y = evento.clientY;

    return punto.matrixTransform(
      matriz.inverse()
    );
  }

  function convertirPosicionXADistancia(posicionX) {
    const posicionLimitada = Math.max(
      X_PARED,
      Math.min(X_120_CM, posicionX)
    );

    return (
      (posicionLimitada - X_PARED) /
      ESCALA_HASTA_120
    );
  }

  function animar(tiempoActual) {
    if (!ejecutando) {
      return;
    }

    if (tiempoAnterior === null) {
      tiempoAnterior = tiempoActual;
    }

    const delta = Math.min(
      0.05,
      Math.max(0, (tiempoActual - tiempoAnterior) / 1000)
    );

    tiempoAnterior = tiempoActual;
    actualizarMovimiento(delta);
    actualizarInterfaz("ejecutando");

    frameId = requestAnimationFrame(animar);
  }

  function actualizarMovimiento(delta) {
    if (
      estado === estados.PAUSA_MINIMO ||
      estado === estados.PAUSA_MAXIMO
    ) {
      pausaRestante -= delta;

      if (pausaRestante <= 0) {
        pausaRestante = 0;

        estado =
          estado === estados.PAUSA_MINIMO
            ? estados.HACIA_MAXIMO
            : estados.HACIA_MINIMO;
      }

      return;
    }

    const control = obtenerControlMovimiento(distancia);
    const velocidadReal =
      VELOCIDAD_MAXIMA_SIMULADA *
      (control.porcentaje / 100);

    if (estado === estados.HACIA_MINIMO) {
      distancia -= velocidadReal * delta;

      if (distancia <= DISTANCIA_MINIMA) {
        distancia = DISTANCIA_MINIMA;
        estado = estados.PAUSA_MINIMO;
        pausaRestante = PAUSA_EXTREMOS;
        pasoPorMinimo = true;
      }

      return;
    }

    distancia += velocidadReal * delta;

    if (distancia >= DISTANCIA_MAXIMA) {
      distancia = DISTANCIA_MAXIMA;
      estado = estados.PAUSA_MAXIMO;
      pausaRestante = PAUSA_EXTREMOS;

      if (pasoPorMinimo) {
        ciclos += 1;
        pasoPorMinimo = false;
      }
    }
  }

  function obtenerControlMovimiento(valor) {
    if (valor > DISTANCIA_MAXIMA) {
      return {
        porcentaje: 80,
        pwm: Math.round(PWM_MAXIMO * 0.80),
        zona: "100",
        titulo: "Velocidad alta",
        descripcion: "Distancia mayor a 70 cm: motor al 80%."
      };
    }

    if (valor > LIMITE_15) {
      return {
        porcentaje: 50,
        pwm: Math.round(PWM_MAXIMO * 0.50),
        zona: "50",
        titulo: "Velocidad media",
        descripcion: "Distancia mayor a 30 cm y menor o igual a 70 cm."
      };
    }

    return {
      porcentaje: 15,
      pwm: Math.round(PWM_MAXIMO * 0.15),
      zona: "15",
      titulo: "Velocidad baja",
      descripcion: "Distancia menor o igual a 30 cm durante el movimiento."
    };
  }

  function obtenerControlActual() {
    if (
      estado === estados.PAUSA_MINIMO ||
      estado === estados.PAUSA_MAXIMO
    ) {
      return {
        porcentaje: 0,
        pwm: 0,
        zona: "parada",
        titulo: "Motor detenido",
        descripcion: "Pausa de 1,5 segundos antes de invertir el giro."
      };
    }

    return obtenerControlMovimiento(distancia);
  }

  function convertirDistanciaAPosicionX(valor) {
    const d = Math.max(0, Math.min(200, valor));

    if (d <= DISTANCIA_MAXIMA_REGLA) {
      return X_PARED + d * ESCALA_HASTA_120;
    }

    return X_120_CM + (d - DISTANCIA_MAXIMA_REGLA) * ESCALA_120_A_200;
  }

  function actualizarInterfaz(modo) {
    const control = obtenerControlActual();
    const frenteAuto = convertirDistanciaAPosicionX(distancia);
    const xAuto = frenteAuto - MARGEN_TRANSPARENTE_FRONTAL;
    const centroAuto = xAuto + 75;
    const sensorX = frenteAuto + 3;
    const sensorY = 438;

    elementos.auto.setAttribute("x", xAuto);
    elementos.sombraAutoSuelo.setAttribute("cx", centroAuto);

    elementos.sensorAutoCuerpo.setAttribute("x", sensorX - 2);
    elementos.sensorAutoLente1.setAttribute("cx", sensorX + 3);
    elementos.sensorAutoLente2.setAttribute("cx", sensorX + 8);

    elementos.ondaSensor1.setAttribute(
      "d",
      `M ${sensorX - 10} ${sensorY - 8} Q ${sensorX - 28} ${sensorY} ${sensorX - 10} ${sensorY + 8}`
    );

    elementos.ondaSensor2.setAttribute(
      "d",
      `M ${sensorX - 18} ${sensorY - 16} Q ${sensorX - 46} ${sensorY} ${sensorX - 18} ${sensorY + 16}`
    );

    elementos.ondaSensor3.setAttribute(
      "d",
      `M ${sensorX - 26} ${sensorY - 24} Q ${sensorX - 64} ${sensorY} ${sensorX - 26} ${sensorY + 24}`
    );

    elementos.rayoSensor.setAttribute("x1", sensorX);
    elementos.rayoSensor.setAttribute("x2", X_PARED);

    elementos.conoSensor.setAttribute(
      "points",
      `${sensorX},${sensorY} ${X_PARED},${sensorY - 52} ${X_PARED},${sensorY + 52}`
    );

    const etiquetaX = Math.max(
      168,
      Math.min(1045, centroAuto - 66)
    );

    elementos.etiquetaAutoFondo.setAttribute("x", etiquetaX);
    elementos.etiquetaAutoTexto.setAttribute("x", etiquetaX + 66);
    elementos.etiquetaAutoVelocidad.setAttribute("x", etiquetaX + 66);

    elementos.etiquetaAutoTexto.textContent =
      distancia.toFixed(1) + " cm";

    elementos.etiquetaAutoVelocidad.textContent =
      `Velocidad: ${control.porcentaje}%`;

    elementos.arrastreAuto.setAttribute(
      "x",
      xAuto - 12
    );

    elementos.arrastreAuto.setAttribute(
      "aria-valuenow",
      distancia.toFixed(1)
    );

    const porcentajePosicion = Math.max(
      0,
      Math.min(
        100,
        (distancia / DISTANCIA_MAXIMA_REGLA) * 100
      )
    );

    elementos.marcadorRecorrido.style.left =
      porcentajePosicion + "%";

    elementos.barraDistancia.style.width =
      porcentajePosicion + "%";

    elementos.distanciaActual.textContent =
      distancia.toFixed(1);

    elementos.velocidadMotor.textContent =
      String(control.porcentaje);

    elementos.barraPWM.style.width =
      control.porcentaje + "%";

    elementos.detallePWM.textContent =
      `PWM de 8 bits: ${control.pwm} de ${PWM_MAXIMO}.`;

    elementos.pwmControl.value =
      `${control.pwm} / ${PWM_MAXIMO}`;

    elementos.pausaRestante.textContent =
      Math.max(0, pausaRestante).toFixed(1) + " s";

    elementos.ciclosCompletados.textContent =
      String(ciclos);

    actualizarReglaActiva(control.zona);
    actualizarEstado(control, modo);
    actualizarAnimacion(control, modo);
  }

  function actualizarReglaActiva(zona) {
    [
      elementos.reglaParada,
      elementos.regla15,
      elementos.regla50,
      elementos.regla100
    ].forEach(function (regla) {
      regla.classList.remove("regla-control--activa");
    });

    const mapa = {
      parada: elementos.reglaParada,
      "15": elementos.regla15,
      "50": elementos.regla50,
      "100": elementos.regla100
    };

    mapa[zona].classList.add("regla-control--activa");
  }

  function actualizarEstado(control, modo) {
    elementos.puntoEstado.className =
      "estado-principal__punto";

    if (modo === "arrastrando") {
      elementos.estadoActual.textContent =
        "Posicionando el automóvil";

      elementos.descripcionEstado.textContent =
        "Suelta el automóvil para fijar la nueva distancia inicial.";

      elementos.textoDireccionEscena.textContent =
        `Posición manual: ${distancia.toFixed(1)} cm`;

      elementos.direccionActual.textContent =
        "Ajuste manual";

      elementos.badgePunto.style.fill =
        "var(--azul)";

      elementos.puntoEstado.classList.add(
        "estado-principal__punto--pausa"
      );

      return;
    }

    if (modo === "pausado") {
      elementos.estadoActual.textContent =
        "Simulación pausada";

      elementos.descripcionEstado.textContent =
        "Presiona Iniciar para continuar desde la posición actual.";

      elementos.textoDireccionEscena.textContent =
        "Simulación pausada";

      elementos.badgePunto.style.fill =
        "var(--amarillo)";

      elementos.puntoEstado.classList.add(
        "estado-principal__punto--pausa"
      );

      return;
    }

    if (estado === estados.PAUSA_MINIMO) {
      elementos.estadoActual.textContent =
        "Detenido en 10 cm";

      elementos.descripcionEstado.textContent =
        "Pausa de 1,5 s; luego retrocede hacia 70 cm.";

      elementos.textoDireccionEscena.textContent =
        "Pausa en 10 cm — cambio de giro";

      elementos.direccionActual.textContent =
        "Próximo: 70 cm";

      elementos.badgePunto.style.fill =
        "var(--rojo)";

      elementos.puntoEstado.classList.add(
        "estado-principal__punto--detenido"
      );

      return;
    }

    if (estado === estados.PAUSA_MAXIMO) {
      elementos.estadoActual.textContent =
        "Detenido en 70 cm";

      elementos.descripcionEstado.textContent =
        "Pausa de 1,5 s; luego avanza hacia 10 cm.";

      elementos.textoDireccionEscena.textContent =
        "Pausa en 70 cm — cambio de giro";

      elementos.direccionActual.textContent =
        "Próximo: 10 cm";

      elementos.badgePunto.style.fill =
        "var(--rojo)";

      elementos.puntoEstado.classList.add(
        "estado-principal__punto--detenido"
      );

      return;
    }

    const haciaMinimo =
      estado === estados.HACIA_MINIMO;

    const correccionInicial =
      (haciaMinimo && distancia > DISTANCIA_MAXIMA) ||
      (!haciaMinimo && distancia < DISTANCIA_MINIMA);

    elementos.estadoActual.textContent =
      modo === "listo"
        ? "Listo para iniciar"
        : correccionInicial
          ? "Corrección de posición inicial"
          : control.titulo;

    if (correccionInicial && haciaMinimo) {
      elementos.descripcionEstado.textContent =
        "Está por encima de 70 cm: avanza al 80% sin detenerse hasta 10 cm.";
    } else if (correccionInicial) {
      elementos.descripcionEstado.textContent =
        "Está por debajo de 10 cm: retrocede sin detenerse hasta 70 cm.";
    } else {
      elementos.descripcionEstado.textContent =
        control.descripcion;
    }

    elementos.direccionActual.textContent =
      haciaMinimo
        ? "Hacia 10 cm"
        : "Hacia 70 cm";

    elementos.textoDireccionEscena.textContent =
      `Motor al ${control.porcentaje}% — ${
        haciaMinimo
          ? "avanzando a 10 cm"
          : "retrocediendo a 70 cm"
      }`;

    elementos.badgePunto.style.fill =
      control.porcentaje === 15
        ? "var(--amarillo)"
        : control.porcentaje === 50
          ? "var(--naranja)"
          : "var(--verde)";

    elementos.puntoEstado.classList.add(
      "estado-principal__punto--movimiento"
    );

    if (haciaMinimo) {
      elementos.flechaMovimiento.setAttribute("x1", "665");
      elementos.flechaMovimiento.setAttribute("x2", "465");
    } else {
      elementos.flechaMovimiento.setAttribute("x1", "465");
      elementos.flechaMovimiento.setAttribute("x2", "665");
    }
  }

  function actualizarAnimacion(control, modo) {
    const mover =
      ejecutando &&
      control.porcentaje > 0 &&
      modo !== "pausado" &&
      modo !== "arrastrando";

    elementos.auto.classList.toggle(
      "auto--movimiento",
      mover
    );

    elementos.flechaMovimiento.style.opacity =
      control.porcentaje === 0 ? "0.25" : "1";
  }

  function normalizarDistanciaInicial() {
    let valor = Number(elementos.distanciaInicial.value);

    if (!Number.isFinite(valor)) {
      valor = 70;
    }

    valor = Math.min(200, Math.max(0, valor));
    elementos.distanciaInicial.value = valor;
  }

  function configurarTema() {
    let guardado = null;

    try {
      guardado = localStorage.getItem(
        "tema_simulador_hcsr04_pwm_ciclo"
      );
    } catch (error) {}

    if (guardado === "light" || guardado === "dark") {
      aplicarTema(guardado);
      return;
    }

    const oscuro =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    aplicarTema(oscuro ? "dark" : "light");
  }

  function alternarTema() {
    const actual =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";

    const nuevo =
      actual === "dark"
        ? "light"
        : "dark";

    aplicarTema(nuevo);

    try {
      localStorage.setItem(
        "tema_simulador_hcsr04_pwm_ciclo",
        nuevo
      );
    } catch (error) {}
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute(
      "data-theme",
      tema
    );

    const oscuro = tema === "dark";

    elementos.iconoTema.textContent =
      oscuro ? "☀" : "☾";

    elementos.textoTema.textContent =
      oscuro ? "Claro" : "Oscuro";

    elementos.btnTema.setAttribute(
      "aria-label",
      oscuro
        ? "Cambiar a tema claro"
        : "Cambiar a tema oscuro"
    );
  }
});
