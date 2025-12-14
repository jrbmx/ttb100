const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const auth    = require('../middleware/auth');

const Cuidador = require('../models/Cuidador');
const Paciente = require('../models/Paciente');
const Dato     = require('../models/Dato');
const Geocerca = require('../models/Geocerca');
const Alerta   = require('../models/Alerta');
const transporter = require('../utils/email/transporter');

const JWT_SECRET = process.env.JWT_SECRET;

// ----------------- REGISTRO -----------------
router.post('/register', async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Registro de un nuevo cuidador. Envía correo de verificación.'
     #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            nombre: 'Alberto',
            apellidoP: 'Vega',
            apellidoM: 'Monterrubio',
            email: 'example@gmail.com',
            telefono: '5512345688',
            password: 'Passw0rd*'
        }
     }
     #swagger.responses[201] = { description: 'Usuario creado. Correo enviado.' }
     #swagger.responses[400] = { description: 'El correo ya está registrado' }
  */
  try {
    const { nombre, apellidoP, apellidoM, email, telefono, password } = req.body;

    const existing = await Cuidador.findOne({ email });
    if (existing) return res.status(400).json({ mensaje: 'Correo ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const nuevoCuidador = new Cuidador({
      nombre, apellidoP, apellidoM, email, telefono,
      password: hash,
      verificado: false
    });

    await nuevoCuidador.save();

    const token  = jwt.sign({ id: nuevoCuidador._id }, JWT_SECRET, { expiresIn: '1d' });
    const enlace = `http://localhost:3000/api/cuidadores/verificar/${token}`;

    await transporter.sendMail({
      from: `"Overvak" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Bienvenido a Overvak - Verifica tu cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="background-color: #0F3D56; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Overvak</h1>
              <p style="color: #a0aec0; margin: 5px 0 0; font-size: 14px;">Cuidando a quienes más quieres</p>
            </div>

            <div style="padding: 40px 30px; color: #333333;">
              <h2 style="color: #0F3D56; margin-top: 0;">¡Hola, ${nombre}!</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #555555;">
                Gracias por registrarte en la plataforma. Para comenzar a monitorear y cuidar a tus pacientes, necesitamos confirmar que este correo electrónico te pertenece.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${enlace}" style="background-color: #3A6EA5; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Verificar mi Cuenta
                </a>
              </div>

              <p style="font-size: 14px; color: #777777; margin-top: 30px;">
                Si el botón anterior no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="font-size: 12px; color: #3A6EA5; word-break: break-all;">
                <a href="${enlace}" style="color: #3A6EA5;">${enlace}</a>
              </p>
              
              <p style="font-size: 14px; color: #999999; margin-top: 20px;">
                Este enlace expirará en 24 horas.
              </p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Overvak. Todos los derechos reservados.</p>
              <p style="margin: 5px 0 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </div>
      `
    });

    res.status(201).json({ mensaje: 'Registro exitoso. Revisa tu correo para verificar la cuenta.' });
  } catch (error) {
    console.error("Error al registrar cuidador:", error);
    res.status(500).json({ mensaje: 'Error en el registro.', error: error.message });
  }
});

