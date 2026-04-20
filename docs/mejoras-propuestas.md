# Mejoras propuestas — Ruleta de la Nube

## 1. Probabilidades por gajo (ruleta trucada)

**Estado actual**: todos los gajos tienen la misma probabilidad (1/N).

**Propuesta**: campo `weight` en el JSON de premios. Un peso mayor = mayor probabilidad de caer.

```json
{
  "option": "Vuelve a girar",
  "fullName": null,
  "weight": 30,
  "style": { "backgroundColor": "#0052A5", "textColor": "#ffffff" }
},
{
  "option": "Consultoría 30'",
  "fullName": "Sesión de consultoría (30 min)",
  "weight": 5,
  "style": { "backgroundColor": "#004DB3", "textColor": "#ffffff" }
}
```

### Funcionamiento

Se implementa un **weighted random**:

1. Se suman todos los pesos: `totalWeight = sum(prize.weight)`
2. Se genera un aleatorio: `rand = Math.random() * totalWeight`
3. Se recorre acumulando pesos hasta superar `rand` — ese es el ganador

Si un premio no tiene `weight`, se asigna `1` por defecto (retrocompatible).

### Ejemplo con 9 premios

| Premio           | Weight        | Probabilidad real |
| ---------------- | ------------- | ----------------- |
| Demo IA          | 10            | 10%               |
| Plan Seguridad   | 10            | 10%               |
| Auditoría Cyber | 8             | 8%                |
| Costes Cloud     | 10            | 10%               |
| Consultoría 30' | 5             | 5%                |
| Quick Win        | 15            | 15%               |
| Casos Uso IA     | 10            | 10%               |
| Roadmap Tech     | 10            | 10%               |
| Vuelve a girar   | 22            | 22%               |
| **Total**  | **100** | **100%**    |

Visualmente la ruleta mantiene gajos del mismo tamaño. La "trampa" es invisible para el usuario.

---

## 2. Limite de stock por premio

**Propuesta**: campo `stock` (opcional) que indica cuantas unidades quedan de ese premio.

```json
{
  "option": "Kit Merch",
  "fullName": "Kit de merchandising Cloud Levante x IONOS",
  "weight": 8,
  "stock": 10,
  "style": { ... }
}
```

### Funcionamiento

- Al ganar un premio con `stock`, se decrementa en 1.
- Cuando `stock` llega a 0, ese premio se excluye del sorteo (su `weight` pasa a 0 internamente).
- El gajo sigue visible en la ruleta para no delatar que se ha agotado.
- `stock: null` o sin campo = stock infinito.

### Persistencia

El stock se puede persistir en:

- `localStorage` (solo para esa sesion/dispositivo)
- Un backend/API (para multiples dispositivos en el mismo evento)
- Un archivo JSON actualizado en el servidor

---

## 3. Velocidad y duracion del giro

**Estado actual**: `spinDuration={0.8}` fijo en el componente.

**Propuesta**: hacerlo configurable desde el menu de ajustes o desde el JSON.

```json
{
  "settings": {
    "spinDuration": 1.2,
    "numberOfSpins": 8
  },
  "prizes": [ ... ]
}
```

| Parametro         | Descripcion                                 | Valor por defecto |
| ----------------- | ------------------------------------------- | ----------------- |
| `spinDuration`  | Duracion total del giro en segundos         | 0.8               |
| `numberOfSpins` | Numero de vueltas completas antes de frenar | 5                 |

Un giro mas largo (1.5-2s) con mas vueltas (8-10) da mas espectaculo para eventos presenciales.

---

## 4. Sonidos

Efectos de audio para mejorar la experiencia:

| Evento         | Sonido                                | Implementacion                     |
| -------------- | ------------------------------------- | ---------------------------------- |
| Mientras gira  | Tick-tick-tick (simula pegs/clavijas) | Loop de audio durante `mustSpin` |
| Gana premio    | Fanfarria / campanas                  | Al mostrar modal de premio         |
| Vuelve a girar | Sonido de "oooh" / rebote             | Al mostrar modal de retry          |
| Click en GIRAR | Whoosh / lanzamiento                  | Al iniciar el giro                 |

