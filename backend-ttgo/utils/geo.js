// utils/geo.js
function dmsPartToDec(deg, min, sec, hemi) {
  let dec = Number(deg) + Number(min)/60 + Number(sec)/3600;
  if (/[SW]/i.test(hemi)) dec *= -1;
  return dec;
}

// "41°24'12.2\"N 2°10'26.5\"E"  (coma o espacio entre pares también funciona)
function parseDMSPair(dmsText) {
  const text = dmsText.trim().replace(',', ' ');
  const re = /(\d+)[°\s]+(\d+)[′'\s]+(\d+(?:\.\d+)?)[″"]?\s*([NnSs])\s+(\d+)[°\s]+(\d+)[′'\s]+(\d+(?:\.\d+)?)[″"]?\s*([EeWw])/;
  const m = text.match(re);
  if (!m) return null;

  const lat = dmsPartToDec(m[1], m[2], m[3], m[4]);
  const lng = dmsPartToDec(m[5], m[6], m[7], m[8]);

  const lat_dms = `${m[1]}°${m[2]}'${m[3]}"${m[4].toUpperCase()}`;
  const lng_dms = `${m[5]}°${m[6]}'${m[7]}"${m[8].toUpperCase()}`;

  return { lat, lng, lat_dms, lng_dms };
}

module.exports = { parseDMSPair };
