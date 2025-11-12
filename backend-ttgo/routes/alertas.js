// routes/alertas.js
const express = require('express');
const router  = express.Router();
const Alerta = require('../models/Alerta');
const auth   = require('../middleware/auth');

/**
 * GET /api/alertas
 * Obtiene TODAS las alertas (no vistas y vistas) del cuidador logueado.
 * La app puede filtrar las no vistas.
 */
router.get('/', auth, async (req, res) => {
  try {
    const alertas = await Alerta.find({ cuidador: req.user.id })
                                .populate('paciente', 'nombre apellidoP apellidoM') // Trae el nombre del paciente
                                .sort({ createdAt: -1 }); // Más nuevas primero
    res.json(alertas);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

/**
 * PUT /api/alertas/:id/vista
 * Marca una alerta específica como "vista".
 * La app llamaría a esto cuando el cuidador haga clic en la alerta.
 */
router.put('/:id/vista', auth, async (req, res) => {
  try {
    const alerta = await Alerta.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.user.id }, // Solo puede marcar las suyas
      { vista: true },
      { new: true } // Devuelve el documento actualizado
    );

    if (!alerta) {
      return res.status(404).json({ mensaje: 'Alerta no encontrada' });
    }
    res.json(alerta);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

router.put('/marcar-todas-vistas', auth, async (req, res) => {
  try {
    const result = await Alerta.updateMany(
      { cuidador: req.user.id, vista: false }, // El filtro
      { $set: { vista: true } } // La actualización
    );

    res.json({ 
      mensaje: 'Todas las alertas han sido marcadas como leídas.',
      modifiedCount: result.nModified 
    });
  } catch (e) {
    console.error('Error marcando todas como vistas:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;