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
