const mongoose = require('mongoose');

const CuidadorSchema = new mongoose.Schema({
  nombre: String,
  apellidoP: String,
  apellidoM: String,
  email: { type: String, unique: true },
  telefono: String,
  password: String,
  verificado: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Cuidador', CuidadorSchema);
