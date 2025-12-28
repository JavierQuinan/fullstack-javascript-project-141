# 📋 Task Manager Application

[![Actions Status](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions)

Sistema completo de gestión de tareas (Task Manager) construido con tecnologías JavaScript modernas. Aplicación full-stack con autenticación de usuarios, CRUD de tareas, sistema de etiquetas y estados personalizables.

---

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Cómo Funciona](#-cómo-funciona)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Base de Datos](#-base-de-datos)
- [Testing](#-testing)
- [Variables de Entorno](#-variables-de-entorno)

---

## ✨ Características

### 🔐 Autenticación y Usuarios
- **Registro de usuarios**: Creación de cuentas con validación de datos
- **Login/Logout**: Sistema de sesiones seguro basado en cookies
- **Cifrado de contraseñas**: Hash con bcrypt (salt rounds: 10)
- **Gestión de perfil**: Edición y eliminación de cuentas de usuario
- **Control de acceso**: Protección de rutas que requieren autenticación

### 📝 Gestión de Tareas
- **CRUD completo**: Crear, leer, actualizar y eliminar tareas
- **Asignación de tareas**: Asignar tareas a usuarios específicos (ejecutores)
- **Estados personalizables**: Asignar estados a las tareas (nuevo, en progreso, completado, etc.)
- **Sistema de etiquetas**: Organizar tareas con múltiples etiquetas
- **Descripción detallada**: Campo de texto para describir cada tarea
- **Autoría**: Registro automático del creador de cada tarea

### 🎯 Filtrado Avanzado
- **Por estado**: Filtrar tareas según su estado actual
- **Por ejecutor**: Ver tareas asignadas a un usuario específico
- **Por creador**: Filtrar tareas creadas por un usuario
- **Por etiqueta**: Buscar tareas que contengan etiquetas específicas
- **Tareas propias**: Opción para ver solo las tareas creadas por el usuario actual
- **Combinación de filtros**: Aplicar múltiples filtros simultáneamente

### 🏷️ Sistema de Etiquetas
- **CRUD de etiquetas**: Crear, editar, listar y eliminar etiquetas
- **Relación muchos-a-muchos**: Una tarea puede tener múltiples etiquetas
- **Protección de eliminación**: No se pueden eliminar etiquetas en uso

### 📊 Estados de Tareas
- **Estados personalizados**: Crear estados según el flujo de trabajo
- **CRUD de estados**: Gestión completa de estados
- **Validación de eliminación**: Protección contra eliminación de estados en uso

### 🌍 Internacionalización
- **Multi-idioma**: Soporte para Inglés y Español
- **i18next**: Sistema de traducciones completo
- **Cambio de idioma**: Selector de idioma en la interfaz

### 🔍 Monitoreo de Errores
- **Rollbar**: Integración para tracking de errores en producción
- **Logging**: Sistema de logs con Fastify logger
- **Manejo de errores**: Error handler centralizado

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **[Fastify 5.x](https://www.fastify.io/)**: Framework web ultra-rápido y de bajo overhead
  - Plugin `@fastify/formbody`: Para parsear formularios (application/x-www-form-urlencoded)
  - Plugin `@fastify/cookie`: Manejo de cookies (actualmente con implementación manual)
- **[Node.js](https://nodejs.org/)**: Runtime de JavaScript basado en el motor V8 de Chrome
- **ES Modules**: Uso de módulos ECMAScript nativos (`import`/`export`)

### Base de Datos
- **[SQLite3](https://www.sqlite.org/)**: Base de datos relacional ligera y embebida
- **[Knex.js 2.5+](http://knexjs.org/)**: Query builder SQL y sistema de migraciones
- **[Objection.js 3.1+](https://vincit.github.io/objection.js/)**: ORM basado en Knex para modelado de datos
- **[fastify-objectionjs](https://www.npmjs.com/package/fastify-objectionjs)**: Plugin de Fastify para integrar Objection

### Frontend
- **[Pug](https://pugjs.org/)**: Motor de plantillas HTML (antes conocido como Jade)
- **[Bootstrap 5](https://getbootstrap.com/)**: Framework CSS para diseño responsive
- **[Webpack 5](https://webpack.js.org/)**: Bundler de módulos para assets frontend
  - `webpack-cli`: Herramienta CLI para ejecutar Webpack

### Seguridad y Autenticación
- **[bcrypt 5.1+](https://www.npmjs.com/package/bcrypt)**: Librería para hash de contraseñas
  - Genera salt automático
  - Usa 10 rounds de salt por defecto
- **Cookie-based sessions**: Gestión de sesiones mediante cookies HTTP
  - HttpOnly cookies para prevenir XSS
  - Implementación manual de parseo y serialización

### Internacionalización
- **[i18next 23+](https://www.i18next.com/)**: Framework de internacionalización
- **[i18next-fs-backend](https://github.com/i18next/i18next-fs-backend)**: Backend para cargar traducciones desde archivos
- **Idiomas soportados**: Inglés (en), Español (es)

### Monitoreo y Errores
- **[Rollbar](https://rollbar.com/)**: Plataforma de monitoreo de errores en producción
- **Fastify Logger**: Sistema de logging integrado

### Desarrollo y Testing
- **[Mocha 10+](https://mochajs.org/)**: Framework de testing
- **[ESLint 8+](https://eslint.org/)**: Linter para mantener código consistente
  - Config: `eslint-config-airbnb-base`
  - Plugin: `eslint-plugin-import`
- **[Prettier 3+](https://prettier.io/)**: Formateador de código
- **[dotenv 16+](https://www.npmjs.com/package/dotenv)**: Carga de variables de entorno desde archivo `.env`

### Utilidades
- **[crypto](https://nodejs.org/api/crypto.html)**: Módulo nativo de Node.js para operaciones criptográficas
- **[path](https://nodejs.org/api/path.html)**: Manejo de rutas de archivos
- **[fs](https://nodejs.org/api/fs.html)**: Sistema de archivos de Node.js

---

## 🔄 Cómo Funciona

### Arquitectura General

La aplicación sigue el patrón **MVC (Model-View-Controller)** con una arquitectura de capas:

```
┌─────────────────────────────────────────────┐
│           CLIENTE (Navegador)               │
│         HTML + Bootstrap + JS               │
└──────────────────┬──────────────────────────┘
                   │ HTTP Request/Response
┌──────────────────▼──────────────────────────┐
│         FASTIFY SERVER (Controller)         │
│  - Rutas y Controladores                    │
│  - Middlewares (auth, cookies, flash)       │
│  - Renderizado de vistas Pug                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         REPOSITORIOS (Data Layer)           │
│  - userRepository.js                        │
│  - taskRepository.js                        │
│  - statusRepository.js                      │
│  - labelRepository.js                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         OBJECTION.JS (ORM)                  │
│  - Modelos de datos                         │
│  - Relaciones entre tablas                  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           KNEX.JS (Query Builder)           │
│  - Construcción de queries SQL              │
│  - Sistema de migraciones                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         SQLite3 DATABASE                    │
│  - data/app.sqlite3                         │
└─────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
1. Usuario accede a /session/new (login)
2. Introduce email y contraseña
3. POST /session
   ├─ Buscar usuario por email
   ├─ Comparar hash: bcrypt.compare(password, user.passwordHash)
   ├─ Si es válido:
   │  ├─ Crear cookie 'userId' con el ID del usuario
   │  └─ Redirigir a / (home)
   └─ Si falla: Mostrar error

4. En cada request:
   ├─ onRequest hook parsea cookies
   ├─ Lee userId de la cookie
   ├─ Busca usuario en DB: userRepo.findById()
   └─ Asigna request.currentUser

5. Logout en DELETE /session:
   ├─ Elimina cookie 'userId'
   └─ Redirigir a /
```

### Flujo de Gestión de Tareas

```
CREAR TAREA
├─ GET /tasks/new
│  ├─ Verifica autenticación
│  ├─ Carga todos los usuarios (ejecutores)
│  ├─ Carga todos los estados
│  ├─ Carga todas las etiquetas
│  └─ Renderiza formulario
│
├─ POST /tasks
   ├─ Valida datos (nombre requerido)
   ├─ Crea tarea con creatorId = currentUser.id
   ├─ Si hay etiquetas seleccionadas:
   │  └─ Crea relaciones en tasks_labels
   └─ Redirige a /tasks

EDITAR TAREA
├─ GET /tasks/:id/edit
│  ├─ Busca tarea por ID
│  ├─ Carga datos para el formulario
│  └─ Renderiza formulario pre-rellenado
│
├─ PATCH /tasks/:id
   ├─ Actualiza datos de la tarea
   ├─ Elimina etiquetas antiguas
   ├─ Crea nuevas relaciones de etiquetas
   └─ Redirige a /tasks

ELIMINAR TAREA
└─ DELETE /tasks/:id
   ├─ Verifica que el creador sea el usuario actual
   ├─ Elimina relaciones tasks_labels
   ├─ Elimina la tarea
   └─ Redirige a /tasks
```

### Sistema de Filtrado

```
GET /tasks?status=1&executor=2&label=3&isCreatorUser=on

1. Parse query parameters
2. Construir query base: SELECT * FROM tasks
3. Aplicar joins:
   ├─ JOIN users as creator
   ├─ JOIN users as executor (opcional)
   └─ JOIN tasks_labels si hay filtro de label
4. Aplicar WHERE clauses:
   ├─ status_id = ? (si existe)
   ├─ executor_id = ? (si existe)
   ├─ creator_id = ? (si isCreatorUser)
   └─ label_id = ? (si existe)
5. Ejecutar query
6. Renderizar vista con resultados
```

### Base de Datos - Esquema

```sql
-- Tabla de usuarios
users
├─ id (PRIMARY KEY)
├─ email (UNIQUE, antes de migración 20240101000006)
├─ password_hash
├─ first_name
├─ last_name
├─ created_at
└─ updated_at

-- Tabla de estados
statuses
├─ id (PRIMARY KEY)
├─ name (NOT NULL)
├─ created_at
└─ updated_at

-- Tabla de etiquetas
labels
├─ id (PRIMARY KEY)
├─ name (NOT NULL)
├─ created_at
└─ updated_at

-- Tabla de tareas
tasks
├─ id (PRIMARY KEY)
├─ name (NOT NULL)
├─ description
├─ status_id (FOREIGN KEY → statuses.id)
├─ creator_id (FOREIGN KEY → users.id, NOT NULL)
├─ executor_id (FOREIGN KEY → users.id, nullable)
├─ created_at
└─ updated_at

-- Tabla de relación muchos-a-muchos
tasks_labels
├─ id (PRIMARY KEY)
├─ task_id (FOREIGN KEY → tasks.id)
├─ label_id (FOREIGN KEY → labels.id)
└─ UNIQUE(task_id, label_id)
```

### Sistema de Flash Messages

```javascript
// Almacenamiento en cookie
setFlash(reply, 'success', 'Tarea creada')
  └─ Crea cookie 'flash' con JSON: {type, message}

// Lectura y limpieza
getFlash(request, reply)
  ├─ Lee cookie 'flash'
  ├─ Parsea JSON
  ├─ Elimina cookie
  └─ Retorna {type, message}

// Uso en templates
flash.type → 'success', 'danger', 'warning', 'info'
flash.message → Mensaje a mostrar
```

### Internacionalización (i18n)

```javascript
// Inicialización
i18next.use(Backend).init({
  fallbackLng: 'en',
  preload: ['en', 'es'],
  backend: { loadPath: 'locales/{{lng}}/translation.json' }
})

// Uso en rutas
const lang = request.query.lng || 'es'
const t = i18next.getFixedT(lang)

// En plantillas Pug
h1= t('tasks.title')
p= t('tasks.description', { count: tasks.length })

// Estructura de archivos
locales/
├── en/translation.json
└── es/translation.json
```

---

## 📁 Arquitectura del Proyecto

```
fullstack-javascript-project-141/
├── src/                          # Código fuente de la aplicación
│   ├── app.js                    # Aplicación principal Fastify
│   │   ├─ Configuración de plugins
│   │   ├─ Middlewares (cookies, auth)
│   │   ├─ Definición de rutas
│   │   └─ Error handlers
│   ├── server.js                 # Punto de entrada del servidor
│   ├── db.js                     # Configuración de Knex y base de datos
│   ├── rollbar.js                # Configuración de Rollbar
│   ├── repositories/             # Capa de acceso a datos
│   │   ├── userRepository.js     # CRUD de usuarios
│   │   ├── taskRepository.js     # CRUD de tareas + filtros
│   │   ├── statusRepository.js   # CRUD de estados
│   │   └── labelRepository.js    # CRUD de etiquetas
│   └── frontend/
│       └── index.js              # Entry point para Webpack
│
├── views/                        # Plantillas Pug
│   ├── layout.pug                # Layout base con Bootstrap
│   ├── index.pug                 # Página principal
│   ├── session/
│   │   └── new.pug               # Formulario de login
│   ├── users/
│   │   ├── index.pug             # Lista de usuarios
│   │   ├── new.pug               # Formulario de registro
│   │   └── edit.pug              # Editar perfil
│   ├── tasks/
│   │   ├── index.pug             # Lista de tareas + filtros
│   │   ├── new.pug               # Crear tarea
│   │   ├── edit.pug              # Editar tarea
│   │   └── show.pug              # Ver detalle de tarea
│   ├── statuses/
│   │   ├── index.pug             # Lista de estados
│   │   ├── new.pug               # Crear estado
│   │   └── edit.pug              # Editar estado
│   └── labels/
│       ├── index.pug             # Lista de etiquetas
│       ├── new.pug               # Crear etiqueta
│       └── edit.pug              # Editar etiqueta
│
├── migrations/                   # Migraciones de base de datos (Knex)
│   ├── 20240101000001_create_users.cjs
│   ├── 20240101000002_create_statuses.cjs
│   ├── 20240101000003_create_tasks.cjs
│   ├── 20240101000004_create_labels.cjs
│   ├── 20240101000005_create_tasks_labels.cjs
│   └── 20240101000006_remove_email_unique_constraint.cjs
│
├── locales/                      # Archivos de traducción
│   ├── en/
│   │   └── translation.json      # Traducciones en inglés
│   └── es/
│       └── translation.json      # Traducciones en español
│
├── data/
│   └── app.sqlite3               # Base de datos SQLite (generada)
│
├── public/                       # Archivos estáticos
│   └── (bundles de Webpack)
│
├── test/
│   └── tasks.filter.test.js      # Tests de filtrado de tareas
│
├── scripts/
│   ├── setup.js                  # Script de configuración inicial
│   ├── ci-pre-setup.sh           # Setup para CI
│   └── push.sh                   # Scripts de deploy
│
├── knexfile.js                   # Configuración de Knex
├── webpack.config.cjs            # Configuración de Webpack
├── package.json                  # Dependencias y scripts
├── Makefile                      # Comandos Make
└── .env                          # Variables de entorno (no en repo)
```

---

## 📥 Instalación

### Requisitos Previos
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/JavierQuinan/fullstack-javascript-project-141.git
cd fullstack-javascript-project-141

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
npm run setup
# O manualmente: cp .env.example .env y editar valores

# 4. Ejecutar migraciones de base de datos
npm run db:migrate
# O: npx knex migrate:latest

# 5. Construir assets frontend
npm run build

# 6. Iniciar servidor
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🚀 Uso

### Comandos Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor en modo desarrollo
npm run dev            # Alias de npm start

# Build
npm run build          # Compilar assets con Webpack (producción)

# Base de datos
npm run db:migrate     # Ejecutar migraciones pendientes
npx knex migrate:make nombre_migracion  # Crear nueva migración
npx knex migrate:rollback                # Revertir última migración
npx knex migrate:status                  # Ver estado de migraciones

# Testing
npm test               # Ejecutar suite de tests

# Setup
npm run setup          # Configuración inicial (crea .env)
```

### Uso de la Aplicación

#### 1. Registro de Usuario
- Accede a `/users/new`
- Completa: First Name, Last Name, Email, Password
- Click en "Registrar"

#### 2. Iniciar Sesión
- Accede a `/session/new`
- Ingresa Email y Password
- Click en "Entrar"

#### 3. Crear Estados (opcional pero recomendado)
- Ve a `/statuses`
- Click en "Crear estado"
- Ingresa nombre del estado (ej: "Nuevo", "En progreso", "Completado")

#### 4. Crear Etiquetas (opcional)
- Ve a `/labels`
- Click en "Crear etiqueta"
- Ingresa nombre de la etiqueta (ej: "urgente", "bug", "feature")

#### 5. Crear Tarea
- Ve a `/tasks/new`
- Completa:
  - Nombre (requerido)
  - Descripción (opcional)
  - Estado (opcional)
  - Ejecutor (opcional)
  - Etiquetas (opcional, múltiple selección)
- Click en "Crear"

#### 6. Filtrar Tareas
- Ve a `/tasks`
- Usa los filtros:
  - Estado
  - Ejecutor
  - Etiqueta
  - Solo mis tareas (checkbox)
- Click en "Mostrar"

---

## 🗄️ Base de Datos

### Configuración

El archivo `knexfile.js` configura Knex:

```javascript
{
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_FILE || './data/app.sqlite3'
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations'
  }
}
```

### Migraciones

Las migraciones están en `/migrations` y siguen el formato:

```javascript
// Ejemplo: migrations/20240101000003_create_tasks.cjs
exports.up = (knex) => knex.schema.createTable('tasks', (table) => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.text('description');
  table.integer('status_id').references('id').inTable('statuses');
  table.integer('creator_id').notNullable().references('id').inTable('users');
  table.integer('executor_id').references('id').inTable('users');
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('tasks');
```

### Relaciones

- **users ↔ tasks**: Un usuario puede crear múltiples tareas (creator)
- **users ↔ tasks**: Un usuario puede ejecutar múltiples tareas (executor)
- **statuses ↔ tasks**: Un estado puede tener múltiples tareas
- **tasks ↔ labels**: Relación muchos-a-muchos a través de `tasks_labels`

---

## 🧪 Testing

### Ejecutar Tests

```bash
npm test
```

### Estructura de Tests

```javascript
// test/tasks.filter.test.js
describe('Task Filtering', () => {
  it('should filter tasks by status', async () => {
    // Test de filtrado por estado
  });

  it('should filter tasks by executor', async () => {
    // Test de filtrado por ejecutor
  });

  it('should filter tasks by label', async () => {
    // Test de filtrado por etiqueta
  });
});
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
HOST=0.0.0.0

# Base de datos
# Para desarrollo: ruta al archivo SQLite
DB_FILE=./data/app.sqlite3
# Para tests: usar memoria
# DB_FILE=:memory:

# Seguridad
COOKIE_SECRET=your-super-secret-key-change-in-production

# Rollbar (opcional, solo producción)
ROLLBAR_ACCESS_TOKEN=your_rollbar_token_here

# i18n
DEFAULT_LANGUAGE=es
```

### Descripción de Variables

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, `test`) | No | `development` |
| `PORT` | Puerto del servidor | No | `3000` |
| `HOST` | Host del servidor | No | `0.0.0.0` |
| `DB_FILE` | Ruta al archivo SQLite o `:memory:` | No | `./data/app.sqlite3` |
| `COOKIE_SECRET` | Secreto para firmar cookies | Recomendado | - |
| `ROLLBAR_ACCESS_TOKEN` | Token de Rollbar para monitoreo | No | - |
| `DEFAULT_LANGUAGE` | Idioma por defecto (`en`, `es`) | No | `es` |

---

## 📝 Licencia

ISC

---

## 👤 Autor

**Javier Quiñan** - [GitHub](https://github.com/JavierQuinan)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

_Versión: 1.0.2 | Última actualización: Diciembre 2025_