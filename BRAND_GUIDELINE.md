# Brand Guideline — Hito IA Studio

> Fuente de verdad del diseño. **Cualquier trabajo visual del proyecto debe apegarse a este
> documento.** Las primitivas en `components/ui/*` y los tokens en `app/globals.css` lo implementan;
> si algo no está aquí, no se inventa: se añade aquí primero.

## 1. Personalidad

Hito IA Studio es un asistente con criterio: **honesto, claro y premium, sin ruido**. La interfaz
debe sentirse hecha por un diseñador, no generada por IA. Principios: jerarquía clara, mucho aire,
una sola acción primaria por pantalla, motion sobrio con intención, nunca recargado.

## 2. Color

El verde de marca proviene del logo madre Hito33: **`#16794A`**. Hay dos temas: la **landing y el
login son claros**; el **panel interno es oscuro**. Se usan SIEMPRE tokens semánticos (nunca hex
sueltos en componentes).

| Token | Oscuro (panel) | Claro (landing/login) | Uso |
| --- | --- | --- | --- |
| `background` | `#0b0b0f` | `#f7f8f7` | Fondo de página |
| `surface` | `#121216` | `#ffffff` | Tarjetas, inputs |
| `surface-2` | `#17171d` | `#eef1ee` | Superficie elevada / hover |
| `foreground` | `#ededed` | `#0c0f0e` | Texto principal |
| `muted` | `#9a9aa3` | `#586460` | Texto secundario |
| `border` | `rgba(255,255,255,.08)` | `rgba(12,15,14,.09)` | Bordes sutiles |
| `border-strong` | `rgba(255,255,255,.14)` | `rgba(12,15,14,.16)` | Bordes de inputs/foco |
| `brand` | `#16794A` | `#16794A` | Primario (botones, acentos) |
| `brand-400` | `#34d399` | `#0f5d39` | Acento/enlace (brillante en oscuro, oscuro en claro) |
| `green / amber / red` | semáforo | semáforo | Estados verde/amarillo/rojo |

Reglas: contraste AA mínimo (4.5:1 texto normal). El color nunca es el único indicador (acompañar con
icono/texto). En claro, el "acento verde" para texto es `brand` o `brand-400` (verde oscuro), no el
brillante.

## 3. Tipografía (3 roles, es un sistema)

No son "fuentes al azar": cada una tiene un rol fijo.

- **Display — Calistoga** (`font-display`): solo titulares (h1, h2, h3). Serif editorial con carácter.
- **UI / cuerpo — Inter** (`font-sans`, por defecto): todo el texto de interfaz, labels, párrafos.
- **Cifras / técnico — JetBrains Mono** (`font-mono`): números, costos, métricas, prompts, datos
  tabulares (usar `tabular-nums`).

Escala (móvil → desktop): h1 `text-3xl`→`text-4xl/5xl`, h2 `text-2xl`→`text-3xl`, h3 `text-lg`,
cuerpo `text-sm`/`text-base`, secundario `text-xs`. Line-height cómodo (1.5 cuerpo). **Inputs: 16px en
móvil** (`text-base`) para evitar el zoom de iOS.

## 4. Espaciado, radii, sombras

- **Espaciado**: ritmo 4/8 (usar la escala de Tailwind). Padding de página `px-6 py-8`; secciones
  landing `py-20`; gap entre campos de formulario `gap-5`; entre items de lista `gap-2`.
- **Radii**: inputs y botones `rounded-lg` (botones de CTA pueden ser `rounded-full`); tarjetas
  `rounded-xl`/`.card`; pills `rounded-full`.
- **Sombras**: sutiles. `shadow-sm` en elementos flotantes claros; en oscuro preferir borde + glow
  verde puntual, no sombras duras.

## 5. Componentes y estados

Todo elemento interactivo tiene estados visibles y distintos. Usar las primitivas:

- **Button** (`components/ui/Button.tsx`): variantes `primary` (verde), `secondary` (borde/superficie),
  `ghost`, `danger` (rojo); tamaños `sm/md/lg`. Estados obligatorios:
  - normal → **hover** (oscurece/realza) → **active/pressed** (`scale .97`, clase `.press`)
  - **focus-visible** (anillo `brand-400`) → **disabled** (opacidad .5 + `cursor-not-allowed`)
  - **loading** (spinner + bloqueado, no re-disparar) → **selected** (toggles, `aria-pressed`).
- **Inputs/Select/Textarea** (`Field/Input/Textarea/Select`): label visible, requerido con `*`, helper
  opcional, **error** debajo del campo con borde rojo, focus con borde `brand-400`, disabled atenuado.
- **Card** (`.card`): `surface` + `border` + `rounded-xl`. `hover-lift` solo donde sea clicable.
- **ConfirmDialog**: toda acción destructiva (borrar) pasa por confirmación (scrim, escape, foco).
- **StatusBadge**: pill de estado consistente (`components/panel/StatusBadge.tsx`).

## 6. Motion (principios Emil)

- Solo `transform`/`opacity`. Easing fuerte `--ease-out: cubic-bezier(.23,1,.32,1)`.
- Duraciones: micro-interacciones 120-200ms; entradas/reveal ~400-600ms; nada > 500ms en UI.
- `ease-out` al entrar, exit más rápido que enter. Stagger 30-80ms. Hover-lift, press (`scale .97`).
- **Respeta `prefers-reduced-motion`** siempre (ya global en `globals.css`).

## 7. Accesibilidad

Contraste AA, `:focus-visible` visible en todo lo interactivo, labels en formularios, errores
asociados al campo, targets táctiles ≥44px, iconos con `aria-hidden` y botones-icono con `aria-label`.
Texto generado se renderiza escapado (anti-XSS). Nada de emoji como icono (usar SVG de línea).

## 8. Responsive

Mobile-first. Breakpoints Tailwind (sm 640 / md 768 / lg 1024). En móvil: sidebar del panel en
**drawer** (hamburguesa), grids de 2 columnas apilan, headers con acciones envuelven, sin scroll
horizontal, `min-h-dvh`. Probar en 375px.

## 9. Reglas de escritura (copy)

- **No usar el guion largo "—"** como separador. Si hace falta un guion, usar "-" normal; preferir
  coma, punto o dos puntos. Aplica a UI y a los prompts del LLM.
- Tono honesto y directo, sin claims inflados. Español en la UI.

## Do / Don't

- ✅ Tokens semánticos, primitivas, una acción primaria, aire, motion sobrio.
- ❌ Hex sueltos en componentes, `neutral-*` hardcodeado, botones sin estados, borrar sin confirmar,
  emoji como icono, guion largo, animar width/height, texto < 14px en cuerpo (16px en inputs móvil).
