<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function getCart(User $user): Cart
    {
        $cart = $user->getOrCreateCart();
        $cart->load('items.product', 'items.color');
        return $cart;
    }

    public function addItem(User $user, int $productId, int $quantity = 1, ?int $colorId = null): Cart
    {
        $product = Product::with('colors')->findOrFail($productId);

        if (!$product->is_active) {
            throw new \InvalidArgumentException('Dieses Produkt ist nicht verfügbar.');
        }

        $color = $this->resolveColor($product, $colorId);
        $available = $color ? $color->stock_quantity : $product->stock_quantity;

        if ($available < $quantity) {
            throw new \InvalidArgumentException('Nicht genügend Lagerbestand verfügbar.');
        }

        $cart = $user->getOrCreateCart();

        $existingItem = $cart->items()
            ->where('product_id', $productId)
            ->where('product_color_id', $colorId)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $quantity;
            if ($available < $newQuantity) {
                throw new \InvalidArgumentException('Nicht genügend Lagerbestand für diese Menge.');
            }
            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'product_color_id' => $colorId,
                'quantity' => $quantity,
            ]);
        }

        return $this->getCart($user);
    }

    public function updateItem(User $user, int $productId, int $quantity, ?int $colorId = null): Cart
    {
        $cart = $user->getOrCreateCart();

        if ($quantity <= 0) {
            return $this->removeItem($user, $productId, $colorId);
        }

        $product = Product::with('colors')->findOrFail($productId);
        $color = $this->resolveColor($product, $colorId);
        $available = $color ? $color->stock_quantity : $product->stock_quantity;

        if ($available < $quantity) {
            throw new \InvalidArgumentException('Nicht genügend Lagerbestand verfügbar.');
        }

        $item = $cart->items()
            ->where('product_id', $productId)
            ->where('product_color_id', $colorId)
            ->firstOrFail();

        $item->update(['quantity' => $quantity]);

        return $this->getCart($user);
    }

    public function removeItem(User $user, int $productId, ?int $colorId = null): Cart
    {
        $cart = $user->getOrCreateCart();
        $cart->items()
            ->where('product_id', $productId)
            ->where('product_color_id', $colorId)
            ->delete();

        return $this->getCart($user);
    }

    public function clearCart(User $user): void
    {
        $cart = $user->cart;
        if ($cart) {
            $cart->items()->delete();
        }
    }

    public function calculateSkontoDiscount(User $user, float $totalPrice): array
    {
        $discountPercent = 0;
        $discountAmount = 0;

        if ($user->skonto_group_id) {
            $user->load('skontoGroup.tiers');
            $tier = $user->skontoGroup?->getApplicableTier($totalPrice);

            if ($tier) {
                $discountPercent = $tier->discount_percent;
                $discountAmount = round($totalPrice * ($discountPercent / 100), 2);
            }
        }

        return [
            'total_price' => $totalPrice,
            'discount_percent' => $discountPercent,
            'skonto_discount' => $discountAmount,
            'final_price' => round($totalPrice - $discountAmount, 2),
        ];
    }

    private function resolveColor(Product $product, ?int $colorId): ?ProductColor
    {
        if ($colorId === null) {
            if ($product->colors->isNotEmpty()) {
                throw new \InvalidArgumentException('Bitte wählen Sie eine Farbe für dieses Produkt.');
            }
            return null;
        }

        $color = $product->colors->firstWhere('id', $colorId);
        if (!$color) {
            throw new \InvalidArgumentException('Diese Farbe gehört nicht zu dem angegebenen Produkt.');
        }

        return $color;
    }
}
