#!/bin/bash
#!/bin/sh
# Chạy migrate và clear cache
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan migrate --force

# Chạy apache
exec apache2-foreground
apache2-foreground
