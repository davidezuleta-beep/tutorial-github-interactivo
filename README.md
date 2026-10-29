# GitHub, paso a paso · BINIAC

Tutorial estático en español para principiantes: crear un repositorio privado, subir archivos manualmente y copiar la URL desde Code. La secuencia contiene **13 acciones** con capturas originales y vistas locales recreadas para completar el material que faltaba.

No necesita instalar dependencias, cuentas, suscripciones, servidor de aplicación ni base de datos. Las imágenes y las fuentes Prompt se sirven localmente. No hay analítica, cookies, llamadas a la API de GitHub ni archivos de usuario.

## Qué se simula

- La creación privada se practica con el nombre `mi-primer-proyecto`.
- La carga y la copia de URL utilizan el repositorio público de referencia `Biniac/test`, que aparece en las capturas originales. El cambio de ejemplo se explica en la guía.
- La selección carga tres nombres ficticios: `index.html`, `estilos.css` y `README.md`. No abre el selector de archivos del equipo.
- El botón de copiar guarda la URL de referencia en un **portapapeles de práctica**, dentro de la aplicación. No modifica el portapapeles del sistema.
- Solo la acción correcta avanza. Un clic en el resto de la pantalla o un nombre incorrecto muestra una pista. Se puede volver, repetir y reiniciar.

La interfaz de GitHub puede variar según la cuenta y los permisos. Esta práctica reproduce el flujo del material suministrado. Las vistas recreadas están identificadas en la barra del visor. La selección de Private, la confirmación y la carga se recrearon a petición del usuario; no se presentan como capturas originales.

## Archivos

| Archivo | Uso |
| --- | --- |
| `index.html` | Estructura accesible, controles y pantalla final |
| `styles.css` | Identidad BINIAC, adaptación a móvil y vistas recreadas |
| `app.js` | Interacción local y componentes de las vistas recreadas |
| `steps.json` | Orden, textos, objetivos, capturas y zonas clicables |
| `assets/screenshots/` | Cinco PNG originales revisados, sin modificaciones |
| `assets/fonts/` | Prompt ExtraLight, Regular y SemiBold; licencia OFL |
| `.nojekyll` | Publicación de los archivos estáticos sin Jekyll |
| `PRIVACIDAD.md` | Alcance de la revisión previa a publicación |

## Cambiar una captura o un paso

1. Revisa la nueva imagen: no debe mostrar datos privados, tokens ni correos personales. Copia el PNG a `assets/screenshots/`.
2. En `steps.json`, modifica `image`, `width` y `height` con las dimensiones reales del PNG.
3. Ajusta `target`: `x` y `y` son la esquina superior izquierda del botón; `width` y `height` son su tamaño, **en píxeles de la imagen original**. La aplicación convierte esos valores a porcentajes para mantener la alineación al cambiar de tamaño.
4. Actualiza `title`, `instruction`, `hint`, `label` y `context`. Mantén una sola acción por paso.
5. Guarda, prueba el recorrido y sube el cambio a `main`. GitHub Pages lo publicará de nuevo.

Ejemplo de un paso basado en captura:

```json
{
  "id": "open-code",
  "chapter": "share",
  "source": "original",
  "image": "assets/screenshots/02_repositorio.png",
  "width": 879,
  "height": 513,
  "target": { "x": 484, "y": 189, "width": 105, "height": 32 },
  "label": "Abrir el botón Code",
  "title": "Encuentra la dirección",
  "instruction": "Haz clic en el botón verde Code.",
  "hint": "Está sobre la lista de archivos."
}
```

Para cambiar el orden, mueve los objetos dentro de `steps`. El contador y los capítulos se calculan automáticamente. Mantén los pasos de cada capítulo juntos y usa los identificadores `create`, `upload` y `share`.

En una vista recreada, `scene` elige el componente y `selector` identifica el elemento con `data-control`. El marco clicable se mide sobre ese elemento, incluso al ampliar. Los componentes están en `createScene` y `uploadScene`, dentro de `app.js`.

Para sustituir una recreación por una captura real, cambia `source` a `original`, añade `image`, dimensiones y `target`, y retira `scene` y `selector`. No hace falta modificar el motor.

## Ver en local

Desde esta carpeta, con Python 3 instalado:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000`. No abras `index.html` con `file://`, porque el navegador necesita cargar `steps.json` por HTTP.

## GitHub Pages

La publicación usa `main`, carpeta raíz `/`, con `.nojekyll`. Todos los enlaces a recursos son relativos para que funcionen bajo `/tutorial-github-interactivo/`.

## Accesibilidad y adaptación

Botones con nombre accesible, uso con Tab/Enter, entrada de nombre con Enter, avisos de pista y avance con región viva, progreso semántico y soporte de movimiento reducido. En pantallas pequeñas, el visor enfoca automáticamente la acción; el control «Ver pantalla completa» permite recuperar el contexto. No es necesario acertar una zona diminuta en una imagen reducida.

## Referencias

- [Crear un repositorio — documentación oficial de GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Subir archivos — documentación oficial de GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Configurar GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Prompt se distribuye bajo SIL Open Font License; se incluye su licencia en `assets/fonts/OFL.txt`. Las capturas conservan la apariencia y las marcas de GitHub. Este material es una simulación educativa de BINIAC.
