# Klantportaal

Statische website voor Vercel, zonder installatie of buildstap.

## Publiceren
1. Upload deze map naar een GitHub-repository.
2. Importeer de repository in Vercel via Add New > Project.
3. Kies Framework Preset: Other. Laat Build Command leeg en gebruik de projectroot als Output Directory.
4. Klik op Deploy.

Met de Vercel CLI kan ook: `vercel` vanuit deze map.

## Aanpassen
Pas in index.html de bedrijfsnaam (nu Klantportaal), omschrijving, factuurnummer, data en bedragen aan. Het bedrag staat zowel op de overzichtskaart als in het detailvenster. Vormgeving staat in style.css; interacties in app.js.

## Gegevens
De huidige factuurgegevens zijn voorbeeldinhoud die vóór gebruik vervangen moet worden. De site is statisch: alle bezoekers zien dezelfde gegevens en iedereen met de URL kan de inhoud lezen. Gebruik deze versie alleen voor openbare inhoud. Een persoonlijk klantportaal met echte facturen vereist authenticatie en een backend. Er is geen betaalintegratie of automatische verwerking van betalingen.

## Beheerlogin op Vercel
De kleine knop `set` opent `/beheer`. Gebruikersnaam: `admin1`.
Stel onder Vercel > Project > Settings > Environment Variables `ADMIN_PASSWORD` in op het gewenste wachtwoord en voer een nieuwe deployment uit. Sla het wachtwoord niet in GitHub op.
Optioneel: stel `SESSION_SECRET` in op een lange willekeurige waarde om sessies afzonderlijk te ondertekenen. Sessies verlopen na een uur. De API controleert de sessie op de server en gebruikt een HttpOnly Secure-cookie. Loginpogingen worden per actieve serverinstantie beperkt; dit is geen gedeelde globale limiter.
Het portaal toont de factuurgegevens; wijzigen en opslaan is niet inbegrepen. Werk de factuurinhoud zowel in index.html als api/auth.js bij als deze verandert.
De Vercel-API heeft een Node.js-runtime nodig; lokaal openen als los HTML-bestand ondersteunt de login niet.

## Zelf een pagina of script toevoegen
In het beheerportaal staat een uploadveld voor één .html-, .htm- of .js-bestand (max. 500 KB). HTML kan inline CSS en JavaScript bevatten. Externe assets moeten absolute URL's gebruiken; losse .js-bestanden krijgen een lege pagina met een #app-element. De inhoud wordt publiek toegankelijk via de overzichtsknop zodra deze is opgeslagen. De standaardpagina kan vanuit het portaal worden hersteld. Python wordt niet uitgevoerd.

Koppel eerst via Vercel > Storage een **private Vercel Blob-store** aan dit project. Hierdoor wordt BLOB_READ_WRITE_TOKEN aan het project toegevoegd. Voer daarna een redeploy uit. Zonder opslagkoppeling toont het portaal een instructie en blijft de bestaande factuurknop werken. Vercel installeert de dependency uit package-lock.json; er is geen buildstap nodig.
Upload alleen eigen, vertrouwde code. Geüploade HTML/JavaScript draait onder de website-origin en kan bezoekersfuncties uitvoeren. Deze upload wordt niet door de app gecontroleerd op inhoud; cameratoestemming of andere gegevensverwerking moet expliciet in die code worden uitgelegd. Er is geen ingebouwde camera-opnamefunctie.