// ----------------- VERIFICAR CUENTA -----------------
router.get('/verificar/:token', async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Endpoint accedido desde el correo para activar la cuenta.'
     #swagger.parameters['token'] = { description: 'Token JWT enviado por email' }
     #swagger.produces = ['text/html']
     #swagger.responses[200] = { description: 'HTML de confirmación exitosa' }
     #swagger.responses[400] = { description: 'HTML de error (token inválido)' }
  */
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    await Cuidador.findByIdAndUpdate(decoded.id, { verificado: true });

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación exitosa - Overvak</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #EEF6F8; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; }
          h1 { color: #0F3D56; margin-bottom: 10px; font-size: 24px; }
          .icon { font-size: 60px; color: #10b981; margin: 20px 0; }
          p { color: #555; margin-bottom: 30px; line-height: 1.5; }
          .btn { background-color: #3A6EA5; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; transition: background 0.3s; display: inline-block; }
          .btn:hover { background-color: #2c527a; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>¡Cuenta Verificada!</h1>
          <p>Tu correo ha sido confirmado correctamente.<br>Ya puedes cerrar esta ventana e iniciar sesión en la aplicación.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" class="btn">Ir al Inicio</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error de Verificación</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #fdf2f2; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; border-top: 5px solid #ef4444; }
          h1 { color: #991b1b; margin-bottom: 10px; font-size: 24px; }
          .icon { font-size: 60px; color: #ef4444; margin: 20px 0; }
          p { color: #555; margin-bottom: 30px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✕</div>
          <h1>Enlace Inválido</h1>
          <p>El enlace de verificación ha expirado o no es válido.<br>Por favor, intenta registrarte nuevamente.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ----------------- LOGIN -----------------
router.post('/login', async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Inicio de sesión. Devuelve Token JWT.'
     #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            email: 'example@gmail.com',
            password: 'pass'
        }
     }
     #swagger.responses[200] = { 
        description: 'Login exitoso',
        schema: {
            mensaje: 'Inicio de sesión correcto',
            token: 'eyJhbGciOiJIUzI1NiIsIn...',
            cuidador: {
                _id: '645...',
                nombre: 'Alberto',
                email: 'example@gmail.com',
                verificado: true
            }
        }
     }
     #swagger.responses[401] = { description: 'Credenciales incorrectas' }
     #swagger.responses[403] = { description: 'Cuenta no verificada' }
  */
  try {
    const { email, password } = req.body;

    const cuidador = await Cuidador.findOne({ email });
    if (!cuidador) return res.status(401).json({ mensaje: 'Correo no registrado' });

    const match = await bcrypt.compare(password, cuidador.password);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    if (!cuidador.verificado) {
      return res.status(403).json({ mensaje: 'Verifica tu correo antes de iniciar sesión' });
    }

    const token = jwt.sign({ id: cuidador._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
      cuidador: {
        _id: cuidador._id,
        //id_cuidador: cuidador.id_cuidador,
        nombre: cuidador.nombre,
        apellidoP: cuidador.apellidoP,
        apellidoM: cuidador.apellidoM,
        email: cuidador.email,
        telefono: cuidador.telefono,
        verificado: cuidador.verificado,
        //id_paciente: cuidador.id_paciente ?? null
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
});

// ----------------- OLVIDÉ MI CONTRASEÑA -----------------
router.post('/forgot-password', async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Solicita un correo para restablecer contraseña.'
     #swagger.parameters['body'] = {
        in: 'body',
        schema: { email: 'example@gmail.com' }
     }
     #swagger.responses[200] = { description: 'Correo enviado (si existe el usuario)' }
  */
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ mensaje: 'Email es requerido' });

    const cuidador = await Cuidador.findOne({ email });

    // Respuesta genérica para no filtrar existencia
    if (!cuidador) {
      return res.json({ mensaje: 'Si el correo existe, enviaremos un enlace de restablecimiento.' });
    }

    const resetToken = jwt.sign({ id: cuidador._id }, JWT_SECRET, { expiresIn: '1h' });
    const resetLink  = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Overvak" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablecer contraseña - Overvak",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="background-color: #0F3D56; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Overvak</h1>
            </div>

            <div style="padding: 40px 30px; color: #333333;">
              <h2 style="color: #0F3D56; margin-top: 0;">Recuperación de Contraseña</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #555555;">
                Hola <strong>${cuidador.nombre || 'Usuario'}</strong>,<br><br>
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #D32F2F; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>

              <p style="font-size: 14px; color: #777777;">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará hasta que accedas al enlace.
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

              <p style="font-size: 12px; color: #999999; word-break: break-all;">
                ¿Problemas con el botón? Usa este enlace directamenente:<br>
                <a href="${resetLink}" style="color: #3A6EA5;">${resetLink}</a>
              </p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Overvak.</p>
            </div>
          </div>
        </div>
      `
    });

    return res.json({ mensaje: 'Si el correo existe, enviaremos un enlace de restablecimiento.' });
  } catch (error) {
    console.error('forgot-password error:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// ----------------- RESTABLECER CONTRASEÑA -------------
router.post('/reset-password', async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Establece una nueva contraseña usando el token recibido por correo.'
     #swagger.parameters['body'] = {
        in: 'body',
        schema: { 
            token: 'eyJ...',
            password: 'NewPassw0rd*' 
        }
     }
     #swagger.responses[200] = { description: 'Contraseña actualizada' }
     #swagger.responses[400] = { description: 'Token inválido' }
  */
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ mensaje: 'Token y nueva contraseña son requeridos' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ mensaje: 'Token inválido o expirado' });
    }

    const cuidador = await Cuidador.findById(payload.id);
    if (!cuidador) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const hash = await bcrypt.hash(password, 10);
    cuidador.password = hash;
    await cuidador.save();

    return res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('reset-password error:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// ----------------- ACTUALIZAR -----------------
router.put('/:id', auth, async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Actualiza datos del perfil del cuidador.'
     #swagger.parameters['id'] = { description: 'ID del cuidador' }
     #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            nombre: 'Alberto Nuevo',
            telefono: '5599887766'
        }
     }
  */
  try {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para modificar este usuario' });
    }
    const actualizado = await Cuidador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error actualizando cuidador' });
  }
});

// ----------------- BORRAR -----------------
router.delete('/:id', auth, async (req, res) => {
  /* #swagger.tags = ['Autenticación y manejo del cuidador']
     #swagger.description = 'Elimina la cuenta del cuidador.'
     #swagger.parameters['id'] = { description: 'ID del cuidador' }
  */
  try {
    const cuidadorId = req.params.id;
    if (req.user.id !== cuidadorId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta cuenta' });
    }

    const pacientes = await Paciente.find({ cuidador: cuidadorId }).select('_id');
    const pacientesIds = pacientes.map(p => p._id);
    await Promise.all([
        // Borrar datos biométricos de todos los pacientes del cuidador
        Dato.deleteMany({ paciente: { $in: pacientesIds } }),
        
        // Borrar geocercas de todos los pacientes del cuidador
        Geocerca.deleteMany({ paciente: { $in: pacientesIds } }),
        
        // Borrar alertas de todos los pacientes del cuidador
        Alerta.deleteMany({ paciente: { $in: pacientesIds } }),
        
        // Borrar a los pacientes mismos
        Paciente.deleteMany({ cuidador: cuidadorId }),
        
        // Finalmente, borrar al cuidador
        Cuidador.findByIdAndDelete(cuidadorId)
    ]);

    res.status(200).json({ mensaje: 'Cuenta y todos los datos asociados eliminados correctamente.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error eliminando cuidador' });
  }
});

module.exports = router;
