const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

const Cuidador = require('../models/Cuidador');
const transporter = require('../utils/email/transporter');

const JWT_SECRET = process.env.JWT_SECRET;

// ----------------- REGISTRO -----------------
router.post('/register', async (req, res) => {
  try {
    /*
    #swagger.parameters['body'] = {
      in: 'body', required: true, schema: {
        nombre: 'Alberto', apellidoP: 'Vega', apellidoM: 'Monterrubio',
        email: 'example@gmail.com', telefono: '5512345688', password: 'Passw0rd*'
      }
    }
    */
    const { nombre, apellidoP, apellidoM, email, telefono, password } = req.body;

    const existing = await Cuidador.findOne({ email });
    if (existing) return res.status(400).json({ mensaje: 'Correo ya registrado' });

    const hash = await bcrypt.hash(password, 10);
/*
    const counter = await Counter.findOneAndUpdate(
      { name: 'cuidador' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
*/
    const nuevoCuidador = new Cuidador({
      //id_cuidador: counter.seq,
      nombre, apellidoP, apellidoM, email, telefono,
      password: hash,
      verificado: false
    });

    await nuevoCuidador.save();

    const token  = jwt.sign({ id: nuevoCuidador._id }, JWT_SECRET, { expiresIn: '1d' });
    const enlace = `http://localhost:3000/api/cuidadores/verificar/${token}`;

    await transporter.sendMail({
      from: `"AlzhTrack" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifica tu cuenta en AlzhTrack",
      html: `
        <h3>Hola ${nombre},</h3>
        <p>Gracias por registrarte. Verifica tu correo dando clic en:</p>
        <a href="${enlace}">Verificar cuenta</a>
        <p>El enlace expira en 24 horas.</p>
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
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    await Cuidador.findByIdAndUpdate(decoded.id, { verificado: true });
    res.send('<h2>Cuenta verificada correctamente. Ya puedes iniciar sesión.</h2>');
  } catch (err) {
    res.status(400).send('<h2>Token inválido o expirado.</h2>');
  }
});

// ----------------- LOGIN -----------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const cuidador = await Cuidador.findOne({ email });
    if (!cuidador) return res.status(401).json({ mensaje: 'Correo no registrado' });

    const match = await bcrypt.compare(password, cuidador.password);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    if (!cuidador.verificado) {
      return res.status(403).json({ mensaje: 'Verifica tu correo antes de iniciar sesión' });
    }

    // 👉 AQUÍ firmamos y respondemos con token + cuidador
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
      from: `"AlzhTrack" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablecer contraseña - AlzhTrack",
      html: `
        <h3>Hola ${cuidador.nombre || ''}</h3>
        <p>Haz clic en el siguiente enlace (expira en 1 hora):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Si no solicitaste esto, ignora el correo.</p>
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
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Cuidador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error actualizando cuidador' });
  }
});

// ----------------- BORRAR -----------------
router.delete('/:id', async (req, res) => {
  try {
    await Cuidador.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: 'Cuenta eliminada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error eliminando cuidador' });
  }
});

module.exports = router;
