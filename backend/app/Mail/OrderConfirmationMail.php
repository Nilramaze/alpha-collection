<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderConfirmationMail extends Mailable
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

        Log::info('[Invoice] build() aufgerufen, PDF-Bytes vorhanden: ' . strlen($this->pdfContent) . ', gültiges PDF: ' . (str_starts_with($this->pdfContent, '%PDF') ? 'ja' : 'NEIN'));

        $this->subject("Ihre Bestellung {$orderId} – Alpha Collection")
             ->view('mail.order-confirmation')
             ->with([
                 'customerName'  => $this->user->name,
                 'orderNumber'   => $orderId,
                 'invoiceNumber' => $invoiceNumber,
                 'isSepa'        => $this->user->sepa_enabled,
             ])
             ->attachData(
                 $this->pdfContent,
                 "{$invoiceNumber}.pdf",
                 ['mime' => 'application/pdf']
             );

        Log::info('[Invoice] attachData() abgeschlossen');

        return $this;
    }
}
