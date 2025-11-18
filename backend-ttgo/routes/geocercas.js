// backend-ttgo/routes/geocercas.js
const express = require('express');
const router  = express.Router();
const Geocerca = require('../models/Geocerca');
const Paciente = require('../models/Paciente');
const Alerta = require('../models/Alerta')
const auth     = require('../middleware/auth');
const { isPointInPolygon } = require('../utils/geo')

// Crea una geocerca nueva
router.post('/', auth, async (req, res) => {
  try {
    const { pacienteId, coords, nombre } = req.body;
    if (!pacienteId || !Array.isArray(coords) || coords.length < 3 || !nombre?.trim()) {
      return res.status(400).json({ mensaje: 'Datos inválidos' });
    }

    // Valida que el paciente pertenezca al cuidador del token
    const pac = await Paciente.findOne({ _id: pacienteId, cuidador: req.user.id });
    if (!pac) return res.status(404).json({ mensaje: 'Paciente no encontrado' });

    const doc = await Geocerca.create({
      paciente: pacienteId,
      cuidador: req.user.id,
      nombre: nombre.trim(),
      coords: coords.map(([lat, lng]) => ({ lat, lng })),
    });

    res.json(doc);
  } catch (e) {
    console.error('geocerca POST:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// Lista TODAS las geocercas del paciente
router.get('/:pacienteId', auth, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const docs = await Geocerca.find({ paciente: pacienteId, cuidador: req.user.id }).sort({ createdAt: 1 });
    res.json(docs); // <- array
  } catch (e) {
    console.error('geocerca GET:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// Actualiza UNA geocerca específica
router.put('/:geocercaId', auth, async (req, res) => {
  try {
    console.log('PUT /api/geocercas/:geocercaId - Iniciando actualización');
    const { geocercaId } = req.params;
    const { coords, nombre } = req.body;
    console.log('Geocerca ID:', geocercaId, 'Coords:', coords, 'Nombre:', nombre);
    
    if (!Array.isArray(coords) || coords.length < 3) {
      return res.status(400).json({ mensaje: 'Coordenadas inválidas' });
    }

    const updateData = {
      coords: coords.map(([lat, lng]) => ({ lat, lng }))
    };

    if (nombre?.trim()) {
      updateData.nombre = nombre.trim();
    }

    const geocerca = await Geocerca.findOneAndUpdate(
      { _id: geocercaId, cuidador: req.user.id },
      updateData,
      { new: true }
    );

    if (!geocerca) {
      return res.status(404).json({ mensaje: 'Geocerca no encontrada' });
    }

    res.json(geocerca);
  } catch (e) {
    console.error('geocerca PUT:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// Elimina UNA geocerca específica
router.delete('/:geocercaId', auth, async (req, res) => {
  try {
    console.log('DELETE /api/geocercas/:geocercaId - Iniciando eliminación');
    const { geocercaId } = req.params;
    console.log('Geocerca ID a eliminar:', geocercaId);
    
    const geocerca = await Geocerca.findOneAndDelete({
      _id: geocercaId,
      cuidador: req.user.id
    });

    if (!geocerca) {
      return res.status(404).json({ mensaje: 'Geocerca no encontrada' });
    }

    res.json({ mensaje: 'Geocerca eliminada correctamente' });
  } catch (e) {
    console.error('geocerca DELETE:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

function parseLatitud(val) {
  if (typeof val !== 'string') return val;
  if (val == "") return 91.0 // si la conexión es por wifi
  try {
    const [numero, direccion] = val.split(' '); // ["19.43", "N"]
    const num = parseFloat(numero);
    if (direccion.toUpperCase() === 'S') return num * -1;
    return num;
  } catch (e) {
    return val;
  }
}

function parseLongitud(val) {
  if (typeof val !== 'string') return val;
  if (val == "") return 181.0

  try {
    const [numero, direccion] = val.split(' '); // ["99.13", "W"]
    const num = parseFloat(numero);
    if (direccion.toUpperCase() === 'W') return num * -1;
    return num;
  } catch (e) {
    return val;
  }
}

router.post('/verificar', async (req, res) => {
  try {
    const { dispositivo_id, lat, lng } = req.body;

    if (!dispositivo_id || lat === undefined || lng === undefined) {
      return res.status(400).json({ mensaje: 'Faltan dispositivo_id, lat o lng' });
    }

    const paciente = await Paciente.findOne({ dispositivo_id: dispositivo_id });
    if (!paciente) {
      return res.status(404).json({ mensaje: 'Dispositivo no registrado' });
    }

    const parsedLat = parseLatitud(lat);
    const parsedLng = parseLongitud(lng);
    const isNullIsland = (parsedLat === 0 && parsedLng === 0);
    if (isNullIsland) {
      return res.json({ inside: paciente.estaEnGeocerca });
    }

    const currentLocation = { lat: parsedLat, lng: parsedLng };
    const estadoPrevio = paciente.estaEnGeocerca;
    const geocercas = await Geocerca.find({ paciente: paciente._id });
    let estadoActual = false; // Asume que está fuera
    if (geocercas.length > 0) {
      for (const geofence of geocercas) {
        if (isPointInPolygon(currentLocation, geofence.coords)) {
          estadoActual = true;
          break; 
        }
      }
    }

    if (estadoActual !== estadoPrevio) {
      await Paciente.updateOne({ _id: paciente._id }, { estaEnGeocerca: estadoActual });
      let tipo, mensaje;
      
      if (estadoActual === false) {
        tipo = 'salida_geocerca';
        mensaje = `${paciente.nombre} ha salido de la zona segura.`;
      } else {
        tipo = 'entrada_geocerca';
        mensaje = `${paciente.nombre} ha regresado a la zona segura.`;
      }

      Alerta.create({
        cuidador: paciente.cuidador,
        paciente: paciente._id,
        tipo: tipo,
        mensaje: mensaje,
        vista: false // Nace como "no vista"
      });
      
      console.log(`ALERTA CREADA: ${mensaje}`);
    }

    res.json({ inside: estadoActual });
  } catch (e) {
    console.error('geocerca POST /verificar:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;
