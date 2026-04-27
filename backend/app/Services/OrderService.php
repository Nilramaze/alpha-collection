<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Setting;
use App\Models\ShippingOption;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderService
{
    public function __construct(
        private CartService $cartService,
    ) {}

    public function createOrder(User $user, ?string $notes = null, ?int $shippingOptionId = null): Order
    {
        $cart = $this->cartService->getCart($user);

        if ($cart->items->isEmpty()) {
            throw new \InvalidArgumentException('Der Warenkorb ist leer.');
        }

        // Bestandsprüfung pro Farbe
        foreach ($cart->items as $item) {
            [$available, $label] = $this->stockInfo($item->product, $item->color, $item->product_color_id);

            if ($available < $item->quantity) {
                throw new \InvalidArgumentException(
                    "Nicht genügend Lagerbestand für '{$label}'. Verfügbar: {$available}"
                );
            }
        }

        return DB::transaction(function () use ($user, $cart, $notes, $shippingOptionId) {
            $totalPrice  = $cart->total;
            $skontoData  = $this->cartService->calculateSkontoDiscount($user, $totalPrice);

            $shippingPrice = 0.0;
            $shippingName  = null;
            if ($shippingOptionId) {
                $shippingOption = ShippingOption::find($shippingOptionId);
                if ($shippingOption && $shippingOption->active) {
                    $shippingPrice = (float) $shippingOption->price;
                    $shippingName  = $shippingOption->name;
                }
            }

            $order = Order::create([
                'user_id'         => $user->id,
                'status'          => OrderStatus::EINGEGANGEN,
                'total_price'     => $skontoData['total_price'],
                'skonto_discount' => $skontoData['skonto_discount'],
                'final_price'     => $skontoData['final_price'] + $shippingPrice,
                'notes'           => $notes,
                'shipping_name'   => $shippingName,
                'shipping_price'  => $shippingPrice,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id'       => $item->product_id,
                    'product_color_id' => $item->product_color_id,
                    'quantity'         => $item->quantity,
                    'price_snapshot'   => $item->product->price,
                ]);

                // Bestandsabzug sofort bei Bestelleingang
                $this->decrementStock($item->product, $item->color, $item->product_color_id, $item->quantity);
            }

            $this->cartService->clearCart($user);

            $order->load('items.product', 'items.color');

            $this->sendOrderNotification($order, $user);

            return $order;
        });
    }

    public function updateStatus(Order $order, OrderStatus $newStatus): Order
    {
        if ($newStatus === OrderStatus::STORNIERT) {
            throw new \InvalidArgumentException(
                'Stornierungen bitte über den Storno-Button vornehmen.'
            );
        }

        $order->update(['status' => $newStatus]);

        return $order->fresh('items.product', 'items.color', 'user');
    }

    public function cancelOrder(Order $order): Order
    {
        if ($order->status === OrderStatus::STORNIERT) {
            throw new \InvalidArgumentException('Bestellung ist bereits storniert.');
        }

        return DB::transaction(function () use ($order) {
            $order->load('items.product', 'items.color');

            // Bestand für jede Position zurückbuchen
            foreach ($order->items as $item) {
                $this->incrementStock($item->product, $item->color, $item->product_color_id, $item->quantity);
            }

            $order->update(['status' => OrderStatus::STORNIERT]);

            return $order->fresh('items.product', 'items.color', 'user');
        });
    }

    public function getUserOrders(User $user)
    {
        return $user->orders()
            ->with('items.product', 'items.color')
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    // ── Hilfsmethoden ────────────────────────────────────────────────────────

    private function stockInfo($product, $color, ?int $colorId): array
    {
        if ($colorId && $color) {
            return [$color->stock_quantity, "{$product->name} ({$color->name})"];
        }
        return [$product->stock_quantity, $product->name];
    }

    private function decrementStock($product, $color, ?int $colorId, int $qty): void
    {
        if ($colorId && $color) {
            $color->decrement('stock_quantity', $qty);
        } else {
            $product->decrement('stock_quantity', $qty);
        }
    }

    private function incrementStock($product, $color, ?int $colorId, int $qty): void
    {
        if ($colorId && $color) {
            $color->increment('stock_quantity', $qty);
        } else {
            $product->increment('stock_quantity', $qty);
        }
    }

    private function sendOrderNotification(Order $order, User $user): void
    {
        if (!Setting::get('notify_on_order')) return;

        $email = Setting::get('notification_email');
        if (!$email) return;

        $orderId  = 'AC-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
        $items    = $order->items->map(fn($i) =>
            '  - ' . ($i->product->name ?? "Produkt #{$i->product_id}")
            . ($i->color ? " ({$i->color->name})" : '')
            . " × {$i->quantity}"
            . "  →  €" . number_format($i->subtotal, 2, ',', '.')
        )->join("\n");

        $body = "Neue Bestellung eingegangen!\n\n"
            . "Bestellung: {$orderId}\n"
            . "Kunde:      {$user->name} <{$user->email}>\n"
            . "Gesamt:     €" . number_format($order->final_price, 2, ',', '.') . "\n\n"
            . "Positionen:\n{$items}\n";

        try {
            Mail::raw($body, function ($m) use ($email, $orderId) {
                $m->to($email)->subject("Neue Bestellung {$orderId}");
            });
        } catch (\Throwable $e) {
            Log::error('Order notification mail failed: ' . $e->getMessage());
        }
    }
}
