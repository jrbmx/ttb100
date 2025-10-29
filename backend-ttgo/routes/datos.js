const express = require('express');
const auth = require('../middleware/auth');
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
    if (frecuencia === undefined || oxigeno === undefined || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ mensaje: 'Faltan datos del sensor (frecuencia, oxigeno, latitud, longitud)' });
    }

    const paciente = await Paciente.findOne({ dispositivo_id: dispositivo_id });
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

router.get('/paciente/:pacienteId', auth, async (req, res) => {
    try {
        const { pacienteId } = req.params;

        const paciente = await Paciente.findOne({ 
            _id: pacienteId, 
            cuidador: req.user.id 
        });
        
        if (!paciente) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado o no autorizado' });
        }

        const datos = await Dato.find({ paciente: pacienteId }).sort({ fecha: -1 });
        res.json(datos);
    } catch (err) {
        console.error("Error al obtener datos:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/reciente/:pacienteId', auth, async (req, res) => {
    try {
        const { pacienteId } = req.params;

        const paciente = await Paciente.findOne({ _id: pacienteId, cuidador: req.user.id });
        if (!paciente) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado o no autorizado' });
        }

        const ultimoDato = await Dato.findOne({ paciente: pacienteId }).sort({ fecha: -1 });
        if (!ultimoDato) {
            return res.status(404).json({ mensaje: 'No hay datos para este paciente' });
        }
        
        res.json(ultimoDato);
    } catch (err) {
        console.error("Error al obtener último dato:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
