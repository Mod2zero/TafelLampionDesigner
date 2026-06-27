# Meetijkje (fit-gauge) — kalibreer de module-speling

De IKEA SOLVINDEN **J1701** varieert per exemplaar (nominaal Ø94 mm, maar meet je
eigen module na met een schuifmaat). Print daarom **eerst het meetijkje** — enkel de
clipzone als ring — vóór je uren in een volledige kap steekt.

## Waarom

Het meetijkje gebruikt **exact dezelfde clips, griplip en speling** als de echte kraag.
Klikt de module hierin met een lichte, hoorbare klik en blijft ze zitten zonder te
wiebelen, dan klopt je `Speling module`. Een mislukte gok kost een klein ringetje
i.p.v. een hele lampion.

## Stappen

1. Meet je module-Ø met een schuifmaat en zet **Module Ø (J1701)** in de configurator.
2. Exporteer **MEETIJKJE** en print het (zelfde instellingen als de kraag, bij voorkeur PETG).
3. Klik de J1701 erin:
   - **Te los / valt eruit** → verlaag `Speling module` (stap 0,05 mm).
   - **Gaat er niet in / clips breken** → verhoog `Speling module` of verhoog `Griplip` niet te ver.
   - **Lichte klik, blijft zitten** → ✓ noteer de waarde.
4. Gebruik die `Speling module` voor de echte **KRAAG**.

## Startwaarden (mm)

| Tolerantie | Bereik |
|---|---|
| Module-speling (clip ↔ J1701) | 0,30 – 0,40 |
| Klem-speling (kraag ↔ kapbovenrand) | 0,20 – 0,30 |
| Griplip (haakdiepte) | 0,8 – 1,2 |

> Materiaal voor kraag én meetijkje: **PETG** — de cantilever-clips zijn minder bros dan in PLA.
