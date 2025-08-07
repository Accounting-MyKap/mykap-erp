const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida en el archivo .env');
    process.exit(1);
}

console.log('🔍 Iniciando monitoreo de la base de datos...');
console.log('📊 Presiona Ctrl+C para detener el monitoreo\n');

// Configurar eventos de conexión
mongoose.connection.on('connected', () => {
    console.log(`✅ [${new Date().toISOString()}] Conectado a MongoDB`);
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ [${new Date().toISOString()}] Error de conexión:`, err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️ [${new Date().toISOString()}] Desconectado de MongoDB`);
});

mongoose.connection.on('reconnected', () => {
    console.log(`🔄 [${new Date().toISOString()}] Reconectado a MongoDB`);
});

mongoose.connection.on('close', () => {
    console.log(`🔒 [${new Date().toISOString()}] Conexión cerrada`);
});

// Conectar a la base de datos
async function connectAndMonitor() {
    try {
        await mongoose.connect(DATABASE_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true,
        });
        
        console.log('🚀 Conexión inicial establecida');
        
        // Monitoreo periódico
        setInterval(async () => {
            try {
                const state = mongoose.connection.readyState;
                const states = ['desconectado', 'conectado', 'conectando', 'desconectando'];
                
                // Intentar un ping a la base de datos
                const startTime = Date.now();
                await mongoose.connection.db.admin().ping();
                const pingTime = Date.now() - startTime;
                
                console.log(`📊 [${new Date().toISOString()}] Estado: ${states[state]} | Ping: ${pingTime}ms`);
                
                // Verificar estadísticas de conexión
                const stats = mongoose.connection.db.stats ? await mongoose.connection.db.stats() : null;
                if (stats) {
                    console.log(`📈 [${new Date().toISOString()}] Conexiones activas: ${stats.connections || 'N/A'}`);
                }
                
            } catch (error) {
                console.error(`❌ [${new Date().toISOString()}] Error en ping:`, error.message);
            }
        }, 10000); // Cada 10 segundos
        
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando monitoreo...');
    await mongoose.disconnect();
    console.log('✅ Desconectado correctamente');
    process.exit(0);
});

// Iniciar monitoreo
connectAndMonitor();