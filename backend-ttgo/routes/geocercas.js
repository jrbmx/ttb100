// backend-ttgo/routes/geocercas.js
const express = require('express');
const router  = express.Router();
const Geocerca = require('../models/Geocerca');
const Paciente = require('../models/Paciente');
const auth     = require('../middleware/auth');

// POST /api/geocercas  { pacienteId, coords: [[lat,lng], ...] }
router.post('/', auth, async (req, res) => {
  try {
    const { pacienteId, coords } = req.body;
    if (!pacienteId || !Array.isArray(coords) || coords.length < 3) {
      return res.status(400).json({ mensaje: 'Datos inválidos' });
    }
    const pac = await Paciente.findOne({ _id: pacienteId, cuidador: req.user.id });
    if (!pac) return res.status(404).json({ mensaje: 'Paciente no encontrado' });

    const doc = await Geocerca.create({
      paciente: pacienteId,
      cuidador: req.user.id,
      coords: coords.map(([lat, lng]) => ({ lat, lng })),
    });
    res.json(doc);
  } catch (e) {
    console.error('geocerca POST:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/geocercas/:pacienteId -> array de geocercas
router.get('/:pacienteId', auth, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const docs = await Geocerca.find({ paciente: pacienteId, cuidador: req.user.id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    console.error('geocerca GET:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;
