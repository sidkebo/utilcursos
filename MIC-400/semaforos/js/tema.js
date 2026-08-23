/*
 * CONTROL DE TEMA CLARO / OSCURO
 *
 * - Respeta la preferencia del sistema en la primera visita.
 * - Guarda la selección en localStorage.
 * - Actualiza el texto, icono y atributo aria-label.
 */

"use strict";

(function () {
  const CLAVE_TEMA = "tema_simulador_semaforos";
  const TEMA_CLARO = "light";
  const TEMA_OSCURO = "dark";

  const raiz = document.documentElement;

  aplicarTemaInicial();

  document.addEventListener("DOMContentLoaded", function () {
    const btnTema = document.getElementById("btnTema");

    if (!btnTema) {
      return;
    }

    actualizarBotonTema();

    btnTema.addEventListener("click", function () {
      const temaActual =
        raiz.getAttribute("data-theme") === TEMA_OSCURO
          ? TEMA_OSCURO
          : TEMA_CLARO;

      const nuevoTema =
        temaActual === TEMA_OSCURO
          ? TEMA_CLARO
          : TEMA_OSCURO;

      aplicarTema(nuevoTema, true);
    });
  });

  function aplicarTemaInicial() {
    const temaGuardado = obtenerTemaGuardado();

    if (temaGuardado) {
      aplicarTema(temaGuardado, false);
      return;
    }

    const prefiereOscuro =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    aplicarTema(
      prefiereOscuro ? TEMA_OSCURO : TEMA_CLARO,
      false
    );
  }

  function obtenerTemaGuardado() {
    try {
      const tema = localStorage.getItem(CLAVE_TEMA);

      if (tema === TEMA_CLARO || tema === TEMA_OSCURO) {
        return tema;
      }
    } catch (error) {
      console.warn("No se pudo leer el tema guardado:", error);
    }

    return null;
  }

  function aplicarTema(tema, guardar) {
    raiz.setAttribute("data-theme", tema);

    if (guardar) {
      try {
        localStorage.setItem(CLAVE_TEMA, tema);
      } catch (error) {
        console.warn("No se pudo guardar el tema:", error);
      }
    }

    actualizarBotonTema();
  }

  function actualizarBotonTema() {
    const btnTema = document.getElementById("btnTema");
    const iconoTema = document.getElementById("iconoTema");
    const textoTema = document.getElementById("textoTema");

    if (!btnTema || !iconoTema || !textoTema) {
      return;
    }

    const estaOscuro =
      raiz.getAttribute("data-theme") === TEMA_OSCURO;

    if (estaOscuro) {
      iconoTema.textContent = "☀";
      textoTema.textContent = "Claro";
      btnTema.setAttribute(
        "aria-label",
        "Cambiar a tema claro"
      );
    } else {
      iconoTema.textContent = "☾";
      textoTema.textContent = "Oscuro";
      btnTema.setAttribute(
        "aria-label",
        "Cambiar a tema oscuro"
      );
    }
  }
})();
