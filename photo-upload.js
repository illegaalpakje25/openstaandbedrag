/* Include on your own page: <script src="/photo-upload.js"></script> */
window.portalPhoto = {
  async save(imageDataUrl) {
    if (typeof imageDataUrl !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(imageDataUrl)) throw new Error('Geen geldige foto ontvangen.');
    return new Promise(resolve => {
      const section = document.createElement('section');
      section.setAttribute('aria-label', 'Foto versturen');
      section.style.cssText = 'max-width:440px;margin:24px auto;padding:20px;border:1px solid #dde5eb;border-radius:12px;background:#fff;color:#20364a;font:14px/1.6 Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;';
      const title = document.createElement('h2'); title.textContent = 'Uw foto'; title.style.cssText = 'margin:0 0 12px;font-size:20px;';
      const preview = document.createElement('img'); preview.src = imageDataUrl; preview.alt = 'Foto die u kunt versturen'; preview.style.cssText = 'display:block;width:100%;max-height:280px;object-fit:contain;border-radius:8px;';
      const text = document.createElement('p'); text.textContent = 'Met Foto versturen slaat u deze foto op in het beheerportaal. De beheerder kan de foto bekijken.';
      const status = document.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      const send = document.createElement('button'); send.type = 'button'; send.textContent = 'Foto versturen'; send.style.cssText = 'border:0;border-radius:7px;min-height:48px;padding:12px 20px;background:#0071e3;color:#fff;font:inherit;cursor:pointer;margin-right:10px;';
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Niet versturen'; cancel.style.cssText = 'border:1px solid #dde5eb;border-radius:7px;min-height:48px;padding:12px 18px;background:#fff;color:#20364a;font:inherit;cursor:pointer;';
      cancel.addEventListener('click', () => { section.remove(); resolve({ ok: false, cancelled: true }); });
      send.addEventListener('click', async () => {
        send.disabled = true; cancel.disabled = true; status.textContent = 'Foto versturen…';
        try {
          const response = await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imageDataUrl, consent: true }) });
          let result;
          try { result = await response.json(); } catch { throw new Error('De foto kon niet worden opgeslagen. Probeer opnieuw.'); }
          if (!response.ok) throw new Error(result.error || 'Upload mislukt.');
          preview.remove(); send.remove(); cancel.remove(); text.remove(); status.textContent = 'Uw foto is opgeslagen.';
          resolve(result);
        } catch (error) { status.textContent = error.message; send.disabled = false; cancel.disabled = false; }
      });
      section.append(title, preview, text, send, cancel, status);
      document.body.append(section);
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      send.focus({ preventScroll: true });
    });
  }
};
