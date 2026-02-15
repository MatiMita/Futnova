# ⚽ NOVAPROCUP - Sitio Web del Torneo

Sitio web oficial del torneo **NOVAPROCUP** que se realiza en el **Centro Deportivo FUTNOVA**.

## 📁 Estructura del Proyecto

```
liga-futbol/
├── index.html          # Página de inicio (Información del torneo y FUTNOVA)
├── posiciones.html     # Tabla de posiciones
├── partidos.html       # Calendario de partidos
├── estadisticas.html   # Estadísticas de jugadores
├── equipos.html        # Equipos participantes
├── styles.css          # Estilos CSS
├── script.js           # Datos y funcionalidad JavaScript
└── README.md           # Este archivo
```

## 🎨 Características

### Sitio Público
✅ **Sitio Multi-Página** - Navegación entre diferentes secciones  
✅ **Página de Inicio** - Información sobre NOVAPROCUP y FUTNOVA  
✅ **Diseño Moderno** - Modo oscuro con gradientes vibrantes  
✅ **Tabla de Posiciones** - Clasificación completa del torneo  
✅ **Calendario de Partidos** - Próximos encuentros  
✅ **Estadísticas** - Goleadores y tarjetas  
✅ **Equipos** - Información de todos los participantes  
✅ **Totalmente Responsive** - Adaptado a móvil, tablet y desktop  
✅ **Animaciones Suaves** - Efectos hover y transiciones profesionales  

### 🎯 Panel de Administración
✅ **Dashboard Completo** - Estadísticas generales del torneo  
✅ **Gestión de Equipos** - Crear, editar y eliminar equipos  
✅ **Gestión de Jugadores** - Administrar jugadores con filtros y búsqueda  
✅ **Gestión de Partidos** - Crear partidos y registrar resultados  
✅ **Gestión de Jornadas** - Organizar partidos por jornadas  
✅ **Tabla de Posiciones** - Actualización automática al finalizar partidos  
✅ **Diseño Profesional** - Dark theme moderno y responsive  
✅ **Notificaciones** - Feedback visual de todas las acciones  

📖 **[Ver Documentación Completa del Panel de Administración](ADMIN_PANEL.md)**
  

## 🚀 Cómo Usar

1. **Abrir el sitio**: Abre `index.html` en tu navegador
2. **Navegar**: Usa el menú superior para ir a diferentes páginas
3. **Editar datos**: Modifica el archivo `script.js` (ver sección siguiente)
4. **Personalizar**: Edita textos en los archivos HTML

## ✏️ Cómo Editar los Datos

### 📍 Ubicación de los Datos

**Todos los datos del torneo están en `script.js`** al inicio del archivo. Edita estos datos y recarga la página para ver los cambios.

### 1. Tabla de Posiciones

Busca la variable `standingsData` en `script.js`:

```javascript
const standingsData = [
    { 
        pos: 1,                    // Posición en la tabla
        team: "Nombre del Equipo", // Nombre del equipo
        logo: "⚽",                 // Emoji del logo
        pj: 14,                    // Partidos jugados
        pg: 10,                    // Partidos ganados
        pe: 3,                     // Partidos empatados
        pp: 1,                     // Partidos perdidos
        gf: 32,                    // Goles a favor
        gc: 12,                    // Goles en contra
        dg: 20,                    // Diferencia de goles
        pts: 33,                   // Puntos totales
        status: "champion"         // "champion" (verde), "relegation" (rojo) o ""
    },
    // Agrega más equipos aquí...
];
```

### 2. Próximos Partidos

Busca la variable `matchesData`:

```javascript
const matchesData = [
    { 
        date: "Sábado 15 Feb, 15:00",  // Fecha y hora del partido
        homeTeam: "Equipo Local",       // Nombre del equipo local
        homeLogo: "⚽",                  // Logo del equipo local
        awayTeam: "Equipo Visitante",   // Nombre del equipo visitante
        awayLogo: "🏆",                 // Logo del equipo visitante
        homeScore: null,                // Goles del local (null si no se jugó)
        awayScore: null                 // Goles del visitante (null si no se jugó)
    },
    // Agrega más partidos aquí...
];
```

