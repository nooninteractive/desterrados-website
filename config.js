// Completar únicamente con los datos reales confirmados del servidor.
window.DESTERRADOS_CONFIG = {
  serverIp: '85.190.161.9:11300',
  discordUrl: 'https://discord.gg/SMAMFn2gkX',
  development: true,
  // Estado manual: 'pending', 'operational', 'maintenance' o 'restarting'.
  serverStatus: 'pending',
  // Fecha de publicación en formato ISO con zona horaria; null si no hay confirmación.
  statusUpdatedAt: null,
  statusMessage: '',
  // Coordenadas de la cartografía de iZurvive; añadir solo al confirmarlas.
  // Ejemplo de formato: 'rp-base': { lat: LAT, lng: LNG, confirmed: true, rp: true }
  mapLocations: {}
};
