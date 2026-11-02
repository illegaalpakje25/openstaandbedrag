/* Include on your own page: <script src="/photo-upload.js"></script> */
window.portalPhoto = {
  async save(imageDataUrl) {
    if (!window.confirm('Wilt u deze foto naar het beheerportaal versturen en daar laten opslaan? De beheerder kan de foto bekijken.')) {
      return { ok: false, cancelled: true };
    }
    const response = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, consent: true })
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('De foto kon niet worden opgeslagen. Probeer opnieuw.'); }
    if (!response.ok) throw new Error(result.error || 'Upload mislukt.');
    return result;
  }
};
