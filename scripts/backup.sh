#!/bin/bash

# Vytvorenie adresára pre zálohy ak neexistuje
mkdir -p backup

# Nastavenie názvu zálohy s dátumom
BACKUP_NAME="backup/backup-$(date +%Y%m%d).tar.gz"

# Vytvorenie zálohy s vylúčením nepotrebných súborov
tar -czf "$BACKUP_NAME" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='backup' \
    --exclude='output' \
    --exclude='storage' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.cache' \
    .

# Kontrola úspechu
if [ $? -eq 0 ]; then
    echo "Záloha bola úspešne vytvorená: $BACKUP_NAME"
    
    # Vymazanie starých záloh (ponechá len posledných 5)
    cd backup
    ls -t | tail -n +6 | xargs -I {} rm -- {}
    echo "Staré zálohy boli vymazané"
else
    echo "Chyba pri vytváraní zálohy"
    exit 1
fi