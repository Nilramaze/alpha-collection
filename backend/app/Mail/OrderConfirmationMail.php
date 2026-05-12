<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private Order  $order,
        private User   $user,
        private string $pdfContent,
    ) {}

    public function envelope(): Envelope
    {
        $orderNumber = 'AC-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);

        return new Envelope(
            subject: "Ihre Bestellung {$orderNumber} – Alpha Collection",
        );
    }

    public function content(): Content
    {
        $orderNumber   = 'AC-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);
        $invoiceNumber = 'RE-' . $this->order->created_at->format('Y') . '-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);

        return new Content(
            view: 'mail.order-confirmation',
            with: [
                'customerName'  => $this->user->name,
                'orderNumber'   => $orderNumber,
                'invoiceNumber' => $invoiceNumber,
                'isSepa'        => $this->user->sepa_enabled,
            ],
        );
    }

    public function attachments(): array
    {
        $invoiceNumber = 'RE-' . $this->order->created_at->format('Y') . '-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);
        $content       = $this->pdfContent;

        return [
            Attachment::fromData(fn () => $content, "{$invoiceNumber}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
