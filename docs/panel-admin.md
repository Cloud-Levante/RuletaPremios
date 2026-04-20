# Panel de Administracion — Especificacion

## Resumen

Modal de configuracion accesible desde el icono de engranaje, protegido por usuario y contrasena. Diseño tipo "Settings de ChatGPT": modal centrado con sidebar izquierdo y area de contenido a la derecha.

---

## 1. Flujo de acceso

```
Engranaje (top-bar) → Modal login (user + pass) → Panel de admin (modal con sidebar)
```

1. Usuario clica el engranaje
2. Aparece un modal pequeno con dos inputs (usuario, contrasena) y boton "Entrar"
3. Si las credenciales son correctas → se cierra el login y se abre el panel de admin
4. Si son incorrectas → mensaje de error inline, sin recargar
5. La sesion se guarda en `sessionStorage` — al cerrar pestana se pierde
6. Siguiente vez que clique el engranaje (misma sesion) → abre directo el panel sin pedir login

---

## 2. Autenticacion

### Variables de entorno

```env
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS_HASH=5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
```

### Flujo de validacion (con auto-registro)

**Caso A — No hay hash en `.env`** (primer uso / setup):

1. Usuario clica engranaje → aparece modal de **registro**
2. Pide crear usuario y contrasena (con confirmacion)
3. Al confirmar, genera el hash SHA-256 y muestra un modal con:
   - El hash generado para copiar
   - Instrucciones: "Pega estas lineas en tu archivo `.env` y reinicia"
   - Ejemplo: `VITE_ADMIN_USER=admin` / `VITE_ADMIN_PASS_HASH=5e884...`
4. Las credenciales se guardan en `sessionStorage` para la sesion actual (funciona inmediatamente sin reiniciar)
5. En siguientes sesiones, ya leera del `.env`

**Caso B — Hash existe en `.env`** (uso normal):

1. Usuario clica engranaje → aparece modal de **login**
2. Pide usuario y contrasena
3. Se hashea el input con `crypto.subtle.digest('SHA-256', ...)`
4. Se compara con `VITE_ADMIN_PASS_HASH`
5. Si coincide → sesion valida, se guarda en `sessionStorage`
6. Si no coincide → error inline

### Seguridad (KISS)

- **Realidad**: al ser frontend-only, el hash acaba en el bundle JS. Un usuario tecnico podria extraerlo
- **Suficiente para**: evento presencial, feria, stand — evita que un visitante curioso toque la config
- **No suficiente para**: datos sensibles, produccion publica, compliance
- El hash en vez de plain text es una buena practica aunque no sea infalible

---

## 3. Diseno del panel

### Layout

```
+----------------------------------------------------------+
|  X                                                        |
|  +------------+  +------------------------------------+   |
|  | [icon] Premios  |                                  |   |
|  | [icon] Ruleta   |     AREA DE CONTENIDO            |   |
|  | [icon] Pantalla |                                  |   |
|  |                 |     (cambia segun seccion         |   |
|  |                 |      seleccionada en sidebar)     |   |
|  |                 |                                  |   |
|  +------------+  +------------------------------------+   |
+----------------------------------------------------------+
```

### Estilo visual

- Modal centrado, **no** fullscreen (~700px ancho, ~480px alto)
- Esquinas redondeadas 16px
- Fondo: `var(--bg-surface)` con `backdrop-filter: blur(20px)`
- Borde fino: `1px solid var(--border)`
- Sidebar: ~180px, fondo ligeramente mas oscuro, items con icono + texto
- Item activo: fondo sutil + texto primario
- Boton X arriba a la izquierda (como en la foto de ChatGPT)
- Overlay oscuro detras del modal (como el modal de premio actual)
- Animacion de entrada: `scale(0.95) → scale(1)` + fade

---

## 4. Secciones

### 4.1 Premios

| Control | Tipo | Descripcion |
|---|---|---|
| Cargar JSON | Boton + file input | Mismo comportamiento actual, reemplaza premios |
| Lista de premios | Tabla readonly | Muestra option, fullName, weight actual |
| Editar peso | Input numerico inline | Cambiar weight de cada premio sobre la marcha |

La tabla muestra la probabilidad calculada (%) al lado del peso para que sea visual.

### 4.2 Ruleta

| Control | Tipo | Descripcion |
|---|---|---|
| Velocidad del giro | Slider (0.3 - 2.0s) | Controla `spinDuration` |
| Numero de vueltas | Slider (3 - 15) | Cuantas vueltas completas antes de frenar |
| Vista previa | Texto | Muestra "Duracion estimada: ~Xs" |

### 4.3 Pantalla

| Control | Tipo | Descripcion |
|---|---|---|
| Pantalla completa | Boton toggle | Entra/sale de fullscreen |
| Tema | Toggle claro/oscuro | Mismo que el boton actual de la top-bar |

---

## 5. Persistencia de ajustes

| Dato | Donde se guarda | Cuando se lee |
|---|---|---|
| Sesion admin | `sessionStorage` | Al clicar engranaje |
| Weights editados | Estado React (en memoria) | Durante la sesion |
| Velocidad/vueltas | `localStorage` | Al cargar la app |
| Tema | Estado React | Al cargar la app |

Los weights editados en el panel se aplican en tiempo real a la logica de seleccion. Si se recarga la pagina, se vuelven a leer del JSON original (a menos que se persistan en localStorage).

---

## 6. Cambios en archivos

| Archivo | Cambio |
|---|---|
| `.env` | Anadir `VITE_ADMIN_USER` y `VITE_ADMIN_PASS_HASH` |
| `.env.example` | Documentar las nuevas variables |
| `App.jsx` | Nuevo componente `AdminPanel` + `LoginModal` + logica de sesion |
| `App.css` | Estilos del panel, login, sidebar, controles |
| `handleSpin()` | Sustituir `Math.random()` por weighted random |
| `Wheel` props | `spinDuration` y opcionalmente `numberOfSpins` dinamicos |

---

## 7. Orden de implementacion

1. **Weighted random** en `handleSpin()` (independiente del panel)
2. **Login modal** con validacion SHA-256
3. **Panel admin** con sidebar (estructura + navegacion)
4. **Seccion Premios** (cargar JSON + tabla + editar weights)
5. **Seccion Ruleta** (sliders velocidad/vueltas)
6. **Seccion Pantalla** (fullscreen + tema)
7. **Eliminar** el dropdown actual del engranaje (ya no hace falta)
