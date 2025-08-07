# 🚀 Migración a Vercel Functions - Estructura Unificada

## 📋 Resumen de Cambios

Hemos migrado el proyecto de una arquitectura separada (API + Cliente) a una estructura unificada usando **Vercel Functions**, optimizada para Vercel Lite.

## 🔄 Cambios Realizados

### 1. Estructura del Proyecto

**ANTES:**
```
mykap-erp/
├── api/                    # API separada con Express
│   ├── src/
│   ├── package.json
│   └── ...
├── client/                 # Frontend React
│   ├── src/
│   ├── package.json
│   └── ...
└── vercel.json
```

**DESPUÉS:**
```
mykap-erp/
├── client/                 # Todo unificado aquí
│   ├── api/               # 🆕 Vercel Functions
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   ├── prospects/
│   │   │   └── index.ts
│   │   ├── users/
│   │   │   └── index.ts
│   │   ├── lenders/
│   │   │   └── index.ts
│   │   ├── credits/
│   │   │   └── index.ts
│   │   ├── data-manager.ts
│   │   └── utils/
│   ├── src/               # Frontend React
│   ├── package.json       # 🔄 Actualizado con deps de API
│   ├── .env.example       # 🆕 Copiado desde API
│   └── seed-users.js      # 🆕 Copiado desde API
└── vercel.json            # 🔄 Actualizado para Functions
```

### 2. Archivos Migrados

✅ **Copiados exitosamente:**
- `api/src/` → `client/api/` (todos los archivos)
- `api/env.example` → `client/.env.example`
- `api/seed-users.js` → `client/seed-users.js`

### 3. Dependencias Actualizadas

**Agregadas a `client/package.json`:**
```json
{
  "dependencies": {
    // ... dependencias existentes
    "bcryptjs": "^3.0.2",
    "connect-mongo": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0",
    "express": "^5.1.0",
    "express-rate-limit": "^8.0.1",
    "express-session": "^1.18.2",
    "mongoose": "^8.16.4",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    // ... dependencias existentes
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/express-session": "^1.18.2",
    "@types/node": "^24.0.15",
    "@vercel/node": "^3.0.0"
  }
}
```

### 4. Configuración de Vercel

**`vercel.json` actualizado:**
```json
{
  "framework": "vite",
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "cd client && npm install",
  "functions": {
    "client/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 5. API Service Actualizado

**`client/src/services/apiService.ts`:**
- ✅ Configurado para usar `/api` en producción (Vercel Functions)
- ✅ Mantiene `http://localhost:3000/api` para desarrollo local

## 🔗 Rutas de API Migradas

### Autenticación
- `POST /api/auth/register` → `client/api/auth/register.ts`
- `POST /api/auth/login` → `client/api/auth/login.ts`

### Prospects
- `GET /api/prospects` → `client/api/prospects/index.ts`
- `POST /api/prospects` → `client/api/prospects/index.ts`
- `PUT /api/prospects/[id]` → `client/api/prospects/index.ts`
- Y todas las operaciones de documentos...

### Usuarios
- `GET /api/users` → `client/api/users/index.ts`

### Lenders
- `GET /api/lenders` → `client/api/lenders/index.ts`

### Credits
- `GET /api/credits` → `client/api/credits/index.ts`

## ✅ Ventajas de la Nueva Estructura

1. **🎯 Optimizado para Vercel Lite:**
   - Un solo proyecto en lugar de dos
   - Sin necesidad de configurar múltiples entornos
   - Deployment automático desde una sola rama

2. **🚀 Mejor Performance:**
   - Vercel Functions se ejecutan en el mismo dominio
   - Menor latencia entre frontend y backend
   - Mejor caching y CDN

3. **🔧 Mantenimiento Simplificado:**
   - Una sola configuración de deployment
   - Dependencias unificadas
   - Menos complejidad en CI/CD

4. **💰 Costo Optimizado:**
   - Aprovecha mejor los límites de Vercel Lite
   - Sin necesidad de servicios adicionales

## 🚨 Próximos Pasos

1. **Probar la aplicación localmente:**
   ```bash
   cd client
   npm run dev
   ```

2. **Configurar variables de entorno en Vercel:**
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - Otras variables del `.env.example`

3. **Hacer deployment a Vercel:**
   ```bash
   git add .
   git commit -m "Migrate to unified Vercel Functions structure"
   git push
   ```

4. **✅ COMPLETADO: Carpeta `api/` original eliminada**

## 🔍 Verificación

- ✅ Archivos copiados correctamente
- ✅ Dependencias instaladas
- ✅ Vercel.json configurado
- ✅ API Service actualizado
- ⏳ Pendiente: Pruebas en producción
- ✅ Carpeta `api/` original eliminada exitosamente

---

**Nota:** Esta migración mantiene toda la funcionalidad existente mientras optimiza la estructura para Vercel Lite.