# MyKap ERP - Sistema de Gestión de Créditos

Sistema integral para la gestión de prospectos y créditos, con flujo de trabajo automatizado para la originación de préstamos.

## 🚀 Características

- **Gestión de Prospectos**: Flujo completo desde pre-validación hasta cierre
- **Sistema de Documentos**: Manejo de documentos por etapas con validación
- **Módulo de Créditos**: Seguimiento de prospectos convertidos en créditos
- **Importación de Datos**: Carga masiva de clientes existentes via CSV
- **Identificadores Únicos**: Sistema de códigos no reutilizables (HKF-ML000X)
- **Análisis por Mes**: Filtros y reportes de prospectos por período

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- MongoDB (para el backend)
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mykap-erp.git
cd mykap-erp
```

### 2. Configurar el Backend (API)
```bash
cd api
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar .env con tus configuraciones
nano .env
```

### 4. Configurar el Frontend (Client)
```bash
cd ../client
npm install
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=mykap_erp
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.csv,.xlsx,.pdf,.doc,.docx

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Ejecución

### Desarrollo

#### Backend
```bash
cd api
npm run dev
```

#### Frontend
```bash
cd client
npm run dev
```

### Producción

#### Backend
```bash
cd api
npm run build
npm start
```

#### Frontend
```bash
cd client
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
mykap-erp/
├── api/                 # Backend (Node.js/Express)
│   ├── src/
│   ├── package.json
│   └── env.example
├── client/              # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.tsx
│   └── package.json
├── .gitignore
└── README.md
```

## 🔄 Flujo de Trabajo

### 1. Creación de Prospectos
- Generación automática de código único (HKF-ML000X)
- Captura de información básica del prospecto
- Asignación a ejecutivo

### 2. Etapas del Proceso
- **Pre-validación**: Documentos individuales y de empresa
- **KYC**: Matriz de riesgo
- **Closing**: Disclosures y Loan Docs

### 3. Gestión de Documentos
- Estados: Missing → Ready for Review → Approved/Rejected
- Etapa Closing: Sent → Signed → Filled
- Avance automático de etapas

### 4. Conversión a Créditos
- Prospectos completados se convierten automáticamente
- Importación de clientes existentes via CSV
- Diferenciación visual entre origen

## 📊 Funcionalidades

### Gestión de Prospectos
- ✅ Crear nuevos prospectos
- ✅ Editar información básica
- ✅ Gestionar documentos por etapa
- ✅ Aprobar/rechazar documentos
- ✅ Avance automático de etapas
- ✅ Filtros por estado (Activos/Rechazados)
- ✅ Análisis mensual con drill-down

### Módulo de Créditos
- ✅ Visualización de prospectos completados
- ✅ Importación de clientes existentes
- ✅ Diferenciación por origen (Prospecto/Importado)
- ✅ Gestión de códigos únicos

## 🔒 Seguridad

- Variables de entorno protegidas
- Validación de archivos de entrada
- Sanitización de datos
- CORS configurado
- JWT para autenticación

## 🧪 Testing

```bash
# Backend tests
cd api
npm test

# Frontend tests
cd client
npm test
```

## 📦 Despliegue

### Vercel (Recomendado)

#### 1. Configurar Vercel CLI
```bash
npm i -g vercel
vercel login
```

#### 2. Desplegar API
```bash
cd api
vercel
```

#### 3. Desplegar Client
```bash
cd client
vercel
```

#### 4. Configurar Variables de Entorno en Vercel
```bash
# Para el API
vercel env add DB_HOST
vercel env add DB_PASSWORD
vercel env add JWT_SECRET

# Para el Client
vercel env add VITE_API_URL
```

### GitHub Actions + Vercel (Automático)

#### 1. Configurar Secrets en GitHub
```bash
# En tu repositorio: Settings > Secrets and variables > Actions
VERCEL_TOKEN=tu_token_de_vercel
VERCEL_ORG_ID=tu_org_id
VERCEL_API_PROJECT_ID=tu_api_project_id
VERCEL_CLIENT_PROJECT_ID=tu_client_project_id
```

#### 2. Obtener IDs de Vercel
```bash
# Token de Vercel
vercel token

# Org ID y Project IDs
vercel projects ls
```

### Docker
```bash
docker-compose up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

- **Email**: soporte@mykap.com
- **Documentación**: [docs.mykap.com](https://docs.mykap.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/mykap-erp/issues)

## 🔄 Changelog

### v1.0.0
- ✅ Sistema básico de prospectos
- ✅ Gestión de documentos por etapas
- ✅ Módulo de créditos
- ✅ Importación de datos
- ✅ Identificadores únicos
- ✅ Análisis mensual

---

**Desarrollado con ❤️ por el equipo de MyKap** 