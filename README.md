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
