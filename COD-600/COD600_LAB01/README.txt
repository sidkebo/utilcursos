COD-600 - LAB-COD-01
VERSIÓN DE PRÁCTICA / MEDICIÓN PARA ALUMNOS

Esta versión se deriva de la página oficial funcional con Web Serial.

CRITERIO:
- El ESP32 realiza la adquisición y el muestreo.
- La página NO genera muestras.
- La página recibe, registra y grafica los datos reales enviados por el ESP32.

VISIBLE PARA EL ALUMNO:
- Estado de conexión.
- k.
- t.
- ADC.
- ADCf.
- VinADC.
- Proc.
- Gráfica ADC / ADCf.
- Registro manual de hasta 5 puntos.
- Captura de gráfica y cursores A/B.
- Valores crudos de A/B: k, t, ADC y ADCf.

NO SE MUESTRA AUTOMÁTICAMENTE:
- ADC%.
- ADCf%.
- dT.
- Ts calculado.
- fs calculada.
- Δk.
- Δt.
- ΔADC.
- ΔADCf.
- Ts/fs promedio entre cursores.
- mínimos/máximos automáticos.
- ocupación Proc/Ts.
- margen temporal.
- memoria del promedio móvil.
- fórmulas.
- monitor Serial crudo.
- diagnósticos de bytes/fragmentos/líneas.
- simulación.
- pegado de terminal.
- osciloscopio didáctico reconstruido.

La comunicación Web Serial y el parser del formato del ESP32 se conservan.
El reinicio automático al conectar permanece deshabilitado.
