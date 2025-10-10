const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const CONFIG_PATH = path.join(__dirname, '../ttgo/wifi.json');
const RESET_FLAG = path.join(__dirname, '../ttgo/reset.flag');

// POST: recibir nueva configuración desde el frontend
router.post('/wifi-config', (req, res) => {
  const { ssid, password } = req.body;

  if (!ssid || !password) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const config = { ssid, password };

  fs.writeFile(CONFIG_PATH, JSON.stringify(config), (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al guardar', err });

    // Escribir archivo de reinicio
    fs.writeFile(RESET_FLAG, '', (err2) => {
      if (err2) return res.status(500).json({ mensaje: 'Error al crear reset.flag' });
      res.status(200).json({ mensaje: '✅ Configuración guardada. El TTGO se reiniciará.' });
    });
  });
});

// GET: el TTGO solicita la configuración actual
router.get('/wifi-config', (req, res) => {
  if (!fs.existsSync(CONFIG_PATH)) {
    return res.status(404).json({ mensaje: 'No hay configuración Wi-Fi disponible' });
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  res.json(config);
});

module.exports = router;
