SIMULADOR INTERACTIVO - TECLADO MATRICIAL 4x4

Archivos:
- index.html   -> página principal
- styles.css   -> diseño y parte gráfica
- app.js       -> lógica de la simulación
- assets/referencia_original.png -> imagen de referencia proporcionada

Uso:
1. Mantenga todos los archivos en la misma carpeta.
2. Abra index.html con Chrome, Edge, Firefox u otro navegador moderno.
3. No necesita conexión a Internet ni servidor web.

La simulación permite:
- Avanzar manualmente por las filas L1-L4.
- Ejecutar barrido automático.
- Variar la velocidad del barrido.
- Presionar cualquier tecla del teclado 4x4.
- Observar HIGH/LOW en filas y columnas.
- Ver cómo una tecla solo se detecta cuando su fila está activa en LOW.
- Simular directamente la tecla 5 para explicar L2 + C2.


ACTUALIZACION:
- Barrido automatico ajustable de 1000 ms/fila hasta aproximadamente 5 ms/fila.
- La velocidad aumenta al mover el control hacia la derecha.
- Registro lateral de una sola columna con las teclas realmente detectadas por el barrido.
- Cada pulsacion se registra una sola vez, aunque la tecla permanezca presionada varios ciclos.
- Reiniciar tambien limpia el historial de teclas detectadas.
