const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const Dato = require('../models/Dato');
const Paciente = require('../models/Paciente');
const Cuidador = require('../models/Cuidador');
const Alerta = require('../models/Alerta');

router.post('/', async (req, res) => {
  try {
    /* #swagger.tags = ['Datos del paciente']
    #swagger.description = 'Recibe datos del sensor. Verifica umbrales y genera alertas automáticas de caídas, inactividad o sensor desconectado.'
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            dispositivo_id: "a1b2c3d4-1678886400",
            frecuencia: 85,
            oxigeno: 98,
            latitud: 19.4326,
            longitud: -99.1322,
            contacto_cardiaco: true,
            caida_detectada: false,
            inactividad_detectada: false
        }
    }
    #swagger.responses[201] = { 
        description: 'Dato procesado correctamente',
        schema: { $ref: "#/definitions/Dato" }
    }
    #swagger.responses[400] = { description: 'Faltan datos del sensor o ID del dispositivo' }
    #swagger.responses[404] = { description: 'Dispositivo no vinculado a un paciente' }
    */
    const { dispositivo_id, frecuencia, oxigeno, latitud, longitud, contacto_cardiaco, caida_detectada, inactividad_detectada  } = req.body;
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

    let telefonoCuidador = null;
    if (paciente.cuidador) {
        const cuidador = await Cuidador.findById(paciente.cuidador).select('telefono');
        if (cuidador && cuidador.telefono) {
            telefonoCuidador = cuidador.telefono;
        }
    }

    const nuevoDato = new Dato({
      paciente: paciente._id,
      frecuencia: frecuencia ?? 0,
      oxigeno: oxigeno ?? 0,
      latitud: latitud,
      longitud: longitud,
      contacto_cardiaco: contacto_cardiaco ?? true, // Default true si no viene
      caida_detectada: caida_detectada ?? false,
      inactividad_detectada: inactividad_detectada ?? false
    });
    await nuevoDato.save();

    if (paciente.cuidador) {
      const alertasAGenerar = [];
      const config = paciente.configuracion || {};
      const HR_MIN = config.hrMin || 60;
      const HR_MAX = config.hrMax || 100;
      const OXY_MIN = config.oxyMin || 90;

      if (caida_detectada === true) {
        const ultimaCaidaReciente = await Alerta.findOne({
          paciente: paciente._id,
          tipo: 'caida',
          createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
        });

        if (!ultimaCaidaReciente) {
          alertasAGenerar.push({
            cuidador: paciente.cuidador,
            paciente: paciente._id,
            tipo: 'caida',
            mensaje: `¡URGENTE! Se ha detectado una caída de ${paciente.nombre}.`,
            vista: false
          });
        }
      }

      // 2. Inactividad
      if (inactividad_detectada === true) {
        const alertaInactividadPendiente = await Alerta.findOne({
          paciente: paciente._id,
          tipo: 'inactividad',
          vista: false
        });

        if (!alertaInactividadPendiente) {
          alertasAGenerar.push({
            cuidador: paciente.cuidador,
            paciente: paciente._id,
            tipo: 'inactividad',
            mensaje: `Se ha detectado inactividad prolongada de ${paciente.nombre}.`,
            vista: false
          });
        }
      }

      // 3. Sensor Desconectado
      if (contacto_cardiaco === false) {
         const alertaSensorPendiente = await Alerta.findOne({
           paciente: paciente._id,
           tipo: 'sensor_desconectado',
           vista: false
         });

         if (!alertaSensorPendiente) {
           alertasAGenerar.push({
             cuidador: paciente.cuidador,
             paciente: paciente._id,
             tipo: 'sensor_desconectado',
             mensaje: `El sensor de ${paciente.nombre} no está haciendo contacto con la piel.`,
             vista: false
           });
         }
      }

      if (contacto_cardiaco === true) {
          if (frecuencia > 0 && (frecuencia < HR_MIN || frecuencia > HR_MAX)) {
              const alertaRitmoPendiente = await Alerta.findOne({
                  paciente: paciente._id,
                  tipo: 'ritmo_anormal',
                  vista: false 
              });

              if (!alertaRitmoPendiente) {
                  alertasAGenerar.push({
                      cuidador: paciente.cuidador,
                      paciente: paciente._id,
                      tipo: 'ritmo_anormal',
                      mensaje: `El ritmo cardíaco de ${paciente.nombre} es ${frecuencia} bpm (Rango: ${HR_MIN}-${HR_MAX}).`,
                      vista: false
                  });
              }
          }

          if (oxigeno > 0 && oxigeno < OXY_MIN) {              
              const alertaOxigenoPendiente = await Alerta.findOne({
                  paciente: paciente._id,
                  tipo: 'oxigeno_bajo',
                  vista: false
              });

              if (!alertaOxigenoPendiente) {
                  alertasAGenerar.push({
                      cuidador: paciente.cuidador,
                      paciente: paciente._id,
                      tipo: 'oxigeno_bajo',
                      mensaje: `La oxigenación de ${paciente.nombre} bajó a ${oxigeno}% (Mínimo: ${OXY_MIN}%).`,
                      vista: false
                  });
              }
          }
      }

      // Guardar todas las alertas generadas
      if (alertasAGenerar.length > 0) {
        await Alerta.insertMany(alertasAGenerar);
        console.log(`Alertas generadas para ${paciente.nombre}:`, alertasAGenerar.length);
      }
    }

    const tiempoInactividad = paciente.configuracion?.inactivityMin || 30; 

    res.status(201).json({ 
      mensaje: 'Dato guardado correctamente', 
      dato: nuevoDato,
      telefono_cuidador: telefonoCuidador,
      tiempo_inactividad: tiempoInactividad 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/paciente/:pacienteId', async (req, res) => {
  /* #swagger.tags = ['Datos del paciente']
       #swagger.description = 'Obtiene el historial completo. Maneja zonas horarias correctamente usando un offset en minutos.'
       #swagger.parameters['pacienteId'] = { description: 'ID del paciente (MongoDB ID)' }
       #swagger.parameters['inicio'] = { 
           in: 'query', 
           description: 'Fecha de inicio (YYYY-MM-DD)', 
           type: 'string'
       }
       #swagger.parameters['fin'] = { 
           in: 'query', 
           description: 'Fecha de fin (YYYY-MM-DD)', 
           type: 'string'
       }
       #swagger.parameters['offset'] = { 
           in: 'query', 
           description: 'Diferencia horaria del cliente en minutos (ej: 360 para UTC-6). Opcional, defecto 0.', 
           type: 'integer',
           required: false
       }
    */
    try {
        const { pacienteId } = req.params;
        const { inicio, fin, offset } = req.query;

        let filtro = { paciente: pacienteId };
        const clienteOffsetMinutes = offset ? parseInt(offset) : 0;

        if (inicio || fin) {
            filtro.fecha = {};

            if (inicio) {
                const startDate = new Date(`${inicio}T00:00:00.000Z`);
                startDate.setMinutes(startDate.getMinutes() + clienteOffsetMinutes);
                
                filtro.fecha.$gte = startDate;
            }

            if (fin) {
                const endDate = new Date(`${fin}T23:59:59.999Z`);
                endDate.setMinutes(endDate.getMinutes() + clienteOffsetMinutes);
                
                filtro.fecha.$lte = endDate;
            }
        }

        const datos = await Dato.find(filtro).sort({ fecha: -1 });
        res.json(datos);
    } catch (err) {
        console.error("Error al obtener datos:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/reciente/:pacienteId', auth, async (req, res) => {
  /* #swagger.tags = ['Datos del paciente']
    #swagger.description = 'Obtiene únicamente la última lectura registrada del paciente'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['pacienteId'] = { description: 'ID del paciente' }
    #swagger.responses[200] = { description: 'Último dato obtenido' }
    #swagger.responses[404] = { description: 'Sin datos o paciente no encontrado' }
    */
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
