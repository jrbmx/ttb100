// routes/pacientes.js
const express = require('express');
const router = express.Router();

const Dato = require('../models/Dato');
const Paciente = require('../models/Paciente');
const auth     = require('../middleware/auth');

// POST /api/pacientes  (alta)
// body: { nombre, apellidoP, apellidoM, edad, dispositivo_id }
router.post('/', auth, async (req, res) => {
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Registrar un nuevo paciente bajo el cuidado del usuario actual.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            nombre: "Juan",
            apellidoP: "Pérez",
            apellidoM: "López",
            edad: 75,
            dispositivo_id: "a1b2c3d4-1678886400"
        }
     }
     #swagger.responses[201] = { description: 'Paciente registrado exitosamente' }
     #swagger.responses[400] = { description: 'Faltan campos obligatorios' }
     #swagger.responses[409] = { description: 'Conflicto: El ID del dispositivo ya está en uso por otro paciente.' }
  */
  try {
    const { nombre, apellidoP, apellidoM, edad, dispositivo_id } = req.body;
    if (!nombre || !apellidoP || !apellidoM || !edad) {
      return res.status(400).json({ mensaje: 'Faltan campos' });
    }

    const paciente = new Paciente({
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

    res.status(201).json(paciente);
  } catch (e) {
    console.error('Alta paciente:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/pacientes (listado del cuidador logueado)
router.get('/', auth, async (req, res) => {
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Obtiene la lista de todos los pacientes asociados al cuidador.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.responses[200] = { description: 'Lista de pacientes' }
  */
  const items = await Paciente.find({ cuidador: req.user.id }).sort({ creadoEn: -1 });
  res.json(items);
});

// GET /api/pacientes/:id/ubicacion (última ubicación del paciente)
router.get('/:id/ubicacion', auth, async (req, res) => {
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Obtiene la última ubicación conocida (lat/long) de un paciente específico.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { description: 'ID del paciente' }
     #swagger.responses[200] = { 
        description: 'Ubicación encontrada',
        schema: {
            latitud: 19.4326,
            longitud: -99.1332,
            fecha: "2025-05-26T10:00:00.000Z"
        }
     }
     #swagger.responses[404] = { description: 'Paciente no encontrado o sin datos de ubicación' }
  */
  try {
    const pacienteId = req.params.id;

    const paciente = await Paciente.findOne({ _id: pacienteId, cuidador: req.user.id });
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado o no autorizado' });
    }

    const ultimoDato = await Dato.findOne({ paciente: pacienteId })
      .sort({ fecha: -1 })
      .select('latitud longitud fecha');

    if (!ultimoDato) {
      return res.status(404).json({ mensaje: 'Sin datos de ubicación' });
    }

    res.json({
        latitud: ultimoDato.latitud,
        longitud: ultimoDato.longitud,
        fecha: ultimoDato.fecha,
    });
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// PUT /api/pacientes/:id  (editar datos)
router.put('/:id', auth, async (req, res) => {
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Actualiza la información del paciente. Nota: Para reasignar un dispositivo, primero libéralo del paciente anterior.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { description: 'ID del paciente' }
     #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            nombre: "Juanito",
            edad: 76,
            dispositivo_id: "nuevo-id-o-null"
        }
     }
     #swagger.responses[200] = { description: 'Paciente actualizado' }
     #swagger.responses[409] = { description: 'Conflicto: El ID de dispositivo ya está en uso' }
  */
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
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Elimina un paciente del sistema.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { description: 'ID del paciente' }
     #swagger.responses[200] = { description: 'Eliminado correctamente' }
  */
  await Paciente.findOneAndDelete({ _id: req.params.id, cuidador: req.user.id });
  res.json({ ok: true });
});

// PUT /api/pacientes/:id/config (Actualizar configuración de alertas)
router.put('/:id/config', auth, async (req, res) => {
  /* #swagger.tags = ['Pacientes']
     #swagger.description = 'Actualiza los umbrales de seguridad y alertas del paciente.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['id'] = { description: 'ID del paciente' }
     #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            hrMin: 60,
            hrMax: 100,
            oxyMin: 90,
            inactivityMin: 30
        }
     }
     #swagger.responses[200] = { description: 'Configuración actualizada exitosamente' }
     #swagger.responses[400] = { description: 'Error de validación (ej. min > max)' }
  */
  try {
    const { hrMin, hrMax, oxyMin, inactivityMin } = req.body;
    if (hrMin < 0 || hrMax < 0 || oxyMin < 0 || inactivityMin < 0) {
      return res.status(400).json({ mensaje: "No se permiten valores negativos." });
    }

    if (hrMin >= hrMax) {
      return res.status(400).json({ mensaje: "El ritmo cardíaco mínimo debe ser menor al máximo." });
    }

    if (oxyMin > 100) {
      return res.status(400).json({ mensaje: "La oxigenación no puede superar el 100%." });
    }

    const pacienteActualizado = await Paciente.findOneAndUpdate(
      { _id: req.params.id, cuidador: req.user.id },
      { 
        $set: { 
          configuracion: { 
            hrMin, 
            hrMax, 
            oxyMin, 
            inactivityMin 
          } 
        } 
      },
      { new: true }
    );

    if (!pacienteActualizado) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado o no autorizado' });
    }

    res.json(pacienteActualizado);

  } catch (e) {
    console.error('Error al actualizar configuración:', e);
    res.status(500).json({ mensaje: 'Error del servidor al guardar configuración' });
  }
});

module.exports = router;

// si se quiere asignar el mismo dispositivo a diferentes pacientes, es necesario primero actualizar
// el campo del paciente que lo tiene asignado a null, para posteriormente, actualizar el campo del
// otro paciente con el id del dispositivo 