// middleware/auth.js
const jwt = require('jsonwebtoken');
const Cuidador = require('../models/Cuidador'); // <--- Importante: Necesitamos el modelo

module.exports = async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

  try {
    // 1. Decodificamos el token (que solo trae el ID)
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Buscamos al usuario en la BD para obtener su ROL actualizado
    const usuario = await Cuidador.findById(payload.id).select('-password');

    if (!usuario) {
       return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    // 3. Sobreescribimos req.user con los datos reales de la BD (incluyendo el rol)
    req.user = {
        id: usuario._id.toString(),
        rol: usuario.rol || 'user', // Aquí es donde ocurre la magia
        email: usuario.email
    };

    next();
  } catch (error) {
    console.error("Error en auth middleware:", error.message);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};