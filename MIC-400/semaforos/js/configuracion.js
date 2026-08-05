/*
 * CONFIGURACIÓN FIJA DEL SIMULADOR
 *
 * Este archivo contiene:
 * - tiempos iniciales;
 * - límites permitidos;
 * - calibración exacta de las luces;
 * - definición de las fases.
 *
 * No contiene botones ni lógica de animación.
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
    ancho: 1698,
    alto: 926,

    posiciones: {
      vehA_red: { x: 752.98, y: 108.29 },
      vehA_yellow: { x: 800.63, y: 86.63 },
      vehA_green: { x: 846.83, y: 69.31 },

      vehB_red: { x: 924.8, y: 67.86 },
      vehB_yellow: { x: 971.01, y: 88.08 },
      vehB_green: { x: 1017.21, y: 108.29 },

      pedLeft_red: { x: 443.99, y: 356.64 },
      pedLeft_green: { x: 443.99, y: 399.95 },

      pedRight_red: { x: 1204.92, y: 246.9 },
      pedRight_green: { x: 1204.92, y: 290.22 }
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
