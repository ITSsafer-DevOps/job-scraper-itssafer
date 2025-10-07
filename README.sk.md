# Job Scraper (Profesia.sk) 🤖

<div align="center">
  <img src="https://lh3.googleusercontent.com/a/ACg8ocKktHJlvkQK85EHrR8Sm1zUzwG0ZeF_AGPdBvFW9Pd0CPYITSjn=s288-c-no" alt="ITSsafer Logo" width="150"/>
</div>

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Commercial License](https://img.shields.io/badge/license-Commercial-green.svg)](LICENSE.commercial)
[![Code Style](https://img.shields.io/badge/code%20style-eslint-brightgreen.svg)](https://eslint.org)

[🇬🇧 English version](README.md)

Inteligentný crawler pre extrakciu pracovných ponúk z portálu Profesia.sk, postavený na technológiách Apify SDK a Crawlee. Projekt implementuje sofistikované získavanie dát s ohľadom na etické zásady web scrapingu.

## 🎯 O Projekte

Tento nástroj je navrhnutý ako sofistikované riešenie pre automatizovaný zber pracovných ponúk z portálu Profesia.sk. Využíva moderné technológie a osvedčené postupy pre etický web scraping:

### Kľúčové Funkcie

- **Inteligentný Crawling**: Rešpektuje robots.txt a implementuje pokročilé obmedzenie požiadaviek
- **Robustné Spracovanie**: Spoľahlivá extrakcia a normalizácia dát
- **Flexibilná Konfigurácia**: Jednoduchá prispôsobiteľnosť cez .env súbor
- **Kvalitný Výstup**: Štruktúrované dáta vo formátoch JSON a CSV

### Technické Detaily

- Postavené na Node.js ≥ 18.0.0
- Využíva Apify SDK a Crawlee framework
- Implementuje pokročilé stratégie opakovania
- Zabezpečuje validáciu a deduplikáciu dát

### Spustenie s Podmanom

Projekt je plne kontajnerizovaný a môže byť spustený pomocou Podmana:

```bash
# Zostavenie kontajnera
podman build -t job-scraper-itssafer .

# Spustenie kontajnera
podman run -d \
  --name job-scraper \
  -v "./output:/app/output" \
  -v "./.env:/app/.env" \
  job-scraper-itssafer

# Kontrola logov kontajnera
podman logs -f job-scraper

# Zastavenie kontajnera
podman stop job-scraper
```

Výhody používania Podmanu:
- Kontajnery bez root práv pre lepšiu bezpečnosť
- Kompatibilita s OCI
- Nevyžaduje daemon
- Natívna integrácia so systemd
- Multiplatformová podpora