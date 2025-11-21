# TesisUP - Sistema de Gestión de Tesis

Sistema web para la gestión, búsqueda y descarga de tesis universitarias. Desarrollado con React y Material-UI, ofrece una interfaz moderna e intuitiva para administrar el repositorio de trabajos de grado.

## 🚀 Características Principales

### Gestión de Tesis
- **CRUD completo** de tesis con formularios validados
- **Gestión de usuarios** (estudiantes, profesores, encargados)
- **Asignación de roles**: autores, tutores, jurados y encargados
- **Estados de tesis**: Aprobada, Pendiente, Rechazada
- **Gestión de sedes** universitarias

### Búsqueda y Filtrado Avanzado
- **Búsqueda por texto** en títulos y contenido
- **Filtros múltiples**:
  - Por autor (multi-select con autocomplete)
  - Por tutor (autocomplete con búsqueda por nombre/cédula)
  - Por encargado (autocomplete)
  - Por jurado (multi-select con autocomplete)
  - Por sede
  - Por rango de fechas
  - Por estado
- **Ordenamiento dinámico** por nombre, fecha, estado, etc.
- **Paginación** configurable

### Descargas
- **Descarga individual** de PDFs de tesis
- **Descarga masiva** con progreso en tiempo real (SSE)
- **Exportación a Excel** de listados de tesis con formato profesional

### Experiencia de Usuario
- **Tema claro/oscuro** con persistencia en localStorage
- **Preferencias guardadas**: tema y configuración de ordenamiento
- **Interfaz responsive** adaptada a diferentes dispositivos
- **Mensajes descriptivos** de error y estados vacíos
- **Perfiles de usuario** con información detallada y edición

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca principal
- **React Router DOM 7** - Navegación
- **Material-UI (MUI) 7** - Componentes UI
- **Tailwind CSS 4** - Estilos utilitarios
- **Vite 6** - Build tool y dev server

### Librerías Adicionales
- **Axios** - Cliente HTTP
- **Day.js** - Manejo de fechas
- **XLSX** - Exportación a Excel
- **Framer Motion** - Animaciones
- **React Icons** - Iconografía

### Herramientas de Desarrollo
- **ESLint** - Linting
- **PostCSS** - Procesamiento CSS
- **Autoprefixer** - Compatibilidad CSS

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Backend API** - El servidor backend se encuentra en: [https://github.com/jgarcia691/Server_Tesis](https://github.com/jgarcia691/Server_Tesis)
  - Seguir las instrucciones del repositorio del backend para configurarlo
  - Configurar `VITE_API_URL` para apuntar a la instancia del backend

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd tesisup
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:8080/api
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 🏗️ Estructura del Proyecto

```
tesisup/
├── src/
│   ├── components/
│   │   ├── main/
│   │   │   ├── Card/          # Componentes de tarjetas de tesis
│   │   │   ├── Form/          # Formularios de gestión
│   │   │   ├── Layout/        # Componentes de layout (Header, Filters, etc.)
│   │   │   ├── Profile/       # Perfiles de usuario
│   │   │   ├── Search/        # Barra de búsqueda
│   │   │   └── Ui/            # Componentes UI reutilizables
│   │   └── Ui/                # Componentes UI globales
│   ├── context/
│   │   ├── AuthContext.jsx    # Contexto de autenticación
│   │   └── ThemeContext.jsx   # Contexto de tema (dark/light)
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Páginas principales
│   ├── utils/                 # Utilidades
│   ├── App.jsx                # Componente raíz
│   └── main.jsx               # Punto de entrada
├── public/                    # Archivos estáticos
├── .env                       # Variables de entorno
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Autenticación

El sistema utiliza autenticación basada en tokens JWT:
- Los tokens se almacenan en `localStorage`
- Las peticiones incluyen el token en el header `Authorization: Bearer <token>`
- Soporte para diferentes roles: estudiante, profesor, encargado

## 🎨 Temas

El sistema soporta tema claro y oscuro:
- Cambio mediante botón en el header
- Preferencia guardada en `localStorage`
- Persistencia entre sesiones

## 📱 Características de Accesibilidad

- Etiquetas ARIA apropiadas
- Navegación por teclado
- Contraste de colores adecuado
- Mensajes descriptivos para lectores de pantalla

## 🐛 Solución de Problemas

### El servidor de desarrollo no inicia
- Verificar que Node.js esté instalado: `node --version`
- Eliminar `node_modules` y reinstalar: `rm -rf node_modules && npm install`

### Errores de CORS
- Verificar que `VITE_API_URL` esté correctamente configurado
- Asegurar que el backend permita peticiones desde el origen del frontend

### Las descargas no funcionan
- Verificar que el backend esté corriendo
- Revisar la consola del navegador para errores de red
- Verificar permisos de descarga en el navegador