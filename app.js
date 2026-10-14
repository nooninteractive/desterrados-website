const config = window.DESTERRADOS_CONFIG || {};
document.querySelector('#year').textContent = new Date().getFullYear();
const ip = typeof config.serverIp === 'string' ? config.serverIp.trim() : '';
const copyButton = document.querySelector('#copy-ip');
if (ip) {
  document.querySelector('#server-ip').textContent = ip;
  document.querySelector('#ip-help').textContent = 'Copia la dirección y añádela a tus favoritos en el launcher de DayZ.';
  copyButton.disabled = false;
  copyButton.setAttribute('aria-label', 'Copiar dirección del servidor');
  copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(ip); copyButton.textContent = 'Copiada ✓'; }
    catch { document.querySelector('#ip-help').textContent = 'Selecciona la dirección y cópiala manualmente.'; }
    setTimeout(() => { copyButton.textContent = 'Copiar ↗'; }, 2500);
  });
}
