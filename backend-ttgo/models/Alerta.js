// models/Alerta.js
const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema({
  cuidador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuidador', 
    required: true,
    index: true
  },
  paciente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Paciente', 
    required: true 
  },
  tipo: { 
    type: String, 
    required: true, 
    enum: ['salida_geocerca', 'entrada_geocerca' ] 
  },
  mensaje: { 
    type: String, 
    required: true 
  },
  vista: { 
    type: Boolean, 
    default: false,
    required: true
  }
}, { timestamps: true }); // 'createdAt' nos da la hora de la alerta

module.exports = mongoose.model('Alerta', AlertaSchema);