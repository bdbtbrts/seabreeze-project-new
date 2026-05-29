#!/bin/sh

# 1. Xóa sạch cache cũ để Laravel nhận biến môi trường mới nhất từ Render
php artisan config:clear
php artisan cache:clear

# 2. Chạy migrate để tự động tạo bảng trong DB Aiven
php artisan migrate --force

# 3. Khởi động server Apache
exec apache2-foreground