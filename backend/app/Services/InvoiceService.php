<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function generatePdf(Order $order, User $user): string
    {
        $data = $this->buildInvoiceData($order, $user);

        $view = $user->sepa_enabled
            ? 'invoices.invoice-sepa'
            : 'invoices.invoice';

        $pdf = Pdf::loadView($view, $data);
        $pdf->setPaper('A4', 'portrait');

        $filename = $data['invoice']['number'] . '.pdf';
        $path     = 'invoices/' . $filename;

        Storage::put($path, $pdf->output());

        return Storage::path($path);
    }

    private function buildInvoiceData(Order $order, User $user): array
    {
        $orderNumber   = 'AC-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
        $invoiceNumber = 'RE-' . $order->created_at->format('Y') . '-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
        $invoiceDate   = $order->created_at->format('d.m.Y');
        $discountDate  = $order->created_at->addDays(10)->format('d.m.Y');

        $billingAddress = $this->resolveBillingAddress($user);

        $subtotal = (float) $order->total_price;
        $shipping = (float) $order->shipping_price;
        $gross    = $subtotal + $shipping;
        $tax      = round($gross * 19 / 119, 2);
        $discount = (float) $order->skonto_discount;
        $final    = (float) $order->final_price;

        $discountPercent = ($subtotal > 0 && $discount > 0)
            ? round($discount / $subtotal * 100, 2)
            : 0;

        $items = $order->items->map(function ($item) {
            $description = $item->product->name ?? "Produkt #{$item->product_id}";
            if ($item->color) {
                $description .= ' – ' . $item->color->name;
            }

            $itemTotal = round($item->price_snapshot * $item->quantity, 2);

            return [
                'quantity'    => $item->quantity,
                'sku'         => $item->product->sku ?? ('#' . $item->product_id),
                'description' => $description,
                'price'       => number_format($item->price_snapshot, 2, ',', '.'),
                'total'       => number_format($itemTotal, 2, ',', '.'),
            ];
        })->toArray();

        return [
            'invoice'  => [
                'number'      => $invoiceNumber,
                'date'        => $invoiceDate,
                'orderNumber' => $orderNumber,
                'discountDate'=> $discountDate,
            ],
            'customer' => [
                'name'    => $user->name,
                'company' => $billingAddress['company'],
                'street'  => $billingAddress['street'],
                'zip'     => $billingAddress['zip'],
                'city'    => $billingAddress['city'],
                'country' => $billingAddress['country'],
                'number'  => 'KD-' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
            ],
            'items'    => $items,
            'totals'   => [
                'subtotal'        => number_format($subtotal, 2, ',', '.'),
                'shipping'        => number_format($shipping, 2, ',', '.'),
                'tax'             => number_format($tax, 2, ',', '.'),
                'grandTotal'      => number_format($gross, 2, ',', '.'),
                'discount'        => $discount,
                'discountPercent' => $discountPercent,
                'finalTotal'      => number_format($final, 2, ',', '.'),
            ],
        ];
    }

    private function resolveBillingAddress(User $user): array
    {
        if ($user->billing_same_as_delivery) {
            return [
                'company' => $user->delivery_company,
                'street'  => $user->delivery_street,
                'zip'     => $user->delivery_zip,
                'city'    => $user->delivery_city,
                'country' => $user->delivery_country,
            ];
        }

        return [
            'company' => $user->billing_company,
            'street'  => $user->billing_street,
            'zip'     => $user->billing_zip,
            'city'    => $user->billing_city,
            'country' => $user->billing_country,
        ];
    }
}