**Para mostrar resultados de partidos ya jugados:**
```javascript
homeScore: 3,  // Cambiar null por el marcador
awayScore: 1
```

### 3. Goleadores

Busca la variable `topScorersData`:

```javascript
const topScorersData = [
    { 
        rank: 1,                    // Posición en la tabla
        name: "Nombre del Jugador", // Nombre completo
        team: "Nombre del Equipo",  // Equipo al que pertenece
        goals: 15,                  // Cantidad de goles
        rankClass: "gold"           // "gold", "silver", "bronze" o ""
    },
    // Agrega más jugadores aquí...
];
```

### 4. Tarjetas Amarillas y Rojas

Similar a los goleadores, busca `yellowCardsData` y `redCardsData`:

```javascript
const yellowCardsData = [
    { 
        rank: 1,
        name: "Nombre del Jugador",
        team: "Nombre del Equipo",
        cards: 7,                   // Cantidad de tarjetas
        rankClass: "gold"
    },
    // Agrega más jugadores aquí...
];
```

### 5. Equipos Participantes

Busca la variable `teamsData`:

```javascript
const teamsData = [
    { 
        name: "Nombre del Equipo",  // Nombre del equipo
        logo: "⚽",                  // Emoji del logo
        players: 22,                // Cantidad de jugadores
        wins: 10,                   // Victorias
        losses: 1                   // Derrotas
    },
    // Agrega más equipos aquí...
];
```

## 📝 Editar Textos de las Páginas

### Página de Inicio (index.html)

#### Cambiar el nombre del torneo:
```html
<h1 class="league-title">NOVAPROCUP</h1>
<p class="season-text">Temporada 2025</p>
```

#### Editar el hero principal:
```html
<h2 class="hero-title-large">NOVAPROCUP</h2>
<p class="hero-subtitle-large">El torneo de fútbol más emocionante de la región</p>
```

#### Modificar las tarjetas de información:
Busca las secciones con clase `content-card` y edita:
- `content-card-title` - Título de la tarjeta
- `content-card-text` - Descripción

#### Personalizar información de FUTNOVA:
Busca la sección `section-futnova` y edita:
- `futnova-title` - Título de la sección
- `futnova-description` - Descripción del centro deportivo
- `feature-title` y `feature-text` - Características de las instalaciones

### Otras Páginas

Cada página (posiciones.html, partidos.html, etc.) tiene su propio `hero-title` y `hero-subtitle` que puedes editar.

## 🎨 Personalizar Colores

Abre `styles.css` y busca la sección `:root` al inicio:

```css
:root {
    /* Cambia estos colores según tu preferencia */
    --primary-color: #10b981;      /* Color principal (verde) */
    --accent-color: #3b82f6;       /* Color de acento (azul) */
    --bg-primary: #0f172a;         /* Fondo principal */
    /* ... más colores ... */
}
```

### Paletas de Colores Sugeridas:

**Rojo y Dorado (Clásico):**
```css
--primary-color: #ef4444;
--accent-color: #f59e0b;
```

**Azul y Púrpura (Moderno):**
```css
--primary-color: #3b82f6;
--accent-color: #8b5cf6;
```

**Verde y Cian (Fresco):**
```css
--primary-color: #10b981;
--accent-color: #06b6d4;
```

## 🖼️ Agregar Imagen de FUTNOVA

Para reemplazar el placeholder de la imagen de FUTNOVA en `index.html`:

1. Guarda tu imagen en la misma carpeta (ejemplo: `futnova.jpg`)
2. Busca la sección con clase `image-placeholder`
3. Reemplázala con:

```html
<div class="futnova-image">
    <img src="futnova.jpg" alt="Centro Deportivo FUTNOVA" 
         style="width: 100%; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6);">
</div>
```

## 🌐 Emojis Recomendados para Logos

Puedes usar cualquier emoji como logo de equipo:

⚽ 🏆 🥇 🎯 ⚡ 🔥 💪 🦁 🦅 🐺  
⚙️ ⛽ 🏗️ ⚕️ ⚖️ 💰 📚 🧮 🐾 🌾  
🌟 ⭐ 💫 🎖️ 🏅 👑 🛡️ ⚔️ 🎪 🎭  
🚀 ⚓ 🎸 🎨 🔧 🏀 🎾 🏐 ⛳ 🎳  

