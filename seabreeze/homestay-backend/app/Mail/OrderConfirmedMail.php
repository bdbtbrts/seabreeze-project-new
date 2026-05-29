<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Order; // Nhớ use Model Order vào

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order; // Khai báo biến chứa dữ liệu đơn hàng

    public function __construct(Order $order)
    {
        $this->order = $order; // Nhận dữ liệu truyền vào
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Xác nhận đặt phòng thành công - SeaBreeze',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.confirmed', 
        );
    }
}