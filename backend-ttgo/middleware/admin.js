// middleware/admin.js
const Cuidador = require('../models/Cuidador');

module.exports = async function (req, res, next) {
  try {
    // req.user.id viene del middleware 'auth' anterior
    const user = await Cuidador.findById(req.user.id);
    
    if (!user || user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor al verificar rol' });
  }
};