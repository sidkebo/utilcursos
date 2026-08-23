/*
 * CONFIGURACIÓN DEL SIMULADOR
 *
 * Incluye:
 * - tiempos iniciales y límites;
 * - calibración de luces basada en coordenadas relativas;
 * - radios relativos para escalar correctamente con cualquier resolución;
 * - definición de las fases.
 */

"use strict";

window.CONFIGURACION_SEMAFOROS = {
  tiempos: {
    verdeInicial: 8,
    amarilloInicial: 3,

    verdeMinimo: 2,
    verdeMaximo: 60,

    amarilloMinimo: 1,
    amarilloMaximo: 10
  },

  calibracion: {
    imagen: {
      nombre: "cruce.png",
      ancho: 1335,
      alto: 1178
    },

    radiosRelativos: {
      vehicular: 0.013858,
      peatonal: 0.010787
    },

    posicionesRelativas: {
      vehA_red: { x: 0.408240, y: 0.110357 },
      vehA_yellow: { x: 0.440449, y: 0.091681 },
      vehA_green: { x: 0.474906, y: 0.072156 },

      vehB_red: { x: 0.531835, y: 0.067912 },
      vehB_yellow: { x: 0.567041, y: 0.087436 },
      vehB_green: { x: 0.600749, y: 0.106961 },

      pedLeft_red: { x: 0.179026, y: 0.358234 },
      pedLeft_green: { x: 0.183521, y: 0.396435 },

      pedRight_red: { x: 0.828464, y: 0.355688 },
      pedRight_green: { x: 0.824719, y: 0.395586 }
    }
  },

  crearFases: function (verde, amarillo) {
    return [
      {
        nombre: "Vía A en verde",
        duracion: verde,
        descripcion:
          "La vía A está habilitada y el cruce peatonal izquierdo está en verde.",
        luces: [
          "vehA_green",
          "vehB_red",
          "pedLeft_green",
          "pedRight_red"
        ]
      },
      {
        nombre: "Vía A en amarillo",
        duracion: amarillo,
        descripcion:
          "La vía A está finalizando su circulación y el cruce peatonal izquierdo continúa habilitado.",
        luces: [
          "vehA_yellow",
          "vehB_red",
          "pedLeft_green",
          "pedRight_red"
        ]
      },
      {
        nombre: "Vía B en verde",
        duracion: verde,
        descripcion:
          "La vía B está habilitada y el cruce peatonal derecho está en verde.",
        luces: [
          "vehA_red",
          "vehB_green",
          "pedLeft_red",
          "pedRight_green"
        ]
      },
      {
        nombre: "Vía B en amarillo",
        duracion: amarillo,
        descripcion:
          "La vía B está finalizando su circulación y el cruce peatonal derecho continúa habilitado.",
        luces: [
          "vehA_red",
          "vehB_yellow",
          "pedLeft_red",
          "pedRight_green"
        ]
      }
    ];
  }
};
