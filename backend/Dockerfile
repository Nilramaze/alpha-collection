FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite zip intl \
    && a2enmod rewrite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p /data \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /data \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
