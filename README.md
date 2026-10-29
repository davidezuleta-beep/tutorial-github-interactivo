# Clon HTML de GitHub con tutorial integrado

[Abrir la práctica publicada](https://davidezuleta-beep.github.io/tutorial-github-interactivo/?v=4)

Interfaz construida con **HTML, CSS y JavaScript** para enseñar a principiantes a crear un repositorio privado, subir archivos y copiar su URL. Las capturas proporcionadas se usaron exclusivamente como referencia visual: **la aplicación no muestra pantallazos, no utiliza fondos de capturas ni dibuja la interfaz en un canvas**.

Las pantallas del recorrido —Dashboard, New repository, archivos del repositorio, Upload files y Code— se construyen con botones, menús, campos, tablas e iconos SVG. El tutorial destaca el elemento HTML correspondiente mediante su selector; el resaltado no intercepta los clics.

## Recorrido

La guía contiene **14 acciones**. Después de elegir Private, se activa Add README para crear un primer archivo. Así se puede enseñar la ruta Add file → Upload files en el mismo repositorio privado, sin cambiar a otro ejemplo.

El nombre, la descripción, la visibilidad, los archivos, el mensaje del commit y la URL se mantienen en un modelo de estado local. Un nombre válido distinto del ejemplo también funciona; la URL final utiliza el nombre escrito. Los selectores opcionales de .gitignore y licencia añaden sus archivos correspondientes a la simulación.

La selección de archivos carga tres ejemplos ficticios: `index.html`, `estilos.css` y `README.md`. No abre archivos del equipo. El botón de copiar guarda la URL en el portapapeles de práctica; no modifica el del sistema.

El tutorial implementa el recorrido didáctico indicado. Los controles ajenos a ese recorrido muestran una pista y no ejecutan operaciones en GitHub.

## Archivos

| Archivo | Contenido |
| --- | --- |
| `index.html` | Contenedores, tutorial y diálogos accesibles |
| `styles.css` | Apariencia GitHub y diseño responsive de los elementos HTML |
| `app.js` | Componentes HTML, estado, validaciones, acciones y guía |
| `steps.json` | Orden, instrucciones, selectores y acciones de los 14 pasos |
| `assets/favicon.svg` | Icono vectorial local |
| `.nojekyll` | Publicación de la aplicación estática en GitHub Pages |
| `PRIVACIDAD.md` | Datos de ejemplo y alcance de la simulación |

No necesita paquetes, instalación, backend, cuentas de usuario, analítica, cookies ni base de datos. La tipografía utiliza fuentes de sistema.

## Modificar pasos

Edita `steps.json`. Cada paso contiene:

```json
{
  "id": "open-code",
  "chapter": "share",
  "view": "repository",
  "selector": "#code-button",
  "action": "open-code",
  "title": "Localiza la dirección",
  "instruction": "Abre el botón verde Code.",
  "hint": "Está sobre la lista de archivos, a la derecha de Add file."
}
```

- `selector` identifica un control HTML real. No hay coordenadas de imagen: la guía mide su posición automáticamente.
- `view` elige una pantalla: `dashboard`, `create`, `repository` o `upload`.
- `action` debe coincidir con la acción del control. Las acciones y sus efectos están en `perform()` de `app.js`.
- Al cambiar de paso se conserva una copia del estado. Anterior y Repetir restauran esa copia; Reiniciar comienza una práctica nueva.

Para cambiar textos, modifica `title`, `instruction`, `hint` y `context`. Para cambiar el orden, mueve los objetos de `steps`, manteniendo coherentes las acciones y el estado que necesita cada pantalla. El contador se calcula automáticamente.

## Modificar la interfaz

Los componentes están en `header()`, `dashboard()`, `createRepository()`, `repository()`, `upload()` y `codePopover()`, dentro de `app.js`. Cambia el marcado en esos componentes y su estilo en `styles.css`.

Una captura nueva sirve para comparar y ajustar esos componentes; no se incorpora como fondo ni como pantalla del simulador.

## Ejecutar y publicar

Desde esta carpeta, con Python 3:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000`. No uses `file://`, porque el navegador debe cargar `steps.json` por HTTP.

GitHub Pages publica `main`, carpeta raíz `/`. Guarda los cambios probados en esa rama y Pages actualizará el sitio. Los recursos usan rutas relativas para funcionar bajo `/tutorial-github-interactivo/`.

## Accesibilidad y adaptación

Controles HTML con nombres accesibles, navegación por teclado, validación del nombre, cambio de visibilidad, interruptor nativo, campo de commit editable y progreso semántico. En móvil la interfaz se reorganiza con CSS, sin ampliar o desplazar imágenes. La guía se fija abajo y desplaza el control activo a un área visible. Se respeta la preferencia de movimiento reducido.

Las marcas y la apariencia de GitHub se usan como referencia educativa. Esta aplicación no es GitHub y ninguna acción de la práctica se envía a una cuenta real.
