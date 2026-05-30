<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;  

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 1. Ép chạy HTTPS trên production (Code cũ của m)
        if (config('app.env') === 'production' || str_contains(config('app.url'), 'https')) {
            URL::forceScheme('https');
        }

        // 2. Cấu hình Mail Brevo (Nối thẳng vào đây)
        Mail::extend('brevo', function (array $config = []) {
            return (new BrevoTransportFactory)->create(
                new Dsn('brevo+api', 'default', env('BREVO_API_KEY'))
            );
        });
    }
}