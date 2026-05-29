#!/bin/bash
# Chạy migrate và clear cache
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Chạy apache
exec apache2-foreground