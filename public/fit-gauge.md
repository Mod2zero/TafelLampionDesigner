# Meetijkje (fit-gauge) — kalibreer de pasvorm

De IKEA SOLVINDEN **J1701** varieert per exemplaar (opgemeten: rand Ø102, LED-opening
Ø94, hoogte 12 mm — meet je eigen module na met een schuifmaat). Print daarom **eerst
het meetijkje** — een korte testcup — vóór je uren in een volledige lampion steekt.

## Waarom

Het meetijkje is **dezelfde cup als de echte rusthuizing, maar laag**. Je test er twee
dingen mee:

1. **Rust de module?** Legt de J1701 met zijn Ø102-rand netjes en vlak op de steunrichel,
   met de LED-zijde naar onder door de opening?
2. **Past de cup in de kapmond?** Zakt de cup soepel (lichte wrijving) in de bovenrand
   van de lampion?

Een mislukte gok kost een klein cupje i.p.v. een hele lampion.

## Stappen

1. Meet je module na en zet **Module rand-Ø**, **LED-opening Ø** en **Module hoogte** in de configurator.
2. Exporteer **MEETIJKJE** en print het (zelfde instellingen als de rusthuizing).
3. Test:
   - **Module wiebelt / zakt scheef** → verklein `Steunrichel` of verhoog `Speling module` licht.
   - **Module past niet / rand raakt de wand** → verhoog `Speling module`.
   - **Cup gaat niet in de kapmond** → verhoog `Speling kapmond`.
   - **Cup zit te los in de mond** → verlaag `Speling kapmond`.
4. Gebruik die waarden voor de echte **LED-RUSTHUIZING**.

## Startwaarden (mm)

| Tolerantie | Bereik |
|---|---|
| Speling module ↔ cupwand | 0,30 – 0,50 |
| Speling cup ↔ kapmond | 0,30 – 0,50 |
| Steunrichel (breedte) | 2 – 4 |

> De module **rust** (zwaartekracht) — er is geen klemkracht nodig. Zet eventueel
> `Borgnokjes` op 2–3 als je de lamp wilt kunnen kantelen/dragen zonder dat de module loskomt.
