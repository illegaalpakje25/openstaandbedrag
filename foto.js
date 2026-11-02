const video = document.getElementById('captureVideo');
const openButton = document.getElementById('openCamera');
const takeButton = document.getElementById('takePhoto');
const stopButton = document.getElementById('stopCamera');
const status = document.getElementById('captureStatus');
let stream = null;
let generation = 0;
let saving = false;
function closeCamera() {
  generation++;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null; video.srcObject = null; video.hidden = true;
  takeButton.hidden = true; stopButton.hidden = true; openButton.hidden = false;
}
openButton.addEventListener('click', async () => {
  if (saving || stream) return;
  if (!navigator.mediaDevices?.getUserMedia) { status.textContent = 'De camera is niet beschikbaar. Gebruik HTTPS en een ondersteunde browser.'; return; }
  openButton.disabled = true; const attempt = ++generation;
  status.textContent = 'Geef uw browser toestemming om de camera te gebruiken.';
  try {
    const requested = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (attempt !== generation || document.hidden) { requested.getTracks().forEach(track => track.stop()); return; }
    stream = requested; video.srcObject = stream; video.hidden = false;
    await video.play();
    openButton.hidden = true; takeButton.hidden = false; stopButton.hidden = false;
    status.textContent = 'De camera is actief. Klik op Foto maken wanneer u klaar bent.';
  } catch (error) {
    closeCamera();
    status.textContent = error.name === 'NotAllowedError' ? 'Geen cameratoestemming gegeven.' : 'De camera kan niet worden geopend. Controleer of een andere app deze gebruikt.';
  } finally { openButton.disabled = false; }
});
takeButton.addEventListener('click', async () => {
  if (!stream || saving) return;
  if (!video.videoWidth || !video.videoHeight) { status.textContent = 'De camera wordt nog geladen. Probeer zo opnieuw.'; return; }
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const image = canvas.toDataURL('image/jpeg', 0.8);
  closeCamera(); saving = true; openButton.disabled = true;
  status.textContent = 'Foto gemaakt. Bekijk de foto hieronder en kies of u deze wilt versturen.';
  try {
    const result = await portalPhoto.save(image);
    status.textContent = result.cancelled ? 'De foto is niet verstuurd. U kunt een nieuwe foto maken.' : 'Uw foto is opgeslagen in het beheerportaal.';
  } catch (error) { status.textContent = error.message; }
  finally { saving = false; openButton.disabled = false; }
});
stopButton.addEventListener('click', () => { closeCamera(); status.textContent = 'Camera gesloten.'; });
document.addEventListener('visibilitychange', () => { if (document.hidden) closeCamera(); });
window.addEventListener('pagehide', closeCamera);
