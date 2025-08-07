# 🚀 Configuración para Vercel Lite

## 📋 Limitaciones de Vercel Lite

- ❌ **Solo 1 Environment:** Production únicamente
- ❌ **No Preview/Development environments**
- ✅ **Deploy automático desde main branch**

## 🛠️ Solución Implementada

### **Detección Automática de Environment**

El código ahora detecta automáticamente dónde se ejecuta:

```javascript
// En desarrollo local
if (hostname === 'localhost') → http://localhost:3000/api

// En producción (Vercel)
if (hostname !== 'localhost') → API de prueba temporal

// Si configuras VITE_API_URL
if (VITE_API_URL existe) → Usa esa URL
```

## 🎯 Opciones para tu API

### **Opción 1: API de Prueba (Actual)**
- ✅ **Funciona inmediatamente**
- ⚠️ **Solo para testing del frontend**
- 🔗 **URL:** `https://jsonplaceholder.typicode.com`

### **Opción 2: Desplegar tu API**
1. Crear nuevo proyecto en Vercel para `/api`
2. Configurar variables de entorno de la API
3. Actualizar `VITE_API_URL` en el frontend

### **Opción 3: API Externa**
- Railway, Render, Heroku, etc.
- Configurar `VITE_API_URL` con la URL externa

## 📝 Configuración en Vercel Dashboard

1. Ve a tu proyecto `mykap-erp`
2. **Settings** → **Environment Variables**
3. **Solo cuando tengas tu API lista:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tu-api-real.com/api`
   - **Environment:** Production

## 🔄 Workflow Simplificado

1. **Desarrollo:** `npm run dev` (usa localhost:3000)
2. **Commit & Push:** Deploy automático a producción
3. **Producción:** Usa API de prueba o tu API real

## ✅ Ventajas de esta Configuración

- 🎯 **Sin configuración compleja**
- 🔄 **Funciona inmediatamente**
- 🛠️ **Fácil de actualizar cuando tengas API real**
- 💰 **Compatible con Vercel Lite**