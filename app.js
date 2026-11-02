const detailDialog = document.getElementById('details');
const helpDialog = document.getElementById('help');
async function openAmounts(event) {
  const button = event.currentTarget;
  if (button.disabled) return;
  button.disabled = true;
  try {
    const response = await fetch('/api/content?public=1', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const config = await response.json();
    if (config.active) { window.location.assign('/api/content?view=page'); return; }
    detailDialog.showModal();
  } catch { detailDialog.showModal(); }
  finally { button.disabled = false; }
}
for (const id of ['amountOpen', 'detailsLink']) document.getElementById(id).addEventListener('click', openAmounts);
for (const id of ['helpNav', 'helpLink', 'faqLink']) document.getElementById(id).addEventListener('click', () => helpDialog.showModal());
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
}
document.getElementById('back').addEventListener('click', () => detailDialog.close());
document.getElementById('year').textContent = new Date().getFullYear();
