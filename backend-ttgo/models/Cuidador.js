const mongoose = require('mongoose');

const CuidadorSchema = new mongoose.Schema({
  //id_cuidador: { type: Number, required: true, unique: true },
  nombre: String,
  apellidoP: String,
  apellidoM: String,
  email: { type: String, unique: true },
  telefono: String,
  password: String,
  verificado: { type: Boolean, default: false },

  // 👇 que sea NUMBER, porque en pacientes guardas el autoincrementable (counter.seq)
  //id_paciente: { type: Number, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('Cuidador', CuidadorSchema);
