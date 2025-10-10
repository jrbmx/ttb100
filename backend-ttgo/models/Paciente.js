// models/Paciente.js
const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
  id_paciente: { type: Number, unique: true, index: true },   // autoincrement
  cuidador:    { type: mongoose.Schema.Types.ObjectId, ref: 'Cuidador', required: true },

  nombre:    { type: String, required: true },
  apellidoP: { type: String, required: true },
  apellidoM: { type: String, required: true },
  edad:      { type: Number, required: true },

  // Última ubicación conocida (estado actual)
  latitud:  { type: Number },
  longitud: { type: Number },
  lat_dms:  { type: String },
  lng_dms:  { type: String },

  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);
