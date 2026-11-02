const saveTestButton = document.getElementById('saveTestImage');
const testStatus = document.getElementById('testStatus');
let camera = null;
let generation = 0;
function stopTestCamera() {
  if (camera) camera.getTracks().forEach(track => track.stop());
  camera = null;
}
async function checkTestLogin() {
  try {
    const response = await fetch('/api/auth', { cache: 'no-store' });
    if (!response.ok) throw new Error('Log eerst in via het beheerportaal.');
    saveTestButton.disabled = false; testStatus.textContent = 'Beheerlogin gecontroleerd. Klaar voor uw cameratest.';
  } catch (error) { testStatus.textContent = error.message; }
}
saveTestButton.addEventListener('click', async () => {
  saveTestButton.disabled = true;
  const attempt = ++generation;
  const video = document.createElement('video'); video.muted = true; video.autoplay = true; video.playsInline = true;
  video.style.cssText = 'display:block;width:100%;max-height:240px;object-fit:contain;margin:16px 0;border-radius:8px';
  try {
    const auth = await fetch('/api/auth', { cache: 'no-store' });
    if (!auth.ok) throw new Error('Uw sessie is verlopen. Log opnieuw in via het beheerportaal.');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('De camera is niet beschikbaar in deze browser.');
    testStatus.textContent = 'Cameratoegang aanvragen voor één foto…';
    const requested = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (attempt !== generation || document.hidden) { requested.getTracks().forEach(track => track.stop()); throw new Error('Cameratest gestopt.'); }
    camera = requested; video.srcObject = camera; saveTestButton.after(video);
    await video.play();
    await new Promise((resolve, reject) => {
      let timer;
      const finish = () => { clearTimeout(timer); resolve(); };
      timer = setTimeout(() => reject(new Error('Geen camerabeeld ontvangen.')), 10000);
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(finish);
      else if (video.readyState >= 2) finish();
      else video.addEventListener('loadeddata', finish, { once: true });
    });
    if (attempt !== generation || document.hidden) throw new Error('Cameratest gestopt.');
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
    if (!canvas.width || !canvas.height) throw new Error('Geen bruikbaar camerabeeld.');
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    stopTestCamera(); video.remove();
    testStatus.textContent = 'Foto opslaan in uw private galerij…';
    const response = await fetch('/api/photo-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: canvas.toDataURL('image/jpeg', 0.8), consent: true }) });
    let result; try { result = await response.json(); } catch { throw new Error('De server geeft geen geldig antwoord.'); }
    if (!response.ok) throw new Error(result.error || 'Foto opslaan mislukt.');
    testStatus.textContent = 'Foto opgeslagen. U vindt deze bij Ontvangen foto’s in het beheerportaal.';
  } catch (error) { testStatus.textContent = error.name === 'NotAllowedError' ? 'Geen cameratoestemming gegeven.' : error.message; }
  finally { stopTestCamera(); video.remove(); saveTestButton.disabled = false; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { generation++; stopTestCamera(); } });
window.addEventListener('pagehide', () => { generation++; stopTestCamera(); });
checkTestLogin();
