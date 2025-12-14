const mongoose = require('mongoose');

const CuidadorSchema = new mongoose.Schema({
  nombre: String,
  apellidoP: String,
  apellidoM: String,
  email: { type: String, unique: true },
  telefono: String,
  password: String,
  verificado: { type: Boolean, default: false },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Por defecto, nadie es admin
  },
}, { timestamps: true });

module.exports = mongoose.model('Cuidador', CuidadorSchema);
