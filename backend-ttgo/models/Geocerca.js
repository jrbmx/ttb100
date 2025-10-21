// backend-ttgo/models/Geocerca.js
const mongoose = require('mongoose');

const GeocercaSchema = new mongoose.Schema({
  cuidador: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuidador', required: true },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true }, // <-- sin unique
  coords: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Geocerca', GeocercaSchema);
