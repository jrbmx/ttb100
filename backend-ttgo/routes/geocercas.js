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
  /* #swagger.tags = ['Geocercas']
     #swagger.description = 'Crea una nueva zona segura (polígono) para un paciente.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            pacienteId: "645...",
            nombre: "Casa",
            coords: [
                [19.4326, -99.1332],
                [19.4328, -99.1334],
                [19.4325, -99.1330]
            ]
        }
     }
     #swagger.responses[200] = { description: 'Geocerca creada' }
     #swagger.responses[400] = { description: 'Datos inválidos (mínimo 3 puntos)' }
  */
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
  /* #swagger.tags = ['Geocercas']
     #swagger.description = 'Obtiene todas las zonas seguras de un paciente.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['pacienteId'] = { description: 'ID del paciente' }
  */
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
  /* #swagger.tags = ['Geocercas']
     #swagger.description = 'Actualiza el nombre o las coordenadas de una geocerca.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['geocercaId'] = { description: 'ID de la geocerca' }
     #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            nombre: "Casa Nueva",
            coords: [[19.1, -99.1], [19.2, -99.2], [19.3, -99.3]]
        }
     }
  */
  try {
    const { geocercaId } = req.params;
    const { coords, nombre } = req.body;
    
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
  /* #swagger.tags = ['Geocercas']
     #swagger.description = 'Elimina una zona segura.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['geocercaId'] = { description: 'ID de la geocerca' }
  */
  try {
    const { geocercaId } = req.params;
    
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
  /* #swagger.tags = ['Geocercas']
     #swagger.description = 'Endpoint lógico para el ESP32. Verifica si la coordenada actual está dentro de alguna geocerca y genera alertas.'
     #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            dispositivo_id: "a1b2c3d4...",
            lat: "19.4326 N",
            lng: "99.1322 W"
        }
     }
     #swagger.responses[200] = { 
        description: 'Verificación completada',
        schema: { inside: true }
     }
  */
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
    }

    res.json({ inside: estadoActual });
  } catch (e) {
    console.error('geocerca POST /verificar:', e);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;
