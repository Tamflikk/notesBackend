# Notes Backend

API para gestionar notas y etiquetas usando **Node.js**, **Supabase** y **Swagger** para documentación interactiva.

## Requisitos

- **Node.js** (LTS recomendado)
- **npm** o **yarn**

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Tamflikk/notesBackend.git
   cd notes-backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el proyecto:
   - Desarrollo: `npm run dev`
   - Producción: `npm start`

## Swagger

Accede a la documentación interactiva en:
```bash
http://localhost:3000/api-docs
```

## Endpoints

### Autenticación
- Registro: `POST /api/auth/register`
- Iniciar sesión: `POST /api/auth/login`
- Perfil: `GET /api/auth/profile`

### Notas
- Crear: `POST /api/notes`
- Obtener todas: `GET /api/notes`
- Obtener por ID: `GET /api/notes/:id`
- Actualizar: `PUT /api/notes/:id`
- Eliminar: `DELETE /api/notes/:id`
- Buscar: `GET /api/notes/search`
- Archivar/Desarchivar: `POST /api/notes/:id/archive`

### Etiquetas
- Crear: `POST /api/tags`
- Obtener todas: `GET /api/tags`
- Eliminar: `DELETE /api/tags/:id`

## Base de Datos

Esquema en `/supabase/migrations/`. Tablas principales:

## Autenticación en Swagger

1. Obtén un token JWT al registrarte/iniciar sesión.
2. En Swagger UI (`http://localhost:3000/api-docs`), haz clic en **Authorize**.
3. Ingresa el token para realizar peticiones autenticadas.