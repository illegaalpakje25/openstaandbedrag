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
