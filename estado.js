(() => {
  const config = window.DESTERRADOS_CONFIG || {};
  const states = {
    pending: { title: 'Estado por confirmar', description: 'El servidor está en desarrollo. Su disponibilidad todavía no está confirmada.' },
    operational: { title: 'El servidor está operativo', description: 'El servidor está disponible para jugar. Nos vemos en Charnarus.' },
    maintenance: { title: 'El servidor está en mantenimiento', description: 'Estamos realizando ajustes o actualizaciones. Consulta los avisos de reapertura en Discord.' },
    restarting: { title: 'El servidor está reiniciándose', description: 'El reinicio está en curso. Espera a que vuelva a estar operativo antes de conectar.' }
  };
  const state = Object.hasOwn(states, config.serverStatus) ? config.serverStatus : 'pending';
  const details = states[state];
  document.querySelector('#status-current').dataset.state = state;
  document.querySelector('#status-title').textContent = details.title;
  document.querySelector('#status-description').textContent = typeof config.statusMessage === 'string' && config.statusMessage.trim() ? config.statusMessage.trim() : details.description;
  document.querySelector('#status-ip').textContent = config.serverIp || 'Por confirmar';
  const published = typeof config.statusUpdatedAt === 'string' ? new Date(config.statusUpdatedAt) : null;
  if (published && Number.isFinite(published.getTime())) {
    document.querySelector('#status-updated').textContent = 'Último aviso · ' + new Intl.DateTimeFormat('es-ES', {dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Madrid'}).format(published) + ' (hora de Madrid)';
  }
  document.querySelectorAll('[data-status-card]').forEach(card => {
    const active = card.dataset.statusCard === state;
    card.classList.toggle('is-current', active);
    card.querySelector('.status-active-label').hidden = !active;
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
