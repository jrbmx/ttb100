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
  /* #swagger.tags = ['Alertas']
       #swagger.description = 'Obtiene el historial de alertas (caídas, inactividad, etc.) del cuidador autenticado.'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.responses[200] = { 
            description: 'Lista de alertas recuperada con éxito',
            schema: { $ref: "#/definitions/Alerta" }
       }
       #swagger.responses[500] = { description: 'Error del servidor' }
    */
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
  /* #swagger.tags = ['Alertas']
       #swagger.description = 'Marca una alerta individual como leída/vista.'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['id'] = { description: 'ID de la alerta' }
       #swagger.responses[200] = { description: 'Alerta actualizada correctamente' }
       #swagger.responses[404] = { description: 'Alerta no encontrada o no pertenece al cuidador' }
    */
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
  /* #swagger.tags = ['Alertas']
       #swagger.description = 'Acción masiva para marcar todas las alertas pendientes como leídas.'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.responses[200] = { 
            description: 'Todas las alertas fueron actualizadas',
            schema: {
                mensaje: 'Todas las alertas han sido marcadas como leídas.',
                modifiedCount: 5
            }
       }
    */
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