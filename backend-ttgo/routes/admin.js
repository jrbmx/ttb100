// routes/admin.js (VERSIÓN MEJORADA)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Cuidador = require('../models/Cuidador');
const Paciente = require('../models/Paciente');
const Dato = require('../models/Dato');
const Geocerca = require('../models/Geocerca');
const Alerta = require('../models/Alerta');

// 1. Dashboard KPI y Gráficos
router.get('/dashboard-data', auth, admin, async (req, res) => {
    try {
        // --- Contadores Generales ---
        const [totalCuidadores, totalPacientes, totalAlertas, pacientesConDispositivo] = await Promise.all([
            Cuidador.countDocuments(),
            Paciente.countDocuments(),
            Alerta.countDocuments(),
            Paciente.countDocuments({ dispositivo_id: { $ne: null } })
        ]);

        // --- Datos para Gráfica: Alertas últimos 7 días ---
        const sieteDiasAtras = new Date();
        sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

        const alertasPorDia = await Alerta.aggregate([
            { $match: { createdAt: { $gte: sieteDiasAtras } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        // --- Datos para Gráfica: Tipos de Alerta ---
        const alertasPorTipo = await Alerta.aggregate([
            { $group: { _id: "$tipo", count: { $sum: 1 } } }
        ]);

        res.json({
            kpi: { totalCuidadores, totalPacientes, totalAlertas, pacientesConDispositivo },
            chartAlertas: alertasPorDia,
            chartTipos: alertasPorTipo
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ mensaje: 'Error obteniendo dashboard data' });
    }
});

// 2. Gestión de Usuarios
router.get('/users', auth, admin, async (req, res) => {
    try {
        const usuarios = await Cuidador.find().select('-password').sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ mensaje: 'Error al listar usuarios' });
    }
});

// 3. Gestión de Pacientes (Global)
router.get('/patients', auth, admin, async (req, res) => {
    try {
        // Populate para ver quién cuida a quién
        const pacientes = await Paciente.find()
            .populate('cuidador', 'nombre email')
            .sort({ createdAt: -1 });
        res.json(pacientes);
    } catch (e) {
        res.status(500).json({ mensaje: 'Error al listar pacientes' });
    }
});

// 4. Historial Global de Alertas
router.get('/alerts', auth, admin, async (req, res) => {
    try {
        const alertas = await Alerta.find()
            .populate('paciente', 'nombre')
            .populate('cuidador', 'email')
            .sort({ createdAt: -1 })
            .limit(100); // Solo las últimas 100 para no saturar
        res.json(alertas);
    } catch (e) {
        res.status(500).json({ mensaje: 'Error al listar alertas' });
    }
});

// 5. Borrar Usuario (Manteniendo tu lógica original)
router.delete('/users/:id', auth, admin, async (req, res) => {
    try {
        const cuidadorId = req.params.id;
        if (req.user.id === cuidadorId) return res.status(400).json({ mensaje: 'No puedes auto-eliminarte.' });

        const pacientes = await Paciente.find({ cuidador: cuidadorId }).select('_id');
        const pacientesIds = pacientes.map(p => p._id);

        await Promise.all([
            Dato.deleteMany({ paciente: { $in: pacientesIds } }),
            Geocerca.deleteMany({ paciente: { $in: pacientesIds } }),
            Alerta.deleteMany({ paciente: { $in: pacientesIds } }),
            Paciente.deleteMany({ cuidador: cuidadorId }),
            Cuidador.findByIdAndDelete(cuidadorId)
        ]);

        res.json({ mensaje: 'Usuario eliminado.' });
    } catch (e) {
        res.status(500).json({ mensaje: 'Error eliminando usuario' });
    }
});

module.exports = router;