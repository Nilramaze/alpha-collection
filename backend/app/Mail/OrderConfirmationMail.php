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
        private string $pdfPath,
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
        $gross         = (float) $this->order->total_price + (float) $this->order->shipping_price;
        $final         = (float) $this->order->final_price;
        $discount      = (float) $this->order->skonto_discount;
        $subtotal      = (float) $this->order->total_price;

        $discountPercent = ($subtotal > 0 && $discount > 0)
            ? round($discount / $subtotal * 100, 2)
            : 0;

        return new Content(
            view: 'mail.order-confirmation',
            with: [
                'customerName'    => $this->user->name,
                'orderNumber'     => $orderNumber,
                'invoiceNumber'   => $invoiceNumber,
                'paymentMethod'   => $this->user->sepa_enabled ? 'SEPA-Lastschrift' : 'Rechnung',
                'grandTotal'      => number_format($gross, 2, ',', '.'),
                'finalTotal'      => number_format($final, 2, ',', '.'),
                'isSepa'          => $this->user->sepa_enabled,
                'hasSkonto'       => $discount > 0,
                'discountPercent' => $discountPercent,
                'discountDate'    => $this->order->created_at->addDays(10)->format('d.m.Y'),
            ],
        );
    }

    public function attachments(): array
    {
        $invoiceNumber = 'RE-' . $this->order->created_at->format('Y') . '-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            Attachment::fromPath($this->pdfPath)
                ->as("{$invoiceNumber}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
