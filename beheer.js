async function readApiResponse(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error('De server is tijdelijk niet beschikbaar (HTTP ' + response.status + '). Probeer opnieuw. Controleer bij aanhoudende problemen de deploymentlogs in Vercel.'); }
}
const login = document.getElementById('loginPanel');
const portal = document.getElementById('portalPanel');
const message = document.getElementById('message');
async function loadPortal() {
  try {
    const response = await fetch('/api/auth', { cache: 'no-store' });
    const data = await readApiResponse(response);
    if (!response.ok) { login.hidden = false; portal.hidden = true; message.textContent = response.status === 401 ? '' : data.error; return; }
    for (const [id, value] of Object.entries({ accountName: data.username, invoiceNumber: data.invoice, invoiceDescription: data.description, invoiceAmount: data.amount, invoiceStatus: data.status })) document.getElementById(id).textContent = value;
    login.hidden = true; portal.hidden = false; message.textContent = ''; await loadUploadConfig(); await loadPhotos(); if (location.pathname.replace(/\/$/, '') === '/beheer/fotos') { document.getElementById('photosTitle').scrollIntoView({ block: 'start' }); document.getElementById('photosTitle').focus({ preventScroll: true }); }
  } catch { login.hidden = false; message.textContent = 'Geen verbinding. Probeer opnieuw.'; }
}
document.getElementById('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = document.getElementById('loginSubmit'); submit.disabled = true; message.textContent = 'Bezig met inloggen…';
  try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('username').value, password: document.getElementById('password').value }) });
    const data = await readApiResponse(response);
    if (!response.ok) { message.textContent = data.error; return; }
    document.getElementById('password').value = ''; await loadPortal();
  } catch { message.textContent = 'Inloggen mislukt. Controleer uw verbinding.'; }
  finally { submit.disabled = false; }
});
document.getElementById('logout').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    if (!response.ok) throw new Error();
    portal.hidden = true; login.hidden = false; clearPhotos(); message.textContent = 'U bent uitgelogd.';
    for (const id of ['accountName','invoiceNumber','invoiceDescription','invoiceAmount','invoiceStatus']) document.getElementById(id).textContent = '';
  } catch { message.textContent = 'Uitloggen mislukt. Probeer opnieuw.'; }
});

async function loadUploadConfig() {
  const status = document.getElementById('uploadConfig');
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.error || 'Uploadinstellingen niet beschikbaar.');
    document.getElementById('uploadSubmit').disabled = !data.configured;
    document.getElementById('viewUpload').hidden = !data.active;
    document.getElementById('resetUpload').hidden = !data.active;
    status.textContent = !data.configured ? data.error : data.active ? 'Actief bestand: ' + data.filename : 'Er is nog geen upload gekoppeld. De knop opent het standaardoverzicht.';
  } catch (error) { status.textContent = error.message; document.getElementById('uploadSubmit').disabled = true; }
}
async function saveUpload(body) {
  const response = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await readApiResponse(response);
  if (!response.ok) throw new Error(result.error || 'Opslaan mislukt.');
}
document.getElementById('uploadForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = document.getElementById('uploadSubmit');
  const status = document.getElementById('uploadMessage');
  const file = document.getElementById('scriptFile').files[0];
  if (!file || !/\.(html?|js)$/i.test(file.name)) { status.textContent = 'Kies een HTML- of JavaScript-bestand.'; return; }
  if (file.size > 512000) { status.textContent = 'Het bestand mag maximaal 500 KB zijn.'; return; }
  button.disabled = true; status.textContent = 'Upload opslaan…';
  try { await saveUpload({ filename: file.name, content: await file.text() }); status.textContent = 'Opgeslagen. Uw upload is nu gekoppeld aan de knop voor alle bezoekers.'; document.getElementById('uploadForm').reset(); }
  catch (error) { status.textContent = error.message; }
  finally { await loadUploadConfig(); }
});
document.getElementById('resetUpload').addEventListener('click', async () => {
  const status = document.getElementById('uploadMessage');
  const button = document.getElementById('resetUpload'); button.disabled = true;
  try { await saveUpload({ action: 'reset' }); status.textContent = 'De knop opent weer het standaardoverzicht.'; }
  catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; await loadUploadConfig(); }
});

let photoCursor = null;
let photosLoading = false;
let photoGeneration = 0;
function clearPhotos() {
  photoGeneration++;
  photoCursor = null;
  document.getElementById('photoGrid').replaceChildren();
  document.getElementById('photosStatus').textContent = '';
  document.getElementById('morePhotos').hidden = true;
}
async function loadPhotos(append = false) {
  if (photosLoading || portal.hidden) return;
  photosLoading = true;
  const generation = photoGeneration;
  const status = document.getElementById('photosStatus');
  const more = document.getElementById('morePhotos');
  const refresh = document.getElementById('refreshPhotos');
  refresh.disabled = true; more.disabled = true; status.textContent = 'Foto’s laden…';
  try {
    const response = await fetch('/api/photos' + (append && photoCursor ? '?cursor=' + encodeURIComponent(photoCursor) : ''), { cache: 'no-store' });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.error || 'Foto’s laden mislukt.');
    if (generation !== photoGeneration || portal.hidden) return;
    const grid = document.getElementById('photoGrid');
    if (!append) grid.replaceChildren();
    for (const photo of data.photos) {
      const card = document.createElement('article'); card.className = 'photo-item';
      const image = document.createElement('img'); image.src = photo.url; image.alt = 'Ingezonden foto'; image.loading = 'lazy';
      const date = document.createElement('p'); date.textContent = new Date(photo.uploadedAt).toLocaleString('nl-NL');
      const link = document.createElement('a'); link.href = photo.url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Foto openen'; link.className = 'logout-button';
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Verwijderen'; remove.className = 'logout-button';
      remove.addEventListener('click', async () => {
        if (!window.confirm('Deze foto definitief verwijderen?')) return;
        remove.disabled = true;
        try {
          const response = await fetch('/api/photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: photo.id }) });
          const result = await readApiResponse(response);
          if (!response.ok) throw new Error(result.error || 'Verwijderen mislukt.');
          card.remove(); status.textContent = 'Foto verwijderd.';
        } catch (error) { status.textContent = error.message; remove.disabled = false; }
      });
      card.append(image, date, link, remove); grid.append(card);
    }
    photoCursor = data.cursor; more.hidden = !photoCursor;
    status.textContent = grid.children.length ? grid.children.length + ' foto’s weergegeven.' : 'Nog geen foto’s ontvangen.';
  } catch (error) { if (generation === photoGeneration) status.textContent = error.message; }
  finally { photosLoading = false; refresh.disabled = false; more.disabled = false; }
}
document.getElementById('refreshPhotos').addEventListener('click', () => loadPhotos());
document.getElementById('morePhotos').addEventListener('click', () => loadPhotos(true));

loadPortal();
