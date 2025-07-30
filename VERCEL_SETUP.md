# 🚀 Guía de Configuración de Vercel para MyKap ERP

## 📋 Prerrequisitos

- Cuenta en [Vercel](https://vercel.com)
- Vercel CLI instalado: `npm i -g vercel`
- Repositorio en GitHub

## 🔧 Configuración Paso a Paso

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
vercel login
```

### 2. Configurar Proyectos en Vercel

#### API (Backend)
```bash
cd api
vercel
# Sigue las instrucciones:
# - Project name: mykap-erp-api
# - Directory: ./ (current)
# - Override settings: No
```

#### Client (Frontend)
```bash
cd client
vercel
# Sigue las instrucciones:
# - Project name: mykap-erp-client
# - Directory: ./ (current)
# - Override settings: No
```

### 3. Obtener IDs Necesarios

#### Token de Vercel
```bash
vercel token
# Copia el token generado
```

#### Org ID y Project IDs
```bash
vercel projects ls
# Anota los IDs de ambos proyectos
```

### 4. Configurar Variables de Entorno

#### Para el API
```bash
cd api
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_NAME
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
vercel env add NODE_ENV
```

#### Para el Client
```bash
cd client
vercel env add VITE_API_URL
```

### 5. Configurar GitHub Secrets

Ve a tu repositorio en GitHub: `Settings > Secrets and variables > Actions`

Agrega estos secrets:
```
VERCEL_TOKEN=tu_token_de_vercel
VERCEL_ORG_ID=tu_org_id
VERCEL_API_PROJECT_ID=tu_api_project_id
VERCEL_CLIENT_PROJECT_ID=tu_client_project_id
```

### 6. Configurar Dominios Personalizados (Opcional)

#### Para el API
```bash
cd api
vercel domains add api.mykap.com
```

#### Para el Client
```bash
cd client
vercel domains add app.mykap.com
```

## 🔄 Flujo de Despliegue

### Despliegue Manual
```bash
# API
cd api && vercel --prod

# Client
cd client && vercel --prod
```

### Despliegue Automático
- Push a `main` → Despliegue automático a producción
- Pull Request → Despliegue de preview
- Push a `develop` → Despliegue a staging

## 📊 Monitoreo

### Vercel Dashboard
- [vercel.com/dashboard](https://vercel.com/dashboard)
- Monitoreo de performance
- Logs en tiempo real
- Analytics

### GitHub Actions
- Verificar estado de despliegues
- Logs de build y test
- Notificaciones automáticas

## 🔒 Seguridad

### Variables de Entorno
- ✅ Nunca subir `.env` al repositorio
- ✅ Usar Vercel Environment Variables
- ✅ Diferentes valores para dev/staging/prod

### Headers de Seguridad
- ✅ CORS configurado
- ✅ Headers de seguridad automáticos
- ✅ HTTPS forzado

## 🚨 Troubleshooting

### Error: Build Failed
```bash
# Verificar logs
vercel logs

# Rebuild local
npm run build
```

### Error: Environment Variables
```bash
# Verificar variables
vercel env ls

# Agregar variable faltante
vercel env add VARIABLE_NAME
```

### Error: CORS
```bash
# Verificar configuración en vercel.json
# Asegurar que CORS_ORIGIN esté configurado
```

## 📞 Soporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: [github.com/tu-usuario/mykap-erp/issues](https://github.com/tu-usuario/mykap-erp/issues)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

**¡Listo para desplegar! 🎉** 