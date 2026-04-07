#!/bin/bash
set -e

# SQLite-Datenbankdatei beim ersten Start erstellen
if [ ! -f /data/database.sqlite ]; then
    echo "Erstelle SQLite-Datenbank..."
    touch /data/database.sqlite
    chown www-data:www-data /data/database.sqlite
fi

# Migrationen ausführen
echo "Führe Migrationen aus..."
php artisan migrate --force

# Laravel-Caches für Produktion aufbauen
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
