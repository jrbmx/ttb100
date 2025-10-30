// utils/geo.js

/**
 * Verifica si un punto está dentro de un polígono usando el algoritmo de Ray Casting.
 * @param {object} point - El punto a verificar (ej. { lat: 19.43, lng: -99.13 })
 * @param {Array<object>} polygon - Un array de vértices (ej. [{ lat: ..., lng: ... }, ...])
 * @returns {boolean} - True si el punto está dentro, False si está fuera.
 */
function isPointInPolygon(point, polygon) {
  const { lat, lng } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect = ((yi > lng) !== (yj > lng))
      && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}

module.exports = { isPointInPolygon };