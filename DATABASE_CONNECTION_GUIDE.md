# Guía de Problemas de Conexión a la Base de Datos

## 🔍 Causas Comunes de Desconexión

### 1. **Timeouts de Conexión**
- **Problema**: La conexión se cierra por inactividad
- **Síntomas**: Errores intermitentes, "connection timed out"
- **Solución**: Configuración de heartbeat y timeouts optimizados

### 2. **Límites de Pool de Conexiones**
- **Problema**: MongoDB Atlas tiene límites en conexiones simultáneas
- **Síntomas**: "too many connections", errores 503
- **Solución**: Pool de conexiones configurado correctamente (maxPoolSize: 10)

### 3. **Problemas de Red**
- **Problema**: Latencia alta o pérdida de paquetes
- **Síntomas**: Desconexiones aleatorias, timeouts
- **Solución**: Configuración de retry y reconexión automática

### 4. **Configuración de MongoDB Atlas**
- **Problema**: Configuración incorrecta del cluster
- **Síntomas**: Errores de autenticación, IP no autorizada
- **Solución**: Verificar whitelist de IPs y credenciales

### 5. **Entorno Serverless (Vercel)**
- **Problema**: Las funciones serverless no mantienen conexiones persistentes
- **Síntomas**: Conexiones que se cierran entre requests
- **Solución**: Gestión de conexiones optimizada para serverless

## ✅ Soluciones Implementadas

### 1. **Configuración Mejorada de Conexión**
```typescript
// client/api/db/connection.ts
mongoose.connect(DATABASE_URL, {
  maxPoolSize: 10,              // Pool de conexiones
  serverSelectionTimeoutMS: 10000, // Timeout de selección
  socketTimeoutMS: 45000,       // Timeout de socket
  heartbeatFrequencyMS: 10000,  // Frecuencia de heartbeat
  maxIdleTimeMS: 30000,         // Tiempo máximo inactivo
  retryWrites: true,            // Reintentar escrituras
  retryReads: true,             // Reintentar lecturas
});
```

### 2. **Eventos de Conexión y Reconexión Automática**
```typescript
// Eventos configurados:
- 'connected': Conexión exitosa
- 'error': Error de conexión
- 'disconnected': Desconexión detectada
- 'reconnected': Reconexión exitosa
```

### 3. **Middleware de Verificación de Salud**
```typescript
// client/api/middleware/healthCheck.ts
- healthCheck: Verifica estado antes de cada request
- ensureConnection: Reconecta automáticamente si es necesario
- healthCheckEndpoint: Endpoint /api/health para monitoreo
```

### 4. **Monitoreo en Tiempo Real**
```bash
# Ejecutar script de monitoreo
node monitor-db.cjs
```

## 🛠️ Herramientas de Diagnóstico

### 1. **Health Check Endpoint**
```bash
curl http://localhost:3000/api/health
```

### 2. **Script de Monitoreo**
```bash
cd client
node monitor-db.cjs
```

### 3. **Logs del Servidor**
- Buscar mensajes con emojis: ✅ ❌ ⚠️ 🔄
- Estados de conexión: connected, disconnected, connecting, disconnecting

## 🔧 Configuración Recomendada para Producción

### Variables de Entorno
```env
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/database
NODE_ENV=production
SESSION_SECRET=your-strong-secret
```

### MongoDB Atlas Settings
1. **Network Access**: Agregar 0.0.0.0/0 para Vercel
2. **Database Access**: Usuario con permisos readWrite
3. **Cluster Tier**: M0 o superior para mejor estabilidad
4. **Connection Limits**: Verificar límites del tier

## 🚨 Señales de Alerta

### Logs a Monitorear
- `❌ MongoDB connection error`
- `⚠️ MongoDB disconnected`
- `❌ Max reconnection attempts reached`
- `Database connection unavailable`

### Métricas Importantes
- Tiempo de ping > 1000ms
- Reconexiones frecuentes (>5 por hora)
- Errores 503 en /api/health
- Pool de conexiones agotado

## 🔄 Procedimiento de Resolución

### Paso 1: Verificar Conectividad
```bash
# Verificar health check
curl http://localhost:3000/api/health

# Ejecutar monitoreo
node monitor-db.cjs
```

### Paso 2: Revisar Logs
```bash
# Buscar errores recientes
grep -i "mongodb\|database" logs/*.log
```

### Paso 3: Verificar MongoDB Atlas
1. Revisar métricas en el dashboard
2. Verificar conexiones activas
3. Comprobar alertas del cluster

### Paso 4: Reiniciar Servicios
```bash
# Reiniciar servidor de desarrollo
npm run dev-server

# O en producción
pm2 restart app
```

## 📞 Contacto de Soporte

Si los problemas persisten:
1. Recopilar logs de los últimos 30 minutos
2. Ejecutar script de monitoreo por 5 minutos
3. Capturar respuesta de /api/health
4. Contactar al equipo de desarrollo con la información