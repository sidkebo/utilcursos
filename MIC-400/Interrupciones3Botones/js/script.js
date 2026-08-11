const estadoLed = {
  1: false,
  2: false,
  3: false
};

function cambiarEstadoLed(numero) {
  estadoLed[numero] = !estadoLed[numero];

  const led = document.getElementById(`led${numero}`);

  if (estadoLed[numero]) {
    led.classList.add("encendido");
  } else {
    led.classList.remove("encendido");
  }
}

document.getElementById("boton1").addEventListener("click", function () {
  cambiarEstadoLed(1);
});

document.getElementById("boton2").addEventListener("click", function () {
  cambiarEstadoLed(2);
});

document.getElementById("boton3").addEventListener("click", function () {
  cambiarEstadoLed(3);
});
