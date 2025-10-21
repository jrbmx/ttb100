// models/Dato.js
const mongoose = require('mongoose');

function parseLatitud(val) {
  if (typeof val !== 'string') {
    return val;
  }

  if (val == "") return 91.0 // si la conexión es por wifi

  try {
    const [numero, direccion] = val.split(' '); // ["19.43", "N"]
    const num = parseFloat(numero);

    if (direccion.toUpperCase() === 'S') {
      return num * -1;
    }
    return num;
  } catch (e) {
    return val;
  }
}

function parseLongitud(val) {
  if (typeof val !== 'string') {
    return val;
  }

  if (val == ""){
    return 181.0
  }

  try {
    const [numero, direccion] = val.split(' '); // ["99.13", "W"]
    const num = parseFloat(numero);

    if (direccion.toUpperCase() === 'W') {
      return num * -1;
    }
    return num;
  } catch (e) {
    return val;
  }
}

const DatoSchema = new mongoose.Schema({
  ///paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' }, // opcional
  frecuencia: { type: Number, required: true },
  oxigeno:    { type: Number, required: true },
  latitud: { type: Number, required: true, set: parseLatitud },
  longitud: { type: Number, required: true, set: parseLongitud },
  fecha: { type: Date, default: new Date() }
});
module.exports = mongoose.model('Dato', DatoSchema);

