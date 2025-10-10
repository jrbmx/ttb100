const express = require('express');
const router = express.Router();
const Dato = require('../models/Dato');

router.post('/', async (req, res) => {
  try {
    /*
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        frecuencia: 85,
        oxigeno: 98,
        latitud: 19.4326,
        longitud: -99.1322,
        fecha: "2025-05-26T00:56:24.083Z"
      }
    }
    */
    const nuevoDato = new Dato(req.body);
    await nuevoDato.save();
    res.status(201).json({ mensaje: 'Dato guardado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const datos = await Dato.find().sort({ fecha: -1 });
  res.json(datos);
});

module.exports = router;
