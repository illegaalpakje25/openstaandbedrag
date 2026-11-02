const detailDialog = document.getElementById('details');
const helpDialog = document.getElementById('help');
for (const id of ['amountOpen', 'detailsLink']) document.getElementById(id).addEventListener('click', () => detailDialog.showModal());
for (const id of ['helpNav', 'helpLink', 'faqLink']) document.getElementById(id).addEventListener('click', () => helpDialog.showModal());
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
}
document.getElementById('back').addEventListener('click', () => detailDialog.close());
document.getElementById('year').textContent = new Date().getFullYear();

let cameraStream = null;
let cameraStarting = false;
const cameraStart = document.getElementById('cameraStart');
const cameraStop = document.getElementById('cameraStop');
const cameraPreview = document.getElementById('cameraPreview');
const cameraStatus = document.getElementById('cameraStatus');
function stopCamera() {
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
  cameraStream = null;
  cameraPreview.srcObject = null;
  cameraPreview.hidden = true;
  cameraStop.hidden = true;
  cameraStart.hidden = false;
  cameraStatus.textContent = '';
}
cameraStart.addEventListener('click', async () => {
  if (cameraStarting || cameraStream) return;
  if (!navigator.mediaDevices?.getUserMedia) { cameraStatus.textContent = 'Camera niet beschikbaar. Open de site via HTTPS in een ondersteunde browser.'; return; }
  cameraStarting = true; cameraStart.disabled = true;
  cameraStatus.textContent = 'Uw browser vraagt om toestemming voor de camera.';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    if (!detailDialog.open || document.hidden) { stream.getTracks().forEach(track => track.stop()); return; }
    cameraStream = stream;
    cameraPreview.srcObject = stream;
    cameraPreview.hidden = false;
    cameraStart.hidden = true;
    cameraStop.hidden = false;
    cameraStatus.textContent = 'Camera actief. Het beeld blijft op dit apparaat.';
  } catch (error) {
    cameraStatus.textContent = error.name === 'NotAllowedError' ? 'Geen cameratoestemming gegeven. U kunt uw factuur gewoon blijven bekijken.' : error.name === 'NotFoundError' ? 'Er is geen camera gevonden.' : 'De camera kan niet worden geopend. Controleer of een andere app de camera gebruikt.';
  } finally { cameraStarting = false; cameraStart.disabled = false; }
});
cameraStop.addEventListener('click', stopCamera);
detailDialog.addEventListener('close', stopCamera);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
window.addEventListener('pagehide', stopCamera);
