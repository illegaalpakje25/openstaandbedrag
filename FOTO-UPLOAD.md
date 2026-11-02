# Foto’s vanuit je eigen script opslaan

Uploadadres: https://openstaandbedrag.vercel.app/api/photos
Opslag: private Vercel Blob-store, map photos/YYYY-MM-DD/.
Bekijken en verwijderen: https://openstaandbedrag.vercel.app/beheer > Ontvangen foto’s.

Gebruik dit op een eigen HTML-pagina die je via het portaal hebt geüpload:

```html
<script src="/photo-upload.js"></script>
<script>
// Gebruik een bestaande canvas met de foto die de bezoeker heeft bekeken.
// Roep dit aan nadat de bezoeker op een zichtbare verzendknop klikt.
async function verstuurFoto(canvas) {
  try {
    const resultaat = await portalPhoto.save(canvas.toDataURL('image/jpeg', 0.85));
    if (resultaat.cancelled) return;
    document.getElementById('status').textContent = 'Foto opgeslagen.';
  } catch (fout) {
    document.getElementById('status').textContent = fout.message;
  }
}
</script>
```

portalPhoto.save toont op de pagina een fotovoorbeeld en een knop Foto versturen. Er verschijnt geen browserbevestigingsvenster. Pas na het klikken op Foto versturen wordt de foto opgeslagen. De functie maakt zelf geen foto en vraagt geen cameratoegang; je bestaande script regelt dat, met duidelijke uitleg en toestemming.

API-verzoek (vanuit dezelfde website):
POST /api/photos
Content-Type: application/json
{"image":"data:image/jpeg;base64,...","consent":true}

consent:true mag alleen worden verstuurd nadat de bezoeker het opslaan expliciet heeft bevestigd. Een vinkje in een API-verzoek bewijst op zichzelf geen toestemming; de zichtbare gebruikersflow moet dit regelen. De bijgeleverde helper toont per foto de zichtbare verzendkeuze.

Ondersteund: JPEG, PNG en WebP, maximaal 2 MB per foto. Succes geeft HTTP 201 en {ok:true,id:"photos/..."}. De server accepteert alleen uploads met dezelfde website-origin. Er is een limiet van 10 pogingen per 10 minuten per IP per actieve serverinstantie; dit is geen gedeelde globale limiter.

Foto’s zijn niet openbaar te bekijken. GET /api/photos (lijst), GET /api/photos?id=... (beeld) en DELETE /api/photos met {id:...} vereisen een beheersessie. Origin-controle is geen vervanging voor authenticatie: de publieke uploadroute is bedoeld voor bezoekers en kan worden misbruikt door externe clients. Bij grotere inzet is centrale rate limiting nodig.

Foto’s blijven bewaard totdat je ze in het portaal verwijdert. Er is geen automatische bewaartermijn of koppeling tussen een foto en een factuur. Upload geen geheimen of Blob-tokens naar je HTML/JavaScript.

## Kant-en-klare camerapagina
Open /foto om met toestemming de camera te openen, een foto te maken en deze te bekijken voordat de bezoeker op Foto versturen klikt. De camera stopt na de opname, bij het sluiten of zodra de pagina naar de achtergrond gaat. Er wordt geen audio gevraagd. Deze pagina vervangt niet automatisch een bestaande geüploade doelpagina.

## Cameratest voor ingelogde beheerder
/test-foto heeft één knop Foto maken en opslaan. De uitleg op die pagina vermeldt vooraf dat één echte foto direct wordt opgeslagen. Alleen een ingelogde beheerder kan POST /api/photo-test gebruiken. De browser vraagt zelf om cameratoegang; er volgt geen extra preview of bevestigingsdialoog. Er wordt geen audio gevraagd. De camera stopt na de opname of wanneer de pagina naar de achtergrond gaat. De test is bedoeld voor de eigen foto van de beheerder. De publieke bezoekersfunctie en de verzendkeuze in photo-upload.js blijven gelijk.

## Korte adressen voor je eigen script
POST https://openstaandbedrag.vercel.app/fotos is een alias voor POST /api/photos, met dezelfde validatie en private opslag.
Bekijken: https://openstaandbedrag.vercel.app/beheer/fotos (beheerlogin vereist).

```js
// Alleen uitvoeren nadat de bezoeker het maken en opslaan heeft bevestigd.
const response = await fetch('/fotos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: canvas.toDataURL('image/jpeg', 0.8), consent: true })
});
const result = await response.json();
if (!response.ok) throw new Error(result.error);
```

Gebruik een script op dezelfde website-origin. Maximaal 2 MB, JPEG/PNG/WebP als data-URL. De Blob-sleutel hoeft niet in het script te staan. Een request met consent:true moet overeenkomen met de werkelijke keuze van de bezoeker. Foto's worden opgeslagen onder photos/ in de private Blob-store; /fotos is het uploadadres, geen openbare map.