Los archivos de audio se colocarian en `public/sounds/` y se cargarian con la API `Audio()` de JavaScript.

Se podria añadir un toggle de mute en la barra superior.

---

## 5. Registro de tiradas (analytics)

Guardar un log de cada tirada para estadisticas del evento.

### Datos a registrar

```json
{
  "timestamp": "2026-04-20T14:32:10.123Z",
  "prizeIndex": 3,
  "prizeName": "Costes Cloud",
  "isRetry": false
}
```

### Opciones de almacenamiento

| Opcion                   | Ventaja                       | Inconveniente                            |
| ------------------------ | ----------------------------- | ---------------------------------------- |
| `localStorage`         | Sin backend, inmediato        | Solo 1 dispositivo, se pierde al limpiar |
| Archivo JSON descargable | Exportable, simple            | Manual                                   |
| Backend/API              | Multidispositivo, tiempo real | Requiere servidor                        |

### Funcionalidades

- Contador de tiradas totales
- Contador de premios entregados por tipo
- Exportar CSV/JSON desde el menu de ajustes
- Dashboard en tiempo real (si hay backend)

---

## 6. Modo admin protegido

Los ajustes sensibles (cargar premios, ver estadisticas, cambiar probabilidades) detras de una proteccion simple.

### Opciones

| Metodo                              | Complejidad | Seguridad              |
| ----------------------------------- | ----------- | ---------------------- |
| PIN de 4 digitos                    | Baja        | Suficiente para evento |
| Gesto secreto (triple tap en logo)  | Baja        | Discreto               |
| URL con parametro (`?admin=1234`) | Minima      | Basica                 |
| Login con usuario/contrasena        | Media       | Alta                   |

Para un evento presencial, un PIN o gesto secreto es suficiente. El objetivo no es seguridad real sino evitar que un visitante curioso toque la configuracion.

---

## 7. Pantalla completa (fullscreen)

Boton para poner la app en modo fullscreen — esencial para tablets y pantallas en stands de ferias.

### Implementacion

- Boton en la barra superior (icono de expandir)
- Usa la API `document.documentElement.requestFullscreen()`
- Toggle: si ya esta en fullscreen, sale con `document.exitFullscreen()`
- En iOS/Safari usar `webkitRequestFullscreen`

---

## Prioridad sugerida de implementacion

| Prioridad | Mejora                  | Impacto                 | Esfuerzo |
| --------- | ----------------------- | ----------------------- | -------- |
| Alta      | Probabilidades por peso | Critico para el negocio | Bajo     |
| Alta      | Limite de stock         | Evita regalar de mas    | Medio    |
| Media     | Pantalla completa       | UX en eventos           | Bajo     |
| Media     | Velocidad configurable  | Espectaculo             | Bajo     |
| Media     | Modo admin              | Proteccion basica       | Medio    |
| Baja      | Sonidos                 | Experiencia inmersiva   | Medio    |
| Baja      | Registro de tiradas     | Analytics               | Medio    |

---

## Tabla de decision

| # | Mejora                                 | Decision   | Notas                        |
| - | -------------------------------------- | ---------- | ---------------------------- |
| 1 | Probabilidades por peso (`weight`)   | SI         |                              |
| 2 | Limite de stock por premio (`stock`) | NO         |                              |
| 3 | Velocidad y duracion del giro          | SI         | Desde ajustes, con un slider |
| 4 | Sonidos                                | NO TODAVIA |                              |
| 5 | Registro de tiradas (analytics)        | NO         |                              |
| 6 | Modo admin protegido                   | SI         | Contraseña en el .env       |
| 7 | Pantalla completa (fullscreen)         | SI         |                              |

> Rellenar la columna **Decision** con: **SI** / **NO** / **NO TODAVIA**
