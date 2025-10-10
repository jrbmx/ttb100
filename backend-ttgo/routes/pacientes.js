// routes/pacientes.js
const express = require('express');
const router = express.Router();

const Paciente = require('../models/Paciente');
const Cuidador = require('../models/Cuidador');
const Counter  = require('../models/Counter');
const auth     = require('../middleware/auth');
const { parseDMSPair } = require('../utils/geo');

// POST /api/pacientes  (alta)
// body: { nombre, apellidoP, apellidoM, edad, dms? }
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, apellidoP, apellidoM, edad, dms } = req.body;
    if (!nombre || !apellidoP || !apellidoM || !edad) {
      return res.status(400).json({ mensaje: 'Faltan campos' });
    }

    let geo = null;
    if (dms) {
      geo = parseDMSPair(dms);
      if (!geo) return res.status(400).json({ mensaje: 'Coordenadas DMS inválidas' });
    }

    const counter = await Counter.findOneAndUpdate(
      { name: 'paciente' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const paciente = new Paciente({
      id_paciente: counter.seq,
      cuidador: req.user.id,
      nombre, apellidoP, apellidoM, edad,
      latitud: geo?.lat, longitud: geo?.lng,
      lat_dms: geo?.lat_dms, lng_dms: geo?.lng_dms
    });

    await paciente.save();

    // 👉 ACTUALIZA el cuidador.id_paciente con el id autoincrementable del paciente
    await Cuidador.findByIdAndUpdate(req.user.id, { id_paciente: paciente.id_paciente });

    res.status(201).json(paciente);
  } catch (e) {
    console.error('Alta paciente:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/pacientes (listado del cuidador logueado)
router.get('/', auth, async (req, res) => {
  const items = await Paciente.find({ cuidador: req.user.id }).sort({ creadoEn: -1 });
  res.json(items);
});

// PUT /api/pacientes/:id  (editar datos + opcionalmente DMS)
router.put('/:id', auth, async (req, res) => {
  try {
    const { dms, ...rest } = req.body;
    let updates = { ...rest };

    if (dms) {
      const geo = parseDMSPair(dms);
      if (!geo) return res.status(400).json({ mensaje: 'Coordenadas DMS inválidas' });
      updates.latitud = geo.lat;
      updates.longitud = geo.lng;
      updates.lat_dms = geo.lat_dms;
      updates.lng_dms = geo.lng_dms;
    }

    const pac = await Paciente.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.user.id },
      updates,
      { new: true }
    );
    if (!pac) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(pac);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/pacientes/:id
router.delete('/:id', auth, async (req, res) => {
  await Paciente.findOneAndDelete({ _id: req.params.id, cuidador: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
