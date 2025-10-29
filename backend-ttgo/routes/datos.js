const express = require('express');
const router = express.Router();
const Dato = require('../models/Dato');
const Paciente = require('../models/Paciente');

router.post('/', async (req, res) => {
  try {
    /*
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        frecuencia: 85,
        oxigeno: 98,
        latitud: "19.4326 N",
        longitud: "99.1322 W",
        dispositivo_id: "a1b2c3d4-1678886400"
      }
    }
    */
    const { dispositivo_id, frecuencia, oxigeno, latitud, longitud } = req.body;
    if (!dispositivo_id) {
      return res.status(400).json({ error: 'Falta el dispositivo_id en la petición' });
    }
    const paciente = await Paciente.findOne({ dispositivoId: dispositivo_id });
    if (!paciente) {
      return res.status(404).json({ error: 'Dispositivo no registrado o no asignado a un paciente' });
    }

    const nuevoDato = new Dato({
      frecuencia,
      oxigeno,
      latitud,
      longitud,
      paciente: paciente._id
    });
    await nuevoDato.save();
    res.status(201).json({ mensaje: 'Dato guardado correctamente', dato: nuevoDato });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const datos = await Dato.find().populate('paciente').sort({ fecha: -1 });
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
