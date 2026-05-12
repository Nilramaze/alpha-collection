<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminOrderNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private Order  $order,
        private User   $user,
        private string $pdfContent,
    ) {}

    public function build(): static
    {
        $orderId       = 'AC-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);
        $invoiceNumber = 'RE-' . $this->order->created_at->format('Y') . '-' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT);

        $items = $this->order->items->map(fn ($i) =>
            '  - ' . ($i->product->name ?? "Produkt #{$i->product_id}")
            . ($i->color ? " ({$i->color->name})" : '')
            . " × {$i->quantity}"
            . '  →  €' . number_format($i->subtotal, 2, ',', '.')
        )->join("\n");

        $body = "Neue Bestellung eingegangen!\n\n"
            . "Bestellung: {$orderId}\n"
            . "Kunde:      {$this->user->name} <{$this->user->email}>\n"
            . "Zahlung:    " . ($this->user->sepa_enabled ? 'SEPA-Lastschrift' : 'Rechnung') . "\n"
            . "Gesamt:     €" . number_format($this->order->final_price, 2, ',', '.') . "\n\n"
            . "Positionen:\n{$items}\n";

        return $this
            ->subject("Neue Bestellung {$orderId}")
            ->text('mail.admin-notification')
            ->with(['body' => $body])
            ->attachData(
                $this->pdfContent,
                "{$invoiceNumber}.pdf",
                ['mime' => 'application/pdf']
            );
    }
}
