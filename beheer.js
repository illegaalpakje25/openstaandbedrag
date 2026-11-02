const login = document.getElementById('loginPanel');
const portal = document.getElementById('portalPanel');
const message = document.getElementById('message');
async function loadPortal() {
  try {
    const response = await fetch('/api/auth', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) { login.hidden = false; portal.hidden = true; message.textContent = response.status === 401 ? '' : data.error; return; }
    for (const [id, value] of Object.entries({ accountName: data.username, invoiceNumber: data.invoice, invoiceDescription: data.description, invoiceAmount: data.amount, invoiceStatus: data.status })) document.getElementById(id).textContent = value;
    login.hidden = true; portal.hidden = false; message.textContent = '';
  } catch { login.hidden = false; message.textContent = 'Geen verbinding. Probeer opnieuw.'; }
}
document.getElementById('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = document.getElementById('loginSubmit'); submit.disabled = true; message.textContent = 'Bezig met inloggen…';
  try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('username').value, password: document.getElementById('password').value }) });
    const data = await response.json();
    if (!response.ok) { message.textContent = data.error; return; }
    document.getElementById('password').value = ''; await loadPortal();
  } catch { message.textContent = 'Inloggen mislukt. Controleer uw verbinding.'; }
  finally { submit.disabled = false; }
});
document.getElementById('logout').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    if (!response.ok) throw new Error();
    portal.hidden = true; login.hidden = false; message.textContent = 'U bent uitgelogd.';
    for (const id of ['accountName','invoiceNumber','invoiceDescription','invoiceAmount','invoiceStatus']) document.getElementById(id).textContent = '';
  } catch { message.textContent = 'Uitloggen mislukt. Probeer opnieuw.'; }
});
loadPortal();
