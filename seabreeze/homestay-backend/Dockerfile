# Sử dụng image PHP 8.2 có sẵn Apache
FROM php:8.4-apache

# Cài đặt các thư viện cần thiết cho Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql gd zip

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Copy toàn bộ code vào container
COPY . .

# Cài đặt thư viện PHP
RUN composer install --no-dev --optimize-autoloader
RUN rm -f bootstrap/cache/*.php
 #  mở khóa thư mục ảnh
 RUN php artisan storage:link
 

# Cấp quyền cho storage và cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Cấu hình Apache trỏ vào thư mục public của Laravel
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Mở cổng 80
EXPOSE 80

CMD ["apache2-foreground"]