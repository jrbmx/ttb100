// server.js
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const swaggerUI            = require('swagger-ui-express');
const swaggerDocumentation = require('./swagger.json');

// Rutas
const datosRoutes      = require('./routes/datos');
const cuidadoresRoutes = require('./routes/cuidadores');
const ttgoRoutes       = require('./routes/ttgo');
const pacientesRoutes  = require('./routes/pacientes');
const geocercasRoutes = require('./routes/geocercas');
const app = express();

// ---------- CORS (Express 5: sin usar '*') ----------
const allowedOrigin = 'http://localhost:3001';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));

// Middleware para responder preflight y setear headers siempre
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight ok
  }
  next();
});

// ---------- Middlewares ----------
app.use(express.json());

// ---------- Healthcheck ----------
app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// ---------- Conexión a Mongo ----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// ---------- Rutas ----------
app.use('/api/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));
app.use('/api/datos', datosRoutes);
app.use('/api/cuidadores', cuidadoresRoutes);
app.use('/api/ttgo', ttgoRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/geocercas', geocercasRoutes); 
app.use('/api/geocercas', require('./routes/geocercas'));


// ---------- Arranque ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// (Opcional) depuración de promesas sin catch
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