## 📱 Navegación del Sitio

El sitio tiene 5 páginas principales:

1. **Inicio** (`index.html`) - Información del torneo y FUTNOVA
2. **Posiciones** (`posiciones.html`) - Tabla de clasificación
3. **Partidos** (`partidos.html`) - Calendario de encuentros
4. **Estadísticas** (`estadisticas.html`) - Goleadores y tarjetas
5. **Equipos** (`equipos.html`) - Todos los equipos participantes

Todas las páginas comparten el mismo menú de navegación en el header.

## 🔧 Funciones Avanzadas (Consola del Navegador)

Abre la consola del navegador (F12) y usa estas funciones:

```javascript
// Agregar un nuevo equipo
window.ligaFutbol.addTeam({
    pos: 11,
    team: "Nuevo Equipo FC",
    logo: "🆕",
    pj: 0, pg: 0, pe: 0, pp: 0,
    gf: 0, gc: 0, dg: 0, pts: 0,
    status: ""
});

// Agregar un nuevo partido
window.ligaFutbol.addMatch({
    date: "Lunes 17 Feb, 19:00",
    homeTeam: "Equipo A",
    homeLogo: "⚽",
    awayTeam: "Equipo B",
    awayLogo: "🏆",
    homeScore: null,
    awayScore: null
});

// Actualizar resultado de un partido (índice, goles local, goles visitante)
window.ligaFutbol.updateMatchScore(0, 3, 1);
```

## 💡 Consejos Importantes

1. **Guarda copias de seguridad** antes de hacer cambios grandes
2. **Prueba en diferentes navegadores** (Chrome, Firefox, Edge)
3. **Usa la consola del navegador** (F12) para ver errores
4. **Los cambios en `script.js`** se ven al recargar la página (F5)
5. **Mantén la estructura de los objetos** al editar datos
6. **Usa comillas dobles** para los textos en JavaScript
7. **No olvides las comas** entre elementos de arrays

## 🆘 Solución de Problemas

**No se ven los datos:**
- Abre la consola (F12) y busca errores en rojo
- Verifica que la sintaxis JavaScript sea correcta (comas, llaves, corchetes)
- Asegúrate de que todos los archivos estén en la misma carpeta

**Los estilos no se aplican:**
- Verifica que `styles.css` esté en la misma carpeta
- Limpia la caché del navegador (Ctrl + F5)
- Revisa que no haya errores de sintaxis en el CSS

**La navegación no funciona:**
- Asegúrate de que todos los archivos HTML estén en la misma carpeta
- Verifica que los nombres de archivo coincidan exactamente

**Las páginas se ven en blanco:**
- Abre la consola (F12) para ver errores
- Verifica que `script.js` esté en la misma carpeta
- Revisa que no haya errores de sintaxis en JavaScript

## 📋 Checklist de Personalización

- [ ] Cambiar nombre del torneo en todas las páginas
- [ ] Actualizar datos de la tabla de posiciones
- [ ] Agregar partidos al calendario
- [ ] Actualizar estadísticas de jugadores
- [ ] Personalizar información de FUTNOVA
- [ ] Agregar imagen del centro deportivo (opcional)
- [ ] Cambiar colores del tema (opcional)
- [ ] Actualizar información del footer
- [ ] Probar en móvil y desktop
- [ ] Verificar que todos los enlaces funcionen

## 🎯 Próximos Pasos

1. **Edita los datos** en `script.js` con la información real de tu torneo
2. **Personaliza los textos** en cada página HTML
3. **Agrega una imagen** del Centro Deportivo FUTNOVA
4. **Prueba el sitio** en diferentes dispositivos
5. **Comparte** con los participantes del torneo

---

## 📞 Estructura de Archivos

Asegúrate de que todos estos archivos estén en la misma carpeta:

```
✅ index.html
✅ posiciones.html
✅ partidos.html
✅ estadisticas.html
✅ equipos.html
✅ styles.css
✅ script.js
✅ README.md
```

---

¡Disfruta tu sitio web de NOVAPROCUP! ⚽🏆

**Centro Deportivo FUTNOVA** - Instalaciones de primer nivel para el mejor fútbol de la región.
