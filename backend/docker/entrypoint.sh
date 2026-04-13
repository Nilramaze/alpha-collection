#!/bin/bash
set -e

IS_NEW_DB=false

# SQLite-Datenbankdatei beim ersten Start erstellen
if [ ! -f /data/database.sqlite ]; then
    echo "Erstelle SQLite-Datenbank..."
    touch /data/database.sqlite
    chown www-data:www-data /data/database.sqlite
    IS_NEW_DB=true
fi

# Migrationen ausführen
echo "Führe Migrationen aus..."
php artisan migrate --force

# Seeder nur beim ersten Start ausführen
if [ "$IS_NEW_DB" = true ]; then
    echo "Führe Seeder aus..."
    php artisan db:seed --force
fi

# Laravel-Caches für Produktion aufbauen
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
