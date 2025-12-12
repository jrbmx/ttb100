// models/Paciente.js
const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
  dispositivo_id: {
    type: String,
    unique: true,
    index: true,
    partialFilterExpression: { dispositivo_id: { $exists: true, $ne: "" } },
    default: null
  },

  dispositivo_alias: {
    type: String,
    default: null,
    trim: true,
    maxlength: 50
  },

  cuidador: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuidador', required: true },
  nombre: { type: String, required: true },
  apellidoP: { type: String, required: true },
  apellidoM: { type: String, required: true },
  edad: { type: Number, required: true },
  estaEnGeocerca: {
    type: Boolean,
    default: true
  },

  configuracion: {
    hrMin: { type: Number, default: 60 },        // Ritmo cardiaco mínimo
    hrMax: { type: Number, default: 100 },       // Ritmo cardiaco máximo
    oxyMin: { type: Number, default: 90 },       // Oxigenación mínima
    inactivityMin: { type: Number, default: 30 } // Minutos de inactividad permitidos
  },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);
