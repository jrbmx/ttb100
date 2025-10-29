// routes/pacientes.js
const express = require('express');
const router = express.Router();

const Paciente = require('../models/Paciente');
const Cuidador = require('../models/Cuidador');
const auth     = require('../middleware/auth');

// POST /api/pacientes  (alta)
// body: { nombre, apellidoP, apellidoM, edad, dispositivo_id }
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, apellidoP, apellidoM, edad, dispositivo_id } = req.body;
    if (!nombre || !apellidoP || !apellidoM || !edad) {
      return res.status(400).json({ mensaje: 'Faltan campos' });
    }
/*
    const counter = await Counter.findOneAndUpdate(
      { name: 'paciente' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
*/
    const paciente = new Paciente({
      //id_paciente: counter.seq,
      cuidador: req.user.id,
      nombre, apellidoP, apellidoM, edad,
      dispositivo_id: dispositivo_id
    });

    try {
      await paciente.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return res.status(409).json({ mensaje: 'Error: El ID del dispositivo ya está registrado.' });
      }
      throw saveError;
    }

    //await Cuidador.findByIdAndUpdate(req.user.id, { id_paciente: paciente.id_paciente });
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

// PUT /api/pacientes/:id  (editar datos)
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;

    const pac = await Paciente.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.user.id },
      updates,
      { new: true }
    );
    if (!pac) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(pac);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ mensaje: 'Error: El ID del dispositivo ya está registrado.' });
    }
    console.error('Actualizar paciente', e)
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/pacientes/:id
router.delete('/:id', auth, async (req, res) => {
  await Paciente.findOneAndDelete({ _id: req.params.id, cuidador: req.user.id });
  res.json({ ok: true });
});

module.exports = router;

// si se quiere asignar el mismo dispositivo a diferentes pacientes, es necesario primero actualizar
// el campo del paciente que lo tiene asignado a null, para posteriormente, actualizar el campo del
// otro paciente con el id del dispositivo 